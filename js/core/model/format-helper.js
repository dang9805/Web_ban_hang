// ==============================================================================
// FORMAT & UI HELPERS (HÀM TIỆN ÍCH ĐỊNH DẠNG DỮ LIỆU)
// ==============================================================================
const FormatHelper = {
  /**
   * Định dạng số tiền sang chuẩn VNĐ (VD: 650000 -> 650.000 đ)
   */
  formatVND(amount) {
    if (isNaN(amount) || amount === null) return "0 đ";
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount).replace("₫", "đ");
  },

  /**
   * Định dạng ngày giờ hiện tại: YYYY-MM-DD HH:mm
   */
  formatCurrentDateTime() {
    const now = new Date();
    const pad = n => String(n).padStart(2, "0");
    return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`;
  },

  /**
   * Tính phần trăm giảm giá giữa giá gốc và giá bán
   */
  calculateDiscountPercent(price, originalPrice) {
    if (!originalPrice || originalPrice <= price) return 0;
    return Math.round(((originalPrice - price) / originalPrice) * 100);
  },

  /**
   * Rút gọn chuỗi dài
   */
  truncate(str, maxLength = 60) {
    if (!str) return "";
    return str.length > maxLength ? str.slice(0, maxLength) + "..." : str;
  }
};

