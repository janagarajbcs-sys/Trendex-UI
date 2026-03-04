import { useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { getLeaders, getLeadersAsync, getEvents, getEventsAsync, submitJoinResponse } from '../lib/premium'
import EventSlider from '../components/EventSlider.jsx'

export default function Home() {
  const location = useLocation()
  const chartRef = useRef(null)
  const widgetRef = useRef(null)
  const [market, setMarket] = useState(null)
  const [updated, setUpdated] = useState('')
  const [name, setName] = useState('')
  const [mobile, setMobile] = useState('')
  const [email, setEmail] = useState('')
  const [sponsor, setSponsor] = useState('')
  const [source, setSource] = useState('')
  const [message, setMessage] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [leaders, setLeaders] = useState([])
  console.log('leaders', leaders)
  const [preview, setPreview] = useState('')
  const holdTimer = useRef(null)
  const [showAllLeaders, setShowAllLeaders] = useState(false)
  const [events, setEvents] = useState([])

  // Load TradingView widget
  useEffect(() => {
    let mounted = true
    function loadWidget() {
      if (!mounted || !window.TradingView) return
      if (widgetRef.current) {
        try { widgetRef.current.remove() } catch (e) { void e }
        widgetRef.current = null
      }
      widgetRef.current = new window.TradingView.widget({
        container_id: 'tradingview_chart',
        width: '100%',
        height: 420,
        symbol: 'BINANCE:BTCUSDT',
        interval: '60',
        timezone: 'Asia/Kolkata',
        theme: 'dark',
        style: '1',
        locale: 'en',
        toolbar_bg: '#0d1b2a',
        enable_publishing: false,
        allow_symbol_change: true,
        details: true,
        studies: ['MASimple@tv-basicstudies'],
      })
    }
    if (!window.TradingView) {
      const s = document.createElement('script')
      s.src = 'https://s3.tradingview.com/tv.js'
      s.onload = loadWidget
      document.body.appendChild(s)
    } else {
      loadWidget()
    }
    return () => { mounted = false }
  }, [])

  function resolvePhoto(val) {
    if (!val) return ''
    const s = String(val)
    if (/^(data:|https?:|\/)/i.test(s)) return s
    return '/images/' + s.replace(/^\/+/, '')
  }
  function startHold(src) {
    if (holdTimer.current) clearTimeout(holdTimer.current)
    holdTimer.current = setTimeout(() => setPreview(src), 450)
  }
  function cancelHold() {
    if (holdTimer.current) {
      clearTimeout(holdTimer.current)
      holdTimer.current = null
    }
  }

  useEffect(() => {
    if (location.hash === '#join-business') {
      const el = document.getElementById('join-business')
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      else {
        setTimeout(() => {
          const e2 = document.getElementById('join-business')
          if (e2) e2.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }, 80)
      }
    }
  }, [location])
  // Market snapshot
  useEffect(() => {
    async function formatTimeIST(ts) {
      const d = ts ? new Date(ts) : new Date()
      return d.toLocaleString('en-IN', {
        timeZone: 'Asia/Kolkata',
        hour12: true,
        hour: '2-digit',
        minute: '2-digit',
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    }
    function readCache() {
      try {
        const raw = localStorage.getItem('market_cache')
        if (!raw) return null
        const parsed = JSON.parse(raw)
        if (!parsed || !parsed.data) return null
        return parsed
      } catch { return null }
    }
    async function loadPrices() {
      const url =
        'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,binancecoin&vs_currencies=usd,inr&include_24hr_change=true'
      try {
        const res = await fetch(url, { cache: 'no-store' })
        if (!res.ok) throw new Error('service_unavailable')
        const data = await res.json()
        if (data && data.bitcoin && data.ethereum && data.binancecoin) {
          setMarket({
            btc: data.bitcoin,
            eth: data.ethereum,
            bnb: data.binancecoin,
          })
          const now = Date.now()
          setUpdated(await formatTimeIST(now))
          try {
            localStorage.setItem('market_cache', JSON.stringify({ data, updated: now }))
          } catch { /* ignore quota */ }
        }
      } catch {
        const cache = readCache()
        if (cache && cache.data) {
          setMarket({
            btc: cache.data.bitcoin,
            eth: cache.data.ethereum,
            bnb: cache.data.binancecoin,
          })
          setUpdated((await formatTimeIST(cache.updated)) + ' (cached)')
        } else {
          setMarket(null)
        }
      }
    }
    // Prime with cache if available
    const cache = (function(){ try { return JSON.parse(localStorage.getItem('market_cache') || 'null') } catch { return null } })()
    if (cache && cache.data) {
      setMarket({
        btc: cache.data.bitcoin,
        eth: cache.data.ethereum,
        bnb: cache.data.binancecoin,
      })
      formatTimeIST(cache.updated).then((s) => setUpdated(s + ' (cached)')).catch(() => {})
    }
    loadPrices()
    const t = setInterval(loadPrices, 60000)
    return () => clearInterval(t)
  }, [])

  // Load leaders from API with fallback to admin-managed storage
  useEffect(() => {
    async function load() {
      try {
        let list = await getLeadersAsync()
        if (!Array.isArray(list) || list.length === 0) {
          list = getLeaders()
        }
        if (Array.isArray(list)) {
          const sorted = [...list].sort((a, b) => (Number(a.sno || 0) - Number(b.sno || 0)))
          setLeaders(sorted)
        } else {
          setLeaders([])
        }
      } catch {
        setLeaders([])
      }
    }
    load()
    const onStorage = (e) => {
      if (e.key === 'leaders') load()
    }
    const onLocal = () => load()
    let ch
    if (typeof BroadcastChannel !== 'undefined') {
      ch = new BroadcastChannel('leaders')
      ch.onmessage = (msg) => {
        if (msg && msg.data && msg.data.type === 'leaders-updated') load()
      }
    }
    window.addEventListener('storage', onStorage)
    window.addEventListener('leaders-updated', onLocal)
    return () => {
      window.removeEventListener('storage', onStorage)
      window.removeEventListener('leaders-updated', onLocal)
      if (ch) ch.close()
    }
  }, [])

  // useEffect(() => {
  //   async function loadEvents() {
  //     try {
  //       let list = await getEventsAsync()
  //       if (!Array.isArray(list) || list.length === 0) {
  //         list = getEvents()
  //       }
  //       if (Array.isArray(list)) setEvents(list)
  //       else setEvents([])
  //     } catch { setEvents([]) }
  //   }
  //   loadEvents()
  //   const onStorage = (e) => {
  //     if (e.key === 'events') loadEvents()
  //   }
  //   const onLocal = () => loadEvents()
  //   let ch
  //   if (typeof BroadcastChannel !== 'undefined') {
  //     ch = new BroadcastChannel('events')
  //     ch.onmessage = (msg) => {
  //       if (msg && msg.data && msg.data.type === 'events-updated') loadEvents()
  //     }
  //   }
  //   window.addEventListener('storage', onStorage)
  //   window.addEventListener('events-updated', onLocal)
  //   return () => {
  //     window.removeEventListener('storage', onStorage)
  //     window.removeEventListener('events-updated', onLocal)
  //     if (ch) ch.close()
  //   }
  // }, [])

  return (
    <div>
      <section className="card" style={{ marginBottom: 16 }}>
        <h1 style={{ color: '#00ddeb', margin: 6 }}>AI Trendex - Tamil(Support & Guide)</h1>
        <h3>Automated Cryptocurrency Trading with 9 strategies</h3>
        <p>The first real-time spot & futures bots with AI-driven risk management.</p>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center', marginTop: 12 }}>
          <a className="btn" href="https://aitrendex.com/" target="_blank" rel="noreferrer">Visit Trendex Website</a>
          <a className="btn secondary" href="https://play.google.com/store/apps/details?id=com.binance.dev" target="_blank" rel="noreferrer">Binance Android</a>
          <a className="btn secondary" href="https://apps.apple.com/app/binance-buy-bitcoin-crypto/id1436799971" target="_blank" rel="noreferrer">Binance iOS</a>
        </div>
      </section>

      {/* Leaders board moved to Share & Earn page */}

      {/* Leaders board will be shown after Trading Strategies below */}

      <section style={{ marginBottom: 16 }}>
        <h2 style={{ color: '#cfeef3' }}>Live Crypto Market</h2>
        <div className="card" style={{ overflow: 'hidden', borderRadius: 12 }}>
          <div id="tradingview_chart" ref={chartRef} style={{ width: '100%', height: 'min(420px, 70vw)' }} />
        </div>
      </section>

      <section style={{ marginBottom: 16 }}>
        <h2 style={{ color: '#cfeef3' }}>Top Market Updates</h2>
        <div className="card">
          {!market ? (
            <p style={{ color: '#ff8b92' }}>Unable to load market data.</p>
          ) : (
            <>
              <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 10, fontSize: '0.95rem' }}>
                <thead>
                  <tr>
                    <th>Asset</th>
                    <th>Price (USD)</th>
                    <th>Price (INR)</th>
                    <th>24h</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['Bitcoin (BTC)', market.btc],
                    ['Ethereum (ETH)', market.eth],
                    ['Binance Coin (BNB)', market.bnb],
                  ].map(([label, coin]) => (
                    <tr key={label}>
                      <td>{label}</td>
                      <td>${Number(coin.usd).toLocaleString()}</td>
                      <td>₹{Number(coin.inr).toLocaleString()}</td>
                      <td style={{ color: coin.usd_24h_change >= 0 ? '#4ef58b' : '#ff8b92', fontWeight: 700 }}>
                        {coin.usd_24h_change.toFixed(2)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p style={{ marginTop: 10, color: '#9fb3bf' }}>Current Market Last updated: <span>{updated || '--'}</span></p>
            </>
          )}
        </div>
      </section>

      <section style={{ display: 'grid', gap: 12 }}>
        <div className="card">
          <h2>Full Plan Presentation Video</h2>
          <Link className="btn" to="/video">Watch Now →</Link>
        </div>
        <div className="card">
          <h2>Trading Strategies</h2>
          <Link className="btn" to="/bot">Types of Strategies →</Link>
        </div>
        <div className="card">
          <h2>💰 Share and Earn</h2>
          <Link className="btn" to="/sharing">View Details →</Link>
        </div>
        <div className="card">
          <h2 style={{ color: '#111827' }}>Top Team Leaders — Performance Board</h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'center' }}>S.No</th>
                  <th style={{ textAlign: 'center' }}>Photo</th>
                  <th>Name</th>
                  <th>Rank Name</th>
                  <th>Location</th>
                </tr>
              </thead>
              <tbody>
                {(showAllLeaders ? leaders : leaders.slice(0, 10)).map((l, i) => (
                  <tr key={l.id || `${l.name}-${i}`}>
                    <td style={{ textAlign: 'center', fontWeight: 700 }}>{l.sno ?? (i + 1)}</td>
                    <td style={{ textAlign: 'center' }}>
                      {l.photo ? (
                        <div
                          style={{ width: 42, height: 56, padding: 2, background: '#fff', border: '2px solid #ffffff', borderRadius: 6, display: 'inline-block' }}
                          onMouseDown={() => startHold(resolvePhoto(l.photo))}
                          onMouseUp={cancelHold}
                          onMouseLeave={cancelHold}
                          onTouchStart={() => startHold(resolvePhoto(l.photo))}
                          onTouchEnd={cancelHold}
                          onTouchCancel={cancelHold}
                        >
                          <img
                            src={resolvePhoto(l.photo)}
                            alt={l.name || 'leader'}
                            style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 4 }}
                          />
                        </div>
                      ) : '-'}
                    </td>
                    <td style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 220, fontWeight: 800, fontSize: '.9rem' }}>{l.name}</td>
                    <td style={{ fontSize: '.82rem' }}>{l.title}</td>
                    <td style={{ fontSize: '.72rem' }}>{l.loc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {leaders.length > 10 && !showAllLeaders && (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '8px 0' }}>
                <button
                  className="btn secondary"
                  onClick={() => setShowAllLeaders(true)}
                  style={{ padding: '5px 10px', fontSize: '.85rem' }}
                >
                  More
                </button>
              </div>
            )}
            {leaders.length > 10 && showAllLeaders && (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '8px 0' }}>
                <button
                  className="btn secondary"
                  onClick={() => setShowAllLeaders(false)}
                  style={{ padding: '5px 10px', fontSize: '.85rem' }}
                >
                  Less
                </button>
              </div>
            )}
            {leaders.length === 0 && (
              <div style={{ padding: '10px 14px', opacity: 0.85 }}>No leaders yet. Add entries in the admin dashboard.</div>
            )}
          </div>
        </div>
        {preview && (
          <div
            onClick={() => setPreview('')}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.8)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 9999,
            }}
          >
            <img
              src={preview}
              alt="Leader"
              style={{
                maxWidth: '92vw',
                maxHeight: '92vh',
                objectFit: 'contain',
                border: '4px solid #ffffff',
                borderRadius: 10,
                boxShadow: '0 12px 32px rgba(0,0,0,0.5)',
              }}
            />
          </div>
        )}
        <div className="card">
          <h2>Suggestion or Complaint</h2>
          <Link className="btn" to="/complaint">Type Now →</Link>
        </div>
        {events.length ? (
          <div className="card">
            <h2>Meetings & Trips</h2>
            <EventSlider items={events} />
          </div>
        ) : null}
        <div className="card">
          <h2>Frequently asked 100's of Questions & Answers</h2>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
            <Link className="btn secondary" to="/qanda/company">Trendex Basics</Link>
            <Link className="btn secondary" to="/qanda/trading">Trading</Link>
            <Link className="btn secondary" to="/qanda/refer">Referral</Link>
            <Link className="btn secondary" to="/qanda/pricing">Payments</Link>
            <Link className="btn secondary" to="/qanda/support">Support</Link>
          </div>
        </div>
        <div className="card" id="join-business" style={{ textAlign: 'left' }}>
          <h2 style={{ marginTop: 0, textAlign: 'center' }}>Need to start/join this Business</h2>
          <form
            onSubmit={async (e) => {
              e.preventDefault()
              const ok = await submitJoinResponse({
                name,
                mobile,
                gmail: email,
                place: '',
                sponsor,
                source,
                message,
              })
              setSubmitted(ok)
              if (ok) {
                setName('')
                setMobile('')
                setEmail('')
                setSponsor('')
                setSource('')
                setMessage('')
              }
            }}
            style={{ display: 'grid', gap: 10, maxWidth: 560, margin: '0 auto' }}
          >
            <label>
              <input
                required
                placeholder="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{ width: '100%', marginTop: 6, padding: 10, borderRadius: 8 }}
              />
            </label>
            <label>
              <input
                required
                placeholder="Mobile Number"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                inputMode="numeric"
                pattern="^[0-9]{10}$"
                maxLength={10}
                title="Enter 10 digit mobile number"
                style={{ width: '100%', marginTop: 6, padding: 10, borderRadius: 8 }}
              />
            </label>
            <label>
              <input
                required
                type="email"
                placeholder="Gmail ID"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                pattern="^[a-zA-Z0-9._%+-]+@gmail\\.com$"
                title="Enter a valid Gmail address"
                style={{ width: '100%', marginTop: 6, padding: 10, borderRadius: 8 }}
              />
            </label>
            <label>
              <input
                required
                placeholder="Sponsor name / mobile number"
                value={sponsor}
                onChange={(e) => setSponsor(e.target.value)}
                style={{ width: '100%', marginTop: 6, padding: 10, borderRadius: 8 }}
              />
            </label>
            <label>
              <select
                required
                value={source}
                onChange={(e) => setSource(e.target.value)}
                style={{ width: '100%', marginTop: 6, padding: 10, borderRadius: 8 }}
              >
                <option value="">Select social media source</option>
                <option value="whatsapp">WhatsApp</option>
                <option value="facebook">Facebook</option>
                <option value="youtube">YouTube</option>
                <option value="instagram">Instagram</option>
                <option value="telegram">Telegram</option>
              </select>
            </label>
            <label>
              <textarea
                required
                rows={4}
                placeholder="Enter your requirement message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                style={{ width: '100%', marginTop: 6, padding: 10, borderRadius: 8 }}
              />
            </label>
            <button
              className="btn"
              type="submit"
              disabled={
                !name ||
                !/^[0-9]{10}$/.test(mobile) ||
                !/^[a-zA-Z0-9._%+-]+@gmail\.com$/.test(email) ||
                !sponsor ||
                !source ||
                !message
              }
              style={{ opacity: (
                !name ||
                !/^[0-9]{10}$/.test(mobile) ||
                !/^[a-zA-Z0-9._%+-]+@gmail\.com$/.test(email) ||
                !sponsor ||
                !source ||
                !message
              ) ? 0.6 : 1 }}
            >
              Submit
            </button>
            {submitted && (
              <div style={{ color: '#22c55e', textAlign: 'center' }}>
                Submitted successfully!
              </div>
            )}
          </form>
        </div>
        <div className="card" style={{ marginTop: 12 }}>
          <h2>Premium Access</h2>
          <Link className="btn" to="/premium">Go to Premium →</Link>
        </div>
      </section>
    </div>
  )
}
