// app/components/detail/DetailMetrics.tsx v1.14.55 — 技能详情弹窗：派生指标（5 格热度，对齐原型 popularityHTML）
import type { Lang } from "../../lib/share";
import type { Skill } from "../../lib/skills";
import { maxPopularity } from "../../lib/detail-helpers";

const HEAT_STEPS = 5;

/** 派生指标：5 格热度条（对齐 prototype popularityHTML 的 5 格视觉，数值文本保留百分比无障碍标签） */
export function DetailMetrics({ skill, allSkills, lang }: { skill: Skill; allSkills: Skill[]; lang: Lang }) {
  const pop = skill.popularity || 0;
  const maxPop = maxPopularity(allSkills);
  const pct = maxPop > 0 ? Math.round((pop / maxPop) * 100) : 0;
  const lit = Math.round((pct / 100) * HEAT_STEPS); // 点亮格数（0~5）
  return (
    <div className="metrics" id="detailMetrics">
      <div className="metric">
        <div className="metric-label">
          <span>{lang === "zh" ? "热度" : "Popularity"}</span>
          <span>{pct}%</span>
        </div>
        <div className="heat-row" role="img" aria-label={`${lang === "zh" ? "热度" : "Popularity"} ${pct}%`}>
          {Array.from({ length: HEAT_STEPS }, (_, i) => (
            <span key={i} className={`heat-dot${i < lit ? " on" : ""}`} aria-hidden="true" />
          ))}
        </div>
      </div>
    </div>
  );
}
