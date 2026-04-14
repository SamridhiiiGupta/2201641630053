import React, { useState, useEffect, useCallback } from 'react'
import { api } from '../lib/api'
import { StatsModal } from '../components/StatsModal'
import { ShortenerForm } from '../components/ShortenerForm'

function timeAgo(iso) {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

function SkeletonCard() {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.02)',
      border: '1px solid var(--rim)',
      borderRadius: 14,
      padding: '18px 20px',
      display: 'flex', alignItems: 'center', gap: 16,
    }}>
      <div className="skeleton" style={{ width: 40, height: 40, borderRadius: 10, flexShrink: 0 }} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div className="skeleton" style={{ height: 14, width: '40%', borderRadius: 4 }} />
        <div className="skeleton" style={{ height: 12, width: '70%', borderRadius: 4 }} />
      </div>
      <div className="skeleton" style={{ width: 48, height: 32, borderRadius: 8 }} />
    </div>
  )
}

function StatSummary({ links }) {
  const now = new Date()
  const active = links.filter(l => !l.expires_at || new Date(l.expires_at) > now).length
  const totalClicks = links.reduce((s, l) => s + (l.clicks || 0), 0)
  const custom = links.filter(l => l.is_custom).length

  const stats = [
    { label: 'Total links', value: links.length, color: 'var(--blue-bright)' },
    { label: 'Active', value: active, color: 'var(--green)' },
    { label: 'Total clicks', value: totalClicks.toLocaleString(), color: 'var(--violet)' },
    { label: 'Custom aliases', value: custom, color: 'var(--cyan)' },
  ]

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 10, marginBottom: 28 }}>
      {stats.map((s, i) => (
        <div key={s.label} style={{
          background: 'rgba(255,255,255,0.025)',
          border: '1px solid var(--rim)',
          borderRadius: 12,
          padding: '14px 18px',
          animation: `fade-up 0.4s ${i * 0.06}s ease both`,
        }}>
          <p style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--ink-3)', marginBottom: 6, letterSpacing: '0.06em', textTransform: 'uppercase' }}>{s.label}</p>
          <p style={{ fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: 24, letterSpacing: '-0.03em', color: s.color }}>{s.value}</p>
        </div>
      ))}
    </div>
  )
}

function LinkRow({ link, host, onStats, onDelete }) {
  const shortUrl = `${host}/${link.shortcode}`
  const isExpired = link.expires_at && new Date(link.expires_at) < new Date()
  const [deleting, setDeleting] = useState(false)
  const [copied, setCopied] = useState(false)

  function copy(e) {
    e.stopPropagation()
    navigator.clipboard.writeText(shortUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 1800)
  }

  async function handleDelete(e) {
    e.stopPropagation()
    if (!confirm('Delete this link?')) return
    setDeleting(true)
    await onDelete(link.shortcode)
  }

  const favicon = (() => {
    try { return new URL(link.original_url).hostname } catch { return '' }
  })()

  return (
    <div
      onClick={() => onStats(link.shortcode)}
      style={{
        background: 'rgba(255,255,255,0.02)',
        border: `1px solid ${isExpired ? 'rgba(248,113,113,0.12)' : 'var(--rim)'}`,
        borderRadius: 14,
        padding: '16px 20px',
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        opacity: deleting ? 0.4 : 1,
        transition: 'border-color 0.15s, background 0.15s, opacity 0.3s',
        cursor: 'pointer',
        animation: 'fade-up 0.35s ease both',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.background = 'rgba(255,255,255,0.035)'
        e.currentTarget.style.borderColor = isExpired ? 'rgba(248,113,113,0.2)' : 'var(--rim-bright)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = 'rgba(255,255,255,0.02)'
        e.currentTarget.style.borderColor = isExpired ? 'rgba(248,113,113,0.12)' : 'var(--rim)'
      }}
    >
      {/* Favicon + status */}
      <div style={{ position: 'relative', flexShrink: 0 }}>
        <div style={{
          width: 38, height: 38,
          background: 'var(--raised)',
          borderRadius: 10,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          overflow: 'hidden', border: '1px solid var(--rim)',
        }}>
          <img
            src={`https://www.google.com/s2/favicons?domain=${favicon}&sz=32`}
            alt=""
            width={18} height={18}
            onError={e => e.target.style.display = 'none'}
          />
        </div>
        <div style={{
          position: 'absolute', bottom: -2, right: -2,
          width: 9, height: 9, borderRadius: '50%',
          background: isExpired ? 'var(--red)' : 'var(--green)',
          border: '2px solid var(--deep)',
          boxShadow: `0 0 6px ${isExpired ? 'var(--red)' : 'var(--green)'}`,
        }} />
      </div>

      {/* Link info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontWeight: 600,
            fontSize: 14,
            color: 'var(--blue-bright)',
            letterSpacing: '-0.01em',
          }}>/{link.shortcode}</span>
          {link.title && (
            <span style={{ fontSize: 13, color: 'var(--ink-2)' }}>— {link.title}</span>
          )}
          {link.is_custom && <span className="badge badge-violet" style={{ fontSize: 10 }}>custom</span>}
          {isExpired && <span className="badge badge-red" style={{ fontSize: 10 }}>expired</span>}
        </div>
        <p className="truncate" style={{ fontSize: 12, color: 'var(--ink-3)', fontFamily: 'var(--font-mono)', maxWidth: 340 }}>
          {link.original_url}
        </p>
        <p style={{ fontSize: 11, color: 'var(--ink-4)', marginTop: 3, fontFamily: 'var(--font-mono)' }}>
          {timeAgo(link.created_at)}
          {link.expires_at && !isExpired && (
            <span style={{ marginLeft: 10 }}>· expires {new Date(link.expires_at).toLocaleDateString()}</span>
          )}
        </p>
      </div>

      {/* Click count */}
      <div style={{ textAlign: 'right', flexShrink: 0, minWidth: 52 }}>
        <p style={{
          fontFamily: 'var(--font-sans)',
          fontWeight: 700,
          fontSize: 20,
          letterSpacing: '-0.03em',
          color: 'var(--ink)',
          lineHeight: 1,
        }}>{(link.clicks || 0).toLocaleString()}</p>
        <p style={{ fontSize: 10, color: 'var(--ink-3)', fontFamily: 'var(--font-mono)', marginTop: 2 }}>CLICKS</p>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 6, flexShrink: 0 }} onClick={e => e.stopPropagation()}>
        <ActionBtn onClick={copy} title={copied ? 'Copied!' : 'Copy link'} active={copied} activeColor="var(--green)">
          {copied ? '✓' : (
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <rect x="4" y="4" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.3"/>
              <path d="M2 10V2h8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
        </ActionBtn>

        <ActionBtn onClick={() => onStats(link.shortcode)} title="Analytics" hoverColor="var(--blue)">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M2 10l3-3 2 2 3-4 2 2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </ActionBtn>

        <ActionBtn onClick={handleDelete} title="Delete" hoverColor="var(--red)">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M2 4h10M5 4V2h4v2M11 4l-1 8H4L3 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </ActionBtn>
      </div>
    </div>
  )
}

function ActionBtn({ onClick, title, children, active, activeColor, hoverColor }) {
  return (
    <button
      onClick={onClick}
      title={title}
      style={{
        width: 32, height: 32,
        background: active ? `${activeColor}18` : 'var(--raised)',
        border: `1px solid ${active ? `${activeColor}30` : 'var(--rim)'}`,
        borderRadius: 8,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: active ? activeColor : 'var(--ink-3)',
        cursor: 'pointer',
        transition: 'all 0.15s',
        fontSize: 13,
        flexShrink: 0,
      }}
      onMouseEnter={e => {
        if (!active) {
          e.currentTarget.style.color = hoverColor || 'var(--ink)'
          e.currentTarget.style.borderColor = hoverColor ? `${hoverColor}30` : 'var(--rim-bright)'
          e.currentTarget.style.background = hoverColor ? `${hoverColor}10` : 'var(--overlay)'
        }
      }}
      onMouseLeave={e => {
        if (!active) {
          e.currentTarget.style.color = 'var(--ink-3)'
          e.currentTarget.style.borderColor = 'var(--rim)'
          e.currentTarget.style.background = 'var(--raised)'
        }
      }}
    >{children}</button>
  )
}

export default function Dashboard({ toast }) {
  const [links, setLinks] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedCode, setSelectedCode] = useState(null)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [showCreate, setShowCreate] = useState(false)
  const host = window.location.origin

  const fetchLinks = useCallback(async () => {
    setLoading(true)
    try {
      setLinks(await api.listShortUrls())
    } catch {
      toast('Failed to load links', 'error')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchLinks() }, [fetchLinks])

  async function handleDelete(code) {
    try {
      await api.deleteShortUrl(code)
      setLinks(p => p.filter(l => l.shortcode !== code))
      toast('Link deleted', 'success')
    } catch {
      toast('Delete failed', 'error')
    }
  }

  const now = new Date()
  const filtered = links.filter(l => {
    const q = search.toLowerCase()
    const matchSearch = !q ||
      l.shortcode.toLowerCase().includes(q) ||
      l.original_url.toLowerCase().includes(q) ||
      (l.title || '').toLowerCase().includes(q)
    const expired = l.expires_at && new Date(l.expires_at) < now
    const matchFilter =
      filter === 'all' ||
      (filter === 'active' && !expired) ||
      (filter === 'expired' && expired) ||
      (filter === 'custom' && l.is_custom)
    return matchSearch && matchFilter
  })

  return (
    <div className="container" style={{ paddingTop: 40, paddingBottom: 100 }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'flex-start',
        justifyContent: 'space-between',
        marginBottom: 32, flexWrap: 'wrap', gap: 16,
        animation: 'fade-up 0.4s ease both',
      }}>
        <div>
          <h1 style={{
            fontSize: 32,
            fontWeight: 800,
            letterSpacing: '-0.04em',
            marginBottom: 4,
            color: 'var(--ink)',
          }}>Dashboard</h1>
          <p style={{ fontSize: 14, color: 'var(--ink-3)' }}>
            Manage and track all your short links
          </p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => setShowCreate(v => !v)}
          style={{ fontSize: 13, fontWeight: 600 }}
        >
          {showCreate ? '✕ Close' : (
            <span style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                <path d="M6.5 1v11M1 6.5h11" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              New link
            </span>
          )}
        </button>
      </div>

      {/* Create form */}
      {showCreate && (
        <div style={{
          background: 'rgba(11,14,25,0.8)',
          border: '1px solid rgba(59,130,246,0.18)',
          borderRadius: 16,
          padding: 24,
          marginBottom: 24,
          animation: 'slide-down 0.25s var(--ease-out) both',
          maxWidth: 580,
          backdropFilter: 'blur(20px)',
          boxShadow: '0 0 40px rgba(59,130,246,0.06)',
        }}>
          <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 16, color: 'var(--ink-2)' }}>
            Create short link
          </p>
          <ShortenerForm toast={toast} onSuccess={() => { fetchLinks(); setShowCreate(false) }} />
        </div>
      )}

      {/* Stats summary */}
      {!loading && <StatSummary links={links} />}

      {/* Search + filter bar */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: '1 1 220px' }}>
          <div style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: 'var(--ink-3)', display: 'flex', pointerEvents: 'none' }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.3"/>
              <path d="M10 10l2.5 2.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
            </svg>
          </div>
          <input
            className="input"
            placeholder="Search links…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ paddingLeft: 36, height: 38, fontSize: 13 }}
          />
        </div>

        <div style={{
          display: 'flex', gap: 2,
          background: 'rgba(0,0,0,0.3)',
          border: '1px solid var(--rim)',
          borderRadius: 10,
          padding: 3,
        }}>
          {['all', 'active', 'expired', 'custom'].map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{
              background: filter === f ? 'var(--raised)' : 'transparent',
              border: `1px solid ${filter === f ? 'var(--rim)' : 'transparent'}`,
              color: filter === f ? 'var(--ink)' : 'var(--ink-3)',
              padding: '5px 12px',
              borderRadius: 7,
              fontSize: 12,
              fontWeight: 500,
              cursor: 'pointer',
              textTransform: 'capitalize',
              transition: 'all 0.12s',
              fontFamily: 'var(--font-mono)',
              letterSpacing: '0.02em',
            }}>{f}</button>
          ))}
        </div>

        <button onClick={fetchLinks} className="btn btn-ghost btn-sm" style={{ height: 38 }}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M12 7A5 5 0 1 1 7 2a5 5 0 0 1 3.54 1.46L12 2v4H8l1.64-1.64A3 3 0 1 0 10 7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Refresh
        </button>
      </div>

      {/* Links list */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[...Array(5)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '80px 20px',
          background: 'rgba(255,255,255,0.015)',
          border: '1px solid var(--rim)',
          borderRadius: 20,
          animation: 'fade-up 0.4s ease both',
        }}>
          <div style={{ fontSize: 36, marginBottom: 14, opacity: 0.3 }}>✂</div>
          <p style={{ fontWeight: 600, fontSize: 16, marginBottom: 6, letterSpacing: '-0.02em', color: 'var(--ink)' }}>
            {search || filter !== 'all' ? 'No matching links' : 'No links yet'}
          </p>
          <p style={{ color: 'var(--ink-3)', fontSize: 13, marginBottom: 24 }}>
            {search || filter !== 'all' ? 'Try adjusting your search or filters' : 'Create your first short link to get started'}
          </p>
          {!search && filter === 'all' && (
            <button className="btn btn-primary btn-sm" onClick={() => setShowCreate(true)}>
              Create a link
            </button>
          )}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {filtered.map((link, i) => (
            <div key={link.shortcode} style={{ animationDelay: `${i * 0.04}s` }}>
              <LinkRow
                link={link}
                host={host}
                onStats={setSelectedCode}
                onDelete={handleDelete}
              />
            </div>
          ))}
          <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--ink-4)', marginTop: 8, fontFamily: 'var(--font-mono)' }}>
            {filtered.length} link{filtered.length !== 1 ? 's' : ''}
          </p>
        </div>
      )}

      {selectedCode && (
        <StatsModal
          code={selectedCode}
          onClose={() => setSelectedCode(null)}
          toast={toast}
        />
      )}
    </div>
  )
}
