---
name: wordpress-axtolab-manager
description: "管理并操作 Axtolab AI Connector for WordPress 插件：在 WordPress 站点与 Claude/ChatGPT/MCP 等 AI 智能体之间建立安全连接，驱动内容、媒体、SEO、WooCommerce 等写操作自动化，并提供回滚、敏感操作守卫与审计日志。当用户需要安装/配置该插件、通过 AI 智能体管理 WordPress 内容与商品、或排查连接与权限问题时使用。"
en_description: "Manage and operate the Axtolab AI Connector for WordPress plugin: establish secure connections between a WordPress site and AI agents like Claude, ChatGPT, and MCP; drive automation of content, media, SEO, and WooCommerce writes; and provide rollback, sensitive-action guardrails, and audit logging. Use when installing/configuring the plugin, managing WordPress content or products via AI agents, or troubleshooting connections and permissions."
zh_displayName: Axtolab AI 连接器管理
category: WordPress 与 CMS
en_category: WordPress & CMS
compatibility: "WordPress 6.2+, PHP 7.4+. 需 Axtolab AI Connector 插件 v1.0.3+；WooCommerce 工具需 WooCommerce 激活。"
---

# Axtolab AI Connector 管理器（WordPress）

## Overview

Axtolab AI Connector for WordPress 是一个**免费、无限制**的插件，为 WordPress 站点暴露一个 REST API 网关，并通过本地轻量 MCP 服务器把 AI 智能体的工具调用翻译成 WP REST 请求。它让 Claude、ChatGPT 等 MCP 兼容智能体安全地读/写 WordPress。

核心安全模型：**每次 AI 写入都捕获前后快照（可一键回滚）**，且**敏感操作按连接设置同意机制（自动运行 / 询问先 / 阻止）**。插件不创建 WordPress 用户、不发送遥测，仅在你配置/使用时连接外部服务（Claude、ChatGPT、GitHub Releases、Unsplash、Pexels、Google、OpenAI）。

## When to use

- 安装、激活并配置 Axtolab AI Connector 插件。
- 为某个 AI 客户端（Claude Desktop / Claude Code / Cursor / VS Code / ChatGPT）建立到 WordPress 的连接。
- 通过 AI 智能体创建/编辑文章、页面、媒体、分类法、优惠券，或驱动 WooCommerce 商品与订单。
- 排查连接失败、权限不足、敏感操作被拦截、OAuth/应用密码认证问题。
- 调整 MCP 网关允许的文章类型、敏感操作守卫、图像提供商 API Key、限流与日志。

## 核心能力

- **内容管理**：创建/编辑/管理文章、页面、自定义文章类型；克隆内容；查看修订；生成预览链接。
- **媒体库**：通过 URL / 本地 / 拖放上传；搜索；设置特色图；在 Gutenberg 中内联插入/替换/移除图像。
- **库存图**：搜索并导入 Unsplash 与 Pexels 免费图（自动署名）。
- **Yoast SEO 集成**：读取分数；更新焦点关键词 / SEO 标题 / 元描述；预览渲染标签。
- **作者与分类法**：分配作者白名单；创建/分配分类、标签及自定义术语。
- **AI 图像生成**：经站点所有者提供的 API Key 接入 Google Imagen / OpenAI 等（AES-256-CBC 加密存储）。
- **WooCommerce（自 v1.0.2 起免费内置）**：列出产品与订单、更新单价、批量调价、创建受保护优惠券（详见下方工具表）。
- **审计与回滚**：全工具调用日志；认证端点按 IP 令牌桶限流；每次写入可在「Logs & Roll Back」管理页一键还原。

## 安装与连接

1. 将 `axtolab-ai-connector` 文件夹上传至 `/wp-content/plugins/`。
2. 在 WordPress 后台「插件」菜单中**激活**该插件。
3. 进入 **AI Connector > Connections** 菜单。
4. 点击 **「+ Add new connection」** 跟随向导：在 WP 个人资料中创建**应用密码（Application Password）**（或专用 WP 用户），粘贴至连接向导，并选择该连接可执行的工具权限。
5. 在设置页点击 **「Download Extension (.mcpb)」** 从 GitHub Releases 获取 Claude Desktop 安装包，拖入 Claude Desktop 扩展面板；或通过 **MCP-over-HTTP** 连接其他兼容客户端。
6. 开始用 AI 智能体操作 WordPress。

## 认证模型（双机制）

| 机制 | 适用场景 | 权限范围 |
| --- | --- | --- |
| **应用密码（HTTP Basic Auth）** | 本地/桌面客户端（Claude Desktop、Claude Code、Cursor、VS Code）直连 REST | 可访问插件所有 REST 端点 |
| **OAuth 2.1 + PKCE Bearer Token** | 远程/Web 客户端（Claude Web、ChatGPT / OpenAI Apps Platform，仅 MCP-over-HTTP 传输层） | 仅限 `/wp-json/axtolab-ai-connector/v1/mcp` 的 JSON-RPC 工具面 |

任何**基于 MCP SDK 构建的 MCP 兼容智能体**均可连接，无需专属适配。

## 敏感操作与守卫

在「Connection Manager」中按**每个连接**为以下操作类别设定行为：`auto-run`（自动运行）/ `ask-first`（询问先）/ `block`（阻止）：

- 发布（publish）
- 垃圾/删除（trash / delete）
- WooCommerce 价格 / 优惠券写入
- AI 图像操作

所有被允许的写入仍会被 Logs & Roll Back 捕获，可随时一键还原到写入前快照。

## WooCommerce MCP 工具（WooCommerce 激活时暴露）

| 工具 | 作用 |
| --- | --- |
| `wp_woo_list_products` | 列出产品 |
| `wp_woo_get_product` | 获取单个产品详情 |
| `wp_woo_update_product_price` | 更新产品单价 |
| `wp_woo_bulk_update_prices` | 批量调价 |
| `wp_woo_list_orders` | 列出订单 |
| `wp_woo_get_order` | 获取单个订单详情 |
| `wp_woo_create_coupon` | 创建受保护优惠券 |

价格/优惠券写入同样受敏感操作守卫约束，并纳入回滚与审计。

## 主要设置项

- **MCP Gateway 设置**：自定义文章类型允许列表（默认 `["post","page","featured_item"]`，可设 `["*"]` 接受所有公开类型）。
- **连接向导**：粘贴应用密码、设定客户端标签、选择起始工具能力（Tool Access）。
- **敏感操作行为**：发布 / 删除 / WooCommerce 写入 / AI 图像 → 自动 / 询问 / 阻止。
- **Image Providers 选项卡**：配置库存照片与 AI 图像生成 API Key（AES-256-CBC 加密）。
- **Upload Portal**：生成限时令牌的拖放上传会话，无需 WP 登录。
- **Connection Manager**：集中管理每连接的工具族与敏感行为。
- **OAuth 发现元数据**：若主机为 nginx 前置架构，可能需添加特定 `location` 配置以实现 RFC 8414/9728 完全合规（插件会提示是否 blocked，但不影响 MCP 连接）。

## 过滤钩子

- `axtolab_ai_connector_mcpb_download_url`：可自托管 `.mcpb` 安装包（覆写下载地址）。

## 安全与运维要点

- 插件**不创建** WordPress 用户；所有连接通过管理员已有的 WP 用户应用密码或 OAuth 授权完成。
- 插件**不发送遥测**；仅在你配置/使用时按需连接外部服务，API Key 仅站点所有者提供并加密。
- 认证端点按 IP 令牌桶限流；所有工具调用记入日志，便于审计与排障。
- 排障顺序：先查连接状态（应用密码是否失效 / OAuth 回调是否完成）→ 再查该连接的工具权限与敏感操作行为 → 最后查 Logs & Roll Back 中的失败写入快照。
