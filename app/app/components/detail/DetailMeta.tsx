// app/components/detail/DetailMeta.tsx v1.19.39 — 技能详情弹窗：元信息行（原始名/分类/作者/协议/版本/网址/size/files）
import type { Lang } from "../../lib/share";
import type { Skill } from "../../lib/skills";
import { formatSize } from "../../lib/detail-helpers";

/** 元信息字段：仅渲染数据集真实存在的字段（避免空区块死代码） */
export function DetailMeta({ skill, lang }: { skill: Skill; lang: Lang }) {
  const isZh = lang === "zh";
  const t = (zh: string, en: string) => (isZh ? zh : en);
  const rows: { k: string; v: string; link?: string }[] = [];

  // 原始名称（slug）—— 始终展示
  rows.push({ k: t("原始名称", "Original name"), v: skill.name });
  // 分类（中文 + 英文）
  if (skill.category) {
    rows.push({ k: t("分类", "Category"), v: skill.enCategory ? `${skill.category} · ${skill.enCategory}` : skill.category });
  }
  if (skill.author) rows.push({ k: t("作者", "Author"), v: skill.author });
  if (skill.license) rows.push({ k: t("协议", "License"), v: skill.license });
  if (skill.skillVersion) rows.push({ k: t("版本", "Version"), v: skill.skillVersion });
  if (skill.firstSeen) rows.push({ k: t("首次收录", "First seen"), v: skill.firstSeen });
  if (skill.stars != null) rows.push({ k: t("星标", "Stars"), v: String(skill.stars) });
  if (/^https?:\/\//i.test(skill.homepage || "")) {
    rows.push({ k: t("主页", "Homepage"), v: skill.homepage as string, link: skill.homepage });
  }
  if (typeof skill.size === "number") rows.push({ k: t("体积", "Size"), v: formatSize(skill.size) });
  if (typeof skill.files === "number") rows.push({ k: t("文件数", "Files"), v: String(skill.files) });

  if (!rows.length) return null;
  return (
    <div className="detail-meta" id="detailMeta">
      {rows.map((r) => (
        <div className="meta-row" key={r.k}>
          <span className="meta-k">{r.k}</span>
          {r.link ? (
            <a className="meta-v link" href={r.link} target="_blank" rel="noreferrer">{r.v}</a>
          ) : (
            <span className="meta-v">{r.v}</span>
          )}
        </div>
      ))}
    </div>
  );
}
