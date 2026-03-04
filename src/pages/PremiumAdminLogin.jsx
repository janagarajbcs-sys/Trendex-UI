import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { loginAdmin, loginAdminBackend } from '../lib/premium'

export default function PremiumAdminLogin() {
  const [email, setEmail] = useState('')
  const [pwd, setPwd] = useState('')
  const [err, setErr] = useState('')
  const nav = useNavigate()
  function onSubmit(e) {
    e.preventDefault()
    const em = email.trim()
    const pw = pwd
    const okLocal = loginAdmin(em, pw)
    if (okLocal) { nav('/premium/admin'); return }
    loginAdminBackend(em, pw).then((token) => {
      if (token) nav('/premium/admin')
      else setErr('Invalid admin credentials.')
    })
  }
  return (
    <div style={{ display: 'grid', placeItems: 'center', minHeight: '68vh', padding: 16 }}>
      <div style={{ width: '100%', maxWidth: 440 }}>
        <h1 style={{ color: '#00ddeb', textAlign: 'center', marginBottom: 8 }}>Admin Login</h1>
        <p style={{ textAlign: 'center', opacity: .8, marginTop: 0, marginBottom: 16 }}>Manage users, leaders, banners and course modules</p>
        <form onSubmit={onSubmit} className="card" style={{ display: 'grid', gap: 12, padding: 16 }}>
          <div style={{ display: 'grid', gap: 8 }}>
            <label style={{ fontSize: 14 }}>Admin Email</label>
            <input placeholder="name@example.com" value={email} onChange={(e) => setEmail(e.target.value)} type="email" required style={{ padding: 12, borderRadius: 10, width: '100%' }} />
          </div>
          <div style={{ display: 'grid', gap: 8 }}>
            <label style={{ fontSize: 14 }}>Password</label>
            <input placeholder="••••••••" value={pwd} onChange={(e) => setPwd(e.target.value)} type="password" required style={{ padding: 12, borderRadius: 10, width: '100%' }} />
          </div>
          <button className="btn" type="submit" style={{ width: '100%', padding: 12 }}>Login</button>
          {!!err && <div style={{ color: '#ff8b92', textAlign: 'center' }}>{err}</div>}
        </form>
      </div>
    </div>
  )
}
