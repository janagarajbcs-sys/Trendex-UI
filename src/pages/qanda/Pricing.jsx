import QASection from './Common.jsx'
const items = [
  { q: '61. What plans does Trendex offer?', a: 'only yearly plans, not a lifetime plans.' },
  { q: '62. How do I pay?', a: 'only through crypto currency USDT stable coin.' },
  { q: '63. Is renewal automatic?', a: 'No, auto-renew in settings.' },
  { q: '64. Can I change my plan later?', a: 'Yes — can be upgrade; not with the balance payment of existing plan. completly start with new payment' },
  { q: '65. Do you offer refunds?', a: 'Generally only before activation; after activation fees are typically non-refundable per policy.' },
  { q: '66. Is there any discount?', a: 'Fixed plan that cannot be negotiable.' },
  { q: '67. Can I pay in my local currency?', a: 'No, Only USDT currencies supported.' },
  { q: '68. Is it Verified Business subscription?', a: 'A third-party offering some users mention; consider that this is Binance Verified official bot.' },
  { q: '69. How is VAT/GST handled?', a: 'it is Not an local business.internatnal level where not applicable.' },
  { q: '70. Can i join immediately?', a: 'Yes — immediately can join and start trading.' },
  { q: '71. How do i get support from companies?', a: 'Yes after the Monarch rank completion. you get an support section in your id.' },
  { q: '72. Can I split payment for joining?', a: 'No, only do with single transaction.' },
  { q: '73. Is there a free plan?', a: 'Actually, you can earn back the inverstment.when you understand & work perfectly.Please get clear about our earning plan.' },
  { q: '74. What payment receipts will I get?', a: 'Email invoice/receipt and shows transaction history details in your id.' },
  { q: '75. Can I pause my subscription?', a: 'No, only you can use the services.when once you subscribed.' },
  { q: '76. Are there team plans?', a: 'Yes — with multi-user access with different countries and different leaders.' },
  { q: '77. Are any additinal fees required?', a: 'appart from the subscription. Need to spend an additnal capital amount and fuel fees.' },
  { q: '78. Can I get a refund if service not working?', a: 'Refunds per policy—typically pre-activation. Supports may offer solutions.' },
  { q: '79. Is there a loyalty program?', a: 'Occasional loyalty benefits for long-term customers.' },
  { q: '80. How do promotions work?', a: 'Life-time Platform,to get bonus of referral rates with varying terms and Leaders.' },
]
export default function Pricing() {
  return <QASection title="Payments & Plans" items={items} />
}
