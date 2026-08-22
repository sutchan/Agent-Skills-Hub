// app/components/detail/DetailInstall.tsx v1.20.12 — 技能详情弹窗：安装命令与复制
import type { Lang } from "../../lib/share";
import { REPO_URL } from "../../lib/share";
import type { Skill } from "../../lib/skills";
import { copyText } from "../../lib/detail-helpers";

/** 安装命令：展示 installCommand（含完整仓库路径）+ 复制按钮 + 完整 GitHub 来源链接（v1.20.9） */
export function DetailInstall({ skill, lang }: { skill: Skill; lang: Lang }) {
  if (!skill.installCommand) return null;
  return (
    <div className="install" id="detailInstall">
      <div className="install-cmd">
        <code>{skill.installCommand}</code>
        <button
          className="mini-btn"
          id="copyCmdBtn"
          aria-label={lang === "zh" ? "复制安装命令" : "Copy install command"}
          onClick={() => copyText(skill.installCommand, lang)}
        >
          {lang === "zh" ? "复制" : "Copy"}
        </button>
      </div>
      <a
        className="install-source"
        id="installSource"
        href={REPO_URL}
        target="_blank"
        rel="noopener noreferrer"
      >
        {lang === "zh" ? "完整仓库地址：" : "Full repository: "}
        {REPO_URL}
      </a>
    </div>
  );
}
