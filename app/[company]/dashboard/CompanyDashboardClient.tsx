'use client';

import { useState, useEffect } from 'react';
import CardsView from '@/components/dashboard/views/CardsView';
import TableView from '@/components/dashboard/views/TableView';
import LeadModal from '@/components/dashboard/LeadModal';
import Sidebar from '@/components/dashboard/Sidebar';
import { Toaster } from 'sonner';
import TrialBanner from '@/components/TrialBanner';

type StatusOption = {
  value: string;
  label: string;
  color: string;
  emoji?: string;
};

type Company = {
  id: number;
  name: string;
  slug: string;
  logo_url?: string | null;
  status_options?: StatusOption[];
  subscription_status?: string;
  trial_ends_at?: string | null;
};

const DEFAULT_STATUSES: StatusOption[] = [
  { value: 'new', label: 'New', color: 'blue', emoji: '🆕' },
  { value: 'contacted', label: 'Contacted', color: 'yellow', emoji: '📞' },
  { value: 'quoted', label: 'Quoted', color: 'purple', emoji: '💰' },
  { value: 'scheduled', label: 'Scheduled', color: 'blue', emoji: '📅' },
  { value: 'in-progress', label: 'In Progress', color: 'orange', emoji: '🔨' },
  { value: 'completed', label: 'Completed', color: 'green', emoji: '✅' },
  { value: 'cancelled', label: 'Cancelled', color: 'red', emoji: '❌' },
  { value: 'lost', label: 'Lost', color: 'gray', emoji: '🗑️' },
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
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const statusOptions = company.status_options && company.status_options.length > 0 
    ? company.status_options 
    : DEFAULT_STATUSES;

  useEffect(() => {
    fetchLeads();
    fetchCurrentUser();
  }, []);

  async function fetchLeads() {
    try {
      const response = await fetch(`/api/company/${company.slug}/leads`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache'
        }
      });
      const data = await response.json();
      setAllLeads((data.leads || []).filter((l: any) => !l.deleted));
      setRefreshKey(prev => prev + 1);
    } catch (error) {
      console.error('Failed to fetch leads:', error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchCurrentUser() {
    try {
      const response = await fetch('/api/auth/me');
      const data = await response.json();
      if (data.success) {
        setCurrentUser(data.user);
      }
    } catch (error) {
      console.error('Failed to fetch user:', error);
    }
  }

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/login';
  }

  async function updateLeadStatus(id: number, status: string, oldStatus: string) {
    try {
      console.log('🔄 updateLeadStatus called:', { id, status, oldStatus });
      
      const response = await fetch('/api/leads/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          id, 
          status,
          action: 'update_status',
          user_name: currentUser?.name || currentUser?.email || 'Unknown User',
          user_email: currentUser?.email || '',
          old_status: oldStatus
        })
      });
      
      const result = await response.json();
      console.log('📥 Update response:', result);
      
      if (response.ok && result.success) {
        console.log('✅ Update successful, fetching fresh data...');
        
        const freshResponse = await fetch(`/api/company/${company.slug}/leads`, {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache'
          }
        });
        const freshData = await freshResponse.json();
        const freshLeads = (freshData.leads || []).filter((l: any) => !l.deleted);
        
        setAllLeads(freshLeads);
        setRefreshKey(prev => prev + 1);
        
        if (selectedLead?.id === id) {
          const updatedLead = freshLeads.find((l: any) => l.id === id);
          if (updatedLead) {
            console.log('🔄 Updating modal with fresh lead data');
            setSelectedLead(updatedLead);
          }
        }
        
        console.log('✅ Status update complete');
        return true;
      } else {
        console.error('❌ Update failed:', result);
        return false;
      }
    } catch (error) {
      console.error('❌ Update status error:', error);
      return false;
    }
  }

  async function addNote(id: number, noteText: string) {
    try {
      const response = await fetch('/api/leads/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          id, 
          notes: noteText, 
          action: 'add_note',
          user_name: currentUser?.name || currentUser?.email || 'Unknown User',
          user_email: currentUser?.email || ''
        })
      });
      
      const result = await response.json();
      
      if (response.ok && result.success) {
        await fetchLeads();
        const updatedResponse = await fetch(`/api/company/${company.slug}/leads`);
        const updatedData = await updatedResponse.json();
        const updatedLead = updatedData.leads.find((l: any) => l.id === id);
        if (updatedLead) {
          setSelectedLead(updatedLead);
        }
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error('Add note error:', error);
      return false;
    }
  }

  async function deleteLead(id: number) {
    try {
      const response = await fetch('/api/leads/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          id,
          user_name: currentUser?.name || currentUser?.email || 'Unknown User',
          user_email: currentUser?.email || ''
        })
      });
      
      const result = await response.json();
      
      if (response.ok && result.success) {
        await fetchLeads();
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error('Delete lead error:', error);
      return false;
    }
  }

  async function refreshModalLead() {
    await fetchLeads();
    if (selectedLead) {
      try {
        const response = await fetch(`/api/company/${company.slug}/leads`);
        const data = await response.json();
        const updatedLead = data.leads.find((l: any) => l.id === selectedLead.id);
        if (updatedLead) {
          setSelectedLead(updatedLead);
        }
      } catch (error) {
        console.error('Failed to refresh modal lead:', error);
      }
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#0f172a' }}>
        <div className="text-center">
          <div className="animate-spin text-6xl mb-4">⏳</div>
          <p className="text-white text-xl font-semibold">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Filter leads
  let filteredLeads = allLeads.filter(lead => {
    const matchesSearch = searchQuery === '' || 
      lead.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.phone?.includes(searchQuery);
    
    const matchesStatus = filterStatus === 'all' || (lead.status || 'new') === filterStatus;
    const matchesCategory = filterCategory === 'all' || lead.category === filterCategory;
    
    // Time filter
    const leadDate = new Date(lead.created_at);
    const now = new Date();
    let matchesTime = true;
    
    // Custom date range filter (overrides preset filters)
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999); // Include entire end date
      matchesTime = leadDate >= start && leadDate <= end;
    } else if (startDate) {
      const start = new Date(startDate);
      matchesTime = leadDate >= start;
    } else if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      matchesTime = leadDate <= end;
    } else if (timeFilter === 'today') {
      const todayStart = new Date(now.setHours(0, 0, 0, 0));
      matchesTime = leadDate >= todayStart;
    } else if (timeFilter === 'week') {
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - now.getDay());
      weekStart.setHours(0, 0, 0, 0);
      matchesTime = leadDate >= weekStart;
    } else if (timeFilter === 'month') {
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      matchesTime = leadDate >= monthStart;
    }
    
    return matchesSearch && matchesStatus && matchesCategory && matchesTime;
  });

  // Sort by date (newest first)
  filteredLeads.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  // 🔥 Group leads by time for CARDS view only
  const now = new Date();
  const todayStart = new Date(now.setHours(0, 0, 0, 0));
  const yesterdayStart = new Date(todayStart.getTime() - 24 * 60 * 60 * 1000);
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay());
  weekStart.setHours(0, 0, 0, 0);

  const todayLeads = filteredLeads.filter(l => new Date(l.created_at) >= todayStart);
  const yesterdayLeads = filteredLeads.filter(l => {
    const date = new Date(l.created_at);
    return date >= yesterdayStart && date < todayStart;
  });
  const thisWeekLeads = filteredLeads.filter(l => {
    const date = new Date(l.created_at);
    return date >= weekStart && date < yesterdayStart;
  });
  const olderLeads = filteredLeads.filter(l => new Date(l.created_at) < weekStart);

  const categories = [...new Set(allLeads.map(l => l.category))];
  const statusCounts = statusOptions.reduce((acc, status) => {
    acc[status.value] = allLeads.filter(l => (l.status || statusOptions[0].value) === status.value).length;
    return acc;
  }, {} as Record<string, number>);

  // 🔥 Render function for CARDS - with grouping
  const renderLeadGroupCards = (leads: any[], title: string) => {
    if (leads.length === 0) return null;
    
    return (
      <div className="mb-8" key={`${title}-cards-${refreshKey}`}>
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          {title}
          <span className="text-white/60 text-base">({leads.length})</span>
        </h3>
        <CardsView leads={leads} onSelectLead={setSelectedLead} />
      </div>
    );
  };

  return (
    <div className="min-h-screen relative" style={{ background: 'linear-gradient(to bottom right, #1e293b, #0f172a, #020617)' }}>
      <Toaster position="top-right" />
      
      {/* TRIAL BANNER */}
      <div className="relative z-10">
        <TrialBanner 
          subscriptionStatus={company.subscription_status || 'inactive'}
          trialEndsAt={company.trial_ends_at || null}
          companySlug={company.slug}
        />
      </div>
      
      {/* Overlay when sidebar is open */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar */}
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
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 relative z-10">
        
        {/* TOP BAR WITH MENU BUTTON */}
        <div className="bg-white/10 backdrop-blur-xl rounded-xl p-4 sm:p-6 mb-6 border border-white/20 relative z-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              {/* Menu Toggle Button */}
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2.5 bg-white/10 hover:bg-white/20 rounded-lg transition text-white border border-white/20"
                aria-label="Toggle menu"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>

              {company.logo_url ? (
                <img 
                  src={company.logo_url} 
                  alt={`${company.name} logo`}
                  className="h-10 sm:h-12 w-auto object-contain"
                />
              ) : (
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center text-white font-bold text-lg sm:text-xl flex-shrink-0 shadow-lg shadow-purple-500/20">
                  {company.name.charAt(0)}
                </div>
              )}
              <h1 className="text-xl sm:text-2xl font-bold text-white">{company.name}</h1>
            </div>
            
            <div className="flex items-center gap-3">
              <a
                href={`/${company.slug}`}
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg font-semibold transition shadow-lg shadow-purple-600/20 flex items-center gap-2"
              >
                ➕ Create
              </a>
            </div>
          </div>
        </div>

        {/* SEARCH BAR */}
        <div className="mb-6 flex gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="🔍 Search by name, email, or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-6 py-4 rounded-xl bg-white/10 backdrop-blur-xl border-2 border-white/20 focus:border-purple-500 focus:outline-none text-white placeholder-white/60 text-base sm:text-lg font-medium shadow-lg"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/60 hover:text-white text-xl font-bold"
              >
                ✕
              </button>
            )}
          </div>
          
          <button
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className="px-4 py-2 text-sm rounded-lg bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 font-semibold transition flex items-center gap-2 whitespace-nowrap"
          >
            🎛️ More
            <span className={`transition-transform ${showAdvancedFilters ? 'rotate-180' : ''}`}>▼</span>
          </button>
        </div>

        {/* FILTERS */}
        <div className="flex flex-col sm:flex-row justify-end gap-2 mb-6">
          <select
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value as any)}
            className="px-3 py-1.5 text-sm rounded-lg bg-slate-800 text-white border border-slate-700 font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer"
          >
            <option value="today" className="text-gray-900">📅 Today</option>
            <option value="week" className="text-gray-900">📅 This Week</option>
            <option value="month" className="text-gray-900">📅 This Month</option>
            <option value="all" className="text-gray-900">📅 All Time</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-1.5 text-sm rounded-lg bg-slate-800 text-white border border-slate-700 font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer"
          >
            <option value="all" className="text-gray-900">All Statuses</option>
            {statusOptions.map(status => (
              <option key={status.value} value={status.value} className="text-gray-900">
                {status.emoji} {status.label} ({statusCounts[status.value] || 0})
              </option>
            ))}
          </select>
        </div>

        {/* ADVANCED FILTERS */}
        {showAdvancedFilters && (
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-lg p-4 mb-6 border border-slate-700">
            <div className="flex flex-col md:flex-row items-stretch md:items-end gap-4">
              <div className="flex-1">
                <label className="block text-xs font-semibold text-white/80 mb-1.5">Category</label>
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg bg-slate-800 text-white border border-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="all" className="text-gray-900">All Categories</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat} className="text-gray-900">{cat}</option>
                  ))}
                </select>
              </div>

              <div className="flex-1">
                <label className="block text-xs font-semibold text-white/80 mb-1.5">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg bg-slate-800 text-white border border-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="flex-1">
                <label className="block text-xs font-semibold text-white/80 mb-1.5">End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg bg-slate-800 text-white border border-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <button
                onClick={() => {
                  setSearchQuery('');
                  setFilterCategory('all');
                  setFilterStatus('all');
                  setTimeFilter('all');
                  setStartDate('');
                  setEndDate('');
                }}
                className="px-3 py-2 text-sm bg-red-500/20 hover:bg-red-500/30 text-red-200 rounded-lg font-semibold transition border border-red-500/30 whitespace-nowrap"
              >
                Clear All
              </button>
            </div>
          </div>
        )}

        {/* LEADS VIEW */}
        <div>
          {filteredLeads.length === 0 ? (
            <div className="bg-white/10 backdrop-blur-xl rounded-xl p-12 text-center border border-white/20">
              <div className="text-6xl mb-4">📋</div>
              <h3 className="text-2xl font-bold text-white mb-2">No leads yet</h3>
              <p className="text-white/70 mb-6">Share your form link to start receiving leads</p>
              <a
                href={`/${company.slug}`}
                className="inline-block px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold rounded-lg transition shadow-lg shadow-purple-600/20"
              >
                ➕ Create Your First Lead
              </a>
            </div>
          ) : (
            <>
              {/* 🔥 CARDS VIEW - Show grouped by time */}
              {currentView === 'cards' && (
                <div className="lg:block">
                  {renderLeadGroupCards(todayLeads, '🌟 Today')}
                  {renderLeadGroupCards(yesterdayLeads, '📅 Yesterday')}
                  {renderLeadGroupCards(thisWeekLeads, '📆 Earlier This Week')}
                  {renderLeadGroupCards(olderLeads, '📂 Older')}
                </div>
              )}

              {/* 🔥 TABLE VIEW - Show ALL in one table, no grouping */}
              {currentView === 'table' && (
                <div key={`table-${refreshKey}`}>
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      All Leads
                      <span className="text-white/60 text-base">({filteredLeads.length})</span>
                    </h3>
                    
                    {/* 🔥 CSV Export Button */}
                    <a
                      href={`/api/company/${company.slug}/export-csv?${new URLSearchParams({
                        status: filterStatus,
                        time: timeFilter,
                        category: filterCategory,
                        search: searchQuery
                      }).toString()}`}
                      download={`${company.slug}_${new Date().toISOString().split('T')[0]}.csv`}
                      className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg font-semibold transition border border-white/20"
                    >
                      📊 Export CSV
                    </a>
                  </div>
                  <TableView leads={filteredLeads} onSelectLead={setSelectedLead} />
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* LEAD MODAL */}
      {selectedLead && (
        <LeadModal
          lead={selectedLead}
          onClose={() => setSelectedLead(null)}
          onUpdateStatus={updateLeadStatus}
          onAddNote={addNote}
          onDeleteLead={deleteLead}
          onRefresh={refreshModalLead}
          currentUser={currentUser}
          statusOptions={statusOptions}
        />
      )}
    </div>
  );
}