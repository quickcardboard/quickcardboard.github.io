/* Prism service worker
   - The game page is fetched from the network first, so a new version reaches players as soon as they are online.
     The last copy is kept and used when they are offline.
   - Icons and other files from this site are served from the cache and refreshed in the background.
   - Fonts and the share-image library (Google Fonts, cdnjs) are cached after their first load, so they work offline too.
   Bump VERSION whenever prism.html, the icons or this file change in a way that must reach players. */
const VERSION = 'v1';
const CORE = `prism-core-${VERSION}`;      // this game's own files
const EXT = `prism-ext-${VERSION}`;        // fonts and scripts loaded from other sites
const PAGE = './prism.html';               // change this if you rename the game page
const PRECACHE = [PAGE, './manifest.webmanifest', './icons/prism-192.png', './icons/prism-512.png', './icons/prism-maskable-512.png', './icons/prism-180.png'];

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CORE);
    // one at a time and tolerant: a single missing file must not stop the worker from installing
    await Promise.allSettled(PRECACHE.map(url => cache.add(new Request(url, { cache: 'reload' }))));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    for (const key of await caches.keys()) if (key.startsWith('prism-') && key !== CORE && key !== EXT) await caches.delete(key);   // only this game's caches
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return;

  if (req.mode === 'navigate') { event.respondWith(networkFirstPage(req)); return; }
  if (url.origin === self.location.origin) { event.respondWith(staleWhileRevalidate(req, CORE)); return; }
  if (/(^|\.)(googleapis|gstatic)\.com$|(^|\.)cdnjs\.cloudflare\.com$/.test(url.hostname)) { event.respondWith(staleWhileRevalidate(req, EXT)); }
  // anything else (analytics, other sites) is left alone
});

async function networkFirstPage(req) {
  const cache = await caches.open(CORE);
  try {
    const res = await fetch(req);
    if (res.ok) cache.put(req, res.clone());
    return res;
  } catch (err) {
    return (await cache.match(req, { ignoreSearch: true })) || (await cache.match(PAGE)) ||
      new Response('You are offline, and Prism has not been saved on this device yet.', { status: 503, headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
  }
}

async function staleWhileRevalidate(req, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(req);
  const refresh = fetch(req).then(res => { if (res && (res.ok || res.type === 'opaque')) cache.put(req, res.clone()); return res; }).catch(() => null);
  if (cached) { refresh.catch(() => {}); return cached; }
  return (await refresh) || Response.error();
}
