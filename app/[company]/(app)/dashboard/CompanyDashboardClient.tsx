'use client';

import { useState, useEffect, useCallback, useTransition, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Loader2, Plus, ArrowRight, Sun, Moon, Menu, Mail, X, CalendarDays, CreditCard } from 'lucide-react';
import { Toaster } from 'sonner';
import { can, type PlanTier } from '@/lib/permissions';
import { getPaymentStatusDisplay } from '@/lib/paymentStatus';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useTeamMembers } from '@/hooks/useTeamMembers';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import { DEFAULT_STATUSES } from '@/lib/formCategories';
import { useQuoteTemplates } from '@/hooks/useQuoteTemplates';

// --- Dynamic imports for heavy modals & widgets ---
const Sidebar = dynamic(() => import('@/components/dashboard/Sidebar'), { ssr: false });
const LeadModal = dynamic(() => import('@/components/dashboard/LeadModal'), { ssr: false });
const CreateLeadModal = dynamic(() => import('@/components/dashboard/CreateLeadModal'), { ssr: false });
const AiChatWidget = dynamic(() => import('@/components/dashboard/DashboardModals').then((m) => m.AiChatWidget), { ssr: false });
const LockedFeatureModal = dynamic(() => import('@/components/dashboard/DashboardModals').then((m) => m.LockedFeatureModal), { ssr: false });
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
type StatusOption = string | { value: string; label?: string; color?: string };

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const fmtMoney = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n || 0);

const fmtTime = (t: string | null) => {
  if (!t) return null;
  const [h, m] = t.split(':').map(Number);
  if (!Number.isFinite(h)) return null;
  return `${h % 12 || 12}:${String(m || 0).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`;
};

const formatCategoryLabel = (value?: string | null) =>
  (value || '').replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

const fmtShortDate = (d: string | null | undefined) => {
  if (!d) return null;
  const [year, month, day] = d.split('T')[0].split('-').map(Number);
  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

// One set of neutral tokens for each theme. Color is reserved for meaning:
// green = money received, red = past due.
function themeTokens(isDark: boolean) {
  return isDark
    ? {
        page: 'bg-[#0b0f17]',
        card: 'bg-[#0f1420] border border-white/10',
        text: 'text-white',
        sub: 'text-slate-400',
        faint: 'text-slate-500',
        divide: 'divide-white/10',
        border: 'border-white/10',
        hover: 'hover:bg-white/[0.04]',
        track: 'bg-white/[0.06]',
        bar: 'bg-slate-300',
        iconBtn: 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10',
        primary: 'bg-white text-slate-900 hover:bg-slate-100',
        chip: 'bg-white/[0.06] text-slate-200 border-white/10',
      }
    : {
        page: 'bg-slate-50',
        card: 'bg-white border border-slate-200',
        text: 'text-slate-900',
        sub: 'text-slate-500',
        faint: 'text-slate-400',
        divide: 'divide-slate-100',
        border: 'border-slate-200',
        hover: 'hover:bg-slate-50',
        track: 'bg-slate-100',
        bar: 'bg-slate-800',
        iconBtn: 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50',
        primary: 'bg-slate-900 text-white hover:bg-slate-800',
        chip: 'bg-white text-slate-700 border-slate-200',
      };
}
type Tokens = ReturnType<typeof themeTokens>;

function SectionHeader({ title, action, t }: { title: string; action?: React.ReactNode; t: Tokens }) {
  return (
    <div className="mb-2.5 flex items-baseline justify-between gap-3">
      <h2 className={`text-sm font-semibold ${t.text}`}>{title}</h2>
      {action}
    </div>
  );
}

function LinkButton({ children, onClick, t }: { children: React.ReactNode; onClick: () => void; t: Tokens }) {
  return (
    <button type="button" onClick={onClick} className={`inline-flex items-center gap-1 text-xs font-semibold transition hover:opacity-70 ${t.sub}`}>
      {children} <ArrowRight className="h-3.5 w-3.5" />
    </button>
  );
}

// ---------------------------------------------------------------------------
// Connect Stripe — only while Stripe isn't active. Dismissible per company.
// ---------------------------------------------------------------------------

function ConnectStripeCard({ companySlug, t, isConnected }: { companySlug: string; t: Tokens; isConnected: boolean }) {
  const router = useRouter();
  const dismissKey = `stripe-card-dismissed-${companySlug}`;
  const [dismissed, setDismissed] = useState(true); // hidden until checked, avoids a flash

  useEffect(() => {
    try {
      setDismissed(localStorage.getItem(dismissKey) === 'true');
    } catch {
      setDismissed(false);
    }
  }, [dismissKey]);

  if (isConnected || dismissed) return null;

  return (
    <div className={`mb-5 flex items-center gap-3 rounded-2xl px-4 py-3.5 ${t.card}`}>
      <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border ${t.border}`}>
        <CreditCard className={`h-4 w-4 ${t.sub}`} />
      </span>
      <div className="min-w-0 flex-1">
        <p className={`text-sm font-semibold ${t.text}`}>Connect Stripe to take card payments</p>
        <p className={`text-xs ${t.sub}`}>Customers pay deposits and invoices online, and jobs update the moment they do.</p>
      </div>
      <button
        type="button"
        onClick={() => router.push(`/${companySlug}/home?section=payments`)}
        className={`hidden shrink-0 rounded-xl px-3.5 py-2 text-xs font-semibold transition sm:inline-flex ${t.primary}`}
      >
        Connect
      </button>
      <button
        type="button"
        onClick={() => router.push(`/${companySlug}/home?section=payments`)}
        className={`shrink-0 rounded-lg p-2 sm:hidden ${t.sub}`}
        aria-label="Connect Stripe"
      >
        <ArrowRight className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() => {
          try {
            localStorage.setItem(dismissKey, 'true');
          } catch {}
          setDismissed(true);
        }}
        aria-label="Dismiss"
        className={`shrink-0 rounded-lg p-1.5 transition ${t.faint} ${t.hover}`}
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Pipeline — one row per stage in the company's order, one neutral bar color.
// Each row opens Leads filtered to that stage.
// ---------------------------------------------------------------------------

function Pipeline({
  statusOptions,
  counts,
  companySlug,
  t,
}: {
  statusOptions: StatusOption[];
  counts: Record<string, number>;
  companySlug: string;
  t: Tokens;
}) {
  const router = useRouter();

  const rows = statusOptions.map((opt) => {
    const value = typeof opt === 'string' ? opt : opt.value;
    const label = typeof opt === 'string' ? formatCategoryLabel(opt) : opt.label || formatCategoryLabel(opt.value);
    return { value, label, count: counts[value] || 0 };
  });
  const known = new Set(rows.map((r) => r.value));
  const otherCount = Object.entries(counts)
    .filter(([k]) => !known.has(k))
    .reduce((s, [, n]) => s + n, 0);
  if (otherCount > 0) rows.push({ value: '', label: 'Other', count: otherCount });

  const max = Math.max(1, ...rows.map((r) => r.count));
  const total = rows.reduce((s, r) => s + r.count, 0);

  return (
    <section>
      <SectionHeader
        title={`Pipeline · ${total} ${total === 1 ? 'lead' : 'leads'}`}
        action={
          <LinkButton onClick={() => router.push(`/${companySlug}/home?section=pipeline`)} t={t}>
            Edit stages
          </LinkButton>
        }
        t={t}
      />
      <div className={`rounded-2xl p-1.5 ${t.card}`}>
        {rows.map((r) => (
          <button
            key={r.value || 'other'}
            type="button"
            onClick={() => r.value && router.push(`/${companySlug}/leads?status=${encodeURIComponent(r.value)}`)}
            disabled={!r.value}
            className={`grid w-full grid-cols-[104px_1fr_32px] items-center gap-3 rounded-lg px-2.5 py-2 text-left transition sm:grid-cols-[140px_1fr_40px] ${
              r.value ? t.hover : 'cursor-default'
            }`}
          >
            <span className={`truncate text-sm ${r.count ? t.text : t.faint}`}>{r.label}</span>
            <span className={`h-1.5 overflow-hidden rounded-full ${t.track}`}>
              <span
                className={`block h-full rounded-full transition-all duration-500 ${t.bar}`}
                style={{ width: r.count ? `max(6px, ${(r.count / max) * 100}%)` : '0%' }}
              />
            </span>
            <span className={`text-right text-sm font-semibold tabular-nums ${r.count ? t.text : t.faint}`}>{r.count}</span>
          </button>
        ))}
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

export default function CompanyDashboardClient({ company }: { company: Company }) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  const { data: stats, isLoading: loading, error: statsError, refetch: fetchStats } = useDashboardStats(company.slug);
  const loadError = statsError ? 'Could not load the dashboard. Check your connection and try again.' : '';
  const [lockedDashboardModal, setLockedDashboardModal] = useState<string | null>(null);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<any>(null);
  const [selectedLeadTab, setSelectedLeadTab] = useState<TopTab>('overview');
  const [selectedLeadPayments, setSelectedLeadPayments] = useState<any[]>([]);
  const [selectedLeadActivity, setSelectedLeadActivity] = useState<any[]>([]);

  // AiChatWidget data: page 1 of real leads, same endpoint LeadsClient uses.
  const [dashboardLeads, setDashboardLeads] = useState<any[]>([]);
  useEffect(() => {
    let cancelled = false;
    fetch(`/api/company/${company.slug}/leads?page=1`, { cache: 'no-store' })
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) setDashboardLeads((data.leads || []).filter((l: any) => !l.deleted));
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [company.slug]);

  // Theme: same storage key + event CompanyShell listens to.
  const [isDark, setIsDark] = useState<boolean>(true);
  const skipFirstWrite = useRef(true);
  useEffect(() => {
    try {
      setIsDark(localStorage.getItem('dashboard-theme') !== 'light');
    } catch {}
  }, []);
  useEffect(() => {
    if (skipFirstWrite.current) {
      skipFirstWrite.current = false;
      return;
    }
    try {
      localStorage.setItem('dashboard-theme', isDark ? 'dark' : 'light');
    } catch {}
    window.dispatchEvent(new Event('theme-changed'));
  }, [isDark]);

  const t = themeTokens(isDark);
  const planTier = (company.plan_tier || 'free') as PlanTier;

  const { data: currentUser } = useCurrentUser();
  const { data: teamMembers } = useTeamMembers(company.slug);
  // Loads quote templates in the background so the Quote tab has them instantly.
  useQuoteTemplates(company.slug, { enabled: can(planTier, 'quote_templates') });

  const handleLogout = useCallback(async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    startTransition(() => router.push('/login'));
  }, [router]);

  const userMeta = useCallback(
    () => ({
      user_name: currentUser?.name || currentUser?.email || 'Unknown User',
      user_email: currentUser?.email || '',
    }),
    [currentUser]
  );

  const updateLeadStatus = useCallback(
    async (id: number, status: string, oldStatus: string, sendReview = true) => {
      try {
        const res = await fetch('/api/leads/update', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id, status, action: 'update_status', old_status: oldStatus, send_review_request: sendReview, ...userMeta() }),
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

  // Deep link: /{company}/dashboard?lead=123 opens that job (used by the Outbox "Open job" button).
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const leadParam = parseInt(params.get('lead') || '', 10);
    if (Number.isFinite(leadParam) && leadParam > 0) {
      openLead(leadParam);
      window.history.replaceState({}, '', `/${company.slug}/dashboard`);
    }
  }, [company.slug, openLead]);

  const refreshModalLead = useCallback(async () => {
    if (!selectedLead) return;
    await openLead(selectedLead.id, selectedLeadTab);
    fetchStats();
  }, [selectedLead, selectedLeadTab, openLead, fetchStats]);

  const { greeting, todayLabel } = useMemo(() => {
    const h = new Date().getHours();
    return {
      greeting: h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening',
      todayLabel: new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' }),
    };
  }, []);

  const todaysScheduleTotal = useMemo(
    () => (stats?.todays_schedule || []).reduce((s, j) => s + (parseFloat(String(j.quote_total || '0')) || 0), 0),
    [stats?.todays_schedule]
  );

  const handleOpenCreateModal = useCallback(() => setIsCreateModalOpen(true), []);
  const handleCloseCreateModal = useCallback(() => setIsCreateModalOpen(false), []);
  const handleCloseLeadModal = useCallback(() => setSelectedLead(null), []);
  const handleCloseLockedModal = useCallback(() => setLockedDashboardModal(null), []);
  const handleCloseSidebar = useCallback(() => setSidebarOpen(false), []);
  const handleOpenSidebar = useCallback(() => setSidebarOpen(true), []);
  const handleToggleTheme = useCallback(() => setIsDark((v) => !v), []);

  const statusOptions: StatusOption[] = company.status_options?.length ? company.status_options : DEFAULT_STATUSES;

  if (loading) {
    return (
      <div className={`flex min-h-screen items-center justify-center ${t.page}`} role="status" aria-label="Loading dashboard">
        <Loader2 className={`h-7 w-7 animate-spin ${t.sub}`} />
      </div>
    );
  }

  return (
    <div className={`relative min-h-screen transition-colors ${t.page}`}>
      <Toaster position="top-right" richColors />

      {/* Sidebar overlay (mobile/tablet) */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-[10000]">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={handleCloseSidebar} />
          <aside className="absolute bottom-0 left-0 top-0 z-[10001] w-72 max-w-[85vw]" aria-label="Navigation sidebar">
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

      <main className="relative z-10 mx-auto max-w-6xl px-4 py-5 font-sans sm:px-6 sm:py-8 lg:px-8">
        {/* ── Header ── */}
        <header className="mb-6 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className={`text-xs font-medium ${t.sub}`}>{todayLabel}</p>
            <h1 className={`mt-0.5 truncate text-2xl font-semibold tracking-tight sm:text-3xl ${t.text}`}>
              {greeting}, {currentUser?.name?.split(' ')[0] || 'there'}
            </h1>
            <p className={`mt-1 flex items-center gap-1.5 text-xs ${t.sub}`}>
              {company.logo_url ? (
                <img src={company.logo_url} alt="" className="h-4 w-4 rounded-full bg-white object-contain" />
              ) : null}
              <span className="truncate">{company.name}</span>
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-1.5">
            <button
              type="button"
              onClick={handleOpenCreateModal}
              className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition ${t.primary}`}
              aria-label="Add lead"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Add lead</span>
            </button>
            <button
              type="button"
              onClick={() => router.push(`/${company.slug}/outbox`)}
              className={`rounded-xl border p-2 transition ${t.iconBtn}`}
              aria-label="Email outbox"
              title="Email outbox"
            >
              <Mail className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={handleToggleTheme}
              className={`rounded-xl border p-2 transition ${t.iconBtn}`}
              aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              title={isDark ? 'Light mode' : 'Dark mode'}
            >
              {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            <button
              type="button"
              onClick={handleOpenSidebar}
              className={`rounded-xl border p-2 transition lg:hidden ${t.iconBtn}`}
              aria-label="Open menu"
            >
              <Menu className="h-4 w-4" />
            </button>
          </div>
        </header>

        <ConnectStripeCard
          companySlug={company.slug}
          t={t}
          isConnected={!!company.stripe_connect_onboarded && company.stripe_payment_status === 'active'}
        />

        {loadError && (
          <div className="mb-5 flex items-center justify-between gap-3 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-500">
            <span>{loadError}</span>
            <button type="button" onClick={() => fetchStats()} className="shrink-0 rounded-lg bg-red-500 px-3 py-1.5 text-xs font-semibold text-white">
              Retry
            </button>
          </div>
        )}

        {stats && (
          <>
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_340px]">
              {/* ── Left: today + pipeline ── */}
              <div className="min-w-0 space-y-6">
                <section>
                  <SectionHeader
                    title="Today"
                    action={
                      <LinkButton onClick={() => router.push(`/${company.slug}/dashboard/calendar`)} t={t}>
                        Calendar
                      </LinkButton>
                    }
                    t={t}
                  />
                  <div className={`overflow-hidden rounded-2xl ${t.card}`}>
                    {stats.todays_schedule.length === 0 ? (
                      <div className="flex items-center gap-3 px-4 py-6">
                        <CalendarDays className={`h-5 w-5 ${t.faint}`} />
                        <p className={`text-sm ${t.sub}`}>Nothing scheduled today.</p>
                      </div>
                    ) : (
                      <>
                        <div className={`flex items-baseline justify-between border-b px-4 py-3 ${t.border}`}>
                          <p className={`text-sm ${t.sub}`}>
                            {stats.todays_schedule.length} {stats.todays_schedule.length === 1 ? 'job' : 'jobs'}
                          </p>
                          {todaysScheduleTotal > 0 && (
                            <p className={`text-sm font-semibold tabular-nums ${t.text}`}>{fmtMoney(todaysScheduleTotal)}</p>
                          )}
                        </div>
                        <div className={`divide-y ${t.divide}`}>
                          {stats.todays_schedule.map((job) => (
                            <button
                              key={job.project_id}
                              type="button"
                              onClick={() => openLead(job.lead_id)}
                              className={`flex w-full items-center gap-4 px-4 py-3 text-left transition ${t.hover}`}
                            >
                              <span className={`w-16 shrink-0 text-xs font-semibold tabular-nums ${t.sub}`}>
                                {fmtTime(job.scheduled_time) || 'Any time'}
                              </span>
                              <span className="min-w-0 flex-1">
                                <span className={`block truncate text-sm font-semibold ${t.text}`}>{job.customer_name}</span>
                                <span className={`block truncate text-xs ${t.sub}`}>{formatCategoryLabel(job.category) || 'General'}</span>
                              </span>
                              <ArrowRight className={`h-4 w-4 shrink-0 ${t.faint}`} />
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </section>

                <Pipeline statusOptions={statusOptions} counts={stats.status_counts || {}} companySlug={company.slug} t={t} />
              </div>

              {/* ── Right: money ── */}
              <div className="min-w-0 space-y-6">
                <section>
                  <SectionHeader
                    title="Money"
                    action={
                      <LinkButton onClick={() => router.push(`/${company.slug}/dashboard/financials`)} t={t}>
                        Financials
                      </LinkButton>
                    }
                    t={t}
                  />
                  <div className={`rounded-2xl ${t.card}`}>
                    <div className="px-4 pb-3 pt-4">
                      <p className={`text-xs ${t.sub}`}>Collected this month</p>
                      <p className={`mt-0.5 text-3xl font-semibold tabular-nums ${t.text}`}>{fmtMoney(stats.revenue_this_month)}</p>
                    </div>
                    <dl className={`divide-y border-t text-sm ${t.divide} ${t.border}`}>
                      <div className="flex justify-between px-4 py-2.5">
                        <dt className={t.sub}>Awaiting payment</dt>
                        <dd className={`font-semibold tabular-nums ${t.text}`}>{stats.invoices.awaiting_payment}</dd>
                      </div>
                      <div className="flex justify-between px-4 py-2.5">
                        <dt className={t.sub}>Past due</dt>
                        <dd className={`font-semibold tabular-nums ${stats.invoices.past_due > 0 ? 'text-red-500' : t.text}`}>
                          {stats.invoices.past_due}
                        </dd>
                      </div>
                      <div className="flex justify-between px-4 py-2.5">
                        <dt className={t.sub}>Ready to invoice</dt>
                        <dd className={`font-semibold tabular-nums ${t.text}`}>
                          {stats.ready_to_invoice.count}
                          {stats.ready_to_invoice.count > 0 && (
                            <span className={`ml-1 font-normal ${t.sub}`}>· {fmtMoney(stats.ready_to_invoice.value)}</span>
                          )}
                        </dd>
                      </div>
                      <div className="flex justify-between px-4 py-2.5">
                        <dt className={t.sub}>Active jobs</dt>
                        <dd className={`font-semibold tabular-nums ${t.text}`}>
                          {stats.jobs.active}
                          {stats.jobs.active_value > 0 && <span className={`ml-1 font-normal ${t.sub}`}>· {fmtMoney(stats.jobs.active_value)}</span>}
                        </dd>
                      </div>
                    </dl>
                  </div>
                </section>

                <section>
                  <SectionHeader title="Recent payments" t={t} />
                  <div className={`overflow-hidden rounded-2xl ${t.card}`}>
                    {stats.recent_payments.length === 0 ? (
                      <p className={`px-4 py-6 text-sm ${t.sub}`}>No payments yet.</p>
                    ) : (
                      <div className={`divide-y ${t.divide}`}>
                        {stats.recent_payments.slice(0, 6).map((p) => {
                          const statusInfo =
                            p.payment_status && p.payment_status !== 'paid' ? getPaymentStatusDisplay(p.payment_status) : null;
                          const amount = parseFloat(String(p.amount)) || 0;
                          const isRefund = amount < 0 || p.payment_status === 'refunded' || p.payment_status === 'partially_refunded';
                          return (
                            <button
                              key={p.id}
                              type="button"
                              onClick={() => openLead(p.lead_id)}
                              className={`flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left transition ${t.hover}`}
                            >
                              <span className="min-w-0">
                                <span className={`block truncate text-sm font-medium ${t.text}`}>{p.customer_name}</span>
                                <span className={`block text-xs ${t.sub}`}>
                                  {p.kind === 'deposit' ? 'Deposit' : p.kind === 'balance' ? 'Balance' : p.kind === 'refund' ? 'Refund' : 'Payment'}
                                  {' · '}
                                  {fmtShortDate(p.paid_on)}
                                  {statusInfo ? ` · ${statusInfo.label}` : ''}
                                </span>
                              </span>
                              <span
                                className={`shrink-0 text-sm font-semibold tabular-nums ${
                                  isRefund ? t.sub : isDark ? 'text-emerald-400' : 'text-emerald-600'
                                }`}
                              >
                                {fmtMoney(amount)}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </section>
              </div>
            </div>

            {/* ── Payment reminders ── */}
            <div className="mt-6">
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

      <LockedFeatureModal featureKey={lockedDashboardModal} companySlug={company.slug} onClose={handleCloseLockedModal} />
    </div>
  );
}