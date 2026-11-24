// tools/lib/ratelimit.test.mjs — 回归防护：限流表有界（防无界增长导致内存/磁盘膨胀）。
// 背景：rateLimitMap 此前从不清理过期条目，攻击者伪造 X-Forwarded-For 可无限扩充映射，
// 并持续把整表写入 ratelimit.json；现加入周期清理 + 上限淘汰。运行：npm test
import { test } from "node:test";
import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { tmpdir } from "node:os";
import { join as pathJoin } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..", "..");

// 把限流落盘重定向到临时文件，避免测试污染仓库 data/ratelimit.json（须在 import 前设置）
process.env.RATELIMIT_FILE = pathJoin(tmpdir(), `ratelimit-test-${process.pid}.json`);

const { rateLimitMap, checkRateLimit } = await import(
  join(root, "server", "ratelimit.js")
);

const MAX_ENTRIES = 50_000; // 与 server/ratelimit.js 中 MAX_RATELIMIT_ENTRIES 一致
const WINDOW_MS = 60_000; // 与 server/ratelimit.js 中 WINDOW_MS 一致

test("海量唯一 IP 下限流表保持有界（上限淘汰生效）", () => {
  for (let i = 0; i < MAX_ENTRIES + 2_000; i++) {
    checkRateLimit("spoof-ip-" + i);
  }
  assert.ok(
    rateLimitMap.size <= MAX_ENTRIES,
    `限流表 size=${rateLimitMap.size} 应不超过 ${MAX_ENTRIES}`
  );
});

test("表满插入时先清理过期条目（过期窗口可回收）", () => {
  rateLimitMap.clear();
  // 填满：MAX_ENTRIES-1 个新鲜条目 + 1 个已过期条目
  for (let i = 0; i < MAX_ENTRIES - 1; i++) {
    rateLimitMap.set("fresh-" + i, { start: Date.now(), count: 1 });
  }
  rateLimitMap.set("expired", {
    start: Date.now() - 2 * WINDOW_MS,
    count: 1,
  });
  checkRateLimit("new-ip");
  assert.ok(!rateLimitMap.has("expired"), "过期条目应被清理而非淘汰新条目");
  assert.ok(rateLimitMap.has("new-ip"), "新条目应正常记录");
  assert.ok(rateLimitMap.size <= MAX_ENTRIES, "插入后仍应保持有界");
});
