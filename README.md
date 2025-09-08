## 🚀 Affordmed URL Shortener

<p align="center">
  <a href="https://github.com/SamridhiiiGupta/2201641630053"><img src="https://img.shields.io/badge/Repo-Affordmed%20URL%20Shortener-1abc9c?style=for-the-badge" alt="repo badge"/></a>
  <img src="https://img.shields.io/badge/Node.js-20.x-339933?style=for-the-badge&logo=node.js&logoColor=white" alt="node badge"/>
  <img src="https://img.shields.io/badge/Express-5.x-000000?style=for-the-badge&logo=express&logoColor=white" alt="express badge"/>
  <img src="https://img.shields.io/badge/SQLite-better--sqlite3-044a64?style=for-the-badge&logo=sqlite&logoColor=white" alt="sqlite badge"/>
</p>

<p align="center">
  <img src="Working Demo 2.png" alt="Homepage" width="100%"/>
</p>

Build once, share everywhere. This microservice creates globally unique short links, handles safe redirects, and tracks basic analytics — all with a clean API, robust validations, and a lightweight SQLite database.

### 🔗 Quick Links
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Screenshots](#️-screenshots)
- [Project Structure](#️-project-structure)
- [How to Run](#️-how-to-run)
- [API (Quick Reference)](#-api-quick-reference)
- [Example Commands](#-example-commands-powershell-friendly)
- [Future Enhancements](#-future-enhancements)
- [Acknowledgments](#-acknowledgments)

### ✨ Features
- **Mandatory Logging**: JSON lines written to `logs/requests.log` for every request.
- **Short Link Creation**: Optional custom shortcode and validity in minutes.
- **Uniqueness & Expiry**: Global uniqueness; 410 Gone when expired.
- **Redirection**: Standards-compliant 302 to original URL.
- **Analytics**: Total clicks and a recent interactions feed (timestamp, referer, coarse geo hint).
- **Security & Hardening**: `helmet`, CORS, strict JSON body limit.

### 🧰 Tech Stack
- **Runtime**: Node.js (Express)
- **Database**: SQLite (better-sqlite3)
- **ID Generator**: nanoid (ESM, dynamically imported)
- **Utilities**: dayjs
- **Dev**: nodemon

### 🖼️ Screenshots
<p align="center">
  <img src="Working Demo 1.png" alt="Working demo: redirect + stats" width="90%"/>
</p>

<p align="center">
  <img src="Working Demo 2.png" alt="Homepage" width="90%"/>
</p>

> Tip: You can also add your own screenshots in `docs/` and reference them below for richer context.

### ⚡ TL;DR (60‑second Quickstart)
```bash
git clone https://github.com/SamridhiiiGupta/2201641630053.git
cd 2201641630053
npm i && npm run dev
```

### 🗺️ Project Structure
```
.
├─ src/
│  ├─ index.js                 # Express app bootstrap
│  ├─ db/connection.js         # SQLite init + schema
│  ├─ routes/shorturls.js      # API + redirects + stats
│  └─ middlewares/logger.js    # JSONL request logger
├─ logs/                       # request logs (gitignored)
├─ docs/                       # optional screenshots (placeholders included)
├─ .env                        # environment (gitignored)
├─ db.sqlite                   # database (auto-created)
├─ package.json
└─ README.md
```

### ▶️ How to Run
1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the server (dev):
   ```bash
   npm run dev
   ```
3. Health check: open `http://localhost:3000/health` → `{ "status": "ok" }`

<details>
<summary><strong>Optional: Run with Node only (no dev reload)</strong></summary>

```bash
npm run start
```

</details>

### 📡 API (Quick Reference)
- **Create Short URL**
  - Method: POST
  - Route: `/shorturls`
  - Body:
    ```json
    { "url": "https://example.com", "validity": 60, "shortcode": "abc01" }
    ```
  - Success 201:
    ```json
    { "shortLink": "http://host/abc01", "expiry": "2025-01-01T00:00:00Z" }
    ```

- **Redirect**
  - GET `/:code` → 302 Location: original URL (410 if expired, 404 if not found)

- **Retrieve Stats**
  - GET `/shorturls/:code/stats` → JSON with totals and recent events

<details>
<summary><strong>Full error handling matrix</strong></summary>

- 400 Bad Request: invalid/missing `url` or bad `shortcode` format
- 409 Conflict: custom `shortcode` already exists
- 404 Not Found: unknown shortcode
- 410 Gone: known shortcode but expired

</details>

### 🧪 Example Commands (PowerShell friendly)
```powershell
$body = @{ url = 'https://example.com'; validity = 5 } | ConvertTo-Json
$resp = Invoke-RestMethod -Uri http://localhost:3000/shorturls -Method Post -ContentType 'application/json' -Body $body
$resp.shortLink
$code = ($resp.shortLink.Split('/')[-1])
Invoke-RestMethod -Uri ("http://localhost:3000/shorturls/{0}/stats" -f $code)
```

<details>
<summary><strong>cURL (Linux/macOS) equivalents</strong></summary>

```bash
curl -s -X POST http://localhost:3000/shorturls \
  -H 'Content-Type: application/json' \
  -d '{"url":"https://example.com","validity":5}'

curl -s http://localhost:3000/shorturls/<code>/stats
```

</details>

### 🧠 Why this design?
- **SQLite + better-sqlite3**: Embedded, zero-ops, safe concurrent writes (WAL).
- **Unique shortcodes**: DB constraint gives global uniqueness, even on races.
- **Logging middleware**: JSONL → easy to ship to ELK later.
- **ESM‑only nanoid**: Dynamically imported to interop with CommonJS.

### ❓ FAQ
<details>
<summary>How do I change the port?</summary>

Set `PORT=4000` in `.env` or when starting the process.

</details>

<details>
<summary>Where are logs written?</summary>

`logs/requests.log` in JSON lines format (gitignored).

</details>

### 🔒 Notes
- SQLite DB file auto-creates (`db.sqlite`).
- WAL/SHM files are gitignored.
- Request logs are appended to `logs/requests.log`.

### 🧩 System Design
- Read the full document: [`docs/SystemDesign.md`](docs/SystemDesign.md)
- Screenshot placeholder (replace with your capture):

<p align="center">
  <img src="docs/system-design-screenshot.png" alt="System Design Screenshot" width="90%"/>
</p>

### 🚧 Future Enhancements
- Rate limiting and API key support.
- Click analytics enrichment (IP to geo via MaxMind/Cloudflare headers).
- Batch link creation and CSV import/export.
- Pagination for stats; filters on date range.
- OpenAPI/Swagger docs and a minimal UI.
 - Dockerfile + one‑click deploy template (Render/Fly/Heroku‑like)

### ✅ Status Checklist
- [x] Core URL shortening with optional custom codes
- [x] Redirect with expiry handling
- [x] Basic analytics + recent events
- [x] Mandatory request logging middleware
- [x] GitHub repo and documentation

### 🙏 Acknowledgments
- Affordmed evaluation brief for clear specs and constraints.
- Open-source libraries: Express, better-sqlite3, nanoid, dayjs.

---

Made with care for reliability and clarity.
