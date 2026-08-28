// app/components/detail-modal.tsx v1.14.43 — 技能详情弹窗（编排头部 + 组合元信息/指标/安装/相关技能区块）
"use client";
import { useEffect, useState } from "react";
import type { Lang } from "../lib/share";
import type { Skill } from "../lib/skills";
import { catHue } from "../lib/catHue";
import { initials } from "../lib/initials";
import { copyText } from "../lib/detail-helpers";
import { copySkillShare, SHARE_FEEDBACK } from "../lib/share";
import { DetailMeta } from "./detail/DetailMeta";
import { DetailMetrics } from "./detail/DetailMetrics";
import { DetailInstall } from "./detail/DetailInstall";
import { DetailRelated } from "./detail/DetailRelated";

const GITHUB_TREE = "https://github.com/sutchan/Agent-Skills-Hub/tree/main";

export function DetailModal({
  skill,
  lang,
  allSkills,
  onClose,
  onOpenSkill,
}: {
  skill: Skill;
  lang: Lang;
  allSkills: Skill[];
  onClose: () => void;
  onOpenSkill: (s: Skill) => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  // 打开期间锁定 body 滚动（v1.14.43）：否则移动端/长列表弹窗背后内容仍可滚动。
  // 记录并还原原值，避免覆盖全局样式中已设置的 overflow。
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);

  // 翻牌入场动画（对齐 prototype .dialog.flip）：挂载后下一帧加 flip class
  const [flip, setFlip] = useState(false);
  useEffect(() => { setFlip(false); const id = requestAnimationFrame(() => setFlip(true)); return () => cancelAnimationFrame(id); }, []);

  // githubDir 为仓库内部已知路径（skills/<name>），按原型直接拼接，
  // 不编码斜杠，否则 skills%2Fxxx 导致 GitHub 链接 404（对齐 03-detail.js:96）
  const githubUrl = `${GITHUB_TREE}/${skill.githubDir}`;
  const tools = (skill.allowedTools || []).filter(Boolean);
  const desc = lang === "zh" ? skill.description : skill.enDescription || skill.description;

  return (
    <div className="detail-overlay" id="detailOverlay" role="dialog" aria-modal="true" aria-label={skill.zh || skill.name}>
      <div className={`detail dialog show${flip ? " flip" : ""}`} id="detailDialog" onClick={(e) => e.stopPropagation()}>
        <div className="detail-head" id="detailHead">
          <span className="avatar" style={{ ["--hue" as string]: catHue(skill.category) }} aria-hidden="true">
            {initials(skill.name)}
          </span>
          <div className="detail-titles">
            <span className="zh">{skill.zh || skill.name}</span>
            <span className="en">{skill.name}</span>
          </div>
          <button
            id="copyNameBtn"
            className="mini-btn"
            aria-label={lang === "zh" ? "复制技能名" : "Copy skill name"}
            onClick={() => copyText(skill.name, lang)}
          >
            {lang === "zh" ? "复制名" : "Copy"}
          </button>
          <button
            id="shareSkillBtn"
            className="mini-btn"
            aria-label={SHARE_FEEDBACK[lang].btn}
            onClick={async () => {
              const origin = typeof window !== "undefined" ? window.location.origin : undefined;
              const ok = await copySkillShare(skill, lang, allSkills.length, origin);
              if (typeof window !== "undefined") {
                window.dispatchEvent(new CustomEvent("skill-share-feedback", { detail: { ok } }));
              }
            }}
          >
            {SHARE_FEEDBACK[lang].btn}
          </button>
          <button
            id="detailCloseBtn"
            className="icon-btn"
            aria-label={lang === "zh" ? "关闭" : "Close"}
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        <div className="detail-body" id="detailBody">
          {desc && <p className="detail-desc" id="detailDesc">{desc}</p>}

          <DetailMeta skill={skill} lang={lang} />
          <DetailMetrics skill={skill} allSkills={allSkills} lang={lang} />
          <DetailInstall skill={skill} lang={lang} />

          {tools.length > 0 && (
            <div className="d-tools" id="detailTools">
              <h4>{lang === "zh" ? "允许的工具" : "Allowed tools"}</h4>
              <div className="tool-tags">
                {tools.map((t) => (
                  <span className="tool-tag" key={t}>{t}</span>
                ))}
              </div>
            </div>
          )}

          {githubUrl && (
            <a className="d-link" id="detailGithubLink" href={githubUrl} target="_blank" rel="noreferrer">
              {lang === "zh" ? "在 GitHub 查看" : "View on GitHub"} ↗
            </a>
          )}

          <DetailRelated skill={skill} allSkills={allSkills} lang={lang} onOpenSkill={onOpenSkill} />
        </div>
      </div>
      <div className="detail-backdrop" id="detailBackdrop" onClick={onClose} aria-hidden="true" />
    </div>
  );
}
