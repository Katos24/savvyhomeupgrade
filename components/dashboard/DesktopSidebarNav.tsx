'use client';

import React from 'react';
import {
  User, Calendar, FileText, CreditCard, ListChecks,
  ImageIcon, MessageCircle, Bell, Sparkles,
} from 'lucide-react';
import { can, type PlanTier } from '@/lib/permissions';

type DesktopSidebarNavProps = {
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

// Same visibility rules as MobileTabBar / the old header tab strip — kept in
// sync by hand since there's no single shared source for this list yet.
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

export default function DesktopSidebarNav({
  lead,
  company,
  activeTab,
  onTabChange,
  onLockedTab,
}: DesktopSidebarNavProps) {
  const tabs = buildTabs(lead, company);
  if (tabs.length <= 1) return null;

  return (
    <div className="hidden sm:flex w-[196px] flex-shrink-0 flex-col gap-0.5 border-r border-gray-100 bg-white py-3 px-2 overflow-y-auto">
      {tabs.map(tab => {
        const Icon = ICONS[tab.id];
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => {
              if (tab.locked) { onLockedTab?.(tab.id); return; }
              onTabChange(tab.id);
            }}
            className={`flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm text-left transition-colors ${
              isActive
                ? 'bg-blue-50 text-blue-700 font-semibold'
                : tab.locked
                ? 'text-blue-500 hover:bg-gray-50 font-medium'
                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800 font-medium'
            }`}
          >
            <Icon className="w-4 h-4 flex-shrink-0" />
            <span className="truncate flex-1">{LABELS[tab.id]}</span>
            {tab.locked && <Sparkles className="w-3 h-3 text-yellow-400 flex-shrink-0" />}
          </button>
        );
      })}
    </div>
  );
}