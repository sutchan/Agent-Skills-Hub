// src/components/vote-row.tsx v1.14.85 — 投票 UI：卡片赞行（VoteRow）+ 弹窗投票区（DetailVote）
"use client";

import { useState } from "react";
import type { Lang } from "../lib/share";
import { REPO_URL } from "../lib/share";
import {
  castVote,
  clearVote,
  formatVoteReport,
  useVotedCount,
  useVotesFor,
} from "../lib/votes";

// Material thumb_up 路径（24 视框），与原型 voteButtonHTML 完全一致
const ICON_UP =
  "M1 21h4V9H1v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-2z";

/**
 * 赞行。累加制：点击 👍 计数 +1，可反复点击表达「它对我有多有用」；
 * up > 0 时出现独立「撤销」按钮把计数归零 —— 取消不再由再次点击 👍 触发，
 * 否则无法同时满足「可累加」与「可回退」。
 * 无障碍：累加态无法用 aria-pressed 表达（pressed 是二值语义），改由 aria-label
 * 播报当前计数；撤销按钮仅在有赞时渲染，避免键盘用户 Tab 到不存在的控件。
 */
export function VoteRow({
  name,
  up,
  lang,
  onVote,
  onClear,
}: {
  name: string;
  up: number;
  lang: Lang;
  onVote: (name: string) => void;
  onClear: (name: string) => void;
}) {
  const upLabel =
    lang === "zh" ? `赞「${name}」，当前 ${up} 赞` : `Upvote "${name}", currently ${up}`;
  const undoLabel = lang === "zh" ? `撤销对「${name}」的赞` : `Undo upvote for "${name}"`;
  return (
    <div className="card-vote" data-vote-row>
      <button
        type="button"
        className="vote-btn vote-up"
        data-vote="up"
        data-voted={up > 0}
        aria-label={upLabel}
        title={upLabel}
        onClick={() => onVote(name)}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d={ICON_UP} />
        </svg>
        <span className="vote-count" aria-hidden="true">{up}</span>
      </button>
      {up > 0 && (
        <button
          type="button"
          className="vote-btn vote-undo"
          data-vote-undo
          aria-label={undoLabel}
          title={undoLabel}
          onClick={() => onClear(name)}
        >
          <span aria-hidden="true">↺</span>
        </button>
      )}
    </div>
  );
}

// 带 vote-report 标签的 Issue 预填入口：原「踩」按钮移除后的负向反馈通道
const ISSUE_NEW = `${REPO_URL}/issues/new?labels=vote-report`;

/**
 * 详情弹窗投票区。位置在描述之后、相关技能之前（表态应在读完内容之后）。
 * 承担三件事：
 *  1. 赞（累加制）与撤销 —— 与卡片共用同一 store，两处实时同步；
 *  2. 口径说明 —— 明确区分「热度」（构建期派生的被提及次数）与「赞」（用户手动反馈），
 *     避免用户把后者当成前者的同类指标；
 *  3. 本地闭环 —— 「导出我的赞」把本浏览器累计复制出来供上报；「有问题？提 Issue」承接负向反馈。
 */
export function DetailVote({ name, lang }: { name: string; lang: Lang }) {
  const { up } = useVotesFor(name);
  const votedCount = useVotedCount();
  const [copied, setCopied] = useState(false);
  const zh = lang === "zh";

  async function exportVotes() {
    const text = formatVoteReport();
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* 剪贴板不可用（非安全上下文 / 权限拒绝）：静默，不打断浏览 */
    }
  }

  return (
    <div className="d-vote" id="detailVote">
      <h4>{zh ? "有用性反馈" : "Usefulness feedback"}</h4>
      <VoteRow name={name} up={up} lang={lang} onVote={castVote} onClear={clearVote} />
      <p className="d-vote-note">
        {zh
          ? "「热度」指被其他技能提及的次数（构建期自动派生）；「赞」是你在本机手动累积的评价，仅存在于此浏览器，导出后可上报仓库。"
          : "Heat = how many other skills mention this one (auto-derived at build time). Upvote = your own rating, kept in this browser only and reportable on export."}
      </p>
      <div className="d-vote-actions">
        <button
          type="button"
          id="exportVotesBtn"
          className="btn ghost"
          disabled={votedCount === 0}
          onClick={exportVotes}
        >
          {copied
            ? zh
              ? "已复制"
              : "Copied"
            : zh
              ? `导出我的赞（${votedCount}）`
              : `Export my upvotes (${votedCount})`}
        </button>
        <a className="btn ghost" id="reportIssueLink" href={ISSUE_NEW} target="_blank" rel="noreferrer">
          {zh ? "有问题？提 Issue" : "Something wrong? Open an issue"} ↗
        </a>
      </div>
    </div>
  );
}
