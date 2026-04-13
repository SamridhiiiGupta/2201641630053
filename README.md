# ✂ Snip — URL Shortener

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-20.x-339933?style=flat-square&logo=node.js" />
  <img src="https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react" />
  <img src="https://img.shields.io/badge/SQLite-WAL-044a64?style=flat-square&logo=sqlite" />
  <img src="https://img.shields.io/badge/License-MIT-green?style=flat-square" />
</p>

A polished, production-ready URL shortener with a dark-themed React frontend, analytics dashboard, QR code generation, and a clean Express/SQLite backend.

---

## Features

- **Instant shortening** — nanoid-generated 6-char codes with collision retry
- **Custom aliases** — choose your own shortcode (e.g. `/my-launch`)
- **Link expiry** — set validity in minutes; expired links return 410
- **Click analytics** — browser, device, OS, referer, and daily click charts
- **QR code generation** — per-link QR codes, downloadable as PNG
- **Click caps** — limit how many times a link can be used
- **Dashboard** — search, filter, manage, and delete all links
- **JSONL request logging** — every request logged to `logs/requests.log`
- **Rate limiting** — 50 link creations per 15 minutes per IP
- **Security headers** — `helmet`, CORS, strict body size limit

---

## Project Structure

```
snip/
├── src/                        # Backend (Node.js / Express)
│   ├── index.js                # App bootstrap + middleware
│   ├── db/
│   │   └── connection.js       # SQLite init, schema, indexes
│   ├── routes/
│   │   └── shorturls.js        # All API routes + redirect handler
│   └── middlewares/
│       └── logger.js           # JSONL request logger
├── frontend/                   # Frontend (React + Vite)
│   ├── src/
│   │   ├── App.jsx             # Router root
│   │   ├── pages/
│   │   │   ├── Home.jsx        # Landing page + shortener form
│   │   │   └── Dashboard.jsx   # Link management dashboard
│   │   ├── components/
│   │   │   ├── ShortenerForm.jsx
│   │   │   ├── StatsModal.jsx  # Analytics overlay with charts
│   │   │   ├── Navbar.jsx
│   │   │   └── Toast.jsx
│   │   ├── hooks/
│   │   │   └── useToast.js
│   │   └── lib/
│   │       └── api.js          # API client
│   ├── index.html
│   └── vite.config.js
├── package.json
├── .gitignore
└── README.md
```

---

## Quickstart (Development)

### Prerequisites
- Node.js 18+ 
- npm 9+

### 1. Install dependencies

```bash
# Install backend deps
npm install

# Install frontend deps
cd frontend && npm install && cd ..
```

### 2. Start in development mode

Run backend and frontend in two terminals:

**Terminal 1 — Backend:**
```bash
npm run dev
# Server on http://localhost:3000
```

**Terminal 2 — Frontend (with hot reload):**
```bash
cd frontend && npm run dev
# UI on http://localhost:5173 (proxies API to :3000)
```

### 3. Health check

```
GET http://localhost:3000/health
→ { "status": "ok", "uptime": 12.3 }
```

---

## Production Build

```bash
# Build the React frontend
cd frontend && npm run build && cd ..

# Start the production server (serves built frontend + API)
npm start
# → http://localhost:3000
```

---

## API Reference

### Create short URL
```
POST /api/shorturls
Content-Type: application/json

{
  "url": "https://example.com",         // required
  "shortcode": "my-link",               // optional, 3–20 chars
  "validity": 1440,                     // optional, minutes
  "title": "My landing page",           // optional
  "maxClicks": 100                      // optional
}

201 Created
{ "shortLink": "http://localhost:3000/abc123", "shortcode": "abc123", "expiry": "...", "createdAt": "..." }
```

### List all links
```
GET /api/shorturls
→ Array of links with click counts
```

### Link analytics
```
GET /api/shorturls/:code/stats
→ Total clicks, daily chart data, browser/device/country breakdowns, recent events
```

### QR code
```
GET /api/shorturls/:code/qr
→ { "qr": "data:image/png;base64,..." }
```

### Delete link
```
DELETE /api/shorturls/:code
→ { "message": "Deleted successfully" }
```

### Redirect
```
GET /:code
→ 302 to original URL
   404 if not found
   410 if expired or click cap reached
```

---

## Error Codes

| Status | Meaning |
|-------:|---------|
| 400 | Invalid URL or shortcode format |
| 404 | Shortcode not found |
| 409 | Custom shortcode already taken |
| 410 | Expired or click limit reached |
| 429 | Rate limit exceeded |

---

## Deployment

### Option A — Render (Free tier)

1. Push to GitHub
2. Create a new **Web Service** on [render.com](https://render.com)
3. Set:
   - **Build command**: `npm install && cd frontend && npm install && npm run build`
   - **Start command**: `npm start`
   - **Environment**: `PORT=10000`
4. Deploy — Render gives you a free `*.onrender.com` domain

### Option B — Railway

```bash
npm install -g railway
railway login
railway init
railway up
```

### Option C — VPS / Self-hosted

```bash
# On your server
git clone <your-repo>
cd snip
npm run setup         # installs all deps
cd frontend && npm run build && cd ..
PORT=3000 npm start

# Use nginx as a reverse proxy (recommended)
# See nginx.conf.example below
```

### Option D — Docker

```bash
# Build
docker build -t snip .

# Run
docker run -p 3000:3000 -v $(pwd)/data:/app/data snip
```

> The SQLite database (`db.sqlite`) and logs (`logs/`) are written to the project root. In production, mount these as persistent volumes or switch to PostgreSQL.

---

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3000` | Server port |
| `NODE_ENV` | `development` | Set to `production` in prod |

---

## Architecture Notes

- **Stateless app layer** — all state lives in SQLite; easy to scale vertically
- **WAL mode** — SQLite Write-Ahead Logging handles concurrent reads without blocking
- **DB-enforced uniqueness** — `UNIQUE` constraint on `shortcode` prevents race conditions
- **Prepared statements** — all queries use `better-sqlite3` prepared statements for safety and performance
- **ESM nanoid interop** — dynamically imported to work within CommonJS runtime
- **Rate limiting** — 50 requests per 15 min per IP on creation endpoint

---

## Roadmap

- [ ] Password-protected links
- [ ] Bulk CSV import/export  
- [ ] OpenAPI/Swagger docs
- [ ] Webhook on click
- [ ] Postgres migration guide
- [ ] Redis cache for hot shortcodes
- [ ] Docker Compose + nginx example

---

## License

MIT — built with care for reliability and clarity.
