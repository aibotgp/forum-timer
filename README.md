# Forum Timer

A configurable meeting timer that moves timing accountability from a person to
software. Human timekeepers hesitate to interrupt a speaker, so meetings run
long and everyone leaves late. This puts the overrun on a screen everyone can
see, so nobody has to be the bad guy.

**[Open the timer →](https://aibotgp.github.io/forum-timer/)**

Nothing to install, no account, no sign-in. Open the link and use it.

---

## What it does

Build a **meeting** out of **sessions**, and each session out of **timers**.
Run it, and the screen shows the current timer at a size the whole room can
read, with the session's remaining buffer and the meeting's drift alongside.

Three things it deliberately will not do:

**Nothing is ever truncated.** When a timer reaches zero it does not stop and
does not skip ahead. It holds, counts upward into overrun, and keeps counting
until a person ends it.

**Overrun eats the buffer, not the agenda.** Each session carries a buffer
pool. Overrun draws that down first. Once the pool is empty the session and the
meeting simply expand — no later block is quietly shortened to make the numbers
work.

**The target duration is a yardstick, not a constraint.** A meeting has a
target total so you can measure drift against it. Going over is allowed and is
reported plainly, never corrected for behind your back.

## Using it

| Key | Does |
|---|---|
| `Space` | Start / pause / resume |
| `R` | Reset the current timer |
| `E` | End the current timer and hold on it |
| `N` | Next timer — on the last one it reads **Finish** and opens the summary |
| `S` | Build board |
| `H` | Home |

Every button also prints its own shortcut, so there is nothing to memorise.

Each timer has three independent alerts — a pre-warning at N seconds remaining,
a chime at zero, and a repeat every N seconds into overrun — each with its own
sound, or none to stay silent. Sounds are synthesised in the browser, so there
are no audio files and they work offline. Safari needs one click on the page
before it will make any sound; the first **Start** takes care of that.

## History

Every run records planned against actual, the variance, and the time the timer
spent paused. Drift rolls up by timer label, by session and by meeting, so you
can tell whether the delay comes from one person, one kind of session, or the
meeting as a whole.

Paused time is kept in its own bucket rather than mixed into drift, because a
break or an interruption is not attributable to whoever happens to be speaking.

Statistics aggregate by timer *label*, so duplicating a saved meeting keeps
accumulating history under the same names.

## Your data stays with you

There is no backend and no account. Everything lives in your own browser's
`localStorage`, which means your history is invisible to everyone else —
including whoever published this page.

It also means it does not travel. Another browser, another Mac, or a private
window all start empty. **Data → Export backup** writes a JSON file that
restores everything, and history also exports as CSV for analysis elsewhere.

## Installing it

Visit the link, then use your browser's install or **Add to Dock** option. It
runs with no internet once installed. On macOS Safari: File → Add to Dock.

## For anyone reading the source

`index.html` is the whole application — plain HTML, CSS and vanilla JavaScript,
no build step, no framework, no dependencies, no CDN links. Downloaded on its
own it is a complete working app. Fonts and icons are inlined as base64.

Two optional sidecars add offline install: `sw.js` and `manifest.webmanifest`.
A service worker cannot be inlined — browsers refuse to register one from a
`blob:` or `data:` URL — so those have to be real files. If they are missing,
registration fails quietly and everything else still works.

Time is computed from `Date.now()` deltas rather than by counting ticks, so the
clock stays honest when a background tab is throttled.

The time-remaining graphic sits behind a small renderer registry:

```js
renderer.mount(rootEl);
renderer.draw({ phase, remaining, overrun, color, reducedMotion });
renderer.unmount();
```

Renderers never read application state — everything arrives in `draw()`. Three
ship today: Ribbon, Ring and Field. Adding another is a new object, not an
engine change.

### Deploying a change

Bump `VERSION` in `sw.js` whenever you deploy. The running app notices the
waiting worker and offers a Reload. Skip the bump and people keep the old
cached copy.

## Licences

The application code is free to use and adapt.

The bundled typefaces — **Caprasimo** and **Figtree** — are licensed under the
SIL Open Font License, Version 1.1. Their notices are in
[`FONT-LICENSES.txt`](FONT-LICENSES.txt), which must stay with the fonts if you
redistribute this.
