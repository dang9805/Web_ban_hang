/** View module: render giao diện và cập nhật phần tử DOM. */
const SellerView = {
  renderShopHeader(controller) {
    const shopNameEl = document.getElementById("seller-shop-name-display");
    const ownerNameEl = document.getElementById("seller-owner-name-display");
    const avatarEl = document.getElementById("seller-avatar-display");

    if (shopNameEl) shopNameEl.textContent = controller.currentUser.tenShop || "Gian Hàng Sinh Viên Của Tôi";
    if (ownerNameEl) ownerNameEl.textContent = `Chủ shop: ${controller.currentUser.hoTen} (${controller.currentUser.mssv || 'Sinh viên'})`;
    if (avatarEl && controller.currentUser.avatar) avatarEl.src = controller.currentUser.avatar;
  
  },
  renderKPIs(controller) {
    // 1. Tổng doanh thu: Tính từ các đơn hàng thành công (DaGiao) hoặc đang xử lý
    let totalRevenue = 0;
    controller.shopOrders.forEach(order => {
      if (order.trangThai !== "DaHuy") {
        // Chỉ cộng tiền các món của shop này
        order.items.forEach(item => {
          if (item.shopId === controller.currentUser.id) {
            totalRevenue += item.donGia * item.soLuong;
          }
        });
      }
    });

    // 2. Số đơn hàng mới cần xử lý (ChoXacNhan hoặc DangChuanBi)
    const pendingOrdersCount = controller.shopOrders.filter(o => o.trangThai === "ChoXacNhan" || o.trangThai === "DangChuanBi").length;

    // 3. Tổng số sản phẩm đang đăng bán
    const totalProductsCount = controller.shopProducts.length;

    // 4. Cảnh báo sản phẩm sắp hết hàng (tồn kho <= 2)
    const lowStockCount = controller.shopProducts.filter(p => p.soLuongTon <= 2).length;

    const revEl = document.getElementById("kpi-revenue-val");
    const ordersEl = document.getElementById("kpi-pending-orders-val");
    const prodsEl = document.getElementById("kpi-total-prods-val");
    const lowStockEl = document.getElementById("kpi-low-stock-val");

    if (revEl) revEl.textContent = FormatHelper.formatVND(totalRevenue);
    if (ordersEl) ordersEl.textContent = pendingOrdersCount;
    if (prodsEl) prodsEl.textContent = totalProductsCount;
    if (lowStockEl) lowStockEl.textContent = lowStockCount;
  
  },
  renderProductTable(controller) {
    const tbody = document.getElementById("seller-products-table-body");
    const emptyEl = document.getElementById("seller-products-empty");
    if (!tbody) return;

    if (controller.shopProducts.length === 0) {
      tbody.innerHTML = "";
      if (emptyEl) emptyEl.classList.remove("d-none");
      return;
    }

    if (emptyEl) emptyEl.classList.add("d-none");

    tbody.innerHTML = controller.shopProducts.map(p => {
      const isLowStock = p.soLuongTon <= 2;
      return `
        <tr data-id="${p.id}">
          <td>
            <div class="seller-product-item">
              <img src="${p.anhChinh}" alt="${p.ten}" class="seller-product-thumb">
              <div>
                <a href="chitietsanpham.html?id=${p.id}" class="fw-semibold text-main" target="_blank">${p.ten}</a>
                <div class="text-muted mt-1" style="font-size: 0.78rem;">Mã SP: ${p.id} | Đã bán: ${p.daBan || 0}</div>
              </div>
            </div>
          </td>
          <td>
            <span class="text-primary fw-bold">${FormatHelper.formatVND(p.gia)}</span>
            ${p.giaGoc ? `<div class="text-muted" style="font-size: 0.8rem; text-decoration: line-through;">${FormatHelper.formatVND(p.giaGoc)}</div>` : ''}
          </td>
          <td>
            <div class="d-flex align-center gap-2">
              <input type="number" min="0" class="seller-stock-input input-quick-stock" value="${p.soLuongTon}" data-id="${p.id}">
              ${isLowStock ? '<span class="badge" style="background: #fff3e0; color: #e65100;">Sắp hết</span>' : ''}
            </div>
          </td>
          <td>
            <span class="badge ${p.soLuongTon > 0 ? 'status-dagiao' : 'status-dahuy'}">
              ${p.soLuongTon > 0 ? 'Đang bán' : 'Hết hàng'}
            </span>
          </td>
          <td>
            <div class="d-flex gap-2">
              <button type="button" class="btn btn-sm btn-outline btn-save-stock" data-id="${p.id}" title="Lưu số lượng tồn kho">
                <i class="fa-solid fa-floppy-disk"></i> Lưu
              </button>
              <button type="button" class="btn btn-sm btn-danger btn-delete-product" data-id="${p.id}" title="Xóa sản phẩm">
                <i class="fa-solid fa-trash"></i>
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join("");
  
  },
  renderOrderTable(controller) {
    const tbody = document.getElementById("seller-orders-table-body");
    const emptyEl = document.getElementById("seller-orders-empty");
    if (!tbody) return;

    if (controller.shopOrders.length === 0) {
      tbody.innerHTML = "";
      if (emptyEl) emptyEl.classList.remove("d-none");
      return;
    }

    if (emptyEl) emptyEl.classList.add("d-none");

    const statusBadges = {
      ChoXacNhan: '<span class="badge badge-status status-choxacnhan">Chờ xác nhận</span>',
      DangChuanBi: '<span class="badge badge-status status-dangchuanbi">Đang chuẩn bị</span>',
      DangGiao: '<span class="badge badge-status status-danggiao">Đang giao hàng</span>',
      DaGiao: '<span class="badge badge-status status-dagiao">Đã hoàn thành</span>',
      DaHuy: '<span class="badge badge-status status-dahuy">Đã hủy</span>'
    };

    tbody.innerHTML = controller.shopOrders.map(order => {
      // Lấy danh sách sản phẩm thuộc shop này
      const shopItems = order.items.filter(i => i.shopId === controller.currentUser.id);
      const shopOrderTotal = shopItems.reduce((sum, i) => sum + i.donGia * i.soLuong, 0);

      return `
        <tr data-id="${order.orderId}">
          <td>
            <div class="fw-bold text-main">${order.orderId}</div>
            <div class="text-muted" style="font-size: 0.8rem;">${order.ngayDat}</div>
          </td>
          <td>
            <div class="fw-medium">${order.tenNguoiNhan}</div>
            <div class="text-muted" style="font-size: 0.8rem;">SĐT: ${order.sdt}</div>
            <div class="text-muted" style="font-size: 0.8rem;">${FormatHelper.truncate(order.diaChi, 30)}</div>
          </td>
          <td>
            ${shopItems.map(item => `
              <div style="font-size: 0.85rem; margin-bottom: 3px;">
                • ${item.ten} <b class="text-primary">(x${item.soLuong})</b>
              </div>
            `).join("")}
          </td>
          <td>
            <span class="text-primary fw-bold">${FormatHelper.formatVND(shopOrderTotal)}</span>
          </td>
          <td>
            ${statusBadges[order.trangThai] || statusBadges.ChoXacNhan}
          </td>
          <td>
            <div class="seller-order-actions">
              ${controller.renderOrderActionButtons(order)}
            </div>
          </td>
        </tr>
      `;
    }).join("");
  
  },
  renderOrderActionButtons(controller, order) {
    if (order.trangThai === "ChoXacNhan") {
      return `
        <button type="button" class="btn btn-status-action btn-primary btn-advance-order" data-id="${order.orderId}" data-target="DangChuanBi">
          <i class="fa-solid fa-check"></i> Xác nhận đơn
        </button>
      `;
    } else if (order.trangThai === "DangChuanBi") {
      return `
        <button type="button" class="btn btn-status-action btn-outline btn-advance-order" style="background: #e3f2fd; color: #0d47a1; border-color: #90caf9;" data-id="${order.orderId}" data-target="DangGiao">
          <i class="fa-solid fa-truck"></i> Giao hàng
        </button>
      `;
    } else if (order.trangThai === "DangGiao") {
      return `
        <button type="button" class="btn btn-status-action btn-outline btn-advance-order" style="background: #e8f5e9; color: #1b5e20; border-color: #a5d6a7;" data-id="${order.orderId}" data-target="DaGiao">
          <i class="fa-solid fa-box-open"></i> Hoàn thành đơn
        </button>
      `;
    } else if (order.trangThai === "DaGiao") {
      return `<span class="text-muted" style="font-size: 0.82rem;"><i class="fa-solid fa-circle-check text-success"></i> Đã hoàn tất</span>`;
    } else {
      return `<span class="text-muted" style="font-size: 0.82rem;">Đơn đã hủy</span>`;
    }
  
  }
};
