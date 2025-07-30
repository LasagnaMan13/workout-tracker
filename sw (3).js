const CACHE_NAME = 'workout-v3';
const urlsToCache = [
  '/', 
  '/index.html',
  '/manifest.json',
  '/icon.png'
  // add other static assets here if needed
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('activate', event => {
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
  const { request } = event;
  const url = request.url;

  // 1) Always fetch a fresh HTML shell on navigation
  if (request.mode === 'navigate') {
n    event.respondWith(fetch(request));
    return;
  }

  // 2) Network‑first for your Firebase DB requests
  if (url.includes('workout-tracker-130ff-default-rtdb.firebaseio.com')) {
    event.respondWith(
      fetch(request)
        .then(response => {
          // (Optional) Cache a copy if you want offline fallback:
          // const clone = response.clone();
          // caches.open(CACHE_NAME).then(c => c.put(request, clone));
          return response;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  // 3) Cache‑first for everything else
  event.respondWith(
    caches.match(request)
      .then(cached => cached || fetch(request))
  );
});
