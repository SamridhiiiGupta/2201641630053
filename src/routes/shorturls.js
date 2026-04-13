const express = require('express');
const dayjs = require('dayjs');
const QRCode = require('qrcode');
const { db } = require('../db/connection');

const router = express.Router();
const shortAlphabet = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
let generateShortcode;

async function loadNanoid() {
  if (!generateShortcode) {
    const { customAlphabet } = await import('nanoid');
    generateShortcode = customAlphabet(shortAlphabet, 6);
  }
}
loadNanoid();

function isValidUrl(url) {
  try {
    const u = new URL(url);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
}

function parseUserAgent(ua = '') {
  let browser = 'Unknown', os = 'Unknown', deviceType = 'Desktop';

  if (/mobile|android|iphone|ipad/i.test(ua)) deviceType = 'Mobile';
  else if (/tablet|ipad/i.test(ua)) deviceType = 'Tablet';

  if (/chrome/i.test(ua) && !/edge/i.test(ua)) browser = 'Chrome';
  else if (/firefox/i.test(ua)) browser = 'Firefox';
  else if (/safari/i.test(ua) && !/chrome/i.test(ua)) browser = 'Safari';
  else if (/edge/i.test(ua)) browser = 'Edge';
  else if (/msie|trident/i.test(ua)) browser = 'IE';

  if (/windows/i.test(ua)) os = 'Windows';
  else if (/macintosh|mac os x/i.test(ua)) os = 'macOS';
  else if (/linux/i.test(ua)) os = 'Linux';
  else if (/android/i.test(ua)) os = 'Android';
  else if (/iphone|ipad|ios/i.test(ua)) os = 'iOS';

  return { browser, os, deviceType };
}

// POST /api/shorturls — create a short URL
router.post('/api/shorturls', async (req, res) => {
  await loadNanoid();
  const { url, validity, shortcode, title, maxClicks } = req.body || {};

  if (!url || !isValidUrl(url)) {
    return res.status(400).json({ error: 'Invalid or missing URL. Must be http:// or https://' });
  }

  let finalCode = shortcode && String(shortcode).trim();
  if (finalCode && !/^[0-9a-zA-Z_-]{3,20}$/.test(finalCode)) {
    return res.status(400).json({ error: 'Shortcode must be 3–20 alphanumeric characters (_, - allowed)' });
  }

  const expiresAt = validity ? dayjs().add(Number(validity), 'minute').toISOString() : null;
  const createdAt = dayjs().toISOString();

  if (!finalCode) {
    for (let i = 0; i < 5; i++) {
      finalCode = generateShortcode();
      try {
        db.prepare(`INSERT INTO short_urls (shortcode, original_url, title, created_at, expires_at, is_custom, max_clicks)
          VALUES (?, ?, ?, ?, ?, 0, ?)`).run(finalCode, url, title || null, createdAt, expiresAt, maxClicks || null);

        const host = req.get('host');
        const protocol = req.get('x-forwarded-proto') || 'http';
        const shortLink = `${protocol}://${host}/${finalCode}`;
        return res.status(201).json({ shortLink, shortcode: finalCode, expiry: expiresAt, createdAt });
      } catch {
        continue;
      }
    }
    return res.status(500).json({ error: 'Failed to generate unique shortcode. Try again.' });
  }

  try {
    db.prepare(`INSERT INTO short_urls (shortcode, original_url, title, created_at, expires_at, is_custom, max_clicks)
      VALUES (?, ?, ?, ?, ?, 1, ?)`).run(finalCode, url, title || null, createdAt, expiresAt, maxClicks || null);

    const host = req.get('host');
    const protocol = req.get('x-forwarded-proto') || 'http';
    const shortLink = `${protocol}://${host}/${finalCode}`;
    return res.status(201).json({ shortLink, shortcode: finalCode, expiry: expiresAt, createdAt });
  } catch {
    return res.status(409).json({ error: 'That custom shortcode is already taken. Try another.' });
  }
});

// GET /api/shorturls — list all short URLs with stats
router.get('/api/shorturls', (req, res) => {
  const rows = db.prepare(`
    SELECT s.*, 
      (SELECT COUNT(*) FROM click_events c WHERE c.shortcode = s.shortcode) as clicks,
      (SELECT clicked_at FROM click_events c WHERE c.shortcode = s.shortcode ORDER BY id DESC LIMIT 1) as last_clicked
    FROM short_urls s
    WHERE s.is_active = 1
    ORDER BY s.id DESC
    LIMIT 100
  `).all();
  return res.json(rows);
});

// GET /api/shorturls/:code/stats — detailed analytics
router.get('/api/shorturls/:code/stats', (req, res) => {
  const { code } = req.params;
  const row = db.prepare('SELECT * FROM short_urls WHERE shortcode = ?').get(code);
  if (!row) return res.status(404).json({ error: 'Short URL not found' });

  const totalClicks = db.prepare('SELECT COUNT(*) as total FROM click_events WHERE shortcode = ?').get(code).total;
  const recentEvents = db.prepare(`
    SELECT clicked_at, referer, country, browser, device_type, os
    FROM click_events WHERE shortcode = ? ORDER BY id DESC LIMIT 50
  `).all(code);

  const dailyClicks = db.prepare(`
    SELECT date, clicks FROM daily_stats
    WHERE shortcode = ? ORDER BY date DESC LIMIT 30
  `).all(code);

  const browserBreakdown = db.prepare(`
    SELECT browser, COUNT(*) as count FROM click_events
    WHERE shortcode = ? GROUP BY browser ORDER BY count DESC
  `).all(code);

  const deviceBreakdown = db.prepare(`
    SELECT device_type, COUNT(*) as count FROM click_events
    WHERE shortcode = ? GROUP BY device_type ORDER BY count DESC
  `).all(code);

  const countryBreakdown = db.prepare(`
    SELECT country, COUNT(*) as count FROM click_events
    WHERE shortcode = ? AND country IS NOT NULL GROUP BY country ORDER BY count DESC LIMIT 10
  `).all(code);

  const isExpired = row.expires_at && dayjs().toISOString() > row.expires_at;

  return res.json({
    shortcode: row.shortcode,
    originalUrl: row.original_url,
    title: row.title,
    createdAt: row.created_at,
    expiry: row.expires_at,
    isExpired,
    isCustom: !!row.is_custom,
    maxClicks: row.max_clicks,
    totalClicks,
    recentEvents,
    dailyClicks: dailyClicks.reverse(),
    browserBreakdown,
    deviceBreakdown,
    countryBreakdown
  });
});

// GET /api/shorturls/:code/qr — generate QR code
router.get('/api/shorturls/:code/qr', async (req, res) => {
  const { code } = req.params;
  const row = db.prepare('SELECT shortcode FROM short_urls WHERE shortcode = ?').get(code);
  if (!row) return res.status(404).json({ error: 'Not found' });

  const host = req.get('host');
  const protocol = req.get('x-forwarded-proto') || 'http';
  const url = `${protocol}://${host}/${code}`;

  try {
    const qrDataUrl = await QRCode.toDataURL(url, {
      width: 300,
      margin: 2,
      color: { dark: '#000000', light: '#FFFFFF' }
    });
    return res.json({ qr: qrDataUrl, url });
  } catch {
    return res.status(500).json({ error: 'QR generation failed' });
  }
});

// DELETE /api/shorturls/:code — deactivate a short URL
router.delete('/api/shorturls/:code', (req, res) => {
  const { code } = req.params;
  const row = db.prepare('SELECT id FROM short_urls WHERE shortcode = ?').get(code);
  if (!row) return res.status(404).json({ error: 'Not found' });

  db.prepare('UPDATE short_urls SET is_active = 0 WHERE shortcode = ?').run(code);
  return res.json({ message: 'Deleted successfully' });
});

// GET /:code — redirect
router.get('/:code', (req, res) => {
  const { code } = req.params;
  if (['health', 'api', 'favicon.ico'].includes(code)) return res.status(404).json({ message: 'Not found' });

  const row = db.prepare('SELECT * FROM short_urls WHERE shortcode = ? AND is_active = 1').get(code);
  if (!row) return res.status(404).sendFile(require('path').join(process.cwd(), 'frontend', 'dist', 'index.html'), (err) => {
    if (err) res.status(404).json({ message: 'Short URL not found' });
  });

  const nowIso = dayjs().toISOString();
  if (row.expires_at && nowIso > row.expires_at) {
    return res.status(410).json({ message: 'This link has expired' });
  }

  if (row.max_clicks) {
    const clicks = db.prepare('SELECT COUNT(*) as c FROM click_events WHERE shortcode = ?').get(code).c;
    if (clicks >= row.max_clicks) {
      return res.status(410).json({ message: 'This link has reached its click limit' });
    }
  }

  const ua = req.get('user-agent') || '';
  const { browser, os, deviceType } = parseUserAgent(ua);
  const today = dayjs().format('YYYY-MM-DD');

  db.prepare(`INSERT INTO click_events (shortcode, clicked_at, referer, user_agent, ip, country, browser, device_type, os)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(
    code, nowIso, req.get('referer') || null, ua || null,
    req.ip || null, req.headers['cf-ipcountry'] || null,
    browser, deviceType, os
  );

  db.prepare(`INSERT INTO daily_stats (shortcode, date, clicks) VALUES (?, ?, 1)
    ON CONFLICT(shortcode, date) DO UPDATE SET clicks = clicks + 1`).run(code, today);

  return res.redirect(302, row.original_url);
});

module.exports = router;
