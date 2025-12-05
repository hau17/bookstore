document.addEventListener("DOMContentLoaded", function () {
  // Initialize DataTable
  $("#importBookTable").DataTable({
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

  // Initialize Select2 với placeholder tùy chỉnh
  $("#publisher-status-filter").select2({
    placeholder: "Chọn nhà xuất bản",
    allowClear: true,
    language: {
      noResults: function () {
        return "Không tìm thấy kết quả";
      },
    },
  });

  const selectedPublisher = document.getElementById("selectedPublisher");
  const publisherStatusFilter = document.getElementById(
    "publisher-status-filter"
  );
  // lưu giá trị nhà xuất bản đã chọn trước khi submit
  document.getElementById("importForm").addEventListener("submit", function () {
    selectedPublisher.value = publisherStatusFilter.value;
  });
  // Lọc theo nhà xuất bản
  $("#publisher-status-filter").on("change", function () {
    publisherValue = $(this).val();

    // Xóa danh sách sách đã chọn khi đổi nhà xuất bản
    const selectedBookList = document.getElementById("selectedBooks");
    selectedBookList.innerHTML = "";

    window.location.href =
      "/admin/imports/new" +
      (publisherValue ? "?publisher=" + publisherValue : "");
  });

  const importTable = document.querySelector("#importBookTable tbody");
  const selectedBookList = document.getElementById("selectedBooks");

  if (importTable) {
    importTable.addEventListener("click", function (event) {
      const row = event.target.closest("tr");
      if (!row) return;

      if (publisherStatusFilter.value === "") {
        alert("Vui lòng chọn nhà xuất bản trước khi thêm sách!");
        return;
      }

      const bookId = row.getAttribute("data-book-id");
      const bookTitle = row.getAttribute("data-title");
      const bookPublisherId = row.getAttribute("data-publisher-id");

      // Kiểm tra xem sách có cùng nhà xuất bản không
      if (parseInt(bookPublisherId) !== parseInt(publisherStatusFilter.value)) {
        alert("Sách này không thuộc nhà xuất bản đã chọn!");
        console.log(
          "bookPublisherId",
          bookPublisherId,
          "publisherValue",
          publisherStatusFilter.value
        );
        return;
      }

      // Check if the book is already added
      if (selectedBookList.querySelector(`[data-id="${bookId}"]`)) {
        alert("Sách đã được chọn để nhập.");
        return;
      }

      // Add selected book to the list
      const book = document.createElement("div");
      book.setAttribute("data-id", bookId);
      book.className = "card p-2 mb-2 shadow-sm";

      book.innerHTML = `
        <div class="row align-items-center">
          <div class="col-md-4">
            <strong>${bookTitle}</strong>
            <input type="hidden" name="books[${bookId}][book_id]" value="${bookId}">
          </div>
          <div class="col-md-3">
            <input type="number" class="form-control form-control-sm"
              name="books[${bookId}][quantity]" min="1" placeholder="Số lượng" required>
          </div>
          <div class="col-md-3">
            <input type="number" class="form-control form-control-sm"
              name="books[${bookId}][import_price]" min="0" step="0.01" placeholder="Giá nhập" required>
          </div>
          <div class="col-md-2 text-end">
            <button type="button" class="btn btn-danger btn-sm btn-remove">Xóa</button>
          </div>
        </div>
      `;

      selectedBookList.appendChild(book);
    });
  }

  selectedBookList.addEventListener("click", function (event) {
    if (event.target.classList.contains("btn-remove")) {
      const bookDiv = event.target.closest("div[data-id]");
      if (bookDiv) {
        selectedBookList.removeChild(bookDiv);
      }
    }
  });
});
