'use client';

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import {
  X, Send, Sparkles, Loader2, ArrowUp, Lock,
  Plus, List, Calendar, Download, Check,
} from 'lucide-react';
import { can, type PlanTier } from '@/lib/permissions';

// ---------------------------------------------------------------------------
// AI Message Renderer
// ---------------------------------------------------------------------------

function AiMessageBody({ content }: { content: string }) {
  const renderInline = (text: string) =>
    text.split(/\*\*(.*?)\*\*/g).map((p, k) =>
      k % 2 === 1 ? <strong key={k}>{p}</strong> : p
    );

  return (
    <div className="space-y-1">
      {content.split('\n').map((line, j) => {
        if (!line.trim()) return null;
        if (/^[-*]\s/.test(line))
          return (
            <div key={j} className="flex gap-2">
              <span className="text-blue-400 shrink-0 mt-0.5" aria-hidden></span>
              <span>{renderInline(line.replace(/^[-*]\s/, ''))}</span>
            </div>
          );
        if (/^\d+\.\s/.test(line))
          return (
            <div key={j} className="flex gap-2">
              <span className="text-blue-400 shrink-0 font-bold">{line.match(/^\d+/)![0]}.</span>
              <span>{renderInline(line.replace(/^\d+\.\s/, ''))}</span>
            </div>
          );
        return <p key={j}>{renderInline(line)}</p>;
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// AI Chat Widget
// ---------------------------------------------------------------------------

type AiMessage = { role: 'user' | 'assistant'; content: string };

type AiChatWidgetProps = {
  planTier: PlanTier;
  allLeads: any[];
  company: { name: string; slug: string; plan_tier?: string };
  isVisible: boolean; // hide when modals are open
  onLockedFeature: (feature: string) => void;
};

function getDateBoundaries() {
  const now = new Date();
  const weekEnd = new Date(now); weekEnd.setDate(now.getDate() + 7);
  return { now, weekEnd };
}

export function AiChatWidget({
  planTier, allLeads, company, isVisible, onLockedFeature,
}: AiChatWidgetProps) {
  const [showAiChat, setShowAiChat] = useState(false);
  const [aiMessages, setAiMessages] = useState<AiMessage[]>([]);
  const [aiInput, setAiInput] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [showScrollDown, setShowScrollDown] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [aiMessages, aiLoading]);

  const aiStarterQuestions = useMemo(() => {
    if (!allLeads.length) return [
      "What's scheduled this week?",
      'Which jobs need payment?',
      'Who are my biggest customers?',
      'What should I prioritize today?',
    ];
    const { now, weekEnd } = getDateBoundaries();
    const unpaid = allLeads.filter(l => l.quote_total && l.payment_status !== 'paid');
    const unpaidTotal = unpaid.reduce((s, l) => s + parseFloat(l.quote_total || 0), 0);
    const thisWeek = allLeads.filter(l => l.scheduled_date && new Date(l.scheduled_date) >= now && new Date(l.scheduled_date) <= weekEnd);
    const unassigned = allLeads.filter(l => !l.assigned_to && l.status !== 'completed' && l.status !== 'cancelled');
    const newLeads = allLeads.filter(l => l.status === 'new');
    const qs: string[] = [];
    if (unpaid.length) qs.push(`${unpaid.length} job${unpaid.length > 1 ? 's' : ''} unpaid ($${unpaidTotal.toLocaleString('en-US', { maximumFractionDigits: 0 })} total)`);
    if (thisWeek.length) qs.push(`${thisWeek.length} job${thisWeek.length > 1 ? 's' : ''} scheduled this week`);
    if (unassigned.length) qs.push(`${unassigned.length} job${unassigned.length > 1 ? 's' : ''} unassigned`);
    if (newLeads.length) qs.push(`${newLeads.length} new lead${newLeads.length > 1 ? 's' : ''} to review`);
    if (qs.length < 4) qs.push('What should I prioritize today?');
    if (qs.length < 4) qs.push('Who are my biggest customers?');
    return qs.slice(0, 4);
  }, [allLeads]);

  const sendAiMessage = useCallback(async (message: string) => {
    if (!message.trim() || aiLoading) return;
    const userMsg: AiMessage = { role: 'user', content: message };
    const updated = [...aiMessages, userMsg];
    setAiMessages(updated);
    setAiInput('');
    setAiLoading(true);

    const { now, weekEnd } = getDateBoundaries();
    const recentLeads = [...allLeads]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 50);
    const todayJobs = allLeads.filter(l => l.scheduled_date && new Date(l.scheduled_date).toDateString() === now.toDateString());
    const thisWeekJobs = allLeads.filter(l => l.scheduled_date && new Date(l.scheduled_date) >= now && new Date(l.scheduled_date) <= weekEnd);
    const unpaidJobs = allLeads.filter(l => l.quote_total && l.payment_status !== 'paid');
    const unassignedJobs = allLeads.filter(l => !l.assigned_to && l.status !== 'completed' && l.status !== 'cancelled');

    try {
      const res = await fetch('/api/ai/brief', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lead_id: null, customer_name: null, description: message,
          category: null, status: null, project_id: null,
          company_name: company.name, company_slug: company.slug, chat_mode: true,
          chat_history: updated.slice(-6),
          all_leads_summary: {
            summary: {
              total_leads: allLeads.length,
              new_leads: allLeads.filter(l => l.status === 'new').length,
              unpaid_jobs: unpaidJobs.length,
              unpaid_total: unpaidJobs.reduce((s, l) => s + parseFloat(l.quote_total || 0), 0),
              unassigned_jobs: unassignedJobs.length,
              today_scheduled: todayJobs.length,
              this_week_scheduled: thisWeekJobs.length,
            },
            today_schedule: todayJobs.map(l => ({ name: l.name, category: l.category, time: l.scheduled_time, assigned_to: l.assigned_to })),
            this_week_schedule: thisWeekJobs.map(l => ({ name: l.name, category: l.category, date: l.scheduled_date, assigned_to: l.assigned_to })),
            unpaid: unpaidJobs.map(l => ({ name: l.name, category: l.category, quote_total: l.quote_total, status: l.status })),
            unassigned: unassignedJobs.map(l => ({ name: l.name, category: l.category, status: l.status, created_at: l.created_at })),
            recent_leads: recentLeads.map(l => ({
              name: l.name, category: l.category, status: l.status, city: l.city,
              address_line_1: l.address_line_1 || null, zip_code: l.zip_code || null,
              notes: l.notes || null, description: l.description || null,
              quote_total: l.quote_total || null, payment_status: l.payment_status || null,
              scheduled_date: l.scheduled_date || null, assigned_to: l.assigned_to || null,
              created_at: l.created_at,
            })),
          },
          plan_tier: company.plan_tier || 'basic',
        }),
      });
      const data = await res.json();
      setAiMessages(prev => [
        ...prev,
        { role: 'assistant', content: data.success && data.reply ? data.reply : 'Something went wrong. Please try again.' },
      ]);
    } catch {
      setAiMessages(prev => [...prev, { role: 'assistant', content: 'Connection failed. Please try again.' }]);
    } finally {
      setAiLoading(false);
    }
  }, [aiMessages, aiLoading, allLeads, company]);

  if (!isVisible) return null;

  // Locked state for non-pro users
  if (!can(planTier, 'ai_chat')) {
    return (
      <div className="fixed bottom-5 right-4 sm:bottom-6 sm:right-6 z-[9999]">
        <button
          onClick={() => onLockedFeature('ai_chat')}
          aria-label="Upgrade to Pro for AI features"
          className="w-14 h-14 rounded-2xl flex flex-col items-center justify-center shadow-2xl transition-all hover:scale-110 active:scale-95"
          style={{ background: '#0f1a0f', border: '2px solid #1a3a1a' }}
        >
          <Sparkles className="w-5 h-5" style={{ color: '#2a4a2a' }} aria-hidden />
          <span className="text-[9px] font-black mt-0.5 uppercase" style={{ color: '#4ade80' }}>Pro</span>
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-5 right-4 sm:bottom-6 sm:right-6 z-[9999] flex flex-col items-end gap-3">
      {showAiChat && (
        <div
          className="overflow-hidden shadow-2xl flex flex-col animate-in slide-in-from-bottom-4 duration-200"
          style={{
            background: '#0f1a0f',
            border: '1px solid #1a3a1a',
            borderRadius: '20px',
            maxHeight: '72vh',
            width: 'min(calc(100vw - 32px), 400px)',
          }}
          role="dialog"
          aria-label="AI Assistant"
          aria-modal="true"
        >
          {/* Chat header */}
          <div
            className="flex items-center justify-between px-4 py-3.5 shrink-0"
            style={{ background: '#14532d', borderBottom: '1px solid #1a3a1a' }}
          >
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: 'rgba(74,222,128,0.15)' }}>
                <Sparkles className="w-3.5 h-3.5" style={{ color: '#4ade80' }} />
              </div>
              <span className="text-white font-bold text-sm">AI Assistant</span>
            </div>
            <button
              onClick={() => setShowAiChat(false)}
              aria-label="Close AI assistant"
              className="text-white/50 hover:text-white p-1.5 hover:bg-white/10 rounded-full transition"
            >
              <X className="w-4 h-4" aria-hidden />
            </button>
          </div>

          {/* Messages */}
          <div
            ref={chatScrollRef}
            onScroll={() => {
              const el = chatScrollRef.current;
              if (el) setShowScrollDown(el.scrollHeight - el.scrollTop - el.clientHeight > 60);
            }}
            className="flex-1 overflow-y-auto p-4 space-y-3"
            style={{ minHeight: 0 }}
            aria-live="polite"
            aria-label="Chat messages"
          >
            {aiMessages.length === 0 && (
              <div className="space-y-2">
                <p className="text-[10px] font-black uppercase tracking-widest text-center mb-3" style={{ color: '#4ade80' }}>Quick Insights</p>
                {aiStarterQuestions.map(q => (
                  <button
                    key={q}
                    onClick={() => sendAiMessage(q)}
                    className="w-full text-left px-3.5 py-2.5 text-xs text-slate-300 rounded-xl transition"
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(74,222,128,0.3)';
                      (e.currentTarget as HTMLButtonElement).style.background = 'rgba(74,222,128,0.05)';
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.06)';
                      (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.03)';
                    }}
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}

            {aiMessages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className="max-w-[82%] px-3 py-2.5 text-sm leading-relaxed"
                  style={msg.role === 'user'
                    ? { background: '#16a34a', color: 'white', borderRadius: '12px 12px 3px 12px' }
                    : { background: '#1a2a1a', color: '#e2e8f0', border: '1px solid #1a3a1a', borderRadius: '12px 12px 12px 3px' }
                  }
                >
                  {msg.role === 'assistant' ? <AiMessageBody content={msg.content} /> : msg.content}
                </div>
              </div>
            ))}

            {aiLoading && (
              <div className="flex justify-start">
                <div className="px-3 py-2.5 rounded-xl" style={{ background: '#1a2a1a', border: '1px solid #1a3a1a' }}>
                  <Loader2 className="w-4 h-4 animate-spin" style={{ color: '#4ade80' }} aria-label="AI is thinking" />
                </div>
              </div>
            )}
            <div ref={chatBottomRef} />
          </div>

          {/* Scroll to bottom */}
          {showScrollDown && (
            <div className="flex justify-center pb-1">
              <button
                onClick={() => chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' })}
                aria-label="Scroll to latest message"
                className="p-1.5 rounded-full text-white transition"
                style={{ background: '#16a34a' }}
              >
                <ArrowUp className="w-3.5 h-3.5 rotate-180" aria-hidden />
              </button>
            </div>
          )}

          {/* Input */}
          <div className="p-3 flex gap-2 shrink-0" style={{ borderTop: '1px solid #1a3a1a' }}>
            <input
              type="text"
              value={aiInput}
              onChange={e => setAiInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendAiMessage(aiInput); } }}
              placeholder="Ask about your leads..."
              aria-label="Message to AI assistant"
              className="flex-1 px-3.5 py-2.5 text-sm rounded-xl text-white placeholder-white/30 outline-none"
              style={{ background: '#0f1a0f', border: '1px solid #1a3a1a' }}
            />
            <button
              onClick={() => sendAiMessage(aiInput)}
              disabled={!aiInput.trim() || aiLoading}
              aria-label="Send message"
              className="p-2.5 rounded-xl disabled:opacity-40 text-white transition active:scale-95"
              style={{ background: '#16a34a' }}
            >
              <Send className="w-4 h-4" aria-hidden />
            </button>
          </div>
        </div>
      )}

      <button
        data-tour="ai-chat"
        onClick={() => setShowAiChat(v => !v)}
        aria-label={showAiChat ? 'Close AI assistant' : 'Open AI assistant'}
        aria-expanded={showAiChat}
        className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center shadow-2xl transition-all hover:scale-110 active:scale-95"
        style={{
          background: showAiChat ? '#15803d' : '#16a34a',
          boxShadow: '0 8px 32px rgba(22, 163, 74, 0.35)',
        }}
      >
        {showAiChat
          ? <X className="w-6 h-6 text-white" aria-hidden />
          : <Sparkles className="w-6 h-6 text-white" aria-hidden />
        }
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Locked Feature Modal
// ---------------------------------------------------------------------------

type LockedFeatureModalProps = {
  featureKey: string | null;
  companySlug: string;
  onClose: () => void;
};

const FEATURE_INFO: Record<string, { icon: React.ElementType; title: string; desc: string; plan: string; bullets: string[] }> = {
  create_lead: {
    icon: Plus,
    title: 'Create Leads Manually',
    desc: 'A customer calls, walks in, or sends a text — add them to your board in seconds without waiting for a form submission.',
    plan: 'Basic',
    bullets: ['Add leads from phone calls or walk-ins', 'Assign to team members instantly', 'Track every opportunity in one place'],
  },
  ai_chat: {
    icon: Sparkles,
    title: 'AI Assistant',
    desc: 'Ask questions about your business in plain English and get instant answers powered by your actual lead data.',
    plan: 'Pro',
    bullets: ['"What\'s scheduled this week?"', '"Which jobs are unpaid?"', '"Who are my biggest customers?"'],
  },
  table_view: {
    icon: List,
    title: 'Table View',
    desc: 'See all your leads in a sortable, filterable spreadsheet. Bulk-select, update, and export with ease.',
    plan: 'Basic',
    bullets: ['Sort by any column', 'Bulk update status or assignee', 'Export to CSV for bookkeeping'],
  },
  calendar_view: {
    icon: Calendar,
    title: 'Calendar View',
    desc: 'See every scheduled job on a calendar at a glance. Never double-book or miss a window.',
    plan: 'Basic',
    bullets: ['Visual day/week/month layout', 'Drag to reschedule', 'Color-coded by status'],
  },
  csv_export: {
    icon: Download,
    title: 'CSV Export',
    desc: 'Download all your leads and job data as a spreadsheet for bookkeeping, reporting, or importing elsewhere.',
    plan: 'Basic',
    bullets: ['All lead fields included', 'Filter before exporting', 'Works with Excel, Sheets, QuickBooks'],
  },
};

export function LockedFeatureModal({ featureKey, companySlug, onClose }: LockedFeatureModalProps) {
  if (!featureKey) return null;

  const info = FEATURE_INFO[featureKey] || {
    icon: Lock,
    title: 'Premium Feature',
    desc: 'This feature requires a higher plan.',
    plan: 'Basic',
    bullets: [],
  };
  const FeatureIcon = info.icon;

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-sm shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-slate-100 to-slate-50" />
          <div className="relative p-8 text-center">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg"
              style={{ background: '#0f172a', boxShadow: '0 8px 30px rgba(0,0,0,0.3)' }}
            >
              <FeatureIcon className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-2">{info.title}</h3>
            <p className="text-sm text-slate-600 leading-relaxed max-w-[260px] mx-auto">{info.desc}</p>
          </div>
        </div>

        {/* Bullets */}
        {info.bullets.length > 0 && (
          <div className="px-8 pb-2">
            <div className="space-y-2.5">
              {info.bullets.map((b, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-none bg-emerald-500 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                  <p className="text-sm text-slate-700 font-medium leading-snug">{b}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Plan badge */}
        <div className="flex justify-center py-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-yellow-400 rounded-none shadow-[3px_3px_0px_#0f172a]">
            <Sparkles className="w-3 h-3 text-slate-900" />
            <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">{info.plan} Plan</span>
          </div>
        </div>

        {/* CTA */}
        <div
          className="px-6 pb-6 pt-2 grid grid-cols-2 gap-3"
          style={{ paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom))' }}
        >
          <button
            onClick={onClose}
            className="py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm rounded-xl transition active:scale-[0.97]"
          >
            Maybe Later
          </button>
          <a
            href={`/${companySlug}/admin/settings#billing`}
            className="py-4 text-white font-black text-sm rounded-xl transition text-center shadow-lg active:scale-[0.97]"
            style={{
              background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
              boxShadow: '0 4px 20px rgba(59,130,246,0.3)',
            }}
          >
            View Plans
          </a>
        </div>
      </div>
    </div>
  );
}