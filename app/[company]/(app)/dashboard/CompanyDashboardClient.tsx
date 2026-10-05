'use client';

import { useState, useEffect, useCallback, useTransition, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Loader2, Plus, ArrowRight, Sun, Moon, Menu, Mail, X, Zap } from 'lucide-react';
import { Toaster } from 'sonner';
import { can, type PlanTier } from '@/lib/permissions';
import { getPaymentStatusDisplay } from '@/lib/paymentStatus';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useTeamMembers } from '@/hooks/useTeamMembers';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import { DEFAULT_STATUSES, stageColorHex } from '@/lib/formCategories';
import { useQuoteTemplates } from '@/hooks/useQuoteTemplates';


// --- Dynamic Imports for Heavy Modals & Widgets (Reduces Initial JS Bundle) ---
const Sidebar = dynamic(() => import('@/components/dashboard/Sidebar'), { ssr: false });
const LeadModal = dynamic(() => import('@/components/dashboard/LeadModal'), { ssr: false });
const CreateLeadModal = dynamic(() => import('@/components/dashboard/CreateLeadModal'), { ssr: false });
const AiChatWidget = dynamic(() => import('@/components/dashboard/DashboardModals').then(m => m.AiChatWidget), { ssr: false });
const LockedFeatureModal = dynamic(() => import('@/components/dashboard/DashboardModals').then(m => m.LockedFeatureModal), { ssr: false });
const PaymentRemindersWidget = dynamic(() => import('@/components/dashboard/PaymentRemindersWidget'), { ssr: false });
const PaymentToastPoller = dynamic(() => import('@/components/dashboard/PaymentToastPoller'), { ssr: false });
const TrialBanner = dynamic(() => import('@/components/TrialBanner'), { ssr: false });

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type Company = {
  id: number;
  name: string;
  slug: string;
  logo_url?: string | null;
  phone?: string | null;
  website?: string | null;
  email?: string;
  email_brand_color_1?: string | null;
  email_brand_color_2?: string | null;
  status_options?: any[];
  form_categories?: any[];
  form_field_config?: any;
  custom_questions?: any[];
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

// Kept in sync by hand with the copy in hooks/useDashboardStats.ts
// (that copy is the one TypeScript actually checks `stats` against).
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

type TopTab = 'overview' | 'schedule' | 'quote' | 'payment' | 'expenses' | 'tasks' | 'photos' | 'activity' | 'reminders' | 'ai';

// ---------------------------------------------------------------------------
// Helpers (Hoisted outside component)
// ---------------------------------------------------------------------------

const fmtMoney = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);

const fmtTime = (t: string | null) => {
  if (!t) return null;
  const [h, m] = t.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, '0')} ${ampm}`;
};

const formatCategoryLabel = (value?: string | null) =>
  (value || '').replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

const fmtShortDate = (d: string | null | undefined) => {
  if (!d) return null;
  const datePart = d.split('T')[0];
  const [year, month, day] = datePart.split('-').map(Number);
  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

function readableTextColor(hex: string, isDark: boolean): string {
  const clean = hex.replace('#', '');
  if (clean.length !== 6) return hex;
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  const tooLight = !isDark && brightness > 200;
  const tooDark = isDark && brightness < 55;
  if (!tooLight && !tooDark) return hex;
  const factor = tooLight ? 0.55 : 1.8;
  const adjust = (c: number) => Math.min(255, Math.max(0, Math.round(c * factor)));
  const toHex = (c: number) => c.toString(16).padStart(2, '0');
  return `#${toHex(adjust(r))}${toHex(adjust(g))}${toHex(adjust(b))}`;
}

// ---------------------------------------------------------------------------
// Connect Stripe Card — only renders when Stripe genuinely isn't active yet.
// Dismissible per-company via localStorage; gone for good once connected.
// ---------------------------------------------------------------------------

function ConnectStripeCard({
  companySlug,
  isDark,
  isConnected,
}: {
  companySlug: string;
  isDark: boolean;
  isConnected: boolean;
}) {
  const router = useRouter();
  const dismissKey = `stripe-card-dismissed-${companySlug}`;
  const [dismissed, setDismissed] = useState(true); // hidden until mount-check, avoids a flash

  useEffect(() => {
    setDismissed(localStorage.getItem(dismissKey) === 'true');
  }, [dismissKey]);

  if (isConnected || dismissed) return null;

  return (
    <div
      className={`mb-6 sm:mb-8 rounded-2xl border overflow-hidden ${
        isDark ? 'border-[#635BFF]/30 bg-[#635BFF]/[0.08]' : 'border-[#635BFF]/20 bg-[#635BFF]/[0.05]'
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 px-5 py-4 sm:py-5">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#635BFF]">
            <svg viewBox="0 0 32 32" className="h-5 w-5" fill="none">
              <path d="M14.5 11.4c0-1 .8-1.4 2.1-1.4 1.9 0 4.3.6 6.2 1.6V6.1c-2.1-.8-4.1-1.2-6.2-1.2-5.1 0-8.5 2.7-8.5 7.1 0 6.9 9.6 5.8 9.6 8.8 0 1.2-1 1.6-2.5 1.6-2.1 0-4.8-.9-6.9-2v5.6c2.3 1 4.7 1.5 6.9 1.5 5.2 0 8.8-2.6 8.8-7.1-.1-7.4-9.5-6.1-9.5-9z" fill="#fff" />
            </svg>
          </div>
          <div className="min-w-0">
            <p className={`flex items-center gap-1.5 text-sm font-bold ${isDark ? 'text-white' : 'text-[#1c1917]'}`}>
              <Zap className="h-3.5 w-3.5 text-[#635BFF]" />
              Connect Stripe to automate payments
            </p>
            <p className={`mt-0.5 text-xs leading-relaxed ${isDark ? 'text-slate-400' : 'text-[#78716c]'}`}>
              Let customers pay online with a card — your ledger updates the moment they do, no manual recording.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
          <button
            type="button"
            onClick={() => router.push(`/${companySlug}/home?section=payments`)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#635BFF] px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-[#534ae6]"
          >
            Connect Stripe <ArrowRight className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => {
              localStorage.setItem(dismissKey, 'true');
              setDismissed(true);
            }}
            aria-label="Dismiss"
            className={`p-2 rounded-lg transition-colors ${isDark ? 'text-slate-500 hover:bg-white/10' : 'text-slate-400 hover:bg-slate-100'}`}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Pipeline breakdown — one row per status in the company's pipeline order,
// horizontal bar scaled to the largest stage. Each row links to Leads
// filtered by that status. Counts come from dashboard-stats (all leads,
// not just page 1).
// ---------------------------------------------------------------------------

type StatusOption = string | { value: string; label?: string; color?: string };

// Same palette as Settings → PipelineTab's COLOR_OPTIONS. Stage colors are
// stored as names ('slate', 'blue', ...), not hex, so they must be mapped.
// Keep in sync with PipelineTab until both import one shared map.
const STAGE_COLOR_HEX: Record<string, string> = {
  slate: '#475569',
  blue: '#0284c7',
  teal: '#0d9488',
  green: '#059669',
  yellow: '#d97706',
  orange: '#ea580c',
  red: '#e11d48',
  gray: '#27272a',
};

const stageHex = (color?: string) =>
  color ? STAGE_COLOR_HEX[color] || (color.startsWith('#') ? color : undefined) : undefined;

function StatusBreakdown({
  statusOptions,
  counts,
  companySlug,
  accentColor,
  isDark,
  cardBg,
  cardText,
  subText,
}: {
  statusOptions: StatusOption[];
  counts: Record<string, number>;
  companySlug: string;
  accentColor: string;
  isDark: boolean;
  cardBg: string;
  cardText: string;
  subText: string;
}) {
  const router = useRouter();

  const rows = statusOptions.map((opt) => {
    const value = typeof opt === 'string' ? opt : opt.value;
    const label = typeof opt === 'string' ? formatCategoryLabel(opt) : opt.label || formatCategoryLabel(opt.value);
    const color = typeof opt === 'string' ? undefined : opt.color;
    return { value, label, color, count: counts[value] || 0 };
  });

  // Leads whose status isn't in the company's current list (renamed/removed stages)
  const known = new Set(rows.map((r) => r.value));
  const otherCount = Object.entries(counts)
    .filter(([k]) => !known.has(k))
    .reduce((s, [, n]) => s + n, 0);
  if (otherCount > 0) rows.push({ value: '', label: 'Other', color: undefined, count: otherCount });

  const max = Math.max(1, ...rows.map((r) => r.count));
  const total = rows.reduce((s, r) => s + r.count, 0);

  return (
    <div className="mb-6 sm:mb-8">
            <div className="flex items-baseline justify-between mb-3">
        <h2 className={`text-base sm:text-lg font-semibold ${cardText}`}>Pipeline</h2>
        <div className="flex items-baseline gap-3">
          <span className={`text-xs sm:text-sm ${subText}`}>
            {total} lead{total === 1 ? '' : 's'}
          </span>
          <button
            type="button"
            onClick={() => router.push(`/${companySlug}/home?section=pipeline`)}
                        className={`inline-flex items-center gap-1 text-xs sm:text-sm font-semibold transition hover:opacity-70 ${cardText}`}
            title="Rename, reorder, or add pipeline stages"
          >
            Edit stages <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
      <div className={`rounded-2xl p-2 sm:p-3 ${cardBg}`}>
        {rows.map((r) => (
          <button
            key={r.value || 'other'}
            onClick={() => r.value && router.push(`/${companySlug}/leads?status=${encodeURIComponent(r.value)}`)}
            disabled={!r.value}
            className={`w-full grid grid-cols-[96px_1fr_36px] sm:grid-cols-[140px_1fr_44px] items-center gap-3 px-2 sm:px-3 py-2 rounded-lg text-left transition ${
              r.value ? (isDark ? 'hover:bg-white/5' : 'hover:bg-[#faf9f5]') : 'cursor-default'
            }`}
          >
            <span className={`text-xs sm:text-sm font-medium truncate ${r.count ? cardText : subText}`}>{r.label}</span>
            <div className={`h-2.5 sm:h-3 rounded-full overflow-hidden ${isDark ? 'bg-white/5' : 'bg-[#f1ede4]'}`}>
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: r.count ? `max(6px, ${(r.count / max) * 100}%)` : '0%',
                  background: stageColorHex(r.color) || accentColor,
                                                }}
              />
            </div>
            <span className={`text-xs sm:text-sm font-semibold tabular-nums text-right ${r.count ? cardText : subText}`}>
              {r.count}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export default function CompanyDashboardClient({ company }: { company: Company }) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  const {
    data: stats,
    isLoading: loading,
    error: statsError,
    refetch: fetchStats,
  } = useDashboardStats(company.slug);
  const loadError = statsError ? 'Could not load dashboard. Check your connection and try again.' : '';
  const [lockedDashboardModal, setLockedDashboardModal] = useState<string | null>(null);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<any>(null);
  const [selectedLeadTab, setSelectedLeadTab] = useState<TopTab>('overview');
  const [selectedLeadPayments, setSelectedLeadPayments] = useState<any[]>([]);
  const [selectedLeadActivity, setSelectedLeadActivity] = useState<any[]>([]);

  // AiChatWidget data: page 1 of real leads, same endpoint LeadsClient uses.
  // Not full history (see the AI chat rebuild item on the list).
  const [dashboardLeads, setDashboardLeads] = useState<any[]>([]);
  useEffect(() => {
    let cancelled = false;
    fetch(`/api/company/${company.slug}/leads?page=1`, { cache: 'no-store' })
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) setDashboardLeads((data.leads || []).filter((l: any) => !l.deleted));
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [company.slug]);

  const [isDark, setIsDark] = useState<boolean>(true);
  const skipFirstWrite = useRef(true);

  useEffect(() => {
    setIsDark(localStorage.getItem('dashboard-theme') !== 'light');
  }, []);

  useEffect(() => {
    if (skipFirstWrite.current) {
      skipFirstWrite.current = false;
      return;
    }
    localStorage.setItem('dashboard-theme', isDark ? 'dark' : 'light');
    // Same-tab notification so CompanyShell's background follows this toggle.
    window.dispatchEvent(new Event('theme-changed'));
  }, [isDark]);

  const planTier = (company.plan_tier || 'free') as PlanTier;

  const { data: currentUser } = useCurrentUser();
  const { data: teamMembers } = useTeamMembers(company.slug);
    // Loads quote templates while the list is showing, so the Quote tab has them instantly.
  useQuoteTemplates(company.slug, { enabled: can((company.plan_tier || 'free') as PlanTier, 'quote_templates') });

  const handleLogout = useCallback(async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    startTransition(() => router.push('/login'));
  }, [router]);

  const userMeta = useCallback(() => ({
    user_name: currentUser?.name || currentUser?.email || 'Unknown User',
    user_email: currentUser?.email || '',
  }), [currentUser]);

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
        const result = await res.json();
        if (res.ok && result.success) {
          if (selectedLead?.id === id) setSelectedLead((prev: any) => ({ ...prev, status }));
          fetchStats();
          return true;
        }
        return false;
      } catch (e) {
        console.error('updateLeadStatus:', e);
        return false;
      }
    },
    [selectedLead, fetchStats, userMeta]
  );

  const addNote = useCallback(
    async (id: number, noteText: string) => {
      try {
        const res = await fetch('/api/leads/update', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id, notes: noteText, action: 'add_note', ...userMeta() }),
        });
        const result = await res.json();
        return res.ok && result.success;
      } catch (e) {
        console.error('addNote:', e);
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
        const result = await res.json();
        if (res.ok && result.success) {
          fetchStats();
          return true;
        }
        return false;
      } catch (e) {
        console.error('deleteLead:', e);
        return false;
      }
    },
    [fetchStats, userMeta]
  );

  const openLead = useCallback(async (leadId: number, tab: TopTab = 'overview') => {
    try {
      const res = await fetch(`/api/leads/${leadId}`, { cache: 'no-store' });
      const data = await res.json();
      if (data.success && data.lead) {
        setSelectedLead(data.lead);
        setSelectedLeadTab(tab);
        setSelectedLeadPayments(data.payments || []);
        setSelectedLeadActivity(data.activity || []);
      }
    } catch (e) {
      console.error('openLead:', e);
    }
  }, []);

  const refreshModalLead = useCallback(async () => {
    if (!selectedLead) return;
    await openLead(selectedLead.id, selectedLeadTab);
    fetchStats();
  }, [selectedLead, selectedLeadTab, openLead, fetchStats]);

  // Dynamic values
  const { greeting, todayLabel } = useMemo(() => {
    const h = new Date().getHours();
    let g = 'Good evening';
    if (h < 12) g = 'Good morning';
    else if (h < 18) g = 'Good afternoon';

    const label = new Date().toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
    return { greeting: g, todayLabel: label };
  }, []);

  const todaysScheduleTotal = useMemo(() => {
    if (!stats?.todays_schedule) return 0;
    return stats.todays_schedule.reduce((s, j) => s + (parseFloat(String(j.quote_total || '0')) || 0), 0);
  }, [stats?.todays_schedule]);

  const accentColor = company.email_brand_color_1 || '#2563eb';
  const accentTextColor = useMemo(() => readableTextColor(accentColor, isDark), [accentColor, isDark]);

  const bg = isDark ? 'bg-[#0b0f17]' : 'bg-[#faf9f5]';
  const cardBg = isDark ? 'bg-[#0f1420] border border-white/10' : 'bg-white border border-[#e7e2d8]';
  const cardText = isDark ? 'text-white' : 'text-[#1c1917]';
  const subText = isDark ? 'text-slate-400' : 'text-[#78716c]';
  const heading = isDark ? 'text-slate-100' : 'text-[#1c1917]';
  const divider = isDark ? 'border-white/10' : 'border-[#e7e2d8]';

  // Stable handlers for JSX listeners
  const handleOpenCreateModal = useCallback(() => setIsCreateModalOpen(true), []);
  const handleCloseCreateModal = useCallback(() => setIsCreateModalOpen(false), []);
  const handleCloseLeadModal = useCallback(() => setSelectedLead(null), []);
  const handleCloseLockedModal = useCallback(() => setLockedDashboardModal(null), []);
  const handleCloseSidebar = useCallback(() => setSidebarOpen(false), []);
  const handleOpenSidebar = useCallback(() => setSidebarOpen(true), []);
  const handleToggleTheme = useCallback(() => setIsDark((v) => !v), []);

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${bg}`} role="status" aria-label="Loading dashboard">
        <Loader2 className="w-8 h-8 sm:w-10 sm:h-10 animate-spin" style={{ color: accentTextColor }} />
      </div>
    );
  }

  return (
    <div className={`min-h-screen relative transition-colors ${bg}`}>
      <Toaster position="top-right" richColors />

      {/* Sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 transition-all duration-300 z-[10000]" aria-hidden={!sidebarOpen}>
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity duration-300 opacity-100"
            onClick={handleCloseSidebar}
          />
          <aside
            className="absolute left-0 top-0 bottom-0 w-72 max-w-[85vw] transition-transform duration-300 translate-x-0 z-[10001]"
            aria-label="Navigation sidebar"
          >
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
              brandColor1={company.email_brand_color_1 || '#2563eb'}
              brandColor2={company.email_brand_color_2 || '#4f46e5'}
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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-5 sm:py-8 lg:py-12 relative z-10 font-sans">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-6 sm:mb-8 gap-4">
          <div className="min-w-0">
            <p className={`text-xs sm:text-sm font-medium ${subText}`}>{todayLabel}</p>
            <h1 className={`text-2xl sm:text-4xl lg:text-5xl font-light leading-tight truncate ${heading}`}>
              {greeting}, {currentUser?.name?.split(' ')[0] || 'there'}
            </h1>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0">
            <div
              className="inline-flex items-center gap-2 rounded-full pl-2 pr-3.5 py-1.5 max-w-[160px] sm:max-w-none"
              style={{ background: `${accentColor}1a`, border: `1px solid ${accentColor}33` }}
            >
              {company.logo_url ? (
                <img
                  src={company.logo_url}
                  alt={company.name}
                  className="w-5 h-5 sm:w-6 sm:h-6 rounded-full object-contain bg-white shrink-0"
                />
              ) : (
                <div
                  className="w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-white text-[10px] sm:text-[11px] font-black shrink-0"
                  style={{ background: accentColor }}
                >
                  {company.name?.charAt(0) || 'C'}
                </div>
              )}
              <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider truncate" style={{ color: accentColor }}>
                {company.name}
              </span>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2">
              <button
                onClick={handleOpenCreateModal}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#1c1917] px-2.5 sm:px-3.5 py-2 sm:py-2.5 text-xs font-bold text-white hover:opacity-90 transition"
                aria-label="Add lead"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Add lead</span>
              </button>

              <button
                onClick={() => router.push(`/${company.slug}/outbox`)}
                className={`p-2 sm:p-2.5 rounded-xl border transition-colors ${
                  isDark ? 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10' : 'border-[#e7e2d8] bg-white text-[#57534e] hover:bg-slate-50'
                }`}
                aria-label="View Email Outbox"
                title="View Email Outbox"
              >
                <Mail className="w-4 h-4" />
              </button>

              <button
                onClick={handleToggleTheme}
                className={`p-2 sm:p-2.5 rounded-xl border transition-colors ${
                  isDark ? 'border-white/10 bg-white/5 text-slate-300' : 'border-[#e7e2d8] bg-white text-[#57534e]'
                }`}
                aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
                title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>

              <button
                onClick={handleOpenSidebar}
                className={`lg:hidden p-2 sm:p-2.5 rounded-xl border transition-colors ${
                  isDark ? 'border-white/10 bg-white/5 text-slate-300' : 'border-[#e7e2d8] bg-white text-[#57534e]'
                }`}
                aria-label="Open menu"
              >
                <Menu className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <ConnectStripeCard
          companySlug={company.slug}
          isDark={isDark}
          isConnected={!!company.stripe_connect_onboarded && company.stripe_payment_status === 'active'}
        />

        {loadError && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-xs sm:text-sm font-bold flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <span>{loadError}</span>
            <button
              onClick={() => fetchStats()}
              className="uppercase tracking-widest text-[10px] bg-red-500 text-white px-3 py-1.5 rounded-lg w-full sm:w-auto text-center"
            >
              Retry
            </button>
          </div>
        )}

        {stats && (
          <>
            {/* Pipeline — lead count per status, replaces the old 4-box stat strip */}
            <StatusBreakdown
              statusOptions={company.status_options?.length ? company.status_options : DEFAULT_STATUSES}
              counts={stats.status_counts || {}}
              companySlug={company.slug}
              accentColor={accentTextColor}
              isDark={isDark}
              cardBg={cardBg}
              cardText={cardText}
              subText={subText}
            />

            {/* Today's Schedule + Financials */}
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
              {/* Today's Schedule */}
              <div className="min-w-0">
                <h2 className={`text-base sm:text-lg font-semibold mb-3 ${heading}`}>Today&apos;s Schedule</h2>
                <div className={`rounded-2xl overflow-hidden ${cardBg}`}>
                  <div className={`flex flex-col sm:flex-row sm:items-center justify-between px-4 sm:px-5 py-3.5 sm:py-4 border-b ${divider}`}>
                    <p className={`text-xl sm:text-2xl font-semibold ${cardText}`}>
                      {fmtMoney(todaysScheduleTotal)}{' '}
                      <span className={`text-xs sm:text-sm font-normal block sm:inline ${subText}`}>booked today</span>
                    </p>
                    <span className={`text-xs sm:text-sm mt-1 sm:mt-0 ${subText}`}>
                      {stats.todays_schedule.length} job{stats.todays_schedule.length === 1 ? '' : 's'}
                    </span>
                  </div>

                  {stats.todays_schedule.length === 0 ? (
                    <div className="px-4 sm:px-5 py-8 sm:py-10 text-center">
                      <p className={`text-xs sm:text-sm ${subText}`}>Nothing scheduled for today.</p>
                    </div>
                  ) : (
                    <div className={`divide-y ${isDark ? 'divide-white/10' : 'divide-[#e7e2d8]'}`}>
                      {stats.todays_schedule.map((job) => (
                        <button
                          key={job.project_id}
                          onClick={() => openLead(job.lead_id)}
                          className={`w-full flex items-center justify-between gap-3 px-4 sm:px-5 py-3.5 sm:py-4 text-left transition ${
                            isDark ? 'hover:bg-white/5 active:bg-white/10' : 'hover:bg-[#faf9f5]'
                          }`}
                        >
                          <div className="min-w-0 flex-1">
                            <p className={`text-xs font-mono font-medium ${subText}`}>{fmtTime(job.scheduled_time) || 'No time set'}</p>
                            <p className={`text-sm sm:text-base font-semibold truncate ${cardText}`}>{job.customer_name}</p>
                            <p className={`text-xs truncate ${subText}`}>{formatCategoryLabel(job.category) || 'General'}</p>
                          </div>
                          <ArrowRight className={`w-4 h-4 shrink-0 ${subText}`} />
                        </button>
                      ))}
                    </div>
                  )}

                  <div className={`px-4 sm:px-5 py-3 border-t ${divider}`}>
                    <button
                      onClick={() => router.push(`/${company.slug}/dashboard/calendar`)}
                      className={`text-xs sm:text-sm font-semibold inline-flex items-center gap-1 py-1 ${cardText}`}
                    >
                      View full schedule <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Financials — revenue plus the money signals moved here from the old stat strip */}
              <div className="min-w-0">
                <h2 className={`text-base sm:text-lg font-semibold mb-3 ${heading}`}>Financials</h2>
                <button
                  onClick={() => router.push(`/${company.slug}/dashboard/financials`)}
                  className={`w-full text-left rounded-2xl p-4 sm:p-5 ${cardBg} hover:opacity-90 transition active:scale-[0.99]`}
                >
                  <p className={`text-xs ${subText} mb-1`}>Revenue this month</p>
                  <p className={`text-2xl sm:text-3xl font-semibold tabular-nums ${cardText}`}>
                    {fmtMoney(stats.revenue_this_month)}
                  </p>

                  <div className={`mt-4 pt-4 border-t space-y-2 ${divider}`}>
                    <div className="flex justify-between text-xs sm:text-sm">
                      <span className={subText}>Awaiting payment</span>
                      <span className={`font-semibold tabular-nums ${cardText}`}>{stats.invoices.awaiting_payment}</span>
                    </div>
                    <div className="flex justify-between text-xs sm:text-sm">
                      <span className={subText}>Past due</span>
                      <span className={`font-semibold tabular-nums ${stats.invoices.past_due > 0 ? 'text-rose-500' : cardText}`}>
                        {stats.invoices.past_due}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs sm:text-sm">
                      <span className={subText}>Ready to invoice</span>
                      <span className={`font-semibold tabular-nums ${cardText}`}>
                        {stats.ready_to_invoice.count} · {fmtMoney(stats.ready_to_invoice.value)}
                      </span>
                    </div>
                  </div>

                  <span className={`mt-4 inline-flex items-center gap-1 text-xs sm:text-sm font-semibold ${cardText}`}>
                    See financials <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </button>
              </div>
            </div>

            {/* Payment Reminders + Recent Payments */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6 sm:mt-8">
              <div className="flex flex-col h-full min-w-0">
                <PaymentRemindersWidget
                  slug={company.slug}
                  companyName={company.name}
                  planTier={planTier}
                  isDark={isDark}
                  onSelectLead={(leadId) => openLead(leadId)}
                />
              </div>

              <div className="flex flex-col h-full min-w-0">
                <div className={`rounded-2xl border ${cardBg} overflow-hidden font-sans flex flex-col h-full`}>
                  <div className={`flex items-center justify-between px-4 sm:px-5 py-3.5 border-b ${divider}`}>
                    <h3 className={`text-sm sm:text-base font-semibold ${cardText}`}>Recent Payments</h3>
                  </div>

                  <div className={`divide-y overflow-y-auto max-h-[380px] flex-1 ${isDark ? 'divide-white/10' : 'divide-[#e7e2d8]'}`}>
                    {stats.recent_payments.length === 0 ? (
                      <div className="p-8 text-center">
                        <p className={`text-xs sm:text-sm ${subText}`}>No payments recorded yet.</p>
                      </div>
                    ) : (
                      stats.recent_payments.map((p) => {
                        const statusInfo = p.payment_status && p.payment_status !== 'paid'
                          ? getPaymentStatusDisplay(p.payment_status)
                          : null;
                        const isRefundRelated =
                          p.payment_status === 'refunded' || p.payment_status === 'partially_refunded';
                        return (
                          <button
                            key={p.id}
                            onClick={() => openLead(p.lead_id)}
                            className={`w-full flex items-center justify-between gap-3 px-4 sm:px-5 py-3.5 text-left transition ${
                              isDark ? 'hover:bg-white/5 active:bg-white/10' : 'hover:bg-[#faf9f5]'
                            }`}
                          >
                            <div className="min-w-0 flex-1">
                              <p className={`text-sm font-semibold truncate ${cardText}`}>{p.customer_name}</p>
                              <p className={`text-xs ${subText}`}>
                                {p.kind === 'deposit' ? 'Deposit' : p.kind === 'balance' ? 'Balance' : 'Payment'}
                                {' · '}
                                {fmtShortDate(p.paid_on)}
                              </p>
                            </div>
                            <div className="flex flex-col items-end gap-1 shrink-0">
                              <p className={`text-xs sm:text-sm font-semibold tabular-nums ${isRefundRelated ? subText : cardText}`}>
                                {fmtMoney(parseFloat(String(p.amount)))}
                              </p>
                              {statusInfo && (
                                <span
                                  className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded"
                                  style={{ color: statusInfo.color, backgroundColor: statusInfo.bg }}
                                >
                                  {statusInfo.label}
                                </span>
                              )}
                            </div>
                          </button>
                        );
                      })
                    )}
                  </div>

                  <div className={`flex items-center justify-between px-4 sm:px-5 py-3 border-t ${divider}`}>
                    <button
                      onClick={() => router.push(`/${company.slug}/dashboard/financials`)}
                      className={`text-xs sm:text-sm font-semibold inline-flex items-center gap-1 py-1 ${cardText}`}
                    >
                      View all payments <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => router.push(`/${company.slug}/outbox`)}
                      className={`text-xs sm:text-sm font-semibold inline-flex items-center gap-1 py-1 ${subText}`}
                    >
                      View outbox <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </main>

      {/* Conditionally Loaded Modals */}
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
          statusOptions={company.status_options?.length ? company.status_options : DEFAULT_STATUSES}
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
          onSuccess={() => fetchStats()}
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