# System Design (Concise)

- Architecture
  - Thin HTTP API (Express) with middleware pipeline: helmet, CORS, JSON parsing, request logging, routes.
  - Persistence via SQLite (better-sqlite3) with WAL; single-process service.
  - Stateless app layer; state in DB; JSONL logs for traceability; /health for liveness.

- Data Modeling
  - short_urls: id (PK), shortcode (UNIQUE), original_url, created_at, expires_at (nullable), is_custom (bool)
  - click_events: id (PK), shortcode, clicked_at, referer, user_agent, ip, country_hint (nullable)

- Key Decisions
  - SQLite + better-sqlite3: zero-ops, fast local dev, WAL concurrency; ideal for single-node.
  - Nanoid (ESM via dynamic import): compact, low-collision IDs; CJS interop preserved.
  - JSONL logs: simple, append-only; ready for ELK/Loki shipping.

- API
  - POST /shorturls → create (optional custom shortcode, validity minutes)
  - GET /:code → 302 redirect (404/410 for missing/expired)
  - GET /shorturls/:code/stats → totals + recent events

- Security & Resilience
  - URL/shortcode validation; JSON body size limit; helmet; CORS; DB-enforced uniqueness.
  - Centralized error handler; no stack traces leaked; clear 400/404/409/410 semantics.

- Observability
  - JSONL request logs (ts, id, method, url, status, duration, ip, ua).
  - Click event trail for audit and analytics.

- Scalability Path
  - Vertical first; migrate to Postgres later with similar schema; keep API stable.
  - Add caching for hot lookups; optional CDN edge redirects.

- Maintainability
  - Clear module boundaries (routes, middleware, db); prepared SQL.
  - Deterministic behavior and scripted verification; documented flows.

- Assumptions
  - Single-region, single-instance acceptable; validity measured from creation time.
  - Basic analytics sufficient; ip stored as a coarse hint only.

- Future Enhancements
  - Rate limiting, API keys; OpenAPI docs + minimal UI; geo enrichment; CI/CD.
