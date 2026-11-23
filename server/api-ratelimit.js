// server/api-ratelimit.js — Serverless Functions 的轻量内存限流
// 与 server/ratelimit.js 的差异：不落盘（Serverless 实例文件系统不可写且按实例隔离），
// 按实例生效即可拦住单 IP 的突发写请求；多实例并行时配额会被放大，属已知取舍。
//
// 语义与本地 Express 的限流一致：固定窗口计数，超限返回 429。
const WINDOW_MS = 60_000; // 计数窗口：1 分钟
const MAX_REQUESTS = Number(process.env.API_RATE_LIMIT) || 30; // 每 IP 每窗口写请求上限
const SWEEP_MS = WINDOW_MS;

/** IP → { start, count } */
const buckets = new Map();
let lastSweepAt = Date.now();

/** 取客户端 IP：优先 x-forwarded-for 首段（Vercel/EdgeOne 均会注入） */
export function clientIp(req) {
  const xff = req.headers?.['x-forwarded-for'];
  const first = Array.isArray(xff) ? xff[0] : String(xff || '').split(',')[0];
  const ip = String(first || req.socket?.remoteAddress || '').trim();
  return ip || 'unknown';
}

/**
 * 判断是否放行：无记录或窗口过期则重置放行，否则累加后与上限比较。
 * @param {string} ip 客户端 IP
 * @returns {boolean} 是否放行
 */
export function allowRequest(ip) {
  const now = Date.now();
  // 定期清理过期 IP，避免唯一 IP 数量无上界增长
  if (now - lastSweepAt >= SWEEP_MS) {
    for (const [key, rec] of buckets) {
      if (now - rec.start > WINDOW_MS) buckets.delete(key);
    }
    lastSweepAt = now;
  }
  const rec = buckets.get(ip);
  if (!rec || now - rec.start > WINDOW_MS) {
    buckets.set(ip, { start: now, count: 1 });
    return true;
  }
  rec.count += 1;
  return rec.count <= MAX_REQUESTS;
}
