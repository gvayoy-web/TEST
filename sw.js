const CACHE_NAME = 'para-ti-v3';
const STATIC_ASSETS = [
    './',
    './index.html',
    './immersive.html',
    './mega-box.html',
    './letter-epic.html',
    './shared.css',
    './shared.js',
    './pencil-trail.js',
    './favicon.svg',
    './img/coocky.png',
    './img/coocky3enamorau.png',
    './img/cooky2.png',
    './img/cookyminiheart.png',
    './img/cookytata.png',
    './img/edgartung.png',
    './img/joji.png',
    './img/joji2.png',
    './img/joji3.png'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(STATIC_ASSETS);
        })
    );
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
            );
        })
    );
    self.clients.claim();
});

self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);

    if (event.request.method !== 'GET') return;

    /* Audio files: cache-first with network fallback */
    if (url.pathname.endsWith('.mp3')) {
        event.respondWith(
            caches.match(event.request).then((cached) => {
                if (cached) return cached;
                return fetch(event.request).then((response) => {
                    if (response.ok) {
                        const clone = response.clone();
                        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
                    }
                    return response;
                }).catch(() => new Response('', { status: 503, statusText: 'Offline' }));
            })
        );
        return;
    }

    /* CDN resources: stale-while-revalidate */
    if (url.origin !== self.location.origin) {
        event.respondWith(
            caches.match(event.request).then((cached) => {
                const fetchPromise = fetch(event.request).then((response) => {
                    if (response.ok) {
                        const clone = response.clone();
                        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
                    }
                    return response;
                }).catch(() => cached);
                return cached || fetchPromise;
            })
        );
        return;
    }

    /* Same-origin: cache-first */
    event.respondWith(
        caches.match(event.request).then((cached) => {
            return cached || fetch(event.request).then((response) => {
                if (response.ok) {
                    const clone = response.clone();
                    caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
                }
                return response;
            });
        }).catch(() => {
            if (event.request.destination === 'document') {
                return caches.match('./index.html');
            }
        })
    );
});
