// tools/lib/popularity.test.mjs — computePopularity 词边界匹配回归测试
import { test } from "node:test";
import assert from "node:assert/strict";
import { computePopularity, namePattern } from "./popularity.mjs";

// 复现原实现假阳性：hay="graphql-api is great" 含子串 "api"，
// 旧 `includes("api")` 会误判为被提及；词边界匹配应为 0。
test("子串假阳性被消除（原 bug 回归）", () => {
  const skills = [{ name: "api", description: "graphql-api is great", enDescription: "" }];
  const pop = computePopularity(skills);
  assert.equal(pop["api"], 0);
});

test("独立 token 被正确匹配（跨技能）", () => {
  const skills = [
    { name: "api", description: "x", enDescription: "" },
    { name: "client", description: "calls the api endpoint", enDescription: "" },
  ];
  const pop = computePopularity(skills);
  assert.equal(pop["client"], 1); // client 描述以 token 形式提及 api
  assert.equal(pop["api"], 0); // api 描述未提及 client
});

test("自身不被计入", () => {
  const skills = [{ name: "x", description: "x x x", enDescription: "" }];
  assert.equal(computePopularity(skills)["x"], 0);
});

test("连字符名称作为独立 token 匹配，且不被内部子串误命中", () => {
  const skills = [
    { name: "data-viz", description: "see data-viz", enDescription: "" },
    { name: "viz", description: "data-viz rocks", enDescription: "" },
  ];
  const pop = computePopularity(skills);
  assert.equal(pop["viz"], 1); // viz 描述提及 data-viz（token）
  assert.equal(pop["data-viz"], 0); // "viz" 仅作为 "data-viz" 子串，不算命中
});

test("正则特殊字符被按字面转义", () => {
  assert.doesNotThrow(() => namePattern("next.js"));
  const re = namePattern("next.js");
  assert.ok(re.test("use next.js now"));
  assert.ok(!re.test("usenextxjsnow"));
});

test("大小写不敏感匹配", () => {
  const skills = [
    { name: "API", description: "x", enDescription: "" },
    { name: "other", description: "calls the Api endpoint", enDescription: "" },
  ];
  const pop = computePopularity(skills);
  assert.equal(pop["other"], 1); // other 描述以不区分大小写方式提及 Api(=API)
});
