# Setting up the build environment

Ten minutes, once. Everything below is copy-paste into Terminal on the MacBook.

---

## 1. Install Claude Code

The native installer needs no Node.js and updates itself in the background.

```bash
curl -fsSL https://claude.ai/install.sh | bash
```

Confirm it landed:

```bash
claude --version
```

If `claude` isn't found, restart Terminal so the shell picks up the new path,
then try again. `claude doctor` prints diagnostics if anything looks off.

---

## 2. Create the project

```bash
mkdir -p ~/Projects/forum-timer
cd ~/Projects/forum-timer
git init
```

Now drop two files into `~/Projects/forum-timer`:

- `CLAUDE.md` — the context file (downloaded separately)
- `index.html` — rename the Phase 1 timer file to this

```bash
git add -A
git commit -m "Phase 1: timer engine"
```

---

## 3. Start building

```bash
cd ~/Projects/forum-timer
claude
```

First run opens a browser to log in — use the account your Max plan is on.

Claude Code reads `CLAUDE.md` automatically at the start of every session, so
you never re-explain the project. Open with something like:

> Read CLAUDE.md. Build 1: add the timer library, sessions with buffer pools,
> meetings, localStorage persistence, and history with drift recorded at timer,
> session and meeting level. Keep it one self-contained index.html.

Useful in-session commands:

| Command | Does |
|---|---|
| `/clear` | Wipe context between unrelated tasks — do this often |
| `/compact` | Summarise a long session instead of losing it |
| `Esc` | Interrupt mid-response and redirect |
| `#` | Prepend a message to append that instruction to `CLAUDE.md` |

---

## 4. Test as you go

Claude Code can serve the file so Safari treats it as a real web page, which
matters because storage and service workers behave differently on `file://`:

```bash
cd ~/Projects/forum-timer
python3 -m http.server 8080
```

Open `http://localhost:8080` in Safari. Stop the server with `Ctrl-C`.

---

## 5. Publish (Build 3, later)

Create an empty repo on github.com named `forum-timer`, then:

```bash
cd ~/Projects/forum-timer
git remote add origin https://github.com/YOUR-USERNAME/forum-timer.git
git branch -M main
git push -u origin main
```

On GitHub: **Settings → Pages → Source: Deploy from a branch → main / (root)**.

Two minutes later the tool is live at:

```
https://YOUR-USERNAME.github.io/forum-timer/
```

That link is all anyone needs. Their history saves in their own browser.

---

## Habits worth keeping

- Commit at every working state: `git add -A && git commit -m "what changed"`.
- `/clear` between unrelated tasks. Stale context causes more bad output than
  anything else.
- When a decision gets made in conversation, put it in `CLAUDE.md` so the next
  session inherits it. That file is the project's memory, not the chat log.
