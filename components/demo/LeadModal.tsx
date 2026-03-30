'use client';

import { useState } from 'react';
import Link from 'next/link';
import { X, Calendar, User, ArrowRight, Lock } from 'lucide-react';
import { Lead, STATUS_OPTIONS, fmt, Task, QuoteItem } from '@/components/demo/types';
import OverviewTab from '@/components/demo/tabs/OverviewTab';
import ScheduleTab from '@/components/demo/tabs/ScheduleTab';
import QuoteTab from '@/components/demo/tabs/QuoteTab';
import PaymentTab from '@/components/demo/tabs/PaymentTab';
import TasksTab from '@/components/demo/tabs/TasksTab';
import AIBriefTab from '@/components/demo/tabs/AIBriefTab';

type Props = {
  lead: Lead;
  darkMode: boolean;
  onClose: () => void;
  onUpdate: (updates: Partial<Lead>) => void;
};

export default function LeadModal({ lead, darkMode, onClose, onUpdate }: Props) {
  const [activeTab, setActiveTab] = useState<'overview' | 'schedule' | 'quote' | 'payment' | 'tasks' | 'ai'>('overview');

  const tabs = [
    { id: 'overview',  label: 'Overview'  },
    { id: 'schedule',  label: 'Schedule'  },
    { id: 'quote',     label: 'Quote'     },
    { id: 'payment',   label: 'Payment'   },
    { id: 'tasks',     label: 'Tasks'     },
    { id: 'ai',        label: '✦ AI Brief' },
  ];

  const s = STATUS_OPTIONS.find(o => o.value === lead.status) || STATUS_OPTIONS[0];

  const statusLabels: Record<string, string> = {
    new: 'New', contacted: 'Contacted', quoted: 'Quoted',
    scheduled: 'Scheduled', 'in-progress': 'In Progress',
    completed: 'Completed', cancelled: 'Cancelled',
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center z-50" onClick={onClose}>
      <div
        className="bg-white w-full sm:max-w-4xl sm:rounded-2xl shadow-2xl flex flex-col"
        style={{ maxHeight: '95vh', height: '95vh' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Hero header */}
        <div className="flex-shrink-0 relative overflow-hidden" style={{ background: '#312e81' }}>
          <div className="relative z-10 p-4 sm:p-6 pb-0">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1 min-w-0 mr-4">
                <p className="text-xs font-semibold mb-2" style={{ color: 'rgba(255,255,255,0.4)' }}>Lead</p>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight tracking-tight truncate">{lead.name}</h2>
                <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
                  Submitted {new Date(lead.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
              </div>
              <button onClick={onClose} className="w-9 h-9 flex items-center justify-center rounded-lg transition" style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)' }}>
                <X className="w-4 h-4 text-white/60" />
              </button>
            </div>

            {/* Status chips */}
            <div className="flex items-center gap-2 flex-wrap mb-4">
              <span className="px-3 py-1.5 text-xs font-bold rounded"
                style={{ background: `${s.hex}25`, color: s.hex, border: `1px solid ${s.hex}40` }}>
                {statusLabels[lead.status] || 'New'}
              </span>
              {lead.scheduled_date ? (
                <div className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded"
                  style={{ background: 'rgba(56,189,248,0.15)', border: '1px solid rgba(56,189,248,0.25)', color: '#7dd3fc' }}>
                  <Calendar className="w-3 h-3" />
                  {new Date(lead.scheduled_date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  {lead.scheduled_time && ` · ${lead.scheduled_time}`}
                </div>
              ) : (
                <div className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.35)' }}>
                  <Calendar className="w-3 h-3" /> Not scheduled
                </div>
              )}
              {lead.assigned_to && (
                <div className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded"
                  style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.65)' }}>
                  <User className="w-3 h-3" /> {lead.assigned_to}
                </div>
              )}
              {lead.quote_total && (
                <div className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded ${
                  lead.payment_status === 'paid' ? 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-300' : ''
                }`} style={lead.payment_status !== 'paid' ? { background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.5)' } : {}}>
                  {lead.payment_status === 'paid' ? `✓ Paid — ${fmt(lead.quote_total)}` : `${fmt(lead.quote_total)} due`}
                </div>
              )}
            </div>

            {/* Tab bar */}
            <div className="flex items-center overflow-x-auto gap-0" style={{ scrollbarWidth: 'none' }}>
              {tabs.map(tab => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id as any)}
                  className="flex-shrink-0 px-4 py-3 text-xs font-semibold transition-all border-b-2 whitespace-nowrap"
                  style={{
                    color: activeTab === tab.id ? 'white' : 'rgba(255,255,255,0.4)',
                    borderBottomColor: activeTab === tab.id ? '#a5b4fc' : 'transparent',
                    background: 'transparent',
                  }}>
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto bg-gray-50">
          <div className="p-4 sm:p-6 space-y-4">
            {activeTab === 'overview' && <OverviewTab lead={lead} />}
            {activeTab === 'schedule' && <ScheduleTab lead={lead} onUpdate={onUpdate} />}
            {activeTab === 'quote'    && <QuoteTab    lead={lead} onUpdate={onUpdate} />}
            {activeTab === 'payment'  && <PaymentTab  lead={lead} onUpdate={onUpdate} />}
            {activeTab === 'tasks'    && <TasksTab    lead={lead} onUpdate={onUpdate} />}
            {activeTab === 'ai'       && <AIBriefTab  lead={lead} />}
          </div>
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 px-4 sm:px-6 py-4 bg-white border-t border-gray-100 flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 border-2 border-gray-100 bg-white hover:bg-gray-50 text-sm font-bold text-gray-600 rounded-xl transition">
            Close
          </button>
          <Link href="/signup" className="flex-[2] py-3 text-sm font-bold text-white text-center transition flex items-center justify-center gap-2 rounded-xl"
            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
            Start Free Trial <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}