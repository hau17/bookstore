document.addEventListener("DOMContentLoaded", function () {
  const selectedBooks = document.getElementById("selectedBooks");
  const selectedCount = document.getElementById("selectedCount");
  const emptyHint = document.getElementById("emptyHint");
  const publisherIdHidden = document.getElementById("publisherIdHidden");

  // ── Helpers ───────────────────────────────────────────────────────
  function escapeHtml(str) {
    return String(str == null ? "" : str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function updateCount() {
    const n = selectedBooks.querySelectorAll(".book-card").length;
    selectedCount.textContent = n;
    if (emptyHint) emptyHint.style.display = n === 0 ? "block" : "none";
  }

  function addBookToPanel(bookId, title, prefillQty, prefillPrice) {
    // ★ FIX: Validate book_id hợp lệ TRƯỚC KHI tạo DOM
    const numericId = parseInt(bookId, 10);
    if (!numericId || numericId <= 0) {
      console.warn("[ImportEdit] Bỏ qua sách có book_id không hợp lệ:", bookId);
      return;
    }
    // Luôn dùng chuỗi số nguyên sạch để tránh tạo name="books[][...]"
    const safeId = String(numericId);

    if (selectedBooks.querySelector(`[data-id="${safeId}"]`)) {
      toastr.info("Sách đã có trong danh sách");
      return;
    }
    const card = document.createElement("div");
    card.className = "card p-2 mb-2 shadow-sm book-card";
    card.dataset.id = safeId;
    card.innerHTML = `
      <div class="row align-items-center g-2">
        <div class="col-auto">
          <input type="checkbox" class="form-check-input book-checkbox" checked
                 title="Bỏ chọn để xóa khỏi danh sách">
        </div>
        <div class="col">
          <span class="fw-semibold">${escapeHtml(title)}</span>
        </div>
        <div class="col-md-3">
          <input type="hidden"
                 name="books[${safeId}][book_id]"
                 value="${safeId}">
          <input type="number"
                 class="form-control form-control-sm"
                 name="books[${safeId}][quantity]"
                 min="1"
                 placeholder="SL"
                 value="${escapeHtml(String(prefillQty == null ? "" : prefillQty))}">
        </div>
        <div class="col-md-3">
          <input type="number"
                 class="form-control form-control-sm"
                 name="books[${safeId}][import_price]"
                 min="1"
                 step="0.01"
                 placeholder="Giá nhập (đ)"
                 value="${escapeHtml(String(prefillPrice == null ? "" : prefillPrice))}">
        </div>
      </div>
    `;
    selectedBooks.appendChild(card);
    updateCount();
  }

  // ── 1. Thu thập preselected TRƯỚC KHI DataTable xáo trộn DOM ─────
  const preSelected = [];
  document.querySelectorAll("#editBookTable tbody tr[data-preselected]")
    .forEach(function (tr) {
      // ★ FIX: Chỉ đẩy vào mảng khi book_id là số nguyên hợp lệ
      const id = parseInt(tr.dataset.bookId, 10);
      if (!id || id <= 0) return;
      preSelected.push({
        bookId: String(id),
        title:  tr.dataset.title  || "",
        qty:    tr.dataset.prefillQty   || "",
        price:  tr.dataset.prefillPrice || "",
      });
    });

  // ── 2. Khởi tạo DataTable ─────────────────────────────────────────
  if ($("#editBookTable").length) {
    $("#editBookTable").DataTable({
      language: {
        search:      "Tìm kiếm:",
        lengthMenu:  "Hiển thị _MENU_ dòng",
        info:        "Hiển thị _START_ - _END_ trong _TOTAL_ sách",
        paginate:    { previous: "Trước", next: "Sau" },
        zeroRecords: "Không tìm thấy sách nào",
      },
    });
  }

  // ── 3. Khởi tạo Select2 cho publisher dropdown ───────────────────
  $("#publisherSelect").select2({
    placeholder: "Chọn nhà xuất bản",
    allowClear: false,
    language: {
      noResults: function () { return "Không tìm thấy kết quả"; },
    },
  });

  // ── 4. Render sách đã chọn từ dữ liệu thu thập ở bước 1 ─────────
  preSelected.forEach(function (b) {
    addBookToPanel(b.bookId, b.title, b.qty, b.price);
  });
  updateCount();

  // ── 5. Publisher dropdown change → xác nhận rồi redirect ─────────
  const currentPublisherId = publisherIdHidden.value;

  $("#publisherSelect").on("change", function () {
    const newPublisherId = $(this).val();
    if (newPublisherId === currentPublisherId) return;

    const importId = this.dataset.importId;
    const hasBooks = selectedBooks.querySelectorAll(".book-card").length > 0;

    if (hasBooks) {
      const confirmed = confirm(
        "Đổi nhà xuất bản sẽ xóa toàn bộ danh sách sách đã chọn.\nXác nhận tiếp tục?"
      );
      if (!confirmed) {
        $(this).val(currentPublisherId).trigger("change.select2");
        return;
      }
    }

    console.log("[ImportEdit] Publisher changed:", currentPublisherId, "→", newPublisherId);
    window.location.href = `/admin/imports/${importId}/edit?publisher=${newPublisherId}`;
  });

  // ── 6. Click vào hàng sách → thêm vào panel ──────────────────────
  document.getElementById("editBookTable").addEventListener("click", function (e) {
    const tr = e.target.closest("tr");
    if (!tr) return;
    // ★ FIX: Kiểm tra parseInt > 0 thay vì chỉ truthy check
    const id = parseInt(tr.dataset.bookId, 10);
    if (!id || id <= 0) return;

    console.log("[ImportEdit] Book clicked:", id, tr.dataset.title);
    addBookToPanel(String(id), tr.dataset.title, "", "");
  });

  // ── 7. Uncheck checkbox → xóa book card khỏi DOM ────────────────
  selectedBooks.addEventListener("change", function (e) {
    if (e.target.classList.contains("book-checkbox") && !e.target.checked) {
      const card = e.target.closest(".book-card");
      if (card) {
        console.log("[ImportEdit] Book removed:", card.dataset.id);
        card.remove();
        updateCount();
      }
    }
  });

  // ── 8. Validate form trước khi submit ────────────────────────────
  document.getElementById("editImportForm").addEventListener("submit", function (e) {
    const cards = selectedBooks.querySelectorAll(".book-card");

    let valid = true;
    let validCount = 0;

    cards.forEach(function (card) {
      const checkbox = card.querySelector(".book-checkbox");
      const cardId = parseInt(card.dataset.id, 10);
      
      // Lọc bỏ item bị uncheck hoặc book_id <= 0 (Frontend Sanitization)
      if (!checkbox || !checkbox.checked || !cardId || cardId <= 0) {
        card.remove();
        return;
      }

      const qtyInput   = card.querySelector('input[name$="[quantity]"]');
      const priceInput = card.querySelector('input[name$="[import_price]"]');
      const qty   = parseInt(qtyInput.value, 10);
      const price = parseFloat(priceInput.value);

      if (!qtyInput.value || isNaN(qty) || qty <= 0) {
        const title = card.querySelector(".fw-semibold").textContent;
        toastr.error(`"${title}": Số lượng phải lớn hơn 0`);
        qtyInput.focus();
        valid = false;
      } else if (!priceInput.value || isNaN(price) || price <= 0) {
        const title = card.querySelector(".fw-semibold").textContent;
        toastr.error(`"${title}": Giá nhập phải lớn hơn 0`);
        priceInput.focus();
        valid = false;
      } else {
        validCount++;
      }
    });

    if (validCount === 0 && valid) {
      e.preventDefault();
      toastr.error("Phiếu nhập phải có ít nhất một sách hợp lệ");
      return;
    }

    if (!valid) {
      e.preventDefault();
    }
  });
});
