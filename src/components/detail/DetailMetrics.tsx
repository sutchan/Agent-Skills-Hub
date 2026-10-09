// src/components/detail/DetailMetrics.tsx v1.14.88 — 技能详情弹窗：派生指标（5 格热度，对齐原型 popularityHTML）
import type { Lang } from "../../lib/share";
import type { Skill } from "../../lib/skills";
import { maxPopularity } from "../../lib/detail-helpers";

const HEAT_STEPS = 5;

/**
 * 派生指标：5 格热度条（对齐 prototype popularityHTML）。
 * 值与结构严格对齐原型：热度 = 被其他技能 description 提及的次数（构建期派生），
 * 文案用原始「次数」而非百分比；点亮格数按 max 归一，与原型同算法。
 * 容器/格样式用共享 CSS 的 .detail-metrics / .metric-pop / .heat-bars i.on /.pop-label。
 */
export function DetailMetrics({ skill, allSkills, lang }: { skill: Skill; allSkills: Skill[]; lang: Lang }) {
  const pop = skill.popularity || 0;
  const maxPop = maxPopularity(allSkills);
  const filled = maxPop > 0 ? Math.round((pop / maxPop) * HEAT_STEPS) : 0;
  const label =
    pop > 0
      ? `${pop} ${lang === "zh" ? "次被引用" : "referenced"}`
      : lang === "zh"
        ? "独立"
        : "standalone";
  return (
    <div className="detail-metrics" id="detailMetrics">
      <div className="metric-pop">
        <span
          className="heat-bars"
          role="img"
          aria-label={`${lang === "zh" ? "热度" : "Popularity"} ${pop}`}
        >
          {Array.from({ length: HEAT_STEPS }, (_, i) => (
            <i key={i} className={i < filled ? "heat on" : "heat"} aria-hidden="true" />
          ))}
        </span>
        <span className="pop-label">{label}</span>
      </div>
    </div>
  );
}
