import React from 'react'
import { ShortenerForm } from '../components/ShortenerForm'

const features = [
  { icon: '⚡', title: 'Instant shortening', desc: 'Generate short links in milliseconds with collision-resistant IDs.' },
  { icon: '📊', title: 'Click analytics', desc: 'Track every click with browser, device, and geographic breakdowns.' },
  { icon: '🎛', title: 'Custom aliases', desc: 'Choose your own short code for branded, memorable links.' },
  { icon: '⏱', title: 'Link expiry', desc: 'Set links to expire after a time window to keep your URLs fresh.' },
  { icon: '📱', title: 'QR codes', desc: 'Every link gets an auto-generated QR code, ready to download.' },
  { icon: '🔒', title: 'Click limits', desc: 'Cap how many times a link can be used before it deactivates.' },
]

export default function Home({ toast }) {
  return (
    <div>
      {/* Hero */}
      <div style={{ paddingTop: 80, paddingBottom: 80, textAlign: 'center', position: 'relative' }}>
        {/* Glow orb */}
        <div style={{
          position: 'absolute', top: -100, left: '50%', transform: 'translateX(-50%)',
          width: 600, height: 400,
          background: 'radial-gradient(ellipse, rgba(180,255,60,0.08) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <div className="container" style={{ position: 'relative' }}>
          <div style={{ animation: 'fadeUp 0.6s ease both' }}>
            <span className="badge badge-accent" style={{ marginBottom: 24, display: 'inline-flex' }}>
              ✦ Now with QR codes & analytics
            </span>
          </div>

          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(40px, 7vw, 80px)',
            fontWeight: 800,
            lineHeight: 1.05,
            letterSpacing: '-0.03em',
            marginBottom: 24,
            animation: 'fadeUp 0.6s 0.1s ease both',
          }}>
            Short links that<br />
            <span style={{
              color: 'var(--accent)',
              position: 'relative',
              display: 'inline-block',
            }}>mean something.</span>
          </h1>

          <p style={{
            fontSize: 18,
            color: 'var(--text-secondary)',
            maxWidth: 500,
            margin: '0 auto 48px',
            lineHeight: 1.7,
            animation: 'fadeUp 0.6s 0.2s ease both',
          }}>
            Shorten URLs with analytics, custom aliases, QR codes, and expiry controls. No signup needed.
          </p>

          {/* Form card */}
          <div style={{
            maxWidth: 600, margin: '0 auto',
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)',
            padding: 32,
            animation: 'fadeUp 0.6s 0.3s ease both',
          }}>
            <ShortenerForm toast={toast} />
          </div>

          {/* Social proof */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 32,
            marginTop: 48, color: 'var(--text-muted)', fontSize: 13,
            animation: 'fadeUp 0.6s 0.4s ease both',
          }}>
            <span>Built with Node.js + React</span>
            <span style={{ width: 3, height: 3, background: 'var(--text-muted)', borderRadius: '50%' }} />
            <span>SQLite + WAL storage</span>
            <span style={{ width: 3, height: 3, background: 'var(--text-muted)', borderRadius: '50%' }} />
            <span>MIT License</span>
          </div>
        </div>
      </div>

      {/* Features */}
      <div style={{ borderTop: '1px solid var(--border)', paddingTop: 80, paddingBottom: 80 }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 60 }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 36, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 12 }}>
              Everything you need.
            </h2>
            <p style={{ color: 'var(--text-secondary)' }}>No fluff. Just the features that matter.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
            {features.map((f, i) => (
              <div key={f.title} style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius)',
                padding: 28,
                transition: 'border-color 0.2s ease, transform 0.2s ease',
                cursor: 'default',
                animationDelay: `${i * 0.05}s`,
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(180,255,60,0.3)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'none' }}
              >
                <div style={{ fontSize: 28, marginBottom: 16 }}>{f.icon}</div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, marginBottom: 8 }}>{f.title}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.6 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
