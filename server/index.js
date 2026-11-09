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
const STATE_KEYS = new Set(["categories", "products", "cart", "orders", "reviews", "wishlist"]);
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
    reviews: readPayloads("reviews"),
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
  db.exec("DELETE FROM users");
  const insert = db.prepare("INSERT INTO users (id, username, email, password_salt, password_hash, payload) VALUES (?, ?, ?, ?, ?, ?)");
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
  seed.users = seed.users.map(user => {
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
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
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
    state.users = (state.users || []).map(publicUser);
    return jsonResponse(res, 200, state);
  }

  const stateMatch = url.pathname.match(/^\/api\/state\/([a-z]+)$/);
  if (req.method === "PUT" && stateMatch) {
    const key = stateMatch[1];
    if (!STATE_KEYS.has(key)) return jsonResponse(res, 404, { error: "Unknown state collection" });
    const body = await readJson(req);
    writeState(key, body.value);
    return jsonResponse(res, 200, { saved: true, key });
  }

  if (req.method === "POST" && url.pathname === "/api/auth/login") {
    const { username, password } = await readJson(req);
    const user = readStoredUsers().find(item => item.username === username);
    if (!user || !verifyPassword(password, user)) {
      return jsonResponse(res, 401, { success: false, message: "Tên đăng nhập hoặc mật khẩu không chính xác!" });
    }
    return jsonResponse(res, 200, { success: true, user: publicUser(user) });
  }

  if (req.method === "POST" && url.pathname === "/api/auth/register") {
    const body = await readJson(req);
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
        passwordSalt: credentials.salt,
        passwordHash: credentials.hash,
      };
      return { users: [...users, user], user: publicUser(user) };
    });
    if (result.error) return jsonResponse(res, 409, { success: false, message: result.error });
    return jsonResponse(res, 201, { success: true, user: result.user });
  }

  const walletMatch = url.pathname.match(/^\/api\/users\/([^/]+)\/wallet$/);
  if (req.method === "POST" && walletMatch) {
    const { delta } = await readJson(req);
    const result = updateUsers(users => {
      const index = users.findIndex(user => user.id === decodeURIComponent(walletMatch[1]));
      if (index < 0) return { error: "Không tìm thấy tài khoản" };
      const next = [...users];
      next[index] = { ...next[index], viTraSau: Math.max(0, (next[index].viTraSau || 0) + Number(delta || 0)) };
      return { users: next, user: publicUser(next[index]) };
    });
    if (result.error) return jsonResponse(res, 404, { error: result.error });
    return jsonResponse(res, 200, { user: result.user });
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
