// tools/build-votes.mjs v1.14.85 — 汇总用户上报的赞票数 → data/skills-votes.json
//
// 数据来源：仓库中带 `vote-report` 标签的 Issue 及其评论。用户在前端点「导出我的赞」
// 会生成一段 Markdown（见 src/lib/votes.ts formatVoteReport），贴到 Issue 后即被本脚本解析。
// 选 GitHub 作为存储：读取无需认证（未认证 60 次/小时，构建期足够）、天然带审计与限流、
// 且不引入任何新依赖 —— 与本仓库「零后端」的前提兼容。
//
// 用法：node tools/build-votes.mjs
//   无网络 / 无 token / Issue 不存在时优雅降级：保留既有产物并以 exit 0 结束，
//   绝不阻塞构建（票数是增强项，不是构建硬依赖）。
import { writeFileSync, existsSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = dirname(__dirname);
const OUT = join(ROOT, "data", "skills-votes.json");

const REPO = process.env.VOTES_REPO || "sutchan/Agent-Skills-Hub";
const LABEL = process.env.VOTES_LABEL || "vote-report";
const API = "https://api.github.com";

// 解析上报文本：形如  - `skill-name` × 3
const LINE = /^-\s+`([^`]+)`\s+×\s+(\d+)\s*$/gm;

function parseReport(body) {
  const out = {};
  if (!body) return out;
  LINE.lastIndex = 0;
  let m;
  while ((m = LINE.exec(body))) {
    const name = m[1].trim();
    const n = Number.parseInt(m[2], 10);
    if (name && Number.isFinite(n) && n > 0) out[name] = (out[name] || 0) + n;
  }
  return out;
}
async function getJSON(url) {
  const headers = { Accept: "application/vnd.github+json", "User-Agent": "agent-skills-hub-votes" };
  // 可选token：仅用于提高速率限制，读取本身不需要
  if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error(`HTTP ${res.status} ${url}`);
  return res.json();
}

async function collect() {
  const list = `${API}/repos/${REPO}/issues?labels=${encodeURIComponent(LABEL)}&state=all&per_page=100`;
  const issues = await getJSON(list);
  const totals = {};
  let issuesRead = 0;
  let commentsRead = 0;
  for (const issue of issues) {
    if (Array.isArray(issue.pull_request)) continue; // 跳过 PR
    issuesRead++;
    for (const [name, n] of Object.entries(parseReport(issue.body))) {
      totals[name] = (totals[name] || 0) + n;
    }
    const cs = await getJSON(`${API}/repos/${REPO}/issues/${issue.number}/comments?per_page=100`);
    commentsRead++;
    for (const c of cs) {
      for (const [name, n] of Object.entries(parseReport(c.body))) {
        totals[name] = (totals[name] || 0) + n;
      }
    }
  }
  return { totals, issuesRead, commentsRead };
}

async function main() {
  try {
    const { totals, issuesRead, commentsRead } = await collect();
    // 规范化：丢弃非法项，按技能名排序保证产物确定性（diff 稳定）
    const clean = {};
    for (const name of Object.keys(totals).sort()) {
      const n = Math.floor(totals[name]);
      if (Number.isFinite(n) && n > 0) clean[name] = n;
    }
    mkdirSync(dirname(OUT), { recursive: true });
    writeFileSync(OUT, JSON.stringify(clean, null, 2) + "\n", "utf8");
    const sum = Object.values(clean).reduce((s, n) => s + n, 0);
    console.log(`汇总赞票数：${Object.keys(clean).length} 个技能 / 合计 ${sum} 赞（读取 ${issuesRead} 个 issue、${commentsRead} 次评论）-> ${OUT}`);
  } catch (e) {
    // 优雅降级：网络不可用 / 仓库不可访问 / API 变更时保留既有产物，不阻塞构建
    const hint = existsSync(OUT) ? `保留既有产物 ${OUT}` : `未生成 ${OUT}（页面按无票数渲染）`;
    console.warn(`WARN: 赞票数汇总跳过：${e.message}；${hint}`);
  }
}

main();