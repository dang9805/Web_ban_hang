/** Controller của module danh sách yêu thích. */
document.addEventListener("DOMContentLoaded", () => {
  WishlistView.render();
  document.addEventListener("click", event => {
    const button = event.target.closest(".btn-remove-wishlist");
    if (!button) return;
    WishlistService.toggle(button.dataset.id);
    Toast.info("Đã gỡ", "Đã xóa món đồ khỏi danh sách lưu!");
    WishlistView.render();
  });
});