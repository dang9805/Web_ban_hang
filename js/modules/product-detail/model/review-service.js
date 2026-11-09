// 5. Dịch vụ Đánh giá (Reviews)
const ReviewService = {
  getAll() {
    return Storage.get("reviews", []);
  },

  getByProduct(productId) {
    const reviews = this.getAll();
    return reviews.filter(r => r.productId === productId);
  },

  addReview(reviewData) {
    const reviews = this.getAll();
    const newReview = {
      id: "REV-" + Date.now(),
      ngayDanhGia: new Date().toISOString().split("T")[0],
      ...reviewData
    };
    reviews.unshift(newReview);
    Storage.set("reviews", reviews);
    return newReview;
  },

  getAverageRating(productId) {
    const reviews = this.getByProduct(productId);
    if (reviews.length === 0) return 5.0; // Mặc định 5 sao nếu chưa ai đánh giá
    const total = reviews.reduce((sum, r) => sum + Number(r.soSao), 0);
    return (total / reviews.length).toFixed(1);
  }
};
