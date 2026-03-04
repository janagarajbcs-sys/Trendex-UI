import { useState } from 'react'
import { Link } from 'react-router-dom'

export default function QASection({ title, items = [] }) {
  const [query, setQuery] = useState('')
  const list = query
    ? items.filter((x) => {
        const t = query.trim().toLowerCase()
        return x.q.toLowerCase().includes(t) || x.a.toLowerCase().includes(t)
      })
    : items
  return (
    <div>
      <h1 style={{ color: '#00ddeb' }}>{title}</h1>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 12 }}>
        <Link className="btn secondary" to="/qanda/company">Trendex Basics</Link>
        <Link className="btn secondary" to="/qanda/trading">Trading</Link>
        <Link className="btn secondary" to="/qanda/refer">Referral</Link>
        <Link className="btn secondary" to="/qanda/pricing">Payments</Link>
        <Link className="btn secondary" to="/qanda/support">Support</Link>
      </div>
      <div className="card" style={{ marginBottom: 12 }}>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search questions and answers"
          style={{ width: '100%', padding: 10, borderRadius: 8 }}
        />
      </div>
      <div style={{ display: 'grid', gap: 10 }}>
        {list.length === 0 ? (
          <div className="card">
            <p>No matching questions found.</p>
          </div>
        ) : (
          list.map((q, i) => (
            <details key={i} className="card">
              <summary style={{ cursor: 'pointer' }}>{q.q}</summary>
              <p style={{ marginTop: 8 }}>{q.a}</p>
            </details>
          ))
        )}
      </div>
    </div>
  )
}
