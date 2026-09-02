const CACHE = 'yaris-care-20260902-44';
const ASSETS = [
  './',
  './index.html',
  './styles.css?v=20260902-44',
  './fuel.css?v=20260902-44',
  './gestures.css?v=20260902-44',
  './quick-icons.css?v=20260902-44',
  './nav-polish.css?v=20260902-44',
  './compact-layout.css?v=20260902-44',
  './swipe-pages.css?v=20260902-44',
  './app.js?v=20260902-44',
  './manifest.webmanifest?v=20260902-44',
  './assets/nav-home.png?v=20260902-44',
  './assets/nav-checks.png?v=20260902-44',
  './assets/nav-records.png?v=20260902-44',
  './assets/nav-car.png?v=20260902-44',
  './assets/quick-odo-c.png?v=20260902-44',
  './assets/quick-expenses.svg?v=20260902-44',
  './assets/quick-note.svg?v=20260902-44'
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
