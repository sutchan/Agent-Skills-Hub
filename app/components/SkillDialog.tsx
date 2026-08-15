// app/components/SkillDialog.tsx v1.1.0 — 技能详情弹窗（含分享按钮）
"use client";

import { useEffect, useRef } from "react";
import type { Skill } from "../lib/skills";
import type { Lang } from "../lib/share";
import { SHARE_FEEDBACK } from "../lib/share";
import { useShare } from "./useShare";

interface Props {
  skill: Skill;
  lang: Lang;
  onClose: () => void;
}

/** 技能详情弹窗：展示中英描述、分类、授权工具，并提供「分享」按钮（openspec §3.2 ShareButton） */
export function SkillDialog({ skill, lang, onClose }: Props) {
  const { shareSkill, toast } = useShare(lang);
  const lastFocused = useRef<HTMLElement | null>(null);
  const closeRef = useRef<HTMLButtonElement | null>(null);
  const overlayRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    lastFocused.current = document.activeElement as HTMLElement;
    closeRef.current?.focus();
    document.body.classList.add("no-scroll");
    return () => {
      document.body.classList.remove("no-scroll");
      lastFocused.current?.focus();
    };
  }, []);

  // 焦点陷阱：Tab 在弹窗内循环（openspec §4.5.4 / §4.5 无障碍）
  const trap = (e: React.KeyboardEvent) => {
    if (e.key !== "Tab") return;
    const f = overlayRef.current?.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (!f || !f.length) return;
    const first = f[0];
    const last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };

  const tools = (skill.allowedTools || "")
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);

  return (
    <div
      className="overlay open"
      ref={overlayRef}
      onKeyDown={(e) => {
        if (e.key === "Escape") onClose();
        trap(e);
      }}
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
    >
      <div className="dialog" role="dialog" aria-modal="true" aria-labelledby="dialogTitle">
        <div className="sr-only" id="dialogTitle">{skill.zh || skill.name}</div>
        <div className="dialog-head">
          <div className="avatar">{(skill.name || "?").slice(0, 2).toUpperCase()}</div>
          <div>
            <h2>{skill.zh || skill.name}</h2>
            <div className="sub en">{skill.name}</div>
          </div>
          <button ref={closeRef} className="icon-btn dialog-close" aria-label="关闭 / Close" onClick={onClose}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="dialog-body">
          <div className="block">
            <h3 className="zh">描述（中文）</h3>
            <h3 className="en">Description</h3>
            <p>{skill.zh}</p>
          </div>
          <div className="block">
            <h3 className="zh">描述（英文）</h3>
            <h3 className="en">Description (en)</h3>
            <p className="en">{skill.description}</p>
          </div>
          <div className="block">
            <h3>分类 / Category</h3>
            <p>{skill.category}</p>
          </div>
          {tools.length > 0 && (
            <div className="block">
              <h3>授权工具 / Allowed tools</h3>
              <div className="tools">
                {tools.map((t) => (
                  <span className="tool" key={t}>{t}</span>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="dialog-foot">
          <button className="btn btn-ghost" onClick={onClose}>关闭 / Close</button>
          <button
            id="shareBtn"
            className="btn btn-secondary"
            aria-label={SHARE_FEEDBACK[lang].btn}
            onClick={() => shareSkill(skill.name)}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7M16 6l-4-4-4 4M12 2v13" />
            </svg>
            {SHARE_FEEDBACK[lang].btn}
          </button>
          <a className="btn btn-primary" href={`skills/${skill.name}/`} target="_blank" rel="noopener">
            {lang === "zh" ? "查看技能" : "Open skill"}
          </a>
        </div>
      </div>
      <div
        id="toast"
        className={"toast" + (toast.show ? " show" : "") + (toast.isErr ? " err" : "")}
        role="status"
        aria-live="polite"
      >
        {toast.msg}
      </div>
    </div>
  );
}
