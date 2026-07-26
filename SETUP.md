# Setting up the build environment

Ten minutes, once. Everything below is copy-paste into Terminal on the MacBook.

> **Project location.** This project lives in your iCloud folder, not
> `~/Projects`. Every command below uses a `PROJECT` shortcut so you never type
> the long path. Run this once per Terminal window (it sets the shortcut for
> that window):
>
> ```bash
> PROJECT="$HOME/Library/Mobile Documents/com~apple~CloudDocs/Downloads/AI Project/Forum Timer"
> ```
>
> After that, `cd "$PROJECT"` takes you to the folder from anywhere.

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

**If you get `zsh: command not found: claude`**, the installer put `claude` in
`~/.local/bin`, which isn't on your PATH yet. Add it once:

```bash
echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.zshrc && source ~/.zshrc
```

Then `claude --version` should print the version. `claude doctor` prints
diagnostics if anything still looks off.

---

## 2. The project folder  ✅ already done

The folder is created, git is initialised on `main`, and Phase 1 is committed.
For reference, this is what set it up (you do **not** need to run it again):

```bash
cd "$PROJECT"
git init
```

The folder already contains `CLAUDE.md`, `SETUP.md`, and `index.html` (the
Phase 1 timer), all committed under `Phase 1: timer engine`.

> **iCloud note.** Because the folder syncs through iCloud Drive, make sure it
> stays fully downloaded: System Settings → Apple ID → iCloud → Optimise Mac
> Storage **off** for this to be safe offline, or right-click the folder in
> Finder → **Keep Downloaded**. A file that iCloud has offloaded can confuse
> git and the local web server.

---

## 3. Build with Claude Code

```bash
cd "$PROJECT"
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
| `#` | Prepend a message with `#` to append that instruction to `CLAUDE.md` |

---

## 4. Test as you go

Once persistence lands (Build 1), serve the file so Safari treats it as a real
web page — `localStorage` and service workers behave differently on `file://`:

```bash
cd "$PROJECT"
python3 -m http.server 8080
```

Open `http://localhost:8080` in Safari. Stop the server with `Ctrl-C`.

For the current Phase 1 file there's no storage yet, so you can just
double-click `index.html` to open it.

---

## 5. Publish (Build 3, later)

Create an empty repo on github.com named `forum-timer`, then:

```bash
cd "$PROJECT"
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
