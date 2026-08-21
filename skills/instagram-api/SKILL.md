---
name: instagram-api
description: >-
  fetcher.sh 上的 Instagram API 替代方案——通过 x402 以 USDC 按次付费，
  或使用 Bearer Key 预付额度，无需登录、无需会话 Cookie。当用户希望通过
  @handle 解析 Instagram 主页、按关键词搜索用户、拉取某主页的帖子、Reels、
  快拍、被标记帖子、粉丝或关注列表，按短码查询单条帖子、读取帖子评论、
  获取话题标签或仅 Reels 的话题流、按地点拉取帖子，或按特定音频/音乐
  轨道拉取帖子时使用。同时涵盖 Instagram 粉丝导出、话题标签与地点监控、
  达人发现、竞品内容追踪，以及无需官方 Graph API 企业认证或无头浏览器的
  Instagram 数据管道。
en_description: >-
  An Instagram API alternative on fetcher.sh — pay-per-call in USDC via x402, or
  prepaid credits with a Bearer key, no login and no session cookies. Resolve a
  profile by @handle, search users by keyword, pull posts/reels/stories/tagged
  posts/followers/followings, look up a post by shortcode, read comments, fetch
  hashtag or location feeds, pull posts by audio track, plus follower export,
  monitoring, influencer discovery, and competitor tracking without Graph API
  verification or a headless browser.
zh: Instagram API 替代
category: 自动化与集成
en_category: Automation & Integration
keywords:
  - instagram
  - instagram-api
  - instagram-api-alternative
  - ig-api
  - social-media
  - social-listening
  - hashtag-tracking
  - x402
  - ai-agent
---

# Instagram API

Instagram data on demand: profile lookup by @handle, posts, reels, stories,
tagged posts, followers and followings, hashtag and location feeds, audio/music
feeds, and post comments — one plain HTTP GET per call, paid as you go. No
login, no session cookies, no headless browser, no Graph API business
verification.

Base URL: `https://instagram.fetcher.sh`

## Quick reference

| | |
| --- | --- |
| Base URL | `https://instagram.fetcher.sh` |
| Auth | `Authorization: Bearer bby_live_...` or x402 (USDC) |
| Price | $0.004/call (flat) |
| Endpoints | 16, all `GET` |
| MCP | `https://instagram.fetcher.sh/mcp` |
| Machine-readable | `/openapi.json` · `/llms.txt` · `/skill.md` |

## Which endpoint do I need?

| I want to... | Call |
| --- | --- |
| Look up a profile by @handle | `GET /api/user/handle/{handle}` |
| Search accounts by name | `GET /api/user/search` |
| Get a user's posts, reels, or stories | `GET /api/user/{id}/posts` / `/reels` / `/stories` |
| Get a user's followers or followings | `GET /api/user/{id}/followers` / `/followings` |
| Look up a post by its share-URL shortcode | `GET /api/post/code/{code}` |
| Get a post's comments | `GET /api/post/{id}/comments` |
| Find posts under a hashtag | `GET /api/hashtag/{name}/posts` |
| Find posts tagged at a location | `GET /api/location/{id}/posts` |

Full param details for every row: [`references/endpoints.md`](references/endpoints.md).

## Authentication

Two ways to pay, same data — full mechanics in the [`fetcher`
skill](../fetcher/SKILL.md):

```bash
# 1. Prepaid credits (recommended — get a key at https://fetcher.sh/topup
#    or via POST /api/credits/topup, see the fetcher skill)
export FETCHER_API_KEY="bby_live_xxxxxxxxxxxx"
curl -H "Authorization: Bearer $FETCHER_API_KEY" \
  "https://instagram.fetcher.sh/api/user/handle/nasa"

# 2. x402 pay-per-call — omit the header; a GET with no payment returns 402
#    with machine-readable payment requirements (USDC on Base, Polygon,
#    Arbitrum, Monad, or Solana). @x402/fetch signs and retries automatically.
```

Every response is `{ "status": number, "message": string, "data": ... }`; the
HTTP status mirrors `status`.

## Endpoints (16 — all GET, $0.004/call)

| Endpoint | What it returns |
| --- | --- |
| `/api/user/handle/{handle}` | Full profile by @handle — follower counts, bio, numeric ID |
| `/api/user/search` | Profiles matching a keyword query |
| `/api/userid/{handle}` | Just the numeric user ID for a @handle |
| `/api/user/{id}` | Profile by numeric ID |
| `/api/user/{id}/posts` | A user's posts |
| `/api/user/{id}/posts/tagged` | Posts the user is tagged in |
| `/api/user/{id}/reels` | A user's reels |
| `/api/user/{id}/stories` | A user's active stories |
| `/api/user/{id}/followers` | A user's followers |
| `/api/user/{id}/followings` | Accounts a user follows |
| `/api/post/code/{code}` | A single post by its shortcode (from the post URL) |
| `/api/post/{id}/comments` | A post's comments |
| `/api/hashtag/{name}/posts` | Posts under a hashtag |
| `/api/hashtag/{name}/reels` | Reels under a hashtag |
| `/api/location/{id}/posts` | Posts tagged at a location |
| `/api/audio/{id}/posts` | Posts using a specific audio/music track |

`{id}` / `{handle}` / `{name}` / `{code}` are path parameters. Optional
`cursor` / `page` paginate; `query` (user search) is required where it
appears.

## Scenarios

**Resolve a profile by handle — the endpoint most callers want first:**

```bash
curl -H "Authorization: Bearer $FETCHER_API_KEY" \
  "https://instagram.fetcher.sh/api/user/handle/nasa"

curl -H "Authorization: Bearer $FETCHER_API_KEY" \
  "https://instagram.fetcher.sh/api/user/handle/natgeo"
```

**Search for profiles by keyword, or resolve just the numeric ID for a handle:**

```bash
curl -H "Authorization: Bearer $FETCHER_API_KEY" \
  --data-urlencode "query=fitness influencer" -G \
  "https://instagram.fetcher.sh/api/user/search"

curl -H "Authorization: Bearer $FETCHER_API_KEY" \
  "https://instagram.fetcher.sh/api/userid/nasa"
```

**A profile's posts, reels, stories, and tagged posts (by numeric ID from the
handle lookup above):**

```bash
curl -H "Authorization: Bearer $FETCHER_API_KEY" \
  "https://instagram.fetcher.sh/api/user/528817151/posts"

curl -H "Authorization: Bearer $FETCHER_API_KEY" \
  "https://instagram.fetcher.sh/api/user/528817151/reels"

curl -H "Authorization: Bearer $FETCHER_API_KEY" \
  "https://instagram.fetcher.sh/api/user/528817151/stories"

curl -H "Authorization: Bearer $FETCHER_API_KEY" \
  "https://instagram.fetcher.sh/api/user/528817151/posts/tagged"
```

**Followers and followings:**

```bash
curl -H "Authorization: Bearer $FETCHER_API_KEY" \
  "https://instagram.fetcher.sh/api/user/528817151/followers"

curl -H "Authorization: Bearer $FETCHER_API_KEY" \
  "https://instagram.fetcher.sh/api/user/528817151/followings"
```

**A single post by shortcode (the part of the URL after `/p/`), and its
comments:**

```bash
curl -H "Authorization: Bearer $FETCHER_API_KEY" \
  "https://instagram.fetcher.sh/api/post/code/C0JD3tntcmy"

curl -H "Authorization: Bearer $FETCHER_API_KEY" \
  "https://instagram.fetcher.sh/api/post/3245142029192513970/comments"
```

**Posts and reels under a hashtag, posts from a location, and posts using an
audio track:**

```bash
curl -H "Authorization: Bearer $FETCHER_API_KEY" \
  "https://instagram.fetcher.sh/api/hashtag/travel/posts"

curl -H "Authorization: Bearer $FETCHER_API_KEY" \
  "https://instagram.fetcher.sh/api/hashtag/travel/reels"

curl -H "Authorization: Bearer $FETCHER_API_KEY" \
  "https://instagram.fetcher.sh/api/location/213131048/posts"

curl -H "Authorization: Bearer $FETCHER_API_KEY" \
  "https://instagram.fetcher.sh/api/audio/271328201351336/posts"
```

## MCP

```json
{
  "mcpServers": {
    "instagram": {
      "url": "https://instagram.fetcher.sh/mcp",
      "headers": { "Authorization": "Bearer bby_live_..." }
    }
  }
}
```

Free: `search_endpoints`, `describe_endpoint`, `check_balance`. Paid:
`fetch_data` (any endpoint above), `topup_credits`, plus the named shortcut
`instagram_user_handle`. Drop the `headers` block to pay per call with x402
instead — see the [`fetcher` skill](../fetcher/SKILL.md) for the full flow.

## Errors

- `400` — missing/invalid parameter (message names it)
- `401` — unknown or rotated key
- `402` — payment required (x402 challenge) or `topup_required` (credits
  exhausted)
- `404` — not a priced path
- No rate limits; no refunds on upstream failures (settlement precedes
  delivery)

## Reference

- Deep dives: [`references/endpoints.md`](references/endpoints.md) (every
  param) · [`references/scenarios.md`](references/scenarios.md) (one `curl`
  per endpoint) · [`references/faq.md`](references/faq.md) ·
  [`references/comparison.md`](references/comparison.md) (vs. the official
  Instagram Graph API and a browser scraper)
- Task guides: [profile lookup](../../task-guides/instagram-profile-lookup.md) ·
  [hashtag and location monitoring](../../task-guides/instagram-hashtag-and-location-monitoring.md)
- Slash command: [`/instagram-profile`](../../commands/instagram-profile.md)
- Full agent setup: <https://instagram.fetcher.sh/skill.md>
- OpenAPI 3.1 contract: <https://instagram.fetcher.sh/openapi.json>
- Condensed catalog: <https://instagram.fetcher.sh/llms.txt>
- Payment, credits, and MCP deep dive: [`fetcher` skill](../fetcher/SKILL.md)
- Site: <https://instagram.fetcher.sh>
