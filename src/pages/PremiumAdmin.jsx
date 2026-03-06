import { getUsers, isAdminLoggedIn, signOutAdmin, getProgress, modules, getVideoAccess, setVideoAccess, getJoinResponses, getComplaintResponses, getLeaders, saveLeaders, getBanners, saveBanners, getEvents, saveEvents, getUsersBackendAsync, approveUserBackend, disableUserBackend, denyUserBackend, addLeaderBackend, updateLeaderBackend, deleteLeaderBackend, moveLeaderBackend, addBannerBackend, updateBannerBackend, deleteBannerBackend, moveBannerBackend, setVideoAccessBackend, getLeadersAsync, getBannersAsync, getEventsAsync, addEventBackend, updateEventBackend, deleteEventBackend, moveEventBackend, clearEventsBackend, getJoinResponsesBackend, getComplaintResponsesBackend, getProgressBackend, syncTopSliderEventsBackend, importApiFolderBackend } from '../lib/premium'
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
  console.log(complaints,"complaints")
  const nav = useNavigate()
  function resolvePhoto(val) {
    if (!val) return ''
    const s = String(val)
    if (/^(data:|https?:|\/)/i.test(s)) return s
    return '/images/' + s.replace(/^\/+/, '')
  }
  useEffect(() => {
    if (!isAdminLoggedIn()) {
      nav('/premium/admin-login')
    }
    getUsersBackendAsync().then(() => setUsers(getUsers()))
    getLeadersAsync().then((list) => {
      saveLeaders(list)
      setLeaders(list)
    })
    getBannersAsync().then((list) => {
      saveBanners(list.map((b) => ({ id: b.id, sno: b.sno || 0, img: b.img, title: b.title, subtitle: b.subtitle, ctaText: (b.cta && b.cta.text) || '', ctaTo: (b.cta && b.cta.to) || '' })))
      setBanners(getBanners())
    })
    getEventsAsync().then((list) => {
      saveEvents(list)
      setEvents(list)
    })
    getJoinResponsesBackend().then((list) => setJoins(list))
    getComplaintResponsesBackend().then((list) => setComplaints(list))
  }, [nav])
  useEffect(() => {
    users.forEach((u) => {
      getProgressBackend(u.id).catch(() => {})
    })
  }, [users.length])
  const approved = users.filter((u) => u.approved)
  const pending = users.filter((u) => !u.approved)
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
    approveUserBackend(id).then(() => setUsers(getUsers()))
  }
  function deny(id) {
    denyUserBackend(id).then(() => setUsers(getUsers()))
  }
  function disable(id) {
    disableUserBackend(id).then(() => setUsers(getUsers()))
  }
  function toggleVideos(id) {
    const enabled = getVideoAccess(id)
    setVideoAccess(id, !enabled)
    setVideoAccessBackend(id, !enabled).then(() => {
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
      updateLeaderBackend(editing, form).then(() => setLeaders(getLeaders()))
      resetForm()
    } else {
      setPrevLeaders(getLeaders())
      addLeaderBackend(form).then(() => setLeaders(getLeaders()))
      resetForm()
    }
  }
  function submitBanner(e) {
    e.preventDefault()
    if (bEditing) {
      setPrevBanners(getBanners())
      updateBannerBackend(bEditing, bForm).then(() => setBanners(getBanners()))
      resetBForm()
    } else {
      setPrevBanners(getBanners())
      addBannerBackend(bForm).then(() => setBanners(getBanners()))
      resetBForm()
    }
  }
  function undoBanners() {
    if (!prevBanners) return
    saveBanners(prevBanners)
    setBanners(getBanners())
    setPrevBanners(null)
  }
  function editBanner(id) {
    const b = banners.find((x) => x.id === id)
    if (!b) return
    setBEditing(id)
    setBForm({ sno: String(b.sno), img: b.img, title: b.title, subtitle: b.subtitle, ctaText: b.ctaText, ctaTo: b.ctaTo })
  }
  function removeBanner(id) {
    setPrevBanners(getBanners())
    deleteBannerBackend(id).then(() => setBanners(getBanners()))
    if (bEditing === id) resetBForm()
  }
  function moveBannerRow(id, dir) {
    setPrevBanners(getBanners())
    moveBannerBackend(id, dir).then(() => setBanners(getBanners()))
  }
  function onPhotoFile(e) {
    const f = e.target.files && e.target.files[0]
    if (!f) return
    const reader = new FileReader()
    reader.onload = () => {
      setForm({ ...form, photo: String(reader.result || '') })
    }
    reader.readAsDataURL(f)
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
      <div style={{ textAlign: 'center', marginBottom: 10, display: 'flex', gap: 8, justifyContent: 'center' }}>
        <button className="btn" onClick={updateAll} style={{ padding: '8px 14px', fontSize: '.9rem' }}>Update All</button>
        <button className="btn" onClick={() => { importApiFolderBackend().then(() => { setLeaders(getLeaders()); setEvents(getEvents()) }) }} style={{ padding: '8px 14px', fontSize: '.9rem', background: '#0ea5e9', color: '#fff' }}>Import API Folder</button>
        <button className="btn secondary" onClick={() => { signOutAdmin(); nav('/premium/admin-login') }} style={{ padding: '8px 14px', fontSize: '.9rem' }}>Sign out</button>
      </div>
      <div className="card" style={{ marginTop: 12 }}>
        <h2 style={{ marginTop: 0, textAlign: 'center' }}>Meetings & Trips — Photos</h2>
        <div style={{ textAlign: 'right', marginBottom: 8, display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button className="btn" onClick={() => { syncTopSliderEventsBackend().then((list) => setEvents(list)) }} style={{ background: '#15803D', color: '#fff' }}>
            Import TopSlider Photos
          </button>
          <button className="btn secondary" onClick={() => { clearEventsBackend().then((list) => setEvents(list)); setEForm({ sno: '', img: '', date: '' }); setEEditing(null) }} style={{ background: '#ef4444', color: '#fff' }}>
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
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn" type="submit">{eEditing ? 'Update' : 'Add'}</button>
            {eEditing ? <button className="btn secondary" type="button" onClick={() => { setEForm({ sno: '', img: '', date: '' }); setEEditing(null) }}>Cancel</button> : null}
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
                    <button className="btn" type="button" onClick={() => { moveEventBackend(ev.id, 'up').then((list) => setEvents(list)) }}>Up</button>
                    <button className="btn" type="button" onClick={() => { moveEventBackend(ev.id, 'down').then((list) => setEvents(list)) }}>Down</button>
                    <button className="btn" type="button" onClick={() => { setEEditing(ev.id); setEForm({ sno: String(ev.sno), img: ev.img, date: ev.date }) }}>Edit</button>
                    <button className="btn secondary" type="button" onClick={() => { deleteEventBackend(ev.id).then((list) => setEvents(list)) }} style={{ background: '#ef4444', color: '#fff' }}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="card" style={{ marginTop: 12 }}>
        <h2 style={{ marginTop: 0, textAlign: 'center' }}>Homepage Slider — Manage Banners</h2>
        <div style={{ textAlign: 'right', marginBottom: 8, display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button className="btn" onClick={undoBanners} disabled={!prevBanners}>Undo last change</button>
          <button className="btn secondary" onClick={() => { saveBanners([]); setBanners(getBanners()); resetBForm() }} style={{ background: '#ef4444', color: '#fff' }}>
            Clear All Banners
          </button>
        </div>
        <form onSubmit={submitBanner} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 8, alignItems: 'end', marginBottom: 12 }}>
          <div>
            <label>S.No</label>
            <input value={bForm.sno} onChange={(e) => setBForm({ ...bForm, sno: e.target.value })} placeholder="1" />
          </div>
          <div>
            <label>Image URL</label>
            <input value={bForm.img} onChange={(e) => setBForm({ ...bForm, img: e.target.value })} placeholder="/images/banner.jpg" />
            <div style={{ fontSize: '12px', color: '#6B7280', marginTop: 4 }}>
              Recommended: 1920×640 px (WebP/JPEG). Wide panorama with center-safe content.
            </div>
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
          <div>
            <label>CTA Link</label>
            <input value={bForm.ctaTo} onChange={(e) => setBForm({ ...bForm, ctaTo: e.target.value })} placeholder="/path" />
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn" type="submit">{bEditing ? 'Update' : 'Add'}</button>
            {bEditing ? <button className="btn secondary" type="button" onClick={resetBForm}>Cancel</button> : null}
          </div>
        </form>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th>S.No</th>
                <th>Image</th>
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
                  <td>{b.img ? <img src={b.img} alt={b.title} style={{ width: 90, height: 54, objectFit: 'cover', borderRadius: 6 }} /> : '-'}</td>
                  <td style={{ maxWidth: 220, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{b.title}</td>
                  <td style={{ maxWidth: 260, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{b.subtitle}</td>
                  <td>{b.ctaText} → {b.ctaTo}</td>
                  <td style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
                    <button className="btn" type="button" onClick={() => moveBannerRow(b.id, 'up')}>Up</button>
                    <button className="btn" type="button" onClick={() => moveBannerRow(b.id, 'down')}>Down</button>
                    <button className="btn" type="button" onClick={() => editBanner(b.id)}>Edit</button>
                    <button className="btn secondary" type="button" onClick={() => removeBanner(b.id)} style={{ background: '#ef4444', color: '#fff' }}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="card" style={{ overflowX: 'auto', marginBottom: 12 }}>
        <h2 style={{ marginTop: 0, textAlign: 'center' }}>Pending Users ({pending.length})</h2>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
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
            {pending.map((u) => (
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
                    style={{ background: '#22c55e', color: '#0b1220' }}
                    onClick={() => approve(u.id)}
                  >
                    Approve
                  </button>
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
        <h2 style={{ marginTop: 0, textAlign: 'center' }}>Top Team Leaders — Manage Board</h2>
        <div style={{ textAlign: 'right', marginBottom: 8, display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button className="btn" onClick={undoLeaders} disabled={!prevLeaders}>Undo last change</button>
          <button className="btn secondary" onClick={() => { saveLeaders([]); setLeaders(getLeaders()); resetForm() }} style={{ background: '#ef4444', color: '#fff' }}>
            Clear All Leaders
          </button>
        </div>
        <form onSubmit={submitLeader} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: 8, alignItems: 'end', marginBottom: 12 }}>
          <div>
            <label>S.No</label>
            <input value={form.sno} onChange={(e) => setForm({ ...form, sno: e.target.value })} placeholder="1" />
          </div>
          <div>
            <label>Photo URL</label>
            <input value={form.photo} onChange={(e) => setForm({ ...form, photo: e.target.value })} placeholder="/images/leader.jpg or Data URL" />
            <input type="file" accept="image/*" onChange={onPhotoFile} style={{ marginTop: 6 }} />
            {form.photo ? (
              <div style={{ width: 54, height: 72, padding: 2, background: '#fff', border: '2px solid #ffffff', borderRadius: 6, display: 'inline-block', marginTop: 6 }}>
                <img src={resolvePhoto(form.photo)} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 4 }} />
              </div>
            ) : null}
            {form.photo ? <button type="button" className="btn secondary" onClick={() => setForm({ ...form, photo: '' })} style={{ marginTop: 6 }}>Clear Photo</button> : null}
          </div>
          <div>
            <label>Name</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Name" />
          </div>
          <div>
            <label>Rank Name</label>
            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Prime Trader" />
          </div>
          <div>
            <label>Location</label>
            <input value={form.loc} onChange={(e) => setForm({ ...form, loc: e.target.value })} placeholder="City" />
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn" type="submit">{editing ? 'Update' : 'Add'}</button>
            {editing ? <button className="btn secondary" type="button" onClick={resetForm}>Cancel</button> : null}
          </div>
        </form>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
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
