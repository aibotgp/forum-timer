# Setting up the build environment

Everything below is copy-paste into Terminal on the MacBook.

> **Project location.** This project lives in your iCloud folder, not
> `~/Projects`. Every command below uses a `PROJECT` shortcut so you never type
> the long path. Run this once per Terminal window (it sets the shortcut for
> that window only):
>
> ```bash
> PROJECT="$HOME/Library/Mobile Documents/com~apple~CloudDocs/Downloads/AI Project/Forum Timer"
> ```
>
> After that, `cd "$PROJECT"` takes you to the folder from anywhere.

---

## 1. Install Claude Code  ✅ done

```bash
curl -fsSL https://claude.ai/install.sh | bash
claude --version
```

**If you get `zsh: command not found: claude`**, the installer put `claude` in
`~/.local/bin`, which isn't on your PATH yet. Add it once:

```bash
echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.zshrc && source ~/.zshrc
```

`claude doctor` prints diagnostics if anything still looks off.

---

## 2. The project folder  ✅ done

The folder is created, git is initialised on `main`, and every build so far is
committed. It contains:

| File | What it is |
|---|---|
| `index.html` | The entire application. This is the deliverable. |
| `sw.js` | Service worker — optional sidecar, enables offline |
| `manifest.webmanifest` | PWA metadata — optional sidecar |
| `CLAUDE.md` | Project context. Claude Code reads this every session. |
| `SETUP.md` | This file |
| `README.md` | The public front page on GitHub |
| `FONT-LICENSES.txt` | OFL notices for the embedded typefaces — must not be deleted |
| `Design/` | Design spec and the visual reference prototype |

> **iCloud note.** Keep the folder fully downloaded: right-click it in Finder →
> **Keep Downloaded**. A file iCloud has offloaded can confuse git and the
> local web server.

---

## 3. Build with Claude Code

```bash
cd "$PROJECT"
claude
```

First run opens a browser to log in — use the account your Max plan is on.
Claude Code reads `CLAUDE.md` automatically at the start of every session, so
you never re-explain the project.

| Command | Does |
|---|---|
| `/clear` | Wipe context between unrelated tasks — do this often |
| `/compact` | Summarise a long session instead of losing it |
| `Esc` | Interrupt mid-response and redirect |
| `#` | Prefix a message with `#` to append that instruction to `CLAUDE.md` |

---

## 4. Test locally

The app uses `localStorage` and a service worker, and **both behave differently
on `file://`**. Always test through the local server, not by double-clicking:

```bash
cd "$PROJECT"
python3 -m http.server 8080
```

Then open **http://localhost:8080** in Safari.

The server holds the Terminal window open and prints a line per request — that
is normal, it is not stuck. `Ctrl-C` stops it and gives your prompt back. To
run other commands while it serves, open a second Terminal tab with `Cmd-T`.

---

## 5. Publish to GitHub Pages

### 5a. One-time cleanup

macOS scatters `.DS_Store` files into every folder and one got committed. This
removes it from git and stops it coming back:

```bash
cd "$PROJECT"
git rm --cached .DS_Store
git add -A
git commit -m "Add .gitignore, README, font licences; drop .DS_Store"
```

### 5b. Create the repository

On github.com: **New repository** → name it `forum-timer` → **Public** →
do **not** add a README, .gitignore or licence (the folder already has them) →
**Create repository**.

### 5c. Push

```bash
cd "$PROJECT"
git remote add origin "https://github.com/aibotgp/forum-timer.git"
git branch -M main
git push -u origin main
```

GitHub will ask you to sign in — a browser window, or a Personal Access Token
as the password if it asks in Terminal. It will not accept your account
password.

### 5d. Turn on Pages

On the repository: **Settings → Pages → Source: Deploy from a branch →
Branch: `main` → Folder: `/ (root)` → Save.**

Two minutes later the tool is live at:

```
https://aibotgp.github.io/forum-timer/
```

That link is all anyone needs. Their history saves in their own browser.

### 5e. Check it worked

Open the link and confirm:

- the Home screen appears with the sample meeting
- the typefaces look right — a chunky slab for headings, not Times
- **Data → Offline** reads *"ready — works with no internet"* after one reload
- turn off Wi-Fi, reload — it still opens

Then install it: in Safari, **File → Add to Dock**.

---

## 6. Publishing a change

Every deploy needs the service worker version bumped, or people keep the old
cached copy forever:

1. Open `sw.js` and increment `VERSION`, e.g. `forum-timer-v3.0.0` →
   `forum-timer-v3.1.0`.
2. Then:

```bash
cd "$PROJECT"
git add -A
git commit -m "what changed"
git push
```

Pages redeploys in a minute or two. Anyone with the app already open gets a
*"A new version is ready — Reload"* prompt.

---

## 7. Office server mirror — later

Not set up yet. When you want it, the whole job is copying `index.html`,
`sw.js` and `manifest.webmanifest` into whatever folder that machine serves as
a website. It must be served over `http://` or `https://`, not opened as a
file, or the offline install will not work.

---

## Habits worth keeping

- Commit at every working state: `git add -A && git commit -m "what changed"`.
- `/clear` between unrelated tasks. Stale context causes more bad output than
  anything else.
- When a decision gets made in conversation, put it in `CLAUDE.md` so the next
  session inherits it. That file is the project's memory, not the chat log.
- Before anything risky, **Data → Export backup**. History lives only in your
  browser, and a browser reset takes it with it.
