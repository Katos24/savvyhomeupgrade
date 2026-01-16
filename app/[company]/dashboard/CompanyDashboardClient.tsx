'use client';

import { useState, useEffect } from 'react';
import AIAnalysis from '@/components/dashboard/AIAnalysis';
import CardsView from '@/components/dashboard/views/CardsView';
import TableView from '@/components/dashboard/views/TableView';
import ViewSwitcher from '@/components/dashboard/ViewSwitcher';
import { safeJSONParse, parseNotes } from '@/lib/utils';
import styles from '@/app/dashboard/dashboard.module.css';
import { Toaster, toast } from 'sonner';


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

// Default statuses if company doesn't have custom ones
const DEFAULT_STATUSES: StatusOption[] = [
  { value: 'new', label: 'New', color: 'blue', emoji: '🆕' },
  { value: 'contacted', label: 'Contacted', color: 'yellow', emoji: '📞' },
  { value: 'quoted', label: 'Quoted', color: 'purple', emoji: '💰' },
  { value: 'in-progress', label: 'In Progress', color: 'orange', emoji: '🔨' },
  { value: 'completed', label: 'Completed', color: 'green', emoji: '✅' },
];

export default function CompanyDashboardClient({ company }: { company: Company }) {
  const [allLeads, setAllLeads] = useState<any[]>([]);
  const [selectedLead, setSelectedLead] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState<'cards' | 'table'>('cards');
  const [showPreviousDays, setShowPreviousDays] = useState(7);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Get status options from company or use defaults
  const statusOptions = company.status_options && company.status_options.length > 0 
    ? company.status_options 
    : DEFAULT_STATUSES;

  useEffect(() => {
    fetchLeads();
    fetchCurrentUser();
  }, []);

  async function fetchLeads() {
    try {
      const response = await fetch(`/api/company/${company.slug}/leads`);
      const data = await response.json();
      // Filter out deleted leads (only show active leads)
      setAllLeads((data.leads || []).filter((l: any) => !l.deleted));
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

  async function createLead(leadData: any) {
    try {
      const response = await fetch('/api/leads/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...leadData,
          company_id: company.id,
          company_slug: company.slug
        })
      });
      
      const result = await response.json();
      
      if (response.ok && result.success) {
        await fetchLeads();
        return true;
      } else {
        alert('Failed to create lead.');
        return false;
      }
    } catch (error) {
      alert('Failed to create lead.');
      return false;
    }
  }

  async function updateLeadStatus(id: number, status: string, oldStatus: string) {
    try {
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
      
      if (response.ok && result.success) {
        // Refresh ALL leads to get updated data
        await fetchLeads();
        
        // Get fresh lead data to update modal
        const updatedResponse = await fetch(`/api/company/${company.slug}/leads`);
        const updatedData = await updatedResponse.json();
        const updatedLead = updatedData.leads.find((l: any) => l.id === id);
        
        if (updatedLead && selectedLead?.id === id) {
          setSelectedLead(updatedLead); // Refresh modal with new data
        }
        
        return true;
      } else {
        alert('Failed to save changes.');
        return false;
      }
    } catch (error) {
      console.error('Update status error:', error);
      alert('Failed to save changes.');
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
        // Refresh ALL leads
        await fetchLeads();
        
        // Get fresh lead data to update modal
        const updatedResponse = await fetch(`/api/company/${company.slug}/leads`);
        const updatedData = await updatedResponse.json();
        const updatedLead = updatedData.leads.find((l: any) => l.id === id);
        
        if (updatedLead) {
          setSelectedLead(updatedLead); // Refresh modal with new data
        }
        
        return true;
      } else {
        alert('Failed to add note.');
        return false;
      }
    } catch (error) {
      console.error('Add note error:', error);
      alert('Failed to add note.');
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
        alert('Failed to delete lead.');
        return false;
      }
    } catch (error) {
      console.error('Delete lead error:', error);
      alert('Failed to delete lead.');
      return false;
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

  let filteredLeads = allLeads.filter(lead => {
    const matchesSearch = searchQuery === '' || 
      lead.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.phone?.includes(searchQuery);
    
    const matchesCategory = filterCategory === 'all' || lead.category === filterCategory;
    const matchesStatus = filterStatus === 'all' || (lead.status || 'new') === filterStatus;
    
    let matchesDateRange = true;
    if (dateFrom || dateTo) {
      const leadDate = new Date(lead.created_at);
      if (dateFrom) {
        const fromDate = new Date(dateFrom);
        fromDate.setHours(0, 0, 0, 0);
        matchesDateRange = matchesDateRange && leadDate >= fromDate;
      }
      if (dateTo) {
        const toDate = new Date(dateTo);
        toDate.setHours(23, 59, 59, 999);
        matchesDateRange = matchesDateRange && leadDate <= toDate;
      }
    }
    
    return matchesSearch && matchesCategory && matchesStatus && matchesDateRange;
  });

  filteredLeads.sort((a, b) => {
    if (sortBy === 'date') {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
    return 0;
  });

  const now = new Date();
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);
  
  const cutoffDate = showPreviousDays === 7 ? startOfWeek : 
                     new Date(now.getTime() - showPreviousDays * 24 * 60 * 60 * 1000);

  const newLeads = filteredLeads.filter(l => new Date(l.created_at) > yesterday);
  const previousLeads = filteredLeads.filter(l => {
    const date = new Date(l.created_at);
    return date <= yesterday && date >= cutoffDate;
  });

  const statusCounts = statusOptions.reduce((acc, status) => {
    acc[status.value] = allLeads.filter(l => (l.status || statusOptions[0].value) === status.value).length;
    return acc;
  }, {} as Record<string, number>);

  const categories = [...new Set(allLeads.map(l => l.category))];

  const clearDateFilter = () => {
    setDateFrom('');
    setDateTo('');
  };

  const renderLeads = (leads: any[]) => {
    if (leads.length === 0) {
      return (
        <div className="bg-white/10 backdrop-blur rounded-lg p-8 text-center">
          <p className="text-white/80">No leads matching filters</p>
        </div>
      );
    }

    return (
      <>
        <div className="lg:hidden">
          <CardsView leads={leads} onSelectLead={setSelectedLead} />
        </div>
        <div className="hidden lg:block">
          {currentView === 'cards' ? (
            <CardsView leads={leads} onSelectLead={setSelectedLead} />
          ) : (
            <TableView leads={leads} onSelectLead={setSelectedLead} />
          )}
        </div>
      </>
    );
  };

  return (
    <div className={styles.container}>
      <Toaster position="top-right" />
      <div className={styles.innerContainer}>
        {/* HEADER WITH LOGO */}
        <div className={styles.header}>
          <div className="flex items-center justify-between w-full">
            {/* LEFT: Logo + Company Name */}
            <div className="flex items-center gap-4">
              {company.logo_url ? (
                <img 
                  src={company.logo_url} 
                  alt={`${company.name} logo`}
                  className="h-12 w-auto object-contain"
                />
              ) : (
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center text-white font-bold text-xl">
                  {company.name.charAt(0)}
                </div>
              )}
              <h1 className={styles.title}>{company.name}</h1>
            </div>
            
            {/* RIGHT: Create Lead + User Info Box */}
            <div className="flex items-center gap-3">
              <a
                href={`/${company.slug}/dashboard/deleted-leads`}
                className="bg-red-500/20 hover:bg-red-500/30 text-white px-4 py-2 rounded-lg font-semibold transition border border-red-500/30 flex items-center gap-2"
              >
                🗑️ Deleted
              </a>
              
              <a
                href={`/${company.slug}`}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold transition shadow-lg flex items-center gap-2"
              >
                ➕ Create Lead
              </a>
              
              {currentUser && (
                <div className="bg-white/10 backdrop-blur rounded-lg p-3 border border-white/20">
                  <p className="text-sm font-semibold text-white mb-1">{currentUser.name}</p>
                  <button
                    onClick={handleLogout}
                    className="w-full px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-white rounded text-sm font-semibold transition border border-red-500/30"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* COMBINED SEARCH + STATS BAR */}
        <div className="bg-white/10 backdrop-blur rounded-xl p-4 mb-8">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            {/* Quick Search - FIRST */}
            <div className="flex-1 lg:max-w-md w-full">
              <div className="relative">
                <input
                  type="text"
                  placeholder="🔍 Quick search by name, email, or phone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-white/90 backdrop-blur border-2 border-white/50 focus:border-white focus:outline-none text-gray-900 placeholder-gray-500"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            {/* Stats - Condensed */}
            <div className="flex flex-wrap gap-3">
              <div className="bg-white/20 backdrop-blur px-4 py-2 rounded-lg">
                <p className="text-xs text-white/70">New (24h)</p>
                <p className="text-xl font-bold text-white">{newLeads.length}</p>
              </div>
            </div>

            {/* Advanced Filters Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="bg-white/20 hover:bg-white/30 backdrop-blur text-white px-4 py-3 rounded-lg font-semibold transition flex items-center gap-2 border border-white/30"
            >
              <span>🎛️</span>
              <span className="hidden sm:inline">Filters</span>
              <span className={`transition-transform ${showFilters ? 'rotate-180' : ''}`}>▼</span>
            </button>
          </div>
        </div>

        {/* COLLAPSIBLE ADVANCED FILTERS */}
        {showFilters && (
          <div className="bg-white/10 backdrop-blur rounded-xl p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">Advanced Filters</h3>
              <a
                href={`/api/company/${company.slug}/export-csv`}
                download
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-semibold transition shadow-lg flex items-center gap-2"
              >
                📊 Export CSV
              </a>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div>
                <label className={styles.filterLabel}>Category</label>
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className={styles.filterSelect}
                >
                  <option value="all">All Categories</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className={styles.filterLabel}>Status</label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className={styles.filterSelect}
                >
                  <option value="all">All Statuses</option>
                  {statusOptions.map(status => (
                    <option key={status.value} value={status.value}>
                      {status.emoji} {status.label} ({statusCounts[status.value] || 0})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={styles.filterLabel}>Sort By</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className={styles.filterSelect}
                >
                  <option value="date">Most Recent</option>
                </select>
              </div>

              <div>
                <label className={styles.filterLabel}>Date Range</label>
                <div className="flex gap-2">
                  <input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className={styles.filterInput}
                    placeholder="From"
                  />
                  <input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className={styles.filterInput}
                    placeholder="To"
                  />
                </div>
              </div>
            </div>

            {/* Clear Filters */}
            {(searchQuery || filterCategory !== 'all' || filterStatus !== 'all' || dateFrom || dateTo || sortBy !== 'date') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setFilterCategory('all');
                  setFilterStatus('all');
                  setDateFrom('');
                  setDateTo('');
                  setSortBy('date');
                }}
                className="bg-red-500/20 hover:bg-red-500/30 text-white px-4 py-2 rounded-lg font-semibold transition border border-red-500/30 flex items-center gap-2"
              >
                🗑️ Clear All Filters
              </button>
            )}
          </div>
        )}

        {/* LEADS SECTION - UNIFIED */}
        <div>
          <div className="flex items-start justify-between mb-6">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              📂 All Leads
            </h2>
            
            {/* Right side: Duration filters with View Switcher below */}
            <div className="flex flex-col items-end gap-2">
              {/* Duration Filters */}
              <div className="flex flex-wrap gap-2">
                {[1, 7, 30, 90, 365].map(days => (
                  <button
                    key={days}
                    onClick={() => setShowPreviousDays(days)}
                    className={`px-3 sm:px-4 py-2 rounded-lg font-semibold transition text-sm ${
                      showPreviousDays === days ? 'bg-white text-blue-600' : 'bg-white/20 text-white hover:bg-white/30'
                    }`}
                  >
                    {days === 1 ? 'Today' : days === 7 ? 'Week' : days === 30 ? '30d' : days === 90 ? '90d' : 'All'}
                  </button>
                ))}
              </div>
              
              {/* View Switcher - Condensed Row */}
              <div className="hidden lg:block">
                <ViewSwitcher currentView={currentView} onViewChange={setCurrentView} />
              </div>
            </div>
          </div>
          
          {renderLeads(filteredLeads.filter(l => {
            const date = new Date(l.created_at);
            const cutoff = showPreviousDays === 365 
              ? new Date(0) // Show all
              : new Date(now.getTime() - showPreviousDays * 24 * 60 * 60 * 1000);
            return date >= cutoff;
          }))}
        </div>

        {/* EMPTY STATE */}
        {allLeads.length === 0 && (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>📋</div>
            <p className={styles.emptyTitle}>No leads yet</p>
          </div>
        )}
      </div>

      {/* LEAD MODAL */}
      {selectedLead && (
        <LeadModal
          lead={selectedLead}
          onClose={() => setSelectedLead(null)}
          onUpdateStatus={updateLeadStatus}
          onAddNote={addNote}
          onDeleteLead={deleteLead}
          onRefresh={fetchLeads}
          currentUser={currentUser}
          statusOptions={statusOptions}
        />
      )}

      {/* CREATE LEAD MODAL */}
      {showCreateModal && (
        <CreateLeadModal
          onClose={() => setShowCreateModal(false)}
          onCreateLead={createLead}
          companyName={company.name}
        />
      )}
    </div>
  );
}

// CREATE LEAD MODAL
function CreateLeadModal({ onClose, onCreateLead, companyName }: any) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    category: '',
    description: ''
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.phone) {
      alert('Please fill in all required fields');
      return;
    }

    setSaving(true);
    const success = await onCreateLead(formData);
    setSaving(false);
    
    if (success) {
      alert('✅ Lead created!');
      onClose();
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()} style={{maxWidth: '600px'}}>
        <div className={styles.modalHeader}>
          <div>
            <h2 className={styles.modalTitle}>Create New Lead</h2>
            <p className={styles.modalDate}>{companyName}</p>
          </div>
          <button onClick={onClose} className={styles.closeButton}>×</button>
        </div>

        <div className={styles.modalContent}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Customer Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="John Smith"
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                placeholder="john@example.com"
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Phone <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                placeholder="(555) 123-4567"
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Service Category
              </label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                placeholder="e.g., Plumbing, Haircut, Car Repair"
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Description / Notes
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="What does the customer need?"
                rows={4}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-lg transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? '💾 Creating...' : '✅ Create Lead'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// LEAD MODAL  

function LeadModal({ lead, onClose, onUpdateStatus, onAddNote, onDeleteLead, onRefresh, currentUser, statusOptions }: any) {
  const [status, setStatus] = useState(lead.status || statusOptions[0].value);
  const [newNote, setNewNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const notesArray = parseNotes(lead.notes);

  const handleStatusChange = async () => {
    const oldStatus = lead.status || statusOptions[0].value;
    
    if (status === oldStatus) return;
    
    setSaving(true);
    const success = await onUpdateStatus(lead.id, status, oldStatus);
    setSaving(false);
    
    if (success) {
      toast.success('Status updated!');
      setStatus(status);
    } else {
      toast.error('Failed to update status');
    }
  };

  // Helper to get status config
  const getStatusConfig = (statusValue: string) => {
    return statusOptions.find((s: any) => s.value === statusValue) || statusOptions[0];
  };

  const currentStatusConfig = getStatusConfig(lead.status || statusOptions[0].value);

  const handleAddNote = async () => {
    if (!newNote.trim()) return;
    
    setSaving(true);
    const success = await onAddNote(lead.id, newNote);
    setSaving(false);
    
    if (success) {
      setNewNote('');
      toast.success('Note added!');
    } else {
      toast.error('Failed to add note');
    }
  };

  const handleDelete = async () => {
    setSaving(true);
    const success = await onDeleteLead(lead.id);
    setSaving(false);
    
    if (success) {
      toast.success('Lead deleted!');
      onClose(); // Close modal after deletion
    } else {
      toast.error('Failed to delete lead');
    }
  };

  const fileUrls = safeJSONParse(lead.file_urls);
  const aiAnalysis = safeJSONParse(lead.ai_analysis);
  
  const images = fileUrls?.filter((f: any) => 
    f.type?.startsWith('image/') || f.name?.match(/\.(jpg|jpeg|png|gif|webp)$/i)
  ) || [];
  
  const videos = fileUrls?.filter((f: any) => 
    f.type?.startsWith('video/') || f.name?.match(/\.(mp4|mov|avi|webm)$/i)
  ) || [];

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <div>
            <h2 className={styles.modalTitle}>{lead.name}</h2>
            <p className={styles.modalDate}>
              {new Date(lead.created_at).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
                hour: 'numeric',
                minute: '2-digit'
              })}
            </p>
          </div>
          <button onClick={onClose} className={styles.closeButton}>×</button>
        </div>

        <div className={styles.modalContent}>
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Status</h3>
            
            <div className="space-y-4">
              {/* Current Status Display */}
              <div>
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 block">Current</span>
                <div className={`inline-flex items-center px-4 py-2 rounded-lg font-semibold bg-${currentStatusConfig.color}-100 text-${currentStatusConfig.color}-800`}>
                  {currentStatusConfig.emoji && `${currentStatusConfig.emoji} `}{currentStatusConfig.label}
                </div>
              </div>

              {/* Update Status */}
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 block">
                  Change to
                </label>
                <div className="flex flex-col gap-3">
                  {/* Company's Configured Statuses Only */}
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 hover:border-gray-300 focus:border-blue-500 focus:outline-none bg-white text-gray-900 font-medium transition-all"
                  >
                    {statusOptions.map((statusOption: any) => (
                      <option key={statusOption.value} value={statusOption.value}>
                        {statusOption.emoji && `${statusOption.emoji} `}{statusOption.label}
                      </option>
                    ))}
                  </select>
                  
                  <button
                    onClick={handleStatusChange}
                    disabled={saving || status === (lead.status || statusOptions[0].value)}
                    className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all shadow-sm hover:shadow-md disabled:shadow-none"
                  >
                    {saving ? 'Saving...' : 'Update Status'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Activity Timeline ({notesArray.length})</h3>
            
            <div className="mb-4">
              <textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Add a note..."
                rows={3}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2 bg-white text-gray-900"
              />
              <button
                onClick={handleAddNote}
                disabled={saving || !newNote.trim()}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-lg transition disabled:opacity-50"
              >
                {saving ? '💾 Adding...' : '➕ Add Note'}
              </button>
            </div>

            {notesArray.length > 0 ? (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {[...notesArray].reverse().map((note: any, idx: number) => {
                  // Handle both old format (string) and new format (object)
                  const isOldFormat = typeof note === 'string';
                  const noteText = isOldFormat ? note : note.text;
                  const noteType = isOldFormat ? 'note' : note.type;
                  const userName = isOldFormat ? 'Unknown' : (note.user_name || 'System');
                  const timestamp = isOldFormat ? lead.created_at : note.timestamp;

                  return (
                    <div 
                      key={idx} 
                      className={`p-4 rounded-lg border-l-4 ${
                        noteType === 'status_change' 
                          ? 'bg-blue-50 border-blue-500' 
                          : 'bg-gray-50 border-gray-400'
                      }`}
                    >
                      {noteType === 'status_change' ? (
                        <div className="flex items-start gap-3">
                          <span className="text-2xl">📊</span>
                          <div className="flex-1">
                            <p className="text-gray-900 font-semibold text-sm">Status Changed</p>
                            <p className="text-gray-700 mt-1">
                              <span className="inline-block px-2 py-0.5 bg-gray-200 rounded text-xs mr-2">
                                {note.old_status}
                              </span>
                              →
                              <span className="inline-block px-2 py-0.5 bg-blue-200 rounded text-xs ml-2">
                                {note.new_status}
                              </span>
                            </p>
                            <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                              <span className="font-semibold">👤 {userName}</span>
                              <span>•</span>
                              <span>{new Date(timestamp).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                                hour: 'numeric',
                                minute: '2-digit'
                              })}</span>
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <p className="text-gray-800 mb-2 whitespace-pre-wrap">{noteText}</p>
                          <p className="text-xs text-gray-500 flex items-center gap-1">
                            <span className="font-semibold">👤 {userName}</span>
                            <span>•</span>
                            <span>{new Date(timestamp).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                              hour: 'numeric',
                              minute: '2-digit'
                            })}</span>
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-gray-50 p-8 rounded-lg text-center text-gray-500">
                No activity yet
              </div>
            )}
          </div>

          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Contact</h3>
            
            <div className="flex flex-col sm:flex-row gap-2 mb-4">
              <button
                onClick={() => {
                  const subject = encodeURIComponent(`Re: Your ${lead.category} Project`);
                  const body = encodeURIComponent(`Hi ${lead.name},\n\nThank you for reaching out!`);
                  window.location.href = `mailto:${lead.email}?subject=${subject}&body=${body}`;
                }}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition flex items-center justify-center gap-2"
              >
                📧 Email
              </button>
              <button
                onClick={() => window.location.href = `tel:${lead.phone}`}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg transition flex items-center justify-center gap-2"
              >
                📞 Call
              </button>
              <button
                onClick={() => {
                  const message = encodeURIComponent(`Hi ${lead.name}, I reviewed your project.`);
                  window.location.href = `sms:${lead.phone}?body=${message}`;
                }}
                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-4 rounded-lg transition flex items-center justify-center gap-2"
              >
                💬 Text
              </button>
            </div>

            <div className={styles.contactGrid}>
              <div className={styles.contactItem}>
                <span className={styles.contactLabel}>Email</span>
                <a href={`mailto:${lead.email}`} className={styles.contactValue + ' hover:underline'}>
                  {lead.email}
                </a>
              </div>
              <div className={styles.contactItem}>
                <span className={styles.contactLabel}>Phone</span>
                <a href={`tel:${lead.phone}`} className={styles.contactValue + ' hover:underline'}>
                  {lead.phone}
                </a>
              </div>
              <div className={styles.contactItem}>
                <span className={styles.contactLabel}>Category</span>
                <span className={styles.contactValue}>{lead.category}</span>
              </div>
            </div>
          </div>

          {lead.description && (
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>Description</h3>
              <div className={styles.description}>{lead.description}</div>
            </div>
          )}

          {images.length > 0 && (
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>Photos ({images.length})</h3>
              <div className={styles.photosGrid}>
                {images.map((file: any, idx: number) => (
                  <a 
                    key={idx}
                    href={file.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className={styles.photoLink}
                  >
                    <img src={file.url} alt={`Photo ${idx + 1}`} className={styles.photo} />
                  </a>
                ))}
              </div>
            </div>
          )}

          {videos.length > 0 && (
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>Videos ({videos.length})</h3>
              <div className={styles.photosGrid}>
                {videos.map((file: any, idx: number) => (
                  <a 
                    key={idx}
                    href={file.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className={styles.photoLink}
                  >
                    <div className="w-full h-48 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex flex-col items-center justify-center border-2 border-blue-200">
                      <div className="text-6xl mb-2">🎥</div>
                      <p className="text-sm font-medium text-gray-700">Video {idx + 1}</p>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* DANGER ZONE */}
          <div className="mt-8 pt-6 border-t-2 border-red-100">
            <h3 className="text-lg font-bold text-red-600 mb-2">🚨 Danger Zone</h3>
            <p className="text-sm text-gray-600 mb-4">
              Deleting this lead is permanent and cannot be undone.
            </p>
            
            {!showDeleteConfirm ? (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="w-full bg-red-50 hover:bg-red-100 text-red-700 font-semibold py-3 px-4 rounded-lg transition border-2 border-red-200 hover:border-red-300"
              >
                🗑️ Delete Lead
              </button>
            ) : (
              <div className="bg-red-50 p-4 rounded-lg border-2 border-red-300">
                <p className="font-bold text-red-800 mb-3">
                  Are you absolutely sure?
                </p>
                <p className="text-sm text-red-700 mb-4">
                  This will permanently delete <strong>{lead.name}</strong> and all associated data. This action cannot be undone.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={handleDelete}
                    disabled={saving}
                    className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-bold py-3 px-4 rounded-lg transition"
                  >
                    {saving ? 'Deleting...' : 'Yes, Delete Forever'}
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    disabled={saving}
                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-4 rounded-lg transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}