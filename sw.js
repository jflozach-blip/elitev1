'use strict';

const CACHE_NAME = 'member-elite-portal-v2';
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
      .then(cache => cache.addAll(APP_SHELL))
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

  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;

      return fetch(event.request)
        .then(response => {
          const copy = response.clone();

          if (response.ok && new URL(event.request.url).origin === self.location.origin) {
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
          }

          return response;
        })
        .catch(() => {
          if (event.request.mode === 'navigate') {
            return caches.match('./index.html');
          }

          return new Response('', {
            status: 408,
            statusText: 'Offline'
          });
        });
    })
  );
});