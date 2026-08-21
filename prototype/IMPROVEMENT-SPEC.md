# prototype/ 改进规格文档（Improvement Spec）

> 版本基线：`package.json` v1.14.72（权威单一来源）
> 模板注释：v1.14.69 ｜ 产物页脚：v1.14.71 ｜ DESIGN.md：v1.14.61 —— **三处与权威源不一致，见 §6**
> 适用范围：仅 `prototype/src/` 源码；产物 `prototype/index.html` 由 `npm run build` 重建，**禁止手改**
> 调研依据：`grill-me` 对 prototype 的代码审查（2026-08-21）

---

## 0. 事实基线（已核实，非推测）

| 项 | 现状 | 真相 |
|----|------|------|
| 数据源 | `prototype/index.html` 内联 `const SKILLS_DATA` | 由 `build.mjs` 注入根 `data/skills-data.json`，**非运行时 fetch** |
| 技能总数 | 产物 `total` 残留旧值 | 权威 = `data/skills-data.json` 的 `total`（5 真实分类，排除 `其他`/`hidden`） |
| 主色 | `--primary: 152 56% 40%` = `#2e9e6b`；深 `#5cc98c` | 与全局品牌记忆一致 ✅ |
| `catCounts()` | 已预聚合为 `Map` | 子代理误报"每次重算"，**无需改** |
| `htmlToEl()` | `02-render.js` 定义，**全代码零调用** | 死代码，可删 |
| `.sheet`/`.sheet-grip` | `layout.css` 定义，**无调用** | 移动抽屉愿景未落地，死代码，可删 |
| `grilling` 技能 | `zh:""` / `category:"其他"` | 中文态标题/描述空白为**真实数据问题**，非渲染 bug |
| 版本号 | 4 处不一致 | 以 `package.json` 为唯一真相，构建注入产物 |

---

## 1. 改进目标与原则

1. **单一来源**：版本号、技能数据均来自仓库根（`package.json` / `data/skills-data.json`），prototype 构建注入。
2. **零死代码**：删除未调用的函数与样式，降低维护面（对齐全局"≤200 行拆分 + 清洁"规则）。
3. **输入即所得**：中文/日文等输入法 composition 期间不触发筛选，避免拼音输入狂刷网格。
4. **可访问性对齐 WCAG AA**：交互元素用原生语义、状态按钮文本与 `aria-pressed` 语义一致。
5. **视觉一致性**：favicon / logo 走 `--primary` 变量，logo 按 DESIGN §8.3 实现浅→深绿渐变。

---

## 2. P0 — 体验硬伤（必须实现）

### P0-1 中文输入法 composition 拦截
**文件**：`src/parts/04-interactions.js`（搜索 `input` 监听）
**改法**：
```js
let composing = false, t;
on("#searchInput", "compositionstart", () => { composing = true; clearTimeout(t); });
on("#searchInput", "compositionend", (e) => { composing = false; t = setTimeout(() => { state.query = e.target.value; renderGrid(); track("search", { query: e.target.value }); }, DEBOUNCE_MS); });
on("#searchInput", "input", (e) => {
  if (composing) return;
  clearTimeout(t);
  const v = e.target.value;
  t = setTimeout(() => { state.query = v; renderGrid(); if (v) track("search", { query: v }); }, DEBOUNCE_MS);
});
```
**验收**：拼音输入"zhongwen"过程中网格不刷新，敲回车/选词后一次性刷新。

### P0-2 空数据兜底（中文态）
**文件**：`src/parts/02-render.js` `cardHTML`（第 41、46 行）
**改法**：
- 标题：`${esc(s.zh || s.name)}`（已有）
- 描述：`${esc(s.zhDesc || s.zh || s.description || I18N.t("card.noDesc"))}` —— 三级回退到英文描述 + i18n 兜底文案
- 同时在 `data/skills-data.json` 的 `grilling` 补 `zh:"提问复盘"`、`zhDesc:"..."`（数据修复，非仅渲染层）
**验收**：`grilling` 中文态卡片不再空白；任意缺失 `zhDesc` 的技能回退英文描述。

### P0-3 技能总数对齐权威源
**文件**：`build.mjs`（注入 `{{DATA}}` 时）
**改法**：构建脚本直接 `import` 根 `data/skills-data.json` 并整体注入，`total` 不被二次硬编码；`renderStats` 维持 `filter(!hidden)` 计数即可。
**验收**：产物 `SKILLS_DATA.total` == `data/skills-data.json.total`，与 README 5 分类计数一致。

---

## 3. P1 — 可访问性（规范级）

### P1-1 卡片语义
**文件**：`02-render.js` `cardHTML`（第 36 行）
**改法**：`<article ... role="button" tabindex="0">` → 保留 `<article>` 但语义不符；改为 `<button type="button" class="card" ...>`（CSS `.card` 已是 block 样式，button 默认 inline，需补 `display:block;width:100%;text-align:left`）。或保留 article 加 `aria-roledescription="查看技能详情"`。
**选型**：采用 `<button>` 方案（原生可聚焦、回车/空格原生触发，可移除 `keydown` 委托的手动处理）。
**验收**：屏幕阅读器读"按钮"而非"文章"；键盘 Tab 可达、Enter/Space 打开。

### P1-2 搜索区 `<form role="search">`
**文件**：`src/index.html`（第 96–100 行）
**改法**：
```html
<form class="search" id="searchBox" role="search" onsubmit="return false">
  <label class="sr-only" for="searchInput">搜索技能 / Search skills</label>
  <svg ...></svg>
  <input id="searchInput" type="search" placeholder="..." />
</form>
```
**验收**：语义为搜索表单；label 视觉隐藏但读屏可读。

### P1-3 语言按钮文本与 `aria-pressed` 语义一致
**文件**：`04-interactions.js` `applyLang`（第 16–19 行）
**问题**：文本显示"将要切换到的语言"（`中`/`EN`），`aria-pressed` 表示"当前是否 en"——语义相反。
**改法（二选一，建议 A）**：
- A：文本显示**当前语言**（`中`/`EN`），`aria-pressed` = `state.lang==="en"` 保持不变，并在 `aria-label` 明确"当前语言：中文，点击切换"。
- B：文本保持目标语言，但 `aria-pressed` 改为"是否将切到 en"。
**验收**：读屏用户听"当前：中文"与可见文本一致。

---

## 4. P2 — 视觉/响应式打磨

### P2-1 sticky 偏移去硬编码
**文件**：`src/styles/layout.css`（`.controls { position:sticky; top:52px }`）
**改法**：定义 `--topbar-h` 变量由 JS 在 `init` 量取 `siteHeader.offsetHeight` 注入 `:root`，`.controls` 用 `top: var(--topbar-h)`。
**验收**：顶栏换行/主题切换高度变化时不错位。

### P2-2 补平板断点
**文件**：`src/styles/responsive.css`
**改法**：新增 `@media (max-width: 1024px)` 优化 hero 字号、topbar 间距；现有 `640px` 保留。
**验收**：768px / 900px 视口下 hero 与 topbar 不拥挤。

### P2-3 logo 渐变 + favicon 变量化
**文件**：`src/index.html`（第 45–46、120–122 行 logo；第 20 行 favicon data-URI）
**改法**：
- logo `<rect>` 改用 `fill="url(#ash-grad)"`，在 symbol 区定义 `<linearGradient id="ash-grad" x1=0 y1=0 x2=1 y2=1><stop offset=0 stop-color="hsl(152 56% 40%)"/><stop offset=1 stop-color="hsl(146 52% 60%)"/></linearGradient>`（DESIGN §8.3 浅→深绿）。
- favicon data-URI 的 `fill='%232e9e6b'` 保留浅绿（favicon 无主题感知属可接受，但注释标明此为浅色态固定色，避免误以为是变量漂移）。
**验收**：logo 呈浅→深绿渐变，明暗主题下均可见。

---

## 5. P3 — 代码卫生（低优先级，可合并到同轮清理）

- **删死代码**：`02-render.js` 的 `htmlToEl()`（第 74–78 行）；`layout.css` 的 `.sheet`/`.sheet-grip`（第 57–60 行）。
- **清冗余别名**：`tokens.css` 的 `--bg/--surface/--text-2/...` 桥接别名若各模块已直接消费语义令牌，则移除（需先 grep 确认无引用）。
- **字体栈对齐**：`DESIGN §2.2` 写 `Songti SC...serif`，`tokens.css` 写 `Noto Sans SC...sans-serif` —— 以 DESIGN 规范为准统一收尾为 `serif`。
- **双 h1 语义**：hero 两 `<h1>` 靠 CSS 隐藏，建议给隐藏者加 `aria-hidden="true"` 或将非当前语言标题移出文档流前先 `hidden` 属性。

---

## 6. 版本号单一来源治理

| 位置 | 当前值 | 治理 |
|------|--------|------|
| `package.json` version | `1.14.72` | **权威源** |
| 模板注释 `src/index.html` 第 2 行 | `v1.14.69` | 构建时由 `package.json` 注入 `{{VERSION}}` |
| 产物页脚 `v{{VERSION}}` | 注入后 `1.14.72` | 已用占位符，构建注入 ✅ |
| `DESIGN.md` 头 | `1.14.61` | 改为"跟随 package.json"，文档不存硬版本 |
| 各 parts 文件头注释 | `v1.14.6x` | 仅被改动文件更新头注释（全局规则），不批量刷写 |

**验收**：`npm run build` 后产物页脚 == `package.json.version`，其余位置无硬编码冲突。

---

## 7. 实现顺序与验收

1. 先 `npm run build` 重建产物，确认基线 `total` 与 `package.json` 注入链路。
2. 实现 **P0-1 / P0-2 / P0-3**（体验+数据正确性）。
3. 实现 **P1-1 / P1-2 / P1-3**（a11y）。
4. 实现 **P2-1 / P2-2 / P2-3**（视觉/响应式）。
5. 同轮清理 **P3**（死代码+别名+字体栈+双h1）。
6. 全部完成后 `npm run build` 验证产物，跑一次静态检查（grep `_hay` / `htmlToEl` / `.sheet` 确认清零）。

> 变更涉及跨多文件（模板 + 5 css + 6 js + 构建脚本 + data），属"规划模式"，须先经本 spec 确认再进入实现。
