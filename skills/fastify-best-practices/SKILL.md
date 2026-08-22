---
name: fastify-best-practices
description: 指导用 TypeScript 或 JavaScript 开发 Fastify Node.js 后端服务与 REST API。在构建、配置或调试 Fastify 应用时使用——包括定义路由、实现插件、配置 JSON Schema 校验、处理错误、优化性能、管理认证、配置 CORS 与安全头、集成数据库、使用 WebSocket 以及生产部署。覆盖完整 Fastify 请求生命周期（hooks、序列化、Pino 日志）与通过 strip types 的 TypeScript 集成。
en_description: Guides development of Fastify Node.js backend servers and REST APIs using TypeScript or JavaScript. Use when building, configuring, or debugging a Fastify application — including defining routes, implementing plugins, setting up JSON Schema validation, handling errors, optimising performance, managing authentication, configuring CORS and security headers, integrating databases, working with WebSockets, and deploying to production. Covers the full Fastify request lifecycle (hooks, serialization, logging with Pino) and TypeScript integration via strip types. Trigger terms: Fastify, Node.js server, REST API, API routes, backend framework, fastify.config, server.ts, app.ts."
zh_displayName: Fastify 最佳实践
category: 后端与平台
en_category: Backend & Platform
metadata:
---

## When to use

Use this skill when you need to:
- Develop backend applications using Fastify
- Implement Fastify plugins and route handlers
- Get guidance on Fastify architecture and patterns
- Use TypeScript with Fastify (strip types)
- Implement testing with Fastify's inject method
- Configure validation, serialization, and error handling

## Quick Start

A minimal, runnable Fastify server to get started immediately:

```ts
import Fastify from 'fastify'

const app = Fastify({ logger: true })

app.get('/health', async (request, reply) => {
  return { status: 'ok' }
})

const start = async () => {
  await app.listen({ port: 3000, host: '0.0.0.0' })
}
start()
```

## Recommended Reading Order for Common Scenarios

- **New to Fastify?** Start with `plugins.md` → `routes.md` → `schemas.md`
- **Adding authentication:** `plugins.md` → `hooks.md` → `authentication.md`
- **Improving performance:** `schemas.md` → `serialization.md` → `performance.md`
- **Setting up testing:** `routes.md` → `testing.md`
- **Going to production:** `logging.md` → `configuration.md` → `deployment.md`

## How to use

Read individual rule files for detailed explanations and code examples:

- [rules/plugins.md](rules/plugins.md) - Plugin development and encapsulation
- [rules/routes.md](rules/routes.md) - Route organization and handlers
- [rules/schemas.md](rules/schemas.md) - JSON Schema validation
- [rules/error-handling.md](rules/error-handling.md) - Error handling patterns
- [rules/hooks.md](rules/hooks.md) - Hooks and request lifecycle
- [rules/authentication.md](rules/authentication.md) - Authentication and authorization
- [rules/testing.md](rules/testing.md) - Testing with inject()
- [rules/performance.md](rules/performance.md) - Performance optimization
- [rules/logging.md](rules/logging.md) - Logging with Pino
- [rules/typescript.md](rules/typescript.md) - TypeScript integration
- [rules/decorators.md](rules/decorators.md) - Decorators and extensions
- [rules/content-type.md](rules/content-type.md) - Content type parsing
- [rules/serialization.md](rules/serialization.md) - Response serialization
- [rules/cors-security.md](rules/cors-security.md) - CORS and security headers
- [rules/websockets.md](rules/websockets.md) - WebSocket support
- [rules/database.md](rules/database.md) - Database integration patterns
- [rules/configuration.md](rules/configuration.md) - Application configuration
- [rules/deployment.md](rules/deployment.md) - Production deployment
- [rules/http-proxy.md](rules/http-proxy.md) - HTTP proxying and reply.from()

## Core Principles

- **Encapsulation**: Fastify's plugin system provides automatic encapsulation
- **Schema-first**: Define schemas for validation and serialization
- **Performance**: Fastify is optimized for speed; use its features correctly
- **Async/await**: All handlers and hooks support async functions
- **Minimal dependencies**: Prefer Fastify's built-in features and official plugins
