import QASection from './Common.jsx'
const items = [
  { q: '81. How do I contact support?', a: 'WhatsApp +91 8012202083, forms, youtube channels are available in this website dashboard.' },
  { q: '82. What are support hours?', a: 'Depends on persons; community and automated responses 24/7, dedicated leaders support for paid plans.' },
  { q: '83. How do I report a bug?', a: 'Report via support chat or top leaders with details and screenshots.' },
  { q: '84. What is the support policy?', a: 'from the person by whom you got an referrel link: is the full and full responsible and must dedecated to support you.' },
  { q: '85. How is my privacy handled?', a: 'See privacy policy; API keys encrypted and never shared.' },
  { q: '86. What security measures are in place?', a: 'Encrypted storage, TLS, RBAC, and regular audits.' },
  { q: '87. Can I request data deletion?', a: 'Yes — we remove personal data per retention policy and legal requirements.' },
  { q: '88. What happens to active trades if I cancel?', a: 'Automation stops; positions remain on the exchange for you to manage.' },
  { q: '89. How are disputes handled?', a: 'Use the escalation process via support with full details.' },
  { q: '90. Do you share data with partners?', a: 'Limited sharing with providers Run under agreements; disclosed in policy.' },
  { q: '91. What are acceptable use rules?', a: 'No fraud, abuse, unlawful activities or spam; violations may lead to suspension.' },
  { q: '92. How do I update my profile?', a: 'Enter carefully while id creation not support to change email/phone.' },
  { q: '93. Do you provide Training?', a: 'Yes — Training available to the customers who are intrested and connected with leaders.' },
  { q: '94. What if I lose access to my exchange account?', a: 'immedieatly consider with leaders to know about the next process for recovery.' },
  { q: '95. How long is support response time?', a: 'Depends on availability, but solved within 24 hours.' },
  { q: '96. Are earnings guaranteed?', a: 'No — trading involves risk and no guarantees.but referel and company is guaranteed to run for long term' },
  { q: '97. How do I give feedback?', a: 'Through support form, community channels, or feedback links.' },
  { q: '98. Can i get support from any other leaders in Trendex?', a: 'No- contact your friend who reffered you and get aprropriate support from correct support leaders.' },
  { q: '99. Can I switch to another person terms?', a: 'No, once your id entered means you cant move anywhere.The resubscribe is the only way to switch team.' },
  { q: '100. Who can I contact for partnerships?', a: 'Business development team is open anyone can join and earn by contact.' },
]
export default function Support() {
  return <QASection title="Support & Policy" items={items} />
}
