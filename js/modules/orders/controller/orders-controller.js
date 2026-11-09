/**
 * ==============================================================================
 * SHOPEE EDU-MARKETPLACE - ORDERS & TIMELINE TRACKING LOGIC (js/orders.js)
 * Chức năng: Theo dõi tiến trình đơn hàng (Timeline Shopee), Lọc trạng thái, Hủy đơn
 * ==============================================================================
 */

document.addEventListener("DOMContentLoaded", () => {
  Storage.ready.then(() => OrdersController.init());
});

const OrdersController = {
  currentTab: "all", // "all" | "ChoXacNhan" | "DangChuanBi" | "DangGiao" | "DaGiao" | "DaHuy"
  orders: [],

  init() {
    const user = UserService.getCurrentUser();
    if (!user) {
      Toast.warning("Chưa đăng nhập", "Vui lòng đăng nhập để xem lịch sử đơn mua!");
      setTimeout(() => {
        window.location.href = "dangnhap.html";
      }, 1000);
      return;
    }

    this.loadOrders();
    this.bindEvents();
  },

  loadOrders() {
    const user = UserService.getCurrentUser();
    this.orders = OrderService.getByBuyer(user.id);
    this.renderOrders();
  },

  /**
   * Đăng ký sự kiện lọc tab và hủy đơn
   */
  bindEvents() {
    // Chuyển tab lọc trạng thái đơn
    document.querySelectorAll(".order-tab-item").forEach(tab => {
      tab.addEventListener("click", (e) => {
        document.querySelectorAll(".order-tab-item").forEach(t => t.classList.remove("active"));
        const target = e.currentTarget;
        target.classList.add("active");
        this.currentTab = target.dataset.status;
        this.renderOrders();
      });
    });

    // Sự kiện bấm nút Hủy đơn hàng
    document.addEventListener("click", async (e) => {
      const btnCancel = e.target.closest(".btn-cancel-order");
      if (btnCancel) {
        const orderId = btnCancel.dataset.id;
        if (confirm(`Bạn có chắc chắn muốn hủy đơn hàng ${orderId}? Hàng sẽ được tự động hoàn trả lại kho của Shop.`)) {
          const res = await OrderService.cancelOrder(orderId);
          if (res.success) {
            Toast.success("Đã hủy đơn", res.message);
            this.loadOrders();
          } else {
            Toast.error("Không thể hủy", res.message);
          }
        }
      }
    });
  },

  /**
   * Render danh sách đơn hàng kèm thanh tiến trình vận chuyển
   */
  renderOrders() {
    return OrdersView.renderOrders(this);
  },

  /**
   * Render một thẻ đơn hàng chi tiết
   */
  renderOrderCard(order) {
    return OrdersView.renderOrderCard(this, order);
  },

  /**
   * Tạo các bước trên thanh Timeline lộ trình
   */
  renderTimelineSteps(currentStatus) {
    return OrdersView.renderTimelineSteps(this, currentStatus);
  }
};

