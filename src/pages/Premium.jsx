import { Link } from 'react-router-dom';

export default function Premium() {
  return (
    <div>
      <h1 style={{ color: '#00ddeb' }}>Premium Access</h1>
      <h3>Terms and Conditions</h3>
      <ul style={{ display: 'inline-block', textAlign: 'left' }}>
        <li>
          This Premium Access is designed to train members who have already
          joined the program.
        </li>
        <li
          style={{
            fontSize: '0.85rem',
            fontWeight: 'bold',
            color: '#EF4444',
            display: 'inline-block',
            padding: '8px 12px',
            borderRadius: '8px',
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            marginTop: 4,
            marginBottom: 4,
          }}
        >
          It is exclusively designed for the individuals who are a part of
          Janagaraj Sir's community.
        </li>
        <li>
          Your request has been approved only after successful verification and
          call confirmation.
        </li>
        <li>
          You will learn through a perfectly structured system designed to help
          you improve your knowledge and earn more.
        </li>
        <li
          style={{
            fontSize: '0.85rem',
            fontWeight: 'bold',
            color: '#22C55E',
            display: 'inline-block',
            padding: '8px 12px',
            borderRadius: '8px',
            background: 'rgba(34, 197, 94, 0.1)',
            border: '1px solid rgba(34, 197, 94, 0.3)',
            marginTop: 4,
            marginBottom: 4,
          }}
        >
          After the approval date, you will receive 7 days of free access.
        </li>
        <li>
          During this period, you must complete all the assigned tasks to
          receive your completion certificate.
        </li>
        <li>Your progress will be monitored stage by stage.</li>
        <li>
          If any form of misconduct or inappropriate behavior is identified,
          your access will be disabled immediately by the admin.
        </li>
        <li>
          If you need to access this more than 7 days, you can request the admin
          to extend your access. Rs: 499 will be charged per month.
        </li>
      </ul>
      <div
        style={{
          display: 'flex',
          gap: 12,
          justifyContent: 'center',
          flexWrap: 'wrap',
          marginTop: 12,
        }}
      >
        <Link className="btn" to="/premium/login">
          Login →
        </Link>
        <Link className="btn secondary" to="/premium/signup">
          Sign Up →
        </Link>
      </div>
    </div>
  );
}
