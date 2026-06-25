/* Time Bender — service worker */
const CACHE = "time-bender-v5";
const FB_VER = "10.12.5";
const ASSETS = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./icon.svg",
  "./icon-192.png",
  "./icon-512.png",
  "https://www.gstatic.com/firebasejs/" + FB_VER + "/firebase-app.js",
  "https://www.gstatic.com/firebasejs/" + FB_VER + "/firebase-auth.js",
  "https://www.gstatic.com/firebasejs/" + FB_VER + "/firebase-firestore.js"
];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(ASSETS).catch(() => {})).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const u = new URL(req.url);

  // Firebase / Google backends (Firestore realtime, auth tokens, OAuth): never cache or intercept
  if (
    u.hostname.endsWith("googleapis.com") ||
    u.hostname.endsWith("firebaseio.com") ||
    u.hostname.endsWith("firebaseapp.com") ||
    u.hostname.endsWith("google.com")
  ) return;

  const isHTML = req.mode === "navigate" || req.destination === "document";
  if (isHTML) {
    // network-first for the page, fall back to cached shell offline
    e.respondWith(
      fetch(req).then((r) => {
        const cp = r.clone();
        caches.open(CACHE).then((c) => c.put("./index.html", cp));
        return r;
      }).catch(() => caches.match("./index.html"))
    );
    return;
  }

  // cache-first for static assets (incl. gstatic Firebase SDK)
  e.respondWith(
    caches.match(req).then((c) => c || fetch(req).then((r) => {
      if (u.origin === location.origin || u.hostname === "www.gstatic.com") {
        const cp = r.clone();
        caches.open(CACHE).then((cc) => cc.put(req, cp));
      }
      return r;
    }).catch(() => c))
  );
});
