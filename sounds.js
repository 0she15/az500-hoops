'use strict';

// ═══════════════════════════════════════════════════
// AZ-500 Hoops — Sound Manager
// Web Audio API only. No files, no libraries.
// Default: OFF. User enables via profile overlay.
// ═══════════════════════════════════════════════════

const SoundManager = (function () {

  let _ctx  = null;
  let _out  = null;      // master GainNode
  let _on   = false;
  const _last = {};

  // ─── AudioContext (lazy, resumed on every play) ───
  function ctx_() {
    if (!_ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      _ctx = new AC();
      _out = _ctx.createGain();
      _out.gain.value = 0.65;
      _out.connect(_ctx.destination);
    }
    // iOS Safari suspends context until a user gesture resumes it
    if (_ctx.state === 'suspended') _ctx.resume().catch(() => {});
    return { ctx: _ctx, out: _out };
  }

  // ─── Per-sound minimum intervals (ms) ───
  const THROTTLE = {
    tap: 80, correct: 300, wrong: 300,
    xp: 260, streak: 400, levelup: 1200,
    boss: 1200, tick: 860, achievement: 600
  };

  function canPlay(name) {
    const now = Date.now();
    const gap = THROTTLE[name] || 120;
    if (now - (_last[name] || 0) < gap) return false;
    _last[name] = now;
    return true;
  }

  // ─────────────────────────────────────────────────
  // SOUND DEFINITIONS
  // Direction: neon arcade · cyber basketball · NBA 2K
  // Clean and modern, not retro 8-bit.
  // All volumes kept low and balanced.
  // ─────────────────────────────────────────────────

  // UI tap — brief sine click, 35 ms
  function snd_tap(ctx, out) {
    const o = ctx.createOscillator(), g = ctx.createGain();
    const t = ctx.currentTime;
    o.type = 'sine'; o.frequency.value = 860;
    g.gain.setValueAtTime(0.13, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.038);
    o.connect(g); g.connect(out);
    o.start(t); o.stop(t + 0.04);
  }

  // Correct chime — C5 → E5 → G5 ascending major arpeggio
  function snd_correct(ctx, out) {
    [523.25, 659.25, 783.99].forEach((hz, i) => {
      const o = ctx.createOscillator(), g = ctx.createGain();
      const t = ctx.currentTime + i * 0.085;
      o.type = 'sine'; o.frequency.value = hz;
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(0.16, t + 0.006);
      g.gain.setValueAtTime(0.16, t + 0.06);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.22);
      o.connect(g); g.connect(out);
      o.start(t); o.stop(t + 0.25);
    });
  }

  // Wrong buzzer — filtered descending sawtooth, 320 ms
  function snd_wrong(ctx, out) {
    const o = ctx.createOscillator(), f = ctx.createBiquadFilter(), g = ctx.createGain();
    const t = ctx.currentTime;
    o.type = 'sawtooth';
    o.frequency.setValueAtTime(220, t);
    o.frequency.exponentialRampToValueAtTime(110, t + 0.28);
    f.type = 'lowpass'; f.frequency.value = 900;
    g.gain.setValueAtTime(0.17, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.32);
    o.connect(f); f.connect(g); g.connect(out);
    o.start(t); o.stop(t + 0.35);
  }

  // XP gain — quick upward sine sweep, 90 ms
  function snd_xp(ctx, out) {
    const o = ctx.createOscillator(), g = ctx.createGain();
    const t = ctx.currentTime;
    o.type = 'sine';
    o.frequency.setValueAtTime(540, t);
    o.frequency.exponentialRampToValueAtTime(980, t + 0.07);
    g.gain.setValueAtTime(0.11, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.09);
    o.connect(g); g.connect(out);
    o.start(t); o.stop(t + 0.1);
  }

  // Streak heat-up — two detuned sine oscillators, rising energy per level
  // level 1 = 3-streak (2x mult), level 2 = 5-streak, level 3 = 7-streak (4x)
  function snd_streak(ctx, out, level) {
    const pairs  = [[420, 416], [528, 524], [660, 656]];
    const [f1, f2] = pairs[Math.min((level || 1) - 1, 2)];
    const vol = 0.12 + (level || 1) * 0.02;
    const dur = 0.28;
    [f1, f2].forEach(hz => {
      const o = ctx.createOscillator(), g = ctx.createGain();
      const t = ctx.currentTime;
      o.type = 'sine'; o.frequency.value = hz;
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(vol, t + 0.01);
      g.gain.setValueAtTime(vol, t + 0.1);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(g); g.connect(out);
      o.start(t); o.stop(t + dur + 0.02);
    });
    // Extra high flash at max heat (7-streak)
    if (level >= 3) {
      const o = ctx.createOscillator(), g = ctx.createGain();
      const t = ctx.currentTime + 0.08;
      o.type = 'sine'; o.frequency.value = 1320;
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(0.09, t + 0.005);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.12);
      o.connect(g); g.connect(out);
      o.start(t); o.stop(t + 0.14);
    }
  }

  // Level-up fanfare — C4 E4 G4 C5 arpeggio + C6 sparkle
  function snd_levelup(ctx, out) {
    [261.63, 329.63, 392.0, 523.25].forEach((hz, i) => {
      const o = ctx.createOscillator(), g = ctx.createGain();
      const t = ctx.currentTime + i * 0.13;
      o.type = i < 3 ? 'triangle' : 'sine';
      o.frequency.value = hz;
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(0.20, t + 0.01);
      g.gain.setValueAtTime(0.20, t + 0.09);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.52);
      o.connect(g); g.connect(out);
      o.start(t); o.stop(t + 0.56);
    });
    // Sparkle
    const sp = ctx.createOscillator(), sg = ctx.createGain();
    const st = ctx.currentTime + 0.42;
    sp.type = 'sine'; sp.frequency.value = 1046.5;
    sg.gain.setValueAtTime(0, st);
    sg.gain.linearRampToValueAtTime(0.13, st + 0.008);
    sg.gain.exponentialRampToValueAtTime(0.0001, st + 0.38);
    sp.connect(sg); sg.connect(out);
    sp.start(st); sp.stop(st + 0.42);
  }

  // Boss battle intro — low square thump + high sine sting
  function snd_boss(ctx, out) {
    const t = ctx.currentTime;
    // Thump
    const b = ctx.createOscillator(), bg = ctx.createGain();
    b.type = 'square';
    b.frequency.setValueAtTime(90, t);
    b.frequency.exponentialRampToValueAtTime(42, t + 0.18);
    bg.gain.setValueAtTime(0.22, t);
    bg.gain.exponentialRampToValueAtTime(0.0001, t + 0.22);
    b.connect(bg); bg.connect(out);
    b.start(t); b.stop(t + 0.26);
    // Sting
    const s = ctx.createOscillator(), sg = ctx.createGain();
    s.type = 'sine';
    s.frequency.setValueAtTime(1300, t + 0.02);
    s.frequency.exponentialRampToValueAtTime(820, t + 0.14);
    sg.gain.setValueAtTime(0, t + 0.02);
    sg.gain.linearRampToValueAtTime(0.17, t + 0.03);
    sg.gain.exponentialRampToValueAtTime(0.0001, t + 0.18);
    s.connect(sg); sg.connect(out);
    s.start(t + 0.02); s.stop(t + 0.2);
  }

  // Countdown tick — short sine at 880 Hz, 32 ms (last 10 s of blitz)
  function snd_tick(ctx, out) {
    const o = ctx.createOscillator(), g = ctx.createGain();
    const t = ctx.currentTime;
    o.type = 'sine'; o.frequency.value = 880;
    g.gain.setValueAtTime(0.08, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.032);
    o.connect(g); g.connect(out);
    o.start(t); o.stop(t + 0.036);
  }

  // Achievement unlock — E5 G#5 B5 E6 ascending sparkle
  function snd_achievement(ctx, out) {
    [659.25, 830.61, 987.77, 1318.51].forEach((hz, i) => {
      const o = ctx.createOscillator(), g = ctx.createGain();
      const t = ctx.currentTime + i * 0.072;
      o.type = 'sine'; o.frequency.value = hz;
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(0.13, t + 0.005);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.16);
      o.connect(g); g.connect(out);
      o.start(t); o.stop(t + 0.18);
    });
  }

  // ─── Registry ───
  const SOUNDS = {
    tap: snd_tap, correct: snd_correct, wrong: snd_wrong,
    xp: snd_xp, streak: snd_streak, levelup: snd_levelup,
    boss: snd_boss, tick: snd_tick, achievement: snd_achievement
  };

  // ─── Public API ───
  return {
    get enabled() { return _on; },

    loadPref() {
      _on = localStorage.getItem('az500_sound') === 'on';
    },

    enable() {
      _on = true;
      localStorage.setItem('az500_sound', 'on');
      try { ctx_(); } catch (e) {}
    },

    disable() {
      _on = false;
      localStorage.setItem('az500_sound', 'off');
    },

    play(name, ...args) {
      if (!_on) return;
      if (!canPlay(name)) return;
      try {
        const c = ctx_();
        if (!c) return;
        SOUNDS[name]?.(c.ctx, c.out, ...args);
      } catch (e) { /* fail silently — iOS Safari may block */ }
    }
  };
})();

// Global shorthand used throughout app.js
function playSound(name, ...args) { SoundManager.play(name, ...args); }
