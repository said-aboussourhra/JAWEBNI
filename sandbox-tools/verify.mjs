// End-to-end smoke test of the running app (login + every workspace page).
import http from 'node:http';

const PORT = Number(process.argv[2] || 8000);
const HOST = process.argv[3] || `8000-${process.env.E2B_SANDBOX_ID || 'local'}.e2b.app`;
const cookies = new Map();

function req(method, path, body, extra = {}) {
  return new Promise((resolve, reject) => {
    const payload = body ? new URLSearchParams(body).toString() : null;
    const headers = { Host: HOST, 'X-Forwarded-Proto': 'https', 'User-Agent': 'Mozilla/5.0' };
    if (cookies.size) headers.Cookie = [...cookies].map(([k, v]) => `${k}=${v}`).join('; ');
    if (payload) headers['Content-Type'] = 'application/x-www-form-urlencoded';
    Object.assign(headers, extra);
    const r = http.request({ host: '127.0.0.1', port: PORT, method, path, headers }, (res) => {
      const chunks = [];
      res.on('data', (c) => chunks.push(c));
      res.on('end', () => resolve({ status: res.statusCode, location: res.headers.location, body: Buffer.concat(chunks), setCookie: res.headers['set-cookie'] || [] }));
    });
    r.on('error', reject);
    if (payload) r.write(payload);
    r.end();
  });
}

function absorb(setCookie) {
  for (const c of setCookie) {
    const [pair] = c.split(';');
    const idx = pair.indexOf('=');
    cookies.set(pair.slice(0, idx).trim(), pair.slice(idx + 1).trim());
  }
}

const results = [];
let r = await req('GET', '/');
results.push([`GET /`, r.status, r.location || '']);
absorb(r.setCookie);

r = await req('GET', '/login');
results.push([`GET /login`, r.status, `${cookies.size} cookies`]);
absorb(r.setCookie);

const token = decodeURIComponent(cookies.get('XSRF-TOKEN') || '');
r = await req('POST', '/login', { email: 'said@jawebni.ma', password: 'password123' }, { 'X-XSRF-TOKEN': token });
results.push([`POST /login`, r.status, r.location || '']);
absorb(r.setCookie);

for (const p of ['/pulse', '/booking', '/campaigns', '/agents', '/analytics', '/settings', '/inbox', '/customers', '/admin']) {
  r = await req('GET', p);
  const m = r.body.toString().match(/component&quot;:&quot;([^&]+)/);
  results.push([`GET ${p}`, r.status, m ? m[1] : '(no inertia page)']);
}

// A real write: send a WhatsApp reply through the AI inbox.
r = await req('GET', '/inbox');
const conv = r.body.toString().match(/"id":"([0-9a-f-]{36})"/);
if (conv) {
  const t = decodeURIComponent(cookies.get('XSRF-TOKEN') || '');
  r = await req('POST', '/inbox/send', { conversation_id: conv[1], body: 'مرحبا، واش القفطان متوفر؟' }, { 'X-XSRF-TOKEN': t });
  results.push(['POST /inbox/send', r.status, '(message persisted)']);
}

const width = Math.max(...results.map((x) => x[0].length));
console.log(`\n=== smoke test :${PORT} (host ${HOST}) ===`);
let failed = 0;
for (const [what, status, extra] of results) {
  const ok = status >= 200 && status < 400;
  if (!ok) failed += 1;
  console.log(`${ok ? '✅' : '❌'} ${what.padEnd(width)}  ${status}  ${extra}`);
}
console.log(failed === 0 ? `ALL GREEN (${results.length} checks)` : `${failed} FAILED`);
process.exit(failed === 0 ? 0 : 1);
