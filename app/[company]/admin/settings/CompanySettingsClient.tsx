'use client';

import { useState } from 'react';
import { Settings, Workflow, Mail, Grid, FileText, ArrowLeft, Bell, Users, CreditCard, ChevronRight, X } from 'lucide-react';
import GeneralTab from './tabs/GeneralTab';
import FormTab from './tabs/FormTab';
import PipelineTab from './tabs/PipelineTab';
import EmailTemplatesTab from './tabs/EmailTemplatesTab';
import CategoriesTab from './tabs/CategoriesTab';
import TeamTab from './tabs/TeamTab';
import BillingTab from './tabs/BillingTab';
import QuoteTemplatesTab from './tabs/QuoteTemplatesTab';
import NotificationsTab from './tabs/NotificationsTab';

type Tab = 'general' | 'form' | 'pipeline' | 'email-templates' | 'categories' | 'quote-templates' | 'team' | 'billing' | 'notifications';

const TAB_GROUPS = [
  {
    label: 'Company',
    items: [
      { id: 'general' as Tab,         label: 'General',         desc: 'Name, logo, contact info',        icon: Settings,  color: '#6366f1' },
      { id: 'team' as Tab,            label: 'Team',            desc: 'Members and permissions',          icon: Users,     color: '#0ea5e9' },
      { id: 'billing' as Tab,         label: 'Billing',         desc: 'Plan and subscription',            icon: CreditCard,color: '#10b981' },
    ],
  },
  {
    label: 'Pipeline',
    items: [
      { id: 'pipeline' as Tab,        label: 'Pipeline',        desc: 'Statuses and stages',              icon: Workflow,  color: '#f59e0b' },
      { id: 'categories' as Tab,      label: 'Categories',      desc: 'Job types and task templates',     icon: Grid,      color: '#8b5cf6' },
      { id: 'quote-templates' as Tab, label: 'Quote Templates', desc: 'Reusable line item templates',     icon: FileText,  color: '#ec4899' },
    ],
  },
  {
    label: 'Customer-facing',
    items: [
      { id: 'form' as Tab,            label: 'Lead Form',       desc: 'Public booking form settings',     icon: FileText,  color: '#f97316' },
      { id: 'email-templates' as Tab, label: 'Email Templates', desc: 'Quotes, schedules, payments',      icon: Mail,      color: '#3b82f6' },
    ],
  },
  {
    label: 'Notifications',
    items: [
      { id: 'notifications' as Tab,   label: 'Notifications',   desc: 'Daily digest and reminders',       icon: Bell,      color: '#ef4444' },
    ],
  },
];

export default function CompanySettingsClient({
  company,
  currentUser,
}: {
  company: any;
  currentUser: any;
}) {
  const [activeTab, setActiveTab] = useState<Tab | null>(null);

  const allItems = TAB_GROUPS.flatMap(g => g.items);
  const current = allItems.find(t => t.id === activeTab);

  // ── DETAIL VIEW ──
  if (activeTab && current) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-40">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-3">
            <button
              onClick={() => setActiveTab(null)}
              className="flex items-center gap-1.5 text-indigo-600 hover:text-indigo-800 font-semibold transition text-sm"
            >
              <ArrowLeft className="w-4 h-4" /> Settings
            </button>
            <span className="text-slate-300">/</span>
            <span className="font-bold text-slate-900 text-sm">{current.label}</span>
            <div className="ml-auto">
              <a
                href={`/${company.slug}/dashboard`}
                className="hidden sm:flex items-center gap-1.5 text-slate-500 hover:text-slate-800 font-semibold transition text-sm px-3 py-1.5 rounded-lg hover:bg-slate-100"
              >
                <ArrowLeft className="w-4 h-4" /> Dashboard
              </a>
            </div>
          </div>
        </header>

        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          {activeTab === 'general'         && <GeneralTab         company={company} currentUser={currentUser} />}
          {activeTab === 'form'            && <FormTab            company={company} currentUser={currentUser} />}
          {activeTab === 'pipeline'        && <PipelineTab        company={company} currentUser={currentUser} />}
          {activeTab === 'email-templates' && <EmailTemplatesTab  company={company} currentUser={currentUser} />}
          {activeTab === 'categories'      && <CategoriesTab      company={company} currentUser={currentUser} />}
          {activeTab === 'quote-templates' && <QuoteTemplatesTab  company={company} currentUser={currentUser} />}
          {activeTab === 'team'            && <TeamTab            company={company} currentUser={currentUser} />}
          {activeTab === 'billing'         && <BillingTab         company={company} currentUser={currentUser} />}
          {activeTab === 'notifications'   && <NotificationsTab   company={company} currentUser={currentUser} />}
        </div>
      </div>
    );
  }

  // ── MENU VIEW ──
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">

      {/* Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-40">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4 sm:py-6 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            {company.logo_url ? (
              <img src={company.logo_url} alt={company.name} className="h-10 w-auto object-contain flex-shrink-0" />
            ) : (
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                {company.name.charAt(0)}
              </div>
            )}
            <div>
              <h1 className="text-lg sm:text-2xl font-bold text-slate-900 truncate">{company.name}</h1>
              <p className="text-xs text-slate-500">Settings</p>
            </div>
          </div>
          <a
            href={`/${company.slug}/dashboard`}
            className="flex items-center gap-1.5 text-slate-500 hover:text-slate-800 font-semibold transition text-sm px-3 py-1.5 rounded-lg hover:bg-slate-100 flex-shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Dashboard</span>
          </a>
        </div>
      </header>

      {/* Card grid */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8">
        {TAB_GROUPS.map((group) => (
          <div key={group.label}>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 px-1">
              {group.label}
            </p>
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm divide-y divide-slate-100">
              {group.items.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className="w-full flex items-center gap-4 px-5 py-4 hover:bg-slate-50 transition text-left group"
                  >
                    {/* Icon bubble */}
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: `${item.color}20` }}
                    >
                      <Icon className="w-4.5 h-4.5" style={{ color: item.color }} />
                    </div>

                    {/* Text */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800">{item.label}</p>
                      <p className="text-xs text-slate-400 truncate">{item.desc}</p>
                    </div>

                    {/* Chevron */}
                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition flex-shrink-0" />
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}