// tools/lib/edge-worker.test.mjs — 回归防护：边缘 worker 须按 EdgeOne KV 契约处理键。
// 背景：EdgeOne KV list() 返回 keys: Array<ListKey>（ListKey 为含 key 属性的对象，而非字符串），
// 此前代码对元素直接调用 .replace()，导致 GET /api/votes、GET /api/favorites 在生产环境恒 500
// （云同步完全失效）。运行：npm test（node --test tools/lib/*.test.mjs）
import { test } from "node:test";
import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..", "..");

/** 模拟 EdgeOne KV：list() 返回 { keys: [{ key }] }（官方契约），get/put/delete 同步内存态 */
function makeKv(initial) {
  const store = new Map(Object.entries(initial));
  return {
    async list({ prefix }) {
      const keys = [...store.keys()]
        .filter((k) => k.startsWith(prefix))
        .map((k) => ({ key: k }));
      return { complete: true, cursor: null, keys };
    },
    async get(key, opts) {
      const v = store.get(key);
      if (v == null) return null;
      return opts && opts.type === "json" ? JSON.parse(v) : v;
    },
    async put(key, value) {
      store.set(key, String(value));
    },
    async delete(key) {
      store.delete(key);
    },
  };
}

// 先注入 worker 全局（fetch 监听器与 ASH_KV），再加载 edge-worker.js
const listeners = {};
globalThis.addEventListener = (type, fn) => {
  listeners[type] = fn;
};
globalThis.ASH_KV = makeKv({
  "vote:ad-creative": JSON.stringify({ up: 3 }),
  "fav:ad-creative": "1",
});

await import(join(root, "edge-worker.js"));

/** 调用 worker 的 fetch 处理器并取回响应 Promise */
function callWorker(request) {
  let respPromise;
  listeners.fetch({ request, respondWith: (p) => { respPromise = p; } });
  return respPromise;
}

test("GET /api/votes 按 EdgeOne KV 契约（ListKey 为对象）返回投票，而非 500", async () => {
  const resp = await callWorker(new Request("http://localhost/api/votes"));
  assert.equal(resp.status, 200);
  assert.deepEqual(await resp.json(), { "ad-creative": { up: 3 } });
});

test("GET /api/favorites 按 EdgeOne KV 契约返回收藏，而非 500", async () => {
  const resp = await callWorker(new Request("http://localhost/api/favorites"));
  assert.equal(resp.status, 200);
  assert.deepEqual(await resp.json(), { "ad-creative": true });
});

test("POST /api/votes 累加并持久化到 KV", async () => {
  const resp = await callWorker(
    new Request("http://localhost/api/votes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "ad-creative", action: "up" }),
    })
  );
  assert.equal(resp.status, 200);
  assert.deepEqual(await resp.json(), { name: "ad-creative", up: 4 });
  const val = await globalThis.ASH_KV.get("vote:ad-creative", { type: "json" });
  assert.equal(val.up, 4);
});

test("POST /api/votes 拒绝非法技能名（防 KV key 注入）", async () => {
  const resp = await callWorker(
    new Request("http://localhost/api/votes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "../../evil", action: "up" }),
    })
  );
  assert.equal(resp.status, 400);
});
