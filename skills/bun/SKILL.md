---
name: bun
category: 开发框架与平台
en_category: Dev Frameworks & Platforms
zh: Bun 运行时
description: 使用 Bun 替代 Node.js、npm、pnpm 或 vite。提供命令映射、Bun 特有 API 与开发模式。
en_description: Use Bun instead of Node.js, npm, pnpm, or vite. Provides command mappings, Bun-specific APIs, and development patterns.
---
# Bun Runtime

Use Bun as the default JavaScript/TypeScript runtime and package manager.

## Command Mappings

| Instead of | Use |
|------------|-----|
| `node file.ts` | `bun file.ts` |
| `ts-node file.ts` | `bun file.ts` |
| `npm install` | `bun install` |
| `npm run script` | `bun run script` |
| `jest` / `vitest` | `bun test` |
| `webpack` / `esbuild` | `bun build` |

Bun automatically loads `.env` files - don't use dotenv.

## Bun-Specific APIs

Prefer these over Node.js equivalents:

| API | Purpose | Don't use |
|-----|---------|-----------|
| `Bun.serve()` | HTTP server with WebSocket, HTTPS, routes | express |
| `bun:sqlite` | SQLite database | better-sqlite3 |
| `Bun.redis` | Redis client | ioredis |
| `Bun.sql` | Postgres client | pg, postgres.js |
| `Bun.file()` | File operations | node:fs readFile/writeFile |
| `Bun.$\`cmd\`` | Shell commands | execa |
| `WebSocket` | WebSocket client (built-in) | ws |

## Testing

Use `bun:test` for tests:

```ts
import { test, expect } from "bun:test";

test("description", () => {
  expect(1).toBe(1);
});
```

Run with `bun test`.

## Frontend Development

Use HTML imports with `Bun.serve()` instead of Vite. Supports React, CSS, Tailwind.

**Server:**

```ts
import index from "./index.html"

Bun.serve({
  routes: {
    "/": index,
    "/api/users/:id": {
      GET: (req) => Response.json({ id: req.params.id }),
    },
  },
  development: { hmr: true, console: true }
})
```

**HTML file:**

```html
<html>
  <body>
    <script type="module" src="./app.tsx"></script>
  </body>
</html>
```

Bun's bundler transpiles `.tsx`, `.jsx`, `.js` automatically. CSS is bundled via `<link>` tags.

Run with `bun --hot ./server.ts` for HMR.

## Documentation

For detailed API docs, see `node_modules/bun-types/docs/**.md`.
