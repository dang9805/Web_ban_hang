 ==============================================================================
// 3. COMMON PRODUCT CARD RENDERER (CLEAN & MODERN)
// ==============================================================================
const ProductCardRenderer = {
  renderCard(product) {
    const discount = FormatHelper.calculateDiscountPercent(product.gia, product.giaGoc);
    const isSoldOut = product.soLuongTon <= 0;

    return `
      <div class="product-card" data-id="${product.id}">
        <a href="chitietsanpham.html?id=${product.id}" class="product-card-thumb-wrap">
          <img src="${product.anhChinh}" alt="${product.ten}" class="product-card-thumb" loading="lazy">

          ${discount > 0 ? `
            <div class="product-card-badge-discount">
              -${discount}%
            </div>
          ` : ""}

          ${isSoldOut ? `
            <div class="product-card-sold-out">
              <span class="product-card-sold-out-badge">HẾT HÀNG</span>
            </div>
          ` : ""}
        </a>

        <div class="product-card-body">
          <a href="chitietsanpham.html?id=${product.id}" class="product-card-title" title="${product.ten}">
            ${product.ten}
          </a>

          <div class="product-card-footer">
            <div class="product-card-price-row">
              <span class="product-card-price">${FormatHelper.formatVND(product.gia)}</span>
              ${product.giaGoc ? `<span class="product-card-old-price">${FormatHelper.formatVND(product.giaGoc)}</span>` : ""}
            </div>

            <div class="product-card-meta">
              <div class="product-card-rating">
                <i class="fa-solid fa-star"></i>
                <span>4.8</span>
              </div>
              <div class="text-muted">
                Đã bán ${product.daBan || 0}
              </div>
            </div>

            <div class="product-card-shop">
              <i class="fa-solid fa-store" style="font-size: 0.72rem; margin-right: 4px;"></i>
              <span>${product.tenShop}</span>
            </div>
          </div>
        </div>
      </div>
    `;
  }
};

