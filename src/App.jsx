import { Link, NavLink, Route, Routes, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import './App.css'
import BannerSlider from './components/BannerSlider.jsx'
import { getBannersAsync } from './lib/premium'
import Home from './pages/Home.jsx'
import Bot from './pages/Bot.jsx'
import Sharing from './pages/Sharing.jsx'
import SharingCashback from './pages/SharingCashback.jsx'
import Video from './pages/Video.jsx'
import Complaint from './pages/Complaint.jsx'
import QACompany from './pages/qanda/Company.jsx'
import QATrading from './pages/qanda/Trading.jsx'
import QARefer from './pages/qanda/Refer.jsx'
import QAPricing from './pages/qanda/Pricing.jsx'
import QASupport from './pages/qanda/Support.jsx'
import Premium from './pages/Premium.jsx'
import PremiumLogin from './pages/PremiumLogin.jsx'
import PremiumSignup from './pages/PremiumSignup.jsx'
import PremiumCourse from './pages/PremiumCourse.jsx'
import PremiumAdmin from './pages/PremiumAdmin.jsx'
import PremiumCertificate from './pages/PremiumCertificate.jsx'
import PremiumAdminLogin from './pages/PremiumAdminLogin.jsx'

function Layout({ children }) {
  const location = useLocation()
  const [fabOpen, setFabOpen] = useState(false)
  const [banners, setBanners] = useState([])
  const seg = location.pathname.split('/')[1] || ''
  const theme =
    seg === '' ? 'ai' :
    seg === 'bot' ? 'trading' :
    seg === 'sharing' ? 'earning' :
    seg === 'complaint' || seg === 'qanda' ? 'support' :
    seg === 'video' ? 'ai' : 'crypto'
  const joinActive = location.hash === '#join-business'
  useEffect(() => {
    if (location.hash) {
      const id = location.hash.slice(1)
      const scroll = () => {
        const el = document.getElementById(id)
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' })
          return true
        }
        return false
      }
      if (!scroll()) {
        setTimeout(scroll, 100)
        setTimeout(scroll, 300)
        setTimeout(scroll, 600)
      } else {
        // Even if found, re-scroll after a bit because page height might change (images/banners loading)
        setTimeout(scroll, 300)
      }
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, [location.pathname, location.hash])
  useEffect(() => {
    let active = true
    function load() {
      getBannersAsync().then((items) => { if (active) setBanners(items) })
    }
    load()
    const onStorage = (e) => {
      if (e.key === 'banners') load()
    }
    const onLocal = () => load()
    let ch
    if (typeof BroadcastChannel !== 'undefined') {
      ch = new BroadcastChannel('banners')
      ch.onmessage = (msg) => {
        if (msg && msg.data && msg.data.type === 'banners-updated') load()
      }
    }
    window.addEventListener('storage', onStorage)
    window.addEventListener('banners-updated', onLocal)
    return () => {
      active = false
      window.removeEventListener('storage', onStorage)
      window.removeEventListener('banners-updated', onLocal)
      if (ch) ch.close()
    }
  }, [])
  return (
    <div className={`app-shell theme-${theme}`}>
      <div className="bg-anim"></div>
      <header className="app-header">
        <div className="brand">
          <Link to="/" className="brand-link">Trendex AI</Link>
        </div>
        <nav className="nav">
          <NavLink to="/" end>Home</NavLink>
          <NavLink to="/video">Presentation</NavLink>
          <Link to="/#join-business" className={joinActive ? 'active' : undefined}>Join/Subscribe Now</Link>
          <NavLink to="/premium">Premium Access</NavLink>
        </nav>
      </header>
      {location.pathname === '/' && <BannerSlider items={banners} />}
      <div className={`fab-enquiry ${fabOpen ? 'open' : ''}`}>
        <button
          className="enquiry-toggle has-tip"
          data-tip="Support"
          onClick={() => setFabOpen(v => !v)}
          aria-expanded={fabOpen ? 'true' : 'false'}
          aria-controls="enquiry-menu"
          aria-label="Support"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path fill="currentColor" d="M12 2a7 7 0 0 0-7 7v3a3 3 0 0 0-2 2.83V17a3 3 0 0 0 3 3h2a1 1 0 0 0 1-1v-3.2a1 1 0 0 0-1.2-.98A3 3 0 0 1 6 13V9a6 6 0 1 1 12 0v4a3 3 0 0 1-1.8 2.82a1 1 0 0 0-1.2.98V19a1 1 0 0 0 1 1h2a3 3 0 0 0 3-3v-2.17A3 3 0 0 0 19 12V9a7 7 0 0 0-7-7z"/>
          </svg>
        </button>
        <div id="enquiry-menu" className="fab-menu" role="menu" aria-hidden={fabOpen ? 'false' : 'true'}>
          <a
            className="fab-item whatsapp has-tip"
            data-tip="WhatsApp"
            href="https://wa.me/918012202083"
            target="_blank"
            rel="noreferrer"
            role="menuitem"
            aria-label="WhatsApp"
          >
            <svg width="20" height="20" viewBox="0 0 32 32" aria-hidden="true" focusable="false">
              <path fill="currentColor" d="M19.11 17.49c-.26-.13-1.52-.75-1.75-.84c-.23-.09-.4-.13-.57.13c-.17.26-.65.84-.8 1.01c-.15.17-.3.19-.56.06c-.26-.13-1.1-.41-2.1-1.31c-.78-.69-1.3-1.55-1.45-1.81c-.15-.26-.02-.4.11-.53c.11-.11.26-.3.4-.45c.13-.15.17-.26.26-.43c.09-.17.04-.32-.02-.45c-.06-.13-.57-1.37-.78-1.88c-.2-.48-.4-.42-.57-.43h-.49c-.17 0-.45.06-.69.32c-.23.26-.9.88-.9 2.14c0 1.26.92 2.48 1.05 2.65c.13.17 1.82 2.78 4.41 3.9c.62.27 1.1.43 1.48.55c.62.2 1.18.17 1.63.1c.5-.07 1.52-.62 1.73-1.22c.21-.6.21-1.11.15-1.22c-.06-.11-.23-.17-.49-.3zM26.88 5.12C24.15 2.39 20.66 1 16.99 1C8.83 1 2.38 7.45 2.38 15.61c0 2.71.71 5.35 2.07 7.67L2 31l7.93-2.33c2.27 1.24 4.84 1.9 7.05 1.9h.01c8.16 0 14.61-6.45 14.61-14.61c0-3.66-1.39-7.15-4.12-9.88z"/>
            </svg>
          </a>
          <a
            className="fab-item call has-tip"
            data-tip="Call"
            href="tel:+918012202083"
            role="menuitem"
            aria-label="Call"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <path fill="currentColor" d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2a1 1 0 0 1 1.02-.24c1.12.37 2.33.57 3.57.57a1 1 0 0 1 1 1V21a1 1 0 0 1-1 1C11.85 22 2 12.15 2 1a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.24.2 2.45.57 3.57a1 1 0 0 1-.24 1.02l-2.2 2.2z"/>
            </svg>
          </a>
        </div>
      </div>
      <main className="app-main">{children}</main>
      <footer className="app-footer">
        <div className="social-bar" aria-label="Social links">
          <a className="social-link yt has-tip" data-tip="YouTube" href="https://youtube.com/@aitrendex_tamil?si=iCJ9LMew-CB0hvki" target="_blank" rel="noreferrer" aria-label="YouTube">
            <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.4 3.5 12 3.5 12 3.5s-7.4 0-9.4.6A3 3 0 0 0 .5 6.2C0 8.2 0 12 0 12s0 3.8.5 5.8a3 3 0 0 0 2.1 2.1c2 .6 9.4.6 9.4.6s7.4 0 9.4-.6a3 3 0 0 0 2.1-2.1c.5-2 .5-5.8.5-5.8s0-3.8-.5-5.8zM9.6 15.5V8.5L15.8 12l-6.2 3.5z"/></svg>
          </a>
          <a className="social-link ig has-tip" data-tip="Instagram" href="https://www.instagram.com/" target="_blank" rel="noreferrer" aria-label="Instagram">
            <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M7 2C4.2 2 2 4.2 2 7v10c0 2.8 2.2 5 5 5h10c2.8 0 5-2.2 5-5V7c0-2.8-2.2-5-5-5H7zm0 2h10c1.7 0 3 1.3 3 3v10c0 1.7-1.3 3-3 3H7c-1.7 0-3-1.3-3-3V7c0-1.7 1.3-3 3-3zm5 3.5A5.5 5.5 0 1 0 17.5 13 5.5 5.5 0 0 0 12 7.5zm0 2A3.5 3.5 0 1 1 8.5 13 3.5 3.5 0 0 1 12 9.5zm5.2-2.8a1.2 1.2 0 1 0 1.2 1.2a1.2 1.2 0 0 0-1.2-1.2z"/></svg>
          </a>
          <a className="social-link fb has-tip" data-tip="Facebook" href="https://www.facebook.com/" target="_blank" rel="noreferrer" aria-label="Facebook">
            <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M22 12A10 10 0 1 0 10.5 21.9v-6.9H8v-3h2.5V9.5c0-2.5 1.5-3.9 3.7-3.9c1.1 0 2.2.2 2.2.2v2.4h-1.2c-1.2 0-1.6.8-1.6 1.6V12H16l-.5 3h-2v6.9A10 10 0 0 0 22 12"/></svg>
          </a>
          <a className="social-link wa has-tip" data-tip="WhatsApp Channel" href="https://wa.me/918012202083" target="_blank" rel="noreferrer" aria-label="WhatsApp">
            <svg width="18" height="18" viewBox="0 0 32 32" aria-hidden="true"><path fill="currentColor" d="M19.11 17.49c-.26-.13-1.52-.75-1.75-.84c-.23-.09-.4-.13-.57.13c-.17.26-.65.84-.8 1.01c-.15.17-.3.19-.56.06c-.26-.13-1.1-.41-2.1-1.31c-.78-.69-1.3-1.55-1.45-1.81c-.15-.26-.02-.4.11-.53c.11-.11.26-.3.4-.45c.13-.15.17-.26.26-.43c.09-.17.04-.32-.02-.45c-.06-.13-.57-1.37-.78-1.88c-.2-.48-.4-.42-.57-.43h-.49c-.17 0-.45.06-.69.32c-.23.26-.9.88-.9 2.14c0 1.26.92 2.48 1.05 2.65c.13.17 1.82 2.78 4.41 3.9c.62.27 1.1.43 1.48.55c.62.2 1.18.17 1.63.1c.5-.07 1.52-.62 1.73-1.22c.21-.6.21-1.11.15-1.22c-.06-.11-.23-.17-.49-.3zM26.88 5.12C24.15 2.39 20.66 1 16.99 1C8.83 1 2.38 7.45 2.38 15.61c0 2.71.71 5.35 2.07 7.67L2 31l7.93-2.33c2.27 1.24 4.84 1.9 7.05 1.9h.01c8.16 0 14.61-6.45 14.61-14.61c0-3.66-1.39-7.15-4.12-9.88z"/></svg>
          </a>
        </div>
        <div>© 2026 Trendex · <span>All rights reserved</span></div>
      </footer>
    </div>
  )
}

function NotFound() {
  return (
    <div style={{ padding: 24 }}>
      <h2>Page Not Found</h2>
      <p>The page you’re looking for doesn’t exist.</p>
      <Link to="/">Go Home</Link>
    </div>
  )
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
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Layout>
  )
}
