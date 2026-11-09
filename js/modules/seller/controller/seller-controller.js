/**
 * ==============================================================================
 * SHOPEE EDU-MARKETPLACE - SELLER CENTER LOGIC (js/seller.js)
 * Chức năng: Dashboard KPI, Đăng bán sản phẩm mới, Quản lý kho hàng & Duyệt đơn
 * ==============================================================================
 */

document.addEventListener("DOMContentLoaded", () => {
  Storage.ready.then(() => SellerController.init());
});

const SellerController = {
  currentUser: null,
  shopProducts: [],
  shopOrders: [],

  init() {
    this.currentUser = UserService.getCurrentUser();
    if (!this.currentUser) {
      Toast.warning("Chưa đăng nhập", "Vui lòng đăng nhập tài khoản để vào Kênh Người Bán!");
      setTimeout(() => {
        window.location.href = "dangnhap.html";
      }, 1000);
      return;
    }

    this.renderShopHeader();
    this.initCategorySelect();
    this.refreshData();
    this.bindEvents();
  },

  /**
   * Tải và làm mới toàn bộ dữ liệu KPI, Sản phẩm, Đơn hàng
   */
  refreshData() {
    this.shopProducts = ProductService.getBySeller(this.currentUser.id);
    this.shopOrders = OrderService.getBySeller(this.currentUser.id);
    this.renderKPIs();
    this.renderProductTable();
    this.renderOrderTable();
  },

  /**
   * Hiển thị thông tin tên shop và chủ shop trên banner
   */
  renderShopHeader() {
    return SellerView.renderShopHeader(this);
  },

  /**
   * Nạp danh mục vào thẻ select của form đăng bán
   */
  initCategorySelect() {
    const select = document.getElementById("new-prod-category");
    if (!select) return;

    const categories = CategoryService.getAll();
    select.innerHTML = `
      <option value="">-- Chọn danh mục sản phẩm --</option>
      ${categories.map(c => `<option value="${c.id}">${c.ten}</option>`).join("")}
    `;
  },

  /**
   * Tính toán và hiển thị 4 chỉ số KPI trên Dashboard
   */
  renderKPIs() {
    return SellerView.renderKPIs(this);
  },

  /**
   * Render bảng danh sách sản phẩm của người bán
   */
  renderProductTable() {
    return SellerView.renderProductTable(this);
  },

  /**
   * Render bảng quản lý đơn hàng bán
   */
  renderOrderTable() {
    return SellerView.renderOrderTable(this);
  },

  /**
   * Tạo các nút chuyển trạng thái cho đơn hàng của người bán
   */
  renderOrderActionButtons(order) {
    return SellerView.renderOrderActionButtons(this, order);
  },

  /**
   * Đăng ký các sự kiện thao tác người bán
   */
  bindEvents() {
    // 1. Xử lý Form đăng bán sản phẩm mới
    const formNewProduct = document.getElementById("form-seller-new-product");
    if (formNewProduct) {
      formNewProduct.addEventListener("submit", (e) => {
        e.preventDefault();

        const name = document.getElementById("new-prod-name").value.trim();
        const category = document.getElementById("new-prod-category").value;
        const price = Number(document.getElementById("new-prod-price").value);
        const originalPrice = Number(document.getElementById("new-prod-original-price").value) || null;
        const stock = Number(document.getElementById("new-prod-stock").value);
        const image = document.getElementById("new-prod-image").value.trim();
        const brand = document.getElementById("new-prod-brand").value.trim() || "Chính hãng";
        const desc = document.getElementById("new-prod-desc").value.trim();

        if (!name || !category || !price || isNaN(stock) || !desc) {
          Toast.warning("Thiếu thông tin", "Vui lòng nhập đầy đủ các trường bắt buộc!");
          return;
        }

        if (price <= 0) {
          Toast.error("Giá không hợp lệ", "Giá bán phải lớn hơn 0 đ!");
          return;
        }

        // Tạo sản phẩm mới tự gán nguoiBanId = currentUser.id
        const newProduct = ProductService.create({
          ten: name,
          danhMuc: category,
          gia: price,
          giaGoc: originalPrice,
          soLuongTon: stock,
          anhChinh: image || "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80",
          anhPhu: [image || "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80"],
          nguoiBanId: this.currentUser.id,
          tenShop: this.currentUser.tenShop || "Gian hàng " + this.currentUser.hoTen,
          thuongHieu: brand,
          xuatXu: "Việt Nam",
          tinhTrang: "Mới 100%",
          moTa: desc,
          diaDiem: "Ký túc xá Đại học"
        });

        Toast.success("Đăng bán thành công", `Sản phẩm "${FormatHelper.truncate(name, 25)}" đã được đưa lên sàn!`);
        formNewProduct.reset();
        this.refreshData();
      });
    }

    // 2. Lưu sửa nhanh số lượng tồn kho
    document.addEventListener("click", (e) => {
      const btnSaveStock = e.target.closest(".btn-save-stock");
      if (btnSaveStock) {
        const id = btnSaveStock.dataset.id;
        const input = document.querySelector(`.input-quick-stock[data-id="${id}"]`);
        if (input) {
          const newQty = parseInt(input.value, 10);
          if (isNaN(newQty) || newQty < 0) {
            Toast.error("Lỗi", "Số lượng tồn kho không được âm!");
            return;
          }
          ProductService.update(id, { soLuongTon: newQty });
          Toast.success("Đã cập nhật", `Tồn kho sản phẩm đã đổi thành ${newQty} món!`);
          this.refreshData();
        }
      }

      // Xóa sản phẩm của shop
      const btnDelete = e.target.closest(".btn-delete-product");
      if (btnDelete) {
        const id = btnDelete.dataset.id;
        if (confirm("Bạn có chắc chắn muốn xóa sản phẩm này khỏi sàn bán hàng?")) {
          ProductService.delete(id);
          Toast.info("Đã xóa", "Sản phẩm đã được gỡ khỏi sàn!");
          this.refreshData();
        }
      }

      // 3. Chuyển trạng thái đơn hàng (Duyệt đơn)
      const btnAdvance = e.target.closest(".btn-advance-order");
      if (btnAdvance) {
        const orderId = btnAdvance.dataset.id;
        const targetStatus = btnAdvance.dataset.target;
        
        OrderService.updateStatus(orderId, targetStatus);
        
        const statusNames = {
          DangChuanBi: "Shop đang chuẩn bị hàng",
          DangGiao: "Đang giao cho đơn vị vận chuyển",
          DaGiao: "Giao hàng thành công"
        };

        Toast.success("Cập nhật đơn hàng", `Đơn ${orderId} đã chuyển sang trạng thái: "${statusNames[targetStatus]}"!`);
        this.refreshData();
      }
    });
  }
};

