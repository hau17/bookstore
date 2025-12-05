document.addEventListener("DOMContentLoaded", function () {
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
});
