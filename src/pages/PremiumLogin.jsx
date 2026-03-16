import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { loginUser, loginUserBackend, getUsersCountAsync, loginAdmin, loginAdminBackend } from '../lib/premium'

export default function PremiumLogin() {
  const [id, setId] = useState('')
  const [pwd, setPwd] = useState('')
  const [err, setErr] = useState('')
  const [showExpired, setShowExpired] = useState(false)
  const [count, setCount] = useState(0)
  const nav = useNavigate()

  const WHATSAPP_LINK = "https://wa.me/918012202083?text=i%20am%20ready%20to%20pay%20Rs%20499%20/%205%20usdt%20please%20send%20me%20the%20QR%20or%20payment%20details."

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
    
    // if (loginAdmin(identifier, password)) { 
    //   console.log('[Login] Admin login success (local)')
    //   nav('/premium/admin')
    //   return 
    // }
    
    // const tok = await loginAdminBackend(identifier, password)
    // if (tok) { 
    //   console.log('[Login] Admin login success (backend)')
    //   nav('/premium/admin')
    //   return 
    // }
    
    let user = await loginUserBackend(identifier, password)
    console.log('[Login] Backend login result:', user)
    
    if (!user) {
      user = loginUser(identifier, password)
      console.log('[Login] Local login result:', user)
    }
    console.log(user,"user");
    
    if (user) {
      if(user.isAdmin) {
        console.log('[Login] Admin login successful, navigating to admin dashboard')
        nav('/premium/admin')
        return
      }

      if (user.approved && !user.videoAccess) {
        console.log('[Login] Video access disabled, showing expired card')
        setShowExpired(true)
        return
      }

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

      {showExpired ? (
        <div className="card" style={{ maxWidth: 420, margin: '0 auto', textAlign: 'center', padding: '30px 20px' }}>
          <div style={{ fontSize: 24, fontWeight: 'bold', color: '#ef4444', marginBottom: 15 }}>
            🔒 Access Expired
          </div>
          <div style={{ fontSize: 16, marginBottom: 20, opacity: 0.9 }}>
            Your 7-day free access has expired. Please renew to continue your training.
          </div>
          <a 
            href={WHATSAPP_LINK}
            target="_blank"
            rel="noreferrer"
            className="btn"
            style={{ display: 'inline-block', width: '100%', marginBottom: 15 }}
          >
            Renew Access (Rs: 499 / 5 USDT)
          </a>
          <button 
            className="btn secondary" 
            onClick={() => setShowExpired(false)}
            style={{ width: '100%' }}
          >
            ← Back to Login
          </button>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="card" style={{ maxWidth: 420, margin: '0 auto', display: 'grid', gap: 10 }}>
          <input placeholder="Email or Mobile Number" value={id} onChange={(e) => setId(e.target.value)} required style={{ padding: 10, borderRadius: 8 }} />
          <input placeholder="Password" type="password" value={pwd} onChange={(e) => setPwd(e.target.value)} required style={{ padding: 10, borderRadius: 8 }} />
          <button className="btn" type="submit">Login</button>
          {!!err && <div style={{ color: '#ff8b92', textAlign: 'center' }}>{err}</div>}
          <div style={{ textAlign: 'center' }}>
            <Link className="btn secondary" to="/premium/signup">New here? Sign Up →</Link>
          </div>
        </form>
      )}
    </div>
  )
}
