// prototype/components/skill-card.tsx — 1.7.0
"use client";

import * as React from "react";
import { FileCode2, BookOpen, FolderOpen } from "@/components/icons";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Skill } from "@/lib/skills";

type Lang = "zh" | "en";

// 技能卡片：网格视图与列表视图共用，由 view 控制布局
export function SkillCard({
  skill,
  lang,
  view,
  onOpen,
  catEn,
}: {
  skill: Skill;
  lang: Lang;
  view: "grid" | "list";
  onOpen: (s: Skill) => void;
  catEn: string;
}) {
  const title = lang === "zh" ? skill.name : skill.en_name || skill.name;
  const desc = lang === "zh" ? skill.zh_desc : skill.en_desc || skill.zh_desc;
  const showAlias = lang === "zh" && skill.en_name && skill.en_name !== skill.name;

  const badges = [
    skill.has_scripts && { icon: FileCode2, label: "脚本" },
    skill.has_references && { icon: BookOpen, label: "参考" },
    skill.has_assets && { icon: FolderOpen, label: "资源" },
  ].filter(Boolean) as { icon: typeof FileCode2; label: string }[];

  const isList = view === "list";

  return (
    <Card
      role="button"
      tabIndex={0}
      aria-label={`查看 ${title} 详情`}
      onClick={() => onOpen(skill)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen(skill);
        }
      }}
      className={cn(
        "group cursor-pointer border-border/70 bg-card p-4 text-left hover:border-primary/40 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        isList ? "flex items-start gap-4" : "flex flex-col"
      )}
    >
      <div className={cn(isList ? "min-w-0 flex-1" : "flex flex-col gap-1.5")}>
        <div className="flex items-start justify-between gap-2">
          <h3 className="truncate text-[15px] font-semibold tracking-tight text-foreground">
            {title}
          </h3>
          <Badge variant="muted" className="shrink-0 font-normal">
            {catEn}
          </Badge>
        </div>
        {showAlias && (
          <p className="truncate font-mono text-2xs text-muted-foreground">
            {skill.en_name}
          </p>
        )}
        <p
          className={cn(
            "mt-1 text-sm leading-relaxed text-muted-foreground",
            isList ? "line-clamp-1" : "line-clamp-2"
          )}
        >
          {desc}
        </p>
        {badges.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {badges.map((b) => (
              <span
                key={b.label}
                className="inline-flex items-center gap-1 rounded-md bg-secondary px-2 py-1 text-2xs font-medium text-secondary-foreground"
              >
                <b.icon className="h-3 w-3" />
                {b.label}
              </span>
            ))}
          </div>
        )}
        {skill.tags && skill.tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {skill.tags.map((t) => (
              <span
                key={t}
                className="inline-flex items-center rounded-full border border-border/70 px-2 py-0.5 text-[10px] font-medium text-muted-foreground"
              >
                #{t}
              </span>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}
