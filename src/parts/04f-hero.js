// prototype/src/parts/04f-hero.js v1.16.6 — Hero 节点网 + 骰子 + 相关绑定
function updateHeroNet() {
  const net = $("#heroNet");
  if (!net) return;
  const active = Boolean(state.query) || Boolean(state.cats);
  net.classList.toggle("filtering", active);
  net.classList.toggle("searching", Boolean(state.query));
  // 单选：仅当前选中分类的节点点亮
  net.querySelectorAll(".hub-node[data-cat]").forEach((n) => {
    n.classList.toggle("active", state.cats === n.getAttribute("data-cat"));
  });
  // 选中分类时，核心节点（.hub-core / .hub-glow）同步为该分类色；清空回落主色绿（CSS 默认 --core-hue 未定义）
  const core = net.querySelector(".hub-core");
  const glow = net.querySelector(".hub-glow");
  if (state.cats) {
    const hue = catHue(state.cats);
    [core, glow].forEach((el) => { if (el) el.style.setProperty("--core-hue", String(hue)); });
  } else {
    [core, glow].forEach((el) => { if (el) el.style.removeProperty("--core-hue"); });
  }
}

// 分类名 → 稳定 32 位哈希（FNV-1a），用于节点确定性布局抖动（避免 Math.random 刷新跳变，C7）
function catHash(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}

// 方案 A：按分类动态生成节点（半径随技能数变化），环绕核心排布，可交互
function renderHeroNodes() {
  const g = $("#netNodes");
  if (!g || !SKILLS_DATA.categories) return;
  // 统计各分类技能数（categories 为分类名字符串数组，计数需从 skills 聚合）
  const counts = new Map();
  SKILLS_DATA.skills.forEach((s) => { if (!s.hidden) counts.set(s.category, (counts.get(s.category) || 0) + 1); });
  const cats = SKILLS_DATA.categories;
  const vals = cats.map((c) => counts.get(c) || 0);
  const min = Math.min(...vals), max = Math.max(...vals);
  const cx = 250, cy = 110; // 核心坐标（居中于 500x240 viewBox）
  const n = cats.length;
  g.innerHTML = "";
  // 动态生成核心→节点连线（随随机分布变化，替代 index.html 静态 line）
  const lineG = document.getElementById("netLines");
  if (lineG) {
    lineG.innerHTML = "";
    cats.forEach(() => {
      const ln = document.createElementNS("http://www.w3.org/2000/svg", "line");
      ln.setAttribute("class", "net-line");
      ln.setAttribute("x1", cx); ln.setAttribute("y1", cy);
      ln.setAttribute("stroke", "hsl(var(--line))");
      ln.setAttribute("stroke-width", "2.0");
      lineG.appendChild(ln);
    });
  }
  // 确定性布局：按分类序号均匀环绕核心排布 + 基于分类名的稳定抖动
  const ringR = 76; // 环绕半径（viewBox 空间），留出核心区与外围间距
  cats.forEach((c, idx) => {
    const h = catHash(c);
    const ang = (idx / n) * Math.PI * 2 - Math.PI / 2 + (((h % 11) - 5) * 0.025);
    const t = max > min ? ((counts.get(c) || 0) - min) / (max - min) : .5;
    const r = 3 + Math.pow(t, 1.4) * 13; // 半径 ~3~16 随计数，非线性放大大小差异（大分类更突出）
    const ring = ringR + t * 26; // 大分类更靠外，与小分类拉开层次
    const jx = ((h >> 3) % 17) - 8;
    const jy = ((h >> 7) % 17) - 8;
    const x = cx + Math.cos(ang) * ring + jx;
    const y = cy + Math.sin(ang) * ring * 0.82 + jy;
    const node = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    node.setAttribute("class", "hub-node");
    node.setAttribute("cx", x.toFixed(1));
    node.setAttribute("cy", y.toFixed(1));
    node.setAttribute("r", r.toFixed(1));
    node.setAttribute("fill", `hsl(${catHue(c)} 65% 38%)`);
    node.setAttribute("data-cat", c);
    // 节点是分类筛选的「鼠标第二入口」；键盘/读屏统一走顶部 chip，
    // 故节点设为装饰性（aria-hidden + 无 tabindex/role），避免与 chip 重复的 14 个 tab stop（C8）
    node.setAttribute("aria-hidden", "true");
    // 同步对应连线终点
    if (lineG && lineG.children[idx]) {
      lineG.children[idx].setAttribute("x2", x.toFixed(1));
      lineG.children[idx].setAttribute("y2", y.toFixed(1));
      // 连线上的缓慢移动圆点：用 SVG animateMotion 沿 core→节点路径流动（错峰时长，纯 SMIL 合成不逐帧）
      const dot = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      dot.setAttribute("class", "net-dot");
      dot.setAttribute("r", "2.2");
      const motion = document.createElementNS("http://www.w3.org/2000/svg", "animateMotion");
      motion.setAttribute("dur", (4 + (idx % 5) * 0.7).toFixed(1) + "s");
      motion.setAttribute("repeatCount", "indefinite");
      motion.setAttribute("path", `M${cx} ${cy} L${x.toFixed(1)} ${y.toFixed(1)}`);
      dot.appendChild(motion);
      lineG.appendChild(dot);
    }
    // 错峰浮动：按节点序号注入固定相位偏移（5.5s 周期内均分），刷新稳定不跳变，纯 CSS 合成不逐帧
    node.style.animationDelay = (-(5.5 * idx / n)).toFixed(2) + "s";
    node.addEventListener("mouseenter", () => highlightCatCards(c, true));
    node.addEventListener("mouseleave", () => highlightCatCards(c, false));
    node.addEventListener("click", () => toggleHeroCat(c));
    g.appendChild(node);
  });
  // 连线常态错峰呼吸：注入相位偏移（4.8s 周期均分），强化节点网"信号流动"观感
  if (lineG) {
    const lines = lineG.querySelectorAll(".net-line");
    lines.forEach((ln, i) => { ln.style.animationDelay = (-(4.8 * i / lines.length)).toFixed(2) + "s"; });
  }
}

// 方案 A：节点 hover → 对应分类卡片脉冲高亮
function highlightCatCards(cat, on) {
  document.querySelectorAll("#grid .card").forEach((card) => {
    if (card.dataset.cat === cat) card.classList.toggle("pulse", on);
  });
}

// 方案 A：节点 click → 切换该分类筛选（单选；再次点击同一节点即取消）
function toggleHeroCat(cat) {
  if (typeof setCategory === "function") {
    setCategory(cat, "hero_node");
  } else {
    state.cats = state.cats === cat ? "" : cat;
    state.page = 0;
    updateHeroNet();
    renderGrid();
  }
}

// 方案 B：随机抽一个技能（翻牌动画开盲盒）
function rollDice() {
  const pool = SKILLS_DATA.skills.filter((s) => !s.hidden);
  if (!pool.length) return;
  const skill = pool[Math.floor(Math.random() * pool.length)];
  const dialog = document.getElementById("dialog");
  openDetail(skill);
  if (dialog) {
    dialog.classList.remove("flip");
    void dialog.offsetWidth; // 触发重排以重启动画
    dialog.classList.add("flip");
  }
  track("dice_roll", { skill: skill.name });
}
function bindDice() {
  const diceBtn = $("#diceBtn");
  if (diceBtn) diceBtn.addEventListener("click", rollDice);
}
