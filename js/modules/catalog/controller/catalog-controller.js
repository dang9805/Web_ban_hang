/**
 * ==============================================================================
 * SHOPEE EDU-MARKETPLACE - CATALOG & SEARCH LOGIC (js/catalog.js)
 * Chức năng: Tìm kiếm từ khóa, Lọc đa tiêu chí theo Danh mục, Giá, Sắp xếp
 * ==============================================================================
 */

document.addEventListener("DOMContentLoaded", () => {
  Storage.ready.then(() => CatalogController.init());
});

const CatalogController = {
  products: [],
  filteredProducts: [],
  currentPage: 1,
  pageSize: 8,
  currentSort: "popular", // "popular" | "newest" | "bestseller" | "price-asc" | "price-desc"

  init() {
    this.products = ProductService.getAll();
    this.renderCategoryFilters();
    this.bindEvents();
    this.parseUrlParams();
  },

  /**
   * Đọc các tham số tìm kiếm hoặc danh mục từ URL (query parameters)
   */
  parseUrlParams() {
    const params = new URLSearchParams(window.location.search);
    const searchParam = params.get("search");
    const catParam = params.get("cat");

    if (searchParam) {
      const searchInput = document.getElementById("header-search-input");
      if (searchInput) searchInput.value = searchParam;
    }

    if (catParam) {
      const checkbox = document.querySelector(`.cat-filter-checkbox[value="${catParam}"]`);
      if (checkbox) checkbox.checked = true;
    }

    this.applyFilters();
  },

  /**
   * Sinh danh sách checkbox bộ lọc danh mục
   */
  renderCategoryFilters() {
    return CatalogView.renderCategoryFilters(this);
  },

  /**
   * Lắng nghe các sự kiện lọc, sắp xếp, phân trang
   */
  bindEvents() {
    // Sự kiện tick chọn danh mục
    document.addEventListener("change", (e) => {
      if (e.target.classList.contains("cat-filter-checkbox")) {
        this.currentPage = 1;
        this.applyFilters();
      }
    });

    // Sự kiện bấm nút áp dụng khoảng giá
    const btnApplyPrice = document.getElementById("btn-apply-price");
    if (btnApplyPrice) {
      btnApplyPrice.addEventListener("click", () => {
        this.currentPage = 1;
        this.applyFilters();
      });
    }

    // Sự kiện xóa tất cả bộ lọc
    const btnResetFilter = document.getElementById("btn-reset-filter");
    if (btnResetFilter) {
      btnResetFilter.addEventListener("click", () => {
        document.querySelectorAll(".cat-filter-checkbox").forEach(cb => cb.checked = false);
        const minPriceInput = document.getElementById("filter-min-price");
        const maxPriceInput = document.getElementById("filter-max-price");
        if (minPriceInput) minPriceInput.value = "";
        if (maxPriceInput) maxPriceInput.value = "";
        
        const searchInput = document.getElementById("header-search-input");
        if (searchInput) searchInput.value = "";

        // Xóa query param trên url
        window.history.pushState({}, "", window.location.pathname);

        this.currentPage = 1;
        this.applyFilters();
        Toast.info("Đã đặt lại", "Đã xóa toàn bộ bộ lọc tìm kiếm");
      });
    }

    // Sự kiện nút sắp xếp
    document.querySelectorAll(".sort-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        document.querySelectorAll(".sort-btn").forEach(b => b.classList.remove("active"));
        const targetBtn = e.currentTarget;
        targetBtn.classList.add("active");
        this.currentSort = targetBtn.dataset.sort;
        
        // Reset dropdown giá về mặc định nếu bấm các nút khác
        const sortSelect = document.getElementById("sort-price-select");
        if (sortSelect) sortSelect.value = "";

        this.applyFilters();
      });
    });

    // Dropdown sắp xếp theo giá
    const sortSelect = document.getElementById("sort-price-select");
    if (sortSelect) {
      sortSelect.addEventListener("change", (e) => {
        if (e.target.value) {
          document.querySelectorAll(".sort-btn").forEach(b => b.classList.remove("active"));
          this.currentSort = e.target.value;
          this.applyFilters();
        }
      });
    }
  },

  /**
   * Áp dụng tất cả các bộ lọc và cập nhật danh sách hiển thị
   */
  applyFilters() {
    let result = [...this.products];

    // 1. Lọc theo từ khóa tìm kiếm (tên, mô tả, thương hiệu)
    const params = new URLSearchParams(window.location.search);
    const searchKeyword = (params.get("search") || "").trim().toLowerCase();
    if (searchKeyword) {
      result = result.filter(p => 
        p.ten.toLowerCase().includes(searchKeyword) ||
        p.moTa.toLowerCase().includes(searchKeyword) ||
        (p.thuongHieu && p.thuongHieu.toLowerCase().includes(searchKeyword))
      );
    }

    // 2. Lọc theo danh mục (nếu có checkbox được tích)
    const checkedCats = Array.from(document.querySelectorAll(".cat-filter-checkbox:checked")).map(cb => cb.value);
    if (checkedCats.length > 0) {
      result = result.filter(p => checkedCats.includes(p.danhMuc));
    }

    // 3. Lọc theo khoảng giá
    const minPriceInput = document.getElementById("filter-min-price");
    const maxPriceInput = document.getElementById("filter-max-price");
    const minVal = minPriceInput && minPriceInput.value ? Number(minPriceInput.value) : 0;
    const maxVal = maxPriceInput && maxPriceInput.value ? Number(maxPriceInput.value) : Infinity;

    if (minVal > 0) {
      result = result.filter(p => p.gia >= minVal);
    }
    if (maxVal < Infinity) {
      result = result.filter(p => p.gia <= maxVal);
    }

    // 4. Sắp xếp kết quả
    if (this.currentSort === "popular") {
      result.sort((a, b) => (b.daBan || 0) - (a.daBan || 0));
    } else if (this.currentSort === "newest") {
      result.sort((a, b) => new Date(b.ngayDang) - new Date(a.ngayDang));
    } else if (this.currentSort === "bestseller") {
      result.sort((a, b) => (b.daBan || 0) - (a.daBan || 0));
    } else if (this.currentSort === "price-asc") {
      result.sort((a, b) => a.gia - b.gia);
    } else if (this.currentSort === "price-desc") {
      result.sort((a, b) => b.gia - a.gia);
    }

    this.filteredProducts = result;
    this.renderProducts();
    this.renderPagination();
  },

  /**
   * Render lưới sản phẩm ra giao diện
   */
  renderProducts() {
    return CatalogView.renderProducts(this);
  },

  /**
   * Render các nút phân trang
   */
  renderPagination() {
    return CatalogView.renderPagination(this);
  }
};

