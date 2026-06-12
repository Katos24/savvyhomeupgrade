import Link from 'next/link';
import Nav from '@/components/marketing/Nav';
import Footer from '@/components/marketing/Footer';
import { ArrowRight, CheckCircle, FileText, Download, Receipt, TrendingUp } from 'lucide-react';

export const metadata = {
  title: 'Bookkeeper Partner Program | Lead2Project',
  description: 'Refer your contractor clients to Lead2Project. They get organized. You get clean records every month — not a shoebox in April.',
};

const PAIN_POINTS = [
  'Chasing receipts every month',
  'Clients with no idea what they spent on each job',
  'Shoebox of documents at tax time',
  'No way to see job-level profitability',
  'Manual data entry into QuickBooks',
];

const WHAT_THEY_GET = [
  { icon: <Receipt className="w-5 h-5" />, title: 'Receipts per job', desc: 'Contractors attach receipts directly to each job as they go. No more hunting.' },
  { icon: <Download className="w-5 h-5" />, title: 'QuickBooks export', desc: 'Pull a clean, formatted export whenever you need it. Monthly, not annually.' },
  { icon: <TrendingUp className="w-5 h-5" />, title: 'Job-level records', desc: 'Every job has quotes, payment status, expenses and documents in one place.' },
  { icon: <FileText className="w-5 h-5" />, title: 'Clean data, always', desc: 'Invoices, payment dates, amounts — all tracked and exportable.' },
];

const HOW_IT_WORKS = [
  { step: '01', title: 'You refer a client', desc: 'Share your partner code with a contractor client who needs to get organized.' },
  { step: '02', title: 'They get 3 months free', desc: 'Your client signs up and gets full access. No credit card. No friction.' },
  { step: '03', title: 'They track every job', desc: 'Leads, quotes, schedules, payments and receipts — all in one place.' },
  { step: '04', title: 'You get clean records', desc: 'Pull their QuickBooks export anytime. Stop chasing. Start advising.' },
];

export default function BookkeepersPage() {
  return (
    <>
      <Nav />

      <main className="bg-white">

        {/* HERO */}
        <section className="bg-slate-900 pt-32 pb-20 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <p className="inline-block text-xs font-black uppercase tracking-widest text-emerald-400 border border-emerald-400/30 bg-emerald-400/10 px-4 py-1.5 rounded-full mb-6">
              For Bookkeepers & CPAs
            </p>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white leading-tight tracking-tight mb-6">
              Your contractor clients,<br />
              <span className="text-emerald-400">finally organized.</span>
            </h1>
            <p className="text-lg text-slate-400 font-bold max-w-2xl mx-auto mb-10 leading-relaxed">
              Stop chasing receipts. Stop reconciling shoeboxes every April. Refer your contractor clients to Lead2Project and get clean, job-level records every month.
            </p>
           <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/bookkeeper/signup"
                className="flex items-center gap-2 px-8 py-4 rounded-2xl bg-emerald-500 text-white font-black text-sm shadow-xl hover:bg-emerald-600 transition-all active:scale-95 border-2 border-slate-700"
              >
                Become a Partner
                <ArrowRight size={16} strokeWidth={3} />
              </Link>
              <Link
  href="/bookkeeper/login"
  className="flex items-center gap-2 px-8 py-4 rounded-2xl border-2 border-slate-200 text-slate-700 font-black text-sm hover:bg-slate-50 transition-all"
>
  Partner Login
</Link>
              <Link
                href="/demo"
                className="flex items-center gap-2 px-8 py-4 rounded-2xl border-2 border-slate-700 text-white font-black text-sm hover:bg-slate-800 transition-all"
              >
                See the Product
              </Link>
            </div>
          </div>
        </section>

        {/* PAIN POINTS */}
        <section className="py-20 px-6 bg-slate-50 border-b-2 border-slate-100">
          <div className="max-w-3xl mx-auto">
            <p className="text-xs font-black uppercase tracking-widest text-slate-400 text-center mb-10">
              Sound familiar?
            </p>
            <div className="space-y-4">
              {PAIN_POINTS.map((point, i) => (
                <div key={i} className="flex items-center gap-4 bg-white border-2 border-slate-200 rounded-2xl px-6 py-4 shadow-sm">
                  <div className="w-8 h-8 rounded-full bg-red-50 border-2 border-red-100 flex items-center justify-center shrink-0">
                    <span className="text-red-400 font-black text-xs">✕</span>
                  </div>
                  <p className="text-sm font-black text-slate-700">{point}</p>
                </div>
              ))}
            </div>
            <p className="text-center text-slate-500 font-bold text-sm mt-8">
              These aren't your clients' fault. They don't have a system. Lead2Project is that system.
            </p>
          </div>
        </section>

        {/* WHAT THEY GET */}
        <section className="py-20 px-6">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-14">
              <p className="text-xs font-black uppercase tracking-widest text-emerald-600 mb-3">What changes</p>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                Clean records. Every month.
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {WHAT_THEY_GET.map((item, i) => (
                <div key={i} className="bg-slate-50 border-2 border-slate-200 rounded-2xl p-6 hover:border-emerald-300 hover:bg-emerald-50/30 transition-all">
                  <div className="w-10 h-10 bg-emerald-500 text-white rounded-xl flex items-center justify-center mb-4 shadow-lg">
                    {item.icon}
                  </div>
                  <h3 className="text-sm font-black text-slate-900 mb-2">{item.title}</h3>
                  <p className="text-sm text-slate-500 font-bold leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

    {/* SAMPLE EXPORT */}
        <section className="py-20 px-6 bg-slate-900">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <p className="text-xs font-black uppercase tracking-widest text-emerald-400 mb-3">What you actually get</p>
              <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-4">
                Every line item. Already mapped.
              </h2>
              <p className="text-slate-400 font-bold max-w-2xl mx-auto">
                Every quote line item is automatically classified and mapped to your QuickBooks Chart of Accounts. Import in 60 seconds — not 60 minutes.
              </p>
            </div>
            <div className="overflow-x-auto rounded-2xl border-2 border-slate-700">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-slate-800 border-b-2 border-slate-700">
                    {['Invoice No.', 'Customer', 'Item Description', 'Item Type', 'QBO Account', 'Qty', 'Unit Price', 'Line Amount', 'Payment Status'].map((h, i) => (
                      <th key={i} className="px-4 py-3 text-left font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    { inv: 'INV-001', customer: 'John Smith', desc: 'Diagnostic & Trip Fee', type: 'labor', account: 'Services', qty: '1', price: '$109.00', amount: '$109.00', status: 'Paid' },
                    { inv: 'INV-001', customer: 'John Smith', desc: 'Dual Run Capacitor', type: 'materials', account: 'Job Supplies', qty: '1', price: '$185.00', amount: '$185.00', status: 'Paid' },
                    { inv: 'INV-001', customer: 'John Smith', desc: 'Standard Labor (Per Hour)', type: 'labor', account: 'Services', qty: '2', price: '$150.00', amount: '$300.00', status: 'Paid' },
                    { inv: 'INV-002', customer: 'Sarah Torres', desc: 'Equipment: Condensing Unit', type: 'materials', account: 'Job Supplies', qty: '1', price: '$4,500.00', amount: '$4,500.00', status: 'Partial' },
                    { inv: 'INV-002', customer: 'Sarah Torres', desc: 'Labor: System Installation', type: 'labor', account: 'Services', qty: '1', price: '$1,800.00', amount: '$1,800.00', status: 'Partial' },
                    { inv: 'INV-002', customer: 'Sarah Torres', desc: 'Permits & HERS Testing Fees', type: 'permit', account: 'REVIEW_REQUIRED', qty: '1', price: '$450.00', amount: '$450.00', status: 'Partial' },
                  ].map((row, i) => (
                    <tr key={i} className={`border-b border-slate-700 ${i % 2 === 0 ? 'bg-slate-800/50' : 'bg-slate-800/20'}`}>
                      <td className="px-4 py-3 font-black text-emerald-400 whitespace-nowrap">{row.inv}</td>
                      <td className="px-4 py-3 font-bold text-white whitespace-nowrap">{row.customer}</td>
                      <td className="px-4 py-3 font-bold text-slate-300">{row.desc}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-lg text-xs font-black ${row.type === 'labor' ? 'bg-blue-900 text-blue-300' : row.type === 'materials' ? 'bg-amber-900 text-amber-300' : 'bg-slate-700 text-slate-400'}`}>
                          {row.type}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-bold whitespace-nowrap">
                        <span className={row.account === 'REVIEW_REQUIRED' ? 'text-red-400 font-black' : 'text-emerald-400'}>
                          {row.account}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-bold text-slate-300 text-center">{row.qty}</td>
                      <td className="px-4 py-3 font-bold text-slate-300 whitespace-nowrap">{row.price}</td>
                      <td className="px-4 py-3 font-black text-white whitespace-nowrap">{row.amount}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-lg text-xs font-black ${row.status === 'Paid' ? 'bg-emerald-900 text-emerald-300' : 'bg-yellow-900 text-yellow-300'}`}>
                          {row.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-center text-slate-500 font-bold text-xs mt-4">
              Items flagged REVIEW_REQUIRED are highlighted for your attention. Everything else imports directly.
            </p>
        </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="py-20 px-6 bg-slate-900">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-14">
              <p className="text-xs font-black uppercase tracking-widest text-emerald-400 mb-3">The partnership</p>
              <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                Simple referral. Real results.
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {HOW_IT_WORKS.map((item, i) => (
                <div key={i} className="bg-slate-800 border-2 border-slate-700 rounded-2xl p-6">
                  <p className="text-xs font-black text-emerald-400 tracking-widest mb-3">{item.step}</p>
                  <h3 className="text-sm font-black text-white mb-2">{item.title}</h3>
                  <p className="text-sm text-slate-400 font-bold leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* OFFER */}
        <section className="py-20 px-6 border-b-2 border-slate-100">
          <div className="max-w-3xl mx-auto">
            <div className="bg-emerald-50 border-2 border-emerald-200 rounded-3xl p-10 text-center">
              <p className="text-xs font-black uppercase tracking-widest text-emerald-700 mb-4">The offer</p>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-4">
                Costs you nothing.<br />Your clients get 3 months free.
              </h2>
              <p className="text-slate-600 font-bold mb-8 leading-relaxed">
                Refer a contractor client using your partner code. They sign up free for 3 months. You get cleaner records immediately. No contracts, no commitments.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8">
                {['No fees to join', 'No contract required', '3 months free for your clients', 'QuickBooks export included'].map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm font-black text-emerald-800">
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 px-6">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mb-4">
              Ready to stop chasing receipts?
            </h2>
            <p className="text-slate-500 font-bold mb-8">
              Create your free partner account in 60 seconds. Get your referral code instantly.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/bookkeeper/signup"
                className="flex items-center gap-2 px-8 py-4 rounded-2xl bg-emerald-500 text-white font-black text-sm shadow-xl hover:bg-emerald-600 transition-all active:scale-95 border-2 border-slate-900"
              >
                Create Partner Account
                <ArrowRight size={16} strokeWidth={3} />
              </Link>
              <Link
                href="/bookkeeper/login"
                className="flex items-center gap-2 px-8 py-4 rounded-2xl border-2 border-slate-200 text-slate-700 font-black text-sm hover:bg-slate-50 transition-all"
              >
                Sign In
              </Link>
            </div>
            <p className="text-xs text-slate-400 font-bold mt-4">
              Already a partner? <Link href="/bookkeeper/login" className="text-emerald-600 hover:text-emerald-700">Sign in here</Link>
            </p>
          </div>
        </section>

      </main>

      <Footer />
    </>
  );
}