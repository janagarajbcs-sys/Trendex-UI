import { api, BASE } from './apiClient'
const USERS_KEY = 'premium_users'
const CURRENT_KEY = 'premium_current'
const PROGRESS_KEY = 'premium_progress'
const ADMIN_KEY = 'premium_admin'
const ANSWERS_KEY = 'premium_answers'
const JOIN_RESP_KEY = 'join_responses'
const COMPLAINT_RESP_KEY = 'complaint_responses'

export function getUsers() {
  const v = localStorage.getItem(USERS_KEY)
  return v ? JSON.parse(v) : []
}
export function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users))
}
export function registerUser({ name, phone, email, team, leader, password }) {
  const users = getUsers()
  const e = (email || '').trim().toLowerCase()
  const p = (phone || '').trim()
  const exists = users.some((u) => ((u.email || '').trim().toLowerCase() === e) || ((u.phone || '').trim() === p))
  if (exists) {
    throw new Error('DUPLICATE_USER')
  }
  const id = 'u_' + Math.random().toString(36).slice(2)
  const user = { id, name, phone, email, team, leader, password, approved: false, createdAt: Date.now() }
  users.push(user)
  saveUsers(users)
  return user
}
export async function registerUserBackend(payload) {
  const res = await fetch(BASE + '/auth/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    const code = err && err.error ? err.error : 'signup_failed'
    throw new Error(code)
  }
  return await res.json()
}
export function approveUser(id) {
  const users = getUsers()
  const idx = users.findIndex((u) => u.id === id)
  if (idx >= 0) {
    users[idx].approved = true
    saveUsers(users)
  }
}
export function disableUser(id) {
  const users = getUsers()
  const idx = users.findIndex((u) => u.id === id)
  if (idx >= 0) {
    users[idx].approved = false
    saveUsers(users)
  }
}
export function denyUser(id) {
  const users = getUsers().filter((u) => u.id !== id)
  saveUsers(users)
}
export async function getUsersBackendAsync() {
  const arr = await api.get('/auth/list', { admin: true }).catch(() => getUsers())
  const items = Array.isArray(arr) ? arr.map((x) => ({
    id: x.id || x._id || '',
    name: x.name || '',
    phone: x.phone || '',
    email: x.email || '',
    team: x.team || '',
    leader: x.leader || '',
    approved: !!x.approved,
    videoAccess: !!x.videoAccess,
    createdAt: x.createdAt ? new Date(x.createdAt).getTime() : Date.now(),
    approvedAt: x.approvedAt ? new Date(x.approvedAt).getTime() : null,
    paidAccessUntil: x.paidAccessUntil ? new Date(x.paidAccessUntil).getTime() : null,
  })) : []
  saveUsers(items)
  return items
}
export async function approveUserBackend(id) {
  const updated = await api.put(`/auth/approve/${encodeURIComponent(id)}`, undefined, { admin: true }).catch(() => null)
  if (!updated) return approveUser(id)
  const users = getUsers().map((u) => (u.id === id ? { ...u, approved: true } : u))
  saveUsers(users)
  return updated
}
export async function disableUserBackend(id) {
  const updated = await api.put(`/auth/disable/${encodeURIComponent(id)}`, undefined, { admin: true }).catch(() => null)
  if (!updated) return disableUser(id)
  const users = getUsers().map((u) => (u.id === id ? { ...u, approved: false } : u))
  saveUsers(users)
  return updated
}
export async function denyUserBackend(id) {
  const ok = await api.del(`/auth/${encodeURIComponent(id)}`, { admin: true }).then(() => true).catch(() => false)
  if (!ok) return denyUser(id)
  const users = getUsers().filter((u) => u.id !== id)
  saveUsers(users)
  return true
}
export function loginUser(identifier, password) {
  const users = getUsers()
  const user = users.find((u) => (u.email === identifier || u.phone === identifier) && u.password === password && u.approved)
  if (user) {
    localStorage.setItem(CURRENT_KEY, user.id)
    return user
  }
  return null
}
export async function loginUserBackend(identifier, password) {
  const res = await fetch(BASE + '/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier, password }),
  })
  if (!res.ok) return null
  const user = await res.json()
  try {
    if (user && user.id) {
      localStorage.setItem(CURRENT_KEY, user.id)
    }
  } catch { /* ignore */ }
  return user
}

export async function getUsersCountAsync() {
  try {
    const data = await api.get('/auth/count')
    if (typeof data.count === 'number') return data.count
    throw new Error('bad format')
  } catch {
    try {
      return getUsers().length
    } catch {
      return 0
    }
  }
}
export function getCurrentUser() {
  const id = localStorage.getItem(CURRENT_KEY)
  if (!id) return null
  return getUsers().find((u) => u.id === id) || null
}
export function signOut() {
  localStorage.removeItem(CURRENT_KEY)
}

export function getProgress(userId) {
  const raw = localStorage.getItem(PROGRESS_KEY)
  const map = raw ? JSON.parse(raw) : {}
  if (!map[userId]) {
    map[userId] = { unlocked: 1, completed: [false, false, false, false], videoAccess: false }
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(map))
  }
  if (map[userId] && typeof map[userId].videoAccess === 'undefined') {
    map[userId].videoAccess = false
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(map))
  }
  try {
    const len = modules.length
    const comp = Array.isArray(map[userId].completed) ? map[userId].completed.filter(Boolean).length : 0
    const desiredUnlocked = Math.min(Math.max(1, comp + 1), len)
    if (typeof map[userId].unlocked !== 'number' || map[userId].unlocked !== desiredUnlocked) {
      map[userId].unlocked = desiredUnlocked
      localStorage.setItem(PROGRESS_KEY, JSON.stringify(map))
    }
  } catch (e) { void e }
  return map[userId]
}
export function setProgress(userId, prog) {
  const raw = localStorage.getItem(PROGRESS_KEY)
  const map = raw ? JSON.parse(raw) : {}
  map[userId] = prog
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(map))
}

export async function getProgressBackend(userId) {
  try {
    const res = await fetch(BASE + `/progress/${encodeURIComponent(userId)}`, { cache: 'no-store' })
    if (!res.ok) throw new Error('not_ok')
    const data = await res.json()
    const prog = {
      unlocked: typeof data.unlocked === 'number' ? data.unlocked : 1,
      completed: Array.isArray(data.completed) ? data.completed : [false, false, false, false],
      videoAccess: getProgress(userId).videoAccess || false,
    }
    setProgress(userId, prog)
    return prog
  } catch {
    return getProgress(userId)
  }
}

export async function setProgressBackend(userId, prog) {
  try {
    const payload = { unlocked: prog.unlocked, completed: prog.completed }
    const data = await api.put(`/progress/${encodeURIComponent(userId)}`, payload).catch(() => null)
    const merged = {
      unlocked: data && typeof data.unlocked === 'number' ? data.unlocked : prog.unlocked,
      completed: data && Array.isArray(data.completed) ? data.completed : prog.completed,
      videoAccess: getProgress(userId).videoAccess || false,
    }
    setProgress(userId, merged)
    return merged
  } catch {
    setProgress(userId, prog)
    return prog
  }
}

export function getVideoAccess(userId) {
  const u = getUsers().find((x) => x.id === userId)
  if (u && typeof u.videoAccess === 'boolean') return u.videoAccess
  const prog = getProgress(userId)
  return !!prog.videoAccess
}
export function setVideoAccess(userId, enabled) {
  const users = getUsers().map((u) => (u.id === userId ? { ...u, videoAccess: !!enabled } : u))
  saveUsers(users)
  const prog = getProgress(userId)
  const next = { ...prog, videoAccess: !!enabled }
  setProgress(userId, next)
}
export async function setVideoAccessBackend(userId, enabled) {
  const ok = await api.put(`/auth/video-access/${encodeURIComponent(userId)}`, { enabled: !!enabled }, { admin: true }).then(() => true).catch(() => false)
  if (!ok) {
    setVideoAccess(userId, enabled)
    return false
  }
  const users = await getUsersBackendAsync()
  return users.some((u) => u.id === userId && !!u.videoAccess === !!enabled)
}
export async function activatePaidAccessBackend(userId, days = 70) {
  const res = await fetch(BASE + `/auth/paid-access/${encodeURIComponent(userId)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...getAdminAuthHeaders() },
    body: JSON.stringify({ days }),
  })
  if (!res.ok) return null
  const updated = await res.json().catch(() => null)
  if (updated && updated.id) {
    const users = getUsers().map((u) => (u.id === userId ? {
      ...u,
      paidAccessUntil: updated.paidAccessUntil ? new Date(updated.paidAccessUntil).getTime() : null,
      videoAccess: !!updated.videoAccess,
    } : u))
    saveUsers(users)
  }
  return updated
}

export async function getModulesAsync() {
  const list = await api.get('/modules').catch(() => modules)
  return Array.isArray(list) ? list : modules
}

export const modules = [
  { id: 1, title: 'Module 1', src: 'https://iframe.mediadelivery.net/play/615839/b37484a0-a4b4-47a5-b608-915cbe977133' },
  { id: 2, title: 'Module 2', src: 'https://iframe.mediadelivery.net/play/615839/8e967fca-39ff-4587-8e81-b1c2618fb656' },
  { id: 3, title: 'Module 3', src: 'https://iframe.mediadelivery.net/play/615839/3c8fb6ad-e639-4cb7-8a7a-9fc6b00eedff' },
  { id: 4, title: 'Module 4', src: 'https://iframe.mediadelivery.net/play/615839/32c12ea9-5388-4a7e-bc65-b8f5ee342113' },
]

const ADMIN_EMAIL = 'janagarajbcs@gmail.com'
const ADMIN_PASSWORD = 'Trade@2001'
const ADMIN_TOKEN_KEY = 'premium_admin_token'
export function loginAdmin(email, password) {
  if (email.toLowerCase() === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
    localStorage.setItem(ADMIN_KEY, email)
    return true
  }
  return false
}
export function isAdminLoggedIn() {
  const t = localStorage.getItem(ADMIN_TOKEN_KEY)
  if (t) {
    try {
      const [, payloadB64] = t.split('.')
      const json = atob(payloadB64)
      const payload = JSON.parse(json)
      if (typeof payload.exp === 'number' && Date.now() < payload.exp * 1000) {
        return true
      }
      localStorage.removeItem(ADMIN_TOKEN_KEY)
    } catch { /* ignore */ }
  }
  return !!localStorage.getItem(ADMIN_KEY)
}
export function signOutAdmin() {
  localStorage.removeItem(ADMIN_KEY)
  localStorage.removeItem(ADMIN_TOKEN_KEY)
}
export async function loginAdminBackend(email, password) {
  const res = await fetch(BASE + '/auth/admin-login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  if (!res.ok) return null
  const data = await res.json().catch(() => null)
  if (data && data.token) {
    localStorage.setItem(ADMIN_TOKEN_KEY, data.token)
    localStorage.setItem(ADMIN_KEY, String(email || ''))
    return data.token
  }
  return null
}
function getAdminAuthHeaders() {
  const t = localStorage.getItem(ADMIN_TOKEN_KEY)
  if (t) {
    try {
      const [, payloadB64] = t.split('.')
      const json = atob(payloadB64)
      const payload = JSON.parse(json)
      if (typeof payload.exp === 'number' && Date.now() < payload.exp * 1000) {
        return { Authorization: `Bearer ${t}` }
      }
      localStorage.removeItem(ADMIN_TOKEN_KEY)
    } catch { /* ignore */ }
  }
  return {}
}

export function getSavedAnswers(userId, moduleId) {
  const raw = localStorage.getItem(ANSWERS_KEY)
  const map = raw ? JSON.parse(raw) : {}
  const u = map[userId] || {}
  return u[moduleId] || {}
}
export function setSavedAnswers(userId, moduleId, answers) {
  const raw = localStorage.getItem(ANSWERS_KEY)
  const map = raw ? JSON.parse(raw) : {}
  if (!map[userId]) map[userId] = {}
  map[userId][moduleId] = answers
  localStorage.setItem(ANSWERS_KEY, JSON.stringify(map))
}
export function clearSavedAnswers(userId, moduleId) {
  const raw = localStorage.getItem(ANSWERS_KEY)
  const map = raw ? JSON.parse(raw) : {}
  if (map[userId]) {
    delete map[userId][moduleId]
    localStorage.setItem(ANSWERS_KEY, JSON.stringify(map))
  }
}

export async function getSavedAnswersBackend(userId, moduleId) {
  try {
    const data = await api.get(`/answers/${encodeURIComponent(userId)}/${encodeURIComponent(moduleId)}`).catch(() => null)
    if (!data) throw new Error('not_ok')
    const answers = data && data.answers && typeof data.answers === 'object' ? data.answers : {}
    setSavedAnswers(userId, moduleId, answers)
    return answers
  } catch {
    return getSavedAnswers(userId, moduleId)
  }
}

export async function setSavedAnswersBackend(userId, moduleId, answers) {
  try {
    const data = await api.put(`/answers/${encodeURIComponent(userId)}/${encodeURIComponent(moduleId)}`, { answers }).catch(() => null)
    const next = data && data.answers && typeof data.answers === 'object' ? data.answers : answers
    setSavedAnswers(userId, moduleId, next)
    return next
  } catch {
    setSavedAnswers(userId, moduleId, answers)
    return answers
  }
}

export async function clearSavedAnswersBackend(userId, moduleId) {
  try {
    await fetch(BASE + `/answers/${encodeURIComponent(userId)}/${encodeURIComponent(moduleId)}`, { method: 'DELETE' })
    clearSavedAnswers(userId, moduleId)
    return true
  } catch {
    clearSavedAnswers(userId, moduleId)
    return false
  }
}

export function getJoinResponses() {
  const v = localStorage.getItem(JOIN_RESP_KEY)
  return v ? JSON.parse(v) : []
}
export function getComplaintResponses() {
  const v = localStorage.getItem(COMPLAINT_RESP_KEY)
  return v ? JSON.parse(v) : []
}

export async function getJoinResponsesBackend() {
  try {
    const data = await api.get('/join', { admin: true }).catch(() => [])
    const normalized = Array.isArray(data)
      ? data.map((r) => ({
        id: r._id || '',
        name: r.name || '',
        mobile: r.mobile || '',
        gmail: r.gmail || '',
        place: r.place || '',
        sponsor: r.sponsor || '',
        source: r.source || '',
        message: r.message || '',
        ts: r.ts ? new Date(r.ts).getTime() : Date.now(),
      }))
      : []
    localStorage.setItem(JOIN_RESP_KEY, JSON.stringify(normalized))
    return normalized
  } catch {
    return getJoinResponses()
  }
}

export async function getComplaintResponsesBackend() {
  try {
    const data = await api.get('/complaints', { admin: true }).catch(() => [])
    const normalized = Array.isArray(data)
      ? data.map((r) => ({
        id: r._id || '',
        type: r.type || '',
        name: r.name || '',
        contact: r.contact || '',
        message: r.message || '',
        ts: r.ts ? new Date(r.ts).getTime() : Date.now(),
      }))
      : []
    localStorage.setItem(COMPLAINT_RESP_KEY, JSON.stringify(normalized))
    return normalized
  } catch {
    return getComplaintResponses()
  }
}

const QUESTION_BANK = {
  1: Array.from({ length: 25 }, (_, i) => ({
    id: i + 1,
    q: `Module 1 · Concept ${i + 1}: Choose the correct option`,
    choices: [
      { key: 'A', text: 'Option A' },
      { key: 'B', text: 'Option B' },
      { key: 'C', text: 'Option C' },
      { key: 'D', text: 'Option D' },
    ],
    answer: ['A', 'B', 'C', 'D'][i % 4],
  })),
  2: Array.from({ length: 25 }, (_, i) => ({
    id: i + 1,
    q: `Module 2 · Practice ${i + 1}: Select the right choice`,
    choices: [
      { key: 'A', text: 'Option A' },
      { key: 'B', text: 'Option B' },
      { key: 'C', text: 'Option C' },
      { key: 'D', text: 'Option D' },
    ],
    answer: ['B', 'C', 'D', 'A'][i % 4],
  })),
  3: Array.from({ length: 25 }, (_, i) => ({
    id: i + 1,
    q: `Module 3 · Scenario ${i + 1}: Pick the valid answer`,
    choices: [
      { key: 'A', text: 'Option A' },
      { key: 'B', text: 'Option B' },
      { key: 'C', text: 'Option C' },
      { key: 'D', text: 'Option D' },
    ],
    answer: ['C', 'D', 'A', 'B'][i % 4],
  })),
  4: Array.from({ length: 25 }, (_, i) => ({
    id: i + 1,
    q: `Module 4 · Review ${i + 1}: Identify the correct response`,
    choices: [
      { key: 'A', text: 'Option A' },
      { key: 'B', text: 'Option B' },
      { key: 'C', text: 'Option C' },
      { key: 'D', text: 'Option D' },
    ],
    answer: ['D', 'A', 'B', 'C'][i % 4],
  })),
}
export function getQuestionsForModule(n) {
  return QUESTION_BANK[n] || []
}

export async function verifyModuleAnswersBackend(moduleId, answers) {
  try {
    const data = await api.post(`/modules/${encodeURIComponent(moduleId)}/verify`, { answers }).catch(() => null)
    const wrong = data && Array.isArray(data.wrong) ? data.wrong : []
    return { wrong }
  } catch {
    const qs = QUESTION_BANK[moduleId] || []
    const wrong = qs.filter((q) => answers[q.id] !== q.answer).map((q) => q.id)
    return { wrong }
  }
}
export async function getQuestionsForModuleAsync(n) {
  try {
    const res = await fetch(BASE + `/modules/${n}`, { cache: 'no-store' })
    if (!res.ok) throw new Error('not ok')
    const data = await res.json()
    if (!Array.isArray(data)) throw new Error('bad format')
    return data
  } catch {
    return QUESTION_BANK[n] || []
  }
}

const LEADERS_KEY = 'leaders'
export function getLeaders() {
  const v = localStorage.getItem(LEADERS_KEY)
  return v ? JSON.parse(v) : []
}
export async function getLeadersAsync() {
  try {
    const apiData = await api.get('/leaders').catch(() => [])
    if (Array.isArray(apiData)) {
      if (Array.isArray(apiData) && apiData.length) {
        const normalizedApi = apiData
          .map((x, i) => ({
            id: x._id || x.id || ('l_' + (i + 1)),
            sno: Number(x.sno || i + 1),
            name: x.name || '',
            title: x.title || '',
            loc: x.loc || '',
            photo: x.photo || '',
          }))
          .sort((a, b) => (Number(a.sno || 0) - Number(b.sno || 0)))
        return normalizedApi
      }
    }
    // Fallback to static JSON
    const res = await fetch(BASE + '/leaders.json', { cache: 'no-store' })
    if (!res.ok) throw new Error('not ok')
    const data = await res.json()
    if (!Array.isArray(data)) throw new Error('bad format')
    const normalized = data
      .map((x, i) => ({
        id: x.id || ('l_' + (i + 1)),
        sno: Number(x.sno || i + 1),
        name: x.name || '',
        title: x.title || '',
        loc: x.loc || '',
        photo: x.photo || '',
      }))
      .sort((a, b) => (Number(a.sno || 0) - Number(b.sno || 0)))
    return normalized
  } catch {
    return getLeaders()
  }
}
export function saveLeaders(items) {
  const arr = Array.isArray(items) ? items.slice() : []
  arr.sort((a, b) => (Number(a.sno || 0) - Number(b.sno || 0)))
  const normalized = arr.map((x, i) => ({
    ...x,
    sno: i + 1,
  }))
  localStorage.setItem(LEADERS_KEY, JSON.stringify(normalized))
  try {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('leaders-updated', { detail: normalized }))
      if (typeof BroadcastChannel !== 'undefined') {
        const ch = new BroadcastChannel('leaders')
        ch.postMessage({ type: 'leaders-updated', payload: normalized })
        ch.close()
      }
    }
  } catch (e) { void e }
}
export function addLeader(item) {
  const items = getLeaders()
  const id = 'l_' + Math.random().toString(36).slice(2)
  const sno = Number(item.sno) || items.length + 1
  const next = { id, sno, name: item.name || '', title: item.title || '', loc: item.loc || '', photo: item.photo || '' }
  items.push(next)
  items.sort((a, b) => (Number(a.sno || 0) - Number(b.sno || 0)))
  saveLeaders(items)
  return next
}
export function updateLeader(id, patch) {
  const items = getLeaders()
  const idx = items.findIndex((x) => x.id === id)
  if (idx >= 0) {
    const a = items[idx]
    const sno = patch.sno != null ? Number(patch.sno) : a.sno
    const rest = { ...(patch || {}) }
    if ('rankPos' in rest) { delete rest.rankPos }
    items[idx] = { ...a, ...rest, sno }
    items.sort((x, y) => (Number(x.sno || 0) - Number(y.sno || 0)))
    saveLeaders(items)
    return items[idx]
  }
  return null
}
export function deleteLeader(id) {
  const items = getLeaders().filter((x) => x.id !== id)
  saveLeaders(items)
}
export function moveLeader(id, dir) {
  const items = getLeaders()
  const idx = items.findIndex((x) => x.id === id)
  if (idx < 0) return
  const j = dir === 'up' ? idx - 1 : idx + 1
  if (j < 0 || j >= items.length) return
  const tmp = items[idx]
  items[idx] = items[j]
  items[j] = tmp
  const renum = items.map((x, i) => ({ ...x, sno: i + 1 }))
  saveLeaders(renum)
}
export async function addLeaderBackend(item) {
  try {
    await api.post('/leaders', item, { admin: true })
    const list = await getLeadersAsync()
    saveLeaders(list)
    return list
  } catch {
    return addLeader(item)
  }
}
export async function updateLeaderBackend(id, patch) {
  try {
    await api.put(`/leaders/${encodeURIComponent(id)}`, patch, { admin: true })
    const list = await getLeadersAsync()
    saveLeaders(list)
    return list
  } catch {
    return updateLeader(id, patch)
  }
}
export async function deleteLeaderBackend(id) {
  try {
    await api.del(`/leaders/${encodeURIComponent(id)}`, { admin: true })
    const list = await getLeadersAsync()
    saveLeaders(list)
    return list
  } catch {
    return deleteLeader(id)
  }
}
export async function moveLeaderBackend(id, dir) {
  try {
    const list = await getLeadersAsync()
    const idx = list.findIndex((x) => x.id === id)
    if (idx < 0) return list
    const j = dir === 'up' ? idx - 1 : idx + 1
    if (j < 0 || j >= list.length) return list
    const a = list[idx]
    const b = list[j]
    await api.put(`/leaders/${encodeURIComponent(a.id)}`, { sno: b.sno }, { admin: true })
    await api.put(`/leaders/${encodeURIComponent(b.id)}`, { sno: a.sno }, { admin: true })
    const next = await getLeadersAsync()
    saveLeaders(next)
    return next
  } catch {
    moveLeader(id, dir)
    return getLeaders()
  }
}
const DEFAULT_LEADERS = [
  { sno: 1, photo: 'jana.jpeg', name: 'Mr. Janagaraj', title: 'Prime Trader', loc: 'Dharapuram' },
  { sno: 2, photo: 'raghul.jpg', name: 'Mr. Raghul', title: 'Archer Trader', loc: 'Erode' },
  { sno: 3, photo: 'maha.jpg', name: 'Ms. Mahalakshmi', title: 'Monarch Trader', loc: 'Coimbatore' },
  { sno: 4, photo: 'arun.jpeg', name: 'Mr. Arunagiri', title: 'Atlas Trader', loc: 'Coimbatore' },
  { sno: 5, photo: 'uneha.jpeg', name: 'Mrs. Uneha', title: 'Atlas Trader', loc: 'Kerala' },
  { sno: 6, photo: 'venket.jpeg', name: 'Mr. Venket', title: 'Champ Trader', loc: 'Chennai' },
  { sno: 7, photo: 'passport.jpg', name: 'Mr. Perinbha Raj', title: 'Champ Trader', loc: 'Coimbatore' },
  { sno: 8, photo: 'guna.jpeg', name: 'Ms. Guna Sanju', title: 'Champ Trader', loc: 'Erode' },
  { sno: 9, photo: 'mani.jpg', name: 'Mr. Mani Vasakam', title: 'Champ Trader', loc: 'Dharapuram' },
]
export function initLeadersIfEmpty() {
  const has = getLeaders()
  if (Array.isArray(has) && has.length > 0) return
  const items = DEFAULT_LEADERS.map((l) => ({ ...l, id: 'l_' + Math.random().toString(36).slice(2) }))
  saveLeaders(items)
}
export function clearLeaders() {
  saveLeaders([])
}

const BANNERS_KEY = 'banners'
export function getBanners() {
  const v = localStorage.getItem(BANNERS_KEY)
  return v ? JSON.parse(v) : []
}
export function saveBanners(items) {
  const arr = Array.isArray(items) ? items.slice() : []
  arr.sort((a, b) => (Number(a.sno || 0) - Number(b.sno || 0)))
  const normalized = arr.map((x, i) => ({ ...x, sno: i + 1 }))
  localStorage.setItem(BANNERS_KEY, JSON.stringify(normalized))
  try {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('banners-updated', { detail: normalized }))
      if (typeof BroadcastChannel !== 'undefined') {
        const ch = new BroadcastChannel('banners')
        ch.postMessage({ type: 'banners-updated', payload: normalized })
        ch.close()
      }
    }
  } catch (e) { void e }
}
export function addBanner(item) {
  const items = getBanners()
  const id = 'b_' + Math.random().toString(36).slice(2)
  const sno = Number(item.sno) || items.length + 1
  const next = { id, sno, img: item.img || '', title: item.title || '', subtitle: item.subtitle || '', ctaText: item.ctaText || '', ctaTo: item.ctaTo || '' }
  items.push(next)
  items.sort((a, b) => (Number(a.sno || 0) - Number(b.sno || 0)))
  saveBanners(items)
  return next
}
export function updateBanner(id, patch) {
  const items = getBanners()
  const idx = items.findIndex((x) => x.id === id)
  if (idx >= 0) {
    const a = items[idx]
    const sno = patch.sno != null ? Number(patch.sno) : a.sno
    items[idx] = { ...a, ...(patch || {}), sno }
    items.sort((x, y) => (Number(x.sno || 0) - Number(y.sno || 0)))
    saveBanners(items)
    return items[idx]
  }
  return null
}
export function deleteBanner(id) {
  const items = getBanners().filter((x) => x.id !== id)
  saveBanners(items)
}
export function moveBanner(id, dir) {
  const items = getBanners()
  const idx = items.findIndex((x) => x.id === id)
  if (idx < 0) return
  const j = dir === 'up' ? idx - 1 : idx + 1
  if (j < 0 || j >= items.length) return
  const tmp = items[idx]
  items[idx] = items[j]
  items[j] = tmp
  const renum = items.map((x, i) => ({ ...x, sno: i + 1 }))
  saveBanners(renum)
}
export async function addBannerBackend(item) {
  try {
    const res = await fetch(BASE + '/banners', { method: 'POST', headers: { 'Content-Type': 'application/json', ...getAdminAuthHeaders() }, body: JSON.stringify(item) })
    if (!res.ok) throw new Error('fail')
    const _ = await res.json()
    const list = await fetch(BASE + '/banners', { cache: 'no-store' }).then((r) => r.json()).catch(() => [])
    const normalized = Array.isArray(list) ? list.map((x, i) => ({
      id: x._id || x.id || ('b_' + (i + 1)),
      sno: Number(x.sno || i + 1),
      img: x.img || '',
      title: x.title || '',
      subtitle: x.subtitle || '',
      ctaText: x.ctaText || '',
      ctaTo: x.ctaTo || '',
    })).sort((a, b) => (Number(a.sno || 0) - Number(b.sno || 0))) : []
    saveBanners(normalized)
    return normalized
  } catch {
    return addBanner(item)
  }
}
export async function updateBannerBackend(id, patch) {
  try {
    const res = await fetch(BASE + `/banners/${encodeURIComponent(id)}`, { method: 'PUT', headers: { 'Content-Type': 'application/json', ...getAdminAuthHeaders() }, body: JSON.stringify(patch) })
    if (!res.ok) throw new Error('fail')
    const _ = await res.json()
    const list = await fetch(BASE + '/banners', { cache: 'no-store' }).then((r) => r.json()).catch(() => [])
    const normalized = Array.isArray(list) ? list.map((x, i) => ({
      id: x._id || x.id || ('b_' + (i + 1)),
      sno: Number(x.sno || i + 1),
      img: x.img || '',
      title: x.title || '',
      subtitle: x.subtitle || '',
      ctaText: x.ctaText || '',
      ctaTo: x.ctaTo || '',
    })).sort((a, b) => (Number(a.sno || 0) - Number(b.sno || 0))) : []
    saveBanners(normalized)
    return normalized
  } catch {
    return updateBanner(id, patch)
  }
}
export async function deleteBannerBackend(id) {
  try {
    const res = await fetch(BASE + `/banners/${encodeURIComponent(id)}`, { method: 'DELETE', headers: getAdminAuthHeaders() })
    if (!res.ok) throw new Error('fail')
    const list = await fetch(BASE + '/banners', { cache: 'no-store' }).then((r) => r.json()).catch(() => [])
    const normalized = Array.isArray(list) ? list.map((x, i) => ({
      id: x._id || x.id || ('b_' + (i + 1)),
      sno: Number(x.sno || i + 1),
      img: x.img || '',
      title: x.title || '',
      subtitle: x.subtitle || '',
      ctaText: x.ctaText || '',
      ctaTo: x.ctaTo || '',
    })).sort((a, b) => (Number(a.sno || 0) - Number(b.sno || 0))) : []
    saveBanners(normalized)
    return normalized
  } catch {
    return deleteBanner(id)
  }
}
export async function moveBannerBackend(id, dir) {
  try {
    const list = await fetch(BASE + '/banners', { cache: 'no-store' }).then((r) => r.json()).catch(() => [])
    const normalized = Array.isArray(list) ? list.map((x, i) => ({
      id: x._id || x.id || ('b_' + (i + 1)),
      sno: Number(x.sno || i + 1),
      img: x.img || '',
      title: x.title || '',
      subtitle: x.subtitle || '',
      ctaText: x.ctaText || '',
      ctaTo: x.ctaTo || '',
    })).sort((a, b) => (Number(a.sno || 0) - Number(b.sno || 0))) : []
    const idx = normalized.findIndex((x) => x.id === id)
    if (idx < 0) return normalized
    const j = dir === 'up' ? idx - 1 : idx + 1
    if (j < 0 || j >= normalized.length) return normalized
    const a = normalized[idx]
    const b = normalized[j]
    await fetch(BASE + `/banners/${encodeURIComponent(a.id)}`, { method: 'PUT', headers: { 'Content-Type': 'application/json', ...getAdminAuthHeaders() }, body: JSON.stringify({ sno: b.sno }) })
    await fetch(BASE + `/banners/${encodeURIComponent(b.id)}`, { method: 'PUT', headers: { 'Content-Type': 'application/json', ...getAdminAuthHeaders() }, body: JSON.stringify({ sno: a.sno }) })
    const nextList = await fetch(BASE + '/banners', { cache: 'no-store' }).then((r) => r.json()).catch(() => [])
    const next = Array.isArray(nextList) ? nextList.map((x, i) => ({
      id: x._id || x.id || ('b_' + (i + 1)),
      sno: Number(x.sno || i + 1),
      img: x.img || '',
      title: x.title || '',
      subtitle: x.subtitle || '',
      ctaText: x.ctaText || '',
      ctaTo: x.ctaTo || '',
    })).sort((a2, b2) => (Number(a2.sno || 0) - Number(b2.sno || 0))) : []
    saveBanners(next)
    return next
  } catch {
    moveBanner(id, dir)
    return getBanners()
  }
}
export function clearBanners() {
  saveBanners([])
}
const DEFAULT_BANNERS = [
  { img: '/images/jana.jpeg', title: 'Top Leaders', subtitle: 'See performance board', ctaText: 'View Leaders', ctaTo: '/' },
  { img: '/images/raghul.jpg', title: 'Share & Earn', subtitle: 'Referral cashback and rewards', ctaText: 'Explore', ctaTo: '/sharing' },
  { img: '/images/maha.jpg', title: 'Presentation', subtitle: 'Understand the full plan', ctaText: 'Watch Video', ctaTo: '/video' },
]
export function initBannersIfEmpty() {
  const has = getBanners()
  if (Array.isArray(has) && has.length > 0) return
  const items = DEFAULT_BANNERS.map((b, i) => ({ ...b, id: 'b_' + Math.random().toString(36).slice(2), sno: i + 1 }))
  saveBanners(items)
}
export async function getBannersAsync() {
  try {
    const resTop = await fetch(BASE + '/top-slider', { cache: 'no-store' })
    if (resTop.ok) {
      const top = await resTop.json().catch(() => [])
      if (Array.isArray(top) && top.length) {
        const normalizedTop = top.map((x, i) => ({
          id: x.id || ('ts_' + (i + 1)),
          sno: i + 1,
          img: x.img || '',
          title: x.title || '',
          subtitle: x.subtitle || '',
          ctaText: (x.cta && x.cta.text) || '',
          ctaTo: (x.cta && x.cta.to) || '',
        }))
        return normalizedTop.map((b) => ({ id: b.id, img: b.img, title: b.title, subtitle: b.subtitle, cta: { text: b.ctaText, to: b.ctaTo } }))
      }
    }
    const resApi = await fetch(BASE + '/banners', { cache: 'no-store' })
    if (resApi.ok) {
      const apiData = await resApi.json()
      if (Array.isArray(apiData) && apiData.length) {
        const normalized = apiData
          .map((x, i) => ({
            id: x._id || x.id || ('b_' + (i + 1)),
            sno: Number(x.sno || i + 1),
            img: x.img || x.photo || '',
            title: x.title || '',
            subtitle: x.subtitle || '',
            ctaText: x.ctaText || (x.cta && x.cta.text) || '',
            ctaTo: x.ctaTo || (x.cta && x.cta.to) || ''
          }))
          .sort((a, b) => (Number(a.sno || 0) - Number(b.sno || 0)))
        return normalized.map((b) => ({ id: b.id, img: b.img, title: b.title, subtitle: b.subtitle, cta: { text: b.ctaText, to: b.ctaTo } }))
      }
    }
    const local = getBanners()
    if (local.length) return local.map((b) => ({ ...b, cta: { text: b.ctaText, to: b.ctaTo } }))
    return DEFAULT_BANNERS.map((b) => ({ ...b, id: 'b_' + Math.random().toString(36).slice(2) }))
  } catch {
    const local = getBanners()
    if (local.length) return local.map((b) => ({ ...b, cta: { text: b.ctaText, to: b.ctaTo } }))
    return DEFAULT_BANNERS.map((b) => ({ ...b, id: 'b_' + Math.random().toString(36).slice(2) }))
  }
}

const EVENTS_KEY = 'events'
export function getEvents() {
  const v = localStorage.getItem(EVENTS_KEY)
  return v ? JSON.parse(v) : []
}
export function saveEvents(items) {
  const arr = Array.isArray(items) ? items.slice() : []
  arr.sort((a, b) => (Number(a.sno || 0) - Number(b.sno || 0)))
  const normalized = arr.map((x, i) => ({ ...x, sno: i + 1 }))
  localStorage.setItem(EVENTS_KEY, JSON.stringify(normalized))
  try {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('events-updated', { detail: normalized }))
      if (typeof BroadcastChannel !== 'undefined') {
        const ch = new BroadcastChannel('events')
        ch.postMessage({ type: 'events-updated', payload: normalized })
        ch.close()
      }
    }
  } catch { /* ignore */ }
}
export function addEvent(item) {
  const items = getEvents()
  const id = 'e_' + Math.random().toString(36).slice(2)
  const sno = Number(item.sno) || items.length + 1
  const next = { id, sno, img: item.img || '', date: item.date || '' }
  items.push(next)
  items.sort((a, b) => (Number(a.sno || 0) - Number(b.sno || 0)))
  saveEvents(items)
  return next
}
export function updateEvent(id, patch) {
  const items = getEvents()
  const idx = items.findIndex((x) => x.id === id)
  if (idx >= 0) {
    const a = items[idx]
    const sno = patch.sno != null ? Number(patch.sno) : a.sno
    items[idx] = { ...a, ...(patch || {}), sno }
    items.sort((x, y) => (Number(x.sno || 0) - Number(y.sno || 0)))
    saveEvents(items)
    return items[idx]
  }
  return null
}
export function deleteEvent(id) {
  const items = getEvents().filter((x) => x.id !== id)
  saveEvents(items)
}
export function moveEvent(id, dir) {
  const items = getEvents()
  const idx = items.findIndex((x) => x.id === id)
  if (idx < 0) return
  const j = dir === 'up' ? idx - 1 : idx + 1
  if (j < 0 || j >= items.length) return
  const tmp = items[idx]
  items[idx] = items[j]
  items[j] = tmp
  const renum = items.map((x, i) => ({ ...x, sno: i + 1 }))
  saveEvents(renum)
}
export function clearEvents() {
  saveEvents([])
}

export async function getEventsAsync() {
  try {
    const res = await fetch(BASE + '/events', { cache: 'no-store' })
    if (!res.ok) throw new Error('not_ok')
    const data = await res.json().catch(() => [])
    const normalized = Array.isArray(data) ? data.map((x, i) => ({
      id: x._id || x.id || ('e_' + (i + 1)),
      sno: Number(x.sno || i + 1),
      img: x.img || '',
      date: x.date || '',
    })).sort((a, b) => (Number(a.sno || 0) - Number(b.sno || 0))) : []
    saveEvents(normalized)
    return normalized
  } catch {
    return getEvents()
  }
}

 

export async function addEventBackend(item) {
  try {
    const res = await fetch(BASE + '/events', { method: 'POST', headers: { 'Content-Type': 'application/json', ...getAdminAuthHeaders() }, body: JSON.stringify(item) })
    if (!res.ok) throw new Error('fail')
    await res.json().catch(() => null)
    const list = await getEventsAsync()
    saveEvents(list)
    return list
  } catch {
    addEvent(item)
    const list = getEvents()
    saveEvents(list)
    return list
  }
}

export async function updateEventBackend(id, patch) {
  try {
    const res = await fetch(BASE + `/events/${encodeURIComponent(id)}`, { method: 'PUT', headers: { 'Content-Type': 'application/json', ...getAdminAuthHeaders() }, body: JSON.stringify(patch) })
    if (!res.ok) throw new Error('fail')
    await res.json().catch(() => null)
    const list = await getEventsAsync()
    saveEvents(list)
    return list
  } catch {
    updateEvent(id, patch)
    const list = getEvents()
    saveEvents(list)
    return list
  }
}

export async function deleteEventBackend(id) {
  try {
    const res = await fetch(BASE + `/events/${encodeURIComponent(id)}`, { method: 'DELETE', headers: getAdminAuthHeaders() })
    if (!res.ok) throw new Error('fail')
    await res.json().catch(() => null)
    const list = await getEventsAsync()
    saveEvents(list)
    return list
  } catch {
    deleteEvent(id)
    const list = getEvents()
    saveEvents(list)
    return list
  }
}

export async function moveEventBackend(id, dir) {
  try {
    const list = await getEventsAsync()
    const idx = list.findIndex((x) => x.id === id)
    if (idx < 0) return list
    const j = dir === 'up' ? idx - 1 : idx + 1
    if (j < 0 || j >= list.length) return list
    const a = list[idx]
    const b = list[j]
    await fetch(BASE + `/events/${encodeURIComponent(a.id)}`, { method: 'PUT', headers: { 'Content-Type': 'application/json', ...getAdminAuthHeaders() }, body: JSON.stringify({ sno: b.sno }) })
    await fetch(BASE + `/events/${encodeURIComponent(b.id)}`, { method: 'PUT', headers: { 'Content-Type': 'application/json', ...getAdminAuthHeaders() }, body: JSON.stringify({ sno: a.sno }) })
    const next = await getEventsAsync()
    saveEvents(next)
    return next
  } catch {
    moveEvent(id, dir)
    const list = getEvents()
    saveEvents(list)
    return list
  }
}

export async function clearEventsBackend() {
  try {
    const list = await getEventsAsync()
    await Promise.all(list.map((ev) => fetch(BASE + `/events/${encodeURIComponent(ev.id)}`, { method: 'DELETE', headers: getAdminAuthHeaders() }).catch(() => null)))
    const empty = await getEventsAsync()
    saveEvents(empty)
    return empty
  } catch {
    clearEvents()
    const empty = getEvents()
    saveEvents(empty)
    return empty
  }
}

export async function syncTopSliderEventsBackend() {
  try {
    const res = await fetch(BASE + '/admin/sync-topslider-events', { method: 'POST', headers: getAdminAuthHeaders() })
    if (!res.ok) throw new Error('fail')
    const list = await res.json().catch(() => [])
    const normalized = Array.isArray(list)
      ? list.map((x, i) => ({ id: x._id || x.id || ('e_' + (i + 1)), sno: Number(x.sno || i + 1), img: x.img || '', date: x.date || '' }))
        .sort((a, b) => (Number(a.sno || 0) - Number(b.sno || 0)))
      : []
    saveEvents(normalized)
    return normalized
  } catch {
    return getEvents()
  }
}
export async function submitJoinResponse(payload) {
  try {
    const res = await fetch(BASE + '/join', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (!res.ok) throw new Error('not_ok')
    const data = await res.json().catch(() => null)
    const item = {
      id: (data && data._id) || '',
      name: payload.name || '',
      mobile: payload.mobile || '',
      gmail: payload.gmail || '',
      place: payload.place || '',
      sponsor: payload.sponsor || '',
      source: payload.source || '',
      message: payload.message || '',
      ts: Date.now(),
    }
    const list = getJoinResponses()
    list.unshift(item)
    localStorage.setItem(JOIN_RESP_KEY, JSON.stringify(list))
    return true
  } catch {
    return false
  }
}

export async function importApiFolderBackend() {
  try {
    const res = await fetch(BASE + '/admin/import-api-folder', { method: 'POST', headers: getAdminAuthHeaders() })
    if (!res.ok) throw new Error('fail')
    const summary = await res.json().catch(() => ({}))
    const leaders = await getLeadersAsync().catch(() => getLeaders())
    saveLeaders(leaders)
    const events = await getEventsAsync().catch(() => getEvents())
    saveEvents(events)
    return { ok: true, summary, leadersCount: leaders.length, eventsCount: events.length }
  } catch {
    return { ok: false }
  }
}
export async function getTopSliderImagesBackend() {
  try {
    const res = await fetch(BASE + '/top-slider', { cache: 'no-store' })
    if (!res.ok) return []
    const data = await res.json().catch(() => [])
    return Array.isArray(data) ? data : []
  } catch {
    return []
  }
}
export async function addTopSliderImageBackend(file) {
  try {
    const fd = new FormData()
    fd.append('file', file)
    const headers = getAdminAuthHeaders()
    const res = await fetch(BASE + '/top-slider', {
      method: 'POST',
      headers,
      body: fd,
    })
    if (!res.ok) throw new Error('upload_failed')
    await res.json().catch(() => null)
    return await getTopSliderImagesBackend()
  } catch {
    return await getTopSliderImagesBackend()
  }
}
export async function deleteTopSliderImageBackend(name) {
  try {
    const safe = String(name || '').toLowerCase()
    if (!safe) return await getTopSliderImagesBackend()
    const res = await fetch(BASE + `/top-slider/${encodeURIComponent(safe)}`, {
      method: 'DELETE',
      headers: getAdminAuthHeaders(),
    })
    if (!res.ok) throw new Error('delete_failed')
    await res.json().catch(() => null)
    return await getTopSliderImagesBackend()
  } catch {
    return await getTopSliderImagesBackend()
  }
}
export async function submitComplaintResponse(payload) {
  try {
    const res = await fetch(BASE + '/complaints', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (!res.ok) throw new Error('not_ok')
    const data = await res.json().catch(() => null)
    const item = {
      id: (data && data._id) || '',
      type: payload.type || '',
      name: payload.name || '',
      contact: payload.contact || '',
      message: payload.message || '',
      ts: Date.now(),
    }
    const list = getComplaintResponses()
    list.unshift(item)
    localStorage.setItem(COMPLAINT_RESP_KEY, JSON.stringify(list))
    return true
  } catch {
    return false
  }
}
