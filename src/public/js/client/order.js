document.addEventListener("DOMContentLoaded", () => {
  const select = document.getElementById("order-status-filter");
  if (select) {
    select.addEventListener("change", () => {
      document.getElementById("order-filter-form").submit();
    });
  }

  // Handle cancel order modal
  const cancelOrderModal = document.getElementById("cancel-order-modal");
  if (cancelOrderModal) {
    cancelOrderModal.addEventListener("show.bs.modal", (event) => {
      const button = event.relatedTarget;
      const orderId = button.dataset.id;
      const orderName = button.dataset.name;

      cancelOrderModal.querySelector("#cancel-order-name").textContent =
        orderName || "Không xác định";
      cancelOrderModal.querySelector(
        "#cancel-order-form"
      ).action = `/account/orders/${orderId}/cancel?_method=PATCH`;
    });
  }
});
