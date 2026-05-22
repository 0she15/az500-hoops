/* ═══════════════════════════════════════════
   app.js — navigation + all section modules
═══════════════════════════════════════════ */

/* ── Utility ── */
const fmt = n => '$' + Math.round(n).toLocaleString();
const pct = (a, b) => b === 0 ? 0 : Math.min(100, Math.round((a / b) * 100));

function showToast(msg, duration = 2500) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.classList.remove('show'), duration);
}

function openModal(id) {
  const el = document.getElementById(id);
  if (el) {
    el.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
}

function closeModal(id) {
  const el = document.getElementById(id);
  if (el) {
    el.classList.remove('open');
    document.body.style.overflow = '';
  }
}

function confirm(title, msg, onOk) {
  document.getElementById('confirm-title').textContent = title;
  document.getElementById('confirm-msg').textContent = msg;
  openModal('confirm-modal-overlay');
  const ok = document.getElementById('confirm-ok-btn');
  const cancel = document.getElementById('confirm-cancel-btn');
  const cleanup = () => { closeModal('confirm-modal-overlay'); };
  ok.onclick = () => { cleanup(); onOk(); };
  cancel.onclick = cleanup;
}

/* ═══════════════════════════════════════════
   ROUTER
═══════════════════════════════════════════ */
const Router = {
  current: 'dashboard',

  init() {
    const settings = Store.get('lup_settings') || {};
    this.current = settings.lastSection || 'dashboard';
    this.navigate(this.current, false);
  },

  navigate(section, save = true) {
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));

    const sec = document.getElementById(`sec-${section}`);
    const btn = document.querySelector(`[data-section="${section}"]`);
    if (sec) sec.classList.add('active');
    if (btn) btn.classList.add('active');

    this.current = section;
    if (save) {
      const settings = Store.get('lup_settings') || {};
      settings.lastSection = section;
      Store.set('lup_settings', settings);
    }

    switch (section) {
      case 'dashboard':  Dashboard.render(); break;
      case 'paychecks':  Paychecks.render(); break;
      case 'purchases':  Purchases.render(); break;
      case 'vision':     VisionBoard.render(); break;
      case 'weekly':     Weekly.render(); break;
      case 'timeline':   Timeline.render(); break;
      case 'rules':      Rules.render(); break;
      case 'settings':   Settings.render(); break;
    }
  }
};

/* ═══════════════════════════════════════════
   DASHBOARD
═══════════════════════════════════════════ */
const Dashboard = {
  render() {
    const savings = Store.get('lup_savings') || {};
    const nov = savings.novFund || 0;
    const lr  = savings.livingRoomFund || 0;
    const total = nov + lr;
    const novGoal = 4700, lrGoal = 3100, totalGoal = 7800;

    document.getElementById('dash-total-saved').textContent = fmt(total);
    document.getElementById('dash-remaining').textContent   = fmt(Math.max(0, totalGoal - total));
    document.getElementById('dash-percent').textContent     = pct(total, totalGoal) + '%';

    this._animateBar('dash-overall-fill', pct(total, totalGoal));

    document.getElementById('nov-saved').textContent     = fmt(nov);
    document.getElementById('nov-remaining').textContent = fmt(Math.max(0, novGoal - nov));
    document.getElementById('nov-pct').textContent       = pct(nov, novGoal) + '%';
    this._animateBar('nov-fill', pct(nov, novGoal));

    document.getElementById('lr-saved').textContent      = fmt(lr);
    document.getElementById('lr-remaining').textContent  = fmt(Math.max(0, lrGoal - lr));
    document.getElementById('lr-pct').textContent        = pct(lr, lrGoal) + '%';
    this._animateBar('lr-fill', pct(lr, lrGoal));

    document.getElementById('total-saved').textContent     = fmt(total);
    document.getElementById('total-remaining').textContent = fmt(Math.max(0, totalGoal - total));
    document.getElementById('total-pct').textContent       = pct(total, totalGoal) + '%';
    this._animateBar('total-fill', pct(total, totalGoal));

    const novInput = document.getElementById('nov-input');
    const lrInput  = document.getElementById('lr-input');
    if (novInput) novInput.value = nov || '';
    if (lrInput)  lrInput.value  = lr  || '';
  },

  _animateBar(id, targetPct) {
    const el = document.getElementById(id);
    if (!el) return;
    el.style.width = '0%';
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        el.style.width = targetPct + '%';
      });
    });
  },

  updateSavings(field) {
    const inputId = field === 'novFund' ? 'nov-input' : 'lr-input';
    const input = document.getElementById(inputId);
    if (!input) return;
    const val = parseFloat(input.value) || 0;
    const savings = Store.get('lup_savings') || {};
    savings[field] = Math.max(0, val);
    savings.lastUpdated = new Date().toISOString();
    Store.set('lup_savings', savings);
    this.render();
    showToast('Savings updated');
  }
};

/* ═══════════════════════════════════════════
   PAYCHECKS
═══════════════════════════════════════════ */
const Paychecks = {
  SEG_COLORS: [
    '#2D5016', '#3D6B22', '#4A7A2A', '#6B8F3A',
    '#8B6F47', '#A0845C', '#6B1F1F', '#8B3030',
    '#D4C4A8', '#C0AD93'
  ],

  render() {
    this._renderCheck('check1');
    this._renderCheck('check2');
  },

  _renderCheck(checkId) {
    const data = Store.get('lup_paychecks') || {};
    const check = data[checkId];
    if (!check) return;
    const income = check.income || 3000;
    const rowsEl = document.getElementById(`${checkId}-rows`);
    const remainderEl = document.getElementById(`${checkId}-remainder`);
    const barEl = document.getElementById(`${checkId}-bar`);

    let rows = check.allocations;
    const isCheck2 = checkId === 'check2';

    rowsEl.innerHTML = rows.map((row, i) => `
      <div class="paycheck-row">
        <span class="paycheck-row-label">
          ${row.locked ? `<svg class="lock-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>` : ''}
          ${row.label}
        </span>
        <input
          type="number"
          class="paycheck-row-input"
          value="${row.amount}"
          data-check="${checkId}"
          data-idx="${i}"
          ${row.locked ? 'disabled' : ''}
          min="0"
          max="${income}"
          aria-label="${row.label} amount"
        >
      </div>
    `).join('');

    this._updateRemainder(checkId);

    const inputs = rowsEl.querySelectorAll('.paycheck-row-input:not([disabled])');
    inputs.forEach(inp => {
      inp.addEventListener('change', () => {
        const idx = parseInt(inp.dataset.idx);
        const val = parseFloat(inp.value) || 0;
        const pcData = Store.get('lup_paychecks') || {};
        pcData[checkId].allocations[idx].amount = Math.max(0, val);
        Store.set('lup_paychecks', pcData);
        this._updateRemainder(checkId);
      });
    });
  },

  _updateRemainder(checkId) {
    const data = Store.get('lup_paychecks') || {};
    const check = data[checkId];
    if (!check) return;
    const income = check.income || 3000;
    const isCheck2 = checkId === 'check2';
    const rows = check.allocations;
    const total = rows.reduce((s, r) => s + (r.amount || 0), 0);
    const remainder = income - total;

    const remainderEl = document.getElementById(`${checkId}-remainder`);
    const barEl = document.getElementById(`${checkId}-bar`);

    if (remainderEl) {
      remainderEl.textContent = fmt(remainder);
      remainderEl.classList.toggle('negative', remainder < 0);
    }

    if (barEl) {
      const colors = this.SEG_COLORS;
      barEl.innerHTML = rows.map((row, i) => {
        const w = income > 0 ? Math.max(0, Math.min(100, (row.amount / income) * 100)) : 0;
        return `<div class="paycheck-seg" style="width:${w}%;background:${colors[i % colors.length]}" title="${row.label}: ${fmt(row.amount)}"></div>`;
      }).join('');
    }
  },

  logPaycheck(checkNum) {
    const ts = new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    showToast(`Check ${checkNum} logged at ${ts}`);
  }
};

/* ═══════════════════════════════════════════
   PURCHASES
═══════════════════════════════════════════ */
const Purchases = {
  activeFilter: 'all',
  activeSort: 'priority',

  render() {
    this._renderList();
    this._bindFilterButtons();
    this._bindSort();
  },

  _renderList() {
    const list = document.getElementById('purchases-list');
    if (!list) return;
    let items = Store.get('lup_purchases') || [];

    if (this.activeFilter !== 'all') {
      items = items.filter(i => i.status === this.activeFilter);
    }

    const priorityOrder = { High: 0, Medium: 1, Low: 2 };
    const monthOrder = ['January','February','March','April','May','June',
                        'July','August','September','October','November','December'];

    if (this.activeSort === 'priority') {
      items.sort((a, b) => (priorityOrder[a.priority] ?? 9) - (priorityOrder[b.priority] ?? 9));
    } else if (this.activeSort === 'cost') {
      items.sort((a, b) => a.estimatedCost - b.estimatedCost);
    } else if (this.activeSort === 'month') {
      items.sort((a, b) => {
        const getIdx = m => {
          const parts = (m || '').split(' ');
          return monthOrder.indexOf(parts[0]) + (parseInt(parts[1]) || 0) * 12;
        };
        return getIdx(a.targetMonth) - getIdx(b.targetMonth);
      });
    }

    if (items.length === 0) {
      list.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">🛍️</div>
          <div class="empty-state-title">No items here yet</div>
          <div class="empty-state-msg">Tap the + button to add your first purchase goal.</div>
        </div>`;
      return;
    }

    list.innerHTML = items.map(item => `
      <div class="purchase-card" data-id="${item.id}" data-status="${item.status}">
        <div class="purchase-top">
          <div class="purchase-name">${this._esc(item.name)}</div>
          <div class="purchase-cost">${fmt(item.estimatedCost)}</div>
        </div>
        <div class="purchase-badges">
          <span class="badge badge-priority-${item.priority.toLowerCase()}">${item.priority}</span>
          <button class="badge badge-status badge-status-${item.status}" data-action="cycle-status" data-id="${item.id}">
            ${this._statusLabel(item.status)}
          </button>
        </div>
        ${item.targetMonth ? `<div class="purchase-month">📅 ${this._esc(item.targetMonth)}</div>` : ''}
        ${item.notes ? `<div class="purchase-notes">${this._esc(item.notes)}</div>` : ''}
        ${item.link ? `<div class="purchase-notes"><a href="${this._esc(item.link)}" target="_blank" rel="noopener noreferrer">View item →</a></div>` : ''}
        <div class="purchase-actions">
          <button class="purchase-action-btn edit" data-action="edit-purchase" data-id="${item.id}">Edit</button>
          <button class="purchase-action-btn delete" data-action="delete-purchase" data-id="${item.id}">Delete</button>
        </div>
      </div>
    `).join('');
  },

  _esc(s) {
    return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  },

  _statusLabel(s) {
    return { wishlist: '⋯ Wishlist', saving: '💰 Saving', purchased: '✓ Purchased', delivered: '📦 Delivered' }[s] || s;
  },

  _bindFilterButtons() {
    document.querySelectorAll('.filter-btn').forEach(btn => {
      btn.onclick = () => {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.activeFilter = btn.dataset.filter;
        this._renderList();
      };
    });
  },

  _bindSort() {
    const sel = document.getElementById('purchases-sort');
    if (sel) {
      sel.value = this.activeSort;
      sel.onchange = () => {
        this.activeSort = sel.value;
        this._renderList();
      };
    }
  },

  cycleStatus(id) {
    const items = Store.get('lup_purchases') || [];
    const cycle = ['wishlist', 'saving', 'purchased', 'delivered'];
    const item = items.find(i => i.id === id);
    if (!item) return;
    const idx = cycle.indexOf(item.status);
    item.status = cycle[(idx + 1) % cycle.length];
    Store.set('lup_purchases', items);
    this._renderList();
    showToast(`Status: ${this._statusLabel(item.status)}`);
  },

  delete(id) {
    confirm('Delete Item', 'Remove this item from your tracker? This cannot be undone.', () => {
      const items = (Store.get('lup_purchases') || []).filter(i => i.id !== id);
      Store.set('lup_purchases', items);
      this._renderList();
      showToast('Item removed');
    });
  },

  openAddModal() {
    document.getElementById('purchase-edit-id').value = '';
    document.getElementById('purchase-modal-title').textContent = 'Add Purchase Item';
    document.getElementById('pur-name').value = '';
    document.getElementById('pur-cost').value = '';
    document.getElementById('pur-month').value = '';
    document.getElementById('pur-priority').value = 'High';
    document.getElementById('pur-status').value = 'wishlist';
    document.getElementById('pur-link').value = '';
    document.getElementById('pur-notes').value = '';
    openModal('purchase-modal-overlay');
  },

  openEditModal(id) {
    const items = Store.get('lup_purchases') || [];
    const item = items.find(i => i.id === id);
    if (!item) return;
    document.getElementById('purchase-edit-id').value = item.id;
    document.getElementById('purchase-modal-title').textContent = 'Edit Item';
    document.getElementById('pur-name').value = item.name || '';
    document.getElementById('pur-cost').value = item.estimatedCost || '';
    document.getElementById('pur-month').value = item.targetMonth || '';
    document.getElementById('pur-priority').value = item.priority || 'High';
    document.getElementById('pur-status').value = item.status || 'wishlist';
    document.getElementById('pur-link').value = item.link || '';
    document.getElementById('pur-notes').value = item.notes || '';
    openModal('purchase-modal-overlay');
  },

  save() {
    const id = document.getElementById('purchase-edit-id').value;
    const name = document.getElementById('pur-name').value.trim();
    if (!name) { showToast('Please enter an item name'); return; }

    const item = {
      id: id || uuid(),
      name,
      estimatedCost: parseFloat(document.getElementById('pur-cost').value) || 0,
      targetMonth:   document.getElementById('pur-month').value.trim(),
      priority:      document.getElementById('pur-priority').value,
      status:        document.getElementById('pur-status').value,
      link:          document.getElementById('pur-link').value.trim(),
      notes:         document.getElementById('pur-notes').value.trim(),
      createdAt:     Date.now(),
      order:         0
    };

    let items = Store.get('lup_purchases') || [];
    if (id) {
      const idx = items.findIndex(i => i.id === id);
      if (idx >= 0) { item.createdAt = items[idx].createdAt; items[idx] = item; }
      else items.push(item);
    } else {
      item.order = items.length;
      items.push(item);
    }
    Store.set('lup_purchases', items);
    closeModal('purchase-modal-overlay');
    this._renderList();
    showToast(id ? 'Item updated' : 'Item added');
  }
};

/* ═══════════════════════════════════════════
   VISION BOARD
═══════════════════════════════════════════ */
const VisionBoard = {
  activeCategory: 'coffee-table',

  render() {
    this._updateStorageIndicator();
    this._renderGrid();
    this._bindTabs();
  },

  _renderGrid() {
    const grid = document.getElementById('vision-grid');
    if (!grid) return;
    const images = Store.getImages(this.activeCategory);
    if (images.length === 0) {
      grid.innerHTML = `<div class="vision-empty" style="column-span:all">No images yet — tap "Add Photo" to get inspired.</div>`;
      return;
    }
    grid.innerHTML = images.map(img => `
      <div class="vision-card" data-id="${img.id}">
        <img src="${img.dataUrl}" alt="${img.caption || 'Vision board image'}" loading="lazy">
        <div class="vision-card-footer">
          <span class="vision-caption">${img.caption || ''}</span>
          <button class="vision-delete-btn" data-action="delete-image" data-id="${img.id}" aria-label="Delete image">×</button>
        </div>
      </div>
    `).join('');
  },

  _bindTabs() {
    document.querySelectorAll('.vision-tab').forEach(tab => {
      tab.onclick = () => {
        document.querySelectorAll('.vision-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        this.activeCategory = tab.dataset.cat;
        this._renderGrid();
      };
    });
  },

  _updateStorageIndicator() {
    const el = document.getElementById('vision-storage');
    if (!el) return;
    const images = Store.get('lup_vision') || [];
    el.textContent = `${images.length} / 25 images stored`;
  },

  addPhoto() {
    const input = document.getElementById('vision-file-input');
    if (input) input.click();
  },

  handleFile(file) {
    if (!file || !file.type.startsWith('image/')) return;
    Store.compressImage(file, dataUrl => {
      try {
        Store.saveImage(dataUrl, this.activeCategory, file.name.replace(/\.[^.]+$/, ''));
        this.render();
        showToast('Photo added');
      } catch(e) {
        showToast(e.message || 'Could not save image');
      }
    });
  },

  addUrl() {
    const input = document.getElementById('vision-url-input');
    const url = (input && input.value.trim()) || '';
    if (!url) return;
    try {
      Store.saveImage(url, this.activeCategory, '');
      input.value = '';
      this.render();
      showToast('Image added');
    } catch(e) {
      showToast(e.message || 'Could not save image');
    }
  },

  deleteImage(id) {
    Store.deleteImage(id);
    this.render();
    showToast('Image removed');
  }
};

/* ═══════════════════════════════════════════
   WEEKLY RESET
═══════════════════════════════════════════ */
const Weekly = {
  render() {
    this.checkRollover();
    const data = Store.get('lup_weekly') || {};
    const streak = data.streak || 0;
    const tasks = data.tasks || [];

    document.getElementById('weekly-streak').textContent = streak;

    const tasksEl = document.getElementById('weekly-tasks');
    if (tasksEl) {
      tasksEl.innerHTML = tasks.map(task => `
        <div class="weekly-task ${task.completed ? 'completed' : ''}" data-action="toggle-task" data-id="${task.id}" role="button" tabindex="0" aria-pressed="${task.completed}">
          <span class="task-check" aria-hidden="true">
            ${task.completed ? `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>` : ''}
          </span>
          <span class="task-label">${task.label}</span>
        </div>
      `).join('');
    }
  },

  toggle(id) {
    const data = Store.get('lup_weekly') || {};
    const task = (data.tasks || []).find(t => t.id === id);
    if (!task) return;
    task.completed = !task.completed;
    Store.set('lup_weekly', data);
    this.render();
    const allDone = data.tasks.every(t => t.completed);
    if (allDone) this._celebrate();
  },

  markAll() {
    const data = Store.get('lup_weekly') || {};
    (data.tasks || []).forEach(t => t.completed = true);
    Store.set('lup_weekly', data);
    this.render();
    this._celebrate();
  },

  resetWeek() {
    confirm('Reset Week', 'Clear all completed tasks for this week?', () => {
      const data = Store.get('lup_weekly') || {};
      (data.tasks || []).forEach(t => t.completed = false);
      Store.set('lup_weekly', data);
      this.render();
      showToast('Week reset');
    });
  },

  checkRollover() {
    const data = Store.get('lup_weekly');
    if (!data) return;
    const currentMonday = Store._getMondayStr();
    if (data.weekStart && data.weekStart !== currentMonday) {
      const allDone = (data.tasks || []).every(t => t.completed);
      if (allDone) {
        data.streak = (data.streak || 0) + 1;
      } else {
        data.streak = 0;
      }
      const history = data.history || [];
      history.push({ week: data.weekStart, completed: allDone });
      if (history.length > 52) history.shift();
      data.history = history;
      data.weekStart = currentMonday;
      (data.tasks || []).forEach(t => t.completed = false);
      Store.set('lup_weekly', data);
    }
  },

  _celebrate() {
    const wrap = document.getElementById('confetti-wrap');
    if (!wrap) return;
    wrap.innerHTML = '';
    const colors = ['#2D5016', '#4A7A2A', '#6B1F1F', '#8B6F47', '#D4C4A8', '#F5F0E8'];
    const pieces = 60;
    for (let i = 0; i < pieces; i++) {
      const piece = document.createElement('div');
      piece.className = 'confetti-piece';
      const left = Math.random() * 100;
      const dx = (Math.random() - 0.5) * 300;
      const delay = Math.random() * 0.6;
      const duration = 1.5 + Math.random() * 1.5;
      piece.style.cssText = `
        left:${left}%;
        background:${colors[Math.floor(Math.random() * colors.length)]};
        animation-duration:${duration}s;
        animation-delay:${delay}s;
        --dx:${dx}px;
        width:${6 + Math.random() * 8}px;
        height:${6 + Math.random() * 8}px;
        border-radius:${Math.random() > 0.5 ? '50%' : '2px'};
      `;
      wrap.appendChild(piece);
    }
    setTimeout(() => { wrap.innerHTML = ''; }, 4000);
    showToast('Week complete! Keep the streak going! 🎉', 3000);
  }
};

/* ═══════════════════════════════════════════
   TIMELINE
═══════════════════════════════════════════ */
const Timeline = {
  render() {
    const list = document.getElementById('timeline-list');
    if (!list) return;
    const items = Store.get('lup_timeline') || [];
    list.innerHTML = items.map(item => {
      const allDone = item.milestones.every(m => m.complete);
      return `
        <div class="timeline-item ${allDone ? 'complete' : ''}" data-id="${item.id}">
          <div class="timeline-dot"></div>
          <div class="timeline-card">
            <div class="timeline-date">${item.label}</div>
            <div class="timeline-title">${item.subtitle}</div>
            <div class="timeline-tasks">
              ${(item.milestones || []).map(m => `
                <div class="timeline-task ${m.complete ? 'done' : ''}" data-action="toggle-milestone" data-id="${m.id}" data-parent="${item.id}" role="button" tabindex="0">
                  <span class="timeline-check">
                    ${m.complete ? `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>` : ''}
                  </span>
                  <span class="timeline-task-label">${m.label}</span>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      `;
    }).join('');
  },

  toggle(milestoneId, parentId) {
    const items = Store.get('lup_timeline') || [];
    for (const item of items) {
      const m = (item.milestones || []).find(m => m.id === milestoneId);
      if (m) { m.complete = !m.complete; break; }
    }
    Store.set('lup_timeline', items);
    this.render();
  }
};

/* ═══════════════════════════════════════════
   RULES
═══════════════════════════════════════════ */
const QUOTES = [
  { text: 'Wealth is not about having a lot of money. It\'s about having a lot of options.', author: '— Chris Rock' },
  { text: 'Do not save what is left after spending, but spend what is left after saving.', author: '— Warren Buffett' },
  { text: 'The secret to getting ahead is getting started.', author: '— Mark Twain' },
  { text: 'An investment in your living space is an investment in your daily quality of life.', author: '' },
  { text: 'Financial freedom is available to those who learn about it and work for it.', author: '— Robert Kiyosaki' },
  { text: 'The goal is not more money. The goal is living life on your terms.', author: '— Chris Brogan' },
  { text: 'Buy less, choose well, make it last.', author: '— Vivienne Westwood' },
];

const Rules = {
  _quoteIdx: 0,
  _timer: null,

  render() {
    this._quoteIdx = 0;
    this._showQuote();
    clearInterval(this._timer);
    this._timer = setInterval(() => {
      this._quoteIdx = (this._quoteIdx + 1) % QUOTES.length;
      this._showQuote();
    }, 8000);
  },

  _showQuote() {
    const q = QUOTES[this._quoteIdx];
    const el = document.getElementById('quote-text');
    if (!el) return;
    el.innerHTML = `<blockquote class="quote-text">"${q.text}"</blockquote>${q.author ? `<cite class="quote-author">${q.author}</cite>` : ''}`;
  }
};

/* ═══════════════════════════════════════════
   SETTINGS
═══════════════════════════════════════════ */
const Settings = {
  render() {
    const settings = Store.get('lup_settings') || {};
    const toggle = document.getElementById('dark-mode-toggle');
    if (toggle) {
      toggle.checked = !!settings.darkMode;
      toggle.onchange = () => this.toggleDark(toggle.checked);
    }

    const target = document.getElementById('monthly-target');
    if (target) {
      target.value = settings.monthlySavingsTarget || 900;
      target.onchange = () => {
        const s = Store.get('lup_settings') || {};
        s.monthlySavingsTarget = parseFloat(target.value) || 900;
        Store.set('lup_settings', s);
        showToast('Target saved');
      };
    }

    this._updateStorage();

    const importBtn = document.getElementById('import-btn');
    if (importBtn) {
      importBtn.onclick = () => document.getElementById('import-file').click();
    }

    const importFile = document.getElementById('import-file');
    if (importFile) {
      importFile.onchange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = ev => {
          confirm('Import Data', 'This will overwrite all current data. Continue?', () => {
            try {
              Store.importAll(ev.target.result);
              showToast('Data imported successfully');
              setTimeout(() => location.reload(), 1000);
            } catch(err) {
              showToast('Import failed: ' + err.message);
            }
          });
        };
        reader.readAsText(file);
        importFile.value = '';
      };
    }

    const meta = Store.get('lup_meta') || {};
    const versionEl = document.getElementById('app-version');
    if (versionEl) versionEl.textContent = `v${meta.version || '1.0.0'}`;
  },

  _updateStorage() {
    const bytes = Store.storageUsed();
    const kb = (bytes / 1024).toFixed(1);
    const mb = (bytes / (1024 * 1024)).toFixed(2);
    const pctUsed = Math.min(100, (bytes / (5 * 1024 * 1024)) * 100);

    const usedEl = document.getElementById('storage-used-label');
    const pctEl  = document.getElementById('storage-pct-label');
    const fillEl = document.getElementById('storage-fill');

    if (usedEl) usedEl.textContent = `${mb} MB used (${kb} KB)`;
    if (pctEl)  pctEl.textContent  = `${pctUsed.toFixed(1)}%`;
    if (fillEl) fillEl.style.width = pctUsed + '%';
  },

  toggleDark(on) {
    document.documentElement.setAttribute('data-theme', on ? 'dark' : '');
    const s = Store.get('lup_settings') || {};
    s.darkMode = on;
    Store.set('lup_settings', s);
    showToast(on ? 'Dark mode on' : 'Light mode on');
  },

  exportData() {
    const json = Store.exportAll();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `level-up-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    const meta = Store.get('lup_meta') || {};
    meta.lastBackup = new Date().toISOString();
    Store.set('lup_meta', meta);
    showToast('Data exported');
  },

  resetAll() {
    confirm(
      'Reset All Data',
      'This will permanently erase ALL your data including savings, purchases, and vision board photos. This cannot be undone.',
      () => {
        confirm(
          'Are you absolutely sure?',
          'ALL data will be deleted. Tap Confirm to proceed.',
          () => {
            Store.resetAll();
            showToast('Data reset — reloading…');
            setTimeout(() => location.reload(), 1200);
          }
        );
      }
    );
  }
};

/* ═══════════════════════════════════════════
   EVENT DELEGATION
═══════════════════════════════════════════ */
function bindGlobalEvents() {
  document.getElementById('app').addEventListener('click', e => {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    const { action, id } = btn.dataset;
    switch (action) {
      case 'toggle-task':      Weekly.toggle(id); break;
      case 'cycle-status':     Purchases.cycleStatus(id); break;
      case 'delete-purchase':  Purchases.delete(id); break;
      case 'edit-purchase':    Purchases.openEditModal(id); break;
      case 'toggle-milestone': {
        const parentId = btn.dataset.parent;
        Timeline.toggle(id, parentId);
        break;
      }
      case 'update-savings':   Dashboard.updateSavings(id); break;
      case 'delete-image':     VisionBoard.deleteImage(id); break;
      case 'log-paycheck':     Paychecks.logPaycheck(btn.dataset.check); break;
      case 'close-purchase-modal': closeModal('purchase-modal-overlay'); break;
      case 'save-purchase':    Purchases.save(); break;
      case 'export-data':      Settings.exportData(); break;
      case 'reset-all-data':   Settings.resetAll(); break;
      case 'mark-all-weekly':  Weekly.markAll(); break;
      case 'reset-week':       Weekly.resetWeek(); break;
    }
  });

  document.getElementById('app').addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') {
      const btn = e.target.closest('[data-action="toggle-task"], [data-action="toggle-milestone"]');
      if (btn) { e.preventDefault(); btn.click(); }
    }
  });

  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => Router.navigate(btn.dataset.section));
  });

  document.getElementById('add-purchase-fab').addEventListener('click', () => Purchases.openAddModal());

  document.getElementById('add-photo-btn').addEventListener('click', () => VisionBoard.addPhoto());
  document.getElementById('add-url-btn').addEventListener('click', () => VisionBoard.addUrl());

  document.getElementById('vision-file-input').addEventListener('change', e => {
    const file = e.target.files[0];
    if (file) VisionBoard.handleFile(file);
    e.target.value = '';
  });

  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', e => {
      if (e.target === overlay) closeModal(overlay.id);
    });
  });
}

/* ═══════════════════════════════════════════
   SERVICE WORKER
═══════════════════════════════════════════ */
function registerSW() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').catch(err => {
      console.log('SW registration failed:', err);
    });
  }
}

/* ═══════════════════════════════════════════
   BOOT
═══════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  Store.init();
  Weekly.checkRollover();
  bindGlobalEvents();
  Router.init();
  registerSW();
});
