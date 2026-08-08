// prototype/components/skill-detail.tsx — 1.7.0
"use client";

import { FileCode2, BookOpen, FolderOpen, ExternalLink } from "@/components/icons";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { Skill } from "@/lib/skills";

type Lang = "zh" | "en";

// 技能详情：桌面端 Dialog / 移动端 Sheet 共用此内容体
export function SkillDetail({
  skill,
  lang,
  catEn,
  repo,
}: {
  skill: Skill;
  lang: Lang;
  catEn: string;
  repo?: string;
}) {
  const title = lang === "zh" ? skill.name : skill.en_name || skill.name;
  const desc = lang === "zh" ? skill.zh_desc : skill.en_desc || skill.zh_desc;
  const showAlias = lang === "zh" && skill.en_name && skill.en_name !== skill.name;

  const rows = [
    skill.has_scripts && { icon: FileCode2, label: "脚本 scripts/" },
    skill.has_references && { icon: BookOpen, label: "参考 references/" },
    skill.has_assets && { icon: FolderOpen, label: "资源 assets/" },
  ].filter(Boolean) as { icon: typeof FileCode2; label: string }[];

  return (
    <div className="flex flex-col gap-4">
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-xl font-semibold tracking-tight text-foreground">
            {title}
          </h2>
          <Badge variant="muted" className="font-normal">
            {catEn}
          </Badge>
        </div>
        {showAlias && (
          <p className="mt-1 font-mono text-xs text-muted-foreground">
            {skill.en_name}
          </p>
        )}
      </div>

      <p className="text-sm leading-relaxed text-muted-foreground">{desc}</p>

      <Separator />

      <div className="flex flex-col gap-2">
        <span className="text-2xs font-medium uppercase tracking-wide text-muted-foreground">
          目录
        </span>
        <code className="rounded-md bg-secondary px-2.5 py-1.5 font-mono text-xs text-secondary-foreground">
          {skill.dir}
        </code>
      </div>

      {rows.length > 0 && (
        <div className="flex flex-col gap-2">
          <span className="text-2xs font-medium uppercase tracking-wide text-muted-foreground">
            包含资源
          </span>
          <div className="flex flex-wrap gap-1.5">
            {rows.map((r) => (
              <span
                key={r.label}
                className="inline-flex items-center gap-1.5 rounded-md border bg-background px-2.5 py-1 text-xs text-foreground"
              >
                <r.icon className="h-3.5 w-3.5 text-primary" />
                {r.label}
              </span>
            ))}
          </div>
        </div>
      )}

      <a
        href={`${repo || "https://github.com/sutchan/Agent-Skills-Hub"}/tree/main/${skill.dir.replace(/\/$/, "")}`}
        target="_blank"
        rel="noreferrer noopener"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
      >
        <ExternalLink className="h-3.5 w-3.5" />
        在仓库中查看
      </a>
    </div>
  );
}
