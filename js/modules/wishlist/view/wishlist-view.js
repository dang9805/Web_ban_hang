/** View của module danh sách yêu thích. */
const WishlistView = {
  render() {
    const grid = document.getElementById("wishlist-grid");
    const empty = document.getElementById("wishlist-empty");
    const countBadge = document.getElementById("wishlist-count-badge");
    if (!grid) return;
    const items = WishlistService.getDetailedWishlist();
    if (countBadge) countBadge.textContent = `${items.length} món đồ`;
    if (items.length === 0) {
      grid.innerHTML = "";
      if (empty) empty.classList.remove("d-none");
      return;
    }
    if (empty) empty.classList.add("d-none");
    grid.innerHTML = items.map(product => `
      <div class="wishlist-card-wrap">
        <button type="button" class="btn-remove-wishlist" data-id="${product.id}" title="Xóa món này"><i class="fa-solid fa-xmark"></i></button>
        ${ProductCardRenderer.renderCard(product)}
      </div>
    `).join("");
  }
};