/* Forum Timer — service worker
   Offline-first. Bump VERSION on every deploy: the new worker precaches, then
   tells the page an update is ready. Nothing here is required for the app to
   run — index.html works standalone if this file is absent. */

const VERSION = "forum-timer-v3.2.5";
const ASSETS = ["./", "./index.html", "./manifest.webmanifest"];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(VERSION)
      // addAll fails the whole install if any single asset 404s, so add
      // individually and tolerate misses.
      .then((c) => Promise.all(ASSETS.map((a) => c.add(a).catch(() => null))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  if (new URL(req.url).origin !== location.origin) return;

  e.respondWith((async () => {
    const cache = await caches.open(VERSION);
    const cached = await cache.match(req, { ignoreSearch: true });

    const update = fetch(req)
      .then((res) => { if (res && res.ok) cache.put(req, res.clone()); return res; })
      .catch(() => null);

    if (cached) { e.waitUntil(update); return cached; }   // stale-while-revalidate

    const fresh = await update;
    if (fresh) return fresh;

    if (req.mode === "navigate") {                        // offline navigation
      const fallback = (await cache.match("./index.html")) || (await cache.match("./"));
      if (fallback) return fallback;
    }
    return new Response("Offline and not cached.", { status: 503, statusText: "Offline" });
  })());
});

self.addEventListener("message", (e) => {
  if (e.data === "skipWaiting") self.skipWaiting();
});
