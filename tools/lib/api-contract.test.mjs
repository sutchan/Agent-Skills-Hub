// tools/lib/api-contract.test.mjs — 三后端（本地 Express / Vercel Functions / EdgeOne 边缘函数）契约一致性
// 运行：npm test（node --test tools/lib/*.test.mjs）
//
// 背景：投票/收藏有三个后端实现，任一端语义漂移都会表现为「本地正常、线上 400」。
// 本测试用「共享契约模块 + 源码断言」把三端钉在同一语义上。
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

import {
  checkWriteState,
  parseWriteBody,
  INVALID_JSON,
  INVALID_NAME,
  UNKNOWN_NAME,
  WHITELIST_UNAVAILABLE,
  RATE_LIMITED,
  STORE_UNAVAILABLE,
} from "../../server/api-contract.js";
import { validateName, applyVote, applyFavorite } from "../../server/kv-ops.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..", "..");
const read = (rel) => readFileSync(join(root, rel), "utf8");
const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

test("checkWriteState：限流优先于存储与白名单", () => {
  const state = checkWriteState({ limited: true, storageIssue: "no token", whitelistSize: 0 });
  assert.equal(state.ok, false);
  assert.equal(state.status, 429);
  assert.equal(state.body.error, RATE_LIMITED);
});

test("checkWriteState：存储不可用返回 503", () => {
  const state = checkWriteState({ storageIssue: "BLOB_READ_WRITE_TOKEN 未配置", whitelistSize: 10 });
  assert.equal(state.status, 503);
  assert.equal(state.body.error, STORE_UNAVAILABLE);
});

test("checkWriteState：白名单不可用时 fail-closed 返回 503", () => {
  const state = checkWriteState({ whitelistSize: 0 });
  assert.equal(state.status, 503);
  assert.equal(state.body.error, STORE_UNAVAILABLE);
});

test("checkWriteState：全部正常时放行", () => {
  assert.equal(checkWriteState({ whitelistSize: 3 }).ok, true);
});

test("parseWriteBody：对象直接返回，字符串解析，非法字符串报错", () => {
  assert.deepEqual(parseWriteBody({ name: "a" }).data, { name: "a" });
  assert.deepEqual(parseWriteBody("{\"name\":\"a\"}").data, { name: "a" });
  assert.equal(parseWriteBody("{oops").ok, false);
  assert.equal(parseWriteBody("{oops").error, INVALID_JSON);
  assert.deepEqual(parseWriteBody(undefined).data, {});
});

test("validateName：格式非法 / 白名单为空 / 不在白名单 均拒绝", () => {
  const set = new Set(["agent-browser"]);
  assert.equal(validateName("Agent_Browser", set), INVALID_NAME);
  assert.equal(validateName("", set), INVALID_NAME);
  assert.equal(validateName("agent-browser", new Set()), WHITELIST_UNAVAILABLE);
  assert.equal(validateName("other-skill", set), UNKNOWN_NAME);
  assert.equal(validateName("agent-browser", set), null);
});

test("applyVote：累加与 undo 语义", () => {
  const kv = { votes: {} };
  assert.deepEqual(applyVote(kv, "a", "add"), { up: 1 });
  assert.deepEqual(applyVote(kv, "a", "add"), { up: 2 });
  assert.deepEqual(applyVote(kv, "a", "undo"), { up: 0 });
  assert.equal(kv.votes.a, undefined, "undo 后应删除投票键");
});

test("applyFavorite：add / remove / toggle 语义", () => {
  const kv = { favorites: {} };
  assert.equal(applyFavorite(kv, "a", "add").bookmarked, true);
  assert.equal(applyFavorite(kv, "a", "add").bookmarked, true);
  assert.equal(applyFavorite(kv, "a", "remove").bookmarked, false);
  assert.equal(applyFavorite(kv, "a").bookmarked, true, "缺省 toggle 应加入收藏");
  assert.equal(applyFavorite(kv, "a").bookmarked, false, "再次 toggle 应取消收藏");
  assert.deepEqual(applyFavorite(kv, "a", "add").favorites, ["a"]);
});

test("本地 Express 与 Serverless 均引用共享契约模块", () => {
  for (const rel of ["server/api.js", "api/votes.js", "api/favorites.js"]) {
    assert.match(read(rel), /api-contract\.js/, rel + " 应复用 server/api-contract.js");
  }
});

test("边缘函数：白名单为空时 fail-closed", () => {
  const src = read("edge-worker.js");
  assert.match(src, /function whitelistAvailable\(\)/, "边缘函数应提供白名单可用性判定");
  assert.match(src, /if \(!whitelistAvailable\(\)\)/, "写接口须在白名单为空时拒绝");
});

test("边缘函数：错误文案与共享契约常量一致", () => {
  const src = read("edge-worker.js");
  for (const msg of [INVALID_NAME, UNKNOWN_NAME, RATE_LIMITED, STORE_UNAVAILABLE]) {
    assert.ok(src.includes(msg), "边缘函数须包含契约文案：" + msg);
  }
});

test("边缘函数：内联白名单与权威数据一致", () => {
  const src = read("edge-worker.js");
  const block = src.match(/const SKILL_NAMES_INLINE = \[([\s\S]*?)\n\];/);
  assert.ok(block, "边缘函数应包含内联白名单块");
  const names = [...block[1].matchAll(/"([^"]+)"/g)].map((m) => m[1]);
  const data = JSON.parse(read("data/skills-data.json"));
  const expected = data.skills.map((s) => s.name);
  assert.equal(names.length, expected.length, "内联白名单数量应与权威数据一致");
  assert.deepEqual([...names].sort(), [...expected].sort(), "内联白名单应与权威数据一致");
});