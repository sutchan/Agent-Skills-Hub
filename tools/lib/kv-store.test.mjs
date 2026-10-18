// tools/lib/kv-store.test.mjs — 校验 data/kv-store.json 合法性与结构（回归防护）
// 对应任务：迭代六 #8。运行：npm test
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..", "..");
const file = join(root, "data", "kv-store.json");

test("kv-store.json 存在时为合法 JSON 对象", () => {
  if (!existsSync(file)) return; // 首次运行可能尚未生成
  const kv = JSON.parse(readFileSync(file, "utf8"));
  assert.ok(typeof kv === "object" && kv !== null, "kv-store 应为对象");
});

const votesFile = join(root, "data", "skills-votes.json");
test("skills-votes.json 存在时为合法 JSON 对象", () => {
  if (!existsSync(votesFile)) return;
  const v = JSON.parse(readFileSync(votesFile, "utf8"));
  assert.ok(typeof v === "object" && v !== null, "skills-votes 应为对象");
});
