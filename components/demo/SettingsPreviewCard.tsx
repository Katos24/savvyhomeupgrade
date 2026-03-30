'use client';

import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Workflow, Grid, FileText, Mail, Bell, Users, CreditCard, ArrowRight, Settings } from 'lucide-react';

const spring = { type: 'spring' as const, damping: 28, stiffness: 320 };

const SETTINGS_ITEMS = [
  { icon: <FileText className="w-4 h-4" />,  label: 'Booking form',    desc: 'Control what customers fill out',          color: '#f97316' },
  { icon: <Workflow className="w-4 h-4" />,   label: 'Pipeline stages', desc: 'Customize your workflow stages',           color: '#f59e0b' },
  { icon: <Grid className="w-4 h-4" />,       label: 'Categories',      desc: 'Task + quote templates per service',       color: '#8b5cf6' },
  { icon: <Mail className="w-4 h-4" />,       label: 'Email templates', desc: 'Brand every customer email',               color: '#3b82f6' },
  { icon: <Bell className="w-4 h-4" />,       label: 'Notifications',   desc: '6AM digest + follow-up reminders',        color: '#6366f1' },
  { icon: <Users className="w-4 h-4" />,      label: 'Team access',     desc: 'Invite crew members',                     color: '#0ea5e9' },
];

export default function SettingsPreviewCard({ onClose }: { onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9998] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.92, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.92, y: 20 }}
        transition={spring}
        className="bg-white rounded-[2rem] w-full max-w-md shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center">
              <Settings className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-black text-gray-900">Settings & customization</p>
              <p className="text-[10px] text-gray-400 mt-0.5">Everything is yours to configure</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 bg-gray-100 hover:bg-gray-200 rounded-xl transition">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {/* Identity preview */}
        <div className="px-6 py-4 border-b border-gray-100">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Your brand</p>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-black text-lg">
              T
            </div>
            <div>
              <p className="text-sm font-black text-gray-900">Torres Roofing & Co.</p>
              <p className="text-xs text-gray-400">lead2project.com/torres-roofing</p>
            </div>
            <div className="ml-auto flex gap-1.5">
              <div className="w-6 h-6 rounded-full bg-indigo-500" />
              <div className="w-6 h-6 rounded-full bg-violet-500" />
            </div>
          </div>
        </div>

        {/* Settings grid */}
        <div className="px-6 py-4">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Configuration modules</p>
          <div className="grid grid-cols-2 gap-2">
            {SETTINGS_ITEMS.map((item, i) => (
              <div key={i} className="flex items-center gap-2.5 p-3 bg-gray-50 border border-gray-100 rounded-xl">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${item.color}15` }}>
                  <span style={{ color: item.color }}>{item.icon}</span>
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-gray-800 truncate">{item.label}</p>
                  <p className="text-[9px] text-gray-400 truncate">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="px-6 pb-6">
          <Link
            href="/signup"
            className="w-full flex items-center justify-center gap-2 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-sm rounded-xl transition shadow-lg shadow-indigo-200"
          >
            Set up your account <ArrowRight className="w-4 h-4" />
          </Link>
          <p className="text-center text-[10px] text-gray-400 mt-2">14-day free trial · No credit card needed</p>
        </div>
      </motion.div>
    </motion.div>
  );
}