// Offline support. Bump CACHE when the list of files changes.
const CACHE = 'ma-czech-v2';
const FILES = ['./', 'index.html', 'data.js', 'app.js', 'manifest.webmanifest', 'icons/icon.svg', 'fonts/hanken-400.ttf', 'fonts/hanken-500.ttf'];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE)
            .then(cache => cache.addAll(FILES.map(f => new Request(f, { cache: 'reload' }))))
            .then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys()
            .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
            .then(() => self.clients.claim())
    );
});

// Network first so the page and scripts always come from the same deploy; cache when offline.
self.addEventListener('fetch', (event) => {
    const { request } = event;
    if (request.method !== 'GET' || new URL(request.url).origin !== self.location.origin) return;
    const key = request.mode === 'navigate' ? 'index.html' : request;
    event.respondWith(
        fetch(request, { cache: 'no-cache' })
            .then(res => {
                if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(key, copy)); }
                return res;
            })
            .catch(() => caches.match(key, { ignoreSearch: true }))
    );
});
