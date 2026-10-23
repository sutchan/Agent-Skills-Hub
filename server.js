import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0';

app.use(express.json());

// Serve static assets from src, public, data, skills
app.use(express.static(path.join(__dirname, 'src')));
app.use(express.static(path.join(__dirname, 'public')));
// 仅对外暴露公开数据（技能目录与指标）；投票/收藏等敏感 KV（kv-store.json）不直出，避免数据泄露（#11）
app.get('/data/skills-data.json', (req, res) => res.sendFile(path.join(__dirname, 'data', 'skills-data.json')));
app.get('/data/skills-metrics.json', (req, res) => res.sendFile(path.join(__dirname, 'data', 'skills-metrics.json')));
app.use('/skills', express.static(path.join(__dirname, 'skills')));

// Edge KV Store simulation (Tencent Cloud EdgeOne Edge KV) with Atomic Write & Whitelist
const STORE_FILE = path.join(__dirname, 'data', 'kv-store.json');
const SKILLS_FILE = path.join(__dirname, 'data', 'skills-data.json');

let validSkillNames = new Set();
try {
  if (fs.existsSync(SKILLS_FILE)) {
    const skillsData = JSON.parse(fs.readFileSync(SKILLS_FILE, 'utf-8'));
    if (Array.isArray(skillsData.skills)) {
      skillsData.skills.forEach(s => {
        if (s.name) validSkillNames.add(s.name);
      });
    }
  }
} catch (e) {
  console.error('Failed to load valid skill names whitelist:', e);
}

function loadKvStore() {
  try {
    if (fs.existsSync(STORE_FILE)) {
      return JSON.parse(fs.readFileSync(STORE_FILE, 'utf-8'));
    }
  } catch (e) {}
  return { votes: {}, favorites: {} };
}

let saveTimer = null;
function saveKvStoreAtomic(store) {
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    try {
      const dataDir = path.dirname(STORE_FILE);
      if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
      const tmpFile = STORE_FILE + '.tmp';
      fs.writeFileSync(tmpFile, JSON.stringify(store, null, 2), 'utf-8');
      fs.renameSync(tmpFile, STORE_FILE);
    } catch (e) {
      console.error('Failed to atomic save kv-store:', e);
    }
  }, 100);
}

let kvStore = loadKvStore();

// 限流状态持久化：重启或共享卷部署下可延续计数窗口（#16 限流持久化评估 → 落地）
const RATELIMIT_FILE = path.join(__dirname, 'data', 'ratelimit.json');
function loadRatelimit() {
  try {
    if (fs.existsSync(RATELIMIT_FILE)) {
      const arr = JSON.parse(fs.readFileSync(RATELIMIT_FILE, 'utf-8'));
      if (Array.isArray(arr)) return new Map(arr);
    }
  } catch (e) {
    console.error('Failed to load ratelimit store:', e);
  }
  return new Map();
}

let ratelimitSaveTimer = null;
function saveRatelimitAtomic() {
  if (ratelimitSaveTimer) clearTimeout(ratelimitSaveTimer);
  ratelimitSaveTimer = setTimeout(() => {
    try {
      const dataDir = path.dirname(RATELIMIT_FILE);
      if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
      const tmp = RATELIMIT_FILE + '.tmp';
      fs.writeFileSync(tmp, JSON.stringify([...rateLimitMap]), 'utf-8');
      fs.renameSync(tmp, RATELIMIT_FILE);
    } catch (e) {
      console.error('Failed to atomic save ratelimit:', e);
    }
  }, 1000);
}

// 进程退出前强制落盘，避免丢失当前窗口计数
function flushRatelimit() {
  try {
    fs.writeFileSync(RATELIMIT_FILE, JSON.stringify([...rateLimitMap]), 'utf-8');
  } catch (e) {}
}
process.on('SIGINT', () => { flushRatelimit(); process.exit(0); });
process.on('SIGTERM', () => { flushRatelimit(); process.exit(0); });

// In-memory rate limiting map（启动时从磁盘恢复，运行时周期落盘）
const rateLimitMap = loadRatelimit();
function checkRateLimit(ip) {
  const now = Date.now();
  const windowMs = 60000; // 1 minute
  const maxRequests = 120; // 120 requests per minute per IP
  let record = rateLimitMap.get(ip);
  if (!record || now - record.start > windowMs) {
    record = { start: now, count: 1 };
    rateLimitMap.set(ip, record);
    saveRatelimitAtomic();
    return true;
  }
  record.count++;
  saveRatelimitAtomic();
  return record.count <= maxRequests;
}

app.use((req, res, next) => {
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  if (!checkRateLimit(ip)) {
    return res.status(429).json({ error: 'Too many requests, please slow down.' });
  }
  next();
});

app.get('/api/votes', (req, res) => {
  res.json(kvStore.votes || {});
});

app.post('/api/votes', (req, res) => {
  const { name, action } = req.body;
  if (!name || typeof name !== 'string') {
    return res.status(400).json({ error: 'Missing or invalid skill name' });
  }
  if (validSkillNames.size > 0 && !validSkillNames.has(name)) {
    return res.status(400).json({ error: 'Skill name not found in whitelist' });
  }

  if (!kvStore.votes) kvStore.votes = {};
  if (!kvStore.votes[name]) kvStore.votes[name] = { up: 0 };
  
  if (action === 'undo') {
    delete kvStore.votes[name];
    saveKvStoreAtomic(kvStore);
    return res.json({ name, up: 0 });
  } else {
    kvStore.votes[name].up += 1;
    saveKvStoreAtomic(kvStore);
    return res.json({ name, ...kvStore.votes[name] });
  }
});

app.get('/api/favorites', (req, res) => {
  res.json(kvStore.favorites || {});
});

app.post('/api/favorites', (req, res) => {
  const { name, action } = req.body;
  if (!name || typeof name !== 'string') {
    return res.status(400).json({ error: 'Missing or invalid skill name' });
  }
  if (validSkillNames.size > 0 && !validSkillNames.has(name)) {
    return res.status(400).json({ error: 'Skill name not found in whitelist' });
  }

  if (!kvStore.favorites) kvStore.favorites = {};
  let isFav;
  if (action === 'add') {
    isFav = true;
  } else if (action === 'remove') {
    isFav = false;
  } else {
    isFav = !kvStore.favorites[name];
  }
  if (isFav) {
    kvStore.favorites[name] = true;
  } else {
    delete kvStore.favorites[name];
  }
  saveKvStoreAtomic(kvStore);
  res.json({ name, bookmarked: isFav, favorites: Object.keys(kvStore.favorites) });
});

// 本地 / 预览：将 GA 衡量 ID 占位符替换为环境变量（缺省回退原 ID，保证本地 GA 可用）
const GA_TOKEN = '__GA_MEASUREMENT_ID__';
app.get('/', (req, res) => {
  const file = path.join(__dirname, 'src', 'index.html');
  fs.readFile(file, 'utf-8', (err, html) => {
    if (err) return res.status(500).send('Internal Server Error');
    const gaId = process.env.GA_MEASUREMENT_ID || 'G-WQDDVB14PF';
    res.type('html').send(html.split(GA_TOKEN).join(gaId));
  });
});

app.listen(PORT, HOST, () => {
  console.log(`Agent Skills Hub server running at http://${HOST}:${PORT}`);
});
