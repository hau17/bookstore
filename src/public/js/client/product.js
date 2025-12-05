document.addEventListener("DOMContentLoaded", function () {
  const searchButton = document.getElementById("product_btn-search");
  const searchInput = document.getElementById("product_search-input");
  const filterSelect = document.getElementById("product-filter");

  function updateQueryAndReload({ searching, filter, page = 1 }) {
    const params = new URLSearchParams();
    if (searching) params.set("search", searching);
    if (filter) params.set("category", filter);
    if (page > 1) params.set("page", page);

    const query = params.toString();
    const url = window.location.pathname + (query ? `?${query}` : "");
    window.location.href = url;
  }

  if (searchButton) {
    searchButton.addEventListener("click", function () {
      const searchTerm = searchInput.value.trim();
      const selectedCategory = filterSelect ? filterSelect.value : "";
      updateQueryAndReload({
        searching: searchTerm,
        filter: selectedCategory,
        page: 1,
      });
    });
  }

  if (filterSelect) {
    filterSelect.addEventListener("change", function () {
      const selectedCategory = filterSelect.value;
      const searchTerm = searchInput ? searchInput.value.trim() : "";
      updateQueryAndReload({
        searching: searchTerm,
        filter: selectedCategory,
        page: 1,
      });
    });
  }
  //thêm vào giỏ hàng
  document.querySelectorAll(".product__btn--add-to-cart").forEach((button) => {
    button.addEventListener("click", async () => {
      const bookId = button.dataset.id;
      try {
        const response = await fetch("/cart/add", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ book_id: bookId }),
        });
        // If server redirected (login page or similar), follow
        if (response.redirected) {
          window.location.href = response.url;
          return;
        }

        if (response.status === 401) {
          // unauthorized - redirect to login
          window.location.href = "/account/login";
          return;
        }

        const data = await response.json();
        if (data.success) {
          toastr.success("Thêm sách vào giỏ hàng thành công!");
        } else {
          toastr.error("Lỗi: " + (data.message || "Thao tác không thành công"));
        }
      } catch (error) {
        console.error("Error:", error);
        toastr.error("Có lỗi xảy ra:" + error.message);
      }
    });
  });
  
  // buy now -> go to checkout for single item
  document.querySelectorAll('.btn-buy-now').forEach(btn => {
    btn.addEventListener('click', function () {
      const bookId = this.dataset.bookId || this.getAttribute('data-book-id');
      if (bookId) {
        window.location.href = `/checkout/buy/${bookId}`;
      }
    });
  });
});
