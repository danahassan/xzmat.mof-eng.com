const user = requireAuth();
renderSidebar('support-types.html');

const CAT_COLORS = { Food:'badge-success', Cash:'badge-primary', Clothing:'badge-warning', Shelter:'badge-muted', Medical:'badge-danger', Education:'badge-primary' };

function renderStats() {
  const types = stGetAll();
  const dists = distGetAll();
  const totalValue = dists.reduce((s,d) => s + d.value, 0);
  document.getElementById('stat-grid').innerHTML = `
    <div class="stat-card">
      <div class="stat-icon blue"><i class="fa-solid fa-list"></i></div>
      <div><div class="stat-value">${types.length}</div><div class="stat-label">Support Types</div></div>
    </div>
    <div class="stat-card">
      <div class="stat-icon green"><i class="fa-solid fa-boxes-stacked"></i></div>
      <div><div class="stat-value">${dists.length}</div><div class="stat-label">Total Distributions</div></div>
    </div>
    <div class="stat-card">
      <div class="stat-icon gold"><i class="fa-solid fa-coins"></i></div>
      <div><div class="stat-value">${(totalValue/1000000).toFixed(1)}M</div><div class="stat-label">Total Value (IQD)</div></div>
    </div>`;
}

function renderTable() {
  const q   = document.getElementById('search').value.toLowerCase();
  const cat = document.getElementById('cat-filter').value;
  const dists = distGetAll();

  const types = stGetAll().filter(t =>
    (!q   || t.name.toLowerCase().includes(q) || t.desc.toLowerCase().includes(q)) &&
    (!cat || t.category === cat)
  );

  document.getElementById('table-body').innerHTML = types.length
    ? types.map(t => {
        const count = dists.filter(d => d.supportTypeId === t.id).length;
        const total = dists.filter(d => d.supportTypeId === t.id).reduce((s,d) => s + d.value, 0);
        return `<tr>
          <td style="font-size:1.4rem">${t.icon}</td>
          <td class="fw-600">${t.name}</td>
          <td><span class="badge ${CAT_COLORS[t.category]||'badge-muted'}">${t.category}</span></td>
          <td class="text-success fw-600">${fmtIQD(t.value)}</td>
          <td class="text-muted">${t.desc}</td>
          <td>
            <div style="display:flex;gap:6px">
              <button class="btn btn-ghost btn-sm btn-icon" onclick="openForm('${t.id}')"><i class="fa-solid fa-pen"></i></button>
              <button class="btn btn-ghost btn-sm btn-icon text-danger" onclick="deleteType('${t.id}','${t.name}')"><i class="fa-solid fa-trash"></i></button>
            </div>
          </td>
        </tr>`;
      }).join('')
    : emptyRow(6);
}

function openForm(id = null) {
  const t = id ? stGet(id) : {};
  const html = `
    <div class="modal modal-sm">
      <div class="modal-header">
        <span class="modal-title">${id ? 'Edit' : 'Add'} Support Type</span>
        <button class="modal-close" onclick="closeModal()">✕</button>
      </div>
      <div class="modal-body">
        <form id="st-form">
          <div class="form-row">
            <div class="form-group">
              <label>Icon (emoji)</label>
              <input type="text" name="icon" value="${t.icon||'🎁'}" maxlength="2">
            </div>
            <div class="form-group">
              <label>Category</label>
              <select name="category">
                ${['Food','Cash','Clothing','Shelter','Medical','Education'].map(c=>`<option ${(t.category||'')===c?'selected':''}>${c}</option>`).join('')}
              </select>
            </div>
          </div>
          <div class="form-group">
            <label>Name *</label>
            <input type="text" name="name" value="${t.name||''}" required>
          </div>
          <div class="form-group">
            <label>Unit Value (IQD)</label>
            <input type="number" name="value" value="${t.value||0}" min="0">
          </div>
          <div class="form-group">
            <label>Description</label>
            <textarea name="desc">${t.desc||''}</textarea>
          </div>
        </form>
      </div>
      <div class="modal-footer">
        <button class="btn btn-ghost" onclick="closeModal()">Cancel</button>
        <button class="btn btn-primary" onclick="saveType('${id||''}')"><i class="fa-solid fa-floppy-disk"></i> Save</button>
      </div>
    </div>`;
  openModal(html);
}

function saveType(id) {
  const fd = new FormData(document.getElementById('st-form'));
  const data = Object.fromEntries(fd.entries());
  data.id = id || '';
  data.value = +data.value;
  if (!data.name) { toast('Name is required.', 'error'); return; }
  stSave(data);
  closeModal();
  toast(id ? 'Support type updated.' : 'Support type added.');
  renderStats();
  renderTable();
}

function deleteType(id, name) {
  confirmDialog(`Delete support type <strong>${name}</strong>?`, () => {
    stDelete(id);
    toast('Support type deleted.', 'warning');
    renderStats();
    renderTable();
  });
}

renderStats();
renderTable();
