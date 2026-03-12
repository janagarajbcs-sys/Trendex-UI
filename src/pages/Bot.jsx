import { useState, useRef } from 'react'
import { Link } from 'react-router-dom'

export default function Bot() {
  const [inr, setInr] = useState('')
  const [usdt, setUsdt] = useState('')
  const calculatorRef = useRef(null)
  const rate = 96
  const bots = [
    { name: 'DCA Bot', desc: ['Only runs in top BTC/USDT pair (Spot)', 'Algorithm-based averaging', 'Buys in downtrend, sells on uptrend'], capital: '15 USDT' },
    { name: 'Nero Bot', desc: ['Full averaging system (Futures)', 'Top 25 pairs', '≈95% accuracy / 5% risk'], capital: '700 USDT' },
    { name: 'Quent Bot', desc: ['Gold Based trading pair (Futures)', 'Top 50 pairs', '≈99% accuracy / 1% risk'], capital: '500 USDT' },
    { name: 'Zeno Bot', desc: ['Swing trading (Futures)', 'Top 50 pairs', '≈80% accuracy / 20% risk'], capital: '200 USDT' },
    { name: 'Candles Bot', desc: ['Light averaging (Futures)', 'Top 50 pairs', '≈85% accuracy / 15% risk'], capital: '200 USDT' },
    { name: 'Zeno 3x Bot', desc: ['Minimum version of Zeno', 'Top 50 pairs', '≈80% accuracy / 20% risk'], capital: '100 USDT' },
    { name: 'Candle 3x Bot', desc: ['Minimum version of Candles', 'Top 50 pairs', '≈85% accuracy / 15% risk'], capital: '100 USDT' },
    { name: 'Alpha Bot', desc: ['Scalping trading system', 'Top 50 pairs', '≈80% accuracy / 20% risk'], capital: '300 USDT' },
    { name: 'Trendex Bot', desc: ['Runs Spot (500 USDT) & Futures (500 USDT)', 'Algorithm + AI', 'Profit in both downtrend & uptrend'], capital: '1000 USDT' },
  ]
  const formatINR = (n) => Number(n).toLocaleString('en-IN')
  const monthlyRange = (x) => [x * 0.10, x * 0.40]
  const yearlyRange = (x) => [x * 1.20, x * 4.80]
  const onInr = (v) => {
    const val = parseFloat(v || 0)
    if (val > 0) {
      const u = +(val / rate).toFixed(2)
      setInr(val)
      setUsdt(u)
    } else {
      setInr('')
      setUsdt('')
    }
  }
  const onUsdt = (v) => {
    const val = parseFloat(v || 0)
    if (val > 0) {
      const i = +(val * rate).toFixed(2)
      setUsdt(val)
      setInr(i)
    } else {
      setInr('')
      setUsdt('')
    }
  }

  const handleBotClick = (capitalStr) => {
    const val = parseFloat(capitalStr.replace(' USDT', ''))
    onUsdt(val)
    calculatorRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div>
      <h1 style={{ color: '#00ddeb' }}>Trading Strategies</h1>
      <p>Single subscription gives access to 9 strategies for Spot & Futures.</p>

      <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', justifyItems: 'center' }}>
        {bots.map((b) => (
          <div key={b.name} className="card" style={{ textAlign: 'center', width: '100%' }}>
            <h3 style={{ color: '#cfeef3', marginTop: 0 }}>{b.name}</h3>
            <ul style={{ listStylePosition: 'inside', padding: 0, margin: 0, textAlign: 'left' }}>
              {b.desc.map((d) => <li key={d}>{d}</li>)}
            </ul>
            <div style={{ marginTop: 12 }}>
              <button
                onClick={() => handleBotClick(b.capital)}
                style={{
                  background: '#2563EB',
                  color: '#fff',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '20px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)',
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'scale(1.05)'
                  e.currentTarget.style.background = '#1D4ED8'
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'scale(1)'
                  e.currentTarget.style.background = '#2563EB'
                }}
              >
                Start with {b.capital}
              </button>
            </div>
          </div>
        ))}
      </div>

      <div ref={calculatorRef} className="card" style={{ margin: '16px auto', maxWidth: 520, textAlign: 'center' }}>
        <h2 style={{ marginTop: 0, color: '#cfeef3' }}>Capital & Returns Calculator</h2>
        <label style={{ display: 'block', marginTop: 8, textAlign: 'center' }}>
          Enter Capital in INR
          <input
            style={{ width: '100%', marginTop: 6, padding: 10, borderRadius: 8 }}
            type="number"
            placeholder="₹ INR"
            value={inr}
            onChange={(e) => onInr(e.target.value)}
          />
        </label>
        <label style={{ display: 'block', marginTop: 8, textAlign: 'center' }}>
          Enter Capital in USDT
          <input
            style={{ width: '100%', marginTop: 6, padding: 10, borderRadius: 8 }}
            type="number"
            placeholder="USDT"
            value={usdt}
            onChange={(e) => onUsdt(e.target.value)}
          />
        </label>
        {!!inr && !!usdt && (
          <div style={{ marginTop: 12, padding: 12, borderRadius: 8, background: '#101010', border: '1px solid rgba(0,255,255,0.2)', color: '#ffffff' }}>
            <div><strong>Monthly:</strong> INR ₹{formatINR(monthlyRange(inr)[0].toFixed(2))} - ₹{formatINR(monthlyRange(inr)[1].toFixed(2))}</div>
            <div><strong>Monthly:</strong> USDT {(monthlyRange(usdt)[0]).toFixed(2)} - {(monthlyRange(usdt)[1]).toFixed(2)}</div>
            <div><strong>Yearly:</strong> INR ₹{formatINR(yearlyRange(inr)[0].toFixed(2))} - ₹{formatINR(yearlyRange(inr)[1].toFixed(2))}</div>
            <div><strong>Yearly:</strong> USDT {(yearlyRange(usdt)[0]).toFixed(2)} - {(yearlyRange(usdt)[1]).toFixed(2)}</div>
          </div>
        )}
        <div style={{ marginTop: 10, color: '#2563EB', fontSize: '.9rem', opacity: 0.9 }}>
          <div>as per the doller price 96 Rs i have calculated.</div>
          <div>Deponds on the market movement <br />The results(returns) will be differ</div>
          <div>so keep your funds atleast for 6 month durations Minimum</div>
        </div>
      </div>

      <div style={{ textAlign: 'center', marginTop: 32, marginBottom: 40 }}>
        <Link
          className="btn"
          to="/#join-business"
          style={{
            display: 'inline-block',
            padding: '12px 28px',
            fontSize: '1.1rem',
            fontWeight: 'bold',
            borderRadius: '30px',
            textDecoration: 'none',
            background: '#22C55E',
            color: '#fff',
            boxShadow: '0 6px 20px rgba(34, 197, 94, 0.3)',
            transition: 'all 0.3s ease'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = 'translateY(-3px)'
            e.currentTarget.style.background = '#16A34A'
            e.currentTarget.style.boxShadow = '0 10px 25px rgba(34, 197, 94, 0.4)'
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = 'translateY(0)'
            e.currentTarget.style.background = '#22C55E'
            e.currentTarget.style.boxShadow = '0 6px 20px rgba(34, 197, 94, 0.3)'
          }}
        >
          Join / Subscribe Now
        </Link>
      </div>
    </div>
  )
}

