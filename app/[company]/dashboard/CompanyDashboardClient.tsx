'use client';

import { useState, useEffect } from 'react';
import CardsView from '@/components/dashboard/views/CardsView';
import TableView from '@/components/dashboard/views/TableView';
import LeadModal from '@/components/dashboard/LeadModal';
import { Toaster } from 'sonner';
import styles from '@/app/dashboard/dashboard.module.css';

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
  const [timeFilter, setTimeFilter] = useState<'today' | 'week' | 'month' | 'all'>('week');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [filterCategory, setFilterCategory] = useState('all');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [refreshKey, setRefreshKey] = useState(0);

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
      <div className={styles.loading}>
        <div className="animate-spin text-6xl mb-4">⏳</div>
        <p className={styles.loadingText}>Loading dashboard...</p>
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
    
    if (timeFilter === 'today') {
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
    <div className={styles.container}>
      <Toaster position="top-right" />
      <div className={styles.innerContainer}>
        
        {/* HEADER */}
        <div className="bg-white/10 backdrop-blur rounded-xl p-4 sm:p-6 mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">

              
              {company.logo_url ? (
                <img 
                  src={company.logo_url} 
                  alt={`${company.name} logo`}
                  className="h-10 sm:h-12 w-auto object-contain"
                />
              ) : (
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center text-white font-bold text-lg sm:text-xl flex-shrink-0">
                  {company.name.charAt(0)}
                </div>
              )}
              <h1 className="text-xl sm:text-2xl font-bold text-white">{company.name}</h1>
            </div>
            
            {currentUser && (
              <div className="flex items-center gap-3">
                 <a
      href={`/${company.slug}/admin/team`}
      className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition shadow-lg flex items-center gap-2"
                >
                  ⚙️ Admin
                </a>
                <a
                  href={`/${company.slug}`}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition shadow-lg flex items-center gap-2"
                >
                  ➕ Create Lead
                </a>
                <div className="bg-white/10 backdrop-blur rounded-lg px-4 py-2 border border-white/20">
                  <p className="text-sm font-semibold text-white">{currentUser.name}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-white rounded-lg font-semibold transition border border-red-500/30 text-sm"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>

        {/* SEARCH BAR */}
        <div className="mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="🔍 Search by name, email, or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-6 py-4 rounded-xl bg-white/90 backdrop-blur border-2 border-white/50 focus:border-white focus:outline-none text-gray-900 placeholder-gray-500 text-base sm:text-lg font-medium shadow-lg"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xl font-bold"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* VIEW TABS + FILTERS */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 px-3 py-2 bg-white/10 backdrop-blur rounded-lg border border-white/20">
              <span className="text-white/70 text-sm font-medium">View:</span>
              <div className="flex gap-1">
                <button
                  onClick={() => setCurrentView('cards')}
                  className={`px-3 py-1.5 rounded font-semibold transition text-sm ${
                    currentView === 'cards'
                      ? 'bg-white text-gray-900'
                      : 'text-white/80 hover:text-white hover:bg-white/10'
                  }`}
                >
                  ⬜ Cards
                </button>
                <button
                  onClick={() => setCurrentView('table')}
                  className={`px-3 py-1.5 rounded font-semibold transition text-sm ${
                    currentView === 'table'
                      ? 'bg-white text-gray-900'
                      : 'text-white/80 hover:text-white hover:bg-white/10'
                  }`}
                >
                  📊 Table
                </button>
              </div>
            </div>

            <a
              href={`/${company.slug}/dashboard/calendar`}
              className="px-4 sm:px-6 py-3 rounded-lg font-semibold transition bg-white/20 text-white hover:bg-white/30 border border-white/30 flex items-center gap-2"
            >
              📅 Calendar View
            </a>
          </div>

          <div className="flex flex-wrap gap-2">
            <select
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value as any)}
              className="px-4 py-2 rounded-lg bg-white/20 backdrop-blur text-white border border-white/30 font-semibold focus:outline-none focus:ring-2 focus:ring-white/50 cursor-pointer"
            >
              <option value="today" className="text-gray-900">📅 Today</option>
              <option value="week" className="text-gray-900">📅 This Week</option>
              <option value="month" className="text-gray-900">📅 This Month</option>
              <option value="all" className="text-gray-900">📅 All Time</option>
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 rounded-lg bg-white/20 backdrop-blur text-white border border-white/30 font-semibold focus:outline-none focus:ring-2 focus:ring-white/50 cursor-pointer"
            >
              <option value="all" className="text-gray-900">All Statuses</option>
              {statusOptions.map(status => (
                <option key={status.value} value={status.value} className="text-gray-900">
                  {status.emoji} {status.label} ({statusCounts[status.value] || 0})
                </option>
              ))}
            </select>

            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className="px-4 py-2 rounded-lg bg-white/20 hover:bg-white/30 backdrop-blur text-white border border-white/30 font-semibold transition flex items-center gap-2"
            >
              🎛️ More
              <span className={`transition-transform ${showAdvancedFilters ? 'rotate-180' : ''}`}>▼</span>
            </button>
          </div>
        </div>

        {/* ADVANCED FILTERS */}
        {showAdvancedFilters && (
          <div className="bg-white/10 backdrop-blur rounded-xl p-4 sm:p-6 mb-6">
            <h3 className="text-lg font-bold text-white mb-4">Advanced Filters</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-semibold text-white mb-2">Category</label>
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg bg-white/20 backdrop-blur text-white border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/50"
                >
                  <option value="all" className="text-gray-900">All Categories</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat} className="text-gray-900">{cat}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-end">
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setFilterCategory('all');
                    setFilterStatus('all');
                    setTimeFilter('week');
                  }}
                  className="w-full px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-white rounded-lg font-semibold transition border border-red-500/30"
                >
                  🗑️ Clear Filters
                </button>
              </div>
            </div>

            <a
              href={`/api/company/${company.slug}/export-csv`}
              download
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg font-semibold transition border border-white/30"
            >
              📊 Export CSV
            </a>
          </div>
        )}

        {/* LEADS VIEW */}
        <div>
          {filteredLeads.length === 0 ? (
            <div className="bg-white/10 backdrop-blur rounded-xl p-12 text-center">
              <div className="text-6xl mb-4">📋</div>
              <h3 className="text-2xl font-bold text-white mb-2">No leads yet</h3>
              <p className="text-white/70 mb-6">Share your form link to start receiving leads</p>
              <a
                href={`/${company.slug}`}
                className="inline-block px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg transition shadow-lg"
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
                <div className="hidden lg:block" key={`table-${refreshKey}`}>
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
                      className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg font-semibold transition border border-white/30"
                    >
                      📊 Export CSV
                    </a>
                  </div>
                  <TableView leads={filteredLeads} onSelectLead={setSelectedLead} />
                </div>
              )}

              {/* 🔥 MOBILE - Always show cards view */}
              <div className="lg:hidden">
                {renderLeadGroupCards(todayLeads, '🌟 Today')}
                {renderLeadGroupCards(yesterdayLeads, '📅 Yesterday')}
                {renderLeadGroupCards(thisWeekLeads, '📆 Earlier This Week')}
                {renderLeadGroupCards(olderLeads, '📂 Older')}
              </div>
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