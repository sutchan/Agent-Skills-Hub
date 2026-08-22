// app/components/detail/DetailInstall.tsx v1.19.38 — 技能详情弹窗：安装命令与复制
import type { Lang } from "../../lib/share";
import type { Skill } from "../../lib/skills";
import { copyText } from "../../lib/detail-helpers";

/** 安装命令：展示 installCommand + 复制按钮 */
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
    </div>
  );
}
