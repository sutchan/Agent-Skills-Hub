// tools/lib/skills-data.test.mjs — 校验 data/skills-data.json 契约完整性（回归防护）
// 对应任务：迭代六 #8。运行：npm test（node --test tools/lib/*.test.mjs）
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..", "..");
const data = JSON.parse(readFileSync(join(root, "data", "skills-data.json"), "utf8"));

test("skills-data.json 具有 skills 数组", () => {
  assert.ok(Array.isArray(data.skills), "skills 应为数组");
  assert.ok(data.skills.length > 0, "skills 不应为空");
});

test("每条技能具备核心契约字段", () => {
  for (const s of data.skills) {
    assert.equal(typeof s.name, "string");
    assert.ok(s.name.length > 0, "name 非空");
    assert.equal(typeof s.category, "string");
    assert.ok(s.category.length > 0, "category 非空");
    assert.equal(typeof s.zh, "string");
    assert.ok(s.zh.length > 0, "zh 非空");
    assert.equal(typeof s.description, "string");
    assert.ok(s.description.length > 0, "description 非空");
    assert.equal(typeof s.enDescription, "string");
    assert.ok(s.enDescription.length > 0, "enDescription 非空");
    assert.equal(typeof s.installCommand, "string");
    assert.ok(s.installCommand.includes("skills add"), "installCommand 应含 skills add");
    assert.equal(typeof s.githubDir, "string");
    assert.ok(Array.isArray(s.tags), "tags 为数组");
    assert.equal(typeof s.hidden, "boolean", "hidden 为布尔");
  }
});

test("技能 name 唯一且无重复", () => {
  const names = data.skills.map((s) => s.name);
  assert.equal(new Set(names).size, names.length, "存在重复技能名");
});

test("githubDir 以 /<name> 结尾且与 name 一致", () => {
  for (const s of data.skills) {
    assert.ok(
      s.githubDir.endsWith("/" + s.name),
      `githubDir ${s.githubDir} 应以 /${s.name} 结尾`,
    );
  }
});

test("visible 数（hidden=false）与 total 一致（若存在 total）", () => {
  if (typeof data.total === "number") {
    const visible = data.skills.filter((s) => !s.hidden).length;
    assert.equal(data.total, visible, "total 与可见技能数不一致");
  }
});
