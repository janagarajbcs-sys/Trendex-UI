import { Link } from 'react-router-dom'

export default function Premium() {
  return (
    <div>
      <h1 style={{ color: '#00ddeb' }}>Premium Access</h1>
      <p>Learn with structured videos and unlock modules by passing quizzes.</p>
      <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginTop: 12 }}>
        <Link className="btn" to="/premium/login">Login →</Link>
        <Link className="btn secondary" to="/premium/signup">Sign Up →</Link>
      </div>
    </div>
  )
}
