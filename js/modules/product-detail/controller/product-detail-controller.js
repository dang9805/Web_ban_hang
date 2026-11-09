/**
 * ==============================================================================
 * SHOPEE EDU-MARKETPLACE - PRODUCT DETAIL LOGIC (js/detail.js)
 * Chức năng: Chi tiết sản phẩm, Gallery ảnh, Bộ chọn số lượng, Thêm giỏ hàng,
 *            Wishlist, Gửi đánh giá sao & Render bình luận trực tiếp
 * ==============================================================================
 */

document.addEventListener("DOMContentLoaded", () => {
  ProductDetailController.init();
});

const ProductDetailController = {
  productId: null,
  product: null,
  quantity: 1,
  selectedRating: 5,
  currentReviewFilter: 0, // 0: Tất cả, 1-5: Theo số sao

  init() {
    const params = new URLSearchParams(window.location.search);
    this.productId = params.get("id");

    if (!this.productId) {
      this.renderNotFound();
      return;
    }

    this.product = ProductService.getById(this.productId);
    if (!this.product) {
      this.renderNotFound();
      return;
    }

    this.renderHeroSection();
    this.renderShopInfo();
    this.renderSpecifications();
    this.renderDescription();
    this.renderReviewsSection();
    this.renderTopProducts();
    this.bindEvents();
  },

  renderNotFound() {
    return ProductDetailView.renderNotFound(this);
  },

  /**
   * Render nửa trên: Hero Box (Ảnh, Giá, Tồn kho, Nút mua)
   */
  renderHeroSection() {
    return ProductDetailView.renderHeroSection(this);
  },

  /**
   * Render thông tin người bán (Shop)
   */
  renderShopInfo() {
    return ProductDetailView.renderShopInfo(this);
  },

  /**
   * Render bảng thông số kỹ thuật
   */
  renderSpecifications() {
    return ProductDetailView.renderSpecifications(this);
  },

  /**
   * Render mô tả chi tiết sản phẩm
   */
  renderDescription() {
    return ProductDetailView.renderDescription(this);
  },

  /**
   * Render khu vực đánh giá (Reviews & Form)
   */
  renderReviewsSection() {
    return ProductDetailView.renderReviewsSection(this);
  },

  /**
   * Render top sản phẩm nổi bật ở cột phụ bên phải
   */
  renderTopProducts() {
    return ProductDetailView.renderTopProducts(this);
  },

  /**
   * Đăng ký các sự kiện tương tác
   */
  bindEvents() {
    // 1. Click đổi ảnh lớn qua thumbnail
    document.addEventListener("click", (e) => {
      const thumb = e.target.closest(".gallery-thumb");
      if (thumb) {
        document.querySelectorAll(".gallery-thumb").forEach(t => t.classList.remove("active"));
        thumb.classList.add("active");
        const newSrc = thumb.dataset.src;
        const mainImg = document.getElementById("main-product-image");
        if (mainImg) mainImg.src = newSrc;
      }
    });

    // 2. Tăng giảm số lượng mua
    const btnMinus = document.getElementById("btn-qty-minus");
    const btnPlus = document.getElementById("btn-qty-plus");
    const inputQty = document.getElementById("product-quantity-input");

    if (btnMinus && btnPlus && inputQty) {
      btnMinus.addEventListener("click", () => {
        if (this.product.soLuongTon <= 0) return;
        let val = Number(inputQty.value) || 1;
        if (val > 1) {
          val--;
          inputQty.value = val;
          this.quantity = val;
        }
      });

      btnPlus.addEventListener("click", () => {
        if (this.product.soLuongTon <= 0) return;
        let val = Number(inputQty.value) || 1;
        if (val < this.product.soLuongTon) {
          val++;
          inputQty.value = val;
          this.quantity = val;
        } else {
          Toast.warning("Giới hạn tồn kho", `Chỉ còn ${this.product.soLuongTon} sản phẩm có sẵn!`);
        }
      });

      inputQty.addEventListener("change", () => {
        let val = parseInt(inputQty.value, 10);
        if (isNaN(val) || val < 1) val = 1;
        if (val > this.product.soLuongTon) {
          val = this.product.soLuongTon;
          Toast.warning("Giới hạn tồn kho", `Chỉ còn ${this.product.soLuongTon} sản phẩm có sẵn!`);
        }
        inputQty.value = val;
        this.quantity = val;
      });
    }

    // 3. Thêm vào giỏ hàng
    const btnAddToCart = document.getElementById("btn-add-to-cart");
    if (btnAddToCart) {
      btnAddToCart.addEventListener("click", () => {
        if (this.product.soLuongTon <= 0) {
          Toast.error("Hết hàng", "Sản phẩm hiện đang tạm hết hàng!");
          return;
        }
        const res = CartService.addToCart(this.product.id, this.quantity);
        if (res.success) {
          Toast.success("Thành công", res.message);
          HeaderController.updateCartBadge();
          HeaderController.renderMiniCart();
        } else {
          Toast.warning("Không thể thêm", res.message);
        }
      });
    }

    // 4. Mua ngay (Thêm giỏ và chuyển thẳng sang giỏ hàng)
    const btnBuyNow = document.getElementById("btn-buy-now");
    if (btnBuyNow) {
      btnBuyNow.addEventListener("click", () => {
        if (this.product.soLuongTon <= 0) {
          Toast.error("Hết hàng", "Sản phẩm hiện đang tạm hết hàng!");
          return;
        }
        const res = CartService.addToCart(this.product.id, this.quantity);
        if (res.success) {
          window.location.href = "giohang.html";
        } else {
          Toast.warning("Không thể mua", res.message);
        }
      });
    }

    // 5. Nút Thả tim (Wishlist)
    const btnWishlist = document.getElementById("btn-wishlist-toggle");
    if (btnWishlist) {
      btnWishlist.addEventListener("click", () => {
        const res = WishlistService.toggle(this.product.id);
        btnWishlist.classList.toggle("active", res.isAdded);
        btnWishlist.innerHTML = `
          <i class="${res.isAdded ? 'fa-solid' : 'fa-regular'} fa-heart"></i>
          <span>${res.isAdded ? 'Đã thích' : 'Yêu thích'}</span>
        `;
        if (res.isAdded) {
          Toast.success("Đã thích", "Đã lưu sản phẩm vào danh sách Yêu thích của bạn!");
        } else {
          Toast.info("Đã bỏ thích", "Đã xóa sản phẩm khỏi danh sách Yêu thích!");
        }
      });
    }

    // 6. Chọn số sao đánh giá trong form
    const starPicker = document.getElementById("star-rating-picker");
    if (starPicker) {
      const stars = starPicker.querySelectorAll("i");
      stars.forEach(star => {
        star.addEventListener("click", (e) => {
          const starVal = Number(e.currentTarget.dataset.val);
          this.selectedRating = starVal;
          stars.forEach(s => {
            const sVal = Number(s.dataset.val);
            s.classList.toggle("active", sVal <= starVal);
          });
        });
      });
    }

    // 7. Gửi form đánh giá
    const btnSubmitReview = document.getElementById("btn-submit-review");
    const reviewInput = document.getElementById("review-comment-input");

    if (btnSubmitReview && reviewInput) {
      btnSubmitReview.addEventListener("click", () => {
        const comment = reviewInput.value.trim();
        if (!comment) {
          Toast.warning("Thiếu nội dung", "Vui lòng nhập lời nhận xét của bạn!");
          reviewInput.focus();
          return;
        }

        const currentUser = UserService.getCurrentUser();
        const userName = currentUser ? currentUser.hoTen : "Sinh viên ẩn danh";
        const userId = currentUser ? currentUser.id : "guest";

        ReviewService.addReview({
          productId: this.product.id,
          userId: userId,
          userName: userName,
          soSao: this.selectedRating,
          binhLuan: comment
        });

        reviewInput.value = "";
        Toast.success("Đánh giá thành công", "Cảm ơn bạn đã đóng góp nhận xét cho sản phẩm này!");
        this.renderReviewsSection();
      });
    }

    // 8. Lọc đánh giá theo số sao
    document.querySelectorAll(".review-filter-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        document.querySelectorAll(".review-filter-btn").forEach(b => b.classList.remove("active"));
        const target = e.currentTarget;
        target.classList.add("active");
        this.currentReviewFilter = Number(target.dataset.star);
        this.renderReviewsSection();
      });
    });
  }
};

