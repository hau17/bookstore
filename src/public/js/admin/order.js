document.addEventListener('DOMContentLoaded', function () {
  $('#admin-order-table').DataTable({
    responsive: true,
    language: {
      search: 'Tìm kiếm:',
      lengthMenu: 'Hiển thị _MENU_ mục',
      info: 'Hiển thị từ _START_ đến _END_ trong tổng số _TOTAL_ mục',
      infoEmpty: 'Không có mục nào',
      paginate: {
        next: 'Tiếp theo',
        previous: 'Trước'
      }
    }
  });

  $('.select2').select2();
// lọc loại đơn hàng(chưa giao/đã giao)
$('#admin-order-filter').on('change', function () {
  let value = $(this).val();

  let title = "Tất cả đơn hàng";
  if (value === "undelivered") title = "Chưa giao";
  else if (value === "delivered") title = "Đã giao";
  else if (value === "cancelled") title = "Bị hủy";

  window.location.href = '/admin/orders' + (value ? '?filter=' + value : '');
});



// thay đổi trạng thái đơn hàng

  const statusModal = document.getElementById('admin-order-change-status-modal');
  if (statusModal) {
    statusModal.addEventListener('show.bs.modal', event => {
      const button = event.relatedTarget;
      const orderId = button.getAttribute('data-id');
      if (!orderId) return;
      document.getElementById('admin-order-id').value = orderId;
    });

    const statusForm = document.getElementById('admin-order-change-status-form');
    statusForm.addEventListener('submit', async event => {
      event.preventDefault();
      const orderId = document.getElementById('admin-order-id').value;
      const statusId = document.getElementById('admin-order-status-id').value;

      try {
        const response = await fetch(`/admin/orders/${orderId}/status`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: `order_id=${encodeURIComponent(orderId)}&status_id=${encodeURIComponent(statusId)}`
        });

        const result = await response.json();
        if (result.success) {
          alert('Cập nhật trạng thái thành công!');
          window.location.reload();
        } else {
          alert('Cập nhật thất bại: ' + result.error);
        }
      } catch (error) {
        console.error('Error updating status:', error);
        alert('Lỗi server');
      }
    });
  }

// Xử lý click vào hàng để hiển thị chi tiết đơn hàng
  document.querySelector('#admin-order-table tbody').addEventListener('click', async function (event) {
  const row = event.target.closest('.admin-order-row');
  if (!row) return; // không phải dòng cần click

  // Tránh kích hoạt modal khi nhấn vào nút hoặc link
  if (event.target.tagName === 'BUTTON' || event.target.tagName === 'A') {
    return;
  }

  const orderId = row.getAttribute('data-id');
  if (!orderId) {
    alert('Không thể hiển thị chi tiết đơn hàng!');
    return;
  }

  // Đổ dữ liệu vào modal
  document.getElementById('admin-order-detail-id').textContent = orderId;
  document.getElementById('admin-order-detail-user-name').textContent = row.getAttribute('data-user-name');
  document.getElementById('admin-order-detail-user-address').textContent = row.getAttribute('data-address');
  document.getElementById('admin-order-detail-order-date').textContent = row.getAttribute('data-order-date');
  document.getElementById('admin-order-detail-total-amount').textContent = row.getAttribute('data-total-amount');
  document.getElementById('admin-order-detail-payment-name').textContent = row.getAttribute('data-payment-name');
  document.getElementById('admin-order-detail-payment-status').textContent =
    row.getAttribute('data-payment-status') === '0' ? 'Chưa thanh toán' : 'Đã thanh toán';
  document.getElementById('admin-order-detail-status-name').textContent = row.getAttribute('data-status-name');

  try {
    const response = await fetch(`/admin/orders/${orderId}/details`);
    if (!response.ok) throw new Error('Fetch failed');
    const details = await response.json();

    const booksTbody = document.getElementById('admin-order-detail-books');
    booksTbody.innerHTML = '';

    details.forEach(detail => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${detail.book_title}</td>
        <td>${detail.quantity}</td>
        <td>${detail.price}</td>
        <td>${(detail.quantity * detail.price).toFixed(2)}</td>
      `;
      booksTbody.appendChild(tr);
    });
  } catch (error) {
    console.error('Error fetching order details:', error);
    alert('Không thể tải chi tiết đơn hàng!');
  }

  // Hiển thị modal
  const detailModal = new bootstrap.Modal(document.getElementById('admin-order-detail-modal'));
  detailModal.show();
});

// thay đổi trạng thái thanh toán đơn hàng
const paymentStatusModal = document.getElementById('admin-order-change-payment-status-modal');
  if (paymentStatusModal) {
    paymentStatusModal.addEventListener('show.bs.modal', event => {
      const button = event.relatedTarget;
      const orderId = button.getAttribute('data-id');
      if (!orderId) return;
      document.getElementById('admin-order-payment-status-id').value = orderId;
    });

    const paymentStatusForm = document.getElementById('admin-order-change-payment-status-form');
    paymentStatusForm.addEventListener('submit', async event => {
      event.preventDefault();
      const orderId = document.getElementById('admin-order-payment-status-id').value;
      console.log(orderId);
      const paymentStatus = document.getElementById('admin-order-payment-status').value;
      console.log(paymentStatus);
      try {
        const response = await fetch(`/admin/orders/${orderId}/payment-status`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: `order_id=${encodeURIComponent(orderId)}&payment_status=${encodeURIComponent(paymentStatus)}`
        });
        const result = await response.json();
        if (result.success) {
          alert('Cập nhật trạng thái thanh toán thành công!');
          window.location.reload();
        } else {
          alert('Cập nhật thất bại: ' + result.error);
        }
      } catch (error) {
        console.error('Error updating payment status:', error);
        alert('Lỗi server');
      }
    });
  }
});

