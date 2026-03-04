import QASection from './Common.jsx'
const items = [
  { q: '21. How does Trendex choose trades?', a: 'The AI analyses market data, technical indicators and risk rules to identify entries and exits based on tested strategies.' },
  { q: '22. What is the recommended risk per trade?', a: 'Recommended risk varies by strategy; commonly 0%–20% of capital per trade is used as a guideline.' },
  { q: '23. Does Trendex use leverage?', a: 'Leverage is used for futures strategies. Fully automatic choising coins and leverage' },
  { q: '24. Can I set my own stop loss and take profit?', a: 'No — Fully automatic SL/TP and allocation parameters.' },
  { q: '25. How many strategies are available?', a: '9 pre-built strategies. Can use all in the single subscription.' },
  { q: '26. Can I run multiple strategies simultaneously?', a: 'No — users cannot run multiple strategies on different pairs or accounts simultaneously.' },
  { q: '27. Are you providing signals?', a: 'No, real-time trade execution fully automatic using API permissions.' },
  { q: '28. Can I backtest strategies?', a: 'No — backtesting & historical performance are available in approptriate start bot button' },
  { q: '29. What indicators are used?', a: 'Combinations like RSI, EMA, MACD, volume filters and proprietary models depending on strategy.' },
  { q: '30. How do I choose a strategy?', a: 'Match your goals: steady returns, higher frequency, or conservative long-term approaches and review backtests.' },
  { q: '31. Will Trendex trade my entire account?', a: 'No, the bot never uses full capitel amount in single buy.' },
  { q: '32. How often should I monitor the bot?', a: 'No need to moniter the screen. set and sit free is recommended.' },
  { q: '33. What happens during high volatility?', a: 'Volatility filters and risk adjustments; automatically reduce size or pause the trade.' },
  { q: '34. Can I set daily loss limits?', a: 'No — it not run trading daily. after the confermation only it start running.' },
  { q: '35. What is the without loss strategy?', a: 'DCA Trading stratagy, 0% loss this ensures you capital amount safe.' },
  { q: '36. Are there alerts for trades?', a: 'Yes — via email and Bell Butten notification you can get trade alerts.' },
  { q: '37. Can I copy trades manually?', a: 'Yes some peoples try to do this. but you cant find the tp/sl in position. where the bot start and ends.' },
  { q: '38. Can I switch the bot strategy?', a: 'Yes possible - but dont switch daily, weekly basics, staying in one stratagie is the best way to get more profit.' },
  { q: '39. Can I take out full capital?', a: 'yes,possible but I recommend to keep it for an long term minimum 3 months.' },
  { q: '40. How can i get a trade knowleges?', a: 'always stay connected with leaders, to get an proper updates of trade.' },
]
export default function Trading() {
  return <QASection title="Trading Questions" items={items} />
}
