import React, { useState, useRef, useEffect } from 'react'
import { api } from '../lib/api'

function CopyButton({ text, toast }) {
  const [copied, setCopied] = useState(false)
  function copy() {
    navigator.clipboard.writeText(text)
    setCopied(true)
    toast('Copied to clipboard', 'success')
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <button onClick={copy} className="btn btn-sm" style={{
      background: copied ? 'var(--green-dim)' : 'var(--blue)',
      color: copied ? 'var(--green)' : '#fff',
      border: copied ? '1px solid rgba(52,211,153,0.3)' : 'none',
      boxShadow: copied ? 'none' : '0 2px 12px rgba(59,130,246,0.35)',
      fontFamily: 'var(--font-mono)',
      fontSize: 12,
      minWidth: 72,
      transition: 'all 0.2s',
    }}>
      {copied ? '✓ Copied' : 'Copy'}
    </button>
  )
}

export function ShortenerForm({ onSuccess, toast, compact = false }) {
  const [url, setUrl] = useState('')
  const [alias, setAlias] = useState('')
  const [minutes, setMinutes] = useState('')
  const [title, setTitle] = useState('')
  const [showAdv, setShowAdv] = useState(false)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const inputRef = useRef(null)

  useEffect(() => {
    if (!result) inputRef.current?.focus()
  }, [result])

  async function submit(e) {
    e.preventDefault()
    if (!url.trim()) return
    setLoading(true)
    try {
      const data = await api.createShortUrl({
        url: url.trim(),
        shortcode: alias.trim() || undefined,
        validity: minutes ? Number(minutes) : undefined,
        title: title.trim() || undefined,
      })
      setResult(data)
      onSuccess?.(data)
      toast('Short link created!', 'success')
    } catch (err) {
      toast(err.message || 'Something went wrong', 'error')
    } finally {
      setLoading(false)
    }
  }

  function reset() {
    setResult(null)
    setUrl('')
    setAlias('')
    setMinutes('')
    setTitle('')
    setShowAdv(false)
  }

  if (result) {
    return (
      <div style={{ animation: 'fade-up 0.4s var(--ease-spring) both' }}>
        {/* Success state */}
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{
            width: 52, height: 52,
            background: 'var(--green-dim)',
            border: '1px solid rgba(52,211,153,0.25)',
            borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px',
            fontSize: 22,
            color: 'var(--green)',
            animation: 'scale-in 0.4s var(--ease-spring)',
          }}>✓</div>
          <p style={{ fontSize: 13, color: 'var(--ink-2)', fontWeight: 500 }}>Your link is ready</p>
        </div>

        {/* Result card */}
        <div style={{
          background: 'rgba(7,9,15,0.8)',
          border: '1px solid rgba(59,130,246,0.2)',
          borderRadius: 12,
          padding: '14px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          marginBottom: 16,
          boxShadow: '0 0 24px rgba(59,130,246,0.06)',
        }}>
          <div style={{
            width: 8, height: 8, borderRadius: '50%',
            background: 'var(--green)',
            boxShadow: '0 0 8px var(--green)',
            flexShrink: 0,
            animation: 'pulse-glow 2s ease-in-out infinite',
          }} />
          <a
            href={result.shortLink}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              flex: 1,
              fontFamily: 'var(--font-mono)',
              fontSize: 15,
              fontWeight: 500,
              color: 'var(--blue-bright)',
              letterSpacing: '-0.01em',
            }}
          >{result.shortLink}</a>
          <CopyButton text={result.shortLink} toast={toast} />
        </div>

        {/* Meta */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
          {result.expiry ? (
            <span className="badge badge-muted">
              ⏱ Expires {new Date(result.expiry).toLocaleString()}
            </span>
          ) : (
            <span className="badge badge-muted">∞ No expiry</span>
          )}
          {result.shortcode && <span className="badge badge-blue">/{result.shortcode}</span>}
        </div>

        <button onClick={reset} className="btn btn-secondary" style={{ width: '100%' }}>
          ← Shorten another URL
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {/* Main URL input */}
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        <div style={{
          position: 'absolute', left: 14,
          color: 'var(--ink-3)',
          fontSize: 16,
          pointerEvents: 'none',
          display: 'flex',
        }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M6.354 9.646a.5.5 0 0 0-.708.708l.5.5a3.5 3.5 0 0 0 4.95-4.95l-2-2a3.5 3.5 0 0 0-4.708 5.192l.707-.707A2.5 2.5 0 0 1 8.5 4.5l2 2a2.5 2.5 0 0 1-3.535 3.535l-.611-.389Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"/>
            <path d="M9.646 6.354a.5.5 0 0 1 .708-.708l.5.5a3.5 3.5 0 0 1-4.95 4.95l-2-2a3.5 3.5 0 0 1 4.708-5.192l-.707.707A2.5 2.5 0 0 0 5.5 9.5l-2-2a2.5 2.5 0 0 1 3.535-3.535l.611.389Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"/>
          </svg>
        </div>
        <input
          ref={inputRef}
          className="input"
          type="url"
          placeholder="Paste your long URL here…"
          value={url}
          onChange={e => setUrl(e.target.value)}
          required
          style={{ paddingLeft: 40, fontSize: 14, height: 48 }}
        />
      </div>

      {/* Advanced toggle */}
      <button
        type="button"
        onClick={() => setShowAdv(v => !v)}
        style={{
          background: 'none', border: 'none',
          color: 'var(--ink-3)', fontSize: 12,
          fontFamily: 'var(--font-mono)',
          letterSpacing: '0.04em',
          cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '2px 0',
          alignSelf: 'flex-start',
          transition: 'color 0.15s',
        }}
        onMouseEnter={e => e.currentTarget.style.color = 'var(--ink-2)'}
        onMouseLeave={e => e.currentTarget.style.color = 'var(--ink-3)'}
      >
        <span style={{
          display: 'inline-block',
          transition: 'transform 0.2s',
          transform: showAdv ? 'rotate(90deg)' : 'rotate(0deg)',
        }}>▶</span>
        Advanced options
      </button>

      {/* Advanced fields */}
      {showAdv && (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
          animation: 'slide-down 0.2s var(--ease-out) both',
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid var(--rim)',
          borderRadius: 12,
          padding: 16,
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
              <label style={{ display: 'block', marginBottom: 6 }} className="label">Custom alias</label>
              <input
                className="input"
                placeholder="e.g. my-link"
                value={alias}
                onChange={e => setAlias(e.target.value)}
                pattern="[0-9a-zA-Z_\-]{3,20}"
                title="3–20 alphanumeric characters"
                style={{ fontSize: 13 }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 6 }} className="label">Expires in (mins)</label>
              <input
                className="input"
                type="number"
                placeholder="e.g. 1440"
                value={minutes}
                onChange={e => setMinutes(e.target.value)}
                min="1"
                style={{ fontSize: 13 }}
              />
            </div>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: 6 }} className="label">Link title</label>
            <input
              className="input"
              placeholder="Optional label for this link"
              value={title}
              onChange={e => setTitle(e.target.value)}
              style={{ fontSize: 13 }}
            />
          </div>
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        className="btn btn-primary"
        disabled={loading || !url.trim()}
        style={{ height: 48, fontSize: 14, fontWeight: 600, borderRadius: 10, marginTop: 2 }}
      >
        {loading ? (
          <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span className="spinner" style={{ width: 16, height: 16, borderTopColor: '#fff' }} />
            Creating…
          </span>
        ) : (
          <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            Shorten URL
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M3 7h8M7 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </span>
        )}
      </button>
    </form>
  )
}
