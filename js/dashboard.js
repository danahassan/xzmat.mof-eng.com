/* ═══════════════════════════════════════
   XZMAT — Dashboard
   ═══════════════════════════════════════ */

const user = requireAuth();
renderSidebar('dashboard.html');

document.getElementById('header-date').textContent = new Date().toLocaleDateString('en-GB', { weekday:'long', day:'numeric', month:'long', year:'numeric' });

const benes = beneGetAll();
const dists = distGetAll();
const dons  = donGetAll();

const totalDonations = dons.reduce((s, d) => s + d.amount, 0);
const activeCount    = benes.filter(b => b.status === 'active').length;

/* ── Stat Cards ─────────────────────────── */
document.getElementById('stat-grid').innerHTML = `
  <div class="stat-card">
    <div class="stat-icon blue"><i class="fa-solid fa-users"></i></div>
    <div><div class="stat-value">${benes.length}</div><div class="stat-label">Total Beneficiaries</div></div>
  </div>
  <div class="stat-card">
    <div class="stat-icon green"><i class="fa-solid fa-circle-check"></i></div>
    <div><div class="stat-value">${activeCount}</div><div class="stat-label">Active Cases</div></div>
  </div>
  <div class="stat-card">
    <div class="stat-icon gold"><i class="fa-solid fa-hand-holding-dollar"></i></div>
    <div><div class="stat-value">${(totalDonations/1000000).toFixed(1)}M</div><div class="stat-label">Total Donations (IQD)</div></div>
  </div>
  <div class="stat-card">
    <div class="stat-icon purple"><i class="fa-solid fa-boxes-stacked"></i></div>
    <div><div class="stat-value">${dists.length}</div><div class="stat-label">Distributions</div></div>
  </div>
`;

/* ── Beneficiaries Table ────────────────── */
const recentBenes = [...benes].sort((a,b) => b.regDate.localeCompare(a.regDate)).slice(0, 8);
document.getElementById('bene-table').innerHTML = recentBenes.map(b => `
  <tr>
    <td><span class="rtl">${b.nameKu}</span><br><span class="text-muted" style="font-size:.78rem">${b.nameEn}</span></td>
    <td>${b.area}</td>
    <td>${statusBadge(b.status)}</td>
    <td>${fmtDate(b.regDate)}</td>
  </tr>`).join('') || emptyRow(4);

/* ── Donations Table ────────────────────── */
const recentDons = [...dons].sort((a,b) => b.date.localeCompare(a.date)).slice(0, 6);
document.getElementById('don-table').innerHTML = recentDons.map(d => `
  <tr>
    <td>${d.donor}</td>
    <td class="text-success fw-600">${fmtIQD(d.amount)}</td>
    <td><span class="badge badge-primary">${d.method}</span></td>
  </tr>`).join('') || emptyRow(3);

/* ── Monthly Distribution Chart ────────── */
const monthLabels = ['Oct','Nov','Dec','Jan','Feb','Mar','Apr'];
const now = new Date();
const monthlyCounts = monthLabels.map((_, i) => {
  const m = new Date(now.getFullYear(), now.getMonth() - (6 - i), 1);
  return dists.filter(d => {
    const dd = new Date(d.date);
    return dd.getMonth() === m.getMonth() && dd.getFullYear() === m.getFullYear();
  }).length;
});

new Chart(document.getElementById('dist-chart'), {
  type: 'bar',
  data: {
    labels: monthLabels,
    datasets: [{
      label: 'Distributions',
      data: monthlyCounts,
      backgroundColor: 'rgba(29,140,248,.6)',
      borderColor: '#1d8cf8',
      borderWidth: 1,
      borderRadius: 5,
    }],
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { color: '#1e3448' }, ticks: { color: '#7f8fa4' } },
      y: { grid: { color: '#1e3448' }, ticks: { color: '#7f8fa4', stepSize: 1 }, beginAtZero: true },
    },
  },
});
