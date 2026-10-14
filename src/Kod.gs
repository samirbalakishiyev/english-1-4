/* English 1–4 · Google Cədvəl skripti (Apps Script)
   Qeydiyyat, son giriş və blok bu cədvəldə saxlanılır. Nəticələr cədvələ yazılmır.
   1) Aşağıdakı KEY-i öz gizli açarınızla dəyişin (məs: Samir-2026-xyz).
   2) Deploy → New deployment → Web app → Execute as: Me, Who has access: Anyone. */
const KEY = 'BURAYA-OZ-ACARINIZI-YAZIN';

const UH = ['tel', 'ad', 'soyad', 'rol', 'qeyd', 'son', 'blok', 'sayt'];
const RH = ['at', 'tel', 'ad', 'soyad', 'sinif', 'sec', 'p', 'r', 'n'];

function sh(name, head) {
  const ss = SpreadsheetApp.getActive();
  let s = ss.getSheetByName(name);
  if (!s) { s = ss.insertSheet(name); s.appendRow(head); s.setFrozenRows(1); }
  return s;
}
function out(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}
function rows(s) {
  const v = s.getDataRange().getValues();
  const h = v.shift();
  return v.map(r => { const o = {}; h.forEach((k, i) => o[k] = r[i]); o.tel = String(o.tel || ''); return o; });
}
function findRow(s, tel) {
  const v = s.getDataRange().getValues();
  for (let i = 1; i < v.length; i++) if (String(v[i][0]) === String(tel)) return { row: i + 1, val: v[i] };
  return null;
}

/* Müəllim paneli oxuyur: ?a=users&key=… və ya ?a=results&key=… */
function doGet(e) {
  const p = e.parameter || {};
  if (p.key !== KEY) return out({ error: 'key' });
  if (p.a === 'users') return out({ rows: rows(sh('Users', UH)) });
  return out({ error: 'a' });
}

/* Sayt yazır: ping (qeydiyyat + son giriş + blok yoxlaması), res (nəticə), block (müəllim) */
function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const o = JSON.parse(e.postData.contents || '{}');
    const now = Date.now();
    if (o.a === 'ping') {
      const s = sh('Users', UH);
      const f = findRow(s, o.tel);
      if (!f) {
        s.appendRow(["'" + (o.tel || ''), o.ad || '', o.soyad || '', o.rol || '', o.qeyd || now, now, false, o.sayt || '']);
        return out({ ok: true, blok: false });
      }
      s.getRange(f.row, 2, 1, 3).setValues([[o.ad || f.val[1], o.soyad || f.val[2], o.rol || f.val[3]]]);
      s.getRange(f.row, 6).setValue(now);
      return out({ ok: true, blok: f.val[6] === true || String(f.val[6]).toUpperCase() === 'TRUE' });
    }
    if (o.a === 'block') {
      if (o.key !== KEY) return out({ ok: false, error: 'key' });
      const s = sh('Users', UH);
      const f = findRow(s, o.tel);
      if (!f) return out({ ok: false, error: 'tel' });
      s.getRange(f.row, 7).setValue(!!o.v);
      return out({ ok: true });
    }
    return out({ ok: false, error: 'a' });
  } finally {
    lock.releaseLock();
  }
}
