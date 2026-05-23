// ═══ SECTION: CONFIG & CONSTANTS ═══

const RANK_THRESHOLDS = [
  { min: 97, rank: 'Azure Legend', cls: 'rank-legend',   color: '#00d4ff' },
  { min: 90, rank: 'Hall of Fame', cls: 'rank-hof',      color: '#bf00ff' },
  { min: 82, rank: 'All-Pro',      cls: 'rank-allpro',   color: '#ff6b00' },
  { min: 74, rank: 'Elite',        cls: 'rank-elite',    color: '#39ff14' },
  { min: 67, rank: 'Veteran',      cls: 'rank-veteran',  color: '#00d4ff' },
  { min: 61, rank: 'Starter',      cls: 'rank-starter',  color: '#aaddff' },
  { min: 57, rank: 'Prospect',     cls: 'rank-prospect', color: '#778899' },
  { min: 0,  rank: 'Rookie',       cls: 'rank-rookie',   color: '#555566' }
];

const DOMAIN_COLORS = {
  NET: '#00d4ff', IDN: '#39ff14', CMP: '#ff6b00', DFC: '#bf00ff', STR: '#ff2244'
};

const STAT_WEIGHTS = { NET: 0.20, IDN: 0.25, CMP: 0.20, DFC: 0.15, STR: 0.20 };

const BASE_XP    = { rookie: 50, veteran: 100, elite: 180 };
const BASE_DELTA = { rookie: 0.4, veteran: 0.8, elite: 1.4 };

const LEVEL_XP = lv => lv * 500;

const CALLOUTS_CORRECT = ['BUCKETS!', 'MONEY!', 'NICE SHOT!', 'SWISH!', 'LOCKED IN!', 'FROM DOWNTOWN!'];

const BADGE_DEFS = {
  BOSS_SLAYER:       { label: '💀 BOSS SLAYER' },
  DOMAIN_MASTER_NET: { label: '🌐 NET MASTER' },
  DOMAIN_MASTER_IDN: { label: '🔑 IDN MASTER' },
  DOMAIN_MASTER_CMP: { label: '🛡 CMP MASTER' },
  DOMAIN_MASTER_DFC: { label: '☁️ DFC MASTER' },
  DOMAIN_MASTER_STR: { label: '🗄 STR MASTER' },
  LEGEND_CARD:       { label: '🏆 LEGEND CARD' },
  BLITZ_50:          { label: '⚡ BLITZ 50' },
  STREAK_10:         { label: '🔥 STREAK 10' }
};

const MODE_LABELS = { career: 'CAREER', blitz: 'BLITZ', bossBattle: 'BOSS', suddenDeath: 'SUDDEN', domainMastery: 'MASTERY' };

const INTRO_CONFIGS = {
  career:        { icon: '🏀', label: 'CAREER',         tagline: 'UNLIMITED PLAY',                   rule: 'XP always on — answer and grow your rating',            color: '#00d4ff' },
  blitz:         { icon: '⚡', label: 'BLITZ',           tagline: '60 SECOND SHOT CLOCK',             rule: 'Answer as many as you can before the buzzer',           color: '#ff6b00' },
  bossBattle:    { icon: '💀', label: 'BOSS BATTLE',     tagline: 'ELITE ONLY · 1 MISS = GAME OVER',  rule: 'Chain 10 flawless elite answers to slay the boss',      color: '#ff2244' },
  suddenDeath:   { icon: '🎯', label: 'SUDDEN DEATH',   tagline: 'ONE AND DONE',                     rule: 'One wrong answer ends your run — no second chances',    color: '#bf00ff' },
  domainMastery: { icon: '🎓', label: 'MASTERY',        tagline: '5 STREAK IN ONE DOMAIN',           rule: 'Stay locked in — 5 correct in a row to win',           color: '#39ff14' },
};

const ACHIEVEMENT_DEFS = {
  FIRST_CORRECT:  { label: '🏀 First Bucket',   desc: 'Answer your first question correctly' },
  STREAK_3:       { label: '🔥 Hat Trick',       desc: '3 correct answers in a row' },
  STREAK_5:       { label: '⚡ On Fire',          desc: '5 correct answers in a row' },
  STREAK_DIME:    { label: '💥 Dime Dropper',    desc: '10 correct answers in a row' },
  LEVEL_5:        { label: '📈 Level 5',         desc: 'Reach player level 5' },
  LEVEL_10:       { label: '🚀 Level 10',        desc: 'Reach player level 10' },
  RANK_STARTER:   { label: '👟 Starter',         desc: 'Reach Starter rank (61+ rating)' },
  RANK_VETERAN:   { label: '🏅 Veteran',         desc: 'Reach Veteran rank (67+ rating)' },
  RANK_ELITE:     { label: '⭐ Elite Rated',     desc: 'Reach Elite rank (74+ rating)' },
  RANK_ALLPRO:    { label: '🌟 All-Pro',         desc: 'Reach All-Pro rank (82+ rating)' },
  RANK_HOF:       { label: '🏆 Hall of Fame',    desc: 'Reach Hall of Fame rank (90+ rating)' },
  RANK_LEGEND:    { label: '👑 Azure Legend',    desc: 'Reach Azure Legend rank (97+ rating)' },
  SHARP_SHOOTER:  { label: '🎯 Sharp Shooter',   desc: '90%+ accuracy after 20+ questions' },
  BLITZ_25:       { label: '⚡ Blitz Scorer',    desc: 'Get 25+ correct in a single Blitz' },
  ANSWERED_100:   { label: '💯 Century',         desc: 'Answer 100 questions total' },
  DAILY_7:        { label: '🗓 Week Streak',     desc: 'Play 7 days in a row' },
};

// ═══ SECTION: STATE OBJECTS ═══

const DEFAULT_PLAYER = () => ({
  version: 1,
  rating: 55,
  stats: { NET: 40, IDN: 40, CMP: 40, DFC: 40, STR: 40 },
  xp: 0, level: 1, rank: 'Rookie',
  highScores: { blitz: 0, suddenDeath: 0, bossBattle: 0 },
  domainMastery: { NET: 0, IDN: 0, CMP: 0, DFC: 0, STR: 0 },
  dailyStreak: 0, lastPlayDate: null, questionsToday: 0,
  badges: [],
  achievements: [],
  usedQuestions: [],
  bestStreak: 0, totalAnswered: 0, totalCorrect: 0
});

let _pendingBadgeAnims = new Set();

let playerState = DEFAULT_PLAYER();

let gameState = {};

function resetGameState(mode, difficulty, domain) {
  gameState = {
    mode, domain: domain || null, difficulty,
    currentQ: null, streak: 0, multiplier: 1, turnovers: 0,
    sessionXp: 0, sessionCorrect: 0,
    blitzTimer: null, blitzRemaining: 60,
    bossQsAnswered: 0, domainStreak: 0,
    startRating: playerState.rating,
    startStats: { ...playerState.stats },
    msSelected: new Set(),
    selectedOrderItems: [],
    selectedMatchLeft: null, matchedPairs: [],
    yesnoAnswers: [],
    blankAnswers: [],
    questionsShown: 0
  };
}

// ═══ SECTION: UTILITIES ═══

function clamp(v, min, max) { return Math.min(Math.max(v, min), max); }

function animateCountUp(el, target, prefix, suffix, duration) {
  prefix = prefix || '+'; suffix = suffix || ' XP'; duration = duration || 900;
  const start = performance.now();
  (function tick(now) {
    const t    = Math.min(1, (now - start) / duration);
    const ease = 1 - Math.pow(1 - t, 3);
    el.textContent = prefix + Math.round(target * ease) + suffix;
    if (t < 1) requestAnimationFrame(tick);
  })(performance.now());
}

function arraysEqual(a, b) {
  return a.length === b.length && a.every((v, i) => v === b[i]);
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ═══ SECTION: STORAGE ═══

function loadPlayer() {
  try {
    const raw = localStorage.getItem('az500_player');
    if (raw) {
      const saved = JSON.parse(raw);
      if (saved.version === 1) {
        playerState = saved;
        playerState.bestStreak    = playerState.bestStreak    ?? 0;
        playerState.totalAnswered = playerState.totalAnswered ?? 0;
        playerState.totalCorrect  = playerState.totalCorrect  ?? 0;
        playerState.achievements  = playerState.achievements  ?? [];
      }
    }
  } catch(e) {}
}

function savePlayer() {
  try { localStorage.setItem('az500_player', JSON.stringify(playerState)); } catch(e) {}
}

function resetPlayer() {
  if (!confirm('Reset your player card? All progress will be lost.')) return;
  localStorage.removeItem('az500_player');
  playerState = DEFAULT_PLAYER();
  savePlayer();
  renderHomeScreen();
}

// ═══ SECTION: DAILY STREAK ═══

function updateDailyStreak() {
  const today = new Date().toISOString().slice(0, 10);
  const last  = playerState.lastPlayDate;
  if (!last) {
    playerState.dailyStreak = 1;
  } else if (last !== today) {
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    playerState.dailyStreak = last === yesterday ? playerState.dailyStreak + 1 : 1;
    playerState.questionsToday = 0;
  }
  playerState.lastPlayDate = today;
  savePlayer();
}

// ═══ SECTION: SCREEN ROUTER ═══

function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active', 'screen-enter'));
  const next = document.getElementById('screen-' + id);
  next.classList.add('active');
  requestAnimationFrame(() => requestAnimationFrame(() => next.classList.add('screen-enter')));
  window.scrollTo(0, 0);
}

// ═══ SECTION: CARD RENDERER & MASTERY RINGS ═══

function getRankInfo(rating) {
  return RANK_THRESHOLDS.find(r => rating >= r.min);
}

function getNextRank(rating) {
  const idx = RANK_THRESHOLDS.findIndex(r => rating >= r.min);
  return idx > 0 ? RANK_THRESHOLDS[idx - 1] : null;
}

function getRankProgress(rating) {
  const idx = RANK_THRESHOLDS.findIndex(r => rating >= r.min);
  if (idx === 0) return 100;
  const cur = RANK_THRESHOLDS[idx];
  const nxt = RANK_THRESHOLDS[idx - 1];
  return Math.round(((rating - cur.min) / (nxt.min - cur.min)) * 100);
}

function drawMasteryRing(canvas, pct, color) {
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height, cx = W / 2, cy = H / 2, r = W / 2 - 3;
  ctx.clearRect(0, 0, W, H);
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.strokeStyle = '#222'; ctx.lineWidth = 2.5; ctx.stroke();
  if (pct > 0) {
    ctx.beginPath();
    ctx.arc(cx, cy, r, -Math.PI / 2, -Math.PI / 2 + (Math.PI * 2 * pct / 100));
    ctx.strokeStyle = color; ctx.lineWidth = 2.5; ctx.lineCap = 'round'; ctx.stroke();
  }
}

function renderPlayerCard() {
  const ri   = getRankInfo(playerState.rating);
  const nxt  = getNextRank(playerState.rating);
  const pct  = getRankProgress(playerState.rating);

  document.getElementById('card-rating').textContent = playerState.rating;
  document.getElementById('card-rating').style.color = ri.color;
  document.getElementById('card-rating').style.textShadow = `0 0 10px ${ri.color}88, 0 0 20px ${ri.color}44`;
  document.getElementById('card-rank-label').textContent = ri.rank.toUpperCase();
  document.getElementById('card-rank-label').style.color = ri.color;
  document.getElementById('card-level').textContent = playerState.level;
  document.getElementById('player-card').className = 'player-card ' + ri.cls;

  const rankBar  = document.getElementById('card-rank-bar');
  const rankNext = document.getElementById('card-rank-next');
  if (rankBar)  { rankBar.style.width = pct + '%'; rankBar.style.background = ri.color; }
  if (rankNext) { rankNext.textContent = nxt ? 'TO ' + nxt.rank.toUpperCase() + ' ›' : ''; }

  ['NET','IDN','CMP','DFC','STR'].forEach(d => {
    document.getElementById('stat-' + d).textContent = Math.floor(playerState.stats[d]);
    const ring = document.querySelector(`.mastery-ring[data-domain="${d}"] canvas`);
    if (ring) drawMasteryRing(ring, playerState.domainMastery[d], DOMAIN_COLORS[d]);
  });

  const xpStart = LEVEL_XP(playerState.level - 1); // total XP at start of current level
  const xpEnd   = LEVEL_XP(playerState.level);      // total XP needed for next level
  const progress = Math.min(100, ((playerState.xp - xpStart) / (xpEnd - xpStart)) * 100);
  document.getElementById('xp-bar-fill').style.width = progress + '%';
  document.getElementById('xp-next-label').textContent = xpEnd + ' XP';

  const badgeEl = document.getElementById('card-badges');
  badgeEl.innerHTML = '';
  playerState.badges.forEach(id => {
    const chip = document.createElement('div');
    chip.className = 'badge-chip';
    chip.textContent = BADGE_DEFS[id] ? BADGE_DEFS[id].label : id;
    badgeEl.appendChild(chip);
  });

  document.getElementById('daily-streak-num').textContent = playerState.dailyStreak;
}

function renderHomeScreen() {
  renderPlayerCard();
  document.getElementById('domain-picker').classList.add('hidden');
  showScreen('home');
}

// ═══ SECTION: QUESTION SELECTOR ═══

// Types suitable for timed Blitz play — fast to read and answer
const BLITZ_TYPES = new Set(['mc', 'yesno', 'blank']);

function selectQuestion(domain, difficulty, fastOnly) {
  let pool = QUESTION_BANK.filter(q =>
    (!domain || q.domain === domain) &&
    (!difficulty || difficulty === 'auto' || q.difficulty === difficulty)
  );

  if (!difficulty || difficulty === 'auto') {
    const r = playerState.rating;
    pool = QUESTION_BANK.filter(q => !domain || q.domain === domain);
    const rand = Math.random();
    if (r < 70)      pool = pool.filter(q => rand < 0.7 ? q.difficulty === 'rookie' : q.difficulty === 'veteran');
    else if (r < 85) pool = pool.filter(q => rand < 0.4 ? q.difficulty === 'rookie' : rand < 0.9 ? q.difficulty === 'veteran' : q.difficulty === 'elite');
    else             pool = pool.filter(q => rand < 0.2 ? q.difficulty === 'veteran' : q.difficulty === 'elite');
    if (pool.length === 0) pool = QUESTION_BANK.filter(q => !domain || q.domain === domain);
  }

  if (fastOnly) {
    const fast = pool.filter(q => BLITZ_TYPES.has(q.type));
    if (fast.length > 0) pool = fast;
  }

  if (pool.length === 0) pool = QUESTION_BANK;

  const unused = pool.filter(q => !playerState.usedQuestions.includes(q.id));
  const src = unused.length > 0 ? unused : pool;
  return src[Math.floor(Math.random() * src.length)];
}

// ═══ SECTION: QUESTION RENDERERS ═══

function renderQuestion(q) {
  gameState.currentQ = q;
  gameState.msSelected = new Set();
  gameState.selectedOrderItems = [];
  gameState.selectedMatchLeft = null;
  gameState.matchedPairs = [];
  gameState.yesnoAnswers = Array(q.statements ? q.statements.length : 0).fill(null);
  gameState.blankAnswers = Array(q.blanks ? q.blanks.length : 0).fill(null);

  document.getElementById('q-domain-badge').textContent = q.domain;
  document.getElementById('q-diff-badge').textContent   = q.difficulty.toUpperCase();
  document.getElementById('q-type-badge').textContent   = q.type.toUpperCase();
  document.getElementById('hud-domain').textContent     = q.domain;
  document.getElementById('question-text').textContent  = q.question;
  document.getElementById('explanation-panel').classList.add('hidden');

  const area = document.getElementById('answer-area');
  area.innerHTML = '';

  if (q.type === 'mc')    renderMC(q, area);
  if (q.type === 'ms')    renderMS(q, area);
  if (q.type === 'order') renderOrder(q, area);
  if (q.type === 'match') renderMatch(q, area);
  if (q.type === 'yesno') renderYesNo(q, area);
  if (q.type === 'blank') renderBlank(q, area);
}

// — MC —
function renderMC(q, area) {
  const letters = ['A','B','C','D'];
  let answered = false;
  q.options.forEach((opt, i) => {
    const btn = document.createElement('button');
    btn.className = 'mc-option';
    btn.innerHTML = `<span class="option-letter">${letters[i]}</span><span>${opt}</span>`;
    btn.addEventListener('click', () => {
      if (answered) return;
      answered = true;
      area.querySelectorAll('.mc-option').forEach((b, bi) => {
        if (bi === q.answer) b.classList.add('correct');
        else if (bi === i) b.classList.add('wrong');
      });
      setTimeout(() => submitAnswer(i === q.answer, q), 250);
    });
    area.appendChild(btn);
  });
}

// — MS —
function renderMS(q, area) {
  const letters = ['A','B','C','D','E'];
  q.options.forEach((opt, i) => {
    const btn = document.createElement('button');
    btn.className = 'ms-option';
    btn.innerHTML = `<span class="option-letter">${letters[i]}</span><span>${opt}</span>`;
    btn.addEventListener('click', () => {
      if (gameState.msSelected.has(i)) { gameState.msSelected.delete(i); btn.classList.remove('selected'); }
      else { gameState.msSelected.add(i); btn.classList.add('selected'); }
      subBtn.disabled = gameState.msSelected.size === 0;
    });
    area.appendChild(btn);
  });
  const subBtn = makeSubmitBtn(() => {
    const sel = [...gameState.msSelected].sort((a,b)=>a-b);
    const ans = [...q.answers].sort((a,b)=>a-b);
    const correct = arraysEqual(sel, ans);
    area.querySelectorAll('.ms-option').forEach((btn, i) => {
      if (q.answers.includes(i)) btn.classList.add('correct');
      else if (gameState.msSelected.has(i)) btn.classList.add('wrong');
    });
    subBtn.disabled = true;
    submitAnswer(correct, q);
  });
  subBtn.disabled = true;
  area.appendChild(subBtn);
}

// — ORDER —
function renderOrder(q, area) {
  const items = shuffle(q.items);
  gameState.selectedOrderItems = [...items];

  const list = document.createElement('div');
  list.className = 'order-list';
  buildOrderList(list, gameState.selectedOrderItems);
  area.appendChild(list);

  const subBtn = makeSubmitBtn(() => {
    const correct = JSON.stringify(gameState.selectedOrderItems) === JSON.stringify(q.items);
    subBtn.disabled = true;
    submitAnswer(correct, q);
  });
  area.appendChild(subBtn);
}

function buildOrderList(list, items) {
  list.innerHTML = '';
  items.forEach((text) => {
    const row = document.createElement('div');
    row.className = 'order-item';
    row.innerHTML = `<span class="drag-handle">⠿</span><span>${text}</span>`;
    attachTouchSort(row, list);
    list.appendChild(row);
  });
}

function attachTouchSort(el, list) {
  let startY = 0, ghost = null;

  el.addEventListener('touchstart', e => {
    startY = e.touches[0].clientY;
    const rect = el.getBoundingClientRect();
    ghost = el.cloneNode(true);
    ghost.style.cssText = `position:fixed;left:${rect.left}px;top:${rect.top}px;width:${rect.width}px;opacity:0.85;z-index:200;pointer-events:none;background:var(--bg-elevated);border:2px solid var(--neon-blue);border-radius:8px;margin:0;`;
    document.body.appendChild(ghost);
    el.classList.add('dragging');
  }, { passive: true });

  el.addEventListener('touchmove', e => {
    e.preventDefault();
    const dy = e.touches[0].clientY - startY;
    ghost.style.transform = `translateY(${dy}px)`;
    const fingerY = e.touches[0].clientY;
    const siblings = [...list.children].filter(c => c !== el);
    siblings.forEach(sib => {
      const r = sib.getBoundingClientRect();
      if (fingerY > r.top && fingerY < r.bottom) {
        const mid = r.top + r.height / 2;
        if (fingerY < mid) list.insertBefore(el, sib);
        else list.insertBefore(sib, el);
        gameState.selectedOrderItems = [...list.children].map(c => c.querySelector('span:last-child').textContent);
      }
    });
  }, { passive: false });

  el.addEventListener('touchend', () => {
    ghost && ghost.remove(); ghost = null;
    el.classList.remove('dragging');
    gameState.selectedOrderItems = [...list.children].map(c => c.querySelector('span:last-child').textContent);
  }, { passive: true });
}

// — MATCH —
function renderMatch(q, area) {
  const left  = shuffle(q.pairs.map((p, i) => ({ text: p.left,  idx: i })));
  const right = shuffle(q.pairs.map((p, i) => ({ text: p.right, idx: i })));

  const grid = document.createElement('div'); grid.className = 'match-area';
  const lCol = document.createElement('div'); lCol.className = 'match-col';
  const rCol = document.createElement('div'); rCol.className = 'match-col';

  left.forEach(item => {
    const el = document.createElement('div');
    el.className = 'match-item'; el.textContent = item.text;
    el.dataset.idx = item.idx; el.dataset.side = 'left';
    el.addEventListener('click', () => onMatchTap(el, lCol, rCol, q));
    lCol.appendChild(el);
  });
  right.forEach(item => {
    const el = document.createElement('div');
    el.className = 'match-item'; el.textContent = item.text;
    el.dataset.idx = item.idx; el.dataset.side = 'right';
    el.addEventListener('click', () => onMatchTap(el, lCol, rCol, q));
    rCol.appendChild(el);
  });

  grid.appendChild(lCol); grid.appendChild(rCol); area.appendChild(grid);
}

function onMatchTap(el, lCol, rCol, q) {
  if (el.classList.contains('matched')) return;
  const side = el.dataset.side;

  if (side === 'left') {
    lCol.querySelectorAll('.match-item').forEach(e => e.classList.remove('selected'));
    el.classList.add('selected');
    gameState.selectedMatchLeft = parseInt(el.dataset.idx);
    return;
  }

  if (gameState.selectedMatchLeft === null) return;
  const rightIdx = parseInt(el.dataset.idx);

  if (rightIdx === gameState.selectedMatchLeft) {
    lCol.querySelectorAll('.match-item').forEach(e => {
      if (parseInt(e.dataset.idx) === gameState.selectedMatchLeft) { e.classList.remove('selected'); e.classList.add('matched'); }
    });
    el.classList.add('matched');
    gameState.matchedPairs.push(rightIdx);
    gameState.selectedMatchLeft = null;
    if (gameState.matchedPairs.length === q.pairs.length) setTimeout(() => submitAnswer(true, q), 300);
  } else {
    lCol.querySelectorAll('.match-item').forEach(e => {
      if (parseInt(e.dataset.idx) === gameState.selectedMatchLeft) { e.classList.remove('selected'); e.classList.add('wrong'); setTimeout(() => e.classList.remove('wrong'), 400); }
    });
    el.classList.add('wrong'); setTimeout(() => el.classList.remove('wrong'), 400);
    gameState.selectedMatchLeft = null;
  }
}

// — YES/NO —
function renderYesNo(q, area) {
  if (q.stem) {
    const stemEl = document.createElement('div');
    stemEl.className = 'yesno-stem'; stemEl.textContent = q.stem;
    area.appendChild(stemEl);
  }

  const rows = document.createElement('div'); rows.className = 'yesno-rows';

  const subBtn = makeSubmitBtn(() => {
    const correct = q.statements.every((s, i) => gameState.yesnoAnswers[i] === s.answer);
    subBtn.disabled = true;
    submitAnswer(correct, q);
  });
  subBtn.disabled = true;

  q.statements.forEach((stmt, i) => {
    const row = document.createElement('div'); row.className = 'yesno-row';
    const txt  = document.createElement('div'); txt.className = 'yesno-statement'; txt.textContent = stmt.text;
    const btns = document.createElement('div'); btns.className = 'yesno-btns';

    const yBtn = document.createElement('button'); yBtn.className = 'yesno-btn'; yBtn.textContent = 'YES';
    const nBtn = document.createElement('button'); nBtn.className = 'yesno-btn'; nBtn.textContent = 'NO';

    yBtn.addEventListener('click', () => { gameState.yesnoAnswers[i] = true;  yBtn.classList.add('active-yes'); nBtn.classList.remove('active-no');  subBtn.disabled = gameState.yesnoAnswers.includes(null); });
    nBtn.addEventListener('click', () => { gameState.yesnoAnswers[i] = false; nBtn.classList.add('active-no');  yBtn.classList.remove('active-yes'); subBtn.disabled = gameState.yesnoAnswers.includes(null); });

    btns.appendChild(yBtn); btns.appendChild(nBtn);
    row.appendChild(txt); row.appendChild(btns);
    rows.appendChild(row);
  });

  area.appendChild(rows);
  area.appendChild(subBtn);
}

// — BLANK —
function renderBlank(q, area) {
  const line = document.createElement('div'); line.className = 'blank-line';
  const subBtn = makeSubmitBtn(() => {
    const correct = q.blanks.every((b, i) => gameState.blankAnswers[i] === b.answer);
    subBtn.disabled = true;
    submitAnswer(correct, q);
  });
  subBtn.disabled = true;

  q.template.split(/(___\[\d+\]___)/).forEach(part => {
    const m = part.match(/___\[(\d+)\]___/);
    if (m) {
      const idx = parseInt(m[1]);
      const sel = document.createElement('select'); sel.className = 'blank-select';
      sel.innerHTML = '<option value="">—</option>';
      q.blanks[idx].options.forEach((opt, oi) => { sel.innerHTML += `<option value="${oi}">${opt}</option>`; });
      sel.addEventListener('change', () => {
        gameState.blankAnswers[idx] = sel.value === '' ? null : parseInt(sel.value);
        subBtn.disabled = gameState.blankAnswers.includes(null);
      });
      line.appendChild(sel);
    } else {
      line.appendChild(document.createTextNode(part));
    }
  });

  area.appendChild(line);
  area.appendChild(subBtn);
}

// — Shared submit button factory —
function makeSubmitBtn(onClick) {
  const btn = document.createElement('button');
  btn.className = 'submit-btn'; btn.textContent = 'SUBMIT';
  btn.addEventListener('click', onClick);
  return btn;
}

// ═══ SECTION: ANSWER VALIDATOR & XP MATH ═══

function calcXp(difficulty, streak) {
  const base = BASE_XP[difficulty] || 50;
  const mult = streak >= 7 ? 4 : streak >= 5 ? 3 : streak >= 3 ? 2 : 1;
  return base * mult;
}

function updateStats(domain, difficulty) {
  const base     = BASE_DELTA[difficulty] || 0.4;
  const cur      = playerState.stats[domain];
  const diminish = Math.max(0.1, 1 - (cur - 40) / 80);
  playerState.stats[domain] = clamp(Math.round((cur + base * diminish) * 10) / 10, 40, 99);
  playerState.rating = Math.round(clamp(
    Object.entries(STAT_WEIGHTS).reduce((s, [d, w]) => s + playerState.stats[d] * w, 0), 55, 99
  ));
}

function updateDomainMastery(domain, correct) {
  const cur = playerState.domainMastery[domain];
  playerState.domainMastery[domain] = clamp(cur * 0.85 + (correct ? 15 : 0), 0, 100);
}

// Called by each renderer after user confirms answer
function submitAnswer(correct, q) {
  // Track used
  if (!playerState.usedQuestions.includes(q.id)) playerState.usedQuestions.push(q.id);
  if (playerState.usedQuestions.length >= QUESTION_BANK.length) playerState.usedQuestions = [];
  playerState.totalAnswered++;
  if (correct) playerState.totalCorrect++;

  if (correct) {
    gameState.streak++;
    if (gameState.streak > playerState.bestStreak) playerState.bestStreak = gameState.streak;
    gameState.multiplier = gameState.streak >= 7 ? 4 : gameState.streak >= 5 ? 3 : gameState.streak >= 3 ? 2 : 1;
    if      (gameState.streak === 3) playSound('streak', 1);
    else if (gameState.streak === 5) playSound('streak', 2);
    else if (gameState.streak === 7) playSound('streak', 3);
    gameState.sessionCorrect++;
    gameState.domainStreak = (gameState.domain === null || q.domain === gameState.domain) ? gameState.domainStreak + 1 : 0;

    const xp = calcXp(q.difficulty, gameState.streak);
    gameState.sessionXp += xp;
    playerState.xp += xp;
    playerState.questionsToday++;

    updateStats(q.domain, q.difficulty);
    updateDomainMastery(q.domain, true);
    checkBadges();

    const prevLevel = playerState.level;
    while (playerState.xp >= LEVEL_XP(playerState.level)) playerState.level++;
    savePlayer();
    updateHUD();
    checkAchievements();

    const didLevelUp = playerState.level > prevLevel;

    // Correct animation, then optional streak banner, then level-up or next question
    correctAnim({ xp, callout: CALLOUTS_CORRECT[Math.floor(Math.random() * CALLOUTS_CORRECT.length)] }, () => {
      if (gameState.streak > 0 && gameState.streak % 3 === 0) {
        streakAnim({ count: gameState.streak }, () => {
          if (didLevelUp) { showLevelUp(); return; }
          handlePostCorrect();
        });
      } else {
        if (didLevelUp) { showLevelUp(); return; }
        handlePostCorrect();
      }
    });

  } else {
    gameState.streak = 0;
    gameState.multiplier = 1;
    gameState.turnovers++;
    gameState.domainStreak = 0;

    updateDomainMastery(q.domain, false);
    savePlayer();
    updateHUD();

    wrongAnim({ explanation: q.explanation, correctAnswer: getCorrectAnswerText(q) }, () => {
      handlePostWrong();
    });
  }
}

function handlePostCorrect() {
  const m = gameState.mode;
  if (m === 'bossBattle') {
    gameState.bossQsAnswered++;
    if (gameState.bossQsAnswered >= 10) {
      awardBadge('BOSS_SLAYER');
      if (playerState.highScores.bossBattle < gameState.bossQsAnswered) {
        playerState.highScores.bossBattle = gameState.bossQsAnswered; savePlayer();
      }
      showResults(); return;
    }
  }
  if (m === 'domainMastery' && gameState.domainStreak >= 5) { showResults(); return; }
  loadNextQuestion();
}

function handlePostWrong() {
  const m = gameState.mode;
  if (m === 'bossBattle') {
    if (gameState.bossQsAnswered > playerState.highScores.bossBattle) {
      playerState.highScores.bossBattle = gameState.bossQsAnswered; savePlayer();
    }
    showBossFail(); return;
  }
  if (m === 'suddenDeath') {
    if (playerState.highScores.suddenDeath < gameState.sessionCorrect) {
      playerState.highScores.suddenDeath = gameState.sessionCorrect; savePlayer();
    }
    showResults(); return;
  }
  loadNextQuestion(); // career, blitz, domainMastery continue after wrong
}

// ═══ SECTION: HUD UPDATER ═══

function updateHUD() {
  const streakEl = document.getElementById('hud-streak-count');
  const multEl   = document.getElementById('hud-multiplier');

  if (gameState.streak > 0) {
    streakEl.classList.remove('streak-pulse'); void streakEl.offsetWidth;
    streakEl.classList.add('streak-pulse');
  }
  if (gameState.multiplier > 1) {
    multEl.classList.remove('mult-pop'); void multEl.offsetWidth;
    multEl.classList.add('mult-pop');
  }

  streakEl.textContent = gameState.streak;
  multEl.textContent   = gameState.multiplier + 'x';

  const qNumEl = document.getElementById('hud-q-num');
  if (qNumEl) qNumEl.textContent = gameState.questionsShown;

  const segs = document.querySelectorAll('.streak-seg');
  const lit = Math.min(gameState.streak, 7);
  segs.forEach((seg, i) => seg.classList.toggle('active', i < lit));
}

// ═══ SECTION: SHOT CLOCK ═══

const CIRCUMFERENCE = 138.2;

function startShotClock() {
  gameState.blitzRemaining = 60;
  document.getElementById('shot-clock-wrap').classList.remove('hidden');
  updateShotClock(60);
  gameState.blitzTimer = setInterval(() => {
    gameState.blitzRemaining--;
    updateShotClock(gameState.blitzRemaining);
    if (gameState.blitzRemaining <= 0) { clearInterval(gameState.blitzTimer); showResults(); }
  }, 1000);
}

function stopShotClock() {
  if (gameState.blitzTimer) clearInterval(gameState.blitzTimer);
  document.getElementById('shot-clock-wrap').classList.add('hidden');
}

function pauseShotClock() {
  if (gameState.blitzTimer) { clearInterval(gameState.blitzTimer); gameState.blitzTimer = null; }
}

function resumeShotClock() {
  if (gameState.mode !== 'blitz' || gameState.blitzTimer) return;
  gameState.blitzTimer = setInterval(() => {
    gameState.blitzRemaining--;
    updateShotClock(gameState.blitzRemaining);
    if (gameState.blitzRemaining <= 0) { clearInterval(gameState.blitzTimer); showResults(); }
  }, 1000);
}

function updateShotClock(rem) {
  const ring = document.getElementById('shot-clock-ring');
  const num  = document.getElementById('shot-clock-num');
  ring.style.strokeDashoffset = (CIRCUMFERENCE * (1 - rem / 60)).toString();
  num.textContent = rem;
  const urgent = rem <= 10;
  ring.classList.toggle('urgent', urgent);
  num.classList.toggle('urgent', urgent);
  if (urgent && rem > 0) playSound('tick');
}

// ═══ SECTION: ANIMATIONS ═══

function getCorrectAnswerText(q) {
  if (q.type === 'mc')    return q.options[q.answer];
  if (q.type === 'ms')    return q.answers.map(i => q.options[i]).join(' · ');
  if (q.type === 'order') return q.items.join(' → ');
  return '';
}

function correctAnim(data, done) {
  document.body.classList.remove('correct-flash'); void document.body.offsetWidth;
  document.body.classList.add('correct-flash');

  const fb     = document.getElementById('overlay-feedback');
  const ft     = document.getElementById('feedback-text');
  const fbRes  = document.getElementById('fb-result');
  ft.style.animation = 'none'; void ft.offsetWidth; ft.style.animation = '';
  fbRes.style.animation = 'none'; void fbRes.offsetWidth; fbRes.style.animation = '';
  ft.className  = 'feedback-text';
  ft.textContent = data.callout || 'NICE!';
  fbRes.className   = 'fb-result fb-result-correct';
  fbRes.textContent = '✓ CORRECT';
  fb.classList.remove('hidden');

  const qw = document.querySelector('.question-wrap');
  if (qw) { qw.classList.remove('correct-glow'); void qw.offsetWidth; qw.classList.add('correct-glow'); }

  const xpEl = document.getElementById('floating-xp');
  xpEl.style.animation = 'none'; void xpEl.offsetWidth; xpEl.style.animation = '';
  xpEl.textContent = '+' + data.xp + ' XP';
  xpEl.className = 'floating-xp animating';

  playSound('correct');
  setTimeout(() => playSound('xp'), 440);

  setTimeout(() => {
    document.body.classList.remove('correct-flash');
    fb.classList.add('hidden');
    xpEl.className = 'floating-xp hidden';
    if (qw) qw.classList.remove('correct-glow');
    done();
  }, 900);
}

function wrongAnim(data, done) {
  document.body.classList.remove('wrong-flash', 'screen-shake'); void document.body.offsetWidth;
  document.body.classList.add('wrong-flash', 'screen-shake');
  setTimeout(() => document.body.classList.remove('wrong-flash', 'screen-shake'), 400);

  const fb    = document.getElementById('overlay-feedback');
  const ft    = document.getElementById('feedback-text');
  const fbRes = document.getElementById('fb-result');
  ft.style.animation = 'none'; void ft.offsetWidth; ft.style.animation = '';
  fbRes.style.animation = 'none'; void fbRes.offsetWidth; fbRes.style.animation = '';
  ft.className  = 'feedback-text wrong-text';
  ft.textContent = 'WRONG';
  fbRes.className   = 'fb-result fb-result-wrong';
  fbRes.textContent = '✗';
  fb.classList.remove('hidden');
  setTimeout(() => fb.classList.add('hidden'), 800);

  playSound('wrong');
  pauseShotClock();

  setTimeout(() => {
    const correctText = data.correctAnswer || '';
    const correctBlock = document.getElementById('exp-correct-block');
    document.getElementById('exp-correct-text').textContent = correctText;
    correctBlock.style.display = correctText ? '' : 'none';
    document.getElementById('exp-verdict').textContent = '✗ WRONG';
    document.getElementById('explanation-text').textContent = data.explanation || '';
    document.getElementById('explanation-panel').classList.remove('hidden');
    document.getElementById('explanation-next-btn').onclick = () => {
      document.getElementById('explanation-panel').classList.add('hidden');
      done();
      resumeShotClock();
    };
  }, 350);
}

function streakAnim(data, done) {
  const overlay = document.getElementById('overlay-streak');
  const banner  = document.getElementById('streak-banner');
  document.getElementById('streak-banner-num').textContent = data.count;
  // Force CSS animation replay
  banner.style.animation = 'none';
  void banner.offsetWidth;
  banner.style.animation = '';
  overlay.classList.remove('hidden');
  setTimeout(() => { overlay.classList.add('hidden'); done(); }, 1800);
}

function showLevelUp() {
  savePlayer();
  document.getElementById('lu-level').textContent = playerState.level;
  document.getElementById('lu-rating').textContent = playerState.rating;
  document.getElementById('lu-rank').textContent   = getRankInfo(playerState.rating).rank.toUpperCase();
  // Force cardPop animation to replay (CSS `forwards` holds final state after first play)
  const card = document.getElementById('level-up-card');
  card.style.animation = 'none'; void card.offsetWidth; card.style.animation = '';
  document.getElementById('overlay-level-up').classList.remove('hidden');
  startConfetti();
  playSound('levelup');
  document.getElementById('lu-tap-btn').onclick = () => {
    document.getElementById('overlay-level-up').classList.add('hidden');
    stopConfetti();
    handlePostCorrect();
  };
}

// ═══ SECTION: CONFETTI ═══

let confettiId = null;

function startConfetti() {
  const canvas = document.getElementById('confetti-canvas');
  canvas.width = window.innerWidth; canvas.height = window.innerHeight;
  const ctx = canvas.getContext('2d');
  const colors = ['#00d4ff','#39ff14','#ff6b00','#bf00ff','#ff2244','#fff'];
  const ps = Array.from({ length: 100 }, () => ({
    x: Math.random() * canvas.width, y: Math.random() * canvas.height - canvas.height,
    r: Math.random() * 5 + 2, d: Math.random() * 100,
    c: colors[Math.floor(Math.random() * colors.length)],
    t: 0, ts: Math.random() * 0.07 + 0.05
  }));
  (function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ps.forEach(p => {
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.c; ctx.fill();
      p.y += Math.cos(p.d) + 2 + p.r / 3;
      p.x += Math.sin(p.t * 0.5) * 2; p.t += p.ts;
      if (p.y > canvas.height) { p.y = -10; p.x = Math.random() * canvas.width; }
    });
    confettiId = requestAnimationFrame(draw);
  })();
}

function stopConfetti() {
  if (confettiId) { cancelAnimationFrame(confettiId); confettiId = null; }
  const c = document.getElementById('confetti-canvas');
  c.getContext('2d').clearRect(0, 0, c.width, c.height);
}

// ═══ SECTION: BOSS FAIL ═══

function showBossFail() {
  stopShotClock();
  document.getElementById('boss-fail-count').textContent = gameState.bossQsAnswered + ' / 10';
  document.getElementById('overlay-boss-fail').classList.remove('hidden');
}

// ═══ SECTION: BADGE SYSTEM ═══

function checkBadges() {
  const p = playerState;
  const candidates = [];
  ['NET','IDN','CMP','DFC','STR'].forEach(d => { if (p.domainMastery[d] >= 80) candidates.push('DOMAIN_MASTER_' + d); });
  if (p.rating >= 97)                  candidates.push('LEGEND_CARD');
  if (gameState.streak >= 10)          candidates.push('STREAK_10');
  if (gameState.mode === 'blitz' && gameState.sessionCorrect >= 50) candidates.push('BLITZ_50');
  candidates.forEach(awardBadge);
}

function awardBadge(id) {
  if (playerState.badges.includes(id)) return;
  playerState.badges.push(id);
  _pendingBadgeAnims.add(id);
  savePlayer();
  playSound('achievement');
  showToast('🏅 BADGE: ' + (BADGE_DEFS[id] ? BADGE_DEFS[id].label : id));
}

function awardAchievement(id) {
  if (!ACHIEVEMENT_DEFS[id]) return;
  if (playerState.achievements.includes(id)) return;
  playerState.achievements.push(id);
  savePlayer();
  playSound('achievement');
  showToast(ACHIEVEMENT_DEFS[id].label + ' UNLOCKED!');
}

function showToast(text) {
  const toast = document.getElementById('badge-toast');
  // Stack: if already visible, queue a brief delay
  const delay = toast.classList.contains('hidden') ? 0 : 2200;
  setTimeout(() => {
    toast.textContent = text;
    toast.classList.remove('hidden');
    clearTimeout(toast._hideTimer);
    toast._hideTimer = setTimeout(() => toast.classList.add('hidden'), 3000);
  }, delay);
}

function checkAchievements() {
  const p = playerState;
  if (p.totalCorrect >= 1)   awardAchievement('FIRST_CORRECT');
  if (gameState.streak >= 3) awardAchievement('STREAK_3');
  if (gameState.streak >= 5) awardAchievement('STREAK_5');
  if (gameState.streak >= 10) awardAchievement('STREAK_DIME');
  if (p.level >= 5)  awardAchievement('LEVEL_5');
  if (p.level >= 10) awardAchievement('LEVEL_10');
  if (p.rating >= 61) awardAchievement('RANK_STARTER');
  if (p.rating >= 67) awardAchievement('RANK_VETERAN');
  if (p.rating >= 74) awardAchievement('RANK_ELITE');
  if (p.rating >= 82) awardAchievement('RANK_ALLPRO');
  if (p.rating >= 90) awardAchievement('RANK_HOF');
  if (p.rating >= 97) awardAchievement('RANK_LEGEND');
  if (p.totalAnswered >= 20 && p.totalCorrect / p.totalAnswered >= 0.9) awardAchievement('SHARP_SHOOTER');
  if (gameState.mode === 'blitz' && gameState.sessionCorrect >= 25) awardAchievement('BLITZ_25');
  if (p.totalAnswered >= 100) awardAchievement('ANSWERED_100');
  if (p.dailyStreak >= 7) awardAchievement('DAILY_7');
}

// ═══ SECTION: RESULTS SCREEN ═══

function showResults() {
  stopShotClock();
  savePlayer();

  const m = gameState.mode;
  const title = m === 'bossBattle' && gameState.bossQsAnswered >= 10 ? 'BOSS SLAIN!'
              : m === 'domainMastery' && gameState.domainStreak >= 5  ? 'DOMAIN MASTERED!'
              : 'FINAL BUZZER';

  document.getElementById('results-title').textContent = title;
  document.getElementById('results-score').textContent = gameState.sessionCorrect;
  animateCountUp(document.getElementById('results-xp'), gameState.sessionXp);

  const statsEl = document.getElementById('results-stats');
  statsEl.innerHTML = '';
  ['NET','IDN','CMP','DFC','STR'].forEach(d => {
    const delta = playerState.stats[d] - gameState.startStats[d];
    if (Math.abs(delta) > 0.09) {
      const row = document.createElement('div'); row.className = 'results-stat-row';
      row.innerHTML = `<span>${d}</span><span class="results-stat-delta">+${delta.toFixed(1)}</span>`;
      statsEl.appendChild(row);
    }
  });

  const hsEl = document.getElementById('results-hs');
  hsEl.textContent = '';
  if (m === 'blitz' && gameState.sessionCorrect > playerState.highScores.blitz) {
    playerState.highScores.blitz = gameState.sessionCorrect; savePlayer();
    hsEl.textContent = '🏆 NEW HIGH SCORE!';
  }
  if (m === 'suddenDeath' && gameState.sessionCorrect >= playerState.highScores.suddenDeath) {
    hsEl.textContent = '🏆 BEST: ' + gameState.sessionCorrect;
  }
  if (m === 'bossBattle' && gameState.bossQsAnswered >= playerState.highScores.bossBattle) {
    hsEl.textContent = '🏆 BOSS DEFEATED!';
  }

  showScreen('results');
}

// ═══ SECTION: GAME STARTER ═══

function showIntro(mode, cb) {
  const cfg = INTRO_CONFIGS[mode];
  if (!cfg) { cb(); return; }

  const modeEl = document.getElementById('intro-mode');
  document.getElementById('intro-icon').textContent    = cfg.icon;
  modeEl.textContent                                   = cfg.label;
  modeEl.style.color                                   = cfg.color;
  modeEl.style.textShadow                              = `0 0 10px ${cfg.color}88, 0 0 24px ${cfg.color}44`;
  const tagEl = document.getElementById('intro-tagline');
  tagEl.textContent  = cfg.tagline;
  tagEl.style.color  = cfg.color;
  tagEl.style.textShadow = `0 0 8px ${cfg.color}66`;
  document.getElementById('intro-rule').textContent    = cfg.rule;

  const card = document.getElementById('intro-card');
  card.style.animation = 'none'; void card.offsetWidth; card.style.animation = '';

  const overlay = document.getElementById('overlay-intro');
  overlay.classList.remove('hidden');
  overlay.addEventListener('click', function dismiss() {
    overlay.classList.add('hidden');
    overlay.removeEventListener('click', dismiss);
    cb();
  });
}

function startGame(mode, difficulty, domain) {
  resetGameState(mode, difficulty, domain);
  stopShotClock();
  document.getElementById('overlay-boss-fail').classList.add('hidden');
  document.getElementById('overlay-level-up').classList.add('hidden');
  showScreen('game');
  document.getElementById('hud-mode').textContent = MODE_LABELS[mode] || mode.toUpperCase();
  loadNextQuestion();
  showIntro(mode, () => {
    if (mode === 'bossBattle') playSound('boss');
    if (mode === 'blitz') startShotClock();
  });
}

function loadNextQuestion() {
  gameState.questionsShown++;
  const diff     = gameState.mode === 'bossBattle' ? 'elite' : gameState.difficulty;
  const fastOnly = gameState.mode === 'blitz';
  renderQuestion(selectQuestion(gameState.domain, diff, fastOnly));
  updateHUD();
}

// ═══ SECTION: PLAYER PROFILE ═══

const DOMAIN_FULL = { NET: 'Networking', IDN: 'Identity', CMP: 'Compute', DFC: 'Defender', STR: 'Storage' };

function openProfile() {
  const ri  = getRankInfo(playerState.rating);
  const nxt = getNextRank(playerState.rating);
  const pct = getRankProgress(playerState.rating);

  document.getElementById('profile-rank-badge').textContent  = ri.rank.toUpperCase();
  document.getElementById('profile-rank-badge').style.color  = ri.color;
  document.getElementById('profile-rating').textContent      = playerState.rating;
  document.getElementById('profile-rating').style.color      = ri.color;
  document.getElementById('profile-rating').style.textShadow = `0 0 10px ${ri.color}88, 0 0 20px ${ri.color}44`;
  document.getElementById('profile-level').textContent       = playerState.level;

  const fill  = document.getElementById('profile-rank-fill');
  const label = document.getElementById('profile-rank-next-label');
  if (fill)  { fill.style.width = pct + '%'; fill.style.background = ri.color; }
  if (label) { label.textContent = nxt ? pct + '% → ' + nxt.rank.toUpperCase() : 'MAX RANK'; }
  document.getElementById('profile-xp').textContent          = playerState.xp.toLocaleString();
  document.getElementById('profile-streak').textContent      = gameState.streak || 0;
  document.getElementById('profile-best-streak').textContent = playerState.bestStreak;
  document.getElementById('profile-answered').textContent    = playerState.totalAnswered;

  const acc = playerState.totalAnswered > 0
    ? Math.round((playerState.totalCorrect / playerState.totalAnswered) * 100) + '%'
    : '—';
  document.getElementById('profile-accuracy').textContent = acc;

  const hs = playerState.highScores;
  const modeBest = [
    { name: 'BLITZ',   score: hs.blitz },
    { name: 'S.DEATH', score: hs.suddenDeath },
    { name: 'BOSS',    score: hs.bossBattle }
  ].reduce((a, b) => a.score >= b.score ? a : b);
  document.getElementById('profile-best-mode').textContent = modeBest.score > 0 ? modeBest.name : '—';
  document.getElementById('profile-hs-blitz').textContent  = hs.blitz;
  document.getElementById('profile-hs-sudden').textContent = hs.suddenDeath;
  document.getElementById('profile-hs-boss').textContent   = hs.bossBattle;

  const domsEl = document.getElementById('profile-domains');
  domsEl.innerHTML = '';
  ['NET','IDN','CMP','DFC','STR'].forEach(d => {
    const color   = DOMAIN_COLORS[d];
    const stat    = Math.floor(playerState.stats[d]);
    const mastery = Math.round(playerState.domainMastery[d]);
    const row = document.createElement('div');
    row.className = 'profile-domain-row';
    row.innerHTML = `
      <span class="pdr-code" style="color:${color}">${d}</span>
      <span class="pdr-stat">${stat}</span>
      <div class="pdr-track"><div class="pdr-fill" style="width:${mastery}%;background:${color}"></div></div>
      <span class="pdr-pct" style="color:${color}">${mastery}%</span>`;
    domsEl.appendChild(row);
  });

  const badgesEl = document.getElementById('profile-badges');
  const badgesLabel = document.getElementById('profile-badges-label');
  badgesLabel.style.display = playerState.badges.length ? '' : 'none';
  badgesEl.innerHTML = '';
  playerState.badges.forEach(id => {
    const chip = document.createElement('div');
    const isNew = _pendingBadgeAnims.has(id);
    chip.className = 'profile-badge-chip' + (isNew ? ' badge-new' : '');
    chip.textContent = BADGE_DEFS[id] ? BADGE_DEFS[id].label : id;
    badgesEl.appendChild(chip);
    if (isNew) _pendingBadgeAnims.delete(id);
  });

  const achEl = document.getElementById('profile-achievements');
  if (achEl) {
    achEl.innerHTML = '';
    Object.entries(ACHIEVEMENT_DEFS).forEach(([id, def]) => {
      const unlocked = playerState.achievements.includes(id);
      const chip = document.createElement('div');
      chip.className = 'achievement-chip ' + (unlocked ? 'unlocked' : 'locked');
      const [icon, ...rest] = def.label.split(' ');
      chip.innerHTML =
        `<span class="ach-icon">${icon}</span>` +
        `<span class="ach-info">` +
          `<div class="ach-label">${rest.join(' ')}</div>` +
          `<div class="ach-desc">${def.desc}</div>` +
        `</span>` +
        (unlocked ? `<span class="ach-check">✓</span>` : '');
      achEl.appendChild(chip);
    });
  }

  const toggleBtn = document.getElementById('sound-toggle');
  if (toggleBtn) {
    toggleBtn.textContent = SoundManager.enabled ? 'ON' : 'OFF';
    toggleBtn.classList.toggle('active', SoundManager.enabled);
  }

  const panel = document.getElementById('profile-panel');
  panel.classList.remove('closing');
  panel.scrollTop = 0;
  document.getElementById('overlay-profile').classList.remove('hidden');
}

function closeProfile() {
  const panel = document.getElementById('profile-panel');
  panel.classList.add('closing');
  panel.addEventListener('animationend', () => {
    document.getElementById('overlay-profile').classList.add('hidden');
    panel.classList.remove('closing');
  }, { once: true });
}

// ═══ SECTION: EVENT LISTENERS & INIT ═══

function initApp() {
  SoundManager.loadPref();
  loadPlayer();
  updateDailyStreak();

  // Global tap sound — fires on every button press before other handlers
  // Excluded: sound-toggle itself (handled separately to avoid double-firing)
  document.addEventListener('click', e => {
    const btn = e.target.closest('button');
    if (btn && btn.id !== 'sound-toggle') playSound('tap');
  }, { capture: true });

  // Mode buttons
  document.querySelectorAll('.mode-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const mode = btn.dataset.mode;
      if (mode === 'domainMastery') {
        document.getElementById('domain-picker').classList.toggle('hidden');
        return;
      }
      const diff = document.querySelector('.diff-btn.active')?.dataset.diff || 'auto';
      startGame(mode, diff, null);
    });
  });

  // Domain picker
  document.querySelectorAll('.domain-pick-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.domain-pick-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const diff = document.querySelector('.diff-btn.active')?.dataset.diff || 'auto';
      document.getElementById('domain-picker').classList.add('hidden');
      startGame('domainMastery', diff, btn.dataset.domain);
    });
  });

  // Difficulty
  document.querySelectorAll('.diff-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.diff-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });

  // HUD home
  document.getElementById('hud-home-btn').addEventListener('click', () => {
    const hasActiveRun = gameState.streak > 0 || gameState.sessionCorrect > 0;
    if (hasActiveRun && !confirm('Quit this run? Your current streak and progress will end.')) return;
    stopShotClock();
    savePlayer();
    renderHomeScreen();
  });

  // Results home
  document.getElementById('results-home-btn').addEventListener('click', renderHomeScreen);

  // Boss fail
  document.getElementById('boss-retry-btn').addEventListener('click', () => {
    document.getElementById('overlay-boss-fail').classList.add('hidden');
    startGame('bossBattle', 'elite', null);
  });
  document.getElementById('boss-home-btn').addEventListener('click', () => {
    document.getElementById('overlay-boss-fail').classList.add('hidden');
    renderHomeScreen();
  });

  // Reset (lives in profile overlay)
  document.getElementById('profile-reset-btn').addEventListener('click', () => {
    document.getElementById('overlay-profile').classList.add('hidden');
    resetPlayer();
  });

  // Player profile
  document.getElementById('profile-trigger').addEventListener('click', openProfile);
  document.getElementById('profile-close').addEventListener('click', closeProfile);
  document.getElementById('overlay-profile').addEventListener('click', e => {
    if (e.target === document.getElementById('overlay-profile')) closeProfile();
  });

  // Sound toggle
  document.getElementById('sound-toggle').addEventListener('click', () => {
    if (SoundManager.enabled) {
      SoundManager.disable();
    } else {
      SoundManager.enable();
      setTimeout(() => playSound('tap'), 20); // first sound after enabling
    }
    const btn = document.getElementById('sound-toggle');
    btn.textContent = SoundManager.enabled ? 'ON' : 'OFF';
    btn.classList.toggle('active', SoundManager.enabled);
  });

  renderHomeScreen();
}

document.addEventListener('DOMContentLoaded', initApp);
