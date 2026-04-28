/* ═══════════════════════════════════════
   XZMAT — Data Layer (localStorage)
   ═══════════════════════════════════════ */

const DB_KEY = 'xzmat_db';

const SEED = {
  users: [
    { id: 'u1', username: 'admin',       password: 'admin2026',  role: 'admin',      name: 'Admin User',         lastLogin: '2026-04-18' },
    { id: 'u2', username: 'supervisor1', password: 'super2026',  role: 'supervisor', name: 'Supervisor One',     lastLogin: '2026-04-17' },
  ],

  beneficiaries: [
    { id: 'b1',  nameKu: 'سەوسەن حسین',       nameEn: 'Sawsan Hussein',       nationalId: '1910123456', dob: '1978-03-14', phone: '07701234501', phone2: '', marital: 'widow',   dependents: 3, familyDescKu: 'بێوەژن + ٣ هەتیو', address: 'شارەوانی ئازادی، کۆلانی ١٢', city: 'Sulaymaniyah', area: 'Azadi',    income: 0,      incomeDesc: 'No income', rent: 60000, expenses: 20000, health: 'Diabetes', status: 'active',   regDate: '2025-01-10', notes: '' },
    { id: 'b2',  nameKu: 'كەریم رەشید',        nameEn: 'Karim Rashid',         nationalId: '1920234567', dob: '1960-07-22', phone: '07701234502', phone2: '', marital: 'married', dependents: 5, familyDescKu: 'هاوسەر + ٤ منداڵ',   address: 'گەڕەکی خەلیفاوە',           city: 'Sulaymaniyah', area: 'Khlifawa', income: 80000,  incomeDesc: 'Casual labour', rent: 50000, expenses: 30000, health: '', status: 'active',   regDate: '2025-01-15', notes: '' },
    { id: 'b3',  nameKu: 'نازنین سەلیم',       nameEn: 'Nazneen Salim',        nationalId: '1930345678', dob: '1985-11-05', phone: '07701234503', phone2: '', marital: 'widow',   dependents: 2, familyDescKu: 'بێوەژن + ٢ منداڵ',    address: 'ناوچەی ئارباتێ',             city: 'Sulaymaniyah', area: 'Arbat',    income: 50000,  incomeDesc: 'Sewing', rent: 40000, expenses: 15000, health: 'Asthma', status: 'active',   regDate: '2025-02-01', notes: '' },
    { id: 'b4',  nameKu: 'ئەحمەد تاهیر',       nameEn: 'Ahmed Tahir',          nationalId: '1940456789', dob: '1955-04-18', phone: '07701234504', phone2: '07601234504', marital: 'married', dependents: 6, familyDescKu: 'هاوسەر + ٥ منداڵ', address: 'گەڕەکی تاوگا',            city: 'Sulaymaniyah', area: 'Tawga',    income: 120000, incomeDesc: 'Pension', rent: 70000, expenses: 40000, health: 'Heart disease', status: 'active',   regDate: '2025-02-10', notes: '' },
    { id: 'b5',  nameKu: 'فاتیمە عومەر',       nameEn: 'Fatima Omar',          nationalId: '1950567890', dob: '1970-09-30', phone: '07701234505', phone2: '', marital: 'divorced', dependents: 3, familyDescKu: 'جیاکراوە + ٣ منداڵ', address: 'ناوچەی سێتوان',           city: 'Sulaymaniyah', area: 'Setwan',   income: 0,      incomeDesc: 'No income', rent: 45000, expenses: 20000, health: '', status: 'active',   regDate: '2025-02-18', notes: '' },
    { id: 'b6',  nameKu: 'مریەم عەلی',         nameEn: 'Maryam Ali',           nationalId: '1960678901', dob: '1990-06-12', phone: '07701234506', phone2: '', marital: 'widow',   dependents: 4, familyDescKu: 'بێوەژن + ٤ منداڵ',   address: 'گەڕەکی ئازادی، کۆلانی ٥',   city: 'Sulaymaniyah', area: 'Azadi',    income: 60000,  incomeDesc: 'Cleaning work', rent: 55000, expenses: 25000, health: '', status: 'active',   regDate: '2025-03-01', notes: '' },
    { id: 'b7',  nameKu: 'هاوكار جەمال',       nameEn: 'Hawkar Jamal',         nationalId: '1970789012', dob: '1982-12-25', phone: '07701234507', phone2: '', marital: 'married', dependents: 4, familyDescKu: 'هاوسەر + ٣ منداڵ',   address: 'ناوچەی خەلیفاوە',            city: 'Sulaymaniyah', area: 'Khlifawa', income: 100000, incomeDesc: 'Driver', rent: 65000, expenses: 35000, health: 'Disabled (leg)', status: 'active',   regDate: '2025-03-10', notes: '' },
    { id: 'b8',  nameKu: 'شیلان محەمەد',       nameEn: 'Shilan Mohammed',      nationalId: '1980890123', dob: '1995-02-08', phone: '07701234508', phone2: '', marital: 'single',  dependents: 0, familyDescKu: 'یەکەلە',              address: 'گەڕەکی ئارباتێ',             city: 'Sulaymaniyah', area: 'Arbat',    income: 150000, incomeDesc: 'Teacher', rent: 80000, expenses: 30000, health: '', status: 'pending',  regDate: '2025-03-20', notes: 'Awaiting verification' },
    { id: 'b9',  nameKu: 'دلشاد ئیبراهیم',     nameEn: 'Dilshad Ibrahim',      nationalId: '1990901234', dob: '1968-08-15', phone: '07701234509', phone2: '07601234509', marital: 'widow', dependents: 5, familyDescKu: 'بێوەژن + ٥ منداڵ', address: 'ناوچەی تاوگا، کۆلانی ٩',  city: 'Sulaymaniyah', area: 'Tawga',    income: 0,      incomeDesc: 'No income', rent: 50000, expenses: 20000, health: 'Depression', status: 'active',   regDate: '2025-04-01', notes: '' },
    { id: 'b10', nameKu: 'ئارام باقی',          nameEn: 'Aram Baqi',            nationalId: '2000012345', dob: '1975-01-20', phone: '07701234510', phone2: '', marital: 'married', dependents: 3, familyDescKu: 'هاوسەر + ٢ منداڵ',   address: 'گەڕەکی سێتوان',              city: 'Sulaymaniyah', area: 'Setwan',   income: 200000, incomeDesc: 'Shop owner', rent: 90000, expenses: 50000, health: '', status: 'active',   regDate: '2025-04-05', notes: '' },
    { id: 'b11', nameKu: 'خاتوو رستەم',         nameEn: 'Khatoo Rustem',        nationalId: '2010123456', dob: '1952-05-10', phone: '07701234511', phone2: '', marital: 'widow',   dependents: 2, familyDescKu: 'بێوەژن + ٢ هەتیو',   address: 'ناوچەی ئازادی',              city: 'Sulaymaniyah', area: 'Azadi',    income: 40000,  incomeDesc: 'Occasional sewing', rent: 35000, expenses: 15000, health: 'Chronic back pain', status: 'active', regDate: '2025-04-08', notes: '' },
    { id: 'b12', nameKu: 'سردار صالح',          nameEn: 'Sardar Saleh',         nationalId: '2020234567', dob: '1987-10-03', phone: '07701234512', phone2: '', marital: 'married', dependents: 4, familyDescKu: 'هاوسەر + ٣ منداڵ',   address: 'گەڕەکی خەلیفاوە، کۆلانی ٣', city: 'Sulaymaniyah', area: 'Khlifawa', income: 90000,  incomeDesc: 'Construction worker', rent: 60000, expenses: 30000, health: '', status: 'pending', regDate: '2025-04-10', notes: 'Document pending' },
    { id: 'b13', nameKu: 'ئەمینە قادر',         nameEn: 'Amina Qadir',          nationalId: '2030345678', dob: '1963-07-28', phone: '07701234513', phone2: '07601234513', marital: 'widow', dependents: 3, familyDescKu: 'بێوەژن + ٣ منداڵ', address: 'ناوچەی ئارباتێ، کۆلانی ٢', city: 'Sulaymaniyah', area: 'Arbat',    income: 0,      incomeDesc: 'No income', rent: 42000, expenses: 18000, health: 'Kidney disease', status: 'active', regDate: '2025-04-12', notes: '' },
    { id: 'b14', nameKu: 'لەیلا شاخوان',        nameEn: 'Layla Shakhwan',       nationalId: '2040456789', dob: '1993-03-17', phone: '07701234514', phone2: '', marital: 'single',  dependents: 1, familyDescKu: 'تەنها + ١ منداڵ',    address: 'گەڕەکی تاوگا',               city: 'Sulaymaniyah', area: 'Tawga',    income: 70000,  incomeDesc: 'Part-time work', rent: 48000, expenses: 22000, health: '', status: 'active',   regDate: '2025-04-14', notes: '' },
    { id: 'b15', nameKu: 'ئومید باکر',           nameEn: 'Omid Baker',           nationalId: '2050567890', dob: '1972-11-11', phone: '07701234515', phone2: '', marital: 'married', dependents: 5, familyDescKu: 'هاوسەر + ٤ منداڵ',   address: 'ناوچەی سێتوان',              city: 'Sulaymaniyah', area: 'Setwan',   income: 110000, incomeDesc: 'Farmer', rent: 58000, expenses: 28000, health: 'Vision impairment', status: 'active', regDate: '2025-04-16', notes: '' },
  ],

  supportTypes: [
    { id: 's1',  name: 'Food Basket',      category: 'Food',      icon: '🧺', value: 30000,  desc: 'Monthly staple food supplies' },
    { id: 's2',  name: 'Dinner Aid',       category: 'Food',      icon: '🍽️', value: 8000,   desc: 'Hot meal assistance' },
    { id: 's3',  name: 'Donor Aid A',      category: 'Cash',      icon: '💵', value: 50000,  desc: 'General donor cash aid' },
    { id: 's4',  name: 'Donor Aid B',      category: 'Cash',      icon: '💵', value: 50000,  desc: 'Targeted cash assistance' },
    { id: 's5',  name: 'Cash Aid',         category: 'Cash',      icon: '💰', value: 18000,  desc: 'Emergency cash support' },
    { id: 's6',  name: 'Meat Package',     category: 'Food',      icon: '🥩', value: 47000,  desc: 'Seasonal meat distribution' },
    { id: 's7',  name: 'Rent Assistance',  category: 'Shelter',   icon: '🏠', value: 150000, desc: 'Monthly rent subsidy' },
    { id: 's8',  name: 'Medical Support',  category: 'Medical',   icon: '💊', value: 100000, desc: 'Medicine and treatment costs' },
    { id: 's9',  name: 'Education Aid',    category: 'Education', icon: '📚', value: 50000,  desc: 'School supplies and fees' },
    { id: 's10', name: 'Clothing Aid',     category: 'Clothing',  icon: '👕', value: 25000,  desc: 'Seasonal clothing package' },
  ],

  distributions: [
    { id: 'd1',  date: '2026-01-05', beneficiaryId: 'b1',  supportTypeId: 's1', qty: 1, value: 30000,  donor: 'Ibrahim Al-Rashid',  notes: '',              recordedBy: 'u1' },
    { id: 'd2',  date: '2026-01-10', beneficiaryId: 'b2',  supportTypeId: 's3', qty: 1, value: 50000,  donor: 'Omar Foundation',     notes: '',              recordedBy: 'u1' },
    { id: 'd3',  date: '2026-01-15', beneficiaryId: 'b3',  supportTypeId: 's7', qty: 1, value: 150000, donor: 'Anonymous',          notes: 'Jan rent',      recordedBy: 'u2' },
    { id: 'd4',  date: '2026-01-20', beneficiaryId: 'b4',  supportTypeId: 's8', qty: 1, value: 100000, donor: 'Fatima Karim',       notes: 'Heart meds',   recordedBy: 'u1' },
    { id: 'd5',  date: '2026-01-25', beneficiaryId: 'b5',  supportTypeId: 's1', qty: 1, value: 30000,  donor: 'Ibrahim Al-Rashid',  notes: '',              recordedBy: 'u2' },
    { id: 'd6',  date: '2026-02-02', beneficiaryId: 'b6',  supportTypeId: 's5', qty: 2, value: 36000,  donor: 'Sara Ahmed',         notes: '',              recordedBy: 'u1' },
    { id: 'd7',  date: '2026-02-08', beneficiaryId: 'b7',  supportTypeId: 's9', qty: 1, value: 50000,  donor: 'Omar Foundation',    notes: 'School fees',  recordedBy: 'u1' },
    { id: 'd8',  date: '2026-02-14', beneficiaryId: 'b9',  supportTypeId: 's6', qty: 1, value: 47000,  donor: 'Anonymous',          notes: 'Eid package',  recordedBy: 'u2' },
    { id: 'd9',  date: '2026-02-20', beneficiaryId: 'b11', supportTypeId: 's2', qty: 5, value: 40000,  donor: 'Ibrahim Al-Rashid',  notes: '',              recordedBy: 'u1' },
    { id: 'd10', date: '2026-03-01', beneficiaryId: 'b1',  supportTypeId: 's7', qty: 1, value: 150000, donor: 'Omar Foundation',    notes: 'Feb rent',     recordedBy: 'u1' },
    { id: 'd11', date: '2026-03-05', beneficiaryId: 'b13', supportTypeId: 's8', qty: 1, value: 100000, donor: 'Fatima Karim',       notes: 'Kidney meds',  recordedBy: 'u2' },
    { id: 'd12', date: '2026-03-12', beneficiaryId: 'b15', supportTypeId: 's10',qty: 1, value: 25000,  donor: 'Anonymous',          notes: 'Spring clothes',recordedBy: 'u1' },
    { id: 'd13', date: '2026-03-18', beneficiaryId: 'b9',  supportTypeId: 's1', qty: 1, value: 30000,  donor: 'Ibrahim Al-Rashid',  notes: '',              recordedBy: 'u1' },
    { id: 'd14', date: '2026-04-01', beneficiaryId: 'b3',  supportTypeId: 's7', qty: 1, value: 150000, donor: 'Omar Foundation',    notes: 'Mar rent',     recordedBy: 'u2' },
    { id: 'd15', date: '2026-04-10', beneficiaryId: 'b6',  supportTypeId: 's3', qty: 1, value: 50000,  donor: 'Sara Ahmed',         notes: '',              recordedBy: 'u1' },
  ],

  donations: [
    { id: 'dn1', date: '2026-01-05', donor: 'Ibrahim Al-Rashid', amount: 5000000, method: 'bank',   ref: 'TRN-2026-001', purpose: 'General fund',     status: 'confirmed' },
    { id: 'dn2', date: '2026-01-12', donor: 'Anonymous',          amount: 2000000, method: 'wallet', ref: 'WLT-2026-002', purpose: 'Food distribution', status: 'confirmed' },
    { id: 'dn3', date: '2026-02-03', donor: 'Fatima Karim',       amount: 1500000, method: 'cash',   ref: 'CSH-2026-003', purpose: 'Medical aid',       status: 'confirmed' },
    { id: 'dn4', date: '2026-02-20', donor: 'Omar Foundation',     amount: 10000000,method: 'bank',   ref: 'TRN-2026-004', purpose: 'Shelter support',   status: 'confirmed' },
    { id: 'dn5', date: '2026-03-15', donor: 'Sara Ahmed',          amount: 500000,  method: 'wallet', ref: 'WLT-2026-005', purpose: 'Education aid',     status: 'confirmed' },
  ],

  wallets: [
    { id: 'w1', provider: 'ZainCash',   accountName: 'XZMAT Program',   number: '07801234567', notes: 'Primary wallet' },
    { id: 'w2', provider: 'FastPay',    accountName: 'XZMAT Donations', number: '07701234567', notes: 'Secondary wallet' },
  ],

  banks: [
    { id: 'bk1', bank: 'Rasheed Bank',         accountName: 'XZMAT Organization', iban: 'IQ12RASH000000001234567', branch: 'Sulaymaniyah Main', currency: 'IQD', instructions: 'Include program name in reference' },
    { id: 'bk2', bank: 'Trade Bank of Iraq',   accountName: 'XZMAT Organization', iban: 'IQ12TRBI000000009876543', branch: 'Sulaymaniyah Branch', currency: 'USD', instructions: 'USD transfers only' },
  ],

  settings: {
    orgName: 'XZMAT Social Support Program',
    domain: 'xzmat.mof-eng.com',
    email: 'support@xzmat.mof-eng.com',
    currency: 'IQD',
  },
};

/* ─── Init ─────────────────────────────── */

function dbInit() {
  if (!localStorage.getItem(DB_KEY)) {
    localStorage.setItem(DB_KEY, JSON.stringify(SEED));
  }
}

function dbGet() {
  return JSON.parse(localStorage.getItem(DB_KEY));
}

function dbSave(db) {
  localStorage.setItem(DB_KEY, JSON.stringify(db));
}

/* ─── Users ────────────────────────────── */

function usersGetAll()          { return dbGet().users; }
function userGet(id)            { return dbGet().users.find(u => u.id === id) || null; }
function userFind(username, pw) { return dbGet().users.find(u => u.username === username && u.password === pw) || null; }
function userUpdateLogin(id)    {
  const db = dbGet();
  const u = db.users.find(u => u.id === id);
  if (u) { u.lastLogin = new Date().toISOString().slice(0,10); dbSave(db); }
}

function userSave(data) {
  const db = dbGet();
  const username = (data.username || '').trim().toLowerCase();
  if (!username) throw new Error('Username is required.');
  if (!data.name || !data.name.trim()) throw new Error('Full name is required.');
  if (!['admin','supervisor'].includes(data.role)) throw new Error('Invalid role.');

  // unique username (case-insensitive), excluding self
  const dup = db.users.find(u => u.username.toLowerCase() === username && u.id !== data.id);
  if (dup) throw new Error('Username already exists.');

  if (data.id) {
    const u = db.users.find(x => x.id === data.id);
    if (!u) throw new Error('User not found.');
    u.username = username;
    u.name     = data.name.trim();
    u.role     = data.role;
    if (data.password) {
      if (data.password.length < 6) throw new Error('Password must be at least 6 characters.');
      u.password = data.password;
    }
  } else {
    if (!data.password || data.password.length < 6) throw new Error('Password must be at least 6 characters.');
    db.users.push({
      id: 'u' + Date.now(),
      username,
      name: data.name.trim(),
      role: data.role,
      password: data.password,
      lastLogin: '',
    });
  }
  dbSave(db);
}

function userDelete(id) {
  const db = dbGet();
  const target = db.users.find(u => u.id === id);
  if (!target) return;
  // Don't allow deleting the last admin
  const adminsLeft = db.users.filter(u => u.role === 'admin' && u.id !== id).length;
  if (target.role === 'admin' && adminsLeft === 0) {
    throw new Error('Cannot delete the last administrator.');
  }
  db.users = db.users.filter(u => u.id !== id);
  dbSave(db);
}

/* ─── Beneficiaries ────────────────────── */

function beneGetAll()    { return dbGet().beneficiaries; }
function beneGet(id)     { return dbGet().beneficiaries.find(b => b.id === id) || null; }

function beneSave(data) {
  const db = dbGet();
  const idx = db.beneficiaries.findIndex(b => b.id === data.id);
  if (idx >= 0) db.beneficiaries[idx] = data;
  else {
    data.id = 'b' + Date.now();
    data.regDate = new Date().toISOString().slice(0,10);
    db.beneficiaries.push(data);
  }
  dbSave(db);
  return data;
}

function beneDelete(id) {
  const db = dbGet();
  db.beneficiaries = db.beneficiaries.filter(b => b.id !== id);
  dbSave(db);
}

/* ─── Support Types ────────────────────── */

function stGetAll()  { return dbGet().supportTypes; }
function stGet(id)   { return dbGet().supportTypes.find(s => s.id === id) || null; }

function stSave(data) {
  const db = dbGet();
  const idx = db.supportTypes.findIndex(s => s.id === data.id);
  if (idx >= 0) db.supportTypes[idx] = data;
  else { data.id = 's' + Date.now(); db.supportTypes.push(data); }
  dbSave(db);
  return data;
}

function stDelete(id) {
  const db = dbGet();
  db.supportTypes = db.supportTypes.filter(s => s.id !== id);
  dbSave(db);
}

/* ─── Distributions ────────────────────── */

function distGetAll()     { return dbGet().distributions; }
function distGetForBene(bId) { return dbGet().distributions.filter(d => d.beneficiaryId === bId); }

function distSave(data) {
  const db = dbGet();
  const idx = db.distributions.findIndex(d => d.id === data.id);
  if (idx >= 0) db.distributions[idx] = data;
  else {
    data.id = 'd' + Date.now();
    const user = authGetUser();
    data.recordedBy = user ? user.id : 'u1';
    db.distributions.push(data);
  }
  dbSave(db);
  return data;
}

function distDelete(id) {
  const db = dbGet();
  db.distributions = db.distributions.filter(d => d.id !== id);
  dbSave(db);
}

/* ─── Donations ────────────────────────── */

function donGetAll()  { return dbGet().donations; }
function donGet(id)   { return dbGet().donations.find(d => d.id === id) || null; }

/* unique, sorted list of past donor names (for selectors / suggestions) */
function donGetDonors() {
  const names = donGetAll().map(d => (d.donor || '').trim()).filter(Boolean);
  return [...new Set(names)].sort((a, b) => a.localeCompare(b));
}

/* Support pool: money donations + in-kind ('other') donations,
   minus the value of all distributions made.
   Treats donations missing a `kind` field as 'money' (back-compat). */
function supportBalance(excludeDistId) {
  const dons  = donGetAll().filter(d => (d.status || 'confirmed') !== 'cancelled');
  const dists = distGetAll().filter(d => !excludeDistId || d.id !== excludeDistId);
  const totalMoney = dons.filter(d => (d.kind || 'money') === 'money').reduce((s,d) => s + (+d.amount || 0), 0);
  const totalOther = dons.filter(d => d.kind === 'other').reduce((s,d) => s + (+d.amount || 0), 0);
  const totalReceived    = totalMoney + totalOther;
  const totalDistributed = dists.reduce((s,d) => s + (+d.value || 0), 0);
  return {
    totalMoney,
    totalOther,
    totalReceived,
    totalDistributed,
    available: totalReceived - totalDistributed,
  };
}

function donSave(data) {
  const db = dbGet();
  const idx = db.donations.findIndex(d => d.id === data.id);
  if (idx >= 0) db.donations[idx] = data;
  else { data.id = 'dn' + Date.now(); db.donations.push(data); }
  dbSave(db);
  return data;
}

function donDelete(id) {
  const db = dbGet();
  db.donations = db.donations.filter(d => d.id !== id);
  dbSave(db);
}

/* ─── Wallets ──────────────────────────── */

function walletsGetAll()  { return dbGet().wallets; }
function walletSave(data) {
  const db = dbGet();
  const idx = db.wallets.findIndex(w => w.id === data.id);
  if (idx >= 0) db.wallets[idx] = data;
  else { data.id = 'w' + Date.now(); db.wallets.push(data); }
  dbSave(db);
}

function walletDelete(id) {
  const db = dbGet();
  db.wallets = db.wallets.filter(w => w.id !== id);
  dbSave(db);
}

/* ─── Banks ────────────────────────────── */

function banksGetAll()  { return dbGet().banks; }
function bankSave(data) {
  const db = dbGet();
  const idx = db.banks.findIndex(b => b.id === data.id);
  if (idx >= 0) db.banks[idx] = data;
  else { data.id = 'bk' + Date.now(); db.banks.push(data); }
  dbSave(db);
}

function bankDelete(id) {
  const db = dbGet();
  db.banks = db.banks.filter(b => b.id !== id);
  dbSave(db);
}

/* ─── Settings ─────────────────────────── */

function settingsGet()      { return dbGet().settings; }
function settingsSave(data) { const db = dbGet(); db.settings = data; dbSave(db); }

/* ─── Auth helpers (session) ───────────── */

function authGetUser()  { const s = sessionStorage.getItem('xzmat_user'); return s ? JSON.parse(s) : null; }
function authSetUser(u) { sessionStorage.setItem('xzmat_user', JSON.stringify(u)); }
function authClear()    { sessionStorage.removeItem('xzmat_user'); }

/* ─── Utilities ────────────────────────── */

function fmtIQD(n)  { return Number(n).toLocaleString() + ' IQD'; }
function fmtNum(n)  { return Number(n).toLocaleString(); }
function fmtDate(d) { if (!d) return '—'; const dt = new Date(d); return dt.toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' }); }

function statusBadge(s) {
  const map = { active: 'badge-success', pending: 'badge-warning', inactive: 'badge-danger', confirmed: 'badge-success', cancelled: 'badge-danger' };
  return `<span class="badge ${map[s] || 'badge-muted'}">${s}</span>`;
}

dbInit();
