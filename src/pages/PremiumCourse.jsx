import { useEffect, useRef, useState } from 'react'
import { getCurrentUser, getProgress, setProgress, modules, getQuestionsForModuleAsync, getSavedAnswers, setSavedAnswers, clearSavedAnswers, getVideoAccess, activatePaidAccessBackend, getUsersBackendAsync, setProgressBackend, setSavedAnswersBackend, clearSavedAnswersBackend, verifyModuleAnswersBackend } from '../lib/premium'
import { Link, useNavigate } from 'react-router-dom'

export default function PremiumCourse() {
  const nav = useNavigate()
  const user = getCurrentUser()
  const initialProg = user ? getProgress(user.id) : null
  const [modIdx, setModIdx] = useState(() => initialProg ? initialProg.unlocked - 1 : 0)
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
    if (!user) {
      nav('/premium/login')
    }
  }, [user, nav])
  useEffect(() => {
    let cancelled = false
    const m = modules[modIdx]
    async function load() {
      const data = await getQuestionsForModuleAsync(m.id)
      if (!cancelled) setQs(data)
    }
    load()
    return () => { cancelled = true }
  }, [modIdx])
  useEffect(() => {}, [modIdx, user])
  useEffect(() => {
    const m = modules[modIdx]
    if (!m?.ytId) return
    function createPlayer() {
      if (!ytContainerRef.current || !window.YT || !window.YT.Player) return
      ytPlayerRef.current = new window.YT.Player(ytContainerRef.current, {
        videoId: m.ytId,
        playerVars: { controls: 0, disablekb: 1, rel: 0, modestbranding: 1 },
        events: {
          onReady: () => {
            const d = ytPlayerRef.current?.getDuration?.() || 0
            setDur(d || 0)
          },
          onStateChange: (e) => {
            if (e.data === window.YT.PlayerState.PAUSED) {
              if (ytPlayerRef.current) ytPlayerRef.current.playVideo()
            }
            if (e.data === window.YT.PlayerState.PLAYING) {
              if (ytTimerRef.current) clearInterval(ytTimerRef.current)
              ytTimerRef.current = setInterval(() => {
                if (!ytPlayerRef.current) return
                const t = ytPlayerRef.current.getCurrentTime()
                if (t < lastTimeRef.current - 0.4) {
                  ytPlayerRef.current.seekTo(lastTimeRef.current, true)
                } else {
                  lastTimeRef.current = t
                }
                setCur(t)
                const d = ytPlayerRef.current?.getDuration?.() || 0
                if (d > 0) setPct(Math.min(100, Math.round((t / d) * 100)))
              }, 250)
            }
            if (e.data === window.YT.PlayerState.ENDED) {
              if (ytTimerRef.current) { clearInterval(ytTimerRef.current); ytTimerRef.current = null }
              setEnded(true)
              const d = ytPlayerRef.current?.getDuration?.() || 0
              setCur(d)
              setPct(100)
            }
          },
        },
      })
    }
    if (!window.YT || !window.YT.Player) {
      const s = document.createElement('script')
      s.src = 'https://www.youtube.com/iframe_api'
      s.async = true
      document.body.appendChild(s)
      const prev = window.onYouTubeIframeAPIReady
      window.onYouTubeIframeAPIReady = function () {
        if (typeof prev === 'function') prev()
        createPlayer()
      }
    } else {
      createPlayer()
    }
    return () => {
      if (ytTimerRef.current) { clearInterval(ytTimerRef.current); ytTimerRef.current = null }
      if (ytPlayerRef.current && ytPlayerRef.current.destroy) ytPlayerRef.current.destroy()
      ytPlayerRef.current = null
      lastTimeRef.current = 0
    }
  }, [modIdx])

  function onTimeUpdate() {
    const v = vref.current
    if (!v) return
    if (v.currentTime > lastTimeRef.current + 0.6 || v.currentTime < lastTimeRef.current - 0.5) {
      v.currentTime = lastTimeRef.current
    } else {
      lastTimeRef.current = v.currentTime
    }
    setCur(v.currentTime)
    const d = v.duration || dur || 0
    if (d > 0) {
      setDur(d)
      setPct(Math.min(100, Math.round((v.currentTime / d) * 100)))
    }
  }
  function onPause() {
    const v = vref.current
    if (v) v.play().catch(() => {})
  }
  function onSeeking() {
    const v = vref.current
    if (!v) return
    v.currentTime = lastTimeRef.current
  }
  function onEnded() {
    setEnded(true)
    const v = vref.current
    const d = v?.duration || dur || 0
    setCur(d)
    setPct(100)
  }
  async function submitQuiz(e) {
    e.preventDefault()
    const saved = user ? getSavedAnswers(user.id, modules[modIdx].id) : {}
    const finalAnswers = { ...saved, ...answers }
    const res = await verifyModuleAnswersBackend(modules[modIdx].id, finalAnswers)
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
    await setSavedAnswersBackend(user.id, modules[modIdx].id, finalAnswers)
    const prog = getProgress(user.id)
    const wasCompleted = !!prog.completed[modIdx]
    prog.completed[modIdx] = true
    if (!wasCompleted) {
      const target = Math.max(prog.unlocked, modIdx + 2)
      prog.unlocked = Math.min(target, modules.length)
    }
    await setProgressBackend(user.id, prog)
    if (prog.unlocked - 1 > modIdx) {
      const nextIdx = modIdx + 1
      setModIdx(nextIdx)
      setRetakeMode(false)
      setAnswers({})
      await clearSavedAnswersBackend(user.id, modules[nextIdx].id)
      setEnded(false)
      setValidated(false)
      setVideoSrc('')
      setVErr('')
      if (vref.current) { vref.current.currentTime = 0; lastTimeRef.current = 0 }
      setCur(0); setDur(0); setPct(0)
    }
  }
  if (!user) return null
  const prog = getProgress(user.id)
  const currentModule = modules[modIdx]
  const left = daysLeft(user)
  const active = accessActive(user)
  return (
    <div>
      <h1 style={{ color: '#00ddeb' }}>Premium Course</h1>
      <div className="card" style={{ maxWidth: 680, margin: '0 auto 12px', textAlign: 'center' }}>
        {active ? (
          <div>
            <div style={{ fontSize: 16, marginBottom: 6 }}>Access ends in</div>
            <div style={{ fontSize: 32, fontWeight: 800, color: '#00ddeb' }}>{Math.max(0, left)} days</div>
            {!user?.paidAccessUntil && <div style={{ opacity: .85, marginTop: 6 }}>Free trial in progress. Get 70 days full access for ₹499.</div>}
            {!user?.paidAccessUntil && <button className="btn" style={{ marginTop: 8 }} onClick={activatePaid}>Pay ₹499 for 70 days</button>}
          </div>
        ) : (
          <div>
            <div style={{ fontSize: 18, marginBottom: 6, color: '#ef4444' }}>Free trial ended</div>
            <div style={{ opacity: .85 }}>Purchase 70 days access for ₹499 to continue learning.</div>
            <button className="btn" style={{ marginTop: 8 }} onClick={activatePaid}>Pay ₹499 for 70 days</button>
          </div>
        )}
      </div>
      {!active && (
        <div style={{ textAlign: 'center', marginBottom: 12, color: '#ef4444' }}>
          Access is currently disabled until purchase is completed.
        </div>
      )}
      <div style={{ textAlign: 'center', marginBottom: 8, opacity: 0.9 }}>
        <span>Video Modules Access: </span>
        <strong style={{ color: getVideoAccess(user.id) ? '#22c55e' : '#f97316' }}>
          {getVideoAccess(user.id) ? 'Enabled' : 'Disabled'}
        </strong>
      </div>
      <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 10 }}>
        {modules.map((m, i) => {
          const unlockedIdx = prog.unlocked - 1
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
      {(getVideoAccess(user.id) || !prog.completed[modules.length - 1]) && (
        <div className="card" style={{ maxWidth: 820, margin: '0 auto' }}>
          <h2 style={{ marginTop: 0 }}>{currentModule.title}</h2>
          {currentModule.ytId ? (
            <div style={{ position: 'relative', width: '100%', paddingTop: '56.25%', borderRadius: 12, overflow: 'hidden' }}>
              <div ref={ytContainerRef} style={{ position: 'absolute', inset: 0 }} />
            </div>
          ) : (
            <video
              ref={vref}
              style={{ width: '100%', borderRadius: 12 }}
              src={videoSrc || currentModule.src}
              preload="auto"
              playsInline
              controls={false}
              onLoadedMetadata={() => {
                const v = vref.current
                if (v?.duration) setDur(v.duration)
                setVErr('')
              }}
              onTimeUpdate={onTimeUpdate}
              onPause={onPause}
              onSeeking={onSeeking}
              onEnded={onEnded}
              onCanPlay={() => setVErr('')}
              onStalled={() => setVErr('Network stalled; trying to resume...')}
              onError={() => {
                const m = modules[modIdx]
                if (m.altSrc && videoSrc !== m.altSrc) {
                  setVideoSrc(m.altSrc)
                  setVErr('')
                  const v = vref.current
                  if (v) v.play().catch(() => {})
                } else {
                  setVErr('Cannot load video. Please check your connection or source URL.')
                }
              }}
            />
          )}
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 8 }}>
            <button
              className="btn"
              onClick={() => {
                setEnded(false)
                setRetakeMode(true)
                setValidated(false)
                setAnswers({})
                lastTimeRef.current = 0
                setCur(0); setPct(0)
                setVErr('')
                if (currentModule.ytId && ytPlayerRef.current) ytPlayerRef.current.playVideo()
                else if (vref.current) {
                  const v = vref.current
                  v.pause()
                  v.currentTime = 0
                  v.load()
                  if (v && typeof v.playbackRate === 'number') v.playbackRate = rate
                  const p = v.play()
                  if (p && typeof p.catch === 'function') p.catch(() => {})
                }
              }}
            >
              Start Lesson
            </button>
            <button
              className="btn secondary"
              style={{ marginLeft: 8 }}
              onClick={() => {
                setEnded(false)
                setRetakeMode(true)
                setValidated(false)
                setAnswers({})
                lastTimeRef.current = 0
                setCur(0); setPct(0)
                if (currentModule.ytId && ytPlayerRef.current) {
                  ytPlayerRef.current.seekTo(0, true)
                  ytPlayerRef.current.playVideo()
                  if (typeof ytPlayerRef.current.setPlaybackRate === 'function') {
                    ytPlayerRef.current.setPlaybackRate(rate)
                  }
                } else if (vref.current) {
                  const v = vref.current
                  v.currentTime = 0
                  v.pause()
                  v.load()
                  if (v && typeof v.playbackRate === 'number') v.playbackRate = rate
                  const p = v.play()
                  if (p && typeof p.catch === 'function') p.catch(() => {})
                }
              }}
            >
              Replay
            </button>
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
            const isCompleted = getProgress(user.id).completed[modIdx]
            const showQuiz = isCompleted ? true : ended
            return showQuiz
          })() && (
            <form onSubmit={submitQuiz} style={{ marginTop: 12, display: 'grid', gap: 8 }}>
              <div style={{ fontWeight: 800, fontSize: 18, textAlign: 'center' }}>📘 Trendex Training – Assessment (Set {currentModule.id})</div>
              <div><strong>Answer all 25 questions</strong></div>
              {(() => {
                const saved = user ? getSavedAnswers(user.id, currentModule.id) : {}
                const reviewMode = getProgress(user.id).completed[modIdx] && !retakeMode
                const wrongIds = (reviewMode || !validated) ? [] : qs.filter((q) => (answers[q.id] || '') !== q.answer).map((q) => q.id)
                return (
                  <>
              {qs.map((q) => (
                <div
                  key={q.id}
                  className={`card quiz-item ${wrongIds.includes(q.id) ? 'is-wrong' : ''}`}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span><strong>Q{q.id}.</strong> {q.q}</span>
                    {wrongIds.includes(q.id) && <span style={{ color: '#ff8b92' }}>Wrong</span>}
                  </div>
                  <div className="quiz-list" style={{ marginTop: 6 }}>
                    {q.choices.map((c) => (
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
                    ))}
                  </div>
                </div>
              ))}
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
