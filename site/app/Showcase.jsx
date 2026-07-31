// 路径: site/app/Showcase.jsx 版本: 1.0.0
"use client";

import { useEffect, useMemo, useState, useCallback } from "react";

export default function Showcase({ data }) {
  const { meta, categories, skills } = data;
  const [activeCat, setActiveCat] = useState("全部");
  const [query, setQuery] = useState("");
  const [modal, setModal] = useState(null);
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    const cur =
      document.documentElement.getAttribute("data-theme") ||
      (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    setTheme(cur);
  }, []);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem("theme", next);
    } catch (e) {
      /* 忽略存储异常 */
    }
  };

  const catList = useMemo(
    () => [{ name: "全部", count: skills.length }].concat(categories),
    [categories, skills.length]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return skills.filter((s) => {
      if (activeCat !== "全部" && s.category !== activeCat) return false;
      if (!q) return true;
      const hay = [s.name, s.zh_desc, s.en_desc, s.category].join(" ").toLowerCase();
      return hay.indexOf(q) !== -1;
    });
  }, [skills, activeCat, query]);

  const openModal = useCallback((s) => setModal(s), []);
  const closeModal = useCallback(() => setModal(null), []);

  useEffect(() => {
    if (!modal) return;
    const onKey = (e) => {
      if (e.key === "Escape") closeModal();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [modal, closeModal]);

  const tagHtml = (s) => (
    <>
      <span className={"tag" + (s.has_scripts ? " has" : "")}>scripts</span>
      <span className={"tag" + (s.has_references ? " has" : "")}>references</span>
      <span className={"tag" + (s.has_assets ? " has" : "")}>assets</span>
    </>
  );

  const repoBase = (meta.repo || "").replace(/\/$/, "");

  return (
    <>
      <header className="hero">
        <div className="hero-inner">
          <div className="badge">AGENT SKILLS HUB</div>
          <h1>{meta.title}</h1>
          <p className="subtitle">{meta.subtitle}</p>
          <div className="stats">
            <div className="stat">
              <div className="stat-num">{meta.count}</div>
              <div className="stat-label">个技能</div>
            </div>
            <div className="stat">
              <div className="stat-num">{categories.length}</div>
              <div className="stat-label">个分类</div>
            </div>
          </div>
          <div className="cta">
            <a className="btn btn-primary" href={meta.repo} target="_blank" rel="noopener">
              查看 GitHub 仓库
            </a>
            <a
              className="btn btn-ghost"
              href="https://github.com/xingkongliang/skills-manager"
              target="_blank"
              rel="noopener"
            >
              用 skills-manager 安装
            </a>
          </div>
        </div>
        <div className="hero-glow" aria-hidden="true" />
      </header>

      <main className="container">
        <section className="toolbar">
          <div className="toolbar-top">
            <div className="search-wrap">
              <svg className="search-icon" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                <path
                  fill="currentColor"
                  d="M15.5 14h-.79l-.28-.27a6.5 6.5 0 1 0-.7.7l.27.28v.79l5 4.99L20.49 19l-4.99-5Zm-6 0A4.5 4.5 0 1 1 14 9.5 4.5 4.5 0 0 1 9.5 14Z"
                />
              </svg>
              <input
                id="search"
                type="search"
                placeholder="搜索技能名称、描述或分类…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                autoComplete="off"
                aria-label="搜索技能"
              />
            </div>
            <button
              className="theme-toggle"
              onClick={toggleTheme}
              aria-label="切换深色 / 浅色主题"
              title="切换深色 / 浅色主题"
            >
              {theme === "dark" ? (
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="12" cy="12" r="4" />
                  <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z" />
                </svg>
              )}
            </button>
          </div>
          <div className="filters">
            {catList.map((c) => (
              <button
                key={c.name}
                type="button"
                className={"chip" + (c.name === activeCat ? " active" : "")}
                aria-pressed={c.name === activeCat}
                onClick={() => setActiveCat(c.name)}
              >
                {c.name}
                <span className="count">{c.count}</span>
              </button>
            ))}
          </div>
        </section>

        <section className="result-count">
          <span>
            显示 {filtered.length} / {skills.length} 个技能
          </span>
          {(activeCat !== "全部" || query.trim()) && (
            <button
              type="button"
              className="clear-btn"
              onClick={() => {
                setActiveCat("全部");
                setQuery("");
              }}
            >
              清除筛选
            </button>
          )}
        </section>

        <section className="grid">
          {filtered.map((s) => (
            <article
              key={s.dir}
              className="card"
              role="button"
              tabIndex={0}
              aria-label={`查看技能 ${s.name} 详情`}
              onClick={() => openModal(s)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  openModal(s);
                }
              }}
            >
              <div className="card-cat">{s.category}</div>
              <h3 className="card-name">{s.name}</h3>
              <p className="card-zh">{s.zh_desc}</p>
              <p className="card-en">{s.en_desc}</p>
              <div className="card-foot">{tagHtml(s)}</div>
            </article>
          ))}
        </section>
        {filtered.length === 0 && (
          <p className="empty">没有匹配的技能，换个关键词试试。</p>
        )}
      </main>

      <footer className="footer">
        <p>
          共 {meta.count} 个技能 · 由 {meta.author || "社区"} 维护 · 生成于{" "}
          {(meta.generated_at || "").slice(0, 10)}
        </p>
        <p className="muted">
          本页面为 <a href={meta.repo} target="_blank" rel="noopener">Agent Skills Hub</a>{" "}
          的静态展示，由 Next.js 构建、<code>build_site.py</code> 自动生成数据。许可证：MIT。
        </p>
      </footer>

      {modal && (
        <div className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
          <div className="modal-backdrop" onClick={closeModal} />
          <div className="modal-card">
            <button className="modal-close" onClick={closeModal} aria-label="关闭">
              ×
            </button>
            <div className="modal-cat">{modal.category}</div>
            <h2 id="modal-title">{modal.name}</h2>
            <p className="modal-zh">{modal.zh_desc}</p>
            <p className="modal-en">{modal.en_desc}</p>
            <div className="modal-tags">{tagHtml(modal)}</div>
            <a
              className="btn btn-primary"
              target="_blank"
              rel="noopener"
              href={`${repoBase}/tree/main/skills/${encodeURIComponent(modal.dir)}/SKILL.md`}
            >
              在仓库中查看 SKILL.md →
            </a>
          </div>
        </div>
      )}
    </>
  );
}
