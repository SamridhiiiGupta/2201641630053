const BASE = '/api'

async function request(method, path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : {},
    body: body ? JSON.stringify(body) : undefined,
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || data.message || 'Request failed')
  return data
}

export const api = {
  createShortUrl: (body) => request('POST', '/shorturls', body),
  listShortUrls: () => request('GET', '/shorturls'),
  getStats: (code) => request('GET', `/shorturls/${code}/stats`),
  getQR: (code) => request('GET', `/shorturls/${code}/qr`),
  deleteShortUrl: (code) => request('DELETE', `/shorturls/${code}`),
}
