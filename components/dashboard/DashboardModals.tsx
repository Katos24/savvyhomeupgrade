'use client';

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import {
  X, Send, Sparkles, Loader2, ArrowUp, Lock,
  Plus, Download, Check,
} from 'lucide-react';
import { can, type PlanTier } from '@/lib/permissions';

// ---------------------------------------------------------------------------
// Helper: Text color contrast
// ---------------------------------------------------------------------------
function isColorTooDark(hex: string): boolean {
  let c = hex.trim().replace('#', '');
  if (c.length === 3) c = c.split('').map((ch) => ch + ch).join('');
  const r = parseInt(c.substring(0, 2), 16);
  const g = parseInt(c.substring(2, 4), 16);
  const b = parseInt(c.substring(4, 6), 16);
  if (Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b)) return false;
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 < 0.5;
}

// ---------------------------------------------------------------------------
// AI Message Renderer
// ---------------------------------------------------------------------------

function AiMessageBody({ content, accentColor }: { content: string; accentColor: string }) {
  const renderInline = (text: string) =>
    text.split(/\*\*(.*?)\*\*/g).map((p, k) =>
      k % 2 === 1 ? <strong key={k} className="font-bold">{p}</strong> : p
    );

  return (
    <div className="space-y-2 text-[15px] leading-relaxed">
      {content.split('\n').map((line, j) => {
        if (!line.trim()) return null;
        if (/^[-*]\s/.test(line))
          return (
            <div key={j} className="flex gap-2.5">
              <span className="shrink-0 mt-2 w-1.5 h-1.5 rounded-full" style={{ backgroundColor: accentColor }} aria-hidden />
              <span>{renderInline(line.replace(/^[-*]\s/, ''))}</span>
            </div>
          );
        if (/^\d+\.\s/.test(line))
          return (
            <div key={j} className="flex gap-2">
              <span className="shrink-0 font-bold" style={{ color: accentColor }}>{line.match(/^\d+/)![0]}.</span>
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
  isVisible: boolean;
  onLockedFeature: (feature: string) => void;
  isDark?: boolean;
  accentColor?: string;
};

function getDateBoundaries() {
  const now = new Date();
  const weekEnd = new Date(now); weekEnd.setDate(now.getDate() + 7);
  return { now, weekEnd };
}

export function AiChatWidget({
  planTier, allLeads, company, isVisible, onLockedFeature, isDark = false, accentColor = '#2563eb'
}: AiChatWidgetProps) {
  const [showAiChat, setShowAiChat] = useState(false);
  const [aiMessages, setAiMessages] = useState<AiMessage[]>([]);
  const [aiInput, setAiInput] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [showScrollDown, setShowScrollDown] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  const isAccentDark = isColorTooDark(accentColor);
  const accentTextColor = isAccentDark ? '#ffffff' : '#000000';

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
    if (unpaid.length) qs.push(`${unpaid.length} unpaid job${unpaid.length > 1 ? 's' : ''} ($${unpaidTotal.toLocaleString('en-US', { maximumFractionDigits: 0 })})`);
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
          className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center shadow-2xl transition-all hover:-translate-y-1 active:scale-95 border ${
            isDark ? 'bg-[#0A0C14]/90 backdrop-blur-xl border-white/10' : 'bg-white/90 backdrop-blur-xl border-slate-200'
          }`}
        >
          <Sparkles className="w-5 h-5 mb-0.5" style={{ color: accentColor }} aria-hidden />
          <span className="text-[9px] font-black uppercase tracking-wider" style={{ color: accentColor }}>Pro</span>
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-5 right-4 sm:bottom-6 sm:right-6 z-[9999] flex flex-col items-end gap-3">
      {showAiChat && (
        <div
          className={`overflow-hidden shadow-2xl flex flex-col transition-all animate-in slide-in-from-bottom-6 zoom-in-95 duration-300 rounded-3xl border ${
            isDark ? 'bg-[#0A0C14]/95 backdrop-blur-2xl border-white/10' : 'bg-white/95 backdrop-blur-2xl border-slate-200 shadow-[0_10px_40px_rgba(0,0,0,0.1)]'
          }`}
          style={{ maxHeight: '72vh', width: 'min(calc(100vw - 32px), 400px)' }}
          role="dialog"
          aria-label="AI Assistant"
          aria-modal="true"
        >
          {/* Chat header */}
          <div className={`flex items-center justify-between px-5 py-4 shrink-0 border-b ${isDark ? 'border-white/10 bg-white/5' : 'border-slate-100 bg-slate-50/50'}`}>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full flex items-center justify-center shadow-sm" style={{ backgroundColor: `${accentColor}20` }}>
                <Sparkles className="w-4 h-4" style={{ color: accentColor }} />
              </div>
              <div>
                <h3 className={`font-bold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>AI Assistant</h3>
                <p className={`text-[11px] font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Powered by your data</p>
              </div>
            </div>
            <button
              onClick={() => setShowAiChat(false)}
              aria-label="Close AI assistant"
              className={`p-2 rounded-full transition-colors ${isDark ? 'hover:bg-white/10 text-slate-400 hover:text-white' : 'hover:bg-slate-200 text-slate-500 hover:text-slate-900'}`}
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
            className="flex-1 overflow-y-auto p-4 space-y-4"
            style={{ minHeight: 0 }}
            aria-live="polite"
          >
            {aiMessages.length === 0 && (
              <div className="space-y-2 mt-2">
                <p className={`text-[10px] font-bold uppercase tracking-widest text-center mb-4 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Suggested Queries</p>
                {aiStarterQuestions.map(q => (
                  <button
                    key={q}
                    onClick={() => sendAiMessage(q)}
                    className={`w-full text-left px-4 py-3 text-[13px] font-medium rounded-xl transition-all border ${
                      isDark 
                        ? 'bg-white/5 border-white/5 text-slate-300 hover:bg-white/10 hover:border-white/10' 
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 hover:shadow-sm'
                    }`}
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}

            {aiMessages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[85%] px-4 py-3 text-[14px] leading-relaxed shadow-sm ${
                    msg.role === 'user'
                      ? 'rounded-[20px_20px_4px_20px]'
                      : `rounded-[20px_20px_20px_4px] ${isDark ? 'bg-white/10 text-slate-200' : 'bg-slate-100 text-slate-800'}`
                  }`}
                  style={msg.role === 'user' ? { backgroundColor: accentColor, color: accentTextColor } : undefined}
                >
                  {msg.role === 'assistant' ? <AiMessageBody content={msg.content} accentColor={accentColor} /> : msg.content}
                </div>
              </div>
            ))}

            {aiLoading && (
              <div className="flex justify-start">
                <div className={`px-4 py-3 rounded-[20px_20px_20px_4px] shadow-sm ${isDark ? 'bg-white/10' : 'bg-slate-100'}`}>
                  <Loader2 className="w-4 h-4 animate-spin" style={{ color: accentColor }} aria-label="AI is thinking" />
                </div>
              </div>
            )}
            <div ref={chatBottomRef} />
          </div>

          {/* Scroll Down FAB */}
          {showScrollDown && (
            <div className="absolute bottom-20 left-0 right-0 flex justify-center pb-2 z-10 pointer-events-none">
              <button
                onClick={() => chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' })}
                aria-label="Scroll to latest message"
                className="p-2 rounded-full text-white shadow-lg pointer-events-auto hover:scale-110 transition-transform"
                style={{ backgroundColor: accentColor }}
              >
                <ArrowUp className="w-4 h-4 rotate-180" aria-hidden />
              </button>
            </div>
          )}

          {/* Input Area */}
          <div className={`p-3 shrink-0 border-t ${isDark ? 'border-white/10 bg-[#0A0C14]/80' : 'border-slate-100 bg-white/80'}`}>
            <div className={`flex gap-2 p-1.5 rounded-2xl border transition-colors focus-within:ring-2 focus-within:ring-offset-0 ${
              isDark ? 'bg-white/5 border-white/10 focus-within:border-transparent' : 'bg-slate-50 border-slate-200 focus-within:border-transparent'
            }`}
            style={{ '--tw-ring-color': `${accentColor}80` } as React.CSSProperties}
            >
              <input
                type="text"
                value={aiInput}
                onChange={e => setAiInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendAiMessage(aiInput); } }}
                placeholder="Ask about your leads..."
                className={`flex-1 px-3 py-2 text-[14px] bg-transparent outline-none ${
                  isDark ? 'text-white placeholder-slate-500' : 'text-slate-900 placeholder-slate-400'
                }`}
              />
              <button
                onClick={() => sendAiMessage(aiInput)}
                disabled={!aiInput.trim() || aiLoading}
                aria-label="Send message"
                className="p-2.5 rounded-xl disabled:opacity-40 transition-all active:scale-95 flex items-center justify-center shrink-0"
                style={{ backgroundColor: accentColor, color: accentTextColor }}
              >
                <Send className="w-4 h-4" aria-hidden />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Toggle Button */}
      <button
        data-tour="ai-chat"
        onClick={() => setShowAiChat(v => !v)}
        aria-label={showAiChat ? 'Close AI assistant' : 'Open AI assistant'}
        aria-expanded={showAiChat}
        className="w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center shadow-[0_8px_30px_rgba(0,0,0,0.2)] transition-all hover:scale-105 active:scale-95 border border-white/20"
        style={{
          backgroundColor: accentColor,
          color: accentTextColor,
          boxShadow: showAiChat ? 'none' : `0 8px 32px ${accentColor}60`,
        }}
      >
        {showAiChat
          ? <X className="w-6 h-6 sm:w-7 sm:h-7" aria-hidden />
          : <Sparkles className="w-6 h-6 sm:w-7 sm:h-7" aria-hidden />
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
  isDark?: boolean;
  accentColor?: string;
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
  csv_export: {
    icon: Download,
    title: 'CSV Export',
    desc: 'Download all your leads and job data as a spreadsheet for bookkeeping, reporting, or importing elsewhere.',
    plan: 'Basic',
    bullets: ['All lead fields included', 'Filter before exporting', 'Works with Excel, Sheets, QuickBooks'],
  },
};

export function LockedFeatureModal({ featureKey, companySlug, onClose, isDark = false, accentColor = '#2563eb' }: LockedFeatureModalProps) {
  if (!featureKey) return null;

  const info = FEATURE_INFO[featureKey] || {
    icon: Lock,
    title: 'Premium Feature',
    desc: 'This feature requires a higher plan.',
    plan: 'Basic',
    bullets: [],
  };
  const FeatureIcon = info.icon;
  const isAccentDark = isColorTooDark(accentColor);

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      {/* Blurred Overlay */}
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" aria-hidden="true" />
      
      {/* Modal Body */}
      <div
        className={`relative w-full sm:max-w-[400px] shadow-2xl overflow-hidden flex flex-col animate-in slide-in-from-bottom-8 sm:slide-in-from-bottom-4 zoom-in-95 duration-300 ${
          isDark ? 'bg-[#0A0C14] rounded-t-3xl sm:rounded-3xl border border-white/10' : 'bg-white rounded-t-3xl sm:rounded-3xl border border-slate-100'
        }`}
        onClick={e => e.stopPropagation()}
      >
        {/* Header Illustration Area */}
        <div className="relative overflow-hidden pt-10 pb-6 px-8 text-center">
          <div 
            className="absolute inset-0 opacity-10 pointer-events-none" 
            style={{ background: `radial-gradient(circle at 50% 0%, ${accentColor}, transparent 70%)` }} 
          />
          
          <div
            className="relative w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg border"
            style={{ backgroundColor: `${accentColor}15`, borderColor: `${accentColor}30` }}
          >
            <FeatureIcon className="w-8 h-8" style={{ color: accentColor }} />
          </div>
          
          <h3 className={`text-2xl font-bold tracking-tight mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            {info.title}
          </h3>
          <p className={`text-[15px] leading-relaxed max-w-[280px] mx-auto ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            {info.desc}
          </p>
        </div>

        {/* Feature Bullets */}
        {info.bullets.length > 0 && (
          <div className="px-8 pb-6">
            <div className="space-y-3.5">
              {info.bullets.map((b, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div 
                    className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 shadow-sm"
                    style={{ backgroundColor: accentColor }}
                  >
                    <Check className="w-3 h-3" style={{ color: isAccentDark ? '#fff' : '#000' }} />
                  </div>
                  <p className={`text-[14px] font-medium leading-snug ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    {b}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Area */}
        <div className={`px-6 pt-4 pb-6 sm:pb-6 grid gap-3 ${isDark ? 'bg-white/5 border-t border-white/10' : 'bg-slate-50 border-t border-slate-100'}`} style={{ paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom))' }}>
          
          <div className="flex justify-center mb-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border shadow-sm" style={{ backgroundColor: isDark ? '#ffffff10' : '#ffffff', borderColor: isDark ? '#ffffff20' : '#e2e8f0' }}>
              <Sparkles className="w-3 h-3" style={{ color: accentColor }} />
              <span className={`text-[10px] font-bold uppercase tracking-widest ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                {info.plan} Plan
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-2">
            <button
              onClick={onClose}
              className={`py-3.5 font-semibold text-[14px] rounded-xl transition active:scale-[0.97] border ${
                isDark ? 'bg-white/5 hover:bg-white/10 text-slate-300 border-white/10' : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200 shadow-sm'
              }`}
            >
              Maybe Later
            </button>
            <a
              href={`/${companySlug}/home?section=billing`}
              className="py-3.5 font-bold text-[14px] rounded-xl transition shadow-lg active:scale-[0.97] flex items-center justify-center"
              style={{
                backgroundColor: accentColor,
                color: isAccentDark ? '#ffffff' : '#000000',
                boxShadow: `0 4px 14px ${accentColor}40`,
              }}
            >
              View Plans
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}