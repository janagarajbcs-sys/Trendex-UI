import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  getLeaders,
  getLeadersAsync,
  submitJoinResponse,
  getAchievements,
  getAchievementsAsync,
} from '../lib/premium';
import AchievementSlider from '../components/AchievementSlider.jsx';

// Animation styles
const animationStyles = `
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes fadeInLeft {
    from { opacity: 0; transform: translateX(-30px); }
    to { opacity: 1; transform: translateX(0); }
  }
  @keyframes fadeInRight {
    from { opacity: 0; transform: translateX(30px); }
    to { opacity: 1; transform: translateX(0); }
  }
  @keyframes pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.03); }
  }
  @keyframes float {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-5px); }
  }
  @keyframes glow {
    0%, 100% { box-shadow: 0 0 5px rgba(0, 221, 235, 0.3); }
    50% { box-shadow: 0 0 20px rgba(0, 221, 235, 0.6); }
  }
  .animate-fade-in {
    animation: fadeIn 0.6s ease-out forwards;
  }
  .animate-fade-in-left {
    animation: fadeInLeft 0.6s ease-out forwards;
  }
  .animate-fade-in-right {
    animation: fadeInRight 0.6s ease-out forwards;
  }
  .animate-pulse {
    animation: pulse 2s ease-in-out infinite;
  }
  .animate-float {
    animation: float 3s ease-in-out infinite;
  }
  .animate-glow {
    animation: glow 2s ease-in-out infinite;
  }
  .card-hover {
    transition: all 0.3s ease;
  }
  .card-hover:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 30px rgba(0, 221, 235, 0.2);
  }
  .btn-hover {
    transition: all 0.3s ease;
  }
  .btn-hover:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(0, 221, 235, 0.3);
  }
`;

export default function Home() {
  const location = useLocation();
  const chartRef = useRef(null);
  const widgetRef = useRef(null);
  const [market, setMarket] = useState(null);
  const [updated, setUpdated] = useState('');
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [sponsor, setSponsor] = useState('');
  const [source, setSource] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [leaders, setLeaders] = useState([]);
  console.log('leaders', leaders);
  const [achievements, setAchievements] = useState([]);
  const [preview, setPreview] = useState('');
  const holdTimer = useRef(null);
  const [showAllLeaders, setShowAllLeaders] = useState(false);
  const [screen, setScreen] = useState(window.innerWidth);

  // Animation states for sections
  const [visibleSections, setVisibleSections] = useState({
    hero: true,
    quickStart: false,
    market: false,
    whyChoose: false,
    testimonials: false,
    bottom: false,
  });

  const sectionRefs = {
    hero: useRef(null),
    quickStart: useRef(null),
    market: useRef(null),
    whyChoose: useRef(null),
    testimonials: useRef(null),
    bottom: useRef(null),
  };

  // Intersection Observer for scroll animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const sectionName = entry.target.dataset.section;
            if (sectionName && !visibleSections[sectionName]) {
              setVisibleSections((prev) => ({
                ...prev,
                [sectionName]: true,
              }));
            }
          }
        });
      },
      { threshold: 0.1 }
    );

    Object.entries(sectionRefs).forEach(([name, ref]) => {
      if (ref.current) {
        ref.current.dataset.section = name;
        observer.observe(ref.current);
      }
    });

    return () => {
      Object.values(sectionRefs).forEach((ref) => {
        if (ref.current) observer.unobserve(ref.current);
      });
    };
  }, [visibleSections]);

  // Add styles to head
  useEffect(() => {
    const styleId = 'home-animations';
    let styleEl = document.getElementById(styleId);
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = styleId;
      document.head.appendChild(styleEl);
    }
    styleEl.textContent = animationStyles;
    return () => {
      const el = document.getElementById(styleId);
      if (el) el.remove();
    };
  }, []);

  // Load TradingView widget
  useEffect(() => {
    let mounted = true;
    function loadWidget() {
      if (!mounted || !window.TradingView) return;
      if (widgetRef.current) {
        try {
          widgetRef.current.remove();
        } catch (e) {
          void e;
        }
        widgetRef.current = null;
      }
      widgetRef.current = new window.TradingView.widget({
        container_id: 'tradingview_chart',
        width: '100%',
        height: 500, // slightly bigger like your HTML
        symbol: 'BINANCE:BTCUSDT',
        interval: 'D', // 🔥 changed from 60 → Daily
        timezone: 'Etc/UTC', // 🔥 from your HTML
        theme: 'dark',
        style: '1',
        locale: 'en',
        toolbar_bg: '#1b263b', // 🔥 updated color
        enable_publishing: false,
        allow_symbol_change: true,
        details: true,
        studies: ['MASimple@tv-basicstudies'],
      });
    }
    if (!window.TradingView) {
      const s = document.createElement('script');
      s.src = 'https://s3.tradingview.com/tv.js';
      s.onload = loadWidget;
      document.body.appendChild(s);
    } else {
      loadWidget();
    }
    return () => {
      mounted = false;
    };
  }, []);

  function resolvePhoto(val) {
    if (!val) return '';
    const s = String(val);
    if (/^(data:|https?:|\/)/i.test(s)) return s;
    return '/images/' + s.replace(/^\/+/, '');
  }
  function startHold(src) {
    if (holdTimer.current) clearTimeout(holdTimer.current);
    holdTimer.current = setTimeout(() => setPreview(src), 450);
  }
  function cancelHold() {
    if (holdTimer.current) {
      clearTimeout(holdTimer.current);
      holdTimer.current = null;
    }
  }

  // Market snapshot
  useEffect(() => {
    async function formatTimeIST(ts) {
      const d = ts ? new Date(ts) : new Date();
      return d.toLocaleString('en-IN', {
        timeZone: 'Asia/Kolkata',
        hour12: true,
        hour: '2-digit',
        minute: '2-digit',
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    }
    function readCache() {
      try {
        const raw = localStorage.getItem('market_cache');
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        if (!parsed || !parsed.data) return null;
        return parsed;
      } catch {
        return null;
      }
    }
    async function loadPrices() {
      const url =
        'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,binancecoin&vs_currencies=usd,inr&include_24hr_change=true';
      try {
        const res = await fetch(url, { cache: 'no-store' });
        if (!res.ok) throw new Error('service_unavailable');
        const data = await res.json();
        if (data && data.bitcoin && data.ethereum && data.binancecoin) {
          setMarket({
            btc: data.bitcoin,
            eth: data.ethereum,
            bnb: data.binancecoin,
          });
          const now = Date.now();
          setUpdated(await formatTimeIST(now));
          try {
            localStorage.setItem(
              'market_cache',
              JSON.stringify({ data, updated: now })
            );
          } catch {
            /* ignore quota */
          }
        }
      } catch {
        const cache = readCache();
        if (cache && cache.data) {
          setMarket({
            btc: cache.data.bitcoin,
            eth: cache.data.ethereum,
            bnb: cache.data.binancecoin,
          });
          setUpdated((await formatTimeIST(cache.updated)) + ' (cached)');
        } else {
          setMarket(null);
        }
      }
    }
    // Prime with cache if available
    const cache = (function () {
      try {
        return JSON.parse(localStorage.getItem('market_cache') || 'null');
      } catch {
        return null;
      }
    })();
    if (cache && cache.data) {
      setMarket({
        btc: cache.data.bitcoin,
        eth: cache.data.ethereum,
        bnb: cache.data.binancecoin,
      });
      formatTimeIST(cache.updated)
        .then((s) => setUpdated(s + ' (cached)'))
        .catch(() => {});
    }
    loadPrices();
    const t = setInterval(loadPrices, 60000);
    return () => clearInterval(t);
  }, []);

  // Load leaders from API with fallback to admin-managed storage
  useEffect(() => {
    async function load() {
      try {
        let list = await getLeadersAsync();
        if (!Array.isArray(list) || list.length === 0) {
          list = getLeaders();
        }
        if (Array.isArray(list)) {
          const sorted = [...list].sort(
            (a, b) => Number(a.sno || 0) - Number(b.sno || 0)
          );
          setLeaders(sorted);
        } else {
          setLeaders([]);
        }
      } catch {
        setLeaders([]);
      }
    }
    async function loadAchievements() {
      try {
        let list = await getAchievementsAsync();
        if (!Array.isArray(list) || list.length === 0) {
          list = getAchievements();
        }
        setAchievements(list || []);
      } catch {
        setAchievements([]);
      }
    }
    load();
    loadAchievements();
    const onStorage = (e) => {
      if (e.key === 'leaders') load();
    };
    const onLocal = () => load();
    let ch;
    if (typeof BroadcastChannel !== 'undefined') {
      ch = new BroadcastChannel('leaders');
      ch.onmessage = (msg) => {
        if (msg && msg.data && msg.data.type === 'leaders-updated') load();
      };
    }
    window.addEventListener('storage', onStorage);
    window.addEventListener('leaders-updated', onLocal);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('leaders-updated', onLocal);
      if (ch) ch.close();
    };
  }, []);

  useEffect(() => {
    const handleResize = () => setScreen(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = screen < 480;
  const isTablet = screen >= 480 && screen < 768;
  const isLaptop = screen >= 768;

  return (
    <div style={{ padding: '0 8px' }}>
      {/* Hero Section */}
      <section
        ref={sectionRefs.hero}
        className="card card-hover"
        style={{
          marginBottom: isMobile ? 16 : 24,
          textAlign: 'center',
          padding: isMobile ? '20px 12px' : '24px',
          animation: 'fadeIn 0.8s ease-out forwards',
        }}
      >
        <div style={{ marginBottom: isMobile ? 16 : 24 }}>
          <h1
            style={{
              color: '#00ddeb',
              margin: 6,
              fontSize: isLaptop ? '3rem' : isTablet ? '2.2rem' : '1.6rem',
              lineHeight: 1.2,
            }}
          >
            AI Trendex - Tamil(Support & Guide)
          </h1>
          <h3
            style={{
              marginBottom: 12,
              fontSize: isLaptop ? '1.5rem' : isTablet ? '1.2rem' : '1rem',
            }}
          >
            Automated Cryptocurrency Trading with 8 strategies
          </h3>
          <p
            style={{
              fontSize: isLaptop ? '1.1rem' : isTablet ? '1rem' : '0.9rem',
              maxWidth: 800,
              margin: '0 auto',
              lineHeight: 1.6,
            }}
          >
            The first real-time spot & futures bots with AI-driven risk
            management. Experience professional-grade trading automation for
            both beginners and advanced traders.
          </p>
        </div>

        <div
          style={{
            display: 'flex',
            gap: isMobile ? 10 : 16,
            flexWrap: 'wrap',
            justifyContent: 'center',
            marginTop: isMobile ? 16 : 24,
          }}
        >
          <a
            className="btn btn-hover"
            href="https://aitrendex.com/"
            target="_blank"
            rel="noreferrer"
            style={{
              padding: isMobile ? '12px 24px' : '14px 28px',
              fontSize: isMobile ? '1rem' : '1.1rem',
              width: isMobile ? '100%' : 'auto',
              maxWidth: isMobile ? '280px' : 'none',
              animation: 'pulse 2s ease-in-out infinite',
            }}
          >
            🚀 Visit Trendex Website
          </a>
          <Link
            className="btn secondary btn-hover"
            to="/how-it-works"
            style={{
              padding: isMobile ? '12px 24px' : '14px 28px',
              fontSize: isMobile ? '1rem' : '1.1rem',
              width: isMobile ? '100%' : 'auto',
              maxWidth: isMobile ? '280px' : 'none',
              animation: 'glow 2s ease-in-out infinite',
            }}
          >
            📖 How It Works
          </Link>
          <a
            className="btn secondary btn-hover"
            href="https://play.google.com/store/apps/details?id=com.binance.dev"
            target="_blank"
            rel="noreferrer"
            style={{
              padding: isMobile ? '10px 20px' : '12px 24px',
              fontSize: isMobile ? '0.95rem' : '1rem',
            }}
          >
            Binance Android
          </a>
          <a
            className="btn secondary btn-hover"
            href="https://apps.apple.com/app/binance-buy-bitcoin-crypto/id1436799971"
            target="_blank"
            rel="noreferrer"
            style={{
              padding: isMobile ? '10px 20px' : '12px 24px',
              fontSize: isMobile ? '0.95rem' : '1rem',
            }}
          >
            Binance iOS
          </a>
        </div>
      </section>

      {/* Quick Start Guide */}
      <section
        ref={sectionRefs.quickStart}
        style={{
          marginBottom: isMobile ? 16 : 24,
          opacity: visibleSections.quickStart ? 1 : 0,
          animation: visibleSections.quickStart
            ? 'fadeIn 0.8s ease-out 0.2s forwards'
            : 'none',
        }}
      >
        <h2
          style={{
            color: '#cfeef3',
            textAlign: 'center',
            marginBottom: isMobile ? 12 : 20,
            fontSize: isLaptop ? '1.5rem' : isTablet ? '1.3rem' : '1.2rem',
          }}
        >
          Quick Start Guide
        </h2>
        <div
          className="card card-hover"
          style={{ padding: isMobile ? '16px' : '24px' }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: isLaptop
                ? 'repeat(4, 1fr)'
                : isTablet
                  ? 'repeat(2, 1fr)'
                  : '1fr',
              gap: isMobile ? 16 : 20,
              textAlign: 'center',
            }}
          >
            {[
              {
                step: 1,
                title: 'Explore Platform',
                desc: 'Watch the presentation and explore the platform completely',
              },
              {
                step: 2,
                title: 'Clear Your Doubts',
                desc: 'Contact your referrer or support team for guidance',
              },
              {
                step: 3,
                title: 'Register & Subscribe',
                desc: 'Create accounts and activate your subscription',
              },
              {
                step: 4,
                title: 'Start Earning',
                desc: 'Get Premium Access and start bot trading or referrals',
              },
            ].map((item, i) => (
              <div
                key={i}
                style={{
                  opacity: visibleSections.quickStart ? 1 : 0,
                  animation: visibleSections.quickStart
                    ? `fadeIn 0.6s ease-out ${0.3 + i * 0.15}s forwards`
                    : 'none',
                }}
              >
                <div
                  style={{
                    width: isMobile ? 52 : 60,
                    height: isMobile ? 52 : 60,
                    borderRadius: '50%',
                    background: '#00ddeb',
                    color: '#000',
                    fontSize: isMobile ? '1.5rem' : '1.8rem',
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 12px auto',
                    animation: visibleSections.quickStart
                      ? 'float 3s ease-in-out infinite'
                      : 'none',
                  }}
                >
                  {item.step}
                </div>
                <h3
                  style={{
                    marginBottom: 6,
                    fontSize: isLaptop
                      ? '1.1rem'
                      : isTablet
                        ? '1rem'
                        : '0.95rem',
                  }}
                >
                  {item.title}
                </h3>
                <p
                  style={{
                    fontSize: isMobile ? '0.85rem' : '0.95rem',
                    lineHeight: 1.5,
                  }}
                >
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: isMobile ? 16 : 24 }}>
            <Link
              className="btn btn-hover"
              to="/video"
              style={{ padding: isMobile ? '10px 20px' : '12px 24px' }}
            >
              📹 Watch Presentation Video
            </Link>
          </div>
        </div>
      </section>

      {/* Leaders board moved to Share & Earn page */}

      {/* Leaders board will be shown after Trading Strategies below */}

      <section
        ref={sectionRefs.market}
        style={{
          marginBottom: isMobile ? 12 : 16,
          opacity: visibleSections.market ? 1 : 0,
          animation: visibleSections.market
            ? 'fadeIn 0.8s ease-out 0.3s forwards'
            : 'none',
        }}
      >
        <h2
          style={{
            color: '#cfeef3',
            fontSize: isLaptop ? '1.5rem' : isTablet ? '1.3rem' : '1.2rem',
          }}
        >
          Live Crypto Market
        </h2>
        <div
          className="card card-hover"
          style={{ overflow: 'hidden', borderRadius: 12 }}
        >
          <div
            id="tradingview_chart"
            ref={chartRef}
            style={{
              width: '100%',
              height: isMobile ? '350px' : '500px',
              borderRadius: '12px',
              overflow: 'hidden',
            }}
          />
        </div>
      </section>

      <section
        style={{
          marginBottom: isMobile ? 12 : 16,
          opacity: visibleSections.market ? 1 : 0,
          animation: visibleSections.market
            ? 'fadeIn 0.8s ease-out 0.5s forwards'
            : 'none',
        }}
      >
        <h2
          style={{
            color: '#cfeef3',
            fontSize: isLaptop ? '1.5rem' : isTablet ? '1.3rem' : '1.2rem',
          }}
        >
          Top Market Updates
        </h2>
        <div
          className="card"
          style={{
            padding: isMobile ? 10 : 15,
            borderRadius: 10,
            background: '#f9fafb',
            width: '100%',
          }}
        >
          {!market ? (
            <p
              style={{
                color: '#ff8b92',
                fontSize: isMobile ? '0.85rem' : '1rem',
              }}
            >
              Unable to load market data.
            </p>
          ) : (
            <>
              <div style={{ overflowX: 'auto' }}>
                <table
                  style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    marginTop: 10,
                    minWidth: isMobile ? 320 : 'auto',
                  }}
                >
                  <thead>
                    <tr>
                      <th style={{ fontSize: isMobile ? '0.75rem' : '0.9rem' }}>
                        Asset
                      </th>
                      <th style={{ fontSize: isMobile ? '0.75rem' : '0.9rem' }}>
                        USD
                      </th>
                      <th style={{ fontSize: isMobile ? '0.75rem' : '0.9rem' }}>
                        INR
                      </th>
                      <th style={{ fontSize: isMobile ? '0.75rem' : '0.9rem' }}>
                        24h
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {[
                      ['Bitcoin (BTC)', market.btc],
                      ['Ethereum (ETH)', market.eth],
                      ['Binance Coin (BNB)', market.bnb],
                    ].map(([label, coin]) => (
                      <tr key={label}>
                        {/* Asset */}
                        <td
                          style={{
                            fontSize: isMobile ? '0.75rem' : '0.9rem',
                            fontWeight: 600,
                          }}
                        >
                          {isMobile ? label.split(' ')[0] : label}
                        </td>

                        {/* USD */}
                        <td
                          style={{
                            fontSize: isMobile ? '0.75rem' : '0.9rem',
                          }}
                        >
                          ${Number(coin.usd).toLocaleString()}
                        </td>

                        {/* INR */}
                        <td
                          style={{
                            fontSize: isMobile ? '0.75rem' : '0.9rem',
                          }}
                        >
                          ₹{Number(coin.inr).toLocaleString()}
                        </td>

                        {/* 24h */}
                        <td
                          style={{
                            fontSize: isMobile ? '0.75rem' : '0.9rem',
                            color:
                              coin.usd_24h_change >= 0 ? '#4ef58b' : '#ff8b92',
                            fontWeight: 700,
                          }}
                        >
                          {coin.usd_24h_change.toFixed(2)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Footer */}
              <p
                style={{
                  marginTop: 12,
                  color: '#9fb3bf',
                  fontSize: isMobile ? '0.75rem' : '0.9rem',
                  textAlign: 'center',
                }}
              >
                Last updated: <span>{updated || '--'}</span>
              </p>
            </>
          )}
        </div>
      </section>

      <section
        style={{
          display: 'grid',
          gap: 12,
          opacity: visibleSections.market ? 1 : 0,
          animation: visibleSections.market
            ? 'fadeIn 0.8s ease-out 0.7s forwards'
            : 'none',
        }}
      >
        <div className="card card-hover">
          <h2
            style={{
              fontSize: isLaptop ? '1.3rem' : isTablet ? '1.2rem' : '1.1rem',
            }}
          >
            Full Plan Presentation Video
          </h2>
          <Link
            className="btn btn-hover"
            to="/video"
            style={{ padding: isMobile ? '10px 20px' : '12px 24px' }}
          >
            Watch Now →
          </Link>
        </div>
        <div className="card card-hover">
          <h2
            style={{
              fontSize: isLaptop ? '1.3rem' : isTablet ? '1.2rem' : '1.1rem',
            }}
          >
            Trading Strategies
          </h2>
          <Link
            className="btn btn-hover"
            to="/bot"
            style={{ padding: isMobile ? '10px 20px' : '12px 24px' }}
          >
            Types of Strategies →
          </Link>
        </div>
        <div className="card card-hover">
          <h2
            style={{
              fontSize: isLaptop ? '1.3rem' : isTablet ? '1.2rem' : '1.1rem',
            }}
          >
            💰 Share and Earn
          </h2>
          <Link
            className="btn btn-hover"
            to="/sharing"
            style={{ padding: isMobile ? '10px 20px' : '12px 24px' }}
          >
            View Details →
          </Link>
        </div>

        <AchievementSlider achievements={achievements} />

        <div
          className="card"
          style={{
            padding: isMobile ? 10 : 15,
            borderRadius: 10,
            background: '#f9fafb',
          }}
        >
          <h2
            style={{
              color: '#111827',
              fontSize: isMobile ? '1rem' : isTablet ? '1.2rem' : '1.4rem',
              textAlign: 'center',
            }}
          >
            Top Team Leaders — Performance Board
          </h2>

          <div style={{ overflowX: 'auto' }}>
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                minWidth: isMobile ? 450 : isTablet ? 550 : '100%',
              }}
            >
              <thead>
                <tr>
                  <th
                    style={{
                      textAlign: 'center',
                      fontSize: isMobile ? '0.7rem' : '0.9rem',
                    }}
                  >
                    S.No
                  </th>
                  <th
                    style={{
                      textAlign: 'center',
                      fontSize: isMobile ? '0.7rem' : '0.9rem',
                    }}
                  >
                    Photo
                  </th>
                  <th style={{ fontSize: isMobile ? '0.7rem' : '0.9rem' }}>
                    Name
                  </th>
                  <th style={{ fontSize: isMobile ? '0.7rem' : '0.9rem' }}>
                    Rank Name
                  </th>
                  <th style={{ fontSize: isMobile ? '0.7rem' : '0.9rem' }}>
                    Location
                  </th>
                </tr>
              </thead>

              <tbody>
                {(showAllLeaders ? leaders : leaders.slice(0, 10)).map(
                  (l, i) => (
                    <tr key={l.id || `${l.name}-${i}`}>
                      <td style={{ textAlign: 'center', fontWeight: 700 }}>
                        {l.sno ?? i + 1}
                      </td>

                      <td style={{ textAlign: 'center' }}>
                        {l.photo ? (
                          <div
                            style={{
                              width: isMobile ? 28 : isTablet ? 36 : 50,
                              height: isMobile ? 38 : isTablet ? 48 : 65,
                              padding: 2,
                              background: '#fff',
                              borderRadius: 6,
                              display: 'inline-block',
                            }}
                            onMouseDown={() => startHold(resolvePhoto(l.photo))}
                            onMouseUp={cancelHold}
                            onMouseLeave={cancelHold}
                            onTouchStart={() =>
                              startHold(resolvePhoto(l.photo))
                            }
                            onTouchEnd={cancelHold}
                          >
                            <img
                              src={resolvePhoto(l.photo)}
                              alt={l.name || 'leader'}
                              style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                                borderRadius: 4,
                              }}
                            />
                          </div>
                        ) : (
                          '-'
                        )}
                      </td>

                      <td
                        style={{
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          maxWidth: isMobile ? 100 : 180,
                          fontWeight: 800,
                          fontSize: isMobile ? '0.7rem' : '0.9rem',
                        }}
                      >
                        {l.name}
                      </td>

                      <td
                        style={{
                          fontSize: isMobile ? '0.7rem' : '0.85rem',
                        }}
                      >
                        {l.title}
                      </td>

                      <td
                        style={{
                          fontSize: isMobile ? '0.65rem' : '0.8rem',
                        }}
                      >
                        {l.loc}
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>

            {/* Buttons */}
            {leaders.length > 10 && !showAllLeaders && (
              <div style={{ textAlign: 'center', padding: 8 }}>
                <button
                  className="btn secondary"
                  onClick={() => setShowAllLeaders(true)}
                  style={{
                    padding: isMobile ? '4px 8px' : '6px 12px',
                    fontSize: isMobile ? '0.75rem' : '0.9rem',
                  }}
                >
                  More
                </button>
              </div>
            )}

            {leaders.length > 10 && showAllLeaders && (
              <div style={{ textAlign: 'center', padding: 8 }}>
                <button
                  className="btn secondary"
                  onClick={() => setShowAllLeaders(false)}
                  style={{
                    padding: isMobile ? '4px 8px' : '6px 12px',
                    fontSize: isMobile ? '0.75rem' : '0.9rem',
                  }}
                >
                  Less
                </button>
              </div>
            )}

            {leaders.length === 0 && (
              <div
                style={{
                  padding: '10px 14px',
                  fontSize: isMobile ? '0.8rem' : '1rem',
                }}
              >
                No leaders yet. Add entries in admin dashboard.
              </div>
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
        <div className="card card-hover">
          <h2>Suggestion or Complaint</h2>
          <Link className="btn btn-hover" to="/complaint">
            Type Now →
          </Link>
        </div>

        {/* Why Choose Trendex Section */}
        <div
          ref={sectionRefs.whyChoose}
          style={{
            marginBottom: isMobile ? 12 : 12,
            opacity: visibleSections.whyChoose ? 1 : 0,
            animation: visibleSections.whyChoose
              ? 'fadeIn 0.8s ease-out 0.2s forwards'
              : 'none',
          }}
        >
          <h2
            style={{
              color: '#cfeef3',
              textAlign: 'center',
              marginBottom: isMobile ? 10 : 12,
              fontSize: isLaptop ? '1.5rem' : isTablet ? '1.3rem' : '1.2rem',
            }}
          >
            Why Choose Trendex AI?
          </h2>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: isLaptop
                ? 'repeat(4, 1fr)'
                : isTablet
                  ? 'repeat(2, 1fr)'
                  : '1fr',
              gap: isMobile ? 10 : 12,
            }}
          >
            {[
              {
                icon: '🤖',
                title: '8 Unique Strategies',
                desc: 'Spot and Futures trading strategies for every market condition',
              },
              {
                icon: '🔒',
                title: 'Your Funds Stay Yours',
                desc: 'Never give up control - funds always stay in your Binance wallet',
              },
              {
                icon: '⚡',
                title: '24/7 Automation',
                desc: 'Bots execute trades automatically around the clock',
              },
              {
                icon: '🛡️',
                title: 'AI Risk Management',
                desc: 'Smart risk controls to protect your capital',
              },
            ].map((item, i) => (
              <div
                key={i}
                className="card card-hover"
                style={{
                  textAlign: 'center',
                  padding: isMobile ? '14px' : '16px',
                  opacity: visibleSections.whyChoose ? 1 : 0,
                  animation: visibleSections.whyChoose
                    ? `fadeIn 0.6s ease-out ${0.3 + i * 0.15}s forwards`
                    : 'none',
                }}
              >
                <div
                  style={{
                    fontSize: isMobile ? '2rem' : '2.2rem',
                    marginBottom: isMobile ? 8 : 10,
                    animation: visibleSections.whyChoose
                      ? 'float 3s ease-in-out infinite'
                      : 'none',
                  }}
                >
                  {item.icon}
                </div>
                <h3
                  style={{
                    marginBottom: isMobile ? 4 : 6,
                    color: '#00ddeb',
                    fontSize: isLaptop
                      ? '1.1rem'
                      : isTablet
                        ? '1rem'
                        : '0.95rem',
                  }}
                >
                  {item.title}
                </h3>
                <p
                  style={{
                    fontSize: isMobile ? '0.82rem' : '0.85rem',
                    lineHeight: 1.5,
                  }}
                >
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="card card-hover">
          <h2
            style={{
              fontSize: isLaptop ? '1.3rem' : isTablet ? '1.2rem' : '1.1rem',
            }}
          >
            100+ Frequently Asked Questions
          </h2>
          <div
            style={{
              display: 'flex',
              gap: isMobile ? 8 : 10,
              flexWrap: 'wrap',
              justifyContent: 'center',
            }}
          >
            <Link
              className="btn secondary btn-hover"
              to="/qanda/company"
              style={{
                padding: isMobile ? '8px 16px' : '10px 20px',
                fontSize: isMobile ? '0.85rem' : '0.95rem',
              }}
            >
              Trendex Basics
            </Link>
            <Link
              className="btn secondary btn-hover"
              to="/qanda/trading"
              style={{
                padding: isMobile ? '8px 16px' : '10px 20px',
                fontSize: isMobile ? '0.85rem' : '0.95rem',
              }}
            >
              Trading
            </Link>
            <Link
              className="btn secondary btn-hover"
              to="/qanda/refer"
              style={{
                padding: isMobile ? '8px 16px' : '10px 20px',
                fontSize: isMobile ? '0.85rem' : '0.95rem',
              }}
            >
              Referral
            </Link>
            <Link
              className="btn secondary btn-hover"
              to="/qanda/pricing"
              style={{
                padding: isMobile ? '8px 16px' : '10px 20px',
                fontSize: isMobile ? '0.85rem' : '0.95rem',
              }}
            >
              Payments
            </Link>
            <Link
              className="btn secondary btn-hover"
              to="/qanda/support"
              style={{
                padding: isMobile ? '8px 16px' : '10px 20px',
                fontSize: isMobile ? '0.85rem' : '0.95rem',
              }}
            >
              Support
            </Link>
          </div>
        </div>
        <div
          className="card card-hover"
          id="join-business"
          style={{
            textAlign: 'left',
            padding: isMobile ? '18px 16px' : '24px',
            opacity: visibleSections.whyChoose ? 1 : 0,
            animation: visibleSections.whyChoose
              ? 'fadeIn 0.8s ease-out 0.5s forwards'
              : 'none',
          }}
        >
          <h2
            style={{
              marginTop: 0,
              textAlign: 'center',
              fontSize: isLaptop ? '1.4rem' : isTablet ? '1.25rem' : '1.15rem',
            }}
          >
            Interested in starting/joining this Business
          </h2>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              const ok = await submitJoinResponse({
                name,
                mobile,
                gmail: email,
                place: '',
                sponsor,
                source,
                message,
              });
              setSubmitted(ok);
              if (ok) {
                setName('');
                setMobile('');
                setEmail('');
                setSponsor('');
                setSource('');
                setMessage('');
              }
            }}
            style={{
              display: 'grid',
              gap: isMobile ? 12 : 10,
              maxWidth: 560,
              margin: '0 auto',
            }}
          >
            <label>
              <input
                required
                placeholder="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{
                  width: '100%',
                  marginTop: 6,
                  padding: isMobile ? '12px 10px' : '10px',
                  borderRadius: 8,
                  fontSize: isMobile ? '0.95rem' : '1rem',
                }}
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
                style={{
                  width: '100%',
                  marginTop: 6,
                  padding: isMobile ? '12px 10px' : '10px',
                  borderRadius: 8,
                  fontSize: isMobile ? '0.95rem' : '1rem',
                }}
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
                style={{
                  width: '100%',
                  marginTop: 6,
                  padding: isMobile ? '12px 10px' : '10px',
                  borderRadius: 8,
                  fontSize: isMobile ? '0.95rem' : '1rem',
                }}
              />
            </label>
            <label>
              <input
                required
                placeholder="COUPON_CODE (referred by)"
                value={sponsor}
                onChange={(e) => setSponsor(e.target.value)}
                style={{
                  width: '100%',
                  marginTop: 6,
                  padding: isMobile ? '12px 10px' : '10px',
                  borderRadius: 8,
                  fontSize: isMobile ? '0.95rem' : '1rem',
                }}
              />
            </label>
            <label>
              <select
                required
                value={source}
                onChange={(e) => setSource(e.target.value)}
                style={{
                  width: '100%',
                  marginTop: 6,
                  padding: isMobile ? '12px 10px' : '10px',
                  borderRadius: 8,
                  fontSize: isMobile ? '0.95rem' : '1rem',
                }}
              >
                <option value="">Select social media source</option>
                <option value="whatsapp">WhatsApp</option>
                <option value="facebook">Facebook</option>
                <option value="youtube">YouTube</option>
                <option value="instagram">Instagram</option>
                <option value="telegram">Telegram</option>
                <option value="My Friend">My Friend</option>
              </select>
            </label>
            <label>
              <textarea
                required
                rows={4}
                placeholder="Enter your requirement message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                style={{
                  width: '100%',
                  marginTop: 6,
                  padding: isMobile ? '12px 10px' : '10px',
                  borderRadius: 8,
                  fontSize: isMobile ? '0.95rem' : '1rem',
                }}
              />
            </label>
            <button
              className="btn btn-hover"
              type="submit"
              disabled={
                !name ||
                !/^[0-9]{10}$/.test(mobile) ||
                !/^[a-zA-Z0-9._%+-]+@gmail\.com$/.test(email) ||
                !sponsor ||
                !source ||
                !message
              }
              style={{
                padding: isMobile ? '12px 24px' : '12px 24px',
                fontSize: isMobile ? '1rem' : '1.05rem',
                opacity:
                  !name ||
                  !/^[0-9]{10}$/.test(mobile) ||
                  !/^[a-zA-Z0-9._%+-]+@gmail\.com$/.test(email) ||
                  !sponsor ||
                  !source ||
                  !message
                    ? 0.6
                    : 1,
              }}
            >
              Submit
            </button>
            {submitted && (
              <div
                style={{
                  color: '#22c55e',
                  textAlign: 'center',
                  marginTop: 8,
                  fontSize: isMobile ? '0.95rem' : '1rem',
                }}
              >
                Submitted successfully!
              </div>
            )}
          </form>
        </div>

        {/* Testimonials Section */}
        <section
          ref={sectionRefs.testimonials}
          style={{
            marginBottom: isMobile ? 12 : 12,
            opacity: visibleSections.testimonials ? 1 : 0,
            animation: visibleSections.testimonials
              ? 'fadeIn 0.8s ease-out 0.2s forwards'
              : 'none',
          }}
        >
          <h2
            style={{
              color: '#cfeef3',
              textAlign: 'center',
              marginBottom: isMobile ? 10 : 12,
              fontSize: isLaptop ? '1.5rem' : isTablet ? '1.3rem' : '1.2rem',
            }}
          >
            What Our Traders Say
          </h2>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: isLaptop
                ? 'repeat(3, 1fr)'
                : isTablet
                  ? 'repeat(2, 1fr)'
                  : '1fr',
              gap: isMobile ? 10 : 12,
            }}
          >
            {[
              {
                name: 'Arun K.',
                location: 'Erode',
                quote:
                  'Compared to traditional saving methods, this gave me a better way to grow my funds while keeping full control since my funds remain in my own trading account. That gave me confidence.',
              },
              {
                name: 'Praveen S.',
                location: 'Coimbatore',
                quote:
                  'I lost money before by blindly trusting others and joining random opportunities. What impressed me here was the ability to build capital gradually while also having referral opportunities.',
              },
              {
                name: 'Dinesh R.',
                location: 'Salem',
                quote:
                  'What I liked most is that this is not a quick-profit platform. The long-term approach, multiple strategies, regular achievers meetups, and continuous updates make it feel like a system focused on learning and steady growth.',
              },
              {
                name: 'Kavya M.',
                location: 'Tiruppur',
                quote:
                  'Before this, I tried multiple ways to grow my savings but never found something I could understand and follow consistently. Here, having control over my own account gave me more confidence.',
              },
              {
                name: 'Priyadharshini S.',
                location: 'Chennai',
                quote:
                  'I was hesitant because of my previous experiences, but the step-by-step approach and learning process made it easier. I like that this focuses on gradual growth rather than unrealistic promises.',
              },
              {
                name: 'Nivetha R.',
                location: 'Karur',
                quote:
                  'What impressed me most was the community support, regular updates, and events. It feels more like learning and growing together rather than simply joining another platform.',
              },
            ].map((testimonial, i) => (
              <div
                key={i}
                className="card card-hover"
                style={{
                  padding: isMobile ? '14px' : '16px',
                  opacity: visibleSections.testimonials ? 1 : 0,
                  animation: visibleSections.testimonials
                    ? `fadeIn 0.6s ease-out ${0.3 + i * 0.15}s forwards`
                    : 'none',
                }}
              >
                <div
                  style={{
                    fontSize: isMobile ? '1.8rem' : '2rem',
                    marginBottom: isMobile ? 8 : 10,
                  }}
                >
                  "
                </div>
                <p
                  style={{
                    fontSize: isMobile ? '0.85rem' : '0.9rem',
                    marginBottom: isMobile ? 10 : 12,
                    fontStyle: 'italic',
                    lineHeight: 1.6,
                  }}
                >
                  {testimonial.quote}
                </p>
                <div
                  style={{
                    fontWeight: 'bold',
                    color: '#00ddeb',
                    fontSize: isMobile ? '0.95rem' : '1rem',
                  }}
                >
                  {testimonial.name}
                </div>
                <div
                  style={{
                    fontSize: isMobile ? '0.78rem' : '0.8rem',
                    color: '#9fb3bf',
                    marginTop: 4,
                  }}
                >
                  {testimonial.location}
                </div>
              </div>
            ))}
          </div>
        </section>

        <div
          ref={sectionRefs.bottom}
          className="card card-hover"
          style={{
            marginTop: isMobile ? 12 : 12,
            padding: isMobile ? '18px 16px' : '20px 24px',
            opacity: visibleSections.bottom ? 1 : 0,
            animation: visibleSections.bottom
              ? 'fadeIn 0.8s ease-out 0.2s forwards'
              : 'none',
          }}
        >
          <h2
            style={{
              fontSize: isLaptop ? '1.3rem' : isTablet ? '1.2rem' : '1.1rem',
            }}
          >
            Premium Access
          </h2>
          <Link
            className="btn btn-hover"
            to="/premium"
            style={{
              padding: isMobile ? '10px 20px' : '12px 24px',
              fontSize: isMobile ? '1rem' : '1.05rem',
            }}
          >
            Go to Premium →
          </Link>
        </div>
        <div
          style={{
            marginTop: isMobile ? 12 : 12,
            fontSize: isMobile ? '0.8rem' : '0.85rem',
            fontWeight: 'bold',
            color: '#EF4444',
            display: 'inline-block',
            padding: isMobile ? '10px 14px' : '8px 12px',
            borderRadius: '8px',
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            marginLeft: 'auto',
            marginRight: 'auto',
            display: 'block',
            textAlign: 'center',
            lineHeight: 1.5,
            opacity: visibleSections.bottom ? 1 : 0,
            animation: visibleSections.bottom
              ? 'fadeIn 0.8s ease-out 0.4s forwards'
              : 'none',
          }}
        >
          Real trading does not provide stable, guaranteed, or assured returns
        </div>
      </section>
    </div>
  );
}
