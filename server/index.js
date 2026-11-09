const fs = require("node:fs");
const http = require("node:http");
const path = require("node:path");
const vm = require("node:vm");
const crypto = require("node:crypto");
const { DatabaseSync } = require("node:sqlite");

const ROOT = path.resolve(__dirname, "..");
const DATA_DIR = path.join(__dirname, "data");
const DB_PATH = path.join(DATA_DIR, "edumarket.sqlite");
const PORT = Number(process.env.PORT || 3000);
const ALLOWED_ORIGIN = process.env.EDUMARKET_ALLOWED_ORIGIN || "";
const JWT_ISSUER = "edumarket";
const JWT_SECRET = process.env.JWT_SECRET || (process.env.NODE_ENV === "production"
  ? (() => { throw new Error("JWT_SECRET must be configured in production"); })()
  : crypto.randomBytes(32).toString("hex"));
if (process.env.NODE_ENV === "production" && Buffer.byteLength(JWT_SECRET) < 32) throw new Error("JWT_SECRET must be at least 32 bytes in production");
if (!process.env.JWT_SECRET) console.warn("JWT_SECRET is not set; using a temporary development secret.");
const STATE_KEYS = new Set(["categories", "products", "cart", "orders", "reviews", "wishlist"]);
const loginAttempts = new Map();
const MIME_TYPES = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
};

fs.mkdirSync(DATA_DIR, { recursive: true });
const db = new DatabaseSync(DB_PATH);
db.exec("PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;");
db.exec(fs.readFileSync(path.join(__dirname, "schema.sql"), "utf8"));

function hashPassword(password, salt = crypto.randomBytes(16).toString("hex")) {
  const hash = crypto.scryptSync(String(password), salt, 64).toString("hex");
  return { salt, hash };
}

function verifyPassword(password, user) {
  if (!user.passwordSalt || !user.passwordHash) return false;
  const actual = Buffer.from(hashPassword(password, user.passwordSalt).hash, "hex");
  const expected = Buffer.from(user.passwordHash, "hex");
  return actual.length === expected.length && crypto.timingSafeEqual(actual, expected);
}

function getSeedData() {
  const source = fs.readFileSync(path.join(ROOT, "js/core/model/seed-data.js"), "utf8");
  const context = vm.createContext({});
  vm.runInContext(source, context, { filename: "seed-data.js" });
  const serialized = vm.runInContext(`JSON.stringify({
    categories: MOCK_CATEGORIES,
    users: MOCK_USERS,
    products: MOCK_PRODUCTS,
    orders: MOCK_ORDERS,
    reviews: MOCK_REVIEWS,
    cart: MOCK_CART,
    wishlist: MOCK_WISHLIST,
  })`, context);
  return JSON.parse(serialized);
}

function readState() {
  const readPayloads = table => db.prepare(`SELECT payload FROM ${table} ORDER BY rowid`).all()
    .map(row => JSON.parse(row.payload));
  return {
    categories: readPayloads("categories"),
    users: readStoredUsers().map(publicUser),
    products: readPayloads("products"),
    orders: readPayloads("orders"),
    reviews: db.prepare("SELECT id, payload FROM reviews ORDER BY rowid").all().map(row => {
      const review = JSON.parse(row.payload);
      return { ...review, id: review.id || row.id };
    }),
    cart: db.prepare("SELECT payload FROM cart_items ORDER BY line_number").all().map(row => JSON.parse(row.payload)),
    wishlist: db.prepare("SELECT product_id FROM wishlist_items ORDER BY position").all().map(row => row.product_id),
  };
}

function writeState(key, value) {
  if (!Array.isArray(value)) throw new Error(`Collection ${key} must be an array`);
  db.exec("BEGIN IMMEDIATE");
  try {
    if (key === "categories") {
      db.exec("DELETE FROM categories");
      const insert = db.prepare("INSERT INTO categories (id, payload) VALUES (?, ?)");
      value.forEach(item => insert.run(item.id, JSON.stringify(item)));
    } else if (key === "users") {
      writeStoredUsers(value);
    } else if (key === "products") {
      db.exec("DELETE FROM products");
      const insert = db.prepare("INSERT INTO products (id, category_id, seller_id, price, stock, payload) VALUES (?, ?, ?, ?, ?, ?)");
      value.forEach(item => insert.run(item.id, item.danhMuc || null, item.nguoiBanId || null, Number(item.gia) || 0, Math.max(0, Number(item.soLuongTon) || 0), JSON.stringify(item)));
    } else if (key === "orders") {
      db.exec("DELETE FROM orders");
      const insertOrder = db.prepare("INSERT INTO orders (id, buyer_id, status, total, payload) VALUES (?, ?, ?, ?, ?)");
      const insertItem = db.prepare("INSERT INTO order_items (order_id, line_number, product_id, quantity, unit_price, payload) VALUES (?, ?, ?, ?, ?, ?)");
      value.forEach(order => {
        insertOrder.run(order.orderId, order.buyerId || "guest_user", order.trangThai || "ChoXacNhan", Number(order.tongTien) || 0, JSON.stringify(order));
        (order.items || []).forEach((item, index) => insertItem.run(order.orderId, index, item.productId || null, Math.max(1, Number(item.soLuong) || 1), Number(item.donGia) || 0, JSON.stringify(item)));
      });
    } else if (key === "reviews") {
      db.exec("DELETE FROM reviews");
      const insert = db.prepare("INSERT INTO reviews (id, product_id, rating, payload) VALUES (?, ?, ?, ?)");
      value.forEach((item, index) => insert.run(item.id || `review_${index}`, item.productId, Math.min(5, Math.max(1, Number(item.soSao) || 5)), JSON.stringify(item)));
    } else if (key === "cart") {
      db.exec("DELETE FROM cart_items");
      const insert = db.prepare("INSERT INTO cart_items (line_number, product_id, quantity, payload) VALUES (?, ?, ?, ?)");
      value.forEach((item, index) => insert.run(index, item.productId, Math.max(1, Number(item.soLuong) || 1), JSON.stringify(item)));
    } else if (key === "wishlist") {
      db.exec("DELETE FROM wishlist_items");
      const insert = db.prepare("INSERT INTO wishlist_items (position, product_id) VALUES (?, ?)");
      [...new Set(value.map(String))].forEach((id, index) => insert.run(index, id));
    } else {
      throw new Error(`Unknown state collection: ${key}`);
    }
    db.exec("COMMIT");
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
}

function readStoredUsers() {
  return db.prepare("SELECT password_salt, password_hash, payload FROM users ORDER BY rowid").all()
    .map(row => ({ ...JSON.parse(row.payload), passwordSalt: row.password_salt, passwordHash: row.password_hash }));
}

function writeStoredUsers(users) {
  if (!users.length) return;
  const existing = users.map(user => user.id);
  db.prepare(`DELETE FROM users WHERE id NOT IN (${existing.map(() => "?").join(",")})`).run(...existing);
  const insert = db.prepare(`INSERT INTO users (id, username, email, password_salt, password_hash, payload)
    VALUES (?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET username = excluded.username, email = excluded.email,
      password_salt = excluded.password_salt, password_hash = excluded.password_hash, payload = excluded.payload`);
  users.forEach(user => {
    const credentials = user.passwordHash && user.passwordSalt
      ? { hash: user.passwordHash, salt: user.passwordSalt }
      : hashPassword(user.password || "123456");
    const { password, passwordHash, passwordSalt, ...profile } = user;
    insert.run(profile.id, profile.username, profile.email, credentials.salt, credentials.hash, JSON.stringify(profile));
  });
}

function seedDatabase() {
  if (db.prepare("SELECT 1 FROM products LIMIT 1").get()) return;
  const seed = getSeedData();
  const initialUsers = process.env.NODE_ENV === "production" ? [] : seed.users;
  seed.users = initialUsers.map(user => {
    const credentials = hashPassword(user.password || "123456");
    const { password, ...publicFields } = user;
    return { ...publicFields, passwordSalt: credentials.salt, passwordHash: credentials.hash };
  });

  for (const [key, value] of Object.entries(seed)) writeState(key, value);
}

seedDatabase();

function publicUser(user) {
  if (!user) return null;
  const { password, passwordHash, passwordSalt, ...safeUser } = user;
  return safeUser;
}

function base64url(value) { return Buffer.from(value).toString("base64url"); }

function issueToken(user) {
  const now = Math.floor(Date.now() / 1000);
  const header = base64url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const payload = base64url(JSON.stringify({ sub: user.id, role: user.role || "student", iss: JWT_ISSUER, iat: now, exp: now + 60 * 60 }));
  const signature = crypto.createHmac("sha256", JWT_SECRET).update(`${header}.${payload}`).digest("base64url");
  return `${header}.${payload}.${signature}`;
}

function authenticate(req) {
  const match = /^Bearer ([A-Za-z0-9._-]+)$/.exec(req.headers.authorization || "");
  if (!match) return null;
  const [header, payload, signature, extra] = match[1].split(".");
  if (!header || !payload || !signature || extra) return null;
  const expected = crypto.createHmac("sha256", JWT_SECRET).update(`${header}.${payload}`).digest();
  let actual;
  try { actual = Buffer.from(signature, "base64url"); } catch { return null; }
  if (actual.length !== expected.length || !crypto.timingSafeEqual(actual, expected)) return null;
  try {
    const claims = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    if (claims.iss !== JWT_ISSUER || !claims.sub || !Number.isInteger(claims.exp) || claims.exp <= Date.now() / 1000) return null;
    const user = readStoredUsers().find(item => item.id === claims.sub);
    return user ? { id: user.id, role: user.role || "student" } : null;
  } catch { return null; }
}

function requireAuth(req, res) {
  const principal = authenticate(req);
  if (!principal) { jsonResponse(res, 401, { error: "Vui lòng đăng nhập lại." }); return null; }
  return principal;
}

function jsonResponse(res, statusCode, payload) {
  res.writeHead(statusCode, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" });
  res.end(JSON.stringify(payload));
}

function setCors(req, res) {
  const origin = req.headers.origin;
  if (!origin) return true;
  const requestOrigin = `${req.socket.encrypted ? "https" : "http"}://${req.headers.host}`;
  if (origin === requestOrigin) return true;
  if (!ALLOWED_ORIGIN || origin !== ALLOWED_ORIGIN) return false;
  res.setHeader("Access-Control-Allow-Origin", origin);
  res.setHeader("Vary", "Origin");
  res.setHeader("Access-Control-Allow-Methods", "GET, PUT, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  return true;
}

function readJson(req) {
  return new Promise((resolve, reject) => {
    let raw = "";
    req.setEncoding("utf8");
    req.on("data", chunk => {
      raw += chunk;
      if (raw.length > 1024 * 1024) reject(new Error("Request body too large"));
    });
    req.on("end", () => {
      try { resolve(raw ? JSON.parse(raw) : {}); }
      catch { reject(new Error("Invalid JSON body")); }
    });
    req.on("error", reject);
  });
}

function updateUsers(mutator) {
  const users = readStoredUsers();
  const result = mutator(users);
  if (result?.users) {
    db.exec("BEGIN IMMEDIATE");
    try { writeStoredUsers(result.users); db.exec("COMMIT"); }
    catch (error) { db.exec("ROLLBACK"); throw error; }
  }
  return result;
}

async function handleApi(req, res, url) {
  if (!setCors(req, res)) return jsonResponse(res, 403, { error: "Origin is not allowed" });
  if (req.method === "OPTIONS") {
    res.writeHead(204);
    return res.end();
  }

  if (req.method === "GET" && url.pathname === "/api/health") {
    return jsonResponse(res, 200, { status: "ok", database: "sqlite" });
  }

  if (req.method === "GET" && url.pathname === "/api/state") {
    const state = readState();
    const principal = authenticate(req);
    const privateState = principal
      ? Object.fromEntries(db.prepare("SELECT state_key, payload FROM user_state WHERE user_id = ?").all(principal.id).map(row => [row.state_key, JSON.parse(row.payload)]))
      : {};
    return jsonResponse(res, 200, {
      categories: state.categories,
      products: state.products,
      reviews: state.reviews,
      ...(principal ? {
        orders: state.orders.filter(order => order.buyerId === principal.id || order.items?.some(item => item.shopId === principal.id)),
        cart: privateState.cart || [],
        wishlist: privateState.wishlist || [],
      } : {}),
    });
  }

  const stateMatch = url.pathname.match(/^\/api\/state\/([a-z]+)$/);
  if (req.method === "PUT" && stateMatch) {
    const key = stateMatch[1];
    if (!STATE_KEYS.has(key)) return jsonResponse(res, 404, { error: "Unknown state collection" });
    const principal = requireAuth(req, res);
    if (!principal) return;
    const body = await readJson(req);
    if (!Array.isArray(body.value)) return jsonResponse(res, 400, { error: "Invalid collection" });
    if (key === "cart" || key === "wishlist") {
      db.prepare("INSERT INTO user_state (user_id, state_key, payload) VALUES (?, ?, ?) ON CONFLICT(user_id, state_key) DO UPDATE SET payload = excluded.payload")
        .run(principal.id, key, JSON.stringify(body.value));
      return jsonResponse(res, 200, { saved: true, key });
    }
    const current = readState()[key] || [];
    const byId = new Map(current.map(item => [key === "orders" ? item.orderId : item.id, item]));
    const nextById = new Map(body.value.map(item => [key === "orders" ? item.orderId : item.id, item]));
    let valueToWrite = body.value;
    if (key === "categories" && principal.role !== "admin") return jsonResponse(res, 403, { error: "Admin role required" });
    if (key === "products") {
      for (const [id, oldItem] of byId) {
        const next = nextById.get(id);
        if (oldItem.nguoiBanId !== principal.id && (!next || JSON.stringify(next) !== JSON.stringify(oldItem))) return jsonResponse(res, 403, { error: "Bạn không có quyền sửa sản phẩm này." });
        if (oldItem.nguoiBanId === principal.id && !next) continue;
        if (oldItem.nguoiBanId === principal.id && next && next.nguoiBanId !== principal.id) return jsonResponse(res, 403, { error: "Không được chuyển quyền sở hữu sản phẩm." });
      }
      for (const item of body.value) {
        if (byId.has(item.id) && byId.get(item.id).nguoiBanId !== principal.id && JSON.stringify(byId.get(item.id)) !== JSON.stringify(item)) return jsonResponse(res, 403, { error: "Bạn không có quyền sửa sản phẩm này." });
        if (!byId.has(item.id) && item.nguoiBanId !== principal.id) return jsonResponse(res, 403, { error: "Sản phẩm mới phải thuộc tài khoản đang đăng nhập." });
      }
    }
    if (key === "orders") {
      const preserveUnseenOrders = [];
      for (const [id, oldItem] of byId) {
        const next = nextById.get(id);
        const isBuyer = oldItem.buyerId === principal.id;
        const isSeller = oldItem.items?.some(item => item.shopId === principal.id);
        if (!next && !isBuyer && !isSeller) { preserveUnseenOrders.push(oldItem); continue; }
        if (!next) return jsonResponse(res, 403, { error: "Không được xóa đơn hàng." });
        if (next && JSON.stringify(next) !== JSON.stringify(oldItem)) {
          const sameExceptStatus = ({ trangThai: _status, ...value }) => JSON.stringify(value);
          const allowed = isBuyer && next.trangThai === "DaHuy" && oldItem.trangThai === "ChoXacNhan" && sameExceptStatus(next) === sameExceptStatus(oldItem)
            || isSeller && next.buyerId === oldItem.buyerId && next.items?.length === oldItem.items?.length
              && sameExceptStatus(next) === sameExceptStatus(oldItem)
              && ["DangChuanBi", "DangGiao", "DaGiao"].includes(next.trangThai);
          if (!allowed) return jsonResponse(res, 403, { error: "Bạn không có quyền sửa đơn hàng này." });
        }
      }
      for (const item of body.value) if (!byId.has(item.orderId) && item.buyerId !== principal.id) return jsonResponse(res, 403, { error: "Đơn hàng phải thuộc tài khoản đang đăng nhập." });
      valueToWrite = [...body.value, ...preserveUnseenOrders];
    }
    if (key === "reviews") {
      for (const item of body.value) {
        const old = byId.get(item.id);
        if (old && old.userId !== principal.id && JSON.stringify(old) !== JSON.stringify(item)) return jsonResponse(res, 403, { error: "Không được sửa đánh giá của người khác." });
        if (!old && item.userId !== principal.id) return jsonResponse(res, 403, { error: "Đánh giá phải thuộc tài khoản đang đăng nhập." });
      }
      for (const old of current) if (!nextById.has(old.id) && old.userId !== principal.id) return jsonResponse(res, 403, { error: "Không được xóa đánh giá của người khác." });
    }
    writeState(key, valueToWrite);
    return jsonResponse(res, 200, { saved: true, key });
  }

  if (req.method === "POST" && url.pathname === "/api/auth/login") {
    const clientIp = req.socket.remoteAddress || "unknown";
    const attempts = loginAttempts.get(clientIp) || { count: 0, since: Date.now() };
    if (Date.now() - attempts.since > 15 * 60 * 1000) { attempts.count = 0; attempts.since = Date.now(); }
    if (attempts.count >= 10) return jsonResponse(res, 429, { success: false, message: "Quá nhiều lần đăng nhập sai. Vui lòng thử lại sau 15 phút." });
    const { username, password } = await readJson(req);
    if (typeof username !== "string" || username.length > 64 || typeof password !== "string" || password.length > 128) {
      return jsonResponse(res, 401, { success: false, message: "Tên đăng nhập hoặc mật khẩu không chính xác!" });
    }
    const user = readStoredUsers().find(item => item.username === username);
    if (!user || !verifyPassword(password, user)) {
      attempts.count += 1;
      loginAttempts.set(clientIp, attempts);
      return jsonResponse(res, 401, { success: false, message: "Tên đăng nhập hoặc mật khẩu không chính xác!" });
    }
    loginAttempts.delete(clientIp);
    return jsonResponse(res, 200, { success: true, user: publicUser(user), token: issueToken(user) });
  }

  if (req.method === "POST" && url.pathname === "/api/auth/register") {
    const body = await readJson(req);
    if (typeof body.username !== "string" || !/^[A-Za-z0-9_.-]{3,32}$/.test(body.username)
      || typeof body.password !== "string" || body.password.length < 6 || body.password.length > 128
      || typeof body.email !== "string" || body.email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
      return jsonResponse(res, 400, { success: false, message: "Tên đăng nhập, email hoặc mật khẩu không hợp lệ." });
    }
    const result = updateUsers(users => {
      if (users.some(user => user.username === body.username)) return { error: "Tên đăng nhập đã tồn tại!" };
      if (users.some(user => user.email === body.email)) return { error: "Email đã được sử dụng!" };
      const credentials = hashPassword(body.password || "");
      const { password, ...profile } = body;
      const user = {
        id: "user_" + crypto.randomBytes(4).toString("hex"),
        viTraSau: 500000,
        tenShop: profile.tenShop || `Gian Hàng Sinh Viên ${profile.hoTen || ""}`,
        avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80",
        ...profile,
        role: "student",
        passwordSalt: credentials.salt,
        passwordHash: credentials.hash,
      };
      return { users: [...users, user], user: publicUser(user) };
    });
    if (result.error) return jsonResponse(res, 409, { success: false, message: result.error });
    return jsonResponse(res, 201, { success: true, user: result.user, token: issueToken(result.user) });
  }

  const walletMatch = url.pathname.match(/^\/api\/users\/([^/]+)\/wallet$/);
  if (req.method === "POST" && walletMatch) {
    const principal = requireAuth(req, res);
    if (!principal) return;
    if (decodeURIComponent(walletMatch[1]) !== principal.id && principal.role !== "admin") return jsonResponse(res, 403, { error: "Bạn chỉ được cập nhật ví của mình." });
    const { delta, orderId } = await readJson(req);
    const amount = Number(delta);
    if (!Number.isFinite(amount) || amount === 0) return jsonResponse(res, 400, { error: "Số tiền không hợp lệ." });
    db.exec("BEGIN IMMEDIATE");
    try {
      const users = readStoredUsers();
      const index = users.findIndex(user => user.id === principal.id);
      if (index < 0) { db.exec("ROLLBACK"); return jsonResponse(res, 404, { error: "Không tìm thấy tài khoản" }); }
      if (amount > 0) {
        const order = db.prepare("SELECT payload FROM orders WHERE id = ?").get(orderId);
        const orderData = order && JSON.parse(order.payload);
        if (!orderData || orderData.buyerId !== principal.id || orderData.trangThai !== "DaHuy" || orderData.phuongThucThanhToan !== "SPayLater" || Number(orderData.tongTien) !== amount) {
          db.exec("ROLLBACK"); return jsonResponse(res, 403, { error: "Chỉ hoàn ví cho đơn SPayLater đã hủy hợp lệ." });
        }
        if (db.prepare("SELECT 1 FROM wallet_refunds WHERE order_id = ?").get(orderId)) {
          db.exec("ROLLBACK"); return jsonResponse(res, 409, { error: "Đơn hàng này đã được hoàn ví." });
        }
        db.prepare("INSERT INTO wallet_refunds (order_id, user_id, amount) VALUES (?, ?, ?)").run(orderId, principal.id, amount);
      } else if ((users[index].viTraSau || 0) < Math.abs(amount)) {
        db.exec("ROLLBACK"); return jsonResponse(res, 409, { error: "Số dư ví không đủ." });
      }
      users[index].viTraSau = (users[index].viTraSau || 0) + amount;
      writeStoredUsers(users);
      db.exec("COMMIT");
      return jsonResponse(res, 200, { user: publicUser(users[index]) });
    } catch (error) {
      db.exec("ROLLBACK");
      throw error;
    }
  }

  return jsonResponse(res, 404, { error: "API route not found" });
}

function serveStatic(req, res, url) {
  const requestedPath = decodeURIComponent(url.pathname === "/" ? "/trangchu.html" : url.pathname);
  const filePath = path.resolve(ROOT, `.${requestedPath}`);
  const relativePath = path.relative(ROOT, filePath);
  if (filePath !== ROOT && !filePath.startsWith(ROOT + path.sep)) {
    res.writeHead(403); return res.end("Forbidden");
  }
  if (relativePath === "server" || relativePath.startsWith(`server${path.sep}`) || relativePath.startsWith(".git")) {
    res.writeHead(404); return res.end("Not found");
  }
  fs.stat(filePath, (error, stat) => {
    if (error || !stat.isFile()) { res.writeHead(404); return res.end("Not found"); }
    const contentType = MIME_TYPES[path.extname(filePath).toLowerCase()] || "application/octet-stream";
    res.writeHead(200, { "Content-Type": contentType, "X-Content-Type-Options": "nosniff" });
    fs.createReadStream(filePath).pipe(res);
  });
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);
    if (url.pathname.startsWith("/api/")) await handleApi(req, res, url);
    else if (req.method === "GET" || req.method === "HEAD") serveStatic(req, res, url);
    else jsonResponse(res, 405, { error: "Method not allowed" });
  } catch (error) {
    console.error(error);
    if (!res.headersSent) jsonResponse(res, 400, { error: error.message || "Request failed" });
    else res.end();
  }
});

server.listen(PORT, () => {
  console.log(`EduMarket server listening at http://localhost:${PORT}`);
  console.log(`SQLite database: ${DB_PATH}`);
});

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => server.close(() => { db.close(); process.exit(0); }));
}
