import React, { useState, useEffect, useCallback } from 'react'
import { api } from '../lib/api'
import { StatsModal } from '../components/StatsModal'
import { ShortenerForm } from '../components/ShortenerForm'

function timeAgo(iso) {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

function getFavicon(url) {
  try { return new URL(url).hostname } catch { return '' }
}

function LinkCard({ link, onStats, onDelete, host }) {
  const shortUrl = `${host}/${link.shortcode}`
  const isExpired = link.expires_at && new Date(link.expires_at) < new Date()
  const [deleting, setDeleting] = useState(false)
  const [copied, setCopied] = useState(false)

  function copy() {
    navigator.clipboard.writeText(shortUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  async function handleDelete() {
    if (!confirm('Delete this link?')) return
    setDeleting(true)
    await onDelete(link.shortcode)
  }

  return (
    <div style={{
      background: 'var(--bg-card)',
      border: `1px solid ${isExpired ? 'rgba(255,77,109,0.15)' : 'var(--border)'}`,
      borderRadius: 'var(--radius)',
      padding: '18px 20px',
      display: 'flex',
      alignItems: 'center',
      gap: 16,
      transition: 'border-color 0.2s',
      opacity: deleting ? 0.5 : 1,
    }}>
      {/* Favicon + status dot */}
      <div style={{ position: 'relative', flexShrink: 0 }}>
        <div style={{
          width: 40, height: 40,
          background: 'var(--bg-elevated)',
          borderRadius: 10,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 18, overflow: 'hidden',
        }}>
          <img
            src={`https://www.google.com/s2/favicons?domain=${getFavicon(link.original_url)}&sz=32`}
            alt="" width={20} height={20}
            onError={e => { e.target.style.display = 'none' }}
          />
        </div>
        <div style={{
          position: 'absolute', bottom: -2, right: -2,
          width: 10, height: 10,
          borderRadius: '50%',
          background: isExpired ? 'var(--danger)' : 'var(--success)',
          border: '2px solid var(--bg-card)',
        }} />
      </div>

      {/* URL info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
          <span style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 600,
            fontSize: 15,
            color: 'var(--accent)',
          }}>
            /{link.shortcode}
          </span>
          {link.title && (
            <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>— {link.title}</span>
          )}
          {link.is_custom ? (
            <span className="badge badge-accent" style={{ fontSize: 11 }}>custom</span>
          ) : null}
        </div>
        <p className="truncate" style={{ fontSize: 13, color: 'var(--text-muted)', maxWidth: 360 }}>
          {link.original_url}
        </p>
        <div style={{ display: 'flex', gap: 12, marginTop: 4, fontSize: 12, color: 'var(--text-muted)' }}>
          <span>{timeAgo(link.created_at)}</span>
          {link.expires_at && (
            <span style={{ color: isExpired ? 'var(--danger)' : 'var(--text-muted)' }}>
              {isExpired ? 'Expired' : `Expires ${new Date(link.expires_at).toLocaleDateString()}`}
            </span>
          )}
        </div>
      </div>

      {/* Clicks */}
      <div style={{ textAlign: 'center', flexShrink: 0, minWidth: 50 }}>
        <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 20 }}>
          {(link.clicks || 0).toLocaleString()}
        </p>
        <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>clicks</p>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
        <button
          onClick={copy}
          title="Copy link"
          style={{
            background: copied ? 'var(--accent-dim)' : 'var(--bg-elevated)',
            border: '1px solid var(--border)',
            borderRadius: 8,
            width: 34, height: 34,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', fontSize: 15,
            transition: 'all 0.15s',
            color: copied ? 'var(--accent)' : 'var(--text-secondary)',
          }}
        >{copied ? '✓' : '⎘'}</button>

        <button
          onClick={() => onStats(link.shortcode)}
          title="View analytics"
          style={{
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border)',
            borderRadius: 8,
            width: 34, height: 34,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', fontSize: 15, color: 'var(--text-secondary)',
            transition: 'all 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)' }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)' }}
        >📊</button>

        <button
          onClick={handleDelete}
          disabled={deleting}
          title="Delete link"
          style={{
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border)',
            borderRadius: 8,
            width: 34, height: 34,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', fontSize: 14, color: 'var(--text-muted)',
            transition: 'all 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--danger)'; e.currentTarget.style.color = 'var(--danger)' }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-muted)' }}
        >{deleting ? '…' : '🗑'}</button>
      </div>
    </div>
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
      const data = await api.listShortUrls()
      setLinks(data)
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
      setLinks(prev => prev.filter(l => l.shortcode !== code))
      toast('Link deleted', 'success')
    } catch {
      toast('Delete failed', 'error')
    }
  }

  const filtered = links.filter(l => {
    const matchSearch = !search ||
      l.shortcode.toLowerCase().includes(search.toLowerCase()) ||
      l.original_url.toLowerCase().includes(search.toLowerCase()) ||
      (l.title || '').toLowerCase().includes(search.toLowerCase())

    const now = new Date()
    const expired = l.expires_at && new Date(l.expires_at) < now
    const matchFilter =
      filter === 'all' ||
      (filter === 'active' && !expired) ||
      (filter === 'expired' && expired) ||
      (filter === 'custom' && l.is_custom)

    return matchSearch && matchFilter
  })

  const totalClicks = links.reduce((s, l) => s + (l.clicks || 0), 0)
  const activeCount = links.filter(l => !l.expires_at || new Date(l.expires_at) > new Date()).length

  return (
    <div className="container" style={{ paddingTop: 40, paddingBottom: 80 }}>
      {/* Page header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 32, letterSpacing: '-0.02em', marginBottom: 4 }}>
            Dashboard
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Manage and track all your short links</p>
        </div>
        <button className="btn-primary" onClick={() => setShowCreate(!showCreate)} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {showCreate ? '✕ Close' : '+ New link'}
        </button>
      </div>

      {/* Create form (collapsible) */}
      {showCreate && (
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid rgba(180,255,60,0.2)',
          borderRadius: 'var(--radius)',
          padding: 28,
          marginBottom: 28,
          animation: 'fadeUp 0.3s ease',
          maxWidth: 600,
        }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, marginBottom: 20 }}>Create short link</h2>
          <ShortenerForm toast={toast} onSuccess={(data) => {
            fetchLinks()
            setShowCreate(false)
          }} />
        </div>
      )}

      {/* Stats summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12, marginBottom: 28 }}>
        {[
          { label: 'Total links', value: links.length },
          { label: 'Active links', value: activeCount },
          { label: 'Total clicks', value: totalClicks.toLocaleString() },
          { label: 'Custom aliases', value: links.filter(l => l.is_custom).length },
        ].map(s => (
          <div key={s.label} style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)',
            padding: '16px 20px',
          }}>
            <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4 }}>{s.label}</p>
            <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 26 }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Search + filter bar */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: 14 }}>🔍</span>
          <input
            className="input-field"
            placeholder="Search links..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ paddingLeft: 36 }}
          />
        </div>
        <div style={{ display: 'flex', gap: 4, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: 4 }}>
          {['all', 'active', 'expired', 'custom'].map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{
              background: filter === f ? 'var(--bg-elevated)' : 'transparent',
              border: '1px solid ' + (filter === f ? 'var(--border)' : 'transparent'),
              color: filter === f ? 'var(--text-primary)' : 'var(--text-secondary)',
              borderRadius: 6,
              padding: '6px 14px',
              fontSize: 13,
              cursor: 'pointer',
              textTransform: 'capitalize',
              transition: 'all 0.15s',
            }}>
              {f}
            </button>
          ))}
        </div>
        <button onClick={fetchLinks} className="btn-ghost" style={{ padding: '8px 16px', fontSize: 13 }}>
          ↻ Refresh
        </button>
      </div>

      {/* Links list */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[...Array(4)].map((_, i) => (
            <div key={i} style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius)',
              height: 76,
              animation: 'pulse 1.5s ease infinite',
            }} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '80px 20px',
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius)',
        }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>✂</div>
          <p style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 18, marginBottom: 8 }}>
            {search || filter !== 'all' ? 'No matching links' : 'No links yet'}
          </p>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 24 }}>
            {search || filter !== 'all' ? 'Try adjusting your filters' : 'Create your first short link to get started'}
          </p>
          {!search && filter === 'all' && (
            <button className="btn-primary" onClick={() => setShowCreate(true)}>Create a link</button>
          )}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {filtered.map(link => (
            <div key={link.shortcode} style={{ animation: 'fadeUp 0.3s ease' }}>
              <LinkCard
                link={link}
                host={host}
                onStats={setSelectedCode}
                onDelete={handleDelete}
              />
            </div>
          ))}
          {filtered.length > 0 && (
            <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--text-muted)', marginTop: 8 }}>
              {filtered.length} link{filtered.length !== 1 ? 's' : ''}
            </p>
          )}
        </div>
      )}

      {/* Stats modal */}
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
