import QASection from './Common.jsx'
const items = [
  { q: '41. How does the referral program work?', a: 'Share your referral link. When someone subscribes through it, you earn a commission based on their plan.' },
  { q: '42. How much can I earn per referral?', a: 'for Direct Refferal 25$ (10% of the sale amount) and additionaly 30$ for the Pair matching.' },
  { q: '43. When do I receive referral payouts?', a: 'Instently you will receive or in evening 5.30 IST for every day.you will receive' },
  { q: '44. Are referral earnings taxable?', a: 'NO — during withdrawel & Deposit. just 1 doller deducted as an tax.' },
  { q: '45. Can I track my referrals?', a: 'Yes — dashboard shows everything in the team glance option.' },
  { q: '46. Is there a referral hierarchy (multi-level)?', a: 'Yes - in Pair matching you will get an multi-level rewards; check program details.' },
  { q: '47. Can referrals come from group links?', a: 'Yes — share links in groups or social media respecting platform terms and regulations.' },
  { q: '48. What type of Marketing is this?', a: 'Affiliate Marketing program throug link or referral only can able to join.' },
  { q: '49. How are referral payments made?', a: 'instentl recived to the appropriate crypto wallet and address.' },
  { q: '50. Can I get any discounts?', a: 'No fixed plan that cannot be negotiable.' },
  { q: '51. Are referral links permanent?', a: 'Yes, link is permanent.but within 24 hours need to be subscribe. otherwise registration expires.' },
  { q: '52. How do I get a referral link?', a: 'contact the persons who already exist using this software.also for supporting you he/she is responsible.' },
  { q: '53. Can I see who signed up with my link?', a: 'No, only counts are displyed not able to see the full details of the registered user.' },
  { q: '54. Do referrals need to pass KYC?', a: 'No, only crypto wallet or exchange account is needed.' },
  { q: '55. What is the minimum payout threshold?', a: 'A minimum threshold $10 may apply before payout.' },
  { q: '56. Can I be removed from the referral program?', a: 'Yes — violations of terms can lead to suspension or removal.' },
  { q: '57. Are referral dashboards real-time?', a: 'Yes, it was commen to all users.encrypted with highly secured systems' },
  { q: '58. Can I withdraw referral earnings immediately?', a: 'Yes,Available in your wallet amount is immediately withdrawable.' },
  { q: '59. What if a referred user requests a refund?', a: 'No, the Subscription Related systems are not refunable. only they can use the service,until expire.' },
  { q: '60. Where can I get promotional materials?', a: 'From the appropriate leaders of you.get materials and tools.' },
]
export default function Refer() {
  return <QASection title="Referral & Earnings" items={items} />
}
