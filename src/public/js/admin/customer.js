document.addEventListener("DOMContentLoaded", function () {
  // Khởi tạo DataTable
  $("#customerTable").DataTable();
  $("#customer-status").on("change", function () {
    let value = $(this).val();

    window.location.href =
      "/admin/customers" + (value ? "?status=" + value : "");
  });
});
