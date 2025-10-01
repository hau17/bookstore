document.addEventListener('DOMContentLoaded', function () {
  // Khởi tạo DataTable
  $('#publisherTable').DataTable({
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

  $('#publisher-status-filter').on('change', function () {
    let value=$(this).val();
    window.location.href = '/admin/publishers' + (value ? '?filter=' + value : '');
  });
    // Chi tiết nhà xuất bản
  const detailModal = document.getElementById('modal-publisher-detail-admin');
  if (detailModal) {
    document.querySelector('#publisherTable tbody').addEventListener('click', function (event) {
      const row = event.target.closest('.publisher-row');
      if (!row) return; // Không phải dòng hợp lệ
      if (event.target.tagName === 'BUTTON' || event.target.tagName === 'A') {
        return; // Không mở modal khi bấm nút Sửa/Xóa
      }

      // Đổ dữ liệu vào modal
      document.getElementById('detail-publisher-id').textContent = row.getAttribute('data-id');
      document.getElementById('detail-publisher-name').textContent = row.getAttribute('data-name');
      document.getElementById('detail-publisher-address').textContent = row.getAttribute('data-address');
      document.getElementById('detail-publisher-phone').textContent = row.getAttribute('data-phone');
      document.getElementById('detail-publisher-description').textContent = row.getAttribute('data-description');
      document.getElementById('detail-publisher-status').textContent = row.getAttribute('data-status') === '1' ? 'Hoạt động' : 'Không hoạt động';

      // Hiển thị modal
      const modal = new bootstrap.Modal(detailModal);
      modal.show();
    });
  }
});
