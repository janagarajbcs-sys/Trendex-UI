import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';

export default function Bot() {
  const [inr, setInr] = useState('');
  const [usdt, setUsdt] = useState('');
  const calculatorRef = useRef(null);
  const rate = 97;
  const bots = [
    {
      name: 'DCA Bot',
      desc: [
        'Only runs in top BTC/USDT pair (Spot)',
        'Algorithm-based averaging',
        'Buys in downtrend, sells on uptrend',
      ],
      capital: '15 USDT',
      risk: 'Low Risk',
    },
    {
      name: 'Nero Bot',
      desc: [
        'Full averaging system (Futures)',
        'Top 25 pairs',
        '≈95% accuracy / 5% risk',
      ],
      capital: '700 USDT',
      risk: 'Low Risk',
    },
    {
      name: 'Quent Bot',
      desc: [
        'Gold Based trading pair (Futures)',
        'Paxg/usdt pairs',
        '≈99% accuracy / 1% risk',
      ],
      capital: '500 USDT',
      isGold: true,
      risk: 'Medium Risk',
    },
    {
      name: 'Fin Bot',
      desc: [
        'Gold Based trading pair (Futures)',
        'Paxg/usdt pairs',
        '≈99% accuracy / 1% risk',
      ],
      capital: '200 USDT',
      isGold: true,
      risk: 'Medium Risk',
    },
    {
      name: 'Zeno Bot',
      desc: [
        'Swing trading (Futures)',
        'Top 50 pairs',
        '≈80% accuracy / 20% risk',
      ],
      capital: '200 USDT',
      risk: 'High Risk',
    },
    {
      name: 'Candles Bot',
      desc: [
        'Light averaging (Futures)',
        'Top 50 pairs',
        '≈85% accuracy / 15% risk',
      ],
      capital: '200 USDT',
      risk: 'High Risk',
    },
    {
      name: 'Zeno 3x Bot',
      desc: [
        'Minimum version of Zeno',
        'Top 50 pairs',
        '≈80% accuracy / 20% risk',
      ],
      capital: '100 USDT',
      risk: 'High Risk',
    },
    {
      name: 'Candle 3x Bot',
      desc: [
        'Minimum version of Candles',
        'Top 50 pairs',
        '≈85% accuracy / 15% risk',
      ],
      capital: '100 USDT',
      risk: 'High Risk',
    },
  ];
  const formatINR = (n) => Number(n).toLocaleString('en-IN');
  const monthlyRange = (x) => [x * 0.05, x * 0.3];
  const yearlyRange = (x) => [x * 0.6, x * 3.6];
  const onInr = (v) => {
    const val = parseFloat(v || 0);
    if (val > 0) {
      const u = +(val / rate).toFixed(2);
      setInr(val);
      setUsdt(u);
    } else {
      setInr('');
      setUsdt('');
    }
  };
  const onUsdt = (v) => {
    const val = parseFloat(v || 0);
    if (val > 0) {
      const i = +(val * rate).toFixed(2);
      setUsdt(val);
      setInr(i);
    } else {
      setInr('');
      setUsdt('');
    }
  };

  const handleBotClick = (capitalStr) => {
    const val = parseFloat(capitalStr.replace(' USDT', ''));
    onUsdt(val);
    calculatorRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div>
      <h1
        style={{
          color: '#00ddeb',
          textShadow: '0 0 15px rgba(0, 221, 235, 0.4)',
        }}
      >
        Trading Strategies
      </h1>
      <p>
        Single subscription gives access to 8 strategies for Both Spot &
        Futures.
        <br />
        <span
          style={{
            fontSize: '0.85rem',
            fontWeight: 'bold',
            color: '#22C55E',
            display: 'inline-block',
            padding: '8px 12px',
            borderRadius: '8px',
            background: 'rgba(34, 197, 94, 0.1)',
            border: '1px solid rgba(34, 197, 94, 0.3)',
            marginTop: 8,
            marginBottom: 8,
          }}
        >
          Keep your Funds in your Own Binance Wallet
        </span>
        <br />
        (Trendex bot Never Store your Trading Funds).
      </p>

      <div
        style={{
          display: 'grid',
          gap: 12,
          gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))',
          justifyItems: 'center',
        }}
      >
        {bots.map((b) => (
          <div
            key={b.name}
            className="card"
            style={{
              textAlign: 'center',
              width: '100%',
            }}
          >
            <h3
              style={{
                color: '#cfeef3',
                marginTop: 0,
                marginBottom: 4,
              }}
            >
              {b.name}
            </h3>
            <div
              style={{
                fontSize: '0.85rem',
                fontWeight: 'bold',
                color:
                  b.risk === 'Low Risk'
                    ? '#22C55E'
                    : b.risk === 'Medium Risk'
                      ? '#F59E0B'
                      : '#EF4444',
                marginBottom: 12,
                display: 'inline-block',
                padding: '2px 8px',
                borderRadius: '4px',
                background:
                  b.risk === 'Low Risk'
                    ? 'rgba(34, 197, 94, 0.1)'
                    : b.risk === 'Medium Risk'
                      ? 'rgba(245, 158, 11, 0.1)'
                      : 'rgba(239, 68, 68, 0.1)',
              }}
            >
              {b.risk}
            </div>
            <ul
              style={{
                listStylePosition: 'inside',
                padding: 0,
                margin: 0,
                textAlign: 'left',
              }}
            >
              {b.desc.map((d) => (
                <li key={d}>{d}</li>
              ))}
            </ul>
            <div style={{ marginTop: 12 }}>
              <button
                onClick={() => handleBotClick(b.capital)}
                style={{
                  background: b.isGold
                    ? 'linear-gradient(135deg, #ffd700 0%, #b8860b 100%)'
                    : '#2563EB',
                  color: b.isGold ? '#000' : '#fff',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '20px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  boxShadow: b.isGold
                    ? '0 4px 12px rgba(218, 165, 32, 0.4)'
                    : '0 4px 12px rgba(37, 99, 235, 0.25)',
                  transition: 'all 0.2s',
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'scale(1.05)';
                  e.currentTarget.style.background = b.isGold
                    ? 'linear-gradient(135deg, #ffed4a 0%, #daa520 100%)'
                    : '#1D4ED8';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.background = b.isGold
                    ? 'linear-gradient(135deg, #ffd700 0%, #b8860b 100%)'
                    : '#2563EB';
                }}
              >
                Start with {b.capital}
              </button>
            </div>
          </div>
        ))}
      </div>

      <div
        ref={calculatorRef}
        className="card"
        style={{
          margin: '16px auto',
          maxWidth: 520,
          textAlign: 'center',
          border: '2px solid #d1d5db',
          boxShadow: '0 0 20px rgba(209, 213, 219, 0.15)',
          background: 'linear-gradient(145deg, #f3f4f6, #e5e7eb)',
        }}
      >
        <h2
          style={{
            marginTop: 0,
            color: '#1f2937',
            textShadow: '0 0 12px rgba(31, 41, 55, 0.1)',
          }}
        >
          Capital & Returns Calculator
        </h2>
        <label
          style={{
            display: 'block',
            marginTop: 8,
            textAlign: 'center',
            color: '#1f2937',
          }}
        >
          Enter Capital in INR
          <input
            style={{
              width: '100%',
              marginTop: 6,
              padding: 10,
              borderRadius: 8,
              border: '1px solid #9ca3af',
              background: '#ffffff',
              color: '#1f2937',
            }}
            type="number"
            placeholder="₹ INR"
            value={inr}
            onChange={(e) => onInr(e.target.value)}
          />
        </label>
        <label
          style={{
            display: 'block',
            marginTop: 8,
            textAlign: 'center',
            color: '#1f2937',
          }}
        >
          Enter Capital in USDT
          <input
            style={{
              width: '100%',
              marginTop: 6,
              padding: 10,
              borderRadius: 8,
              border: '1px solid #9ca3af',
              background: '#ffffff',
              color: '#1f2937',
            }}
            type="number"
            placeholder="USDT"
            value={usdt}
            onChange={(e) => onUsdt(e.target.value)}
          />
        </label>
        {!!inr && !!usdt && (
          <div
            style={{
              marginTop: 12,
              padding: 12,
              borderRadius: 8,
              background: '#ffffff',
              border: '1px solid rgba(156, 163, 175, 0.3)',
              color: '#1f2937',
            }}
          >
            <div>
              <strong>Monthly:</strong> INR ₹
              {formatINR(monthlyRange(inr)[0].toFixed(2))} - ₹
              {formatINR(monthlyRange(inr)[1].toFixed(2))}
            </div>
            <div>
              <strong>Monthly:</strong> USDT {monthlyRange(usdt)[0].toFixed(2)}{' '}
              - {monthlyRange(usdt)[1].toFixed(2)}
            </div>
            <div>
              <strong>Yearly:</strong> INR ₹
              {formatINR(yearlyRange(inr)[0].toFixed(2))} - ₹
              {formatINR(yearlyRange(inr)[1].toFixed(2))}
            </div>
            <div>
              <strong>Yearly:</strong> USDT {yearlyRange(usdt)[0].toFixed(2)} -{' '}
              {yearlyRange(usdt)[1].toFixed(2)}
            </div>
          </div>
        )}
        <div
          style={{
            marginTop: 12,
            fontSize: '0.85rem',
            fontWeight: 'bold',
            color: '#22C55E',
            display: 'inline-block',
            padding: '8px 12px',
            borderRadius: '8px',
            background: 'rgba(34, 197, 94, 0.1)',
            border: '1px solid rgba(34, 197, 94, 0.3)',
          }}
        >
          Monthly 5% to 30%
          <br />
          Yearly 60% to 360%
        </div>
        <div
          style={{
            marginTop: 10,
            color: '#4b5563',
            fontSize: '.9rem',
            opacity: 0.9,
          }}
        >
          <div>as per the doller price 97 Rs i have calculated.</div>
        </div>
        <div
          style={{
            marginTop: 12,
            fontSize: '0.85rem',
            fontWeight: 'bold',
            color: '#F59E0B',
            display: 'inline-block',
            padding: '8px 12px',
            borderRadius: '8px',
            background: 'rgba(245, 158, 11, 0.1)',
            border: '1px solid rgba(245, 158, 11, 0.3)',
          }}
        >
          Deponds on the market movement
          <br />
          The results(returns) will be differ
        </div>
        <div
          style={{
            marginTop: 10,
            color: '#4b5563',
            fontSize: '.9rem',
            opacity: 0.9,
          }}
        >
          <div>so keep your funds atleast for 6 month durations Minimum</div>
        </div>
        <div
          style={{
            marginTop: 12,
            fontSize: '0.85rem',
            fontWeight: 'bold',
            color: '#EF4444',
            display: 'inline-block',
            padding: '8px 12px',
            borderRadius: '8px',
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
          }}
        >
          Real trading does not provide stable, guaranteed, or assured returns
        </div>
      </div>

      <div
        style={{
          textAlign: 'center',
          marginTop: 32,
          marginBottom: 40,
          display: 'flex',
          gap: 16,
          justifyContent: 'center',
          flexWrap: 'wrap',
        }}
      >
        <a
          className="btn"
          href="tel:+918012202083"
          style={{
            display: 'inline-block',
            padding: '12px 28px',
            fontSize: '1.1rem',
            fontWeight: 'bold',
            borderRadius: '30px',
            textDecoration: 'none',
            background: '#3B82F6',
            color: '#fff',
            boxShadow: '0 6px 20px rgba(59, 130, 246, 0.3)',
            transition: 'all 0.3s ease',
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = 'translateY(-3px)';
            e.currentTarget.style.background = '#2563EB';
            e.currentTarget.style.boxShadow =
              '0 10px 25px rgba(59, 130, 246, 0.4)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.background = '#3B82F6';
            e.currentTarget.style.boxShadow =
              '0 6px 20px rgba(59, 130, 246, 0.3)';
          }}
        >
          📞 Call Now
        </a>

        <Link
          className="btn"
          to="/#join-business"
          style={{
            display: 'inline-block',
            padding: '12px 28px',
            fontSize: '1.1rem',
            fontWeight: 'bold',
            borderRadius: '30px',
            textDecoration: 'none',
            background: '#22C55E',
            color: '#fff',
            boxShadow: '0 6px 20px rgba(34, 197, 94, 0.3)',
            transition: 'all 0.3s ease',
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = 'translateY(-3px)';
            e.currentTarget.style.background = '#16A34A';
            e.currentTarget.style.boxShadow =
              '0 10px 25px rgba(34, 197, 94, 0.4)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.background = '#22C55E';
            e.currentTarget.style.boxShadow =
              '0 6px 20px rgba(34, 197, 94, 0.3)';
          }}
        >
          Join / Subscribe Now
        </Link>
      </div>
    </div>
  );
}
