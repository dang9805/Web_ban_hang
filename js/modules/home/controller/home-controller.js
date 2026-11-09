document.addEventListener("DOMContentLoaded", () => {
  Storage.ready.then(() => {
    HomeView.renderCategories();
    HomeView.renderSuggestedProducts();
  });
});
