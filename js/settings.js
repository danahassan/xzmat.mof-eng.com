const user = requireAuth();
if (user.role !== 'admin') { window.location.href = 'dashboard.html'; }
renderSidebar('settings.html');

/* Load org settings */
const settings = settingsGet();
document.getElementById('orgName').value   = settings.orgName;
document.getElementById('domain').value    = settings.domain;
document.getElementById('email').value     = settings.email;
document.getElementById('currency').value  = settings.currency;

function saveOrg() {
  const fd = new FormData(document.getElementById('org-form'));
  const data = Object.fromEntries(fd.entries());
  settingsSave(data);
  toast('Organization settings saved.');
}

/* User list */
function renderUsers() {
  const users = usersGetAll();
  document.getElementById('user-list').innerHTML = users.map(u => `
    <div style="display:flex;align-items:center;justify-content:space-between;padding:12px 0;border-bottom:1px solid var(--border)">
      <div style="display:flex;align-items:center;gap:12px">
        <div class="avatar" style="width:36px;height:36px;background:var(--primary-dim);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:.85rem;font-weight:600;color:#fff;flex-shrink:0">
          ${u.name.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase()}
        </div>
        <div>
          <div class="fw-600" style="font-size:.9rem">${u.name}</div>
          <div class="text-muted" style="font-size:.78rem">${u.username} · ${u.role === 'admin' ? 'Administrator' : 'Supervisor'}</div>
        </div>
      </div>
      <div>
        <span class="badge ${u.role === 'admin' ? 'badge-primary' : 'badge-muted'}">${u.role}</span>
        <div class="text-muted" style="font-size:.72rem;text-align:right;margin-top:3px">Last login: ${fmtDate(u.lastLogin)}</div>
      </div>
    </div>`).join('');
}

function resetData() {
  confirmDialog('Reset all data to seed defaults? <strong>This cannot be undone.</strong>', () => {
    localStorage.removeItem('xzmat_db');
    dbInit();
    toast('Data reset to defaults.', 'warning');
    renderUsers();
    const s = settingsGet();
    document.getElementById('orgName').value  = s.orgName;
    document.getElementById('domain').value   = s.domain;
    document.getElementById('email').value    = s.email;
    document.getElementById('currency').value = s.currency;
  });
}

renderUsers();
