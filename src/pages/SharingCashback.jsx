import { Link } from 'react-router-dom'
export default function SharingCashback() {
  return (
    <div>
      <h1 style={{ color: '#00ddeb' }}>Cashback & Gadget Fund Offer</h1>
      <div className="card" style={{ overflow: 'hidden' }}>
        <div className="video-frame">
          <video
            controls
            playsInline
            preload="metadata"
            src="/video/cashback video.mp4"
          />
        </div>
        <p style={{ opacity: 0.8, marginTop: 8 }}>
          Please watch this Full video to get your cash return back to you
        </p>
      </div>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center', marginTop: 12 }}>
        <Link className="btn" to="/video">Plan Presentation →</Link>
        <Link className="btn secondary" to="/#join-business">Join/Subscribe Now →</Link>
      </div>
    </div>
  )
}
