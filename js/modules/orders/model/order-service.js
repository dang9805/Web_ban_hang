// 4. Dịch vụ Đơn hàng
const OrderService = {
  getAll() {
    return Storage.get("orders", []);
  },

  getById(orderId) {
    const orders = this.getAll();
    return orders.find(o => o.orderId === orderId) || null;
  },

  getByBuyer(buyerId) {
    const orders = this.getAll();
    return orders.filter(o => o.buyerId === buyerId);
  },

  getBySeller(sellerId) {
    const orders = this.getAll();
    // Đơn hàng có chứa ít nhất 1 sản phẩm thuộc sellerId
    return orders.filter(order => order.items.some(item => item.shopId === sellerId));
  },

  async createOrder(orderData) {
    const orders = this.getAll();
    const newOrder = {
      orderId: `ORD-${crypto.randomUUID()}`,
      trangThai: "ChoXacNhan",
      ngayDat: FormatHelper.formatCurrentDateTime(),
      ...orderData
    };

    // Trừ số lượng tồn kho của các sản phẩm tương ứng và tăng số lượng đã bán
    const products = ProductService.getAll();
    const nextProducts = products.map(product => {
      const item = newOrder.items.find(line => line.productId === product.id);
      if (!item) return product;
      return { ...product, soLuongTon: Math.max(0, product.soLuongTon - item.soLuong), daBan: (product.daBan || 0) + item.soLuong };
    });
    if (Storage.remoteConnected) Storage.setLocal("products", nextProducts);
    else Storage.set("products", nextProducts);

    orders.unshift(newOrder);
    if (!Storage.set("orders", orders)) throw new Error("Không thể lưu đơn hàng.");
    if (Storage.remoteConnected && !(await Storage.flush())) {
      const error = new Error(Storage.lastWriteError?.message || "Máy chủ chưa lưu đơn hàng.");
      await Storage.connectRemote();
      throw error;
    }
    return newOrder;
  },

  updateStatus(orderId, newStatus) {
    const orders = this.getAll();
    const index = orders.findIndex(o => o.orderId === orderId);
    if (index !== -1) {
      orders[index].trangThai = newStatus;
      Storage.set("orders", orders);
      return orders[index];
    }
    return null;
  },

  async cancelOrder(orderId, { skipRefund = false } = {}) {
    const order = this.getById(orderId);
    if (!order) return { success: false, message: "Không tìm thấy đơn hàng!" };

    if (order.trangThai !== "ChoXacNhan") {
      return { success: false, message: "Chỉ có thể hủy đơn khi đang ở trạng thái 'Chờ xác nhận'!" };
    }

    // Hoàn trả lại số lượng tồn kho và giảm số đã bán
    const nextProducts = ProductService.getAll().map(product => {
      const item = order.items.find(line => line.productId === product.id);
      if (!item) return product;
      return { ...product, soLuongTon: product.soLuongTon + item.soLuong, daBan: Math.max(0, (product.daBan || 0) - item.soLuong) };
    });
    if (Storage.remoteConnected) Storage.setLocal("products", nextProducts);
    else Storage.set("products", nextProducts);

    // Nếu đơn đã thanh toán bằng ví SpayLater thì hoàn tiền vào ví
    this.updateStatus(orderId, "DaHuy");
    await Storage.flush();
    if (order.phuongThucThanhToan === "SPayLater" && !skipRefund && order.tongTien > 0) {
      await UserService.updateViTraSau(order.buyerId, order.tongTien, order.orderId);
    }
    return { success: true, message: "Đã hủy đơn hàng thành công! Số lượng hàng đã được hoàn lại kho." };
  }
};
