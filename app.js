// ═══ SECTION: CONFIG & CONSTANTS ═══

const RANK_THRESHOLDS = [
  { min: 97, rank: 'Legend',    cls: 'rank-legend' },
  { min: 93, rank: 'Superstar', cls: 'rank-superstar' },
  { min: 85, rank: 'Veteran',   cls: 'rank-veteran' },
  { min: 75, rank: 'All-Star',  cls: 'rank-allstar' },
  { min: 65, rank: 'Pro',       cls: 'rank-pro' },
  { min: 0,  rank: 'Rookie',    cls: 'rank-rookie' }
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
  usedQuestions: [],
  bestStreak: 0, totalAnswered: 0, totalCorrect: 0
});

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
  const ri = getRankInfo(playerState.rating);
  document.getElementById('card-rating').textContent = playerState.rating;
  document.getElementById('card-rank-label').textContent = ri.rank.toUpperCase();
  document.getElementById('card-level').textContent = playerState.level;
  document.getElementById('player-card').className = 'player-card ' + ri.cls;

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

function selectQuestion(domain, difficulty) {
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

    wrongAnim({ explanation: q.explanation }, () => {
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

function updateShotClock(rem) {
  const ring = document.getElementById('shot-clock-ring');
  const num  = document.getElementById('shot-clock-num');
  ring.style.strokeDashoffset = (CIRCUMFERENCE * (1 - rem / 60)).toString();
  num.textContent = rem;
  const urgent = rem <= 10;
  ring.classList.toggle('urgent', urgent);
  num.classList.toggle('urgent', urgent);
}

// ═══ SECTION: ANIMATIONS ═══

function correctAnim(data, done) {
  document.body.classList.remove('correct-flash'); void document.body.offsetWidth;
  document.body.classList.add('correct-flash');

  const fb = document.getElementById('overlay-feedback');
  const ft = document.getElementById('feedback-text');
  // Force animation replay
  ft.style.animation = 'none'; void ft.offsetWidth; ft.style.animation = '';
  ft.className = 'feedback-text';
  ft.textContent = data.callout || 'NICE!';
  fb.classList.remove('hidden');

  const xpEl = document.getElementById('floating-xp');
  xpEl.style.animation = 'none'; void xpEl.offsetWidth; xpEl.style.animation = '';
  xpEl.textContent = '+' + data.xp + ' XP';
  xpEl.className = 'floating-xp animating';

  setTimeout(() => {
    document.body.classList.remove('correct-flash');
    fb.classList.add('hidden');
    xpEl.className = 'floating-xp hidden';
    done();
  }, 900);
}

function wrongAnim(data, done) {
  document.body.classList.remove('wrong-flash', 'screen-shake'); void document.body.offsetWidth;
  document.body.classList.add('wrong-flash', 'screen-shake');
  setTimeout(() => document.body.classList.remove('wrong-flash', 'screen-shake'), 400);

  document.getElementById('explanation-text').textContent = data.explanation || '';
  document.getElementById('explanation-panel').classList.remove('hidden');
  document.getElementById('explanation-next-btn').onclick = () => {
    document.getElementById('explanation-panel').classList.add('hidden');
    done();
  };
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
  savePlayer();
  const toast = document.getElementById('badge-toast');
  toast.textContent = '🏅 BADGE: ' + (BADGE_DEFS[id] ? BADGE_DEFS[id].label : id);
  toast.classList.remove('hidden');
  setTimeout(() => toast.classList.add('hidden'), 3000);
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

function startGame(mode, difficulty, domain) {
  resetGameState(mode, difficulty, domain);
  stopShotClock();
  document.getElementById('overlay-boss-fail').classList.add('hidden');
  document.getElementById('overlay-level-up').classList.add('hidden');
  showScreen('game');
  document.getElementById('hud-mode').textContent = MODE_LABELS[mode] || mode.toUpperCase();
  if (mode === 'blitz') startShotClock();
  loadNextQuestion();
}

function loadNextQuestion() {
  gameState.questionsShown++;
  const diff = gameState.mode === 'bossBattle' ? 'elite' : gameState.difficulty;
  renderQuestion(selectQuestion(gameState.domain, diff));
  updateHUD();
}

// ═══ SECTION: PLAYER PROFILE ═══

const DOMAIN_FULL = { NET: 'Networking', IDN: 'Identity', CMP: 'Compute', DFC: 'Defender', STR: 'Storage' };

function openProfile() {
  const ri = getRankInfo(playerState.rating);

  document.getElementById('profile-rank-badge').textContent  = ri.rank.toUpperCase();
  document.getElementById('profile-rating').textContent      = playerState.rating;
  document.getElementById('profile-level').textContent       = playerState.level;
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
    chip.className = 'profile-badge-chip';
    chip.textContent = BADGE_DEFS[id] ? BADGE_DEFS[id].label : id;
    badgesEl.appendChild(chip);
  });

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
  loadPlayer();
  updateDailyStreak();

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

  renderHomeScreen();
}

document.addEventListener('DOMContentLoaded', initApp);
