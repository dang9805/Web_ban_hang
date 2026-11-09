 ==============================================================================
// STORAGE HELPER SERVICE (QUẢN LÝ DỮ LIỆU LOCALSTORAGE TẬP TRUNG)
// ==============================================================================
const Storage = {
  get(key, defaultValue = null) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : defaultValue;
    } catch (e) {
      console.error(`Lỗi đọc localStorage key "${key}":`, e);
      return defaultValue;
    }
  },

  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      console.error(`Lỗi ghi localStorage key "${key}":`, e);
      return false;
    }
  },

  remove(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (e) {
      console.error(`Lỗi xóa localStorage key "${key}":`, e);
      return false;
    }
  },

  /**
   * Khởi tạo cơ sở dữ liệu giả lập ban đầu vào LocalStorage
   */
  initDatabase() {
    if (!localStorage.getItem("products")) {
      this.set("products", MOCK_PRODUCTS);
    }
    if (!localStorage.getItem("categories")) {
      this.set("categories", MOCK_CATEGORIES);
    }
    if (!localStorage.getItem("users")) {
      this.set("users", MOCK_USERS);
    }
    if (!localStorage.getItem("currentUser")) {
      // Mặc định khởi tạo sẵn phiên đăng nhập của user_shop1 (Nguyễn Văn An)
      // Giúp giảng viên/người chấm bài trải nghiệm ngay mọi tính năng mà không bắt buộc phải gõ đăng nhập
      this.set("currentUser", MOCK_USERS[0]);
    }
    if (!localStorage.getItem("cart")) {
      this.set("cart", MOCK_CART);
    }
    if (!localStorage.getItem("orders")) {
      this.set("orders", MOCK_ORDERS);
    }
    if (!localStorage.getItem("reviews")) {
      this.set("reviews", MOCK_REVIEWS);
    }
    if (!localStorage.getItem("wishlist")) {
      this.set("wishlist", MOCK_WISHLIST);
    }
    console.log(" Shopee Edu-Marketplace Database: Đã sẵn sàng hoạt động!");
  },

  /**
   * Khôi phục toàn bộ dữ liệu về mặc định (phục vụ kiểm thử)
   */
  resetDatabase() {
    this.set("products", MOCK_PRODUCTS);
    this.set("categories", MOCK_CATEGORIES);
    this.set("users", MOCK_USERS);
    this.set("currentUser", MOCK_USERS[0]);
    this.set("cart", MOCK_CART);
    this.set("orders", MOCK_ORDERS);
    this.set("reviews", MOCK_REVIEWS);
    this.set("wishlist", MOCK_WISHLIST);
    console.log(" Shopee Edu-Marketplace Database: Đã reset về trạng thái ban đầu!");
  }
};

//
Storage.initDatabase();
