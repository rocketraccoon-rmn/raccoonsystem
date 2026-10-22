/**
 * Weekly Usage - Google Apps Script backend (v3: login accounts, CSV export, stats)
 * Paste into the Google Sheet: Extensions > Apps Script, then
 * Deploy > New deployment (Web app, Execute as: Me, Who has access: Anyone)
 * or, for an existing deployment: Deploy > Manage deployments > pencil > New version.
 */
const SETUP_CODE = 'change-me';   // CHANGE THIS before the first use. It is needed once, to create the first admin account.
const SESSION_HOURS = 12, REMEMBER_DAYS = 7;

const CFG = {
  'Teacher Created': { cols: 'CFGHIJKLMNOQR', keys: ['C','F','K'], title: 'K', status: 'R', fb: {F:'A',G:'D',H:'V',I:'M',J:'P',Q:'S'} },
  'OER':             { cols: 'CFGHIJKLNOP',   keys: ['C','F','J'], title: 'J', status: 'P', fb: {F:'A',G:'D',H:'V',I:'M',K:'Y',O:'S'} },
  'AR':              { cols: 'CFGHIJKLMOP',   keys: ['C','F','J'], title: 'J', status: 'P', fb: {F:'A',G:'D',H:'V',I:'M',O:'S'} }
};
const UPLOAD = { 'Teacher Created': 'TCUPLOAD', 'OER': 'OERUPLOAD', 'AR': 'ARUPLOAD' };
const GRIDS = { 'Weekly Usage': 'Weekly Usage', 'Section Weekly Usage': 'Weekly Usage (Sections)' };
/* finds the tab by name, tolerant of small naming differences:
   'Weekly Usage (Sections)', 'Weekly Usage (Section)', 'Section Weekly Usage', ... */
function findGrid_(ss, wanted) {
  const tabs = ss.getSheets(), names = tabs.map(function (s) { return s.getName(); });
  const norm = function (s) { return String(s).toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim(); };
  let hit;
  if (wanted === 'Weekly Usage') hit = tabs.filter(function (s) { return norm(s.getName()) === 'weekly usage'; })[0];
  else hit = tabs.filter(function (s) { const n = norm(s.getName()); return /weekly/.test(n) && /section/.test(n); })[0];
  return { sheet: hit, names: names };
}
const UH = ['username','name','role','salt','hash','active','created','lastLogin'];

function colNum_(L) { return L.charCodeAt(0) - 64; }
function json_(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }
function uniq_(a) { const s = {}; return a.map(function (x) { return String(x).trim(); }).filter(function (x) { if (!x || s[x]) return false; s[x] = 1; return true; }); }
const RH = ['username', 'name', 'salt', 'hash', 'note', 'created', 'status'];
function safe_(s) { s = String(s == null ? '' : s).trim(); return /^[=+\-@]/.test(s) ? "'" + s : s; }   // no formula injection from public text
function readRequests_() {
  const s = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Requests');
  if (!s || s.getLastRow() < 2) return [];
  return s.getRange(2, 1, s.getLastRow() - 1, RH.length).getValues().map(function (r, i) {
    return { row: i + 2, username: String(r[0]), name: String(r[1]), salt: String(r[2]), hash: String(r[3]), note: String(r[4]), created: String(r[5]), status: String(r[6]) };
  });
}
function pendingRequests_() { return readRequests_().filter(function (r) { return r.status === 'pending'; }); }
function reqSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet(); let s = ss.getSheetByName('Requests');
  if (!s) { s = ss.insertSheet('Requests'); s.getRange(1, 1, 1, RH.length).setValues([RH]); s.hideSheet(); }
  return s;
}
function request_(d) {   // public: someone asks for an account; an admin approves it later
  if (!readUsers_().length) return { ok: false, error: 'No accounts exist yet. The admin must create the first account.' };
  const cache = CacheService.getScriptCache(), n = Number(cache.get('reqn') || 0);
  if (n >= 20) return { ok: false, error: 'Too many requests right now. Please try again later.' };
  const un = String(d.username || '').trim().toLowerCase(), err = validUser_(un, d.password);
  if (err) return { ok: false, error: err };
  const name = safe_(d.name).slice(0, 80);
  if (!name) return { ok: false, error: 'Please enter your full name.' };
  if (readUsers_().some(function (x) { return x.username === un; }) || readRequests_().some(function (x) { return x.username === un && x.status === 'pending'; }))
    return { ok: false, error: 'That username is already taken or already requested.' };
  const salt = Utilities.getUuid();
  reqSheet_().appendRow([un, name, salt, hash_(salt, d.password), safe_(d.note).slice(0, 200), now_(), 'pending']);
  cache.put('reqn', String(n + 1), 3600);
  return { ok: true };
}
const WRITE = { add: 1, status: 1, update: 1, setup: 1, createUser: 1, updateUser: 1, deleteUser: 1, changePassword: 1, request: 1, approveRequest: 1, rejectRequest: 1 };
const BUST = { changePassword: 1, createUser: 1, updateUser: 1, deleteUser: 1, approveRequest: 1, setup: 1 };
function now_() { return Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm'); }

/* ---------- sheet helpers ---------- */
function nextRow_(sh, keys) {
  const n = Math.max(sh.getMaxRows() - 2, 1);
  let last = 2;
  keys.forEach(function (k) {
    const v = sh.getRange(3, colNum_(k), n, 1).getValues();
    for (let i = v.length - 1; i >= 0; i--) if (String(v[i][0]).trim() !== '') { last = Math.max(last, i + 3); break; }
  });
  return last + 1;
}
function options_(ss, sh, cfg, L, ix) {
  try {
    const rule = sh.getRange(L + '3').getDataValidation();
    if (rule) {
      const t = rule.getCriteriaType(), v = rule.getCriteriaValues(); let list = [];
      if (t === SpreadsheetApp.DataValidationCriteria.VALUE_IN_LIST) list = v[0];
      else if (t === SpreadsheetApp.DataValidationCriteria.VALUE_IN_RANGE) list = v[0].getValues().reduce(function (a, r) { return a.concat(r); }, []);
      list = uniq_(list); if (list.length) return list;
    }
  } catch (e) {}
  const f = cfg.fb[L];
  if (f) {
    if (!ix[f]) { const s = ss.getSheetByName('INDEX'); ix[f] = s ? uniq_(s.getRange(2, colNum_(f), 299, 1).getValues().reduce(function (a, r) { return a.concat(r); }, [])) : []; }
    return ix[f];
  }
  return [];
}
function list_(ss, sheet, status) {
  const cfg = CFG[sheet], sh = ss.getSheetByName(sheet), n = sh.getMaxRows() - 2;
  if (n < 1) return [];
  const vals = sh.getRange(3, 3, n, 16).getValues(), tz = Session.getScriptTimeZone(), out = [];
  const ix = function (L) { return colNum_(L) - 3; };
  for (let i = vals.length - 1; i >= 0 && out.length < 5000; i--) {
    const r = vals[i], title = String(r[ix(cfg.title)]).trim();
    if (!title && !String(r[ix('F')]).trim()) continue;
    const st = String(r[ix(cfg.status)]).trim();
    if (status && st.toLowerCase() !== status.toLowerCase()) continue;
    const c = {};
    cfg.cols.split('').forEach(function (L) { let v = r[ix(L)]; if (v instanceof Date) v = Utilities.formatDate(v, tz, 'yyyy-MM-dd'); c[L] = String(v).trim(); });
    out.push({ c: c, row: i + 3, date: c.C, teacher: r[ix('F')], subject: r[ix('G')], grade: r[ix('H')], section: r[ix('I')], title: title, status: st });
  }
  return out;
}
/* CSV = exact header of TCUPLOAD / OERUPLOAD / ARUPLOAD + only the rows whose source status is Pending.
   Upload row n belongs to source row n+1. Nothing is renamed or reordered. */
function csv_(ss, sheet) {
  const cfg = CFG[sheet], us = ss.getSheetByName(UPLOAD[sheet]), src = ss.getSheetByName(sheet);
  if (!us) throw new Error('Sheet ' + UPLOAD[sheet] + ' not found');
  const head = us.getRange(1, 1, 1, us.getLastColumn()).getDisplayValues()[0];
  let hc = head.length; while (hc > 0 && String(head[hc - 1]).trim() === '') hc--;
  const last = nextRow_(src, cfg.keys) - 1, n = Math.min(last - 2, us.getMaxRows() - 1);
  const out = [head.slice(0, hc)];
  if (n > 0) {
    const st = src.getRange(3, colNum_(cfg.status), n, 1).getValues();
    const vals = us.getRange(2, 1, n, hc).getDisplayValues();
    for (let i = 0; i < n; i++)
      if (String(st[i][0]).trim().toLowerCase() === 'pending' && vals[i].some(function (v) { return String(v).trim() !== ''; })) out.push(vals[i]);
  }
  const esc = function (v) { v = String(v); return /[",\r\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v; };
  return { csv: out.map(function (r) { return r.map(esc).join(','); }).join('\r\n'), count: out.length - 1,
           filename: UPLOAD[sheet] + '_pending_' + Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd') + '.csv' };
}
function weekStart_(ss) {
  try { const v = ss.getSheetByName('Weekly Usage').getRange('D2').getValue();
    if (v instanceof Date) return Utilities.formatDate(v, Session.getScriptTimeZone(), 'yyyy-MM-dd'); } catch (e) {}
  return '2026-06-08';
}

/* ---------- accounts ---------- */
function usersSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet(); let s = ss.getSheetByName('Users');
  if (!s) { s = ss.insertSheet('Users'); s.getRange(1, 1, 1, UH.length).setValues([UH]); s.hideSheet(); }
  return s;
}
function usersCached_() {   // login checks read the Users tab at most once per 5 minutes
  const c = CacheService.getScriptCache(), s = c.get('uc');
  if (s) return JSON.parse(s);
  const u = readUsers_(); try { c.put('uc', JSON.stringify(u), 300); } catch (e) {}
  return u;
}
function bust_() { CacheService.getScriptCache().remove('uc'); }
function readUsers_() {
  const s = usersSheet_(), n = s.getLastRow() - 1; if (n < 1) return [];
  return s.getRange(2, 1, n, UH.length).getValues().map(function (r, i) {
    return { row: i + 2, username: String(r[0]), name: String(r[1]), role: String(r[2]), salt: String(r[3]), hash: String(r[4]),
             active: r[5] === true || String(r[5]).toLowerCase() === 'true', created: String(r[6]), lastLogin: String(r[7]) };
  });
}
function pub_(u) { return { username: u.username, name: u.name, role: u.role, active: u.active, created: u.created, lastLogin: u.lastLogin }; }
function hash_(salt, pw) {
  let d = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, salt + ':' + pw, Utilities.Charset.UTF_8);
  for (let i = 0; i < 999; i++) d = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, d);
  return Utilities.base64Encode(d);
}
function secret_() {
  const p = PropertiesService.getScriptProperties(); let s = p.getProperty('SECRET');
  if (!s) { s = Utilities.getUuid() + Utilities.getUuid(); p.setProperty('SECRET', s); }
  return s;
}
function sign_(b) { return Utilities.base64EncodeWebSafe(Utilities.computeHmacSha256Signature(b, secret_())); }
function token_(u, remember) {
  const b = Utilities.base64EncodeWebSafe(JSON.stringify({ u: u.username, e: Date.now() + (remember ? REMEMBER_DAYS * 24 : SESSION_HOURS) * 3600000 }));
  return b + '.' + sign_(b);
}
function verify_(t) {
  try {
    const p = String(t || '').split('.'); if (p.length !== 2 || sign_(p[0]) !== p[1]) return null;
    const o = JSON.parse(Utilities.newBlob(Utilities.base64DecodeWebSafe(p[0])).getDataAsString());
    if (o.e < Date.now()) return null;
    const u = usersCached_().filter(function (x) { return x.username === o.u; })[0];
    return u && u.active ? u : null;
  } catch (e) { return null; }
}
function validUser_(un, pw) {
  if (!/^[a-z0-9][a-z0-9._@-]{2,39}$/.test(un)) return 'Username: 3-40 characters, letters, numbers . _ @ - only (no spaces).';
  if (String(pw).length < 8) return 'Password must be at least 8 characters.';
  return '';
}
function addUser_(un, name, role, pw) {
  const salt = Utilities.getUuid();
  usersSheet_().appendRow([un, name, role, salt, hash_(salt, pw), true, now_(), '']);
}
function login_(d) {
  const un = String(d.username || '').trim().toLowerCase(), cache = CacheService.getScriptCache(), k = 'fail_' + un;
  if (Number(cache.get(k) || 0) >= 5) return { ok: false, error: 'Too many wrong attempts. Try again in 10 minutes.' };
  const u = readUsers_().filter(function (x) { return x.username === un; })[0];
  if (!u || hash_(u.salt, String(d.password || '')) !== u.hash) { cache.put(k, String(Number(cache.get(k) || 0) + 1), 600); return { ok: false, error: 'Wrong username or password.' }; }
  if (!u.active) return { ok: false, error: 'This account is disabled. Ask the admin.' };
  cache.remove(k);
  usersSheet_().getRange(u.row, 8).setValue(now_());
  return { ok: true, token: token_(u, !!d.remember), user: pub_(u) };
}
function setup_(d) {
  if (readUsers_().length) return { ok: false, error: 'Setup is already done. Please sign in.' };
  if (!SETUP_CODE || SETUP_CODE === 'change-me') return { ok: false, error: 'Open Code.gs, change SETUP_CODE to your own secret word, save, and deploy a new version.' };
  if (d.setupCode !== SETUP_CODE) return { ok: false, error: 'Wrong setup code.' };
  const un = String(d.username || '').trim().toLowerCase(), err = validUser_(un, d.password);
  if (err) return { ok: false, error: err };
  addUser_(un, String(d.name || un).trim(), 'admin', d.password);
  return login_({ username: un, password: d.password });
}
function otherAdmins_(un) { return readUsers_().filter(function (x) { return x.role === 'admin' && x.active && x.username !== un; }).length; }

/* ---------- routing ---------- */
function doGet() {   // connection test only; no data is returned
  return json_({ ok: true, v: 3, setup: readUsers_().length === 0 });
}
function doPost(e) {   // reads run in parallel; only writes wait in line
  let lock = null;
  try {
    const data = JSON.parse(e.postData.contents);
    if (WRITE[data.action]) { lock = LockService.getScriptLock(); lock.waitLock(20000); }
    const res = route_(data);
    if (BUST[data.action]) bust_();
    return json_(res);
  } catch (err) { return json_({ ok: false, error: String(err) }); }
  finally { if (lock) lock.releaseLock(); }
}
function route_(d) {
  const a = d.action;
  if (a === 'login') return login_(d);
  if (a === 'setup') return setup_(d);
  if (a === 'request') return request_(d);
  const u = verify_(d.token);
  if (!u) return { ok: false, code: 'auth', error: 'Please sign in.' };
  const ss = SpreadsheetApp.getActiveSpreadsheet(), canWrite = u.role === 'admin' || u.role === 'encoder';
  const cfg = CFG[d.sheet];

  if (a === 'meta') {   // dropdown lists change rarely: cached 10 min (the reload button skips the cache)
    const cch = CacheService.getScriptCache(); let base = d.fresh ? null : cch.get('meta');
    if (base) base = JSON.parse(base);
    else {
      base = { options: {}, weekStart: weekStart_(ss) }; const ix = {};
      Object.keys(CFG).forEach(function (s) {
        base.options[s] = {}; const sh = ss.getSheetByName(s);
        CFG[s].cols.split('').forEach(function (L) { base.options[s][L] = options_(ss, sh, CFG[s], L, ix); });
      });
      try { cch.put('meta', JSON.stringify(base), 600); } catch (e) {}
    }
    const out = { ok: true, options: base.options, weekStart: base.weekStart, user: pub_(u) };
    if (u.role === 'admin') out.reqCount = pendingRequests_().length;
    return out;
  }
  if (a === 'grid') {   // mirrors the Weekly Usage / Section Weekly Usage sheets for the pop-up dashboards
    const f = findGrid_(ss, d.name);
    if (!f.sheet) return { ok: false, error: 'Sheet not found for "' + d.name + '". Tabs in this Google Sheet: ' + f.names.join(', ') };
    const gs = f.sheet;
    return { ok: true, values: gs.getRange(1, 1, gs.getLastRow(), Math.min(gs.getLastColumn(), 38)).getDisplayValues() };
  }
  if (a === 'changePassword') {
    if (hash_(u.salt, String(d.oldPassword || '')) !== u.hash) return { ok: false, error: 'Current password is wrong.' };
    if (String(d.newPassword || '').length < 8) return { ok: false, error: 'New password must be at least 8 characters.' };
    const salt = Utilities.getUuid(); usersSheet_().getRange(u.row, 4, 1, 2).setValues([[salt, hash_(salt, d.newPassword)]]);
    return { ok: true };
  }
  if (a === 'users' || a === 'createUser' || a === 'updateUser' || a === 'deleteUser' || a === 'approveRequest' || a === 'rejectRequest') {
    if (u.role !== 'admin') return { ok: false, error: 'Admins only.' };
    const us = readUsers_();
    if (a === 'users') return { ok: true, users: us.map(pub_), requests: pendingRequests_().map(function (r) { return { username: r.username, name: r.name, note: r.note, created: r.created }; }) };
    if (a === 'createUser') {
      const un = String(d.username || '').trim().toLowerCase(), err = validUser_(un, d.password);
      if (err) return { ok: false, error: err };
      if (us.some(function (x) { return x.username === un; })) return { ok: false, error: 'That username already exists.' };
      if (['admin', 'encoder', 'viewer'].indexOf(d.role) < 0) return { ok: false, error: 'Invalid role.' };
      addUser_(un, String(d.name || un).trim(), d.role, d.password);
      return { ok: true };
    }
    if (a === 'approveRequest' || a === 'rejectRequest') {
      const q = readRequests_().filter(function (r) { return r.username === d.username && r.status === 'pending'; })[0];
      if (!q) return { ok: false, error: 'Request not found.' };
      const rs = reqSheet_();
      if (a === 'rejectRequest') { rs.getRange(q.row, 7).setValue('rejected'); return { ok: true }; }
      if (us.some(function (x) { return x.username === q.username; })) return { ok: false, error: 'That username already exists.' };
      const role = ['admin', 'encoder', 'viewer'].indexOf(d.role) >= 0 ? d.role : 'viewer';
      usersSheet_().appendRow([q.username, q.name, role, q.salt, q.hash, true, now_(), '']);
      rs.getRange(q.row, 7).setValue('approved');
      return { ok: true };
    }
    const t = us.filter(function (x) { return x.username === d.username; })[0];
    if (!t) return { ok: false, error: 'User not found.' };
    const s = usersSheet_();
    if (a === 'deleteUser') {
      if (t.username === u.username) return { ok: false, error: 'You cannot delete your own account.' };
      if (t.role === 'admin' && t.active && !otherAdmins_(t.username)) return { ok: false, error: 'At least one active admin is required.' };
      s.deleteRow(t.row); return { ok: true };
    }
    const demote = (d.role && d.role !== 'admin') || d.active === false;
    if (t.role === 'admin' && t.active && demote && (t.username === u.username || !otherAdmins_(t.username))) return { ok: false, error: 'You cannot disable or demote the last active admin (or yourself).' };
    if (d.role) { if (['admin', 'encoder', 'viewer'].indexOf(d.role) < 0) return { ok: false, error: 'Invalid role.' }; s.getRange(t.row, 3).setValue(d.role); }
    if (typeof d.active === 'boolean') s.getRange(t.row, 6).setValue(d.active);
    if (d.name) s.getRange(t.row, 2).setValue(String(d.name).trim());
    if (d.password) {
      if (String(d.password).length < 8) return { ok: false, error: 'Password must be at least 8 characters.' };
      const salt = Utilities.getUuid(); s.getRange(t.row, 4, 1, 2).setValues([[salt, hash_(salt, d.password)]]);
    }
    return { ok: true };
  }

  if (!cfg) return { ok: false, error: 'Unknown sheet: ' + d.sheet };
  const sh = ss.getSheetByName(d.sheet);
  if (a === 'list') return { ok: true, rows: list_(ss, d.sheet, d.status) };
  if (a === 'csv') { const c = csv_(ss, d.sheet); c.ok = true; return c; }
  if (!canWrite) return { ok: false, error: 'Your account is read-only.' };

  if (a === 'status' || a === 'update') {
    const row = Number(d.row);
    if (row < 3 || !String(sh.getRange(cfg.title + row).getValue()).trim() && !String(sh.getRange('F' + row).getValue()).trim()) return { ok: false, error: 'Invalid row' };
    if (a === 'status') { sh.getRange(cfg.status + row).setValue(String(d.value)); return { ok: true }; }
    Object.keys(d.values || {}).forEach(function (L) {
      if (cfg.cols.indexOf(L) < 0) return;
      const v = String(d.values[L]).trim(), cell = sh.getRange(L + row);
      if (v === '') cell.clearContent();
      else if (L === 'C' && /^\d{4}-\d{2}-\d{2}$/.test(v)) { const q = v.split('-'); cell.setValue(new Date(+q[0], +q[1] - 1, +q[2])); }
      else cell.setValue(v);
    });
    return { ok: true };
  }
  if (a === 'add') {
    const rows = d.rows || []; if (!rows.length) return { ok: false, error: 'No entries received' };
    const start = nextRow_(sh, cfg.keys);
    if (start + rows.length - 1 > sh.getMaxRows()) sh.insertRowsAfter(sh.getMaxRows(), start + rows.length - 1 - sh.getMaxRows());
    cfg.cols.split('').forEach(function (L) {   // one write per column (not per cell); only the input columns
      const vals = rows.map(function (r) {
        const v = r[L] == null ? '' : String(r[L]).trim();
        if (L === 'C' && /^\d{4}-\d{2}-\d{2}$/.test(v)) { const q = v.split('-'); return [new Date(+q[0], +q[1] - 1, +q[2])]; }
        return [v];
      });
      if (vals.every(function (x) { return x[0] === ''; })) return;
      sh.getRange(start, colNum_(L), rows.length, 1).setValues(vals);
    });
    return { ok: true, added: rows.length, from: start, to: start + rows.length - 1 };
  }
  return { ok: false, error: 'Unknown action' };
}
