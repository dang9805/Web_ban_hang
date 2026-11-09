/** View module: render giao diện và cập nhật phần tử DOM. */
const OrdersView = {
  renderOrders(controller) {
    const container = document.getElementById("orders-list-container");
    const emptyContainer = document.getElementById("orders-empty-state");
    if (!container) return;

    let filtered = [...controller.orders];
    if (controller.currentTab !== "all") {
      filtered = filtered.filter(o => o.trangThai === controller.currentTab);
    }

    if (filtered.length === 0) {
      container.innerHTML = "";
      if (emptyContainer) emptyContainer.classList.remove("d-none");
      return;
    }

    if (emptyContainer) emptyContainer.classList.add("d-none");

    container.innerHTML = filtered.map(order => controller.renderOrderCard(order)).join("");
  
  },
  renderOrderCard(controller, order) {
    const statusBadges = {
      ChoXacNhan: '<span class="badge badge-status status-choxacnhan">Chờ xác nhận</span>',
      DangChuanBi: '<span class="badge badge-status status-dangchuanbi">Shop đang chuẩn bị hàng</span>',
      DangGiao: '<span class="badge badge-status status-danggiao">Đang giao hàng</span>',
      DaGiao: '<span class="badge badge-status status-dagiao">Giao hàng thành công</span>',
      DaHuy: '<span class="badge badge-status status-dahuy">Đã hủy đơn</span>'
    };

    const paymentLabels = {
      COD: '<i class="fa-solid fa-money-bill-wave text-success"></i> Thanh toán khi nhận hàng (COD)',
      QR: '<i class="fa-solid fa-qrcode text-primary"></i> Chuyển khoản VietQR',
      SPayLater: '<i class="fa-solid fa-wallet text-warning"></i> Ví trả sau SPayLater sinh viên'
    };

    const isCancelled = order.trangThai === "DaHuy";

    return `
      <div class="order-card" data-id="${order.orderId}">
        <div class="order-card-header">
          <div>
            <span class="order-id-code">Mã đơn: ${order.orderId}</span>
            <span class="text-muted" style="margin-left: 12px; font-size: 0.85rem;">Ngày đặt: ${order.ngayDat}</span>
          </div>
          <div>
            ${statusBadges[order.trangThai] || statusBadges.ChoXacNhan}
          </div>
        </div>

        ${isCancelled ? `
          <div class="order-cancelled-notice">
            <i class="fa-solid fa-circle-exclamation"></i>
            <span>Đơn hàng này đã bị hủy. Toàn bộ sản phẩm đã được hoàn trả lại tồn kho của Shop.</span>
          </div>
        ` : `
          <!-- THANH LỘ TRÌNH TIẾN TRÌNH VẬN CHUYỂN TIMELINE -->
          <div class="order-timeline">
            ${controller.renderTimelineSteps(order.trangThai)}
          </div>
        `}

        <!-- DANH SÁCH SẢN PHẨM TRONG ĐƠN -->
        <div class="order-items-list">
          ${order.items.map(item => `
            <div class="order-item-single">
              <img src="${item.anhChinh}" alt="${item.ten}" class="order-item-img">
              <div class="order-item-info">
                <div class="order-item-name">${item.ten}</div>
                <div class="d-flex align-center justify-between mt-1">
                  <span class="text-muted" style="font-size: 0.85rem;">Số lượng: x${item.soLuong}</span>
                  <span class="fw-semibold text-primary">${FormatHelper.formatVND(item.donGia)}</span>
                </div>
              </div>
            </div>
          `).join("")}
        </div>

        <!-- FOOTER ĐƠN HÀNG -->
        <div class="order-card-footer">
          <div>
            <div class="text-muted" style="font-size: 0.85rem; margin-bottom: 4px;">
              Hình thức thanh toán: ${paymentLabels[order.phuongThucThanhToan] || order.phuongThucThanhToan}
            </div>
            <div class="text-muted" style="font-size: 0.85rem;">
              Địa chỉ nhận: <span class="text-main">${order.tenNguoiNhan} (${order.sdt}) - ${order.diaChi}</span>
            </div>
          </div>

          <div class="d-flex align-center gap-3">
            <div class="text-right">
              <span class="text-secondary" style="font-size: 0.9rem;">Thành tiền: </span>
              <span class="order-total-price">${FormatHelper.formatVND(order.tongTien)}</span>
            </div>

            ${order.trangThai === "ChoXacNhan" ? `
              <button type="button" class="btn btn-outline btn-cancel-order text-danger" style="border-color: #ff424f;" data-id="${order.orderId}">
                <i class="fa-solid fa-xmark"></i> Hủy Đơn Hàng
              </button>
            ` : ""}
          </div>
        </div>
      </div>
    `;
  
  },
  renderTimelineSteps(controller, currentStatus) {
    const steps = [
      { id: "ChoXacNhan", label: "Đã Đặt Hàng", icon: "fa-solid fa-receipt" },
      { id: "DangChuanBi", label: "Shop Đã Xác Nhận", icon: "fa-solid fa-box" },
      { id: "DangGiao", label: "Đang Giao Hàng", icon: "fa-solid fa-truck-fast" },
      { id: "DaGiao", label: "Đã Giao Thành Công", icon: "fa-solid fa-circle-check" }
    ];

    const statusWeights = {
      ChoXacNhan: 1,
      DangChuanBi: 2,
      DangGiao: 3,
      DaGiao: 4,
      DaHuy: 0
    };

    const currentWeight = statusWeights[currentStatus] || 1;

    return steps.map((step, index) => {
      const stepWeight = index + 1;
      let stateClass = "";

      if (stepWeight < currentWeight) {
        stateClass = "completed";
      } else if (stepWeight === currentWeight) {
        stateClass = "active";
      }

      return `
        <div class="timeline-step ${stateClass}">
          <div class="timeline-icon-box">
            <i class="${step.icon}"></i>
          </div>
          <div class="timeline-step-text">${step.label}</div>
        </div>
      `;
    }).join("");
  
  }
};
