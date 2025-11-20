'use client';

import { useState, useEffect } from 'react';
import AIAnalysis from '@/components/dashboard/AIAnalysis';
import CardsView from '@/components/dashboard/views/CardsView';
import TableView from '@/components/dashboard/views/TableView';
import ViewSwitcher from '@/components/dashboard/ViewSwitcher';
import { safeJSONParse, parseNotes } from '@/lib/utils';
import styles from './dashboard.module.css';

export default function DashboardPage() {
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

  useEffect(() => {
    fetchLeads();
  }, []);

  async function fetchLeads() {
    try {
      const response = await fetch('/api/leads?limit=500');
      const data = await response.json();
      setAllLeads(data.leads || []);
    } catch (error) {
      console.error('Failed to fetch leads:', error);
    } finally {
      setLoading(false);
    }
  }

  async function updateLeadStatus(id: number, status: string) {
    try {
      const response = await fetch('/api/leads/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status })
      });
      
      const result = await response.json();
      
      if (response.ok && result.success) {
        setAllLeads(leads => leads.map(l => 
          l.id === id ? { ...l, status } : l
        ));
        if (selectedLead?.id === id) {
          setSelectedLead({ ...selectedLead, status });
        }
        return true;
      } else {
        alert('Failed to save changes. Please try again.');
        return false;
      }
    } catch (error) {
      alert('Failed to save changes. Please try again.');
      return false;
    }
  }

  async function addNote(id: number, noteText: string) {
    try {
      const response = await fetch('/api/leads/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, notes: noteText, action: 'add_note' })
      });
      
      const result = await response.json();
      
      if (response.ok && result.success) {
        await fetchLeads();
        
        const updatedLeads = await fetch('/api/leads?limit=500').then(r => r.json());
        const updatedLead = updatedLeads.leads?.find((l: any) => l.id === id);
        
        if (updatedLead) {
          setSelectedLead(updatedLead);
          setAllLeads(updatedLeads.leads || []);
        }
        
        return true;
      } else {
        alert('Failed to add note. Please try again.');
        return false;
      }
    } catch (error) {
      alert('Failed to add note. Please try again.');
      return false;
    }
  }

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className="animate-spin text-6xl mb-4">⏳</div>
        <p className={styles.loadingText}>Loading your dashboard...</p>
      </div>
    );
  }

  // Filter leads
  let filteredLeads = allLeads.filter(lead => {
    const matchesSearch = searchQuery === '' || 
      lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.phone.includes(searchQuery);
    
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

  // Sort leads
  filteredLeads.sort((a, b) => {
    if (sortBy === 'date') {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    } else if (sortBy === 'urgency') {
      const urgencyOrder = { 'Emergency': 0, 'High Priority': 1, 'Normal': 2, 'Low Priority': 3 };
      const aAnalysis = safeJSONParse(a.ai_analysis);
      const bAnalysis = safeJSONParse(b.ai_analysis);
      const aUrgency = urgencyOrder[aAnalysis?.urgency as keyof typeof urgencyOrder] ?? 2;
      const bUrgency = urgencyOrder[bAnalysis?.urgency as keyof typeof urgencyOrder] ?? 2;
      return aUrgency - bUrgency;
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

  // Calculate stats
  const emergencyLeads = allLeads.filter(l => {
    const analysis = safeJSONParse(l.ai_analysis);
    return analysis?.urgency === 'Emergency';
  }).length;
  
  const highPriorityLeads = allLeads.filter(l => {
    const analysis = safeJSONParse(l.ai_analysis);
    return analysis?.urgency === 'High Priority';
  }).length;

  const statusCounts = {
    new: allLeads.filter(l => (l.status || 'new') === 'new').length,
    contacted: allLeads.filter(l => l.status === 'contacted').length,
    quoted: allLeads.filter(l => l.status === 'quoted').length,
    completed: allLeads.filter(l => l.status === 'completed').length,
  };

  const categories = [...new Set(allLeads.map(l => l.category))];

  const clearDateFilter = () => {
    setDateFrom('');
    setDateTo('');
  };

  return (
    <div className={styles.container}>
      <div className={styles.innerContainer}>
        {/* Header with View Switcher */}
        <div className={styles.header}>
          <div className="flex items-center justify-between w-full">
            <div>
              <h1 className={styles.title}>Contractor Dashboard</h1>
              <p className={styles.subtitle}>Manage your leads and AI-powered insights</p>
            </div>
            <ViewSwitcher currentView={currentView} onViewChange={setCurrentView} />
          </div>
        </div>

        {/* Stats Bar */}
        <div className={styles.statsBar}>
          <div className={styles.statCard}>
            <p className={styles.statLabel}>New (24h)</p>
            <p className={styles.statValue}>{newLeads.length}</p>
          </div>
          <div className={styles.statCard}>
            <p className={styles.statLabel}>🚨 Emergency</p>
            <p className={styles.statValue}>{emergencyLeads}</p>
          </div>
          <div className={styles.statCard}>
            <p className={styles.statLabel}>⚠️ High Priority</p>
            <p className={styles.statValue}>{highPriorityLeads}</p>
          </div>
          <div className={styles.statCard}>
            <p className={styles.statLabel}>✅ Completed</p>
            <p className={styles.statValue}>{statusCounts.completed}</p>
          </div>
          <div className={styles.statCard}>
            <p className={styles.statLabel}>Total Leads</p>
            <p className={styles.statValue}>{allLeads.length}</p>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="bg-white/10 backdrop-blur rounded-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
            {/* Search */}
            <div>
              <label className="block text-white text-sm font-semibold mb-2">Search</label>
              <input
                type="text"
                placeholder="Name, email, phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 rounded-lg bg-white/20 text-white placeholder-white/50 border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/50"
              />
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-white text-sm font-semibold mb-2">Category</label>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full px-4 py-2 rounded-lg bg-white/20 text-white border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/50"
              >
                <option value="all">All Categories</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-white text-sm font-semibold mb-2">Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-4 py-2 rounded-lg bg-white/20 text-white border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/50"
              >
                <option value="all">All Status</option>
                <option value="new">New ({statusCounts.new})</option>
                <option value="contacted">Contacted ({statusCounts.contacted})</option>
                <option value="quoted">Quoted ({statusCounts.quoted})</option>
                <option value="completed">Completed ({statusCounts.completed})</option>
              </select>
            </div>

            {/* Sort */}
            <div>
              <label className="block text-white text-sm font-semibold mb-2">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-4 py-2 rounded-lg bg-white/20 text-white border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/50"
              >
                <option value="date">Most Recent</option>
                <option value="urgency">Urgency</option>
              </select>
            </div>
          </div>

          {/* Date Range Filter */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-white text-sm font-semibold mb-2">From Date</label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-full px-4 py-2 rounded-lg bg-white/20 text-white border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/50"
              />
            </div>
            <div>
              <label className="block text-white text-sm font-semibold mb-2">To Date</label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-full px-4 py-2 rounded-lg bg-white/20 text-white border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/50"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={clearDateFilter}
                className="w-full px-4 py-2 rounded-lg bg-white/20 text-white hover:bg-white/30 font-semibold transition"
              >
                Clear Date Filter
              </button>
            </div>
          </div>

          {(dateFrom || dateTo) && (
            <div className="mt-3 text-white text-sm">
              📅 Showing leads {dateFrom && `from ${new Date(dateFrom).toLocaleDateString()}`} {dateTo && `to ${new Date(dateTo).toLocaleDateString()}`}
            </div>
          )}
        </div>

        {/* NEW LEADS SECTION */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm">NEW</span>
              Last 24 Hours
            </h2>
            <p className="text-white/80">{newLeads.length} lead{newLeads.length !== 1 ? 's' : ''}</p>
          </div>

          {newLeads.length > 0 ? (
            currentView === 'cards' ? (
              <CardsView leads={newLeads} onSelectLead={setSelectedLead} />
            ) : (
              <TableView leads={newLeads} onSelectLead={setSelectedLead} />
            )
          ) : (
            <div className="bg-white/10 backdrop-blur rounded-lg p-8 text-center">
              <p className="text-white/80">No new leads matching filters</p>
            </div>
          )}
        </div>

        {/* PREVIOUS LEADS SECTION */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              📂 Previous Leads
            </h2>
            <div className="flex gap-2">
              <button
                onClick={() => setShowPreviousDays(7)}
                className={`px-4 py-2 rounded-lg font-semibold transition ${
                  showPreviousDays === 7 
                    ? 'bg-white text-blue-600' 
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}
              >
                This Week
              </button>
              <button
                onClick={() => setShowPreviousDays(30)}
                className={`px-4 py-2 rounded-lg font-semibold transition ${
                  showPreviousDays === 30 
                    ? 'bg-white text-blue-600' 
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}
              >
                Last 30 Days
              </button>
              <button
                onClick={() => setShowPreviousDays(90)}
                className={`px-4 py-2 rounded-lg font-semibold transition ${
                  showPreviousDays === 90 
                    ? 'bg-white text-blue-600' 
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}
              >
                Last 90 Days
              </button>
              <button
                onClick={() => setShowPreviousDays(365)}
                className={`px-4 py-2 rounded-lg font-semibold transition ${
                  showPreviousDays === 365 
                    ? 'bg-white text-blue-600' 
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}
              >
                All Time
              </button>
            </div>
          </div>

          {previousLeads.length > 0 ? (
            currentView === 'cards' ? (
              <CardsView leads={previousLeads} onSelectLead={setSelectedLead} />
            ) : (
              <TableView leads={previousLeads} onSelectLead={setSelectedLead} />
            )
          ) : (
            <div className="bg-white/10 backdrop-blur rounded-lg p-8 text-center">
              <p className="text-white/80">No leads matching filters</p>
            </div>
          )}
        </div>

        {allLeads.length === 0 && (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>📋</div>
            <p className={styles.emptyTitle}>No leads yet</p>
            <p className={styles.emptyText}>
              Leads will appear here when customers submit photos
            </p>
          </div>
        )}
      </div>

      {/* Modal */}
      {selectedLead && (
        <LeadModal
          lead={selectedLead}
          onClose={() => setSelectedLead(null)}
          onUpdateStatus={updateLeadStatus}
          onAddNote={addNote}
          onRefresh={fetchLeads}
        />
      )}
    </div>
  );
}

// Lead Modal Component
function LeadModal({ lead, onClose, onUpdateStatus, onAddNote, onRefresh }: any) {
  const [status, setStatus] = useState(lead.status || 'new');
  const [newNote, setNewNote] = useState('');
  const [saving, setSaving] = useState(false);

  const notesArray = parseNotes(lead.notes);

  const handleStatusChange = async () => {
    if (status === (lead.status || 'new')) return;
    
    setSaving(true);
    const success = await onUpdateStatus(lead.id, status);
    setSaving(false);
    if (success) {
      alert('✅ Status updated!');
    }
  };

  const handleAddNote = async () => {
    if (!newNote.trim()) return;
    
    setSaving(true);
    const success = await onAddNote(lead.id, newNote);
    setSaving(false);
    
    if (success) {
      setNewNote('');
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
    <div
      className={styles.modalOverlay}
      onClick={onClose}
    >
      <div
        className={styles.modal}
        onClick={(e) => e.stopPropagation()}
      >
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
          <button
            onClick={onClose}
            className={styles.closeButton}
          >
            ×
          </button>
        </div>

        <div className={styles.modalContent}>
          {/* Status Management */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Status</h3>
            <div className="flex gap-3 items-center">
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="new">🆕 New</option>
                <option value="contacted">📞 Contacted</option>
                <option value="quoted">💰 Quoted</option>
                <option value="in-progress">🔨 In Progress</option>
                <option value="completed">✅ Completed</option>
                <option value="lost">❌ Lost</option>
              </select>
              <button
                onClick={handleStatusChange}
                disabled={saving || status === (lead.status || 'new')}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? '...' : 'Update'}
              </button>
            </div>
          </div>

          {/* Notes Thread */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Notes ({notesArray.length})</h3>
            
            {/* Add Note */}
            <div className="mb-4">
              <textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Add a note about this lead..."
                rows={3}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
              />
              <button
                onClick={handleAddNote}
                disabled={saving || !newNote.trim()}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? '💾 Adding...' : '➕ Add Note'}
              </button>
            </div>

            {/* Notes List */}
            {notesArray.length > 0 ? (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {[...notesArray].reverse().map((note: any, idx: number) => (
                  <div key={idx} className="bg-gray-50 p-4 rounded-lg border-l-4 border-blue-500">
                    <p className="text-gray-800 mb-2">{note.text}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(note.timestamp).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-gray-50 p-8 rounded-lg text-center text-gray-500">
                No notes yet. Add one above!
              </div>
            )}
          </div>

          {/* Contact Information */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Contact Information</h3>
            
            {/* Quick Contact Buttons */}
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => {
                  const subject = encodeURIComponent(`Re: Your ${lead.category} Project`);
                  const body = encodeURIComponent(
                    `Hi ${lead.name},\n\nThank you for reaching out! I've reviewed your photos and would love to discuss your project.\n\nWhen would be a good time for a quick call?\n\nBest regards`
                  );
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
                  const message = encodeURIComponent(`Hi ${lead.name}, I reviewed your ${lead.category} project photos and would love to discuss. When's a good time to talk?`);
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
              <h3 className={styles.sectionTitle}>Customer Description</h3>
              <div className={styles.description}>
                {lead.description}
              </div>
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
                    <img 
                      src={file.url} 
                      alt={`Upload ${idx + 1}`}
                      className={styles.photo}
                    />
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
                      <p className="text-xs text-gray-500">Click to view</p>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}

          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>AI Analysis</h3>
            {aiAnalysis ? (
              <AIAnalysis analysis={aiAnalysis} />
            ) : (
              <div className={styles.noAnalysis}>
                No AI analysis available
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
