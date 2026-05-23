document.addEventListener("DOMContentLoaded", function () {
  $("#importsTable").DataTable();

  document.querySelector("#importsTable tbody").addEventListener("click", function (event) {
    const row = event.target.closest(".import__row--click");
    if (!row) return;
    const importId = row.getAttribute("data-id");
    if (importId) {
      window.location.href = `/admin/imports/${importId}`;
    }
  });
});
