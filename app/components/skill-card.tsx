// app/components/skill-card.tsx v1.19.4 — 技能卡片（原生 button，含双语标题与 .card-body 列表布局修复）
"use client";
import { catHue } from "../lib/catHue";
import type { Skill } from "../lib/skills";

function initials(name: string): string {
  const parts = name.split(/[-_\s]+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

export function SkillCard({
  skill,
  onOpen,
}: {
  skill: Skill;
  onOpen: (s: Skill) => void;
}) {
  return (
    <button
      type="button"
      className="card"
      id={`skill-${skill.name}`}
      data-name={skill.name}
      data-cat={skill.category}
      aria-label={skill.zh || skill.name}
      onClick={() => onOpen(skill)}
    >
      <div className="cat-bar" style={{ ["--hue" as string]: catHue(skill.category) }} aria-hidden="true" />
      <div className="card-body">
        <div className="title-row">
          <div className="avatar sm">{initials(skill.name)}</div>
          <div className="card-title">
            <span className="zh">{skill.zh || skill.name}</span>
            <span className="en">{skill.name}</span>
          </div>
        </div>
        <div className="card-desc">
          <span className="zh">{skill.description}</span>
          <span className="en">{skill.enDescription || ""}</span>
        </div>
        <div className="card-cat">
          <span className="zh">{skill.category}</span>
          <span className="en">{skill.enCategory || skill.category}</span>
        </div>
      </div>
    </button>
  );
}
