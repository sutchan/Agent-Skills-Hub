/**
 * Tencent Cloud EdgeOne Edge Function / Worker script template
 * For Agent Skills Hub (Votes & Favorites on Edge KV)
 */

addEventListener("fetch", event => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  const url = new URL(request.url);
  const kv = typeof ASH_KV !== 'undefined' ? ASH_KV : null;

  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json"
  };

  if (request.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (url.pathname === "/api/votes") {
      if (request.method === "GET") {
        const keys = kv ? await kv.list({ prefix: "vote:" }) : { keys: [] };
        const votes = {};
        for (const k of (keys.keys || [])) {
          const name = k.replace("vote:", "");
          const val = await kv.get(k, { type: "json" });
          if (val) votes[name] = val;
        }
        return new Response(JSON.stringify(votes), { headers: corsHeaders });
      }
      if (request.method === "POST") {
        const { name, action } = await request.json();
        if (!name) return new Response(JSON.stringify({ error: "Missing name" }), { status: 400, headers: corsHeaders });
        const key = `vote:${name}`;
        let data = kv ? await kv.get(key, { type: "json" }) : { up: 0 };
        if (!data) data = { up: 0 };

        if (action === "undo") {
          data.up = 0;
        } else {
          data.up += 1;
        }
        if (kv) await kv.put(key, JSON.stringify(data));
        return new Response(JSON.stringify({ name, ...data }), { headers: corsHeaders });
      }
    }

    if (url.pathname === "/api/favorites") {
      if (request.method === "GET") {
        const keys = kv ? await kv.list({ prefix: "fav:" }) : { keys: [] };
        const favs = {};
        for (const k of (keys.keys || [])) {
          const name = k.replace("fav:", "");
          favs[name] = true;
        }
        return new Response(JSON.stringify(favs), { headers: corsHeaders });
      }
      if (request.method === "POST") {
        const { name } = await request.json();
        if (!name) return new Response(JSON.stringify({ error: "Missing name" }), { status: 400, headers: corsHeaders });
        const key = `fav:${name}`;
        const exists = kv ? await kv.get(key) : null;
        let isFav = false;
        if (exists) {
          if (kv) await kv.delete(key);
          isFav = false;
        } else {
          if (kv) await kv.put(key, "1");
          isFav = true;
        }
        const keys = kv ? await kv.list({ prefix: "fav:" }) : { keys: [] };
        const allFavs = (keys.keys || []).map(k => k.replace("fav:", ""));
        return new Response(JSON.stringify({ name, bookmarked: isFav, favorites: allFavs }), { headers: corsHeaders });
      }
    }
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: corsHeaders });
  }

  return fetch(request);
}
