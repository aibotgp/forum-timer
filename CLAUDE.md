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
6. **Advancing is always a human action.** `Next` moves to the next timer; no
   timer ever advances itself. On the *last* timer of a meeting `Next` reads
   **Finish** and opens the meeting summary — ending a meeting on an explicit
   press is not truncation, and the run view must never be a dead end.
7. **Paused time is never counted as elapsed time.** A timer's actual duration
   excludes any time it sat paused; pause is tallied in its own field.

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

The design system lives in `Design/FORUM-TIMER-DESIGN-SPEC.md`, with a visual
reference at `Design/forum-timer-design-reference.html`. The spec's tokens are
the source of truth; use CSS custom properties, never hard-coded colours.

- Type: Caprasimo (display — screen titles, meeting and session names) over
  Figtree (everything else). Both are OFL and inlined as base64 `@font-face`,
  so there is still no CDN and no font files. Numerals always tabular.
- Numerals are the hero: enormous, tabular, high contrast.
- Transport controls stay visible at all times. Never hide them behind hover.
  Each button prints its own shortcut beside the label — no separate legend.
- **Restraint rule.** Phase colour applies to the numerals and the depletion
  graphic only. The background never floods. Overrun is the one place red may
  also tint a chip. **Room mode** (Data → Appearance, off by default) overrides
  this and floods the whole field, for a projector in a bright room.
- Status copy is warm and one line, never a modal: "Running comfortably",
  "Nearly there — 1:12 left", "You're 2:04 over — buffer covers it for now",
  and once the pool is empty, "buffer is spent, the meeting has expanded".
- Keyboard first: Space start/pause, R reset, E end, N next, S build, H home.
- Must stay readable and usable from a laptop screen down to a projector.

### Time-remaining visualisation (swappable)

The signature element is the **Ribbon**: a pill track whose phase-coloured fill
is anchored left and shrinks left-to-right as time drains, then a red fill grows
from the right edge back toward the middle as overrun accumulates — so
encroachment is visible from across the room.

The graphic sits behind a **renderer registry** with a stable interface, so a
new graphic is a new object and never an engine change:

```js
renderer.mount(rootEl);
renderer.draw({ phase, remaining, overrun, color, reducedMotion });
renderer.unmount();
```

Renderers never read app state — everything they need arrives in `draw()`.
Three ship today: **Ribbon** (default), **Ring** (conic dial) and **Field**
(a tint rising in a well). Richer, more playful graphics can be added later
the same way.

## Distribution

- **`index.html` is self-contained and must stay that way.** No build step, no
  framework, no npm dependencies, no CDN links, no external images. Downloaded
  on its own it is a complete, working app.
- **Two optional sidecars enable offline:** `sw.js` and `manifest.webmanifest`.
  A service worker cannot be inlined — browsers refuse to register one from a
  blob or `data:` URL — so offline requires real files. Registration fails
  silently when they are absent or when opened over `file://`, and the app
  carries on. Icons are inlined as data URIs, so there are still no image files.
- Hosted as a GitHub **project page** (`user.github.io/forum-timer/`), so every
  path in the app and the manifest must stay relative — verified working from a
  subdirectory, including offline and the bare directory URL.
- `.nojekyll` stops GitHub Pages running the files through Jekyll.
- **Bump `VERSION` in `sw.js` on every deploy.** The page detects the waiting
  worker and offers a Reload toast. Skip the bump and users keep the old cache.
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

## Views

- **Home** (`H`) — the landing screen. Meeting cards with target, planned and
  last-run drift, plus recent activity. The app always starts here; it never
  opens straight into a running meeting.
- **Run** — the shared-display screen. The hero. Centred layout.
- **Build** (`S`) — the board: a column per session, drag-and-drop for both
  timer cards and whole columns, with ↑↓ buttons as a keyboard-accessible
  fallback.
- **Library** — reusable timer definitions as a card grid, with per-label run
  stats and search.
- **Alerts** — the per-timer editor: label, duration, and one row per alert.
- **History** — four stat cards, drift-by-label bars, a twelve-meeting column
  chart with drift above a hairline and paused time below, then the run log.
- **Data** — backup, transfer, appearance, storage and offline state.
- **Summary** — shown when `Finish` ends a meeting. Target / planned / actual /
  drift / paused tiles, then a per-session breakdown with buffer used-vs-left
  and per-timer variance. Exits to Manage → Meetings, or re-runs the meeting.

## Rendering note

The run view splits rendering deliberately: `renderRun()` rebuilds the chrome
(transport, titles) only on a state change, while `paintRun()` runs every
animation frame and touches text and graphics only. Rebuilding buttons per
frame detaches them mid-click and destroys keyboard focus — do not merge these.

## Build status

- [x] Phase 1 — single timer engine, three alerts, overrun, state colours
- [x] Build 1 — timer library, sessions with buffers, meetings, persistence,
      history and drift roll-up, full CRUD, per-run **paused-time** tracking
      rolled up to meeting level, and the time-remaining graphic behind a
      **swappable renderer** (depletion bar + draining ring)
- [x] Build 1a — end-of-meeting summary screen; recording fixes
- [x] Build 2 — PWA/offline (sw.js + manifest), JSON export/import with
      merge-or-replace, CSV history export, empty states, update toast
- [x] Design pass — spec tokens applied, Caprasimo + Figtree embedded, Home
      screen with `H`, build board with drag-and-drop, Alerts editor, charted
      history, light/dark themes, Room mode
- [~] Build 3 — repo prepared for publishing (README, .gitignore, .nojekyll,
      font licences, subpath hosting verified). Publish steps in `SETUP.md` §5,
      awaiting the GitHub push. Office server mirror still to do.
- [ ] Later — richer end-of-timer graphics as alternate renderers; the Quiet
      stage and Agenda split run layouts (a `layout` setting already exists)

## Decisions log

- 2026-07-26 — Project folder is the iCloud path above, not `~/Projects`.
- 2026-07-26 — Added meeting-level total paused-time tracking, kept as a
  separate bucket from drift (a pause isn't attributable to a member/activity).
- 2026-07-26 — Time-remaining graphic to be built as a swappable renderer so
  more engaging graphics can replace the depletion bar later.
- 2026-07-26 — `Next` on the final timer reads **Finish** and opens a meeting
  summary, which exits to Manage. Previously the run view dead-ended.
- 2026-07-26 — Fixed: recorded durations were roughly doubled, because the
  clock segment was closed and then counted again while the state was still
  `running`. Durations are now settled to a non-running state before recording.
- 2026-07-26 — Owner chose two optional sidecar files (`sw.js`,
  `manifest.webmanifest`) over dropping the service worker, resolving the
  conflict between "one self-contained file" and "ships as a PWA".
  `index.html` alone remains a fully working app.
- 2026-07-26 — Design spec adopted. Its restraint rule supersedes the old
  "colour floods the whole field" interface rule; the projector case is served
  by Room mode instead, which is off by default.
- 2026-07-26 — Fonts embedded as base64 rather than falling back to system-ui,
  so the design's character survives offline with no CDN.
- 2026-07-26 — The app lands on **Home**, never straight into a loaded meeting.
  `H` returns there from anywhere.
- 2026-07-26 — Meeting drift counts completed timers plus the live timer's
  *overrun only*. Time the running timer has not used yet is not credit earned,
  so drift no longer reads as a large negative at the start of a meeting.
- 2026-07-26 — Repo is **public** on GitHub, since Pages is free only on public
  repos and the app holds no secrets — every user's history stays in their own
  browser. `Design/` stays tracked.
- 2026-07-26 — Embedded fonts are SIL OFL, which requires the notice to travel
  with them: `FONT-LICENSES.txt` must not be deleted or excluded from the repo.
- 2026-07-26 — Import offers **Merge** (keeps existing, re-ids collisions,
  dedupes history by row id) or **Replace all**. Merge is the safer default.
