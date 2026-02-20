const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 5000;
const JWT_SECRET = 'govscheme_secret_key_2024';

app.use(cors());
app.use(express.json());

const DB_FILE = path.join(__dirname, 'db.json');

function readDB() {
  if (!fs.existsSync(DB_FILE)) {
    const initial = { users: [], schemes: [], saved: [], nextUserId: 1, nextSchemeId: 1, nextSavedId: 1 };
    fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2));
    return initial;
  }
  return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
}

function writeDB(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

function seedData() {
  const db = readDB();
  if (!db.users.find(u => u.email === 'admin@govscheme.in')) {
    db.users.push({ id: db.nextUserId++, name: 'Admin', email: 'admin@govscheme.in', password: bcrypt.hashSync('admin123', 10), role: 'admin', state: '', age: null, gender: '', category: '', income: '', occupation: '', created_at: new Date().toISOString() });
  }
  if (db.schemes.length === 0) {
    const schemes = [
      { title: 'PM Kisan Samman Nidhi', description: 'Direct income support of Rs.6,000 per year to small and marginal farmer families having combined landholding upto 2 hectares.', ministry: 'Ministry of Agriculture & Farmers Welfare', category: 'Agriculture', beneficiaries: 'Small & Marginal Farmers', benefits: 'Rs.6,000 per year in 3 installments of Rs.2,000 each directly to bank accounts', eligibility: 'Small and marginal farmer families with combined land holding up to 2 hectares', how_to_apply: 'Apply at nearest Common Service Centre (CSC) or visit pmkisan.gov.in', documents: 'Aadhaar card, Land records, Bank account details', link: 'https://pmkisan.gov.in', state: 'All India', income_limit: 'Any', gender: 'All', age_min: 18, age_max: 100, category_eligible: 'All', status: 'active' },
      { title: 'Pradhan Mantri Awas Yojana', description: 'Housing for All mission to provide affordable housing to urban poor.', ministry: 'Ministry of Housing and Urban Affairs', category: 'Housing', beneficiaries: 'Urban Poor, EWS, LIG, MIG households', benefits: 'Subsidy up to Rs.2.67 lakh on home loans, Direct subsidy for house construction', eligibility: 'Annual household income below Rs.18 lakh, No pucca house in India', how_to_apply: 'Apply through pmaymis.gov.in or nearest Urban Local Body office', documents: 'Aadhaar, Income certificate, Property documents, Bank account', link: 'https://pmaymis.gov.in', state: 'All India', income_limit: 'Below 18 LPA', gender: 'All', age_min: 18, age_max: 70, category_eligible: 'All', status: 'active' },
      { title: 'Ayushman Bharat PM-JAY', description: 'World largest health insurance scheme providing coverage of Rs.5 lakh per family per year.', ministry: 'Ministry of Health & Family Welfare', category: 'Health', beneficiaries: 'Economically weaker sections', benefits: 'Rs.5 lakh health cover per family per year for hospitalization', eligibility: 'Families listed in SECC database 2011 or state schemes', how_to_apply: 'Visit nearest empanelled hospital or Common Service Centre with Aadhaar', documents: 'Aadhaar card, Ration card or SECC document', link: 'https://pmjay.gov.in', state: 'All India', income_limit: 'Below 2.5 LPA', gender: 'All', age_min: 0, age_max: 100, category_eligible: 'All', status: 'active' },
      { title: 'Pradhan Mantri Mudra Yojana', description: 'Micro-credit scheme for non-corporate, non-farm small/micro enterprises.', ministry: 'Ministry of Finance', category: 'Business & Employment', beneficiaries: 'Small business owners, entrepreneurs', benefits: 'Loans up to Rs.10 lakh without collateral', eligibility: 'Non-farm income generating activities, manufacturing, trading or service sector', how_to_apply: 'Apply at any bank, MFI, or visit mudra.org.in', documents: 'Identity proof, Address proof, Business plan, Bank statements', link: 'https://mudra.org.in', state: 'All India', income_limit: 'Any', gender: 'All', age_min: 18, age_max: 65, category_eligible: 'All', status: 'active' },
      { title: 'Sukanya Samriddhi Yojana', description: 'Small savings scheme for girl child to meet education and marriage expenses.', ministry: 'Ministry of Finance', category: 'Women & Child', beneficiaries: 'Girl children below 10 years', benefits: '8.2% interest rate, Tax exemption under 80C, Partial withdrawal at age 18', eligibility: 'Girl child below 10 years, Account opened by parent/guardian', how_to_apply: 'Open account at any post office or authorized bank with minimum Rs.250/year', documents: 'Birth certificate of girl child, Parents Aadhaar, Address proof', link: 'https://india.gov.in/sukanya-samriddhi-yojana', state: 'All India', income_limit: 'Any', gender: 'Female', age_min: 0, age_max: 10, category_eligible: 'All', status: 'active' },
      { title: 'National Scholarship Portal', description: 'Centralized portal for scholarships for SC, ST, OBC, minority students.', ministry: 'Ministry of Electronics & IT', category: 'Education', beneficiaries: 'Students from SC/ST/OBC/Minority communities', benefits: 'Scholarships ranging from Rs.1,000 to Rs.25,000 per annum', eligibility: 'Students from SC/ST/OBC/Minority, enrolled in recognized institutions', how_to_apply: 'Register at scholarships.gov.in and apply before deadline', documents: 'Aadhaar, Caste certificate, Income certificate, Marksheets, Bank account', link: 'https://scholarships.gov.in', state: 'All India', income_limit: 'Below 2.5 LPA', gender: 'All', age_min: 5, age_max: 30, category_eligible: 'SC/ST/OBC/Minority', status: 'active' },
      { title: 'PM Ujjwala Yojana', description: 'LPG connections to women from Below Poverty Line families.', ministry: 'Ministry of Petroleum & Natural Gas', category: 'Women & Child', beneficiaries: 'Women from BPL households', benefits: 'Free LPG connection with first refill and stove', eligibility: 'Women above 18 years from BPL family, No existing LPG connection', how_to_apply: 'Apply at nearest LPG distributor with documents', documents: 'BPL ration card, Aadhaar, Bank account, Address proof', link: 'https://pmuy.gov.in', state: 'All India', income_limit: 'BPL', gender: 'Female', age_min: 18, age_max: 100, category_eligible: 'All', status: 'active' },
      { title: 'Atal Pension Yojana', description: 'Pension scheme for unorganised sector workers guaranteeing fixed pension after 60.', ministry: 'Ministry of Finance', category: 'Social Security', beneficiaries: 'Unorganised sector workers', benefits: 'Guaranteed monthly pension of Rs.1,000 to Rs.5,000 after age 60', eligibility: 'Indian citizens aged 18-40 with savings bank account', how_to_apply: 'Apply at any bank branch where you have savings account', documents: 'Aadhaar, Bank account, Mobile number', link: 'https://npscra.nsdl.co.in', state: 'All India', income_limit: 'Any', gender: 'All', age_min: 18, age_max: 40, category_eligible: 'All', status: 'active' },
      { title: 'Skill India PMKVY', description: 'Free short-term skill training to Indian youth with certification reward.', ministry: 'Ministry of Skill Development', category: 'Education', beneficiaries: 'School/college dropouts and unemployed youth', benefits: 'Free skill training, Rs.8,000 reward on certification, placement assistance', eligibility: 'Indian citizens aged 15-45, school or college dropouts', how_to_apply: 'Register at skillindia.gov.in or visit nearest PMKVY training centre', documents: 'Aadhaar, Educational certificates, Bank account', link: 'https://skillindia.gov.in', state: 'All India', income_limit: 'Any', gender: 'All', age_min: 15, age_max: 45, category_eligible: 'All', status: 'active' },
      { title: 'PM Jan Dhan Yojana', description: 'Financial inclusion scheme providing universal banking access to unbanked citizens.', ministry: 'Ministry of Finance', category: 'Financial Inclusion', beneficiaries: 'Unbanked citizens of India', benefits: 'Zero-balance bank account, RuPay debit card, Rs.2 lakh accident insurance', eligibility: 'Any Indian citizen above 10 years without a bank account', how_to_apply: 'Visit any bank branch or Business Correspondent with documents', documents: 'Aadhaar or any official identity proof', link: 'https://pmjdy.gov.in', state: 'All India', income_limit: 'Any', gender: 'All', age_min: 10, age_max: 100, category_eligible: 'All', status: 'active' },
      { title: 'Beti Bachao Beti Padhao', description: 'National campaign to address declining Child Sex Ratio and empowerment of women.', ministry: 'Ministry of Women & Child Development', category: 'Women & Child', beneficiaries: 'Girl children and women', benefits: 'Educational support, awareness programs, skill development for girls', eligibility: 'Girl children across India, priority in select districts', how_to_apply: 'Contact nearest Anganwadi centre or district Women & Child Development office', documents: 'Birth certificate, Aadhaar', link: 'https://wcd.nic.in/bbbp-schemes', state: 'All India', income_limit: 'Any', gender: 'Female', age_min: 0, age_max: 18, category_eligible: 'All', status: 'active' },
      { title: 'PM SVANidhi Street Vendor Loan', description: 'Affordable working capital loan to street vendors affected by COVID-19.', ministry: 'Ministry of Housing and Urban Affairs', category: 'Business & Employment', beneficiaries: 'Urban street vendors', benefits: 'Initial loan of Rs.10,000 expandable to Rs.50,000 without collateral', eligibility: 'Street vendors with Certificate of Vending or Letter of Recommendation', how_to_apply: 'Apply online at pmsvanidhi.mohua.gov.in or at nearby bank', documents: 'Aadhaar, Vending certificate, Bank account', link: 'https://pmsvanidhi.mohua.gov.in', state: 'All India', income_limit: 'Any', gender: 'All', age_min: 18, age_max: 65, category_eligible: 'All', status: 'active' }
    ];
    schemes.forEach(s => { db.schemes.push({ id: db.nextSchemeId++, ...s, created_at: new Date().toISOString() }); });
    console.log('Seeded 12 government schemes');
  }
  writeDB(db);
}

seedData();

const auth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token' });
  try { req.user = jwt.verify(token, JWT_SECRET); next(); }
  catch { res.status(401).json({ error: 'Invalid token' }); }
};
const admin = (req, res, next) => req.user.role === 'admin' ? next() : res.status(403).json({ error: 'Admin only' });

app.post('/api/auth/register', (req, res) => {
  const { name, email, password, state, age, gender, category, income, occupation } = req.body;
  if (!name || !email || !password) return res.status(400).json({ error: 'Required fields missing' });
  const db = readDB();
  if (db.users.find(u => u.email === email)) return res.status(400).json({ error: 'Email already registered' });
  const user = { id: db.nextUserId++, name, email, password: bcrypt.hashSync(password, 10), role: 'user', state, age, gender, category, income, occupation, created_at: new Date().toISOString() };
  db.users.push(user); writeDB(db);
  const token = jwt.sign({ id: user.id, email, role: 'user' }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, user: { id: user.id, name, email, role: 'user' } });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  const db = readDB();
  const user = db.users.find(u => u.email === email);
  if (!user || !bcrypt.compareSync(password, user.password)) return res.status(401).json({ error: 'Invalid credentials' });
  const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
});

app.get('/api/auth/profile', auth, (req, res) => {
  const db = readDB();
  const user = db.users.find(u => u.id === req.user.id);
  if (!user) return res.status(404).json({ error: 'Not found' });
  const { password, ...safe } = user; res.json(safe);
});

app.put('/api/auth/profile', auth, (req, res) => {
  const db = readDB();
  const idx = db.users.findIndex(u => u.id === req.user.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  db.users[idx] = { ...db.users[idx], ...req.body }; writeDB(db); res.json({ success: true });
});

app.get('/api/schemes', (req, res) => {
  const { search, category, gender, age, page = 1, limit = 9 } = req.query;
  const db = readDB();
  let schemes = db.schemes.filter(s => s.status === 'active');
  if (search) { const q = search.toLowerCase(); schemes = schemes.filter(s => s.title.toLowerCase().includes(q) || s.description.toLowerCase().includes(q) || s.ministry.toLowerCase().includes(q)); }
  if (category && category !== 'All') schemes = schemes.filter(s => s.category === category);
  if (gender && gender !== 'All') schemes = schemes.filter(s => s.gender === 'All' || s.gender === gender);
  if (age) schemes = schemes.filter(s => s.age_min <= parseInt(age) && s.age_max >= parseInt(age));
  const total = schemes.length;
  const pages = Math.ceil(total / parseInt(limit));
  schemes = schemes.slice((page - 1) * parseInt(limit), page * parseInt(limit));
  res.json({ schemes, total, pages });
});

app.get('/api/schemes/eligible/check', auth, (req, res) => {
  const db = readDB();
  const user = db.users.find(u => u.id === req.user.id);
  let schemes = db.schemes.filter(s => s.status === 'active');
  if (user.age) schemes = schemes.filter(s => s.age_min <= parseInt(user.age) && s.age_max >= parseInt(user.age));
  if (user.gender && user.gender !== 'Other') schemes = schemes.filter(s => s.gender === 'All' || s.gender === user.gender);
  res.json(schemes);
});

app.get('/api/schemes/:id', (req, res) => {
  const db = readDB();
  const scheme = db.schemes.find(s => s.id === parseInt(req.params.id));
  if (!scheme) return res.status(404).json({ error: 'Not found' });
  res.json(scheme);
});

app.get('/api/categories', (req, res) => {
  const db = readDB();
  res.json([...new Set(db.schemes.filter(s => s.status === 'active').map(s => s.category))]);
});

app.post('/api/saved/:schemeId', auth, (req, res) => {
  const db = readDB();
  const schemeId = parseInt(req.params.schemeId);
  if (db.saved.find(s => s.user_id === req.user.id && s.scheme_id === schemeId)) return res.json({ saved: false, message: 'Already saved' });
  db.saved.push({ id: db.nextSavedId++, user_id: req.user.id, scheme_id: schemeId, created_at: new Date().toISOString() });
  writeDB(db); res.json({ saved: true });
});

app.delete('/api/saved/:schemeId', auth, (req, res) => {
  const db = readDB();
  db.saved = db.saved.filter(s => !(s.user_id === req.user.id && s.scheme_id === parseInt(req.params.schemeId)));
  writeDB(db); res.json({ removed: true });
});

app.get('/api/saved', auth, (req, res) => {
  const db = readDB();
  const ids = db.saved.filter(s => s.user_id === req.user.id).map(s => s.scheme_id);
  res.json(db.schemes.filter(s => ids.includes(s.id)));
});

app.get('/api/admin/stats', auth, admin, (req, res) => {
  const db = readDB();
  const catMap = {};
  db.schemes.forEach(s => { catMap[s.category] = (catMap[s.category] || 0) + 1; });
  res.json({ totalSchemes: db.schemes.length, totalUsers: db.users.filter(u => u.role === 'user').length, totalSaved: db.saved.length, byCategory: Object.entries(catMap).map(([category, count]) => ({ category, count })) });
});

app.get('/api/admin/schemes', auth, admin, (req, res) => { const db = readDB(); res.json([...db.schemes].reverse()); });

app.post('/api/admin/schemes', auth, admin, (req, res) => {
  const db = readDB();
  const scheme = { id: db.nextSchemeId++, ...req.body, status: 'active', created_at: new Date().toISOString() };
  db.schemes.push(scheme); writeDB(db); res.json({ id: scheme.id });
});

app.put('/api/admin/schemes/:id', auth, admin, (req, res) => {
  const db = readDB();
  const idx = db.schemes.findIndex(s => s.id === parseInt(req.params.id));
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  db.schemes[idx] = { ...db.schemes[idx], ...req.body }; writeDB(db); res.json({ success: true });
});

app.delete('/api/admin/schemes/:id', auth, admin, (req, res) => {
  const db = readDB();
  db.schemes = db.schemes.filter(s => s.id !== parseInt(req.params.id));
  writeDB(db); res.json({ success: true });
});

app.get('/api/admin/users', auth, admin, (req, res) => {
  const db = readDB();
  res.json(db.users.map(({ password, ...u }) => u).reverse());
});

app.listen(PORT, () => {
  console.log('');
  console.log('========================================');
  console.log('  YojnaXpert Backend is RUNNING!');
  console.log('  http://localhost:5000');
  console.log('  Database: db.json (auto-created)');
  console.log('========================================');
  console.log('');
});
