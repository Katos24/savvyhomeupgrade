'use client';

import { useState } from 'react';
import { safeJSONParse } from '@/lib/utils';
import { Edit2, X, Trash2, ChevronDown, ChevronRight } from 'lucide-react';
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
  // Sort now happens server-side — leads arrives pre-sorted for whatever
  // page is currently loaded. Previously this component held its own
  // sortConfig and sorted the `leads` prop locally, which only ever
  // sorted the 20 (or however many) rows already fetched — correct
  // relative to each other, but not relative to the leads that hadn't
  // been loaded yet. "Sorted by Quote descending" now means the highest
  // quotes across the whole company, not just within whatever page
  // happened to be in memory.
  sortKey: string | null;
  sortDir: 'asc' | 'desc';
  onSortChange: (key: string) => void;
}
 

type SortConfig = { key: string; direction: 'asc' | 'desc' } | null;

const formatCategory = (cat: string) => {
  if (!cat) return '';
  return cat.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
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

// Darker, text-safe variants for badge labels — STATUS_COLORS above is
// tuned for a small dot accent, not for text that needs real contrast on
// a light tint background. Matches the reference: bright dot, darker
// muted label text, not the same hex for both.
const STATUS_TEXT_COLORS: Record<string, string> = {
  blue: '#1d4ed8', yellow: '#a16207', purple: '#7e22ce', orange: '#c2410c',
  green: '#15803d', red: '#b91c1c', gray: '#374151', indigo: '#4338ca', pink: '#be185d',
};

export default function TableView({
  leads, onSelectLead, statusOptions,
  onBulkUpdate, onBulkDelete,
  teamMembers = [], categories = [],
  isDark = true,
  sortKey, sortDir, onSortChange,
}: TableViewProps) {
  // Dark mode keeps every color routed through the app's existing shared
  // theme tokens, untouched. Light mode is a new, separately hardcoded
  // Terrascape-inspired look — kept apart deliberately rather than
  // guessing at what belongs in the shared token file for a design this
  // different from the rest of the app's current light theme.
  const t = getTheme(isDark);

  const [editMode, setEditMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [showActionsMenu, setShowActionsMenu] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [bulkActionLoading, setBulkActionLoading] = useState(false);

   const getStatusConfig = (val: string) => statusOptions.find((s: any) => s.value === val) || statusOptions[0];
  const getHex = (color: string) => STATUS_COLORS[color] || '#3b82f6';
  const getTextHex = (color: string) => STATUS_TEXT_COLORS[color] || '#374151';

   const handleSort = (key: string) => onSortChange(key);


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

 const sortedLeads = leads;

  const SortIcon = ({ k }: { k: string }) =>
    sortKey !== k
      ? null
      : sortDir === 'asc'
        ? <span className="ml-1">&#8593;</span>
        : <span className="ml-1">&#8595;</span>;

  // ── LIGHT MODE — Terrascape-inspired: warm paper background, thin
  // hairline borders, monospace-flavored uppercase labels, pill badges,
  // no shadow/blur doing the work of "looking premium." ──
  if (!isDark) {
      const headerCell = 'px-4 py-3 text-left text-[11px] font-mono font-medium text-[#57534e] hover:text-[#1c1917] uppercase tracking-wider select-none transition-colors';
    const cell = 'px-4 py-3.5';

    return (
      <div className="bg-white">
        {/* Toolbar */}
        <div className="px-4 py-3 border-b border-[#e7e2d8] flex items-center justify-between">
          <div className="flex items-center gap-4">
            {editMode ? (
              <>
                <label className="flex items-center gap-2 text-[#292524] cursor-pointer text-sm font-medium">
                  <input
                    type="checkbox"
                    checked={selectedIds.size === leads.length && leads.length > 0}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 rounded text-[#1c1917] focus:ring-[#1c1917]"
                  />
                  {selectedIds.size > 0 ? `${selectedIds.size} selected` : 'Select all'}
                </label>
                {selectedIds.size > 0 && (
                  <div className="relative">
                    <button
                      onClick={() => setShowActionsMenu(!showActionsMenu)}
                      disabled={bulkActionLoading}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#1c1917] hover:bg-[#292524] disabled:opacity-50 text-white text-xs font-semibold transition-colors"
                    >
                      {bulkActionLoading ? 'Working...' : 'Actions'}
                      <ChevronDown className="w-3.5 h-3.5" />
                    </button>
                    {showActionsMenu && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setShowActionsMenu(false)} />
                        <div className="absolute left-0 top-full mt-2 w-56 bg-white border border-[#e7e2d8] rounded-xl shadow-lg z-20 overflow-hidden">
                          <div className="px-3 py-2 text-[10px] font-mono font-semibold text-[#a8a29e] uppercase tracking-wider bg-[#faf9f5]">Status</div>
                          <div className="max-h-40 overflow-y-auto">
                            {statusOptions.map((s) => (
                              <button key={s.value} onClick={() => handleBulkStatusChange(s.value)}
                                className="w-full text-left px-3 py-2 text-sm text-[#292524] hover:bg-[#f5f1e8] transition-colors flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: getHex(s.color) }} />
                                {s.label}
                              </button>
                            ))}
                          </div>
                          {teamMembers.length > 0 && (
                            <>
                              <div className="border-t border-[#e7e2d8]" />
                              <div className="px-3 py-2 text-[10px] font-mono font-semibold text-[#a8a29e] uppercase tracking-wider bg-[#faf9f5]">Assign</div>
                              <div className="max-h-40 overflow-y-auto">
                                {teamMembers.map((m) => (
                                  <button key={m.id} onClick={() => handleBulkAssign(m.name)}
                                    className="w-full text-left px-3 py-2 text-sm text-[#292524] hover:bg-[#f5f1e8] transition-colors">
                                    {m.name}
                                  </button>
                                ))}
                              </div>
                            </>
                          )}
                          {categories.length > 0 && (
                            <>
                              <div className="border-t border-[#e7e2d8]" />
                              <div className="px-3 py-2 text-[10px] font-mono font-semibold text-[#a8a29e] uppercase tracking-wider bg-[#faf9f5]">Category</div>
                              <div className="max-h-40 overflow-y-auto">
                                {categories.map((c: any) => (
                                  <button key={c.value} onClick={() => handleBulkCategoryChange(c.value)}
                                    className="w-full text-left px-3 py-2 text-sm text-[#292524] hover:bg-[#f5f1e8] transition-colors">
                                    {c.label}
                                  </button>
                                ))}
                              </div>
                            </>
                          )}
                          <div className="border-t border-[#e7e2d8]" />
                          <button
                            onClick={() => { setShowActionsMenu(false); setShowDeleteConfirm(true); }}
                            className="w-full text-left px-3 py-2.5 text-sm text-rose-600 hover:bg-rose-50 transition-colors flex items-center gap-2 font-medium"
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
              <span className="text-[#78716c] text-sm">{leads.length} lead{leads.length !== 1 ? 's' : ''}</span>
            )}
          </div>
          <button
            onClick={toggleEditMode}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
              editMode
                ? 'bg-[#f5f1e8] hover:bg-[#e7e2d8] text-[#292524] border border-[#e7e2d8]'
                : 'bg-[#1c1917] hover:bg-[#292524] text-white'
            }`}
          >
            {editMode ? <><X className="w-3.5 h-3.5" /> Cancel</> : <><Edit2 className="w-3.5 h-3.5" /> Edit</>}
          </button>
        </div>

        {/* Delete confirm */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white border border-[#e7e2d8] rounded-2xl max-w-sm w-full shadow-xl p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center shrink-0">
                  <Trash2 className="w-5 h-5 text-rose-600" />
                </div>
                <div>
                  <h3 className="text-[#1c1917] font-semibold">Delete {selectedIds.size} lead{selectedIds.size !== 1 ? 's' : ''}?</h3>
                  <p className="text-[#78716c] text-sm">This can't be undone.</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setShowDeleteConfirm(false)} disabled={bulkActionLoading}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-[#f5f1e8] hover:bg-[#e7e2d8] text-[#292524] font-medium text-sm transition-colors">
                  Cancel
                </button>
                <button onClick={handleBulkDelete} disabled={bulkActionLoading}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-medium text-sm transition-colors">
                  {bulkActionLoading ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
                    <table className="w-full min-w-[640px]" style={{ borderCollapse: 'collapse' }}>
            <thead>
              <tr className="border-b border-[#e7e2d8]">
                {editMode && <th className="px-4 py-3 w-8" />}
                <th className={`${headerCell} cursor-pointer`} onClick={() => handleSort('name')}>
                  Client<SortIcon k="name" />
                </th>
                <th className={`${headerCell} cursor-pointer`} onClick={() => handleSort('status')}>
                  Status<SortIcon k="status" />
                </th>
                <th className={`${headerCell} cursor-pointer`} onClick={() => handleSort('quote_total')}>
                  Quote<SortIcon k="quote_total" />
                </th>
                <th className={`${headerCell} cursor-pointer`} onClick={() => handleSort('payment_amount')}>
                  Payment<SortIcon k="payment_amount" />
                </th>
                <th className={`${headerCell} cursor-pointer`} onClick={() => handleSort('scheduled_date')}>
                  Scheduled<SortIcon k="scheduled_date" />
                </th>
                <th className="w-8" />
              </tr>
            </thead>
            <tbody>
                            {sortedLeads.map((lead) => {
                const statusConfig = getStatusConfig(lead.status || statusOptions[0]?.value);
                const statusHex = getHex(statusConfig.color);
                const statusTextHex = getTextHex(statusConfig.color);
                const isSelected = selectedIds.has(lead.id);

                return (
                  <tr
                    key={lead.id}
                    className={`border-b border-[#f0ece1] last:border-b-0 cursor-pointer transition-colors ${
                      isSelected ? 'bg-[#f5f1e8]' : 'hover:bg-[#faf9f5]'
                    }`}
                    onClick={() => editMode ? toggleSelect(lead.id) : onSelectLead(lead)}
                  >
                    {editMode && (
                      <td className={cell}>
                        <input type="checkbox" checked={isSelected} onChange={() => toggleSelect(lead.id)}
                          onClick={(e) => e.stopPropagation()}
                          className="w-4 h-4 rounded text-[#1c1917] focus:ring-[#1c1917]" />
                      </td>
                    )}
                    <td className={cell}>
                      <div className="text-sm font-semibold text-[#1c1917]">{lead.name}</div>
                      <div className="text-xs text-[#a8a29e] mt-0.5">
                        {lead.category ? formatCategory(lead.category) : '—'}
                        {lead.phone && ` · ${formatPhone(lead.phone)}`}
                      </div>
                    </td>
                    <td className={cell}>
                                          <span
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
                        style={{ backgroundColor: `${statusHex}18`, color: statusTextHex }}
                      >
                        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: statusHex }} />
                        {statusConfig.label}
                      </span>
                    </td>
                    <td className={`${cell} text-sm`}>
                      {lead.quote_total ? <span className="font-semibold text-[#1c1917]">{formatCurrency(lead.quote_total)}</span> : <span className="text-[#d6d3d1]">—</span>}
                    </td>
                    <td className={`${cell} text-sm`}>
                      {lead.payment_amount ? (
                        <div>
                          <span className="font-semibold text-[#1c1917]">{formatCurrency(lead.payment_amount)}</span>
                          {lead.payment_status && <span className="text-xs text-[#a8a29e] capitalize ml-1.5">{lead.payment_status}</span>}
                        </div>
                      ) : lead.payment_status === 'unpaid' && lead.quote_total ? (
                        <span className="text-xs font-medium text-amber-700">{formatCurrency(lead.quote_total)} due</span>
                      ) : <span className="text-[#d6d3d1]">—</span>}
                    </td>
                    <td className={`${cell} text-sm`}>
                      {lead.scheduled_date ? (
                        <div>
                          <div className="text-[#292524]">
                            {(() => { const [y,m,d] = lead.scheduled_date.split('T')[0].split('-').map(Number); return new Date(y,m-1,d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }); })()}
                          </div>
                          {lead.assigned_to && <div className="text-xs text-[#a8a29e] mt-0.5">{lead.assigned_to}</div>}
                        </div>
                      ) : <span className="text-[#d6d3d1]">—</span>}
                    </td>
                    <td className="pr-4">
                      <ChevronRight className="w-4 h-4 text-[#d6d3d1]" />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {leads.length === 0 && (
          <div className="py-16 text-center text-[#a8a29e] text-sm">No leads to display</div>
        )}
      </div>
    );
  }

  // ── DARK MODE — unchanged behavior, routed through the app's existing
  // shared theme tokens, same trimmed 5-column set as light mode. ──
  return (
    <div className={`${t.tableBg} border ${t.tableBorderCol} overflow-hidden`}>
      <div className={`${t.toolbarBg} px-4 py-3 border-b ${t.toolbarBorder} flex items-center justify-between`}>
        <div className="flex items-center gap-4">
          {editMode ? (
            <>
              <label className={`flex items-center gap-2 ${t.textPrimary} cursor-pointer text-sm font-medium`}>
                <input
                  type="checkbox"
                  checked={selectedIds.size === leads.length && leads.length > 0}
                  onChange={toggleSelectAll}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                />
                {selectedIds.size > 0 ? `${selectedIds.size} selected` : 'Select All'}
              </label>
              {selectedIds.size > 0 && (
                <div className="relative">
                  <button
                    onClick={() => setShowActionsMenu(!showActionsMenu)}
                    disabled={bulkActionLoading}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs transition"
                  >
                    {bulkActionLoading ? 'Working...' : 'Actions'}
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                  {showActionsMenu && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setShowActionsMenu(false)} />
                      <div className={`absolute left-0 top-full mt-1 w-56 ${t.dropdownBg} border ${t.dropdownBorder} shadow-2xl z-20 overflow-hidden`}>
                        <div className={`px-3 py-2 text-xs font-bold ${t.textMuted} uppercase tracking-widest ${isDark ? 'bg-slate-900' : 'bg-gray-50'}`}>Status</div>
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
                            <div className={`px-3 py-2 text-xs font-bold ${t.textMuted} uppercase tracking-widest ${isDark ? 'bg-slate-900' : 'bg-gray-50'}`}>Assign To</div>
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
                            <div className={`px-3 py-2 text-xs font-bold ${t.textMuted} uppercase tracking-widest ${isDark ? 'bg-slate-900' : 'bg-gray-50'}`}>Category</div>
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
            editMode ? `bg-slate-700 hover:bg-slate-600 border-slate-600 ${t.textPrimary} border` : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          {editMode ? <><X className="w-3.5 h-3.5" /> Cancel</> : <><Edit2 className="w-3.5 h-3.5" /> Edit</>}
        </button>
      </div>

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className={`${t.dropdownBg} border ${t.dropdownBorder} max-w-sm w-full shadow-2xl`}>
            <div className="p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-red-500/20 flex items-center justify-center shrink-0">
                  <Trash2 className="w-5 h-5 text-red-400" />
                </div>
                <div>
                  <h3 className={`${t.textPrimary} font-bold`}>Delete {selectedIds.size} lead{selectedIds.size !== 1 ? 's' : ''}?</h3>
                  <p className={`${t.textMuted} text-sm`}>This cannot be undone.</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setShowDeleteConfirm(false)} disabled={bulkActionLoading}
                  className={`flex-1 px-4 py-2.5 bg-slate-700 hover:bg-slate-600 ${t.textPrimary} font-bold text-sm transition`}>
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

      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px]" style={{ borderCollapse: 'collapse' }}>
          <thead className={t.tableHeadBg}>
            <tr className={`border-b ${t.tableBorderCol}`}>
              {editMode && <th className="px-4 py-3 w-8" />}
              <th className={`px-4 py-3 text-left text-xs font-bold ${t.textMuted} uppercase tracking-wider cursor-pointer hover:text-white transition`} onClick={() => handleSort('name')}>Client<SortIcon k="name" /></th>
              <th className={`px-4 py-3 text-left text-xs font-bold ${t.textMuted} uppercase tracking-wider cursor-pointer hover:text-white transition`} onClick={() => handleSort('status')}>Status<SortIcon k="status" /></th>
              <th className={`px-4 py-3 text-left text-xs font-bold ${t.textMuted} uppercase tracking-wider cursor-pointer hover:text-white transition`} onClick={() => handleSort('quote_total')}>Quote<SortIcon k="quote_total" /></th>
              <th className={`px-4 py-3 text-left text-xs font-bold ${t.textMuted} uppercase tracking-wider cursor-pointer hover:text-white transition`} onClick={() => handleSort('payment_amount')}>Payment<SortIcon k="payment_amount" /></th>
              <th className={`px-4 py-3 text-left text-xs font-bold ${t.textMuted} uppercase tracking-wider cursor-pointer hover:text-white transition`} onClick={() => handleSort('scheduled_date')}>Scheduled<SortIcon k="scheduled_date" /></th>
              <th className="w-8" />
            </tr>
          </thead>
          <tbody className={`${t.tableDivide} divide-y`}>
            {sortedLeads.map((lead) => {
              const statusConfig = getStatusConfig(lead.status || statusOptions[0]?.value);
              const statusHex = getHex(statusConfig.color);
              const isSelected = selectedIds.has(lead.id);
              const isProject = !!lead.project_id;

              return (
                <tr
                  key={lead.id}
                  className={`transition cursor-pointer ${isSelected ? t.tableRowSelected : isProject ? t.tableRowProject : t.tableRowHover}`}
                  onClick={() => editMode ? toggleSelect(lead.id) : onSelectLead(lead)}
                >
                  {editMode && (
                    <td className="px-4 py-3">
                      <input type="checkbox" checked={isSelected} onChange={() => toggleSelect(lead.id)}
                        onClick={(e) => e.stopPropagation()}
                        className="w-4 h-4 text-blue-600 focus:ring-blue-500" />
                    </td>
                  )}
                  <td className="px-4 py-3">
                    <div className={`text-sm font-semibold ${t.textPrimary}`}>{lead.name}</div>
                    <div className={`text-xs ${t.textMuted} mt-0.5`}>
                      {lead.category ? formatCategory(lead.category) : '—'}
                      {lead.phone && ` · ${formatPhone(lead.phone)}`}
                    </div>
                  </td>
                                    <td className="px-4 py-3">
                    <span
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
                      style={{ backgroundColor: `${statusHex}26`, color: statusHex }}
                    >
                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: statusHex }} />
                      {statusConfig.label}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {lead.quote_total ? <span className="font-bold text-emerald-500">{formatCurrency(lead.quote_total)}</span> : <span className={t.textEmpty}>—</span>}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {lead.payment_amount ? (
                      <div>
                        <span className="font-bold text-sky-500">{formatCurrency(lead.payment_amount)}</span>
                        {lead.payment_status && <span className={`text-xs ${t.textMuted} capitalize ml-1.5`}>{lead.payment_status}</span>}
                      </div>
                    ) : <span className={t.textEmpty}>—</span>}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {lead.scheduled_date ? (
                      <div>
                        <div className={t.textPrimary}>
                          {(() => { const [y,m,d] = lead.scheduled_date.split('T')[0].split('-').map(Number); return new Date(y,m-1,d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }); })()}
                        </div>
                        {lead.assigned_to && <div className={`text-xs ${t.textMuted} mt-0.5`}>{lead.assigned_to}</div>}
                      </div>
                    ) : <span className={t.textEmpty}>—</span>}
                  </td>
                  <td className="pr-4">
                    <ChevronRight className={`w-4 h-4 ${t.textMuted}`} />
                  </td>
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