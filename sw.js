const CACHE = 'yaris-care-20260831-36';
const ASSETS = [
  './',
  './index.html',
  './styles.css?v=20260831-36',
  './fuel.css?v=20260831-36',
  './gestures.css?v=20260831-36',
  './quick-icons.css?v=20260831-36',
  './nav-polish.css?v=20260831-36',
  './app.js?v=20260831-36',
  './manifest.webmanifest?v=20260831-36',
  './assets/nav-home.png?v=20260831-36',
  './assets/nav-checks.png?v=20260831-36',
  './assets/nav-records.png?v=20260831-36',
  './assets/nav-car.png?v=20260831-36',
  './assets/quick-odo.png?v=20260831-36',
  './assets/quick-expenses.png?v=20260831-36',
  './assets/quick-note.png?v=20260831-36'
];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS)));
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(key => key !== CACHE).map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const requestUrl = new URL(event.request.url);
  if (requestUrl.origin !== self.location.origin) return;

  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request, { cache: 'no-store' })
        .then(response => {
          const copy = response.clone();
          caches.open(CACHE).then(cache => cache.put('./index.html', copy));
          return response;
        })
        .catch(() => caches.match('./index.html'))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then(cached =>
      cached || fetch(event.request).then(response => {
        const copy = response.clone();
        caches.open(CACHE).then(cache => cache.put(event.request, copy));
        return response;
      })
    )
  );
});
