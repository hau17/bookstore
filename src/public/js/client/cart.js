document.addEventListener("DOMContentLoaded", function () {
  document.querySelectorAll(".increase-qty").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const bookId = btn.dataset.id;

      try {
        const res = await fetch("/cart/update", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            book_id: bookId,
            action: "increase",
          }),
        });

        const data = await res.json();

        if (data.success) {
          toastr.success(data.message || "Cập nhật số lượng thành công");
          location.reload(); // hoặc update trực tiếp DOM nếu muốn
        } else {
          toastr.error(data.message);
        }
      } catch (err) {
        console.error(err);
      }
    });
  });

  // Giảm số lượng
  document.querySelectorAll(".decrease-qty").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const bookId = btn.dataset.id;

      try {
        const res = await fetch("/cart/update", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            book_id: bookId,
            action: "decrease",
          }),
        });

        const data = await res.json();

        if (data.success) {
          toastr.success("Cập nhật số lượng thành công");
          location.reload();
        } else {
          toastr.error(data.message);
        }
      } catch (err) {
        console.error(err);
      }
    });
  });
});
