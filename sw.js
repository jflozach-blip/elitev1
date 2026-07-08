'use strict';

const CACHE_NAME = 'member-elite-portal-v3';

const APP_SHELL = [
  './',
  './index.html',
  './styles.css',
  './modules/date.js',
  './data/duties.js',
  './modal.js',
  './modals.js',
  './app.js',
  './summary-image.js',
  './rota-popup.js',
  './rota.html',
  './rota-elite.js',
  './elite-tools.css',
  './elite-lock.js',
  './elite-splash.js',
  './day-modal-elite.js',
  './payin-modal-filter.js',
  './rep-on-demand.js',
  './pwa-install.js',
  './manifest.json',
  './icon.svg',
  './maskable-icon.svg'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => Promise.allSettled(APP_SHELL.map(url => cache.add(url))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  const requestUrl = new URL(event.request.url);

  if (requestUrl.origin !== self.location.origin) return;

  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put('./', copy));
          return response;
        })
        .catch(() =>
          caches.match('./')
            .then(cachedRoot => cachedRoot || caches.match('./index.html'))
            .then(cachedPage => cachedPage || new Response('App unavailable offline', {
              status: 503,
              headers: { 'Content-Type': 'text/plain' }
            }))
        )
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;

      return fetch(event.request)
        .then(response => {
          if (response.ok) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
          }

          return response;
        })
        .catch(() => new Response('', {
          status: 408,
          statusText: 'Offline'
        }));
    })
  );
});
