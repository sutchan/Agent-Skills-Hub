// server/ratelimit.js
// 按 IP 限流：内存计数 + 周期落盘持久化（重启或共享卷部署下可延续计数窗口）。
import { RATELIMIT_FILE } from './config.js';
import { readJsonFile, writeJsonAtomic } from './fs-util.js';

const WINDOW_MS = 60_000; // 计数窗口：1 分钟
const MAX_REQUESTS = 120; // 每 IP 每窗口上限

/** IP → { start, count }；启动时从磁盘恢复上次采样值 */
const stored = readJsonFile(RATELIMIT_FILE, []);
const rateLimitMap = new Map(Array.isArray(stored) ? stored : []);

let ratelimitSaveTimer = null;
let lastSweepAt = Date.now();

/** 1s 节流落盘：已有待写入任务时直接返回，避免持续流量把定时器无限后推导致计数永不持久化 */
function saveRatelimitAtomic() {
  if (ratelimitSaveTimer) return;
  ratelimitSaveTimer = setTimeout(() => {
    ratelimitSaveTimer = null;
    try {
      writeJsonAtomic(RATELIMIT_FILE, [...rateLimitMap], 0);
    } catch (e) {
      console.error('Failed to atomic save ratelimit:', e);
    }
  }, 1000);
}

/** 进程退出前强制落盘，避免丢失当前窗口计数 */
export function flushRatelimit() {
  try {
    writeJsonAtomic(RATELIMIT_FILE, [...rateLimitMap], 0);
  } catch (e) {
    /* 退出阶段忽略写入失败 */
  }
}

process.on('SIGINT', () => {
  flushRatelimit();
  process.exit(0);
});
process.on('SIGTERM', () => {
  flushRatelimit();
  process.exit(0);
});

/**
 * 判断是否放行：无记录或窗口已过期则重置并放行，否则累加后与上限比较。
 * @param {string} ip 客户端 IP
 * @returns {boolean} 是否放行
 */
export function checkRateLimit(ip) {
  const now = Date.now();
  // 定期清理过期 IP：原先只重置不删除，唯一 IP 数量无上界增长
  if (now - lastSweepAt >= WINDOW_MS) {
    for (const [key, rec] of rateLimitMap) {
      if (now - rec.start > WINDOW_MS) rateLimitMap.delete(key);
    }
    lastSweepAt = now;
  }
  const record = rateLimitMap.get(ip);
  if (!record || now - record.start > WINDOW_MS) {
    rateLimitMap.set(ip, { start: now, count: 1 });
    saveRatelimitAtomic();
    return true;
  }
  record.count++;
  saveRatelimitAtomic();
  return record.count <= MAX_REQUESTS;
}

/** express 中间件：超过配额返回 429 JSON */
export function rateLimitMiddleware(req, res, next) {
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  if (!checkRateLimit(ip)) {
    return res.status(429).json({ error: 'Too many requests, please slow down.' });
  }
  next();
}
