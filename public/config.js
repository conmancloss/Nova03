// Nova - Scramjet Config
// Uses a public Wisp relay so WebSockets work without a backend server.
// Wisp handles the actual proxying tunneled over WebSocket.

const WISP_URL = (() => {
  const loc = location;
  // Use wss:// if on https, ws:// if on http
  const proto = loc.protocol === 'https:' ? 'wss' : 'ws';
  // Public Wisp relay — reliable, maintained by MercuryWorkshop (Scramjet authors)
  return `${proto}://wisp.mercurywork.shop/`;
})();

// Initialize the Scramjet controller
const __scramjet__controller = new ScramjetController({
  prefix: '/scramjet-prefix/',
  files: {
    wasm: '/scramjet/scramjet.wasm.wasm',
    all:  '/scramjet/scramjet.all.js',
    sync: '/scramjet/scramjet.sync.js',
  },
  codec: {
    encode: (url) => (url ? encodeURIComponent(url) : url),
    decode: (url) => (url ? decodeURIComponent(url) : url),
  },
  flags: {
    serviceworkers: false,
    syncxhr: false,
    strictRewrites: true,
    rewriterLogs: false,
    captureErrors: true,
    cleanErrors: true,
    sourcemaps: false,
    allowInvalidJs: true,
    allowFailedIntercepts: true,
  },
});

// Patch bare transport to use Wisp relay
// This is the key part that makes it work on Vercel (no backend WS server needed)
__scramjet__controller.wisp = WISP_URL;
