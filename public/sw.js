try {
  Object.defineProperty(navigator, 'serviceWorker', {
    get: () => undefined,
    configurable: true
  });
} catch(e) {}

if (typeof self.SharedWorker === 'undefined') self.SharedWorker = function(){};
if (typeof self.localStorage === 'undefined') self.localStorage = {};

importScripts('/scramjet/scramjet.all.js');

const { ScramjetServiceWorker } = $scramjetLoadWorker();
const sw = new ScramjetServiceWorker();

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(clients.claim()));
self.addEventListener('fetch', e => {
  if (sw.route(e)) e.respondWith(sw.fetch(e));
});
