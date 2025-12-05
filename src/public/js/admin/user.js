document.addEventListener("DOMContentLoaded", function () {
  // Khởi tạo DataTable
  $("#myTable").DataTable({
    autoWidth: false,
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

  // Khởi tạo Select2
  $(document).ready(function () {
    $(".select2").select2();
  });

  // Lọc theo vai trò
  $("#user-role-filter").on("change", function () {
    applyFilters();
  });

  // Lọc theo trạng thái
  $("#user-status-filter").on("change", function () {
    applyFilters();
  });

  // Hàm áp dụng bộ lọc
  function applyFilters() {
    const roleValue = $("#user-role-filter").val();
    const statusValue = $("#user-status-filter").val();

    let url = "/admin/users";
    const params = [];

    if (roleValue) {
      params.push(`role=${roleValue}`);
    }
    if (statusValue) {
      params.push(`status=${statusValue}`);
    }

    if (params.length > 0) {
      url += "?" + params.join("&");
    }

    window.location.href = url;
  }

  // Xử lý click vào hàng để hiển thị chi tiết
  const detailModal = document.getElementById("modal-user-detail");
  if (detailModal) {
    document
      .querySelector("#myTable tbody")
      .addEventListener("click", function (event) {
        const row = event.target.closest(".user__row--click");
        if (!row) return;

        // Tránh kích hoạt modal khi nhấn vào nút Sửa/Khóa
        if (event.target.tagName === "BUTTON" || event.target.tagName === "A") {
          return;
        }

        const userId = row.getAttribute("data-id");
        const email = row.getAttribute("data-email");
        const fullname = row.getAttribute("data-fullname");
        const role = row.getAttribute("data-role");
        const status = row.getAttribute("data-status");

        // Cập nhật nội dung modal
        detailModal.querySelector(
          ".modal-title"
        ).textContent = `Chi tiết nhân viên: ${email || "Không xác định"}`;
        detailModal.querySelector("#detail-user-id").textContent = userId;
        detailModal.querySelector("#detail-email").textContent = email;
        detailModal.querySelector("#detail-fullname").textContent = fullname;
        detailModal.querySelector("#detail-role").textContent =
          role === "admin" ? "Admin" : role === "manager" ? "Manager" : "Staff";
        detailModal.querySelector("#detail-status").textContent =
          status === "1" ? "Đang hoạt động" : "Đã khóa";

        // Hiển thị modal
        const bootstrapModal = new bootstrap.Modal(detailModal);
        bootstrapModal.show();
      });
  }
});
