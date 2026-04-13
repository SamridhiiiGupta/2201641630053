const Database = require('better-sqlite3');
const path = require('path');

const databaseFilePath = path.join(process.cwd(), 'db.sqlite');
const db = new Database(databaseFilePath);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
CREATE TABLE IF NOT EXISTS short_urls (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  shortcode TEXT NOT NULL UNIQUE,
  original_url TEXT NOT NULL,
  title TEXT,
  created_at TEXT NOT NULL,
  expires_at TEXT,
  is_custom INTEGER NOT NULL DEFAULT 0,
  password_hash TEXT,
  max_clicks INTEGER,
  is_active INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS click_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  shortcode TEXT NOT NULL,
  clicked_at TEXT NOT NULL,
  referer TEXT,
  user_agent TEXT,
  ip TEXT,
  country TEXT,
  browser TEXT,
  device_type TEXT,
  os TEXT
);

CREATE TABLE IF NOT EXISTS daily_stats (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  shortcode TEXT NOT NULL,
  date TEXT NOT NULL,
  clicks INTEGER NOT NULL DEFAULT 0,
  UNIQUE(shortcode, date)
);

CREATE INDEX IF NOT EXISTS idx_click_events_shortcode ON click_events(shortcode);
CREATE INDEX IF NOT EXISTS idx_click_events_clicked_at ON click_events(clicked_at);
CREATE INDEX IF NOT EXISTS idx_daily_stats_shortcode ON daily_stats(shortcode);
`);

module.exports = { db };
