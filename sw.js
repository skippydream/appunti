/* ============================================================================
   Service Worker — rende l'app installabile e utilizzabile offline.
   Strategie:
   - /api/state            -> SEMPRE rete (è la sincronizzazione, mai cache)
   - navigazioni (HTML)     -> network-first, fallback alla shell in cache (offline)
   - altri asset (css/js/   -> stale-while-revalidate: risponde subito dalla cache
     font/MathJax/icone)        e aggiorna in background
   Gli asset versionati (?v=) cambiano URL a ogni deploy, quindi la cache si
   rinfresca da sola; la versione qui sotto va bumpata se cambia questo file.
   ========================================================================== */
const VERSION = 'appunti-v1';
const CORE = [
  './', './index.html', './manifest.json',
  './icons/icon-192.png', './icons/icon-512.png',
  './icons/apple-touch-icon.png', './icons/favicon-32.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(VERSION)
      .then((cache) => cache.addAll(CORE))
      .then(() => self.skipWaiting())
      .catch(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;                 // PUT di sync ecc.: lascia passare
  const url = new URL(req.url);
  if (url.pathname.startsWith('/api/')) return;     // stato sync: sempre rete

  // Navigazioni: network-first con fallback alla shell offline.
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(VERSION).then((c) => c.put('./index.html', copy)).catch(() => {});
          return res;
        })
        .catch(() => caches.match('./index.html').then((r) => r || caches.match('./')))
    );
    return;
  }

  // Altri asset: stale-while-revalidate.
  event.respondWith(
    caches.match(req).then((cached) => {
      const network = fetch(req)
        .then((res) => {
          if (res && (res.ok || res.type === 'opaque')) {
            const copy = res.clone();
            caches.open(VERSION).then((c) => c.put(req, copy)).catch(() => {});
          }
          return res;
        })
        .catch(() => cached);
      return cached || network;
    })
  );
});
