// prototype/src/parts/06-votes.js v1.14.85 — 技能卡片赞（累加制 + 独立撤销，持久化到 localStorage）
//
// 语义（v1.14.85 起）：点击「赞」为累加（up + 1），可反复表达「它对我有多有用」；
// 「撤销」把该技能的赞清零。此前语义为「双计数独立的布尔开关（0↔1）」——票数恒为 0/1，
// 既无法区分强弱、没有策展价值，也与「计数」这一命名不符，故改为累加制。
// 「踩」已移除：无身份、无审核下踩是纯攻击面（改一个 localStorage key 即可把所有技能打成
// 负分且无法自动修复），负向反馈改由弹窗内「有问题？提 Issue」承接。
//
// 与 app 侧 src/lib/votes.ts 严格同构（同一存储键、同一数据结构、同一累加与撤销语义）。
//
// 排序：build.mjs 按文件名排序拼接 parts，故本文件在 05-main.js 之后加载。
// cardHTML（02-render）调用本文件的 voteHTML()——因全部 part 处于同一脚本作用域且
// 函数声明会提升，故 02 调用 06 的函数是安全的。
// 计数的懒加载（ensureVotes）避免了「必须先于 init() 加载」的时序耦合。

const LS_VOTES = "ash-votes";

// 内存镜像：{ [技能名]: { up: number } }
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
  // 逐条规范化：仅保留 up 为正整数，剔除脏数据与原型污染键；
  // 踩移除后遗留的 down 字段在此被丢弃（存量数据自动迁移）
  const clean = Object.create(null);
  Object.keys(parsed).forEach((name) => {
    const v = parsed[name];
    if (!v || typeof v !== "object") return;
    const up = Number.isFinite(v.up) && v.up > 0 ? Math.floor(v.up) : 0;
    if (up) clean[name] = { up };
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

// 取某技能票数（缺省 {up:0}）
function voteCounts(name) {
  return ensureVotes()[name] || { up: 0 };
}

// 赞 +1（累加制）：可反复点击表达「它对我有多有用」。
// 返回该技能最新的 {up}，供调用方就地更新 DOM。
function addVote(name) {
  const all = ensureVotes();
  const next = { up: (all[name] ? all[name].up : 0) + 1 };
  all[name] = next;
  saveVotes();
  return next;
}

// 撤销该技能的全部赞（up 归零）。未投过赞时返回默认值。
function undoVote(name) {
  const all = ensureVotes();
  if (!all[name]) return { up: 0 };
  delete all[name];
  saveVotes();
  return { up: 0 };
}

// 投票按钮的图标（Material thumb_up 路径，24 视框）
const VOTE_ICON_UP = "M1 21h4V9H1v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-2z";

// 赞按钮（累加制）：aria-label 播报当前计数
function voteButtonHTML(name) {
  const c = voteCounts(name);
  const tip = I18N.t("vote.up") + " " + name + " · " + c.up;
  return `<button type="button" class="vote-btn vote-up" data-vote="up" data-voted="${c.up > 0}" data-name="${esc(name)}"
    aria-label="${esc(tip)}" title="${esc(tip)}">
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="${VOTE_ICON_UP}"/></svg>
    <span class="vote-count" data-vote-count="up" aria-hidden="true">${c.up}</span>
  </button>`;
}

// 撤销按钮：仅在有赞时渲染（避免键盘用户 Tab 到不存在的控件）
function undoButtonHTML(name) {
  if (voteCounts(name).up <= 0) return "";
  const tip = I18N.t("vote.undo") + " " + name;
  return `<button type="button" class="vote-btn vote-undo" data-vote-undo data-name="${esc(name)}"
    aria-label="${esc(tip)}" title="${esc(tip)}"><span aria-hidden="true">↺</span></button>`;
}

// 投票行：赞 + （有赞时）撤销
function voteHTML(name) {
  return `<div class="card-vote" data-vote-row>
    ${voteButtonHTML(name)}${undoButtonHTML(name)}
  </div>`;
}

// 就地更新某张卡片的计数与撤销按钮显隐（避免整卡重渲，保留滚动与展开动效）
function syncVoteUI(card, name) {
  const c = voteCounts(name);
  const row = card.querySelector(".card-vote");
  if (!row) return;
  const btn = row.querySelector('.vote-btn[data-vote="up"]');
  if (btn) {
    const tip = I18N.t("vote.up") + " " + name + " · " + c.up;
    btn.setAttribute("aria-label", tip);
    btn.setAttribute("title", tip);
    const num = btn.querySelector(".vote-count");
    if (num) num.textContent = String(c.up);
  }
  const undo = row.querySelector(".vote-btn.vote-undo");
  if (c.up > 0 && !undo) row.insertAdjacentHTML("beforeend", undoButtonHTML(name));
  else if (c.up === 0 && undo) undo.remove();
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
    const isUndo = btn.hasAttribute("data-vote-undo");
    if (isUndo) undoVote(name);
    else addVote(name);
    const card = btn.closest(".card");
    if (card) syncVoteUI(card, name);
    track("vote", { skill: name, dir: isUndo ? "undo" : "up" });
  });
}

document.addEventListener("DOMContentLoaded", bindVotes);
