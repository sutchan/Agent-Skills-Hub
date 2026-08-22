// app/components/detail/DetailMetrics.tsx v1.19.38 — 技能详情弹窗：派生指标（热度占比条）
import type { Lang } from "../../lib/share";
import type { Skill } from "../../lib/skills";
import { maxPopularity } from "../../lib/detail-helpers";

/** 派生指标：热度占比条（基于 popularity，数据集真实存在） */
export function DetailMetrics({ skill, allSkills, lang }: { skill: Skill; allSkills: Skill[]; lang: Lang }) {
  const pop = skill.popularity || 0;
  const maxPop = maxPopularity(allSkills);
  const pct = maxPop > 0 ? Math.round((pop / maxPop) * 100) : 0;
  return (
    <div className="metrics" id="detailMetrics">
      <div className="metric">
        <div className="metric-label">
          <span>{lang === "zh" ? "热度" : "Popularity"}</span>
          <span>{pct}%</span>
        </div>
        <div className="metric-bar">
          <span style={{ width: `${pct}%` }} />
        </div>
      </div>
    </div>
  );
}
