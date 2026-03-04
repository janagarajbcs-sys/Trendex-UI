import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { registerUser, registerUserBackend, getUsersCountAsync } from '../lib/premium'

export default function PremiumSignup() {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [team, setTeam] = useState('')
  const [leader, setLeader] = useState('')
  const [pwd, setPwd] = useState('')
  const [done, setDone] = useState(false)
  const [count, setCount] = useState(0)
  const [err, setErr] = useState('')
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
    setErr('')
    try {
      const n = name.trim()
      const t = team.trim()
      const l = leader.trim()
      const p = phone.trim()
      const m = email.trim()
      const pw = pwd.trim()
      if (!n || !t || !l || !pw || !/^[0-9]{10}$/.test(p) || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(m)) {
        setDone(false)
        setErr('Please fill all fields correctly.')
        return
      }
      try {
        await registerUserBackend({ name: n, phone: p, email: m, team: t, leader: l, password: pw })
      } catch (e) {
        // Fallback to local if backend not available
        if (e && e.message === 'duplicate_user' || e && e.message === 'DUPLICATE_USER') {
          throw e
        }
        registerUser({ name: n, phone: p, email: m, team: t, leader: l, password: pw })
      }
      setDone(true)
      setName(''); setPhone(''); setEmail(''); setTeam(''); setLeader(''); setPwd('')
    } catch {
      setDone(false)
      setErr('This phone or mail ID is already registered.')
    }
  }
  return (
    <div>
      <h1 style={{ color: '#00ddeb' }}>Premium Sign Up</h1>
      <div style={{ textAlign: 'center', marginBottom: 10 }}>
        <div style={{ fontSize: 42, fontWeight: 800, color: 'var(--accent)', textShadow: '0 0 16px rgba(90,224,255,.35)' }}>{count}</div>
        <div style={{ opacity: .8 }}>Registered Users</div>
      </div>
      <form onSubmit={onSubmit} className="card" style={{ maxWidth: 520, margin: '0 auto', display: 'grid', gap: 10 }}>
        <input placeholder="Name" required value={name} onChange={(e) => setName(e.target.value)} style={{ padding: 10, borderRadius: 8 }} />
        <input placeholder="Phone Number" required value={phone} onChange={(e) => setPhone(e.target.value)} pattern="^[0-9]{10}$" title="10 digit phone" style={{ padding: 10, borderRadius: 8 }} />
        <input placeholder="Mail ID" required value={email} onChange={(e) => setEmail(e.target.value)} type="email" style={{ padding: 10, borderRadius: 8 }} />
        <input placeholder="Team Name" required value={team} onChange={(e) => setTeam(e.target.value)} style={{ padding: 10, borderRadius: 8 }} />
        <input placeholder="Leader's Name" required value={leader} onChange={(e) => setLeader(e.target.value)} style={{ padding: 10, borderRadius: 8 }} />
        <input placeholder="Password" required type="password" value={pwd} onChange={(e) => setPwd(e.target.value)} style={{ padding: 10, borderRadius: 8 }} />
        <button className="btn" type="submit">Submit for Approval</button>
        {!!err && <div style={{ color: '#ff8b92', textAlign: 'center' }}>{err}</div>}
        {done && <div style={{ color: '#22c55e', textAlign: 'center' }}>Registration submitted. Await admin approval.</div>}
        <div style={{ textAlign: 'center' }}>
          <Link className="btn secondary" to="/premium/login">Already approved? Login →</Link>
        </div>
      </form>
    </div>
  )
}
