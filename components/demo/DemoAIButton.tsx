'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Sparkles, X, Send, ArrowRight, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const spring = { type: 'spring' as const, damping: 28, stiffness: 320 };

type Message = { role: 'user' | 'assistant'; content: string };

const DEMO_RESPONSES: Record<string, string> = {
  default: "Based on your current leads, you have 3 jobs that need follow-up today — Michael Johnson (Roofing, new), Amy Nguyen (Roofing, new), and Maria Garcia (Painting, contacted). I'd prioritize Michael first since he has storm damage and an insurance claim in progress.",
  revenue: "Your total pipeline value is $35,865. You've collected $1,475 from Robert Torres (paid). Pending revenue is $34,390 across 7 open jobs. Largest opportunity: Sarah Kim's kitchen remodel at $18,500.",
  followup: "3 leads need follow-up right now: Michael Johnson hasn't been contacted yet (submitted 20 min ago), Amy Nguyen has a site visit to schedule, and David Chen is waiting on a permit pull. I'd call Michael first — storm damage jobs move fast.",
  schedule: "James Park is scheduled for Apr 10 at 9:00 AM — AC diagnostic and refrigerant recharge. Assigned to Mike T. Lisa Morgan's fence job is in progress with 2 of 4 tasks done. No other jobs are formally scheduled yet.",
  unpaid: "6 jobs are unpaid totaling $30,940. Largest: Sarah Kim ($18,500 kitchen remodel, quoted). Most urgent: Lisa Morgan ($3,100 fence, in progress — partial payment received). I'd send Sarah a follow-up — she's been quoted for 3 hours.",
  priority: "Top 3 priorities today: 1) Call Michael Johnson — storm damage, insurance claim pending, high urgency. 2) Follow up with Sarah Kim — $18,500 quote sitting unaccepted. 3) Confirm James Park's appointment for Apr 10.",
};

const STARTERS = [
  { label: 'Who needs follow-up?',     key: 'followup'  },
  { label: "What's my pipeline value?", key: 'revenue'   },
  { label: "What's scheduled?",         key: 'schedule'  },
  { label: 'Which jobs are unpaid?',    key: 'unpaid'    },
];

function getResponse(input: string): string {
  const lower = input.toLowerCase();
  if (lower.includes('revenue') || lower.includes('money') || lower.includes('value') || lower.includes('pipeline')) return DEMO_RESPONSES.revenue;
  if (lower.includes('follow') || lower.includes('contact') || lower.includes('call')) return DEMO_RESPONSES.followup;
  if (lower.includes('schedul') || lower.includes('appoint') || lower.includes('calendar')) return DEMO_RESPONSES.schedule;
  if (lower.includes('unpaid') || lower.includes('payment') || lower.includes('invoice') || lower.includes('collect')) return DEMO_RESPONSES.unpaid;
  if (lower.includes('priorit') || lower.includes('today') || lower.includes('focus')) return DEMO_RESPONSES.priority;
  return DEMO_RESPONSES.default;
}

export default function DemoAIButton({ showNudge, onToggle }: { showNudge: boolean; onToggle: () => void }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const send = (text: string) => {
    if (!text.trim() || loading) return;
    const userMsg: Message = { role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    // Fake delay to feel real
    setTimeout(() => {
      setMessages(prev => [...prev, { role: 'assistant', content: getResponse(text) }]);
      setLoading(false);
    }, 900 + Math.random() * 600);
  };

  const handleToggle = () => {
    setOpen(v => !v);
    onToggle();
  };

  return (
    <div className="fixed bottom-5 right-4 sm:bottom-6 sm:right-6 z-[9999] flex flex-col items-end gap-3">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.95 }}
            transition={spring}
            className="bg-[#0f172a] border border-blue-500/20 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
            style={{ width: 'min(calc(100vw - 32px), 360px)', maxHeight: '72vh' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3.5 border-b border-white/10 shrink-0" style={{ background: '#1e1b4b' }}>
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-xl bg-blue-500/20 flex items-center justify-center">
                  <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                </div>
                <div>
                  <p className="text-white text-xs font-black">AI Assistant</p>
                  <p className="text-blue-400/60 text-[9px] font-bold uppercase tracking-widest">Demo mode</p>
                </div>
              </div>
              <button onClick={handleToggle} className="p-1.5 hover:bg-white/10 rounded-lg transition text-white/40 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ minHeight: 0 }}>
              {messages.length === 0 && (
                <div className="space-y-2">
                  <p className="text-white/20 text-[10px] font-black uppercase tracking-widest text-center mb-4">Ask about your leads</p>
                  {STARTERS.map(s => (
                    <button
                      key={s.key}
                      onClick={() => send(s.label)}
                      className="w-full text-left px-3.5 py-2.5 text-xs text-slate-300 bg-white/5 border border-white/5 rounded-xl hover:border-blue-500/40 hover:bg-blue-500/10 transition font-medium"
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              )}

              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className="max-w-[85%] px-3.5 py-2.5 text-xs leading-relaxed font-medium"
                    style={msg.role === 'user'
                      ? { background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: 'white', borderRadius: '14px 14px 3px 14px' }
                      : { background: '#1e293b', color: '#cbd5e1', border: '1px solid #334155', borderRadius: '14px 14px 14px 3px' }
                    }
                  >
                    {msg.content}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex justify-start">
                  <div className="px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-2xl">
                    <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Upgrade nudge */}
            {messages.length >= 2 && (
              <div className="px-4 py-2.5 border-t border-white/5 bg-blue-900/20 shrink-0">
                <Link href="/signup" className="flex items-center justify-between text-blue-300 hover:text-blue-200 transition">
                  <span className="text-[10px] font-black uppercase tracking-widest">Unlock full AI on your real data</span>
                  <ArrowRight className="w-3.5 h-3.5 shrink-0" />
                </Link>
              </div>
            )}

            {/* Input */}
            <div className="p-3 border-t border-white/10 flex gap-2 shrink-0">
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') send(input); }}
                placeholder="Ask about your leads..."
                className="flex-1 px-3.5 py-2.5 text-xs bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/20 focus:border-blue-500 outline-none"
              />
              <button
                onClick={() => send(input)}
                disabled={!input.trim() || loading}
                className="p-2.5 rounded-xl bg-blue-600 disabled:opacity-30 text-white transition hover:bg-blue-500 active:scale-95"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FAB */}
      <motion.button
        whileTap={{ scale: 0.92 }}
        whileHover={{ scale: 1.08 }}
        onClick={handleToggle}
        className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center shadow-2xl transition-all"
        style={{
          background: open ? '#4f46e5' : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
          boxShadow: '0 8px 32px rgba(99,102,241,0.4)',
        }}
      >
        {open
          ? <X className="w-6 h-6 text-white" />
          : <Sparkles className="w-6 h-6 text-white" />
        }
      </motion.button>
    </div>
  );
}