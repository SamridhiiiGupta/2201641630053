import { useState, useCallback } from 'react'

let id = 0

export function useToast() {
  const [toasts, setToasts] = useState([])

  const toast = useCallback((message, type = 'info') => {
    const tid = ++id
    setToasts(p => [...p, { id: tid, message, type }])
  }, [])

  const removeToast = useCallback((tid) => {
    setToasts(p => p.filter(t => t.id !== tid))
  }, [])

  return { toasts, toast, removeToast }
}
