import {
  getUsers,
  isAdminLoggedIn,
  signOutAdmin,
  getProgress,
  modules,
  getVideoAccess,
  setVideoAccess,
  getJoinResponses,
  getComplaintResponses,
  getLeaders,
  saveLeaders,
  getBanners,
  saveBanners,
  getUsersBackendAsync,
  approveUserBackend,
  disableUserBackend,
  denyUserBackend,
  addLeaderBackend,
  updateLeaderBackend,
  deleteLeaderBackend,
  moveLeaderBackend,
  addBannerBackend,
  updateBannerBackend,
  deleteBannerBackend,
  moveBannerBackend,
  setVideoAccessBackend,
  getLeadersAsync,
  getBannersAsync,
  getJoinResponsesBackend,
  getComplaintResponsesBackend,
  getProgressBackend,
  importApiFolderBackend,
  getTopSliderImagesBackend,
  getAnalyticsSummaryAsync,
  addTopSliderImageBackend,
  deleteTopSliderImageBackend,
  getAchievements,
  saveAchievements,
  getAchievementsAsync,
  addAchievementBackend,
  deleteAchievementBackend,
  moveAchievementBackend,
  getMPRAchievements,
  saveMPRAchievements,
  getMPRAchievementsAsync,
  addMPRAchievementBackend,
  deleteMPRAchievementBackend,
  moveMPRAchievementBackend,
} from '../lib/premium';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function PremiumAdmin() {
  const [users, setUsers] = useState(() => getUsers());
  const [leaders, setLeaders] = useState(() => getLeaders());
  const [editing, setEditing] = useState(null);
  const [banners, setBanners] = useState(() => getBanners());
  const [bForm, setBForm] = useState({
    sno: '',
    img: '',
    title: '',
    subtitle: '',
    ctaText: '',
    ctaTo: '',
  });
  const [bEditing, setBEditing] = useState(null);
  const [form, setForm] = useState({
    sno: '',
    name: '',
    title: '',
    loc: '',
    photo: '',
  });
  const [prevLeaders, setPrevLeaders] = useState(null);
  const [prevBanners, setPrevBanners] = useState(null);
  const [joins, setJoins] = useState(() => getJoinResponses());
  const [complaints, setComplaints] = useState(() => getComplaintResponses());
  const [slides, setSlides] = useState([]);
  const [slideFile, setSlideFile] = useState(null);
  const [slideUploading, setSlideUploading] = useState(false);
  const [pending, setPending] = useState(0);
  const [analytics, setAnalytics] = useState({
    total: 0,
    today: 0,
    last7Days: 0,
    last30Days: 0,
  });

  const [achievements, setAchievements] = useState(() => getAchievements());
  const [achFile, setAchFile] = useState(null);
  const [achUploading, setAchUploading] = useState(false);

  const [mprAchievements, setMPRAchievements] = useState(() =>
    getMPRAchievements()
  );
  const [mprFile, setMPRFile] = useState(null);
  const [mprUploading, setMPRUploading] = useState(false);
  console.log(complaints, 'complaints');
  const nav = useNavigate();
  function resolvePhoto(val) {
    if (!val) return '';
    const s = String(val);
    if (/^(data:|https?:|\/)/i.test(s)) return s;
    return '/images/' + s.replace(/^\/+/, '');
  }
  function getLeaderPreview(val) {
    if (!val) return '';
    if (val instanceof File) {
      return URL.createObjectURL(val);
    }
    return resolvePhoto(val);
  }
  function track(promise) {
    setPending((n) => n + 1);
    return Promise.resolve(promise).finally(() => {
      setPending((n) => (n > 0 ? n - 1 : 0));
    });
  }
  const loading = pending > 0;
  useEffect(() => {
    // if (!isAdminLoggedIn()) {
    //   nav('/premium/admin-login')
    //   return
    // }
    track(
      Promise.all([
        getUsersBackendAsync().then(() => setUsers(getUsers())),
        getAnalyticsSummaryAsync().then((summary) => setAnalytics(summary)),
        getLeadersAsync().then((list) => {
          saveLeaders(list);
          setLeaders(list);
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
            }))
          );
          setBanners(getBanners());
        }),
        getJoinResponsesBackend().then((list) => setJoins(list)),
        getComplaintResponsesBackend().then((list) => setComplaints(list)),
        getTopSliderImagesBackend().then((list) =>
          setSlides(Array.isArray(list) ? list : [])
        ),
        getAchievementsAsync().then((list) => {
          saveAchievements(list);
          setAchievements(list);
        }),
        getMPRAchievementsAsync().then((list) => {
          saveMPRAchievements(list);
          setMPRAchievements(list);
        }),
      ])
    );
  }, [nav]);
  const approved = users.filter((u) => u.approved && u.videoAccess);
  const disabledUsers = users.filter((u) => u.approved && !u.videoAccess);
  const pendingUser = users.filter((u) => !u.approved);
  const googleUsers = users.filter((u) => u.isGoogleUser);
  function downloadExcel(filename, headers, rows) {
    const tableHead = `<tr>${headers.map((h) => `<th>${h}</th>`).join('')}</tr>`;
    const tableRows = rows
      .map(
        (r) =>
          `<tr>${r
            .map(
              (v) =>
                `<td>${String(v ?? '')
                  .replace(/</g, '&lt;')
                  .replace(/>/g, '&gt;')}</td>`
            )
            .join('')}</tr>`
      )
      .join('');
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8" /></head><body><table border="1">${tableHead}${tableRows}</table></body></html>`;
    const blob = new Blob([html], { type: 'application/vnd.ms-excel' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename.endsWith('.xls') ? filename : `${filename}.xls`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
  function approve(id) {
    track(approveUserBackend(id)).then(() => setUsers(getUsers()));
  }
  function deny(id) {
    track(denyUserBackend(id)).then(() => setUsers(getUsers()));
  }
  function disable(id) {
    track(disableUserBackend(id)).then(() => setUsers(getUsers()));
  }
  function toggleVideos(id) {
    const enabled = getVideoAccess(id);
    setVideoAccess(id, !enabled);
    track(setVideoAccessBackend(id, !enabled)).then(() => {
      setUsers(getUsers());
    });
  }
  function resetForm() {
    setEditing(null);
    setForm({ sno: '', name: '', title: '', loc: '', photo: '' });
  }
  function undoLeaders() {
    if (!prevLeaders) return;
    saveLeaders(prevLeaders);
    setLeaders(getLeaders());
    setPrevLeaders(null);
  }
  function resetBForm() {
    setBEditing(null);
    setBForm({
      sno: '',
      img: '',
      title: '',
      subtitle: '',
      ctaText: '',
      ctaTo: '',
    });
  }
  function submitLeader(e) {
    e.preventDefault();
    if (editing) {
      setPrevLeaders(getLeaders());
      track(
        updateLeaderBackend(editing, {
          name: form.name,
          title: form.title,
          loc: form.loc,
          photo: form.photo,
        })
      ).then(() => {
        setLeaders(getLeaders());
        resetForm();
      });
      return;
    }
    const fd = new FormData();
    fd.append('name', form.name);
    fd.append('title', form.title);
    fd.append('loc', form.loc);
    if (form.photo instanceof File) {
      fd.append('photo', form.photo);
    }
    track(addLeaderBackend(fd)).then(() => {
      track(
        getLeadersAsync().then((list) => {
          saveLeaders(list);
          setLeaders(list);
        })
      );
    });
    resetForm();
  }
  function submitBanner(e) {
    e.preventDefault();
    if (bEditing) {
      setPrevBanners(getBanners());
      track(updateBannerBackend(bEditing, bForm)).then(() =>
        setBanners(getBanners())
      );
      resetBForm();
    } else {
      setPrevBanners(getBanners());
      track(addBannerBackend(bForm)).then(() => setBanners(getBanners()));
      resetBForm();
    }
  }
  function undoBanners() {
    if (!prevBanners) return;
    saveBanners(prevBanners);
    setBanners(getBanners());
    setPrevBanners(null);
  }
  function editLeader(id) {
    const l = leaders.find((x) => x.id === id);
    if (!l) return;

    setEditing(id);

    setForm({
      sno: String(l.sno),
      name: l.name,
      title: l.title,
      loc: l.loc,
      photo: l.photo,
    });
  }

  // function editBanner(id) {
  //   const b = banners.find((x) => x.id === id)
  //   if (!b) return
  //   setBEditing(id)
  //   setBForm({ sno: String(b.sno), img: b.img, title: b.title, subtitle: b.subtitle, ctaText: b.ctaText, ctaTo: b.ctaTo })
  // }
  function removeBanner(id) {
    setPrevBanners(getBanners());
    track(deleteBannerBackend(id)).then(() => setBanners(getBanners()));
    if (bEditing === id) resetBForm();
  }
  function moveBannerRow(id, dir) {
    setPrevBanners(getBanners());
    track(moveBannerBackend(id, dir)).then(() => setBanners(getBanners()));
  }
  function onPhotoFile(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    setForm({
      ...form,
      photo: file,
    });
  }
  function editLeader(id) {
    const l = leaders.find((x) => x.id === id);
    if (!l) return;
    setEditing(id);
    setForm({
      sno: String(l.sno),
      name: l.name,
      title: l.title,
      loc: l.loc,
      photo: l.photo,
    });
  }
  function removeLeader(id) {
    setPrevLeaders(getLeaders());
    deleteLeaderBackend(id).then(() => setLeaders(getLeaders()));
    if (editing === id) resetForm();
  }
  function move(id, dir) {
    setPrevLeaders(getLeaders());
    moveLeaderBackend(id, dir).then(() => setLeaders(getLeaders()));
  }
  function onSlideFile(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    setSlideFile(file);
  }
  function resetSlideForm() {
    setSlideFile(null);
  }
  function uploadSlide(e) {
    e.preventDefault();
    if (!slideFile) return;
    setSlideUploading(true);
    track(addTopSliderImageBackend(slideFile))
      .then((list) => setSlides(Array.isArray(list) ? list : []))
      .finally(() => {
        setSlideUploading(false);
        resetSlideForm();
        if (e.target && e.target.reset) e.target.reset();
      });
  }
  function removeSlide(name) {
    track(deleteTopSliderImageBackend(name)).then((list) =>
      setSlides(Array.isArray(list) ? list : [])
    );
  }

  // --- Achievements Handlers ---
  function onAchFile(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    setAchFile(file);
  }
  function uploadAch(e) {
    e.preventDefault();
    if (!achFile) return;
    setAchUploading(true);
    const fd = new FormData();
    fd.append('image', achFile);
    track(addAchievementBackend(fd))
      .then((list) => setAchievements(list))
      .finally(() => {
        setAchUploading(false);
        setAchFile(null);
        if (e.target && e.target.reset) e.target.reset();
      });
  }
  function removeAch(id) {
    track(deleteAchievementBackend(id)).then((list) => setAchievements(list));
  }
  function moveAch(id, dir) {
    track(moveAchievementBackend(id, dir)).then((list) =>
      setAchievements(list)
    );
  }

  // --- MPR Achievers Handlers ---
  function onMPRFile(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    setMPRFile(file);
  }
  function uploadMPR(e) {
    e.preventDefault();
    if (!mprFile) return;
    setMPRUploading(true);
    const fd = new FormData();
    fd.append('image', mprFile);
    track(addMPRAchievementBackend(fd))
      .then((list) => setMPRAchievements(list))
      .finally(() => {
        setMPRUploading(false);
        setMPRFile(null);
        if (e.target && e.target.reset) e.target.reset();
      });
  }
  function removeMPR(id) {
    track(deleteMPRAchievementBackend(id)).then((list) =>
      setMPRAchievements(list)
    );
  }
  function moveMPR(id, dir) {
    track(moveMPRAchievementBackend(id, dir)).then((list) =>
      setMPRAchievements(list)
    );
  }
  const stats = (() => {
    const counts = Array.from({ length: modules.length }, () => 0);
    let completed = 0;
    users.forEach((u) => {
      const prog = u.progress || getProgress(u.id);
      if (prog.completed[modules.length - 1]) completed++;
      else {
        const st = Math.max(1, Math.min(modules.length, prog.unlocked));
        counts[st - 1]++;
      }
    });
    const total = users.length;
    const max = Math.max(completed, ...counts, 1);
    return { counts, completed, total, max };
  })();
  function updateAll() {
    try {
      saveLeaders(getLeaders());
      saveBanners(getBanners());
      setLeaders(getLeaders());
      setBanners(getBanners());
    } catch {
      /* noop */
    }
  }
  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 20,
        }}
      >
        <h1 style={{ color: '#00ddeb', margin: 0 }}>Premium Admin</h1>
        <button
          className="btn secondary"
          onClick={() => {
            signOutAdmin();
            nav('/premium/admin-login');
          }}
          style={{ padding: '8px 16px', background: '#ef4444', color: '#fff' }}
        >
          Logout
        </button>
      </div>
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
      <div className="card" style={{ marginBottom: 12 }}>
        <h2 style={{ marginTop: 0, textAlign: 'center' }}>Website Visitors</h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: 12,
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.8rem', fontWeight: 700 }}>
              {analytics.total}
            </div>
            <div style={{ opacity: 0.75 }}>Total Visits</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.8rem', fontWeight: 700 }}>
              {analytics.today}
            </div>
            <div style={{ opacity: 0.75 }}>Today</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.8rem', fontWeight: 700 }}>
              {analytics.last7Days}
            </div>
            <div style={{ opacity: 0.75 }}>Last 7 Days</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.8rem', fontWeight: 700 }}>
              {analytics.last30Days}
            </div>
            <div style={{ opacity: 0.75 }}>Last 30 Days</div>
          </div>
        </div>
      </div>

      {/* Google Sign-in Users */}
      <div className="card" style={{ overflowX: 'auto', marginBottom: 12 }}>
        <h2 style={{ marginTop: 0, textAlign: 'center' }}>
          Google Sign-in Users ({googleUsers.length})
        </h2>
        <div style={{ textAlign: 'right', marginBottom: 8 }}>
          <button
            className="btn"
            onClick={() => {
              const headers = [
                'Name',
                'Email',
                'Phone',
                'Sign-up Date',
                'Approved',
                'Video Access',
              ];
              const rows = googleUsers.map((u) => [
                u.name,
                u.email,
                u.phone,
                new Date(u.createdAt || Date.now()).toLocaleString(),
                u.approved ? 'Yes' : 'No',
                u.videoAccess ? 'Yes' : 'No',
              ]);
              downloadExcel('google_users', headers, rows);
            }}
          >
            Export Excel
          </button>
        </div>
        <table
          style={{
            width: '100%',
            minWidth: 800,
            borderCollapse: 'collapse',
            fontSize: '.9rem',
          }}
        >
          <thead>
            <tr>
              <th style={{ whiteSpace: 'nowrap' }}>Name</th>
              <th style={{ whiteSpace: 'nowrap' }}>Email</th>
              <th style={{ whiteSpace: 'nowrap' }}>Phone</th>
              <th style={{ whiteSpace: 'nowrap' }}>Sign-up Date</th>
              <th style={{ whiteSpace: 'nowrap' }}>Approved</th>
              <th style={{ whiteSpace: 'nowrap' }}>Video Access</th>
            </tr>
          </thead>
          <tbody>
            {googleUsers.map((u) => (
              <tr key={u.id}>
                <td style={{ whiteSpace: 'nowrap' }}>{u.name}</td>
                <td style={{ whiteSpace: 'nowrap' }}>{u.email}</td>
                <td style={{ whiteSpace: 'nowrap' }}>{u.phone}</td>
                <td style={{ whiteSpace: 'nowrap' }}>
                  {new Date(u.createdAt || Date.now()).toLocaleString()}
                </td>
                <td style={{ whiteSpace: 'nowrap' }}>
                  <span style={{ color: u.approved ? '#22c55e' : '#ef4444' }}>
                    {u.approved ? 'Yes' : 'No'}
                  </span>
                </td>
                <td style={{ whiteSpace: 'nowrap' }}>
                  <span
                    style={{ color: u.videoAccess ? '#22c55e' : '#ef4444' }}
                  >
                    {u.videoAccess ? 'Yes' : 'No'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 1. Pending Users */}
      <div className="card" style={{ overflowX: 'auto', marginBottom: 12 }}>
        <h2 style={{ marginTop: 0, textAlign: 'center' }}>
          Pending Users ({pendingUser.length})
        </h2>
        <table
          style={{
            width: '100%',
            minWidth: 800,
            borderCollapse: 'collapse',
            fontSize: '.9rem',
          }}
        >
          <thead>
            <tr>
              <th style={{ whiteSpace: 'nowrap' }}>Name</th>
              <th style={{ whiteSpace: 'nowrap' }}>Phone</th>
              <th style={{ whiteSpace: 'nowrap' }}>Email</th>
              <th style={{ whiteSpace: 'nowrap' }}>Team</th>
              <th style={{ whiteSpace: 'nowrap' }}>Leader</th>
              <th style={{ whiteSpace: 'nowrap' }}>Stage</th>
              <th style={{ whiteSpace: 'nowrap' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {pendingUser.map((u) => (
              <tr key={u.id}>
                <td style={{ whiteSpace: 'nowrap' }}>{u.name}</td>
                <td style={{ whiteSpace: 'nowrap' }}>{u.phone}</td>
                <td style={{ whiteSpace: 'nowrap' }}>{u.email}</td>
                <td style={{ whiteSpace: 'nowrap' }}>{u.team}</td>
                <td style={{ whiteSpace: 'nowrap' }}>{u.leader}</td>
                <td style={{ whiteSpace: 'nowrap' }}>
                  {(() => {
                    const prog = u.progress || getProgress(u.id);
                    return prog.completed[modules.length - 1]
                      ? 'Completed'
                      : `Video ${prog.unlocked}`;
                  })()}
                </td>
                <td
                  style={{
                    display: 'flex',
                    gap: 6,
                    justifyContent: 'center',
                    whiteSpace: 'nowrap',
                  }}
                >
                  <button
                    className="btn"
                    style={{
                      background: '#22c55e',
                      color: '#0b1220',
                      padding: '4px 10px',
                      fontSize: '.8rem',
                      transition:
                        'transform .15s ease, background-color .15s ease',
                    }}
                    onClick={() => approve(u.id)}
                  >
                    Approve
                  </button>
                  <button
                    className="btn secondary"
                    style={{
                      background: '#ef4444',
                      color: '#ffffff',
                      padding: '4px 10px',
                      fontSize: '.8rem',
                      transition:
                        'transform .15s ease, background-color .15s ease',
                    }}
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

      {/* 2. Approved Users (Video Enabled) */}
      <div className="card" style={{ overflowX: 'auto', marginTop: 12 }}>
        <h2 style={{ marginTop: 0, textAlign: 'center' }}>
          Approved Users - Video Enabled ({approved.length})
        </h2>
        <table
          style={{ width: '100%', minWidth: 900, borderCollapse: 'collapse' }}
        >
          <thead>
            <tr>
              <th style={{ whiteSpace: 'nowrap' }}>Name</th>
              <th style={{ whiteSpace: 'nowrap' }}>Phone</th>
              <th style={{ whiteSpace: 'nowrap' }}>Email</th>
              <th style={{ whiteSpace: 'nowrap' }}>Team</th>
              <th style={{ whiteSpace: 'nowrap' }}>Leader</th>
              <th style={{ whiteSpace: 'nowrap' }}>Stage</th>
              <th style={{ whiteSpace: 'nowrap' }}>Videos</th>
              <th style={{ whiteSpace: 'nowrap' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {approved.map((u) => (
              <tr key={u.id}>
                <td style={{ whiteSpace: 'nowrap' }}>{u.name}</td>
                <td style={{ whiteSpace: 'nowrap' }}>{u.phone}</td>
                <td style={{ whiteSpace: 'nowrap' }}>{u.email}</td>
                <td style={{ whiteSpace: 'nowrap' }}>{u.team}</td>
                <td style={{ whiteSpace: 'nowrap' }}>{u.leader}</td>
                <td style={{ whiteSpace: 'nowrap' }}>
                  {(() => {
                    const prog = u.progress || getProgress(u.id);
                    return prog.completed[modules.length - 1]
                      ? 'Completed'
                      : `Video ${prog.unlocked}`;
                  })()}
                </td>
                <td style={{ whiteSpace: 'nowrap' }}>On</td>
                <td
                  style={{
                    display: 'flex',
                    gap: 6,
                    justifyContent: 'center',
                    whiteSpace: 'nowrap',
                  }}
                >
                  <button className="btn" onClick={() => disable(u.id)}>
                    Disable User
                  </button>
                  <button className="btn" onClick={() => toggleVideos(u.id)}>
                    Disable Videos
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

      {/* 2b. Video Disabled Users */}
      <div className="card" style={{ overflowX: 'auto', marginTop: 12 }}>
        <h2 style={{ marginTop: 0, textAlign: 'center', color: '#ff8b92' }}>
          Approved Users - Video Disabled ({disabledUsers.length})
        </h2>
        <table
          style={{ width: '100%', minWidth: 900, borderCollapse: 'collapse' }}
        >
          <thead>
            <tr>
              <th style={{ whiteSpace: 'nowrap' }}>Name</th>
              <th style={{ whiteSpace: 'nowrap' }}>Phone</th>
              <th style={{ whiteSpace: 'nowrap' }}>Email</th>
              <th style={{ whiteSpace: 'nowrap' }}>Team</th>
              <th style={{ whiteSpace: 'nowrap' }}>Leader</th>
              <th style={{ whiteSpace: 'nowrap' }}>Stage</th>
              <th style={{ whiteSpace: 'nowrap' }}>Videos</th>
              <th style={{ whiteSpace: 'nowrap' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {disabledUsers.map((u) => (
              <tr key={u.id}>
                <td style={{ whiteSpace: 'nowrap' }}>{u.name}</td>
                <td style={{ whiteSpace: 'nowrap' }}>{u.phone}</td>
                <td style={{ whiteSpace: 'nowrap' }}>{u.email}</td>
                <td style={{ whiteSpace: 'nowrap' }}>{u.team}</td>
                <td style={{ whiteSpace: 'nowrap' }}>{u.leader}</td>
                <td style={{ whiteSpace: 'nowrap' }}>
                  {(() => {
                    const prog = u.progress || getProgress(u.id);
                    return prog.completed[modules.length - 1]
                      ? 'Completed'
                      : `Video ${prog.unlocked}`;
                  })()}
                </td>
                <td style={{ whiteSpace: 'nowrap' }}>Off</td>
                <td
                  style={{
                    display: 'flex',
                    gap: 6,
                    justifyContent: 'center',
                    whiteSpace: 'nowrap',
                  }}
                >
                  <button className="btn" onClick={() => disable(u.id)}>
                    Disable User
                  </button>
                  <button
                    className="btn"
                    onClick={() => toggleVideos(u.id)}
                    style={{ background: '#22c55e', color: '#0b1220' }}
                  >
                    Enable Videos
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

      {/* 3. Stage Distribution */}
      <div className="card" style={{ marginTop: 12 }}>
        <h2 style={{ marginTop: 0, textAlign: 'center' }}>
          Stage Distribution
        </h2>
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
            gap: 12,
            height: 200,
            padding: '12px 0',
          }}
        >
          {stats.counts.map((c, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <div
                title={`Video ${i + 1}: ${c}`}
                style={{
                  width: 36,
                  height: `${Math.max(2, Math.round((c / stats.max) * 150))}px`,
                  background:
                    'color-mix(in srgb, var(--accent) 30%, transparent)',
                  borderRadius: '4px 4px 0 0',
                }}
              />
              <span
                style={{ fontSize: 11, opacity: 0.8, whiteSpace: 'nowrap' }}
              >
                V{i + 1}
              </span>
            </div>
          ))}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <div
              title={`Completed: ${stats.completed}`}
              style={{
                width: 36,
                height: `${Math.max(2, Math.round((stats.completed / stats.max) * 150))}px`,
                background: '#22c55e',
                borderRadius: '4px 4px 0 0',
              }}
            />
            <span
              style={{
                fontSize: 11,
                opacity: 0.8,
                whiteSpace: 'nowrap',
                fontWeight: 'bold',
                color: '#22c55e',
              }}
            >
              Done
            </span>
          </div>
        </div>
        <div style={{ textAlign: 'center', marginTop: 6, opacity: 0.85 }}>
          <span>Total Users: {stats.total}</span>
        </div>
      </div>

      {/* 4. Join/Subscribe Responses */}
      <div className="card" style={{ marginTop: 12, overflowX: 'auto' }}>
        <h2 style={{ marginTop: 0, textAlign: 'center' }}>
          Join/Subscribe Responses ({joins.length})
        </h2>
        <div style={{ textAlign: 'right', marginBottom: 8 }}>
          <button
            className="btn"
            onClick={() => {
              const headers = [
                'Name',
                'Mobile',
                'Gmail',
                'Place',
                'Sponsor',
                'Source',
                'Time',
              ];
              const rows = joins.map((r) => [
                r.name,
                r.mobile,
                r.gmail,
                r.place,
                r.sponsor,
                r.source,
                new Date(r.ts).toLocaleString(),
              ]);
              downloadExcel('join_responses', headers, rows);
            }}
          >
            Export Excel
          </button>
        </div>
        <table
          style={{ width: '100%', minWidth: 800, borderCollapse: 'collapse' }}
        >
          <thead>
            <tr>
              <th style={{ whiteSpace: 'nowrap' }}>Name</th>
              <th style={{ whiteSpace: 'nowrap' }}>Mobile</th>
              <th style={{ whiteSpace: 'nowrap' }}>Gmail</th>
              <th style={{ whiteSpace: 'nowrap' }}>Place</th>
              <th style={{ whiteSpace: 'nowrap' }}>Sponsor</th>
              <th style={{ whiteSpace: 'nowrap' }}>Source</th>
              <th style={{ whiteSpace: 'nowrap' }}>Time</th>
            </tr>
          </thead>
          <tbody>
            {joins.map((r, i) => (
              <tr key={i}>
                <td style={{ whiteSpace: 'nowrap' }}>{r.name}</td>
                <td style={{ whiteSpace: 'nowrap' }}>{r.mobile}</td>
                <td style={{ whiteSpace: 'nowrap' }}>{r.gmail}</td>
                <td style={{ whiteSpace: 'nowrap' }}>{r.place}</td>
                <td style={{ whiteSpace: 'nowrap' }}>{r.sponsor}</td>
                <td style={{ whiteSpace: 'nowrap' }}>{r.source}</td>
                <td style={{ whiteSpace: 'nowrap' }}>
                  {new Date(r.ts).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 5. Complaint/Suggestion Responses */}
      <div className="card" style={{ marginTop: 12, overflowX: 'auto' }}>
        <h2 style={{ marginTop: 0, textAlign: 'center' }}>
          Complaint/Suggestion Responses ({complaints.length})
        </h2>
        <div style={{ textAlign: 'right', marginBottom: 8 }}>
          <button
            className="btn"
            onClick={() => {
              const headers = ['Type', 'Name', 'Contact', 'Message', 'Time'];
              const rows = complaints.map((r) => [
                r.type,
                r.name,
                r.contact,
                r.message,
                new Date(r.ts).toLocaleString(),
              ]);
              downloadExcel('complaint_responses', headers, rows);
            }}
          >
            Export Excel
          </button>
        </div>
        <table
          style={{ width: '100%', minWidth: 700, borderCollapse: 'collapse' }}
        >
          <thead>
            <tr>
              <th style={{ whiteSpace: 'nowrap' }}>Type</th>
              <th style={{ whiteSpace: 'nowrap' }}>Name</th>
              <th style={{ whiteSpace: 'nowrap' }}>Contact</th>
              <th style={{ whiteSpace: 'nowrap' }}>Message</th>
              <th style={{ whiteSpace: 'nowrap' }}>Time</th>
            </tr>
          </thead>
          <tbody>
            {complaints.map((r, i) => (
              <tr key={i}>
                <td style={{ whiteSpace: 'nowrap' }}>{r.type}</td>
                <td style={{ whiteSpace: 'nowrap' }}>{r.name}</td>
                <td style={{ whiteSpace: 'nowrap' }}>{r.contact}</td>
                <td style={{ whiteSpace: 'nowrap' }}>{r.message}</td>
                <td style={{ whiteSpace: 'nowrap' }}>
                  {new Date(r.ts).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 6. Homepage Top Slider — Images */}
      <div className="card" style={{ marginTop: 12 }}>
        <h2 style={{ marginTop: 0, textAlign: 'center' }}>
          Homepage Top Slider — Images
        </h2>
        <form
          onSubmit={uploadSlide}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))',
            gap: 10,
            alignItems: 'end',
            marginBottom: 12,
          }}
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
              style={{
                padding: '6px 12px',
                fontSize: '.85rem',
                transition: 'transform .15s ease, background-color .15s ease',
              }}
            >
              {slideUploading ? 'Uploading...' : 'Upload Slide'}
            </button>
            {slideFile ? (
              <button
                type="button"
                className="btn secondary"
                onClick={resetSlideForm}
                style={{
                  padding: '6px 12px',
                  fontSize: '.85rem',
                  transition: 'transform .15s ease, background-color .15s ease',
                }}
              >
                Clear
              </button>
            ) : null}
          </div>
        </form>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))',
            gap: 12,
          }}
        >
          {slides.map((s) => (
            <div
              key={s.key || s.name}
              style={{
                border: '1px solid #e5e7eb',
                borderRadius: 8,
                padding: 8,
                background: '#020617',
              }}
            >
              <div
                style={{
                  width: '100%',
                  paddingBottom: '56%',
                  position: 'relative',
                  marginBottom: 6,
                }}
              >
                <img
                  src={s.img}
                  alt={s.name}
                  style={{
                    position: 'absolute',
                    inset: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    borderRadius: 6,
                  }}
                />
              </div>
              <div
                style={{ fontSize: '.8rem', opacity: 0.85, marginBottom: 6 }}
              >
                <div
                  style={{
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {s.name}
                </div>
              </div>
              <button
                className="btn secondary"
                type="button"
                onClick={() => removeSlide(s.name)}
                style={{
                  width: '100%',
                  padding: '4px 10px',
                  fontSize: '.8rem',
                  background: '#ef4444',
                  color: '#fff',
                  transition: 'transform .15s ease, background-color .15s ease',
                }}
              >
                Delete
              </button>
            </div>
          ))}
          {slides.length === 0 ? (
            <div style={{ fontSize: '.85rem', opacity: 0.7 }}>
              No slider images yet. Upload one to get started.
            </div>
          ) : null}
        </div>
      </div>

      {/* Achievements Management */}
      <div className="card" style={{ marginTop: 12, padding: 16 }}>
        <h2
          style={{
            marginTop: 0,
            textAlign: 'center',
            fontSize: '1.25rem',
            fontWeight: 600,
          }}
        >
          Achievements — Manage Slider
        </h2>
        <form
          onSubmit={uploadAch}
          style={{
            display: 'flex',
            gap: 12,
            alignItems: 'flex-end',
            marginBottom: 20,
            flexWrap: 'wrap',
          }}
        >
          <div style={{ flex: 1, minWidth: 200 }}>
            <label
              style={{ display: 'block', fontSize: '.85rem', marginBottom: 4 }}
            >
              Upload New Achievement Image (Cloudinary)
            </label>
            <input
              type="file"
              onChange={onAchFile}
              accept="image/*"
              style={{ width: '100%' }}
            />
          </div>
          <button
            className="btn"
            type="submit"
            disabled={!achFile || achUploading}
            style={{ padding: '8px 16px' }}
          >
            {achUploading ? 'Uploading...' : 'Upload Image'}
          </button>
        </form>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
            gap: 16,
          }}
        >
          {achievements.map((ach) => (
            <div
              key={ach.id}
              style={{
                border: '1px solid #334155',
                borderRadius: 8,
                padding: 8,
                position: 'relative',
                background: '#0f172a',
              }}
            >
              <img
                src={ach.image}
                alt="Achievement"
                style={{
                  width: '100%',
                  height: 100,
                  objectFit: 'cover',
                  borderRadius: 4,
                }}
              />
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginTop: 8,
                }}
              >
                <div style={{ display: 'flex', gap: 4 }}>
                  <button
                    onClick={() => moveAch(ach.id, 'up')}
                    style={{ padding: '2px 6px', fontSize: '.7rem' }}
                  >
                    ↑
                  </button>
                  <button
                    onClick={() => moveAch(ach.id, 'down')}
                    style={{ padding: '2px 6px', fontSize: '.7rem' }}
                  >
                    ↓
                  </button>
                </div>
                <button
                  onClick={() => removeAch(ach.id)}
                  style={{
                    padding: '2px 6px',
                    fontSize: '.7rem',
                    background: '#ef4444',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 4,
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
          {achievements.length === 0 && (
            <div
              style={{
                fontSize: '.85rem',
                opacity: 0.7,
                textAlign: 'center',
                gridColumn: '1/-1',
              }}
            >
              No achievement images yet.
            </div>
          )}
        </div>
      </div>

      {/* MPR Achievers Management */}
      <div className="card" style={{ marginTop: 12, padding: 16 }}>
        <h2
          style={{
            marginTop: 0,
            textAlign: 'center',
            fontSize: '1.25rem',
            fontWeight: 600,
          }}
        >
          MPR Achievers — Manage Slider
        </h2>
        <form
          onSubmit={uploadMPR}
          style={{
            display: 'flex',
            gap: 12,
            alignItems: 'flex-end',
            marginBottom: 20,
            flexWrap: 'wrap',
          }}
        >
          <div style={{ flex: 1, minWidth: 200 }}>
            <label
              style={{ display: 'block', fontSize: '.85rem', marginBottom: 4 }}
            >
              Upload New MPR Achiever Image (Cloudinary)
            </label>
            <input
              type="file"
              onChange={onMPRFile}
              accept="image/*"
              style={{ width: '100%' }}
            />
          </div>
          <button
            className="btn"
            type="submit"
            disabled={!mprFile || mprUploading}
            style={{ padding: '8px 16px' }}
          >
            {mprUploading ? 'Uploading...' : 'Upload Image'}
          </button>
        </form>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
            gap: 16,
          }}
        >
          {mprAchievements.map((ach) => (
            <div
              key={ach.id}
              style={{
                border: '1px solid #334155',
                borderRadius: 8,
                padding: 8,
                position: 'relative',
                background: '#0f172a',
              }}
            >
              <img
                src={ach.image}
                alt="MPR Achiever"
                style={{
                  width: '100%',
                  height: 100,
                  objectFit: 'cover',
                  borderRadius: 4,
                }}
              />
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginTop: 8,
                }}
              >
                <div style={{ display: 'flex', gap: 4 }}>
                  <button
                    onClick={() => moveMPR(ach.id, 'up')}
                    style={{ padding: '2px 6px', fontSize: '.7rem' }}
                  >
                    ↑
                  </button>
                  <button
                    onClick={() => moveMPR(ach.id, 'down')}
                    style={{ padding: '2px 6px', fontSize: '.7rem' }}
                  >
                    ↓
                  </button>
                </div>
                <button
                  onClick={() => removeMPR(ach.id)}
                  style={{
                    padding: '2px 6px',
                    fontSize: '.7rem',
                    background: '#ef4444',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 4,
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
          {mprAchievements.length === 0 && (
            <div
              style={{
                fontSize: '.85rem',
                opacity: 0.7,
                textAlign: 'center',
                gridColumn: '1/-1',
              }}
            >
              No MPR achiever images yet.
            </div>
          )}
        </div>
      </div>

      {/* 7. Top Team Leaders — Manage Board */}
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
        <div
          style={{
            textAlign: 'right',
            marginBottom: 8,
            display: 'flex',
            gap: 8,
            justifyContent: 'flex-end',
          }}
        >
          <button
            className="btn"
            onClick={undoLeaders}
            disabled={!prevLeaders}
            style={{
              padding: '6px 12px',
              fontSize: '.85rem',
              transition: 'transform .15s ease, background-color .15s ease',
            }}
          >
            Undo last change
          </button>
          <button
            className="btn secondary"
            onClick={() => {
              saveLeaders([]);
              setLeaders(getLeaders());
              resetForm();
            }}
            style={{
              background: '#ef4444',
              color: '#fff',
              padding: '6px 12px',
              fontSize: '.85rem',
              transition: 'transform .15s ease, background-color .15s ease',
            }}
          >
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
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    borderRadius: 6,
                  }}
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
            <button
              className="btn"
              type="submit"
              style={{
                padding: '6px 12px',
                fontSize: '.85rem',
                transition: 'transform .15s ease, background-color .15s ease',
              }}
            >
              {editing ? 'Update Leader' : 'Add Leader'}
            </button>
            {editing ? (
              <button
                className="btn secondary"
                type="button"
                onClick={resetForm}
                style={{
                  padding: '6px 12px',
                  fontSize: '.85rem',
                  transition: 'transform .15s ease, background-color .15s ease',
                }}
              >
                Cancel
              </button>
            ) : null}
          </div>
        </form>
        <div style={{ overflowX: 'auto', marginTop: 12 }}>
          <table
            style={{
              width: '100%',
              minWidth: 700,
              borderCollapse: 'collapse',
              fontSize: '.9rem',
            }}
          >
            <thead>
              <tr>
                <th style={{ whiteSpace: 'nowrap' }}>S.No</th>
                <th style={{ whiteSpace: 'nowrap' }}>Photo</th>
                <th style={{ whiteSpace: 'nowrap' }}>Name</th>
                <th style={{ whiteSpace: 'nowrap' }}>Rank Name</th>
                <th style={{ whiteSpace: 'nowrap' }}>Location</th>
                <th style={{ whiteSpace: 'nowrap' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {leaders.map((l) => (
                <tr key={l.id}>
                  <td style={{ whiteSpace: 'nowrap' }}>{l.sno}</td>
                  <td style={{ whiteSpace: 'nowrap' }}>
                    {l.photo ? (
                      <div
                        style={{
                          width: 42,
                          height: 56,
                          padding: 2,
                          background: '#fff',
                          border: '2px solid #ffffff',
                          borderRadius: 6,
                          display: 'inline-block',
                        }}
                      >
                        <img
                          src={resolvePhoto(l.photo)}
                          alt={l.name}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            borderRadius: 4,
                          }}
                        />
                      </div>
                    ) : (
                      '-'
                    )}
                  </td>
                  <td
                    style={{
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      maxWidth: 220,
                    }}
                  >
                    {l.name}
                  </td>
                  <td style={{ whiteSpace: 'nowrap' }}>{l.title}</td>
                  <td style={{ whiteSpace: 'nowrap' }}>{l.loc}</td>
                  <td
                    style={{
                      display: 'flex',
                      gap: 6,
                      justifyContent: 'center',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    <button
                      className="btn"
                      type="button"
                      onClick={() => move(l.id, 'up')}
                    >
                      Up
                    </button>
                    <button
                      className="btn"
                      type="button"
                      onClick={() => move(l.id, 'down')}
                    >
                      Down
                    </button>
                    <button
                      className="btn"
                      type="button"
                      onClick={() => editLeader(l.id)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn secondary"
                      type="button"
                      onClick={() => removeLeader(l.id)}
                      style={{ background: '#ef4444', color: '#fff' }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
