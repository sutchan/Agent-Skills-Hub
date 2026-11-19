> 路径：`docs/blob-storage.md` · 版本：1.16.25 · 状态：v1.16.25 起生效

# Vercel Blob 文件存储服务

本项目使用 **Vercel Blob** 提供两类存储：① 投票/收藏状态（单对象 `kv-store.json`，见 [`spec.md`](spec.md) §4）；② **通用文件服务**（本文主题）：上传、存储、列表、读取、下载、删除。

## 1. 存储模型与"桶"配置

Vercel Blob **没有传统对象存储的"桶（Bucket）"概念**——一个 **Store** 在创建时生成唯一的 `BLOB_READ_WRITE_TOKEN`，token 即代表该 store 的访问边界。本项目在同一个 store 内用 pathname 前缀隔离：

| 前缀 | 用途 | 管理者 |
|---|---|---|
| `files/` | 通用用户文件（本文服务） | `server/file-store.js` |
| `kv-store.json` | 投票/收藏状态对象 | `server/blob-store.js` |

**创建 Store（一次性）**
1. Vercel 控制台 → 项目 → **Storage** → **Create Database** → **Blob** → 命名（如 `agent-skills-hub-files`）→ 选择区域（默认自动）→ Create。
2. 创建后自动向项目注入 `BLOB_READ_WRITE_TOKEN`（Production / Preview / Development 三个环境均注入，可分别绑定不同 store）。
3. 复制 token 到本地 `.env.local`（该文件已被 gitignore 忽略；模板见 `.env.example`）。

> 建议：Production 与 Preview 绑定**不同 store**（隔离测试数据）；本地开发可不填 token，自动回退本地文件系统。

## 2. 环境变量

| 变量 | 必填 | 默认 | 说明 |
|---|---|---|---|
| `BLOB_READ_WRITE_TOKEN` | 生产必填 | — | Vercel Blob store 的读写 token；本地留空则回退 `data/uploads/` |
| `VERCEL` | 平台注入 | — | `1` 时自动走 Blob（含 Production 与 Preview） |
| `USE_BLOB` | 否 | — | 本地设为 `1` 可强制走 Blob（需有效 token） |
| `BLOB_MAX_FILE_BYTES` | 否 | `10485760`（10MB） | 单文件大小上限（字节） |
| `BLOB_ALLOWED_MIME` | 否 | 见下 | 允许上传的 MIME 白名单（逗号分隔） |
| `BLOB_ACCESS` | 否 | `private` | 缺省访问控制：`public` 或 `private` |
| `BLOB_CACHE_MAX_AGE` | 否 | `2592000`（30 天） | public 对象的 CDN/浏览器缓存秒数（最小 60 秒） |

默认 MIME 白名单：`image/png`、`image/jpeg`、`image/gif`、`image/webp`、`image/svg+xml`、`text/plain`、`text/csv`、`application/pdf`、`application/json`、`application/zip`。

## 3. API 契约

所有接口路径在本地开发、Preview、Production 完全一致。基础 URL：本地 `http://localhost:3000`，部署后为站点域名。

### 3.1 上传 — `POST /api/upload`

- 请求体：**原始二进制**（不要用 multipart；`Content-Type` 设为文件 MIME）。
- 查询参数：`?name=<pathname>`（必填，自动加 `files/` 前缀；支持子目录如 `docs/manual.pdf`）。
- 请求头：`x-file-content-type`（可选，覆盖 Content-Type）、`x-file-access`（`public` / `private`，覆盖默认）。
- 成功 `200`：`{ pathname, url, downloadUrl?, contentType, size, access, etag?, storage }`
  - `url` 是访问地址：private 对象为 `/api/files?name=...`（服务端代理），public 对象为 Vercel CDN 永久 URL。
- 失败：`400` 路径非法 / `413` 超过大小上限 / `415` 类型不允许 / `503` 凭据无效 / `500` 内部错误。

```bash
# 上传私有文件
curl -X POST 'http://localhost:3000/api/upload?name=notes/hello.txt' \
  -H 'Content-Type: text/plain' \
  -H 'x-file-access: private' \
  --data-binary @hello.txt

# 上传公开图片
curl -X POST 'http://localhost:3000/api/upload?name=images/logo.png' \
  -H 'Content-Type: image/png' \
  -H 'x-file-access: public' \
  --data-binary @logo.png
```

### 3.2 列表 — `GET /api/files`

- 可选参数：`?prefix=<前缀>`（在 `files/` 内进一步过滤）、`?limit=1..1000`（默认 100）。
- 响应 `200`：`{ files: [{ pathname, url, size, uploadedAt, etag?, storage }], count }`
- 仅列出 `files/` 前缀对象，**不会**暴露 `kv-store.json` 状态对象。

### 3.3 读取 — `GET /api/files?name=<pathname>`

- public 对象：`302` 重定向到 Vercel CDN URL（由 `put` 的 `cacheControlMaxAge` 控制边缘与浏览器缓存）。
- private 对象：`200` 服务端流式代理，响应头 `Cache-Control: private, no-store`（不经过浏览器/CDN 缓存）。
- 追加 `&download=1`：返回 `downloadUrl`（强制下载，Content-Disposition: attachment）。
- 文件不存在：`404 { error: "NOT_FOUND", message }`。

### 3.4 删除 — `DELETE /api/files?name=<pathname>`

- 可选请求头 `If-Match: <etag>`：乐观锁，ETag 不匹配时返回 `412`（`BlobPreconditionFailedError`）避免误删。
- 成功 `200`：`{ pathname, deleted: true, storage }`；不存在返回 `404`。

## 4. 访问控制与缓存策略

| 维度 | public | private |
|---|---|---|
| 访问方式 | 直连 CDN URL，无需鉴权 | 必须经服务端 `/api/files` 代理（SDK 以 token 签名读取） |
| 适用场景 | 公开图片、下载包、静态资源 | 用户私有文档、备份、敏感上传 |
| 缓存 | 边缘 + 浏览器缓存 `cacheControlMaxAge`（默认 30 天，最小 60 秒） | `Cache-Control: private, no-store`，每次回源 |
| 删除 | `del(url)`，支持 `ifMatch` | 同左 |
| 安全提示 | URL 泄露即任何人可访问；不要放敏感内容 | 服务端代理是唯一入口，不要直接暴露 token |

- 上传时通过 `x-file-access` 逐文件指定；未指定则用 `BLOB_ACCESS`（默认 `private`）。
- `api/upload.js` / `api/files.js` 为 Vercel Serverless Functions（Node Runtime，`bodyParser: false`）；`server/file-api.js` 为本地 Express 等价实现；两者**共用** `server/file-store.js` 核心逻辑，行为一致。

## 5. 错误处理

统一响应格式 `{ error: <CODE>, message: <可读信息> }`。映射规则见 `server/file-store.js` 的 `errorResponse()`：

| 场景 | HTTP | CODE |
|---|---|---|
| 路径非法/穿越、缺少 name | 400 | `INVALID_PATH` |
| 空文件 | 400 | `EMPTY_FILE` |
| 超过 `BLOB_MAX_FILE_BYTES` | 413 | `FILE_TOO_LARGE` |
| MIME 不在白名单 | 415 | `TYPE_NOT_ALLOWED` |
| 文件不存在 | 404 | `NOT_FOUND` |
| ETag 不匹配 | 412 | `PRECONDITION_FAILED` |
| token 缺失/无效 | 503 | `STORE_UNAVAILABLE` |
| 平台限流 | 429 | `RATE_LIMITED` |
| 其他 | 500 | `STORAGE_ERROR` |

客户端应对：上传失败展示 `message`；`429` 退避重试；`503` 提示管理员检查 token；删除前先 `GET` 拿 ETag 以实现乐观锁。

## 6. 各环境预期行为

| 环境 | 判定条件 | 存储后端 | 典型用途 |
|---|---|---|---|
| 本地开发 | 无 `BLOB_READ_WRITE_TOKEN` 或 `USE_BLOB` 未设置 | `data/uploads/`（本地文件，已 gitignore） | 零配置开发、端到端验证 |
| 本地 + Blob | `USE_BLOB=1` + 有效 token | Vercel Blob（绑定的 Preview/Dev store） | 联调真实存储行为 |
| Preview 部署 | `VERCEL_ENV=preview`（平台注入 `VERCEL=1`） | Vercel Blob（Preview store） | PR 预览，与生产数据隔离 |
| Production | `VERCEL=1` + Production token | Vercel Blob（Production store） | 正式文件服务 |

- 本地文件回退保留**全部** API 语义（前缀、列表、读取、删除、限制），仅 `storage` 字段值为 `local`。
- 前端 API 路径不随环境变化，无需条件分支。

## 7. 配置步骤（端到端）

1. 按 §1 创建 Blob Store，确认 token 已注入 Vercel 三个环境。
2. 本地：复制 `.env.example` 为 `.env.local`，填入 `BLOB_READ_WRITE_TOKEN`（可用 Preview store 的 token 联调）；如需强制走 Blob 再加 `USE_BLOB=1`。
3. 按需调整 `BLOB_MAX_FILE_BYTES` / `BLOB_ALLOWED_MIME` / `BLOB_ACCESS` / `BLOB_CACHE_MAX_AGE`。
4. 部署：确认 `vercel.json` 的 `buildCommand: "npm run build"`、`outputDirectory: "out"`；Vercel 自动识别根 `api/` 目录为 Functions。
5. 验证：按 §8 执行。

## 8. 验证方法

```bash
# 启动本地服务（无 token 时用文件回退）
npm run dev

# 运行文件服务端到端验证（上传 → 列表 → 读取 → 下载 → 删除 → 错误边界）
node scripts/verify-file-store.mjs

# 平台侧（填好 token 后）
# 1) 本地强制 Blob：USE_BLOB=1 node scripts/verify-file-store.mjs
# 2) 部署后：将脚本 BASE_URL 指向 Preview/Production 域名执行
# 3) Vercel 控制台 → Storage → Blob → 确认 files/ 前缀对象出现且可访问
```

`scripts/verify-file-store.mjs` 覆盖：合法上传、`413` 超限、`415` 非法类型、`400` 路径穿越、列表隔离（不出现 `kv-store.json`）、private 读取 no-store、public 重定向、附件下载、`If-Match` 删除与二次删除 `404`。

## 9. 代码库集成点

| 文件 | 职责 |
|---|---|
| `server/file-store.js` | 核心：校验/限制、Blob 与本地双后端、错误映射 |
| `api/upload.js` | Vercel Function：上传（原始 body） |
| `api/files.js` | Vercel Function：列表/读取/下载/删除 |
| `server/file-api.js` | 本地 Express 等价 API（共用核心模块） |
| `server.js` | 挂载顺序：`/api/upload` 在 `express.json()` **之前**，其余在限流之后 |
| `server/blob-store.js` | 投票/收藏单对象存储（与本服务共享 token、不同前缀） |
| `.env.example` / `.env.local` | 环境变量模板与本地实际配置（后者 gitignore） |
| `scripts/verify-file-store.mjs` | 端到端验证脚本 |

## 10. 注意事项

- **无原子操作**：Blob 的 `put` 覆盖写（`allowOverwrite: true`）适合文件上传；需要并发安全时用 `ifMatch` 删除乐观锁。
- **大小硬限**：Serverless Function 请求体受平台与 `BLOB_MAX_FILE_BYTES * 2` 双重约束；超过 10MB 的上传建议未来改用 `handleUpload` 客户端直传（当前版本不支持）。
- **成本**：public 对象的 CDN 缓存命中不计费边缘请求；private 对象每次读取均回源，高频场景请评估用量。
- **数据隔离**：切勿将 `BLOB_READ_WRITE_TOKEN` 提交入仓库；`.env.local` 已被 gitignore，`.env.example` 仅含占位符。
