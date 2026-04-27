import { useEffect, useRef, useState } from 'react'

export default function AchievementSlider({ achievements }) {
  const [idx, setIdx] = useState(0)
  const timerRef = useRef(null)
  const len = achievements?.length || 0

  useEffect(() => {
    if (len <= 1) return
    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = setInterval(() => {
      setIdx((v) => (v + 1) % len)
    }, 4000)
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [len])

  if (!len) return null

  function go(i) {
    setIdx(((i % len) + len) % len)
  }

  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden', position: 'relative', borderRadius: 12, marginBottom: 16 }}>
       <h2 style={{ 
          textAlign: 'center', 
          padding: '12px 0', 
          margin: 0, 
          fontSize: '1.2rem', 
          background: 'rgba(30, 58, 138, 0.05)',
          color: '#1e3a8a'
        }}>
          Achievements 🏆
        </h2>
      <div 
        style={{ 
          display: 'flex', 
          transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)', 
          transform: `translateX(-${idx * 100}%)`,
          height: 'auto',
          minHeight: '200px'
        }}
      >
        {achievements.map((ach) => (
          <div key={ach.id} style={{ minWidth: '100%', flexShrink: 0 }}>
            <img 
              src={ach.image} 
              alt="Achievement" 
              style={{ 
                width: '100%', 
                height: 'auto', 
                maxHeight: '500px',
                objectFit: 'contain',
                display: 'block'
              }} 
            />
          </div>
        ))}
      </div>
      
      {len > 1 && (
        <>
          <button 
            onClick={() => go(idx - 1)} 
            style={{ 
              position: 'absolute', 
              left: 10, 
              top: '50%', 
              transform: 'translateY(-50%)', 
              background: 'rgba(0,0,0,0.3)', 
              color: '#fff', 
              border: 'none', 
              borderRadius: '50%', 
              width: 36, 
              height: 36, 
              cursor: 'pointer',
              zIndex: 2,
              fontSize: '1.2rem'
            }}
          >
            ‹
          </button>
          <button 
            onClick={() => go(idx + 1)} 
            style={{ 
              position: 'absolute', 
              right: 10, 
              top: '50%', 
              transform: 'translateY(-50%)', 
              background: 'rgba(0,0,0,0.3)', 
              color: '#fff', 
              border: 'none', 
              borderRadius: '50%', 
              width: 36, 
              height: 36, 
              cursor: 'pointer',
              zIndex: 2,
              fontSize: '1.2rem'
            }}
          >
            ›
          </button>
          <div style={{ position: 'absolute', bottom: 10, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 8, zIndex: 2 }}>
            {achievements.map((_, i) => (
              <button 
                key={i} 
                onClick={() => go(i)} 
                style={{ 
                  width: 8, 
                  height: 8, 
                  borderRadius: '50%', 
                  border: 'none', 
                  background: i === idx ? '#fff' : 'rgba(255,255,255,0.4)', 
                  padding: 0, 
                  cursor: 'pointer' 
                }} 
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
