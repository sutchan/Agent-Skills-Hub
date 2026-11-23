// server/api-contract.js — 投票 / 收藏接口的共享契约（三端唯一事实源）
//
// 三个后端实现（本地 Express server/api.js、Vercel Serverless api/*.js、
// EdgeOne 边缘函数 edge-worker.js）必须给前端完全一致的语义，否则会出现
// 「本地能用、线上 400」或反之的隐性差异。本模块把可共享的判定收敛到一处：
//
//   限流命中            → 429 { error: 'RATE_LIMITED' }
//   存储不可用          → 503 { error: 'STORE_UNAVAILABLE' }
//   白名单不可用        → 503 { error: 'STORE_UNAVAILABLE' }（fail-closed）
//   请求体非法 JSON     → 400 { error: 'Invalid JSON body' }
//   名称格式非法        → 400 { error: 'Invalid or missing skill name' }
//   名称不在白名单      → 400 { error: 'Skill name not found in whitelist' }
//
// 边缘函数（edge-worker.js）无法 import 本模块，其等价逻辑由
// tools/lib/api-contract.test.mjs 以源码断言方式保证文案与判定顺序一致。

/** 写请求体解析失败时的错误文案 */
export const INVALID_JSON = 'Invalid JSON body';
/** 名称格式非法 */
export const INVALID_NAME = 'Invalid or missing skill name';
/** 名称合法但不在白名单 */
export const UNKNOWN_NAME = 'Skill name not found in whitelist';
/** 白名单不可用（fail-closed） */
export const WHITELIST_UNAVAILABLE = 'Skill whitelist unavailable';
/** 限流命中 */
export const RATE_LIMITED = 'RATE_LIMITED';
/** 存储不可用 */
export const STORE_UNAVAILABLE = 'STORE_UNAVAILABLE';
/** 白名单不可用时的用户提示 */
export const WHITELIST_PAUSED_MESSAGE = '技能名单不可用，写接口已暂停';

/**
 * 解析写请求体：兼容「已解析的对象」（Express / Vercel 已做 JSON 解析）与「字符串」（需自行解析）。
 * @param {unknown} raw 原始请求体
 * @returns {{ ok: true, data: Record<string, unknown> } | { ok: false, error: string }}
 */
export function parseWriteBody(raw) {
  if (raw && typeof raw === 'object') return { ok: true, data: raw };
  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw);
      return parsed && typeof parsed === 'object' ? { ok: true, data: parsed } : { ok: true, data: {} };
    } catch {
      return { ok: false, error: INVALID_JSON };
    }
  }
  return { ok: true, data: {} };
}

/**
 * 写接口前置判定：限流 → 存储可用性 → 白名单可用性（fail-closed）。
 * @param {{ limited?: boolean, storageIssue?: string | null, whitelistSize?: number }} state
 * @returns {{ ok: true } | { ok: false, status: number, body: { error: string, message?: string } }}
 */
export function checkWriteState({ limited = false, storageIssue = null, whitelistSize = 0 } = {}) {
  if (limited) {
    return {
      ok: false,
      status: 429,
      body: { error: RATE_LIMITED, message: '请求过于频繁，请稍后再试' },
    };
  }
  if (storageIssue) {
    return { ok: false, status: 503, body: { error: STORE_UNAVAILABLE, message: storageIssue } };
  }
  if (!whitelistSize) {
    return {
      ok: false,
      status: 503,
      body: { error: STORE_UNAVAILABLE, message: WHITELIST_PAUSED_MESSAGE },
    };
  }
  return { ok: true };
}
