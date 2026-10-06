'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence, useInView, useReducedMotion } from 'framer-motion';
import { Camera, CalendarDays, Check, ChevronDown, Mail, User } from 'lucide-react';

const EASE = [0.22, 1, 0.36, 1] as const;

const NAME = 'Maria Lopez';
const SERVICE = 'Roof repair';
const DESC = 'Leak over the back bedroom after the storm.';

type Card = { name: string; service: string; amount: string; date: string; paid?: string };
const COLUMNS: { label: string; dot: string; cards: Card[] }[] = [
  { label: 'New', dot: 'bg-blue-500', cards: [{ name: 'Dan Kim', service: 'Gutter cleaning', amount: '', date: 'Unscheduled' }] },
  { label: 'Quoted', dot: 'bg-purple-500', cards: [{ name: 'S. Patel', service: 'Siding', amount: '$8,400', date: 'Unscheduled' }] },
  {
    label: 'Scheduled',
    dot: 'bg-amber-500',
    cards: [{ name: 'M. Johnson', service: 'Roof repair', amount: '$12,000', date: 'Oct 9', paid: 'Deposit paid' }],
  },
];

// 0 filling out · 1 sent · 2 on your board
type Phase = 0 | 1 | 2;
const CAPTIONS: Record<Phase, string> = {
  0: 'Your customer scans your code and fills out your form',
  1: 'They hit send. No phone tag.',
  2: 'It lands on your board, and you get an email',
};

type Field = 'name' | 'service' | 'desc' | 'photos' | 'date' | null;

export default function LeadFormDemo({ loop = true }: { loop?: boolean }) {
  const reduceMotion = useReducedMotion();
  const wrapRef = useRef<HTMLDivElement>(null);
  const inView = useInView(wrapRef, { amount: 0.35 });
  const finished = useRef(false);

  const [phase, setPhase] = useState<Phase>(0);
  const [phoneVisible, setPhoneVisible] = useState(false);
  const [active, setActive] = useState<Field>(null);
  const [nameLen, setNameLen] = useState(0);
  const [service, setService] = useState(false);
  const [descLen, setDescLen] = useState(0);
  const [photos, setPhotos] = useState(0);
  const [date, setDate] = useState(false);
  const [pressing, setPressing] = useState(false);
  const [sent, setSent] = useState(false);
  const [landed, setLanded] = useState(false);
  const [toast, setToast] = useState(false);

  useEffect(() => {
    if (reduceMotion) {
      setPhase(2);
      setPhoneVisible(false);
      setLanded(true);
      return;
    }
    if (!inView) return; // only plays while on screen
    if (!loop && finished.current) return;

    let alive = true;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const at = (ms: number, fn: () => void) => {
      timers.push(setTimeout(() => alive && fn(), ms));
    };

    const run = () => {
      setPhase(0);
      setActive(null);
      setNameLen(0);
      setService(false);
      setDescLen(0);
      setPhotos(0);
      setDate(false);
      setSent(false);
      setLanded(false);
      setToast(false);

      at(300, () => setPhoneVisible(true));
      // Name
      at(800, () => setActive('name'));
      for (let i = 1; i <= NAME.length; i++) at(900 + i * 55, () => setNameLen(i));
      // Service
      at(1700, () => setActive('service'));
      at(2050, () => setService(true));
      // Description
      at(2450, () => setActive('desc'));
      for (let i = 1; i <= DESC.length; i++) at(2550 + i * 32, () => setDescLen(i));
      // Photos and date
      at(4150, () => setActive('photos'));
      at(4350, () => setPhotos(1));
      at(4650, () => setPhotos(2));
      at(5000, () => setActive('date'));
      at(5250, () => setDate(true));
      // Send
      at(5700, () => setActive(null));
      at(6000, () => setPressing(true));
      at(6200, () => {
        setPressing(false);
        setSent(true);
        setPhase(1);
      });
      // Lands on the board
      at(7500, () => setPhoneVisible(false));
      at(7800, () => {
        setLanded(true);
        setPhase(2);
      });
      at(8200, () => setToast(true));
      at(10800, () => setToast(false));
      if (loop) at(12500, run);
      else at(10900, () => (finished.current = true));
    };

    run();
    return () => {
      alive = false;
      timers.forEach(clearTimeout);
    };
  }, [reduceMotion, inView, loop]);

  const ring = (f: Field) =>
    active === f ? 'border-[#00828A] ring-2 ring-[#00828A]/20 bg-white' : 'border-slate-200 bg-slate-50';
  const caret = <span className="ml-px inline-block h-3 w-px animate-pulse bg-slate-900 align-middle" />;

  return (
    <div ref={wrapRef} className="w-full">
      {/* Caption */}
      <div className="mb-3 min-h-6 text-center">
        <AnimatePresence mode="wait">
          <motion.p
            key={phase}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.25 }}
            className="text-sm font-semibold text-[#1C1F23]"
          >
            {CAPTIONS[phase]}
          </motion.p>
        </AnimatePresence>
      </div>

      <div
        className="relative rounded-lg border border-slate-300 ring-4 ring-slate-100 bg-[#F4F7F6] shadow-lg overflow-hidden select-none min-h-[430px] sm:min-h-[440px]"
        aria-hidden
      >
        {/* Board */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3">
          <p className="text-sm font-bold">Jobs</p>
          <span className="text-[11px] font-semibold text-slate-500">Board view</span>
        </div>
        <div className="grid grid-cols-3 gap-2 sm:gap-3 p-3 sm:p-4">
          {COLUMNS.map((col, ci) => {
            const count = col.cards.length + (ci === 0 && landed ? 1 : 0);
            return (
              <div key={col.label} className="min-w-0 space-y-2 rounded-xl border border-slate-200 bg-white/70 p-2">
                <div className="flex items-center gap-1.5 px-1">
                  <span className={`h-1.5 w-1.5 rounded-full ${col.dot}`} />
                  <span className="truncate text-[10px] font-bold uppercase tracking-wider text-slate-600">{col.label}</span>
                  <span className="text-[10px] text-slate-400">{count}</span>
                </div>

                {ci === 0 && (
                  <AnimatePresence initial={false}>
                    {landed && (
                      <motion.div
                        key="new"
                        initial={{ opacity: 0, y: -24, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.45, ease: EASE }}
                        className="rounded-lg border border-[#00828A] bg-white p-2 ring-2 ring-[#00828A]/20"
                      >
                        <p className="truncate text-[11px] font-bold">{NAME}</p>
                        <p className="truncate text-[10px] text-slate-500">{SERVICE}</p>
                        <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[9px] text-slate-500">
                          <span className="inline-flex items-center gap-0.5">
                            <Camera className="h-2.5 w-2.5" /> 2
                          </span>
                          <span className="inline-flex items-center gap-0.5">
                            <CalendarDays className="h-2.5 w-2.5" /> Oct 7
                          </span>
                        </div>
                        <p className="mt-0.5 text-[9px] font-bold text-[#00828A]">Just now</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                )}

                {col.cards.map((c) => (
                  <motion.div layout key={c.name} className="rounded-lg border border-slate-200 bg-white p-2">
                    <div className="flex items-baseline justify-between gap-1">
                      <p className="truncate text-[11px] font-bold">{c.name}</p>
                      {c.amount && <span className="shrink-0 text-[10px] font-bold">{c.amount}</span>}
                    </div>
                    <p className="truncate text-[10px] text-slate-500">{c.service}</p>
                    <div className="mt-1 flex items-center justify-between gap-1">
                      <span className="truncate text-[9px] text-slate-400">{c.date}</span>
                      {c.paid && <span className="shrink-0 text-[9px] font-semibold text-emerald-600">{c.paid}</span>}
                    </div>
                  </motion.div>
                ))}
              </div>
            );
          })}
        </div>

        {/* Email alert */}
        <AnimatePresence>
          {toast && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              className="absolute bottom-3 left-3 right-3 sm:left-auto z-20 flex items-center gap-2.5 rounded-xl bg-[#1C1F23] px-3.5 py-2.5 text-[11px] text-white shadow-xl"
            >
              <Mail className="h-4 w-4 shrink-0 text-[#5EC4C9]" />
              <div className="min-w-0">
                <p className="font-semibold">New request: {NAME}</p>
                <p className="truncate text-[10px] text-slate-300">{SERVICE} · 2 photos · emailed to you</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Customer's phone */}
        <AnimatePresence>
          {phoneVisible && (
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 z-10 flex items-center justify-center bg-slate-900/25 pt-6"
            >
              <motion.div
                initial={{ y: 40, opacity: 0, scale: 0.95 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                exit={{ y: -60, opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.45, ease: EASE }}
                className="relative w-[210px] rounded-[1.8rem] border border-white/10 bg-[#1C1F23] p-1.5 shadow-2xl"
              >
                <div className="absolute -top-7 left-1/2 flex -translate-x-1/2 items-center gap-1.5 whitespace-nowrap rounded-full bg-[#1C1F23] px-3 py-1 text-[10px] font-semibold text-white shadow-md">
                  <User className="h-3 w-3 text-sky-400" /> Customer&rsquo;s Phone
                </div>
                <div className="overflow-hidden rounded-[1.4rem] bg-white text-[10px]">
                  <div className="bg-[#00828A] px-4 pb-3 pt-4 text-white">
                    <p className="text-[10px] font-semibold opacity-80">Summit Roofing</p>
                    <p className="text-[13px] font-bold">Request a free quote</p>
                  </div>

                  <AnimatePresence mode="wait">
                    {!sent ? (
                      <motion.div key="form" exit={{ opacity: 0 }} className="space-y-2 p-3">
                        <div>
                          <p className="mb-0.5 font-semibold text-slate-500">Name</p>
                          <div className={`h-7 rounded-md border px-2 py-1.5 font-medium text-slate-800 transition-colors ${ring('name')}`}>
                            {NAME.slice(0, nameLen)}
                            {active === 'name' && caret}
                          </div>
                        </div>
                        <div>
                          <p className="mb-0.5 font-semibold text-slate-500">Service</p>
                          <div
                            className={`flex h-7 items-center justify-between rounded-md border px-2 transition-colors ${ring('service')}`}
                          >
                            <span className={service ? 'font-medium text-slate-800' : 'text-slate-400'}>
                              {service ? SERVICE : 'Choose a service'}
                            </span>
                            <ChevronDown className="h-3 w-3 text-slate-400" />
                          </div>
                        </div>
                        <div>
                          <p className="mb-0.5 font-semibold text-slate-500">What do you need?</p>
                          <div className={`h-[42px] rounded-md border px-2 py-1.5 leading-snug text-slate-700 transition-colors ${ring('desc')}`}>
                            {DESC.slice(0, descLen)}
                            {active === 'desc' && caret}
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-1.5">
                          <div className={`flex h-7 items-center gap-1 rounded-md border px-1.5 transition-colors ${ring('photos')}`}>
                            {photos === 0 ? (
                              <span className="inline-flex items-center gap-1 text-slate-400">
                                <Camera className="h-3 w-3" /> Photos
                              </span>
                            ) : (
                              <>
                                {Array.from({ length: photos }).map((_, i) => (
                                  <motion.span
                                    key={i}
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="h-4 w-4 rounded-sm"
                                    style={{ background: i ? 'linear-gradient(135deg,#94a3b8,#475569)' : 'linear-gradient(135deg,#cbd5e1,#64748b)' }}
                                  />
                                ))}
                                <span className="ml-0.5 font-medium text-slate-700">{photos}</span>
                              </>
                            )}
                          </div>
                          <div className={`flex h-7 items-center gap-1 rounded-md border px-1.5 transition-colors ${ring('date')}`}>
                            <CalendarDays className="h-3 w-3 text-slate-400" />
                            <span className={date ? 'font-medium text-slate-700' : 'text-slate-400'}>{date ? 'Oct 7' : 'Date'}</span>
                          </div>
                        </div>
                        <motion.div
                          animate={{ scale: pressing ? 0.94 : 1 }}
                          transition={{ duration: 0.12 }}
                          className="rounded-md bg-[#00828A] py-2 text-center text-[11px] font-bold text-white"
                        >
                          Send request
                        </motion.div>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="sent"
                        initial={{ opacity: 0, scale: 0.96 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex flex-col items-center gap-1.5 px-3 py-12 text-center"
                      >
                        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500 text-white">
                          <Check className="h-5 w-5" strokeWidth={3} />
                        </span>
                        <p className="font-bold text-slate-900">Request sent</p>
                        <p className="text-slate-500">Summit Roofing will be in touch</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}