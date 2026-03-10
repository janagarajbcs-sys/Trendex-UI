import { getUsers, isAdminLoggedIn, signOutAdmin, getProgress, modules, getVideoAccess, setVideoAccess, getJoinResponses, getComplaintResponses, getLeaders, saveLeaders, getBanners, saveBanners, getEvents, saveEvents, getUsersBackendAsync, approveUserBackend, disableUserBackend, denyUserBackend, addLeaderBackend, updateLeaderBackend, deleteLeaderBackend, moveLeaderBackend, addBannerBackend, updateBannerBackend, deleteBannerBackend, moveBannerBackend, setVideoAccessBackend, getLeadersAsync, getBannersAsync, getEventsAsync, addEventBackend, updateEventBackend, deleteEventBackend, moveEventBackend, clearEventsBackend, getJoinResponsesBackend, getComplaintResponsesBackend, getProgressBackend, syncTopSliderEventsBackend, importApiFolderBackend, getTopSliderImagesBackend, addTopSliderImageBackend, deleteTopSliderImageBackend } from '../lib/premium'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function PremiumAdmin() {
  const [users, setUsers] = useState(() => getUsers())
  const [leaders, setLeaders] = useState(() => getLeaders())
  const [editing, setEditing] = useState(null)
  const [banners, setBanners] = useState(() => getBanners())
  const [bForm, setBForm] = useState({ sno: '', img: '', title: '', subtitle: '', ctaText: '', ctaTo: '' })
  const [bEditing, setBEditing] = useState(null)
  const [form, setForm] = useState({ sno: '', name: '', title: '', loc: '', photo: '' })
  const [prevLeaders, setPrevLeaders] = useState(null)
  const [prevBanners, setPrevBanners] = useState(null)
  const [events, setEvents] = useState(() => getEvents())
  const [eForm, setEForm] = useState({ sno: '', img: '', date: '' })
  const [eEditing, setEEditing] = useState(null)
  const [joins, setJoins] = useState(() => getJoinResponses())
  const [complaints, setComplaints] = useState(() => getComplaintResponses())
  const [slides, setSlides] = useState([])
  const [slideFile, setSlideFile] = useState(null)
  const [slideUploading, setSlideUploading] = useState(false)
  const [pending, setPending] = useState(0)
  console.log(complaints,"complaints")
  const nav = useNavigate()
  function resolvePhoto(val) {
    if (!val) return ''
    const s = String(val)
    if (/^(data:|https?:|\/)/i.test(s)) return s
    return '/images/' + s.replace(/^\/+/, '')
  }
  function getLeaderPreview(val) {
    if (!val) return ''
    if (val instanceof File) {
      return URL.createObjectURL(val)
    }
    return resolvePhoto(val)
  }
  function track(promise) {
    setPending((n) => n + 1)
    return Promise.resolve(promise).finally(() => {
      setPending((n) => (n > 0 ? n - 1 : 0))
    })
  }
  const loading = pending > 0
  useEffect(() => {
    if (!isAdminLoggedIn()) {
      nav('/premium/admin-login')
      return
    }
    track(
      Promise.all([
        getUsersBackendAsync().then(() => setUsers(getUsers())),
        getLeadersAsync().then((list) => {
          saveLeaders(list)
          setLeaders(list)
        }),
        getBannersAsync().then((list) => {
          saveBanners(
            list.map((b) => ({
              id: b.id,
              sno: b.sno || 0,
              img: b.img,
              title: b.title,
              subtitle: b.subtitle,
              ctaText: (b.cta && b.cta.text) || '',
              ctaTo: (b.cta && b.cta.to) || '',
            })),
          )
          setBanners(getBanners())
        }),
        getEventsAsync().then((list) => {
          saveEvents(list)
          setEvents(list)
        }),
        getJoinResponsesBackend().then((list) => setJoins(list)),
        getComplaintResponsesBackend().then((list) => setComplaints(list)),
        getTopSliderImagesBackend().then((list) =>
          setSlides(Array.isArray(list) ? list : []),
        ),
      ]),
    )
  }, [nav])
  useEffect(() => {
    users.forEach((u) => {
      getProgressBackend(u.id).catch(() => {})
    })
  }, [users.length])
  const approved = users.filter((u) => u.approved)
  const pendingUser = users.filter((u) => !u.approved)
  function downloadExcel(filename, headers, rows) {
    const tableHead = `<tr>${headers.map((h) => `<th>${h}</th>`).join('')}</tr>`
    const tableRows = rows.map((r) => `<tr>${r.map((v) => `<td>${String(v ?? '').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</td>`).join('')}</tr>`).join('')
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8" /></head><body><table border="1">${tableHead}${tableRows}</table></body></html>`
    const blob = new Blob([html], { type: 'application/vnd.ms-excel' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename.endsWith('.xls') ? filename : `${filename}.xls`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }
  function approve(id) {
    track(approveUserBackend(id)).then(() => setUsers(getUsers()))
  }
  function deny(id) {
    track(denyUserBackend(id)).then(() => setUsers(getUsers()))
  }
  function disable(id) {
    track(disableUserBackend(id)).then(() => setUsers(getUsers()))
  }
  function toggleVideos(id) {
    const enabled = getVideoAccess(id)
    setVideoAccess(id, !enabled)
    track(setVideoAccessBackend(id, !enabled)).then(() => {
      setUsers(getUsers())
    })
  }
  function resetForm() {
    setEditing(null)
    setForm({ sno: '', name: '', title: '', loc: '', photo: '' })
  }
  function undoLeaders() {
    if (!prevLeaders) return
    saveLeaders(prevLeaders)
    setLeaders(getLeaders())
    setPrevLeaders(null)
  }
  function resetBForm() {
    setBEditing(null)
    setBForm({ sno: '', img: '', title: '', subtitle: '', ctaText: '', ctaTo: '' })
  }
  function submitLeader(e) {
    e.preventDefault()
    if (editing) {
      setPrevLeaders(getLeaders())
      track(
        updateLeaderBackend(editing, {
          name: form.name,
          title: form.title,
          loc: form.loc,
          photo: form.photo,
        }),
      ).then(() => {
        setLeaders(getLeaders())
        resetForm()
      })
      return
    }
    const fd = new FormData()
    fd.append('name', form.name)
    fd.append('title', form.title)
    fd.append('loc', form.loc)
    if (form.photo instanceof File) {
      fd.append('photo', form.photo)
    }
    track(addLeaderBackend(fd)).then(() => {
      track(
        getLeadersAsync().then((list) => {
          saveLeaders(list)
          setLeaders(list)
        }),
      )
    })
    resetForm()
  }
  function submitBanner(e) {
    e.preventDefault()
    if (bEditing) {
      setPrevBanners(getBanners())
      track(updateBannerBackend(bEditing, bForm)).then(() =>
        setBanners(getBanners()),
      )
      resetBForm()
    } else {
      setPrevBanners(getBanners())
      track(addBannerBackend(bForm)).then(() => setBanners(getBanners()))
      resetBForm()
    }
  }
  function undoBanners() {
    if (!prevBanners) return
    saveBanners(prevBanners)
    setBanners(getBanners())
    setPrevBanners(null)
  }
    function editLeader(id) {
    const l = leaders.find((x) => x.id === id)
    if (!l) return

    setEditing(id)

    setForm({
      sno: String(l.sno),
      name: l.name,
      title: l.title,
      loc: l.loc,
      photo: l.photo
    })
  }

  // function editBanner(id) {
  //   const b = banners.find((x) => x.id === id)
  //   if (!b) return
  //   setBEditing(id)
  //   setBForm({ sno: String(b.sno), img: b.img, title: b.title, subtitle: b.subtitle, ctaText: b.ctaText, ctaTo: b.ctaTo })
  // }
  function removeBanner(id) {
    setPrevBanners(getBanners())
    track(deleteBannerBackend(id)).then(() => setBanners(getBanners()))
    if (bEditing === id) resetBForm()
  }
  function moveBannerRow(id, dir) {
    setPrevBanners(getBanners())
    track(moveBannerBackend(id, dir)).then(() => setBanners(getBanners()))
  }
  function onPhotoFile(e) {
    const file = e.target.files && e.target.files[0]
    if (!file) return
    setForm({
      ...form,
      photo: file,
    })
  }
  function editLeader(id) {
    const l = leaders.find((x) => x.id === id)
    if (!l) return
    setEditing(id)
    setForm({ sno: String(l.sno), name: l.name, title: l.title, loc: l.loc, photo: l.photo })
  }
  function removeLeader(id) {
    setPrevLeaders(getLeaders())
    deleteLeaderBackend(id).then(() => setLeaders(getLeaders()))
    if (editing === id) resetForm()
  }
  function move(id, dir) {
    setPrevLeaders(getLeaders())
    moveLeaderBackend(id, dir).then(() => setLeaders(getLeaders()))
  }
  function onSlideFile(e) {
    const file = e.target.files && e.target.files[0]
    if (!file) return
    setSlideFile(file)
  }
  function resetSlideForm() {
    setSlideFile(null)
  }
  function uploadSlide(e) {
    e.preventDefault()
    if (!slideFile) return
    setSlideUploading(true)
    track(addTopSliderImageBackend(slideFile))
      .then((list) => setSlides(Array.isArray(list) ? list : []))
      .finally(() => {
        setSlideUploading(false)
        resetSlideForm()
        if (e.target && e.target.reset) e.target.reset()
      })
  }
  function removeSlide(name) {
    track(deleteTopSliderImageBackend(name)).then((list) =>
      setSlides(Array.isArray(list) ? list : []),
    )
  }
  const stats = (() => {
    const counts = Array.from({ length: modules.length }, () => 0)
    let completed = 0
    users.forEach((u) => {
      const prog = getProgress(u.id)
      if (prog.completed[modules.length - 1]) completed++
      else {
        const st = Math.max(1, Math.min(modules.length, prog.unlocked))
        counts[st - 1]++
      }
    })
    const total = users.length
    const max = Math.max(completed, ...counts, 1)
    return { counts, completed, total, max }
  })()
  function updateAll() {
    try {
      saveLeaders(getLeaders())
      saveBanners(getBanners())
      saveEvents(getEvents())
      setLeaders(getLeaders())
      setBanners(getBanners())
      setEvents(getEvents())
    } catch { /* noop */ }
  }
  return (
    <div>
      <h1 style={{ color: '#00ddeb' }}>Premium Admin</h1>
      {loading && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15,23,42,0.65)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 40,
          }}
        >
          <div
            style={{
              padding: '12px 18px',
              borderRadius: 9999,
              background: '#020617',
              border: '1px solid rgba(148,163,184,.4)',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              boxShadow: '0 18px 40px rgba(15,23,42,.7)',
            }}
          >
            <div
              style={{
                width: 14,
                height: 14,
                borderRadius: '999px',
                border: '2px solid #38bdf8',
                borderTopColor: 'transparent',
              }}
            />
            <span style={{ fontSize: '.85rem', color: '#e5e7eb' }}>
              Loading...
            </span>
          </div>
        </div>
      )}
      <div style={{ textAlign: 'center', marginBottom: 10, display: 'flex', gap: 8, justifyContent: 'center' }}>
          {/* <button className="btn" onClick={updateAll} style={{ padding: '6px 12px', fontSize: '.85rem', transition: 'transform .15s ease, background-color .15s ease' }}>Update All</button> */}
          {/* <button className="btn" onClick={() => { importApiFolderBackend().then(() => { setLeaders(getLeaders()); setEvents(getEvents()) }) }} style={{ padding: '6px 12px', fontSize: '.85rem', background: '#0ea5e9', color: '#fff', transition: 'transform .15s ease, background-color .15s ease' }}>Import API Folder</button> */}
          {/* <button className="btn secondary" onClick={() => { signOutAdmin(); nav('/premium/admin-login') }} style={{ padding: '6px 12px', fontSize: '.85rem', transition: 'transform .15s ease, background-color .15s ease' }}>Sign out</button> */}
      </div>
      <div className="card" style={{ marginTop: 12 }}>
        <h2 style={{ marginTop: 0, textAlign: 'center' }}>Homepage Top Slider — Images</h2>
        <form
          onSubmit={uploadSlide}
          style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 10, alignItems: 'end', marginBottom: 12 }}
        >
          <div>
            <label>Slide Image</label>
            <input type="file" accept="image/*" onChange={onSlideFile} />
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button
              className="btn"
              type="submit"
              disabled={!slideFile || slideUploading}
              style={{ padding: '6px 12px', fontSize: '.85rem', transition: 'transform .15s ease, background-color .15s ease' }}
            >
              {slideUploading ? 'Uploading...' : 'Upload Slide'}
            </button>
            {slideFile ? (
              <button
                type="button"
                className="btn secondary"
                onClick={resetSlideForm}
                style={{ padding: '6px 12px', fontSize: '.85rem', transition: 'transform .15s ease, background-color .15s ease' }}
              >
                Clear
              </button>
            ) : null}
          </div>
        </form>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: 12 }}>
          {slides.map((s) => (
            <div key={s.key || s.name} style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 8, background: '#020617' }}>
              <div style={{ width: '100%', paddingBottom: '56%', position: 'relative', marginBottom: 6 }}>
                <img
                  src={s.img}
                  alt={s.name}
                  style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', borderRadius: 6 }}
                />
              </div>
              <div style={{ fontSize: '.8rem', opacity: 0.85, marginBottom: 6 }}>
                <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.name}</div>
              </div>
              <button
                className="btn secondary"
                type="button"
                onClick={() => removeSlide(s.name)}
                style={{ width: '100%', padding: '4px 10px', fontSize: '.8rem', background: '#ef4444', color: '#fff', transition: 'transform .15s ease, background-color .15s ease' }}
              >
                Delete
              </button>
            </div>
          ))}
          {slides.length === 0 ? (
            <div style={{ fontSize: '.85rem', opacity: 0.7 }}>No slider images yet. Upload one to get started.</div>
          ) : null}
        </div>
      </div>
      {/* <div className="card" style={{ marginTop: 12 }}>
        <h2 style={{ marginTop: 0, textAlign: 'center' }}>Meetings & Trips — Photos</h2>
        <div style={{ textAlign: 'right', marginBottom: 8, display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button className="btn" onClick={() => { syncTopSliderEventsBackend().then((list) => setEvents(list)) }} style={{ background: '#15803D', color: '#fff', padding: '6px 12px', fontSize: '.85rem', transition: 'transform .15s ease, background-color .15s ease' }}>
            Import TopSlider Photos
          </button>
          <button className="btn secondary" onClick={() => { clearEventsBackend().then((list) => setEvents(list)); setEForm({ sno: '', img: '', date: '' }); setEEditing(null) }} style={{ background: '#ef4444', color: '#fff', padding: '6px 12px', fontSize: '.85rem', transition: 'transform .15s ease, background-color .15s ease' }}>
            Clear All Events
          </button>
        </div>
        <form onSubmit={(e) => {
          e.preventDefault()
          if (eEditing) {
            updateEventBackend(eEditing, eForm).then((list) => setEvents(list))
            setEForm({ sno: '', img: '', date: '' })
            setEEditing(null)
          } else {
            addEventBackend(eForm).then((list) => setEvents(list))
            setEForm({ sno: '', img: '', date: '' })
          }
        }} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 8, alignItems: 'end', marginBottom: 12 }}>
          <div>
            <label>S.No</label>
            <input value={eForm.sno} onChange={(e) => setEForm({ ...eForm, sno: e.target.value })} placeholder="1" />
          </div>
          <div>
            <label>Image URL</label>
            <input value={eForm.img} onChange={(e) => setEForm({ ...eForm, img: e.target.value })} placeholder="/images/event.jpg" />
            <div style={{ fontSize: '12px', color: '#6B7280', marginTop: 4 }}>
              Any size works; image will be center-cropped to fit.
            </div>
          </div>
          <div>
            <label>Date</label>
            <input type="date" value={eForm.date} onChange={(e) => setEForm({ ...eForm, date: e.target.value })} />
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button className="btn" type="submit" style={{ padding: '6px 12px', fontSize: '.85rem', transition: 'transform .15s ease, background-color .15s ease' }}>{eEditing ? 'Update Event' : 'Add Event'}</button>
            {eEditing ? <button className="btn secondary" type="button" onClick={() => { setEForm({ sno: '', img: '', date: '' }); setEEditing(null) }} style={{ padding: '6px 12px', fontSize: '.85rem', transition: 'transform .15s ease, background-color .15s ease' }}>Cancel</button> : null}
          </div>
        </form>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th>S.No</th>
                <th>Image</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {events.map((ev) => (
                <tr key={ev.id}>
                  <td>{ev.sno}</td>
                  <td>{ev.img ? <img src={ev.img} alt={ev.date} style={{ width: 90, height: 54, objectFit: 'cover', borderRadius: 6 }} /> : '-'}</td>
                  <td>{ev.date || '-'}</td>
                  <td style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
                    <button className="btn" type="button" onClick={() => { moveEventBackend(ev.id, 'up').then((list) => setEvents(list)) }} style={{ padding: '4px 10px', fontSize: '.8rem', transition: 'transform .15s ease, background-color .15s ease' }}>Up</button>
                    <button className="btn" type="button" onClick={() => { moveEventBackend(ev.id, 'down').then((list) => setEvents(list)) }} style={{ padding: '4px 10px', fontSize: '.8rem', transition: 'transform .15s ease, background-color .15s ease' }}>Down</button>
                    <button className="btn" type="button" onClick={() => { setEEditing(ev.id); setEForm({ sno: String(ev.sno), img: ev.img, date: ev.date }) }} style={{ padding: '4px 10px', fontSize: '.8rem', transition: 'transform .15s ease, background-color .15s ease' }}>Edit</button>
                    <button className="btn secondary" type="button" onClick={() => { deleteEventBackend(ev.id).then((list) => setEvents(list)) }} style={{ background: '#ef4444', color: '#fff', padding: '4px 10px', fontSize: '.8rem', transition: 'transform .15s ease, background-color .15s ease' }}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div> */}
      {/* <div className="card" style={{ marginTop: 12 }}>
        <h2 style={{ marginTop: 0, textAlign: 'center' }}>Homepage Slider — Manage Banners</h2>
        <div style={{ textAlign: 'right', marginBottom: 8, display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button className="btn" onClick={undoBanners} disabled={!prevBanners} style={{ padding: '6px 12px', fontSize: '.85rem', transition: 'transform .15s ease, background-color .15s ease' }}>Undo last change</button>
          <button className="btn secondary" onClick={() => { saveBanners([]); setBanners(getBanners()); resetBForm() }} style={{ background: '#ef4444', color: '#fff', padding: '6px 12px', fontSize: '.85rem', transition: 'transform .15s ease, background-color .15s ease' }}>
            Clear All Banners
          </button>
        </div>
        <form onSubmit={submitBanner} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 10, alignItems: 'end', marginBottom: 14 }}>
          <div>
            <label>S.No</label>
            <input value={bForm.sno} onChange={(e) => setBForm({ ...bForm, sno: e.target.value })} placeholder="1" />
          </div>
          <div>
            <label>Title</label>
            <input value={bForm.title} onChange={(e) => setBForm({ ...bForm, title: e.target.value })} placeholder="Headline" />
          </div>
          <div>
            <label>Subtitle</label>
            <input value={bForm.subtitle} onChange={(e) => setBForm({ ...bForm, subtitle: e.target.value })} placeholder="Sub text" />
          </div>
          <div>
            <label>CTA Text</label>
            <input value={bForm.ctaText} onChange={(e) => setBForm({ ...bForm, ctaText: e.target.value })} placeholder="Explore" />
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button className="btn" type="submit" style={{ padding: '6px 12px', fontSize: '.85rem', transition: 'transform .15s ease, background-color .15s ease' }}>{bEditing ? 'Update Banner' : 'Add Banner'}</button>
            {bEditing ? <button className="btn secondary" type="button" onClick={resetBForm} style={{ padding: '6px 12px', fontSize: '.85rem', transition: 'transform .15s ease, background-color .15s ease' }}>Cancel</button> : null}
          </div>
        </form>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th>S.No</th>
                <th>Title</th>
                <th>Subtitle</th>
                <th>CTA</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {banners.map((b) => (
                <tr key={b.id}>
                  <td>{b.sno}</td>
                  <td style={{ maxWidth: 220, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{b.title}</td>
                  <td style={{ maxWidth: 260, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{b.subtitle}</td>
                  <td>{b.ctaText || '-'}</td>
                  <td style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
                    <button className="btn" type="button" onClick={() => moveBannerRow(b.id, 'up')} style={{ padding: '4px 10px', fontSize: '.8rem', transition: 'transform .15s ease, background-color .15s ease' }}>Up</button>
                    <button className="btn" type="button" onClick={() => moveBannerRow(b.id, 'down')} style={{ padding: '4px 10px', fontSize: '.8rem', transition: 'transform .15s ease, background-color .15s ease' }}>Down</button>
                    <button className="btn" type="button" onClick={() => editBanner(b.id)} style={{ padding: '4px 10px', fontSize: '.8rem', transition: 'transform .15s ease, background-color .15s ease' }}>Edit</button>
                    <button className="btn secondary" type="button" onClick={() => removeBanner(b.id)} style={{ background: '#ef4444', color: '#fff', padding: '4px 10px', fontSize: '.8rem', transition: 'transform .15s ease, background-color .15s ease' }}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div> */}
      <div className="card" style={{ overflowX: 'auto', marginBottom: 12 }}>
        <h2 style={{ marginTop: 0, textAlign: 'center' }}>Pending Users ({pendingUser.length})</h2>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '.9rem' }}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Phone</th>
              <th>Email</th>
              <th>Team</th>
              <th>Leader</th>
              <th>Stage</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {pendingUser.map((u) => (
              <tr key={u.id}>
                <td>{u.name}</td>
                <td>{u.phone}</td>
                <td>{u.email}</td>
                <td>{u.team}</td>
                <td>{u.leader}</td>
                <td>
                  {(() => {
                    const prog = getProgress(u.id)
                    return prog.completed[modules.length - 1] ? 'Completed' : `Video ${prog.unlocked}`
                  })()}
                </td>
                <td style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
                  <button
                    className="btn"
                    style={{ background: '#22c55e', color: '#0b1220', padding: '4px 10px', fontSize: '.8rem', transition: 'transform .15s ease, background-color .15s ease' }}
                    onClick={() => approve(u.id)}
                  >
                    Approve
                  </button>
                  <button
                    className="btn secondary"
                    style={{ background: '#ef4444', color: '#ffffff', padding: '4px 10px', fontSize: '.8rem', transition: 'transform .15s ease, background-color .15s ease' }}
                    onClick={() => deny(u.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="card" style={{ marginTop: 12, padding: 16 }}>
        <h2
          style={{
            marginTop: 0,
            textAlign: 'center',
            fontSize: '1.25rem',
            fontWeight: 600,
            letterSpacing: '.02em',
          }}
        >
          Top Team Leaders — Manage Board
        </h2>
        <div style={{ textAlign: 'right', marginBottom: 8, display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button className="btn" onClick={undoLeaders} disabled={!prevLeaders} style={{ padding: '6px 12px', fontSize: '.85rem', transition: 'transform .15s ease, background-color .15s ease' }}>Undo last change</button>
          <button className="btn secondary" onClick={() => { saveLeaders([]); setLeaders(getLeaders()); resetForm() }} style={{ background: '#ef4444', color: '#fff', padding: '6px 12px', fontSize: '.85rem', transition: 'transform .15s ease, background-color .15s ease' }}>
            Clear All Leaders
          </button>
        </div>
        <form
          onSubmit={submitLeader}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))',
            gap: 12,
            alignItems: 'flex-end',
            marginBottom: 16,
          }}
        >
          <div>
            <label
              style={{
                display: 'block',
                fontSize: '.8rem',
                fontWeight: 500,
                color: '#64748b',
                marginBottom: 4,
              }}
            >
              Photo
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={onPhotoFile}
              style={{ marginTop: 2, fontSize: '.85rem' }}
            />
            {form.photo ? (
              <div
                style={{
                  width: 96,
                  height: 120,
                  padding: 3,
                  background: '#020617',
                  border: '1px solid #1f2937',
                  borderRadius: 10,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginTop: 10,
                  boxShadow: '0 16px 40px rgba(15,23,42,.75)',
                }}
              >
                <img
                  src={getLeaderPreview(form.photo)}
                  alt="preview"
                  style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 6 }}
                />
              </div>
            ) : null}
            {form.photo ? (
              <button
                type="button"
                className="btn secondary"
                onClick={() => setForm({ ...form, photo: '' })}
                style={{ marginTop: 8, fontSize: '.8rem' }}
              >
                Clear
              </button>
            ) : null}
          </div>
          <div>
            <label
              style={{
                display: 'block',
                fontSize: '.8rem',
                fontWeight: 500,
                color: '#64748b',
                marginBottom: 4,
              }}
            >
              Name
            </label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Leader name"
              style={{
                width: '100%',
                padding: '7px 10px',
                borderRadius: 6,
                border: '1px solid #e5e7eb',
                fontSize: '.9rem',
              }}
            />
          </div>
          <div>
            <label
              style={{
                display: 'block',
                fontSize: '.8rem',
                fontWeight: 500,
                color: '#64748b',
                marginBottom: 4,
              }}
            >
              Rank Name
            </label>
            <input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Prime Trader"
              style={{
                width: '100%',
                padding: '7px 10px',
                borderRadius: 6,
                border: '1px solid #e5e7eb',
                fontSize: '.9rem',
              }}
            />
          </div>
          <div>
            <label
              style={{
                display: 'block',
                fontSize: '.8rem',
                fontWeight: 500,
                color: '#64748b',
                marginBottom: 4,
              }}
            >
              Location
            </label>
            <input
              value={form.loc}
              onChange={(e) => setForm({ ...form, loc: e.target.value })}
              placeholder="City"
              style={{
                width: '100%',
                padding: '7px 10px',
                borderRadius: 6,
                border: '1px solid #e5e7eb',
                fontSize: '.9rem',
              }}
            />
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button className="btn" type="submit" style={{ padding: '6px 12px', fontSize: '.85rem', transition: 'transform .15s ease, background-color .15s ease' }}>
              {editing ? 'Update Leader' : 'Add Leader'}
            </button>
            {editing ? (
              <button
                className="btn secondary"
                type="button"
                onClick={resetForm}
                style={{ padding: '6px 12px', fontSize: '.85rem', transition: 'transform .15s ease, background-color .15s ease' }}
              >
                Cancel
              </button>
            ) : null}
          </div>
        </form>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '.9rem' }}>
            <thead>
              <tr>
                <th>S.No</th>
                <th>Photo</th>
                <th>Name</th>
                <th>Rank Name</th>
                <th>Location</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {leaders.map((l) => (
                <tr key={l.id}>
                  <td>{l.sno}</td>
                  <td>
                    {l.photo ? (
                      <div style={{ width: 42, height: 56, padding: 2, background: '#fff', border: '2px solid #ffffff', borderRadius: 6, display: 'inline-block' }}>
                        <img src={resolvePhoto(l.photo)} alt={l.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 4 }} />
                      </div>
                    ) : '-'}
                  </td>
                  <td style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 220 }}>{l.name}</td>
                  <td>{l.title}</td>
                  <td>{l.loc}</td>
                  <td style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
                    <button className="btn" type="button" onClick={() => move(l.id, 'up')}>Up</button>
                    <button className="btn" type="button" onClick={() => move(l.id, 'down')}>Down</button>
                    <button className="btn" type="button" onClick={() => editLeader(l.id)}>Edit</button>
                    <button className="btn secondary" type="button" onClick={() => removeLeader(l.id)} style={{ background: '#ef4444', color: '#fff' }}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="card" style={{ overflowX: 'auto' }}>
        <h2 style={{ marginTop: 0, textAlign: 'center' }}>Approved Users ({approved.length})</h2>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Phone</th>
              <th>Email</th>
              <th>Team</th>
              <th>Leader</th>
              <th>Stage</th>
              <th>Videos</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {approved.map((u) => (
              <tr key={u.id}>
                <td>{u.name}</td>
                <td>{u.phone}</td>
                <td>{u.email}</td>
                <td>{u.team}</td>
                <td>{u.leader}</td>
                <td>
                  {(() => {
                    const prog = getProgress(u.id)
                    return prog.completed[modules.length - 1] ? 'Completed' : `Video ${prog.unlocked}`
                  })()}
                </td>
                <td>{getVideoAccess(u.id) ? 'On' : 'Off'}</td>
                <td style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
                  <button className="btn" onClick={() => disable(u.id)}>Disable</button>
                  <button className="btn" onClick={() => toggleVideos(u.id)}>{getVideoAccess(u.id) ? 'Disable Videos' : 'Enable Videos'}</button>
                  <button
                    className="btn secondary"
                    style={{ background: '#ef4444', color: '#ffffff' }}
                    onClick={() => deny(u.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="card" style={{ marginTop: 12 }}>
        <h2 style={{ marginTop: 0, textAlign: 'center' }}>Stage Distribution</h2>
        <div style={{ display: 'flex', alignItems: 'end', justifyContent: 'center', gap: 8, height: 180, padding: '12px 0' }}>
          {stats.counts.map((c, i) => (
            <div
              key={i}
              title={`Video ${i + 1}: ${c}`}
              style={{
                width: 36,
                height: `${Math.max(2, Math.round((c / stats.max) * 150))}px`,
                background: 'color-mix(in srgb, var(--accent) 30%, transparent)',
                borderRadius: 6,
              }}
            />
          ))}
          <div
            title={`Completed: ${stats.completed}`}
            style={{
              width: 36,
              height: `${Math.max(2, Math.round((stats.completed / stats.max) * 150))}px`,
              background: '#22c55e',
              borderRadius: 6,
            }}
          />
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, fontSize: 12, opacity: 0.85 }}>
          {modules.map((_, i) => <span key={i}>V{i + 1}</span>)}
          <span>Done</span>
        </div>
        <div style={{ textAlign: 'center', marginTop: 6, opacity: 0.85 }}>
          <span>Total Users: {stats.total}</span>
        </div>
      </div>
      <div className="card" style={{ marginTop: 12, overflowX: 'auto' }}>
        <h2 style={{ marginTop: 0, textAlign: 'center' }}>Join/Subscribe Responses ({joins.length})</h2>
        <div style={{ textAlign: 'right', marginBottom: 8 }}>
          <button
            className="btn"
            onClick={() => {
              const headers = ['Name', 'Mobile', 'Gmail', 'Place', 'Sponsor', 'Source', 'Time']
              const rows = joins.map((r) => [r.name, r.mobile, r.gmail, r.place, r.sponsor, r.source, new Date(r.ts).toLocaleString()])
              downloadExcel('join_responses', headers, rows)
            }}
          >
            Export Excel
          </button>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Mobile</th>
              <th>Gmail</th>
              <th>Place</th>
              <th>Sponsor</th>
              <th>Source</th>
              <th>Time</th>
            </tr>
          </thead>
          <tbody>
            {joins.map((r, i) => (
              <tr key={i}>
                <td>{r.name}</td>
                <td>{r.mobile}</td>
                <td>{r.gmail}</td>
                <td>{r.place}</td>
                <td>{r.sponsor}</td>
                <td>{r.source}</td>
                <td>{new Date(r.ts).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="card" style={{ marginTop: 12, overflowX: 'auto' }}>
        <h2 style={{ marginTop: 0, textAlign: 'center' }}>Complaint/Suggestion Responses ({complaints.length})</h2>
        <div style={{ textAlign: 'right', marginBottom: 8 }}>
          <button
            className="btn"
            onClick={() => {
              const headers = ['Type', 'Name', 'Contact', 'Message', 'Time']
              const rows = complaints.map((r) => [r.type, r.name, r.contact, r.message, new Date(r.ts).toLocaleString()])
              downloadExcel('complaint_responses', headers, rows)
            }}
          >
            Export Excel
          </button>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th>Type</th>
              <th>Name</th>
              <th>Contact</th>
              <th>Message</th>
              <th>Time</th>
            </tr>
          </thead>
          <tbody>
            {complaints.map((r, i) => (
              <tr key={i}>
                <td>{r.type}</td>
                <td>{r.name}</td>
                <td>{r.contact}</td>
                <td>{r.message}</td>
                <td>{new Date(r.ts).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
// import { useEffect, useState } from "react"
// import {
//   getLeaders,
//   saveLeaders,
//   addLeaderBackend,
//   updateLeaderBackend,
//   deleteLeaderBackend,
//   moveLeaderBackend,
//   getLeadersAsync
// } from "../lib/premium"

// export default function LeaderAdmin() {

//   const [leaders, setLeaders] = useState([])
//   const [editing, setEditing] = useState(null)

//   const [form, setForm] = useState({
//     sno: "",
//     name: "",
//     title: "",
//     loc: "",
//     photo: null
//   })

//   useEffect(() => {
//     getLeadersAsync().then((list) => {
//       saveLeaders(list)
//       setLeaders(list)
//     })
//   }, [])

//   function resetForm() {
//     setEditing(null)
//     setForm({
//       sno: "",
//       name: "",
//       title: "",
//       loc: "",
//       photo: null
//     })
//   }

//   function onPhotoFile(e) {
//     const file = e.target.files && e.target.files[0]
//     if (!file) return

//     setForm({
//       ...form,
//       photo: file
//     })
//   }

//   function submitLeader(e) {
//     e.preventDefault()

//     const fd = new FormData()

//     fd.append("sno", form.sno)
//     fd.append("name", form.name)
//     fd.append("title", form.title)
//     fd.append("loc", form.loc)

//     if (form.photo instanceof File) {
//       fd.append("photo", form.photo)
//     }

//     if (editing) {
//       updateLeaderBackend(editing, fd).then(() => {
//         getLeadersAsync().then(setLeaders)
//       })
//     } else {
//       console.log(fd,"fd");
      
//       addLeaderBackend(fd).then(() => {
//         getLeadersAsync().then(setLeaders)
//       })
//     }

//     resetForm()
//   }

//   function editLeader(id) {
//     const l = leaders.find((x) => x.id === id)
//     if (!l) return

//     setEditing(id)

//     setForm({
//       sno: String(l.sno),
//       name: l.name,
//       title: l.title,
//       loc: l.loc,
//       photo: l.photo
//     })
//   }

//   function removeLeader(id) {
//     deleteLeaderBackend(id).then(() => {
//       getLeadersAsync().then(setLeaders)
//     })
//   }

//   function move(id, dir) {
//     moveLeaderBackend(id, dir).then(() => {
//       getLeadersAsync().then(setLeaders)
//     })
//   }

//   function previewPhoto(photo) {
//     if (!photo) return ""
//     if (typeof photo === "string") return photo
//     return URL.createObjectURL(photo)
//   }

//   return (
//     <div className="card">

//       <h2 style={{ textAlign: "center" }}>
//         Top Team Leaders — Manage Board
//       </h2>

//       {/* FORM */}

//       <form
//         onSubmit={submitLeader}
//         style={{
//           display: "grid",
//           gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))",
//           gap: 10,
//           marginBottom: 20
//         }}
//       >

//         <div>
//           <label>Photo</label>
//           <input
//             type="file"
//             accept="image/*"
//             onChange={onPhotoFile}
//           />

//           {form.photo && (
//             <div
//               style={{
//                 width: 70,
//                 height: 90,
//                 marginTop: 8
//               }}
//             >
//               <img
//                 src={previewPhoto(form.photo)}
//                 alt="preview"
//                 style={{
//                   width: "100%",
//                   height: "100%",
//                   objectFit: "cover",
//                   borderRadius: 6
//                 }}
//               />
//             </div>
//           )}
//         </div>

//         <div>
//           <label>Name</label>
//           <input
//             value={form.name}
//             onChange={(e) =>
//               setForm({ ...form, name: e.target.value })
//             }
//             placeholder="Leader name"
//           />
//         </div>

//         <div>
//           <label>Rank Name</label>
//           <input
//             value={form.title}
//             onChange={(e) =>
//               setForm({ ...form, title: e.target.value })
//             }
//             placeholder="Prime Trader"
//           />
//         </div>

//         <div>
//           <label>Location</label>
//           <input
//             value={form.loc}
//             onChange={(e) =>
//               setForm({ ...form, loc: e.target.value })
//             }
//             placeholder="City"
//           />
//         </div>

//         <div style={{ display: "flex", gap: 8 }}>
//           <button className="btn" type="submit">
//             {editing ? "Update" : "Add"}
//           </button>

//           {editing && (
//             <button
//               type="button"
//               className="btn secondary"
//               onClick={resetForm}
//             >
//               Cancel
//             </button>
//           )}
//         </div>

//       </form>

//       {/* TABLE */}

//       <div style={{ overflowX: "auto" }}>

//         <table style={{ width: "100%", borderCollapse: "collapse" }}>

//           <thead>
//             <tr>
//               <th>S.No</th>
//               <th>Photo</th>
//               <th>Name</th>
//               <th>Rank</th>
//               <th>Location</th>
//               <th>Actions</th>
//             </tr>
//           </thead>

//           <tbody>

//             {leaders.map((l) => (
//               <tr key={l.id}>

//                 <td>{l.sno}</td>

//                 <td>
//                   {l.photo && (
//                     <img
//                       src={l.photo}
//                       alt={l.name}
//                       style={{
//                         width: 40,
//                         height: 55,
//                         objectFit: "cover",
//                         borderRadius: 6
//                       }}
//                     />
//                   )}
//                 </td>

//                 <td>{l.name}</td>

//                 <td>{l.title}</td>

//                 <td>{l.loc}</td>

//                 <td style={{ display: "flex", gap: 6 }}>

//                   <button
//                     className="btn"
//                     onClick={() => move(l.id, "up")}
//                   >
//                     Up
//                   </button>

//                   <button
//                     className="btn"
//                     onClick={() => move(l.id, "down")}
//                   >
//                     Down
//                   </button>

//                   <button
//                     className="btn"
//                     onClick={() => editLeader(l.id)}
//                   >
//                     Edit
//                   </button>

//                   <button
//                     className="btn secondary"
//                     style={{ background: "#ef4444", color: "#fff" }}
//                     onClick={() => removeLeader(l.id)}
//                   >
//                     Delete
//                   </button>

//                 </td>

//               </tr>
//             ))}

//           </tbody>

//         </table>

//       </div>

//     </div>
//   )
// }
