'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  CheckCircle2,
  Send,
  Copy,
  Check,
  Lock,
  User,
  FileText,
  CalendarDays,
  CreditCard,
  Receipt,
  ListChecks,
  ImageIcon,
  Bell,
  MessageCircle,
  MoreVertical,
  MoreHorizontal,
  X,
  Download,
  Wrench,
  ArrowRight,
  PlayCircle,
  Star,
  Camera,
  Banknote,
  TrendingUp,
  Home,
  Droplets,
  Zap,
  Thermometer,
  Smartphone,
  Truck,
  type LucideIcon,
} from 'lucide-react';
import Link from 'next/link';

// Your demo booking link. Leave empty to hide the "Book a demo" button.
const DEMO_URL = '/book-demo';

const EASE = [0.22, 1, 0.36, 1] as const;

/* Used by JobDemo below (not shown in the hero) */
const SIDEBAR = [
  { icon: User, label: 'Overview' },
  { icon: FileText, label: 'Quote' },
  { icon: CalendarDays, label: 'Schedule' },
  { icon: CreditCard, label: 'Invoice', active: true },
  { icon: Receipt, label: 'Expenses' },
  { icon: ListChecks, label: 'Tasks' },
  { icon: ImageIcon, label: 'Media' },
  { icon: Bell, label: 'Reminders' },
  { icon: MessageCircle, label: 'Activity' },
];

const MOBILE_TABS = [
  { icon: User, label: 'Overview' },
  { icon: FileText, label: 'Quote' },
  { icon: CalendarDays, label: 'Schedule' },
  { icon: CreditCard, label: 'Invoice', active: true },
  { icon: MoreHorizontal, label: 'More' },
];

// 0: Deposit Due · 1: Deposit Sent · 2: Customer Paying · 3: Deposit Secured
type Phase = 0 | 1 | 2 | 3;

const CAPTIONS: Record<Phase, string> = {
  0: 'You send the deposit request from the job card',
  1: 'Your customer receives a link and pays on their phone',
  2: 'Your customer receives a link and pays on their phone',
  3: 'Deposit secured! You are ready to start work.',
};

/* ───────────────────────── Hero content (static: no animation, fast to load) ───────────────────────── */

// Optional photos beside the headline on extra-wide screens.
// Put images in /public/hero/ and set `src`, e.g. src: '/hero/roofer.jpg'.
// Use your own photos, photos you have permission to use, or licensed stock (Unsplash / Pexels).
// While `src` is empty, a branded placeholder tile is shown instead.
type HeroPhoto = { src: string; alt: string; label: string; icon: LucideIcon; className: string };

const HERO_PHOTOS: HeroPhoto[] = [
  { src: '', alt: 'Roofer installing shingles', label: 'Roofing', icon: Home, className: 'left-[3%] top-[18%] h-44 w-44 -rotate-3' },
  { src: '', alt: 'Plumber working under a sink', label: 'Plumbing', icon: Droplets, className: 'left-[12%] top-[50%] h-36 w-36 rotate-2' },
  { src: '', alt: 'Contractor checking a job on a phone', label: 'On the job', icon: Smartphone, className: 'left-[2%] top-[70%] h-32 w-32 -rotate-2' },
  { src: '', alt: 'Electrician working on a panel', label: 'Electrical', icon: Zap, className: 'right-[4%] top-[16%] h-44 w-44 rotate-3' },
  { src: '', alt: 'HVAC tech servicing an outdoor unit', label: 'HVAC', icon: Thermometer, className: 'right-[2%] top-[48%] h-32 w-32 -rotate-2' },
  { src: '', alt: 'Work van parked at a job site', label: 'Field crews', icon: Truck, className: 'right-[12%] top-[64%] h-36 w-36 rotate-2' },
];

// The board under the headline. Every tag is something the product really does:
// photos with requests, quote accepted online, deposits by card, cash/check recorded,
// automatic payment reminders, Google review requests, profit per job.
type Tag = { icon: LucideIcon; label: string; tone: 'teal' | 'green' | 'amber' | 'slate' | 'violet' };
type HeroCard = { name: string; service: string; amount?: string; date?: string; tags: Tag[]; fresh?: boolean };
type HeroCol = { label: string; dot: string; cards: HeroCard[] };

const TAG_TONE: Record<Tag['tone'], string> = {
  teal: 'bg-[#00828A]/10 text-[#00727A]',
  green: 'bg-emerald-50 text-emerald-700',
  amber: 'bg-amber-50 text-amber-800',
  slate: 'bg-slate-100 text-slate-600',
  violet: 'bg-violet-50 text-violet-700',
};

const HERO_BOARD: HeroCol[] = [
  {
    label: 'New',
    dot: 'bg-blue-500',
    cards: [
      { name: 'Maria Lopez', service: 'Roof repair', date: 'Just now', fresh: true, tags: [{ icon: Camera, label: '2 photos', tone: 'teal' }] },
      { name: 'Dan K.', service: 'Gutter cleaning', date: 'Yesterday', tags: [{ icon: FileText, label: 'Booking form', tone: 'slate' }] },
    ],
  },
  {
    label: 'Quoted',
    dot: 'bg-purple-500',
    cards: [
      { name: 'S. Patel', service: 'Siding', amount: '$8,400', tags: [{ icon: Send, label: 'Quote emailed', tone: 'violet' }] },
      { name: 'T. Brooks', service: 'Gutter install', amount: '$2,850', tags: [{ icon: Check, label: 'Accepted online', tone: 'green' }] },
    ],
  },
  {
    label: 'Scheduled',
    dot: 'bg-amber-500',
    cards: [
      {
        name: 'M. Johnson',
        service: 'Roof replacement',
        amount: '$12,000',
        date: 'Thu · 8:00 AM',
        tags: [{ icon: CreditCard, label: 'Deposit paid by card', tone: 'green' }],
      },
      { name: 'K. Nguyen', service: 'Chimney flashing', amount: '$1,900', date: 'Mon · 9:00 AM', tags: [{ icon: Bell, label: 'Reminder sent', tone: 'amber' }] },
    ],
  },
  {
    label: 'Paid',
    dot: 'bg-emerald-500',
    cards: [
      {
        name: 'J. Rivera',
        service: 'Roof repair',
        amount: '$4,200',
        tags: [
          { icon: TrendingUp, label: '$1,640 profit', tone: 'teal' },
          { icon: Star, label: 'Review requested', tone: 'amber' },
        ],
      },
      { name: 'A. Moore', service: 'Gutter guards', amount: '$950', tags: [{ icon: Banknote, label: 'Paid by check', tone: 'slate' }] },
    ],
  },
];

const DOT_GRID = 'radial-gradient(rgba(255,255,255,0.08) 1px, transparent 1px)';
const DOT_MASK = 'radial-gradient(ellipse 70% 60% at 50% 40%, black 30%, transparent 100%)';

/* ───────────────────────── Hero ───────────────────────── */

export default function Hero() {
  return (
    <div className="bg-white text-[#1C1F23] antialiased selection:bg-[#00828A]/20 overflow-x-hidden">
      {/* ── Dark hero: matches the dark nav at the top of the page ── */}
      <section className="relative overflow-hidden bg-slate-900 px-5 pb-36 pt-24 text-white sm:px-6 sm:pb-44 sm:pt-28 lg:px-8 lg:pb-52 lg:pt-32">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{ backgroundImage: DOT_GRID, backgroundSize: '22px 22px', maskImage: DOT_MASK, WebkitMaskImage: DOT_MASK }}
        />
        <div aria-hidden className="pointer-events-none absolute left-1/2 top-[30%] h-[520px] w-[820px] -translate-x-1/2 rounded-full bg-[#00828A]/25 blur-[140px]" />

        {HERO_PHOTOS.map((photo) => (
          <HeroPhotoTile key={photo.label} photo={photo} />
        ))}

        <div className="relative mx-auto flex max-w-3xl flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 text-sm font-medium text-white/80">
            <span className="h-2 w-2 rounded-full bg-[#5EC4C9]" />
            Built for roofers, plumbers, HVAC &amp; every trade
          </div>

          <h1 className="mt-5 font-[family-name:var(--font-display)] text-[44px] font-extrabold uppercase leading-[0.92] tracking-tight min-[400px]:text-[52px] sm:mt-6 sm:text-7xl lg:text-[84px]">
            Running jobs just got{' '}
            <span className="mt-2.5 inline-block -rotate-1 whitespace-nowrap rounded-2xl bg-[#5EC4C9] px-3.5 pb-1 pt-2 text-slate-900 shadow-[0_10px_40px_-8px_rgba(94,196,201,0.6)] sm:px-5">
              easy.
            </span>
          </h1>

          <p className="mt-5 max-w-[42ch] text-base leading-relaxed text-white/70 sm:mt-6 sm:text-xl">
            Quotes, deposits, scheduling and payments in one simple place. No training, no clutter.{' '}
            <span className="font-semibold text-white">If you can send a text, you can use it.</span>
          </p>

          <div className="mt-7 flex w-full flex-col items-stretch justify-center gap-3 sm:w-auto sm:flex-row sm:items-center sm:gap-4">
            {DEMO_URL && (
              <Link
                href={DEMO_URL}
                className="flex min-h-[52px] items-center justify-center gap-2 rounded-xl border-2 border-white/80 px-7 py-3.5 font-[family-name:var(--font-display)] text-base font-bold uppercase tracking-wider text-white transition-colors hover:bg-white hover:text-slate-900 sm:text-lg"
              >
                Book a demo
                <PlayCircle className="h-5 w-5 text-[#5EC4C9]" />
              </Link>
            )}
            <Link
              href="/signup"
              className="group flex min-h-[52px] items-center justify-center gap-2 rounded-xl bg-[#00828A] px-8 py-3.5 font-[family-name:var(--font-display)] text-base font-bold uppercase tracking-wider text-white shadow-lg shadow-[#00828A]/40 transition-colors hover:bg-[#00959e] sm:text-lg"
            >
              Start free
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          <p className="mt-6 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm font-medium text-white/60 sm:gap-x-5 sm:text-base">
            {['Free plan', 'Card payments via Stripe', 'Built on Long Island'].map((item) => (
              <span key={item} className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-[#5EC4C9]" /> {item}
              </span>
            ))}
          </p>
        </div>
      </section>

      {/* ── The job board rises out of the dark hero ── */}
      <section className="relative px-4 pb-12 sm:px-6 sm:pb-16 lg:px-8">
        <div className="relative mx-auto -mt-28 max-w-5xl sm:-mt-36 lg:-mt-44">
          <HeroBoard />
        </div>

        {/* Founder line */}
        <div className="mx-auto mt-10 flex max-w-xl items-center justify-center gap-3 sm:mt-12">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#1C1F23] font-[family-name:var(--font-display)] text-base font-bold text-white">
            A
          </span>
          <p className="text-left text-sm leading-snug text-[#3a3f45] sm:text-base">
            <span className="font-semibold text-[#1C1F23]">Built on Long Island by Alex,</span> 8 years in payments at
            Paymentus &amp; ACI.{' '}
            <Link href="/how-it-works" className="inline-flex items-center gap-1 font-semibold text-[#00828A] hover:text-[#006e75]">
              See how it works <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </p>
        </div>
      </section>
    </div>
  );
}

/* ───────────────────────── Hero pieces ───────────────────────── */

function TagPill({ tag }: { tag: Tag }) {
  const Icon = tag.icon;
  return (
    <span className={`inline-flex max-w-full items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-semibold ${TAG_TONE[tag.tone]}`}>
      <Icon className="h-3 w-3 shrink-0" />
      <span className="truncate">{tag.label}</span>
    </span>
  );
}

function HeroBoard() {
  return (
    <div className="relative" role="img" aria-label="Example Lead2Project job board with jobs moving from new request to paid">
      <div aria-hidden className="pointer-events-none absolute inset-x-10 bottom-0 top-10 -z-10 rounded-[2rem] bg-[#00828A]/35 blur-3xl" />

      <div aria-hidden className="overflow-hidden rounded-2xl bg-white shadow-[0_40px_90px_-30px_rgba(15,23,42,0.6)] ring-1 ring-black/5">
        {/* Window bar */}
        <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-3 sm:px-5">
          <div className="flex min-w-0 items-center gap-3">
            <div className="hidden items-center gap-1.5 sm:flex">
              <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
            </div>
            <p className="truncate text-sm font-bold">Jobs</p>
            <span className="hidden rounded-md bg-slate-100 p-0.5 text-[11px] font-semibold sm:inline-flex">
              <span className="rounded bg-white px-2 py-0.5 shadow-sm">Board</span>
              <span className="px-2 py-0.5 text-slate-500">Table</span>
              <span className="px-2 py-0.5 text-slate-500">Calendar</span>
            </span>
          </div>
          <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500">Example data</span>
        </div>

        {/* Columns: side by side from tablet up, swipeable on phones */}
        <div className="flex snap-x snap-mandatory gap-3 overflow-x-auto bg-[#F4F7F6] p-3 [scrollbar-width:none] sm:grid sm:grid-cols-4 sm:overflow-visible sm:p-4 [&::-webkit-scrollbar]:hidden">
          {HERO_BOARD.map((col) => (
            <div key={col.label} className="w-[72%] shrink-0 snap-start space-y-2 sm:w-auto sm:min-w-0">
              <div className="flex items-center gap-1.5 px-1">
                <span className={`h-2 w-2 rounded-full ${col.dot}`} />
                <span className="truncate text-[11px] font-bold uppercase tracking-wider text-slate-600">{col.label}</span>
                <span className="text-[11px] text-slate-400">{col.cards.length}</span>
              </div>
              {col.cards.map((c) => (
                <div
                  key={c.name}
                  className={`rounded-xl border bg-white p-2.5 shadow-sm ${c.fresh ? 'border-[#00828A] ring-2 ring-[#00828A]/20' : 'border-slate-200'}`}
                >
                  <div className="flex items-baseline justify-between gap-1.5">
                    <p className="truncate text-[12px] font-bold text-slate-900">{c.name}</p>
                    {c.amount && <span className="shrink-0 text-[11px] font-bold tabular-nums text-slate-900">{c.amount}</span>}
                  </div>
                  <p className="truncate text-[11px] text-slate-500">{c.service}</p>
                  {c.date && (
                    <p className={`mt-0.5 text-[10px] ${c.fresh ? 'font-bold text-[#00828A]' : 'text-slate-400'}`}>{c.date}</p>
                  )}
                  <div className="mt-2 flex flex-wrap gap-1">
                    {c.tags.map((t) => (
                      <TagPill key={t.label} tag={t} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
      <p className="mt-3 text-center text-xs text-slate-400 sm:hidden">Swipe the board →</p>
    </div>
  );
}

function HeroPhotoTile({ photo }: { photo: HeroPhoto }) {
  const Icon = photo.icon;
  return (
    <div aria-hidden={!photo.src} className={`pointer-events-none absolute hidden 2xl:block ${photo.className}`}>
      <div className="h-full w-full overflow-hidden rounded-2xl border border-white/10 shadow-2xl shadow-black/40">
        {photo.src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photo.src} alt={photo.alt} className="h-full w-full object-cover" loading="lazy" />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-gradient-to-br from-[#00828A]/45 via-slate-800 to-slate-800">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-[#5EC4C9]">
              <Icon className="h-6 w-6" />
            </span>
            <span className="font-[family-name:var(--font-display)] text-sm font-bold uppercase tracking-[0.18em] text-white/70">
              {photo.label}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

/* ───────────────────────── Demo ───────────────────────── */

export function JobDemo() {
  const reduceMotion = useReducedMotion();
  const [phase, setPhase] = useState<Phase>(0);
  const [showSuccess, setShowSuccess] = useState<boolean>(false);

  // Interactions
  const [cursor, setCursor] = useState({ x: 0, y: 0, show: false });
  const [pressing, setPressing] = useState(false); // Contractor mouse press
  const [phonePressing, setPhonePressing] = useState(false); // Customer finger tap

  const [phoneVisible, setPhoneVisible] = useState(false);
  const [phonePaid, setPhonePaid] = useState(false);

  const cardRef = useRef<HTMLDivElement>(null);
  const depositBtnRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (reduceMotion) {
      setPhase(3);
      return;
    }

    let isActive = true;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const at = (ms: number, fn: () => void) => {
      timers.push(setTimeout(() => { if (isActive) fn(); }, ms));
    };

    const pointAt = (el: HTMLElement | null) => {
      const card = cardRef.current;
      if (!card || !el) return;
      const c = card.getBoundingClientRect();
      const r = el.getBoundingClientRect();
      setCursor({ x: r.left - c.left + r.width * 0.5, y: r.top - c.top + r.height * 0.5, show: true });
    };

    const rest = () => {
      const card = cardRef.current;
      if (!card) return;
      const c = card.getBoundingClientRect();
      setCursor((p) => ({ x: c.width * 0.55, y: c.height * 0.92, show: p.show }));
    };

    const runSequence = () => {
      // 0. Reset state for loop
      setPhase(0);
      setShowSuccess(false);
      setPhoneVisible(false);
      setPhonePaid(false);
      rest();

      at(500, () => setCursor((p) => ({ ...p, show: true })));

      // 1. Contractor clicks deposit send button
      at(1000, () => pointAt(depositBtnRef.current));
      at(2100, () => setPressing(true));
      at(2300, () => {
        setPressing(false);
        setPhase(1);
        setCursor((p) => ({ ...p, show: false })); // Hide contractor cursor
        rest(); // Move hidden cursor back to start
      });

      // 2. Customer gets phone notification & taps pay
      at(2800, () => {
        setPhase(2);
        setPhoneVisible(true);
      });
      at(4600, () => setPhonePressing(true));
      at(4800, () => {
        setPhonePressing(false);
        setPhonePaid(true);
      });

      // 3. Phone slides out, UI updates to success
      at(6000, () => {
        setPhoneVisible(false);
        setPhonePaid(false);
      });
      at(6300, () => {
        setPhase(3);
        setShowSuccess(true);
      });

      // Success pop-up disappears
      at(9000, () => setShowSuccess(false));

      // 4. Restart loop after a pause so the user can read the updated card
      at(11500, runSequence);
    };

    runSequence();

    return () => {
      isActive = false;
      timers.forEach(clearTimeout);
    };
  }, [reduceMotion]);

  const depositSent = phase >= 1;
  const depositPaid = phase >= 3;
  const pct = depositPaid ? 40 : 0;

  const ROW = 'mt-2.5 pt-2.5 border-t border-slate-100 min-h-[40px] flex flex-wrap items-center gap-2 overflow-hidden';
  const BTN_DARK =
    'inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-2.5 py-1.5 font-semibold text-white whitespace-nowrap text-[10px] sm:text-[11px]';
  const BTN_LIGHT =
    'inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 font-semibold text-slate-700 whitespace-nowrap text-[10px] sm:text-[11px]';
  const BTN_PDF = `ml-auto ${BTN_LIGHT}`;

  const steps = [
    { label: 'Quote Accepted', state: 'done' as const },
    { label: 'Deposit Secured', state: depositPaid ? ('done' as const) : ('todo' as const) },
    { label: 'Ready to Work', state: depositPaid ? ('current' as const) : ('todo' as const) },
    { label: 'Balance Collected', state: 'todo' as const },
  ];

  return (
    <div className="w-full">
      {/* Caption */}
      <div className="mb-3 min-h-6 text-center px-2">
        <AnimatePresence mode="wait">
          <motion.p
            key={phase}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.25 }}
            className="text-xs sm:text-sm font-semibold text-[#1C1F23]"
          >
            {CAPTIONS[phase]}
          </motion.p>
        </AnimatePresence>
      </div>

      <div
        ref={cardRef}
        className="relative w-full max-w-3xl mx-auto rounded-xl overflow-hidden bg-white border border-slate-200 shadow-2xl text-[10px] sm:text-[11px] select-none"
      >
        {/* Contractor's Fake Cursor */}
        <motion.div
          aria-hidden
          className="pointer-events-none absolute left-0 top-0 z-30 hidden sm:block"
          initial={false}
          animate={{ x: cursor.x, y: cursor.y, opacity: cursor.show ? 1 : 0, scale: pressing ? 0.85 : 1 }}
          transition={{
            x: { duration: 0.8, ease: EASE },
            y: { duration: 0.8, ease: EASE },
            opacity: { duration: 0.3 },
            scale: { duration: 0.12 },
          }}
        >
          <AnimatePresence>
            {pressing && (
              <motion.span
                initial={{ opacity: 0.5, scale: 0 }}
                animate={{ opacity: 0, scale: 2.8 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="absolute -left-3 -top-3 h-6 w-6 rounded-full bg-[#00828A]/40"
              />
            )}
          </AnimatePresence>
          <svg width="20" height="20" viewBox="0 0 24 24" className="relative -translate-x-[3px] -translate-y-[2px] drop-shadow-md">
            <path d="M4 2l16 9.5-7 1.6-3.6 6.4z" fill="#1C1F23" stroke="white" strokeWidth="1.6" strokeLinejoin="round" />
          </svg>
        </motion.div>

        {/* Customer's Mobile Phone Simulation */}
        <div className="pointer-events-none absolute inset-y-0 right-2 sm:right-6 z-[25] flex items-center">
          <AnimatePresence>
            {phoneVisible && (
              <motion.div
                key="phone"
                initial={{ x: 80, opacity: 0, scale: 0.9 }}
                animate={{ x: 0, opacity: 1, scale: 1 }}
                exit={{ x: 80, opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.45, ease: EASE }}
                className="relative w-[150px] xs:w-[168px] sm:w-[192px] rounded-[1.6rem] bg-[#1C1F23] p-1.5 shadow-2xl border border-white/10 mt-6"
              >
                {/* Customer Label Badge */}
                <div className="absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-[#1C1F23] px-2.5 py-0.5 text-[9px] sm:text-[10px] font-semibold text-white shadow-md border border-white/10 flex items-center gap-1.5">
                  <User className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-sky-400" /> Customer&rsquo;s Phone
                </div>

                <div className="rounded-[1.25rem] bg-white overflow-hidden text-[10px]">
                  <div className="flex items-center justify-between bg-slate-50 px-2.5 sm:px-3 py-2 border-b border-slate-100">
                    <span className="font-semibold text-slate-500 truncate">Summit Roofing</span>
                    <span className="text-slate-400 shrink-0">now</span>
                  </div>
                  <AnimatePresence mode="wait">
                    {!phonePaid ? (
                      <motion.div
                        key="email"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="px-2.5 sm:px-3 py-3 space-y-2.5"
                      >
                        <div>
                          <p className="font-bold text-slate-900 leading-tight">Secure Payment Request</p>
                          <p className="text-slate-500 text-[9px]">Deposit (40%)</p>
                        </div>
                        <p className="text-sm xs:text-base sm:text-lg font-extrabold tabular-nums text-slate-900">$4,800.00</p>

                        {/* Mobile Pay Button + Touch Ripple */}
                        <motion.div
                          animate={{ scale: phonePressing && !phonePaid ? 0.93 : 1 }}
                          transition={{ duration: 0.12 }}
                          className="relative flex w-full items-center justify-center rounded-lg bg-[#00828A] py-1.5 sm:py-2 font-semibold text-white shadow-sm overflow-hidden text-[9px] sm:text-[10px]"
                        >
                          <span className="relative z-10">Pay $4,800.00</span>
                          <AnimatePresence>
                            {phonePressing && (
                              <motion.span
                                initial={{ opacity: 0.6, scale: 0 }}
                                animate={{ opacity: 0, scale: 4 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.5 }}
                                className="absolute left-1/2 top-1/2 h-10 w-10 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white z-0"
                              />
                            )}
                          </AnimatePresence>
                        </motion.div>

                        <p className="flex items-center gap-1 text-[8px] sm:text-[9px] text-slate-400 border-t border-slate-100 pt-2">
                          <Lock className="h-2 w-2 sm:h-2.5 sm:w-2.5 shrink-0 text-emerald-600" /> Secure via Stripe
                        </p>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="paid"
                        initial={{ opacity: 0, scale: 0.96 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="px-3 py-5 sm:py-6 flex flex-col items-center text-center gap-1.5"
                      >
                        <span className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-emerald-500 text-white shadow-md">
                          <Check className="h-4 w-4 sm:h-5 sm:w-5" strokeWidth={3} />
                        </span>
                        <p className="font-bold text-slate-900 text-[10px] sm:text-[11px]">Payment Successful!</p>
                        <p className="tabular-nums text-slate-500 text-[8px] sm:text-[9px]">$4,800.00 charged</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Central Success Pop-up */}
        <AnimatePresence>
          {showSuccess && (
            <motion.div
              key="success"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="pointer-events-none absolute inset-0 z-40 flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ scale: 0.85, y: 12 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.85, y: 12 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="flex w-full max-w-[14rem] sm:max-w-[16rem] flex-col items-center gap-2.5 sm:gap-3 rounded-2xl border border-white/10 bg-[#1C1F23] px-4 py-4 sm:px-6 sm:py-5 text-center text-white shadow-2xl"
              >
                <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-emerald-500 text-white shadow-inner">
                  <Check className="h-5 w-5 sm:h-6 sm:w-6" strokeWidth={3} />
                </div>
                <div>
                  <p className="text-sm sm:text-lg font-bold">Deposit Secured!</p>
                  <p className="mt-0.5 sm:mt-1 text-[10px] sm:text-xs text-slate-300">You are clear to begin work.</p>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Header */}
        <div className="bg-[#111827] text-white px-3.5 sm:px-5 pt-3.5 pb-3">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-base font-bold truncate">M. Johnson</span>
                <span className="inline-flex items-center gap-1 rounded-full border border-indigo-400/40 bg-indigo-500/15 px-1.5 sm:px-2 py-0.5 text-[8px] sm:text-[10px] font-semibold text-indigo-300">
                  <span className="h-1 w-1 rounded-full bg-indigo-300" /> Scheduled
                </span>
              </div>
              <p className="mt-0.5 text-slate-400 text-[9px] sm:text-[10px]">Roof Repair · #41 · Sep 10</p>
            </div>
            <div className="flex gap-1 shrink-0">
              <span className="flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded-md border border-white/10">
                <MoreVertical className="h-3 w-3 text-slate-400" />
              </span>
              <span className="flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded-md border border-white/10">
                <X className="h-3 w-3 text-slate-400" />
              </span>
            </div>
          </div>
          <div className="mt-2.5 sm:mt-3 grid grid-cols-3 sm:grid-cols-4 divide-x divide-white/10 border-t border-white/10 pt-2 text-[9px] sm:text-[10px]">
            <div className="pr-1.5 sm:pr-2">
              <p className="text-slate-400">Quote</p>
              <p className="font-semibold">$12,000.00</p>
              <p className="text-emerald-400">Accepted</p>
            </div>
            <div className="px-1.5 sm:px-2">
              <p className="text-slate-400">Payment</p>
              <p className="font-semibold">{depositPaid ? 'Balance due' : 'Deposit due'}</p>
              <p className={depositPaid ? 'text-slate-300' : 'text-rose-300'}>{depositPaid ? '$7,200.00' : '$4,800.00'}</p>
            </div>
            <div className="px-1.5 sm:px-2">
              <p className="text-slate-400">Scheduled</p>
              <p className="font-semibold">Oct 1</p>
              <p className="text-slate-400">8:00 AM</p>
            </div>
            <div className="hidden sm:block pl-2">
              <p className="text-slate-400">Invoice</p>
              <p className="font-semibold text-sky-300">#INV-041</p>
              <p className="text-slate-400">{depositPaid ? 'Deposit paid' : depositSent ? 'Deposit sent' : 'Draft'}</p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="flex">
          <div className="hidden sm:block w-[118px] shrink-0 border-r border-slate-100 bg-white py-2.5 px-2 space-y-0.5">
            {SIDEBAR.map((s) => {
              const Icon = s.icon;
              return (
                <div
                  key={s.label}
                  className={`flex items-center gap-2 rounded-md px-2 py-1.5 ${
                    s.active ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-slate-600'
                  }`}
                >
                  <Icon className="h-3 w-3 shrink-0" />
                  {s.label}
                </div>
              );
            })}
          </div>

          <div className="flex-1 min-w-0 bg-slate-50/60 p-2.5 sm:p-4 space-y-2.5 sm:space-y-3">
            {/* Steps */}
            <div className="rounded-lg border border-slate-200 bg-white px-1.5 sm:px-3 py-2 grid grid-cols-4 gap-0.5 sm:gap-1 text-center text-[8px] sm:text-[10px]">
              {steps.map((s) => (
                <div key={s.label} className="flex flex-col items-center gap-1 min-w-0">
                  <span
                    className={`flex h-3.5 w-3.5 sm:h-4 sm:w-4 items-center justify-center rounded-full transition-colors duration-500 ${
                      s.state === 'done'
                        ? 'bg-teal-600 text-white'
                        : s.state === 'current'
                        ? 'border-2 border-teal-600 bg-white'
                        : 'border border-slate-300 bg-white'
                    }`}
                  >
                    {s.state === 'done' && <Check className="h-2 w-2 sm:h-2.5 sm:w-2.5" strokeWidth={3} />}
                    {s.state === 'current' && <span className="h-1 w-1 sm:h-1.5 sm:w-1.5 rounded-full bg-teal-600" />}
                  </span>
                  <span
                    className={`w-full leading-tight truncate ${
                      s.state === 'done'
                        ? 'font-semibold text-slate-800'
                        : s.state === 'current'
                        ? 'font-semibold text-teal-700'
                        : 'text-slate-400'
                    }`}
                  >
                    {s.label}
                  </span>
                </div>
              ))}
            </div>

            {/* Progress */}
            <div className="rounded-lg border border-slate-200 bg-white px-2.5 sm:px-3 py-2 sm:py-2.5 text-[9px] sm:text-[10px]">
              <div className="flex items-baseline justify-between gap-2">
                <p className="text-slate-600 truncate">
                  <span className="font-bold text-slate-900 tabular-nums">{depositPaid ? '$4,800.00' : '$0.00'}</span> of
                  $12k
                </p>
                <span className="font-semibold shrink-0 text-slate-700">{pct}%</span>
              </div>
              <div className="mt-1.5 h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-slate-900"
                  initial={false}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.9, ease: EASE }}
                />
              </div>
            </div>

            {/* 1. Deposit */}
            <div
              className={`rounded-lg border bg-white px-2.5 sm:px-3 py-2 sm:py-2.5 transition-all duration-500 ${
                depositPaid ? 'border-emerald-500 ring-1 ring-emerald-500 bg-emerald-50/30' : 'border-slate-900 ring-1 ring-slate-900'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`font-bold ${depositPaid ? 'text-emerald-800' : 'text-slate-900'}`}>1. Deposit (40%)</span>
                <span
                  className={`rounded-full px-1.5 sm:px-2 py-0.5 text-[8px] sm:text-[9px] font-semibold ${
                    depositPaid
                      ? 'bg-emerald-100 text-emerald-800'
                      : depositSent
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {depositPaid ? 'Paid' : depositSent ? 'Awaiting' : 'Not sent'}
                </span>
              </div>
              <p className={`mt-0.5 sm:mt-1 text-xs sm:text-base font-extrabold tabular-nums ${depositPaid ? 'text-emerald-800' : 'text-slate-900'}`}>
                $4,800.00
              </p>
              <p className={depositPaid ? 'font-medium text-emerald-700 text-[9px] sm:text-[10px]' : 'text-slate-500 text-[9px] sm:text-[10px]'}>
                {depositPaid ? '✓ Secured Sep 14' : depositSent ? 'Sent Sep 12 · Due Sep 19' : 'Not sent yet'}
              </p>
              <div className={ROW}>
                {depositPaid ? (
                  <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold truncate text-[9px] sm:text-[10px]">
                    <Wrench className="h-3 w-3 shrink-0" /> Clear to work
                  </span>
                ) : depositSent ? (
                  <span className="inline-flex items-center gap-1 font-semibold text-slate-600 whitespace-nowrap text-[9px] sm:text-[10px]">
                    <Check className="h-3 w-3" /> Request sent
                  </span>
                ) : (
                  <>
                    <motion.span
                      ref={depositBtnRef}
                      animate={{ scale: pressing && phase === 0 ? 0.92 : 1 }}
                      transition={{ duration: 0.12 }}
                      className={BTN_DARK}
                    >
                      <Send className="h-3 w-3" /> Send Deposit
                    </motion.span>
                    <span className={`hidden md:inline-flex ${BTN_LIGHT}`}>
                      <Copy className="h-3 w-3" /> Link
                    </span>
                  </>
                )}
                <span className={BTN_PDF}>
                  <Download className="h-3 w-3" /> Deposit PDF
                </span>
              </div>
            </div>

            {/* 2. Remaining balance */}
            <div
              className={`rounded-lg px-2.5 sm:px-3 py-2 sm:py-2.5 transition-all duration-500 ${
                depositPaid ? 'border border-slate-300 bg-white' : 'border border-dashed border-slate-300 bg-slate-50/70 opacity-60'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`font-bold ${depositPaid ? 'text-slate-900' : 'text-slate-500'}`}>2. Remaining Balance</span>
                {depositPaid ? (
                  <span className="rounded-full bg-amber-100 px-1.5 sm:px-2 py-0.5 text-[8px] sm:text-[9px] font-semibold text-amber-800">Next up</span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full bg-slate-200 px-1.5 sm:px-2 py-0.5 text-[8px] sm:text-[9px] font-semibold text-slate-600">
                    <Lock className="h-2 w-2 sm:h-2.5 sm:w-2.5" /> Locked
                  </span>
                )}
              </div>
              <p className={`mt-0.5 sm:mt-1 text-xs sm:text-base font-extrabold tabular-nums ${depositPaid ? 'text-slate-900' : 'text-slate-400'}`}>
                $7,200.00
              </p>
              <p className="text-slate-500 text-[9px] sm:text-[10px]">
                {depositPaid ? 'Send final invoice when done' : 'Unlocks after deposit'}
              </p>
              <div className={ROW}>
                {depositPaid ? (
                  <>
                    <span className={BTN_LIGHT}>
                      <Send className="h-3 w-3" /> Send Invoice
                    </span>
                    <span className={BTN_PDF}>
                      <Download className="h-3 w-3" /> Balance PDF
                    </span>
                  </>
                ) : (
                  <span className="text-slate-400 truncate text-[9px] sm:text-[10px]">Collect when job is done</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Mobile bottom tabs */}
        <div className="sm:hidden grid grid-cols-5 gap-0.5 bg-[#111827] px-1 py-1">
          {MOBILE_TABS.map((t) => {
            const Icon = t.icon;
            return (
              <div
                key={t.label}
                className={`flex flex-col items-center gap-0.5 rounded-lg py-1 ${
                  t.active ? 'bg-white/10 text-blue-300' : 'text-slate-400'
                }`}
              >
                <Icon className="h-3 w-3" />
                <span className="text-[8px] font-medium">{t.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}