/* ═══════════════════════════════════════
   XZMAT — Beneficiaries
   ═══════════════════════════════════════ */

const user = requireAuth();
renderSidebar('beneficiaries.html');

let currentPage = 1;
const PER_PAGE = 10;

/* populate area filter */
const areas = [...new Set(beneGetAll().map(b => b.area))].sort();
const areaFilter = document.getElementById('area-filter');
areas.forEach(a => { const o = document.createElement('option'); o.value = a; o.textContent = a; areaFilter.appendChild(o); });

function getFiltered() {
  const q   = document.getElementById('search').value.toLowerCase();
  const st  = document.getElementById('status-filter').value;
  const ar  = document.getElementById('area-filter').value;
  return beneGetAll().filter(b => {
    const matchQ  = !q  || b.nameEn.toLowerCase().includes(q) || b.nameKu.includes(q) || b.phone.includes(q) || b.area.toLowerCase().includes(q);
    const matchSt = !st || b.status === st;
    const matchAr = !ar || b.area === ar;
    return matchQ && matchSt && matchAr;
  });
}

function renderStats() {
  const all = beneGetAll();
  document.getElementById('stat-grid').innerHTML = `
    <div class="stat-card">
      <div class="stat-icon blue"><i class="fa-solid fa-users"></i></div>
      <div><div class="stat-value">${all.length}</div><div class="stat-label">Total Registered</div></div>
    </div>
    <div class="stat-card">
      <div class="stat-icon green"><i class="fa-solid fa-circle-check"></i></div>
      <div><div class="stat-value">${all.filter(b=>b.status==='active').length}</div><div class="stat-label">Active</div></div>
    </div>
    <div class="stat-card">
      <div class="stat-icon gold"><i class="fa-solid fa-clock"></i></div>
      <div><div class="stat-value">${all.filter(b=>b.status==='pending').length}</div><div class="stat-label">Pending</div></div>
    </div>
    <div class="stat-card">
      <div class="stat-icon purple"><i class="fa-solid fa-people-group"></i></div>
      <div><div class="stat-value">${all.reduce((s,b)=>s+b.dependents,0)}</div><div class="stat-label">Total Dependents</div></div>
    </div>`;
}

function render() {
  currentPage = 1;
  renderTable();
}

function renderTable() {
  const filtered = getFiltered();
  const paged = paginate(filtered, currentPage, PER_PAGE);
  const dists = distGetAll();

  document.getElementById('table-body').innerHTML = paged.items.length
    ? paged.items.map((b, i) => {
        const distCount = dists.filter(d => d.beneficiaryId === b.id).length;
        const canDelete = user.role === 'admin';
        return `<tr>
          <td class="text-muted" style="font-size:.8rem">${(currentPage-1)*PER_PAGE + i + 1}</td>
          <td>
            <div class="rtl fw-600">${b.nameKu}</div>
            <div class="text-muted" style="font-size:.78rem">${b.nameEn}</div>
          </td>
          <td>${b.phone}</td>
          <td>${b.area}</td>
          <td>${b.dependents} dep. · <span class="text-muted">${b.marital}</span></td>
          <td>${b.income > 0 ? fmtNum(b.income) : '<span class="text-danger">No income</span>'}</td>
          <td>${statusBadge(b.status)}</td>
          <td>
            <div style="display:flex;gap:6px">
              <button class="btn btn-ghost btn-sm btn-icon" title="View profile" onclick="openProfile('${b.id}')">
                <i class="fa-solid fa-eye"></i>
              </button>
              <button class="btn btn-ghost btn-sm btn-icon" title="Edit" onclick="openForm('${b.id}')">
                <i class="fa-solid fa-pen"></i>
              </button>
              ${canDelete ? `<button class="btn btn-ghost btn-sm btn-icon text-danger" title="Delete" onclick="deleteBene('${b.id}','${b.nameEn}')"><i class="fa-solid fa-trash"></i></button>` : ''}
            </div>
          </td>
        </tr>`;
      }).join('')
    : emptyRow(8);

  renderPagination(document.getElementById('pagination'), paged, p => { currentPage = p; renderTable(); });
}

function openProfile(id) {
  const b    = beneGet(id);
  const dists = distGetForBene(id);
  const types = stGetAll();
  const totalAid = dists.reduce((s,d) => s + d.value, 0);
  const net = b.income - b.rent - b.expenses;

  const distRows = dists.length
    ? dists.sort((a,z) => z.date.localeCompare(a.date)).map(d => {
        const st = types.find(t => t.id === d.supportTypeId);
        return `<li>
          <div>
            <div class="fw-600">${st ? st.icon + ' ' + st.name : 'Unknown'} × ${d.qty}</div>
            <div class="timeline-meta">${fmtDate(d.date)} · ${fmtIQD(d.value)} · ${d.donor || '—'}</div>
          </div>
        </li>`;
      }).join('')
    : '<p class="text-muted">No distributions recorded.</p>';

  const byType = {};
  dists.forEach(d => {
    const st = types.find(t => t.id === d.supportTypeId);
    const name = st ? st.name : 'Unknown';
    byType[name] = (byType[name] || 0) + d.value;
  });
  const typeBreakdown = Object.entries(byType).map(([k,v]) => `
    <div style="display:flex;justify-content:space-between;padding:7px 0;border-bottom:1px solid var(--border)">
      <span>${k}</span><span class="text-success fw-600">${fmtIQD(v)}</span>
    </div>`).join('');

  const html = `
    <div class="modal modal-lg">
      <div class="modal-header">
        <span class="modal-title"><i class="fa-solid fa-id-card text-primary"></i> ${b.nameEn}</span>
        <button class="modal-close" onclick="closeModal()">✕</button>
      </div>
      <div class="modal-body">
        <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:20px">
          <div class="stat-card" style="flex-direction:column;align-items:flex-start;gap:4px;padding:14px">
            <div class="text-muted" style="font-size:.75rem">Aid Items</div>
            <div class="stat-value" style="font-size:1.3rem">${dists.length}</div>
          </div>
          <div class="stat-card" style="flex-direction:column;align-items:flex-start;gap:4px;padding:14px">
            <div class="text-muted" style="font-size:.75rem">Total Aid</div>
            <div class="stat-value text-success" style="font-size:1.1rem">${(totalAid/1000).toFixed(0)}K</div>
          </div>
          <div class="stat-card" style="flex-direction:column;align-items:flex-start;gap:4px;padding:14px">
            <div class="text-muted" style="font-size:.75rem">Dependents</div>
            <div class="stat-value" style="font-size:1.3rem">${b.dependents}</div>
          </div>
          <div class="stat-card" style="flex-direction:column;align-items:flex-start;gap:4px;padding:14px">
            <div class="text-muted" style="font-size:.75rem">Income/mo</div>
            <div class="stat-value ${b.income===0?'text-danger':''}" style="font-size:1rem">${b.income===0?'None':fmtNum(b.income)}</div>
          </div>
        </div>
        <div class="tab-nav">
          <button class="tab-btn active" onclick="switchTab(this,'tab-overview')">Overview</button>
          <button class="tab-btn" onclick="switchTab(this,'tab-distributions')">Distributions (${dists.length})</button>
          <button class="tab-btn" onclick="switchTab(this,'tab-financial')">Financial</button>
        </div>
        <div id="tab-overview" class="tab-pane active">
          <div class="detail-grid">
            <div class="detail-item"><label>Kurdish Name</label><div class="val rtl">${b.nameKu}</div></div>
            <div class="detail-item"><label>English Name</label><div class="val">${b.nameEn}</div></div>
            <div class="detail-item"><label>National ID</label><div class="val">${b.nationalId}</div></div>
            <div class="detail-item"><label>Date of Birth</label><div class="val">${fmtDate(b.dob)}</div></div>
            <div class="detail-item"><label>Phone</label><div class="val">${b.phone}${b.phone2?' / '+b.phone2:''}</div></div>
            <div class="detail-item"><label>Marital Status</label><div class="val">${b.marital}</div></div>
            <div class="detail-item"><label>City</label><div class="val">${b.city}</div></div>
            <div class="detail-item"><label>Area</label><div class="val">${b.area}</div></div>
            <div class="detail-item" style="grid-column:1/-1"><label>Address (Kurdish)</label><div class="val rtl">${b.address}</div></div>
            <div class="detail-item"><label>Family Description</label><div class="val rtl">${b.familyDescKu}</div></div>
            <div class="detail-item"><label>Status</label><div class="val">${statusBadge(b.status)}</div></div>
            <div class="detail-item"><label>Reg. Date</label><div class="val">${fmtDate(b.regDate)}</div></div>
            ${b.health ? `<div class="detail-item" style="grid-column:1/-1"><label>Health / Special Needs</label><div class="val text-warning">${b.health}</div></div>` : ''}
            ${b.notes && user.role==='admin' ? `<div class="detail-item" style="grid-column:1/-1"><label>Admin Notes</label><div class="val">${b.notes}</div></div>` : ''}
          </div>
        </div>
        <div id="tab-distributions" class="tab-pane">
          <ul class="timeline">${distRows}</ul>
        </div>
        <div id="tab-financial" class="tab-pane">
          <div class="detail-grid">
            <div class="detail-item"><label>Monthly Income</label><div class="val ${b.income===0?'text-danger':''}">${b.income===0?'No income':fmtIQD(b.income)}</div></div>
            <div class="detail-item"><label>Income Source</label><div class="val">${b.incomeDesc||'—'}</div></div>
            <div class="detail-item"><label>Monthly Rent</label><div class="val">${fmtIQD(b.rent)}</div></div>
            <div class="detail-item"><label>Other Expenses</label><div class="val">${fmtIQD(b.expenses)}</div></div>
            <div class="detail-item"><label>Net Balance</label><div class="val ${net<0?'text-danger':'text-success'}">${fmtIQD(net)}</div></div>
            <div class="detail-item"><label>Total Aid Received</label><div class="val text-success">${fmtIQD(totalAid)}</div></div>
          </div>
          ${typeBreakdown ? `<hr class="divider"><div class="card-title" style="margin-bottom:12px">Aid by Type</div>${typeBreakdown}` : ''}
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-ghost" onclick="closeModal()">Close</button>
        <button class="btn btn-primary" onclick="closeModal();openForm('${b.id}')"><i class="fa-solid fa-pen"></i> Edit</button>
      </div>
    </div>`;
  openModal(html);
}

function switchTab(btn, tabId) {
  btn.closest('.modal-body').querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  btn.closest('.modal-body').querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById(tabId).classList.add('active');
}

function openForm(id = null) {
  const b = id ? beneGet(id) : {};
  const title = id ? 'Edit Beneficiary' : 'Add Beneficiary';

  const html = `
    <div class="modal modal-lg">
      <div class="modal-header">
        <span class="modal-title"><i class="fa-solid fa-user-plus text-primary"></i> ${title}</span>
        <button class="modal-close" onclick="closeModal()">✕</button>
      </div>
      <div class="modal-body">
        <form id="bene-form">
          <div class="form-section">Personal Information</div>
          <div class="form-row">
            <div class="form-group">
              <label>Kurdish Name *</label>
              <input type="text" name="nameKu" value="${b.nameKu||''}" required class="rtl" placeholder="ناوی کوردی">
            </div>
            <div class="form-group">
              <label>English / Arabic Name *</label>
              <input type="text" name="nameEn" value="${b.nameEn||''}" required placeholder="Full name">
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>National ID</label>
              <input type="text" name="nationalId" value="${b.nationalId||''}">
            </div>
            <div class="form-group">
              <label>Date of Birth</label>
              <input type="date" name="dob" value="${b.dob||''}">
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Phone *</label>
              <input type="tel" name="phone" value="${b.phone||''}" required>
            </div>
            <div class="form-group">
              <label>Phone 2</label>
              <input type="tel" name="phone2" value="${b.phone2||''}">
            </div>
          </div>
          <div class="form-section">Family</div>
          <div class="form-row">
            <div class="form-group">
              <label>Marital Status</label>
              <select name="marital">
                ${['married','widow','divorced','single'].map(v=>`<option value="${v}" ${b.marital===v?'selected':''}>${v}</option>`).join('')}
              </select>
            </div>
            <div class="form-group">
              <label>Dependents</label>
              <input type="number" name="dependents" value="${b.dependents||0}" min="0">
            </div>
          </div>
          <div class="form-group">
            <label>Family Description (Kurdish)</label>
            <input type="text" name="familyDescKu" value="${b.familyDescKu||''}" class="rtl" placeholder="وەسفی خێزان">
          </div>
          <div class="form-section">Location</div>
          <div class="form-group">
            <label>Address (Kurdish)</label>
            <input type="text" name="address" value="${b.address||''}" class="rtl">
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>City</label>
              <input type="text" name="city" value="${b.city||'Sulaymaniyah'}">
            </div>
            <div class="form-group">
              <label>Area / Neighborhood</label>
              <input type="text" name="area" value="${b.area||''}">
            </div>
          </div>
          <div class="form-section">Financial</div>
          <div class="form-row">
            <div class="form-group">
              <label>Monthly Income (IQD)</label>
              <input type="number" name="income" value="${b.income||0}" min="0">
            </div>
            <div class="form-group">
              <label>Income Description</label>
              <input type="text" name="incomeDesc" value="${b.incomeDesc||''}">
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Monthly Rent (IQD)</label>
              <input type="number" name="rent" value="${b.rent||0}" min="0">
            </div>
            <div class="form-group">
              <label>Other Expenses (IQD)</label>
              <input type="number" name="expenses" value="${b.expenses||0}" min="0">
            </div>
          </div>
          <div class="form-section">Health & Status</div>
          <div class="form-group">
            <label>Health / Special Circumstances</label>
            <input type="text" name="health" value="${b.health||''}" placeholder="e.g. Diabetes, Disability">
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Case Status</label>
              <select name="status">
                ${['active','pending','inactive'].map(v=>`<option value="${v}" ${(b.status||'active')===v?'selected':''}>${v}</option>`).join('')}
              </select>
            </div>
          </div>
          ${user.role==='admin' ? `<div class="form-group"><label>Admin Notes</label><textarea name="notes">${b.notes||''}</textarea></div>` : ''}
        </form>
      </div>
      <div class="modal-footer">
        <button class="btn btn-ghost" onclick="closeModal()">Cancel</button>
        <button class="btn btn-primary" onclick="saveBene('${id||''}')">
          <i class="fa-solid fa-floppy-disk"></i> Save
        </button>
      </div>
    </div>`;
  openModal(html);
}

function saveBene(id) {
  const form = document.getElementById('bene-form');
  const fd = new FormData(form);
  const data = Object.fromEntries(fd.entries());
  data.id = id || '';
  data.dependents = +data.dependents;
  data.income     = +data.income;
  data.rent       = +data.rent;
  data.expenses   = +data.expenses;
  if (!data.nameKu || !data.nameEn || !data.phone) { toast('Name and phone are required.', 'error'); return; }
  beneSave(data);
  closeModal();
  toast(id ? 'Beneficiary updated.' : 'Beneficiary added.');
  renderStats();
  renderTable();
}

function deleteBene(id, name) {
  confirmDialog(`Delete <strong>${name}</strong>? This will also remove their distribution records.`, () => {
    beneDelete(id);
    toast('Beneficiary deleted.', 'warning');
    renderStats();
    renderTable();
  });
}

function exportExcel() {
  const filtered = getFiltered();
  const headers = ['Name (English)', 'Name (Kurdish)', 'National ID', 'Phone', 'Phone 2', 'Area', 'City', 'Marital', 'Dependents', 'Income (IQD)', 'Rent (IQD)', 'Expenses (IQD)', 'Health', 'Status', 'Reg. Date'];
  const rows = filtered.map(b => [b.nameEn, b.nameKu, b.nationalId, b.phone, b.phone2, b.area, b.city, b.marital, b.dependents, b.income, b.rent, b.expenses, b.health, b.status, b.regDate]);
  exportToExcel(headers, rows, 'beneficiaries');
}

renderStats();
renderTable();
