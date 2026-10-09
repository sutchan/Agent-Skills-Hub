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
app.use('/data', express.static(path.join(__dirname, 'data')));
app.use('/skills', express.static(path.join(__dirname, 'skills')));

// Edge KV Store simulation (Tencent Cloud EdgeOne Edge KV)
const STORE_FILE = path.join(__dirname, 'data', 'kv-store.json');

function loadKvStore() {
  try {
    if (fs.existsSync(STORE_FILE)) {
      return JSON.parse(fs.readFileSync(STORE_FILE, 'utf-8'));
    }
  } catch (e) {}
  return { votes: {}, favorites: {} };
}

function saveKvStore(store) {
  try {
    const dataDir = path.dirname(STORE_FILE);
    if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
    fs.writeFileSync(STORE_FILE, JSON.stringify(store, null, 2), 'utf-8');
  } catch (e) {}
}

let kvStore = loadKvStore();

app.get('/api/votes', (req, res) => {
  res.json(kvStore.votes || {});
});

app.post('/api/votes', (req, res) => {
  const { name, action } = req.body;
  if (!name) return res.status(400).json({ error: 'Missing skill name' });
  if (!kvStore.votes) kvStore.votes = {};
  if (!kvStore.votes[name]) kvStore.votes[name] = { up: 0 };
  
  if (action === 'undo') {
    delete kvStore.votes[name];
    saveKvStore(kvStore);
    return res.json({ name, up: 0 });
  } else {
    kvStore.votes[name].up += 1;
    saveKvStore(kvStore);
    return res.json({ name, ...kvStore.votes[name] });
  }
});

app.get('/api/favorites', (req, res) => {
  res.json(kvStore.favorites || {});
});

app.post('/api/favorites', (req, res) => {
  const { name, action } = req.body;
  if (!name) return res.status(400).json({ error: 'Missing skill name' });
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
  saveKvStore(kvStore);
  res.json({ name, bookmarked: isFav, favorites: Object.keys(kvStore.favorites) });
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'src', 'index.html'));
});

app.listen(PORT, HOST, () => {
  console.log(`Agent Skills Hub server running at http://${HOST}:${PORT}`);
});
