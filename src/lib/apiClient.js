export const BASE = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE) ? import.meta.env.VITE_API_BASE : (typeof window !== 'undefined' && window.location.hostname === 'localhost' ? 'http://localhost:4000/api' : '/api')
const ADMIN_TOKEN_KEY = 'premium_admin_token'

function getValidAdminToken() {
  const t = localStorage.getItem(ADMIN_TOKEN_KEY)
  if (!t) return ''
  try {
    const parts = t.split('.')
    if (parts.length !== 3) return ''
    const payloadB64 = parts[1]
    const json = atob(payloadB64)
    const payload = JSON.parse(json)
    if (typeof payload.exp === 'number' && Date.now() < payload.exp * 1000) return t
    localStorage.removeItem(ADMIN_TOKEN_KEY)
    return ''
  } catch {
    return ''
  }
}

async function request(path, opts = {}) {
  const { method = 'GET', headers = {}, body, admin = false, timeoutMs = 15000 } = opts
  const h = { ...headers }
  let payload = body
  if (payload && typeof payload === 'object' && !(payload instanceof FormData)) {
    h['Content-Type'] = h['Content-Type'] || 'application/json'
    payload = JSON.stringify(payload)
  }
  if (admin) {
    const t = getValidAdminToken()
    if (t) h['Authorization'] = `Bearer ${t}`
  }
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), Math.max(1, Number(timeoutMs)))
  try {
    const res = await fetch(BASE + path, { method, headers: h, body: payload, signal: ctrl.signal, cache: 'no-store' })
    clearTimeout(timer)
    const isJson = (res.headers.get('content-type') || '').includes('application/json')
    if (!res.ok) {
      let err = {}
      if (isJson) err = await res.json().catch(() => ({}))
      const code = err && err.error ? err.error : 'request_failed'
      const e = new Error(code)
      e.status = res.status
      e.code = code
      throw e
    }
    return isJson ? await res.json().catch(() => null) : await res.text().catch(() => '')
  } catch (e) {
    if (e && e.name === 'AbortError') {
      const ae = new Error('timeout')
      ae.code = 'timeout'
      throw ae
    }
    throw e
  }
}

function get(path, opts) {
  return request(path, { ...(opts || {}), method: 'GET' })
}
function post(path, body, opts) {
  return request(path, { ...(opts || {}), method: 'POST', body })
}
function put(path, body, opts) {
  return request(path, { ...(opts || {}), method: 'PUT', body })
}
function del(path, opts) {
  return request(path, { ...(opts || {}), method: 'DELETE' })
}

export const api = { request, get, post, put, del }
