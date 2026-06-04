import { Link, NavLink, Route, Routes, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import './App.css';
import BannerSlider from './components/BannerSlider.jsx';
import RegisterPopup from './components/RegisterPopup.jsx';
import LanguageTranslate from './components/LanguageTranslate.jsx';
import CookieConsent from './components/CookieConsent.jsx';
import { getBannersAsync } from './lib/premium';
import Home from './pages/Home.jsx';
import Bot from './pages/Bot.jsx';
import Sharing from './pages/Sharing.jsx';
import SharingCashback from './pages/SharingCashback.jsx';
import Video from './pages/Video.jsx';
import Complaint from './pages/Complaint.jsx';
import QACompany from './pages/qanda/Company.jsx';
import QATrading from './pages/qanda/Trading.jsx';
import QARefer from './pages/qanda/Refer.jsx';
import QAPricing from './pages/qanda/Pricing.jsx';
import QASupport from './pages/qanda/Support.jsx';
import Premium from './pages/Premium.jsx';
import PremiumLogin from './pages/PremiumLogin.jsx';
import PremiumSignup from './pages/PremiumSignup.jsx';
import PremiumCourse from './pages/PremiumCourse.jsx';
import PremiumAdmin from './pages/PremiumAdmin.jsx';
import PremiumCertificate from './pages/PremiumCertificate.jsx';
import PremiumAdminLogin from './pages/PremiumAdminLogin.jsx';
import Terms from './pages/Terms.jsx';
import Privacy from './pages/Privacy.jsx';
import AboutUs from './pages/AboutUs.jsx';
import RiskDisclosure from './pages/RiskDisclosure.jsx';
import HowItWorks from './pages/HowItWorks.jsx';
import Contact from './pages/Contact.jsx';

function Layout({ children }) {
  const location = useLocation();
  const [fabOpen, setFabOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [banners, setBanners] = useState([]);
  const seg = location.pathname.split('/')[1] || '';
  const theme =
    seg === ''
      ? 'ai'
      : seg === 'bot'
        ? 'trading'
        : seg === 'sharing'
          ? 'earning'
          : seg === 'complaint' || seg === 'qanda'
            ? 'support'
            : seg === 'video'
              ? 'ai'
              : 'crypto';
  const joinActive = location.hash === '#join-business';

  // Close menu when location changes
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname, location.hash]);

  useEffect(() => {
    if (location.hash) {
      const id = location.hash.slice(1);
      const scroll = () => {
        const el = document.getElementById(id);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          return true;
        }
        return false;
      };
      if (!scroll()) {
        setTimeout(scroll, 100);
        setTimeout(scroll, 300);
        setTimeout(scroll, 600);
      } else {
        // Even if found, re-scroll after a bit because page height might change (images/banners loading)
        setTimeout(scroll, 300);
      }
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [location.pathname, location.hash]);
  useEffect(() => {
    let active = true;
    function load() {
      getBannersAsync().then((items) => {
        if (active) setBanners(items);
      });
    }
    load();
    const onStorage = (e) => {
      if (e.key === 'banners') load();
    };
    const onLocal = () => load();
    let ch;
    if (typeof BroadcastChannel !== 'undefined') {
      ch = new BroadcastChannel('banners');
      ch.onmessage = (msg) => {
        if (msg && msg.data && msg.data.type === 'banners-updated') load();
      };
    }
    window.addEventListener('storage', onStorage);
    window.addEventListener('banners-updated', onLocal);
    return () => {
      active = false;
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('banners-updated', onLocal);
      if (ch) ch.close();
    };
  }, []);
  return (
    <div className={`app-shell theme-${theme}`}>
      <div className="bg-anim"></div>
      <header className="app-header">
        <div className="brand">
          <Link to="/" className="brand-link">
            Trendex AI
          </Link>
        </div>
        <div
          className="header-actions"
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <LanguageTranslate />
          <button
            className="menu-toggle"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {menuOpen ? (
                <path d="M18 6L6 18M6 6l12 12" />
              ) : (
                <>
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </>
              )}
            </svg>
          </button>
        </div>
        <nav className={`nav ${menuOpen ? 'open' : ''}`}>
          <NavLink to="/" end>
            <svg
              className="nav-icon"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            <span>Home</span>
          </NavLink>
          <NavLink to="/about-us">
            <svg
              className="nav-icon"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            <span>About Us</span>
          </NavLink>
          <NavLink to="/how-it-works">
            <svg
              className="nav-icon"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            <span>How It Works</span>
          </NavLink>
          <NavLink to="/video">
            <svg
              className="nav-icon"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
              <polyline points="10 8 14 12 10 16" />
            </svg>
            <span>Presentation</span>
          </NavLink>
          <NavLink to="/bot">
            <svg
              className="nav-icon"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="11" width="18" height="10" rx="2" />
              <circle cx="8.5" cy="16" r="1" />
              <circle cx="15.5" cy="16" r="1" />
              <path d="M21 16V8a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v8" />
            </svg>
            <span>Bots</span>
          </NavLink>
          <Link
            to="/#join-business"
            className={joinActive ? 'active' : undefined}
          >
            <svg
              className="nav-icon"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            <span>Join/Subscribe Now</span>
          </Link>
          <NavLink to="/premium">
            <svg
              className="nav-icon"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="8" r="7" />
              <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
            </svg>
            <span>Premium Access</span>
          </NavLink>
          <NavLink to="/contact">
            <svg
              className="nav-icon"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
            </svg>
            <span>Contact</span>
          </NavLink>
        </nav>
        {menuOpen && (
          <div className="nav-overlay" onClick={() => setMenuOpen(false)}></div>
        )}
      </header>
      {location.pathname === '/' && <BannerSlider items={banners} />}
      <div className={`fab-enquiry ${fabOpen ? 'open' : ''}`}>
        <button
          className="enquiry-toggle has-tip"
          data-tip="Support"
          onClick={() => setFabOpen((v) => !v)}
          aria-expanded={fabOpen ? 'true' : 'false'}
          aria-controls="enquiry-menu"
          aria-label="Support"
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            aria-hidden="true"
            focusable="false"
          >
            <path
              fill="currentColor"
              d="M12 2a7 7 0 0 0-7 7v3a3 3 0 0 0-2 2.83V17a3 3 0 0 0 3 3h2a1 1 0 0 0 1-1v-3.2a1 1 0 0 0-1.2-.98A3 3 0 0 1 6 13V9a6 6 0 1 1 12 0v4a3 3 0 0 1-1.8 2.82a1 1 0 0 0-1.2.98V19a1 1 0 0 0 1 1h2a3 3 0 0 0 3-3v-2.17A3 3 0 0 0 19 12V9a7 7 0 0 0-7-7z"
            />
          </svg>
        </button>
        <div
          id="enquiry-menu"
          className="fab-menu"
          role="menu"
          aria-hidden={fabOpen ? 'false' : 'true'}
        >
          <a
            className="fab-item whatsapp has-tip"
            data-tip="WhatsApp"
            href="https://chat.whatsapp.com/JzznVDAlnsPImIlws2p3Ig"
            target="_blank"
            rel="noreferrer"
            role="menuitem"
            aria-label="WhatsApp"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 32 32"
              aria-hidden="true"
              focusable="false"
            >
              <path
                fill="currentColor"
                d="M19.11 17.49c-.26-.13-1.52-.75-1.75-.84c-.23-.09-.4-.13-.57.13c-.17.26-.65.84-.8 1.01c-.15.17-.3.19-.56.06c-.26-.13-1.1-.41-2.1-1.31c-.78-.69-1.3-1.55-1.45-1.81c-.15-.26-.02-.4.11-.53c.11-.11.26-.3.4-.45c.13-.15.17-.26.26-.43c.09-.17.04-.32-.02-.45c-.06-.13-.57-1.37-.78-1.88c-.2-.48-.4-.42-.57-.43h-.49c-.17 0-.45.06-.69.32c-.23.26-.9.88-.9 2.14c0 1.26.92 2.48 1.05 2.65c.13.17 1.82 2.78 4.41 3.9c.62.27 1.1.43 1.48.55c.62.2 1.18.17 1.63.1c.5-.07 1.52-.62 1.73-1.22c.21-.6.21-1.11.15-1.22c-.06-.11-.23-.17-.49-.3zM26.88 5.12C24.15 2.39 20.66 1 16.99 1C8.83 1 2.38 7.45 2.38 15.61c0 2.71.71 5.35 2.07 7.67L2 31l7.93-2.33c2.27 1.24 4.84 1.9 7.05 1.9h.01c8.16 0 14.61-6.45 14.61-14.61c0-3.66-1.39-7.15-4.12-9.88z"
              />
            </svg>
          </a>
          <a
            className="fab-item call has-tip"
            data-tip="Call"
            href="tel:+918012202083"
            role="menuitem"
            aria-label="Call"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              aria-hidden="true"
              focusable="false"
            >
              <path
                fill="currentColor"
                d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2a1 1 0 0 1 1.02-.24c1.12.37 2.33.57 3.57.57a1 1 0 0 1 1 1V21a1 1 0 0 1-1 1C11.85 22 2 12.15 2 1a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.24.2 2.45.57 3.57a1 1 0 0 1-.24 1.02l-2.2 2.2z"
              />
            </svg>
          </a>
        </div>
      </div>
      <main className="app-main">{children}</main>
      <RegisterPopup />
      <CookieConsent />
      <footer className="app-footer">
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '32px', 
          padding: '24px 0',
          maxWidth: '1200px',
          margin: '0 auto',
          width: '100%'
        }}>
          {/* Company Info */}
          <div>
            <h3 style={{ color: 'var(--neon)', marginBottom: '16px', fontSize: '1.1rem' }}>
              Trendex AI
            </h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              Automated cryptocurrency trading with AI-driven risk management. Your trusted partner in the crypto markets.
            </p>
            <div className="social-bar" aria-label="Social links" style={{ gap: '12px', justifyContent: 'flex-start' }}>
              <a
                className="social-link yt has-tip"
                data-tip="YouTube"
                href="https://youtube.com/@aitrendex_tamil?si=iCJ9LMew-CB0hvki"
                target="_blank"
                rel="noreferrer"
                aria-label="YouTube"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    fill="currentColor"
                    d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.4 3.5 12 3.5 12 3.5s-7.4 0-9.4.6A3 3 0 0 0.5 6.2C0 8.2 0 12 0 12s0 3.8.5 5.8a3 3 0 0 0 2.1 2.1c2 .6 9.4.6 9.4.6s7.4 0 9.4-.6a3 3 0 0 0 2.1-2.1c.5-2 .5-5.8.5-5.8s0-3.8-.5-5.8zM9.6 15.5V8.5L15.8 12l-6.2 3.5z"
                  />
                </svg>
              </a>
              <a
                className="social-link wa has-tip"
                data-tip="WhatsApp Channel"
                href="https://whatsapp.com/channel/0029Vb61xAa6hENzJrPD5h1K"
                target="_blank"
                rel="noreferrer"
                aria-label="WhatsApp"
              >
                <svg width="18" height="18" viewBox="0 0 32 32" aria-hidden="true">
                  <path
                    fill="currentColor"
                    d="M19.11 17.49c-.26-.13-1.52-.75-1.75-.84c-.23-.09-.4-.13-.57.13c-.17.26-.65.84-.8 1.01c-.15.17-.3.19-.56.06c-.26-.13-1.1-.41-2.1-1.31c-.78-.69-1.3-1.55-1.45-1.81c-.15-.26-.02-.4.11-.53c.11-.11.26-.3.4-.45c.13-.15.17-.26.26-.43c.09-.17.04-.32-.02-.45c-.06-.13-.57-1.37-.78-1.88c-.2-.48-.4-.42-.57-.43h-.49c-.17 0-.45.06-.69.32c-.23.26-.9.88-.9 2.14c0 1.26.92 2.48 1.05 2.65c.13.17 1.82 2.78 4.41 3.9c.62.27 1.1.43 1.48.55c.62.2 1.18.17 1.63.1c.5-.07 1.52-.62 1.73-1.22c.21-.6.21-1.11.15-1.22c-.06-.11-.23-.17-.49-.3zM26.88 5.12C24.15 2.39 20.66 1 16.99 1C8.83 1 2.38 7.45 2.38 15.61c0 2.71.71 5.35 2.07 7.67L2 31l7.93-2.33c2.27 1.24 4.84 1.9 7.05 1.9h.01c8.16 0 14.61-6.45 14.61-14.61c0-3.66-1.39-7.15-4.12-9.88z"
                  />
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 style={{ color: 'var(--neon)', marginBottom: '16px', fontSize: '1.1rem' }}>
              Quick Links
            </h3>
            <div style={{ display: 'grid', gap: '10px' }}>
              <Link
                to="/about-us"
                style={{ 
                  color: 'var(--text-secondary)', 
                  textDecoration: 'none',
                  fontSize: '0.9rem',
                  transition: 'color 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.color = 'var(--neon)'}
                onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
              >
                About Us
              </Link>
              <Link
                to="/how-it-works"
                style={{ 
                  color: 'var(--text-secondary)', 
                  textDecoration: 'none',
                  fontSize: '0.9rem',
                  transition: 'color 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.color = 'var(--neon)'}
                onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
              >
                How It Works
              </Link>
              <Link
                to="/bot"
                style={{ 
                  color: 'var(--text-secondary)', 
                  textDecoration: 'none',
                  fontSize: '0.9rem',
                  transition: 'color 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.color = 'var(--neon)'}
                onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
              >
                Trading Bots
              </Link>
              <Link
                to="/video"
                style={{ 
                  color: 'var(--text-secondary)', 
                  textDecoration: 'none',
                  fontSize: '0.9rem',
                  transition: 'color 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.color = 'var(--neon)'}
                onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
              >
                Presentation
              </Link>
            </div>
          </div>

          {/* Legal */}
          <div>
            <h3 style={{ color: 'var(--neon)', marginBottom: '16px', fontSize: '1.1rem' }}>
              Legal
            </h3>
            <div style={{ display: 'grid', gap: '10px' }}>
              <Link
                to="/risk-disclosure"
                style={{ 
                  color: 'var(--text-secondary)', 
                  textDecoration: 'none',
                  fontSize: '0.9rem',
                  transition: 'color 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.color = 'var(--neon)'}
                onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
              >
                Risk Disclosure
              </Link>
              <Link
                to="/terms"
                style={{ 
                  color: 'var(--text-secondary)', 
                  textDecoration: 'none',
                  fontSize: '0.9rem',
                  transition: 'color 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.color = 'var(--neon)'}
                onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
              >
                Terms & Conditions
              </Link>
              <Link
                to="/privacy"
                style={{ 
                  color: 'var(--text-secondary)', 
                  textDecoration: 'none',
                  fontSize: '0.9rem',
                  transition: 'color 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.color = 'var(--neon)'}
                onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
              >
                Privacy Policy
              </Link>
              <Link
                to="/contact"
                style={{ 
                  color: 'var(--text-secondary)', 
                  textDecoration: 'none',
                  fontSize: '0.9rem',
                  transition: 'color 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.color = 'var(--neon)'}
                onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
              >
                Contact Us
              </Link>
            </div>
          </div>

          {/* Contact Info */}
          <div>
            <h3 style={{ color: 'var(--neon)', marginBottom: '16px', fontSize: '1.1rem' }}>
              Get In Touch
            </h3>
            <div style={{ display: 'grid', gap: '10px' }}>
              <a
                href="tel:+918012202083"
                style={{ 
                  color: 'var(--text-secondary)', 
                  textDecoration: 'none',
                  fontSize: '0.9rem',
                  transition: 'color 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.color = 'var(--neon)'}
                onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
              >
                📞 +91 80122 02083
              </a>
              <a
                href="https://chat.whatsapp.com/JzznVDAlnsPImIlws2p3Ig"
                target="_blank"
                rel="noreferrer"
                style={{ 
                  color: 'var(--text-secondary)', 
                  textDecoration: 'none',
                  fontSize: '0.9rem',
                  transition: 'color 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.color = 'var(--neon)'}
                onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
              >
                💬 Join WhatsApp Group
              </a>
              <a
                href="https://aitrendex.com"
                target="_blank"
                rel="noreferrer"
                style={{ 
                  color: 'var(--text-secondary)', 
                  textDecoration: 'none',
                  fontSize: '0.9rem',
                  transition: 'color 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.color = 'var(--neon)'}
                onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
              >
                🌐 Main Website
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div style={{ 
          borderTop: '1px solid #334155', 
          paddingTop: '24px', 
          marginTop: '24px',
          textAlign: 'center',
          maxWidth: '1200px',
          marginLeft: 'auto',
          marginRight: 'auto',
          width: '100%'
        }}>
          <div style={{ 
            color: 'var(--text-muted)', 
            fontSize: '0.85rem',
            marginBottom: '8px'
          }}>
            © 2026 Trendex AI. All rights reserved.
          </div>
          <div style={{ 
            color: '#EF4444', 
            fontSize: '0.8rem',
            maxWidth: '600px',
            margin: '0 auto'
          }}>
            ⚠️ Real trading does not provide stable, guaranteed, or assured returns.
            Cryptocurrency trading involves substantial risk of loss.
          </div>
        </div>
      </footer>
    </div>
  );
}

function NotFound() {
  return (
    <div style={{ padding: 24 }}>
      <h2>Page Not Found</h2>
      <p>The page you’re looking for doesn’t exist.</p>
      <Link to="/">Go Home</Link>
    </div>
  );
}

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/bot" element={<Bot />} />
        <Route path="/sharing" element={<Sharing />} />
        <Route path="/sharing/cashback" element={<SharingCashback />} />
        <Route path="/video" element={<Video />} />
        <Route path="/complaint" element={<Complaint />} />
        <Route path="/premium" element={<Premium />} />
        <Route path="/premium/login" element={<PremiumLogin />} />
        <Route path="/premium/signup" element={<PremiumSignup />} />
        <Route path="/premium/course" element={<PremiumCourse />} />
        <Route path="/premium/admin" element={<PremiumAdmin />} />
        <Route path="/premium/admin-login" element={<PremiumAdminLogin />} />
        <Route path="/premium/certificate" element={<PremiumCertificate />} />
        <Route path="/qanda/company" element={<QACompany />} />
        <Route path="/qanda/trading" element={<QATrading />} />
        <Route path="/qanda/refer" element={<QARefer />} />
        <Route path="/qanda/pricing" element={<QAPricing />} />
        <Route path="/qanda/support" element={<QASupport />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/about-us" element={<AboutUs />} />
        <Route path="/risk-disclosure" element={<RiskDisclosure />} />
        <Route path="/how-it-works" element={<HowItWorks />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Layout>
  );
}
