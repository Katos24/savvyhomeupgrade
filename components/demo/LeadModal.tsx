'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  X, Calendar, User, ArrowRight,
  Camera, FileText, File, FileCode, FileSpreadsheet,
  Download, ChevronLeft, ChevronRight, Image, CheckCircle2, ChevronDown, ChevronUp,
} from 'lucide-react';
import { Lead, STATUS_OPTIONS, fmt } from '@/components/demo/types';
import OverviewTab from '@/components/demo/tabs/OverviewTab';
import ScheduleTab from '@/components/demo/tabs/ScheduleTab';
import QuoteTab from '@/components/demo/tabs/QuoteTab';
import PaymentTab from '@/components/demo/tabs/PaymentTab';
import TasksTab from '@/components/demo/tabs/TasksTab';
import AIBriefTab from '@/components/demo/tabs/AIBriefTab';

// ─── MOCK MEDIA DATA ──────────────────────────────────────────────────────────

const MOCK_BEFORE_PHOTOS = [
  'https://placehold.co/600x400/1e293b/475569?text=Before+Photo+1',
  'https://placehold.co/600x400/1e293b/475569?text=Before+Photo+2',
  'https://placehold.co/600x400/1e293b/475569?text=Before+Photo+3',
];
const MOCK_AFTER_PHOTOS = [
  'https://placehold.co/600x400/052e16/16a34a?text=After+Photo+1',
  'https://placehold.co/600x400/052e16/16a34a?text=After+Photo+2',
];

const MOCK_CUSTOMER_PHOTOS: Record<number, string[]> = {
  1: [
    'https://placehold.co/600x400/292524/a8a29e?text=Roof+Damage+1',
    'https://placehold.co/600x400/292524/a8a29e?text=Roof+Damage+2',
  ],
  2: [
    'https://placehold.co/600x400/292524/a8a29e?text=Kitchen+Before+1',
    'https://placehold.co/600x400/292524/a8a29e?text=Kitchen+Before+2',
  ],
  4: [
    'https://placehold.co/600x400/292524/a8a29e?text=Fence+Damage+1',
    'https://placehold.co/600x400/292524/a8a29e?text=Fence+Damage+2',
    'https://placehold.co/600x400/292524/a8a29e?text=Fence+Damage+3',
  ],
  6: [
    'https://placehold.co/600x400/292524/a8a29e?text=Roof+Leak+1',
    'https://placehold.co/600x400/292524/a8a29e?text=Roof+Leak+2',
  ],
};
const MOCK_DOCS = [
  { name: 'Insurance Claim Form.pdf',  uploadedBy: 'Mike T.', uploadedAt: '2026-03-15T10:00:00Z' },
  { name: 'Project Contract.docx',     uploadedBy: 'Admin',   uploadedAt: '2026-03-16T14:30:00Z' },
  { name: 'Materials Estimate.xlsx',   uploadedBy: 'Mike T.', uploadedAt: '2026-03-17T09:00:00Z' },
];

// ─── LIGHTBOX ─────────────────────────────────────────────────────────────────

function Lightbox({ photos, startIndex, label, onClose }: { photos: string[]; startIndex: number; label?: string; onClose: () => void }) {
  const [current, setCurrent] = useState(startIndex);
  return (
    <div
      className="fixed inset-0 z-[99999] bg-black/95 flex flex-col items-center justify-center"
      onClick={onClose}
    >
      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 py-4 z-10" onClick={e => e.stopPropagation()}>
        <span className="text-xs font-black text-white/40 uppercase tracking-widest">
          {label}{photos.length > 1 && ` · ${current + 1} / ${photos.length}`}
        </span>
        <button onClick={onClose} className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition">
          <X className="w-4 h-4 text-white" />
        </button>
      </div>

      {/* Image row */}
      <div className="flex items-center gap-3 px-4 w-full justify-center" onClick={e => e.stopPropagation()}>
        {photos.length > 1 && (
          <button onClick={() => setCurrent(c => (c - 1 + photos.length) % photos.length)}
            className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition shrink-0">
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>
        )}
        <img
          src={photos[current]}
          alt={`Photo ${current + 1}`}
          className="max-h-[70vh] max-w-full object-contain rounded-xl"
          style={{ maxWidth: photos.length > 1 ? 'calc(100vw - 120px)' : '92vw' }}
        />
        {photos.length > 1 && (
          <button onClick={() => setCurrent(c => (c + 1) % photos.length)}
            className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition shrink-0">
            <ChevronRight className="w-5 h-5 text-white" />
          </button>
        )}
      </div>

      {/* Thumbnails */}
      {photos.length > 1 && (
        <div className="absolute bottom-4 flex gap-2" onClick={e => e.stopPropagation()}>
          {photos.map((url, i) => (
            <button key={i} onClick={() => setCurrent(i)}
              className="w-10 h-10 rounded-lg overflow-hidden transition-all"
              style={{ opacity: i === current ? 1 : 0.4, border: i === current ? '2px solid white' : '2px solid transparent' }}>
              <img src={url} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── MEDIA TAB ────────────────────────────────────────────────────────────────

function MediaTab({ lead }: { lead: Lead }) {
  const [photoTab, setPhotoTab] = useState<'customer' | 'before' | 'after' | 'docs'>('customer');
  const [lightbox, setLightbox] = useState<{ photos: string[]; index: number; label: string } | null>(null);

// AFTER
const MOCK_CUSTOMER_PHOTOS: Record<number, string[]> = {
  1: [
    'https://placehold.co/600x400/292524/a8a29e?text=Roof+Damage+1',
    'https://placehold.co/600x400/292524/a8a29e?text=Roof+Damage+2',
  ],
  2: [
    'https://placehold.co/600x400/292524/a8a29e?text=Kitchen+Before+1',
    'https://placehold.co/600x400/292524/a8a29e?text=Kitchen+Before+2',
  ],
  4: [
    'https://placehold.co/600x400/292524/a8a29e?text=Fence+Damage+1',
    'https://placehold.co/600x400/292524/a8a29e?text=Fence+Damage+2',
    'https://placehold.co/600x400/292524/a8a29e?text=Fence+Damage+3',
  ],
  6: [
    'https://placehold.co/600x400/292524/a8a29e?text=Roof+Leak+1',
    'https://placehold.co/600x400/292524/a8a29e?text=Roof+Leak+2',
  ],
};

const customerPhotos = MOCK_CUSTOMER_PHOTOS[lead.id] || [];  const beforePhotos = MOCK_BEFORE_PHOTOS;
  const afterPhotos = MOCK_AFTER_PHOTOS;

  const getDocIcon = (name: string) => {
    const ext = name.split('.').pop()?.toLowerCase();
    if (ext === 'pdf') return <FileText className="w-5 h-5 text-rose-500" />;
    if (ext === 'xlsx' || ext === 'xls') return <FileSpreadsheet className="w-5 h-5 text-emerald-500" />;
    if (ext === 'doc' || ext === 'docx') return <FileCode className="w-5 h-5 text-blue-500" />;
    return <File className="w-5 h-5 text-slate-400" />;
  };

  const subTabs = [
    { id: 'customer', label: 'Customer',  count: customerPhotos.length },
    { id: 'before',   label: 'Before',    count: beforePhotos.length   },
    { id: 'after',    label: 'After',     count: afterPhotos.length    },
    { id: 'docs',     label: 'Documents', count: MOCK_DOCS.length      },
  ];

  const currentPhotos =
    photoTab === 'customer' ? customerPhotos :
    photoTab === 'before'   ? beforePhotos   :
    photoTab === 'after'    ? afterPhotos     : [];

  return (
    <>
      {lightbox && (
        <Lightbox
          photos={lightbox.photos}
          startIndex={lightbox.index}
          label={lightbox.label}
          onClose={() => setLightbox(null)}
        />
      )}

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        {/* Sub-tab bar */}
        <div className="flex border-b border-slate-100 bg-slate-50/50 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
          {subTabs.map(t => (
            <button
              key={t.id}
              onClick={() => setPhotoTab(t.id as any)}
              className={`flex items-center gap-1.5 px-4 py-3 text-xs font-black uppercase tracking-widest whitespace-nowrap border-b-2 transition-all ${
                photoTab === t.id
                  ? 'text-indigo-600 border-indigo-600'
                  : 'text-slate-400 border-transparent hover:text-slate-600'
              }`}
            >
              {t.id === 'docs' ? <FileText className="w-3.5 h-3.5" /> : <Camera className="w-3.5 h-3.5" />}
              {t.label}
              {t.count > 0 && (
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                  photoTab === t.id ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-200 text-slate-500'
                }`}>
                  {t.count}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="p-4 sm:p-5 min-h-[280px]">
          {/* Photo grids */}
          {photoTab !== 'docs' && (
            <>
              {currentPhotos.length > 0 ? (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {currentPhotos.map((url, i) => (
                    <button
                      key={i}
                      onClick={() => setLightbox({ photos: currentPhotos, index: i, label: subTabs.find(t => t.id === photoTab)?.label || '' })}
                      className="group aspect-square rounded-xl overflow-hidden border border-slate-100 hover:border-indigo-300 hover:shadow-md transition-all"
                    >
                      <img src={url} alt={`Photo ${i + 1}`} className="w-full h-full object-cover group-hover:opacity-90 transition" />
                    </button>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 border-2 border-dashed border-slate-100 rounded-2xl">
                  <Image className="w-8 h-8 text-slate-200 mb-3" />
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest">No photos yet</p>
                  <p className="text-[11px] text-slate-400 mt-1">Photos will appear here once uploaded</p>
                </div>
              )}
            </>
          )}

          {/* Documents */}
          {photoTab === 'docs' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {MOCK_DOCS.map((doc, i) => (
                <div key={i} className="flex items-center gap-3 p-4 rounded-2xl border border-slate-100 hover:border-indigo-200 hover:shadow-md transition-all group cursor-pointer">
                  <div className="w-11 h-11 rounded-xl bg-slate-50 flex items-center justify-center group-hover:bg-indigo-50 transition-colors shrink-0">
                    {getDocIcon(doc.name)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-black text-slate-800 truncate">{doc.name}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight mt-0.5">
                      {new Date(doc.uploadedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} · {doc.uploadedBy}
                    </p>
                  </div>
                  <Download className="w-4 h-4 text-slate-300 group-hover:text-indigo-400 transition-colors shrink-0" />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// ─── TYPES ────────────────────────────────────────────────────────────────────

type Props = {
  lead: Lead;
  darkMode: boolean;
  onClose: () => void;
  onUpdate: (updates: Partial<Lead>) => void;
};

// ─── MAIN MODAL ───────────────────────────────────────────────────────────────

export default function LeadModal({ lead, darkMode, onClose, onUpdate }: Props) {
const [activeTab, setActiveTab] = useState<'overview' | 'schedule' | 'quote' | 'payment' | 'tasks' | 'media' | 'ai'>('overview');
const [showStatusMenu, setShowStatusMenu] = useState(false);
const [showCompletedPrompt, setShowCompletedPrompt] = useState(false);

const handleStatusChange = (newStatus: string) => {
  onUpdate({ status: newStatus });
  setShowStatusMenu(false);
  if (newStatus === 'completed') setShowCompletedPrompt(true);
};
  const tabs = [
    { id: 'overview', label: 'Overview'  },
    { id: 'schedule', label: 'Schedule'  },
    { id: 'quote',    label: 'Quote'     },
    { id: 'payment',  label: 'Payment'   },
    { id: 'tasks',    label: 'Tasks'     },
    { id: 'media',    label: 'Media'     },
    { id: 'ai',       label: '✦ AI Brief' },
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
  onClick={e => { e.stopPropagation(); setShowStatusMenu(false); }}
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
<div className="relative">
  <button
    onClick={() => setShowStatusMenu(v => !v)}
    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded transition hover:opacity-80"
    style={{ background: `${s.hex}25`, color: s.hex, border: `1px solid ${s.hex}40` }}
  >
    {statusLabels[lead.status] || 'New'}
    <ChevronDown className="w-3 h-3" />
  </button>
  <AnimatePresence>
    {showStatusMenu && (
      <motion.div
        initial={{ opacity: 0, y: 4, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 4, scale: 0.97 }}
        transition={{ type: 'spring', damping: 28, stiffness: 320 }}
        className="absolute top-full left-0 mt-1.5 z-50 bg-[#1e1b4b] border border-white/10 rounded-xl shadow-2xl overflow-hidden min-w-[160px]"
      >
        {STATUS_OPTIONS.map(opt => (
          <button
            key={opt.value}
            onClick={() => handleStatusChange(opt.value)}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs font-bold hover:bg-white/10 transition text-left"
          >
            <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: opt.hex }} />
            <span style={{ color: lead.status === opt.value ? opt.hex : 'rgba(255,255,255,0.7)' }}>
              {opt.label}
            </span>
            {lead.status === opt.value && (
              <CheckCircle2 className="w-3 h-3 ml-auto" style={{ color: opt.hex }} />
            )}
          </button>
        ))}
      </motion.div>
    )}
  </AnimatePresence>
</div>
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
                  {lead.payment_status === 'paid' ? `Paid — ${fmt(lead.quote_total)}` : `${fmt(lead.quote_total)} due`}
                </div>
              )}
            </div>

            {/* Tab bar */}
            <div className="flex items-center overflow-x-auto gap-0" style={{ scrollbarWidth: 'none' }}>
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className="flex-shrink-0 px-4 py-3 text-xs font-semibold transition-all border-b-2 whitespace-nowrap"
                  style={{
                    color: activeTab === tab.id ? 'white' : 'rgba(255,255,255,0.4)',
                    borderBottomColor: activeTab === tab.id ? '#a5b4fc' : 'transparent',
                    background: 'transparent',
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Body */}
       {/* Body */}
<div className="flex-1 overflow-y-auto bg-gray-50">
  <div className="p-4 sm:p-6 space-y-4">

    {/* ✅ SUCCESS PROMPT (ADD HERE) */}
    <AnimatePresence>
      {showCompletedPrompt && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 16 }}
          transition={{ type: 'spring', damping: 28, stiffness: 320 }}
          className="mx-4 mb-4 sm:mx-6"
        >
          <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-5">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-black text-emerald-900 mb-1">
                  Job marked as completed!
                </p>
                <p className="text-xs text-emerald-700 leading-relaxed">
                  In the real app this would trigger a completion email to {lead.name}, update your revenue stats, and prompt you to collect final payment.
                </p>
              </div>
              <button
                onClick={() => setShowCompletedPrompt(false)}
                className="text-emerald-400 hover:text-emerald-600 transition shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-3 pt-3 border-t border-emerald-200 flex items-center justify-between">
              <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">
                Want this for real?
              </p>
              <Link
                href="/signup"
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-lg transition"
              >
                Start Free Trial <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>

    {/* Existing tabs */}
    {activeTab === 'overview' && <OverviewTab lead={lead} />}
    {activeTab === 'schedule' && <ScheduleTab lead={lead} onUpdate={onUpdate} />}
    {activeTab === 'quote'    && <QuoteTab    lead={lead} onUpdate={onUpdate} />}
    {activeTab === 'payment'  && <PaymentTab  lead={lead} onUpdate={onUpdate} />}
    {activeTab === 'tasks'    && <TasksTab    lead={lead} onUpdate={onUpdate} />}
    {activeTab === 'media'    && <MediaTab    lead={lead} />}
    {activeTab === 'ai'       && <AIBriefTab  lead={lead} />}

  </div>
</div>

        {/* Footer */}
        <div className="flex-shrink-0 px-4 sm:px-6 py-4 bg-white border-t border-gray-100 flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 border-2 border-gray-100 bg-white hover:bg-gray-50 text-sm font-bold text-gray-600 rounded-xl transition">
            Close
          </button>
          <Link
            href="/signup"
            className="flex-[2] py-3 text-sm font-bold text-white text-center transition flex items-center justify-center gap-2 rounded-xl"
            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
          >
            Start Free Trial <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}