import React, { useEffect, useState } from 'react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { api } from '../lib/api'

const COLORS = ['#b4ff3c', '#00e5a0', '#60a5fa', '#fb923c', '#e879f9', '#f87171']

function StatCard({ label, value, sub }) {
  return (
    <div style={{
      background: 'var(--bg-input)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-sm)',
      padding: '16px 20px',
    }}>
      <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4 }}>{label}</p>
      <p style={{ fontSize: 28, fontWeight: 700, fontFamily: 'var(--font-display)' }}>{value}</p>
      {sub && <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{sub}</p>}
    </div>
  )
}

export function StatsModal({ code, onClose, toast }) {
  const [stats, setStats] = useState(null)
  const [qr, setQR] = useState(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('overview')

  useEffect(() => {
    api.getStats(code).then(setStats).catch(() => toast('Failed to load stats', 'error')).finally(() => setLoading(false))
    api.getQR(code).then(d => setQR(d.qr)).catch(() => {})
  }, [code])

  function copyLink() {
    if (stats) {
      const link = `${window.location.origin}/${stats.shortcode}`
      navigator.clipboard.writeText(link)
      toast('Copied!', 'success')
    }
  }

  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)',
      backdropFilter: 'blur(8px)', zIndex: 1000,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        width: '100%', maxWidth: 800, maxHeight: '90vh',
        display: 'flex', flexDirection: 'column',
        animation: 'fadeUp 0.3s ease',
      }}>
        {/* Header */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700 }}>
              /{code}
            </h2>
            {stats && (
              <p className="truncate" style={{ fontSize: 13, color: 'var(--text-secondary)', maxWidth: 400, marginTop: 2 }}>
                {stats.originalUrl}
              </p>
            )}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={copyLink} className="btn-ghost" style={{ padding: '8px 14px', fontSize: 13 }}>Copy link</button>
            <button onClick={onClose} style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 8, width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: 18 }}>✕</button>
          </div>
        </div>

        {loading ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 60 }}>
            <span className="spinner" style={{ width: 32, height: 32, borderTopColor: 'var(--accent)' }} />
          </div>
        ) : !stats ? (
          <div style={{ flex: 1, padding: 40, textAlign: 'center', color: 'var(--text-secondary)' }}>Failed to load analytics</div>
        ) : (
          <div style={{ flex: 1, overflow: 'auto', padding: '20px 24px' }}>
            {/* Tabs */}
            <div style={{ display: 'flex', gap: 4, marginBottom: 24, background: 'var(--bg-input)', borderRadius: 'var(--radius-sm)', padding: 4, width: 'fit-content' }}>
              {['overview', 'charts', 'recent', 'qr'].map(t => (
                <button key={t} onClick={() => setTab(t)} style={{
                  background: tab === t ? 'var(--bg-elevated)' : 'transparent',
                  border: tab === t ? '1px solid var(--border)' : '1px solid transparent',
                  color: tab === t ? 'var(--text-primary)' : 'var(--text-secondary)',
                  borderRadius: 6, padding: '6px 16px', fontSize: 13, fontWeight: 500, cursor: 'pointer',
                  textTransform: 'capitalize',
                }}>
                  {t}
                </button>
              ))}
            </div>

            {tab === 'overview' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12 }}>
                  <StatCard label="Total clicks" value={stats.totalClicks.toLocaleString()} />
                  <StatCard label="Status" value={stats.isExpired ? 'Expired' : 'Active'} />
                  <StatCard label="Created" value={new Date(stats.createdAt).toLocaleDateString()} sub={new Date(stats.createdAt).toLocaleTimeString()} />
                  <StatCard label="Expiry" value={stats.expiry ? new Date(stats.expiry).toLocaleDateString() : 'Never'} />
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {stats.isCustom && <span className="badge badge-accent">Custom alias</span>}
                  {stats.isExpired && <span className="badge badge-danger">Expired</span>}
                  {!stats.isExpired && <span className="badge badge-success">Active</span>}
                  {stats.maxClicks && <span className="badge badge-muted">Max {stats.maxClicks} clicks</span>}
                </div>
              </div>
            )}

            {tab === 'charts' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                {stats.dailyClicks.length > 0 && (
                  <div>
                    <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16, color: 'var(--text-secondary)' }}>CLICKS OVER TIME</h3>
                    <ResponsiveContainer width="100%" height={200}>
                      <AreaChart data={stats.dailyClicks}>
                        <defs>
                          <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#b4ff3c" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#b4ff3c" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="date" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} tickLine={false} axisLine={false} />
                        <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} tickLine={false} axisLine={false} allowDecimals={false} />
                        <Tooltip contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-primary)', fontSize: 13 }} />
                        <Area type="monotone" dataKey="clicks" stroke="#b4ff3c" strokeWidth={2} fill="url(#colorClicks)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                  {stats.browserBreakdown.length > 0 && (
                    <div>
                      <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16, color: 'var(--text-secondary)' }}>BROWSERS</h3>
                      <PieChart width={160} height={160}>
                        <Pie data={stats.browserBreakdown} dataKey="count" nameKey="browser" cx="50%" cy="50%" outerRadius={70} strokeWidth={0}>
                          {stats.browserBreakdown.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                        </Pie>
                        <Tooltip contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-primary)', fontSize: 12 }} />
                      </PieChart>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 8 }}>
                        {stats.browserBreakdown.map((b, i) => (
                          <div key={b.browser} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
                            <div style={{ width: 8, height: 8, borderRadius: 2, background: COLORS[i % COLORS.length], flexShrink: 0 }} />
                            <span style={{ flex: 1, color: 'var(--text-secondary)' }}>{b.browser}</span>
                            <span style={{ fontWeight: 500 }}>{b.count}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {stats.deviceBreakdown.length > 0 && (
                    <div>
                      <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16, color: 'var(--text-secondary)' }}>DEVICES</h3>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {stats.deviceBreakdown.map((d, i) => {
                          const pct = Math.round((d.count / stats.totalClicks) * 100)
                          return (
                            <div key={d.device_type}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 13 }}>
                                <span style={{ color: 'var(--text-secondary)' }}>{d.device_type}</span>
                                <span style={{ fontWeight: 500 }}>{pct}%</span>
                              </div>
                              <div style={{ background: 'var(--bg-input)', borderRadius: 4, height: 6, overflow: 'hidden' }}>
                                <div style={{ background: COLORS[i % COLORS.length], width: `${pct}%`, height: '100%', borderRadius: 4, transition: 'width 0.8s ease' }} />
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {tab === 'recent' && (
              <div>
                <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16, color: 'var(--text-secondary)' }}>RECENT CLICKS</h3>
                {stats.recentEvents.length === 0 ? (
                  <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 40 }}>No clicks yet</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {stats.recentEvents.map((e, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'var(--bg-input)', borderRadius: 8, padding: '10px 14px', fontSize: 13 }}>
                        <span style={{ color: 'var(--text-muted)', fontSize: 11, flexShrink: 0 }}>{new Date(e.clicked_at).toLocaleString()}</span>
                        <span className="badge badge-muted">{e.device_type || '?'}</span>
                        <span style={{ color: 'var(--text-secondary)' }}>{e.browser || 'Unknown'}</span>
                        {e.country && <span className="badge badge-accent">{e.country}</span>}
                        {e.referer && <span className="truncate" style={{ color: 'var(--text-muted)', flex: 1 }}>{e.referer}</span>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {tab === 'qr' && (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 20, color: 'var(--text-secondary)' }}>QR CODE</h3>
                {qr ? (
                  <div>
                    <img src={qr} alt="QR Code" style={{ width: 200, height: 200, borderRadius: 12, border: '4px solid white' }} />
                    <p style={{ marginTop: 16, fontSize: 13, color: 'var(--text-secondary)' }}>
                      Scan to open <strong style={{ color: 'var(--accent)' }}>{window.location.origin}/{code}</strong>
                    </p>
                    <a href={qr} download={`snip-${code}-qr.png`} style={{ display: 'inline-block', marginTop: 12 }}>
                      <button className="btn-primary" style={{ fontSize: 13 }}>Download QR</button>
                    </a>
                  </div>
                ) : (
                  <div style={{ padding: 40, color: 'var(--text-muted)' }}>Generating QR...</div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
