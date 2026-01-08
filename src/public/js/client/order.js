document.addEventListener("DOMContentLoaded", () => {
  const select = document.getElementById("order-status-filter");
  if (select) {
    select.addEventListener("change", () => {
      document.getElementById("order-filter-form").submit();
    });
  }

  // Handle cancel order with SweetAlert
  document.querySelectorAll(".btn-order-cancel").forEach((button) => {
    button.addEventListener("click", () => {
      const orderId = button.dataset.id;

      Swal.fire({
        title: "Xác nhận hủy đơn",
        text: `Bạn có chắc muốn hủy đơn hàng này?`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Có",
        cancelButtonText: "Không",
        confirmButtonColor: "#d33",
        reverseButtons: true,
      }).then((result) => {
        if (result.isConfirmed) {
          const form = document.createElement("form");
          form.method = "POST";
          form.action = `/account/orders/${orderId}/cancel?_method=PATCH`;
          document.body.appendChild(form);
          form.submit();
        }
      });
    });
  });
});
