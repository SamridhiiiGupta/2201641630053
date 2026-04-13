import React from 'react'
import { Link, useLocation } from 'react-router-dom'

export function Navbar() {
  const { pathname } = useLocation()

  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 100,
      background: 'rgba(6,9,20,0.85)',
      backdropFilter: 'blur(20px)',
      borderBottom: '1px solid var(--border)',
    }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 60 }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 30, height: 30,
            background: 'var(--accent)',
            borderRadius: 8,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 16,
            color: 'var(--accent-text)',
          }}>✂</div>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 20, letterSpacing: '-0.02em' }}>
            snip
          </span>
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Link to="/">
            <button className="btn-ghost" style={{
              padding: '8px 16px',
              background: pathname === '/' ? 'var(--bg-elevated)' : 'transparent',
              color: pathname === '/' ? 'var(--text-primary)' : 'var(--text-secondary)',
            }}>Home</button>
          </Link>
          <Link to="/dashboard">
            <button className="btn-ghost" style={{
              padding: '8px 16px',
              background: pathname === '/dashboard' ? 'var(--bg-elevated)' : 'transparent',
              color: pathname === '/dashboard' ? 'var(--text-primary)' : 'var(--text-secondary)',
            }}>Dashboard</button>
          </Link>
        </div>
      </div>
    </nav>
  )
}
