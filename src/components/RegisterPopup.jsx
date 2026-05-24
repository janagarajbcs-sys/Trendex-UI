import { useEffect, useState } from 'react';
import { submitJoinResponse, getCurrentUser } from '../lib/premium';

const SKIP_COUNT_KEY = 'register_popup_skip_count';
const SKIPPED_AT_KEY = 'register_popup_skipped_at';

export default function RegisterPopup() {
  const [showPopup, setShowPopup] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 480);

  // Form states
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [sponsor, setSponsor] = useState('');
  const [source, setSource] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const showPopupAfterDelay = (delayMs) => {
    return setTimeout(() => {
      const hasRegistered = localStorage.getItem('user_joined_business');
      // Check if user is logged in with premium access
      const currentUser = getCurrentUser();
      // Check if popup was skipped and can show once more
      const skipCount = parseInt(localStorage.getItem(SKIP_COUNT_KEY) || '0');
      const skippedAt = localStorage.getItem(SKIPPED_AT_KEY);
      const canShowAfterSkip =
        skipCount === 1 &&
        skippedAt &&
        Date.now() - parseInt(skippedAt) < 10 * 60 * 1000; // Within 10 min of skip

      if (!hasRegistered && !currentUser) {
        setShowPopup(true);
      } else if (canShowAfterSkip && !hasRegistered && !currentUser) {
        // Allow showing once after skip
        setShowPopup(true);
      }
    }, delayMs);
  };

  useEffect(() => {
    // Check if user has already registered in this session or device
    const hasRegistered = localStorage.getItem('user_joined_business');
    // Check if user is logged in with premium access
    const currentUser = getCurrentUser();

    if (!hasRegistered && !currentUser) {
      // Show popup after 30 seconds initially
      const timer = showPopupAfterDelay(30000);
      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 480);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const closePopup = () => {
    setShowPopup(false);

    // If user closed without submitting, track skip and show again after 5 minutes (once only)
    const hasRegistered = localStorage.getItem('user_joined_business');
    const currentUser = getCurrentUser();
    const skipCount = parseInt(localStorage.getItem(SKIP_COUNT_KEY) || '0');

    if (!hasRegistered && !currentUser && skipCount < 1) {
      // Track that user skipped, allow one more show after 5 minutes
      localStorage.setItem(SKIP_COUNT_KEY, '1');
      localStorage.setItem(SKIPPED_AT_KEY, Date.now().toString());
      showPopupAfterDelay(5 * 60 * 1000); // 5 minutes = 300,000 ms
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const ok = await submitJoinResponse({
      name,
      mobile,
      gmail: email,
      place: '',
      sponsor,
      source,
      message,
    });
    setLoading(false);
    if (ok) {
      setSubmitted(true);
      localStorage.setItem('user_joined_business', 'true');
      // Clear skip tracking on successful submission
      localStorage.removeItem(SKIP_COUNT_KEY);
      localStorage.removeItem(SKIPPED_AT_KEY);
      setTimeout(() => {
        setShowPopup(false);
      }, 2000);
    }
  };

  if (!showPopup) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(30, 58, 138, 0.45)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100000,
        padding: isMobile ? '0' : '20px',
        backdropFilter: 'blur(6px)',
        animation: 'fadeIn 0.4s ease-out',
        overflowY: 'auto', // Allow scrolling the overlay if needed
      }}
    >
      <div
        style={{
          background: 'linear-gradient(135deg, #ffffff 0%, #f8fbff 100%)',
          borderRadius: isMobile ? '0' : '16px',
          padding: isMobile ? '20px 14px 60px' : '24px 24px 40px', // Added extra bottom padding for mobile
          maxWidth: '420px',
          width: '100%',
          maxHeight: isMobile ? '100%' : '85vh',
          overflowY: 'auto',
          boxShadow: '0 25px 50px -12px rgba(30, 58, 138, 0.25)',
          border: isMobile ? 'none' : '1px solid rgba(37, 99, 235, 0.2)',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          animation: 'slideUp 0.5s ease-out',
          transform: isMobile ? 'none' : 'translateY(-40px)', // Move up more on desktop
        }}
      >
        {/* Close Button */}
        <button
          onClick={closePopup}
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            background: '#eff6ff',
            border: 'none',
            color: '#3b82f6',
            width: '28px',
            height: '28px',
            borderRadius: '999px',
            fontSize: '14px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10,
            transition: 'all 0.2s',
            boxShadow: '0 2px 8px rgba(59, 130, 246, 0.1)',
          }}
          onMouseEnter={(e) => {
            e.target.style.background = '#dbeafe';
            e.target.style.color = '#1e40af';
            e.target.style.transform = 'rotate(90deg)';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = '#eff6ff';
            e.target.style.color = '#3b82f6';
            e.target.style.transform = 'rotate(0deg)';
          }}
        >
          ✕
        </button>

        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <h2
            style={{
              color: '#1e3a8a',
              fontSize: isMobile ? '1.4rem' : '1.6rem',
              margin: '0 0 8px 0',
              fontWeight: '800',
              letterSpacing: '-0.02em',
            }}
          >
            Join AI Trendex Business 🚀
          </h2>
          <p
            style={{
              color: '#475569',
              fontSize: '0.9rem',
              lineHeight: '1.4',
              maxWidth: '340px',
              margin: '0 auto',
            }}
          >
            Enter your details to join our elite AI-powered trading community.
          </p>
        </div>

        {submitted ? (
          <div style={{ textAlign: 'center', padding: '24px 0' }}>
            <div
              style={{
                fontSize: '48px',
                marginBottom: '16px',
                animation: 'scaleUp 0.5s ease-out',
              }}
            >
              ✅
            </div>
            <h3
              style={{
                color: '#059669',
                fontSize: '1.25rem',
                fontWeight: '800',
                marginBottom: '6px',
              }}
            >
              Success!
            </h3>
            <p style={{ color: '#475569', fontSize: '0.9rem' }}>
              Your registration is received. We'll be in touch soon.
            </p>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            style={{ display: 'grid', gap: '14px' }}
          >
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
                gap: '14px',
              }}
            >
              <div
                style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}
              >
                <label
                  style={{
                    fontSize: '0.8rem',
                    fontWeight: '700',
                    color: '#1e3a8a',
                    marginLeft: '4px',
                  }}
                >
                  Full Name
                </label>
                <input
                  required
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    background: '#ffffff',
                    border: '1.5px solid #e2e8f0',
                    color: '#0f172a',
                    fontSize: '0.9rem',
                    transition: 'all 0.2s',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
                  }}
                />
              </div>
              <div
                style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}
              >
                <label
                  style={{
                    fontSize: '0.8rem',
                    fontWeight: '700',
                    color: '#1e3a8a',
                    marginLeft: '4px',
                  }}
                >
                  Mobile Number
                </label>
                <input
                  required
                  placeholder="10-digit number"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  inputMode="numeric"
                  pattern="^[0-9]{10}$"
                  maxLength={10}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    background: '#ffffff',
                    border: '1.5px solid #e2e8f0',
                    color: '#0f172a',
                    fontSize: '0.9rem',
                    transition: 'all 0.2s',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
                  }}
                />
              </div>
            </div>

            <div
              style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}
            >
              <label
                style={{
                  fontSize: '0.8rem',
                  fontWeight: '700',
                  color: '#1e3a8a',
                  marginLeft: '4px',
                }}
              >
                Gmail ID
              </label>
              <input
                required
                type="email"
                placeholder="example@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                pattern="^[a-zA-Z0-9._%+-]+@gmail\\.com$"
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  background: '#ffffff',
                  border: '1.5px solid #e2e8f0',
                  color: '#0f172a',
                  fontSize: '0.9rem',
                  transition: 'all 0.2s',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
                }}
              />
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
                gap: '14px',
              }}
            >
              <div
                style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}
              >
                <label
                  style={{
                    fontSize: '0.8rem',
                    fontWeight: '700',
                    color: '#1e3a8a',
                    marginLeft: '4px',
                  }}
                >
                  Coupon Code
                </label>
                <input
                  required
                  placeholder="Referral Code"
                  value={sponsor}
                  onChange={(e) => setSponsor(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    background: '#ffffff',
                    border: '1.5px solid #e2e8f0',
                    color: '#0f172a',
                    fontSize: '0.9rem',
                    transition: 'all 0.2s',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
                  }}
                />
              </div>
              <div
                style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}
              >
                <label
                  style={{
                    fontSize: '0.8rem',
                    fontWeight: '700',
                    color: '#1e3a8a',
                    marginLeft: '4px',
                  }}
                >
                  Source
                </label>
                <select
                  required
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    background: '#ffffff',
                    border: '1.5px solid #e2e8f0',
                    color: '#0f172a',
                    fontSize: '0.9rem',
                    transition: 'all 0.2s',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
                    cursor: 'pointer',
                  }}
                >
                  <option value="">Select Source</option>
                  <option value="whatsapp">WhatsApp</option>
                  <option value="facebook">Facebook</option>
                  <option value="youtube">YouTube</option>
                  <option value="instagram">Instagram</option>
                  <option value="telegram">Telegram</option>
                  <option value="My Friend">My Friend</option>
                </select>
              </div>
            </div>

            <div
              style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}
            >
              <label
                style={{
                  fontSize: '0.8rem',
                  fontWeight: '700',
                  color: '#1e3a8a',
                  marginLeft: '4px',
                }}
              >
                Requirement Message
              </label>
              <textarea
                required
                rows={2}
                placeholder="Tell us about your requirements..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  background: '#ffffff',
                  border: '1.5px solid #e2e8f0',
                  color: '#0f172a',
                  fontSize: '0.9rem',
                  resize: 'none',
                  transition: 'all 0.2s',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
                }}
              />
            </div>

            <button
              className="btn"
              type="submit"
              disabled={
                loading ||
                !name ||
                !mobile ||
                !email ||
                !sponsor ||
                !source ||
                !message
              }
              style={{
                padding: '14px',
                fontSize: '1rem',
                fontWeight: '800',
                marginTop: '8px',
                background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '12px',
                cursor: 'pointer',
                boxShadow: '0 10px 25px -5px rgba(37, 99, 235, 0.4)',
                opacity:
                  loading ||
                  !name ||
                  !mobile ||
                  !email ||
                  !sponsor ||
                  !source ||
                  !message
                    ? 0.6
                    : 1,
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.target.style.transform = 'translateY(-3px)';
                  e.target.style.boxShadow =
                    '0 15px 30px -5px rgba(37, 99, 235, 0.5)';
                  e.target.style.filter = 'brightness(1.1)';
                }
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow =
                  '0 10px 25px -5px rgba(37, 99, 235, 0.4)';
                e.target.style.filter = 'brightness(1)';
              }}
            >
              {loading ? 'Processing...' : 'Register Now →'}
            </button>
          </form>
        )}
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(40px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes scaleUp {
          from { transform: scale(0.8); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        input::placeholder, textarea::placeholder {
          color: #94a3b8;
        }
        input:focus, select:focus, textarea:focus {
          outline: none;
          border-color: #2563eb !important;
          background: #ffffff !important;
          box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.15) !important;
          transform: translateY(-1px);
        }
        select {
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23475569'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 16px center;
          background-size: 16px;
        }
      `}</style>
    </div>
  );
}
