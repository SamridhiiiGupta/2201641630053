import React, { useEffect, useState } from 'react'
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts'
import { api } from '../lib/api'

const PALETTE = ['#3b82f6', '#a78bfa', '#22d3ee', '#34d399', '#fbbf24', '#f87171']

function StatPill({ label, value, accent }) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.03)',
      border: '1px solid var(--rim)',
      borderRadius: 12,
      padding: '16px 20px',
      flex: 1, minWidth: 0,
    }}>
      <p style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--ink-3)', marginBottom: 8, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{label}</p>
      <p style={{
        fontSize: 28,
        fontWeight: 700,
        fontFamily: 'var(--font-sans)',
        letterSpacing: '-0.03em',
        color: accent || 'var(--ink)',
      }}>{value}</p>
    </div>
  )
}

function TabBar({ tabs, active, onChange }) {
  return (
    <div style={{
      display: 'flex',
      gap: 2,
      background: 'rgba(0,0,0,0.3)',
      border: '1px solid var(--rim)',
      borderRadius: 10,
      padding: 3,
      width: 'fit-content',
    }}>
      {tabs.map(t => (
        <button key={t.id} onClick={() => onChange(t.id)} style={{
          background: active === t.id ? 'var(--raised)' : 'transparent',
          border: `1px solid ${active === t.id ? 'var(--rim-bright)' : 'transparent'}`,
          color: active === t.id ? 'var(--ink)' : 'var(--ink-3)',
          padding: '6px 14px',
          borderRadius: 8,
          fontSize: 13,
          fontWeight: 500,
          cursor: 'pointer',
          transition: 'all 0.15s',
          display: 'flex', alignItems: 'center', gap: 6,
        }}>
          <span style={{ fontSize: 13 }}>{t.icon}</span>
          {t.label}
        </button>
      ))}
    </div>
  )
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: 'var(--overlay)',
      border: '1px solid var(--rim-bright)',
      borderRadius: 8,
      padding: '8px 12px',
      fontSize: 13,
    }}>
      <p style={{ color: 'var(--ink-3)', marginBottom: 4, fontSize: 11, fontFamily: 'var(--font-mono)' }}>{label}</p>
      <p style={{ color: 'var(--blue-bright)', fontWeight: 600 }}>{payload[0].value} clicks</p>
    </div>
  )
}

export function StatsModal({ code, onClose, toast }) {
  const [stats, setStats] = useState(null)
  const [qr, setQr] = useState(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('overview')

  useEffect(() => {
    Promise.all([
      api.getStats(code).then(setStats).catch(() => toast('Failed to load stats', 'error')),
      api.getQR(code).then(d => setQr(d.qr)).catch(() => {}),
    ]).finally(() => setLoading(false))
  }, [code])

  const TABS = [
    { id: 'overview', icon: '◈', label: 'Overview' },
    { id: 'charts', icon: '▦', label: 'Charts' },
    { id: 'events', icon: '◎', label: 'Events' },
    { id: 'qr', icon: '⊞', label: 'QR Code' },
  ]

  function copyLink() {
    if (stats) {
      navigator.clipboard.writeText(`${window.location.origin}/${stats.shortcode}`)
      toast('Copied!', 'success')
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid var(--rim)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
        }}>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, fontSize: 18, color: 'var(--blue-bright)' }}>
                /{code}
              </span>
              {stats?.isExpired && <span className="badge badge-red">Expired</span>}
              {stats && !stats.isExpired && <span className="badge badge-green">Active</span>}
            </div>
            {stats && (
              <p className="truncate" style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 3, fontFamily: 'var(--font-mono)', maxWidth: 440 }}>
                {stats.originalUrl}
              </p>
            )}
          </div>
          <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
            <button onClick={copyLink} className="btn btn-sm btn-secondary">
              Copy link
            </button>
            <button
              onClick={onClose}
              style={{
                background: 'var(--raised)', border: '1px solid var(--rim)',
                color: 'var(--ink-3)', cursor: 'pointer',
                width: 32, height: 32, borderRadius: 8,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 18, transition: 'all 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.color = 'var(--ink)'; e.currentTarget.style.borderColor = 'var(--rim-bright)' }}
              onMouseLeave={e => { e.currentTarget.style.color = 'var(--ink-3)'; e.currentTarget.style.borderColor = 'var(--rim)' }}
            >×</button>
          </div>
        </div>

        {/* Loading */}
        {loading ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 80 }}>
            <span className="spinner" style={{ width: 36, height: 36, borderTopColor: 'var(--blue)' }} />
          </div>
        ) : !stats ? (
          <div style={{ flex: 1, padding: 60, textAlign: 'center', color: 'var(--ink-3)' }}>
            Failed to load analytics
          </div>
        ) : (
          <div className="scroll-area" style={{ flex: 1, padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 20 }}>
            <TabBar tabs={TABS} active={tab} onChange={setTab} />

            {tab === 'overview' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16, animation: 'fade-up 0.3s ease both' }}>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                  <StatPill label="Total Clicks" value={stats.totalClicks.toLocaleString()} accent="var(--blue-bright)" />
                  <StatPill label="Status" value={stats.isExpired ? 'Expired' : 'Active'} accent={stats.isExpired ? 'var(--red)' : 'var(--green)'} />
                  <StatPill label="Created" value={new Date(stats.createdAt).toLocaleDateString('en', { month: 'short', day: 'numeric' })} />
                  <StatPill label="Expires" value={stats.expiry ? new Date(stats.expiry).toLocaleDateString('en', { month: 'short', day: 'numeric' }) : 'Never'} />
                </div>

                {/* Quick chart preview */}
                {stats.dailyClicks?.length > 0 && (
                  <div style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid var(--rim)', borderRadius: 12, padding: '16px 4px 8px' }}>
                    <p style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--ink-3)', marginBottom: 12, paddingLeft: 12, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Click trend</p>
                    <ResponsiveContainer width="100%" height={100}>
                      <AreaChart data={stats.dailyClicks} margin={{ left: 0, right: 0, top: 0, bottom: 0 }}>
                        <defs>
                          <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.35}/>
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="date" hide />
                        <YAxis hide />
                        <Tooltip content={<CustomTooltip />} />
                        <Area type="monotone" dataKey="clicks" stroke="#3b82f6" strokeWidth={2} fill="url(#g1)" dot={false} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                )}

                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {stats.isCustom && <span className="badge badge-violet">Custom alias</span>}
                  {stats.maxClicks && <span className="badge badge-muted">Max {stats.maxClicks} clicks</span>}
                </div>
              </div>
            )}

            {tab === 'charts' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 24, animation: 'fade-up 0.3s ease both' }}>
                {stats.dailyClicks?.length > 0 && (
                  <div>
                    <p className="label" style={{ marginBottom: 16 }}>Clicks over time</p>
                    <ResponsiveContainer width="100%" height={180}>
                      <AreaChart data={stats.dailyClicks}>
                        <defs>
                          <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.3}/>
                            <stop offset="100%" stopColor="#3b82f6" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="date" tick={{ fill: 'var(--ink-3)', fontSize: 11, fontFamily: 'var(--font-mono)' }} tickLine={false} axisLine={false} />
                        <YAxis tick={{ fill: 'var(--ink-3)', fontSize: 11 }} tickLine={false} axisLine={false} allowDecimals={false} width={28} />
                        <Tooltip content={<CustomTooltip />} />
                        <Area type="monotone" dataKey="clicks" stroke="#3b82f6" strokeWidth={2} fill="url(#g2)" dot={false} activeDot={{ r: 4, fill: '#3b82f6' }} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                  {stats.browserBreakdown?.length > 0 && (
                    <div>
                      <p className="label" style={{ marginBottom: 16 }}>Browsers</p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        <PieChart width={120} height={120}>
                          <Pie data={stats.browserBreakdown} dataKey="count" nameKey="browser" cx="50%" cy="50%" outerRadius={52} innerRadius={28} strokeWidth={0} paddingAngle={2}>
                            {stats.browserBreakdown.map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}
                          </Pie>
                        </PieChart>
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                          {stats.browserBreakdown.map((b, i) => (
                            <div key={b.browser} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
                              <div style={{ width: 8, height: 8, borderRadius: 2, background: PALETTE[i % PALETTE.length], flexShrink: 0 }} />
                              <span style={{ flex: 1, color: 'var(--ink-2)', fontFamily: 'var(--font-mono)' }}>{b.browser}</span>
                              <span style={{ color: 'var(--ink-3)' }}>{b.count}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {stats.deviceBreakdown?.length > 0 && (
                    <div>
                      <p className="label" style={{ marginBottom: 16 }}>Devices</p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {stats.deviceBreakdown.map((d, i) => {
                          const pct = stats.totalClicks > 0 ? Math.round((d.count / stats.totalClicks) * 100) : 0
                          return (
                            <div key={d.device_type}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5, fontSize: 12 }}>
                                <span style={{ color: 'var(--ink-2)', fontFamily: 'var(--font-mono)' }}>{d.device_type}</span>
                                <span style={{ color: 'var(--ink-3)' }}>{pct}%</span>
                              </div>
                              <div style={{ background: 'var(--rim)', borderRadius: 4, height: 4, overflow: 'hidden' }}>
                                <div style={{
                                  background: PALETTE[i % PALETTE.length],
                                  width: `${pct}%`,
                                  height: '100%',
                                  borderRadius: 4,
                                  transition: 'width 1s var(--ease-out)',
                                }} />
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

            {tab === 'events' && (
              <div style={{ animation: 'fade-up 0.3s ease both' }}>
                <p className="label" style={{ marginBottom: 16 }}>Recent clicks</p>
                {!stats.recentEvents?.length ? (
                  <div style={{ textAlign: 'center', padding: '48px 20px', color: 'var(--ink-3)' }}>
                    <div style={{ fontSize: 32, marginBottom: 12 }}>◎</div>
                    <p style={{ fontSize: 14 }}>No clicks recorded yet</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {stats.recentEvents.map((ev, i) => (
                      <div key={i} style={{
                        display: 'flex', alignItems: 'center', gap: 12,
                        background: 'rgba(255,255,255,0.02)',
                        border: '1px solid var(--rim)',
                        borderRadius: 8,
                        padding: '9px 14px',
                        fontSize: 12,
                      }}>
                        <div style={{
                          width: 6, height: 6, borderRadius: '50%',
                          background: 'var(--blue)',
                          boxShadow: '0 0 6px var(--blue)',
                          flexShrink: 0,
                        }} />
                        <span style={{ color: 'var(--ink-3)', fontFamily: 'var(--font-mono)', minWidth: 120 }}>
                          {new Date(ev.clicked_at).toLocaleTimeString()}
                        </span>
                        <span className="badge badge-muted">{ev.device_type || 'unknown'}</span>
                        <span style={{ color: 'var(--ink-2)', fontFamily: 'var(--font-mono)' }}>{ev.browser || 'Unknown'}</span>
                        {ev.country && <span className="badge badge-blue">{ev.country}</span>}
                        {ev.referer && <span className="truncate" style={{ color: 'var(--ink-3)', flex: 1, fontFamily: 'var(--font-mono)' }}>{ev.referer}</span>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {tab === 'qr' && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '24px 0', gap: 20, animation: 'fade-up 0.3s ease both' }}>
                <p className="label">Scan to open</p>
                {qr ? (
                  <>
                    <div style={{
                      background: 'white',
                      borderRadius: 16,
                      padding: 16,
                      boxShadow: '0 0 60px rgba(59,130,246,0.2)',
                    }}>
                      <img src={qr} alt="QR" width={180} height={180} style={{ display: 'block', borderRadius: 8 }} />
                    </div>
                    <p style={{ fontSize: 12, color: 'var(--ink-3)', fontFamily: 'var(--font-mono)' }}>
                      {window.location.origin}/{code}
                    </p>
                    <a href={qr} download={`snip-${code}.png`}>
                      <button className="btn btn-primary btn-sm">Download QR</button>
                    </a>
                  </>
                ) : (
                  <div style={{ padding: 40 }}>
                    <span className="spinner" style={{ width: 28, height: 28, borderTopColor: 'var(--blue)' }} />
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
