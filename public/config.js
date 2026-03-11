const WISP_URL = (location.protocol === 'https:' ? 'wss' : 'ws') + '://wisp.mercurywork.shop/';

const { ScramjetController } = $scramjetLoadController();

window.__scramjet__controller = new ScramjetController({
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
    strictRewrites: true,
    captureErrors: true,
    cleanErrors: true,
    allowInvalidJs: true,
    allowFailedIntercepts: true,
  },
});

window.__scramjet__controller.wisp = WISP_URL;
