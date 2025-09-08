const Database = require('better-sqlite3');
const path = require('path');

const databaseFilePath = path.join(process.cwd(), 'db.sqlite');

const db = new Database(databaseFilePath);

db.pragma('journal_mode = WAL');

db.exec(`
CREATE TABLE IF NOT EXISTS short_urls (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  shortcode TEXT NOT NULL UNIQUE,
  original_url TEXT NOT NULL,
  created_at TEXT NOT NULL,
  expires_at TEXT,
  is_custom INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS click_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  shortcode TEXT NOT NULL,
  clicked_at TEXT NOT NULL,
  referer TEXT,
  user_agent TEXT,
  ip TEXT,
  country_hint TEXT
);
`);

module.exports = { db };


