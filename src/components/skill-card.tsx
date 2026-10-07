// app/components/skill-card.tsx v1.20.6 — 技能卡片（原生 button，含双语标题与 .card-body 列表布局修复）
"use client";
import { memo } from "react";
import { catHue } from "../lib/catHue";
import { initials } from "../lib/initials";
import { skillSlug } from "../lib/skillSlug";
import type { Skill } from "../lib/skills";

export const SkillCard = memo(function SkillCard({
  skill,
  onOpen,
  showDesc = true,
  showCat = true,
  showBar = true,
  nameMode = "both",
}: {
  skill: Skill;
  onOpen: (s: Skill) => void;
  showDesc?: boolean;
  showCat?: boolean;
  showBar?: boolean;
  nameMode?: "both" | "zh" | "en";
}) {
  // 标题双语显示：中文态中文名主 + 英文原名副（双显/仅英文时显示英文原名）
  const showZh = nameMode === "both" || nameMode === "zh";
  const showEn = nameMode === "both" || nameMode === "en";
  return (
    <button
      type="button"
      className="card"
      id={`skill-${skillSlug(skill.name)}`}
      data-name={skill.name}
      data-cat={skill.category}
      aria-label={skill.zh || skill.name}
      onClick={() => onOpen(skill)}
    >
      {showBar && (
        <div className="cat-bar" style={{ ["--hue" as string]: catHue(skill.category) }} aria-hidden="true" />
      )}
      <div className="card-body">
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
      </div>
    </button>
  );
});
