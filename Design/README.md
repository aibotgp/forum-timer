# Forum Timer — design handoff

Drop this whole folder into the project at
`~/Library/Mobile Documents/com~apple~CloudDocs/Downloads/AI Project/Forum Timer/design/`.

## What's here

- **FORUM-TIMER-DESIGN-SPEC.md** — the build spec: colour tokens (light + dark), type,
  spacing, every screen, the swappable renderer interface, the status copy, engine rules.
  This is the file to hand Claude Code.
- **forum-timer-design-reference.html** — the visual reference. One self-contained file;
  double-click to open, works offline. Click through Run / Build / Library / History /
  Alerts / Data, toggle light and dark, switch the run-view layout and the depletion graphic
  in the strip at the bottom right.
  It is a *prototype of the look*, not the app — do not copy its code.

## Prompt to give Claude Code

> Read `design/FORUM-TIMER-DESIGN-SPEC.md` and open
> `design/forum-timer-design-reference.html` in a browser for the visual reference.
> Build the interface described there into the Forum Timer app: one self-contained HTML
> file, vanilla JS, no build step, no dependencies, no CDN links.
> Follow the spec's tokens exactly and use CSS custom properties for them.
> Ship the Centred run layout and the Ribbon renderer; put the Ring and Field renderers
> behind the renderer registry so they can be enabled later.
> Do not copy code from the reference file — it uses a component framework the app must not have.
> Keep the non-negotiable behaviour from the project README: nothing truncates, overrun eats
> the buffer pool first, duration is a yardstick not a constraint.

## Decisions still open

1. Do the Quiet stage and Agenda split layouts ship as a setting, or get dropped?
2. Does "buffer spent" need a stronger visual than the change of status copy?
