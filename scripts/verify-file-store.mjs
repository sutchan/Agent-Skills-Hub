// scripts/verify-file-store.mjs — 文件存储服务端到端验证
// 用法：先启动本地服务（npm run dev），再运行本脚本；BASE_URL 可指向 Preview/Production 域名。
import assert from 'node:assert/strict';

const BASE = process.env.BASE_URL || 'http://localhost:3000';
const unique = `verify/${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
let pass = 0, fail = 0;

function ok(name) { pass++; console.log(`✅ [PASS] ${name}`); }
function bad(name, e) { fail++; console.log(`❌ [FAIL] ${name}: ${e.message}`); }
async function test(name, fn) { try { await fn(); ok(name); } catch (e) { bad(name, e); } }

const headers = (type, access) => {
  const h = { 'Content-Type': type };
  if (access) h['x-file-access'] = access;
  return h;
};

async function upload(name, body, type = 'text/plain', access = 'private') {
  const r = await fetch(`${BASE}/api/upload?name=${encodeURIComponent(name)}`, {
    method: 'POST', headers: headers(type, access), body,
  });
  return { status: r.status, json: await r.json().catch(() => ({})) };
}

await test('合法上传（private）', async () => {
  const r = await upload(`${unique}/hello.txt`, 'hello blob', 'text/plain', 'private');
  assert.equal(r.status, 200, JSON.stringify(r.json));
  assert.equal(r.json.pathname, `files/${unique}/hello.txt`);
  assert.equal(r.json.access, 'private');
  assert.ok(r.json.size > 0);
});

await test('合法上传（public）', async () => {
  const r = await upload(`${unique}/public.txt`, 'public data', 'text/plain', 'public');
  assert.equal(r.status, 200, JSON.stringify(r.json));
  assert.equal(r.json.access, 'public');
  assert.ok(r.json.url);
});

await test('列表包含刚上传文件且不暴露 kv-store.json', async () => {
  const r = await fetch(`${BASE}/api/files?prefix=${encodeURIComponent(unique)}`);
  assert.equal(r.status, 200);
  const data = await r.json();
  assert.ok(data.files.some((f) => f.pathname === `files/${unique}/hello.txt`));
  assert.ok(!data.files.some((f) => f.pathname.includes('kv-store')));
});

await test('读取 private 文件（no-store）', async () => {
  const r = await fetch(`${BASE}/api/files?name=${encodeURIComponent(`files/${unique}/hello.txt`)}`);
  assert.equal(r.status, 200);
  assert.match(r.headers.get('cache-control') || '', /no-store/);
  assert.equal(await r.text(), 'hello blob');
});

await test('读取 public 文件（302 重定向）', async () => {
  const r = await fetch(`${BASE}/api/files?name=${encodeURIComponent(`files/${unique}/public.txt`)}`, { redirect: 'manual' });
  assert.ok([200, 302].includes(r.status), `status=${r.status}`);
  if (r.status === 302) assert.ok(r.headers.get('location'));
});

await test('下载附件模式', async () => {
  const r = await fetch(`${BASE}/api/files?name=${encodeURIComponent(`files/${unique}/hello.txt`)}&download=1`);
  assert.equal(r.status, 200);
});

await test('413 超过大小上限', async () => {
  const r = await upload(`${unique}/big.txt`, 'x'.repeat(11 * 1024 * 1024));
  assert.equal(r.status, 413, JSON.stringify(r.json));
});

await test('415 不允许的 MIME 类型', async () => {
  const r = await upload(`${unique}/bad.exe`, 'MZ', 'application/x-msdownload');
  assert.equal(r.status, 415, JSON.stringify(r.json));
});

await test('400 路径穿越拦截', async () => {
  const r = await upload('../escape.txt', 'bad');
  assert.equal(r.status, 400, JSON.stringify(r.json));
});

await test('400 缺少 name 参数', async () => {
  const r = await fetch(`${BASE}/api/upload`, { method: 'POST', headers: headers('text/plain'), body: 'x' });
  assert.equal(r.status, 400);
});

let etag = null;
await test('If-Match 删除', async () => {
  const head = await fetch(`${BASE}/api/files?name=${encodeURIComponent(`files/${unique}/hello.txt`)}`);
  etag = head.headers.get('etag');
  const r = await fetch(`${BASE}/api/files?name=${encodeURIComponent(`files/${unique}/hello.txt`)}`, {
    method: 'DELETE', headers: etag ? { 'If-Match': etag } : {},
  });
  assert.equal(r.status, 200, JSON.stringify(await r.json().catch(() => ({}))));
});

await test('二次删除返回 404', async () => {
  const r = await fetch(`${BASE}/api/files?name=${encodeURIComponent(`files/${unique}/hello.txt`)}`, { method: 'DELETE' });
  assert.equal(r.status, 404);
});

console.log(`\n${'='.repeat(40)}\n文件存储验证：通过 ${pass} 项，失败 ${fail} 项\n${'='.repeat(40)}`);
process.exit(fail ? 1 : 0);
