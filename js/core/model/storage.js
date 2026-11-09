/** Local cache backed by the SQLite API when the backend is available. */
const Storage = {
  remoteConnected: false,
  pendingWrites: Promise.resolve(),
  ready: Promise.resolve(),
  localOnlyKeys: new Set(["currentUser"]),

  get(key, defaultValue = null) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : defaultValue;
    } catch (error) {
      console.error(`Lỗi đọc localStorage key "${key}":`, error);
      return defaultValue;
    }
  },

  setLocal(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  },

  set(key, value) {
    try {
      this.setLocal(key, value);
      if (this.remoteConnected && !this.localOnlyKeys.has(key) && key !== "users") {
        this.pendingWrites = this.pendingWrites
          .catch(() => {})
          .then(() => ApiClient.put(`/state/${encodeURIComponent(key)}`, { value }));
        this.pendingWrites.catch(error => console.error(`Không lưu được ${key} vào SQLite:`, error));
      }
      return true;
    } catch (error) {
      console.error(`Lỗi ghi localStorage key "${key}":`, error);
      return false;
    }
  },

  remove(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`Lỗi xóa localStorage key "${key}":`, error);
      return false;
    }
  },

  async connectRemote() {
    try {
      const state = await ApiClient.get("/state");
      for (const [key, value] of Object.entries(state)) this.setLocal(key, value);
      const currentUser = this.get("currentUser");
      if (currentUser?.password) {
        const { password, ...safeUser } = currentUser;
        this.setLocal("currentUser", safeUser);
      }
      this.remoteConnected = true;
      console.info("EduMarket: đang dùng dữ liệu SQLite qua API.");
    } catch (error) {
      this.remoteConnected = false;
      console.warn("Không kết nối được SQLite API; tiếp tục với dữ liệu localStorage.", error.message);
    }
    return this.remoteConnected;
  },

  initDatabase() {
    const initialValues = {
      products: MOCK_PRODUCTS,
      categories: MOCK_CATEGORIES,
      users: MOCK_USERS,
      cart: MOCK_CART,
      orders: MOCK_ORDERS,
      reviews: MOCK_REVIEWS,
      wishlist: MOCK_WISHLIST,
    };
    for (const [key, value] of Object.entries(initialValues)) {
      if (!localStorage.getItem(key)) this.setLocal(key, value);
    }
    this.ready = this.connectRemote();
    return this.ready;
  },

  async flush() {
    try {
      await this.pendingWrites;
      return true;
    } catch (error) {
      console.error("Không thể hoàn tất đồng bộ dữ liệu với SQLite:", error);
      return false;
    }
  },

  resetDatabase() {
    const initialValues = {
      products: MOCK_PRODUCTS,
      categories: MOCK_CATEGORIES,
      cart: MOCK_CART,
      orders: MOCK_ORDERS,
      reviews: MOCK_REVIEWS,
      wishlist: MOCK_WISHLIST,
    };
    for (const [key, value] of Object.entries(initialValues)) this.set(key, value);
  },
};

Storage.initDatabase();
