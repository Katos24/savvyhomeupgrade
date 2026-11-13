'use client';

import { useState, useEffect, useCallback, useTransition, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import {
  Loader2,
  Plus,
  ArrowRight,
  Menu,
  Mail,
  X,
  CalendarDays,
  CreditCard,
  LayoutList,
  Wallet,
  FileText,
  Clock,
  AlertTriangle,
  ArrowDownLeft,
  RotateCcw,
  Filter,
  Tag,
  RefreshCw,
} from 'lucide-react';
import { Toaster, toast } from 'sonner';
import { can, type PlanTier } from '@/lib/permissions';
import { getPaymentStatusDisplay } from '@/lib/paymentStatus';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useTeamMembers } from '@/hooks/useTeamMembers';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import { DEFAULT_STATUSES, CATEGORY_MAP } from '@/lib/formCategories';
import { useQuoteTemplates } from '@/hooks/useQuoteTemplates';
import { fontVars } from '@/components/marketing/marketingTheme';
import { useDashboardTheme } from '@/hooks/useDashboardTheme';

const DISPLAY = 'font-[family-name:var(--font-display)]';

// --- Dynamic imports for heavy modals & widgets ---
const Sidebar = dynamic(() => import('@/components/dashboard/Sidebar'), { ssr: false });
const LeadModal = dynamic(() => import('@/components/dashboard/LeadModal'), { ssr: false });
const CreateLeadModal = dynamic(() => import('@/components/dashboard/CreateLeadModal'), { ssr: false });
const AiChatWidget = dynamic(() => import('@/components/dashboard/DashboardModals').then((m) => m.AiChatWidget), {
  ssr: false,
});
const LockedFeatureModal = dynamic(
  () => import('@/components/dashboard/DashboardModals').then((m) => m.LockedFeatureModal),
  { ssr: false }
);
const PaymentRemindersWidget = dynamic(() => import('@/components/dashboard/PaymentRemindersWidget'), { ssr: false });
const PaymentToastPoller = dynamic(() => import('@/components/dashboard/PaymentToastPoller'), { ssr: false });
const TrialBanner = dynamic(() => import('@/components/TrialBanner'), { ssr: false });

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type StatusOption = string | { value: string; label?: string; color?: string };

type FormCategory = {
  value: string;
  label: string;
  [key: string]: unknown;
};



type LeadRecord = {
  id: number;
  status?: string;
  deleted?: boolean;
  customer_name?: string;
  [key: string]: unknown;
};

type LeadPayment = {
  id: number;
  amount: string | number;
  kind?: string;
  method?: string;
  paid_on?: string;
  payment_status?: string | null;
  [key: string]: unknown;
};

type LeadActivity = {
  id?: number;
  [key: string]: unknown;
};

type Company = {
  id: number;
  name: string;
  slug: string;
  business_type?: string | null;
  logo_url?: string | null;
  phone?: string | null;
  website?: string | null;
  email?: string;
  email_brand_color_1?: string | null;
  email_brand_color_2?: string | null;
  status_options?: StatusOption[];
  form_categories?: FormCategory[];
  form_field_config?: Record<string, unknown>;
  custom_questions?: Array<Record<string, unknown>>;
  subscription_status?: string;
  trial_ends_at?: string | null;
  plan_tier?: string;
  onboarding_completed?: boolean;
  onboarding_steps?: Record<string, boolean>;
  cancel_at_period_end?: boolean;
  subscription_cancel_at?: string | null;
  stripe_connect_onboarded?: boolean;
  stripe_payment_status?: string | null;
};

// Kept in sync with hooks/useDashboardStats.ts
export type DashboardStats = {
  leads: { new_this_week: number };
  estimates: { open: number; accepted: number };
  jobs: { active: number; active_value: number };
  invoices: { awaiting_payment: number; draft: number; past_due: number };
  todays_schedule: Array<{
    lead_id: number;
    project_id: number;
    customer_name: string;
    category: string | null;
    scheduled_time: string | null;
    scheduled_end_time: string | null;
    job_status: string;
    quote_total: string | number | null;
  }>;
  revenue_this_month: number;
  expenses_this_month?: number;
  status_counts?: Record<string, number>;
  ready_to_invoice: { count: number; value: number };
  recent_payments: Array<{
    id: number;
    amount: string | number;
    kind: string;
    method: string;
    paid_on: string;
    customer_name: string;
    payment_status: string | null;
    lead_id: number;
  }>;
};

type TopTab =
  | 'overview'
  | 'schedule'
  | 'quote'
  | 'payment'
  | 'expenses'
  | 'tasks'
  | 'photos'
  | 'activity'
  | 'reminders'
  | 'ai';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const toNumber = (value: unknown): number => {
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
  if (typeof value === 'string') {
    const n = Number.parseFloat(value);
    return Number.isFinite(n) ? n : 0;
  }
  return 0;
};

const wholeCurrencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

const exactCurrencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const fmtMoney = (n: number, preserveCents = false): string => {
  const safe = Number.isFinite(n) ? n : 0;
  if (preserveCents && Math.abs(safe % 1) > 0.001) {
    return exactCurrencyFormatter.format(safe);
  }
  return wholeCurrencyFormatter.format(safe);
};

const fmtTime = (t: string | null): string | null => {
  if (!t) return null;
  const parts = t.split(':');
  const h = Number(parts[0]);
  const m = parts[1] !== undefined ? Number(parts[1]) : 0;
  if (!Number.isInteger(h) || h < 0 || h > 23) return null;
  if (!Number.isInteger(m) || m < 0 || m > 59) return null;
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`;
};

const fmtTimeRange = (start: string | null, end: string | null): string => {
  const s = fmtTime(start);
  const e = fmtTime(end);
  if (!s) return 'Any time';
  return e ? `${s} – ${e}` : s;
};

const formatCategoryLabel = (value?: string | null): string =>
  (value || '').replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

const fmtShortDate = (d: string | null | undefined): string | null => {
  if (!d) return null;
  // Bare YYYY-MM-DD dates should not be shifted by UTC offset.
  if (/^\d{4}-\d{2}-\d{2}$/.test(d)) {
    const [year, month, day] = d.split('-').map(Number);
    return new Date(year, month - 1, day).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
  const parsed = new Date(d);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const getGreetingInfo = () => {
  const now = new Date();
  const h = now.getHours();
  return {
    greeting: h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening',
    todayLabel: now.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' }),
  };
};

const safeGetStorage = (key: string): string | null => {
  try {
    return typeof window !== 'undefined' ? window.localStorage.getItem(key) : null;
  } catch {
    return null;
  }
};

const safeSetStorage = (key: string, value: string): void => {
  try {
    if (typeof window !== 'undefined') window.localStorage.setItem(key, value);
  } catch {
    // Ignore storage quota / privacy mode errors
  }
};

async function parseJsonSafely<T = Record<string, unknown>>(res: Response): Promise<T | null> {
  try {
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Theme Tokens (static lookups — zero per-render allocations)
// ---------------------------------------------------------------------------

const THEME_TOKENS = {
  dark: {
    page: 'bg-[#0b0f17]',
    card: 'bg-[#131a27] border border-white/[0.08]',
    lift: 'hover:border-white/20',
    text: 'text-white',
    sub: 'text-slate-300',
    faint: 'text-slate-400',
    divide: 'divide-white/[0.07]',
    border: 'border-white/[0.08]',
    hover: 'hover:bg-white/[0.04]',
    track: 'bg-white/[0.07]',
    bar: 'bg-slate-300',
    iconBtn: 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10',
    primary: 'bg-white text-slate-900 hover:bg-slate-100',
    chip: 'bg-white/[0.06] text-slate-200 border-white/10',
    skeleton: 'bg-white/[0.08]',
    errorBox: 'border-red-500/30 bg-red-500/10 text-red-300',
    focusRing: 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b0f17]',
    urgentCard: 'ring-1 ring-red-500/40',
  },
  light: {
    page: 'bg-slate-100',
    card: 'bg-white border border-slate-200/80 shadow-[0_1px_2px_rgba(15,23,42,0.05)]',
    lift: 'hover:border-slate-300 hover:shadow-md',
    text: 'text-slate-900',
    sub: 'text-slate-600',
    faint: 'text-slate-500',
    divide: 'divide-slate-100',
    border: 'border-slate-200',
    hover: 'hover:bg-slate-50',
    track: 'bg-slate-100',
    bar: 'bg-slate-700',
    iconBtn: 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50',
    primary: 'bg-slate-900 text-white hover:bg-slate-800',
    chip: 'bg-white text-slate-700 border-slate-200',
    skeleton: 'bg-slate-200/70',
    errorBox: 'border-red-200 bg-red-50 text-red-700',
    focusRing: 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/60 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-100',
    urgentCard: 'ring-1 ring-red-500/35',
  },
} as const;

type Tokens = (typeof THEME_TOKENS)['light'] | (typeof THEME_TOKENS)['dark'];

type Tone = { icon: string; num: string; soft: string };
type ToneKey = 'green' | 'amber' | 'red' | 'sky' | 'slate';

const TONE_TOKENS: Record<'dark' | 'light', Record<ToneKey, Tone>> = {
  dark: {
    green: { icon: 'bg-emerald-400/15 text-emerald-300', num: 'text-emerald-300', soft: 'bg-emerald-400/10 text-emerald-300' },
    amber: { icon: 'bg-amber-400/15 text-amber-300', num: 'text-amber-300', soft: 'bg-amber-400/10 text-amber-300' },
    red: { icon: 'bg-red-500/15 text-red-400', num: 'text-red-400', soft: 'bg-red-500/10 text-red-400' },
    sky: { icon: 'bg-sky-400/15 text-sky-300', num: 'text-white', soft: 'bg-sky-400/10 text-sky-300' },
    slate: { icon: 'bg-white/[0.08] text-slate-300', num: 'text-white', soft: 'bg-white/[0.06] text-slate-300' },
  },
  light: {
    green: { icon: 'bg-emerald-100 text-emerald-700', num: 'text-emerald-700', soft: 'bg-emerald-50 text-emerald-700' },
    amber: { icon: 'bg-amber-100 text-amber-700', num: 'text-slate-900', soft: 'bg-amber-50 text-amber-800' },
    red: { icon: 'bg-red-100 text-red-600', num: 'text-red-600', soft: 'bg-red-50 text-red-700' },
    sky: { icon: 'bg-sky-100 text-sky-700', num: 'text-slate-900', soft: 'bg-sky-50 text-sky-800' },
    slate: { icon: 'bg-slate-100 text-slate-500', num: 'text-slate-900', soft: 'bg-slate-100 text-slate-600' },
  },
};

// ---------------------------------------------------------------------------
// Presentational Components
// ---------------------------------------------------------------------------

function DashboardSkeleton({ t }: { t: Tokens }) {
  return (
    <div
      className={`${fontVars} min-h-screen font-[family-name:var(--font-body)] ${t.page}`}
      role="status"
      aria-label="Loading dashboard"
    >
      <div className="mx-auto max-w-6xl animate-pulse px-4 py-5 sm:px-6 sm:py-8 lg:px-8">
        <div className="mb-6 flex items-start justify-between gap-3">
          <div className="space-y-2">
            <div className={`h-3.5 w-32 rounded ${t.skeleton}`} />
            <div className={`h-8 w-56 rounded-lg ${t.skeleton}`} />
            <div className={`h-3.5 w-40 rounded ${t.skeleton}`} />
          </div>
          <div className="flex gap-1.5">
            <div className={`h-9 w-20 rounded-xl ${t.skeleton}`} />
            <div className={`h-9 w-24 rounded-xl ${t.skeleton}`} />
          </div>
        </div>

        <div className="mb-7 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className={`rounded-2xl p-4 ${t.card}`}>
              <div className="flex items-center gap-2">
                <div className={`h-8 w-8 rounded-lg ${t.skeleton}`} />
                <div className={`h-3.5 w-24 rounded ${t.skeleton}`} />
              </div>
              <div className={`mt-4 h-7 w-20 rounded-lg ${t.skeleton}`} />
              <div className={`mt-2 h-3 w-28 rounded ${t.skeleton}`} />
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-7 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-7">
            <div className={`h-52 rounded-2xl ${t.card}`} />
            <div className={`h-72 rounded-2xl ${t.card}`} />
          </div>
          <div className={`h-80 rounded-2xl ${t.card}`} />
        </div>
      </div>
    </div>
  );
}

function SectionHeader({
  title,
  icon: Icon,
  tone,
  action,
  t,
}: {
  title: string;
  icon?: React.ElementType;
  tone?: Tone;
  action?: React.ReactNode;
  t: Tokens;
}) {
  return (
    <div className="mb-3 flex items-center justify-between gap-3">
      <h2 className={`${DISPLAY} flex items-center gap-2 text-base font-bold tracking-tight ${t.text}`}>
        {Icon && (
          <span className={`flex h-7 w-7 items-center justify-center rounded-lg ${tone?.icon || ''}`}>
            <Icon className="h-4 w-4" aria-hidden="true" />
          </span>
        )}
        {title}
      </h2>
      {action}
    </div>
  );
}

function LinkButton({ children, onClick, t }: { children: React.ReactNode; onClick: () => void; t: Tokens }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1 rounded-lg px-1.5 py-1 text-[13px] font-semibold transition hover:opacity-75 ${t.sub} ${t.focusRing}`}
    >
      {children} <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
    </button>
  );
}

function StatTile({
  label,
  value,
  sub,
  icon: Icon,
  tone,
  urgent = false,
  onClick,
  t,
}: {
  label: string;
  value: string;
  sub?: string;
  icon: React.ElementType;
  tone: Tone;
  urgent?: boolean;
  onClick: () => void;
  t: Tokens;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`${label}: ${value}${sub ? `, ${sub}` : ''}`}
      className={`group rounded-2xl p-4 text-left transition ${t.card} ${t.lift} ${t.focusRing} ${
        urgent ? t.urgentCard : ''
      }`}
    >
      <div className="flex items-center gap-2">
        <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${tone.icon}`}>
          <Icon className="h-4 w-4" aria-hidden="true" />
        </span>
        <span className={`min-w-0 truncate text-[13px] font-medium ${t.sub}`}>{label}</span>
      </div>
      <p className={`${DISPLAY} mt-3 text-2xl font-extrabold tabular-nums tracking-tight sm:text-[28px] ${tone.num}`}>
        {value}
      </p>
      {sub && <p className={`mt-0.5 truncate text-[12px] ${t.faint}`}>{sub}</p>}
    </button>
  );
}

// ---------------------------------------------------------------------------
// Banners / Nudges
// ---------------------------------------------------------------------------

function ConnectStripeCard({
  companySlug,
  t,
  isConnected,
}: {
  companySlug: string;
  t: Tokens;
  isConnected: boolean;
}) {
  const router = useRouter();
  const dismissKey = `stripe-card-dismissed-${companySlug}`;
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    setDismissed(safeGetStorage(dismissKey) === 'true');
  }, [dismissKey]);

  if (isConnected || dismissed) return null;

  const goToPayments = () => router.push(`/${companySlug}/home?section=payments`);

  return (
    <div className={`mb-5 flex items-center gap-3 rounded-2xl px-4 py-3.5 ${t.card}`}>
      <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border ${t.border}`}>
        <CreditCard className={`h-4 w-4 ${t.sub}`} aria-hidden="true" />
      </span>
      <div className="min-w-0 flex-1">
        <p className={`text-sm font-semibold ${t.text}`}>Connect Stripe to take card payments</p>
        <p className={`text-[13px] leading-snug ${t.sub}`}>
          Customers pay deposits and invoices online, and jobs update the moment they do.
        </p>
      </div>
      <button
        type="button"
        onClick={goToPayments}
        className={`hidden shrink-0 rounded-xl px-3.5 py-2 text-sm font-semibold transition sm:inline-flex ${t.primary} ${t.focusRing}`}
      >
        Connect
      </button>
      <button
        type="button"
        onClick={goToPayments}
        className={`shrink-0 rounded-lg p-2 sm:hidden ${t.sub} ${t.focusRing}`}
        aria-label="Connect Stripe"
      >
        <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </button>
      <button
        type="button"
        onClick={() => {
          safeSetStorage(dismissKey, 'true');
          setDismissed(true);
        }}
        aria-label="Dismiss Stripe prompt"
        className={`shrink-0 rounded-lg p-1.5 transition ${t.faint} ${t.hover} ${t.focusRing}`}
      >
        <X className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  );
}

function ServicesNudge({
  companySlug,
  unpriced,
  t,
  tone,
}: {
  companySlug: string;
  unpriced: string[];
  t: Tokens;
  tone: Tone;
}) {
  const router = useRouter();
  const dismissKey = `services-nudge-dismissed-${companySlug}`;
  const signature = unpriced.join('|');
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    setDismissed(safeGetStorage(dismissKey) === signature);
  }, [dismissKey, signature]);

  if (unpriced.length === 0 || dismissed) return null;

  const names =
    unpriced.length === 1
      ? `${unpriced[0]} has`
      : unpriced.length === 2
        ? `${unpriced[0]} and ${unpriced[1]} have`
        : `${unpriced.length} services have`;
  const go = () => router.push(`/${companySlug}/dashboard/services?view=services`);

  return (
    <div className={`mb-5 flex items-center gap-3 rounded-2xl px-4 py-3 ${t.card}`}>
      <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${tone.icon}`}>
        <Tag className="h-4 w-4" aria-hidden="true" />
      </span>
      <button type="button" onClick={go} className={`min-w-0 flex-1 rounded-lg text-left ${t.focusRing}`}>
        <span className={`block truncate text-sm font-semibold ${t.text}`}>{names} no price yet</span>
        <span className={`block truncate text-[13px] ${t.sub}`}>Add one and quotes fill in with one tap.</span>
      </button>
      <button
        type="button"
        onClick={go}
        className={`hidden shrink-0 rounded-xl px-3.5 py-2 text-sm font-semibold transition sm:inline-flex ${t.primary} ${t.focusRing}`}
      >
        Set prices
      </button>
      <button
        type="button"
        onClick={() => {
          safeSetStorage(dismissKey, signature);
          setDismissed(true);
        }}
        aria-label="Hide unpriced services notice"
        className={`shrink-0 rounded-lg p-1.5 transition ${t.faint} ${t.hover} ${t.focusRing}`}
      >
        <X className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Dashboard Sections
// ---------------------------------------------------------------------------

function TodaysScheduleSection({
  jobs,
  companySlug,
  openingLeadId,
  onOpenLead,
  t,
  tone,
}: {
  jobs: DashboardStats['todays_schedule'];
  companySlug: string;
  openingLeadId: number | null;
  onOpenLead: (leadId: number) => void;
  t: Tokens;
  tone: Tone;
}) {
  const router = useRouter();
  const totalValue = useMemo(() => jobs.reduce((sum, j) => sum + toNumber(j.quote_total), 0), [jobs]);

  return (
    <section>
      <SectionHeader
        title="Scheduled today"
        icon={CalendarDays}
        tone={tone}
        action={
          <LinkButton onClick={() => router.push(`/${companySlug}/dashboard/calendar`)} t={t}>
            Calendar
          </LinkButton>
        }
        t={t}
      />
      <div className={`overflow-hidden rounded-2xl ${t.card}`}>
        {jobs.length === 0 ? (
          <div className="flex items-center justify-between gap-3 px-4 py-6">
            <p className={`text-sm ${t.sub}`}>Nothing scheduled today.</p>
            <button
              type="button"
              onClick={() => router.push(`/${companySlug}/dashboard/calendar`)}
              className={`shrink-0 rounded-xl border px-3 py-1.5 text-xs font-semibold transition ${t.iconBtn} ${t.focusRing}`}
            >
              Open calendar
            </button>
          </div>
        ) : (
          <>
            <div className={`flex items-baseline justify-between border-b px-4 py-3 ${t.border}`}>
              <p className={`text-sm ${t.sub}`}>
                {jobs.length} {jobs.length === 1 ? 'job' : 'jobs'}
              </p>
              {totalValue > 0 && <p className={`text-sm font-semibold tabular-nums ${t.text}`}>{fmtMoney(totalValue)}</p>}
            </div>
            <div className={`divide-y ${t.divide}`}>
              {jobs.map((job) => {
                const jobValue = toNumber(job.quote_total);
                const isOpening = openingLeadId === job.lead_id;
                const timeLabel = fmtTimeRange(job.scheduled_time, job.scheduled_end_time);

                return (
                  <button
                    key={job.project_id}
                    type="button"
                    disabled={openingLeadId !== null}
                    onClick={() => onOpenLead(job.lead_id)}
                    className={`flex w-full items-center gap-3 px-4 py-3 text-left transition disabled:opacity-70 ${t.hover} ${t.focusRing}`}
                  >
                    <span
                      className={`min-w-[80px] shrink-0 rounded-lg px-2 py-1.5 text-center text-[12px] font-semibold tabular-nums ${tone.soft}`}
                    >
                      {fmtTime(job.scheduled_time) || 'Any time'}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className={`block truncate text-[15px] font-semibold ${t.text}`}>{job.customer_name}</span>
                      <span className={`block truncate text-[13px] ${t.sub}`}>
                        {formatCategoryLabel(job.category) || 'General'}
                        {job.scheduled_end_time ? ` · ${timeLabel}` : ''}
                      </span>
                    </span>
                    {jobValue > 0 && (
                      <span className={`hidden shrink-0 text-sm font-medium tabular-nums sm:inline ${t.sub}`}>
                        {fmtMoney(jobValue)}
                      </span>
                    )}
                    {isOpening ? (
                      <Loader2 className={`h-4 w-4 shrink-0 animate-spin ${t.sub}`} aria-hidden="true" />
                    ) : (
                      <ArrowRight className={`h-4 w-4 shrink-0 ${t.faint}`} aria-hidden="true" />
                    )}
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>
    </section>
  );
}

function Pipeline({
  statusOptions,
  counts,
  companySlug,
  activeJobs,
  activeValue,
  t,
  tone,
}: {
  statusOptions: StatusOption[];
  counts: Record<string, number>;
  companySlug: string;
  activeJobs: number;
  activeValue: number;
  t: Tokens;
  tone: Tone;
}) {
  const router = useRouter();

  const { rows, max, total } = useMemo(() => {
    const mapped = statusOptions.map((opt) => {
      const value = typeof opt === 'string' ? opt : opt.value;
      const label = typeof opt === 'string' ? formatCategoryLabel(opt) : opt.label || formatCategoryLabel(opt.value);
      return { value, label, count: counts[value] || 0 };
    });
    const known = new Set(mapped.map((r) => r.value));
    const otherCount = Object.entries(counts)
      .filter(([k]) => !known.has(k))
      .reduce((sum, [, n]) => sum + n, 0);
    if (otherCount > 0) mapped.push({ value: '', label: 'Other', count: otherCount });

    return {
      rows: mapped,
      max: Math.max(1, ...mapped.map((r) => r.count)),
      total: mapped.reduce((sum, r) => sum + r.count, 0),
    };
  }, [statusOptions, counts]);

  return (
    <section>
      <SectionHeader
        title={`Pipeline · ${total} ${total === 1 ? 'lead' : 'leads'}`}
        icon={Filter}
        tone={tone}
        action={
          <LinkButton onClick={() => router.push(`/${companySlug}/home?section=pipeline`)} t={t}>
            Edit stages
          </LinkButton>
        }
        t={t}
      />
      <div className={`rounded-2xl p-1.5 ${t.card}`}>
        {activeJobs > 0 && (
          <p className={`mx-2.5 mb-1 mt-1.5 border-b pb-2.5 text-[13px] ${t.border} ${t.sub}`}>
            <span className={`font-semibold ${t.text}`}>{activeJobs}</span> active {activeJobs === 1 ? 'job' : 'jobs'}
            {activeValue > 0 && <> · {fmtMoney(activeValue)} in progress</>}
          </p>
        )}
        {rows.map((r) => (
          <button
            key={r.value || 'other'}
            type="button"
            onClick={() => r.value && router.push(`/${companySlug}/leads?status=${encodeURIComponent(r.value)}`)}
            disabled={!r.value}
            className={`grid w-full grid-cols-[104px_1fr_32px] items-center gap-3 rounded-lg px-2.5 py-2 text-left transition sm:grid-cols-[140px_1fr_40px] ${
              r.value ? `${t.hover} ${t.focusRing}` : 'cursor-default'
            }`}
          >
            <span className={`truncate text-[15px] ${r.count ? t.text : t.faint}`}>{r.label}</span>
            <span className={`h-1.5 overflow-hidden rounded-full ${t.track}`} aria-hidden="true">
              <span
                className={`block h-full rounded-full transition-all duration-500 ${t.bar}`}
                style={{ width: r.count ? `max(6px, ${(r.count / max) * 100}%)` : '0%' }}
              />
            </span>
            <span className={`text-right text-[15px] font-semibold tabular-nums ${r.count ? t.text : t.faint}`}>
              {r.count}
            </span>
          </button>
        ))}
        <button
          type="button"
          onClick={() => router.push(`/${companySlug}/leads`)}
          className={`mt-1 flex w-full items-center justify-between rounded-lg border-t px-2.5 py-2.5 text-sm font-semibold transition ${t.border} ${t.text} ${t.hover} ${t.focusRing}`}
        >
          View all leads
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </section>
  );
}

function RecentPaymentsSection({
  payments,
  companySlug,
  openingLeadId,
  onOpenLead,
  t,
  greenTone,
  slateTone,
}: {
  payments: DashboardStats['recent_payments'];
  companySlug: string;
  openingLeadId: number | null;
  onOpenLead: (leadId: number) => void;
  t: Tokens;
  greenTone: Tone;
  slateTone: Tone;
}) {
  const router = useRouter();

  const getKindLabel = (kind: string) => {
    switch (kind) {
      case 'deposit':
        return 'Deposit';
      case 'balance':
        return 'Balance';
      case 'refund':
        return 'Refund';
      default:
        return 'Payment';
    }
  };

  return (
    <section>
      <SectionHeader
        title="Recent payments"
        icon={Wallet}
        tone={greenTone}
        action={
          <LinkButton onClick={() => router.push(`/${companySlug}/dashboard/financials`)} t={t}>
            Financials
          </LinkButton>
        }
        t={t}
      />
      <div className={`overflow-hidden rounded-2xl ${t.card}`}>
        {payments.length === 0 ? (
          <p className={`px-4 py-6 text-sm ${t.sub}`}>No payments recorded yet.</p>
        ) : (
          <div className={`divide-y ${t.divide}`}>
            {payments.slice(0, 6).map((p) => {
              const statusInfo =
                p.payment_status && p.payment_status !== 'paid' ? getPaymentStatusDisplay(p.payment_status) : null;
              const amount = toNumber(p.amount);
              const isRefund =
                amount < 0 ||
                p.kind === 'refund' ||
                p.payment_status === 'refunded' ||
                p.payment_status === 'partially_refunded';
              const RowIcon = isRefund ? RotateCcw : ArrowDownLeft;
              const isOpening = openingLeadId === p.lead_id;
              const dateLabel = fmtShortDate(p.paid_on);

              return (
                <button
                  key={p.id}
                  type="button"
                  disabled={openingLeadId !== null}
                  onClick={() => onOpenLead(p.lead_id)}
                  className={`flex w-full items-center gap-3 px-4 py-3 text-left transition disabled:opacity-70 ${t.hover} ${t.focusRing}`}
                >
                  <span
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                      isRefund ? slateTone.icon : greenTone.icon
                    }`}
                  >
                    {isOpening ? (
                      <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                    ) : (
                      <RowIcon className="h-4 w-4" aria-hidden="true" />
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className={`block truncate text-[15px] font-medium ${t.text}`}>{p.customer_name}</span>
                    <span className={`block truncate text-[13px] ${t.sub}`}>
                      {getKindLabel(p.kind)}
                      {dateLabel ? ` · ${dateLabel}` : ''}
                      {statusInfo ? ` · ${statusInfo.label}` : ''}
                    </span>
                  </span>
                  <span
                    className={`shrink-0 text-[15px] font-semibold tabular-nums ${isRefund ? t.sub : greenTone.num}`}
                  >
                    {fmtMoney(amount, true)}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export default function CompanyDashboardClient({ company }: { company: Company }) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  const { data: stats, isLoading: loading, error: statsError, refetch: fetchStats } = useDashboardStats(company.slug);
  const loadError = statsError ? 'Could not load the dashboard. Check your connection and try again.' : '';
  const [lockedDashboardModal, setLockedDashboardModal] = useState<string | null>(null);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<LeadRecord | null>(null);
  const [selectedLeadTab, setSelectedLeadTab] = useState<TopTab>('overview');
  const [selectedLeadPayments, setSelectedLeadPayments] = useState<LeadPayment[]>([]);
  const [selectedLeadActivity, setSelectedLeadActivity] = useState<LeadActivity[]>([]);
  const [openingLeadId, setOpeningLeadId] = useState<number | null>(null);

  const openLeadAbortRef = useRef<AbortController | null>(null);

  const [dashboardLeads, setDashboardLeads] = useState<LeadRecord[]>([]);

  const { isDark } = useDashboardTheme();
  const t = THEME_TOKENS[isDark ? 'dark' : 'light'];
  const tone = TONE_TOKENS[isDark ? 'dark' : 'light'];
  const planTier = (company.plan_tier || 'free') as PlanTier;

  const { data: currentUser } = useCurrentUser();
  const { data: teamMembers } = useTeamMembers(company.slug);
  const { data: quoteTemplates } = useQuoteTemplates(company.slug, {
    enabled: can(planTier, 'quote_templates'),
  });

  // Live greeting/date so long-lived tabs don't show stale day or time-of-day.
  const [{ greeting, todayLabel }, setGreetingInfo] = useState(getGreetingInfo);
  useEffect(() => {
    const sync = () => setGreetingInfo(getGreetingInfo());
    const interval = window.setInterval(sync, 60_000);
    document.addEventListener('visibilitychange', sync);
    return () => {
      window.clearInterval(interval);
      document.removeEventListener('visibilitychange', sync);
    };
  }, []);

  // Lock background scroll and allow Escape key to close the mobile sidebar drawer.
  useEffect(() => {
    if (!sidebarOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSidebarOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [sidebarOpen]);

  // Fetch page 1 of real leads for AiChatWidget and keep it in sync on mutations.
  const fetchDashboardLeads = useCallback(
    async (signal?: AbortSignal) => {
      try {
        const res = await fetch(`/api/company/${company.slug}/leads?page=1`, { cache: 'no-store', signal });
        if (!res.ok) return;
        const data = await parseJsonSafely<{ leads?: LeadRecord[] }>(res);
        if (data?.leads) {
          setDashboardLeads(data.leads.filter((l) => !l.deleted));
        }
      } catch (err) {
        if ((err as Error)?.name !== 'AbortError') {
          console.error('fetchDashboardLeads:', err);
        }
      }
    },
    [company.slug]
  );

  useEffect(() => {
    const controller = new AbortController();
    fetchDashboardLeads(controller.signal);
    return () => controller.abort();
  }, [fetchDashboardLeads]);

  // Services with no starting price (waits until templates have loaded).
// Services with no starting price (waits until templates have loaded).
  const unpricedServices = useMemo(() => {
    if (!quoteTemplates || !can(planTier, 'categories')) return [];
    const fallbackCategories = CATEGORY_MAP[company.business_type || 'general'] || CATEGORY_MAP.general || [];
    const services: FormCategory[] = company.form_categories?.length ? company.form_categories : fallbackCategories;
    return services
      .filter((svc) => !quoteTemplates.some((qt) => qt.category === svc.value))
      .map((svc) => svc.label);
  }, [quoteTemplates, company.form_categories, company.business_type, planTier]);

  const handleLogout = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/logout', { method: 'POST' });
      if (!res.ok) throw new Error('Logout failed');
      startTransition(() => router.push('/login'));
    } catch {
      toast.error('Could not sign out. Please try again.');
    }
  }, [router]);

  const userMeta = useCallback(
    () => ({
      user_name: currentUser?.name || currentUser?.email || 'Unknown User',
      user_email: currentUser?.email || '',
    }),
    [currentUser]
  );

  const openLead = useCallback(async (leadId: number, tab: TopTab = 'overview') => {
    openLeadAbortRef.current?.abort();
    const controller = new AbortController();
    openLeadAbortRef.current = controller;
    setOpeningLeadId(leadId);

    try {
      const res = await fetch(`/api/leads/${leadId}`, {
        cache: 'no-store',
        signal: controller.signal,
      });
      const data = await parseJsonSafely<{
        success?: boolean;
        lead?: LeadRecord;
        payments?: LeadPayment[];
        activity?: LeadActivity[];
        error?: string;
      }>(res);

      if (!res.ok || !data?.success || !data.lead) {
        toast.error(data?.error || 'Could not load job details.');
        return;
      }

      setSelectedLead(data.lead);
      setSelectedLeadTab(tab);
      setSelectedLeadPayments(data.payments || []);
      setSelectedLeadActivity(data.activity || []);
    } catch (err) {
      if ((err as Error)?.name !== 'AbortError') {
        console.error('openLead:', err);
        toast.error('Could not load job details. Check your connection.');
      }
    } finally {
      if (openLeadAbortRef.current === controller) {
        setOpeningLeadId(null);
      }
    }
  }, []);

  // Abort any in-flight lead fetch on unmount.
  useEffect(() => {
    return () => openLeadAbortRef.current?.abort();
  }, []);

  // Deep link: /{company}/dashboard?lead=123 opens that job (used by Outbox "Open job").
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const leadParam = Number.parseInt(params.get('lead') || '', 10);
    if (Number.isFinite(leadParam) && leadParam > 0) {
      openLead(leadParam);
      window.history.replaceState({}, '', `/${company.slug}/dashboard`);
    }
  }, [company.slug, openLead]);

  const updateLeadStatus = useCallback(
    async (id: number, status: string, oldStatus: string, sendReview = true) => {
      try {
        const res = await fetch('/api/leads/update', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id,
            status,
            action: 'update_status',
            old_status: oldStatus,
            send_review_request: sendReview,
            ...userMeta(),
          }),
        });
        const result = await parseJsonSafely<{ success?: boolean; error?: string }>(res);
        if (res.ok && result?.success) {
          setSelectedLead((prev) => (prev?.id === id ? { ...prev, status } : prev));
          fetchStats();
          fetchDashboardLeads();
          return true;
        }
        toast.error(result?.error || 'Failed to update status.');
        return false;
      } catch (e) {
        console.error('updateLeadStatus:', e);
        toast.error('Network error while updating status.');
        return false;
      }
    },
    [fetchStats, fetchDashboardLeads, userMeta]
  );

  const addNote = useCallback(
    async (id: number, noteText: string) => {
      try {
        const res = await fetch('/api/leads/update', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id, notes: noteText, action: 'add_note', ...userMeta() }),
        });
        const result = await parseJsonSafely<{ success?: boolean; error?: string }>(res);
        if (res.ok && result?.success) return true;
        toast.error(result?.error || 'Failed to save note.');
        return false;
      } catch (e) {
        console.error('addNote:', e);
        toast.error('Network error while saving note.');
        return false;
      }
    },
    [userMeta]
  );

  const deleteLead = useCallback(
    async (id: number) => {
      try {
        const res = await fetch('/api/leads/delete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id, ...userMeta() }),
        });
        const result = await parseJsonSafely<{ success?: boolean; error?: string }>(res);
        if (res.ok && result?.success) {
          fetchStats();
          fetchDashboardLeads();
          return true;
        }
        toast.error(result?.error || 'Failed to delete lead.');
        return false;
      } catch (e) {
        console.error('deleteLead:', e);
        toast.error('Network error while deleting lead.');
        return false;
      }
    },
    [fetchStats, fetchDashboardLeads, userMeta]
  );

  const refreshModalLead = useCallback(async () => {
    if (!selectedLead) return;
    await openLead(selectedLead.id, selectedLeadTab);
    fetchStats();
    fetchDashboardLeads();
  }, [selectedLead, selectedLeadTab, openLead, fetchStats, fetchDashboardLeads]);

  const handleCreateSuccess = useCallback(() => {
    fetchStats();
    fetchDashboardLeads();
  }, [fetchStats, fetchDashboardLeads]);

  const handleOpenCreateModal = useCallback(() => setIsCreateModalOpen(true), []);
  const handleCloseCreateModal = useCallback(() => setIsCreateModalOpen(false), []);
  const handleCloseLeadModal = useCallback(() => setSelectedLead(null), []);
  const handleCloseLockedModal = useCallback(() => setLockedDashboardModal(null), []);
  const handleCloseSidebar = useCallback(() => setSidebarOpen(false), []);
  const handleOpenSidebar = useCallback(() => setSidebarOpen(true), []);

  const statusOptions: StatusOption[] = company.status_options?.length ? company.status_options : DEFAULT_STATUSES;
  const firstName = currentUser?.name?.trim().split(/\s+/)[0] || 'there';

  if (loading) {
    return <DashboardSkeleton t={t} />;
  }

  return (
    <div
      className={`${fontVars} relative min-h-screen font-[family-name:var(--font-body)] antialiased transition-colors ${t.page}`}
    >
      <Toaster position="top-right" richColors />

      {/* Sidebar overlay (mobile/tablet) */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-[10000]" role="dialog" aria-modal="true" aria-label="Navigation menu">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={handleCloseSidebar} aria-hidden="true" />
          <aside className="absolute bottom-0 left-0 top-0 z-[10001] w-72 max-w-[85vw]">
            <Sidebar
              companySlug={company.slug}
              companyName={company.name}
              companyLogoUrl={company.logo_url}
              currentUser={currentUser}
              onLogout={handleLogout}
              isOpen={sidebarOpen}
              onClose={handleCloseSidebar}
              currentView="cards"
              onViewChange={() => {}}
              brandColor1="#0f172a"
              brandColor2="#0f172a"
            />
          </aside>
        </div>
      )}

      <div className="relative z-10">
        <TrialBanner
          subscriptionStatus={company.subscription_status || 'inactive'}
          trialEndsAt={company.trial_ends_at || null}
          companySlug={company.slug}
          cancelAtPeriodEnd={company.cancel_at_period_end}
          subscriptionCancelAt={company.subscription_cancel_at}
          planTier={company.plan_tier || 'free'}
        />
        <PaymentToastPoller slug={company.slug} onSelectLead={(leadId) => openLead(leadId)} />
      </div>

      <main className="relative z-10 mx-auto max-w-6xl px-4 py-5 sm:px-6 sm:py-8 lg:px-8">
        {/* ── Header ── */}
        <header className="mb-6 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className={`text-[13px] font-medium ${t.sub}`}>{todayLabel}</p>
            <h1 className={`${DISPLAY} mt-0.5 truncate text-2xl font-extrabold tracking-tight sm:text-3xl ${t.text}`}>
              {greeting}, {firstName}
            </h1>
            <p className={`mt-1 flex items-center gap-1.5 text-[13px] ${t.sub}`}>
              {company.logo_url ? (
                <img src={company.logo_url} alt="" className="h-4 w-4 rounded-full bg-white object-contain" />
              ) : null}
              <span className="truncate">{company.name}</span>
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-1.5">
            <button
              type="button"
              onClick={() => router.push(`/${company.slug}/leads`)}
              className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-sm font-semibold transition ${t.iconBtn} ${t.focusRing}`}
            >
              <LayoutList className="h-4 w-4" aria-hidden="true" />
              Leads
            </button>
            <button
              type="button"
              onClick={handleOpenCreateModal}
              className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold transition ${t.primary} ${t.focusRing}`}
              aria-label="Add lead"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              <span className="hidden sm:inline">Add lead</span>
            </button>
            <button
              type="button"
              onClick={() => router.push(`/${company.slug}/outbox`)}
              className={`rounded-xl border p-2 transition ${t.iconBtn} ${t.focusRing}`}
              aria-label="Email outbox"
              title="Email outbox"
            >
              <Mail className="h-4 w-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={handleOpenSidebar}
              className={`rounded-xl border p-2 transition lg:hidden ${t.iconBtn} ${t.focusRing}`}
              aria-label="Open menu"
            >
              <Menu className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </header>

        <ConnectStripeCard
          companySlug={company.slug}
          t={t}
          isConnected={Boolean(company.stripe_connect_onboarded) && company.stripe_payment_status === 'active'}
        />

        <ServicesNudge companySlug={company.slug} unpriced={unpricedServices} t={t} tone={tone.sky} />

        {loadError && (
          <div
            role="alert"
            className={`mb-5 flex items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-sm ${t.errorBox}`}
          >
            <span>{loadError}</span>
            <button
              type="button"
              onClick={() => fetchStats()}
              className={`inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-red-700 ${t.focusRing}`}
            >
              <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
              Retry
            </button>
          </div>
        )}

        {stats && (
          <>
            {/* ── At a glance ── */}
            <div className="mb-7 grid grid-cols-2 gap-3 lg:grid-cols-4">
              <StatTile
                label="Collected this month"
                value={fmtMoney(stats.revenue_this_month)}
                sub="Deposits and payments"
                icon={Wallet}
                tone={tone.green}
                onClick={() => router.push(`/${company.slug}/dashboard/financials`)}
                t={t}
              />
              <StatTile
                label="Ready to invoice"
                value={String(stats.ready_to_invoice.count)}
                sub={
                  stats.ready_to_invoice.count > 0
                    ? `${fmtMoney(stats.ready_to_invoice.value)} to bill`
                    : 'Nothing waiting'
                }
                icon={FileText}
                tone={stats.ready_to_invoice.count > 0 ? tone.sky : tone.slate}
                onClick={() => router.push(`/${company.slug}/dashboard/financials`)}
                t={t}
              />
              <StatTile
                label="Awaiting payment"
                value={String(stats.invoices.awaiting_payment)}
                sub="Sent, not paid yet"
                icon={Clock}
                tone={stats.invoices.awaiting_payment > 0 ? tone.amber : tone.slate}
                onClick={() => router.push(`/${company.slug}/dashboard/financials`)}
                t={t}
              />
              <StatTile
                label="Past due"
                value={String(stats.invoices.past_due)}
                sub={stats.invoices.past_due > 0 ? 'Follow up on these' : 'All caught up'}
                icon={AlertTriangle}
                tone={stats.invoices.past_due > 0 ? tone.red : tone.slate}
                urgent={stats.invoices.past_due > 0}
                onClick={() => router.push(`/${company.slug}/dashboard/financials`)}
                t={t}
              />
            </div>

            <div className="grid grid-cols-1 gap-7 lg:grid-cols-[minmax(0,1fr)_360px]">
              {/* ── Left: today + pipeline ── */}
              <div className="min-w-0 space-y-7">
                <TodaysScheduleSection
                  jobs={stats.todays_schedule}
                  companySlug={company.slug}
                  openingLeadId={openingLeadId}
                  onOpenLead={(leadId) => openLead(leadId)}
                  t={t}
                  tone={tone.sky}
                />

                <Pipeline
                  statusOptions={statusOptions}
                  counts={stats.status_counts || {}}
                  companySlug={company.slug}
                  activeJobs={stats.jobs.active}
                  activeValue={stats.jobs.active_value}
                  t={t}
                  tone={tone.slate}
                />
              </div>

              {/* ── Right: money coming in ── */}
              <div className="min-w-0">
                <RecentPaymentsSection
                  payments={stats.recent_payments}
                  companySlug={company.slug}
                  openingLeadId={openingLeadId}
                  onOpenLead={(leadId) => openLead(leadId)}
                  t={t}
                  greenTone={tone.green}
                  slateTone={tone.slate}
                />
              </div>
            </div>

            {/* ── Payment reminders ── */}
            <div className="mt-7">
              <PaymentRemindersWidget
                slug={company.slug}
                companyName={company.name}
                planTier={planTier}
                isDark={isDark}
                onSelectLead={(leadId) => openLead(leadId)}
              />
            </div>
          </>
        )}
      </main>

      {selectedLead && (
        <LeadModal
          lead={selectedLead}
          initialTab={selectedLeadTab}
          onClose={handleCloseLeadModal}
          onUpdateStatus={updateLeadStatus}
          onAddNote={addNote}
          onDeleteLead={deleteLead}
          onRefresh={refreshModalLead}
          payments={selectedLeadPayments}
          activity={selectedLeadActivity}
          currentUser={currentUser}
          statusOptions={statusOptions}
          categories={company.form_categories || []}
          company={company}
          companySlug={company.slug}
          teamMembers={teamMembers}
        />
      )}

      {isCreateModalOpen && (
        <CreateLeadModal
          isOpen={isCreateModalOpen}
          onClose={handleCloseCreateModal}
          onSuccess={handleCreateSuccess}
          companySlug={company.slug}
          companyId={company.id}
          categories={company.form_categories || []}
          company={company}
        />
      )}

      <AiChatWidget
        planTier={planTier}
        allLeads={dashboardLeads}
        company={company}
        isVisible={!selectedLead && !isCreateModalOpen}
        onLockedFeature={setLockedDashboardModal}
      />

      <LockedFeatureModal
        featureKey={lockedDashboardModal}
        companySlug={company.slug}
        onClose={handleCloseLockedModal}
      />
    </div>
  );
}