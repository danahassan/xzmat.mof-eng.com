/* ═══════════════════════════════════════
   XZMAT — Shared Utilities
   ═══════════════════════════════════════ */

const NAV = [
  { href: 'dashboard.html',      icon: 'fa-gauge',          label: 'Dashboard' },
  { href: 'beneficiaries.html',  icon: 'fa-users',          label: 'Beneficiaries' },
  { href: 'support-types.html',  icon: 'fa-hand-holding-heart', label: 'Support Types' },
  { href: 'distributions.html',  icon: 'fa-boxes-stacked',  label: 'Distributions' },
  { href: 'donations.html',      icon: 'fa-hand-holding-dollar', label: 'Donations' },
  { href: 'payments.html',       icon: 'fa-wallet',         label: 'Payment Methods' },
  { section: 'Admin' },
  { href: 'reports.html',        icon: 'fa-file-chart-column', label: 'Reports', adminOnly: true },
  { href: 'settings.html',       icon: 'fa-gear',           label: 'Settings', adminOnly: true },
];

/* ─── Auth Guard ────────────────────────── */

function requireAuth() {
  const user = authGetUser();
  if (!user) {
    window.location.href = 'index.html';
    return null;
  }
  return user;
}

/* ─── Sidebar ───────────────────────────── */

function renderSidebar(activePage) {
  const user = authGetUser();
  if (!user) return;

  const page = activePage || location.pathname.split('/').pop();

  const navItems = NAV.map(item => {
    if (item.section) {
      if (item.adminOnly && user.role !== 'admin') return '';
      return `<div class="nav-section">${item.section}</div>`;
    }
    if (item.adminOnly && user.role !== 'admin') return '';
    const active = page === item.href ? 'active' : '';
    return `<a href="${item.href}" class="${active}"><i class="fa-solid ${item.icon}"></i>${item.label}</a>`;
  }).join('');

  const initials = user.name.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase();
  const settings = settingsGet();

  document.getElementById('sidebar').innerHTML = `
    <div class="brand">
      <div class="logo-icon"><i class="fa-solid fa-hand-holding-heart"></i></div>
      <span>${settings.orgName.split(' ')[0]}</span>
    </div>
    <nav>${navItems}</nav>
    <div class="sidebar-footer">
      <div class="user-info">
        <div class="avatar">${initials}</div>
        <div>
          <div class="user-name">${user.name}</div>
          <div class="user-role">${user.role === 'admin' ? 'Administrator' : 'Supervisor'}</div>
        </div>
      </div>
      <button class="btn-logout" onclick="logout()">
        <i class="fa-solid fa-right-from-bracket"></i> Sign Out
      </button>
    </div>
  `;

  /* sidebar overlay */
  let overlay = document.getElementById('sidebar-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'sidebar-overlay';
    overlay.className = 'sidebar-overlay';
    document.body.appendChild(overlay);
  }
  overlay.onclick = () => {
    document.getElementById('sidebar').classList.remove('open');
    overlay.classList.remove('visible');
  };

  /* mobile toggle */
  const toggle = document.getElementById('menu-toggle');
  if (toggle) {
    toggle.addEventListener('click', () => {
      document.getElementById('sidebar').classList.toggle('open');
      overlay.classList.toggle('visible');
    });
  }
}

function logout() {
  authClear();
  window.location.href = 'index.html';
}

/* ─── Toast ─────────────────────────────── */

function toast(msg, type = 'success') {
  const icons = { success: 'fa-circle-check', error: 'fa-circle-xmark', warning: 'fa-triangle-exclamation', info: 'fa-circle-info' };
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.innerHTML = `<i class="fa-solid ${icons[type]} ${type}"></i><span>${msg}</span>`;
  document.getElementById('toast-container').appendChild(el);
  setTimeout(() => el.remove(), 3200);
}

/* ─── Modal helpers ─────────────────────── */

function openModal(html) {
  const backdrop = document.createElement('div');
  backdrop.className = 'modal-backdrop';
  backdrop.innerHTML = html;
  document.body.appendChild(backdrop);
  backdrop.addEventListener('click', e => { if (e.target === backdrop) closeModal(); });
  return backdrop;
}

function closeModal() {
  const b = document.querySelector('.modal-backdrop');
  if (b) b.remove();
}

/* ─── Confirm dialog ────────────────────── */

function confirmDialog(msg, onConfirm) {
  const html = `
    <div class="modal modal-sm">
      <div class="modal-header">
        <span class="modal-title"><i class="fa-solid fa-triangle-exclamation text-warning"></i> Confirm</span>
        <button class="modal-close" onclick="closeModal()">✕</button>
      </div>
      <div class="modal-body"><p>${msg}</p></div>
      <div class="modal-footer">
        <button class="btn btn-ghost" onclick="closeModal()">Cancel</button>
        <button class="btn btn-danger" id="confirm-yes">Delete</button>
      </div>
    </div>`;
  openModal(html);
  document.getElementById('confirm-yes').onclick = () => { closeModal(); onConfirm(); };
}

/* ─── Pagination helper ─────────────────── */

function paginate(items, page, perPage) {
  const start = (page - 1) * perPage;
  return {
    items: items.slice(start, start + perPage),
    total: items.length,
    pages: Math.ceil(items.length / perPage),
    page,
  };
}

function renderPagination(container, paged, onChange) {
  if (paged.pages <= 1) { container.innerHTML = ''; return; }
  let btns = '';
  for (let i = 1; i <= paged.pages; i++) {
    btns += `<button class="page-btn ${i === paged.page ? 'active' : ''}" data-p="${i}">${i}</button>`;
  }
  container.innerHTML = `
    <div class="pagination">
      <span>Showing ${Math.min((paged.page-1)*10+1, paged.total)}–${Math.min(paged.page*10, paged.total)} of ${paged.total}</span>
      <div class="pagination-btns">${btns}</div>
    </div>`;
  container.querySelectorAll('.page-btn').forEach(b => b.addEventListener('click', () => onChange(+b.dataset.p)));
}

/* ─── Excel Export ──────────────────────── */

function exportToExcel(headers, rows, filename) {
  function doExport() {
    const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
    ws['!cols'] = headers.map((h, i) => ({
      wch: Math.max(h.length + 2, ...rows.map(r => String(r[i] ?? '').length), 10)
    }));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Data');
    XLSX.writeFile(wb, filename + '_' + new Date().toISOString().slice(0, 10) + '.xlsx');
    toast('Excel file exported.');
  }
  if (typeof XLSX !== 'undefined') { doExport(); return; }
  const s = document.createElement('script');
  s.src = 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js';
  s.onload = doExport;
  document.head.appendChild(s);
}

/* ─── Table empty state ─────────────────── */

function emptyRow(cols, msg = 'No records found') {
  return `<tr><td colspan="${cols}" class="empty-state"><i class="fa-solid fa-inbox"></i><p>${msg}</p></td></tr>`;
}
