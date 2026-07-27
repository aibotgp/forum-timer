#!/usr/bin/env bash
# Sanity check before committing. Catches the failure mode that shipped an
# empty Cargo.toml and broke every build: a file truncated to zero bytes.
set -u
fail=0
for f in index.html sw.js manifest.webmanifest app-icon.png README.md \
         src-tauri/Cargo.toml src-tauri/tauri.conf.json src-tauri/build.rs \
         src-tauri/src/main.rs .github/workflows/desktop.yml; do
  if [ ! -f "$f" ]; then echo "MISSING  $f"; fail=1; continue; fi
  s=$(wc -c < "$f")
  if [ "$s" -lt 20 ]; then echo "TOO SMALL ($s bytes)  $f"; fail=1; else echo "ok  $s  $f"; fi
done
echo "--- versions must match ---"
grep -o 'APP_VERSION = "[0-9.]*"' index.html
grep -o 'forum-timer-v[0-9.]*' sw.js | head -1
grep -o '"version": "[0-9.]*"' src-tauri/tauri.conf.json
grep -o '^version = "[0-9.]*"' src-tauri/Cargo.toml
[ $fail -eq 0 ] && echo "ALL FILES OK" || { echo "PROBLEMS FOUND"; exit 1; }
