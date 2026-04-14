import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { Navbar } from './components/Navbar'
import { ToastContainer } from './components/Toast'
import { useToast } from './hooks/useToast'
import Home from './pages/Home'
import Dashboard from './pages/Dashboard'

function Canvas() {
  return (
    <div className="canvas">
      <div className="canvas-grid" />
      <div className="canvas-orb canvas-orb-1" />
      <div className="canvas-orb canvas-orb-2" />
      <div className="canvas-orb canvas-orb-3" />
      <div className="canvas-vignette" />
    </div>
  )
}

function NotFound() {
  return (
    <div style={{ textAlign: 'center', padding: '120px 20px', animation: 'fade-up 0.5s ease both' }}>
      <div style={{
        fontFamily: 'var(--font-mono)',
        fontSize: 72,
        fontWeight: 700,
        letterSpacing: '-0.04em',
        color: 'var(--rim-bright)',
        marginBottom: 16,
      }}>404</div>
      <p style={{ color: 'var(--ink-3)', marginBottom: 32, fontSize: 15 }}>
        This page — or short link — doesn't exist.
      </p>
      <a href="/">
        <button className="btn btn-primary">← Back home</button>
      </a>
    </div>
  )
}

export default function App() {
  const { toasts, toast, removeToast } = useToast()

  return (
    <>
      <Canvas />
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Home toast={toast} />} />
          <Route path="/dashboard" element={<Dashboard toast={toast} />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </>
  )
}
