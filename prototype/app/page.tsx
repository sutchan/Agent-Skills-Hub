// prototype/app/page.tsx — 1.7.0
"use client";

import * as React from "react";
import {
  Search,
  Github,
  SlidersHorizontal,
  X,
  Boxes,
} from "@/components/icons";
import { getSkillsData, catName, type Skill } from "@/lib/skills";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { SkillCard } from "@/components/skill-card";
import { SkillDetail } from "@/components/skill-detail";
import { ThemeToggle } from "@/components/theme-toggle";
import { LangToggle } from "@/components/lang-toggle";
import { ViewToggle } from "@/components/view-toggle";

type Lang = "zh" | "en";
type View = "grid" | "list";

export default function Page() {
  const { meta, categories, skills } = getSkillsData();
  const [lang, setLang] = React.useState<Lang>("zh");
  const [view, setView] = React.useState<View>("grid");
  const [query, setQuery] = React.useState("");
  const [activeCat, setActiveCat] = React.useState<string | null>(null);
  const [selected, setSelected] = React.useState<Skill | null>(null);
  const [sheetOpen, setSheetOpen] = React.useState(false);
  const [isMobile, setIsMobile] = React.useState(false);
  const [loading, setLoading] = React.useState(true);

  // 响应式：移动端详情用 Sheet，桌面端用 Dialog
  React.useEffect(() => {
    const mq = window.matchMedia("(max-width: 640px)");
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  // 模拟首屏载入骨架（SSG 下近乎瞬时，仅用于体验一致）
  React.useEffect(() => {
    const t = setTimeout(() => setLoading(false), 120);
    return () => clearTimeout(t);
  }, []);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return skills.filter((s) => {
      const matchCat = !activeCat || s.category === activeCat;
      if (!matchCat) return false;
      if (!q) return true;
      const hay = [
        s.name,
        s.en_name,
        s.zh_desc,
        s.en_desc,
        s.category,
      ]
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }, [skills, query, activeCat]);

  const t = (zh: string, en: string) => (lang === "zh" ? zh : en);

  function openDetail(s: Skill) {
    setSelected(s);
    if (isMobile) setSheetOpen(true);
  }

  const heroTitle = lang === "zh" ? meta.title_zh : "Agent Skills Hub";
  const heroSub =
    lang === "zh"
      ? meta.subtitle
      : "A curated AI skills collection for development, design, testing, DevOps, agent engineering and industry domains";

  return (
    <main className="hero-glow relative min-h-screen">
      {/* 吸顶工具栏 */}
      <header className="sticky top-0 z-40 border-b border-border/70 bg-background/80 backdrop-blur-md">
        <div className="container flex h-16 items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Boxes className="h-4 w-4" />
            </span>
            <span className="text-sm font-semibold tracking-tight">
              {t("技能中心", "Skills Hub")}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <LangToggle lang={lang} onChange={setLang} />
            <ThemeToggle />
            <Button asChild variant="outline" size="icon" className="hidden sm:inline-flex">
              <a href={meta.repo} target="_blank" rel="noreferrer noopener" aria-label="GitHub">
                <Github />
              </a>
            </Button>
          </div>
        </div>
      </header>

      <div className="container relative z-10">
        {/* Hero */}
        <section className="flex flex-col items-center py-14 text-center sm:py-20">
          <Badge variant="accent" className="mb-4">
            {meta.count} {t("个技能", "skills")}
          </Badge>
          <h1 className="max-w-2xl text-balance text-3xl font-bold tracking-tight sm:text-5xl">
            {heroTitle}
          </h1>
          <p className="mt-4 max-w-xl text-balance text-sm leading-relaxed text-muted-foreground sm:text-base">
            {heroSub}
          </p>
        </section>

        {/* 控制条 */}
        <section className="sticky top-16 z-30 -mx-6 mb-6 border-b border-border/60 bg-background/80 px-6 py-3 backdrop-blur-md">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative w-full lg:max-w-sm">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t("搜索技能、描述或分类…", "Search skills, descriptions…")}
                className="pl-9"
                aria-label={t("搜索", "Search")}
              />
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs text-muted-foreground">
                {filtered.length} {t("项", "items")}
              </span>
              <ViewToggle view={view} onChange={setView} />
            </div>
          </div>

          {/* 分类 chips */}
          <div className="mt-3 flex flex-wrap gap-1.5">
            <Chip
              active={activeCat === null}
              onClick={() => setActiveCat(null)}
              label={t("全部", "All")}
            />
            {categories.map((c) => (
              <Chip
                key={c.name}
                active={activeCat === c.name}
                onClick={() => setActiveCat((p) => (p === c.name ? null : c.name))}
                label={lang === "zh" ? `${c.name} (${c.count})` : `${c.en} (${c.count})`}
              />
            ))}
          </div>
        </section>

        {/* 结果区 */}
        <section className="pb-24">
          {loading ? (
            <SkeletonGrid view={view} />
          ) : filtered.length === 0 ? (
            <EmptyState
              onReset={() => {
                setQuery("");
                setActiveCat(null);
              }}
              lang={lang}
            />
          ) : (
            <div
              className={cn(
                view === "grid"
                  ? "grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3"
                  : "flex flex-col gap-2"
              )}
            >
              {filtered.map((s) => (
                <SkillCard
                  key={s.dir}
                  skill={s}
                  lang={lang}
                  view={view}
                  onOpen={openDetail}
                  catEn={catName(categories, s.category)}
                />
              ))}
            </div>
          )}
        </section>
      </div>

      {/* 桌面端 Dialog */}
      <Dialog open={!!selected && !isMobile} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent>
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle className="sr-only">{selected.name}</DialogTitle>
              </DialogHeader>
              <SkillDetail
                skill={selected}
                lang={lang}
                catEn={catName(categories, selected.category)}
                repo={meta.repo}
              />
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* 移动端 Sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent>
          {selected && (
            <>
              <SheetHeader>
                <SheetTitle className="sr-only">{selected.name}</SheetTitle>
              </SheetHeader>
              <div className="pt-6">
                <SkillDetail
                  skill={selected}
                  lang={lang}
                  catEn={catName(categories, selected.category)}
                  repo={meta.repo}
                />
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* 页脚 */}
      <footer className="border-t border-border/70 bg-background/60">
        <div className="container py-10">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Boxes className="h-4 w-4" />
                </span>
                <span className="text-sm font-semibold tracking-tight">
                  {t("技能中心", "Skills Hub")}
                </span>
                {meta.version && (
                  <Badge variant="outline" className="text-[10px] font-medium">
                    v{meta.version}
                  </Badge>
                )}
              </div>
              <p className="max-w-xs text-xs leading-relaxed text-muted-foreground">
                {heroSub}
              </p>
              <p className="text-xs text-muted-foreground">
                © {new Date().getFullYear()} {meta.author}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-x-10 gap-y-6 sm:grid-cols-3">
              <FooterCol
                title={t("概览", "Overview")}
                items={[
                  { label: t("技能总数", "Total skills"), value: String(meta.count) },
                  {
                    label: t("分类数量", "Categories"),
                    value: String(categories.length),
                  },
                  {
                    label: t("最近更新", "Updated"),
                    value: formatDate(meta.updated_at, lang),
                  },
                ]}
              />
              <FooterCol
                title={t("资源", "Resources")}
                links={[
                  {
                    label: t("GitHub 仓库", "GitHub Repo"),
                    href: meta.repo,
                  },
                  {
                    label: t("提交记录", "Commits"),
                    href: `${meta.repo}/commits/main`,
                  },
                  {
                    label: t("问题反馈", "Issues"),
                    href: `${meta.repo}/issues`,
                  },
                ]}
                lang={lang}
              />
              <FooterCol
                title={t("相关", "Related")}
                links={[
                  {
                    label: t("贡献指南", "Contributing"),
                    href: `${meta.repo}/blob/main/CONTRIBUTING.md`,
                  },
                  {
                    label: t("更新日志", "Changelog"),
                    href: `${meta.repo}/blob/main/CHANGELOG.md`,
                  },
                  {
                    label: t("设计规范", "Design Spec"),
                    href: `${meta.repo}/blob/main/prototype/DESIGN.md`,
                  },
                ]}
                lang={lang}
              />
            </div>
          </div>

          <Separator className="my-6" />

          <div className="flex flex-col items-center justify-between gap-2 text-xs text-muted-foreground sm:flex-row">
            <span>
              {t("基于 shadcn/ui 构建的高保真技能浏览原型", "High-fidelity skill browser prototype built with shadcn/ui")}
            </span>
            <span>
              {t("数据生成于", "Generated at")} {formatDateTime(meta.updated_at, lang)}
            </span>
          </div>
        </div>
      </footer>
    </main>
  );
}

function formatDate(iso: string, lang: Lang): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(lang === "zh" ? "zh-CN" : "en-US", {
    year: "numeric",
    month: lang === "zh" ? "long" : "short",
    day: "numeric",
  });
}

function formatDateTime(iso: string, lang: Lang): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString(lang === "zh" ? "zh-CN" : "en-US", {
    year: "numeric",
    month: lang === "zh" ? "long" : "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function FooterCol({
  title,
  items,
  links,
  lang,
}: {
  title: string;
  items?: { label: string; value: string }[];
  links?: { label: string; href: string }[];
  lang?: Lang;
}) {
  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-foreground/70">
        {title}
      </p>
      <ul className="space-y-2">
        {items?.map((it) => (
          <li
            key={it.label}
            className="flex items-center justify-between gap-3 text-xs text-muted-foreground"
          >
            <span>{it.label}</span>
            <span className="font-medium text-foreground">{it.value}</span>
          </li>
        ))}
        {links?.map((lk) => (
          <li key={lk.label}>
            <a
              href={lk.href}
              target="_blank"
              rel="noreferrer noopener"
              className="text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              {lk.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Chip({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "inline-flex h-8 items-center rounded-full border px-3 text-xs font-medium transition-all duration-200 ease-out-quint focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground"
      )}
    >
      {label}
    </button>
  );
}

function SkeletonGrid({ view }: { view: View }) {
  return (
    <div
      className={cn(
        view === "grid"
          ? "grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3"
          : "flex flex-col gap-2"
      )}
    >
      {Array.from({ length: 9 }).map((_, i) => (
        <Skeleton key={i} className={cn(view === "grid" ? "h-32" : "h-16")} />
      ))}
    </div>
  );
}

function EmptyState({
  onReset,
  lang,
}: {
  onReset: () => void;
  lang: Lang;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border py-20 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <SlidersHorizontal className="h-5 w-5" />
      </span>
      <p className="text-sm font-medium text-foreground">
        {lang === "zh" ? "未找到匹配的技能" : "No matching skills"}
      </p>
      <p className="max-w-xs text-sm text-muted-foreground">
        {lang === "zh"
          ? "尝试调整搜索关键词或分类筛选。"
          : "Try adjusting your search keyword or category filter."}
      </p>
      <Button variant="outline" size="sm" onClick={onReset}>
        <X className="h-4 w-4" />
        {lang === "zh" ? "清除筛选" : "Clear filters"}
      </Button>
    </div>
  );
}
