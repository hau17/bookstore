document.addEventListener("DOMContentLoaded", function () {
  // Khởi tạo DataTable
  $("#userTable").DataTable();

  // Khởi tạo Select2
  $(document).ready(function () {
    $(".select2").select2();
  });

  $("#user-role-filter, #user-status-filter").on("change", applyFilters);

  function applyFilters() {
    const params = new URLSearchParams();

    const role = $("#user-role-filter").val();
    const status = $("#user-status-filter").val();

    if (role) params.set("role", role);
    if (status) params.set("status", status);

    const query = params.toString();
    window.location.href = query ? `/admin/users?${query}` : "/admin/users";
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
