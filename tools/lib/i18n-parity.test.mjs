// tools/lib/i18n-parity.test.mjs — 三语词条键位一致性与语言元数据校验
// 运行：npm test（node --test tools/lib/*.test.mjs）
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..", "..");
const html = readFileSync(join(root, "src", "index.html"), "utf8");
const data = JSON.parse(readFileSync(join(root, "data", "skills-data.json"), "utf8"));

/** 提取 translations 字典中某语言的键列表 */
function dictKeys(lang) {
  const re = new RegExp("\\n    " + lang + ": \\{([\\s\\S]*?)\\n    \\},?");
  const m = html.match(re);
  assert.ok(m, "未找到语言块：" + lang);
  return [...m[1].matchAll(/^\s{6}"([^"]+)":/gm)].map((x) => x[1]);
}

const zh = dictKeys("zh");
const tw = dictKeys("tw");
const en = dictKeys("en");

test("三语词条键位完全一致（简中 → 繁体 → 英文）", () => {
  assert.ok(zh.length > 0, "简中词条不应为空");
  assert.deepEqual([...tw].sort(), [...zh].sort(), "繁体词条键位与简中不一致");
  assert.deepEqual([...en].sort(), [...zh].sort(), "英文词条键位与简中不一致");
});

test("各语言词条无重复键", () => {
  for (const [lang, keys] of [["zh", zh], ["tw", tw], ["en", en]]) {
    assert.equal(new Set(keys).size, keys.length, lang + " 存在重复键");
  }
});

test("语言优先级为 简中 → 繁体 → 英文，回退语言为简中", () => {
  const m = html.match(/var SUPPORTED = \[([^\]]+)\]/);
  assert.ok(m, "未找到 SUPPORTED 语言列表");
  const supported = m[1].split(",").map((s) => s.trim().replace(/^"|"$/g, ""));
  assert.deepEqual(supported, ["zh", "tw", "en"], "语言顺序必须为 zh → tw → en");
  assert.match(html, /var FALLBACK = "zh"/, "回退语言必须为简中");
});

test("html[lang] 映射使用 BCP-47 规范值", () => {
  assert.match(html, /var LANG_TAGS = \{ zh: "zh", tw: "zh-Hant", en: "en" \}/, "LANG_TAGS 映射不正确");
});

test("语言列表不存在第二份定义（避免双份常量漂移）", () => {
  assert.doesNotMatch(html, /SUPPORTED_LANGS/, "应统一使用 I18N.supported");
  const listDefs = html.match(/\["zh",\s*"tw",\s*"en"\]/g) || [];
  assert.equal(listDefs.length, 1, "语言数组只能在 I18N 模块中定义一次");
});

test("繁体分类映射覆盖权威数据的全部分类", () => {
  const block = html.match(/const CATEGORY_TW = \{([\s\S]*?)\n\};/);
  assert.ok(block, "未找到 CATEGORY_TW 映射");
  const mapped = new Set([...block[1].matchAll(/"([^"]+)":\s*"([^"]*)"/g)].map((m) => m[1]));
  const categories = [...new Set(data.skills.map((s) => s.category))];
  for (const c of categories) {
    assert.ok(mapped.has(c), "缺少繁体分类名：" + c);
  }
  assert.equal(mapped.size, categories.length, "CATEGORY_TW 与数据分类数量不一致");
});