'use client';

import { useState } from 'react';
import { Calendar, FileText, CreditCard, CheckSquare, Bell, Image, Lock, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

type LockedTabsPreviewProps = {
  companySlug: string;
  activeTab: string;
};

export default function LockedTabsPreview({ companySlug, activeTab }: LockedTabsPreviewProps) {
  const [activePreview, setActivePreview] = useState(activeTab || 'schedule');

  const previewTabs = [
    { id: 'schedule', icon: Calendar,    label: 'Schedule',  plan: 'Basic', desc: 'Set job dates, arrival windows, and manage your crew calendar.' },
    { id: 'quote',    icon: FileText,    label: 'Quote',     plan: 'Basic', desc: 'Build professional quotes with line items and send them in one click.' },
    { id: 'payment',  icon: CreditCard,  label: 'Billing',   plan: 'Basic', desc: 'Track payments, send reminders, and mark jobs as paid.' },
    { id: 'tasks',    icon: CheckSquare, label: 'Tasks',     plan: 'Basic', desc: 'Create task checklists for each job and track completion.' },
    { id: 'photos',   icon: Image,       label: 'Media',     plan: 'Basic', desc: 'Upload before & after photos and attach job documents.' },
    { id: 'ai',       icon: Sparkles,    label: 'AI',        plan: 'Pro',   desc: 'Get AI-generated job summaries, scope analysis, and smart suggestions.' },
  ];

  const active = previewTabs.find(t => t.id === activePreview) || previewTabs[0];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm"
    >
      {/* Tab bar */}
      <div className="flex items-center overflow-x-auto border-b border-slate-100" style={{ scrollbarWidth: 'none' }}>
        {previewTabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activePreview === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActivePreview(tab.id)}
              className="flex-shrink-0 flex items-center gap-1.5 px-3.5 py-3 text-[11px] font-bold transition-all border-b-2 whitespace-nowrap"
              style={{
                color: isActive ? '#3b82f6' : '#94a3b8',
                borderBottomColor: isActive ? '#3b82f6' : 'transparent',
                background: isActive ? '#eff6ff' : 'transparent',
              }}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
              <Lock className="w-2.5 h-2.5 opacity-50" />
            </button>
          );
        })}
      </div>

      {/* Blurred fake content */}
      <div className="relative">
        <div className="px-5 py-6 blur-[3px] select-none pointer-events-none opacity-40">
          <div className="space-y-3">
            <div className="h-4 bg-slate-200 rounded-full w-3/4" />
            <div className="h-4 bg-slate-200 rounded-full w-1/2" />
            <div className="h-10 bg-slate-100 rounded-xl w-full" />
            <div className="flex gap-2">
              <div className="h-8 bg-slate-100 rounded-lg flex-1" />
              <div className="h-8 bg-slate-100 rounded-lg flex-1" />
            </div>
            <div className="h-4 bg-slate-200 rounded-full w-2/3" />
          </div>
        </div>

        {/* Overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/60 backdrop-blur-[1px] px-6">
          <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center mb-3">
            <Lock className="w-5 h-5 text-blue-500" />
          </div>
          <p className="text-sm font-black text-slate-900 text-center">{active.desc}</p>
          <span className="text-[10px] font-black text-blue-500 uppercase tracking-wider mt-1.5 mb-4">
            Available on {active.plan}
          </span>
          <a
            href={`/${companySlug}/admin/settings#billing`}
            className="px-6 py-3 text-white font-black text-sm rounded-xl transition text-center"
            style={{ background: '#0f172a' }}
          >
            View Plans
          </a>
        </div>
      </div>
    </motion.div>
  );
}