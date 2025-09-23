document.addEventListener('DOMContentLoaded', function () {
  // Khởi tạo DataTable
  $('#myTable').DataTable({
    "autoWidth": false,
      "language": {
          "search": "Tìm kiếm:",
          "lengthMenu": "Hiển thị _MENU_ mục",
          "info": "Hiển thị từ _START_ đến _END_ trong tổng số _TOTAL_ mục",
          "infoEmpty": "Không có mục nào",
          "paginate": {
              "next": "Tiếp theo",
              "previous": "Trước"
          }
      }
  });

  // Khởi tạo Select2
  $(document).ready(function() {
    $('.select2').select2();
  });

  // Lọc sản phẩm
  $('#product-status-filter').on('change', function () {
    let value=$(this).val();

    window.location.href = '/admin/products' + (value ? '?filter=' + value : '');
  });

  // Xử lý click vào hàng để hiển thị chi tiết
const detailModal = document.getElementById('modal-product-detail-admin');
if (detailModal) {
  document.querySelector('#myTable tbody').addEventListener('click', function (event) {
    const row = event.target.closest('.product__row--click');
    if (!row) return; // không phải dòng click được

    // Tránh kích hoạt modal khi nhấn vào nút Sửa/Xóa
    if (event.target.tagName === 'BUTTON' || event.target.tagName === 'A') {
      return;
    }

    const bookId = row.getAttribute('data-id');
    const bookTitle = row.getAttribute('data-title');
    const category = row.getAttribute('data-category');
    const author = row.getAttribute('data-author');
    const publisher = row.getAttribute('data-publisher');
    const price = row.getAttribute('data-price');
    const discount = row.getAttribute('data-discount');
    const quantity = row.getAttribute('data-quantity');
    const description = row.getAttribute('data-description');
    const image = row.getAttribute('data-image');
    const created = row.getAttribute('data-created');
    const status = row.getAttribute('data-status');

    if (!bookId) {
      console.error('bookId không hợp lệ');
      alert('Không thể hiển thị chi tiết sách!');
      return;
    }

    // Cập nhật nội dung modal
    detailModal.querySelector('.modal-title').textContent = `Chi tiết sách: ${bookTitle || 'Không xác định'}`;
    detailModal.querySelector('#detail-book-id').textContent = bookId;
    detailModal.querySelector('#detail-book-title').textContent = bookTitle || 'Không xác định';
    detailModal.querySelector('#detail-category').textContent = category || 'Không xác định';
    detailModal.querySelector('#detail-author').textContent = author || 'Không xác định';
    detailModal.querySelector('#detail-publisher').textContent = publisher || 'Không xác định';
    detailModal.querySelector('#detail-price').textContent = price || '0';
    detailModal.querySelector('#detail-discount').textContent = discount || '0';
    detailModal.querySelector('#detail-quantity').textContent = quantity || '0';
    detailModal.querySelector('#detail-description').textContent = description || 'Không có mô tả';
    detailModal.querySelector('#detail-image').src = image || '/img/placeholder.jpg';
    detailModal.querySelector('#detail-created').textContent = created || 'Không xác định';
    detailModal.querySelector('#detail-status').textContent = status === '1' ? 'Hoạt động' : 'Không hoạt động';

    // Hiển thị modal
    const bootstrapModal = new bootstrap.Modal(detailModal);
    bootstrapModal.show();
  });
}

});
