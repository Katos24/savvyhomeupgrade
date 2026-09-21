'use client';

import { useState, useEffect, useCallback, useTransition, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Loader2, Plus, ArrowRight, Sun, Moon, Menu, Mail, Receipt, X, Zap } from 'lucide-react';
import { Toaster } from 'sonner';
import { type PlanTier } from '@/lib/permissions';
import { getPaymentStatusDisplay } from '@/lib/paymentStatus';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useTeamMembers } from '@/hooks/useTeamMembers';
import { useDashboardStats } from '@/hooks/useDashboardStats';

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
// Connect Stripe Card — only renders when Stripe genuinely isn't active
// yet. Dismissible per-company via localStorage (a "remind me later," not
// a permanent hide — it comes back if they revisit after dismissing but
// still haven't connected). Once stripe_payment_status actually becomes
// 'active', this card is gone for good regardless of dismiss state,
// since there's nothing left to guide them toward.
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
  const [dismissed, setDismissed] = useState(true); // default hidden until mount-check below, avoids a flash

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
          {/* Stripe wordmark, inline SVG — same technique as the brand
              marks already used in FormTab.tsx and PaymentsTab.tsx this
              session, no external image request. */}
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
                        onClick={() => router.push(`/${companySlug}/home#payments`)}
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
  }, [isDark]);

  const planTier = (company.plan_tier || 'free') as PlanTier;



   const { data: currentUser } = useCurrentUser();
  const { data: teamMembers } = useTeamMembers(company.slug);

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
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-6 sm:mb-8 gap-4">
          <div className="min-w-0">
            <p className={`text-xs sm:text-sm font-medium ${subText}`}>{todayLabel}</p>
            <h1 className={`text-2xl sm:text-4xl lg:text-5xl font-light leading-tight truncate ${heading}`}>
              {greeting}, {currentUser?.name?.split(' ')[0] || 'there'}
            </h1>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0">
            <div
              className="inline-flex items-center gap-2 rounded-full pl-2 pr-3.5 py-1.5 max-w-[200px] sm:max-w-none"
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
            {/* Stat row: Leads / Estimates / Jobs / Invoices */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
              {/* Leads Card */}
              <div className={`rounded-2xl p-4 sm:p-6 ${cardBg}`}>
                <div className="flex items-center justify-between mb-3">
                  <p className={`text-base sm:text-lg font-medium ${cardText}`}>New</p>
                  <button
                    onClick={handleOpenCreateModal}
                    className="inline-flex items-center gap-1 text-xs font-bold text-white bg-[#1c1917] rounded-full px-3 py-1.5 hover:opacity-90 transition min-h-[32px]"
                  >
                    <Plus className="w-3 h-3" /> Add lead
                  </button>
                </div>
                <p className={`text-3xl sm:text-4xl font-semibold tabular-nums ${cardText}`}>{stats.leads.new_this_week}</p>
                <p className={`text-xs sm:text-sm font-medium mt-1 sm:mt-2 ${cardText}`}>New</p>
                <p className={`text-xs ${subText}`}>New this week</p>
              </div>

              {/* Estimates Card */}
              <button
                onClick={() => router.push(`/${company.slug}/leads?status=quoted`)}
                className={`text-left rounded-2xl p-4 sm:p-6 ${cardBg} hover:opacity-90 transition active:scale-[0.99]`}
              >
                <p className={`text-base sm:text-lg font-medium ${cardText} mb-3`}>Estimates</p>
                <p className={`text-3xl sm:text-4xl font-semibold tabular-nums ${cardText}`}>{stats.estimates.open}</p>
                <p className={`text-xs sm:text-sm font-medium mt-1 sm:mt-2 ${cardText}`}>Open</p>
                <p className={`text-xs ${subText}`}>{stats.estimates.accepted} accepted</p>
              </button>

              {/* Jobs Card */}
              <button
                onClick={() => router.push(`/${company.slug}/leads`)}
                className={`text-left rounded-2xl p-4 sm:p-6 ${cardBg} hover:opacity-90 transition active:scale-[0.99]`}
              >
                <p className={`text-base sm:text-lg font-medium ${cardText} mb-3`}>Jobs</p>
                <p className={`text-3xl sm:text-4xl font-semibold tabular-nums ${cardText}`}>{stats.jobs.active}</p>
                <p className={`text-xs sm:text-sm font-medium mt-1 sm:mt-2 ${cardText}`}>Active</p>
                <p className={`text-xs ${subText}`}>{fmtMoney(stats.jobs.active_value)} booked</p>
              </button>

              {/* Invoices Card */}
              <button
                onClick={() => router.push(`/${company.slug}/dashboard/financials`)}
                className={`text-left rounded-2xl p-4 sm:p-6 ${cardBg} hover:opacity-90 transition active:scale-[0.99]`}
              >
                <p className={`text-base sm:text-lg font-medium ${cardText} mb-3`}>Invoices</p>
                <p className={`text-3xl sm:text-4xl font-semibold tabular-nums ${cardText}`}>{stats.invoices.awaiting_payment}</p>
                <p className={`text-xs sm:text-sm font-medium mt-1 sm:mt-2 ${cardText}`}>Awaiting payment</p>
                <p className={`text-xs ${subText}`}>{stats.invoices.draft} draft · {stats.invoices.past_due} past due</p>
              </button>
            </div>

            {/* Today's Schedule + Business Performance */}
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
              {/* Today's Schedule */}
              <div className="min-w-0">
                <h2 className={`text-base sm:text-lg font-semibold mb-3 ${heading}`}>Today&apos;s Schedule</h2>
                <div className={`rounded-2xl overflow-hidden ${cardBg}`}>
                  <div className={`flex flex-col sm:flex-row sm:items-center justify-between px-4 sm:px-5 py-3.5 sm:py-4 border-b ${isDark ? 'border-white/10' : 'border-[#e7e2d8]'}`}>
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

                  <div className={`px-4 sm:px-5 py-3 border-t ${isDark ? 'border-white/10' : 'border-[#e7e2d8]'}`}>
                    <button
                      onClick={() => router.push(`/${company.slug}/dashboard/calendar`)}
                      className={`text-xs sm:text-sm font-semibold inline-flex items-center gap-1 py-1 ${cardText}`}
                    >
                      View full schedule <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Business Performance & Financial Utilities */}
              <div className="min-w-0">
                <h2 className={`text-base sm:text-lg font-semibold mb-3 ${heading}`}>Business Performance</h2>
                <div className="space-y-3 sm:space-y-4">
                  {/* Revenue Card */}
                  <div className={`rounded-2xl p-4 sm:p-5 ${cardBg}`}>
                    <div className="flex items-center justify-between">
                      <p className={`text-xs sm:text-sm font-semibold ${cardText}`}>Revenue</p>
                      <ArrowRight className={`w-4 h-4 ${subText}`} />
                    </div>
                    <p className={`text-xs ${subText} mb-1`}>This month so far</p>
                    <p className={`text-2xl sm:text-3xl font-semibold tabular-nums ${cardText}`}>
                      {fmtMoney(stats.revenue_this_month)}
                    </p>
                  </div>

                  {/* Expenses Card */}
                  <button
                    onClick={() => router.push(`/${company.slug}/dashboard/financials#expenses`)}
                    className={`w-full text-left rounded-2xl p-4 sm:p-5 ${cardBg} hover:opacity-90 transition active:scale-[0.99]`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Receipt className={`w-4 h-4 ${subText}`} />
                        <p className={`text-xs sm:text-sm font-semibold ${cardText}`}>Job Expenses</p>
                      </div>
                      <ArrowRight className={`w-4 h-4 ${subText}`} />
                    </div>
                    <p className={`text-xs ${subText} mb-1`}>Logged project costs & materials</p>
                    <p className={`text-2xl sm:text-3xl font-semibold tabular-nums ${cardText}`}>
                      {fmtMoney(stats.expenses_this_month ?? 0)}
                    </p>
                  </button>

                  {/* Ready to Invoice Card */}
                  <button
                    onClick={() => router.push(`/${company.slug}/leads?status=completed`)}
                    className={`w-full text-left rounded-2xl p-4 sm:p-5 ${cardBg} hover:opacity-90 transition active:scale-[0.99]`}
                  >
                    <div className="flex items-center justify-between">
                      <p className={`text-xs sm:text-sm font-semibold ${cardText}`}>Ready to invoice</p>
                      <ArrowRight className={`w-4 h-4 ${subText}`} />
                    </div>
                    <p className={`text-xs ${subText} mb-1`}>Completed jobs not yet billed</p>
                    <p className={`text-2xl sm:text-3xl font-semibold tabular-nums ${cardText}`}>
                      {fmtMoney(stats.ready_to_invoice.value)}
                    </p>
                  </button>

                  {/* Outbox Status Card */}
                  <button
                    onClick={() => router.push(`/${company.slug}/outbox`)}
                    className={`w-full text-left rounded-2xl p-4 sm:p-5 ${cardBg} hover:opacity-90 transition active:scale-[0.99]`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Mail className={`w-4 h-4 ${subText}`} />
                        <p className={`text-xs sm:text-sm font-semibold ${cardText}`}>Email Outbox</p>
                      </div>
                      <ArrowRight className={`w-4 h-4 ${subText}`} />
                    </div>
                    <p className={`text-xs ${subText} mt-1`}>Review sent schedules, invoices, and dispatch logs</p>
                  </button>
                </div>
              </div>
            </div>

            {/* Side-by-Side Grid: Payment Reminders & Recent Payments */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6 sm:mt-8">
              {/* Payment Reminders Widget */}
              <div className="flex flex-col h-full min-w-0">
                <PaymentRemindersWidget
                  slug={company.slug}
                  companyName={company.name}
                  planTier={planTier}
                  isDark={isDark}
                  onSelectLead={(leadId) => openLead(leadId)}
                />
              </div>

              {/* Recent Payments */}
              <div className="flex flex-col h-full min-w-0">
                <div className={`rounded-2xl border ${cardBg} overflow-hidden font-sans flex flex-col h-full`}>
                  <div className={`flex items-center justify-between px-4 sm:px-5 py-3.5 border-b ${isDark ? 'border-white/10' : 'border-[#e7e2d8]'}`}>
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

                  <div className={`px-4 sm:px-5 py-3 border-t ${isDark ? 'border-white/10' : 'border-[#e7e2d8]'}`}>
                    <button
                      onClick={() => router.push(`/${company.slug}/dashboard/financials`)}
                      className={`text-xs sm:text-sm font-semibold inline-flex items-center gap-1 py-1 ${cardText}`}
                    >
                      View all payments <ArrowRight className="w-3.5 h-3.5" />
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
          statusOptions={company.status_options || []}
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
        allLeads={[]}
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