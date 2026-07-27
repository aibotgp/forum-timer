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

There is no account and nothing to sign into. Your meetings, timers and history
are saved only in your own browser's `localStorage`, on your own device. They
are never uploaded. Nobody else can see them — not other people using this
tool, and not the person who published this page.

The flip side is that they do not travel. Another browser, another computer, or
a private window all start empty. **Data → Export backup** writes a JSON file
that restores everything, and history also exports as CSV for analysis
elsewhere. If you run the timer for your forum, keep that backup somewhere
safe — a browser reset takes your history with it.

### Optional, off by default: anonymous usage

**Data → Privacy** has one switch, *Help improve this tool*. It is **off unless
you turn it on**, and nothing is loaded or sent while it is off.

If you switch it on, it records that a page was opened, how long it stayed
open, and which features were used — the graphic you chose, whether room mode
is on, whether a meeting was started or finished. It **never** sends your
meeting names, timer labels, notes or timings. It sets no cookies and does not
identify you. Measurement is by [Plausible](https://plausible.io), which stores
no personal data and is EU-hosted.

Switch it off and collection stops immediately. There is nothing to request or
delete afterwards, because nothing about you was stored in the first place.

## Installing it

You have two options, and neither is required — the link above works on its own
and keeps working with no internet once you have opened it.

**Add it from your browser.** In Safari, File → Add to Dock. In Chrome or Edge,
click the install icon in the address bar. This gives you a real application
with nothing to download.

**Or download a desktop build.** Mac and Windows installers are on the
[Releases page](https://github.com/aibotgp/forum-timer/releases/latest).

These builds are not notarised, so the first launch needs one extra step:

- **macOS** — take the `aarch64` build for Apple Silicon (M1 and later) or the
  `x64` build for an Intel Mac. Open the `.dmg`, drag Forum Timer to
  Applications, and double-click it.

  macOS will refuse the first launch with *"Apple could not verify… is free of
  malware"*. That is expected: it means the app is not notarised, not that
  anything is wrong with it. Click **Done**, then go to **System Settings →
  Privacy & Security**, scroll to Security, and click **Open Anyway** next to
  the Forum Timer message. Authenticate and confirm once. Every later launch is
  normal.

  One line in Terminal does the same thing:

  ```bash
  xattr -dr com.apple.quarantine "/Applications/Forum Timer.app"
  ```

  (Older guides say to right-click → Open. Apple removed that bypass in macOS
  Sequoia, so it no longer works.)

- **Windows** — run the `.exe`. SmartScreen will say the publisher is unknown:
  click **More info**, then **Run anyway**. Once only.

If you would rather not do any of that, use the web version and add it to your
Dock or Start menu — it is the same application with no warnings at all.

The desktop app stores its meetings and history separately from your browser's.
Use **Data → Export backup** in one and import it in the other to move them.

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

## Credit

Built by **Rohit Goyal**, EO Pune — a member of the ICE Forum.

## Licences

The application code is free to use and adapt.

The bundled typefaces — **Caprasimo** and **Figtree** — are licensed under the
SIL Open Font License, Version 1.1. Their notices are in
[`FONT-LICENSES.txt`](FONT-LICENSES.txt), which must stay with the fonts if you
redistribute this.
