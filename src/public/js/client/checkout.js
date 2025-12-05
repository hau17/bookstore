// Client-side checkout quantity management
document.addEventListener("DOMContentLoaded", function () {
  setupQuantityControls();
  setupFormSubmit();
});

function setupQuantityControls() {
  const itemsList = document.getElementById("itemsList");
  if (!itemsList) return;

  itemsList.addEventListener("click", function (e) {
    if (e.target.classList.contains("qty-plus")) {
      handleQtyChange(e.target, 1);
    } else if (e.target.classList.contains("qty-minus")) {
      handleQtyChange(e.target, -1);
    }
  });

  itemsList.addEventListener("change", function (e) {
    if (e.target.classList.contains("qty-input")) {
      const input = e.target;
      const item = input.closest("[data-book-id]");
      updateItemTotal(item);
      updateGrandTotal();
    }
  });
}

function handleQtyChange(btn, delta) {
  const item = btn.closest("[data-book-id]");
  const input = item.querySelector(".qty-input");
  const stock = parseInt(item.dataset.stock) || 0;
  let qty = parseInt(input.value) || 1;

  qty += delta;

  if (qty < 1) {
    showError(item, "Số lượng phải lớn hơn 0");
    return;
  }
  if (qty > stock) {
    showError(item, `Chỉ còn ${stock} cuốn`);
    return;
  }

  input.value = qty;
  clearError(item);
  updateItemTotal(item);
  updateGrandTotal();
}

function updateItemTotal(item) {
  const qty = parseInt(item.querySelector(".qty-input").value) || 1;
  const price = parseFloat(item.dataset.price) || 0;
  const total = qty * price;

  const itemTotalEl = item.querySelector(".item-total");
  if (itemTotalEl) {
    itemTotalEl.textContent = formatPrice(total) + " VND";
  }

  const bookId = item.dataset.bookId;
  const summary = document.querySelector(
    `.item-summary[data-book-id="${bookId}"]`
  );
  if (summary) {
    summary.querySelector(".item-qty").textContent = qty;
    summary.querySelector(".item-sum").textContent = formatPrice(total);
  }
}

function updateGrandTotal() {
  let grandTotal = 0;
  const items = document.querySelectorAll("[data-book-id]");

  items.forEach((item) => {
    const qty = parseInt(item.querySelector(".qty-input").value) || 1;
    const price = parseFloat(item.dataset.price) || 0;
    grandTotal += qty * price;
  });

  const grandTotalEl = document.getElementById("grandTotal");
  if (grandTotalEl) {
    grandTotalEl.textContent = formatPrice(grandTotal) + " VND";
  }
}

function showError(item, message) {
  const errorEl = item.querySelector(".qty-error");
  if (errorEl) {
    errorEl.textContent = message;
    errorEl.classList.remove("d-none");
  }
}

function clearError(item) {
  const errorEl = item.querySelector(".qty-error");
  if (errorEl) {
    errorEl.textContent = "";
    errorEl.classList.add("d-none");
  }
}

function formatPrice(price) {
  return new Intl.NumberFormat("vi-VN").format(Math.round(price));
}

function setupFormSubmit() {
  const form = document.getElementById("checkoutForm");
  if (!form) return;

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    // Validate all quantities
    const items = document.querySelectorAll("[data-book-id]");
    const isValid = Array.from(items).every((item) => {
      const qty = parseInt(item.querySelector(".qty-input").value) || 1;
      const stock = parseInt(item.dataset.stock) || 0;

      if (qty < 1 || qty > stock) {
        showError(item, `Số lượng không hợp lệ (còn ${stock} cuốn)`);
        return false;
      }
      clearError(item);
      return true;
    });

    if (!isValid) {
      return;
    }

    // Build items JSON from form
    const itemsData = [];
    items.forEach((item) => {
      itemsData.push({
        book_id: item.dataset.bookId,
        quantity: parseInt(item.querySelector(".qty-input").value) || 1,
        selling_price: parseFloat(item.dataset.price) || 0,
        book_title: item.querySelector("strong").textContent,
        stock_quantity: parseInt(item.dataset.stock) || 0,
      });
    });

    // Update hidden input with final item quantities
    document.getElementById("itemsInput").value = JSON.stringify(itemsData);

    // Submit form
    form.submit();
  });
}
