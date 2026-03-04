import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'

export default function BannerSlider({ items }) {
  const data = useMemo(() => {
    if (Array.isArray(items) && items.length) return items
    return[]
    // return [
    //   { id: 'b1', img: '/images/jana.jpeg', title: 'Top Leaders', subtitle: 'See performance board', cta: { text: 'View Leaders', to: '/' } },
    //   { id: 'b2', img: '/images/raghul.jpg', title: 'Share & Earn', subtitle: 'Referral cashback and rewards', cta: { text: 'Explore', to: '/sharing' } },
    //   { id: 'b3', img: '/images/maha.jpg', title: 'Presentation', subtitle: 'Understand the full plan', cta: { text: 'Watch Video', to: '/video' } }
    // ]
  }, [items])
  const [idx, setIdx] = useState(0)
  const timerRef = useRef(null)
  const len = data.length
  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = setInterval(() => setIdx((v) => (v + 1) % len), 4500)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [len])
  function go(i) {
    setIdx(((i % len) + len) % len)
  }
  return (
    <div className="banner-shell" aria-label="Highlights">
      <div className="banner-track" style={{ transform: `translateX(-${idx * 100}%)` }}>
        {data.map((b) => (
          <div key={b.id} className="banner-item">
            <img className="banner-img" src={b.img} alt={b.title} />
            <div className="banner-overlay">
              <div className="banner-text">
                <div className="banner-title">{b.title}</div>
                <div className="banner-subtitle">{b.subtitle}</div>
                {b.cta?.to && b.cta?.text && (
                  <Link className="btn banner-cta" to={b.cta.to}>{b.cta.text}</Link>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      <button className="banner-nav left" onClick={() => go(idx - 1)} aria-label="Previous">‹</button>
      <button className="banner-nav right" onClick={() => go(idx + 1)} aria-label="Next">›</button>
      <div className="banner-dots">
        {data.map((_, i) => (
          <button key={i} className={i === idx ? 'dot active' : 'dot'} onClick={() => go(i)} aria-label={`Go to slide ${i + 1}`} />
        ))}
      </div>
    </div>
  )
}
