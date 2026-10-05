'use client';

import { useState, useEffect, useMemo } from 'react';
import { CalendarDays, AlertCircle, CheckCircle2, ChevronRight, Star } from 'lucide-react';
import { toLocalDate } from '@/lib/dates';

// End-of-road stages start collapsed — they only ever grow.
const COLLAPSED_BY_DEFAULT = ['completed', 'cancelled', 'lost'];

const dotColor: Record<string, string> = {
  blue: 'bg-blue-500',
  green: 'bg-emerald-500',
  yellow: 'bg-amber-500',
  purple: 'bg-purple-500',
  orange: 'bg-orange-500',
  red: 'bg-rose-500',
  gray: 'bg-slate-500',
  slate: 'bg-slate-500',
  indigo: 'bg-indigo-500',
  pink: 'bg-pink-500',
};

function isPastDue(dueDateStr?: string): boolean {
  const dueDate = toLocalDate(dueDateStr);
  if (!dueDate) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return dueDate < today;
}

const fmtMoney = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);

interface BoardViewProps {
  leads: any[];
  onSelectLead: (lead: any) => void;
  statusOptions: any[];
  isDark?: boolean;
  /** Called when a card is dropped on another column. Omit for a view-only board. */
  onMoveLead?: (lead: any, newStatus: string) => void;
}

export default function BoardView({
  leads,
  onSelectLead,
  statusOptions,
  isDark = true,
  onMoveLead,
}: BoardViewProps) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [dragOverCol, setDragOverCol] = useState<string | null>(null);
  const [draggingId, setDraggingId] = useState<number | null>(null);
  // Shows the card in its new column right away; cleared when fresh data arrives.
  const [optimistic, setOptimistic] = useState<Record<number, string>>({});

  useEffect(() => {
    setOptimistic({});
  }, [leads]);

  const columns = useMemo(() => {
    const firstValue = statusOptions[0]?.value;
    const known = new Set(statusOptions.map((s: any) => s.value));
    const byStatus: Record<string, any[]> = {};
    statusOptions.forEach((s: any) => (byStatus[s.value] = []));

    leads.forEach((lead) => {
      let status = optimistic[lead.id] ?? lead.status;
      if (!known.has(status)) status = firstValue; // unknown/legacy status → first column
      if (byStatus[status]) byStatus[status].push(lead);
    });

    return statusOptions.map((s: any) => {
      const items = byStatus[s.value] || [];
      const total = items.reduce((sum, l) => sum + (parseFloat(l.quote_total) || 0), 0);
      return { ...s, items, total };
    });
  }, [leads, statusOptions, optimistic]);

  const isCollapsed = (value: string) =>
    expanded[value] === undefined ? COLLAPSED_BY_DEFAULT.includes(value) : !expanded[value];

  const handleDrop = (status: string, e: React.DragEvent) => {
    e.preventDefault();
    setDragOverCol(null);
    setDraggingId(null);
    if (!onMoveLead) return;
    const id = Number(e.dataTransfer.getData('text/plain'));
    const lead = leads.find((l) => l.id === id);
    if (!lead) return;
    const current = optimistic[lead.id] ?? lead.status;
    if (current === status) return;
    setOptimistic((prev) => ({ ...prev, [lead.id]: status }));
    onMoveLead(lead, status);
  };

  const colBg = isDark ? 'bg-slate-900/50 border-slate-800/80' : 'bg-[#f5f1e8]/60 border-[#e7e2d8]';
  const colBgOver = isDark ? 'bg-slate-800/70 border-slate-600' : 'bg-[#efe9dc] border-[#d6cfc0]';
  const textMain = isDark ? 'text-slate-100' : 'text-[#1c1917]';
  const textSub = isDark ? 'text-slate-400' : 'text-[#78716c]';
  const textFaint = isDark ? 'text-slate-500' : 'text-[#a8a29e]';

  return (
    <div className="hidden md:flex gap-3 overflow-x-auto pb-3 font-sans items-start">
      {columns.map((col: any) => {
        const collapsed = isCollapsed(col.value);
        const over = dragOverCol === col.value;
        const dropProps = onMoveLead
          ? {
              onDragOver: (e: React.DragEvent) => {
                e.preventDefault();
                if (dragOverCol !== col.value) setDragOverCol(col.value);
              },
              onDragLeave: (e: React.DragEvent) => {
                if (!e.currentTarget.contains(e.relatedTarget as Node)) setDragOverCol(null);
              },
              onDrop: (e: React.DragEvent) => handleDrop(col.value, e),
            }
          : {};

        // ── Collapsed column: narrow strip with a count ──
        if (collapsed) {
          return (
            <button
              key={col.value}
              type="button"
              onClick={() => setExpanded((p) => ({ ...p, [col.value]: true }))}
              {...dropProps}
              className={`shrink-0 w-12 rounded-xl border flex flex-col items-center gap-3 py-3 transition-colors ${
                over ? colBgOver : colBg
              }`}
              style={{ minHeight: 220 }}
              title={`Show ${col.label}`}
            >
              <span className={`w-2 h-2 rounded-full ${dotColor[col.color] || 'bg-slate-500'}`} />
              <span className={`text-xs font-bold tabular-nums ${textMain}`}>{col.items.length}</span>
              <span
                className={`text-[11px] font-bold uppercase tracking-wider ${textSub}`}
                style={{ writingMode: 'vertical-rl' }}
              >
                {col.label}
              </span>
            </button>
          );
        }

        // ── Full column ──
        return (
          <div
            key={col.value}
            {...dropProps}
            className={`flex-1 min-w-[220px] max-w-[320px] rounded-xl border flex flex-col transition-colors ${over ? colBgOver : colBg}`}
          >
            <div className="flex items-center justify-between gap-2 px-3 pt-3 pb-2">
              <div className="flex items-center gap-2 min-w-0">
                <span className={`w-2 h-2 rounded-full shrink-0 ${dotColor[col.color] || 'bg-slate-500'}`} />
                <span className={`text-xs font-bold uppercase tracking-wider truncate ${textMain}`}>{col.label}</span>
                <span className={`text-xs font-semibold tabular-nums ${textFaint}`}>{col.items.length}</span>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                {col.total > 0 && <span className={`text-[11px] font-semibold tabular-nums ${textSub}`}>{fmtMoney(col.total)}</span>}
                {COLLAPSED_BY_DEFAULT.includes(col.value) && (
                  <button
                    type="button"
                    onClick={() => setExpanded((p) => ({ ...p, [col.value]: false }))}
                    className={`text-[11px] font-semibold ${textFaint} hover:underline`}
                  >
                    Hide
                  </button>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-2 px-2 pb-2 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 260px)' }}>
              {col.items.length === 0 && (
                <div className={`rounded-lg border border-dashed py-6 text-center text-[11px] ${isDark ? 'border-slate-800' : 'border-[#e7e2d8]'} ${textFaint}`}>
                  {onMoveLead ? 'Drop a job here' : 'No jobs'}
                </div>
              )}

              {col.items.map((lead: any) => {
                const amount = parseFloat(lead.quote_total) || 0;
                const isPaid = lead.payment_status === 'paid';
                const pastDue = !isPaid && (lead.is_past_due || isPastDue(lead.invoice_due_date || lead.due_date));
                const scheduled = toLocalDate(lead.scheduled_date);

                return (
                  <div
                    key={lead.id}
                    draggable={!!onMoveLead}
                    onDragStart={(e) => {
                      e.dataTransfer.setData('text/plain', String(lead.id));
                      e.dataTransfer.effectAllowed = 'move';
                      setDraggingId(lead.id);
                    }}
                    onDragEnd={() => {
                      setDraggingId(null);
                      setDragOverCol(null);
                    }}
                    onClick={() => onSelectLead(lead)}
                    className={`group rounded-lg border p-3 cursor-pointer transition-all ${
                      onMoveLead ? 'active:cursor-grabbing' : ''
                    } ${draggingId === lead.id ? 'opacity-40' : ''} ${
                      isDark
                        ? 'bg-slate-900 border-slate-800 hover:border-slate-600'
                        : 'bg-white border-[#e7e2d8] hover:shadow-sm hover:border-[#d6cfc0]'
                    }`}
                  >
                    <div className="flex items-baseline justify-between gap-2">
                      <p className={`text-sm font-bold truncate ${textMain}`}>{lead.name}</p>
                      {amount > 0 && (
                        <span
                          className={`text-xs font-bold tabular-nums shrink-0 ${
                            isPaid ? 'text-emerald-500' : pastDue ? 'text-rose-500' : textMain
                          }`}
                        >
                          {fmtMoney(amount)}
                        </span>
                      )}
                    </div>

                    <p className={`text-[11px] mt-0.5 truncate capitalize ${textSub}`}>
                      {lead.category?.replace(/_/g, ' ') || 'General Project'}
                    </p>

                                       <div className="flex items-center justify-between gap-2 mt-2">
                      {col.value === 'completed' ? (
                        // Finished jobs: show the review status instead of the date.
                        lead.review_request_sent_at ? (
                          <span className={`inline-flex items-center gap-1 text-[11px] ${textFaint}`}>
                            <Star className="w-3 h-3" /> Review sent
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-600">
                            <Star className="w-3 h-3" /> Ask for review
                          </span>
                        )
                      ) : (
                        <span className={`inline-flex items-center gap-1 text-[11px] ${scheduled ? textSub : textFaint}`}>
                          <CalendarDays className="w-3 h-3" />
                          {scheduled ? scheduled.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Unscheduled'}
                        </span>
                      )}
                      {isPaid ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-500">
                          <CheckCircle2 className="w-3 h-3" /> Paid
                        </span>
                      ) : pastDue ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-500">
                          <AlertCircle className="w-3 h-3" /> Past due
                        </span>
                      ) : (
                        <ChevronRight className={`w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity ${textFaint}`} />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}