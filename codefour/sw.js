// sw.js — CodeFour service worker
// Bump this version string whenever you ship new assets so old caches get cleared out.
const CACHE_VERSION = 'codefour-v1';
const CACHE_NAME = `${CACHE_VERSION}`;

// Adjust this list to match the actual files your game needs to run offline.
// Keep it to the app shell (HTML/CSS/JS/icons) — don't try to cache every puzzle answer here.
const APP_SHELL = [
  '/codefour/',
  '/codefour/index.html',
  '/codefour/manifest.json',
  '/codefour/icons/icon-192.png',
  '/codefour/icons/icon-512.png'
  // add your CSS and JS bundle paths here, e.g.:
  // '/codefour/styles.css',
  // '/codefour/app.js',
];

// Install: pre-cache the app shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

// Activate: clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

// Fetch: cache-first for app shell assets, network-first fallback for everything else
self.addEventListener('fetch', (event) => {
  // Only handle GET requests within our scope
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(event.request)
        .then((networkResponse) => {
          // Cache a copy of successful same-origin responses for next time
          if (
            networkResponse &&
            networkResponse.status === 200 &&
            event.request.url.startsWith(self.location.origin)
          ) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          // Offline fallback: serve the app shell for navigation requests
          if (event.request.mode === 'navigate') {
            return caches.match('/codefour/');
          }
        });
    })
  );
});
