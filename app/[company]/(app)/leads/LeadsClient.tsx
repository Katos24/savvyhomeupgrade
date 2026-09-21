'use client';

import {
  useState, useEffect, useRef, useMemo, useCallback, useTransition,
} from 'react';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import LeadModal from '@/components/dashboard/LeadModal';
import { Toaster } from 'sonner';
import TrialBanner from '@/components/TrialBanner';
import { type PlanTier } from '@/lib/permissions';
import CreateLeadModal from '@/components/dashboard/CreateLeadModal';
import DashboardTour from '@/components/dashboard/DashboardTour';
import DashboardFilters from '@/components/dashboard/DashboardFilters';
import { AiChatWidget, LockedFeatureModal } from '@/components/dashboard/DashboardModals';
import FreePlanBanner from '@/components/dashboard/FreePlanBanner';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import DashboardExportModal from '@/components/dashboard/DashboardExportModal';
import DashboardLeadsSection from '@/components/dashboard/DashboardLeadsSection';
import { DEFAULT_STATUSES } from '@/lib/formCategories';
import PaymentToastPoller from '@/components/dashboard/PaymentToastPoller';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useTeamMembers } from '@/hooks/useTeamMembers';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type StatusOption = { value: string; label: string; color: string; emoji?: string };

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
  status_options?: StatusOption[];
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
};

type ViewMode = 'cards' | 'table';
type TimeFilter = 'today' | 'week' | 'month' | 'all' | 'scheduled_today';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getDateBoundaries() {
  const now = new Date();
  const todayStart = new Date(now); todayStart.setHours(0, 0, 0, 0);
  const yesterdayStart = new Date(todayStart.getTime() - 86_400_000);
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay());
  weekStart.setHours(0, 0, 0, 0);
  if (weekStart >= yesterdayStart) weekStart.setTime(yesterdayStart.getTime());
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  return { now, todayStart, yesterdayStart, weekStart, monthStart };
}

const isColorDark = (hex: string) => {
  const cleanHex = hex.replace('#', '');
  if (cleanHex.length !== 6) return true;
  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance < 0.5;
};

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export default function LeadsClient({ company }: { company: Company }) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [lockedDashboardModal, setLockedDashboardModal] = useState<string | null>(null);

  // Lead data
  const [allLeads, setAllLeads] = useState<any[]>([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [serverStatusCounts, setServerStatusCounts] = useState<Record<string, number>>({});
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [, setGlobalStats] = useState<any>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [newLeadCount, setNewLeadCount] = useState(0);

  // UI state
  const [selectedLead, setSelectedLead] = useState<any>(null);
  const [selectedLeadPayments, setSelectedLeadPayments] = useState<any[]>([]);
  const [selectedLeadActivity, setSelectedLeadActivity] = useState<any[]>([]);
  const [currentView, setCurrentView] = useState<ViewMode>(() => {
    if (typeof window === 'undefined') return 'cards';
    return (localStorage.getItem('leads-view') as ViewMode) || 'cards';
  });
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
   // FIXED: reading localStorage inside the useState initializer ran
  // differently on server vs. client — window is undefined server-side
  // (always defaulting true/dark), but the client read the REAL stored
  // value immediately. If that real value was 'light', the very first
  // client render disagreed with what the server already sent, which is
  // a hydration mismatch — and React recovers from a mismatch by fully
  // discarding and re-rendering the affected tree, which is very
  // plausibly why fetchLeads/fetchCurrentUser/fetchTeamMembers appeared
  // to fire twice: not a real double-fetch bug, but this component
  // being forced through a full remount to recover. Same fix already
  // applied correctly in CompanyShell.tsx earlier this session — always
  // match the server's default first, correct from localStorage after
  // mount.
  const [isDark, setIsDark] = useState<boolean>(true);
  useEffect(() => {
    setIsDark(localStorage.getItem('dashboard-theme') !== 'light');
  }, []);

  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>(() => {
    if (typeof window === 'undefined') return 'all';
    return new URLSearchParams(window.location.search).get('status') || 'all';
  });
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterAssignee, setFilterAssignee] = useState('all');
  
  // Explicitly typed to string to support "awaiting_deposit" & custom filters
  const [filterPayment, setFilterPayment] = useState<string>(() => {
    if (typeof window === 'undefined') return 'all';
    return new URLSearchParams(window.location.search).get('payment') || 'all';
  });
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [showExportModal, setShowExportModal] = useState(false);

   // User / team — now sourced from the shared React Query cache instead
  // of a local fetch, so this page shares data with CompanyDashboardClient
  // rather than each independently re-fetching the same thing.
  const { data: currentUser } = useCurrentUser();
  const { data: teamMembers } = useTeamMembers(company.slug);

  // Tour
  const [tourActive, setTourActive] = useState(false);

  // Persist preferences
  useEffect(() => { localStorage.setItem('leads-view', currentView); }, [currentView]);
  useEffect(() => { localStorage.setItem('dashboard-theme', isDark ? 'dark' : 'light'); }, [isDark]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('tour') === '1') {
      setTourActive(true);
      window.history.replaceState({}, '', `/${company.slug}/leads`);
    }
  }, [company.slug]);
 
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('status') || params.get('payment')) {
      window.history.replaceState({}, '', `/${company.slug}/leads`);
    }
  }, [company.slug]);

  const planTier = (company.plan_tier || 'free') as PlanTier;

  const statusOptions: StatusOption[] = company.status_options?.length
    ? company.status_options
    : DEFAULT_STATUSES;

  // -------------------------------------------------------------------------
  // Data fetching
  // -------------------------------------------------------------------------

  const fetchLeads = useCallback(async (page = 1, silent = false, overrides: Record<string, string> = {}) => {
    try {
      if (page === 1 && isInitialLoad) {
        // initial load handled by loader UI
      } else if (!silent) {
        setIsRefreshing(true);
      }
      const params = new URLSearchParams({ page: String(page) });
      const search   = overrides.search    !== undefined ? overrides.search    : searchQuery;
      const status   = overrides.status    !== undefined ? overrides.status    : filterStatus;
      const category = overrides.category  !== undefined ? overrides.category  : filterCategory;
      const assignee = overrides.assignee  !== undefined ? overrides.assignee  : filterAssignee;
      const payment  = overrides.payment   !== undefined ? overrides.payment   : filterPayment;
      const tFilter  = overrides.timeFilter!== undefined ? overrides.timeFilter: timeFilter;
      const sDate    = overrides.startDate !== undefined ? overrides.startDate : startDate;
      const eDate    = overrides.endDate   !== undefined ? overrides.endDate   : endDate;
      const sKey     = overrides.sortKey   !== undefined ? overrides.sortKey   : sortKey;
      const sDir     = overrides.sortDir   !== undefined ? overrides.sortDir   : sortDir;

      if (search)                        params.set('search',     search);
      if (status   && status   !== 'all') params.set('status',     status);
      if (category && category !== 'all') params.set('category',   category);
      if (assignee && assignee !== 'all') params.set('assignee',   assignee);
      if (payment  && payment  !== 'all') params.set('payment',    payment);
      if (tFilter  && tFilter  !== 'all') params.set('timeFilter', tFilter);
      if (sDate) params.set('startDate', sDate);
      if (eDate) params.set('endDate',   eDate);
      if (sKey)  { params.set('sort', sKey); params.set('sortDir', sDir); }

      const res = await fetch(`/api/company/${company.slug}/leads?${params}`, {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate', Pragma: 'no-cache' },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const fresh = (data.leads || []).filter((l: any) => !l.deleted);
      setAllLeads(prev => (page === 1 ? fresh : [...prev, ...fresh]));
      setPagination(data.pagination || { page: 1, pages: 1, total: 0 });
      if (data.statusCounts) setServerStatusCounts(data.statusCounts);
      if (data.globalStats) setGlobalStats(data.globalStats);
      setRefreshKey(k => k + 1);
      setLoadError('');
   } catch (e) {
    console.error('Failed to fetch leads:', e);
    setLoadError('Could not load leads. Check your connection and try again.');
  } finally { // Fixed typo here
    setIsInitialLoad(false);
    setIsRefreshing(false);
  }
  }, [company.slug, isInitialLoad, searchQuery, filterStatus, filterCategory, filterAssignee, filterPayment, timeFilter, startDate, endDate, sortKey, sortDir]);

    useEffect(() => {
    fetchLeads(1);
  }, []);

  useEffect(() => {
    if (isInitialLoad) return;
    fetchLeads(1, true);
  }, [filterStatus, filterCategory, filterAssignee, filterPayment, timeFilter, startDate, endDate, sortKey, sortDir, fetchLeads]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const leadId = params.get('lead');
    if (!leadId) return;
    const lead = allLeads.find(l => l.id === parseInt(leadId));
    if (lead) setSelectedLead(lead);
    window.history.replaceState({}, '', window.location.pathname);
    fetch(`/api/leads/${leadId}`, { cache: 'no-store' })
      .then(r => r.json())
      .then(data => {
        if (data.success && data.lead) {
          setSelectedLead(data.lead);
          setSelectedLeadPayments(data.payments || []);
          setSelectedLeadActivity(data.activity || []);
        }
      })
      .catch(() => {});
  }, [allLeads]);

  const lastPollCount = useRef<number | null>(null);

  useEffect(() => {
    if (isInitialLoad) return;
    const interval = setInterval(async () => {
      if (document.hidden) return;
      try {
        const res = await fetch(`/api/company/${company.slug}/leads/count`, { cache: 'no-store' });
        if (!res.ok) return;
        const data = await res.json();
        if (!data.success) return;

        if (lastPollCount.current === null) {
          lastPollCount.current = data.count;
          return;
        }

        if (data.count > lastPollCount.current) {
          setNewLeadCount(data.count - lastPollCount.current);
        }
      } catch {}
    }, 30000);

    return () => clearInterval(interval);
  }, [isInitialLoad, company.slug]);

  // -------------------------------------------------------------------------
  // Actions
  // -------------------------------------------------------------------------

  const userMeta = () => ({
    user_name: currentUser?.name || currentUser?.email || 'Unknown User',
    user_email: currentUser?.email || '',
  });

  const updateLeadStatus = useCallback(async (id: number, status: string, oldStatus: string, sendReview = true) => {
    try {
      const res = await fetch('/api/leads/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id, status, action: 'update_status', old_status: oldStatus,
          send_review_request: sendReview, ...userMeta(),
        }),
      });
      const result = await res.json();
      if (res.ok && result.success) {
        setAllLeads(prev => prev.map(l => l.id === id ? { ...l, status } : l));
        setRefreshKey(k => k + 1);
        if (selectedLead?.id === id) setSelectedLead((prev: any) => ({ ...prev, status }));
        return true;
      }
      return false;
    } catch (e) { console.error('updateLeadStatus:', e); return false; }
  }, [selectedLead, currentUser]);

  const addNote = useCallback(async (id: number, noteText: string) => {
    try {
      const res = await fetch('/api/leads/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, notes: noteText, action: 'add_note', ...userMeta() }),
      });
      const result = await res.json();
      return res.ok && result.success;
    } catch (e) { console.error('addNote:', e); return false; }
  }, [currentUser]);

  const deleteLead = useCallback(async (id: number) => {
    try {
      const res = await fetch('/api/leads/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...userMeta() }),
      });
      const result = await res.json();
      if (res.ok && result.success) {
        setAllLeads(prev => prev.filter(l => l.id !== id));
        setRefreshKey(k => k + 1);
        return true;
      }
      return false;
    } catch (e) { console.error('deleteLead:', e); return false; }
  }, [currentUser]);

  const handleBulkUpdate = useCallback(async (leadIds: number[], updates: any) => {
    const res = await fetch('/api/leads/bulk-update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ leadIds, updates, ...userMeta() }),
    });
    const result = await res.json();
    if (res.ok && result.success) await fetchLeads(1, true);
    else throw new Error(result.error || 'Bulk update failed');
  }, [fetchLeads, currentUser]);

  const handleBulkDelete = useCallback(async (leadIds: number[]) => {
    const res = await fetch('/api/leads/bulk-delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ leadIds, ...userMeta() }),
    });
    const result = await res.json();
    if (res.ok && result.success) {
      setAllLeads(prev => prev.filter(l => !leadIds.includes(l.id)));
      setRefreshKey(k => k + 1);
    } else throw new Error(result.error || 'Bulk delete failed');
  }, [currentUser]);

  const refreshModalLead = useCallback(async () => {
    await fetchLeads(1, true);
    if (!selectedLead) return;
    try {
      const res = await fetch(`/api/leads/${selectedLead.id}`, {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache' },
      });
      const data = await res.json();
      if (data.success && data.lead) {
        setSelectedLead(data.lead);
        setSelectedLeadPayments(data.payments || []);
        setSelectedLeadActivity(data.activity || []);
      }
    } catch (e) { console.error('refreshModalLead:', e); }
  }, [fetchLeads, selectedLead]);

  const openLead = useCallback(async (lead: any) => {
    setSelectedLead(lead);
    setSelectedLeadPayments([]);
    setSelectedLeadActivity([]);
    try {
      const res = await fetch(`/api/leads/${lead.id}`, { cache: 'no-store' });
      const data = await res.json();
      if (data.success && data.lead) {
        setSelectedLead(data.lead);
        setSelectedLeadPayments(data.payments || []);
        setSelectedLeadActivity(data.activity || []);
      }
    } catch (e) {
      console.error('openLead:', e);
    }
  }, []);

  const clearFilters = useCallback(() => {
    setSearchQuery('');
    setFilterCategory('all');
    setFilterStatus('all');
    setFilterAssignee('all');
    setFilterPayment('all');
    setTimeFilter('all');
    setStartDate('');
    setEndDate('');
    fetchLeads(1, true, {
      search: '', status: 'all', category: 'all',
      assignee: 'all', payment: 'all', timeFilter: 'all',
      startDate: '', endDate: '',
    });
  }, [fetchLeads]);

  const handleSortChange = useCallback((key: string) => {
    if (sortKey === key) {
      setSortDir(prevDir => (prevDir === 'desc' ? 'asc' : 'desc'));
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
  }, [sortKey]);

  // Stable event handlers
  const handleDismissNewLeads = useCallback(() => {
    setNewLeadCount(0);
    lastPollCount.current = null;
    fetchLeads(1);
  }, [fetchLeads]);

  const handleToastSelectLead = useCallback((leadId: number) => {
    const lead = allLeads.find((l) => l.id === leadId);
    if (lead) openLead(lead);
  }, [allLeads, openLead]);

  const handleCloseLeadModal = useCallback(() => setSelectedLead(null), []);
  const handleCloseCreateModal = useCallback(() => setIsCreateModalOpen(false), []);
  const handleOpenCreateModal = useCallback(() => setIsCreateModalOpen(true), []);
  const handleCloseExportModal = useCallback(() => setShowExportModal(false), []);
  const handleOpenExportModal = useCallback(() => setShowExportModal(true), []);
  const handleCloseLockedModal = useCallback(() => setLockedDashboardModal(null), []);
  const handleStartTour = useCallback(() => setTourActive(true), []);
  const handleCompleteTour = useCallback(() => setTourActive(false), []);
  const handleRefreshLeads = useCallback(() => fetchLeads(1, false), [fetchLeads]);
  const handleLoadMoreLeads = useCallback(() => fetchLeads(pagination.page + 1, false), [fetchLeads, pagination.page]);

  // -------------------------------------------------------------------------
  // Derived data
  // -------------------------------------------------------------------------

  const filteredLeads = useMemo(() => allLeads, [allLeads]);

  const groups = useMemo(() => {
    const { todayStart, yesterdayStart, weekStart } = getDateBoundaries();
    return [
      { title: 'Today', leads: filteredLeads.filter(l => new Date(l.created_at) >= todayStart) },
      { title: 'Yesterday', leads: filteredLeads.filter(l => { const d = new Date(l.created_at); return d >= yesterdayStart && d < todayStart; }) },
      { title: 'Earlier This Week', leads: filteredLeads.filter(l => { const d = new Date(l.created_at); return d >= weekStart && d < yesterdayStart; }) },
      { title: 'Older', leads: filteredLeads.filter(l => new Date(l.created_at) < weekStart) },
    ];
  }, [filteredLeads]);

  const categories = useMemo(() => {
    if (company.form_categories?.length) {
      return company.form_categories.map((c: any) => c.value || c).filter(Boolean);
    }
    const catSet = new Set<string>();
    for (let i = 0; i < allLeads.length; i++) {
      if (allLeads[i].category) catSet.add(allLeads[i].category);
    }
    return Array.from(catSet);
  }, [company.form_categories, allLeads]);

  const hasActiveFilters = filterStatus !== 'all' || filterCategory !== 'all' || filterAssignee !== 'all'
    || filterPayment !== 'all' || timeFilter !== 'all' || !!startDate || !!endDate || !!searchQuery;

  const { brandColor1, brandColor2, isBrand1Dark, isBrand2Dark, accentColor } = useMemo(() => {
    const c1 = company.email_brand_color_1 || '#2563eb';
    const c2 = company.email_brand_color_2 || '#4f46e5';
    return {
      brandColor1: c1,
      brandColor2: c2,
      isBrand1Dark: isColorDark(c1),
      isBrand2Dark: isColorDark(c2),
      accentColor: c1,
    };
  }, [company.email_brand_color_1, company.email_brand_color_2]);

  // -------------------------------------------------------------------------
  // Render Loader
  // -------------------------------------------------------------------------

  if (isInitialLoad) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center relative overflow-hidden transition-colors ${
          isDark ? 'bg-[#0b0f17]' : 'bg-[#faf9f5]'
        }`}
        role="status"
        aria-label="Loading leads"
      >
        <div
          className="absolute -top-24 -left-24 w-96 h-96 rounded-full blur-3xl opacity-35 animate-pulse"
          style={{ background: brandColor1 }}
          aria-hidden="true"
        />
        <div
          className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full blur-3xl opacity-25 animate-pulse"
          style={{ background: brandColor2, animationDelay: '1s' }}
          aria-hidden="true"
        />

        <div
          className={`relative z-10 flex flex-col items-center p-8 sm:p-10 rounded-3xl border backdrop-blur-xl transition-all shadow-2xl ${
            isDark
              ? 'bg-slate-900/70 border-slate-800/80 shadow-black/50'
              : 'bg-white/80 border-slate-200/80 shadow-slate-200/60'
          }`}
        >
          <div className="relative flex items-center justify-center mb-6">
            <div
              className="absolute w-20 h-20 rounded-full blur-xl opacity-40 animate-pulse"
              style={{ background: `radial-gradient(circle, ${brandColor1}, ${brandColor2})` }}
            />
            <div className="absolute inset-0 -m-3.5 flex items-center justify-center">
              <Loader2
                className="w-20 h-20 animate-spin opacity-85"
                style={{ color: brandColor1 }}
                aria-hidden
              />
            </div>

            <div
              className={`relative z-10 w-14 h-14 rounded-2xl p-2 flex items-center justify-center overflow-hidden border shadow-inner ${
                isDark ? 'bg-slate-900/90 border-slate-700/60' : 'bg-white border-slate-200'
              }`}
            >
              {company.logo_url ? (
                <img
                  src={company.logo_url}
                  alt={company.name}
                  className="w-full h-full object-contain rounded-xl"
                />
              ) : (
                <div
                  className="w-full h-full rounded-xl flex items-center justify-center font-bold text-xl uppercase tracking-wider shadow-sm"
                  style={{
                    background: `linear-gradient(135deg, ${brandColor1}, ${brandColor2})`,
                    color: isBrand1Dark && isBrand2Dark ? '#ffffff' : '#0f172a',
                  }}
                >
                  {company.name?.charAt(0) || 'C'}
                </div>
              )}
            </div>
          </div>

          <p className={`text-base font-semibold tracking-wide ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
            Loading leads
          </p>

          <div
            className="mt-2.5 px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase shadow-xs transition-colors"
            style={{
              backgroundColor: brandColor1,
              color: isBrand1Dark ? '#ffffff' : '#0f172a',
            }}
          >
            {company.name}
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // Render Main Layout
  // -------------------------------------------------------------------------

  return (
    <div className={`min-h-screen relative selection:bg-blue-500/30 transition-colors ${
      isDark ? 'bg-[#0b0f17]' : 'bg-[#faf9f5]'
    }`}>
      <div
        className="pointer-events-none fixed inset-x-0 top-0 h-[480px] z-0"
        style={{
          background: `radial-gradient(ellipse at top, ${accentColor}${isDark ? '1f' : '0d'}, transparent 70%)`,
        }}
        aria-hidden="true"
      />
      <Toaster position="top-right" richColors />

      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[9999] focus:px-4 focus:py-2 focus:bg-blue-500 focus:text-white focus:rounded-lg focus:font-bold">
        Skip to main content
      </a>

      <div className="relative z-10">
        <TrialBanner
          subscriptionStatus={company.subscription_status || 'inactive'}
          trialEndsAt={company.trial_ends_at || null}
          companySlug={company.slug}
          cancelAtPeriodEnd={company.cancel_at_period_end}
          subscriptionCancelAt={company.subscription_cancel_at}
          planTier={company.plan_tier || 'free'}
        />
   
        <PaymentToastPoller
          slug={company.slug}
          onSelectLead={handleToastSelectLead}
        />
      </div>

      <main id="main-content" className="max-w-7xl mx-auto px-4 sm:px-10 py-6 sm:py-12 relative z-10 font-sans">
        <DashboardHeader
          company={company}
          isDark={isDark}
          isRefreshing={isRefreshing}
          planTier={planTier}
          onCreateLead={handleOpenCreateModal}
          onLockedFeature={setLockedDashboardModal}
          onRefresh={handleRefreshLeads}
          accentColor={accentColor}
        />

        <div className="mb-4 sm:mb-6">
          <FreePlanBanner
            company={company}
            isDark={isDark}
            onStartTour={handleStartTour}
            onCreateLead={handleOpenCreateModal}
            leadCount={allLeads.length}
            allLeads={allLeads}
          />
        </div>

        {loadError && (
          <div className="mb-8 p-4 sm:p-5 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-xs sm:text-sm font-bold flex items-center justify-between animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
              <span>{loadError}</span>
            </div>
            <button onClick={() => fetchLeads(1)} className="uppercase tracking-widest text-[10px] bg-red-500 text-white px-3 py-2 rounded-lg hover:bg-red-600 transition-colors">Retry</button>
          </div>
        )}

        <div className="mb-8 sm:mb-10">
          <DashboardFilters
            searchQuery={searchQuery} filterStatus={filterStatus} timeFilter={timeFilter}
            filterCategory={filterCategory} filterAssignee={filterAssignee}
            filterPayment={filterPayment} startDate={startDate} endDate={endDate}
            currentView={currentView} isDark={isDark} planTier={planTier}
            isSearching={isSearching} hasActiveFilters={hasActiveFilters}
            serverStatusCounts={serverStatusCounts}
            statusOptions={statusOptions} teamMembers={teamMembers} categories={categories}
            setSearchQuery={setSearchQuery} setFilterStatus={setFilterStatus}
            setTimeFilter={setTimeFilter} setFilterCategory={setFilterCategory}
            setFilterAssignee={setFilterAssignee} setFilterPayment={setFilterPayment}
            setStartDate={setStartDate} setEndDate={setEndDate}
            setCurrentView={setCurrentView} setIsDark={setIsDark} setIsSearching={setIsSearching}
            fetchLeads={fetchLeads} clearFilters={clearFilters}
            onLockedFeature={setLockedDashboardModal}
          />
        </div>

        <DashboardLeadsSection
          filteredLeads={filteredLeads}
          allLeads={allLeads}
          groups={groups}
          currentView={currentView}
          isDark={isDark}
          planTier={planTier}
          statusOptions={statusOptions}
          teamMembers={teamMembers || []}
                    company={company}
          hasActiveFilters={hasActiveFilters}
          clearFilters={clearFilters}
          onSelectLead={openLead}
          newLeadCount={newLeadCount}
          onDismissNewLeads={handleDismissNewLeads}
          refreshKey={refreshKey}
          onBulkUpdate={handleBulkUpdate}
          onBulkDelete={handleBulkDelete}
          onShowExportModal={handleOpenExportModal}
          onLockedFeature={setLockedDashboardModal}
          pagination={pagination}
          onLoadMore={handleLoadMoreLeads}
          accentColor={accentColor}
          sortKey={sortKey}
          sortDir={sortDir}
          onSortChange={handleSortChange}
        />
      </main>

      {/* Modals & Components */}
      {selectedLead && (
        <LeadModal
          lead={selectedLead} onClose={handleCloseLeadModal}
          onUpdateStatus={updateLeadStatus} onAddNote={addNote}
          onDeleteLead={deleteLead} onRefresh={refreshModalLead}
          payments={selectedLeadPayments} activity={selectedLeadActivity}
          currentUser={currentUser} statusOptions={statusOptions}
          categories={company.form_categories || []} company={company}
          companySlug={company.slug}
          teamMembers={teamMembers || []}
                  />
      )}

      <CreateLeadModal
        isOpen={isCreateModalOpen} onClose={handleCloseCreateModal}
        onSuccess={() => {
          lastPollCount.current = null;
          fetchLeads(1, true);
        }}
        companySlug={company.slug}
        companyId={company.id} categories={company.form_categories || []}
        company={company}
      />

      <AiChatWidget
        planTier={planTier}
        allLeads={allLeads}
        company={company}
        isVisible={!selectedLead && !isCreateModalOpen}
        onLockedFeature={setLockedDashboardModal}
      />

      <LockedFeatureModal
        featureKey={lockedDashboardModal}
        companySlug={company.slug}
        onClose={handleCloseLockedModal}
      />

      {tourActive && (
        <DashboardTour
          companyName={company.name} companySlug={company.slug}
          userName={currentUser?.name} isDark={isDark} planTier={planTier}
          onToggleTheme={() => setIsDark(v => !v)}
          onToggleView={(view) => setCurrentView(view)}
          onOpenSidebar={() => {}}
          onOpenCreateModal={handleOpenCreateModal}
          onComplete={handleCompleteTour}
        />
      )}

      <DashboardExportModal
        isOpen={showExportModal}
        onClose={handleCloseExportModal}
        companySlug={company.slug}
        isDark={isDark}
      />
    </div>
  );
}