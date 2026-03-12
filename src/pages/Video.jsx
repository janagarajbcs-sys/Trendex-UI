import { Link } from 'react-router-dom'

export default function Video() {
  return (
    <div style={{ width: '100%', margin: 0, padding: 0 }}>

      <h1 style={{ textAlign: 'center', margin: '20px 0' }}>
        Plan Presentation
      </h1>

      <div
        style={{
          width: '100%',
          height: '100vh',
          background: '#000',
          position: 'relative'
        }}
      >
        <iframe
          src="https://iframe.mediadelivery.net/play/615839/9b655ee4-cf57-4122-8cdd-e9e946719f7d"
          loading="lazy"
          allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
          allowFullScreen
          style={{
            width: '100%',
            height: '100%',
            border: 'none'
          }}
        ></iframe>
      </div>

      <div style={{ marginTop: 20, textAlign: 'center' }}>
        <p style={{ fontSize: '1.1rem', lineHeight: 1.6 }}>
          Please watch the full plan presentation video <br />
          to Know how to Earn in Tamil Language
        </p>
      </div>

      <div
        style={{
          display: 'flex',
          gap: 10,
          flexWrap: 'wrap',
          justifyContent: 'center',
          marginTop: 20
        }}
      >
        <Link className="btn" to="/bot">Trading Strategies</Link>
        <Link className="btn" to="/sharing">Share & Earn</Link>
        <Link className="btn secondary" to="/sharing/cashback">Cashback Offer</Link>
      </div>

    </div>
  )
}