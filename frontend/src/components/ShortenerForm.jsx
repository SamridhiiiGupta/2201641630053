import React, { useState } from 'react'
import { api } from '../lib/api'

export function ShortenerForm({ onSuccess, toast }) {
  const [url, setUrl] = useState('')
  const [shortcode, setShortcode] = useState('')
  const [validity, setValidity] = useState('')
  const [title, setTitle] = useState('')
  const [advanced, setAdvanced] = useState(false)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!url) return
    setLoading(true)
    try {
      const data = await api.createShortUrl({
        url, shortcode: shortcode || undefined,
        validity: validity ? Number(validity) : undefined,
        title: title || undefined,
      })
      setResult(data)
      onSuccess?.(data)
      toast('Short link created!', 'success')
    } catch (err) {
      toast(err.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  function copyLink() {
    navigator.clipboard.writeText(result.shortLink)
    toast('Copied to clipboard!', 'success')
  }

  function reset() {
    setResult(null)
    setUrl('')
    setShortcode('')
    setValidity('')
    setTitle('')
  }

  if (result) {
    return (
      <div style={{ animation: 'fadeUp 0.4s ease' }}>
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid rgba(180,255,60,0.2)',
          borderRadius: 'var(--radius-lg)',
          padding: 32,
          textAlign: 'center',
        }}>
          <div style={{
            width: 56, height: 56, background: 'rgba(180,255,60,0.1)', borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 20px', fontSize: 24,
          }}>✓</div>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 12, fontSize: 14 }}>Your short link is ready</p>
          <div style={{
            background: 'var(--bg-input)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)',
            padding: '14px 16px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
            marginBottom: 20,
          }}>
            <a href={result.shortLink} target="_blank" rel="noopener noreferrer"
              style={{ color: 'var(--accent)', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 16 }}>
              {result.shortLink}
            </a>
            <button onClick={copyLink} style={{
              background: 'var(--accent)', color: 'var(--accent-text)',
              border: 'none', borderRadius: 6, padding: '6px 14px',
              fontSize: 13, fontWeight: 600, cursor: 'pointer',
              flexShrink: 0,
            }}>Copy</button>
          </div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 24 }}>
            {result.expiry && (
              <span className="badge badge-muted">
                ⏱ Expires {new Date(result.expiry).toLocaleString()}
              </span>
            )}
            {!result.expiry && <span className="badge badge-muted">∞ No expiry</span>}
          </div>
          <button onClick={reset} className="btn-ghost" style={{ width: '100%' }}>
            Shorten another URL
          </button>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ position: 'relative' }}>
        <div style={{
          position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)',
          color: 'var(--text-muted)', fontSize: 16, pointerEvents: 'none',
        }}>🔗</div>
        <input
          className="input-field"
          type="url"
          placeholder="Paste your long URL here..."
          value={url}
          onChange={e => setUrl(e.target.value)}
          required
          style={{ paddingLeft: 44, fontSize: 15 }}
        />
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button type="button" onClick={() => setAdvanced(!advanced)}
          style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
          {advanced ? '▾' : '▸'} Advanced options
        </button>
      </div>

      {advanced && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, animation: 'fadeIn 0.2s ease' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
              <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
                Custom alias (optional)
              </label>
              <input
                className="input-field"
                placeholder="e.g. my-link"
                value={shortcode}
                onChange={e => setShortcode(e.target.value)}
                pattern="[0-9a-zA-Z_\-]{3,20}"
                title="3–20 alphanumeric characters"
              />
            </div>
            <div>
              <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
                Expires in (minutes)
              </label>
              <input
                className="input-field"
                type="number"
                placeholder="e.g. 1440"
                value={validity}
                onChange={e => setValidity(e.target.value)}
                min="1"
              />
            </div>
          </div>
          <div>
            <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
              Link title (optional)
            </label>
            <input
              className="input-field"
              placeholder="Give this link a name..."
              value={title}
              onChange={e => setTitle(e.target.value)}
            />
          </div>
        </div>
      )}

      <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%', height: 50, fontSize: 15 }}>
        {loading ? (
          <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <span className="spinner" style={{ borderTopColor: 'var(--accent-text)' }} /> Creating...
          </span>
        ) : 'Shorten URL →'}
      </button>
    </form>
  )
}
