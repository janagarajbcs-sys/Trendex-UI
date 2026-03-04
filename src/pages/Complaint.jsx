import { useState } from 'react'
import { submitComplaintResponse } from '../lib/premium'

export default function Complaint() {
  const [done, setDone] = useState(false)
  async function onSubmit(e) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const payload = {
      type: String(fd.get('type') || '').trim(),
      name: String(fd.get('name') || '').trim(),
      contact: String(fd.get('contact') || '').trim(),
      message: String(fd.get('message') || '').trim(),
    }
    if (!payload.type || !payload.name || !payload.contact || !payload.message) {
      setDone(false)
      return
    }
    const ok = await submitComplaintResponse(payload)
    setDone(ok)
    if (ok) e.currentTarget.reset()
  }
  return (
    <div style={{ maxWidth: 520, margin: '0 auto' }}>
      <h1 style={{ color: '#00ddeb' }}>Suggestion / Complaint</h1>
      <form onSubmit={onSubmit} className="card" style={{ display: 'grid', gap: 10 }}>
        <label>
          <span>Type</span>
          <select name="type" required style={{ width: '100%', marginTop: 6, padding: 10, borderRadius: 8 }}>
            <option value="">Select</option>
            <option>Suggestion</option>
            <option>Complaint</option>
          </select>
        </label>
        <label>
          <span>Your Name</span>
          <input name="name" required placeholder="Enter your name" style={{ width: '100%', marginTop: 6, padding: 10, borderRadius: 8 }} />
        </label>
        <label>
          <span>Email / Mobile</span>
          <input name="contact" required placeholder="Enter contact details" style={{ width: '100%', marginTop: 6, padding: 10, borderRadius: 8 }} />
        </label>
        <label>
          <span>Message</span>
          <textarea name="message" rows={4} required placeholder="Write your message..." style={{ width: '100%', marginTop: 6, padding: 10, borderRadius: 8 }} />
        </label>
        <button className="btn" type="submit">Submit</button>
        {done && <div style={{ color: '#22c55e', textAlign: 'center' }}>Submitted successfully!</div>}
      </form>
    </div>
  )
}
