'use client';
import { useState } from 'react';
import { safeJSONParse } from '@/lib/utils';
import { Edit2, X, Trash2, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';

interface CustomQuestion {
  id: string;
  type: 'text' | 'select' | 'checkbox' | 'textarea';
  label: string;
  options: string[];
  required: boolean;
}

interface TableViewProps {
  leads: any[];
  onSelectLead: (lead: any) => void;
  statusOptions: any[];
  onBulkUpdate?: (leadIds: number[], updates: any) => Promise<void>;
  onBulkDelete?: (leadIds: number[]) => Promise<void>;
  teamMembers?: any[];
  categories?: any[];
  customQuestions?: CustomQuestion[];
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

const formatCustomAnswer = (value: any, question: CustomQuestion): string => {
  if (value === null || value === undefined || value === '') return '—';
  if (question.type === 'checkbox') {
    return value === true || value === 'true' ? '✅ Yes' : '❌ No';
  }
  return String(value);
};

export default function TableView({ 
  leads, 
  onSelectLead, 
  statusOptions,
  onBulkUpdate,
  onBulkDelete,
  teamMembers = [],
  categories = [],
  customQuestions = [],
}: TableViewProps) {
  const [sortConfig, setSortConfig] = useState<SortConfig>(null);
  const [editMode, setEditMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [showActionsMenu, setShowActionsMenu] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [bulkActionLoading, setBulkActionLoading] = useState(false);

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig?.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getStatusConfig = (statusValue: string) => {
    return statusOptions.find((s: any) => s.value === statusValue) || statusOptions[0];
  };

  const getStatusColorHex = (colorName: string) => {
    const colorMap: Record<string, string> = {
      blue: '#3b82f6',
      yellow: '#eab308',
      purple: '#a855f7',
      orange: '#f97316',
      green: '#22c55e',
      red: '#ef4444',
      gray: '#6b7280',
      indigo: '#6366f1',
      pink: '#ec4899',
    };
    return colorMap[colorName] || '#3b82f6';
  };

  const toggleEditMode = () => {
    setEditMode(!editMode);
    setSelectedIds(new Set());
    setShowActionsMenu(false);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === leads.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(leads.map(l => l.id)));
    }
  };

  const toggleSelect = (id: number) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleBulkStatusChange = async (newStatus: string) => {
    if (!onBulkUpdate || selectedIds.size === 0) return;
    setBulkActionLoading(true);
    try {
      await onBulkUpdate(Array.from(selectedIds), { status: newStatus });
      toast.success(`Updated ${selectedIds.size} lead(s) to ${newStatus}`);
      setSelectedIds(new Set());
      setShowActionsMenu(false);
    } catch (error) {
      toast.error('Failed to update leads');
    } finally {
      setBulkActionLoading(false);
    }
  };

  const handleBulkAssign = async (assignedTo: string) => {
    if (!onBulkUpdate || selectedIds.size === 0) return;
    setBulkActionLoading(true);
    try {
      await onBulkUpdate(Array.from(selectedIds), { assigned_to: assignedTo });
      toast.success(`Assigned ${selectedIds.size} lead(s) to ${assignedTo}`);
      setSelectedIds(new Set());
      setShowActionsMenu(false);
    } catch (error) {
      toast.error('Failed to assign leads');
    } finally {
      setBulkActionLoading(false);
    }
  };

  const handleBulkCategoryChange = async (newCategory: string) => {
    if (!onBulkUpdate || selectedIds.size === 0) return;
    setBulkActionLoading(true);
    try {
      await onBulkUpdate(Array.from(selectedIds), { category: newCategory });
      toast.success(`Updated ${selectedIds.size} lead(s) category`);
      setSelectedIds(new Set());
      setShowActionsMenu(false);
    } catch (error) {
      toast.error('Failed to update category');
    } finally {
      setBulkActionLoading(false);
    }
  };

  const handleBulkDelete = async () => {
    if (!onBulkDelete || selectedIds.size === 0) return;
    setBulkActionLoading(true);
    try {
      await onBulkDelete(Array.from(selectedIds));
      toast.success(`Deleted ${selectedIds.size} lead(s)`);
      setSelectedIds(new Set());
      setShowDeleteConfirm(false);
      setShowActionsMenu(false);
      setEditMode(false);
    } catch (error) {
      toast.error('Failed to delete leads');
    } finally {
      setBulkActionLoading(false);
    }
  };

  const getSortedLeads = () => {
    if (!sortConfig) return leads;

    const sorted = [...leads].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      // Handle custom question sorting
      if (sortConfig.key.startsWith('cq_')) {
        const qId = sortConfig.key.replace('cq_', '');
        const aAnswers = a.custom_answers || {};
        const bAnswers = b.custom_answers || {};
        aValue = String(aAnswers[qId] ?? '').toLowerCase();
        bValue = String(bAnswers[qId] ?? '').toLowerCase();
      } else {
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
          case 'zip_code':
            aValue = a.zip_code?.toLowerCase() || '';
            bValue = b.zip_code?.toLowerCase() || '';
            break;
          case 'lead_source':
            aValue = a.lead_source?.toLowerCase() || '';
            bValue = b.lead_source?.toLowerCase() || '';
            break;
          case 'status':
            const aStatusIndex = statusOptions.findIndex(s => s.value === (a.status || statusOptions[0].value));
            const bStatusIndex = statusOptions.findIndex(s => s.value === (b.status || statusOptions[0].value));
            aValue = aStatusIndex >= 0 ? aStatusIndex : 999;
            bValue = bStatusIndex >= 0 ? bStatusIndex : 999;
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const sortedLeads = getSortedLeads();

  // Only render custom question columns if there are any defined
  const hasCustomQuestions = customQuestions.length > 0;

  return (
    <div className="bg-white/10 backdrop-blur-xl rounded-lg shadow-lg overflow-hidden border border-white/20">
      
      {/* Top Action Bar */}
      <div className="bg-slate-800/80 px-4 py-3 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-4">
          {editMode ? (
            <>
              <label className="flex items-center gap-2 text-white cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedIds.size === leads.length && leads.length > 0}
                  onChange={toggleSelectAll}
                  className="w-4 h-4 rounded border-gray-600 text-blue-600 focus:ring-blue-500 focus:ring-offset-gray-900"
                />
                <span className="text-sm font-medium">
                  {selectedIds.size > 0 ? `${selectedIds.size} selected` : 'Select All'}
                </span>
              </label>

              {selectedIds.size > 0 && (
                <div className="relative">
                  <button
                    onClick={() => setShowActionsMenu(!showActionsMenu)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition text-sm"
                    disabled={bulkActionLoading}
                  >
                    {bulkActionLoading ? 'Processing...' : 'Actions'}
                    <ChevronDown className="w-4 h-4" />
                  </button>

                  {showActionsMenu && (
                    <>
                      <div 
                        className="fixed inset-0 z-10" 
                        onClick={() => setShowActionsMenu(false)}
                      />
                      <div className="absolute left-0 top-full mt-2 w-64 bg-slate-800 border border-slate-700 rounded-lg shadow-2xl z-20 overflow-hidden">
                        
                        <div className="group">
                          <div className="px-4 py-2 text-sm font-semibold text-white bg-slate-700">
                            Change Status
                          </div>
                          <div className="max-h-48 overflow-y-auto">
                            {statusOptions.map((status) => (
                              <button
                                key={status.value}
                                onClick={() => handleBulkStatusChange(status.value)}
                                className="w-full text-left px-4 py-2 text-sm text-white hover:bg-slate-700 transition flex items-center gap-2"
                              >
                                <span 
                                  className="w-3 h-3 rounded-full"
                                  style={{ backgroundColor: getStatusColorHex(status.color) }}
                                />
                                {status.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="border-t border-slate-700" />

                        {teamMembers.length > 0 && (
                          <>
                            <div className="group">
                              <div className="px-4 py-2 text-sm font-semibold text-white bg-slate-700">
                                Assign To
                              </div>
                              <div className="max-h-48 overflow-y-auto">
                                {teamMembers.map((member) => (
                                  <button
                                    key={member.id}
                                    onClick={() => handleBulkAssign(member.name)}
                                    className="w-full text-left px-4 py-2 text-sm text-white hover:bg-slate-700 transition"
                                  >
                                    {member.name}
                                  </button>
                                ))}
                              </div>
                            </div>
                            <div className="border-t border-slate-700" />
                          </>
                        )}

                        {categories.length > 0 && (
                          <>
                            <div className="group">
                              <div className="px-4 py-2 text-sm font-semibold text-white bg-slate-700">
                                Change Category
                              </div>
                              <div className="max-h-48 overflow-y-auto">
                                {categories.map((category: any) => (
                                  <button
                                    key={category.value}
                                    onClick={() => handleBulkCategoryChange(category.value)}
                                    className="w-full text-left px-4 py-2 text-sm text-white hover:bg-slate-700 transition"
                                  >
                                    {category.label}
                                  </button>
                                ))}
                              </div>
                            </div>
                            <div className="border-t border-slate-700" />
                          </>
                        )}

                        <button
                          onClick={() => {
                            setShowActionsMenu(false);
                            setShowDeleteConfirm(true);
                          }}
                          className="w-full text-left px-4 py-3 text-sm text-red-400 hover:bg-red-900/20 transition flex items-center gap-2 font-semibold"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete ({selectedIds.size})
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </>
          ) : (
            <span className="text-white/70 text-sm">
              {leads.length} lead{leads.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        <button
          onClick={toggleEditMode}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition text-sm ${
            editMode 
              ? 'bg-red-500/20 text-red-300 hover:bg-red-500/30 border border-red-500/30'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          {editMode ? (
            <>
              <X className="w-4 h-4" />
              Cancel
            </>
          ) : (
            <>
              <Edit2 className="w-4 h-4" />
              Edit
            </>
          )}
        </button>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-xl shadow-2xl max-w-md w-full border border-slate-700">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center">
                  <Trash2 className="w-6 h-6 text-red-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Delete {selectedIds.size} Lead{selectedIds.size !== 1 ? 's' : ''}?</h3>
                  <p className="text-sm text-white/60">This action cannot be undone.</p>
                </div>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={bulkActionLoading}
                  className="flex-1 px-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleBulkDelete}
                  disabled={bulkActionLoading}
                  className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition disabled:opacity-50"
                >
                  {bulkActionLoading ? 'Deleting...' : 'Delete Forever'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="lg:hidden bg-slate-800/50 px-4 py-2 text-xs text-white/70 text-center border-b border-white/10">
        ← Scroll horizontally to see all columns →
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-white/10">
          <thead className="bg-slate-800/80">
            <tr>
              {editMode && (
                <th className="px-4 py-3 w-12" />
              )}
              
              <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider whitespace-nowrap">
                Project #
              </th>
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
  onClick={() => handleSort('zip_code')}
>
  Zip <SortIcon columnKey="zip_code" />
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
              <th 
                className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider cursor-pointer hover:bg-slate-700/50 transition select-none whitespace-nowrap"
                onClick={() => handleSort('lead_source')}
              >
                Source <SortIcon columnKey="lead_source" />
              </th>

              {/* ── Custom Question Columns ── */}
              {hasCustomQuestions && customQuestions.map((q) => (
                <th
                  key={q.id}
                  className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider cursor-pointer hover:bg-slate-700/50 transition select-none whitespace-nowrap border-l border-violet-500/20"
                  onClick={() => handleSort(`cq_${q.id}`)}
                  title={q.label}
                >
                  <span className="flex items-center gap-1">
                    <span className="text-white/40 text-[10px]">✦</span>
                    {q.label.length > 20 ? q.label.slice(0, 20) + '…' : q.label}
                    <SortIcon columnKey={`cq_${q.id}`} />
                  </span>
                </th>
              ))}

              {!editMode && (
                <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider whitespace-nowrap">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {sortedLeads.map((lead) => {
              const fileUrls = safeJSONParse(lead.file_urls);
              const leadStatus = lead.status || statusOptions[0]?.value || 'new';
              const statusConfig = getStatusConfig(leadStatus);
              const statusColorHex = getStatusColorHex(statusConfig.color);
              const isProject = !!lead.project_id;
              const customAnswers = lead.custom_answers || {};
              
              const images = fileUrls?.filter((f: any) => 
                f.type?.startsWith('image/') || f.name?.match(/\.(jpg|jpeg|png|gif|webp)$/i)
              ) || [];
              
              const videos = fileUrls?.filter((f: any) => 
                f.type?.startsWith('video/') || f.name?.match(/\.(mp4|mov|avi|webm)$/i)
              ) || [];

              const rowBgColor = isProject ? 'bg-emerald-900/20 hover:bg-emerald-900/30' : 'hover:bg-slate-800/50';
              
              const formatPhone = (phone: string) => {
                const cleaned = ('' + phone).replace(/\D/g, '');
                const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
                return match ? `(${match[1]}) ${match[2]}-${match[3]}` : phone;
              };

              const isSelected = selectedIds.has(lead.id);

              return (
                <tr 
                  key={lead.id} 
                  className={`${rowBgColor} ${editMode ? '' : 'cursor-pointer'} transition ${isSelected ? 'bg-blue-900/20' : ''}`}
                  onClick={() => {
                    if (editMode) {
                      toggleSelect(lead.id);
                    } else {
                      onSelectLead(lead);
                    }
                  }}
                >
                  {editMode && (
                    <td className="px-4 py-4">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelect(lead.id)}
                        onClick={(e) => e.stopPropagation()}
                        className="w-4 h-4 rounded border-gray-600 text-blue-600 focus:ring-blue-500 focus:ring-offset-gray-900"
                      />
                    </td>
                  )}

                  <td className="px-4 py-4 whitespace-nowrap text-sm text-white">
                    {isProject && lead.project_number ? (
                      <span className="font-semibold text-emerald-400">{lead.project_number}</span>
                    ) : (
                      <span className="text-white/40">—</span>
                    )}
                  </td>

                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-white">{lead.name}</div>
                  </td>

                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm text-white">{formatPhone(lead.phone || '')}</div>
                    <div className="text-xs text-white/60">{lead.email}</div>
                  </td>

                  <td className="px-4 py-4">
                    {lead.address_line_1 ? (
                      <div className="text-sm max-w-xs">
                        <div className="text-white truncate font-medium">{lead.address_line_1}</div>
                        {lead.address_line_2 && (
                          <div className="text-white/70 text-xs truncate">{lead.address_line_2}</div>
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
  <div className="text-sm text-white">
    {lead.zip_code || <span className="text-white/40">—</span>}
  </div>
</td>

                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                      {formatCategory(lead.category)}
                    </span>
                  </td>

                  <td className="px-4 py-4 whitespace-nowrap">
                    <span 
                      className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full text-white"
                      style={{ backgroundColor: statusColorHex }}
                    >
                      {statusConfig.label}
                    </span>
                  </td>

                  <td className="px-4 py-4 whitespace-nowrap">
                    {isProject ? (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        Project
                      </span>
                    ) : (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                        Lead
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
                      <div className="font-semibold text-green-400">{formatCurrency(lead.quote_total)}</div>
                    ) : (
                      <span className="text-white/40">—</span>
                    )}
                  </td>

                  <td className="px-4 py-4 whitespace-nowrap text-sm">
                    {lead.payment_amount ? (
                      <div>
                        <div className="font-semibold text-blue-400">{formatCurrency(lead.payment_amount)}</div>
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
                    {images.length > 0 && <span>{images.length} photos</span>}
                    {images.length > 0 && videos.length > 0 && <span> • </span>}
                    {videos.length > 0 && <span>{videos.length} videos</span>}
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
                  
                  <td className="px-4 py-4 whitespace-nowrap">
                    {lead.lead_source ? (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 capitalize">
                        {lead.lead_source.replace('_', ' ')}
                      </span>
                    ) : (
                      <span className="text-white/40 text-sm">—</span>
                    )}
                  </td>

                  {/* ── Custom Question Answer Cells ── */}
                  {hasCustomQuestions && customQuestions.map((q) => {
                    const rawAnswer = customAnswers[q.id];
                    const displayValue = formatCustomAnswer(rawAnswer, q);
                    const hasAnswer = rawAnswer !== null && rawAnswer !== undefined && rawAnswer !== '';

                    return (
                      <td
                        key={q.id}
                        className="px-4 py-4 whitespace-nowrap text-sm border-l border-violet-500/10"
                      >
                        {hasAnswer ? (
                          q.type === 'checkbox' ? (
                            <span className={`text-sm ${rawAnswer === true || rawAnswer === 'true' ? 'text-green-400' : 'text-red-400'}`}>
                              {displayValue}
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-md bg-white/10 text-white border border-white/20 text-xs font-medium">
                              {displayValue}
                            </span>
                          )
                        ) : (
                          <span className="text-white/40">—</span>
                        )}
                      </td>
                    );
                  })}

                  {!editMode && (
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
                  )}
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