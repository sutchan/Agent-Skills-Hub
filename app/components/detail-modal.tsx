// app/components/detail-modal.tsx v1.19.14 — 技能详情弹窗（元信息区：作者 / 协议 / 版本 / GitHub 目录 + 相关技能 + 复制名称）
"use client";
import { useEffect } from "react";
import type { Lang } from "../lib/share";
import type { Skill } from "../lib/skills";
import { catHue } from "../lib/catHue";

const GITHUB_TREE = "https://github.com/sutchan/Agent-Skills-Hub/tree/main";

function initials(name: string): string {
  const parts = name.split(/[-_\s]+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

function formatSize(bytes?: number): string {
  if (bytes == null) return "";
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(kb < 10 ? 1 : 0)} KB`;
  return `${(kb / 1024).toFixed(2)} MB`;
}

function maxPopularity(skills: Skill[]): number {
  return skills.reduce((m, s) => Math.max(m, s.popularity || 0), 0);
}

export function DetailModal({
  skill,
  lang,
  allSkills,
  onClose,
}: {
  skill: Skill;
  lang: Lang;
  allSkills: Skill[];
  onClose: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const related = allSkills
    .filter((s) => s.name !== skill.name && s.category === skill.category && !s.hidden)
    .slice(0, 4);
  const githubUrl = `${GITHUB_TREE}/${skill.githubDir}`;
  const tools = (skill.allowedTools || []).filter(Boolean);
  const desc = lang === "zh" ? skill.description : skill.enDescription || skill.description;

  const copyName = () => {
    const text = skill.name;
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        const tip = document.getElementById("copyTip");
        if (tip) {
          tip.textContent = lang === "zh" ? "已复制" : "Copied";
          tip.classList.add("show");
          setTimeout(() => tip.classList.remove("show"), 1400);
        }
      });
    }
  };

  return (
    <div
      id="detailOverlay"
      className="overlay show"
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="dialog detail" role="dialog" aria-modal="true" aria-label={skill.zh || skill.name}>
        <div className="dialog-head detail-head">
          <div className="title-row">
            <div className="avatar sm">{initials(skill.name)}</div>
            <div className="card-title">
              <span className="zh">{skill.zh || skill.name}</span>
              <span className="en">{skill.name}</span>
            </div>
          </div>
          <div className="d-actions">
            <button type="button" className="btn ghost" onClick={copyName}>
              {lang === "zh" ? "复制名称" : "Copy name"}
            </button>
            <span id="copyTip" className="copy-tip" />
          </div>
          <button type="button" className="dialog-close" aria-label={lang === "zh" ? "关闭" : "Close"} onClick={onClose}>
            ×
          </button>
        </div>
        <div className="detail-meta">
          <div className="meta-row">
            <span className="meta-k">{lang === "zh" ? "作者 / Author" : "Author"}</span>
            <span className="meta-v">{skill.author || (lang === "zh" ? "未知" : "Unknown")}</span>
          </div>
          <div className="meta-row">
            <span className="meta-k">{lang === "zh" ? "协议 / License" : "License"}</span>
            <span className="meta-v">{skill.license || (lang === "zh" ? "未知" : "Unknown")}</span>
          </div>
          <div className="meta-row">
            <span className="meta-k">{lang === "zh" ? "版本 / Version" : "Version"}</span>
            <span className="meta-v">{skill.skillVersion || "—"}</span>
          </div>
          <div className="meta-row">
            <span className="meta-k">{lang === "zh" ? "GitHub 目录 / Source" : "GitHub source"}</span>
            <a className="meta-v link" href={githubUrl} target="_blank" rel="noopener">
              {skill.githubDir}
            </a>
          </div>
        </div>
        <div className="detail-metrics">
          {skill.size != null && (
            <div className="metric">
              <span className="metric-k">{lang === "zh" ? "大小 / Size" : "Size"}</span>
              <span className="metric-v">{formatSize(skill.size)}</span>
            </div>
          )}
          {skill.files != null && (
            <div className="metric">
              <span className="metric-k">{lang === "zh" ? "文件数 / Files" : "Files"}</span>
              <span className="metric-v">
                {skill.files}
                {lang === "zh" ? " 个" : ""}
              </span>
            </div>
          )}
          <div className="metric metric-pop-wrap">
            <span className="metric-k">{lang === "zh" ? "热度 / Popularity" : "Popularity"}</span>
            <div className="metric-pop">
              <span className="heat-bars">
                {Array.from({ length: 5 }, (_, i) => {
                  const max = maxPopularity(allSkills);
                  const filled = max > 0 ? Math.round(((skill.popularity || 0) / max) * 5) : 0;
                  return <i key={i} className={i < filled ? "heat on" : "heat"} />;
                })}
              </span>
              <span className="pop-label">
                {(skill.popularity || 0) > 0
                  ? `${skill.popularity} ${lang === "zh" ? "次被引用" : "refs"}`
                  : lang === "zh"
                    ? "独立（无引用）"
                    : "Standalone"}
              </span>
            </div>
          </div>
        </div>
        <div className="dialog-body detail-body">
          <p className="d-desc">{desc || ""}</p>
          {tools.length > 0 && (
            <div className="d-tools">
              <h4>{lang === "zh" ? "授权工具 / Allowed tools" : "Allowed tools"}</h4>
              <div className="tool-chips">
                {tools.map((t) => (
                  <span key={t} className="tool-chip">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          )}
          {related.length > 0 && (
            <div className="d-related">
              <h4>{lang === "zh" ? "相关技能 / Related" : "Related skills"}</h4>
              <div className="related-list">
                {related.map((r) => (
                  <button
                    key={r.name}
                    type="button"
                    className="related-card"
                    style={{ ["--hue" as string]: catHue(r.category) }}
                    onClick={() => onClose()}
                  >
                    <span className="rc-cat">{r.category}</span>
                    <span className="rc-name">{r.zh || r.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
