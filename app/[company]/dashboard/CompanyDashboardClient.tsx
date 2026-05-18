'use client';

import {
  useState, useEffect, useRef, useMemo, useCallback, useTransition,
} from 'react';
import {
  Plus, Menu, Lock, Download, Loader2, Inbox,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import CardsView from '@/components/dashboard/views/CardsView';
import TableView from '@/components/dashboard/views/TableView';
import CalendarView from '@/components/dashboard/views/CalendarView';
import LeadModal from '@/components/dashboard/LeadModal';
import Sidebar from '@/components/dashboard/Sidebar';
import { Toaster } from 'sonner';
import TrialBanner from '@/components/TrialBanner';
import { can, type PlanTier } from '@/lib/permissions';
import PaymentReminderBanner from '@/components/PaymentReminderBanner';
import CreateLeadModal from '@/components/dashboard/CreateLeadModal';
import DashboardTour from '@/components/dashboard/DashboardTour';
import DashboardFilters from '@/components/dashboard/DashboardFilters';
import { AiChatWidget, LockedFeatureModal } from '@/components/dashboard/DashboardModals';
import FreePlanBanner from '@/components/dashboard/FreePlanBanner';
import { motion, AnimatePresence } from 'framer-motion';



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

type ViewMode = 'cards' | 'table' | 'calendar';
type TimeFilter = 'today' | 'week' | 'month' | 'all';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const DEFAULT_STATUSES: StatusOption[] = [
  { value: 'new', label: 'New', color: 'blue' },
  { value: 'contacted', label: 'Contacted', color: 'yellow' },
  { value: 'quoted', label: 'Quoted', color: 'purple' },
  { value: 'scheduled', label: 'Scheduled', color: 'blue' },
  { value: 'in-progress', label: 'In Progress', color: 'orange' },
  { value: 'completed', label: 'Completed', color: 'green' },
  { value: 'cancelled', label: 'Cancelled', color: 'red' },
  { value: 'lost', label: 'Lost', color: 'gray' },
];

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
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  return { now, todayStart, yesterdayStart, weekStart, monthStart };
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export default function CompanyDashboardClient({ company }: { company: Company }) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [lockedDashboardModal, setLockedDashboardModal] = useState<string | null>(null);

  // Lead data
  const [allLeads, setAllLeads] = useState<any[]>([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [serverStatusCounts, setServerStatusCounts] = useState<Record<string, number>>({});
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [globalStats, setGlobalStats] = useState<any>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
const [loadError, setLoadError] = useState('');
const [newLeadCount, setNewLeadCount] = useState(0);
const initialLeadCount = useRef<number | null>(null);

  // UI state
  const [selectedLead, setSelectedLead] = useState<any>(null);
  const [currentView, setCurrentView] = useState<ViewMode>(() => {
    if (typeof window === 'undefined') return 'cards';
    return (localStorage.getItem('dashboard-view') as ViewMode) || 'cards';
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    return localStorage.getItem('dashboard-theme') !== 'light';
  });

  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterAssignee, setFilterAssignee] = useState('all');
  const [filterPayment, setFilterPayment] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // User / team
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);

  // Tour
  const [tourActive, setTourActive] = useState(false);

  // Persist preferences
  useEffect(() => { localStorage.setItem('dashboard-view', currentView); }, [currentView]);
  useEffect(() => { localStorage.setItem('dashboard-theme', isDark ? 'dark' : 'light'); }, [isDark]);

// Tour — only from URL param or manual trigger, never auto
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('tour') === '1') {
      setTourActive(true);
      window.history.replaceState({}, '', `/${company.slug}/dashboard`);
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
        // first load — loading screen handles it
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

      if (search)                        params.set('search',     search);
      if (status   && status   !== 'all') params.set('status',     status);
      if (category && category !== 'all') params.set('category',   category);
      if (assignee && assignee !== 'all') params.set('assignee',   assignee);
      if (payment  && payment  !== 'all') params.set('payment',    payment);
      if (tFilter  && tFilter  !== 'all') params.set('timeFilter', tFilter);
      if (sDate) params.set('startDate', sDate);
      if (eDate) params.set('endDate',   eDate);

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
    } finally {
      setIsInitialLoad(false);
      setIsRefreshing(false);
    }
  }, [company.slug, isInitialLoad, searchQuery, filterStatus, filterCategory, filterAssignee, filterPayment, timeFilter, startDate, endDate]);

  const fetchCurrentUser = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/me');
      const data = await res.json();
      if (data.success) setCurrentUser(data.user);
    } catch (e) { console.error('fetchCurrentUser:', e); }
  }, []);

  const fetchTeamMembers = useCallback(async () => {
    try {
      const res = await fetch(`/api/company/${company.slug}/team`);
      const data = await res.json();
      if (data.success) setTeamMembers(data.teamMembers || []);
    } catch (e) { console.error('fetchTeamMembers:', e); }
  }, [company.slug]);

  useEffect(() => {
    fetchLeads(1);
    fetchCurrentUser();
    fetchTeamMembers();
  }, []);

  useEffect(() => {
    if (isInitialLoad) return;
    fetchLeads(1, true);
  }, [filterStatus, filterCategory, filterAssignee, filterPayment, timeFilter, startDate, endDate, fetchLeads]);

 // Deep-link to lead from URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const leadId = params.get('lead');
    if (!leadId) return;
    const lead = allLeads.find(l => l.id === parseInt(leadId));
    if (lead) {
      setSelectedLead(lead);
      window.history.replaceState({}, '', window.location.pathname);
      return;
    }
    if (isInitialLoad) return;
    fetch(`/api/leads/${leadId}`, { cache: 'no-store' })
      .then(r => r.json())
      .then(data => {
        if (data.success && data.lead) {
          setSelectedLead(data.lead);
          window.history.replaceState({}, '', window.location.pathname);
        }
      })
      .catch(() => {});
  }, [allLeads, isInitialLoad]);

// Poll for new leads
 // Poll for new leads
  useEffect(() => {
    if (isInitialLoad) return;
    if (globalStats?.total_leads == null) return;
    if (initialLeadCount.current === null) {
      initialLeadCount.current = globalStats.total_leads;
    }

    const interval = setInterval(async () => {
      if (document.hidden) return;
      try {
        const res = await fetch(`/api/company/${company.slug}/leads/count`, {
          cache: 'no-store',
        });
        if (!res.ok) return;
        const data = await res.json();
        if (data.success && data.count > initialLeadCount.current!) {
          setNewLeadCount(data.count - initialLeadCount.current!);
        }
      } catch {}
    }, 5000);

    return () => clearInterval(interval);
  }, [isInitialLoad, globalStats?.total_leads, company.slug]);

  // -------------------------------------------------------------------------
  // Actions
  // -------------------------------------------------------------------------

  const userMeta = () => ({
    user_name: currentUser?.name || currentUser?.email || 'Unknown User',
    user_email: currentUser?.email || '',
  });

  const handleLogout = useCallback(async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    startTransition(() => router.push('/login'));
  }, [router]);

  const updateLeadStatus = useCallback(async (id: number, status: string, oldStatus: string) => {
    try {
      const res = await fetch('/api/leads/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status, action: 'update_status', old_status: oldStatus, ...userMeta() }),
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
      if (data.success && data.lead) setSelectedLead(data.lead);
    } catch (e) { console.error('refreshModalLead:', e); }
  }, [fetchLeads, selectedLead]);

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

  // -------------------------------------------------------------------------
  // Derived data
  // -------------------------------------------------------------------------

  const { todayStart, yesterdayStart, weekStart } = getDateBoundaries();

  const filteredLeads = useMemo(() => allLeads, [allLeads]);

  const groups = useMemo(() => [
    { title: 'Today', leads: filteredLeads.filter(l => new Date(l.created_at) >= todayStart) },
    { title: 'Yesterday', leads: filteredLeads.filter(l => { const d = new Date(l.created_at); return d >= yesterdayStart && d < todayStart; }) },
    { title: 'Earlier This Week', leads: filteredLeads.filter(l => { const d = new Date(l.created_at); return d >= weekStart && d < yesterdayStart; }) },
    { title: 'Older', leads: filteredLeads.filter(l => new Date(l.created_at) < weekStart) },
  ], [filteredLeads]);

  const statusCounts = serverStatusCounts;

  const categories = useMemo(() =>
    company.form_categories?.map((c: any) => c.value || c).filter(Boolean) ||
    [...new Set(allLeads.map(l => l.category).filter(Boolean))],
  [company.form_categories, allLeads]);

  const hasActiveFilters = filterStatus !== 'all' || filterCategory !== 'all' || filterAssignee !== 'all'
    || filterPayment !== 'all' || timeFilter !== 'all' || !!startDate || !!endDate || !!searchQuery;

  // -------------------------------------------------------------------------
  // Loading screen
  // -------------------------------------------------------------------------

  if (isInitialLoad) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: isDark ? 'linear-gradient(to bottom right, #1e293b, #0f172a, #020617)' : '#f8fafc' }}
        role="status"
        aria-label="Loading dashboard"
      >
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-500 mx-auto mb-4" aria-hidden />
          <p className="text-white text-lg font-semibold tracking-tight">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // Stats config
  // -------------------------------------------------------------------------

  const stats = [
    { label: 'Leads', value: globalStats?.total_leads ?? allLeads.length,
      light: 'bg-blue-50 border-blue-100', dark: 'bg-blue-500/15 border-blue-500/20',
      labelLight: 'text-blue-400', labelDark: 'text-blue-300/60',
      valueLight: 'text-blue-900', valueDark: 'text-blue-100' },
    { label: 'Active', value: globalStats?.active_jobs ?? allLeads.filter(l => !['completed','cancelled','lost'].includes(l.status)).length,
      light: 'bg-blue-50 border-blue-100', dark: 'bg-blue-500/10 border-blue-500/20',
      labelLight: 'text-blue-400', labelDark: 'text-blue-300/60',
      valueLight: 'text-blue-900', valueDark: 'text-blue-100' },
    { label: 'Revenue', value: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(globalStats?.revenue ?? 0),
      light: 'bg-emerald-50 border-emerald-100', dark: 'bg-emerald-500/10 border-emerald-500/20',
      labelLight: 'text-emerald-500', labelDark: 'text-emerald-300/60',
      valueLight: 'text-emerald-900', valueDark: 'text-emerald-100' },
    { label: 'Pending', value: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(globalStats?.pending ?? 0),
      light: 'bg-amber-50 border-amber-100', dark: 'bg-amber-500/10 border-amber-500/20',
      labelLight: 'text-amber-500', labelDark: 'text-amber-300/60',
      valueLight: 'text-amber-900', valueDark: 'text-amber-100' },
  ];

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------

  return (
    <div className={`min-h-screen relative selection:bg-blue-500/30 ${isDark ? 'bg-[#1e293b]' : 'bg-gray-50'}`}>
      <Toaster position="top-right" richColors />

      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[9999] focus:px-4 focus:py-2 focus:bg-blue-500 focus:text-white focus:rounded-lg focus:font-bold">
        Skip to main content
      </a>

      {/* Sidebar overlay */}
      <div
        className={`fixed inset-0 transition-all duration-300 ${sidebarOpen ? 'visible' : 'invisible pointer-events-none'}`}
        style={{ zIndex: sidebarOpen ? 10000 : 100 }}
        aria-hidden={!sidebarOpen}
      >
        <div
          className={`absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity duration-300 ${sidebarOpen ? 'opacity-100' : 'opacity-0'}`}
          onClick={() => setSidebarOpen(false)}
        />
        <aside
          className={`absolute left-0 top-0 bottom-0 w-72 transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
          style={{ zIndex: sidebarOpen ? 10001 : 110 }}
          aria-label="Navigation sidebar"
        >
          <Sidebar
            companySlug={company.slug}
            companyName={company.name}
            companyLogoUrl={company.logo_url}
            currentUser={currentUser}
            onLogout={handleLogout}
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
            currentView={currentView}
            onViewChange={setCurrentView}
          />
        </aside>
      </div>

      {/* Banners */}
      <div className="relative z-10">
       <TrialBanner
          subscriptionStatus={company.subscription_status || 'inactive'}
          trialEndsAt={company.trial_ends_at || null}
          companySlug={company.slug}
          cancelAtPeriodEnd={company.cancel_at_period_end}
          subscriptionCancelAt={company.subscription_cancel_at}
          planTier={company.plan_tier || 'free'}
        />
        <PaymentReminderBanner
          slug={company.slug}
          onSelectLead={setSelectedLead}
          allLeads={allLeads}
        />
      </div>


{/* MAIN */}
      <main id="main-content" className="max-w-7xl mx-auto px-4 sm:px-10 py-6 sm:py-12 relative z-10 font-sans">

        {/* Top Nav Bar - Modern Glassmorphism */}
        <header className={`sticky top-4 z-50 rounded-[1.5rem] sm:rounded-[2rem] px-4 py-3 sm:px-8 sm:py-5 mb-8 transition-all backdrop-blur-xl ${
          isDark
            ? 'bg-[#0A0C14]/80 border border-white/5 shadow-[0_20px_50px_rgba(0,0,0,0.3)]'
            : 'bg-white/90 border border-slate-100 shadow-[0_10px_30px_rgba(0,0,0,0.04)]'
        }`}>
          <div className="flex items-center justify-between gap-3 sm:gap-4">
            <div className="flex items-center gap-3 sm:gap-6 min-w-0">
              <button
                data-tour="sidebar-toggle"
                onClick={() => setSidebarOpen(true)}
                className={`p-3 rounded-2xl transition-all active:scale-90 shrink-0 ${
                  isDark ? 'bg-white/5 hover:bg-white/10 text-white' : 'bg-slate-50 hover:bg-slate-100 text-slate-600'
                }`}
              >
                <Menu className="w-6 h-6" />
              </button>
              
              <div className="flex items-center gap-4 sm:gap-6 min-w-0 border-l border-slate-200/30 pl-3 sm:pl-6">
                {company.logo_url ? (
                  <img 
                    src={company.logo_url} 
                    alt="Logo" 
                    className="h-10 sm:h-16 w-auto object-contain shrink-0 hover:scale-105 transition-transform" 
                  />
                ) : (
                  <div className="w-10 h-10 sm:w-14 sm:h-14 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center text-white font-black shrink-0 shadow-xl shadow-blue-500/20 text-lg">
                    {company.name.charAt(0)}
                  </div>
                )}
                
                <div className="min-w-0">
                  <h1 className={`text-sm sm:text-xl font-black tracking-tight truncate leading-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {company.name}
                  </h1>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                    <p className="text-[9px] sm:text-[10px] uppercase tracking-[0.15em] font-bold text-slate-400 truncate">Live Dashboard</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {isRefreshing && <Loader2 className="w-4 h-4 animate-spin text-blue-500 hidden xs:block" />}
              {can(planTier, 'create_lead_manual') ? (
                <button
                  data-tour="create-lead"
                  onClick={() => setIsCreateModalOpen(true)}
                  className="inline-flex items-center gap-2 px-4 py-3 sm:px-6 sm:py-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold text-sm transition-all shadow-[0_10px_20px_rgba(37,99,235,0.2)] active:scale-95"
                >
                  <Plus className="w-5 h-5 stroke-[3px]" />
                  <span className="hidden sm:inline">New Lead</span>
                </button>
              ) : (
                <button
                  onClick={() => setLockedDashboardModal('create_lead')}
                  className={`inline-flex items-center gap-2 px-4 py-3 sm:px-6 sm:py-3.5 rounded-2xl font-bold text-sm transition-all active:scale-95 ${
                    isDark ? 'bg-white/5 text-slate-400' : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  <Lock className="w-4 h-4" />
                  <span className="hidden sm:inline">New Lead</span>
                </button>
              )}
            </div>
          </div>
        </header>

        {/* Stats - Horizontal Swipe on Mobile, Grid on Desktop */}
   {/* Stats - Horizontal Swipe on Mobile, Grid on Desktop */}
<section className="flex sm:grid sm:grid-cols-4 gap-3 sm:gap-6 mb-8 sm:mb-12 w-full overflow-x-auto pb-4 sm:pb-0 no-scrollbar snap-x snap-mandatory">
  {stats.map((s, i) => (
    <div
      key={i}
      className={`snap-start w-fit min-w-0 sm:w-full flex-shrink-0 rounded-[1.25rem] sm:rounded-[1.5rem] p-4 sm:p-7 transition-all ${
        isDark 
          ? 'bg-white/[0.03] border border-white/5' 
          : 'bg-white border border-slate-50 shadow-[0_8px_30px_rgb(0,0,0,0.02)]'
      }`}
    >
      <div className="flex flex-col gap-1">
        <p className={`text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.1em] whitespace-nowrap ${isDark ? s.labelDark : s.labelLight}`}>
          {s.label}
        </p>
        <p
          className={`font-black tracking-tight tabular-nums whitespace-nowrap ${isDark ? s.valueDark : s.valueLight}`}
          style={{ fontSize: 'clamp(1.1rem, 4vw, 1.75rem)' }}
        >
          {s.value}
        </p>
      </div>
    </div>
  ))}
</section>

        {/* Free Plan Banner */}
        <div className="mb-8 sm:mb-12">
          <FreePlanBanner
            company={company}
            isDark={isDark}
            onStartTour={() => setTourActive(true)}
            onCreateLead={() => setIsCreateModalOpen(true)}
            leadCount={allLeads.length}
            allLeads={allLeads}
          />
        </div>

        {/* Error Notification */}
        {loadError && (
          <div className="mb-8 p-4 sm:p-5 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-xs sm:text-sm font-bold flex items-center justify-between animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
              <span>{loadError}</span>
            </div>
            <button onClick={() => fetchLeads(1)} className="uppercase tracking-widest text-[10px] bg-red-500 text-white px-3 py-2 rounded-lg hover:bg-red-600 transition-colors">Retry</button>
          </div>
        )}

        {/* Filters */}
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

     {/* New leads notification */}
        <AnimatePresence>
          {newLeadCount > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`mb-6 rounded-2xl px-5 py-3.5 flex items-center justify-between cursor-pointer transition-all ${
                isDark
                  ? 'bg-blue-500/10 border border-blue-500/20 hover:bg-blue-500/15'
                  : 'bg-blue-50 border border-blue-100 hover:bg-blue-100'
              }`}
              onClick={() => {
    setNewLeadCount(0);
    initialLeadCount.current = null;
    fetchLeads(1);
}}
            >
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                <p className={`text-sm font-bold ${isDark ? 'text-blue-300' : 'text-blue-700'}`}>
                  {newLeadCount} new lead{newLeadCount > 1 ? 's' : ''} came in
                </p>
              </div>
              <span className={`text-xs font-bold uppercase tracking-widest ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                Tap to refresh
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Leads Display */}
        <section aria-label="Leads" aria-live="polite" className="relative">
  {filteredLeads.length === 0 ? (
  <div className={`rounded-2xl px-6 py-14 sm:py-24 text-center border border-dashed transition-all ${
    isDark ? 'bg-white/[0.01] border-white/[0.06]' : 'bg-slate-50/30 border-slate-200'
  }`}>
    <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-blue-500/10 mb-5" aria-hidden>
      <Inbox className="w-7 h-7 sm:w-8 sm:h-8 text-blue-500/30" />
    </div>
    <h2 className={`text-lg sm:text-xl font-semibold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
      No leads yet
    </h2>
    <p className="text-slate-400 text-sm max-w-xs mx-auto leading-relaxed">
      {hasActiveFilters ? "No leads match your current filters." : "Create your first lead to get started."}
    </p>
    {hasActiveFilters && (
      <button
        onClick={clearFilters}
        className="mt-6 px-5 py-2.5 rounded-lg bg-blue-600 text-white text-xs font-medium hover:bg-blue-500 transition-all"
      >
        Clear filters
      </button>
    )}
  </div>
) : currentView === 'calendar' ? (
            <div className="animate-in fade-in zoom-in-95 duration-500">
              <CalendarView leads={allLeads} onSelectLead={setSelectedLead} statusOptions={statusOptions} isDark={isDark} />
            </div>
          ) : currentView === 'cards' ? (
            <div className="space-y-12 sm:space-y-20">
              {groups.map(({ title, leads }) => leads.length > 0 && (
                <section key={title} aria-label={`${title} leads`} className="relative">
                  <div className="flex items-center gap-4 sm:gap-6 mb-8 sm:mb-10 sticky top-24 z-10 py-4 backdrop-blur-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                      <h2 className={`text-[10px] sm:text-[12px] font-black uppercase tracking-[0.3em] sm:tracking-[0.5em] ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        {title}
                      </h2>
                    </div>
                    <div className={`h-[1px] flex-1 ${isDark ? 'bg-white/5' : 'bg-slate-100'}`} aria-hidden />
                    {title !== 'Older' && (
                      <span className={`text-[9px] sm:text-[11px] font-bold px-3 py-1 sm:px-4 sm:py-1.5 rounded-full ${
                        isDark ? 'bg-white/5 text-slate-400' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {leads.length}
                      </span>
                    )}
                  </div>
                  <CardsView leads={leads} onSelectLead={setSelectedLead} statusOptions={statusOptions} isDark={isDark} planTier={planTier} />
                </section>
              ))}
            </div>
          ) : (
            <div key={`table-${refreshKey}`} className="animate-in fade-in slide-in-from-bottom-6 duration-700">
              <div className="mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4 px-2">
                <div>
                  <h2 className={`text-[11px] sm:text-[12px] font-black uppercase tracking-[0.3em] sm:tracking-[0.4em] ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                    Database
                  </h2>
                  <p className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1 sm:mt-2">
                    {filteredLeads.length} total records
                  </p>
                </div>
                {can(planTier, 'csv_export') ? (
                  <a
                    href={`/api/company/${company.slug}/export-csv`}
                    className={`inline-flex items-center justify-center gap-2 px-6 py-3 sm:px-8 sm:py-3.5 text-[9px] sm:text-[10px] font-black uppercase tracking-widest rounded-2xl transition-all border ${
                      isDark ? 'bg-white/5 border-white/10 text-white hover:bg-white hover:text-black' : 'bg-slate-900 border-slate-800 text-white hover:bg-slate-800 shadow-lg'
                    }`}
                  >
                    Export CSV
                  </a>
                ) : (
                  <button
                    onClick={() => setLockedDashboardModal('csv_export')}
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 sm:px-8 sm:py-3.5 bg-slate-50 text-slate-400 text-[9px] sm:text-[10px] font-black uppercase tracking-widest rounded-2xl border border-slate-100 transition-all active:scale-95"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    Export (PRO)
                  </button>
                )}
              </div>
              <div className={`rounded-[1.5rem] sm:rounded-[2.5rem] overflow-hidden border shadow-2xl transition-all ${
                isDark ? 'bg-[#0A0C14] border-white/5' : 'bg-white border-slate-100 shadow-[0_30px_60px_rgba(0,0,0,0.02)]'
              }`}>
                <TableView
                  leads={filteredLeads} onSelectLead={setSelectedLead} statusOptions={statusOptions}
                  onBulkUpdate={handleBulkUpdate} onBulkDelete={handleBulkDelete}
                  teamMembers={teamMembers} categories={company.form_categories || []}
                  customQuestions={company.custom_questions || []} isDark={isDark}
                />
              </div>
            </div>
          )}
        </section>

        {/* Load More */}
      {pagination.page < pagination.pages && (
  <div className="flex flex-col items-center pt-10 sm:pt-14 pb-8 sm:pb-10 gap-2">
    <button
      onClick={() => fetchLeads(pagination.page + 1, false)}
      className={`w-full sm:w-auto px-8 py-3 rounded-lg text-xs font-medium border transition-all active:scale-[0.97] ${
        isDark
          ? 'border-white/10 text-white/70 hover:bg-white/[0.06]'
          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
      }`}
    >
      Load more
    </button>
    <span className="text-[11px] text-slate-400">
      {pagination.total - allLeads.length} remaining
    </span>
  </div>
)}
      </main>

      {/* Modals & Components */}
      {selectedLead && (
        <LeadModal
          lead={selectedLead} onClose={() => setSelectedLead(null)}
          onUpdateStatus={updateLeadStatus} onAddNote={addNote}
          onDeleteLead={deleteLead} onRefresh={refreshModalLead}
          currentUser={currentUser} statusOptions={statusOptions}
          categories={company.form_categories || []} company={company}
          companySlug={company.slug}
        />
      )}

      <CreateLeadModal
        isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)}
        onSuccess={() => fetchLeads(1, true)} companySlug={company.slug}
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
        onClose={() => setLockedDashboardModal(null)}
      />

      {tourActive && (
        <DashboardTour
          companyName={company.name} companySlug={company.slug}
          userName={currentUser?.name} isDark={isDark} planTier={planTier}
          onToggleTheme={() => setIsDark(v => !v)}
          onToggleView={(view) => setCurrentView(view)}
          onOpenSidebar={() => setSidebarOpen(true)}
          onOpenCreateModal={() => setIsCreateModalOpen(true)}
          onComplete={() => setTourActive(false)}
        />
      )}
    </div>
  );
}