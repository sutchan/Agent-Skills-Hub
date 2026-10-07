// src/components/skill-card.tsx v1.14.81 — 技能卡片（div 容器 + .card-open 触发区 + 内嵌赞/踩行）
"use client";
import { memo } from "react";
import { catHue } from "../lib/catHue";
import { initials } from "../lib/initials";
import { skillSlug } from "../lib/skillSlug";
import type { Lang } from "../lib/share";
import type { Skill } from "../lib/skills";
import { castVote, useVotesFor } from "../lib/votes";
import { VoteRow } from "./vote-row";

// 卡片为 <div> 容器而非 <button>：打开详情由 .card-open 承担，赞/踩为其后同级独立按钮，
// 避免「按钮内嵌按钮」的无效 HTML 与读屏器无法区分二者（对齐原型 cardHTML / 06-votes.js）
export const SkillCard = memo(function SkillCard({
  skill,
  onOpen,
  lang,
  showDesc = true,
  showCat = true,
  showBar = true,
  nameMode = "both",
}: {
  skill: Skill;
  onOpen: (s: Skill) => void;
  lang: Lang;
  showDesc?: boolean;
  showCat?: boolean;
  showBar?: boolean;
  nameMode?: "both" | "zh" | "en";
}) {
  const showZh = nameMode === "both" || nameMode === "zh";
  const showEn = nameMode === "both" || nameMode === "en";
  // 订阅本技能票数：store 引用稳定，仅该技能变化时本卡重渲
  const votes = useVotesFor(skill.name);
  return (
    <div
      className="card"
      id={`skill-${skillSlug(skill.name)}`}
      data-name={skill.name}
      data-cat={skill.category}
    >
      {showBar && (
        <div className="cat-bar" style={{ ["--hue" as string]: catHue(skill.category) }} aria-hidden="true" />
      )}
      <div className="card-body">
        <button
          type="button"
          className="card-open"
          aria-label={skill.zh || skill.name}
          onClick={() => onOpen(skill)}
        >
          <div className="title-row">
            <div className="avatar sm">{initials(skill.name)}</div>
            <div className="card-title">
              {showZh && <span className="zh">{skill.zh || skill.name}</span>}
              {showEn && <span className="en">{skill.name}</span>}
            </div>
          </div>
          {showDesc && (
            <div className="card-desc">
              <span className="zh">{skill.description}</span>
              <span className="en">{skill.enDescription || ""}</span>
            </div>
          )}
          {showCat && (
            <div className="card-cat">
              <span className="zh">{skill.category}</span>
              <span className="en">{skill.enCategory || skill.category}</span>
            </div>
          )}
        </button>
      </div>
      <VoteRow name={skill.name} up={votes.up} down={votes.down} lang={lang} onVote={castVote} />
    </div>
  );
});
