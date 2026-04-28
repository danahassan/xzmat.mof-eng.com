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
    <div class="user-row">
      <div class="user-row__main">
        <div class="avatar">${u.name.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase()}</div>
        <div class="user-row__info">
          <div class="fw-600" style="font-size:.9rem">${escapeHtml(u.name)}</div>
          <div class="text-muted" style="font-size:.78rem">${escapeHtml(u.username)} · ${u.role === 'admin' ? 'Administrator' : 'Supervisor'}</div>
          <div class="text-muted" style="font-size:.72rem;margin-top:2px">Last login: ${u.lastLogin ? fmtDate(u.lastLogin) : '—'}</div>
        </div>
      </div>
      <div class="user-row__actions">
        <span class="badge ${u.role === 'admin' ? 'badge-primary' : 'badge-muted'}">${u.role}</span>
        <button class="btn-icon" type="button" data-action="edit"   data-id="${u.id}" aria-label="Edit ${escapeHtml(u.name)}"><i class="fa-solid fa-pen-to-square" aria-hidden="true"></i></button>
        <button class="btn-icon" type="button" data-action="delete" data-id="${u.id}" aria-label="Delete ${escapeHtml(u.name)}"><i class="fa-solid fa-trash text-danger" aria-hidden="true"></i></button>
      </div>
    </div>`).join('');
}

function escapeHtml(s) {
  return String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

/* Add / edit user modal */
function openUserForm(id) {
  const isEdit = !!id;
  document.getElementById('user-modal-title').textContent = isEdit ? 'Edit User' : 'Add User';
  document.getElementById('u-id').value       = id || '';
  document.getElementById('u-name').value     = '';
  document.getElementById('u-username').value = '';
  document.getElementById('u-role').value     = 'supervisor';
  document.getElementById('u-password').value = '';
  const pwLabel = document.getElementById('u-password-label');
  const pwHint  = document.getElementById('u-password-hint');
  const pwInput = document.getElementById('u-password');

  if (isEdit) {
    const u = userGet(id);
    if (!u) { toast('User not found.', 'error'); return; }
    document.getElementById('u-name').value     = u.name;
    document.getElementById('u-username').value = u.username;
    document.getElementById('u-role').value     = u.role;
    pwLabel.textContent = 'New Password';
    pwHint.textContent  = 'Leave blank to keep current password.';
    pwInput.required    = false;
  } else {
    pwLabel.textContent = 'Password *';
    pwHint.textContent  = 'At least 6 characters.';
    pwInput.required    = true;
  }
  openModal('user-modal');
}

function saveUser() {
  const data = {
    id:       document.getElementById('u-id').value || null,
    name:     document.getElementById('u-name').value,
    username: document.getElementById('u-username').value,
    role:     document.getElementById('u-role').value,
    password: document.getElementById('u-password').value,
  };
  try {
    userSave(data);
    closeModal('user-modal');
    toast(data.id ? 'User updated.' : 'User added.');
    renderUsers();
  } catch (err) {
    toast(err.message || 'Failed to save user.', 'error');
  }
}

function deleteUser(id) {
  const u = userGet(id);
  if (!u) return;
  if (u.id === user.id) {
    toast('You cannot delete your own account.', 'error');
    return;
  }
  confirmDialog(`Delete user <strong>${escapeHtml(u.name)}</strong> (${escapeHtml(u.username)})? This cannot be undone.`, () => {
    try {
      userDelete(id);
      toast('User deleted.', 'warning');
      renderUsers();
    } catch (err) {
      toast(err.message || 'Failed to delete user.', 'error');
    }
  });
}

/* Wire up buttons (delegated) */
document.getElementById('btn-add-user').addEventListener('click', () => openUserForm());
document.getElementById('user-list').addEventListener('click', (e) => {
  const btn = e.target.closest('button[data-action]');
  if (!btn) return;
  const { action, id } = btn.dataset;
  if (action === 'edit')   openUserForm(id);
  if (action === 'delete') deleteUser(id);
});

/* Show/hide password toggle */
document.getElementById('u-password-toggle').addEventListener('click', () => {
  const input = document.getElementById('u-password');
  const btn   = document.getElementById('u-password-toggle');
  const show  = input.type === 'password';
  input.type  = show ? 'text' : 'password';
  btn.setAttribute('aria-pressed', show ? 'true' : 'false');
  btn.setAttribute('aria-label', show ? 'Hide password' : 'Show password');
  btn.querySelector('i').className = show ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye';
});

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
