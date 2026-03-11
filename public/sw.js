// Nova Service Worker
importScripts('/scramjet/scramjet.bundle.js');

const { ScramjetServiceWorker } = $scramjetLoadController();

const sw = new ScramjetServiceWorker();

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()));

self.addEventListener('fetch', (e) => {
  if (sw.shouldRoute(e)) {
    e.respondWith(sw.handleFetch(e));
  }
});
