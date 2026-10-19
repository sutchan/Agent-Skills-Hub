import { readFileSync } from 'node:fs';
import vm from 'node:vm';
const html = readFileSync('src/index.html', 'utf8');
// 精确提取主逻辑块：以 01-state.js 注释开始，到其后第一个 </script> 结束
const start = html.indexOf('// prototype/src/parts/01-state.js');
const end = html.indexOf('</script>', start);
const code = html.slice(start, end);
console.log('main block len:', code.length);
try { new vm.Script(code, { filename: 'main.js' }); console.log('MAIN BLOCK SYNTAX OK'); }
catch (e) { console.error('MAIN BLOCK ERR:', e.message); }

// 额外：校验数据块是否真坏——尝试提取 JSON 并用 JSON.parse（浏览器用同样数据）
const dStart = html.indexOf('window.SKILLS_DATA =');
const dEnd = html.indexOf('</script>', dStart);
let dcode = html.slice(dStart + 'window.SKILLS_DATA ='.length, dEnd).trim();
// 截掉末尾可能的分号/注释
if (dcode.endsWith(';')) dcode = dcode.slice(0, -1);
try { JSON.parse(dcode); console.log('SKILLS_DATA JSON OK (data block is valid JS/JSON; prior error was extraction artifact)'); }
catch (e) { console.error('DATA JSON ERR:', e.message); }
