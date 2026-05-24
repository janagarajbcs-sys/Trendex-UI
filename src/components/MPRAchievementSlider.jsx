import { useEffect, useRef, useState } from 'react';

// Default local achievement images as fallback (can be empty if none)
const DEFAULT_MPR = [];

const POPPER_COLORS = [
  '#FFD700',
  '#FF6B6b',
  '#4ECDC4',
  '#45B7D1',
  '#96CEB4',
  '#FFEAA7',
  '#DDA0DD',
  '#FF8C00',
];

function PartyPopper({ side, isActive }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!isActive) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = 120;
    const height = 280;
    canvas.width = width;
    canvas.height = height;

    const particles = [];
    const numParticles = 40;

    for (let i = 0; i < numParticles; i++) {
      const angle =
        side === 'left'
          ? (Math.random() * Math.PI) / 2 - Math.PI / 4
          : Math.PI + (Math.random() * Math.PI) / 2 - Math.PI / 4;

      particles.push({
        x: side === 'left' ? 10 : width - 10,
        y: height / 2,
        vx: Math.cos(angle) * (Math.random() * 10 + 5),
        vy: Math.sin(angle) * (Math.random() * 10 + 5),
        size: Math.random() * 8 + 4,
        color: POPPER_COLORS[Math.floor(Math.random() * POPPER_COLORS.length)],
        gravity: 0.2,
        friction: 0.98,
        life: 1,
        decay: Math.random() * 0.01 + 0.008,
        shape: Math.random() > 0.5 ? 'circle' : 'rect',
      });
    }

    let animationId;
    let frameCount = 0;

    const animate = () => {
      if (!isActive) return;
      ctx.clearRect(0, 0, width, height);
      let allDead = false;
      frameCount++;

      particles.forEach((p) => {
        if (p.life <= 0) return;
        allDead = true;
        p.vy += p.gravity;
        p.vx *= p.friction;
        p.x += p.vx;
        p.y += p.vy;
        p.life -= p.decay;
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.fillStyle = p.color;
        if (p.shape === 'circle') {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.fillRect(
            p.x - p.size / 2,
            p.y - p.size / 2,
            p.size * p.life,
            p.size * p.life
          );
        }
      });

      if (frameCount < 600 && allDead) {
        animationId = requestAnimationFrame(animate);
      }
    };

    animate();
    return () => cancelAnimationFrame(animationId);
  }, [isActive, side]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        [side]: 0,
        top: 0,
        height: '100%',
        pointerEvents: 'none',
        zIndex: 10,
      }}
    />
  );
}

export default function MPRAchievementSlider({ achievements }) {
  const containerRef = useRef(null);
  const [items, setItems] = useState([]);
  const [isPaused, setIsPaused] = useState(false);
  const [showPopper, setShowPopper] = useState(false);
  const [displayCount, setDisplayCount] = useState(0);

  useEffect(() => {
    if (achievements && achievements.length > 0) {
      setItems(achievements);
    } else {
      setItems(DEFAULT_MPR);
    }
  }, [achievements]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            if (!showPopper) {
              setShowPopper(true);
              setTimeout(() => setShowPopper(false), 10000);
            }

            // Animate count
            let start = 0;
            const end = items.length;
            if (end === 0) return;

            const duration = 2000; // 2 seconds
            const increment = end / (duration / 16); // 60fps

            const timer = setInterval(() => {
              start += increment;
              if (start >= end) {
                setDisplayCount(end);
                clearInterval(timer);
              } else {
                setDisplayCount(Math.floor(start));
              }
            }, 16);
            return () => clearInterval(timer);
          }
        });
      },
      { threshold: 0.2 }
    );
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [showPopper, items.length]);

  if (!items.length) return null;

  // Split items into multiple rows (exactly 8 per row as requested)
  const itemsPerRow = 8;
  const rows = [];
  for (let i = 0; i < items.length; i += itemsPerRow) {
    rows.push(items.slice(i, i + itemsPerRow));
  }

  return (
    <div
      ref={containerRef}
      className="card"
      style={{
        padding: 0,
        overflow: 'hidden',
        position: 'relative',
        borderRadius: 12,
        marginBottom: 16,
      }}
    >
      <h2
        style={{
          textAlign: 'center',
          padding: '12px 0',
          margin: 0,
          fontSize: '1.2rem',
          background: 'rgba(30, 58, 138, 0.05)',
          color: '#1e3a8a',
        }}
      >
        MPR Achievers List 🎯
      </h2>

      <div
        style={{
          overflow: 'hidden',
          padding: '10px 0',
          background:
            'linear-gradient(90deg, #f0f9ff 0%, #e0f2fe 50%, #f0f9ff 100%)',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          gap: '15px',
        }}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {showPopper && (
          <>
            <PartyPopper side="left" isActive={showPopper} />
            <PartyPopper side="right" isActive={showPopper} />
          </>
        )}

        {rows.map((rowItems, rowIndex) => (
          <div
            key={rowIndex}
            className="scrolling-track-wrapper"
            style={{ overflow: 'hidden', width: '100%' }}
          >
            <div
              className="scrolling-track"
              style={{
                display: 'flex',
                width: 'max-content',
                animation: `${rowIndex % 2 === 0 ? 'scroll' : 'scroll-reverse'} ${rowItems.length * 4}s linear infinite`,
                animationPlayState: isPaused ? 'paused' : 'running',
              }}
            >
              {[...rowItems, ...rowItems].map((ach, idx) => (
                <div
                  key={`${ach.id}-${rowIndex}-${idx}`}
                  style={{
                    width: 140,
                    height: 180,
                    margin: '0 10px',
                    flexShrink: 0,
                    borderRadius: 10,
                    overflow: 'hidden',
                    boxShadow: '0 8px 20px rgba(0,0,0,0.1)',
                    border: '3px solid #fff',
                    background: '#fff',
                  }}
                >
                  <img
                    src={ach.image}
                    alt="MPR Achiever"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                    loading="lazy"
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div
        style={{
          textAlign: 'center',
          padding: '8px 0',
          fontSize: '0.9rem',
          color: '#1e3a8a',
          opacity: 0.8,
          background: 'rgba(30, 58, 138, 0.03)',
          borderTop: '1px solid rgba(30, 58, 138, 0.05)',
          fontWeight: 'bold',
        }}
      >
        Total Achievers: {displayCount}
      </div>

      <style>{`
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes scroll-reverse {
          0% { transform: translateX(-50%); }
          100% { transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}
