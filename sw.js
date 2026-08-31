const CACHE = 'yaris-care-20260831-35';
const ASSETS = [
  './',
  './index.html',
  './styles.css?v=20260831-35',
  './fuel.css?v=20260831-35',
  './gestures.css?v=20260831-35',
  './quick-icons.css?v=20260831-35',
  './nav-polish.css?v=20260831-35',
  './app.js?v=20260831-35',
  './manifest.webmanifest?v=20260831-35',
  './assets/nav-home.jpg?v=20260831-35',
  './assets/nav-checks.jpg?v=20260831-35',
  './assets/nav-records.jpg?v=20260831-35',
  './assets/nav-car.jpg?v=20260831-35',
  './assets/quick-odo.jpg?v=20260831-35',
  './assets/quick-expenses.jpg?v=20260831-35',
  './assets/quick-note.jpg?v=20260831-35'
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
