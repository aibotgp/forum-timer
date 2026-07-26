# Forum Timer — interface build spec

Paste this alongside `Forum Timer.dc.html` (the visual reference). The design file is a
prototype in a component framework; the shipped app is **one plain HTML file, vanilla JS,
no dependencies**. Take the visual language and layout from the design, not its code.

---

## 1. Visual language

**Fonts** — Caprasimo (display: screen titles, meeting/session names) over Figtree
(everything else). In a single-file offline app, either embed both as base64 `@font-face`
or fall back to `system-ui`. Numerals always `font-variant-numeric: tabular-nums`.

**Tokens** (CSS custom properties on `:root`, dark set under `[data-theme="dark"]`):

| Token | Light | Dark |
|---|---|---|
| `--bg` | `#f5ead8` | `#201e1d` |
| `--surface` | `#ebddc5` | `#2e2b25` |
| `--raise` | `#f9f4ed` | `#3a352e` |
| `--ink` | `#201e1d` | `#f5ead8` |
| `--ink2` | `#645c50` | `#a19786` |
| `--line` | `rgba(32,30,29,.14)` | `rgba(245,234,216,.16)` |
| `--go` (running) | `#56633f` | `#aebf92` |
| `--warn` (pre-warning) | `#b2622d` | `#f6a06b` |
| `--over` (overrun) | `#9e3b25` | `#e0715a` |

Radii: 8 / 16 / 28px containers, `999px` for buttons, inputs and bars.
Spacing scale: 4.4 · 8.8 · 13.2 · 17.6 · 26.4 · 35.2px.
Focus: `:focus-visible { outline: 2px solid #c67139; outline-offset: 2px; }`.
Theme persists in `localStorage` and defaults to `prefers-color-scheme`.

**Restraint rule.** Phase colour applies to the **numerals and the depletion graphic only**.
The background never floods. Overrun is the one place the red is allowed to also tint a chip.

---

## 2. Run view

Three layouts are drawn in the design; ship **Centred** and keep the others as a `layout`
setting if they're wanted later.

Persistent chrome (all layouts):
- Header left: `SESSION 3 OF 6` (12px, 1.6px tracking, uppercase, `--ink2`) + session title in Caprasimo 26px.
- Header right: buffer pill (`--surface`) and meeting-drift pill (`--warn` tint).
- Header far right: today's date in full (`Saturday, 26 July 2026`) + meeting name + target on one
  line, and below it a single-line **notes field for today** (borderless, right-aligned, editable in
  place, saved with the meeting run).
- Footer transport, **always visible, never hover-revealed**. Each button prints its own shortcut
  as a small muted glyph beside the label — no separate legend:
  `Start/Pause/Resume · Space` (primary pill, fill = current phase colour) · `Reset · R` ·
  `End · E` (stops the clock, stays on this timer) · `Next · N` (arms the following timer) ·
  `Setup · S` (jumps to the build board).

Centred layout body: `NOW SPEAKING` kicker → timer label (Caprasimo 34px) → numerals
`clamp(140px, 19vw, 300px)`, weight 600, `letter-spacing:-.03em`, `line-height:.86` → the
renderer → a metadata line: `Planned 10:00 · <status> · Next: Kate — Feedback Round, 10:00`.

Overrun shows a leading `+` on the numerals; nothing truncates, nothing auto-advances.

**Status copy** (warm, one line, never a modal):
- running → `Running comfortably`
- pre-warning → `Nearly there — 1:12 left`
- overrun → `You're 2:04 over — buffer covers it for now`; once the pool is empty,
  `You're 2:04 over — buffer is spent, the meeting has expanded`
- paused → `Paused — the clock is waiting for you`

---

## 3. Renderer interface (swappable graphic)

```js
// Engine calls this each animation frame. Renderers never read app state.
renderer.draw({
  phase,        // 'idle' | 'running' | 'prewarn' | 'overrun' | 'paused' | 'ended'
  remaining,    // 0..1 of planned duration; 0 once past zero
  overrun,      // 0..1, clamped, of planned duration consumed past zero
  color,        // resolved phase colour
  reducedMotion // boolean
});
renderer.mount(rootEl); renderer.unmount();
```

Ship **Ribbon**: a 22px pill track (`--surface`); the phase-coloured fill is anchored left
and shrinks left→right as `remaining` falls; once past zero a `--over` fill grows from the
right edge back toward the middle. Two more renderers are drawn in the design as proof the
interface is enough — **Ring** (conic-gradient dial) and **Field** (a tint rising in a
rounded well). Registry: `renderers['ribbon'] = …` so adding one is a new object, no engine change.

---

## 4. Build board (setup)

Horizontally scrolling columns, one per session, drag-and-drop for both cards and columns.
Session card: dot in phase colour + name + planned total, then `Buffer 10:00 · 6:00 remaining`,
then timer cards (`--raise`, 16px radius, `⠿` grab handle, label, sub-line, duration),
then a dashed `+ Add timer`. Completed timers drop to 60% opacity and show their variance;
the running one gets a shadow and a 0.6° tilt. Drop target: 2px dashed accent on a tint.
The active session column is outlined in `#c67139`. Header shows target vs planned total with
the reassurance that being over target is allowed. Trailing dashed `+ Add session` column.

---

## 5. Library, Alerts, History, Data

**Library** — auto-fill grid, min 260px. Card: duration at 40px/600, name, three alert dots
(warn / over / muted), and a history footer (`48 runs · avg +2:40`). Search pill + New timer.

**Alerts** — one row per alert (pre-warning, time up, overrun repeat) as a 28px-radius
surface card: dot + name | fires-at | sound | Preview. Sound `None` = muted. Synthesise with
`AudioContext` (sine, 20ms attack, exponential release); unlock on the first user gesture or
Safari stays silent.

**History** — four stat cards (meeting drift, **paused time in its own bucket**, buffer used,
on-plan %), then two panels: horizontal bars for drift by timer *label* and a 12-meeting
column chart with drift above a hairline and paused time below it. Then the run log table:
Timer · Planned · Actual · Variance · Paused, variance coloured by size. Rollups exist at
timer, session and meeting level; drift and paused time never mix.

**Data** — export/import JSON, storage used, PWA install state, appearance toggle. Copy is
plain-spoken about data being local to the browser.

---

## 6. Engine notes

- All time from `Date.now()` deltas; never accumulate tick counts. Recompute on
  `visibilitychange` so a throttled tab catches up instantly.
- Transport states: idle · running · paused · overrun · ended. At zero the timer holds and
  counts up; only a human ends it.
- Overrun draws from the session buffer pool first; when the pool is empty the session and the
  meeting expand — never shorten a later block.
- Paused time is tallied per run and rolled up separately from drift.
- Stats aggregate by timer label, so a duplicated meeting keeps its history.
- `prefers-reduced-motion`: no transitions on the depletion graphic — snap to value.
- Every element (timer, session, meeting) supports create · rename · edit · duplicate · delete · save.
