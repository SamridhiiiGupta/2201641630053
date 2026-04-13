import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { Navbar } from './components/Navbar'
import { ToastContainer } from './components/Toast'
import { useToast } from './hooks/useToast'
import Home from './pages/Home'
import Dashboard from './pages/Dashboard'

export default function App() {
  const { toasts, toast } = useToast()

  return (
    <>
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Home toast={toast} />} />
          <Route path="/dashboard" element={<Dashboard toast={toast} />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <ToastContainer toasts={toasts} />
    </>
  )
}

function NotFound() {
  return (
    <div style={{ textAlign: 'center', padding: '120px 20px' }}>
      <div style={{ fontSize: 64, marginBottom: 24 }}>✂</div>
      <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 48, marginBottom: 12, letterSpacing: '-0.02em' }}>404</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: 32 }}>This page — or short link — doesn't exist.</p>
      <a href="/">
        <button className="btn-primary">Back to home</button>
      </a>
    </div>
  )
}
