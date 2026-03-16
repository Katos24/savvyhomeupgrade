'use client';

import { useState } from 'react';
import { Calendar, Bell, Tag, User, CheckCircle2, DollarSign, Mail } from 'lucide-react';

interface CardsViewProps {
  leads: any[];
  onSelectLead: (lead: any) => void;
  statusOptions: any[];
}

export default function CardsView({ leads, onSelectLead, statusOptions }: CardsViewProps) {
  const [hoveredReminder, setHoveredReminder] = useState<number | null>(null);

  const formatCategory = (cat: string) => {
    if (!cat) return 'Uncategorized';
    return cat.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  };

  const getStatusConfig = (statusValue: string) =>
    statusOptions.find((s: any) => s.value === statusValue) || statusOptions[0];

  const getStatusColorHex = (colorName: string) => {
    const map: Record<string, string> = {
      blue: '#3b82f6', yellow: '#eab308', purple: '#a855f7', orange: '#f97316',
      green: '#10b981', red: '#ef4444', gray: '#64748b', indigo: '#6366f1', pink: '#ec4899',
    };
    return map[colorName] || '#3b82f6';
  };

  const formatScheduledTime = (time: string) => {
    if (!time) return '';
    const [h, m] = time.split(':');
    const hour = parseInt(h);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    return `${hour % 12 || 12}:${m} ${ampm}`;
  };

  const renderLeadCard = (lead: any) => {
    const statusConfig = getStatusConfig(lead.status || statusOptions[0]?.value);
    const statusHex = getStatusColorHex(statusConfig.color);
    const isProject = !!lead.project_id;
    const description = lead.description?.trim();

    return (
      <div
        key={lead.id}
        onClick={() => onSelectLead(lead)}
        className={`group relative border rounded-xl transition-all shadow-sm hover:shadow-lg cursor-pointer overflow-hidden ${
          lead.status === 'completed' ? 'opacity-40' : 'opacity-100'
        }`}
        style={{
          background: '#111318',
          borderColor: isProject ? `${statusHex}35` : '#232731',
        }}
      >
        {/* Status Accent Bar */}
        <div className="h-0.5 w-full" style={{ backgroundColor: statusHex, opacity: 0.8 }} />

        <div className="p-4">
          {/* Top row */}
          <div className="flex items-center justify-between mb-3">
            <span
              className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider"
              style={{
                backgroundColor: `${statusHex}18`,
                color: statusHex,
                border: `1px solid ${statusHex}35`,
              }}
            >
              {statusConfig.label}
            </span>

            <div className="flex items-center gap-2">
              {lead.follow_up_date && (
                <div
                  className="relative flex items-center"
                  onMouseEnter={() => setHoveredReminder(lead.id)}
                  onMouseLeave={() => setHoveredReminder(null)}
                >
                  <Bell className="w-3.5 h-3.5 text-red-400 animate-pulse" />
                  {hoveredReminder === lead.id && (
                    <div className="absolute bottom-full right-0 mb-2 p-3 shadow-xl z-10 min-w-[200px] rounded-lg"
                      style={{ background: '#1c2029', border: '1px solid #2e3340' }}>
                      <p className="text-xs text-red-400 font-bold mb-1 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        Follow-up: {new Date(lead.follow_up_date).toLocaleDateString()}
                      </p>
                      {lead.follow_up_notes && (
                        <p className="text-[11px] text-gray-500 italic">"{lead.follow_up_notes}"</p>
                      )}
                    </div>
                  )}
                </div>
              )}
              {isProject && (
                <span className="text-[10px] font-mono font-bold" style={{ color: '#4b5563' }}>
                  #{lead.project_number}
                </span>
              )}
            </div>
          </div>

          {/* Name */}
          <h3 className="font-bold text-base mb-1 line-clamp-1 transition-colors"
            style={{ color: '#e8eaf0' }}>
            {lead.name}
          </h3>

          {/* Description */}
          {description && (
            <p className="text-xs mb-3 line-clamp-2 leading-relaxed h-8" style={{ color: '#6b7280' }}>
              {description}
            </p>
          )}

          {/* Schedule */}
          {lead.scheduled_date && (
            <div className="flex items-center gap-1.5 text-[11px] font-medium mb-3 px-2 py-1.5 rounded-lg"
              style={{ background: '#1c2029', border: '1px solid #2e3340', color: '#9ca3af' }}>
              <Calendar className="w-3.5 h-3.5" style={{ color: '#6b7280' }} />
              {new Date(lead.scheduled_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              {lead.scheduled_time && ` at ${formatScheduledTime(lead.scheduled_time)}`}
            </div>
          )}

          {/* Payment & Quote */}
          {lead.quote_total && (
            <div className="flex items-center gap-1.5 mb-4 flex-wrap">
              <span className={`px-2 py-1 rounded text-[10px] font-bold flex items-center gap-1 ${
                lead.payment_status === 'paid'
                  ? 'text-emerald-400'
                  : lead.payment_status === 'partial'
                  ? 'text-orange-400'
                  : 'text-gray-400'
              }`}
                style={{
                  background: lead.payment_status === 'paid'
                    ? 'rgba(16,185,129,0.1)'
                    : lead.payment_status === 'partial'
                    ? 'rgba(249,115,22,0.1)'
                    : 'rgba(255,255,255,0.05)',
                  border: `1px solid ${lead.payment_status === 'paid'
                    ? 'rgba(16,185,129,0.25)'
                    : lead.payment_status === 'partial'
                    ? 'rgba(249,115,22,0.25)'
                    : '#2e3340'}`,
                }}>
                {lead.payment_status === 'paid'
                  ? <CheckCircle2 className="w-3 h-3" />
                  : <DollarSign className="w-3 h-3" />}
                {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(parseFloat(lead.quote_total))}
              </span>

              {lead.quote_accepted_at ? (
                <span className="px-2 py-1 rounded text-[10px] font-bold flex items-center gap-1"
                  style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.25)', color: '#818cf8' }}>
                  <CheckCircle2 className="w-3 h-3" /> Accepted
                </span>
              ) : lead.quote_declined_at ? (
                <span className="px-2 py-1 rounded text-[10px] font-bold"
                  style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#f87171' }}>
                  ✗ Declined
                </span>
              ) : (() => {
                try {
                  const log = typeof lead.quote_emails === 'string'
                    ? JSON.parse(lead.quote_emails)
                    : lead.quote_emails || [];
                  if (log.length > 0) return (
                    <span className="px-2 py-1 rounded text-[10px] font-bold flex items-center gap-1"
                      style={{ background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.25)', color: '#fbbf24' }}>
                      <Mail className="w-3 h-3" /> Sent
                    </span>
                  );
                } catch {}
                return null;
              })()}
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center gap-3 pt-3" style={{ borderTop: '1px solid #1c2029' }}>
            <div className="flex items-center gap-1 text-[10px] font-medium" style={{ color: '#4b5563' }}>
              <User className="w-3 h-3" />
              {lead.assigned_to || 'Unassigned'}
            </div>
            <div className="flex items-center gap-1 text-[10px] font-medium" style={{ color: '#4b5563' }}>
              <Tag className="w-3 h-3" />
              {formatCategory(lead.category)}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
      {leads.map(lead => renderLeadCard(lead))}
    </div>
  );
}