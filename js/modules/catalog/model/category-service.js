// 2. Dịch vụ Danh mục
const CategoryService = {
  getAll() {
    return Storage.get("categories", MOCK_CATEGORIES);
  },

  getById(id) {
    const categories = this.getAll();
    return categories.find(c => c.id === id) || null;
  }
};
