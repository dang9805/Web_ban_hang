// 1. Dịch vụ Sản phẩm
const ProductService = {
  getAll() {
    return Storage.get("products", []);
  },

  getById(id) {
    const products = this.getAll();
    return products.find(p => p.id === id) || null;
  },

  getByCategory(categoryId) {
    const products = this.getAll();
    if (!categoryId || categoryId === "all") return products;
    return products.filter(p => p.danhMuc === categoryId);
  },

  getBySeller(sellerId) {
    const products = this.getAll();
    return products.filter(p => p.nguoiBanId === sellerId);
  },

  create(productData) {
    const products = this.getAll();
    const newProduct = {
      id: `SP-${crypto.randomUUID()}`,
      daBan: 0,
      anhPhu: productData.anhPhu || [productData.anhChinh],
      ngayDang: new Date().toISOString().split("T")[0],
      ...productData
    };
    products.unshift(newProduct);
    if (!Storage.set("products", products)) throw new Error("Không thể lưu sản phẩm vào bộ nhớ trình duyệt.");
    return newProduct;
  },

  update(id, updateData) {
    const products = this.getAll();
    const index = products.findIndex(p => p.id === id);
    if (index !== -1) {
      products[index] = { ...products[index], ...updateData };
      Storage.set("products", products);
      return products[index];
    }
    return null;
  },

  delete(id) {
    let products = this.getAll();
    products = products.filter(p => p.id !== id);
    Storage.set("products", products);
    return true;
  },

  updateStock(id, quantityDelta) {
    const product = this.getById(id);
    if (product) {
      const newStock = Math.max(0, product.soLuongTon + quantityDelta);
      this.update(id, { soLuongTon: newStock });
      return newStock;
    }
    return null;
  }
};
