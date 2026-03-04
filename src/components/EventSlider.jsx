import { useEffect, useRef, useState, useMemo } from 'react'

export default function EventSlider({ items }) {
  const data = useMemo(() => Array.isArray(items) ? items : [], [items])
  const len = data.length || 0
  const [idx, setIdx] = useState(0)
  const [instant, setInstant] = useState(false)
  const timerRef = useRef(null)
  const trackRef = useRef(null)
  const withClones = useMemo(() => {
    if (!len) return []
    return [data[len - 1], ...data, data[0]]
  }, [len, data])
  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current)
    if (len > 1) {
      timerRef.current = setInterval(() => {
        setIdx((v) => v + 1)
      }, 5000)
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [len])
  function go(i) {
    if (!len) return
    setIdx(i)
  }
  function onTransitionEnd() {
    if (!len) return
    if (idx >= len) {
      setInstant(true)
      setIdx(0)
      // next tick restore transition
      requestAnimationFrame(() => setInstant(false))
    }
    if (idx < 0) {
      setInstant(true)
      setIdx(len - 1)
      requestAnimationFrame(() => setInstant(false))
    }
  }
  if (!len) return null
  const current = idx + 1
  return (
    <div className="events-shell" aria-label="Meetings & Trips">
      <div
        ref={trackRef}
        className="events-track"
        style={{
          transform: `translateX(-${current * 100}%)`,
          transition: instant ? 'none' : 'transform .5s ease',
          width: '100%',
          display: 'flex',
        }}
        onTransitionEnd={onTransitionEnd}
      >
        {withClones.map((e, i) => (
          <div key={(e && e.id) ? e.id + ':' + i : i} className="events-item">
            <img className="events-img" src={e?.img} alt={e?.date || 'event'} loading="lazy" />
            {e?.date ? <div className="events-date">{e.date}</div> : null}
          </div>
        ))}
      </div>
      {len > 1 ? (
        <>
          <button className="events-nav left" onClick={() => go(idx - 1)} aria-label="Previous">‹</button>
          <button className="events-nav right" onClick={() => go(idx + 1)} aria-label="Next">›</button>
        </>
      ) : null}
      <div className="events-dots">
        {data.map((_, i) => (
          <button key={i} className={i === ((idx % len) + len) % len ? 'dot active' : 'dot'} onClick={() => go(i)} aria-label={`Go to photo ${i + 1}`} />
        ))}
      </div>
    </div>
  )
}
