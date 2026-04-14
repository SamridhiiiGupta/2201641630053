import React, { useEffect, useState } from 'react'

function Toast({ id, message, type, onRemove }) {
  const [exiting, setExiting] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => {
      setExiting(true)
      setTimeout(() => onRemove(id), 280)
    }, 3200)
    return () => clearTimeout(t)
  }, [id, onRemove])

  const icons = { success: '✓', error: '✕', info: 'i' }

  return (
    <div className={`toast toast-${type} ${exiting ? 'exit' : ''}`}>
      <div className="toast-icon">{icons[type] || 'i'}</div>
      <span style={{ color: 'var(--ink)', fontSize: 13, fontWeight: 400, flex: 1 }}>{message}</span>
      <button
        onClick={() => { setExiting(true); setTimeout(() => onRemove(id), 280) }}
        style={{
          background: 'none', border: 'none', color: 'var(--ink-3)',
          cursor: 'pointer', padding: '0 2px', fontSize: 16, lineHeight: 1,
          flexShrink: 0,
        }}
      >×</button>
    </div>
  )
}

export function ToastContainer({ toasts, removeToast }) {
  if (!toasts.length) return null
  return (
    <div className="toast-container">
      {toasts.map(t => (
        <Toast key={t.id} {...t} onRemove={removeToast} />
      ))}
    </div>
  )
}
