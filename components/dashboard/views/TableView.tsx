'use client';

import { useState } from 'react';
import { safeJSONParse } from '@/lib/utils';
import { Edit2, X, Trash2, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';
import { getTheme } from '@/lib/theme';

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
  isDark?: boolean;
}

type SortConfig = { key: string; direction: 'asc' | 'desc' } | null;

const formatCategory = (cat: string) => {
  if (!cat) return '';
  return cat.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
};

const formatCustomAnswer = (value: any, question: CustomQuestion): string => {
  if (value === null || value === undefined || value === '') return '—';
  if (question.type === 'checkbox') return value === true || value === 'true' ? '✅ Yes' : '❌ No';
  return String(value);
};

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount);

const formatPhone = (phone: string) => {
  const cleaned = ('' + phone).replace(/\D/g, '');
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
  return match ? `(${match[1]}) ${match[2]}-${match[3]}` : phone;
};

const STATUS_COLORS: Record<string, string> = {
  blue: '#3b82f6', yellow: '#eab308', purple: '#a855f7', orange: '#f97316',
  green: '#22c55e', red: '#ef4444', gray: '#6b7280', indigo: '#6366f1', pink: '#ec4899',
};

export default function TableView({
  leads, onSelectLead, statusOptions,
  onBulkUpdate, onBulkDelete,
  teamMembers = [], categories = [], customQuestions = [],
  isDark = true,
}: TableViewProps) {
  const t = getTheme(isDark);

  const [sortConfig, setSortConfig] = useState<SortConfig>(null);
  const [editMode, setEditMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [showActionsMenu, setShowActionsMenu] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [bulkActionLoading, setBulkActionLoading] = useState(false);

  const getStatusConfig = (val: string) => statusOptions.find((s: any) => s.value === val) || statusOptions[0];
  const getHex = (color: string) => STATUS_COLORS[color] || '#3b82f6';

  const handleSort = (key: string) => {
    setSortConfig(prev =>
      prev?.key === key && prev.direction === 'asc'
        ? { key, direction: 'desc' }
        : { key, direction: 'asc' }
    );
  };

  const toggleEditMode = () => { setEditMode(e => !e); setSelectedIds(new Set()); setShowActionsMenu(false); };
  const toggleSelectAll = () => setSelectedIds(selectedIds.size === leads.length ? new Set() : new Set(leads.map(l => l.id)));
  const toggleSelect = (id: number) => {
    const s = new Set(selectedIds);
    s.has(id) ? s.delete(id) : s.add(id);
    setSelectedIds(s);
  };

  const bulkAction = async (fn: () => Promise<void>, successMsg: string) => {
    setBulkActionLoading(true);
    try { await fn(); toast.success(successMsg); setSelectedIds(new Set()); setShowActionsMenu(false); }
    catch { toast.error('Action failed'); }
    finally { setBulkActionLoading(false); }
  };

  const handleBulkStatusChange = (status: string) =>
    bulkAction(() => onBulkUpdate!(Array.from(selectedIds), { status }), `Updated ${selectedIds.size} lead(s)`);
  const handleBulkAssign = (name: string) =>
    bulkAction(() => onBulkUpdate!(Array.from(selectedIds), { assigned_to: name }), `Assigned ${selectedIds.size} lead(s)`);
  const handleBulkCategoryChange = (cat: string) =>
    bulkAction(() => onBulkUpdate!(Array.from(selectedIds), { category: cat }), `Category updated`);
  const handleBulkDelete = async () => {
    setBulkActionLoading(true);
    try {
      await onBulkDelete!(Array.from(selectedIds));
      toast.success(`Deleted ${selectedIds.size} lead(s)`);
      setSelectedIds(new Set()); setShowDeleteConfirm(false); setShowActionsMenu(false); setEditMode(false);
    } catch { toast.error('Delete failed'); }
    finally { setBulkActionLoading(false); }
  };

  const sortedLeads = sortConfig ? [...leads].sort((a, b) => {
    let av: any, bv: any;
    if (sortConfig.key.startsWith('cq_')) {
      const qId = sortConfig.key.slice(3);
      av = String(a.custom_answers?.[qId] ?? '').toLowerCase();
      bv = String(b.custom_answers?.[qId] ?? '').toLowerCase();
    } else {
      switch (sortConfig.key) {
        case 'name': av = a.name?.toLowerCase() || ''; bv = b.name?.toLowerCase() || ''; break;
        case 'phone': av = a.phone || ''; bv = b.phone || ''; break;
        case 'email': av = a.email?.toLowerCase() || ''; bv = b.email?.toLowerCase() || ''; break;
        case 'category': av = a.category?.toLowerCase() || ''; bv = b.category?.toLowerCase() || ''; break;
        case 'city': av = a.city?.toLowerCase() || ''; bv = b.city?.toLowerCase() || ''; break;
        case 'zip_code': av = a.zip_code || ''; bv = b.zip_code || ''; break;
        case 'lead_source': av = a.lead_source?.toLowerCase() || ''; bv = b.lead_source?.toLowerCase() || ''; break;
        case 'status':
          av = statusOptions.findIndex(s => s.value === (a.status || statusOptions[0].value));
          bv = statusOptions.findIndex(s => s.value === (b.status || statusOptions[0].value));
          break;
        case 'scheduled_date': av = a.scheduled_date ? new Date(a.scheduled_date).getTime() : 0; bv = b.scheduled_date ? new Date(b.scheduled_date).getTime() : 0; break;
        case 'preferred_date': av = a.preferred_date ? new Date(a.preferred_date).getTime() : 0; bv = b.preferred_date ? new Date(b.preferred_date).getTime() : 0; break;
        case 'quote_total': av = a.quote_total || 0; bv = b.quote_total || 0; break;
        case 'payment_amount': av = a.payment_amount || 0; bv = b.payment_amount || 0; break;
        case 'payment_due_date': av = a.payment_due_date ? new Date(a.payment_due_date).getTime() : 0; bv = b.payment_due_date ? new Date(b.payment_due_date).getTime() : 0; break;
        case 'media': av = (safeJSONParse(a.file_urls) || []).length; bv = (safeJSONParse(b.file_urls) || []).length; break;
        case 'date': av = new Date(a.created_at).getTime(); bv = new Date(b.created_at).getTime(); break;
        default: return 0;
      }
    }
    if (av < bv) return sortConfig.direction === 'asc' ? -1 : 1;
    if (av > bv) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  }) : leads;

  const SortIcon = ({ k }: { k: string }) =>
    sortConfig?.key !== k
      ? <span className={`${t.textMuted} ml-1`}>⇅</span>
      : sortConfig.direction === 'asc'
        ? <span className="text-indigo-400 ml-1">↑</span>
        : <span className="text-indigo-400 ml-1">↓</span>;

  const Th = ({ label, sortKey, className = '' }: { label: string; sortKey?: string; className?: string }) => (
    <th
      className={`px-4 py-3 text-left text-xs font-bold ${t.textMuted} uppercase tracking-wider whitespace-nowrap select-none ${sortKey ? `cursor-pointer ${isDark ? 'hover:text-white hover:bg-slate-700/40' : 'hover:text-gray-900 hover:bg-gray-100'} transition` : ''} ${className}`}
      onClick={sortKey ? () => handleSort(sortKey) : undefined}
    >
      {label}{sortKey && <SortIcon k={sortKey} />}
    </th>
  );

  return (
    <div className={`${t.tableBg} border ${t.tableBorderCol} overflow-hidden shadow-xl`}>

      {/* Toolbar */}
      <div className={`${t.toolbarBg} px-4 py-3 border-b ${t.toolbarBorder} flex items-center justify-between`}>
        <div className="flex items-center gap-4">
          {editMode ? (
            <>
              <label className={`flex items-center gap-2 ${t.textPrimary} cursor-pointer text-sm font-medium`}>
                <input
                  type="checkbox"
                  checked={selectedIds.size === leads.length && leads.length > 0}
                  onChange={toggleSelectAll}
                  className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
                />
                {selectedIds.size > 0 ? `${selectedIds.size} selected` : 'Select All'}
              </label>

              {selectedIds.size > 0 && (
                <div className="relative">
                  <button
                    onClick={() => setShowActionsMenu(!showActionsMenu)}
                    disabled={bulkActionLoading}
                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs transition"
                  >
                    {bulkActionLoading ? 'Working...' : 'Actions'}
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>

                  {showActionsMenu && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setShowActionsMenu(false)} />
                      <div className={`absolute left-0 top-full mt-1 w-56 ${t.dropdownBg} border ${t.dropdownBorder} shadow-2xl z-20 overflow-hidden`}>
                        <div className={`px-3 py-2 text-xs font-bold ${t.textMuted} uppercase tracking-widest ${isDark ? 'bg-slate-900' : 'bg-gray-50'}`}>
                          Change Status
                        </div>
                        <div className="max-h-40 overflow-y-auto">
                          {statusOptions.map((s) => (
                            <button key={s.value} onClick={() => handleBulkStatusChange(s.value)}
                              className={`w-full text-left px-4 py-2 text-sm ${t.textPrimary} ${t.dropdownHover} transition flex items-center gap-2`}>
                              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: getHex(s.color) }} />
                              {s.label}
                            </button>
                          ))}
                        </div>

                        {teamMembers.length > 0 && (
                          <>
                            <div className={`border-t ${t.toolbarBorder}`} />
                            <div className={`px-3 py-2 text-xs font-bold ${t.textMuted} uppercase tracking-widest ${isDark ? 'bg-slate-900' : 'bg-gray-50'}`}>
                              Assign To
                            </div>
                            <div className="max-h-40 overflow-y-auto">
                              {teamMembers.map((m) => (
                                <button key={m.id} onClick={() => handleBulkAssign(m.name)}
                                  className={`w-full text-left px-4 py-2 text-sm ${t.textPrimary} ${t.dropdownHover} transition`}>
                                  {m.name}
                                </button>
                              ))}
                            </div>
                          </>
                        )}

                        {categories.length > 0 && (
                          <>
                            <div className={`border-t ${t.toolbarBorder}`} />
                            <div className={`px-3 py-2 text-xs font-bold ${t.textMuted} uppercase tracking-widest ${isDark ? 'bg-slate-900' : 'bg-gray-50'}`}>
                              Category
                            </div>
                            <div className="max-h-40 overflow-y-auto">
                              {categories.map((c: any) => (
                                <button key={c.value} onClick={() => handleBulkCategoryChange(c.value)}
                                  className={`w-full text-left px-4 py-2 text-sm ${t.textPrimary} ${t.dropdownHover} transition`}>
                                  {c.label}
                                </button>
                              ))}
                            </div>
                          </>
                        )}

                        <div className={`border-t ${t.toolbarBorder}`} />
                        <button
                          onClick={() => { setShowActionsMenu(false); setShowDeleteConfirm(true); }}
                          className="w-full text-left px-4 py-3 text-sm text-red-400 hover:bg-red-900/20 transition flex items-center gap-2 font-bold"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Delete ({selectedIds.size})
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </>
          ) : (
            <span className={`${t.textMuted} text-sm`}>{leads.length} lead{leads.length !== 1 ? 's' : ''}</span>
          )}
        </div>

        <button
          onClick={toggleEditMode}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 font-bold text-xs transition ${
            editMode
              ? `${isDark ? 'bg-slate-700 hover:bg-slate-600 border-slate-600' : 'bg-gray-200 hover:bg-gray-300 border-gray-300'} ${t.textPrimary} border`
              : 'bg-indigo-600 hover:bg-indigo-700 text-white'
          }`}
        >
          {editMode ? <><X className="w-3.5 h-3.5" /> Cancel</> : <><Edit2 className="w-3.5 h-3.5" /> Edit</>}
        </button>
      </div>

      {/* Delete confirm modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className={`${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'} border max-w-sm w-full shadow-2xl`}>
            <div className="p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 bg-red-500/20 flex items-center justify-center flex-shrink-0">
                  <Trash2 className="w-5 h-5 text-red-400" />
                </div>
                <div>
                  <h3 className={`${t.textPrimary} font-bold`}>Delete {selectedIds.size} Lead{selectedIds.size !== 1 ? 's' : ''}?</h3>
                  <p className={`${t.textMuted} text-sm`}>This cannot be undone.</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setShowDeleteConfirm(false)} disabled={bulkActionLoading}
                  className={`flex-1 px-4 py-2.5 ${isDark ? 'bg-slate-700 hover:bg-slate-600' : 'bg-gray-100 hover:bg-gray-200'} ${t.textPrimary} font-bold text-sm transition`}>
                  Cancel
                </button>
                <button onClick={handleBulkDelete} disabled={bulkActionLoading}
                  className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold text-sm transition">
                  {bulkActionLoading ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile scroll hint */}
      <div className={`lg:hidden ${t.scrollHint} px-4 py-1.5 text-xs text-center border-b`}>
        ← Scroll to see all columns →
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full" style={{ borderCollapse: 'collapse' }}>
          <thead className={t.tableHeadBg}>
            <tr className={`border-b ${t.tableBorderCol}`}>
              {editMode && <th className="px-4 py-3 w-10" />}
              <Th label="Project #" />
              <Th label="Name" sortKey="name" />
              <Th label="Contact" sortKey="phone" />
              <Th label="Address" />
              <Th label="City" sortKey="city" />
              <Th label="Zip" sortKey="zip_code" />
              <Th label="Category" sortKey="category" />
              <Th label="Status" sortKey="status" />
              <Th label="Type" />
              <Th label="Scheduled" sortKey="scheduled_date" />
              <Th label="Preferred Date" sortKey="preferred_date" />
              <Th label="Assigned" />
              <Th label="Quote" sortKey="quote_total" />
              <Th label="Payment" sortKey="payment_amount" />
              <Th label="Due Date" sortKey="payment_due_date" />
              <Th label="Media" sortKey="media" />
              <Th label="Created" sortKey="date" />
              <Th label="Source" sortKey="lead_source" />
              {customQuestions.map((q) => (
                <th
                  key={q.id}
                  className={`px-4 py-3 text-left text-xs font-bold ${t.textMuted} uppercase tracking-wider cursor-pointer ${isDark ? 'hover:text-white hover:bg-slate-700/40' : 'hover:text-gray-900 hover:bg-gray-100'} transition whitespace-nowrap select-none border-l ${t.tableBorderCol}`}
                  onClick={() => handleSort(`cq_${q.id}`)}
                  title={q.label}
                >
                  {q.label.length > 18 ? q.label.slice(0, 18) + '…' : q.label}
                  <SortIcon k={`cq_${q.id}`} />
                </th>
              ))}
              {!editMode && <Th label="Actions" />}
            </tr>
          </thead>

          <tbody className={`${t.tableDivide} divide-y`}>
            {sortedLeads.map((lead) => {
              const fileUrls = safeJSONParse(lead.file_urls) || [];
              const statusConfig = getStatusConfig(lead.status || statusOptions[0]?.value);
              const statusHex = getHex(statusConfig.color);
              const isProject = !!lead.project_id;
              const customAnswers = lead.custom_answers || {};
              const images = fileUrls.filter((f: any) => f.type?.startsWith('image/') || f.name?.match(/\.(jpg|jpeg|png|gif|webp)$/i));
              const videos = fileUrls.filter((f: any) => f.type?.startsWith('video/') || f.name?.match(/\.(mp4|mov|avi|webm)$/i));
              const isSelected = selectedIds.has(lead.id);

              return (
                <tr
                  key={lead.id}
                  className={`transition cursor-pointer ${
                    isSelected
                      ? t.tableRowSelected
                      : isProject
                      ? t.tableRowProject
                      : t.tableRowHover
                  }`}
                  onClick={() => editMode ? toggleSelect(lead.id) : onSelectLead(lead)}
                >
                  {editMode && (
                    <td className="px-4 py-3">
                      <input type="checkbox" checked={isSelected} onChange={() => toggleSelect(lead.id)}
                        onClick={(e) => e.stopPropagation()}
                        className="w-4 h-4 text-indigo-600 focus:ring-indigo-500" />
                    </td>
                  )}

                  <td className="px-4 py-3 whitespace-nowrap text-sm">
                    {isProject && lead.project_number
                      ? <span className="font-bold text-emerald-500">#{lead.project_number}</span>
                      : <span className={t.textEmpty}>—</span>}
                  </td>

                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`text-sm font-semibold ${t.textPrimary}`}>{lead.name}</span>
                  </td>

                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className={`text-sm ${t.textPrimary}`}>{formatPhone(lead.phone || '')}</div>
                    <div className={`text-xs ${t.textMuted}`}>{lead.email}</div>
                  </td>

                  <td className="px-4 py-3 max-w-[160px]">
                    {lead.address_line_1
                      ? <div>
                          <div className={`text-sm ${t.textPrimary} truncate`}>{lead.address_line_1}</div>
                          {lead.address_line_2 && <div className={`text-xs ${t.textMuted} truncate`}>{lead.address_line_2}</div>}
                        </div>
                      : <span className={`${t.textEmpty} text-sm`}>—</span>}
                  </td>

                  <td className={`px-4 py-3 whitespace-nowrap text-sm ${t.textPrimary}`}>
                    {lead.city || <span className={t.textEmpty}>—</span>}
                  </td>

                  <td className={`px-4 py-3 whitespace-nowrap text-sm ${t.textPrimary}`}>
                    {lead.zip_code || <span className={t.textEmpty}>—</span>}
                  </td>

                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`px-2 py-0.5 text-xs font-bold ${isDark ? 'bg-sky-500/20 text-white border border-sky-400/40' : 'bg-sky-100 text-sky-800 border border-sky-300'}`}>
                      {formatCategory(lead.category)}
                    </span>
                  </td>

                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="px-2 py-0.5 text-xs font-bold text-white" style={{ backgroundColor: statusHex }}>
                      {statusConfig.label}
                    </span>
                  </td>

                  <td className="px-4 py-3 whitespace-nowrap">
                    {isProject
                      ? <span className={`px-2 py-0.5 text-xs font-bold ${isDark ? 'bg-emerald-500/20 text-white border border-emerald-400/40' : 'bg-emerald-100 text-emerald-800 border border-emerald-300'}`}>Project</span>
                      : <span className={`px-2 py-0.5 text-xs font-bold ${isDark ? 'bg-slate-500/30 text-white border border-slate-400/30' : 'bg-gray-100 text-gray-600 border border-gray-300'}`}>Lead</span>}
                  </td>

                  <td className="px-4 py-3 whitespace-nowrap text-sm">
                    {lead.scheduled_date
                      ? <div>
                          <div className={`${t.textPrimary} font-medium`}>
                            {new Date(lead.scheduled_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </div>
                          {lead.scheduled_time && <div className={`text-xs ${t.textMuted}`}>{lead.scheduled_time}</div>}
                        </div>
                      : <span className={t.textEmpty}>—</span>}
                  </td>

                  <td className="px-4 py-3 whitespace-nowrap text-sm">
                    {lead.preferred_date
                      ? <div>
                          <div className="text-amber-500 font-medium">
                            {new Date(lead.preferred_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </div>
                          {lead.preferred_time && <div className={`text-xs ${t.textMuted}`}>{lead.preferred_time}</div>}
                        </div>
                      : <span className={t.textEmpty}>—</span>}
                  </td>

                  <td className="px-4 py-3 whitespace-nowrap">
                    {lead.assigned_to
                      ? <span className={`px-2 py-0.5 text-xs font-bold ${isDark ? 'bg-violet-500/20 text-white border border-violet-400/40' : 'bg-violet-100 text-violet-800 border border-violet-300'}`}>{lead.assigned_to}</span>
                      : <span className={`${t.textEmpty} text-sm`}>—</span>}
                  </td>

                  <td className="px-4 py-3 whitespace-nowrap text-sm">
                    {lead.quote_total
                      ? <span className="font-bold text-emerald-500">{formatCurrency(lead.quote_total)}</span>
                      : <span className={t.textEmpty}>—</span>}
                  </td>

                  <td className="px-4 py-3 whitespace-nowrap text-sm">
                    {lead.payment_amount
                      ? <div>
                          <div className="font-bold text-sky-500">{formatCurrency(lead.payment_amount)}</div>
                          {lead.payment_status && <div className={`text-xs ${t.textMuted} capitalize`}>{lead.payment_status}</div>}
                        </div>
                      : lead.payment_status
                      ? <span className={`text-xs ${t.textMuted} capitalize`}>{lead.payment_status}</span>
                      : <span className={t.textEmpty}>—</span>}
                  </td>

                  <td className="px-4 py-3 whitespace-nowrap text-sm">
                    {lead.payment_due_date
                      ? (() => {
                          const due = new Date(lead.payment_due_date);
                          const isOverdue = !lead.payment_status?.includes('paid') && due < new Date();
                          return (
                            <span className={`font-medium ${isOverdue ? 'text-red-500' : t.textPrimary}`}>
                              {due.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                              {isOverdue && <span className="ml-1 text-xs text-red-500">overdue</span>}
                            </span>
                          );
                        })()
                      : <span className={t.textEmpty}>—</span>}
                  </td>

                  <td className={`px-4 py-3 whitespace-nowrap text-sm ${t.textPrimary}`}>
                    {images.length > 0 && `${images.length} photos`}
                    {images.length > 0 && videos.length > 0 && ' · '}
                    {videos.length > 0 && `${videos.length} videos`}
                    {images.length === 0 && videos.length === 0 && <span className={t.textEmpty}>—</span>}
                  </td>

                  <td className={`px-4 py-3 whitespace-nowrap text-sm ${t.textPrimary}`}>
                    {new Date(lead.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                  </td>

                  <td className="px-4 py-3 whitespace-nowrap">
                    {lead.lead_source
                      ? <span className={`px-2 py-0.5 text-xs font-bold capitalize ${isDark ? 'bg-indigo-500/20 text-white border border-indigo-400/40' : 'bg-indigo-100 text-indigo-800 border border-indigo-300'}`}>
                          {lead.lead_source.replace('_', ' ')}
                        </span>
                      : <span className={`${t.textEmpty} text-sm`}>—</span>}
                  </td>

                  {customQuestions.map((q) => {
                    const raw = customAnswers[q.id];
                    const display = formatCustomAnswer(raw, q);
                    const has = raw !== null && raw !== undefined && raw !== '';
                    return (
                      <td key={q.id} className={`px-4 py-3 whitespace-nowrap text-sm border-l ${t.tableBorderCol}`}>
                        {has
                          ? q.type === 'checkbox'
                            ? <span className={raw === true || raw === 'true' ? 'text-emerald-500' : 'text-red-400'}>{display}</span>
                            : <span className={`px-2 py-0.5 text-xs font-medium ${isDark ? 'bg-slate-700 text-white border border-slate-600' : 'bg-gray-100 text-gray-800 border border-gray-200'}`}>{display}</span>
                          : <span className={t.textEmpty}>—</span>}
                      </td>
                    );
                  })}

                  {!editMode && (
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                      <button
                        onClick={(e) => { e.stopPropagation(); onSelectLead(lead); }}
                        className="text-indigo-500 hover:text-indigo-400 font-bold text-xs transition"
                      >
                        View →
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
        <div className={`py-16 text-center ${t.textMuted} text-sm`}>No leads to display</div>
      )}
    </div>
  );
}