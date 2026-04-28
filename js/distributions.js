const user = requireAuth();
renderSidebar('distributions.html');

let currentPage = 1;
const PER_PAGE = 10;

/* populate type filter */
stGetAll().forEach(t => {
  const o = document.createElement('option');
  o.value = t.id; o.textContent = t.icon + ' ' + t.name;
  document.getElementById('type-filter').appendChild(o);
});

function getFiltered() {
  const q    = document.getElementById('search').value.toLowerCase();
  const tid  = document.getElementById('type-filter').value;
  const from = document.getElementById('from-date').value;
  const to   = document.getElementById('to-date').value;
  const benes = beneGetAll();
  return distGetAll()
    .sort((a,b) => b.date.localeCompare(a.date))
    .filter(d => {
      const b = benes.find(x => x.id === d.beneficiaryId);
      const name = b ? (b.nameEn + ' ' + b.nameKu).toLowerCase() : '';
      const matchQ    = !q   || name.includes(q) || (d.donor||'').toLowerCase().includes(q);
      const matchType = !tid  || d.supportTypeId === tid;
      const matchFrom = !from || d.date >= from;
      const matchTo   = !to   || d.date <= to;
      return matchQ && matchType && matchFrom && matchTo;
    });
}

function renderStats() {
  const dists = distGetAll();
  const total = dists.reduce((s,d) => s + d.value, 0);
  const thisMonth = dists.filter(d => d.date.slice(0,7) === new Date().toISOString().slice(0,7));
  const monthTotal = thisMonth.reduce((s,d) => s + d.value, 0);
  document.getElementById('stat-grid').innerHTML = `
    <div class="stat-card">
      <div class="stat-icon blue"><i class="fa-solid fa-boxes-stacked" aria-hidden="true"></i></div>
      <div><div class="stat-value">${dists.length}</div><div class="stat-label">Total Records</div></div>
    </div>
    <div class="stat-card">
      <div class="stat-icon green"><i class="fa-solid fa-calendar-check" aria-hidden="true"></i></div>
      <div><div class="stat-value">${thisMonth.length}</div><div class="stat-label">This Month</div></div>
    </div>
    <div class="stat-card">
      <div class="stat-icon gold"><i class="fa-solid fa-coins" aria-hidden="true"></i></div>
      <div><div class="stat-value">${(total/1000000).toFixed(1)}M</div><div class="stat-label">Total Value (IQD)</div></div>
    </div>
    <div class="stat-card">
      <div class="stat-icon purple"><i class="fa-solid fa-calendar-week" aria-hidden="true"></i></div>
      <div><div class="stat-value">${(monthTotal/1000).toFixed(0)}K</div><div class="stat-label">This Month (IQD)</div></div>
    </div>`;
}

function render() { currentPage = 1; renderTable(); }

function renderTable() {
  const filtered = getFiltered();
  const paged = paginate(filtered, currentPage, PER_PAGE);
  const benes = beneGetAll();
  const types = stGetAll();
  const users = usersGetAll();

  document.getElementById('table-body').innerHTML = paged.items.length
    ? paged.items.map(d => {
        const b  = benes.find(x => x.id === d.beneficiaryId);
        const st = types.find(x => x.id === d.supportTypeId);
        const u  = users.find(x => x.id === d.recordedBy);
        return `<tr>
          <td>${fmtDate(d.date)}</td>
          <td>
            ${b ? `<div class="rtl fw-600" style="font-size:.85rem">${b.nameKu}</div><div class="text-muted" style="font-size:.78rem">${b.nameEn}</div>` : '<span class="text-muted">Unknown</span>'}
          </td>
          <td>${st ? st.icon + ' ' + st.name : '—'}</td>
          <td class="col-hide-mobile">${d.qty}</td>
          <td class="text-success fw-600">${fmtIQD(d.value)}</td>
          <td class="col-hide-mobile">${d.donor||'—'}</td>
          <td class="text-muted col-hide-mobile" style="font-size:.8rem">${u ? u.name : '—'}</td>
          <td>
            <div style="display:flex;gap:6px">
              <button class="btn btn-ghost btn-sm btn-icon" onclick="openForm('${d.id}')"><i class="fa-solid fa-pen" aria-hidden="true"></i></button>
              <button class="btn btn-ghost btn-sm btn-icon text-danger" onclick="deleteDist('${d.id}')"><i class="fa-solid fa-trash" aria-hidden="true"></i></button>
            </div>
          </td>
        </tr>`;
      }).join('')
    : emptyRow(8);

  renderPagination(document.getElementById('pagination'), paged, p => { currentPage = p; renderTable(); });
}

function openForm(id = null) {
  const d = id ? distGetAll().find(x => x.id === id) : {};
  const benes = beneGetAll();
  const types = stGetAll();

  const html = `
    <div class="modal">
      <div class="modal-header">
        <span class="modal-title"><i class="fa-solid fa-boxes-stacked text-primary" aria-hidden="true"></i> ${id ? 'Edit' : 'Record'} Distribution</span>
        <button class="modal-close" onclick="closeModal()">✕</button>
      </div>
      <div class="modal-body">
        <form id="dist-form">
          <div class="form-group">
            <label>Beneficiary *</label>
            <select name="beneficiaryId" required onchange="autoFill()">
              <option value="">— Select —</option>
              ${benes.map(b => `<option value="${b.id}" ${(d.beneficiaryId||'')===b.id?'selected':''}>${b.nameEn} / ${b.nameKu}</option>`).join('')}
            </select>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Support Type *</label>
              <select name="supportTypeId" required onchange="autoFill()">
                <option value="">— Select —</option>
                ${types.map(t => `<option value="${t.id}" data-value="${t.value}" ${(d.supportTypeId||'')===t.id?'selected':''}>${t.icon} ${t.name}</option>`).join('')}
              </select>
            </div>
            <div class="form-group">
              <label>Quantity</label>
              <input type="number" name="qty" id="qty" value="${d.qty||1}" min="1" oninput="autoFill()">
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Value (IQD)</label>
              <input type="number" name="value" id="dist-value" value="${d.value||0}" min="0">
            </div>
            <div class="form-group">
              <label>Date *</label>
              <input type="date" name="date" value="${d.date||new Date().toISOString().slice(0,10)}" required>
            </div>
          </div>
          <div class="form-group">
            <label>Donor / Source</label>
            <input type="text" name="donor" value="${d.donor||''}">
          </div>
          <div class="form-group">
            <label>Notes</label>
            <textarea name="notes">${d.notes||''}</textarea>
          </div>
        </form>
      </div>
      <div class="modal-footer">
        <button class="btn btn-ghost" onclick="closeModal()">Cancel</button>
        <button class="btn btn-primary" onclick="saveDist('${id||''}')"><i class="fa-solid fa-floppy-disk" aria-hidden="true"></i> Save</button>
      </div>
    </div>`;
  openModal(html);
}

function autoFill() {
  const sel = document.querySelector('[name="supportTypeId"]');
  const qty = +document.getElementById('qty').value || 1;
  if (!sel) return;
  const opt = sel.options[sel.selectedIndex];
  const unitVal = opt ? +opt.dataset.value : 0;
  if (unitVal) document.getElementById('dist-value').value = unitVal * qty;
}

function saveDist(id) {
  const fd = new FormData(document.getElementById('dist-form'));
  const data = Object.fromEntries(fd.entries());
  data.id    = id || '';
  data.qty   = +data.qty;
  data.value = +data.value;
  if (!data.beneficiaryId || !data.supportTypeId || !data.date) { toast('Please fill all required fields.', 'error'); return; }
  distSave(data);
  closeModal();
  toast(id ? 'Distribution updated.' : 'Distribution recorded.');
  renderStats();
  renderTable();
}

function deleteDist(id) {
  confirmDialog('Delete this distribution record?', () => {
    distDelete(id);
    toast('Distribution deleted.', 'warning');
    renderStats();
    renderTable();
  });
}

function exportExcel() {
  const filtered = getFiltered();
  const benes = beneGetAll();
  const types = stGetAll();
  const users = usersGetAll();
  const headers = ['Date', 'Beneficiary (EN)', 'Beneficiary (KU)', 'Support Type', 'Qty', 'Value (IQD)', 'Donor', 'Notes', 'Recorded By'];
  const rows = filtered.map(d => {
    const b = benes.find(x => x.id === d.beneficiaryId);
    const st = types.find(x => x.id === d.supportTypeId);
    const u = users.find(x => x.id === d.recordedBy);
    return [d.date, b ? b.nameEn : '—', b ? b.nameKu : '—', st ? st.name : '—', d.qty, d.value, d.donor || '', d.notes || '', u ? u.name : '—'];
  });
  exportToExcel(headers, rows, 'distributions');
}

renderStats();
renderTable();
