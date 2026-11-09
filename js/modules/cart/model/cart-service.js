// 3. Dịch vụ Giỏ hàng
const CartService = {
  getCart() {
    return Storage.get("cart", []);
  },

  addToCart(productId, quantity = 1) {
    const cart = this.getCart();
    const product = ProductService.getById(productId);
    if (!product) return { success: false, message: "Sản phẩm không tồn tại!" };
    if (product.soLuongTon <= 0) return { success: false, message: "Sản phẩm đã hết hàng!" };

    const existingIndex = cart.findIndex(item => item.productId === productId);
    if (existingIndex !== -1) {
      const newQty = cart[existingIndex].soLuong + quantity;
      if (newQty > product.soLuongTon) {
        return { success: false, message: `Số lượng chọn vượt quá tồn kho (${product.soLuongTon} món)!` };
      }
      cart[existingIndex].soLuong = newQty;
    } else {
      if (quantity > product.soLuongTon) {
        return { success: false, message: `Số lượng chọn vượt quá tồn kho (${product.soLuongTon} món)!` };
      }
      cart.push({
        productId: product.id,
        soLuong: quantity,
        donGia: product.gia,
        shopId: product.nguoiBanId
      });
    }

    Storage.set("cart", cart);
    return { success: true, message: "Đã thêm vào Giỏ hàng thành công!" };
  },

  updateQuantity(productId, quantity) {
    const cart = this.getCart();
    const product = ProductService.getById(productId);
    if (!product) return false;

    const item = cart.find(i => i.productId === productId);
    if (item) {
      if (quantity <= 0) {
        return this.removeFromCart(productId);
      }
      item.soLuong = Math.min(quantity, product.soLuongTon);
      Storage.set("cart", cart);
      return true;
    }
    return false;
  },

  removeFromCart(productId) {
    let cart = this.getCart();
    cart = cart.filter(item => item.productId !== productId);
    Storage.set("cart", cart);
    return true;
  },

  clearCart() {
    Storage.set("cart", []);
    return true;
  },

  getCount() {
    const cart = this.getCart();
    return cart.reduce((total, item) => total + item.soLuong, 0);
  },

  getDetailedCart() {
    const cart = this.getCart();
    return cart.map(item => {
      const product = ProductService.getById(item.productId);
      return {
        ...item,
        product: product || {
          ten: "Sản phẩm không còn tồn tại",
          gia: item.donGia,
          anhChinh: "https://via.placeholder.com/100",
          soLuongTon: 0
        }
      };
    });
  }
};
