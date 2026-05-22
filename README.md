# AZ-500 Hoops

> A sports-arcade study game for the Microsoft Azure Security Engineer (AZ-500) certification — playable in any mobile browser, no install required.

**[Live Demo →](https://az500-hoops.vercel.app)**

---

## Screenshots

| Home Screen | Gameplay | Results |
|-------------|----------|---------|
| _(coming soon)_ | _(coming soon)_ | _(coming soon)_ |

---

## What It Is

AZ-500 Hoops turns exam prep into a fast-paced arcade game. Choose a mode, answer security questions under pressure, build streaks, and level up your player card — all styled after an NBA 2K / GTA HUD aesthetic.

Built to replace passive reading with active recall, spaced repetition through domain mastery tracking, and just enough competition (high scores, ranks) to keep going.

---

## Features

- **85 hand-written AZ-500 questions** across 5 Azure security domains
- **6 question formats** — multiple choice, multi-select, drag-to-order, tap-to-pair, yes/no, fill-in-the-blank
- **XP + leveling system** with rank progression (Rookie → Legend)
- **Domain mastery rings** with EMA tracking per security domain
- **Shot clock** — time pressure on every question
- **Badge system** for milestones (streaks, perfect runs, domain mastery)
- **Persistent player card** via localStorage — progress survives page refreshes
- **PWA-ready** — add to home screen on iOS/Android

---

## Game Modes

| Mode | Rules |
|------|-------|
| **Career** | Infinite questions, any difficulty |
| **Blitz** | Answer as many as possible in 60 seconds |
| **Boss Battle** | Get 10 elite questions right in a row — one wrong ends it |
| **Sudden Death** | One wrong answer and it's over |
| **Domain Mastery** | Build a 5-streak in a specific Azure domain to win |

---

## Question Domains

| Code | Domain |
|------|--------|
| NET | Networking & Perimeter Security |
| IDN | Identity & Access Management |
| CMP | Compute & Application Security |
| DFC | Microsoft Defender for Cloud |
| STR | Storage & Data Security |

---

## Tech Stack

| Layer | Choice |
|-------|--------|
| Frontend | Vanilla HTML/CSS/JS — no framework, no build step |
| Fonts | Barlow Condensed, Rajdhani, Share Tech Mono (Google Fonts) |
| Persistence | `localStorage` |
| Hosting | Vercel (static) |
| Animations | CSS keyframes + canvas (confetti) |

Zero dependencies. Opens directly from a file or any static host.

---

## What I Learned / Why I Built It

I was preparing for the AZ-500 exam and found flashcard apps too passive. I wanted something that forced active recall under time pressure, tracked which domains I was weak in, and was actually fun to pick up for a 5-minute session.

Building it pushed me to think carefully about:
- **Game state machines** — managing 5 different mode end-conditions cleanly
- **Touch UX** — drag-to-order and tap-to-pair interactions on mobile without any library
- **CSS animation lifecycle** — forcing keyframe replays with the `offsetWidth` reflow trick
- **Spaced recall mechanics** — EMA-based domain mastery that weights recent performance

---

## Run Locally

```bash
git clone https://github.com/0she15/az500-hoops.git
cd az500-hoops
python3 -m http.server 8000
# Open http://localhost:8000
```

No npm, no build step.

---

## Future Improvements

- [ ] Timed review mode (Pomodoro-style)
- [ ] Explanation panel after each answer with doc links
- [ ] Cloud sync for player card (Supabase or Firebase)
- [ ] Leaderboard
- [ ] Additional question packs (SC-900, AZ-104)
- [ ] Offline support via Service Worker

---

## License

MIT
