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

  createOrder(orderData) {
    const orders = this.getAll();
    const newOrder = {
      orderId: "ORD-" + Date.now().toString().slice(-6),
      trangThai: "ChoXacNhan",
      ngayDat: FormatHelper.formatCurrentDateTime(),
      ...orderData
    };

    // Trừ số lượng tồn kho của các sản phẩm tương ứng và tăng số lượng đã bán
    newOrder.items.forEach(item => {
      const product = ProductService.getById(item.productId);
      if (product) {
        ProductService.update(product.id, {
          soLuongTon: Math.max(0, product.soLuongTon - item.soLuong),
          daBan: (product.daBan || 0) + item.soLuong
        });
      }
    });

    orders.unshift(newOrder);
    Storage.set("orders", orders);
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

  async cancelOrder(orderId) {
    const order = this.getById(orderId);
    if (!order) return { success: false, message: "Không tìm thấy đơn hàng!" };

    if (order.trangThai !== "ChoXacNhan") {
      return { success: false, message: "Chỉ có thể hủy đơn khi đang ở trạng thái 'Chờ xác nhận'!" };
    }

    // Hoàn trả lại số lượng tồn kho và giảm số đã bán
    order.items.forEach(item => {
      const product = ProductService.getById(item.productId);
      if (product) {
        ProductService.update(product.id, {
          soLuongTon: product.soLuongTon + item.soLuong,
          daBan: Math.max(0, (product.daBan || 0) - item.soLuong)
        });
      }
    });

    // Nếu đơn đã thanh toán bằng ví SpayLater thì hoàn tiền vào ví
    this.updateStatus(orderId, "DaHuy");
    await Storage.flush();
    if (order.phuongThucThanhToan === "SPayLater") {
      await UserService.updateViTraSau(order.buyerId, order.tongTien, order.orderId);
    }
    return { success: true, message: "Đã hủy đơn hàng thành công! Số lượng hàng đã được hoàn lại kho." };
  }
};
