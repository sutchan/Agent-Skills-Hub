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
                />
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </main>
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
