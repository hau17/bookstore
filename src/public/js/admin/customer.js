document.addEventListener("DOMContentLoaded", function () {
  // Khởi tạo <DataTable></DataTable>
  $("#customerTable").DataTable({
    language: {
      search: "Tìm kiếm:",
      lengthMenu: "Hiển thị _MENU_ mục",
      info: "Hiển thị từ _START_ đến _END_ trong tổng số _TOTAL_ mục",
      infoEmpty: "Không có mục nào",
      paginate: {
        next: "Tiếp theo",
        previous: "Trước",
      },
    },
  });
  $("#customer-status").on("change", function () {
    let value = $(this).val();

    window.location.href =
      "/admin/customers" + (value ? "?status=" + value : "");
  });
});
