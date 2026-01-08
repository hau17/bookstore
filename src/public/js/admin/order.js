document.addEventListener("DOMContentLoaded", function () {
  $("#admin-order-table").DataTable();

  $(".select2").select2();
  // lọc loại đơn hàng(chưa giao/đã giao)
  $("#admin-order-status").on("change", function () {
    let value = $(this).val();

    window.location.href = "/admin/orders" + (value ? "?status=" + value : "");
  });
  const statusOptionsMap = {
    1: { 2: "Chuẩn bị hàng", 5: "Hủy" },
    2: { 3: "Đang giao", 5: "Hủy" },
    3: { 4: "Đã giao" },
  };
  document.querySelectorAll(".btn-change-status").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const orderId = btn.dataset.id;
      const currentStatus = Number(btn.dataset.status);

      const options = statusOptionsMap[currentStatus];
      if (!options) {
        toastr.error("Không có trạng thái hợp lệ để chuyển đổi!");
        return;
      }

      const { value: statusId } = await Swal.fire({
        title: "Thay đổi trạng thái đơn hàng",
        input: "select",
        inputOptions: options,
        inputPlaceholder: "Chọn trạng thái",
        showCancelButton: true,
        confirmButtonText: "Cập nhật",
        cancelButtonText: "Hủy",
        confirmButtonColor: "#198754",
      });

      if (!statusId) return;

      try {
        const res = await fetch(`/admin/orders/${orderId}/status`, {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: `status_id=${encodeURIComponent(statusId)}`,
        });
        const data = await res.json();
        if (res.ok) {
          toastr.success(data.message);
          setTimeout(() => location.reload(), 1200);
        } else {
          toastr.error(data.message);
          setTimeout(() => location.reload(), 1200);
        }
      } catch {
        toastr.error("Cập nhật trạng thái thất bại!");
      }
    });
  });

  document.querySelectorAll(".btn-change-payment").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const orderId = btn.dataset.id;

      const { value: paymentStatus } = await Swal.fire({
        title: "Trạng thái thanh toán",
        input: "select",
        inputOptions: {
          0: "Chưa thanh toán",
          1: "Đã thanh toán",
        },
        showCancelButton: true,
        confirmButtonText: "Cập nhật",
        cancelButtonText: "Hủy",
        confirmButtonColor: "#198754",
      });

      if (paymentStatus === undefined) return;

      try {
        const res = await fetch(`/admin/orders/${orderId}/payment-status`, {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: `payment_status=${encodeURIComponent(paymentStatus)}`,
        });
        const data = await res.json();

        if (res.ok) {
          toastr.success(data.message);
          setTimeout(() => location.reload(), 1200);
        } else {
          toastr.error(data.message);
          setTimeout(() => location.reload(), 1200);
        }
      } catch {
        toastr.error("Cập nhật trạng thái thanh toán thất bại!");
      }
    });
  });

  // Xử lý click vào hàng để hiển thị chi tiết đơn hàng
  document
    .querySelector("#admin-order-table tbody")
    .addEventListener("click", async function (event) {
      const row = event.target.closest(".admin-order-row");
      if (!row) return; // không phải dòng cần click

      // Tránh kích hoạt modal khi nhấn vào nút hoặc link
      if (event.target.tagName === "BUTTON" || event.target.tagName === "A") {
        return;
      }

      const orderId = row.getAttribute("data-id");
      if (!orderId) {
        toastr.error("Không tìm thấy ID đơn hàng!");
        return;
      }

      // Đổ dữ liệu vào modal
      document.getElementById("admin-order-detail-id").textContent = orderId;
      document.getElementById("admin-order-detail-user-name").textContent =
        row.getAttribute("data-user-name");
      document.getElementById("admin-order-detail-user-address").textContent =
        row.getAttribute("data-address");
      document.getElementById("admin-order-detail-order-date").textContent =
        row.getAttribute("data-order-date");
      document.getElementById("admin-order-detail-total-amount").textContent =
        row.getAttribute("data-total-amount");
      document.getElementById("admin-order-detail-payment-name").textContent =
        row.getAttribute("data-payment-name");
      document.getElementById("admin-order-detail-payment-status").textContent =
        row.getAttribute("data-payment-status") === "0"
          ? "Chưa thanh toán"
          : "Đã thanh toán";
      document.getElementById("admin-order-detail-status-name").textContent =
        row.getAttribute("data-status-name");

      try {
        const response = await fetch(`/admin/orders/${orderId}/details`);
        if (!response.ok) throw new Error("Fetch failed");
        const result = await response.json();
        const details = result.data;

        const booksTbody = document.getElementById("admin-order-detail-books");
        booksTbody.innerHTML = "";

        details.forEach((detail) => {
          const tr = document.createElement("tr");
          tr.innerHTML = `
        <td>${detail.book_title}</td>
        <td>${detail.quantity}</td>
        <td>${detail.price}</td>
        <td>${(detail.quantity * detail.price).toFixed(2)}</td>
      `;
          booksTbody.appendChild(tr);
        });
      } catch (error) {
        console.error("Error fetching order details:", error);
        toastr.error("Lấy chi tiết đơn hàng thất bại!");
        return;
      }

      // Hiển thị modal
      const detailModal = new bootstrap.Modal(
        document.getElementById("admin-order-detail-modal")
      );
      detailModal.show();
    });
});
