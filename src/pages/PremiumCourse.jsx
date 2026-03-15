import { useEffect, useRef, useState } from 'react'
import { getCurrentUser, getProgress, setProgress, modules, getModulesAsync, getQuestionsForModuleAsync, getSavedAnswers, setSavedAnswers, clearSavedAnswers, getVideoAccess, activatePaidAccessBackend, getUsersBackendAsync, setProgressBackend, setSavedAnswersBackend, clearSavedAnswersBackend, verifyModuleAnswersBackend } from '../lib/premium'
import { Link, useNavigate } from 'react-router-dom'
import './PremiumCourse.css'

export default function PremiumCourse() {
  const nav = useNavigate()
  const user = getCurrentUser()
  const initialProg = user ? getProgress(user.id) : null
  const [modIdx, setModIdx] = useState(() => initialProg ? initialProg.unlocked - 1 : 0)
  const [courseModules, setCourseModules] = useState(modules)
  const [ended, setEnded] = useState(false)
  const [qs, setQs] = useState([])
  const [answers, setAnswers] = useState({})
  const vref = useRef(null)
  const lastTimeRef = useRef(0)
  const [rate, setRate] = useState(1)
  const ytContainerRef = useRef(null)
  const ytPlayerRef = useRef(null)
  const ytTimerRef = useRef(null)
  const [dur, setDur] = useState(0)
  const [cur, setCur] = useState(0)
  const [pct, setPct] = useState(0)
  const [vErr, setVErr] = useState('')
  const [retakeMode, setRetakeMode] = useState(false)
  const [validated, setValidated] = useState(false)
  const [videoSrc, setVideoSrc] = useState('')
  const [videoFullyWatched, setVideoFullyWatched] = useState(false)
  const [watchTimer, setWatchTimer] = useState(0)
  const REQUIRED_WATCH_TIME = 30 // seconds
  function fmt(s) {
    const m = Math.floor(s / 60)
    const sec = Math.floor(s % 60)
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
  }
  function daysLeft(u) {
    const now = Date.now()
    const paidUntil = u?.paidAccessUntil || null
    if (paidUntil && paidUntil > now) return Math.ceil((paidUntil - now) / (24 * 60 * 60 * 1000))
    const approvedAt = u?.approvedAt || null
    if (approvedAt) {
      const end = approvedAt + 7 * 24 * 60 * 60 * 1000
      const diff = end - now
      return Math.ceil(diff / (24 * 60 * 60 * 1000))
    }
    return 0
  }
  function accessActive(u) {
    const now = Date.now()
    const paidUntil = u?.paidAccessUntil || null
    if (paidUntil && paidUntil > now) return true
    const approvedAt = u?.approvedAt || null
    if (approvedAt && (approvedAt + 7 * 24 * 60 * 60 * 1000) > now) return true
    return false
  }
  async function activatePaid() {
    if (!user?.id) return
    const updated = await activatePaidAccessBackend(user.id, 70)
    await getUsersBackendAsync()
    window.dispatchEvent(new Event('users-updated'))
  }

  useEffect(() => {
    getModulesAsync().then(setCourseModules)
  }, [])

  useEffect(() => {
    console.log('[PremiumCourse] User effect, user:', user)
    if (!user) {
      console.log('[PremiumCourse] No user, redirecting to login')
      nav('/premium/login')
    }
  }, [user, nav])
  useEffect(() => {
    let cancelled = false
    const m = courseModules[modIdx]
    if (!m) return
    async function load() {
      const data = await getQuestionsForModuleAsync(m.id)
      if (!cancelled) setQs(data)
    }
    load()
    return () => { cancelled = true }
  }, [modIdx, courseModules])
  
  const currentModule = courseModules[modIdx]
  
  useEffect(() => {
    if (!currentModule) return
    
    const isDirectVideo = currentModule.src && /\.(mp4|webm|ogg|mov)$/i.test(String(currentModule.src))
    
    if (isDirectVideo) {
      // Direct video file - track to 95%
      const videoElement = vref.current
      if (!videoElement) return
      
      const handleLoadedMetadata = () => {
        setDur(videoElement.duration)
      }
      
      const handleTimeUpdate = () => {
        const current = videoElement.currentTime
        const duration = videoElement.duration
        const percent = duration ? Math.round((current / duration) * 100) : 0
        
        setCur(current)
        setPct(percent)
        
        if (percent >= 95 && !videoFullyWatched) {
          setVideoFullyWatched(true)
        }
      }
      
      const handleVideoEnd = () => {
        setVideoFullyWatched(true)
      }
      
      videoElement.addEventListener('loadedmetadata', handleLoadedMetadata)
      videoElement.addEventListener('timeupdate', handleTimeUpdate)
      videoElement.addEventListener('ended', handleVideoEnd)
      
      return () => {
        videoElement.removeEventListener('loadedmetadata', handleLoadedMetadata)
        videoElement.removeEventListener('timeupdate', handleTimeUpdate)
        videoElement.removeEventListener('ended', handleVideoEnd)
      }
    } else {
      // Iframe - use timer-based approach
      let interval
      if (watchTimer < REQUIRED_WATCH_TIME) {
        interval = setInterval(() => {
          setWatchTimer(t => {
            const newTime = t + 1
            if (newTime >= REQUIRED_WATCH_TIME) {
              setVideoFullyWatched(true)
            }
            return newTime
          })
        }, 1000)
      }
      
      return () => clearInterval(interval)
    }
  }, [modIdx, currentModule, videoFullyWatched, watchTimer])
  
  // Reset timer when module changes
  useEffect(() => {
    setWatchTimer(0)
    setVideoFullyWatched(false)
  }, [modIdx])
  if (!user || !currentModule) return null

  const prog = getProgress(user.id)
  const unlockedIdx = prog.unlocked - 1
  const active = accessActive(user)

  async function submitQuiz(e) {
    e.preventDefault()
    const saved = user ? getSavedAnswers(user.id, courseModules[modIdx].id) : {}
    const finalAnswers = { ...saved, ...answers }
    const res = await verifyModuleAnswersBackend(courseModules[modIdx].id, finalAnswers)
    const wrongIds = (res && Array.isArray(res.wrong)) ? res.wrong : []
    setValidated(true)
    if (wrongIds.length > 0) {
      if (!retakeMode) {
        setEnded(false)
        const v = vref.current
        if (v) {
          v.currentTime = 0
          lastTimeRef.current = 0
          v.play().catch(() => {})
        }
        setCur(0); setDur(dur || 0); setPct(0)
      }
      return
    }
    await setSavedAnswersBackend(user.id, courseModules[modIdx].id, finalAnswers)
    const prog = getProgress(user.id)
    const wasCompleted = !!prog.completed[modIdx]
    prog.completed[modIdx] = true
    if (!wasCompleted) {
      const target = Math.max(prog.unlocked, modIdx + 2)
      prog.unlocked = Math.min(target, courseModules.length)
    }
    await setProgressBackend(user.id, prog)
    if (prog.unlocked - 1 > modIdx) {
      const nextIdx = modIdx + 1
      setModIdx(nextIdx)
      setEnded(false)
      setRetakeMode(false)
      setValidated(false)
      setAnswers({})
      lastTimeRef.current = 0
      setCur(0); setDur(0); setPct(0)
      const v = vref.current
      if (v) { v.pause(); v.currentTime = 0 }
      setVideoSrc('')
      setVErr('')
    } else {
      nav('/premium/certificate')
    }
  }

  return (
    <div className="app-main" style={{ textAlign: 'center' }}>
      <div style={{ marginBottom: 20 }}>
        <h1>Premium Trading Course</h1>
        <div style={{ color: active ? 'var(--brand-accent)' : '#ef4444', fontWeight: 'bold' }}>
          {active ? `Access Active: ${daysLeft(user)} days remaining` : 'Access Expired'}
        </div>
        {!active && (
          <button className="btn" onClick={activatePaid} style={{ marginTop: 10 }}>Renew Access (70 USDT)</button>
        )}
      </div>

      <div style={{ display: 'flex', gap: 12, overflowX: 'auto', padding: '10px 0', marginBottom: 20, justifyContent: 'center' }}>
        {courseModules.map((m, i) => {
          const isUnlocked = i === unlockedIdx
          const isCompleted = !!prog.completed[i]
          const status = isCompleted ? 'Completed' : (isUnlocked ? 'Unlocked' : 'Locked')
          const canOpen = isUnlocked || isCompleted
          return (
            <div
              key={m.id}
              className="card"
              style={{
                padding: 8,
                minWidth: 140,
                opacity: (canOpen && active) ? 1 : 0.5,
                cursor: (canOpen && active) ? 'pointer' : 'not-allowed',
                borderColor: i === modIdx ? 'color-mix(in srgb, var(--accent) 40%, transparent)' : undefined,
                boxShadow: i === modIdx ? '0 0 18px color-mix(in srgb, var(--accent) 36%, transparent)' : undefined,
              }}
              onClick={() => {
                if (!canOpen || !active || i === modIdx) return
                setModIdx(i)
                setEnded(false)
                setRetakeMode(false)
                setValidated(false)
                setAnswers({})
                lastTimeRef.current = 0
                setCur(0); setDur(0); setPct(0)
                const v = vref.current
                if (v) { v.pause(); v.currentTime = 0 }
                setVideoSrc('')
                setVErr('')
              }}
            >
              <div><strong>{m.title}</strong></div>
              <div>{status}</div>
            </div>
          )
        })}
      </div>
      {(getVideoAccess(user.id) || !prog.completed[courseModules.length - 1]) && (
        <div className="card" style={{ maxWidth: 820, margin: '0 auto' }}>
          <h2 style={{ marginTop: 0 }}>{currentModule.title}</h2>
          <div style={{ position: 'relative', width: '100%', paddingTop: '56.25%', borderRadius: 12, overflow: 'hidden', background: '#000' }}>
            {currentModule.src && /\.(mp4|webm|ogg|mov)$/i.test(String(currentModule.src)) ? (
              // Direct video file
              <video
                ref={vref}
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'contain' }}
                controls
                controlsList="nodownload"
              >
                <source src={currentModule.src} />
                Your browser does not support the video tag.
              </video>
            ) : (
              // Embedded iframe (Vimeo, YouTube, etc.)
              <iframe
                src={currentModule.src}
                className="premium-course-iframe"
                loading="lazy"
                allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
                allowFullScreen
              ></iframe>
            )}
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 8, flexDirection: 'column', gap: 12 }}>
            {(() => {
              const progress = getProgress(user.id)
              const isCompleted = progress.completed[modIdx]
              const isDirectVideo = currentModule.src && /\.(mp4|webm|ogg|mov)$/i.test(String(currentModule.src))
              const timeRemaining = Math.max(0, REQUIRED_WATCH_TIME - watchTimer)
              const canStartQuiz = videoFullyWatched || isCompleted
              const progressPercent = isDirectVideo ? pct : Math.round((watchTimer / REQUIRED_WATCH_TIME) * 100)
              
              return (
                <>
                  {/* Progress Bar */}
                  {!isCompleted && !canStartQuiz && (
                    <div style={{ maxWidth: 400, margin: '0 auto' }}>
                      <div style={{ fontSize: 13, marginBottom: 6, color: '#f97316', fontWeight: 500 }}>
                        ⏱️ Watch video for {timeRemaining}s more
                      </div>
                      <div style={{ 
                        width: '100%', 
                        height: 8, 
                        background: '#333', 
                        borderRadius: 4,
                        overflow: 'hidden'
                      }}>
                        <div style={{
                          height: '100%',
                          width: `${progressPercent}%`,
                          background: 'linear-gradient(90deg, #00ddeb, #0099cc)',
                          transition: 'width 0.3s ease'
                        }} />
                      </div>
                      <div style={{ fontSize: 12, marginTop: 6, opacity: 0.7 }}>
                        {progressPercent}% watched
                      </div>
                    </div>
                  )}
                  
                  {/* Main Button */}
                  <button
                    className="btn"
                    disabled={!canStartQuiz}
                    onClick={() => {
                      console.log('[Quiz] Starting quiz, ended:', true, 'retakeMode:', true)
                      setEnded(true)
                      setRetakeMode(true)
                      setValidated(false)
                      setAnswers({})
                    }}
                    style={{
                      opacity: canStartQuiz ? 1 : 0.5,
                      cursor: canStartQuiz ? 'pointer' : 'not-allowed',
                      maxWidth: 300
                    }}
                    title={canStartQuiz ? 'Start the quiz' : `Please watch for ${timeRemaining}s more`}
                  >
                    {isCompleted ? '↺ Retake Quiz' : 'Start Lesson Quiz'}
                  </button>
                  
                  {/* Mark as Watched Button */}
                  {!isCompleted && !isDirectVideo && !videoFullyWatched && watchTimer > 0 && (
                    <button
                      className="btn secondary"
                      onClick={() => setVideoFullyWatched(true)}
                      style={{ maxWidth: 300 }}
                    >
                      ✓ Mark as Watched
                    </button>
                  )}
                </>
              )
            })()}
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 8 }}>
            <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <span>Speed</span>
              <select value={rate} onChange={(e) => {
                const r = Number(e.target.value)
                setRate(r)
                if (currentModule.ytId && ytPlayerRef.current) ytPlayerRef.current.setPlaybackRate(r)
                else if (vref.current) vref.current.playbackRate = r
              }}>
                {[1, 1.25, 1.5, 1.75, 2].map((r) => <option key={r} value={r}>{r}×</option>)}
              </select>
            </label>
          </div>
          {!!vErr && <div style={{ textAlign: 'center', marginTop: 6, color: '#ff8b92' }}>{vErr}</div>}
          <div style={{ textAlign: 'center', marginTop: 6, opacity: 0.85 }}>
            <span>Played: {fmt(cur)} / {fmt(dur)} ({pct}%)</span>
          </div>
          {(() => {
            try {
              const isCompleted = getProgress(user.id).completed[modIdx]
              const showQuiz = isCompleted ? true : ended
              console.log('[Quiz Conditional] isCompleted:', isCompleted, 'ended:', ended, 'showQuiz:', showQuiz, 'qs.length:', qs.length)
              return showQuiz
            } catch (err) {
              console.error('[Quiz Conditional Error]', err)
              return false
            }
          })() && (
            <form onSubmit={submitQuiz} style={{ marginTop: 12, display: 'grid', gap: 8 }}>
              <div style={{ fontWeight: 800, fontSize: 18, textAlign: 'center' }}>📘 Trendex Training – Assessment (Set {currentModule.id})</div>
              <div><strong>Answer all 25 questions</strong></div>
              {(() => {
                try {
                  const saved = user ? getSavedAnswers(user.id, currentModule.id) : {}
                  const reviewMode = getProgress(user.id).completed[modIdx] && !retakeMode
                  const wrongIds = (reviewMode || !validated) ? [] : qs.filter((q) => (answers[q.id] || '') !== q.answer).map((q) => q.id)
                  console.log('[Quiz Render] qs:', qs.length, 'saved:', Object.keys(saved).length, 'reviewMode:', reviewMode)
                  console.log('[Quiz Debug] First question:', JSON.stringify(qs[0], null, 2))
                  
                  if (!qs || qs.length === 0) {
                    console.error('[Quiz Error] qs is empty or undefined')
                    return <div style={{ color: '#ff8b92' }}>Error: No questions loaded. Please refresh the page.</div>
                  }
                  
                  return (
                    <>
                      {qs.map((q) => {
                        console.log('[Question Item]', { id: q.id, q: q.q, choices: q.choices?.length })
                        return (
                        <div
                          key={q.id}
                          className={`card quiz-item ${wrongIds.includes(q.id) ? 'is-wrong' : ''}`}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span><strong>Q{q.id}.</strong> {q.q || '(no question text)'}</span>
                            {wrongIds.includes(q.id) && <span style={{ color: '#ff8b92' }}>Wrong</span>}
                          </div>
                          <div className="quiz-list" style={{ marginTop: 6 }}>
                            {q.choices && q.choices.length > 0 ? (
                              q.choices.map((c) => (
                                <label key={c.key} className="quiz-choice">
                                  <input
                                    type="radio"
                                    name={`q_${q.id}`}
                                    value={c.key}
                                    checked={(reviewMode ? saved[q.id] : answers[q.id]) === c.key}
                                    onChange={() => {
                                      const next = { ...answers, [q.id]: c.key }
                                      setAnswers(next)
                                      if (user) setSavedAnswers(user.id, currentModule.id, { ...saved, ...next })
                                    }}
                                    required
                                    disabled={reviewMode || (!ended && !retakeMode)}
                                  />
                                  <span>{c.key}) {c.text}</span>
                                </label>
                              ))
                            ) : (
                              <div style={{ color: '#ff8b92' }}>No choices available</div>
                            )}
                          </div>
                        </div>
                        )
                      })}

                      {(validated && !!qs.filter((q) => (answers[q.id] || '') !== q.answer).length) && (
                        <div style={{ textAlign: 'center', color: '#ff8b92' }}>Some answers are incorrect. Please review highlighted questions.</div>
                      )}
                      {!reviewMode ? (
                        <button className="btn" type="submit" disabled={!ended && !retakeMode}>Submit Answers</button>
                      ) : (
                        <button
                          className="btn secondary"
                          type="button"
                          onClick={() => {
                            setRetakeMode(true)
                            setEnded(false)
                            setValidated(false)
                            setAnswers({})
                            if (user) clearSavedAnswers(user.id, currentModule.id)
                            // Do not replay video; just clear answers and allow re-answering
                          }}
                        >
                          Retake Quiz
                        </button>
                      )}
                    </>
                  )
                } catch (err) {
                  console.error('[Quiz Render Error]', err)
                  return <div style={{ color: '#ff8b92' }}>Error rendering quiz: {err.message}</div>
                }
              })()}
            </form>
          )}
        </div>
      )}
      {prog.completed[modules.length - 1] && (
        <div className="card" style={{ maxWidth: 560, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ marginTop: 0 }}>Course Completed</h2>
          <Link className="btn" to="/premium/certificate">Get Certificate →</Link>
        </div>
      )}
      <p style={{ marginTop: 10, opacity: 0.7 }}>Place your videos at app/public/premiumVideo/premium1.mp4 to premium4.mp4.</p>
    </div>
  )
}
