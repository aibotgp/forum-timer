# Forum Timer

A configurable meeting timer, built to move timing accountability from a human
timekeeper to software. Human timekeepers hesitate to interrupt a speaker, so
meetings run long and everyone leaves fatigued and late. The tool makes the
overrun visible to the whole room so nobody has to be the bad guy.

Primary use is an EO Forum meeting with roughly eight members, but nothing in
the app is EO-specific. Anyone should be able to open the link and use it.

> **Project location.** Lives in the iCloud folder
> `~/Library/Mobile Documents/com~apple~CloudDocs/Downloads/AI Project/Forum Timer`,
> not `~/Projects`. See `SETUP.md`.

---

## Non-negotiable behaviour

These came from the owner directly. Do not "improve" them away.

1. **Nothing is ever truncated.** When a timer hits zero it does not stop and
   does not auto-advance. It holds, counts upward into overrun, and keeps going
   until a human stops it.
2. **Overrun draws down the session buffer first.** Each session has a buffer
   pool. Overrun consumes it. Once the pool is empty, the session and the
   meeting simply expand — no later block is silently shortened to compensate.
3. **Meetings target a total duration, not a wall-clock finish time.** Duration
   is a yardstick to measure drift against, never a constraint that squeezes
   later blocks.
4. **Every element is a first-class object.** Timers, sessions and meetings can
   each be created, renamed, edited, duplicated, deleted and saved.
5. **Timer transport states:** idle, running, paused, overrun, ended. Controls
   are start, pause, resume, reset, end.

## Data model

```
Meeting  →  Session  →  Timer
```

- A **Timer** has: label, planned duration, three alert configs, run history.
- A **Session** has: title, its own planned duration, a buffer pool (before
  and after), and an ordered list of timers.
- A **Meeting** has: title, target total duration, an ordered list of
  sessions, and a total paused-time tally.
- A separate **timer library** holds reusable timer definitions that can be
  dropped into any session. Timers can also be built inline.

## Alerts

Three independent alerts per timer, each with its own timing *and* its own
sound:

| Alert | Fires | Configurable |
|---|---|---|
| Pre-warning | At N seconds remaining | N, sound |
| Time up | At zero | sound |
| Overrun repeat | Every N seconds past zero | N, sound |

Setting any sound to **None** mutes that alert. Sounds are synthesised with the
Web Audio API — no audio files, so the app stays a single portable file and
works offline.

## History and analysis

Every run records: date, timer label, planned duration, actual duration,
variance, **and paused time**. Drift rolls up and is stored at **all three
levels** — timer, session and meeting — because the owner wants to see whether
delays come from one person, one type of session, or the meeting as a whole.

**Paused time is tracked separately from drift.** Total time spent paused is
tallied per run and rolled up to the meeting (available at session and timer
level too). It is kept in its own bucket because a pause — a break, an
interruption, a side conversation — is *not* attributable to any member or
activity, and mixing it into drift would distort who or what is actually
running the meeting long.

Statistics aggregate by **timer label**, not by a member roster. Duplicating a
saved meeting therefore keeps accumulating history under the same names.

## Interface rules

The screen is a shared display everyone in the room can see, usually through a
mediocre projector in a room of unpredictable brightness.

- Numerals are the hero: enormous, tabular, high contrast.
- Transport controls stay visible at all times. Never hide them behind hover.
- State is carried by colour across the whole field, not a small badge:
  running (green) → pre-warning (amber) → overrun (red).
- Keyboard first: space start/pause, R reset, E end, S setup.
- Must stay readable and usable from a laptop screen down to a projector.

### Time-remaining visualisation (swappable)

The signature element is the **depletion bar**: it drains left-to-right while
time remains, then refills from the right in red as overrun accumulates, so
encroachment is visible from across the room.

The depletion bar is the *default*, but it is not the only possible graphic.
The time-remaining visual is built as a **swappable renderer** behind a stable
interface: the engine hands the renderer the current phase and a
remaining/overrun fraction each frame, and the renderer draws. This keeps the
door open for richer, more engaging graphics later (a draining ring, a filling
shape, something playful near the end) without touching the timing engine.
Ship the depletion bar now; add alternates as separate renderers later.

## Distribution

- **One self-contained HTML file.** No build step, no framework, no npm
  dependencies, no CDN links. The same file is both the download and the
  hosted page.
- **No backend, no accounts, no sign-in.** History lives in each browser's
  `localStorage`, so every user's data is private to them and invisible to
  everyone else.
- JSON export/import covers backup and moving between machines, since
  `localStorage` does not travel between devices or browsers.
- Ships as a PWA (service worker + manifest) so it installs to the Dock and
  runs with no internet.
- Hosted on GitHub Pages; later mirrored to an always-on office server.

## Technical constraints

- Target: latest macOS, Safari first, then Chrome. MacBook Pro M5.
- Plain HTML, CSS and vanilla JS. No TypeScript, no bundler, no React.
- Time must be computed from timestamps (`Date.now()`), never by counting
  ticks, so the clock does not drift when a tab is throttled.
- Audio context must be unlocked on a user gesture or Safari stays silent.
- Respect `prefers-reduced-motion`. Keyboard focus must be visible.

## Working agreement

The owner is a finance professional who builds his own tooling — technical, but
short on time.

- Keep responses brief. Expand the immediate next step only; summarise anything
  further out.
- Do not float ideas you will reject later in the same response. Decide, then
  state the decision.
- Prefer fewer, larger build stages. Build as far as is sensible before asking
  him to test.
- Any command, config or code meant to be copy-pasted goes in a file, not
  inline prose.
- Commit at every working checkpoint.

## Build status

- [x] Phase 1 — single timer engine, three alerts, overrun, state colours
- [ ] Build 1 — timer library, sessions with buffers, meetings, persistence,
      history and drift roll-up, full CRUD, per-run **paused-time** tracking
      rolled up to meeting level, and the time-remaining graphic behind a
      **swappable renderer** (ship the depletion bar)
- [ ] Build 2 — PWA/offline, JSON export/import, CSV history, empty states
- [ ] Build 3 — GitHub Pages publish, then office server mirror
- [ ] Later — richer end-of-timer graphics as alternate renderers

## Decisions log

- 2026-07-26 — Project folder is the iCloud path above, not `~/Projects`.
- 2026-07-26 — Added meeting-level total paused-time tracking, kept as a
  separate bucket from drift (a pause isn't attributable to a member/activity).
- 2026-07-26 — Time-remaining graphic to be built as a swappable renderer so
  more engaging graphics can replace the depletion bar later.
