try {
  Object.defineProperty(navigator, 'serviceWorker', { get: () => undefined, configurable: true });
} catch(e) {}
if (typeof self.SharedWorker === 'undefined') self.SharedWorker = function(){};
if (typeof self.localStorage === 'undefined') self.localStorage = {};

importScripts('/scramjet/scramjet.all.js');

const { ScramjetServiceWorker } = $scramjetLoadWorker();
const sw = new ScramjetServiceWorker();

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(clients.claim()));

self.addEventListener('fetch', async e => {
  if (!sw.config) {
    try { await sw.loadConfig(); } catch(_) {}
  }
  if (sw.config && sw.route(e)) {
    e.respondWith(sw.fetch(e));
  }
});
