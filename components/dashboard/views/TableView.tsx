'use client';
import { useState } from 'react';
import { safeJSONParse } from '@/lib/utils';

interface TableViewProps {
  leads: any[];
  onSelectLead: (lead: any) => void;
}

type SortConfig = {
  key: string;
  direction: 'asc' | 'desc';
} | null;

const formatCategory = (cat: string) => {
  if (!cat) return '';
  return cat
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

export default function TableView({ leads, onSelectLead }: TableViewProps) {
  const [sortConfig, setSortConfig] = useState<SortConfig>(null);

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    
    if (sortConfig?.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    
    setSortConfig({ key, direction });
  };

  const getSortedLeads = () => {
    if (!sortConfig) return leads;

    const sorted = [...leads].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortConfig.key) {
        case 'name':
          aValue = a.name?.toLowerCase() || '';
          bValue = b.name?.toLowerCase() || '';
          break;
        case 'phone':
          aValue = a.phone || '';
          bValue = b.phone || '';
          break;
        case 'email':
          aValue = a.email?.toLowerCase() || '';
          bValue = b.email?.toLowerCase() || '';
          break;
        case 'category':
          aValue = a.category?.toLowerCase() || '';
          bValue = b.category?.toLowerCase() || '';
          break;
        case 'city':
          aValue = a.city?.toLowerCase() || '';
          bValue = b.city?.toLowerCase() || '';
          break;
        case 'status':
          const statusOrder = { 
            'new': 0, 
            'contacted': 1, 
            'quoted': 2, 
            'scheduled': 3,
            'in-progress': 4, 
            'completed': 5,
            'cancelled': 6,
            'lost': 7 
          };
          aValue = statusOrder[(a.status || 'new') as keyof typeof statusOrder];
          bValue = statusOrder[(b.status || 'new') as keyof typeof statusOrder];
          break;
        case 'scheduled_date':
          aValue = a.scheduled_date ? new Date(a.scheduled_date).getTime() : 0;
          bValue = b.scheduled_date ? new Date(b.scheduled_date).getTime() : 0;
          break;
        case 'quote_total':
          aValue = a.quote_total || 0;
          bValue = b.quote_total || 0;
          break;
        case 'payment_amount':
          aValue = a.payment_amount || 0;
          bValue = b.payment_amount || 0;
          break;
        case 'media':
          const aFiles = safeJSONParse(a.file_urls) || [];
          const bFiles = safeJSONParse(b.file_urls) || [];
          aValue = aFiles.length;
          bValue = bFiles.length;
          break;
        case 'date':
          aValue = new Date(a.created_at).getTime();
          bValue = new Date(b.created_at).getTime();
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return sorted;
  };

  const SortIcon = ({ columnKey }: { columnKey: string }) => {
    if (sortConfig?.key !== columnKey) {
      return <span className="text-gray-400 ml-1 opacity-50">⇅</span>;
    }
    return sortConfig.direction === 'asc' ? 
      <span className="text-blue-600 ml-1">↑</span> : 
      <span className="text-blue-600 ml-1">↓</span>;
  };

  const getStatusColor = (status: string) => {
    const colors: any = {
      new: 'bg-blue-100 text-blue-800',
      contacted: 'bg-yellow-100 text-yellow-800',
      quoted: 'bg-purple-100 text-purple-800',
      scheduled: 'bg-blue-100 text-blue-800',
      'in-progress': 'bg-orange-100 text-orange-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      lost: 'bg-gray-100 text-gray-800',
    };
    return colors[status] || colors.new;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const sortedLeads = getSortedLeads();

  return (
    <div className="bg-white/10 backdrop-blur-xl rounded-lg shadow-lg overflow-hidden border border-white/20">
      {/* Mobile: Show scroll hint */}
      <div className="lg:hidden bg-slate-800/50 px-4 py-2 text-xs text-white/70 text-center border-b border-white/10">
        ← Scroll horizontally to see all columns →
      </div>
      
      {/* Scrollable container */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-white/10">
          <thead className="bg-slate-800/80">
            <tr>
              <th 
                className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider cursor-pointer hover:bg-slate-700/50 transition select-none whitespace-nowrap"
                onClick={() => handleSort('name')}
              >
                Name <SortIcon columnKey="name" />
              </th>
              <th 
                className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider cursor-pointer hover:bg-slate-700/50 transition select-none whitespace-nowrap"
                onClick={() => handleSort('phone')}
              >
                Contact <SortIcon columnKey="phone" />
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider whitespace-nowrap">
                Address
              </th>
              <th 
                className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider cursor-pointer hover:bg-slate-700/50 transition select-none whitespace-nowrap"
                onClick={() => handleSort('city')}
              >
                City <SortIcon columnKey="city" />
              </th>
              <th 
                className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider cursor-pointer hover:bg-slate-700/50 transition select-none whitespace-nowrap"
                onClick={() => handleSort('category')}
              >
                Category <SortIcon columnKey="category" />
              </th>
              <th 
                className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider cursor-pointer hover:bg-slate-700/50 transition select-none whitespace-nowrap"
                onClick={() => handleSort('status')}
              >
                Status <SortIcon columnKey="status" />
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider whitespace-nowrap">
                Type
              </th>
              <th 
                className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider cursor-pointer hover:bg-slate-700/50 transition select-none whitespace-nowrap"
                onClick={() => handleSort('scheduled_date')}
              >
                Scheduled <SortIcon columnKey="scheduled_date" />
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider whitespace-nowrap">
                Assigned
              </th>
              <th 
                className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider cursor-pointer hover:bg-slate-700/50 transition select-none whitespace-nowrap"
                onClick={() => handleSort('quote_total')}
              >
                Quote <SortIcon columnKey="quote_total" />
              </th>
              <th 
                className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider cursor-pointer hover:bg-slate-700/50 transition select-none whitespace-nowrap"
                onClick={() => handleSort('payment_amount')}
              >
                Payment <SortIcon columnKey="payment_amount" />
              </th>
              <th 
                className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider cursor-pointer hover:bg-slate-700/50 transition select-none whitespace-nowrap"
                onClick={() => handleSort('media')}
              >
                Media <SortIcon columnKey="media" />
              </th>
              <th 
                className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider cursor-pointer hover:bg-slate-700/50 transition select-none whitespace-nowrap"
                onClick={() => handleSort('date')}
              >
                Created <SortIcon columnKey="date" />
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider whitespace-nowrap">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {sortedLeads.map((lead) => {
              const fileUrls = safeJSONParse(lead.file_urls);
              const leadStatus = lead.status || 'new';
              const isProject = !!lead.project_id;
              
              const images = fileUrls?.filter((f: any) => 
                f.type?.startsWith('image/') || f.name?.match(/\.(jpg|jpeg|png|gif|webp)$/i)
              ) || [];
              
              const videos = fileUrls?.filter((f: any) => 
                f.type?.startsWith('video/') || f.name?.match(/\.(mp4|mov|avi|webm)$/i)
              ) || [];

              const rowBgColor = isProject ? 'bg-emerald-900/20 hover:bg-emerald-900/30' : 'hover:bg-slate-800/50';

              return (
                <tr 
                  key={lead.id} 
                  className={`${rowBgColor} cursor-pointer transition`}
                  onClick={() => onSelectLead(lead)}
                >
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-white">{lead.name}</div>
                  </td>

                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm text-white">{lead.phone}</div>
                    <div className="text-xs text-white/60">{lead.email}</div>
                  </td>

                  <td className="px-4 py-4">
                    {lead.address_line_1 ? (
                      <div className="text-sm max-w-xs">
                        <div className="text-white truncate font-medium">
                          {lead.address_line_1}
                        </div>
                        {lead.address_line_2 && (
                          <div className="text-white/70 text-xs truncate">
                            {lead.address_line_2}
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-white/40 text-sm">—</span>
                    )}
                  </td>

                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm text-white">
                      {lead.city || <span className="text-white/40">—</span>}
                    </div>
                  </td>

                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                      {formatCategory(lead.category)}
                    </span>
                  </td>

                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(leadStatus)}`}>
                      {leadStatus}
                    </span>
                  </td>

                  <td className="px-4 py-4 whitespace-nowrap">
                    {isProject ? (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        🚀 Project
                      </span>
                    ) : (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                        📧 Lead
                      </span>
                    )}
                  </td>

                  <td className="px-4 py-4 whitespace-nowrap text-sm text-white">
                    {lead.scheduled_date ? (
                      <div>
                        <div className="font-medium">
                          {new Date(lead.scheduled_date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric'
                          })}
                        </div>
                        {lead.scheduled_time && (
                          <div className="text-xs text-white/60">{lead.scheduled_time}</div>
                        )}
                      </div>
                    ) : (
                      <span className="text-white/40">—</span>
                    )}
                  </td>

                  <td className="px-4 py-4 whitespace-nowrap text-sm text-white">
                    {lead.assigned_to ? (
                      <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-1 rounded-full border border-purple-500/30">
                        {lead.assigned_to}
                      </span>
                    ) : (
                      <span className="text-white/40">—</span>
                    )}
                  </td>

                  <td className="px-4 py-4 whitespace-nowrap text-sm">
                    {lead.quote_total ? (
                      <div className="font-semibold text-green-400">
                        {formatCurrency(lead.quote_total)}
                      </div>
                    ) : (
                      <span className="text-white/40">—</span>
                    )}
                  </td>

                  <td className="px-4 py-4 whitespace-nowrap text-sm">
                    {lead.payment_amount ? (
                      <div>
                        <div className="font-semibold text-blue-400">
                          {formatCurrency(lead.payment_amount)}
                        </div>
                        {lead.payment_status && (
                          <div className="text-xs text-white/60 capitalize">{lead.payment_status}</div>
                        )}
                      </div>
                    ) : lead.payment_status ? (
                      <span className="text-xs text-white/60 capitalize">{lead.payment_status}</span>
                    ) : (
                      <span className="text-white/40">—</span>
                    )}
                  </td>

                  <td className="px-4 py-4 whitespace-nowrap text-sm text-white/80">
                    {images.length > 0 && <span>📸 {images.length}</span>}
                    {images.length > 0 && videos.length > 0 && <span> • </span>}
                    {videos.length > 0 && <span>🎥 {videos.length}</span>}
                    {images.length === 0 && videos.length === 0 && <span className="text-white/40">—</span>}
                  </td>

                  <td className="px-4 py-4 whitespace-nowrap text-sm text-white/80">
                    {new Date(lead.created_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit'
                    })}
                  </td>

                  <td className="px-4 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectLead(lead);
                      }}
                      className="text-blue-400 hover:text-blue-300 font-medium"
                    >
                      View
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
      {leads.length === 0 && (
        <div className="text-center py-12 text-white/70">
          No leads to display
        </div>
      )}
    </div>
  );
}