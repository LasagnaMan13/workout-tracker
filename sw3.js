const CACHE_NAME = 'workout-v3';
const urlsToCache = [
  '/',            // so index.html is cached at /
  '/index.html',
  '/manifest.json',
  '/icon.png'
  // add other static assets here if needed
];

self.addEventListener('install', event => {
  // Pre-cache app shell
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('activate', event => {
  // Delete old caches
  event.waitUntil(
    caches.keys().then(cacheNames =>
      Promise.all(
        cacheNames
          .filter(name => name !== CACHE_NAME)
          .map(name => caches.delete(name))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  // Always fetch a fresh HTML shell on navigation requests
  if (event.request.mode === 'navigate') {
    event.respondWith(fetch(event.request));
    return;
  }

  // Otherwise try cache first, then network
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});
