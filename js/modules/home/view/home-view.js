/** View của module trang chủ: danh mục và sản phẩm gợi ý. */
const HomeView = {
  renderCategories() {
    const container = document.getElementById("category-grid-container");
    if (!container) return;
    const categories = CategoryService.getAll();
    container.innerHTML = categories.map(cat => `
      <a href="danhsachsanpham.html?cat=${cat.id}" class="category-card" title="${cat.ten}">
        <div class="category-img-wrap"><img src="${cat.hinhAnh}" alt="${cat.ten}" class="category-img" loading="lazy"></div>
        <div class="category-name">${cat.ten}</div>
        <span class="text-muted mt-1" style="font-size: 0.76rem;">Khám phá ngay</span>
      </a>
    `).join("");
  },
  renderSuggestedProducts() {
    const container = document.getElementById("suggested-products-grid");
    if (!container) return;
    container.innerHTML = ProductService.getAll().map(product => ProductCardRenderer.renderCard(product)).join("");
  }
};