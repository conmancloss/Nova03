// Nova Service Worker — Scramjet
importScripts('/scramjet/scramjet.bundle.js');

// The service worker intercepts all requests under the scramjet prefix
// and routes them through the Scramjet rewriter + Wisp transport.

let controller;

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('message', async (event) => {
  if (!event.data || event.data.scramjet$type !== 'loadConfig') return;

  const config = event.data.config;

  try {
    const { ScramjetServiceWorker } = await import('/scramjet/scramjet.bundle.js').catch(() => {
      // Already loaded via importScripts
      return {};
    });

    if (!controller) {
      // Re-init controller inside SW using posted config
      controller = new ScramjetController(config);
      controller.wisp = config.wisp || 'wss://wisp.mercurywork.shop/';
      await controller.swready;
    }
  } catch (e) {
    console.error('[Nova SW] init error:', e);
  }
});

// Let Scramjet handle fetch interception via its built-in SW runtime
// The scramjet.bundle.js sets up ScramjetServiceWorkerRuntime automatically
// when loaded inside a service worker context.
