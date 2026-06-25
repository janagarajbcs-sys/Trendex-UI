export default function HowItWorks() {
  return (
    <div>
      <h1 style={{ color: '#00ddeb' }}>How It Works</h1>
      <div className="card">
        <h2>Getting Started with Trendex AI</h2>
        <p>Follow these simple steps to start using Trendex AI trading bots.</p>

        <h2>Step 1: Join Our Community</h2>
        <p>
          Register and join our community. Get access to our trading strategies,
          educational content, and support.
        </p>

        <h2>Step 2: Choose Your Trading Bot</h2>
        <p>We offer 8 different trading strategies:</p>
        <ul>
          <li>
            <strong>DCA Bot</strong> - Low risk, spot trading
          </li>
          <li>
            <strong>Nero Bot</strong> - Low risk, futures with full averaging
          </li>
          <li>
            <strong>Quent Bot</strong> - Medium risk, gold-based futures
          </li>
          <li>
            <strong>Fin Bot</strong> - Medium risk, gold-based futures
          </li>
          <li>
            <strong>Zeno Bot</strong> - High risk, swing trading futures
          </li>
          <li>
            <strong>Candles Bot</strong> - High risk, light averaging futures
          </li>
          <li>
            <strong>Zeno 3x Bot</strong> - High risk, minimum Zeno variant
          </li>
          <li>
            <strong>Candle 3x Bot</strong> - High risk, minimum Candles variant
          </li>
        </ul>

        <h2>Step 3: Set Up Your Binance Account</h2>
        <p>
          Create or log into your Binance account. You will need to set up API
          keys for the trading bot to execute trades on your behalf.
        </p>
        <div
          style={{
            fontSize: '0.85rem',
            fontWeight: 'bold',
            color: '#22C55E',
            display: 'inline-block',
            padding: '8px 12px',
            borderRadius: '8px',
            background: 'rgba(34, 197, 94, 0.1)',
            border: '1px solid rgba(34, 197, 94, 0.3)',
            margin: '12px 0',
          }}
        >
          KEEP YOUR FUNDS IN YOUR OWN BINANCE WALLET - WE NEVER STORE YOUR FUNDS
        </div>

        <h2>Step 4: Configure Your Bot</h2>
        <p>
          Connect your Binance API and configure your trading parameters
          including:
        </p>
        <ul>
          <li>Trading pair selection</li>
          <li>Investment amount</li>
          <li>Risk management settings</li>
          <li>Trading strategy preferences</li>
        </ul>

        <h2>Step 5: Monitor and Learn</h2>
        <p>
          Watch your bot trade automatically. Use our calculator to estimate
          potential returns (5%-30% monthly, 60%-360% yearly - depending on
          market conditions).
        </p>

        <h2>Important Notes</h2>
        <ul>
          <li>Start with a smaller investment to learn</li>
          <li>Monitor your positions regularly</li>
          <li>Be prepared for market volatility</li>
          <li>Keep funds invested for at least 6 months minimum</li>
        </ul>

        <div
          style={{
            fontSize: '0.85rem',
            fontWeight: 'bold',
            color: '#EF4444',
            display: 'inline-block',
            padding: '8px 12px',
            borderRadius: '8px',
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            marginTop: '16px',
          }}
        >
          RESULTS DEPEND ON MARKET MOVEMENT - NO GUARANTEED RETURNS
        </div>

        <p style={{ marginTop: '20px' }}>
          <em>Last updated: April 2026</em>
        </p>
      </div>
    </div>
  );
}
