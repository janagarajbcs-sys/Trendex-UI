import QASection from './Common.jsx'
const items = [
  { q: '1. What is Trendex?', a: 'Trendex is an AI-powered trading platform that provides trade automation in the crypto market.' },
  { q: '2. Who can use Trendex?', a: 'Anyone with a Binance account and Gmail can use Trendex — beginners, students, and experienced traders alike.' },
  { q: '3. Is Trendex a broker or exchange?', a: 'No — Trendex connects to exchanges via API to automate trades; it does not custody user funds.' },
  { q: '4. What markets does Trendex support?', a: 'Trendex supports only the crypto market and soon Forex Loading.' },
  { q: '5. Do I need an account to try Trendex?', a: 'Yes. You need to sign up and subscribe to automate your Spot & Futures trading in crypto.' },
  { q: '6. Is there a free trial?', a: 'No free trial. Review performance and statements with existing customers & users.' },
  { q: '7. How do I create an account?', a: 'Get a referral code from existing users. Sign up, verify email, subscribe, and follow onboarding to connect exchange API or wallet.' },
  { q: '8. What devices are supported?', a: 'Accessible via a responsive web app on desktop and mobile — any modern browser.' },
  { q: '9. Can I use Trendex in my country?', a: 'Trendex operates in many countries. Check local regulations and our terms for compliance.' },
  { q: '10. Who is the owner of Trendex?', a: 'A group company; Trendex is a service provider (like GPay). It never stores your funds and refunds subscription amounts with cashback offers as applicable.' },
  { q: '11. What are unique features of Trendex?', a: 'Provides both Spot and Futures bots and a referral income programmig to help build your own trading capitals.' },
  { q: '12. How does onboarding work?', a: 'Signup, connect exchange API, select a plan, and optionally participate in affiliate/education programs.' },
  { q: '13. Are there educational resources?', a: 'Yes — Leaders provide community groups and meetings to help users understand the product and trading basics.' },
  { q: '14. Can I use Trendex without capital?', a: 'You must subscribe first. After subscription you can earn capital through referral programs.' },
  { q: '15. Is my capital amount safe?', a: 'Trendex places trades securely and with proper money management and risk management (SL/TP).' },
  { q: '16. How can I earn with Trendex?', a: 'Through trading and the referral programming.' },
  { q: '17. How often is the AI updated?', a: 'Models and strategies are updated continuously; frequency depends on research and market changes.' },
  { q: '18. Is it a trustworthy earning platform?', a: 'Operating since 2021 with 4+ years track record per the page; report bugs via support for resolution within 24 hours.' },
  { q: '19. Which is best: Trading or Referral?', a: 'Trading is best if you have big capital; referrals are optional.' },
  { q: '20. About company registration?', a: 'Registered in the US. Previously this name “Trade Box Pro” later updated to “Trendex”.With the same earning plan & features' },
]
export default function Company() {
  return <QASection title="Trendex — Basics" items={items} />
}
