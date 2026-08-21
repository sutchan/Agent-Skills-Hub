// app/components/skill-detail.tsx v1.18.0 — 技能详情内容（对齐 prototype 03-detail.js openDetail）
// 桌面 Dialog / 移动 Sheet 共用此内容体；结构与原型一致：head(avatar+title+close) + body(.block 区块) + foot(查看/分享)。
import { useState } from "react";
import type { Skill } from "@/lib/types";
import { Button } from "./ui/button";
import { copySkillShare } from "@/lib/share";
import { t } from "@/lib/i18n";

interface Props {
  skill: Skill;
  lang: "zh" | "en";
  toast: (msg: string) => void;
  onClose: () => void;
}

function initials(name: string): string {
  const parts = name.trim().split(/[\s-]+/);
  return (parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "");
}

export function SkillDetail({ skill, lang, toast, onClose }: Props) {
  const [copied, setCopied] = useState(false);
  const tools = Array.isArray(skill.allowedTools)
    ? skill.allowedTools
    : [];

  return (
    <>
      <div className="dialog-head" id="dialogHead">
        <div className="avatar">{initials(skill.name)}</div>
        <div>
          <h2 id="dialogTitle" className="dialog-title">{skill.zh || skill.name}</h2>
          <div className="sub en">{skill.name}</div>
          <div className="dialog-cat"><span className="zh">{skill.category}</span><span className="en">{skill.enCategory || skill.category}</span></div>
        </div>
        <button
          type="button"
          className="icon-btn dialog-close"
          aria-label={t(lang, "detail.close")}
          onClick={onClose}
        >
          ✕
        </button>
      </div>
      <div className="dialog-body" id="dialogBody">
        <section className="block">
          <h3 className="zh">{t(lang, "detail.zhTitle")}</h3>
          <p>{skill.zh || skill.name}</p>
          <p className="zh-desc">{skill.description}</p>
        </section>
        <section className="block">
          <h3 className="en">{t(lang, "detail.enTitle")}</h3>
          <p>{skill.enDescription || ""}</p>
        </section>
        <section className="block">
          <h3>{t(lang, "detail.toolsTitle")}</h3>
          <div className="tools">
            {tools.map((tool) => (
              <code key={tool}>{tool}</code>
            ))}
          </div>
        </section>
      </div>
      <div className="dialog-foot" id="dialogFoot">
        <a
          className="btn btn-primary"
          href={`https://github.com/sutchan/Agent-Skills-Hub/tree/main/skills/${encodeURIComponent(skill.name)}/`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <span className="zh">{t(lang, "detail.open")}</span>
          <span className="en">{t(lang, "detail.openEn")}</span>
        </a>
        <Button
          variant="ghost"
          onClick={async () => {
            const ok = await copySkillShare(skill, lang);
            setCopied(ok);
            toast(ok ? t(lang, "share.copied") : t(lang, "share.failed"));
          }}
        >
          {copied ? "✓ " : ""}{t(lang, "share.btn")}
        </Button>
      </div>
    </>
  );
}
