/** View module: render giao diện và cập nhật phần tử DOM. */
const ProductDetailView = {
  renderNotFound(controller) {
    const container = document.getElementById("product-detail-container");
    if (container) {
      container.innerHTML = `
        <div class="empty-state">
          <i class="fa-solid fa-triangle-exclamation empty-state-icon"></i>
          <div class="empty-state-title">Sản phẩm không tồn tại hoặc đã bị xóa</div>
          <p class="empty-state-desc">Rất tiếc, món đồ bạn đang tìm kiếm hiện không có trên sàn sinh viên.</p>
          <a href="danhsachsanpham.html" class="btn btn-primary">Khám phá sản phẩm khác</a>
        </div>
      `;
    }
  
  },
  renderHeroSection(controller) {
    const p = controller.product;
    const discount = FormatHelper.calculateDiscountPercent(p.gia, p.giaGoc);
    const isSoldOut = p.soLuongTon <= 0;
    const avgRating = ReviewService.getAverageRating(p.id);
    const reviews = ReviewService.getByProduct(p.id);
    const isWish = WishlistService.isWishlisted(p.id);

    // Cập nhật Breadcrumb
    const breadcrumbCat = document.getElementById("breadcrumb-category");
    const breadcrumbTitle = document.getElementById("breadcrumb-title");
    if (breadcrumbCat) {
      const cat = CategoryService.getById(p.danhMuc);
      breadcrumbCat.textContent = cat ? cat.ten : "Danh mục";
      breadcrumbCat.href = `danhsachsanpham.html?cat=${p.danhMuc}`;
    }
    if (breadcrumbTitle) breadcrumbTitle.textContent = FormatHelper.truncate(p.ten, 45);

    // Render Gallery
    const galleryMain = document.getElementById("gallery-main-container");
    if (galleryMain) {
      galleryMain.innerHTML = `
        <img id="main-product-image" src="${p.anhChinh}" alt="${p.ten}" class="product-gallery-main-img">
        ${isSoldOut ? `
          <div class="product-card-sold-out">
            <span class="product-card-sold-out-badge">HẾT HÀNG</span>
          </div>
        ` : ""}
      `;
    }

    const thumbsContainer = document.getElementById("gallery-thumbs-container");
    if (thumbsContainer) {
      const allImages = [p.anhChinh, ...(p.anhPhu || [])];
      // Loại bỏ ảnh trùng lặp
      const uniqueImages = [...new Set(allImages)];

      thumbsContainer.innerHTML = uniqueImages.map((imgUrl, index) => `
        <div class="gallery-thumb ${index === 0 ? 'active' : ''}" data-src="${imgUrl}">
          <img src="${imgUrl}" alt="Ảnh thu nhỏ ${index + 1}">
        </div>
      `).join("");
    }

    // Render Wishlist Button State
    const wishlistBtn = document.getElementById("btn-wishlist-toggle");
    if (wishlistBtn) {
      wishlistBtn.classList.toggle("active", isWish);
      wishlistBtn.innerHTML = `
        <i class="${isWish ? 'fa-solid' : 'fa-regular'} fa-heart"></i>
        <span>${isWish ? 'Đã thích' : 'Yêu thích'}</span>
      `;
    }

    // Render Tiêu đề & Đánh giá
    const titleEl = document.getElementById("detail-product-title");
    if (titleEl) titleEl.textContent = p.ten;

    const ratingScoreEl = document.getElementById("detail-rating-score");
    if (ratingScoreEl) ratingScoreEl.textContent = avgRating;

    const reviewCountEl = document.getElementById("detail-review-count");
    if (reviewCountEl) reviewCountEl.textContent = reviews.length;

    const soldCountEl = document.getElementById("detail-sold-count");
    if (soldCountEl) soldCountEl.textContent = p.daBan >= 1000 ? (p.daBan / 1000).toFixed(1) + 'k' : p.daBan;

    // Render Giá
    const priceCurrentEl = document.getElementById("detail-price-current");
    if (priceCurrentEl) priceCurrentEl.textContent = FormatHelper.formatVND(p.gia);

    const priceOriginalEl = document.getElementById("detail-price-original");
    if (priceOriginalEl) {
      if (p.giaGoc && p.giaGoc > p.gia) {
        priceOriginalEl.textContent = FormatHelper.formatVND(p.giaGoc);
        priceOriginalEl.style.display = "inline";
      } else {
        priceOriginalEl.style.display = "none";
      }
    }

    const discountPillEl = document.getElementById("detail-discount-pill");
    if (discountPillEl) {
      if (discount > 0) {
        discountPillEl.textContent = `-${discount}% GIẢM`;
        discountPillEl.style.display = "inline-block";
      } else {
        discountPillEl.style.display = "none";
      }
    }

    // Render Tồn kho
    const stockEl = document.getElementById("detail-stock-count");
    if (stockEl) {
      stockEl.textContent = `${p.soLuongTon} sản phẩm có sẵn`;
      if (isSoldOut) {
        stockEl.textContent = "Hiện đã hết hàng";
        stockEl.classList.add("text-danger");
      }
    }

    // Vô hiệu hóa nút mua nếu hết hàng
    const btnAddToCart = document.getElementById("btn-add-to-cart");
    const btnBuyNow = document.getElementById("btn-buy-now");
    const quantityInput = document.getElementById("product-quantity-input");

    if (isSoldOut) {
      if (btnAddToCart) {
        btnAddToCart.disabled = true;
        btnAddToCart.classList.add("btn-disabled");
      }
      if (btnBuyNow) {
        btnBuyNow.disabled = true;
        btnBuyNow.classList.add("btn-disabled");
      }
      if (quantityInput) quantityInput.value = 0;
    }
  
  },
  renderShopInfo(controller) {
    const p = controller.product;
    const shopNameEl = document.getElementById("shop-name");
    const shopLocationEl = document.getElementById("shop-location");
    if (shopNameEl) shopNameEl.textContent = p.tenShop;
    if (shopLocationEl) shopLocationEl.textContent = p.diaDiem || "Ký túc xá Đại học";

    const btnViewShop = document.getElementById("btn-view-shop");
    if (btnViewShop) {
      btnViewShop.href = `danhsachsanpham.html?search=${encodeURIComponent(p.tenShop)}`;
    }
  
  },
  renderSpecifications(controller) {
    const p = controller.product;
    const cat = CategoryService.getById(p.danhMuc);

    const specsTable = document.getElementById("specs-table-body");
    if (!specsTable) return;

    specsTable.innerHTML = `
      <tr>
        <td class="specs-label">Danh Mục</td>
        <td class="specs-value">
          <a href="danhsachsanpham.html?cat=${p.danhMuc}" class="text-primary">${cat ? cat.ten : p.danhMuc}</a>
        </td>
      </tr>
      <tr>
        <td class="specs-label">Thương Hiệu</td>
        <td class="specs-value">${p.thuongHieu || "Chính hãng"}</td>
      </tr>
      <tr>
        <td class="specs-label">Xuất Xứ</td>
        <td class="specs-value">${p.xuatXu || "Việt Nam"}</td>
      </tr>
      <tr>
        <td class="specs-label">Tình Trạng</td>
        <td class="specs-value">${p.tinhTrang || "Mới 100%"}</td>
      </tr>
      <tr>
        <td class="specs-label">Kho Hàng Còn</td>
        <td class="specs-value">${p.soLuongTon} món</td>
      </tr>
      <tr>
        <td class="specs-label">Gửi Từ</td>
        <td class="specs-value">${p.diaDiem || "Khuôn viên trường ĐH"}</td>
      </tr>
    `;
  
  },
  renderDescription(controller) {
    const descContent = document.getElementById("product-description-text");
    if (descContent) {
      descContent.textContent = controller.product.moTa;
    }
  
  },
  renderReviewsSection(controller) {
    const reviews = ReviewService.getByProduct(controller.productId);
    const avgRating = ReviewService.getAverageRating(controller.productId);

    // Điểm số tổng quát
    const overviewScore = document.getElementById("review-overview-score");
    if (overviewScore) overviewScore.textContent = avgRating;

    // Danh sách bình luận
    const reviewsList = document.getElementById("reviews-list-container");
    if (!reviewsList) return;

    let filtered = [...reviews];
    if (controller.currentReviewFilter > 0) {
      filtered = filtered.filter(r => Number(r.soSao) === controller.currentReviewFilter);
    }

    if (filtered.length === 0) {
      reviewsList.innerHTML = `
        <div class="empty-state py-4">
          <i class="fa-regular fa-comment-dots" style="font-size: 2.5rem; color: #ccc;"></i>
          <p class="text-muted mt-2">Chưa có bình luận đánh giá nào cho phân loại này.</p>
        </div>
      `;
      return;
    }

    reviewsList.innerHTML = filtered.map(r => `
      <div class="review-item">
        <img class="reviewer-avatar" src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80" alt="${r.userName}">
        <div class="reviewer-info">
          <div class="reviewer-name">${r.userName}</div>
          <div class="reviewer-stars">
            ${Array.from({ length: 5 }).map((_, i) => `
              <i class="fa-solid fa-star" style="color: ${i < r.soSao ? 'var(--shopee-yellow)' : '#ddd'};"></i>
            `).join("")}
          </div>
          <div class="review-date">${r.ngayDanhGia} | Phân loại: Chuẩn sinh viên</div>
          <div class="review-comment">${r.binhLuan}</div>
        </div>
      </div>
    `).join("");
  
  },
  renderTopProducts(controller) {
    const container = document.getElementById("top-products-list");
    if (!container) return;

    const all = ProductService.getAll().filter(p => p.id !== controller.productId);
    const topItems = all.slice(0, 4);

    container.innerHTML = topItems.map(p => `
      <a href="chitietsanpham.html?id=${p.id}" class="d-flex gap-3 align-start" style="padding-bottom: 10px; border-bottom: 1px solid var(--border-light);">
        <img src="${p.anhChinh}" alt="${p.ten}" style="width: 70px; height: 70px; object-fit: cover; border-radius: 2px;">
        <div class="flex-1">
          <div style="font-size: 0.85rem; font-weight: 500; line-height: 1.3; color: var(--text-main); margin-bottom: 4px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
            ${p.ten}
          </div>
          <div style="color: var(--shopee-primary); font-weight: 700; font-size: 0.95rem;">
            ${FormatHelper.formatVND(p.gia)}
          </div>
        </div>
      </a>
    `).join("");
  
  }
};
