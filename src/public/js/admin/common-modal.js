// common-modal.js

// Xóa chung
const deleteModal = document.getElementById('delete-modal');
if (deleteModal) {
  deleteModal.addEventListener('show.bs.modal', event => {
    const button = event.relatedTarget;
    const id = button.dataset.id;
    const name = button.dataset.name;
    const type = button.dataset.type; // authors/customers/products

    deleteModal.querySelector('#delete-name').textContent = name || 'Không xác định';
    deleteModal.querySelector('#delete-form').action = `/admin/${type}/${id}?_method=DELETE`;
  });
}

// Khóa/Mở khóa chung
const toggleModal = document.getElementById('toggle-status-modal');
if (toggleModal) {
  toggleModal.addEventListener('show.bs.modal', event => {
    const button = event.relatedTarget;
    const id = button.dataset.id;
    const name = button.dataset.name;
    const type = button.dataset.type;
    const status = button.dataset.status; // 1 = status, 0 = instatus

    const action = status === "1" ? "Khóa" : "Mở khóa";

    toggleModal.querySelector('#toggle-status-name').textContent = name || 'Không xác định';
    toggleModal.querySelector('#toggle-status-action').textContent = action;
    toggleModal.querySelector('#toggle-status-action2').textContent = action.toLowerCase();
    toggleModal.querySelector('#toggle-status-btn').textContent = action;
    toggleModal.querySelector('#toggle-status-form').action = `/admin/${type}/${id}/status?_method=PATCH`;
  });
}

// Chỉnh sửa chung
const editModal = document.getElementById('edit-modal');
if (editModal) {
  editModal.addEventListener('show.bs.modal', event => {
    const button = event.relatedTarget;
    const id = button.dataset.id;
    const name = button.dataset.name;
    const type = button.dataset.type; // authors/customers/products

    editModal.querySelector('#edit-name').textContent = name || 'Không xác định';
    editModal.querySelector('#edit-form').action = `/admin/${type}/${id}?_method=PUT`;
  });
}
