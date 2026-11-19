// server/blob-store.js — 投票/收藏数据的统一存储层（Vercel Blob / 本地文件）
//
// 环境判定：
//   - 生产（VERCEL=1）或显式 USE_BLOB=1，且 BLOB_READ_WRITE_TOKEN 为真实 token → 读写 Vercel Blob
//   - 否则回退本地 data/kv-store.json（保持开发 / e2e 既有行为，无需 token 即可运行）
//
// 数据模型：单个私有 blob `kv-store.json` 保存 { votes, favorites } 全量状态。
// 注意：Vercel Blob 不提供原子自增，采用「读-改-写」，高并发下以最后一次写入为准；
//       本项目为展示型投票/收藏，可接受该最终一致性取舍。
import { readJsonFile, writeJsonAtomic } from './fs-util.js';
import { STORE_FILE } from './config.js';

const BLOB_PATH = 'kv-store.json';
const RAW_TOKEN = process.env.BLOB_READ_WRITE_TOKEN || '';
const PLACEHOLDER = /^(your|replace|changeme|xxx|<)/i;

function blobToken() {
  if (!RAW_TOKEN || PLACEHOLDER.test(RAW_TOKEN) || RAW_TOKEN.length < 20) return null;
  return RAW_TOKEN;
}

/** 是否启用 Vercel Blob（生产或显式开启，且 token 有效） */
export function isBlobEnabled() {
  return Boolean(blobToken()) && (process.env.VERCEL === '1' || process.env.USE_BLOB === '1');
}

function emptyKv() {
  return { votes: {}, favorites: {} };
}

/** 读取全量投票/收藏状态 */
export async function loadKv() {
  if (!isBlobEnabled()) return readJsonFile(STORE_FILE, emptyKv());
  const { list, get } = await import('@vercel/blob');
  const token = blobToken();
  const { blobs } = await list({ prefix: BLOB_PATH, token });
  const hit = blobs.find((b) => b.pathname === BLOB_PATH);
  if (!hit) return emptyKv();
  const res = await get(hit.url, { token });
  const data = await res.json();
  return data && typeof data === 'object' ? data : emptyKv();
}

/** 写入全量投票/收藏状态（覆盖同一 pathname，URL 保持稳定） */
export async function saveKv(data) {
  if (!isBlobEnabled()) {
    writeJsonAtomic(STORE_FILE, data);
    return;
  }
  const { put } = await import('@vercel/blob');
  await put(BLOB_PATH, JSON.stringify(data), {
    access: 'private',
    addRandomSuffix: false,
    contentType: 'application/json',
    token: blobToken(),
  });
}
