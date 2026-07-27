Desktop builds of Forum Timer. You do not need these — the tool runs in any
browser at https://aibotgp.github.io/forum-timer/ and keeps working offline
once opened. Install one of these only if you would rather have an application.

**macOS** — take the `aarch64` download for Apple Silicon (M1 and later) or
the `x64` one for an Intel Mac. Not sure which you have: Apple menu → About
This Mac; "Apple M…" means Apple Silicon.

Open the `.dmg` and drag Forum Timer to Applications. Double-click it. macOS
will refuse the first launch, saying it "could not verify" the app — that is
expected, and it means the app is not notarised, not that anything is wrong
with it. Click **Done**, then:

**System Settings → Privacy & Security**, scroll down to Security, and click
**Open Anyway** next to the Forum Timer message. Authenticate, and confirm
once more. That is it — every later launch is normal.

Prefer Terminal? This does the same thing in one line:

```
xattr -dr com.apple.quarantine "/Applications/Forum Timer.app"
```

Notarising the app would remove this step entirely, but it requires a paid
Apple Developer account. If you would rather not bother, use the web version
and add it to your Dock — it is the same app.

**Windows** — run the `.exe` installer. SmartScreen will say the publisher is
unknown: click **More info**, then **Run anyway**. Once only.

Your meetings and history live on your own computer, and the desktop app keeps
them separately from the browser version. Use **Data → Export backup** in one
and import it in the other to move them across.
