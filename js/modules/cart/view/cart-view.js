/** View module: render giao diện và cập nhật phần tử DOM. */
const CartView = {
  renderCartTable(controller) {
    const listContainer = document.getElementById("cart-items-container");
    const emptyContainer = document.getElementById("cart-empty-state");
    const checkoutSection = document.getElementById("checkout-section");

    if (!listContainer) return;

    const detailedCart = CartService.getDetailedCart();

    if (detailedCart.length === 0) {
      listContainer.innerHTML = "";
      if (emptyContainer) emptyContainer.classList.remove("d-none");
      if (checkoutSection) checkoutSection.classList.add("d-none");
      return;
    }

    if (emptyContainer) emptyContainer.classList.add("d-none");
    if (checkoutSection) checkoutSection.classList.remove("d-none");

    // Mặc định chọn tất cả nếu chưa chọn gì
    if (controller.selectedItems.length === 0) {
      controller.selectedItems = detailedCart.map(item => item.productId);
    }

    listContainer.innerHTML = detailedCart.map(item => {
      const p = item.product;
      const isChecked = controller.selectedItems.includes(item.productId);
      const rowTotal = item.donGia * item.soLuong;

      return `
        <div class="cart-item-row" data-id="${item.productId}">
          <div>
            <input type="checkbox" class="cart-checkbox item-checkbox" value="${item.productId}" ${isChecked ? 'checked' : ''}>
          </div>
          
          <div class="cart-product-cell">
            <img src="${p.anhChinh}" alt="${p.ten}" class="cart-item-thumb">
            <div>
              <a href="chitietsanpham.html?id=${p.id}" class="cart-item-title">${p.ten}</a>
              <div class="text-muted mt-1" style="font-size: 0.78rem;">Shop: ${p.tenShop || 'Cửa hàng sinh viên'}</div>
            </div>
          </div>

          <div class="cart-price-cell">
            ${FormatHelper.formatVND(item.donGia)}
          </div>

          <div>
            <div class="quantity-controller">
              <button type="button" class="quantity-btn btn-cart-qty-minus" data-id="${item.productId}">-</button>
              <input type="text" class="quantity-input cart-qty-input" value="${item.soLuong}" data-id="${item.productId}" readonly>
              <button type="button" class="quantity-btn btn-cart-qty-plus" data-id="${item.productId}">+</button>
            </div>
          </div>

          <div class="cart-total-cell">
            ${FormatHelper.formatVND(rowTotal)}
          </div>

          <div>
            <span class="cart-action-cell btn-remove-cart-item" data-id="${item.productId}" title="Xóa món này">
              <i class="fa-regular fa-trash-can"></i> Xóa
            </span>
          </div>
        </div>
      `;
    }).join("");

    controller.updateSelectAllCheckbox();
  
  },
  updateSelectAllCheckbox(controller) {
    const selectAllCheckbox = document.getElementById("select-all-cart");
    const itemCheckboxes = document.querySelectorAll(".item-checkbox");
    if (selectAllCheckbox && itemCheckboxes.length > 0) {
      selectAllCheckbox.checked = itemCheckboxes.length === controller.selectedItems.length;
    }
  
  },
  updateCalculation(controller) {
    const detailedCart = CartService.getDetailedCart();
    let subtotal = 0;

    detailedCart.forEach(item => {
      if (controller.selectedItems.includes(item.productId)) {
        subtotal += item.donGia * item.soLuong;
      }
    });

    // Nếu không chọn món nào thì không giảm giá
    const actualDiscount = controller.selectedItems.length > 0 ? Math.min(controller.discountAmount, subtotal) : 0;
    const finalTotal = Math.max(0, subtotal - actualDiscount);

    const subtotalEl = document.getElementById("summary-subtotal");
    const discountEl = document.getElementById("summary-discount");
    const totalEl = document.getElementById("summary-final-total");
    const selectedCountEl = document.getElementById("selected-items-count");

    if (subtotalEl) subtotalEl.textContent = FormatHelper.formatVND(subtotal);
    if (discountEl) discountEl.textContent = `-${FormatHelper.formatVND(actualDiscount)}`;
    if (totalEl) totalEl.textContent = FormatHelper.formatVND(finalTotal);
    if (selectedCountEl) selectedCountEl.textContent = `${controller.selectedItems.length} món`;

    // Cập nhật số tiền trong Modal QR Code nếu đang mở
    const qrAmountText = document.getElementById("qr-transfer-amount");
    if (qrAmountText) qrAmountText.textContent = FormatHelper.formatVND(finalTotal);

    return { subtotal, discount: actualDiscount, finalTotal };
  
  },
  openQrModal(controller) {
    const modal = document.getElementById("qr-payment-modal");
    const { finalTotal } = controller.updateCalculation();
    if (!modal) return;

    const qrImg = document.getElementById("vietqr-image");
    const contentText = document.getElementById("qr-transfer-content");

    const user = UserService.getCurrentUser();
    const memo = `EDUSHOP ${user ? (user.mssv || user.username) : 'SV2026'}`;

    if (contentText) contentText.textContent = memo;

    // Tạo ảnh QR mô phỏng trực quan
    if (qrImg) {
      qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=247-EDUSHOPAY-${finalTotal}-${memo}`;
    }

    modal.classList.add("active");
  
  }
};
