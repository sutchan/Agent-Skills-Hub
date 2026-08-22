// app/components/detail/DetailRelated.tsx v1.19.38 — 技能详情弹窗：相关技能（同分类）
import type { Lang } from "../../lib/share";
import type { Skill } from "../../lib/skills";

/** 相关技能：同分类、最多 4 个、点击跳转（onOpenSkill） */
export function DetailRelated({
  skill,
  allSkills,
  lang,
  onOpenSkill,
}: {
  skill: Skill;
  allSkills: Skill[];
  lang: Lang;
  onOpenSkill: (s: Skill) => void;
}) {
  const related = allSkills
    .filter((s) => s.name !== skill.name && s.category === skill.category && !s.hidden)
    .slice(0, 4);
  if (!related.length) return null;
  return (
    <div className="related" id="detailRelated">
      <h4>{lang === "zh" ? "相关技能" : "Related skills"}</h4>
      <div className="related-list">
        {related.map((r) => (
          <button
            type="button"
            className="related-item"
            key={r.name}
            onClick={() => onOpenSkill(r)}
            aria-label={r.zh || r.name}
          >
            <span className="avatar sm">{r.name.slice(0, 2).toUpperCase()}</span>
            <span className="related-name">
              <span className="zh">{r.zh || r.name}</span>
              <span className="en">{r.name}</span>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
