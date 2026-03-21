import { useEffect, useRef, useState } from 'react'
import { getCurrentUser, getProgress, setProgress, modules, getModulesAsync, getQuestionsForModuleAsync, getSavedAnswers, setSavedAnswers, clearSavedAnswers, getVideoAccess, activatePaidAccessBackend, getUsersBackendAsync, setProgressBackend, setSavedAnswersBackend, clearSavedAnswersBackend, verifyModuleAnswersBackend, getProgressBackend, signOut } from '../lib/premium'
import { Link, useNavigate } from 'react-router-dom'
import './PremiumCourse.css'

export default function PremiumCourse() {
  const nav = useNavigate()
  const user = getCurrentUser()
  const [prog, setProg] = useState(() => user ? getProgress(user.id) : { unlocked: 1, completed: [false, false, false, false] })
  const [modIdx, setModIdx] = useState(() => prog ? prog.unlocked - 1 : 0)
  const [courseModules, setCourseModules] = useState(modules)
  const [ended, setEnded] = useState(false)
  const [qs, setQs] = useState([])
  
  useEffect(() => {
    getModulesAsync().then(setCourseModules)
    if (user) {
      getProgressBackend(user.id).then(newProg => {
        setProg(newProg)
        // If current module is locked in new progress, reset to furthest unlocked
        if (modIdx >= newProg.unlocked) {
          setModIdx(newProg.unlocked - 1)
        }
      })
    }
  }, [])
  
  const [answers, setAnswers] = useState({})
  const vref = useRef(null)
  const lastTimeRef = useRef(0)
  const ytContainerRef = useRef(null)
  const ytPlayerRef = useRef(null)
  const ytTimerRef = useRef(null)
  const [dur, setDur] = useState(0)
  const [cur, setCur] = useState(0)
  const [pct, setPct] = useState(0)
  const [vErr, setVErr] = useState('')
  const [retakeMode, setRetakeMode] = useState(false)
  const [validated, setValidated] = useState(false)
  const [wrongIds, setWrongIds] = useState([])
  const [videoSrc, setVideoSrc] = useState('')
  const [videoFullyWatched, setVideoFullyWatched] = useState(false)
  const watchTimerRef = useRef(0)
  const [watchTimer, setWatchTimer] = useState(0)
  const REQUIRED_WATCH_TIME = 1200 // seconds
  function daysLeft(u) {
    if (!u?.videoAccess) return 0
    const now = Date.now()
    const paidUntil = u?.paidAccessUntil ? new Date(u.paidAccessUntil).getTime() : null
    if (paidUntil && paidUntil > now) return Math.ceil((paidUntil - now) / (24 * 60 * 60 * 1000))
    const approvedAt = u?.approvedAt ? new Date(u.approvedAt).getTime() : null
    if (approvedAt) {
      const end = approvedAt + 7 * 24 * 60 * 60 * 1000
      const diff = end - now
      return Math.max(0, Math.ceil(diff / (24 * 60 * 60 * 1000)))
    }
    return 0
  }
  function accessActive(u) {
    // If user is not approved, access is never active
    if (!u?.approved) return false
    
    // Rely primarily on backend videoAccess flag
    if (u && typeof u.videoAccess === 'boolean') return u.videoAccess
    
    // Fallback/Legacy time-based check
    const now = Date.now()
    const paidUntil = u?.paidAccessUntil ? new Date(u.paidAccessUntil).getTime() : null
    if (paidUntil && paidUntil > now) return true
    const approvedAt = u?.approvedAt ? new Date(u.approvedAt).getTime() : null
    if (approvedAt && (approvedAt + 7 * 24 * 60 * 60 * 1000) > now) return true
    return false
  }
  const WHATSAPP_LINK = "https://wa.me/918012202083?text=i%20am%20ready%20to%20pay%20Rs%20499%20/%205%20usdt%20please%20send%20me%20the%20QR%20or%20payment%20details."

  async function activatePaid() {
    window.open(WHATSAPP_LINK, '_blank')
  }

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

  const active = accessActive(user)

  async function submitQuiz(e) {
    e.preventDefault()
    const saved = user ? getSavedAnswers(user.id, courseModules[modIdx].id) : {}
    const finalAnswers = { ...saved, ...answers }
    
    // Check if module was already completed (before saving new answers)
    const wasCompleted = !!prog.completed[modIdx]
    
    const res = await verifyModuleAnswersBackend(courseModules[modIdx].id, finalAnswers)
    const wrong = (res && Array.isArray(res.wrong)) ? res.wrong : []
    
    setWrongIds(wrong)
    setValidated(true)
    
    // Strict requirement only on first attempt - after completion, no restriction needed
    if (!wasCompleted && wrong.length > 0) {
      alert(`❌ You have ${wrong.length} incorrect answer(s). Please review the highlighted questions and try again.`)
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
    
    const nextProg = { ...prog }
    nextProg.completed[modIdx] = true
    if (!wasCompleted) {
      const target = Math.max(nextProg.unlocked, modIdx + 2)
      nextProg.unlocked = Math.min(target, courseModules.length)
    }
    await setProgressBackend(user.id, nextProg)
    setProg(nextProg) // Update local state
    
    if (nextProg.unlocked - 1 > modIdx) {
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

  function getAccessDates(u) {
    const approvedAt = u?.approvedAt ? new Date(u.approvedAt).getTime() : null
    if (!approvedAt) return { start: '-', end: '-' }
    
    const formatDate = (ts) => {
      const d = new Date(ts)
      const day = String(d.getDate()).padStart(2, '0')
      const month = String(d.getMonth() + 1).padStart(2, '0')
      const year = d.getFullYear()
      return `${day}/${month}/${year}`
    }
    
    const start = formatDate(approvedAt)
    
    const paidUntil = u?.paidAccessUntil ? new Date(u.paidAccessUntil).getTime() : null
    let endTs = approvedAt + 7 * 24 * 60 * 60 * 1000
    if (paidUntil && paidUntil > endTs) endTs = paidUntil
    
    const end = formatDate(endTs)
    return { start, end }
  }

  return (
    <div className="app-main" style={{ textAlign: 'center' }}>
      <div className="course-header">
        <h1>Premium Trading Course</h1>
        {active && (
          <div className="access-info-container">
            <div className="access-active-badge">
              Access Active: {daysLeft(user)} days remaining
            </div>
            <div className="access-dates">
              <span>Approved: {getAccessDates(user).start}</span>
              <span style={{ margin: '0 8px' }}>|</span>
              <span>Expires: {getAccessDates(user).end}</span>
            </div>
          </div>
        )}
      </div>

      {!active ? (
        <div className="card expired-card">
          <div className="expired-title">
            🔒 Access Expired
          </div>
          <div className="expired-text">
            Your course access has expired. Renew your access to continue learning.
          </div>
          <button className="btn" onClick={activatePaid} style={{ marginTop: 10 }}>
            Renew Access (Rs: 499 / 5 USDT)
          </button>
        </div>
      ) : (
        <>
      <div className="module-nav">
        {courseModules.map((m, i) => {
          const isUnlocked = (i + 1) <= prog.unlocked
          const isCompleted = !!prog.completed[i]
          const status = isCompleted ? 'Completed' : (isUnlocked ? 'Unlocked' : 'Locked')
          const canOpen = isUnlocked || isCompleted
          return (
            <div
              key={m.id}
              className={`card module-nav-item ${i === modIdx ? 'active-module' : ''}`}
              style={{
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
                setWrongIds([])
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
        <div className="card video-section-card">
          <h2 style={{ marginTop: 0 }}>{currentModule.title}</h2>
          <div className="video-wrapper">
            {currentModule.src && /\.(mp4|webm|ogg|mov)$/i.test(String(currentModule.src)) ? (
              // Direct video file
              <video
                ref={vref}
                className="direct-video"
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
          <div className="video-controls-row">
            {(() => {
              const isCompleted = prog.completed[modIdx]
              const isDirectVideo = currentModule.src && /\.(mp4|webm|ogg|mov)$/i.test(String(currentModule.src))
              const timeRemaining = Math.max(0, REQUIRED_WATCH_TIME - watchTimer)
              const canStartQuiz = videoFullyWatched || isCompleted
              const progressPercent = isDirectVideo ? pct : Math.round((watchTimer / REQUIRED_WATCH_TIME) * 100)
              
              return (
                <>
                  {/* Progress Bar */}
                  {!isCompleted && !canStartQuiz && (
                    <div className="watch-progress-container">
                      <div className="watch-timer-text">
                        ⏱️ Watch video for {timeRemaining}s more
                      </div>
                      <div className="progress-bar-bg">
                        <div 
                          className="progress-bar-fill"
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                      <div className="progress-percent-text">
                        {progressPercent}% watched
                      </div>
                    </div>
                  )}
                </>
              )
            })()}
          </div>
          {!!vErr && <div className="video-error">{vErr}</div>}
        </div>
      )}

      {/* Quiz Buttons Outside the Video Section */}
      {(getVideoAccess(user.id) || !prog.completed[courseModules.length - 1]) && (
        <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, position: 'relative', zIndex: 10 }}>
          {(() => {
            const isCompleted = prog.completed[modIdx]
            const isDirectVideo = currentModule.src && /\.(mp4|webm|ogg|mov)$/i.test(String(currentModule.src))
            const timeRemaining = Math.max(0, REQUIRED_WATCH_TIME - watchTimer)
            const canStartQuiz = videoFullyWatched || isCompleted
            
            return (
              <>
                <button
                  className="btn main-quiz-btn"
                  disabled={!canStartQuiz}
                  onClick={() => {
                    setEnded(true)
                    setRetakeMode(true)
                    setValidated(false)
                    setWrongIds([])
                    setAnswers({})
                  }}
                  style={{
                    opacity: canStartQuiz ? 1 : 0.5,
                    cursor: canStartQuiz ? 'pointer' : 'not-allowed',
                  }}
                  title={canStartQuiz ? 'Start the quiz' : `Please watch for ${timeRemaining}s more`}
                >
                  {isCompleted ? '↺ Retake Quiz' : 'Start Lesson Quiz'}
                </button>
              </>
            )
          })()}
        </div>
      )}

      {(() => {
        try {
          const isCompleted = prog.completed[modIdx]
          const showQuiz = isCompleted ? true : ended
          if (!showQuiz) return null
          
          return (
            <div className="card quiz-section-card" style={{ marginTop: 20 }}>
              <form onSubmit={submitQuiz} className="quiz-form">
                <div className="quiz-header">📘 Trendex Training – Assessment (Set {currentModule.id})</div>
                <div><strong>Answer all 25 questions</strong></div>
                {(() => {
                  try {
                    const saved = user ? getSavedAnswers(user.id, currentModule.id) : {}
                    const reviewMode = prog.completed[modIdx] && !retakeMode
                    
                    if (!qs || qs.length === 0) {
                      return <div className="quiz-feedback-error">Error: No questions loaded. Please refresh the page.</div>
                    }
                    
                    return (
                      <>
                        {qs.map((q) => {
                          const userAnswer = reviewMode ? saved[q.id] : answers[q.id]
                          const isWrong = wrongIds.includes(q.id)
                          const showFeedback = validated && isWrong
                          return (
                          <div
                            key={q.id}
                            className="card quiz-item"
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                              <span><strong>Q{q.id}.</strong> {q.q || '(no question text)'}</span>
                            </div>
                            <div className="quiz-list">
                              {q.choices && q.choices.length > 0 ? (
                                q.choices.map((c) => {
                                  const isUserSelected = userAnswer === c.key
                                  const isWrongSelected = isUserSelected && isWrong
                                  let choiceStyle = {}
                                  if (showFeedback && isWrongSelected) {
                                    choiceStyle = { 
                                      backgroundColor: '#ff8b921a', 
                                      borderColor: '#ff8b92',
                                      borderWidth: 2
                                    }
                                  }
                                  return (
                                  <label key={c.key} className="quiz-choice" style={choiceStyle}>
                                    <input
                                      type="radio"
                                      name={`q_${q.id}`}
                                      value={c.key}
                                      checked={isUserSelected}
                                      onChange={() => {
                                        const next = { ...answers, [q.id]: c.key }
                                        setAnswers(next)
                                        setWrongIds(prev => prev.filter(id => id !== q.id))
                                        if (user) setSavedAnswers(user.id, currentModule.id, { ...saved, ...next })
                                      }}
                                      required
                                      disabled={reviewMode || (!ended && !retakeMode)}
                                    />
                                    <span>{c.key}) {c.text}</span>
                                    {showFeedback && isWrongSelected && <span style={{ marginLeft: 'auto', color: '#ff8b92' }}>✗ Wrong</span>}
                                  </label>
                                  )
                                })
                              ) : (
                                <div className="quiz-feedback-error">No choices available</div>
                              )}
                            </div>
                          </div>
                          )
                        })}

                        {(validated && wrongIds.length > 0) && (
                          <div className="quiz-feedback-error">❌ Some answers are incorrect. Review the highlighted choices (red = wrong answer).</div>
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
                              setWrongIds([])
                              setAnswers({})
                              if (user) clearSavedAnswers(user.id, currentModule.id)
                            }}
                          >
                            Retake Quiz
                          </button>
                        )}
                      </>
                    )
                  } catch (err) {
                    return <div className="quiz-feedback-error">Error rendering quiz: {err.message}</div>
                  }
                })()}
              </form>
            </div>
          )
        } catch (err) {
          return null
        }
      })()}
      {prog.completed[modules.length - 1] && (
        <div className="card course-completed-card">
          <h2 style={{ marginTop: 0 }}>Course Completed</h2>
          <Link className="btn" to="/premium/certificate">Get Certificate →</Link>
        </div>
      )}
      <p className="video-path-note">Please make an notes of this videos and Q & A,<br />Must needed Knowledge's to Learn more and Earn more,<br /> This section Free to access only for First 7 Days </p>
      <button 
        className="btn secondary" 
        onClick={() => { signOut(); nav('/premium/login') }}
        style={{ marginTop: 20, marginBottom: 40, padding: '10px 24px' }}
      >
        Logout
      </button>
        </>
      )}
    </div>
  )
}
