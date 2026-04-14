import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'

export function Navbar() {
  const { pathname } = useLocation()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 12)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  return (
    <nav className="navbar" style={{ borderBottomColor: scrolled ? 'rgba(255,255,255,0.08)' : 'transparent', transition: 'border-color 0.3s' }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <div style={{
            width: 28, height: 28,
            background: 'linear-gradient(135deg, var(--blue) 0%, var(--violet) 100%)',
            borderRadius: 8,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 14, color: '#fff',
            boxShadow: '0 2px 12px rgba(59,130,246,0.4)',
            flexShrink: 0,
          }}>✂</div>
          <span style={{
            fontFamily: 'var(--font-sans)',
            fontWeight: 700,
            fontSize: 17,
            letterSpacing: '-0.04em',
            color: 'var(--ink)',
          }}>snip</span>
          <span style={{
            fontSize: 10,
            fontFamily: 'var(--font-mono)',
            color: 'var(--ink-3)',
            background: 'var(--raised)',
            border: '1px solid var(--rim)',
            padding: '2px 6px',
            borderRadius: 4,
            letterSpacing: '0.05em',
          }}>v2</span>
        </Link>

        {/* Nav links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <NavLink to="/" active={pathname === '/'}>Home</NavLink>
          <NavLink to="/dashboard" active={pathname === '/dashboard'}>Dashboard</NavLink>
        </div>
      </div>
    </nav>
  )
}

function NavLink({ to, active, children }) {
  return (
    <Link to={to}>
      <button style={{
        background: active ? 'var(--raised)' : 'transparent',
        border: `1px solid ${active ? 'var(--rim)' : 'transparent'}`,
        color: active ? 'var(--ink)' : 'var(--ink-3)',
        padding: '6px 14px',
        borderRadius: 8,
        fontSize: 13,
        fontWeight: 500,
        cursor: 'pointer',
        transition: 'all 0.15s',
        fontFamily: 'var(--font-sans)',
      }}
        onMouseEnter={e => {
          if (!active) {
            e.currentTarget.style.color = 'var(--ink-2)'
            e.currentTarget.style.background = 'rgba(255,255,255,0.04)'
          }
        }}
        onMouseLeave={e => {
          if (!active) {
            e.currentTarget.style.color = 'var(--ink-3)'
            e.currentTarget.style.background = 'transparent'
          }
        }}
      >{children}</button>
    </Link>
  )
}
