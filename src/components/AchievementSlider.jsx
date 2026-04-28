import { useEffect, useRef, useState } from 'react'

// Default local achievement images as fallback
const DEFAULT_ACHIEVEMENTS = [
  { id: 'default_1', image: '/images/jana.jpeg', sno: 1 },
  { id: 'default_2', image: '/images/raghul.jpg', sno: 2 },
  { id: 'default_3', image: '/images/maha.jpg', sno: 3 },
  { id: 'default_4', image: '/images/arun.jpeg', sno: 4 },
]

// Party popper colors - professional gold and celebration colors
const POPPER_COLORS = ['#FFD700', '#FF6B6b', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#FF8C00']

function PartyPopper({ side, isActive }) {
  const canvasRef = useRef(null)
  const containerRef = useRef(null)
  
  useEffect(() => {
    if (!isActive) return
    
    const canvas = canvasRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext('2d')
    const width = 120
    // Use a fixed height that matches the slider container
    const height = 280
    canvas.width = width
    canvas.height = height
    
    // Particles
    const particles = []
    const numParticles = side === 'left' ? 40 : 40
    
    // Create initial burst
    for (let i = 0; i < numParticles; i++) {
      const angle = side === 'left' 
        ? Math.random() * Math.PI / 2 - Math.PI / 4  // -45 to 45 degrees
        : Math.PI + Math.random() * Math.PI / 2 - Math.PI / 4  // 135 to 225 degrees
      
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
      })
    }
    
    let animationId
    let frameCount = 0
    
    const animate = () => {
      if (!isActive) return
      
      ctx.clearRect(0, 0, width, height)
      
      let allDead = false
      frameCount++
      
      particles.forEach((p) => {
        if (p.life <= 0) return
        allDead = true
        
        // Update physics
        p.vy += p.gravity
        p.vx *= p.friction
        p.x += p.vx
        p.y += p.vy
        p.life -= p.decay
        
        // Draw particle
        ctx.globalAlpha = Math.max(0, p.life)
        ctx.fillStyle = p.color
        
        if (p.shape === 'circle') {
          ctx.beginPath()
          ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2)
          ctx.fill()
        } else {
          ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size * p.life, p.size * p.life)
        }
        
        // Sparkle effect
        if (p.life > 0.5 && Math.random() > 0.7) {
          ctx.globalAlpha = p.life * 0.5
          ctx.fillStyle = '#FFFFFF'
          ctx.beginPath()
          ctx.arc(p.x, p.y, 2, 0, Math.PI * 2)
          ctx.fill()
        }
      })
      
      ctx.globalAlpha = 1
      
      // Continue if particles still alive and within 10 seconds
      if (frameCount < 600 && allDead) {
        animationId = requestAnimationFrame(animate)
      }
    }
    
    animate()
    return () => {
      cancelAnimationFrame(animationId)
    }
  }, [isActive, side])

  if (!isActive) return null

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
  )
}

export default function AchievementSlider({ achievements }) {
  const containerRef = useRef(null)
  const [currentAchievements, setCurrentAchievements] = useState([])
  const [isPaused, setIsPaused] = useState(false)
  const [showPopper, setShowPopper] = useState(false)
  
  // Use provided achievements or fallback to default local images
  useEffect(() => {
    if (achievements && achievements.length > 0) {
      setCurrentAchievements(achievements)
    } else {
      // Fallback to local default images
      setCurrentAchievements(DEFAULT_ACHIEVEMENTS)
    }
  }, [achievements])

  // Detect when achievement section comes into view using Intersection Observer
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    // Also trigger immediately on mount as fallback
    const timer = setTimeout(() => {
      if (!showPopper) {
        setShowPopper(true)
        setTimeout(() => setShowPopper(false), 10000)
      }
    }, 500)

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !showPopper) {
            // Trigger party popper when section comes into view
            setShowPopper(true)
            // Reset after 10 seconds so it can trigger again on next visit
            setTimeout(() => setShowPopper(false), 10000)
          }
        })
      },
      { threshold: 0.2 } // Trigger when 20% visible
    )

    observer.observe(container)

    return () => {
      clearTimeout(timer)
      observer.disconnect()
    }
  }, [])

  const len = currentAchievements?.length || 0

  // Handle image load error - try to show local fallback
  const handleImageError = (e, ach) => {
    if (ach.image && ach.image.startsWith('/images/')) {
      e.target.style.display = 'none'
    } else {
      e.target.src = '/images/jana.jpeg'
    }
  }

  if (!len) return null

  return (
    <div 
      ref={containerRef}
      className="card" 
      style={{ 
        padding: 0, 
        overflow: 'hidden', 
        position: 'relative', 
        borderRadius: 12, 
        marginBottom: 16 
      }}
    >
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
      
      {/* Continuous scrolling container like a car moving */}
      <div 
        style={{ 
          overflow: 'hidden',
          padding: '15px 0',
          background: 'linear-gradient(90deg, #f0f9ff 0%, #e0f2fe 50%, #f0f9ff 100%)',
          position: 'relative',
        }}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Party popper celebration on both sides */}
        {showPopper && (
          <>
            <PartyPopper side="left" isActive={showPopper} />
            <PartyPopper side="right" isActive={showPopper} />
          </>
        )}
        
        <div 
          style={{
            display: 'flex',
            alignItems: 'center',
            width: 'max-content',
            animation: len > 1 ? `scrollLeft 25s linear infinite` : 'none',
            animationPlayState: isPaused ? 'paused' : 'running',
          }}
        >
          {/* Duplicate the items for seamless infinite scroll */}
          {[...currentAchievements, ...currentAchievements, ...currentAchievements].map((ach, i) => (
            <div 
              key={`${ach.id}-${i}`} 
              style={{ 
                flexShrink: 0,
                padding: '0 12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <img 
                src={ach.image} 
                alt="Achievement"
                onError={(e) => handleImageError(e, ach)}
                style={{ 
                  maxWidth: '250px',
                  maxHeight: '300px',
                  width: 'auto',
                  height: 'auto',
                  objectFit: 'contain',
                  borderRadius: '8px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  border: '3px solid #fff',
                }} 
              />
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes scrollLeft {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-33.33%);
          }
        }
      `}</style>
    </div>
  )
}
