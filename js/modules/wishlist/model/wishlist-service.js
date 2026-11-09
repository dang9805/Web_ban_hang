// 6. Dịch vụ Yêu thích (Wishlist)
const WishlistService = {
  getWishlist() {
    return Storage.get("wishlist", []);
  },

  toggle(productId) {
    let wishlist = this.getWishlist();
    let isAdded = false;

    if (wishlist.includes(productId)) {
      wishlist = wishlist.filter(id => id !== productId);
      isAdded = false;
    } else {
      wishlist.push(productId);
      isAdded = true;
    }

    Storage.set("wishlist", wishlist);
    return { success: true, isAdded, count: wishlist.length };
  },

  isWishlisted(productId) {
    const wishlist = this.getWishlist();
    return wishlist.includes(productId);
  },

  getDetailedWishlist() {
    const wishlist = this.getWishlist();
    return wishlist.map(id => ProductService.getById(id)).filter(p => p !== null);
  }
};
