## 🚀 Affordmed URL Shortener

<p align="center">
  <img src="Working Demo 2.png" alt="Homepage" width="100%"/>
</p>

Build once, share everywhere. This microservice creates globally unique short links, handles safe redirects, and tracks basic analytics — all with a clean API, robust validations, and a lightweight SQLite database.

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

### 🧪 Example Commands (PowerShell friendly)
```powershell
$body = @{ url = 'https://example.com'; validity = 5 } | ConvertTo-Json
$resp = Invoke-RestMethod -Uri http://localhost:3000/shorturls -Method Post -ContentType 'application/json' -Body $body
$resp.shortLink
$code = ($resp.shortLink.Split('/')[-1])
Invoke-RestMethod -Uri ("http://localhost:3000/shorturls/{0}/stats" -f $code)
```

### 🔒 Notes
- SQLite DB file auto-creates (`db.sqlite`).
- WAL/SHM files are gitignored.
- Request logs are appended to `logs/requests.log`.

### 🚧 Future Enhancements
- Rate limiting and API key support.
- Click analytics enrichment (IP to geo via MaxMind/Cloudflare headers).
- Batch link creation and CSV import/export.
- Pagination for stats; filters on date range.
- OpenAPI/Swagger docs and a minimal UI.

### 🙏 Acknowledgments
- Affordmed evaluation brief for clear specs and constraints.
- Open-source libraries: Express, better-sqlite3, nanoid, dayjs.

---

Made with care for reliability and clarity. Contributions and suggestions are welcome!
