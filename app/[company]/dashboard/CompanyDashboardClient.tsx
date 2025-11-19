'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

type Company = {
  id: number;
  name: string;
  slug: string;
};

type Lead = {
  id: number;
  name: string;
  email: string;
  phone: string;
  description: string;
  category: string;
  file_urls: any;
  status: string;
  created_at: string;
};

export default function CompanyDashboardClient({ company }: { company: Company }) {
  const router = useRouter();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [filteredLeads, setFilteredLeads] = useState<Lead[]>([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeads();
  }, []);

  useEffect(() => {
    filterLeads();
  }, [statusFilter, categoryFilter, dateFilter, searchQuery, leads]);

  const fetchLeads = async () => {
    try {
      const response = await fetch(`/api/company/${company.slug}/leads`);
      const data = await response.json();
      setLeads(data.leads || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterLeads = () => {
    let filtered = leads;

    if (statusFilter !== 'all') {
      filtered = filtered.filter(lead => lead.status === statusFilter);
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(lead => lead.category === categoryFilter);
    }

    if (dateFilter !== 'all') {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      filtered = filtered.filter(lead => {
        const leadDate = new Date(lead.created_at);
        switch (dateFilter) {
          case 'today': return leadDate >= today;
          case 'week':
            const weekAgo = new Date(today);
            weekAgo.setDate(weekAgo.getDate() - 7);
            return leadDate >= weekAgo;
          case 'month':
            const monthAgo = new Date(today);
            monthAgo.setMonth(monthAgo.getMonth() - 1);
            return leadDate >= monthAgo;
          default: return true;
        }
      });
    }

    if (searchQuery) {
      filtered = filtered.filter(lead =>
        lead.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.phone?.includes(searchQuery)
      );
    }

    setFilteredLeads(filtered);
  };

  const updateStatus = async (leadId: number, newStatus: string) => {
    try {
      await fetch('/api/leads', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadId, status: newStatus })
      });
      
      setLeads(leads.map(lead =>
        lead.id === leadId ? { ...lead, status: newStatus } : lead
      ));
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  const statusConfig = {
    new: { color: 'bg-gradient-to-r from-red-500 to-pink-500', lightColor: 'bg-red-50', icon: '🆕' },
    contacted: { color: 'bg-gradient-to-r from-yellow-500 to-orange-500', lightColor: 'bg-yellow-50', icon: '📞' },
    quoted: { color: 'bg-gradient-to-r from-blue-500 to-cyan-500', lightColor: 'bg-blue-50', icon: '💰' },
    won: { color: 'bg-gradient-to-r from-green-500 to-emerald-500', lightColor: 'bg-green-50', icon: '✅' },
    lost: { color: 'bg-gradient-to-r from-gray-400 to-gray-500', lightColor: 'bg-gray-50', icon: '❌' }
  };

  const categoryIcons: Record<string, string> = {
    roofing: '🏠', hvac: '❄️', plumbing: '🔧', electrical: '⚡',
    construction: '🏗️', painting: '🎨', flooring: '🪵', landscaping: '🌳', other: '📋'
  };

  const stats = {
    total: leads.length,
    new: leads.filter(l => l.status === 'new').length,
    contacted: leads.filter(l => l.status === 'contacted').length,
    won: leads.filter(l => l.status === 'won').length
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-6xl mb-4">⏳</div>
          <p className="text-xl text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      <header className="glass border-b sticky top-0 z-40 backdrop-blur-xl bg-white/70">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-sm">
              {company.name.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <h1 className="text-xl font-bold gradient-text">{company.name}</h1>
              <p className="text-xs text-gray-500">Lead Dashboard</p>
            </div>
          </div>
          <div className="flex gap-4 items-center">
            <a href={`/${company.slug}`} className="text-sm text-gray-600 hover:text-gray-900">View Form</a>
            <button onClick={handleLogout} className="text-sm text-red-600 hover:text-red-700 font-medium">Logout</button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-4xl">📊</span>
              <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{stats.total}</p>
            </div>
            <p className="text-sm font-medium text-gray-600">Total Leads</p>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-red-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-4xl">🆕</span>
              <p className="text-3xl font-bold text-red-600">{stats.new}</p>
            </div>
            <p className="text-sm font-medium text-gray-600">New</p>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-yellow-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-4xl">📞</span>
              <p className="text-3xl font-bold text-yellow-600">{stats.contacted}</p>
            </div>
            <p className="text-sm font-medium text-gray-600">Contacted</p>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-green-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-4xl">✅</span>
              <p className="text-3xl font-bold text-green-600">{stats.won}</p>
            </div>
            <p className="text-sm font-medium text-gray-600">Won</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl p-6 shadow-lg mb-6 border border-gray-100 space-y-4">
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-2">📊 Status</p>
            <div className="flex gap-2 flex-wrap">
              {['all', 'new', 'contacted', 'quoted', 'won', 'lost'].map(status => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-4 py-2 rounded-xl font-medium capitalize transition-all duration-300 ${
                    statusFilter === status
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold text-gray-700 mb-2">📅 Date Range</p>
            <div className="flex gap-2 flex-wrap">
              {[
                { value: 'all', label: 'All Time' },
                { value: 'today', label: 'Today' },
                { value: 'week', label: 'This Week' },
                { value: 'month', label: 'This Month' }
              ].map(date => (
                <button
                  key={date.value}
                  onClick={() => setDateFilter(date.value)}
                  className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
                    dateFilter === date.value
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {date.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold text-gray-700 mb-2">🏷️ Category</p>
            <div className="flex gap-2 flex-wrap">
              {[
                { value: 'all', label: 'All', icon: '📋' },
                { value: 'roofing', label: 'Roofing', icon: '🏠' },
                { value: 'hvac', label: 'HVAC', icon: '❄️' },
                { value: 'plumbing', label: 'Plumbing', icon: '🔧' },
                { value: 'electrical', label: 'Electrical', icon: '⚡' },
                { value: 'construction', label: 'Construction', icon: '🏗️' }
              ].map(cat => (
                <button
                  key={cat.value}
                  onClick={() => setCategoryFilter(cat.value)}
                  className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
                    categoryFilter === cat.value
                      ? 'bg-gradient-to-r from-green-600 to-teal-600 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {cat.icon} {cat.label}
                </button>
              ))}
            </div>
          </div>

          <input
            type="text"
            placeholder="🔍 Search by name, email, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="form-input w-full"
          />
        </div>

        <div className="mb-4">
          <p className="text-gray-600">
            Showing <span className="font-bold text-blue-600">{filteredLeads.length}</span> of <span className="font-bold">{leads.length}</span> leads
          </p>
        </div>

        {/* Leads List */}
        <div className="space-y-4">
          {filteredLeads.length === 0 ? (
            <div className="bg-white rounded-2xl p-16 text-center shadow-lg border border-gray-100">
              <div className="text-6xl mb-4">📭</div>
              <p className="text-xl font-semibold text-gray-700">No leads found</p>
              <p className="text-gray-500 mt-2">Try adjusting your filters</p>
            </div>
          ) : (
            filteredLeads.map((lead) => {
              const fileUrls = typeof lead.file_urls === 'string' ? JSON.parse(lead.file_urls) : lead.file_urls;
              const config = statusConfig[lead.status as keyof typeof statusConfig];
              const categoryIcon = categoryIcons[lead.category] || '📋';

              return (
                <div key={lead.id} className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3 flex-wrap">
                        <h3 className="text-2xl font-bold text-gray-900">{lead.name}</h3>
                        <span className={`${config?.color} text-white px-4 py-1.5 rounded-full text-sm font-bold shadow-md flex items-center gap-1`}>
                          <span>{config?.icon}</span>
                          <span className="capitalize">{lead.status}</span>
                        </span>
                        {lead.category && (
                          <span className="bg-gradient-to-r from-green-100 to-teal-100 text-green-700 px-4 py-1.5 rounded-full text-sm font-semibold flex items-center gap-1">
                            <span>{categoryIcon}</span>
                            <span className="capitalize">{lead.category}</span>
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-3 text-sm">
                        <span className="flex items-center gap-1.5 text-gray-600">
                          <span>📧</span> {lead.email}
                        </span>
                        <span className="flex items-center gap-1.5 text-gray-600">
                          <span>📱</span> {lead.phone}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <span>🕒</span>
                      {new Date(lead.created_at).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric', 
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>

                  <div className={`${config?.lightColor} rounded-xl p-4 mb-4`}>
                    <h4 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      <span>📝</span> Description
                    </h4>
                    <p className="text-gray-700 leading-relaxed">{lead.description}</p>
                  </div>

                  {fileUrls && fileUrls.length > 0 && (
                    <div className="mb-4">
                      <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                        <span>📸</span> Photos ({fileUrls.length})
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {fileUrls.map((file: any, index: number) => (
                          <a key={index} href={file.url} target="_blank" rel="noopener noreferrer" className="block group relative overflow-hidden rounded-xl">
                            <img src={file.url} alt={file.name} className="w-full h-32 object-cover transition-transform duration-300 group-hover:scale-110" />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
                              <span className="text-white opacity-0 group-hover:opacity-100 transition-opacity text-2xl">🔍</span>
                            </div>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                    <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <span>🏷️</span> Update Status:
                    </label>
                    <select value={lead.status} onChange={(e) => updateStatus(lead.id, e.target.value)} className="form-input rounded-xl border-2 border-gray-200 focus:border-blue-500 transition-all font-medium w-auto">
                      <option value="new">🆕 New</option>
                      <option value="contacted">📞 Contacted</option>
                      <option value="quoted">💰 Quoted</option>
                      <option value="won">✅ Won</option>
                      <option value="lost">❌ Lost</option>
                    </select>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
