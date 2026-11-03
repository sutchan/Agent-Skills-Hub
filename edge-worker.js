/**
 * Tencent Cloud EdgeOne Edge Function / Worker script template
 * For Agent Skills Hub (Votes & Favorites on Edge KV)
 *
 * 安全加固（v1.16.8）：
 *  - 请求体解析失败时返回 400，而非把异常抛到 500 并泄露堆栈
 *  - name 必须匹配技能名格式（kebab-case，长度 ≤ 100），防止任意 KV key 注入 / 伪造技能刷计数
 *  - 错误信息泛化，避免向客户端泄露内部异常细节
 *  - 补充 X-Content-Type-Options: nosniff 基础安全头
 */

// 技能名白名单格式：小写字母/数字开头，仅含小写字母、数字与连字符，最长 100 字符。
// 与 server/store.js 的 validSkillNames 语义对齐（此处边缘函数无法读取 skills-data.json，
// 故用格式校验兜底，阻止任意 key 写入）。
const NAME_RE = /^[a-z0-9][a-z0-9-]{0,99}$/;

addEventListener("fetch", (event) => {
  event.respondWith(handleRequest(event.request));
});

/** 安全解析 JSON 请求体，失败时返回结构化错误而非抛出异常 */
async function readJson(request) {
  try {
    return { ok: true, data: await request.json() };
  } catch {
    return { ok: false, error: "Invalid JSON body" };
  }
}

function badRequest(message, corsHeaders) {
  return new Response(JSON.stringify({ error: message }), {
    status: 400,
    headers: corsHeaders,
  });
}

async function handleRequest(request) {
  const url = new URL(request.url);
  const kv = typeof ASH_KV !== "undefined" ? ASH_KV : null;

  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json",
    "X-Content-Type-Options": "nosniff",
  };

  if (request.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (url.pathname === "/api/votes") {
      if (request.method === "GET") {
        const keys = kv ? await kv.list({ prefix: "vote:" }) : { keys: [] };
        const votes = {};
        // EdgeOne KV list() 返回 keys: Array<ListKey>（ListKey 为含 key 属性的对象，非字符串）
        for (const k of keys.keys || []) {
          const name = k.key.replace("vote:", "");
          const val = await kv.get(k.key, { type: "json" });
          if (val) votes[name] = val;
        }
        return new Response(JSON.stringify(votes), { headers: corsHeaders });
      }
      if (request.method === "POST") {
        const parsed = await readJson(request);
        if (!parsed.ok) return badRequest(parsed.error, corsHeaders);
        const { name, action } = parsed.data;
        if (!NAME_RE.test(name || "")) {
          return badRequest("Invalid or missing skill name", corsHeaders);
        }
        const key = `vote:${name}`;
        let data = kv ? await kv.get(key, { type: "json" }) : { up: 0 };
        if (!data) data = { up: 0 };

        if (action === "undo") {
          data.up = 0;
          if (kv) await kv.delete(key);
        } else {
          data.up += 1;
          if (kv) await kv.put(key, JSON.stringify(data));
        }
        return new Response(JSON.stringify({ name, ...data }), {
          headers: corsHeaders,
        });
      }
    }

    if (url.pathname === "/api/favorites") {
      if (request.method === "GET") {
        const keys = kv ? await kv.list({ prefix: "fav:" }) : { keys: [] };
        const favs = {};
        for (const k of keys.keys || []) {
          favs[k.key.replace("fav:", "")] = true;
        }
        return new Response(JSON.stringify(favs), { headers: corsHeaders });
      }
      if (request.method === "POST") {
        const parsed = await readJson(request);
        if (!parsed.ok) return badRequest(parsed.error, corsHeaders);
        const { name, action } = parsed.data;
        if (!NAME_RE.test(name || "")) {
          return badRequest("Invalid or missing skill name", corsHeaders);
        }
        const key = `fav:${name}`;
        const exists = kv ? await kv.get(key) : null;
        let isFav = false;
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
        const allFavs = (keys.keys || []).map((k) => k.key.replace("fav:", ""));
        return new Response(
          JSON.stringify({ name, bookmarked: isFav, favorites: allFavs }),
          { headers: corsHeaders }
        );
      }
    }
  } catch {
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: corsHeaders,
    });
  }

  return fetch(request);
}
