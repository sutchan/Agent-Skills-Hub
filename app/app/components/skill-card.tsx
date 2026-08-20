// app/components/skill-card.tsx v1.14.72 — 技能卡片（对齐 prototype 02-render.js cardHTML）
// 标题与描述按当前语言互斥显示：中文态 .zh，英文态 .en（由 globals.css html[data-lang] 控制）。
import type { Skill } from "@/lib/types";
import { catHue } from "@/lib/catHue";

interface Props {
  skill: Skill;
  view: "grid" | "list";
  onOpen: (s: Skill) => void;
}

function initials(name: string): string {
  const parts = name.trim().split(/[\s-]+/);
  return (parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "");
}

export function SkillCard({ skill, view, onOpen }: Props) {
  const label = skill.zh ? `${skill.name}（${skill.zh}）` : skill.name;
  const hue = catHue(skill.category);
  return (
    <article
      className={`card ${view === "list" ? "list" : ""}`}
      id={`skill-${skill.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")}`}
      data-name={skill.name}
      data-cat={skill.category}
      style={{ "--hue": String(hue) } as React.CSSProperties}
      role="button"
      tabIndex={0}
      aria-label={label}
      onClick={() => onOpen(skill)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen(skill);
        }
      }}
    >
      <span className="cat-bar" style={{ "--hue": String(hue) } as React.CSSProperties} aria-hidden="true" />
      <div className="title-row">
        <div className="avatar sm">{initials(skill.name)}</div>
        <div className="card-title">
          <span className="zh">{skill.zh || skill.name}</span>
          <span className="en">{skill.name}</span>
        </div>
      </div>
      <div className="card-desc">
        <span className="zh">{skill.zhDesc || skill.zh || ""}</span>
        <span className="en">{skill.description || ""}</span>
      </div>
      <div className="card-cat">{skill.category}</div>
    </article>
  );
}
