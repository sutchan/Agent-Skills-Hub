// scripts/seo/facts.mjs — SEO/GEO 资产唯一事实来源
//
// 所有数量、分类、描述都从 data/skills-data.json 实算，禁止在生成物里手填数字，
// 避免历史反复出现的「文档数字与磁盘数据脱节」。由 scripts/sync-seo-assets.mjs 调用。
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

export const SITE = {
  name: 'Agent Skills Hub',
  url: 'https://skills.ewuse.com',
  repo: 'https://github.com/sutchan/Agent-Skills-Hub',
  license: 'https://opensource.org/licenses/MIT',
  image: 'https://skills.ewuse.com/banner-og.svg',
};

export const SITE_TITLE = 'Agent Skills Hub · 开源 AI Agent 技能目录（中文可检索）';
export const SITE_DESCRIPTION =
  '开源 AI Agent 技能目录：按 SKILL.md 规范整理，提供分类浏览、关键词搜索、中英双语描述与一键安装路径；界面支持简体中文、繁体中文与英语，项目整体采用 MIT 协议。';

const DATA_PATH = path.join(ROOT, 'data', 'skills-data.json');
const data = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));

/** 隐藏条目不对外展示：站点可见技能数一律以本数组长度为准 */
export const visible = data.skills.filter((s) => !s.hidden);
export const recordCount = data.skills.length;
export const total = visible.length;
export const hiddenCount = recordCount - total;

/** 分类按技能首次出现顺序分组，与 scripts/sync-inline-data.mjs 的保序规则一致 */
export const groups = (() => {
  const map = new Map();
  for (const s of visible) {
    const key = s.category || '未分类';
    if (!map.has(key)) map.set(key, { name: key, en: s.enCategory || key, skills: [] });
    map.get(key).skills.push(s);
  }
  return [...map.values()];
})();

/** sitemap lastmod / JSON-LD dateModified 取 CHANGELOG 最新版本的发布日期。
 *  不用文件 mtime：CI checkout 会重置 mtime，会让每次构建都产生不同的生成物、破坏幂等。 */
const changelog = fs.readFileSync(path.join(ROOT, 'CHANGELOG.md'), 'utf8');
const latestRelease = changelog.match(/^##\s+\[?\d+\.\d+\.\d+\]?\s+-\s+(\d{4}-\d{2}-\d{2})/m);
if (!latestRelease) throw new Error('CHANGELOG.md 缺少最新版本日期，无法生成 sitemap lastmod');
export const lastmod = latestRelease[1];

/** HTML 文本转义；同时压掉换行，保证目录区块每项单行、便于 diff */
export function esc(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/\s+/g, ' ')
    .trim();
}

/** 生成物的文本摘要：描述过长时截断，避免单行撑爆索引 */
export function summary(value, limit = 120) {
  const text = esc(value);
  return text.length > limit ? text.slice(0, limit).trimEnd() + '…' : text;
}

/** 技能源码目录：数据里的 githubDir 为 skills/<name>，拼成真实可访问的仓库路径 */
export function skillUrl(s) {
  const dir = s.githubDir || `skills/${s.name}`;
  return `${SITE.repo}/tree/main/${dir}`;
}

/** 技能在站点内的详情深链（hash 路由，见 src/index.html writeHash/parseHash） */
export function detailUrl(s) {
  return `${SITE.url}/#skill=${encodeURIComponent(s.name)}`;
}

/** FAQ 事实块：JSON-LD 与页面可见问答共用，避免两处口径漂移 */
export const faq = [
  {
    q: 'Agent Skills Hub 是什么？',
    a: 'Agent Skills Hub 是一个开源、免费、纯静态的 AI Agent 技能（Skill）目录。技能按 SKILL.md 规范组织，站点提供分类浏览、关键词搜索、标签筛选、投票收藏与技能详情，界面支持简体中文、繁体中文和英语。',
  },
  {
    q: '目前收录了多少个技能、多少个分类？',
    a: `站点当前展示 ${total} 个可见技能，覆盖 ${groups.length} 个分类；权威数据源 data/skills-data.json 含 ${recordCount} 条记录，其中 ${hiddenCount} 条标记为隐藏。数量以该文件为准。`,
  },
  {
    q: '是否免费？使用什么许可证？',
    a: '完全免费且开源，项目整体采用 MIT 许可证；各技能自身许可证以其目录内 LICENSE 文件为准。仓库地址 https://github.com/sutchan/Agent-Skills-Hub。',
  },
  {
    q: '怎样安装和使用一个技能？',
    a: '把 skills/<技能名>/ 整个目录复制到你的 Agent 技能目录（例如 Claude Code 的 ~/.claude/skills/），技能由 SKILL.md 中的 description 自动触发；也可用 skills-manager 批量管理。',
  },
  {
    q: '技能描述支持哪些语言？',
    a: '每条技能都有中文描述与英文原文（enDescription），界面可切换简体中文、繁体中文、英语三语；分类名同样提供中英对照。',
  },
  {
    q: '技能元数据在哪里可以机器读取？',
    a: '权威数据是站点 /data/skills-data.json，完整可读清单是 /llms-full.txt，供搜索引擎与生成式引擎引用的摘要见 /llms.txt。',
  },
  {
    q: '如何分享某次搜索或某个技能？',
    a: '筛选与搜索结果会同步进 URL hash，例如 #q=wordpress 可直接分享搜索结果，#skill=<技能名> 会自动打开该技能详情。',
  },
];
