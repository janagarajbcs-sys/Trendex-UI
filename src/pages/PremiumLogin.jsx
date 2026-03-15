import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { loginUser, loginUserBackend, getUsersCountAsync, loginAdmin, loginAdminBackend } from '../lib/premium'

export default function PremiumLogin() {
  const [id, setId] = useState('')
  const [pwd, setPwd] = useState('')
  const [err, setErr] = useState('')
  const [count, setCount] = useState(0)
  const nav = useNavigate()
  useEffect(() => {
    let active = true
    async function loadCount() {
      const total = await getUsersCountAsync()
      if (!active) return
      const start = performance.now()
      function step(t) {
        const p = Math.min(1, (t - start) / 900)
        const v = Math.floor(p * total)
        setCount(v)
        if (p < 1) requestAnimationFrame(step)
      }
      requestAnimationFrame(step)
    }
    loadCount()
    return () => { active = false }
  }, [])
  async function onSubmit(e) {
    e.preventDefault()
    const identifier = id.trim()
    const password = pwd.trim()
    if (!identifier || !password) {
      setErr('Please fill all fields.')
      return
    }
    console.log('[Login] Attempting login with:', identifier)
    
    if (loginAdmin(identifier, password)) { 
      console.log('[Login] Admin login success (local)')
      nav('/premium/admin')
      return 
    }
    
    const tok = await loginAdminBackend(identifier, password)
    if (tok) { 
      console.log('[Login] Admin login success (backend)')
      nav('/premium/admin')
      return 
    }
    
    let user = await loginUserBackend(identifier, password)
    console.log('[Login] Backend login result:', user)
    
    if (!user) {
      user = loginUser(identifier, password)
      console.log('[Login] Local login result:', user)
    }
    
    if (user) {
      console.log('[Login] Login successful, navigating to course')
      // Small delay to ensure localStorage is written
      await new Promise(resolve => setTimeout(resolve, 100))
      nav('/premium/course')
    }
    else {
      console.log('[Login] Login failed')
      setErr('Invalid credentials or not approved yet.')
    }
  }
  return (
    <div>
      <h1 style={{ color: '#00ddeb' }}>Premium Login</h1>
      <div style={{ textAlign: 'center', marginBottom: 10 }}>
        <div style={{ fontSize: 42, fontWeight: 800, color: 'var(--accent)', textShadow: '0 0 16px rgba(90,224,255,.35)' }}>{count}</div>
        <div style={{ opacity: .8 }}>Registered Users</div>
      </div>
      <form onSubmit={onSubmit} className="card" style={{ maxWidth: 420, margin: '0 auto', display: 'grid', gap: 10 }}>
        <input placeholder="Email or Mobile Number" value={id} onChange={(e) => setId(e.target.value)} required style={{ padding: 10, borderRadius: 8 }} />
        <input placeholder="Password" type="password" value={pwd} onChange={(e) => setPwd(e.target.value)} required style={{ padding: 10, borderRadius: 8 }} />
        <button className="btn" type="submit">Login</button>
        {!!err && <div style={{ color: '#ff8b92', textAlign: 'center' }}>{err}</div>}
        <div style={{ textAlign: 'center' }}>
          <Link className="btn secondary" to="/premium/signup">New here? Sign Up →</Link>
        </div>
      </form>
    </div>
  )
}
