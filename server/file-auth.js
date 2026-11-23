// server/file-auth.js v1.16.28 — 通用文件 API 的写操作鉴权
// 本地零配置开发（无 FILE_API_TOKEN 且非 VERCEL）保持原有零门槛行为，便于 verify-file-store.mjs 与 e2e；
// 生产（VERCEL=1）必须显式配置 FILE_API_TOKEN，否则写接口 fail-closed 返回 503，避免任意人上传/删除/列举文件。
const TOKEN = process.env.FILE_API_TOKEN || '';
const IS_PRODUCTION = process.env.VERCEL === '1';

/**
 * 校验文件 API 的敏感操作权限。
 * @returns {{status:number, body:object}|null} null 表示放行
 */
export function requireFileApiAccess(req) {
  if (!TOKEN && !IS_PRODUCTION) return null;
  if (!TOKEN) {
    return {
      status: 503,
      body: { error: 'FILE_API_NOT_CONFIGURED', message: '文件服务未配置 FILE_API_TOKEN，写操作已停用' },
    };
  }
  const auth = String(req.headers?.authorization || '');
  const bearer = auth.startsWith('Bearer ') ? auth.slice(7).trim() : '';
  const provided = bearer || String(req.headers?.['x-file-token'] || '');
  if (provided !== TOKEN) {
    return { status: 401, body: { error: 'UNAUTHORIZED', message: '缺少或错误的文件服务令牌' } };
  }
  return null;
}
