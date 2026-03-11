// Nova Service Worker
importScripts('/scramjet/scramjet.bundle.js');

const { ScramjetServiceWorker } = $scramjetLoadWorker();

const sw = new ScramjetServiceWorker();

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()));

self.addEventListener('fetch', (e) => {
  if (sw.route(e)) {
    e.respondWith(sw.fetch(e));
  }
});
