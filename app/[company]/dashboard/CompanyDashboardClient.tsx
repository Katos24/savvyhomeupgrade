'use client';

import { useState, useEffect } from 'react';
import { Search, X, Plus, Menu, Filter, ChevronDown, Download, Loader2, Inbox } from 'lucide-react';
import CardsView from '@/components/dashboard/views/CardsView';
import TableView from '@/components/dashboard/views/TableView';
import LeadModal from '@/components/dashboard/LeadModal';
import Sidebar from '@/components/dashboard/Sidebar';
import { Toaster } from 'sonner';
import TrialBanner from '@/components/TrialBanner';

type StatusOption = { value: string; label: string; color: string; emoji?: string };
type Company = {
  id: number; name: string; slug: string; logo_url?: string | null;
  status_options?: StatusOption[]; form_categories?: any[]; custom_questions?: any[];
  subscription_status?: string; trial_ends_at?: string | null;
};

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

export default function CompanyDashboardClient({ company }: { company: Company }) {
  const [allLeads, setAllLeads] = useState<any[]>([]);
  const [selectedLead, setSelectedLead] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState<'cards' | 'table'>('cards');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [timeFilter, setTimeFilter] = useState<'today' | 'week' | 'month' | 'all'>('all');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterAssignee, setFilterAssignee] = useState('all');
  const [filterPayment, setFilterPayment] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);

  const statusOptions = company.status_options?.length ? company.status_options : DEFAULT_STATUSES;

  useEffect(() => {
    fetchLeads();
    fetchCurrentUser();
    fetchTeamMembers();
  }, []);

  async function fetchLeads() {
    try {
      const res = await fetch(`/api/company/${company.slug}/leads`, {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate', 'Pragma': 'no-cache' },
      });
      const data = await res.json();
      setAllLeads((data.leads || []).filter((l: any) => !l.deleted));
      setRefreshKey(prev => prev + 1);
    } catch (e) {
      console.error('Failed to fetch leads:', e);
    } finally {
      setLoading(false);
    }
  }

  async function fetchCurrentUser() {
    try {
      const res = await fetch('/api/auth/me');
      const data = await res.json();
      if (data.success) setCurrentUser(data.user);
    } catch (e) { console.error('Failed to fetch user:', e); }
  }

  async function fetchTeamMembers() {
    try {
      const res = await fetch(`/api/company/${company.slug}/team`);
      const data = await res.json();
      if (data.success) setTeamMembers(data.teamMembers || []);
    } catch (e) { console.error('Failed to fetch team:', e); }
  }

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/login';
  }

  const userMeta = () => ({
    user_name: currentUser?.name || currentUser?.email || 'Unknown User',
    user_email: currentUser?.email || '',
  });

  async function updateLeadStatus(id: number, status: string, oldStatus: string) {
    try {
      const res = await fetch('/api/leads/update', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status, action: 'update_status', old_status: oldStatus, ...userMeta() }),
      });
      const result = await res.json();
      if (res.ok && result.success) {
        const fresh = await fetch(`/api/company/${company.slug}/leads`, {
          cache: 'no-store', headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate', 'Pragma': 'no-cache' },
        });
        const freshData = await fresh.json();
        const freshLeads = (freshData.leads || []).filter((l: any) => !l.deleted);
        setAllLeads(freshLeads);
        setRefreshKey(prev => prev + 1);
        if (selectedLead?.id === id) {
          const updated = freshLeads.find((l: any) => l.id === id);
          if (updated) setSelectedLead(updated);
        }
        return true;
      }
      return false;
    } catch (e) { console.error('Update status error:', e); return false; }
  }

  async function addNote(id: number, noteText: string) {
    try {
      const res = await fetch('/api/leads/update', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, notes: noteText, action: 'add_note', ...userMeta() }),
      });
      const result = await res.json();
      if (res.ok && result.success) {
        await fetchLeads();
        const r = await fetch(`/api/company/${company.slug}/leads`);
        const d = await r.json();
        const updated = d.leads.find((l: any) => l.id === id);
        if (updated) setSelectedLead(updated);
        return true;
      }
      return false;
    } catch (e) { console.error('Add note error:', e); return false; }
  }

  async function deleteLead(id: number) {
    try {
      const res = await fetch('/api/leads/delete', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...userMeta() }),
      });
      const result = await res.json();
      if (res.ok && result.success) { await fetchLeads(); return true; }
      return false;
    } catch (e) { console.error('Delete lead error:', e); return false; }
  }

  async function handleBulkUpdate(leadIds: number[], updates: any) {
    const res = await fetch('/api/leads/bulk-update', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ leadIds, updates, ...userMeta() }),
    });
    const result = await res.json();
    if (res.ok && result.success) await fetchLeads();
    else throw new Error(result.error || 'Failed to update leads');
  }

  async function handleBulkDelete(leadIds: number[]) {
    const res = await fetch('/api/leads/bulk-delete', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ leadIds, ...userMeta() }),
    });
    const result = await res.json();
    if (res.ok && result.success) await fetchLeads();
    else throw new Error(result.error || 'Failed to delete leads');
  }

  async function refreshModalLead() {
    await fetchLeads();
    if (!selectedLead) return;
    try {
      const res = await fetch(`/api/company/${company.slug}/leads`);
      const data = await res.json();
      const updated = data.leads.find((l: any) => l.id === selectedLead.id);
      if (updated) setSelectedLead(updated);
    } catch (e) { console.error('Failed to refresh modal lead:', e); }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#0f172a' }}>
        <div className="text-center">
          <Loader2 className="w-16 h-16 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-white text-xl font-semibold">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // ── Filtering ──────────────────────────────────────────────────────────────
  const now = new Date();
  const todayStart = new Date(new Date().setHours(0, 0, 0, 0));
  const yesterdayStart = new Date(todayStart.getTime() - 86400000);
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay());
  weekStart.setHours(0, 0, 0, 0);

  const filteredLeads = allLeads
    .filter(lead => {
      const q = searchQuery.toLowerCase();
      if (q && !lead.name?.toLowerCase().includes(q) && !lead.email?.toLowerCase().includes(q) && !lead.phone?.includes(q)) return false;
      if (filterStatus !== 'all' && (lead.status || 'new') !== filterStatus) return false;
      if (filterCategory !== 'all' && lead.category !== filterCategory) return false;
      if (filterAssignee !== 'all') {
        if (filterAssignee === 'unassigned' && lead.assigned_to) return false;
        if (filterAssignee !== 'unassigned' && lead.assigned_to !== filterAssignee) return false;
      }
      if (filterPayment !== 'all') {
        if (filterPayment === 'paid' && lead.payment_status !== 'paid') return false;
        if (filterPayment === 'unpaid' && lead.payment_status === 'paid') return false;
      }
      const d = new Date(lead.created_at);
      if (startDate && endDate) {
        const end = new Date(endDate); end.setHours(23, 59, 59, 999);
        if (d < new Date(startDate) || d > end) return false;
      } else if (startDate && d < new Date(startDate)) return false;
      else if (endDate) {
        const end = new Date(endDate); end.setHours(23, 59, 59, 999);
        if (d > end) return false;
      } else if (timeFilter === 'today' && d < todayStart) return false;
      else if (timeFilter === 'week' && d < weekStart) return false;
      else if (timeFilter === 'month' && d < new Date(now.getFullYear(), now.getMonth(), 1)) return false;
      return true;
    })
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const categories = [...new Set(allLeads.map(l => l.category))];
  const statusCounts = statusOptions.reduce((acc, s) => {
    acc[s.value] = allLeads.filter(l => (l.status || statusOptions[0].value) === s.value).length;
    return acc;
  }, {} as Record<string, number>);

  const groups = [
    { title: 'Today', leads: filteredLeads.filter(l => new Date(l.created_at) >= todayStart) },
    { title: 'Yesterday', leads: filteredLeads.filter(l => { const d = new Date(l.created_at); return d >= yesterdayStart && d < todayStart; }) },
    { title: 'Earlier This Week', leads: filteredLeads.filter(l => { const d = new Date(l.created_at); return d >= weekStart && d < yesterdayStart; }) },
    { title: 'Older', leads: filteredLeads.filter(l => new Date(l.created_at) < weekStart) },
  ];

  const clearFilters = () => {
    setSearchQuery(''); setFilterCategory('all'); setFilterStatus('all');
    setFilterAssignee('all'); setFilterPayment('all'); setTimeFilter('all');
    setStartDate(''); setEndDate('');
  };

  const selectClass = "px-3 py-2.5 text-sm rounded-lg bg-slate-800 text-white border border-slate-700 font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500 hover:bg-slate-700 transition";

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen relative" style={{ background: 'linear-gradient(to bottom right, #1e293b, #0f172a, #020617)' }}>
      <Toaster position="top-right" />

      <div className="relative z-10">
        <TrialBanner
          subscriptionStatus={company.subscription_status || 'inactive'}
          trialEndsAt={company.trial_ends_at || null}
          companySlug={company.slug}
        />
      </div>

      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setSidebarOpen(false)} />}

      <Sidebar
        companySlug={company.slug} companyName={company.name} companyLogoUrl={company.logo_url}
        currentUser={currentUser} onLogout={handleLogout} isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)} currentView={currentView} onViewChange={setCurrentView}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 relative z-10">

        {/* Top bar */}
        <div className="bg-white/10 backdrop-blur-xl rounded-xl p-4 sm:p-6 mb-6 border border-white/20 shadow-xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2.5 bg-white/10 hover:bg-white/20 rounded-lg transition text-white border border-white/20">
                <Menu className="w-6 h-6" />
              </button>
              {company.logo_url ? (
                <img src={company.logo_url} alt={company.name} className="h-10 sm:h-12 w-auto object-contain" />
              ) : (
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-purple-500/20">
                  {company.name.charAt(0)}
                </div>
              )}
              <h1 className="text-xl sm:text-2xl font-bold text-white">{company.name}</h1>
            </div>
            <a href={`/${company.slug}`}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg font-semibold transition shadow-lg shadow-purple-600/20">
              <Plus className="w-5 h-5" /> Create
            </a>
          </div>
        </div>

        {/* Search + filter toggle */}
        <div className="mb-4 flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" />
            <input
              type="text" placeholder="Search by name, email, or phone..."
              value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-12 py-4 rounded-xl bg-white/10 backdrop-blur-xl border-2 border-white/20 focus:border-purple-500 focus:outline-none text-white placeholder-white/60 text-base sm:text-lg font-medium shadow-lg transition-colors"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-white/10 rounded-full transition">
                <X className="w-5 h-5 text-white/60 hover:text-white" />
              </button>
            )}
          </div>
          <button onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm rounded-xl bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 font-semibold transition shadow-lg">
            <Filter className="w-4 h-4" /> Filters
            <ChevronDown className={`w-4 h-4 transition-transform ${showAdvancedFilters ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Quick filters */}
        <div className="flex flex-col sm:flex-row justify-end gap-2 mb-4">
          <select value={timeFilter} onChange={(e) => setTimeFilter(e.target.value as any)} className={selectClass}>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="all">All Time</option>
          </select>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className={selectClass}>
            <option value="all">All Statuses</option>
            {statusOptions.map(s => (
              <option key={s.value} value={s.value}>{s.label} ({statusCounts[s.value] || 0})</option>
            ))}
          </select>
        </div>

        {/* Advanced filters */}
        {showAdvancedFilters && (
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl p-4 mb-6 border border-slate-700 shadow-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {[
                { label: 'Category', value: filterCategory, onChange: setFilterCategory,
                  options: [{ value: 'all', label: 'All Categories' }, ...categories.map(c => ({ value: c, label: c }))] },
                { label: 'Assigned To', value: filterAssignee, onChange: setFilterAssignee,
                  options: [{ value: 'all', label: 'All Team Members' }, { value: 'unassigned', label: 'Unassigned' },
                    ...teamMembers.map(m => ({ value: m.name, label: m.name }))] },
                { label: 'Payment', value: filterPayment, onChange: setFilterPayment,
                  options: [{ value: 'all', label: 'All' }, { value: 'paid', label: 'Paid' }, { value: 'unpaid', label: 'Unpaid' }] },
              ].map(({ label, value, onChange, options }) => (
                <div key={label}>
                  <label className="block text-xs font-semibold text-white/80 mb-2">{label}</label>
                  <select value={value} onChange={(e) => onChange(e.target.value)} className={`w-full ${selectClass}`}>
                    {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
              ))}
              {[
                { label: 'Start Date', value: startDate, onChange: setStartDate },
                { label: 'End Date', value: endDate, onChange: setEndDate },
              ].map(({ label, value, onChange }) => (
                <div key={label}>
                  <label className="block text-xs font-semibold text-white/80 mb-2">{label}</label>
                  <input type="date" value={value} onChange={(e) => onChange(e.target.value)} className={`w-full ${selectClass}`} />
                </div>
              ))}
            </div>
            <div className="mt-4 flex justify-end">
              <button onClick={clearFilters}
                className="inline-flex items-center gap-2 px-4 py-2.5 text-sm bg-red-500/20 hover:bg-red-500/30 text-red-200 rounded-lg font-semibold transition border border-red-500/30">
                <X className="w-4 h-4" /> Clear All Filters
              </button>
            </div>
          </div>
        )}

        {/* Leads */}
        {filteredLeads.length === 0 ? (
          <div className="bg-white/10 backdrop-blur-xl rounded-xl p-12 text-center border border-white/20 shadow-xl">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-700/50 mb-4">
              <Inbox className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">No leads found</h3>
            <p className="text-white/70">Try adjusting your filters or search query</p>
          </div>
        ) : currentView === 'cards' ? (
          <div>
            {groups.map(({ title, leads }) => leads.length > 0 && (
              <div key={title} className="mb-8">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  {title} <span className="text-white/60 text-base">({leads.length})</span>
                </h3>
                <CardsView leads={leads} onSelectLead={setSelectedLead} statusOptions={statusOptions} />
              </div>
            ))}
          </div>
        ) : (
          <div key={`table-${refreshKey}`}>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                All Leads <span className="text-white/60 text-base">({filteredLeads.length})</span>
              </h3>
              <a href={`/api/company/${company.slug}/export-csv?${new URLSearchParams({ status: filterStatus, time: timeFilter, category: filterCategory, search: searchQuery })}`}
                download={`${company.slug}_${new Date().toISOString().split('T')[0]}.csv`}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg font-semibold transition border border-white/20 shadow-lg">
                <Download className="w-4 h-4" /> Export CSV
              </a>
            </div>
            <TableView
              leads={filteredLeads} onSelectLead={setSelectedLead} statusOptions={statusOptions}
              onBulkUpdate={handleBulkUpdate} onBulkDelete={handleBulkDelete}
              teamMembers={teamMembers} categories={company.form_categories || []}
              customQuestions={company.custom_questions || []}
            />
          </div>
        )}
      </div>

      {selectedLead && (
        <LeadModal
          lead={selectedLead} onClose={() => setSelectedLead(null)}
          onUpdateStatus={updateLeadStatus} onAddNote={addNote}
          onDeleteLead={deleteLead} onRefresh={refreshModalLead}
          currentUser={currentUser} statusOptions={statusOptions}
          categories={company.form_categories || []}
          company={company} companySlug={company.slug}
        />
      )}
    </div>
  );
}