const express = require('express');
const { customAlphabet, nanoid } = require('nanoid');
const dayjs = require('dayjs');
const { db } = require('../db/connection');

const router = express.Router();
const shortAlphabet = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
const generateShortcode = customAlphabet(shortAlphabet, 6);

function isValidUrl(url) {
  try {
    const u = new URL(url);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
}

router.post('/shorturls', (req, res) => {
  const { url, validity, shortcode } = req.body || {};

  if (!url || !isValidUrl(url)) {
    return res.status(400).json({ message: 'Invalid or missing url' });
  }

  let finalCode = shortcode && String(shortcode).trim();
  if (finalCode && !/^[0-9a-zA-Z_-]{3,20}$/.test(finalCode)) {
    return res.status(400).json({ message: 'Invalid shortcode format' });
  }

  if (!finalCode) {
    finalCode = generateShortcode();
    // ensure uniqueness; retry a few times in rare collision
    for (let i = 0; i < 3; i += 1) {
      try {
        db.prepare('INSERT INTO short_urls (shortcode, original_url, created_at, expires_at, is_custom) VALUES (?, ?, ?, ?, ?)')
          .run(finalCode, url, dayjs().toISOString(), validity ? dayjs().add(validity, 'minute').toISOString() : null, 0);
        const host = req.get('host');
        return res.status(201).json({ shortLink: `http://${host}/${finalCode}`, expiry: validity ? dayjs().add(validity, 'minute').toISOString() : null });
      } catch (e) {
        finalCode = generateShortcode();
      }
    }
    return res.status(500).json({ message: 'Failed to generate unique shortcode' });
  }

  // custom shortcode flow
  try {
    db.prepare('INSERT INTO short_urls (shortcode, original_url, created_at, expires_at, is_custom) VALUES (?, ?, ?, ?, ?)')
      .run(finalCode, url, dayjs().toISOString(), validity ? dayjs().add(validity, 'minute').toISOString() : null, 1);
    const host = req.get('host');
    return res.status(201).json({ shortLink: `http://${host}/${finalCode}`, expiry: validity ? dayjs().add(validity, 'minute').toISOString() : null });
  } catch (e) {
    return res.status(409).json({ message: 'Shortcode already exists' });
  }
});

router.get('/shorturls/:code/stats', (req, res) => {
  const { code } = req.params;
  const row = db.prepare('SELECT shortcode, original_url, created_at, expires_at FROM short_urls WHERE shortcode = ?').get(code);
  if (!row) return res.status(404).json({ message: 'Not found' });

  const clicks = db.prepare('SELECT COUNT(*) as total FROM click_events WHERE shortcode = ?').get(code).total;
  const events = db.prepare('SELECT clicked_at, referer, country_hint FROM click_events WHERE shortcode = ? ORDER BY id DESC LIMIT 50').all(code);

  return res.json({
    shortcode: row.shortcode,
    originalUrl: row.original_url,
    createdAt: row.created_at,
    expiry: row.expires_at,
    clicks,
    recent: events
  });
});

router.get('/:code', (req, res) => {
  const { code } = req.params;
  const nowIso = dayjs().toISOString();
  const row = db.prepare('SELECT original_url, expires_at FROM short_urls WHERE shortcode = ?').get(code);
  if (!row) return res.status(404).json({ message: 'shortcode not found' });
  if (row.expires_at && nowIso > row.expires_at) return res.status(410).json({ message: 'short link expired' });

  // record analytics
  db.prepare('INSERT INTO click_events (shortcode, clicked_at, referer, user_agent, ip, country_hint) VALUES (?, ?, ?, ?, ?, ?)')
    .run(
      code,
      dayjs().toISOString(),
      req.get('referer') || null,
      req.get('user-agent') || null,
      req.ip || null,
      req.headers['cf-ipcountry'] || null
    );

  return res.redirect(302, row.original_url);
});

module.exports = router;


