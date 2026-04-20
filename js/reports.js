const user = requireAuth();
if (user.role !== 'admin') { window.location.href = 'dashboard.html'; }
renderSidebar('reports.html');

const FIELDS = {
  beneficiaries: [
    { key:'nameEn',      label:'Name (English)' },
    { key:'nameKu',      label:'Name (Kurdish)' },
    { key:'nationalId',  label:'National ID' },
    { key:'phone',       label:'Phone' },
    { key:'area',        label:'Area' },
    { key:'marital',     label:'Marital Status' },
    { key:'dependents',  label:'Dependents' },
    { key:'income',      label:'Monthly Income' },
    { key:'status',      label:'Status' },
    { key:'regDate',     label:'Reg. Date' },
  ],
  distributions: [
    { key:'date',        label:'Date' },
    { key:'beneficiary', label:'Beneficiary' },
    { key:'supportType', label:'Support Type' },
    { key:'qty',         label:'Qty' },
    { key:'value',       label:'Value (IQD)' },
    { key:'donor',       label:'Donor' },
  ],
  donations: [
    { key:'date',        label:'Date' },
    { key:'donor',       label:'Donor' },
    { key:'amount',      label:'Amount (IQD)' },
    { key:'method',      label:'Method' },
    { key:'ref',         label:'Reference' },
    { key:'purpose',     label:'Purpose' },
    { key:'status',      label:'Status' },
  ],
};

function updateFields() {
  const type = document.getElementById('report-type').value;
  document.getElementById('field-checkboxes').innerHTML = `
    <label style="margin-bottom:8px;display:block">Fields to include</label>
    ${FIELDS[type].map(f => `
      <label style="display:flex;align-items:center;gap:8px;padding:5px 0;cursor:pointer;font-size:.875rem;color:var(--text)">
        <input type="checkbox" name="field" value="${f.key}" checked style="width:auto">
        ${f.label}
      </label>`).join('')}`;
}

updateFields();

function pdfHeader(doc, title) {
  const settings = settingsGet();
  doc.setFillColor(8, 17, 30);
  doc.rect(0, 0, doc.internal.pageSize.width, 28, 'F');
  doc.setTextColor(29, 140, 248);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(settings.orgName, 14, 12);
  doc.setTextColor(200, 210, 220);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(title, 14, 20);
  doc.text(new Date().toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' }), doc.internal.pageSize.width - 14, 20, { align:'right' });
  doc.setTextColor(30, 52, 72);
  doc.rect(0, 28, doc.internal.pageSize.width, 0.5, 'F');
}

function pdfFooter(doc) {
  const settings = settingsGet();
  const pages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i);
    const w = doc.internal.pageSize.width;
    const h = doc.internal.pageSize.height;
    doc.setFontSize(8);
    doc.setTextColor(127, 143, 164);
    doc.text(settings.orgName + ' · ' + settings.domain, 14, h - 8);
    doc.text(`Page ${i} of ${pages} · Confidential`, w - 14, h - 8, { align:'right' });
  }
}

function generatePDF() {
  const type   = document.getElementById('report-type').value;
  const status = document.getElementById('report-status').value;
  const checked = [...document.querySelectorAll('[name="field"]:checked')].map(c => c.value);
  if (!checked.length) { toast('Select at least one field.', 'error'); return; }

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ orientation: 'landscape' });

  const title = type.charAt(0).toUpperCase() + type.slice(1) + ' Report';
  pdfHeader(doc, title);

  const fields = FIELDS[type].filter(f => checked.includes(f.key));
  const headers = fields.map(f => f.label);
  let rows = [];

  if (type === 'beneficiaries') {
    let data = beneGetAll();
    if (status) data = data.filter(b => b.status === status);
    rows = data.map(b => fields.map(f => {
      if (f.key === 'income') return b.income === 0 ? 'No income' : fmtIQD(b.income);
      if (f.key === 'regDate') return fmtDate(b.regDate);
      return b[f.key] ?? '—';
    }));
  } else if (type === 'distributions') {
    const benes = beneGetAll();
    const types = stGetAll();
    rows = distGetAll().sort((a,b) => b.date.localeCompare(a.date)).map(d => {
      const bn = benes.find(x => x.id === d.beneficiaryId);
      const st = types.find(x => x.id === d.supportTypeId);
      return fields.map(f => {
        if (f.key === 'date')        return fmtDate(d.date);
        if (f.key === 'beneficiary') return bn ? bn.nameEn : '—';
        if (f.key === 'supportType') return st ? st.name : '—';
        if (f.key === 'value')       return fmtIQD(d.value);
        return d[f.key] ?? '—';
      });
    });
  } else {
    rows = donGetAll().sort((a,b) => b.date.localeCompare(a.date)).map(d =>
      fields.map(f => {
        if (f.key === 'date')   return fmtDate(d.date);
        if (f.key === 'amount') return fmtIQD(d.amount);
        return d[f.key] ?? '—';
      })
    );
  }

  doc.autoTable({
    head: [headers],
    body: rows,
    startY: 34,
    styles: { fontSize: 8, cellPadding: 3, textColor: [200, 210, 220], fillColor: [15, 29, 46] },
    headStyles: { fillColor: [22, 36, 54], textColor: [29, 140, 248], fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [12, 22, 36] },
    margin: { left: 14, right: 14 },
  });

  pdfFooter(doc);
  doc.save(`xzmat-${type}-${new Date().toISOString().slice(0,10)}.pdf`);
  toast('PDF generated successfully.');
}

function quickExport(type) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ orientation: 'landscape' });

  if (type === 'all-beneficiaries' || type === 'active-beneficiaries') {
    let data = beneGetAll();
    if (type === 'active-beneficiaries') data = data.filter(b => b.status === 'active');
    pdfHeader(doc, type === 'active-beneficiaries' ? 'Active Beneficiaries' : 'All Beneficiaries');
    doc.autoTable({
      head: [['Name', 'Phone', 'Area', 'Family', 'Dependents', 'Income', 'Status', 'Reg. Date']],
      body: data.map(b => [b.nameEn, b.phone, b.area, b.marital, b.dependents, b.income===0?'None':fmtIQD(b.income), b.status, fmtDate(b.regDate)]),
      startY: 34,
      styles: { fontSize: 8, cellPadding: 3, textColor: [200,210,220], fillColor: [15,29,46] },
      headStyles: { fillColor: [22,36,54], textColor: [29,140,248], fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [12,22,36] },
      margin: { left:14, right:14 },
    });

  } else if (type === 'distributions') {
    const benes = beneGetAll(); const types = stGetAll();
    pdfHeader(doc, 'Distribution Records');
    doc.autoTable({
      head: [['Date','Beneficiary','Support Type','Qty','Value (IQD)','Donor']],
      body: distGetAll().sort((a,b)=>b.date.localeCompare(a.date)).map(d => {
        const bn = benes.find(x=>x.id===d.beneficiaryId);
        const st = types.find(x=>x.id===d.supportTypeId);
        return [fmtDate(d.date), bn?bn.nameEn:'—', st?st.name:'—', d.qty, fmtIQD(d.value), d.donor||'—'];
      }),
      startY: 34,
      styles: { fontSize: 8, cellPadding: 3, textColor: [200,210,220], fillColor: [15,29,46] },
      headStyles: { fillColor: [22,36,54], textColor: [29,140,248], fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [12,22,36] },
      margin: { left:14, right:14 },
    });

  } else if (type === 'donations') {
    pdfHeader(doc, 'Donations Ledger');
    doc.autoTable({
      head: [['Date','Donor','Amount (IQD)','Method','Reference','Purpose','Status']],
      body: donGetAll().sort((a,b)=>b.date.localeCompare(a.date)).map(d=>[fmtDate(d.date),d.donor,fmtIQD(d.amount),d.method,d.ref||'—',d.purpose||'—',d.status]),
      startY: 34,
      styles: { fontSize: 8, cellPadding: 3, textColor: [200,210,220], fillColor: [15,29,46] },
      headStyles: { fillColor: [22,36,54], textColor: [29,140,248], fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [12,22,36] },
      margin: { left:14, right:14 },
    });

  } else if (type === 'summary') {
    const docP = new jsPDF();
    const benes = beneGetAll(); const dists = distGetAll(); const dons = donGetAll();
    const settings = settingsGet();
    pdfHeader(docP, 'Program Summary Report');
    docP.setFontSize(10); docP.setTextColor(200,210,220);
    const lines = [
      ['Total Beneficiaries', benes.length],
      ['Active Cases', benes.filter(b=>b.status==='active').length],
      ['Pending Cases', benes.filter(b=>b.status==='pending').length],
      ['Total Distributions', dists.length],
      ['Total Aid Value', fmtIQD(dists.reduce((s,d)=>s+d.value,0))],
      ['Total Donations', fmtIQD(dons.reduce((s,d)=>s+d.amount,0))],
      ['Unique Donors', new Set(dons.filter(d=>d.donor!=='Anonymous').map(d=>d.donor)).size],
    ];
    docP.autoTable({
      body: lines.map(([k,v]) => [k, v]),
      startY: 34,
      styles: { fontSize: 10, cellPadding: 5, textColor:[200,210,220], fillColor:[15,29,46] },
      columnStyles: { 0:{ fontStyle:'bold', textColor:[29,140,248] }, 1:{ halign:'right' } },
      alternateRowStyles: { fillColor:[12,22,36] },
      margin: { left:14, right:14 },
    });
    pdfFooter(docP);
    docP.save(`xzmat-summary-${new Date().toISOString().slice(0,10)}.pdf`);
    toast('Summary PDF exported.');
    return;
  }

  pdfFooter(doc);
  doc.save(`xzmat-${type}-${new Date().toISOString().slice(0,10)}.pdf`);
  toast('PDF exported successfully.');
}
