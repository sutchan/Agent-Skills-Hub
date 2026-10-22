import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { execSync } from 'node:child_process';

const has = (p) => existsSync(p);
const read = (p) => readFileSync(p, 'utf8');
const out = [];
const log = (k, v) => out.push(`${k}: ${v}`);

// 1. e2e 目录 / playwright testDir
log('1.e2e_dir', has('e2e'));
if (has('playwright.config.ts')) {
  const pc = read('playwright.config.ts');
  const m = pc.match(/testDir:\s*["']([^"']+)["']/);
  log('1.playwright_testDir', m ? m[1] : 'NOT FOUND');
}

// 2. next.config output / out 目录
if (has('next.config.mjs')) {
  const nc = read('next.config.mjs');
  log('2.next_output_export', /output:\s*["']export["']/.test(nc));
  log('2.has_out_dir', has('out'));
}

// 3. ci.yml deploy 目录
try {
  const ciFiles = execSync('git ls-files .github/workflows', { encoding: 'utf8' }).trim().split('\n');
  for (const f of ciFiles) {
    if (!f) continue;
    const c = read(f);
    const dep = c.match(/(?:path:|artifact|upload|deploy)[^\n]*(?:\.next|out|\/dist)[^\n]*/gi) || [];
    log('3.ci:' + f, dep.join(' | ') || 'no .next/out ref');
  }
} catch (e) { log('3.ci_err', e.message); }

// 4. tools/validate-skills.mjs 是否还存在
log('4.validate-skills.mjs', has('tools/validate-skills.mjs'));
if (has('tools')) {
  log('4.tools_contents', readdirSync('tools').join(','));
}
if (has('tools/lib')) {
  log('4.tools_lib', readdirSync('tools/lib').join(','));
}

// 5. data 构建脚本是否存在
['tools/build-skills-data.mjs','tools/build.mjs','tools/lib/taxonomy.mjs','tools/sync-css.mjs','tools/sync-tokens.mjs'].forEach(p =>
  log('5.' + p, has(p)));

// 6. package.json scripts
const pkg = JSON.parse(read('package.json'));
log('6.scripts', JSON.stringify(pkg.scripts));

// 7. skills 目录数 vs data 条数
const skillsDirs = readdirSync('skills').filter(d => {
  try { return statSync('skills/' + d).isDirectory(); } catch { return false; }
});
const dirsWithSkill = skillsDirs.filter(d => has('skills/' + d + '/SKILL.md'));
const data = JSON.parse(read('data/skills-data.json'));
const dataSkills = data.skills.filter(s => !s.hidden);
const hidden = data.skills.filter(s => s.hidden).map(s => s.name);
log('7.skills_dirs_total', skillsDirs.length);
log('7.skills_dirs_with_SKILL', dirsWithSkill.length);
log('7.skills_dirs_list', skillsDirs.join(','));
log('7.data_skills_total', data.skills.length);
log('7.data_skills_nonhidden', dataSkills.length);
log('7.data_hidden_names', hidden.join(','));
// 差集：目录有 SKILL.md 但不在 data
const dataNames = new Set(data.skills.map(s => s.name));
const missing = dirsWithSkill.filter(d => !dataNames.has(d));
log('7.DIR_NOT_IN_DATA', missing.join(',') || 'none');

// 8. RecycleBin 垃圾目录
const recycle = skillsDirs.filter(d => /RecycleBin|ffs_tmp|tmp/i.test(d));
log('8.suspicious_dirs', recycle.join(',') || 'none');
recycle.forEach(d => log('8.' + d + '_has_SKILL', has('skills/' + d + '/SKILL.md')));

// 9. scripts/verify-storage.mjs 技能名白名单
if (has('scripts/verify-storage.mjs')) {
  const vs = read('scripts/verify-storage.mjs');
  // 取其中出现的技能名
  const used = [...vs.matchAll(/['"`]([a-z0-9-]+)['"`]/g)].map(m => m[1]);
  // server.js validSkillNames
  const sj = has('server.js') ? read('server.js') : '';
  const wm = sj.match(/validSkillNames\s*=\s*\[([^\]]*)\]/s);
  let whitelist = [];
  if (wm) whitelist = [...wm[1].matchAll(/['"]([^'"]+)['"]/g)].map(m => m[1]);
  const bad = used.filter(u => whitelist.length && !whitelist.includes(u) && /skill|pattern|practice|test/i.test(u));
  log('9.verifystorage_used_skilllike', [...new Set(bad)].join(',') || 'none-suspicious');
  log('9.server_whitelist_count', whitelist.length);
}

// 10. server.js /data 静态暴露
if (has('server.js')) {
  const sj = read('server.js');
  log('10.server_data_static', /express\.static\([^)]*data/.test(sj));
}

// 11. src/parts/03-detail.js 引用
if (has('src/parts/03-detail.js')) {
  try {
    const refs = execSync('git grep -l "03-detail" -- "*.ts" "*.tsx" "*.js" "*.html"', { encoding: 'utf8' }).trim();
    log('11.03-detail_refs', refs || 'NONE');
  } catch { log('11.03-detail_refs', 'NONE'); }
}

// 12. 版本漂移
const pkgVer = pkg.version;
log('12.pkg_version', pkgVer);
const checkVer = (p, re) => {
  if (!has(p)) return log('12.' + p, 'MISSING FILE');
  const m = read(p).match(re);
  log('12.' + p, m ? m[1] : 'no-match');
};
checkVer('prototype/wireframes.html', /footerVer["'][^>]*>\s*v?([\d.]+)/i);
checkVer('docs/spec.md', /version[:\s]+v?([\d.]+)/i);
checkVer('.github/CONTRIBUTING.md', /version[:\s]+v?([\d.]+)/i);

console.log(out.join('\n'));
