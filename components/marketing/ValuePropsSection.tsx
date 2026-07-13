'use client';

import { motion, Variants } from 'framer-motion';

const font = "'Nunito', sans-serif";

const NOTES = [
  {
    borderColor: 'border-slate-600/80 hover:border-amber-500',
    titleColor: 'text-white',
    descColor: 'text-slate-300',
    title: 'No more digging through texts',
    desc: 'Leads land with photos and details already attached.',
  },
  {
    borderColor: 'border-slate-600/80 hover:border-amber-500',
    titleColor: 'text-white',
    descColor: 'text-slate-300',
    title: 'Nothing falls through the cracks',
    desc: 'Every email is tracked in one outbox.',
  },
  {
    borderColor: 'border-amber-500 hover:border-amber-400',
    titleColor: 'text-amber-400',
    descColor: 'text-slate-200',
    title: 'Get paid without chasing',
    desc: 'Payment links go out with every invoice.',
  },
  {
    borderColor: 'border-slate-600/80 hover:border-amber-500',
    titleColor: 'text-white',
    descColor: 'text-slate-300',
    title: 'Your brand, every time',
    desc: 'Logo and colors on every quote, automatically.',
  },
  {
    borderColor: 'border-slate-600/80 hover:border-amber-500',
    titleColor: 'text-white',
    descColor: 'text-slate-300',
    title: 'Your data, always yours',
    desc: 'Export to CSV or sync with QuickBooks.',
  },
];

const containerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.05 } },
};

const noteVariants: Variants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
};

function JobBoardCard({ note }: { note: typeof NOTES[number] }) {
  return (
    <motion.div
      variants={noteVariants}
      whileHover={{ y: -3, transition: { duration: 0.15 } }}
      className={`bg-slate-800/50 border-2 ${note.borderColor} rounded-lg p-5 sm:p-6 w-full sm:max-w-[230px] flex flex-col justify-between shadow-xl transition-colors cursor-default`}
    >
      <div>
        {/* Clean top layout line matching heavy hardware aesthetics */}
        <div className="w-8 h-1 bg-white/10 group-hover:bg-amber-500 mb-4 rounded-full" />

        <h3 className={`${note.titleColor} font-black text-base leading-snug mb-2`} style={{ fontFamily: font }}>
          {note.title}
        </h3>
      </div>
      <p className={`${note.descColor} text-xs font-bold leading-relaxed mt-2`}>
        {note.desc}
      </p>
    </motion.div>
  );
}

export default function ValuePropsSection() {
  return (
    <section className="relative py-16 sm:py-24 px-4 sm:px-6 overflow-hidden bg-slate-700 border-b border-white/5">
      <div className="relative z-10 max-w-6xl mx-auto">
        <div className="text-center mb-12 sm:mb-16">
          <span className="text-amber-400 font-black text-xs tracking-[0.18em] uppercase block mb-2">
            Built for how you actually work
          </span>
          <h2
            className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight"
            style={{ fontFamily: font }}
          >
            Less busywork. <span className="text-amber-400">More billable hours.</span>
          </h2>
        </div>

        {/* Straight, level alignment — no messy tilts */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-20px' }}
          className="flex flex-wrap justify-center gap-4 sm:gap-6"
        >
          {NOTES.map((note) => (
            <JobBoardCard key={note.title} note={note} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}