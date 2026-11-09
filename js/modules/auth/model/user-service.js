// 7. Dịch vụ Người dùng & Xác thực (Auth)
const UserService = {
  getAll() {
    return Storage.get("users", []);
  },

  getCurrentUser() {
    return Storage.get("currentUser", null);
  },

  setCurrentUser(user) {
    Storage.set("currentUser", user);
    return true;
  },

  logout() {
    Storage.remove("currentUser");
    return true;
  },

  login(username, password) {
    const users = this.getAll();
    const user = users.find(u => u.username === username && u.password === password);
    if (user) {
      this.setCurrentUser(user);
      return { success: true, user };
    }
    return { success: false, message: "Tên đăng nhập hoặc mật khẩu không chính xác!" };
  },

  register(userData) {
    const users = this.getAll();
    if (users.some(u => u.username === userData.username)) {
      return { success: false, message: "Tên đăng nhập đã tồn tại!" };
    }
    if (users.some(u => u.email === userData.email)) {
      return { success: false, message: "Email đã được sử dụng!" };
    }

    const newUser = {
      id: "user_" + Date.now().toString().slice(-6),
      viTraSau: 500000, // Mặc định cấp hạn mức 500k cho sinh viên mới
      tenShop: userData.tenShop || "Gian Hàng Sinh Viên " + userData.hoTen,
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80",
      ...userData
    };

    users.push(newUser);
    Storage.set("users", users);
    this.setCurrentUser(newUser);
    return { success: true, user: newUser };
  },

  updateViTraSau(userId, deltaAmount) {
    const users = this.getAll();
    const user = users.find(u => u.id === userId);
    if (user) {
      user.viTraSau = Math.max(0, (user.viTraSau || 0) + deltaAmount);
      Storage.set("users", users);

      // Cập nhật cả currentUser nếu đang đăng nhập đúng tài khoản này
      const current = this.getCurrentUser();
      if (current && current.id === userId) {
        current.viTraSau = user.viTraSau;
        this.setCurrentUser(current);
      }
      return user.viTraSau;
    }
    return null;
  }
};
