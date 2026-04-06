
// AI Banner with 3 feature cards, appears after the 2x2 grid
'use client';
import { Sparkles, MessageCircle, FileText } from 'lucide-react';
import { useFadeIn } from '@/components/marketing/hooks';

function AIBanner() {
  const { ref, visible } = useFadeIn();

  return (
    <section
      ref={ref}
      className="px-6 py-16 border-y"
      style={{
        backgroundColor: '#080C14',
        borderColor: 'rgba(255,255,255,0.05)',
        opacity: visible ? 1 : 0,
        transform: visible ? 'none' : 'translateY(20px)',
        transition: 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      <div className="max-w-5xl mx-auto">
        {/* Label */}
        <div className="flex items-center gap-3 mb-8">
          <span className="inline-flex items-center gap-2 bg-violet-500/10 border border-violet-500/20 text-violet-400 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em]">
            <Sparkles className="w-3 h-3" /> AI Features — Pro Plan
          </span>
          <div style={{ height: 1, flex: 1, background: 'rgba(255,255,255,0.04)' }} />
        </div>

        {/* Headline + cards side by side on desktop */}
        <div className="grid lg:grid-cols-[1fr_2fr] gap-10 items-center">

          {/* Left — headline */}
          <div>
            <h3 className="text-3xl md:text-4xl font-black text-white tracking-tighter leading-[1.05] mb-3">
              AI that works<br />
              <span className="text-violet-400">before you do.</span>
            </h3>
            <p className="text-sm text-slate-500 font-medium leading-relaxed">
              Every lead gets analyzed the moment it arrives — no prompts, no setup, no extra steps.
            </p>
          </div>

          {/* Right — 3 feature cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                icon: <Sparkles size={16} />,
                title: 'AI Project Brief',
                desc: 'Instant summary of every lead — photos, scope, and job details — ready before your first call.',
                color: '#8B5CF6',
                bg: 'rgba(139,92,246,0.08)',
                border: 'rgba(139,92,246,0.15)',
              },
              {
                icon: <MessageCircle size={16} />,
                title: 'AI Assistant',
                desc: 'Ask anything about your pipeline. Draft follow-ups, get job summaries, pull lead details fast.',
                color: '#6366F1',
                bg: 'rgba(99,102,241,0.08)',
                border: 'rgba(99,102,241,0.15)',
              },
              {
                icon: <FileText size={16} />,
                title: 'AI Quote Draft',
                desc: 'AI suggests line items from job details. You review every number before anything gets sent.',
                color: '#A78BFA',
                bg: 'rgba(167,139,250,0.08)',
                border: 'rgba(167,139,250,0.15)',
                note: 'You approve before sending',
              },
            ].map((item, i) => (
              <div
                key={i}
                style={{
                  background: item.bg,
                  border: `1px solid ${item.border}`,
                  borderRadius: 16,
                  padding: '18px 16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 10,
                  opacity: visible ? 1 : 0,
                  transform: visible ? 'none' : 'translateY(12px)',
                  transition: `all 0.6s ease ${0.1 + i * 0.1}s`,
                }}
              >
                <div style={{ width: 32, height: 32, borderRadius: 10, background: `${item.color}20`, border: `1px solid ${item.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: item.color }}>
                  {item.icon}
                </div>
                <p style={{ fontSize: 13, fontWeight: 800, color: '#F1F5F9', margin: 0 }}>{item.title}</p>
                <p style={{ fontSize: 11, color: '#64748B', margin: 0, lineHeight: 1.6, fontWeight: 500 }}>{item.desc}</p>
                {item.note && (
                  <p style={{ fontSize: 9, color: item.color, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>✓ {item.note}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
