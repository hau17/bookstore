document.addEventListener("DOMContentLoaded", function () {
  // Khởi tạo DataTable
  $("#authorTable").DataTable();

  // Lọc tác giả
  $("#author-status").on("change", function () {
    let value = $(this).val();

    window.location.href = "/admin/authors" + (value ? "?status=" + value : "");
  });

  // chi tiet tac gia
  const detailModal = document.getElementById("modal-author-detail-admin");
  if (detailModal) {
    document
      .querySelector("#authorTable tbody")
      .addEventListener("click", function (event) {
        const row = event.target.closest(".author-row");
        if (!row) return; // không phải dòng click được
        if (event.target.tagName === "BUTTON" || event.target.tagName === "A") {
          return;
        }
        // Đổ dữ liệu vào modal
        document.getElementById("detail-author-id").textContent =
          row.getAttribute("data-id");
        document.getElementById("detail-author-name").textContent =
          row.getAttribute("data-name");
        document.getElementById("detail-author-email").textContent =
          row.getAttribute("data-email");
        document.getElementById("detail-author-description").textContent =
          row.getAttribute("data-description");

        // Hiển thị modal
        const modal = new bootstrap.Modal(detailModal);
        modal.show();
      });
  }
});
