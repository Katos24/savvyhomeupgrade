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
                href="mailto:hello@lead2project.com?subject=Bookkeeper Partner Program"
                className="flex items-center gap-2 px-8 py-4 rounded-2xl bg-emerald-500 text-white font-black text-sm shadow-xl hover:bg-emerald-600 transition-all active:scale-95 border-2 border-slate-700"
              >
                Become a Partner
                <ArrowRight size={16} strokeWidth={3} />
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
              Email us to get your partner code and start referring clients today.
            </p>
            <Link
              href="mailto:hello@lead2project.com?subject=Bookkeeper Partner Program"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-emerald-500 text-white font-black text-sm shadow-xl hover:bg-emerald-600 transition-all active:scale-95 border-2 border-slate-900"
            >
              Get Your Partner Code
              <ArrowRight size={16} strokeWidth={3} />
            </Link>
            <p className="text-xs text-slate-400 font-bold mt-4">
              Or email us directly at hello@lead2project.com
            </p>
          </div>
        </section>

      </main>

      <Footer />
    </>
  );
}