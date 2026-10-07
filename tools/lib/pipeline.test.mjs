// tools/lib/pipeline.test.mjs — 构建流水线集成测试
// 验证：build-skills-data / build.mjs / validate-skills 不破坏契约、产物有效。
// 覆盖「集成测试」要求：跨脚本联动（磁盘技能 → 生成数据 → 契约校验 → 原型产物）。
import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = dirname(dirname(__dirname)); // tools/lib -> tools -> repo root
const TOOLS = join(ROOT, "tools");
const SKILLS_DIR = join(ROOT, "skills");
const DATA = join(ROOT, "data", "skills-data.json");
const METRICS = join(ROOT, "data", "skills-metrics.json");
const VOTES = join(ROOT, "data", "skills-votes.json");
const PROTO = join(ROOT, "prototype", "prototype.html");

// 与 build-skills-data.mjs 的 EXCLUDE 保持一致，确保「磁盘技能数 == 生成技能数」
const EXCLUDE = new Set([".skills-manager", ".trae", "src", "brand", "data", "tools"]);

function run(script) {
  // 非 0 退出时 execFileSync 直接抛错，天然成为测试失败信号
  return execFileSync("node", [join(TOOLS, script)], { cwd: ROOT, encoding: "utf8" });
}

function countDiskSkills() {
  return readdirSync(SKILLS_DIR).filter(
    (name) => !EXCLUDE.has(name) && existsSync(join(SKILLS_DIR, name, "SKILL.md"))
  ).length;
}

test("build-skills-data 产出与主数据契约一致", () => {
  run("build-skills-data.mjs");
  assert.ok(existsSync(DATA), "data/skills-data.json 未生成");
  const json = JSON.parse(readFileSync(DATA, "utf8"));
  assert.ok(Array.isArray(json.skills), "skills 应为数组");
  const disk = countDiskSkills();
  assert.equal(
    json.skills.length,
    disk,
    `技能数(${json.skills.length}) 应与磁盘 SKILL.md 数(${disk}) 一致`
  );
  for (const s of json.skills) {
    assert.ok(s.name, "缺少 name");
    assert.ok(s.category, "缺少 category");
    assert.ok(typeof s.description === "string", "缺少 description");
    assert.ok(typeof s.enDescription === "string", "缺少 enDescription");
    assert.ok(typeof s.zh === "string", "缺少 zh 显示名");
    assert.ok(Array.isArray(s.tags), "tags 应为数组");
  }
  assert.ok(existsSync(METRICS), "data/skills-metrics.json 未生成");
});

test("build-votes 产出的赞票数契约有效（键为技能名、值为正整数）", () => {
  run("build-votes.mjs");
  assert.ok(existsSync(VOTES), "data/skills-votes.json 未生成");
  const votes = JSON.parse(readFileSync(VOTES, "utf8"));
  assert.equal(typeof votes, "object", "票数应为 { [skillName]: number } 结构");
  assert.ok(!Array.isArray(votes), "票数不应为数组");
  const known = new Set(JSON.parse(readFileSync(DATA, "utf8")).skills.map((s) => s.name));
  for (const [name, n] of Object.entries(votes)) {
    assert.ok(known.has(name), `票数含未知技能名：${name}`);
    assert.ok(Number.isInteger(n) && n > 0, `${name} 的票数应为正整数，实际 ${n}`);
  }
});

test("validate-skills 通过（不破坏 frontmatter 契约）", () => {
  // execFileSync 在非零退出时抛错，故成功即视为通过
  run("validate-skills.mjs");
});

test("build.mjs 产出自包含原型页", () => {
  run("build.mjs");
  assert.ok(existsSync(PROTO), "prototype/prototype.html 未生成");
  const html = readFileSync(PROTO, "utf8");
  assert.ok(html.includes("<!DOCTYPE html>"), "原型页结构异常");
  assert.ok(html.length > 1000, "原型页内容过短");
});
