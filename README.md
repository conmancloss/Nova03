# Nova — Vercel Edition

Fast web proxy powered by **Scramjet 2.0** + public **Wisp relay**.  
No backend server required — deploys 100% to Vercel's static hosting.

---

## How It Works

Instead of running a WebSocket server yourself (which Vercel doesn't support),  
Nova uses a **public Wisp relay** at `wss://wisp.mercurywork.shop/` — maintained  
by the same team that makes Scramjet. All WebSocket traffic tunnels through it.

---

## Deploy to Vercel (2 steps)

### Option A — GitHub (recommended)

1. Push this folder to a new GitHub repo
2. Go to [vercel.com](https://vercel.com) → **New Project** → import your repo
3. Settings:
   - **Framework Preset:** `Other`
   - **Output Directory:** `public`
   - **Build Command:** *(leave blank)*
4. Click **Deploy** ✓

### Option B — Vercel CLI

```bash
npm i -g vercel
cd nova-vercel
vercel --prod
```

---

## File Structure

```
nova-vercel/
├── public/
│   ├── index.html              # Main UI
│   ├── config.js               # Scramjet config + Wisp relay URL
│   ├── sw.js                   # Service worker
│   ├── games.json              # Game list (edit to add/remove games)
│   └── scramjet/
│       ├── scramjet.bundle.js  # Main Scramjet bundle
│       ├── scramjet.all.js     # Full Scramjet (SW context)
│       ├── scramjet.sync.js    # Sync XHR worker
│       └── scramjet.wasm.wasm  # WASM JS rewriter
└── vercel.json                 # Headers + routing config
```

---

## Changing the Wisp Relay

Edit `public/config.js` and change `WISP_URL` to any Wisp-compatible server:

```js
const WISP_URL = 'wss://your-wisp-server.example.com/';
```

Known public relays:
- `wss://wisp.mercurywork.shop/` — MercuryWorkshop (Scramjet authors)
- `wss://anura.pro/wisp` — Anura project

---

## Adding Games

Edit `public/games.json`:

```json
{ "name": "My Game", "url": "https://example.com/game", "image": "https://example.com/icon.png" }
```

---

> Nova is intended for educational use. Use responsibly.
# Nova03
