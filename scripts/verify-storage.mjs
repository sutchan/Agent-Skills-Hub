import fs from 'fs';
import path from 'path';

const BASE_URL = 'http://localhost:3000';
const STORE_FILE = path.join(process.cwd(), 'data', 'kv-store.json');

async function runTests() {
  console.log('=== 开始验证点赞和收藏数据存储系统 ===\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, testName) {
    if (condition) {
      console.log(`✅ [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${testName}`);
      failed++;
    }
  }

  try {
    // 1. 测试读取初始状态
    console.log('--- 测试 1: 初始数据读取 ---');
    const getVotesRes = await fetch(`${BASE_URL}/api/votes`);
    assert(getVotesRes.status === 200, 'GET /api/votes 响应状态码 200');
    const initialVotes = await getVotesRes.json();
    assert(typeof initialVotes === 'object', 'GET /api/votes 返回对象数据');

    const getFavsRes = await fetch(`${BASE_URL}/api/favorites`);
    assert(getFavsRes.status === 200, 'GET /api/favorites 响应状态码 200');
    const initialFavs = await getFavsRes.json();
    assert(typeof initialFavs === 'object', 'GET /api/favorites 返回对象数据');

    // 2. 测试点赞累加
    console.log('\n--- 测试 2: 点赞 (Upvote) 累加与更新 ---');
    const testSkill = 'test-verification-skill';
    
    // 第一次点赞
    const upRes1 = await fetch(`${BASE_URL}/api/votes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: testSkill, action: 'up' })
    });
    assert(upRes1.status === 200, 'POST /api/votes 点赞请求成功 (200)');
    const upData1 = await upRes1.json();
    assert(upData1.name === testSkill && upData1.up >= 1, `点赞数据返回正常: up=${upData1.up}`);

    // 第二次点赞 (累加制验证)
    const curUp = upData1.up;
    const upRes2 = await fetch(`${BASE_URL}/api/votes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: testSkill, action: 'up' })
    });
    const upData2 = await upRes2.json();
    assert(upData2.up === curUp + 1, `再次点赞正确累加: ${curUp} -> ${upData2.up}`);

    // 验证磁盘物理文件是否同步写入
    const diskStoreAfterVote = JSON.parse(fs.readFileSync(STORE_FILE, 'utf-8'));
    assert(diskStoreAfterVote.votes?.[testSkill]?.up === upData2.up, '磁盘 kv-store.json 成功持久化点赞数据');

    // 3. 测试撤销点赞
    console.log('\n--- 测试 3: 撤销点赞 (Undo Vote) ---');
    const undoRes = await fetch(`${BASE_URL}/api/votes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: testSkill, action: 'undo' })
    });
    assert(undoRes.status === 200, 'POST /api/votes 撤销点赞请求成功 (200)');
    const undoData = await undoRes.json();
    assert(undoData.up === 0, '撤销后票数归 0');

    const diskStoreAfterUndo = JSON.parse(fs.readFileSync(STORE_FILE, 'utf-8'));
    assert(!diskStoreAfterUndo.votes?.[testSkill] || diskStoreAfterUndo.votes?.[testSkill]?.up === 0, '磁盘 kv-store.json 中对应条目已清理归零');

    // 4. 测试收藏 (Favorites) 添加
    console.log('\n--- 测试 4: 收藏 (Favorites) 写入与查询 ---');
    const favSkill1 = 'react-best-practices';
    const favSkill2 = 'tailwind-patterns';

    const favRes1 = await fetch(`${BASE_URL}/api/favorites`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: favSkill1, action: 'add' })
    });
    assert(favRes1.status === 200, 'POST /api/favorites 添加收藏成功 (200)');
    const favData1 = await favRes1.json();
    assert(favData1.bookmarked === true && favData1.favorites.includes(favSkill1), `技能 ${favSkill1} 成功标记为已收藏`);

    // 添加第二个技能
    const favRes2 = await fetch(`${BASE_URL}/api/favorites`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: favSkill2, action: 'add' })
    });
    const favData2 = await favRes2.json();
    assert(favData2.favorites.includes(favSkill1) && favData2.favorites.includes(favSkill2), '多个技能均正常保存在收藏列表中');

    // 验证 GET /api/favorites
    const checkFavs = await (await fetch(`${BASE_URL}/api/favorites`)).json();
    assert(checkFavs[favSkill1] === true && checkFavs[favSkill2] === true, 'GET /api/favorites 能够正确读取所有已收藏项');

    // 验证磁盘持久化
    const diskStoreAfterFav = JSON.parse(fs.readFileSync(STORE_FILE, 'utf-8'));
    assert(diskStoreAfterFav.favorites?.[favSkill1] === true && diskStoreAfterFav.favorites?.[favSkill2] === true, '磁盘 kv-store.json 成功持久化收藏数据');

    // 5. 测试取消收藏
    console.log('\n--- 测试 5: 取消收藏 (Remove Favorite) ---');
    const unFavRes = await fetch(`${BASE_URL}/api/favorites`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: favSkill1, action: 'remove' })
    });
    const unFavData = await unFavRes.json();
    assert(unFavData.bookmarked === false && !unFavData.favorites.includes(favSkill1), `技能 ${favSkill1} 成功取消收藏`);
    assert(unFavData.favorites.includes(favSkill2), `其他收藏项 ${favSkill2} 保持完好`);

    // 清理第二个测试收藏项
    await fetch(`${BASE_URL}/api/favorites`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: favSkill2, action: 'remove' })
    });

    // 6. 测试边界容错处理
    console.log('\n--- 测试 6: 异常与边界输入容错 ---');
    const badVoteRes = await fetch(`${BASE_URL}/api/votes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    });
    assert(badVoteRes.status === 400, '缺少技能名称时 POST /api/votes 返回 400');

    const badFavRes = await fetch(`${BASE_URL}/api/favorites`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    });
    assert(badFavRes.status === 400, '缺少技能名称时 POST /api/favorites 返回 400');

    // 7. 测试页面 index.html 中关键逻辑契约与 DOM 挂载
    console.log('\n--- 测试 7: 客户端 DOM 与 API 契约一致性 ---');
    const htmlContent = fs.readFileSync(path.join(process.cwd(), 'src', 'index.html'), 'utf-8');
    assert(htmlContent.includes('/api/votes') && htmlContent.includes('/api/favorites'), 'src/index.html 具备云端 API 同步链路');
    assert(htmlContent.includes('initCloudSync()'), '页面加载时初始化了 initCloudSync');
    assert(htmlContent.includes('ash-votes') && htmlContent.includes('ash-favorites'), '客户端具备 localStorage 离线及即时秒开缓存');

  } catch (err) {
    console.error('测试执行出错:', err);
    failed++;
  }

  console.log(`\n========================================`);
  console.log(`测试完成: 通过 ${passed} 项, 失败 ${failed} 项`);
  console.log(`========================================`);

  if (failed > 0) process.exit(1);
}

runTests();
