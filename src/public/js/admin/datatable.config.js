// Cấu hình mặc định cho TẤT CẢ DataTable trong admin
$.extend(true, $.fn.dataTable.defaults, {
  autoWidth: false,
  stateSave: true,

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
