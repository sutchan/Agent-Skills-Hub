import { readFileSync } from 'node:fs';
const f = 'src/index.html';
const text = readFileSync(f, 'utf8');
const lines = text.split('\n');
const pats = ['function ', 'addEventListener', 'searchInput', 'currentCategory', 'activeCategory', 'selectedTags', 'SKILLS_DATA', 'categoryFilter', 'tagFilter', 'renderList', 'renderSkills', 'applyFilter', 'sortBy', 'loadMore', 'IntersectionObserver'];
let count = 0;
for (let i = 0; i < lines.length; i++) {
  const ln = lines[i];
  for (const p of pats) {
    if (ln.includes(p)) {
      console.log((i + 1) + ': ' + ln.trim().slice(0, 180));
      count++;
      break;
    }
  }
  if (count > 120) break;
}
console.log('--- total matched:', count, ' file lines:', lines.length);
