'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  X, Workflow, Grid, FileText, Mail, Users, CreditCard,
  ArrowRight, Copy, QrCode, ExternalLink, Globe, Phone, Settings,
} from 'lucide-react';

function TorresLogo({ size = 40 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="40" height="40" rx="10" fill="#0f172a"/>
      <polygon points="20,7 33,17 33,34 7,34 7,17" fill="#6366f1"/>
      <polygon points="20,5 34,16 6,16" fill="#818cf8"/>
      <rect x="25" y="9" width="4" height="8" rx="1" fill="#818cf8"/>
      <rect x="15" y="23" width="10" height="11" rx="1.5" fill="#1e1b4b"/>
      <rect x="7" y="21" width="7" height="7" rx="1" fill="#1e1b4b"/>
      <line x1="10.5" y1="21" x2="10.5" y2="28" stroke="#6366f1" strokeWidth="1"/>
      <line x1="7" y1="24.5" x2="14" y2="24.5" stroke="#6366f1" strokeWidth="1"/>
    </svg>
  );
}

const spring = { type: 'spring' as const, damping: 28, stiffness: 320 };

const CONFIG_ITEMS = [
  { icon: <Workflow className="w-5 h-5" />,  label: 'Pipeline',      desc: 'Customize your lead stages so every job moves through a process that makes sense for your business.', color: '#f59e0b', bg: '#fef3c7' },
  { icon: <Grid className="w-5 h-5" />,       label: 'Categories',    desc: 'Add your service types — each gets its own task checklist and pricing template that auto-loads on new jobs.', color: '#8b5cf6', bg: '#ede9fe' },
  { icon: <FileText className="w-5 h-5" />,  label: 'Booking Form',  desc: 'Control what customers fill out when they submit a request. Turn on address, photos, and custom questions.', color: '#f97316', bg: '#ffedd5' },
  { icon: <Mail className="w-5 h-5" />,       label: 'Automations',   desc: 'Personalize the emails customers receive for quotes, schedules, and payment reminders — all branded to you.', color: '#3b82f6', bg: '#dbeafe' },
  { icon: <Users className="w-5 h-5" />,      label: 'Team',          desc: 'Invite your crew and assign leads to specific people so nothing falls through the cracks.', color: '#0ea5e9', bg: '#e0f2fe' },
  { icon: <CreditCard className="w-5 h-5" />, label: 'Billing',       desc: 'Manage your plan and subscription.', color: '#10b981', bg: '#d1fae5' },
];

export default function SettingsPreviewCard({ onClose }: { onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[9998] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.92, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.92, y: 20 }}
        transition={spring}
        className="bg-[#0f172a] rounded-[2rem] w-full max-w-lg shadow-2xl overflow-hidden border border-white/10 max-h-[90vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Nav */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black text-indigo-400 uppercase tracking-widest">LEAD2PROJECT</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-white/40">← Dashboard</span>
            <button onClick={onClose} className="p-1.5 bg-white/5 hover:bg-white/10 rounded-lg transition">
              <X className="w-4 h-4 text-white/50" />
            </button>
          </div>
        </div>

        <div className="overflow-y-auto flex-1">
          {/* Company card */}
          <div className="mx-4 mt-4 bg-white rounded-2xl overflow-hidden">
            {/* Brand strip */}
            <div className="h-10 w-full" style={{ background: 'linear-gradient(to right, #667eea, #1c0866)' }} />

            <div className="px-5 py-4">
              {/* Logo + name row */}
              <div className="flex items-start justify-between mb-4 -mt-8">
               <div className="flex flex-col items-center">
  <div className="w-14 h-14 rounded-xl bg-white shadow-lg border border-gray-100 flex items-center justify-center overflow-hidden">
    <TorresLogo size={40} />
  </div>

  <p className="text-[10px] font-black text-gray-400 mt-1 uppercase tracking-widest">
    Logo
  </p>
</div>
                <button className="mt-8 flex items-center gap-1.5 px-4 py-2 bg-gray-900 text-white text-xs font-bold rounded-xl">
                  <Settings className="w-3 h-3" /> EDIT
                </button>
              </div>

              <p className="text-base font-black text-gray-900 mb-1">Torres Roofing & Construction</p>
              <span className="inline-block text-[10px] font-black px-3 py-1 rounded-full text-white mb-4" style={{ background: 'linear-gradient(to right, #667eea, #1c0866)' }}>
                PRO PLAN
              </span>

              {/* Booking link */}
              <div className="flex items-center justify-between bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 mb-4">
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-indigo-400" />
                  <div>
                    <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">Your Booking Link</p>
                    <p className="text-xs font-bold text-gray-700">lead2project.com/<span className="text-indigo-600">torres</span></p>
                  </div>
                </div>
                <button className="flex items-center gap-1 text-[10px] font-black text-gray-500 bg-white border border-gray-200 px-2.5 py-1.5 rounded-lg">
                  <Copy className="w-3 h-3" /> COPY
                </button>
              </div>

              {/* Info grid */}
              <div className="grid grid-cols-2 gap-x-6 gap-y-3 mb-4">
                <div>
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Support Email</p>
                  <div className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-gray-400" />
                    <span className="text-xs text-gray-700 font-medium">torres@email.com</span>
                  </div>
                </div>
                <div>
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Business Phone</p>
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-gray-400" />
                    <span className="text-xs text-gray-700 font-medium">(718) 555-0100</span>
                  </div>
                </div>
                <div>
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Company Website</p>
                  <div className="flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-gray-400" />
                    <span className="text-xs text-gray-700 font-medium">torresroofing.com</span>
                  </div>
                </div>
                <div>
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Brand Colors</p>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <div className="w-5 h-5 rounded-full border border-gray-200" style={{ backgroundColor: '#667eea' }} />
                      <span className="text-[10px] text-gray-500 font-mono">#667eea</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-5 h-5 rounded-full border border-gray-200" style={{ backgroundColor: '#1c0866' }} />
                      <span className="text-[10px] text-gray-500 font-mono">#1c0866</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="grid grid-cols-3 gap-2">
                <button className="flex flex-col items-center gap-1.5 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition">
                  <QrCode className="w-4 h-4 text-gray-500" />
                  <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">QR Code</span>
                </button>
                <button className="flex flex-col items-center gap-1.5 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition">
                  <ExternalLink className="w-4 h-4 text-gray-500" />
                  <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">View Form</span>
                </button>
                <button className="flex flex-col items-center gap-1.5 py-3 border border-indigo-200 bg-indigo-50 rounded-xl">
                  <Mail className="w-4 h-4 text-indigo-500" />
                  <span className="text-[9px] font-black text-indigo-600 uppercase tracking-widest">Digest On</span>
                </button>
              </div>
            </div>
          </div>

          {/* System Configuration */}
          <div className="px-4 pt-5 pb-2">
            <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-3">System Configuration</p>
            <div className="grid grid-cols-2 gap-3">
              {CONFIG_ITEMS.map((item, i) => (
                <div key={i} className="bg-white rounded-2xl p-4 flex flex-col gap-2">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: item.bg }}>
                    <span style={{ color: item.color }}>{item.icon}</span>
                  </div>
                  <p className="text-sm font-black text-gray-900">{item.label}</p>
                  <p className="text-[11px] text-gray-400 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="px-4 py-5">
            <Link
              href="/signup"
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-sm rounded-xl transition shadow-lg shadow-indigo-900/40"
            >
              Set up your account <ArrowRight className="w-4 h-4" />
            </Link>
            <p className="text-center text-[10px] text-white/20 mt-2">14-day free trial · Cancel anytime</p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}