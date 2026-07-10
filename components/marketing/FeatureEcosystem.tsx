'use client';

import { motion } from 'framer-motion';
import { 
  QrCode, 
  Settings2, 
  FolderTree, 
  MailCheck, 
  Download, 
  BrainCircuit, 
  BellRing, 
  Layers, 
  FileSpreadsheet,
  CheckCircle2,
  ArrowUpRight,
  MousePointerClick
} from 'lucide-react';

const font = "'Nunito', sans-serif";

const mainFeatures = [
  {
    icon: QrCode,
    badge: 'Public Intake',
    title: 'Your Link & QR Code. Anywhere.',
    desc: 'Blast your custom link across **social media**, drop it into your **Google Business Profile**, or stamp your **QR code on truck wraps**. Customers land on a pristine intake form fully customized with your brand colors, unique questions, file/photo uploads, and optional address or preferred scheduling slots.',
  },
  {
    icon: Layers,
    badge: 'Central Board',
    title: 'Custom Categories & Pipelines',
    desc: 'Every incoming request drops directly onto your central action board. Organize your business operations with **fully custom pipeline workflows** and categories. Inside every job card, your team can attach design photos, internal documentation, job briefs, or short video updates on the fly.',
  },
  {
    icon: FolderTree,
    badge: 'Smart Templates',
    title: 'Task & Quote Automation',
    desc: 'Stop duplicating backend work. Build out **custom task blueprints** and itemized quote templates bound specifically to your job categories. When a lead arrives, the platform map is ready to auto-populate instantly.',
  },
  {
    icon: MailCheck,
    badge: 'The Communication Hub',
    title: 'One-Click Branded Outbox',
    desc: 'Send elegant, branded booking updates, direct job schedules, or itemized quotes containing interactive **Accept/Decline triggers**. Click once to dispatch, and instantly track delivery verification inside a **dedicated Central Outbox Page** for total transparency.',
  },
  {
    icon: Download,
    badge: 'Data Portability',
    title: 'Bulk Edits & Financial Export',
    desc: 'You own your operations. Run **lightning-fast bulk edits** directly inside your data tables, download absolute records with comprehensive **CSV data exports**, or clear bookkeeping workflows instantly with native **QuickBooks formatted exports**.',
  },
  {
    icon: BrainCircuit,
    badge: 'AI Toolkit',
    title: 'Co-Pilot Briefs & Assistance',
    desc: 'Accelerate your administrative routine using smart **AI structural briefs and real-time operational chat**. While our **AI quote generation tool** acts as a powerful framework builder rather than a magic bullet, it cuts your initial itemization drafting time in half.',
  },
];

export default function FeatureEcosystem() {
  return (
    <section className="relative overflow-hidden bg-white py-24 lg:py-32 border-t border-slate-100">
      <div className="relative z-10 mx-auto max-w-7xl px-6">
        
        {/* SECTION TITLE */}
        <div className="mx-auto max-w-3xl text-center mb-20">
          <span className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-black uppercase tracking-widest text-emerald-700 border border-emerald-100">
            <Settings2 size={12} /> Complete Business Ecosystem
          </span>
          <h2 className="text-4xl font-black tracking-tight text-slate-900 sm:text-5xl" style={{ fontFamily: font }}>
            Configure your pipeline. <span className="text-emerald-600">Automate the rest.</span>
          </h2>
          <p className="mt-4 text-lg font-bold text-slate-500">
            From the initial Google search click to itemized accounting exports—everything is mapped into a single dashboard designed around your specific workflow.
          </p>
        </div>

        {/* CORE FEATURES GRID */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {mainFeatures.map((feat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.05, duration: 0.4 }}
              className="group relative flex flex-col justify-between rounded-3xl border border-slate-200 bg-slate-50/50 p-8 transition-all duration-300 hover:border-slate-300 hover:bg-white hover:shadow-[0_20px_40px_rgba(0,0,0,0.04)]"
            >
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white border border-slate-200 text-emerald-600 shadow-sm group-hover:bg-emerald-600 group-hover:text-white group-hover:border-emerald-600 transition-colors duration-300">
                    <feat.icon size={22} strokeWidth={2.2} />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-100 border border-slate-200/60 px-2.5 py-1 rounded-md">
                    {feat.badge}
                  </span>
                </div>

                <h3 className="text-xl font-black text-slate-900 mb-3" style={{ fontFamily: font }}>
                  {feat.title}
                </h3>
                
                <p 
                  className="text-sm font-bold leading-relaxed text-slate-500"
                  dangerouslySetInnerHTML={{ __html: feat.desc }}
                />
              </div>
            </motion.div>
          ))}
        </div>

        {/* BOTTOM ACCELERATOR BAR: PRO PLAN EXTRA */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="mt-12 relative overflow-hidden rounded-3xl border border-emerald-100 bg-emerald-50/40 p-8 md:p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.06),transparent_50%)]" />
          
          <div className="relative z-10 flex items-start gap-4 max-w-2xl">
            <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-md shadow-emerald-600/20">
              <BellRing size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-lg font-black text-slate-900" style={{ fontFamily: font }}>
                  The 6:00 AM Daily Digest
                </h4>
                <span className="rounded bg-emerald-600 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider text-white">
                  Pro Plan
                </span>
              </div>
              <p className="mt-1 text-sm font-bold text-slate-600 leading-relaxed">
                Wake up to an automated breakdown inside your inbox every single morning. Your team gets clean performance trends, newly captured opportunities, scheduled tasks for the afternoon, and pending payment accounts summarized before checking into the office.
              </p>
            </div>
          </div>

          <div className="relative z-10 shrink-0 w-full md:w-auto">
            <div className="inline-flex items-center gap-2 rounded-xl bg-white border border-slate-200 px-4 py-2.5 shadow-sm text-xs font-black text-slate-700">
              <CheckCircle2 size={14} className="text-emerald-600" /> Automated Summary Dispatch
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  );
}