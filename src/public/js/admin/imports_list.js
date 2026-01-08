document.addEventListener("DOMContentLoaded", function () {
  // Init DataTable
  $("#importsTable").DataTable();

  // Click row to fetch details
  document
    .querySelector("#importsTable tbody")
    .addEventListener("click", async function (event) {
      const row = event.target.closest(".import__row--click");
      if (!row) return;

      const importId = row.getAttribute("data-id");
      if (!importId) return;

      try {
        const res = await fetch(`/admin/imports/${importId}`);
        if (!res.ok) throw new Error("Failed fetching import details");
        const data = await res.json();

        // Populate modal
        const header = document.getElementById("import-detail-header");
        header.innerHTML = `<div>Import ID: ${
          data.header.import_id
        }</div><div>Nhà xuất bản: ${
          data.header.publisher_name
        }</div><div>Ngày: ${new Date(
          data.header.created_date
        ).toLocaleString()}</div>`;

        const rowsEl = document.getElementById("import-detail-rows");
        rowsEl.innerHTML = "";
        (data.details || []).forEach((d) => {
          const tr = document.createElement("tr");
          tr.innerHTML = `<td>${d.book_title}</td><td>${
            d.quantity
          }</td><td>${Number(d.import_price).toLocaleString()}</td><td>${Number(
            d.line_total
          ).toLocaleString()}</td>`;
          rowsEl.appendChild(tr);
        });

        document.getElementById("import-detail-total").textContent = Number(
          data.total_cost
        ).toLocaleString();

        const modalEl = document.getElementById("modal-import-detail");
        const bsModal = new bootstrap.Modal(modalEl);
        bsModal.show();
      } catch (err) {
        console.error(err);
        alert("Không thể tải chi tiết nhập hàng");
      }
    });
});
