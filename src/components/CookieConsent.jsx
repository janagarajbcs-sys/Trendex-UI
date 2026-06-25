import { useState, useEffect } from 'react';

export default function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);

  const trackVisit = () => {
    fetch('/api/analytics/track', {
      method: 'POST',
      credentials: 'include',
      cache: 'no-store',
    }).catch(() => {});
  };

  useEffect(() => {
    const consent = localStorage.getItem('cookieConsent');
    if (consent === 'accepted') {
      trackVisit();
      return;
    }
    if (!consent) {
      setShowBanner(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookieConsent', 'accepted');
    setShowBanner(false);
    trackVisit();
  };

  const handleDecline = () => {
    localStorage.setItem('cookieConsent', 'declined');
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        background: 'linear-gradient(to right, #0f172a, #1e293b)',
        color: 'white',
        padding: '20px',
        borderTop: '2px solid #00ddeb',
        zIndex: 10000,
        boxShadow: '0 -4px 20px rgba(0,0,0,0.3)',
      }}
    >
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
          }}
        >
          <div style={{ flex: '1 1 300px' }}>
            <h3
              style={{
                margin: '0 0 8px 0',
                color: '#00ddeb',
                fontSize: '1.1rem',
              }}
            >
              🍪 Cookie Policy
            </h3>
            <p style={{ margin: 0, fontSize: '0.9rem', color: '#e2e8f0' }}>
              We use cookies to improve your experience, analyze website
              traffic, and personalize content.
              <span
                style={{
                  color: '#00ddeb',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  marginLeft: '4px',
                }}
              >
                Learn More
              </span>
            </p>
          </div>
          <div
            style={{
              display: 'flex',
              gap: '12px',
              flexWrap: 'wrap',
              justifyContent: 'flex-end',
            }}
          >
            <button
              onClick={handleDecline}
              style={{
                background: 'transparent',
                border: '1px solid #64748b',
                color: '#e2e8f0',
                padding: '10px 24px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 'bold',
                transition: 'all 0.2s',
              }}
              onMouseOver={(e) =>
                (e.currentTarget.style.borderColor = '#94a3b8')
              }
              onMouseOut={(e) =>
                (e.currentTarget.style.borderColor = '#64748b')
              }
            >
              Decline
            </button>
            <button
              onClick={handleAccept}
              style={{
                background: '#00ddeb',
                border: 'none',
                color: '#000',
                padding: '10px 24px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 'bold',
                transition: 'all 0.2s',
              }}
              onMouseOver={(e) =>
                (e.currentTarget.style.background = '#22e6ff')
              }
              onMouseOut={(e) => (e.currentTarget.style.background = '#00ddeb')}
            >
              Accept All
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
