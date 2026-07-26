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
- [x] Build 3 — published. Live at https://aibotgp.github.io/forum-timer/ from
      the public repo `aibotgp/forum-timer`, verified end to end in a real
      browser: HTTPS, correct MIME types, service worker registered at the
      `/forum-timer/` scope, all four assets cached, fonts and tokens rendering.
- [x] Build 4 — credit line (Home + Data only), privacy notice explaining
      local-only storage, and opt-in anonymous analytics (Plausible), off by
      default and never loaded on http, localhost, file:// or the desktop app
- [x] Build 5 — desktop installers: Tauri wrapper in `src-tauri/`, built by
      `.github/workflows/desktop.yml` on macOS and Windows runners, unsigned,
      attached to a GitHub Release. Home links to the Releases page.
- [x] Build 6 — EO Forum template built in (11 sessions), session library with
      copy-on-add, Library split into Timers | Sessions, always-visible reorder
      controls, explicit session drag handles
- [ ] Build 3b — office server mirror (copy the three app files into whatever
      folder that machine serves; must be http(s), not file://)
- [ ] Later — richer end-of-timer graphics as alternate renderers; the Quiet
      stage and Agenda split run layouts (a `layout` setting already exists)

## Live deployment

- Repo: `aibotgp/forum-timer` (public). Site: https://aibotgp.github.io/forum-timer/
- GitHub Pages, deploy from branch `main`, folder `/ (root)`.
- Git identity on the MacBook uses the GitHub noreply address, so the owner's
  real email stays out of public commit metadata.
- Auth is a classic PAT with `repo` scope, stored in the macOS Keychain via
  `credential.helper osxkeychain`. It expires — a push failing with
  "Invalid username or token" means generate a new one, not a broken repo.

## The EO Forum template

Encoded in the `EO` constant, not in storage, so it survives a factory reset and
can be re-added from Home at any time. Conversions applied when it was written:

- The flow's "Warning at X mins" means X minutes **elapsed**, so it is stored as
  a pre-warning of (duration − X). Do not reinterpret this as time remaining.
- Deep Dive, Learning Session and Impromptu Deep Dive are **alternatives**, one
  per meeting. All eleven sessions live in the session library; the shipped
  meeting uses Deep Dive and runs 160 min of timers plus a 25 min buffer pool
  against a 180 min target.
- Timers are the source of truth for a session's length. The flow's stated
  session durations disagreed with their own timers in two places (Brain
  Storming 30 vs 31, Impromptu Deep Dive 75 vs 47) and are not encoded.
- The two IDD one-word timers were written as "warning at 2" on a 2-minute
  timer, which would fire the warning on the chime; they warn at 1 minute.
- Overrun repeats as often as every 5 seconds, so the template uses the short
  `beep` rather than the three-tone `alarm`.
- The eight member slots stay in the "5% Reflections" session where they are
  renamed; the timer library carries one representative "Member Reflection".

**Dragging.** Timer cards are draggable; sessions are dragged **only** by the
`⠿` handle in the column header. The column itself must not be draggable —
when it was, a drag beginning on any always-visible button inside a card was
escalated by the browser to the nearest draggable ancestor and silently moved
the whole session.

## Desktop builds

`src-tauri/` wraps the same `index.html` in a system webview. There are no
commands, no plugins and no IPC — the desktop build must stay behaviourally
identical to the hosted one.

- CI stages `index.html` into `dist/` first; Tauri bundles that folder, so the
  installer never carries `Design/` or git history.
- Icons are generated in CI from `app-icon.png` by `tauri icon`, because the
  `.icns` and `.ico` formats cannot be produced on the Linux build box.
- `isDesktop()` gates three things: the service worker is not registered
  (pointless — the files are local), analytics never loads even if the user has
  opted in, and Data → Offline reports "built in" instead of a missing sw.js.
- Desktop history is separate from browser history; export/import bridges them.
- Bump `version` in BOTH `src-tauri/tauri.conf.json` and `src-tauri/Cargo.toml`
  when releasing, and use a tag that has not been used before.

## Analytics — the rules that make it lawful

Nothing loads and nothing is sent unless the user turns on *Help improve this
tool* in Data → Privacy. That switch is **off by default** and that is the
whole basis of compliance under GDPR and the DPDP Act — an opt-in needs no
consent banner. Do not flip the default, do not pre-tick it, and do not load
the script "just to check availability".

- Never send meeting names, timer labels, notes or timings. Event props carry
  only enum-ish values (which graphic, room mode on/off, a count).
- The gate also blocks http, localhost, `file://` and the desktop webview, so
  local testing never pollutes real numbers.
- Switching off reloads the page, because a loaded script cannot be unloaded.
- The README documents exactly this. If the collection changes, the README
  changes in the same commit — the tool must never claim more privacy than it
  delivers.

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
- 2026-07-26 — Forum history stays local per browser; the eight ICE Forum
  members are not getting a shared server-side view. Export/import is the
  transfer mechanism. This preserves "no backend, no accounts, no sign-in".
- 2026-07-26 — Usage analytics: Plausible hosted, opt-in only, default off.
- 2026-07-26 — Desktop installers to be Tauri, unsigned, built by GitHub
  Actions and distributed from the Releases page (WhatsApp blocks executables,
  so the link is shared, not the file).
- 2026-07-26 — Credit line: "Forum Timer — by Rohit Goyal, EO Pune (ICE Forum)",
  on Home and Data only. The Run screen is projected and stays clean.
- 2026-07-26 — Import offers **Merge** (keeps existing, re-ids collisions,
  dedupes history by row id) or **Replace all**. Merge is the safer default.
