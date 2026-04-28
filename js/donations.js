const user = requireAuth();
renderSidebar('donations.html');

let currentPage = 1;
const PER_PAGE = 10;

const METHOD_BADGE = { cash:'badge-warning', wallet:'badge-success', bank:'badge-primary', online:'badge-muted' };
const METHOD_ICON  = { cash:'fa-money-bill', wallet:'fa-mobile-screen', bank:'fa-building-columns', online:'fa-globe' };

function renderStats() {
  const dons = donGetAll();
  const total = dons.reduce((s,d) => s + d.amount, 0);
  const month = new Date().toISOString().slice(0,7);
  const monthTotal = dons.filter(d => d.date.slice(0,7)===month).reduce((s,d) => s + d.amount, 0);
  const donors = new Set(dons.filter(d => d.donor !== 'Anonymous').map(d => d.donor)).size;
  document.getElementById('stat-grid').innerHTML = `
    <div class="stat-card">
      <div class="stat-icon green"><i class="fa-solid fa-hand-holding-dollar" aria-hidden="true"></i></div>
      <div><div class="stat-value">${(total/1000000).toFixed(1)}M</div><div class="stat-label">Total Received (IQD)</div></div>
    </div>
    <div class="stat-card">
      <div class="stat-icon blue"><i class="fa-solid fa-calendar-check" aria-hidden="true"></i></div>
      <div><div class="stat-value">${(monthTotal/1000).toFixed(0)}K</div><div class="stat-label">This Month (IQD)</div></div>
    </div>
    <div class="stat-card">
      <div class="stat-icon gold"><i class="fa-solid fa-users" aria-hidden="true"></i></div>
      <div><div class="stat-value">${donors}</div><div class="stat-label">Unique Donors</div></div>
    </div>
    <div class="stat-card">
      <div class="stat-icon purple"><i class="fa-solid fa-receipt" aria-hidden="true"></i></div>
      <div><div class="stat-value">${dons.length}</div><div class="stat-label">Total Records</div></div>
    </div>`;
}

function getFiltered() {
  const q  = document.getElementById('search').value.toLowerCase();
  const m  = document.getElementById('method-filter').value;
  const st = document.getElementById('status-filter').value;
  return donGetAll()
    .sort((a,b) => b.date.localeCompare(a.date))
    .filter(d =>
      (!q  || d.donor.toLowerCase().includes(q) || (d.ref||'').toLowerCase().includes(q)) &&
      (!m  || d.method === m) &&
      (!st || d.status === st)
    );
}

function render() { currentPage = 1; renderTable(); }

function renderTable() {
  const filtered = getFiltered();
  const paged = paginate(filtered, currentPage, PER_PAGE);

  document.getElementById('table-body').innerHTML = paged.items.length
    ? paged.items.map(d => `<tr>
        <td>${fmtDate(d.date)}</td>
        <td class="fw-600">${d.donor}</td>
        <td class="text-success fw-600">${fmtIQD(d.amount)}</td>
        <td class="col-hide-mobile"><span class="badge ${METHOD_BADGE[d.method]||'badge-muted'}"><i class="fa-solid ${METHOD_ICON[d.method]||'fa-circle'}" aria-hidden="true"></i> ${d.method}</span></td>
        <td class="text-muted col-hide-mobile" style="font-size:.8rem">${d.ref||'—'}</td>
        <td class="text-muted col-hide-mobile">${d.purpose||'—'}</td>
        <td>${statusBadge(d.status)}</td>
        <td>
          <div style="display:flex;gap:6px">
            <button class="btn btn-ghost btn-sm btn-icon" onclick="openForm('${d.id}')"><i class="fa-solid fa-pen" aria-hidden="true"></i></button>
            <button class="btn btn-ghost btn-sm btn-icon text-danger" onclick="deleteDon('${d.id}','${d.donor}')"><i class="fa-solid fa-trash" aria-hidden="true"></i></button>
          </div>
        </td>
      </tr>`).join('')
    : emptyRow(8);

  renderPagination(document.getElementById('pagination'), paged, p => { currentPage = p; renderTable(); });
}

function openForm(id = null) {
  const d = id ? donGet(id) : {};
  const html = `
    <div class="modal">
      <div class="modal-header">
        <span class="modal-title"><i class="fa-solid fa-hand-holding-dollar text-primary" aria-hidden="true"></i> ${id ? 'Edit' : 'Record'} Donation</span>
        <button class="modal-close" onclick="closeModal()">✕</button>
      </div>
      <div class="modal-body">
        <form id="don-form">
          <div class="form-row">
            <div class="form-group">
              <label>Donor Name *</label>
              <input type="text" name="donor" value="${d.donor||''}" required placeholder="Full name or Anonymous">
            </div>
            <div class="form-group">
              <label>Date *</label>
              <input type="date" name="date" value="${d.date||new Date().toISOString().slice(0,10)}" required>
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Amount (IQD) *</label>
              <input type="number" name="amount" value="${d.amount||''}" min="0" required>
            </div>
            <div class="form-group">
              <label>Payment Method</label>
              <select name="method">
                ${['cash','wallet','bank','online'].map(m=>`<option value="${m}" ${(d.method||'cash')===m?'selected':''}>${m}</option>`).join('')}
              </select>
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Transaction Reference</label>
              <input type="text" name="ref" value="${d.ref||''}">
            </div>
            <div class="form-group">
              <label>Status</label>
              <select name="status">
                ${['confirmed','pending','cancelled'].map(s=>`<option value="${s}" ${(d.status||'confirmed')===s?'selected':''}>${s}</option>`).join('')}
              </select>
            </div>
          </div>
          <div class="form-group">
            <label>Purpose</label>
            <input type="text" name="purpose" value="${d.purpose||''}" placeholder="e.g. General fund, Food distribution">
          </div>
        </form>
      </div>
      <div class="modal-footer">
        <button class="btn btn-ghost" onclick="closeModal()">Cancel</button>
        <button class="btn btn-primary" onclick="saveDon('${id||''}')"><i class="fa-solid fa-floppy-disk" aria-hidden="true"></i> Save</button>
      </div>
    </div>`;
  openModal(html);
}

function saveDon(id) {
  const fd = new FormData(document.getElementById('don-form'));
  const data = Object.fromEntries(fd.entries());
  data.id     = id || '';
  data.amount = +data.amount;
  if (!data.donor || !data.amount || !data.date) { toast('Donor, amount and date are required.', 'error'); return; }
  donSave(data);
  closeModal();
  toast(id ? 'Donation updated.' : 'Donation recorded.');
  renderStats();
  renderTable();
}

function deleteDon(id, donor) {
  confirmDialog(`Delete donation from <strong>${donor}</strong>?`, () => {
    donDelete(id);
    toast('Donation deleted.', 'warning');
    renderStats();
    renderTable();
  });
}

function exportExcel() {
  const filtered = getFiltered();
  const headers = ['Date', 'Donor', 'Amount (IQD)', 'Method', 'Reference', 'Purpose', 'Status'];
  const rows = filtered.map(d => [d.date, d.donor, d.amount, d.method, d.ref || '', d.purpose || '', d.status]);
  exportToExcel(headers, rows, 'donations');
}

renderStats();
renderTable();
