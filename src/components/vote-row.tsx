// src/components/vote-row.tsx v1.14.81 — 卡片赞/踩行（双计数独立，样式与原型 06-votes.js 同源）
"use client";

import type { Lang } from "../lib/share";
import type { VoteDir } from "../lib/votes";

// Material thumb_up / thumb_down 路径（24 视框），与原型 voteButtonHTML 完全一致
const ICON: Record<VoteDir, string> = {
  up: "M1 21h4V9H1v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-2z",
  down: "M15 3H6c-.83 0-1.54.5-1.84 1.22l-3.02 7.05c-.09.23-.14.47-.14.73v2c0 1.1.9 2 2 2h6.31l-.95 4.57-.03.32c0 .41.17.79.44 1.06L9.83 23l6.59-6.59c.36-.36.58-.86.58-1.41V5c0-1.1-.9-2-2-2zm4 0v12h4V3h-4z",
};

const LABEL: Record<Lang, Record<VoteDir, string>> = {
  zh: { up: "赞", down: "踩" },
  en: { up: "Upvote", down: "Downvote" },
};

/**
 * 赞/踩行。两个方向各自独立，不互相取反。
 * 无障碍：颜色非唯一区分手段——上下箭头形状不同，且 aria-pressed 同步开关状态；
 * 计数标 aria-hidden（对读屏而言 aria-pressed 已表达"我是否投过"）。
 */
export function VoteRow({
  name,
  up,
  down,
  lang,
  onVote,
}: {
  name: string;
  up: number;
  down: number;
  lang: Lang;
  onVote: (name: string, dir: VoteDir) => void;
}) {
  const btn = (dir: VoteDir, n: number) => {
    const label = LABEL[lang][dir];
    const tip = `${label} ${name}`;
    return (
      <button
        key={dir}
        type="button"
        className={`vote-btn vote-${dir}`}
        data-vote={dir}
        aria-pressed={n > 0}
        aria-label={tip}
        title={tip}
        onClick={() => onVote(name, dir)}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d={ICON[dir]} />
        </svg>
        <span className="vote-count" aria-hidden="true">{n}</span>
      </button>
    );
  };
  return (
    <div className="card-vote" data-vote-row>
      {btn("up", up)}
      {btn("down", down)}
    </div>
  );
}
