import { Link } from 'react-router-dom'

export default function Video() {
  return (
    <div>
      <h1 style={{ color: '#00ddeb' }}>Plan Presentation</h1>
      <div className="card" style={{ overflow: 'hidden' }}>
        <div className="video-frame">
          <video
            controls
            playsInline
            preload="metadata"
            src="/video/plan presentation video.mp4"
          />
        </div>
        <p style={{ opacity: 0.8, marginTop: 8 }}>
          Please watch the full plan presentation video <br />to Know how to Earn in Tamil Language
        </p>
      </div>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center', marginTop: 12 }}>
        <Link className="btn" to="/bot">Trading Strategies</Link>
        <Link className="btn" to="/sharing">Share & Earn</Link>
        <Link className="btn secondary" to="/sharing/cashback">Cashback Offer</Link>
      </div>
    </div>
  )
}
