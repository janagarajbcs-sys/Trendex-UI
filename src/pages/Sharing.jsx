import { Link } from 'react-router-dom'

export default function Sharing() {
  return (
    <div>
      <h1 style={{ color: '#00ddeb' }}>Binary Referral Income</h1>
      <p>Designed to Build Your Trading Capital</p>
      <div style={{ opacity: 0.85, marginTop: -6 }}>Generate Active & Passive Income Through Network Growth</div>
      <div style={{ color: '#00ddeb', marginTop: 6 }}>Affiliate Marketing Model</div>

      <div className="binary-graph">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            <marker id="arrowHead" markerWidth="8" markerHeight="8" refX="0" refY="3" orient="auto">
              <path d="M0,0 L0,6 L6,3 z" fill="#00ddeb" />
            </marker>
          </defs>
          <path d="M50 32 L25 70" stroke="#00ddeb" strokeWidth="2.2" markerEnd="url(#arrowHead)" />
          <path d="M50 32 L75 70" stroke="#00ddeb" strokeWidth="2.2" markerEnd="url(#arrowHead)" />
        </svg>
        <div className="node you"><span>👤</span><div className="label">You</div></div>
        <div className="node left"><span>👤</span><div className="label">Direct 1</div></div>
        <div className="node right"><span>👤</span><div className="label">Direct 2</div></div>
      </div>
      <div className="card">
        <h2 style={{ marginTop: 0, color: '#cfeef3' }}>Earnings Summary</h2>
        <p>👥 Direct Referral → 25 USDT (₹2,400)</p>
        <p>👥 Direct Referral → 25 USDT (₹2,400)</p>
        <p>🔗 Pair Matching (Direct / Indirect) → 30 USDT (₹2,880)</p>
        <p>🔗 Pair Matching (Direct / Indirect) → 30 USDT (₹2,880)</p>
        <hr style={{ border: 'none', height: 1, background: 'rgba(255,255,255,0.12)' }} />
        <p><strong>🏆 Total → 80 USDT (₹7,680)</strong></p>
      </div>

      <div className="card" style={{ marginTop: 12 }}>
        <h2 style={{ marginTop: 0, color: '#cfeef3' }}>Monthly Performance Reward</h2>
        <p>⏰ First-to-last day of every month is calculated.</p>
        <p>👥 Direct Referral → 25 USDT (₹2,400)</p>
        <p>🔗 Pair Matching → 30 USDT (₹2,880)</p>
        <p>👥 4th Direct Referral → 200 USDT (₹19,200)</p>
        <hr style={{ border: 'none', height: 1, background: 'rgba(255,255,255,0.12)' }} />
        <p><strong>🎯 Total for 4 Referrals → 305 USDT (₹29,280)</strong></p>
      </div>

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 12, justifyContent: 'center' }}>
        <Link to="/sharing/cashback" className="btn secondary">Cashback & Gadget Fund Offer</Link>
        <Link to="/bot" className="btn secondary">Trading</Link>
      </div>
      
    </div>
  )
}
