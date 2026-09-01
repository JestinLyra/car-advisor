const CACHE = 'yaris-care-20260901-42';
const ASSETS = [
  './',
  './index.html',
  './styles.css?v=20260901-42',
  './fuel.css?v=20260901-42',
  './gestures.css?v=20260901-42',
  './quick-icons.css?v=20260901-42',
  './nav-polish.css?v=20260901-42',
  './compact-layout.css?v=20260901-42',
  './app.js?v=20260901-42',
  './manifest.webmanifest?v=20260901-42',
  './assets/nav-home.png?v=20260901-42',
  './assets/nav-checks.png?v=20260901-42',
  './assets/nav-records.png?v=20260901-42',
  './assets/nav-car.png?v=20260901-42',
  './assets/quick-odo-c.png?v=20260901-42',
  './assets/quick-expenses.svg?v=20260901-42',
  './assets/quick-note.svg?v=20260901-42'
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
