import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ShortenerForm } from '../components/ShortenerForm'

const FEATURES = [
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M10 2L2 7v6l8 5 8-5V7L10 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
        <path d="M2 7l8 5 8-5" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M10 12v8" stroke="currentColor" strokeWidth="1.5"/>
      </svg>
    ),
    color: 'var(--blue)',
    title: 'Analytics Dashboard',
    desc: 'Track clicks in real time with browser, device, and geo breakdowns.',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M7 10h6M10 7l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5"/>
      </svg>
    ),
    color: 'var(--violet)',
    title: 'Custom Aliases',
    desc: 'Choose memorable short codes for branded, shareable links.',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <rect x="3" y="3" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5"/>
        <rect x="11" y="3" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5"/>
        <rect x="3" y="11" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M13 13h4M15 11v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
    color: 'var(--cyan)',
    title: 'QR Code Export',
    desc: 'Every link auto-generates a downloadable QR code, instantly.',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M10 6v4l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    color: 'var(--amber)',
    title: 'Link Expiry',
    desc: 'Set time-limited URLs that auto-deactivate after a defined window.',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M10 2v2M10 16v2M2 10h2M16 10h2M4.93 4.93l1.41 1.41M13.66 13.66l1.41 1.41M4.93 15.07l1.41-1.41M13.66 6.34l1.41-1.41" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <circle cx="10" cy="10" r="3" stroke="currentColor" strokeWidth="1.5"/>
      </svg>
    ),
    color: 'var(--green)',
    title: 'Blazing Fast',
    desc: 'Sub-millisecond redirects backed by SQLite WAL with collision-safe IDs.',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M13 7H7a5 5 0 0 0 0 10h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M10 13h6a4 4 0 0 0 0-8h-1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
    color: '#f87171',
    title: 'Zero Auth Needed',
    desc: 'Start shortening instantly — no signup, no friction, no nonsense.',
  },
]

function FeatureCard({ icon, color, title, desc, delay }) {
  return (
    <div
      style={{
        background: 'rgba(255,255,255,0.025)',
        border: '1px solid var(--rim)',
        borderRadius: 16,
        padding: '24px 24px',
        transition: 'border-color 0.2s, transform 0.2s, background 0.2s',
        cursor: 'default',
        animation: `fade-up 0.5s ${delay}s var(--ease-out) both`,
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = color.replace(')', ', 0.3)').replace('var(', 'rgba(').replace('#', 'rgba(') || 'rgba(255,255,255,0.15)'
        e.currentTarget.style.transform = 'translateY(-3px)'
        e.currentTarget.style.background = 'rgba(255,255,255,0.04)'
        // just set a reasonable color
        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = 'var(--rim)'
        e.currentTarget.style.transform = 'none'
        e.currentTarget.style.background = 'rgba(255,255,255,0.025)'
      }}
    >
      <div style={{
        width: 40, height: 40,
        borderRadius: 10,
        background: `${color}18`,
        border: `1px solid ${color}30`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color,
        marginBottom: 16,
        flexShrink: 0,
      }}>
        {icon}
      </div>
      <h3 style={{
        fontWeight: 600,
        fontSize: 15,
        marginBottom: 8,
        color: 'var(--ink)',
        letterSpacing: '-0.02em',
      }}>{title}</h3>
      <p style={{ fontSize: 13, color: 'var(--ink-3)', lineHeight: 1.65 }}>{desc}</p>
    </div>
  )
}

function AnimatedCounter({ value }) {
  const [display, setDisplay] = useState(0)
  useEffect(() => {
    let start = 0
    const step = value / 40
    const timer = setInterval(() => {
      start += step
      if (start >= value) { setDisplay(value); clearInterval(timer) }
      else setDisplay(Math.floor(start))
    }, 30)
    return () => clearInterval(timer)
  }, [value])
  return <>{display.toLocaleString()}</>
}

export default function Home({ toast }) {
  return (
    <div>
      {/* ── HERO ───────────────────────────────────── */}
      <section style={{ paddingTop: 96, paddingBottom: 100, position: 'relative' }}>
        {/* Extra hero glow */}
        <div style={{
          position: 'absolute',
          top: 0, left: '50%',
          transform: 'translateX(-50%)',
          width: 900, height: 500,
          background: 'radial-gradient(ellipse 60% 60% at 50% 0%, rgba(59,130,246,0.12) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <div className="container-sm" style={{ textAlign: 'center', position: 'relative' }}>
          {/* Eyebrow */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'rgba(59,130,246,0.08)',
            border: '1px solid rgba(59,130,246,0.2)',
            borderRadius: 100,
            padding: '6px 14px',
            marginBottom: 32,
            animation: 'fade-up 0.5s ease both',
          }}>
            <div style={{
              width: 6, height: 6, borderRadius: '50%',
              background: 'var(--blue)',
              boxShadow: '0 0 8px var(--blue)',
              animation: 'pulse-glow 2s ease-in-out infinite',
            }} />
            <span style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--blue-bright)', letterSpacing: '0.04em' }}>
              NOW WITH ANALYTICS & QR CODES
            </span>
          </div>

          {/* Headline */}
          <h1 style={{
            fontSize: 'clamp(42px, 8vw, 76px)',
            letterSpacing: '-0.04em',
            lineHeight: 1.0,
            marginBottom: 20,
            animation: 'fade-up 0.6s 0.05s ease both',
            fontWeight: 800,
            color: 'var(--ink)',
          }}>
            Short links that<br />
            <span style={{
              display: 'inline-block',
              background: 'linear-gradient(135deg, var(--blue-bright) 0%, var(--violet) 60%, var(--cyan) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>actually work.</span>
          </h1>

          {/* Subhead */}
          <p style={{
            fontSize: 17,
            color: 'var(--ink-2)',
            maxWidth: 460,
            margin: '0 auto 48px',
            lineHeight: 1.7,
            animation: 'fade-up 0.6s 0.1s ease both',
            fontWeight: 400,
          }}>
            Instant URL shortening with click analytics, custom aliases,
            QR codes, and expiry controls. No signup required.
          </p>

          {/* Form */}
          <div style={{
            background: 'rgba(11,14,25,0.8)',
            border: '1px solid var(--rim-bright)',
            borderRadius: 20,
            padding: 28,
            backdropFilter: 'blur(24px)',
            boxShadow: '0 32px 80px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.04), inset 0 1px 0 rgba(255,255,255,0.06)',
            animation: 'fade-up 0.6s 0.15s ease both',
            textAlign: 'left',
          }}>
            <ShortenerForm toast={toast} />
          </div>

          {/* Trust row */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            gap: 28, marginTop: 36, flexWrap: 'wrap',
            animation: 'fade-up 0.6s 0.2s ease both',
          }}>
            {[
              { n: 10000, label: 'links created' },
              { n: 250000, label: 'redirects served' },
              { n: 99, label: '% uptime' },
            ].map(({ n, label }) => (
              <div key={label} style={{ textAlign: 'center' }}>
                <p style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 17,
                  fontWeight: 600,
                  color: 'var(--ink)',
                  letterSpacing: '-0.02em',
                }}>
                  <AnimatedCounter value={n} />{label.includes('%') ? '' : '+'}
                </p>
                <p style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 2, fontFamily: 'var(--font-mono)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                  {label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ───────────────────────────────────── */}
      <section style={{
        borderTop: '1px solid var(--rim)',
        paddingTop: 96,
        paddingBottom: 96,
      }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <p className="label" style={{ marginBottom: 16 }}>capabilities</p>
            <h2 style={{
              fontSize: 'clamp(28px, 4vw, 44px)',
              fontWeight: 800,
              letterSpacing: '-0.04em',
              color: 'var(--ink)',
              lineHeight: 1.1,
            }}>
              Everything you need.<br />
              <span style={{ color: 'var(--ink-2)', fontWeight: 400 }}>Nothing you don't.</span>
            </h2>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 16,
          }}>
            {FEATURES.map((f, i) => (
              <FeatureCard key={f.title} {...f} delay={i * 0.06} />
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────── */}
      <section style={{ paddingBottom: 120 }}>
        <div className="container">
          <div style={{
            background: 'linear-gradient(135deg, rgba(59,130,246,0.08) 0%, rgba(167,139,250,0.06) 100%)',
            border: '1px solid rgba(59,130,246,0.15)',
            borderRadius: 24,
            padding: '64px 48px',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden',
          }}>
            <div style={{
              position: 'absolute', inset: 0,
              background: 'radial-gradient(ellipse 60% 80% at 50% 0%, rgba(59,130,246,0.08) 0%, transparent 60%)',
              pointerEvents: 'none',
            }} />
            <p className="label" style={{ marginBottom: 16 }}>Get started</p>
            <h2 style={{
              fontSize: 'clamp(28px, 4vw, 42px)',
              fontWeight: 800,
              letterSpacing: '-0.04em',
              marginBottom: 16,
              color: 'var(--ink)',
            }}>
              Ready to shorten?
            </h2>
            <p style={{ color: 'var(--ink-2)', marginBottom: 32, fontSize: 16 }}>
              See all your links, track clicks, and manage everything from your dashboard.
            </p>
            <Link to="/dashboard">
              <button className="btn btn-primary btn-lg" style={{ fontSize: 15, fontWeight: 600 }}>
                Open Dashboard →
              </button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
