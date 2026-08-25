'use client';

import React, { useState } from 'react';
import {
  User, Calendar, FileText, CreditCard, ListChecks,
  ImageIcon, MessageCircle, Bell, MoreHorizontal, Sparkles, X,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { can, type PlanTier } from '@/lib/permissions';

type MobileTabBarProps = {
  lead: any;
  company?: any;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onLockedTab?: (tabId: string) => void;
};

const ICONS: Record<string, any> = {
  overview: User,
  quote: FileText,
  schedule: Calendar,
  payment: CreditCard,
  tasks: ListChecks,
  photos: ImageIcon,
  reminders: Bell,
  activity: MessageCircle,
};

const LABELS: Record<string, string> = {
  overview: 'Overview',
  quote: 'Quote',
  schedule: 'Schedule',
  payment: 'Invoice',
  tasks: 'Tasks',
  photos: 'Media',
  reminders: 'Reminders',
  activity: 'Activity',
};

// Same visibility rules as the desktop tab strip in LeadModalHeader — kept
// in sync manually since there wasn't a shared source to import from.
function buildTabs(lead: any, company: any) {
  const planTier = (company?.plan_tier || 'free') as PlanTier;
  const isProject = !!lead.project_id;

  return [
    { id: 'overview', show: true, locked: false },
    { id: 'quote', show: isProject || !can(planTier, 'quotes'), locked: !can(planTier, 'quotes') },
    { id: 'schedule', show: isProject || !can(planTier, 'scheduling'), locked: !can(planTier, 'scheduling') },
    { id: 'payment', show: isProject || !can(planTier, 'quotes'), locked: !can(planTier, 'quotes') },
    { id: 'tasks', show: isProject || !can(planTier, 'custom_tasks'), locked: !can(planTier, 'custom_tasks') },
    { id: 'photos', show: isProject || !can(planTier, 'docs_on_card'), locked: !can(planTier, 'docs_on_card') },
    { id: 'reminders', show: isProject || !can(planTier, 'scheduling'), locked: !can(planTier, 'scheduling') },
    { id: 'activity', show: isProject, locked: false },
  ].filter(t => t.show);
}

const PRIMARY_COUNT = 4;

export default function MobileTabBar({ lead, company, activeTab, onTabChange, onLockedTab }: MobileTabBarProps) {
  const [showMore, setShowMore] = useState(false);
  const tabs = buildTabs(lead, company);

  if (tabs.length <= 1) return null;

  const primary = tabs.slice(0, PRIMARY_COUNT);
  const overflow = tabs.slice(PRIMARY_COUNT);
  const overflowHasActive = overflow.some(t => t.id === activeTab);

  const handleSelect = (tab: { id: string; locked: boolean }) => {
    if (tab.locked) { onLockedTab?.(tab.id); return; }
    onTabChange(tab.id);
    setShowMore(false);
  };

    const ItemButton = ({ tab }: { tab: { id: string; locked: boolean } }) => {
    const Icon = ICONS[tab.id];
    const isActive = activeTab === tab.id;
    return (
      <button
        onClick={() => handleSelect(tab)}
        className="flex-1 flex flex-col items-center justify-center gap-1 py-2.5 min-w-0"
      >
        <div
          className="relative flex items-center justify-center w-12 h-8 rounded-xl transition-colors"
          style={{ backgroundColor: isActive ? 'rgba(96,165,250,0.18)' : 'transparent' }}
        >
          <Icon
            className="w-5 h-5"
            style={{ color: isActive ? '#60a5fa' : 'rgba(255,255,255,0.65)' }}
          />
          {tab.locked && (
            <Sparkles className="w-3 h-3 text-yellow-400 absolute -top-1 -right-1.5" />
          )}
        </div>
        <span
          className="text-[11px] font-medium truncate max-w-full"
          style={{ color: isActive ? '#60a5fa' : 'rgba(255,255,255,0.65)' }}
        >
          {LABELS[tab.id]}
        </span>
      </button>
    );
  };

  return (
    <>
      {/* ── MORE SHEET ── */}
      <AnimatePresence>
        {showMore && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="sm:hidden fixed inset-0 bg-black/50 z-[220]"
            onClick={() => setShowMore(false)}
          >
            <motion.div
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl overflow-hidden"
              style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100">
                <p className="text-sm font-semibold text-gray-900">More</p>
                <button onClick={() => setShowMore(false)} className="w-7 h-7 flex items-center justify-center rounded-lg bg-gray-100">
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              </div>
              <div className="py-2">
                {overflow.map(tab => {
                  const Icon = ICONS[tab.id];
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => handleSelect(tab)}
                      className={`w-full flex items-center gap-3 px-5 py-3 text-sm transition ${
                        isActive ? 'text-blue-600 font-semibold bg-blue-50' : 'text-gray-700'
                      }`}
                    >
                      <Icon className="w-4 h-4 flex-shrink-0" />
                      {LABELS[tab.id]}
                      {tab.locked && <Sparkles className="w-3 h-3 text-yellow-400 ml-auto" />}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── BOTTOM BAR ── */}
            <div
        className="sm:hidden flex-shrink-0 flex items-stretch border-t border-white/15 shadow-[0_-4px_16px_rgba(0,0,0,0.25)]"
        style={{ background: '#0f172a', paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        {primary.map(tab => <ItemButton key={tab.id} tab={tab} />)}
                {overflow.length > 0 && (
          <button
            onClick={() => setShowMore(true)}
            className="flex-1 flex flex-col items-center justify-center gap-1 py-2.5 min-w-0"
          >
            <div
              className="flex items-center justify-center w-12 h-8 rounded-xl transition-colors"
              style={{ backgroundColor: overflowHasActive ? 'rgba(96,165,250,0.18)' : 'transparent' }}
            >
              <MoreHorizontal
                className="w-5 h-5"
                style={{ color: overflowHasActive ? '#60a5fa' : 'rgba(255,255,255,0.65)' }}
              />
            </div>
            <span
              className="text-[11px] font-medium"
              style={{ color: overflowHasActive ? '#60a5fa' : 'rgba(255,255,255,0.65)' }}
            >
              More
            </span>
          </button>
        )}
      </div>
    </>
  );
}