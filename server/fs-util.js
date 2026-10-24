// server/fs-util.js
// JSON 文件的读取与原子写工具，供 store / ratelimit 复用。
import fs from 'node:fs';
import path from 'node:path';

/**
 * 读取 JSON 文件；文件不存在或解析失败时返回 fallback。
 * 说明：首次启动时数据文件不存在属正常场景，不应让服务崩溃。
 * @param {string} file 目标文件
 * @param {unknown} fallback 兜底值
 */
export function readJsonFile(file, fallback) {
  try {
    if (fs.existsSync(file)) return JSON.parse(fs.readFileSync(file, 'utf-8'));
  } catch (e) {
    console.error(`Failed to load JSON file: ${file}`, e);
  }
  return fallback;
}

/**
 * 原子写 JSON：先写 .tmp 再 rename，避免写入过程被中断留下半截文件导致数据损坏。
 * @param {string} file 目标文件
 * @param {unknown} value 可序列化的值
 * @param {number} indent 缩进空格数，传 0 输出紧凑形式
 */
export function writeJsonAtomic(file, value, indent = 2) {
  const dir = path.dirname(file);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  const tmp = file + '.tmp';
// 尾随换行：与仓库 LF 约定一致，避免每次落盘都产生「末行无换行」的无谓 diff
  fs.writeFileSync(tmp, JSON.stringify(value, null, indent) + '\n', 'utf-8');
  fs.renameSync(tmp, file);
}
