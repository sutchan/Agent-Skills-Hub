// tools/sync-tokens.mjs v1.19.25
// 令牌单一来源同步：从 prototype 视觉源提取 :root 与暗色主题块，生成 app 静态副本 tokens-shared.css。
// 设计令牌事实源为 prototype/src/styles/tokens.css（见 README §8 与设计系统），
// 本脚本在视觉变更后手动运行一次，将副本写入 app/tokens-shared.css，并提交以防 CI 漂移。
// app/globals.css 通过 @import "./tokens-shared.css" 消费；build.mjs 不再生成此文件。
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = dirname(__dirname); // 仓库根
const srcTokensPath = join(ROOT, "prototype", "src", "styles", "tokens.css");
const sharedTokensPath = join(ROOT, "app", "tokens-shared.css");

// 与历史 build.mjs extractTokens 行为一致：抽取 :root 与 html[data-theme="dark"] 两个块
function extractTokens(srcCss) {
  const root = srcCss.match(/:root\s*\{([\s\S]*?)\n\}/);
  const dark = srcCss.match(/html\[data-theme="dark"\]\s*\{([\s\S]*?)\n\}/);
  const block = (m) =>
    m
      ? m[1]
          .split("\n")
          .filter(
            (l) =>
              l.trim() &&
              !l.trim().startsWith("*") &&
              !l.trim().startsWith("/*") &&
              !l.trim().startsWith(".sr-only"),
          )
          .join("\n")
      : "";
  return `/* app/tokens-shared.css — 由 tools/sync-tokens.mjs 从 prototype/src/styles/tokens.css 同步生成（勿手改；事实源见 DESIGN §2） */
:root {
${block(root)}
}
html[data-theme="dark"] {
${block(dark)}
}
`;
}

function main() {
  const css = readFileSync(srcTokensPath, "utf8");
  const sharedTokens = extractTokens(css);
  mkdirSync(dirname(sharedTokensPath), { recursive: true });
  writeFileSync(sharedTokensPath, sharedTokens, "utf8");
  console.log(`同步令牌 -> ${sharedTokensPath}`);
}

main();
