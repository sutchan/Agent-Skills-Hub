/**
 * Tencent Cloud EdgeOne Edge Function — 投票 / 收藏
 * 历史生产方案（v1.16.25 起主路径为 Vercel Functions + Blob，本文件保留作回退参考）。
 *
 * 与 server/kv-ops.js 对齐的安全约定：
 *  - 写端点同源（不开放跨站 CORS）
 *  - name 必须命中精确白名单；白名单不可用时 fail-closed（503），不做静默放行
 *  - 写请求按 IP 限流
 *  - 错误信息泛化，不泄露内部异常
 */

// 内联精确白名单（生成区，勿手工编辑）：权威源 data/skills-data.json，
// 由 scripts/sync-inline-data.mjs 生成；部署到 EdgeOne 控制台时须同步本文件最新内容。
const SKILL_NAMES_INLINE = [
  "ad-creative", "ads-creative", "agent-browser", "agent-development", "ai-avatar-video", "ai-image-generation", "ai-music", "ai-research-reproduction", "ai-video-generation", "ai-video-generation-runcomfy",
  "analyze-project", "architecture-blueprint-generator", "bailian-web-search", "banner-creator", "banner-design", "better-auth-best-practices", "blueprint", "brainstorming", "brand-guidelines", "brand-operation",
  "brand-review", "browser-automation", "bun", "canvas-design", "capcut", "captions-and-clipping", "chrome-webstore-release-blueprint", "clean-architecture", "clean-code", "clerk-nextjs-patterns",
  "cloudbase", "code-review", "code-review-and-quality", "codebase-design", "coding-standards", "compliance", "convex-suggest", "dart-add-unit-test", "dart-build-cli-app", "dart-collect-coverage",
  "dart-fix-runtime-errors", "dart-flutter-patterns", "dart-generate-test-mocks", "dart-migrate-to-checks-package", "dart-resolve-package-conflicts", "dart-run-static-analysis", "dart-use-pattern-matching", "data-visualization", "debugging-and-error-recovery", "descript",
  "dev-builder", "diagnosing-bugs", "discover-brand", "disk-cleaner", "documentation", "docx", "domain-modeling", "douyin-video", "douyin-video-summary", "drama-analyzer",
  "drama-creator", "drama-planner", "drama-workflow", "dramatic", "eve", "executing-plans", "fastify-best-practices", "favicon", "figma-code-connect", "figma-design-to-code",
  "figma-generate-design", "figma-generate-library", "figma-implement-design", "figma-use", "find-skills", "fix-errors", "fix-sentry-issues", "flutter-add-integration-test", "flutter-add-widget-preview", "flutter-add-widget-test",
  "flutter-apply-architecture-best-practices", "flutter-build-responsive-layout", "flutter-dart-code-review", "flutter-fix-layout-issues", "flutter-implement-json-serialization", "flutter-setup-declarative-routing", "flutter-setup-localization", "flutter-use-http-package", "flux-kontext", "football-data",
  "frontend-design", "git-cleanup", "google-agents-cli-adk-code", "google-agents-cli-deploy", "google-agents-cli-workflow", "google-mobile-ads-banner", "grill-me", "grill-with-docs", "grilling", "handoff",
  "html-design-prototypes", "html-prototype", "hyperframes", "hyperframes-core", "hyperframes-creative", "image-to-video", "implement-spec", "improve-codebase-architecture", "insforge-cli", "insforge-debug",
  "instagram-api", "lark-meeting", "limrun-android-emulator", "limrun-detox-testing", "limrun-ios-simulator", "limrun-xcode", "limrun-xcode-bazel", "logo-animation", "logo-creator", "logo-designer",
  "luma", "manage-skills", "manga-drama", "marketing-plan", "mcp-vods", "muapi-3d-logo-animation", "muapi-logo-creator", "nestjs-best-practices", "netease-music-cli", "next-best-practices",
  "nextjs-app-router-patterns", "nextjs-code-review", "nextjs-react-typescript", "nodejs-backend-patterns", "opus-clip", "orca-cli", "pdf", "planning-with-files", "playwright-cli", "pptx",
  "prototype", "receiving-code-review", "redesign-existing-projects", "remotion-best-practices", "requesting-code-review", "review-animations", "rust-best-practices", "rust-patterns", "rust-skills", "security-review",
  "short-drama-storyboard", "short-drama-video-prompts", "short-drama-write", "skill-creator", "stripe-best-practices", "systematic-debugging", "test-driven-development", "to-spec", "ui-animation", "ui-ux-pro-max",
  "video-editing", "webapp-testing", "wp-abilities-audit", "wp-abilities-verify", "wp-patterns", "wp-playground", "wp-plugin-directory-guidelines", "writing-plans", "wordpress-pro",
];

const NAME_RE = /^[a-z0-9][a-z0-9-]{0,99}$/;
const NAME_WHITELIST = new Set([
  ...SKILL_NAMES_INLINE,
  ...String(typeof SKILL_NAMES !== "undefined" ? SKILL_NAMES : "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean),
]);

const RATE_WINDOW_MS = 60_000;
const RATE_MAX_WRITES = Number(typeof API_RATE_LIMIT !== "undefined" ? API_RATE_LIMIT : 30);
const rateBuckets = new Map();

const JSON_HEADERS = {
  "Content-Type": "application/json",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "no-referrer",
};

/** 构造 JSON 响应 */
function json(body, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: JSON_HEADERS });
}

/** 白名单是否可用：空集合即不可用，写入一律拒绝（fail-closed） */
function whitelistAvailable() {
  return NAME_WHITELIST.size > 0;
}

/** 名称校验错误文案（与 server/kv-ops.js 的 validateName 语义一致） */
function nameError(name) {
  if (!NAME_RE.test(name || "")) return "Invalid or missing skill name";
  return "Skill name not found in whitelist";
}

/** 边缘实例级写请求限流（内存计数，按实例生效，仅拦单 IP 突发刷写） */
function allowWrite(ip) {
  const now = Date.now();
  const rec = rateBuckets.get(ip);
  if (!rec || now - rec.start > RATE_WINDOW_MS) {
    rateBuckets.set(ip, { start: now, count: 1 });
    return true;
  }
  rec.count += 1;
  return rec.count <= RATE_MAX_WRITES;
}

/** 取客户端 IP：优先直连头，其次 X-Forwarded-For 首段 */
function clientIp(request) {
  const headers = request.headers;
  const direct = headers.get("cf-connecting-ip") || headers.get("x-real-ip");
  if (direct) return direct.trim();
  const xff = headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return "unknown";
}

/** KV list 的返回在不同运行时可能是字符串数组或 {name} 对象数组，统一取键名 */
function kvKeyName(entry) {
  if (typeof entry === "string") return entry;
  if (entry && typeof entry === "object") return String(entry.name || entry.key || "");
  return "";
}

/** 安全解析 JSON 请求体，失败时返回结构化错误而非抛出异常 */
async function readJson(request) {
  try {
    return { ok: true, data: await request.json() };
  } catch {
    return { ok: false, error: "Invalid JSON body" };
  }
}

/** 写端点前置校验：限流 → 白名单可用性 → JSON 解析 → 名称校验
 *  返回 { error } 表示拒绝（error 为响应），返回 { data } 表示放行（data 为已解析请求体） */
async function preflightWrite(request) {
  if (!allowWrite(clientIp(request))) {
    return { error: json({ error: "RATE_LIMITED", message: "请求过于频繁，请稍后再试" }, 429) };
  }
  if (!whitelistAvailable()) {
    return {
      error: json({ error: "STORE_UNAVAILABLE", message: "技能名单不可用，写接口已暂停" }, 503),
    };
  }
  const parsed = await readJson(request);
  if (!parsed.ok) return { error: json({ error: parsed.error }, 400) };
  const { name } = parsed.data;
  const err = nameError(name);
  if (err) return { error: json({ error: err }, 400) };
  return { data: parsed.data };
}

/** /api/votes：GET 返回全部计数，POST 投票（undo 删除） */
async function handleVotes(request, kv) {
  if (request.method === "GET") {
    const keys = kv ? await kv.list({ prefix: "vote:" }) : { keys: [] };
    // 并行读取各技能计数，避免串行 N+1 等待放大边缘请求延迟
    const entries = await Promise.all(
      (keys.keys || []).map(async (entry) => {
        const key = kvKeyName(entry);
        if (!key) return ["", null];
        return [key.replace("vote:", ""), await kv.get(key, { type: "json" })];
      })
    );
    const votes = {};
    for (const [name, val] of entries) {
      if (val) votes[name] = val;
    }
    return json(votes);
  }
  if (request.method !== "POST") return json({ error: "Method not allowed" }, 405);
  const pre = await preflightWrite(request);
  if (pre.error) return pre.error;
  const { name, action } = pre.data || {};
  const key = `vote:${name}`;
  let data = (kv ? await kv.get(key, { type: "json" }) : { up: 0 }) || { up: 0 };
  if (action === "undo") {
    data.up = 0;
    if (kv) await kv.delete(key);
  } else {
    data.up += 1;
    if (kv) await kv.put(key, JSON.stringify(data));
  }
  return json({ name, ...data });
}

/** /api/favorites：GET 返回收藏集合，POST 收藏（add / remove / toggle） */
async function handleFavorites(request, kv) {
  if (request.method === "GET") {
    const keys = kv ? await kv.list({ prefix: "fav:" }) : { keys: [] };
    const favs = {};
    for (const entry of keys.keys || []) {
      const name = kvKeyName(entry).replace("fav:", "");
      if (name) favs[name] = true;
    }
    return json(favs);
  }
  if (request.method !== "POST") return json({ error: "Method not allowed" }, 405);
  const pre = await preflightWrite(request);
  if (pre.error) return pre.error;
  const { name, action } = pre.data || {};
  const key = `fav:${name}`;
  const exists = kv ? await kv.get(key) : null;
  let isFav;
  if (action === "add") {
    if (kv) await kv.put(key, "1");
    isFav = true;
  } else if (action === "remove") {
    if (kv) await kv.delete(key);
    isFav = false;
  } else {
    if (exists) {
      if (kv) await kv.delete(key);
      isFav = false;
    } else {
      if (kv) await kv.put(key, "1");
      isFav = true;
    }
  }
  const keys = kv ? await kv.list({ prefix: "fav:" }) : { keys: [] };
  const allFavs = (keys.keys || [])
    .map((entry) => kvKeyName(entry).replace("fav:", ""))
    .filter(Boolean);
  return json({ name, bookmarked: isFav, favorites: allFavs });
}

async function handleRequest(request) {
  const url = new URL(request.url);
  const kv = typeof ASH_KV !== "undefined" ? ASH_KV : null;
  if (request.method === "OPTIONS") return new Response(null, { headers: JSON_HEADERS });
  try {
    if (url.pathname === "/api/votes") return await handleVotes(request, kv);
    if (url.pathname === "/api/favorites") return await handleFavorites(request, kv);
  } catch {
    return json({ error: "Internal server error" }, 500);
  }
  return fetch(request);
}

addEventListener("fetch", (event) => {
  // 回源 fetch 不在 try 内；回源失败必须给出结构化响应，否则未捕获的 Promise rejection
  // 会被边缘运行时丢弃且无法定位故障。
  event.respondWith(
    handleRequest(event.request).catch(() => json({ error: "Upstream unavailable" }, 502))
  );
});
