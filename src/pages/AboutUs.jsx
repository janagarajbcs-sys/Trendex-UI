export default function AboutUs() {
  return (
    <div>
      <h1 style={{ color: '#00ddeb' }}>About Us</h1>
      <div className="card">
        <div style={{ marginBottom: '24px', padding: '16px', background: 'rgba(0, 221, 235, 0.1)', borderRadius: '8px', borderLeft: '4px solid #00ddeb' }}>
          <p style={{ margin: 0, fontSize: '0.95rem' }}>
            <strong>Note:</strong> This is a supporting website designed to explain the benefits of Trendex AI's main platform.
          </p>
        </div>

        <h2>Welcome to Trendex AI</h2>
        <p>
          Trendex AI is a leading platform for automated cryptocurrency trading, 
          bringing cutting-edge technology and proven strategies to traders of all levels.
        </p>

        <h2>Our Mission</h2>
        <p>
          To empower traders with intelligent automation tools that help them 
          navigate the volatile cryptocurrency markets with confidence and precision.
        </p>

        <h2>What We Offer</h2>
        <ul>
          <li>8 different trading strategies for both Spot and Futures markets</li>
          <li>AI-driven risk management systems</li>
          <li>Real-time market analysis and automated execution</li>
          <li>Educational content and premium courses</li>
          <li>Community support and guidance</li>
        </ul>

        <h2>Our Approach</h2>
        <p>
          We believe in transparency and security. Our trading bots never store 
          your funds - you always keep your funds in your own Binance Wallet. 
          We provide the tools and strategies, you maintain full control of your assets.
        </p>

        <h2>Why Choose Trendex AI?</h2>
        <ul>
          <li>Proven trading strategies with consistent results</li>
          <li>24/7 automated trading execution</li>
          <li>Advanced risk management features</li>
          <li>Active community and expert support</li>
          <li>Continuous improvement and updates</li>
        </ul>

        <h2>Our Team</h2>
        <p>
          Founded by experienced traders and developers, Trendex AI combines 
          deep market knowledge with cutting-edge technology to deliver 
          exceptional trading solutions.
        </p>

        <div style={{ marginTop: '32px', textAlign: 'center' }}>
          <a 
            href="https://aitrendex.com/aboutus" 
            target="_blank" 
            rel="noreferrer" 
            className="btn"
            style={{ display: 'inline-block' }}
          >
            About Company
          </a>
        </div>

        <p style={{ marginTop: '24px' }}>
          <em>Last updated: April 2026</em>
        </p>
      </div>
    </div>
  );
}
