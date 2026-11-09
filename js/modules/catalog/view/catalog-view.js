/** View module: render giao diện và cập nhật phần tử DOM. */
const CatalogView = {
  renderCategoryFilters(controller) {
    const container = document.getElementById("category-filter-list");
    if (!container) return;

    const categories = CategoryService.getAll();
    container.innerHTML = categories.map(cat => `
      <label class="filter-checkbox-label">
        <input type="checkbox" class="cat-filter-checkbox" value="${cat.id}">
        <span>${cat.ten}</span>
      </label>
    `).join("");
  
  },
  renderProducts(controller) {
    const gridContainer = document.getElementById("catalog-grid");
    const emptyContainer = document.getElementById("catalog-empty");
    const resultCountEl = document.getElementById("catalog-result-count");

    if (!gridContainer) return;

    if (resultCountEl) {
      resultCountEl.textContent = `Tìm thấy ${controller.filteredProducts.length} sản phẩm`;
    }

    if (controller.filteredProducts.length === 0) {
      gridContainer.innerHTML = "";
      if (emptyContainer) emptyContainer.classList.remove("d-none");
      return;
    }

    if (emptyContainer) emptyContainer.classList.add("d-none");

    // Phân trang
    const startIndex = (controller.currentPage - 1) * controller.pageSize;
    const pageProducts = controller.filteredProducts.slice(startIndex, startIndex + controller.pageSize);

    gridContainer.innerHTML = pageProducts.map(p => ProductCardRenderer.renderCard(p)).join("");
  
  },
  renderPagination(controller) {
    const paginationContainer = document.getElementById("catalog-pagination");
    if (!paginationContainer) return;

    const totalPages = Math.ceil(controller.filteredProducts.length / controller.pageSize);

    if (totalPages <= 1) {
      paginationContainer.innerHTML = "";
      return;
    }

    let html = `
      <button class="page-item ${controller.currentPage === 1 ? 'disabled' : ''}" id="page-prev" ${controller.currentPage === 1 ? 'disabled' : ''}>
        <i class="fa-solid fa-angle-left"></i>
      </button>
    `;

    for (let i = 1; i <= totalPages; i++) {
      html += `
        <button class="page-item ${controller.currentPage === i ? 'active' : ''}" data-page="${i}">
          ${i}
        </button>
      `;
    }

    html += `
      <button class="page-item ${controller.currentPage === totalPages ? 'disabled' : ''}" id="page-next" ${controller.currentPage === totalPages ? 'disabled' : ''}>
        <i class="fa-solid fa-angle-right"></i>
      </button>
    `;

    paginationContainer.innerHTML = html;

    // Lắng nghe sự kiện chuyển trang
    paginationContainer.querySelectorAll(".page-item[data-page]").forEach(btn => {
      btn.addEventListener("click", (e) => {
        controller.currentPage = Number(e.currentTarget.dataset.page);
        controller.renderProducts();
        controller.renderPagination();
        window.scrollTo({ top: 120, behavior: "smooth" });
      });
    });

    const prevBtn = document.getElementById("page-prev");
    if (prevBtn && controller.currentPage > 1) {
      prevBtn.addEventListener("click", () => {
        controller.currentPage--;
        controller.renderProducts();
        controller.renderPagination();
        window.scrollTo({ top: 120, behavior: "smooth" });
      });
    }

    const nextBtn = document.getElementById("page-next");
    if (nextBtn && controller.currentPage < totalPages) {
      nextBtn.addEventListener("click", () => {
        controller.currentPage++;
        controller.renderProducts();
        controller.renderPagination();
        window.scrollTo({ top: 120, behavior: "smooth" });
      });
    }
  
  }
};
