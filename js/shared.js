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
    return `<a href="${item.href}" class="${active}"><i class="fa-solid ${item.icon}" aria-hidden="true"></i>${item.label}</a>`;
  }).join('');

  const initials = user.name.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase();
  const settings = settingsGet();

  document.getElementById('sidebar').innerHTML = `
    <div class="brand">
      <div class="logo-icon"><i class="fa-solid fa-hand-holding-heart" aria-hidden="true"></i></div>
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
        <i class="fa-solid fa-right-from-bracket" aria-hidden="true"></i> Sign Out
      </button>
    </div>
  `;

  /* sidebar a11y */
  const sidebarEl = document.getElementById('sidebar');
  sidebarEl.setAttribute('role', 'navigation');
  sidebarEl.setAttribute('aria-label', 'Main navigation');

  /* sidebar overlay */
  let overlay = document.getElementById('sidebar-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'sidebar-overlay';
    overlay.className = 'sidebar-overlay';
    document.body.appendChild(overlay);
  }
  const closeSidebar = () => {
    sidebarEl.classList.remove('open');
    overlay.classList.remove('visible');
    const t = document.getElementById('menu-toggle');
    if (t) t.setAttribute('aria-expanded', 'false');
  };
  overlay.onclick = closeSidebar;

  /* mobile toggle */
  const toggle = document.getElementById('menu-toggle');
  if (toggle) {
    toggle.setAttribute('aria-label', 'Toggle navigation menu');
    toggle.setAttribute('aria-controls', 'sidebar');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.addEventListener('click', () => {
      const opened = sidebarEl.classList.toggle('open');
      overlay.classList.toggle('visible', opened);
      toggle.setAttribute('aria-expanded', opened ? 'true' : 'false');
    });
  }

  /* close sidebar with Esc on mobile */
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && sidebarEl.classList.contains('open')) closeSidebar();
  });
}

/* ─── Page Header ───────────────────────── */

function renderPageHeader(opts) {
  const host = document.getElementById('page-header');
  if (!host) return;
  const actions = (opts.actions || []).map((a, i) => {
    const cls = `btn ${a.variant ? 'btn-' + a.variant : 'btn-ghost'}`;
    const id  = `pgh-action-${i}`;
    return `<button id="${id}" class="${cls}" aria-label="${a.label}">
      ${a.icon ? `<i class="fa-solid ${a.icon}" aria-hidden="true"></i>` : ''}
      <span>${a.label}</span>
    </button>`;
  }).join('');
  host.className = 'page-header';
  host.innerHTML = `
    <div class="page-header__title-group">
      <button id="menu-toggle" aria-label="Toggle navigation menu"><i class="fa-solid fa-bars" aria-hidden="true"></i></button>
      <h1>${opts.icon ? `<i class="fa-solid ${opts.icon}" aria-hidden="true" style="color:var(--primary);margin-right:8px"></i>` : ''}${opts.title}</h1>
    </div>
    <div class="header-actions"${opts.dateSlot ? ' id="header-date"' : ''}>${actions}</div>`;
  (opts.actions || []).forEach((a, i) => {
    const btn = document.getElementById(`pgh-action-${i}`);
    if (btn && a.onClick) btn.addEventListener('click', a.onClick);
  });
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
  el.innerHTML = `<i class="fa-solid ${icons[type]} ${type}" aria-hidden="true"></i><span>${msg}</span>`;
  document.getElementById('toast-container').appendChild(el);
  setTimeout(() => el.remove(), 3200);
}

/* ─── Modal helpers ─────────────────────── */

let _modalReturnFocus = null;
let _modalKeyHandler = null;

function openModal(html) {
  _modalReturnFocus = document.activeElement;
  const backdrop = document.createElement('div');
  backdrop.className = 'modal-backdrop';
  backdrop.innerHTML = html;
  document.body.appendChild(backdrop);
  document.body.style.overflow = 'hidden';

  const modalEl = backdrop.querySelector('.modal');
  if (modalEl) {
    modalEl.setAttribute('role', 'dialog');
    modalEl.setAttribute('aria-modal', 'true');
    const titleEl = modalEl.querySelector('.modal-title');
    if (titleEl) {
      if (!titleEl.id) titleEl.id = 'modal-title-' + Date.now();
      modalEl.setAttribute('aria-labelledby', titleEl.id);
    }
    modalEl.querySelectorAll('.modal-close').forEach(btn => {
      if (!btn.getAttribute('aria-label')) btn.setAttribute('aria-label', 'Close dialog');
    });
  }

  backdrop.addEventListener('click', e => { if (e.target === backdrop) closeModal(); });

  /* focus first focusable */
  const focusables = backdrop.querySelectorAll(
    'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
  );
  if (focusables.length) focusables[0].focus();

  /* Esc + focus trap */
  _modalKeyHandler = e => {
    if (e.key === 'Escape') { e.preventDefault(); closeModal(); return; }
    if (e.key === 'Tab' && focusables.length) {
      const first = focusables[0];
      const last  = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  };
  document.addEventListener('keydown', _modalKeyHandler);
  return backdrop;
}

function closeModal() {
  const b = document.querySelector('.modal-backdrop');
  if (b) b.remove();
  document.body.style.overflow = '';
  if (_modalKeyHandler) {
    document.removeEventListener('keydown', _modalKeyHandler);
    _modalKeyHandler = null;
  }
  if (_modalReturnFocus && typeof _modalReturnFocus.focus === 'function') {
    _modalReturnFocus.focus();
  }
  _modalReturnFocus = null;
}

/* ─── Confirm dialog ────────────────────── */

function confirmDialog(msg, onConfirm) {
  const html = `
    <div class="modal modal-sm">
      <div class="modal-header">
        <span class="modal-title"><i class="fa-solid fa-triangle-exclamation text-warning" aria-hidden="true"></i> Confirm</span>
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
  return `<tr><td colspan="${cols}" class="empty-state"><i class="fa-solid fa-inbox" aria-hidden="true"></i><p>${msg}</p></td></tr>`;
}

/* ─── Skeleton loading rows ─────────────── */

function skeletonRows(cols, rows = 6) {
  const cells = Array.from({ length: cols }, () => '<td><span class="skeleton"></span></td>').join('');
  return Array.from({ length: rows }, () => `<tr class="skeleton-row" aria-hidden="true">${cells}</tr>`).join('');
}

/* ─── Debounce ──────────────────────────── */

function debounce(fn, wait = 200) {
  let t;
  return function (...args) {
    clearTimeout(t);
    t = setTimeout(() => fn.apply(this, args), wait);
  };
}
