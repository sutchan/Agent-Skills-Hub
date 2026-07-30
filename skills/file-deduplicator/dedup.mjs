#!/usr/bin/env node
// path: ~/.codebuddy/skills/file-deduplicator/dedup.mjs
// version: 1.0.0
// 基于内容哈希的项目去重工具：检测重复/空/无效文件，安全清理（默认 report）。
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";

const DEFAULT_IGNORE = new Set([
  ".git", "node_modules", "dist", "build", ".next", "out", ".cache",
  ".codebuddy", ".agents", "vendor", "target", "__pycache__", ".venv",
  "venv", ".idea", ".vscode",
]);

function human(num) {
  const units = ["B", "KB", "MB", "GB", "TB"];
  let n = num;
  for (const u of units) {
    if (Math.abs(n) < 1024) return `${n.toFixed(1)}${u}`;
    n /= 1024;
  }
  return `${n.toFixed(1)}PB`;
}

function fileHash(filePath, algo = "sha256") {
  const h = crypto.createHash(algo);
  const stream = fs.createReadStream(filePath);
  return new Promise((resolve, reject) => {
    stream.on("data", (c) => h.update(c));
    stream.on("end", () => resolve(h.digest("hex")));
    stream.on("error", reject);
  });
}

async function scan(root, minSize, ignore, follow) {
  const groups = new Map();
  const empties = [];
  async function walk(dir) {
    let entries;
    try {
      entries = await fs.promises.readdir(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const e of entries) {
      const fp = path.join(dir, e.name);
      if (e.isDirectory()) {
        if (!ignore.has(e.name)) await walk(fp);
        continue;
      }
      if (e.isSymbolicLink() && !follow) continue;
      let stat;
      try {
        stat = await fs.promises.stat(fp);
      } catch {
        continue;
      }
      if (!stat.isFile()) continue;
      if (stat.size === 0) {
        empties.push(fp);
        continue;
      }
      if (stat.size < minSize) continue;
      try {
        const digest = await fileHash(fp, algo);
        if (!groups.has(digest)) groups.set(digest, []);
        groups.get(digest).push([fp, stat.size]);
      } catch {
        /* 跳过无法读取的文件 */
      }
    }
  }
  await walk(root);
  return { groups, empties };
}

const argv = process.argv.slice(2);
const opt = {
  path: null, minSize: 1, hash: "sha256", action: "report",
  trashDir: "./.dedup-trash", ignore: "", follow: false,
};
for (let i = 0; i < argv.length; i++) {
  const a = argv[i];
  if (a === "--path") opt.path = argv[++i];
  else if (a === "--min-size") opt.minSize = parseInt(argv[++i], 10);
  else if (a === "--hash") opt.hash = argv[++i];
  else if (a === "--action") opt.action = argv[++i];
  else if (a === "--trash-dir") opt.trashDir = argv[++i];
  else if (a === "--ignore") opt.ignore = argv[++i];
  else if (a === "--follow-symlinks") opt.follow = true;
}

if (!opt.path) {
  console.error("错误：缺少 --path 参数");
  process.exit(2);
}
const root = path.resolve(opt.path);
if (!fs.existsSync(root) || !fs.statSync(root).isDirectory()) {
  console.error(`错误：目录不存在 -> ${root}`);
  process.exit(2);
}

const algo = opt.hash;
const ignore = new Set([...DEFAULT_IGNORE, ...opt.ignore.split(",").map((s) => s.trim()).filter(Boolean)]);

const { groups, empties } = await scan(root, opt.minSize, ignore, opt.follow);
const dupGroups = [...groups.entries()].filter(([, v]) => v.length > 1);
const totalDup = dupGroups.reduce((s, [, v]) => s + v.length - 1, 0);
const reclaim = dupGroups.reduce((s, [, v]) => s + v[0][1] * (v.length - 1), 0);

console.log(`扫描目录: ${root}`);
console.log(`重复文件组: ${dupGroups.length} | 可清理副本数: ${totalDup} | 可释放: ${human(reclaim)}`);
console.log(`空文件(0字节): ${empties.length}`);
console.log("-".repeat(60));

if (opt.action === "move") fs.mkdirSync(opt.trashDir, { recursive: true });

for (const [h, files] of dupGroups.sort((a, b) => b[1][0][1] - a[1][0][1])) {
  console.log(`\n[${h.slice(0, 12)}…] ${files.length} 个副本, 单文件 ${human(files[0][1])}`);
  const [keep] = files[0];
  console.log(`  保留: ${keep}`);
  for (const [fp] of files.slice(1)) {
    console.log(`  副本: ${fp}`);
    if (opt.action === "move") {
      const rel = path.relative(root, fp);
      const dest = path.join(opt.trashDir, rel);
      fs.mkdirSync(path.dirname(dest), { recursive: true });
      fs.renameSync(fp, dest);
      console.log(`    -> 已移至 ${dest}`);
    } else if (opt.action === "delete") {
      fs.rmSync(fp);
      console.log(`    -> 已删除`);
    }
  }
}

if (empties.length) {
  console.log("\n空文件(0字节):");
  for (const fp of empties) console.log(`  ${fp}`);
}

if (opt.action === "report") {
  console.log("\n(仅报告模式，未做任何修改。加 --action move/delete 执行清理)");
}
