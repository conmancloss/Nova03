const WISP_URL = (location.protocol === 'https:' ? 'wss' : 'ws') + '://wisp.mercurywork.shop/';
const { ScramjetController } = $scramjetLoadController();
window.__scramjet__controller = new ScramjetController({
  prefix: '/scramjet-prefix/',
  files: { wasm: '/scramjet/scramjet.wasm.wasm', all: '/scramjet/scramjet.all.js', sync: '/scramjet/scramjet.sync.js' },
  codec: { encode: url => url ? encodeURIComponent(url) : url, decode: url => url ? decodeURIComponent(url) : url },
  flags: { serviceworkers:false, syncxhr:false, rewriterLogs:false, captureErrors:true, cleanErrors:true, sourcemaps:false, allowInvalidJs:true, allowFailedIntercepts:true },
});
window.__nova__wispUrl = WISP_URL;
