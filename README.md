## Affordmed URL Shortener

A production-grade HTTP URL shortener microservice implementing:

<p align="center">
  <img src="Working Demo 1.png" alt="Homepage" width="100%"/>
</p>

- Mandatory logging middleware (file-based JSONL at `logs/requests.log`).
- Short link creation with optional custom shortcode and validity (minutes).
- Global uniqueness of shortcodes, proper redirects, and expiry handling.
- Analytics: total clicks and recent events for a shortcode.

### Run locally

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the server:
   ```bash
   npm run dev
   ```
   Server runs on `http://localhost:3000`.

### API

- Create short URL
  - Method: POST
  - Route: `/shorturls`
  - Body:
    ```json
    { "url": "https://example.com", "validity": 60, "shortcode": "abc01" }
    ```
  - Response (201):
    ```json
    { "shortLink": "http://host/abc01", "expiry": "2025-01-01T00:00:00Z" }
    ```

- Redirect
  - GET `/:code` → 302 to original URL (410 if expired, 404 if not found)

- Retrieve stats
  - GET `/shorturls/:code/stats`

### Notes

- SQLite database file: `db.sqlite` (auto-created).
- Logs stored in `logs/requests.log` in JSON lines format.

### Screenshots

<p align="center">
  <img src="Working Demo 2.png" alt="Stats Screenshot" width="80%"/>
</p>





