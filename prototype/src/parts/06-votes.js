// prototype/src/parts/06-votes.js v1.14.81 — 技能卡片赞/踩（双计数独立，持久化到 localStorage）
//
// 语义：赞与踩各自独立计数、互不影响，可同时为正（不互相抵消）。
// 计数来源仅限本机（无后端聚合），故数值代表「本浏览器的累计」，点击同项即切换其自身开关：
//   赞 +1 / 再点赞 -1（取消赞）；踩的增减完全独立于赞。
//
// 排序：build.mjs 按文件名排序拼接 parts，故本文件在 05-main.js 之后加载。
// cardHTML（02-render）调用本文件的 voteHTML()——因全部 part 处于同一脚本作用域且
// 函数声明会提升，故 02 调用 06 的函数是安全的。
// 计数的懒加载（ensureVotes）避免了「必须先于 init() 加载」的时序耦合。

const LS_VOTES = "ash-votes";
const VOTE_DIRECTIONS = ["up", "down"];

// 内存镜像：{ [技能名]: { up: number, down: number } }
let VOTES = null;

// 懒加载 localStorage：首次访问时读入内存镜像。
// 用 try/catch 兜住隐私模式与 JSON 损坏；结构非法时重置为空表而非抛错。
function ensureVotes() {
  if (VOTES) return VOTES;
  let raw = null;
  try {
    raw = localStorage.getItem(LS_VOTES);
  } catch (e) {
    raw = null; // 隐私模式：退化为纯内存
  }
  let parsed = {};
  if (raw) {
    try {
      const o = JSON.parse(raw);
      if (o && typeof o === "object" && !Array.isArray(o)) parsed = o;
    } catch (e) {
      parsed = {}; // 数据损坏：重置
    }
  }
  // 逐条规范化：仅保留 {up,down} 为非负整数，剔除脏数据与原型污染键
  const clean = Object.create(null);
  Object.keys(parsed).forEach((name) => {
    const v = parsed[name];
    if (!v || typeof v !== "object") return;
    const up = Number.isFinite(v.up) && v.up > 0 ? Math.floor(v.up) : 0;
    const down = Number.isFinite(v.down) && v.down > 0 ? Math.floor(v.down) : 0;
    if (up || down) clean[name] = { up, down };
  });
  VOTES = clean;
  return VOTES;
}

function saveVotes() {
  try {
    localStorage.setItem(LS_VOTES, JSON.stringify(ensureVotes()));
  } catch (e) {
    /* 隐私模式/配额超限：仅保留内存态 */
  }
}

// 取某技能票数（缺省 {up:0,down:0}）
function voteCounts(name) {
  return ensureVotes()[name] || { up: 0, down: 0 };
}

// 切换某方向的计数：0↔1↔2…（再次点击同一项即取消该项）
// 返回该技能最新的 {up,down}，供调用方就地更新 DOM。
function toggleVote(name, dir) {
  if (VOTE_DIRECTIONS.indexOf(dir) === -1) return voteCounts(name);
  const all = ensureVotes();
  const cur = all[name] || { up: 0, down: 0 };
  // 仅改本方向，另一方向保持不变 —— 这是「双计数独立」的核心
  const next = { up: cur.up, down: cur.down };
  next[dir] = cur[dir] > 0 ? 0 : cur[dir] + 1;
  if (next.up || next.down) all[name] = next;
  else delete all[name];
  saveVotes();
  return next.up || next.down ? next : { up: 0, down: 0 };
}

// 清除全部票数（设置面板「重置」用；与偏好清理保持同一入口语义）
function clearVotes() {
  VOTES = Object.create(null);
  saveVotes();
}

// 投票按钮的图标（Material thumb_up / thumb_down 路径，24 视框）
const VOTE_ICON = {
  up: "M1 21h4V9H1v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-2z",
  down: "M15 3H6c-.83 0-1.54.5-1.84 1.22l-3.02 7.05c-.09.23-.14.47-.14.73v2c0 1.1.9 2 2 2h6.31l-.95 4.57-.03.32c0 .41.17.79.44 1.06L9.83 23l6.59-6.59c.36-.36.58-.86.58-1.41V5c0-1.1-.9-2-2-2zm4 0v12h4V3h-4z",
};

// 单个投票按钮
function voteButtonHTML(name, dir) {
  const c = voteCounts(name);
  const on = c[dir] > 0;
  const label = I18N.t(dir === "up" ? "vote.up" : "vote.down");
  const tip = `${label} ${name}`;
  return `<button type="button" class="vote-btn vote-${dir}" data-vote="${dir}" data-name="${esc(name)}"
    aria-pressed="${on}" aria-label="${esc(tip)}" title="${esc(tip)}">
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="${VOTE_ICON[dir]}"/></svg>
    <span class="vote-count" data-vote-count="${dir}" aria-hidden="true">${c[dir]}</span>
  </button>`;
}

// 投票行：两个方向各自独立
function voteHTML(name) {
  return `<div class="card-vote" data-vote-row>
    ${voteButtonHTML(name, "up")}${voteButtonHTML(name, "down")}
  </div>`;
}

// 就地更新某张卡片两个按钮的计数与按下态（避免整卡重渲，保留滚动与展开动效）
function syncVoteUI(card, name) {
  const c = voteCounts(name);
  ["up", "down"].forEach((dir) => {
    const btn = card.querySelector('.vote-btn[data-vote="' + dir + '"]');
    if (!btn) return;
    btn.setAttribute("aria-pressed", c[dir] > 0 ? "true" : "false");
    const num = btn.querySelector(".vote-count");
    if (num) num.textContent = String(c[dir]);
  });
}

// 事件绑定：委托到 document，覆盖后续动态插入的卡片
function bindVotes() {
  document.addEventListener("click", (e) => {
    const btn = e.target.closest(".vote-btn");
    if (!btn) return;
    // 关键：投票不冒泡去触发卡片打开（卡片打开由 04 的 grid 委托处理并跳过 [data-vote]）
    e.preventDefault();
    e.stopPropagation();
    const name = btn.getAttribute("data-name");
    if (!name) return;
    toggleVote(name, btn.getAttribute("data-vote"));
    const card = btn.closest(".card");
    if (card) syncVoteUI(card, name);
    track("vote", { skill: name, dir: btn.getAttribute("data-vote") });
  });
}

document.addEventListener("DOMContentLoaded", bindVotes);
