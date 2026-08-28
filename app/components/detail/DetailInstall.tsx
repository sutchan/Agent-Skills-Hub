// app/components/detail/DetailInstall.tsx v1.14.47 — 技能详情弹窗：安装命令与复制
import type { Lang } from "../../lib/share";
import { REPO_URL } from "../../lib/share";
import type { Skill } from "../../lib/skills";
import { copyText } from "../../lib/detail-helpers";

// Skills Manager 桌面应用（不支持深链接导入，按钮跳转到项目页由用户在桌面端「+ Add Skills」导入）
const SKILLS_MANAGER_URL = "https://github.com/xingkongliang/skills-manager";

/** 安装命令：展示 installCommand（含完整仓库路径）+ 复制按钮 + 完整 GitHub 来源链接 + Skills Manager 导入入口（v1.20.33） */
export function DetailInstall({ skill, lang }: { skill: Skill; lang: Lang }) {
  if (!skill.installCommand) return null;
  return (
    <div className="d-install" id="detailInstall">
      <h4>{lang === "zh" ? "安装命令" : "Install"}</h4>
      <div className="cmd-row">
        <code className="cmd-text">{skill.installCommand}</code>
        <button
          className="btn ghost"
          id="copyCmdBtn"
          aria-label={lang === "zh" ? "复制安装命令" : "Copy install command"}
          onClick={() => copyText(skill.installCommand, lang)}
        >
          {lang === "zh" ? "复制" : "Copy"}
        </button>
      </div>
      <a
        className="meta-v link"
        id="installSource"
        href={REPO_URL}
        target="_blank"
        rel="noopener noreferrer"
      >
        {lang === "zh" ? "完整仓库地址：" : "Full repository: "}
        {REPO_URL}
      </a>
      <a
        className="btn primary"
        id="skillManagerBtn"
        href={SKILLS_MANAGER_URL}
        target="_blank"
        rel="noopener noreferrer"
        title={lang === "zh" ? "在 Skills Manager 桌面应用中导入此技能" : "Import this skill in the Skills Manager desktop app"}
      >
        {lang === "zh" ? "用 Skills Manager 导入" : "Import with Skills Manager"}
      </a>
    </div>
  );
}
