export default function Contact() {
  return (
    <div>
      <h1 style={{ color: '#00ddeb' }}>Contact Us</h1>
      <div className="card">
        <h2>Get In Touch</h2>
        <p>
          Have questions or need support? We're here to help! Reach out to us
          through any of the channels below.
        </p>

        <h2>Contact Information</h2>

        <div className="card" style={{ marginBottom: '16px' }}>
          <h3 style={{ color: '#22C55E', marginTop: 0 }}>WhatsApp</h3>
          <p>Join our WhatsApp group for community support and updates:</p>
          <a
            href="https://chat.whatsapp.com/JzznVDAlnsPImIlws2p3Ig"
            target="_blank"
            rel="noreferrer"
            className="btn"
            style={{ display: 'inline-block' }}
          >
            Join WhatsApp Group
          </a>
        </div>

        <div className="card" style={{ marginBottom: '16px' }}>
          <h3 style={{ color: '#22C55E', marginTop: 0 }}>WhatsApp Channel</h3>
          <p>
            Follow our WhatsApp channel for latest updates and announcements:
          </p>
          <a
            href="https://whatsapp.com/channel/0029Vb61xAa6hENzJrPD5h1K"
            target="_blank"
            rel="noreferrer"
            className="btn"
            style={{ display: 'inline-block' }}
          >
            Follow WhatsApp Channel
          </a>
        </div>

        <div className="card" style={{ marginBottom: '16px' }}>
          <h3 style={{ color: '#22C55E', marginTop: 0 }}>Phone</h3>
          <p>Call us directly for immediate assistance:</p>
          <a
            href="tel:+918012202083"
            className="btn"
            style={{ display: 'inline-block' }}
          >
            📞 Call Now: +91 80122 02083
          </a>
        </div>

        <div className="card" style={{ marginBottom: '16px' }}>
          <h3 style={{ color: '#22C55E', marginTop: 0 }}>YouTube</h3>
          <p>Watch our tutorials and trading strategy videos:</p>
          <a
            href="https://youtube.com/@aitrendex_tamil?si=iCJ9LMew-CB0hvki"
            target="_blank"
            rel="noreferrer"
            className="btn"
            style={{ display: 'inline-block' }}
          >
            Subscribe to YouTube
          </a>
        </div>

        <h2>Other Support Options</h2>
        <ul>
          <li>
            <strong>Complaints/Suggestions:</strong> Use our{' '}
            <a href="/complaint" style={{ color: 'var(--neon)' }}>
              Complaint Form
            </a>
          </li>
          <li>
            <strong>FAQ:</strong> Check our{' '}
            <a href="/qanda/company" style={{ color: 'var(--neon)' }}>
              Frequently Asked Questions
            </a>
          </li>
          <li>
            <strong>Premium Support:</strong> Access premium support through
            your premium account
          </li>
        </ul>

        <h2>Response Time</h2>
        <p>
          We strive to respond to all inquiries within 24-48 hours. For urgent
          matters, please use the phone or WhatsApp channels for faster
          response.
        </p>

        <h2>Business Hours</h2>
        <p>
          Our support team is available Monday to Saturday, 9:00 AM to 8:00 PM
          IST.
        </p>

        <p>
          <em>Last updated: April 2026</em>
        </p>
      </div>
    </div>
  );
}
