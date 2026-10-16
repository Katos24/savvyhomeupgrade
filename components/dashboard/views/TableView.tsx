'use client';

import { useState } from 'react';
import { Edit2, X, Trash2, ChevronDown, ChevronRight, ArrowUp, ArrowDown } from 'lucide-react';
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
  isDark?: boolean;
  // Sorting happens on the server: `leads` arrives already sorted across the
  // whole company, not just the page in memory.
  sortKey: string | null;
  sortDir: 'asc' | 'desc';
  onSortChange: (key: string) => void;
}

/* ───────────────────────── helpers ───────────────────────── */

const formatCategory = (cat: string) =>
  !cat ? '' : cat.split('_').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(
    amount || 0
  );

const formatPhone = (phone: string) => {
  const cleaned = ('' + phone).replace(/\D/g, '');
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
  return match ? `(${match[1]}) ${match[2]}-${match[3]}` : phone;
};

const formatShortDate = (d: string) => {
  const [y, m, day] = d.split('T')[0].split('-').map(Number);
  if (!y || !m || !day) return '';
  return new Date(y, m - 1, day).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

// Status dot colors (the company picks these per stage).
const STATUS_COLORS: Record<string, string> = {
  blue: '#3b82f6', yellow: '#eab308', purple: '#a855f7', orange: '#f97316',
  green: '#22c55e', red: '#ef4444', gray: '#6b7280', indigo: '#6366f1', pink: '#ec4899',
};
const getHex = (color: string) => STATUS_COLORS[color] || '#3b82f6';

/* Money state. Green only for money received; amber for partly paid;
   neutral when nothing is paid yet (not overdue, just not paid). */
type Money = { label: string; tone: 'paid' | 'partial' | 'none'; amount: string; note: string | null };
function getMoney(lead: any): Money | null {
  const quote = parseFloat(lead.quote_total || 0) || 0;
  const paid = parseFloat(lead.payment_amount || 0) || 0;
  if (!quote && !paid) return null;
  if (lead.payment_status === 'paid' || (quote > 0 && paid >= quote)) {
    return { label: 'Paid', tone: 'paid', amount: formatCurrency(paid || quote), note: null };
  }
  if (paid > 0 && quote > paid) {
    return { label: 'Partly paid', tone: 'partial', amount: formatCurrency(quote), note: `${formatCurrency(quote - paid)} left` };
  }
  return { label: 'Not paid', tone: 'none', amount: formatCurrency(quote), note: null };
}

/* One set of tokens per theme (same palette as the dashboard). */
function tokens(isDark: boolean) {
  return isDark
    ? {
        card: 'bg-[#0f1420] border border-white/10',
        head: 'bg-white/[0.03]',
        headText: 'text-slate-400 hover:text-white',
        text: 'text-white',
        sub: 'text-slate-300',
        faint: 'text-slate-500',
        divide: 'divide-white/10',
        border: 'border-white/10',
        rowHover: 'hover:bg-white/[0.04]',
        rowSelected: 'bg-white/[0.07]',
        chip: 'bg-white/[0.06] text-slate-200',
        pill: 'bg-white/[0.06] text-slate-100 border border-white/10',
        menu: 'bg-[#141a27] border border-white/10',
        menuHead: 'bg-white/[0.03] text-slate-400',
        menuItem: 'text-slate-100 hover:bg-white/[0.06]',
        primaryBtn: 'bg-white text-slate-900 hover:bg-slate-100',
        secondaryBtn: 'border border-white/15 bg-transparent text-slate-200 hover:bg-white/[0.06]',
        paid: 'bg-emerald-500/15 text-emerald-300',
        partial: 'bg-amber-500/15 text-amber-300',
        none: 'bg-white/[0.06] text-slate-300',
        paidAmount: 'text-emerald-400',
        checkbox: 'accent-white',
      }
    : {
        card: 'bg-white border border-slate-200 shadow-sm',
        head: 'bg-slate-50',
        headText: 'text-slate-500 hover:text-slate-900',
        text: 'text-slate-900',
        sub: 'text-slate-600',
        faint: 'text-slate-400',
        divide: 'divide-slate-200',
        border: 'border-slate-200',
        rowHover: 'hover:bg-slate-50',
        rowSelected: 'bg-slate-100',
        chip: 'bg-slate-100 text-slate-700',
        pill: 'bg-white text-slate-800 border border-slate-200',
        menu: 'bg-white border border-slate-200',
        menuHead: 'bg-slate-50 text-slate-500',
        menuItem: 'text-slate-800 hover:bg-slate-50',
        primaryBtn: 'bg-slate-900 text-white hover:bg-slate-800',
        secondaryBtn: 'border border-slate-300 bg-white text-slate-800 hover:bg-slate-50',
        paid: 'bg-emerald-50 text-emerald-700',
        partial: 'bg-amber-50 text-amber-800',
        none: 'bg-slate-100 text-slate-700',
        paidAmount: 'text-emerald-600',
        checkbox: 'accent-slate-900',
      };
}

/* ───────────────────────── component ───────────────────────── */

export default function TableView({
  leads,
  onSelectLead,
  statusOptions,
  onBulkUpdate,
  onBulkDelete,
  teamMembers = [],
  categories = [],
  isDark = true,
  sortKey,
  sortDir,
  onSortChange,
}: TableViewProps) {
  const t = tokens(isDark);

  const [editMode, setEditMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [showActionsMenu, setShowActionsMenu] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [bulkActionLoading, setBulkActionLoading] = useState(false);
  // Inline status change: one lead goes through the bulk-update path with one id.
  const [statusPickerFor, setStatusPickerFor] = useState<number | null>(null);
  const [updatingStatusFor, setUpdatingStatusFor] = useState<number | null>(null);

  const getStatusConfig = (val: string) => statusOptions.find((s: any) => s.value === val) || statusOptions[0] || { label: val, color: 'gray' };

  const handleInlineStatusChange = async (leadId: number, status: string) => {
    if (!onBulkUpdate) return;
    setUpdatingStatusFor(leadId);
    try {
      await onBulkUpdate([leadId], { status });
      toast.success('Status updated');
    } catch {
      toast.error('Could not update status');
    } finally {
      setUpdatingStatusFor(null);
      setStatusPickerFor(null);
    }
  };

  const toggleEditMode = () => {
    setEditMode((e) => !e);
    setSelectedIds(new Set());
    setShowActionsMenu(false);
  };
  const toggleSelectAll = () => setSelectedIds(selectedIds.size === leads.length ? new Set() : new Set(leads.map((l) => l.id)));
  const toggleSelect = (id: number) => {
    const s = new Set(selectedIds);
    s.has(id) ? s.delete(id) : s.add(id);
    setSelectedIds(s);
  };

  const bulkAction = async (fn: () => Promise<void>, successMsg: string) => {
    setBulkActionLoading(true);
    try {
      await fn();
      toast.success(successMsg);
      setSelectedIds(new Set());
      setShowActionsMenu(false);
    } catch {
      toast.error('Action failed');
    } finally {
      setBulkActionLoading(false);
    }
  };
  const handleBulkStatusChange = (status: string) =>
    bulkAction(() => onBulkUpdate!(Array.from(selectedIds), { status }), `Updated ${selectedIds.size} lead(s)`);
  const handleBulkAssign = (name: string) =>
    bulkAction(() => onBulkUpdate!(Array.from(selectedIds), { assigned_to: name }), `Assigned ${selectedIds.size} lead(s)`);
  const handleBulkCategoryChange = (cat: string) =>
    bulkAction(() => onBulkUpdate!(Array.from(selectedIds), { category: cat }), 'Service updated');
  const handleBulkDelete = async () => {
    setBulkActionLoading(true);
    try {
      await onBulkDelete!(Array.from(selectedIds));
      toast.success(`Deleted ${selectedIds.size} lead(s)`);
      setSelectedIds(new Set());
      setShowDeleteConfirm(false);
      setShowActionsMenu(false);
      setEditMode(false);
    } catch {
      toast.error('Delete failed');
    } finally {
      setBulkActionLoading(false);
    }
  };

  /* ── small pieces ── */

  const SortHeader = ({ label, k, className = '' }: { label: string; k?: string; className?: string }) => (
    <th
      onClick={k ? () => onSortChange(k) : undefined}
      className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wide select-none ${t.headText} ${k ? 'cursor-pointer' : ''} ${className}`}
    >
      <span className="inline-flex items-center gap-1">
        {label}
        {k && sortKey === k && (sortDir === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />)}
      </span>
    </th>
  );

  const StatusPill = ({ lead }: { lead: any }) => {
    const cfg = getStatusConfig(lead.status || statusOptions[0]?.value);
    const open = statusPickerFor === lead.id;
    return (
      <div className="relative inline-block">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            if (!editMode) setStatusPickerFor(open ? null : lead.id);
          }}
          disabled={updatingStatusFor === lead.id || !onBulkUpdate}
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition hover:opacity-80 disabled:opacity-60 ${t.pill}`}
        >
          <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: getHex(cfg.color) }} />
          {updatingStatusFor === lead.id ? 'Updating…' : cfg.label}
          {onBulkUpdate && <ChevronDown className="h-3 w-3 opacity-60" />}
        </button>
        {open && (
          <>
            <div
              className="fixed inset-0 z-20"
              onClick={(e) => {
                e.stopPropagation();
                setStatusPickerFor(null);
              }}
            />
            <div
              onClick={(e) => e.stopPropagation()}
              className={`absolute left-0 top-full z-30 mt-1 max-h-56 w-48 overflow-y-auto rounded-xl shadow-lg ${t.menu}`}
            >
              {statusOptions.map((s: any) => (
                <button
                  key={s.value}
                  type="button"
                  onClick={() => handleInlineStatusChange(lead.id, s.value)}
                  className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition ${t.menuItem}`}
                >
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: getHex(s.color) }} />
                  {s.label}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    );
  };

  const ReviewHint = ({ lead }: { lead: any }) =>
    lead.status === 'completed' ? (
      <p className={`mt-1 text-[11px] font-medium ${lead.review_request_sent_at ? t.faint : isDark ? 'text-amber-300' : 'text-amber-700'}`}>
        {lead.review_request_sent_at ? '★ Review sent' : '★ Ask for review'}
      </p>
    ) : null;

  const MoneyCell = ({ lead }: { lead: any }) => {
    const m = getMoney(lead);
    if (!m) return <span className={t.faint}>—</span>;
    return (
      <div>
        <p className={`text-sm font-semibold tabular-nums ${m.tone === 'paid' ? t.paidAmount : t.text}`}>{m.amount}</p>
        <div className="mt-1 flex flex-wrap items-center gap-1.5">
          <span className={`rounded px-1.5 py-0.5 text-[11px] font-medium ${t[m.tone]}`}>{m.label}</span>
          {m.note && <span className={`text-[11px] ${t.sub}`}>{m.note}</span>}
        </div>
      </div>
    );
  };

  const Checkbox = ({ checked, onChange }: { checked: boolean; onChange: () => void }) => (
    <input
      type="checkbox"
      checked={checked}
      onChange={onChange}
      onClick={(e) => e.stopPropagation()}
      className={`h-4 w-4 cursor-pointer rounded ${t.checkbox}`}
    />
  );

  const MenuSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <>
      <div className={`px-3 py-2 text-[11px] font-semibold uppercase tracking-wide ${t.menuHead}`}>{title}</div>
      <div className="max-h-40 overflow-y-auto">{children}</div>
    </>
  );

  /* ── render ── */

  return (
    <div className={`overflow-hidden rounded-2xl ${t.card}`}>
      {/* Toolbar */}
      <div className={`flex items-center justify-between gap-3 border-b px-4 py-3 sm:px-6 ${t.border}`}>
        <div className="flex min-w-0 items-center gap-3">
          {editMode ? (
            <>
              <label className={`flex cursor-pointer items-center gap-2 text-sm font-medium ${t.text}`}>
                <Checkbox checked={selectedIds.size === leads.length && leads.length > 0} onChange={toggleSelectAll} />
                {selectedIds.size > 0 ? `${selectedIds.size} selected` : 'Select all'}
              </label>
              {selectedIds.size > 0 && (
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowActionsMenu(!showActionsMenu)}
                    disabled={bulkActionLoading}
                    className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition disabled:opacity-50 ${t.primaryBtn}`}
                  >
                    {bulkActionLoading ? 'Working…' : 'Actions'}
                    <ChevronDown className="h-3.5 w-3.5" />
                  </button>
                  {showActionsMenu && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setShowActionsMenu(false)} />
                      <div className={`absolute left-0 top-full z-20 mt-2 w-56 overflow-hidden rounded-xl shadow-lg ${t.menu}`}>
                        {onBulkUpdate && (
                          <MenuSection title="Status">
                            {statusOptions.map((s: any) => (
                              <button
                                key={s.value}
                                type="button"
                                onClick={() => handleBulkStatusChange(s.value)}
                                className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition ${t.menuItem}`}
                              >
                                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: getHex(s.color) }} />
                                {s.label}
                              </button>
                            ))}
                          </MenuSection>
                        )}
                        {onBulkUpdate && teamMembers.length > 0 && (
                          <div className={`border-t ${t.border}`}>
                            <MenuSection title="Assign">
                              {teamMembers.map((m: any) => (
                                <button
                                  key={m.id ?? m.name}
                                  type="button"
                                  onClick={() => handleBulkAssign(m.name)}
                                  className={`w-full px-3 py-2 text-left text-sm transition ${t.menuItem}`}
                                >
                                  {m.name}
                                </button>
                              ))}
                            </MenuSection>
                          </div>
                        )}
                        {onBulkUpdate && categories.length > 0 && (
                          <div className={`border-t ${t.border}`}>
                            <MenuSection title="Service">
                              {categories.map((c: any) => (
                                <button
                                  key={c.value}
                                  type="button"
                                  onClick={() => handleBulkCategoryChange(c.value)}
                                  className={`w-full px-3 py-2 text-left text-sm transition ${t.menuItem}`}
                                >
                                  {c.label}
                                </button>
                              ))}
                            </MenuSection>
                          </div>
                        )}
                        {onBulkDelete && (
                          <button
                            type="button"
                            onClick={() => {
                              setShowActionsMenu(false);
                              setShowDeleteConfirm(true);
                            }}
                            className={`flex w-full items-center gap-2 border-t px-3 py-2.5 text-left text-sm font-medium text-red-600 transition hover:bg-red-500/10 ${t.border}`}
                          >
                            <Trash2 className="h-3.5 w-3.5" /> Delete ({selectedIds.size})
                          </button>
                        )}
                      </div>
                    </>
                  )}
                </div>
              )}
            </>
          ) : (
            <span className={`text-sm ${t.sub}`}>
              {leads.length} lead{leads.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={toggleEditMode}
          className={`inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${t.secondaryBtn}`}
        >
          {editMode ? (
            <>
              <X className="h-3.5 w-3.5" /> Done
            </>
          ) : (
            <>
              <Edit2 className="h-3.5 w-3.5" /> Select
            </>
          )}
        </button>
      </div>

      {/* Delete confirm */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 backdrop-blur-sm sm:items-center">
          <div className={`w-full max-w-sm rounded-2xl p-5 shadow-xl ${t.menu}`}>
            <h3 className={`text-base font-semibold ${t.text}`}>
              Delete {selectedIds.size} lead{selectedIds.size !== 1 ? 's' : ''}?
            </h3>
            <p className={`mt-1 text-sm ${t.sub}`}>They move to Deleted leads, where you can restore them.</p>
            <div className="mt-5 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={bulkActionLoading}
                className={`rounded-xl py-2.5 text-sm font-semibold transition ${t.secondaryBtn}`}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleBulkDelete}
                disabled={bulkActionLoading}
                className="rounded-xl bg-red-600 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-50"
              >
                {bulkActionLoading ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {leads.length === 0 ? (
        <div className={`py-16 text-center text-sm ${t.sub}`}>No leads to show.</div>
      ) : (
        <>
          {/* ── Phones: one card per lead ── */}
          <div className={`divide-y md:hidden ${t.divide}`}>
            {leads.map((lead) => {
              const isSelected = selectedIds.has(lead.id);
              return (
                <div
                  key={lead.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => (editMode ? toggleSelect(lead.id) : onSelectLead(lead))}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') editMode ? toggleSelect(lead.id) : onSelectLead(lead);
                  }}
                  className={`flex cursor-pointer gap-3 px-4 py-4 transition ${isSelected ? t.rowSelected : t.rowHover}`}
                >
                  {editMode && (
                    <div className="pt-0.5">
                      <Checkbox checked={isSelected} onChange={() => toggleSelect(lead.id)} />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className={`truncate text-[15px] font-semibold ${t.text}`}>{lead.name}</p>
                        <p className={`truncate text-[13px] ${t.sub}`}>
                          {lead.category ? formatCategory(lead.category) : 'No service'}
                          {lead.phone && ` · ${formatPhone(lead.phone)}`}
                        </p>
                      </div>
                      <StatusPill lead={lead} />
                    </div>
                    <div className="mt-2.5 flex items-end justify-between gap-3">
                      <MoneyCell lead={lead} />
                      {lead.scheduled_date && (
                        <p className={`shrink-0 text-right text-[13px] ${t.sub}`}>
                          {formatShortDate(lead.scheduled_date)}
                          {lead.assigned_to && <span className="block text-[12px]">{lead.assigned_to}</span>}
                        </p>
                      )}
                    </div>
                    <ReviewHint lead={lead} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* ── Tablet and desktop: the table ── */}
          <div className="hidden overflow-x-auto md:block">
            <table className={`min-w-full divide-y ${t.divide}`}>
              <thead className={t.head}>
                <tr>
                  {editMode && <th className="w-10 px-6 py-3" />}
                  <SortHeader label="Lead" k="name" />
                  <SortHeader label="Contact" className="hidden lg:table-cell" />
                  <SortHeader label="Status" k="status" />
                  <SortHeader label="Amount" k="quote_total" />
                  <SortHeader label="Scheduled" k="scheduled_date" />
                  <th className="w-10" />
                </tr>
              </thead>
              <tbody className={`divide-y ${t.divide}`}>
                {leads.map((lead) => {
                  const isSelected = selectedIds.has(lead.id);
                  return (
                    <tr
                      key={lead.id}
                      onClick={() => (editMode ? toggleSelect(lead.id) : onSelectLead(lead))}
                      className={`cursor-pointer transition ${isSelected ? t.rowSelected : t.rowHover}`}
                    >
                      {editMode && (
                        <td className="px-6 py-4">
                          <Checkbox checked={isSelected} onChange={() => toggleSelect(lead.id)} />
                        </td>
                      )}

                      {/* Lead: name + service */}
                      <td className="px-6 py-4">
                        <p className={`text-sm font-semibold ${t.text}`}>{lead.name}</p>
                        {lead.category ? (
                          <span className={`mt-1 inline-block rounded px-2 py-0.5 text-xs ${t.chip}`}>{formatCategory(lead.category)}</span>
                        ) : (
                          <span className={`mt-1 block text-xs ${t.faint}`}>No service</span>
                        )}
                      </td>

                      {/* Contact: email over phone */}
                      <td className="hidden px-6 py-4 text-sm lg:table-cell">
                        {lead.email || lead.phone ? (
                          <>
                            {lead.email && <p className={`max-w-[220px] truncate ${t.text}`}>{lead.email}</p>}
                            {lead.phone && <p className={t.sub}>{formatPhone(lead.phone)}</p>}
                          </>
                        ) : (
                          <span className={t.faint}>—</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        <StatusPill lead={lead} />
                        <ReviewHint lead={lead} />
                      </td>

                      {/* Amount + payment state */}
                      <td className="px-6 py-4">
                        <MoneyCell lead={lead} />
                      </td>

                      {/* Scheduled */}
                      <td className="px-6 py-4 text-sm">
                        {lead.scheduled_date ? (
                          <>
                            <p className={t.text}>{formatShortDate(lead.scheduled_date)}</p>
                            {lead.assigned_to && <p className={`text-xs ${t.sub}`}>{lead.assigned_to}</p>}
                          </>
                        ) : (
                          <span className={t.faint}>—</span>
                        )}
                      </td>

                      <td className="pr-4">
                        <ChevronRight className={`h-4 w-4 ${t.faint}`} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}