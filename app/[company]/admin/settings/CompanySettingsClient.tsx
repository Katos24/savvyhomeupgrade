'use client';

import { useState } from 'react';
import { Settings, Workflow, Mail, Grid, FileText, ArrowLeft, Bell, Users, CreditCard, ChevronRight } from 'lucide-react';
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
  const [activeTab, setActiveTab] = useState<Tab | null>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get('tab');
      const valid: Tab[] = ['general','form','pipeline','email-templates','categories','quote-templates','team','billing','notifications'];
      if (tab && valid.includes(tab as Tab)) return tab as Tab;
    }
    return null;
  });

  const allItems = TAB_GROUPS.flatMap(g => g.items);
  const current = allItems.find(t => t.id === activeTab);

  // ── DETAIL VIEW ──
  if (activeTab && current) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <header className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-40">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-3">
            <button onClick={() => setActiveTab(null)}
              className="flex items-center gap-1.5 text-indigo-600 hover:text-indigo-800 font-semibold transition text-sm">
              <ArrowLeft className="w-4 h-4" /> Settings
            </button>
            <span className="text-slate-300">/</span>
            <span className="font-bold text-slate-900 text-sm">{current.label}</span>
            <div className="ml-auto">
              <a href={`/${company.slug}/dashboard`}
                className="hidden sm:flex items-center gap-1.5 text-slate-500 hover:text-slate-800 font-semibold transition text-sm px-3 py-1.5 rounded-lg hover:bg-slate-100">
                <ArrowLeft className="w-4 h-4" /> Dashboard
              </a>
            </div>
          </div>
        </header>
     <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
  {/* Intro */}
  <div className="mb-6 pb-6 border-b border-slate-200">
    <h2 className="text-xl font-bold text-slate-900 mb-1.5">{current.label}</h2>
    <p className="text-sm text-slate-500 leading-relaxed max-w-2xl">
      {{
        'general': "This is how your company appears to customers. Your logo and brand colors show up in every email and on your booking page. Add your phone number so customers can call you directly from the lead card.",
        'team': "Invite your crew or office staff. Team members can be assigned to leads, see their jobs on the dashboard, and get notified automatically when something changes on their assigned jobs.",
        'billing': "Manage your subscription, update your payment method, or switch between Basic and Pro plans. Changes take effect immediately.",
        'pipeline': "These are the stages a lead moves through — from New to Completed. You can drag leads between columns on your dashboard or change status from the card. Add custom stages like 'Awaiting Permit' or 'Follow Up' to match how you actually work.",
        'categories': "These are the types of jobs you do — like Roofing, HVAC, or Electrical. When a customer picks one on your booking form, we auto-create a task checklist for that job type. Set up your tasks once and they apply to every new lead in that category.",
        'quote-templates': "Pre-fill your quotes so you don't type the same line items every time. Create a template for each job type — when you send a quote for a roofing job, it auto-fills with your roofing prices. Edit the amounts per job and send.",
        'form': "This is what customers see when they visit your booking link. Add custom questions like 'What's your budget?' or 'Is this covered by warranty?' to gather the info you need upfront — so it shows on the lead card and you skip the back-and-forth calls.",
        'email-templates': "When you send a quote, schedule a job, or mark something as paid, the customer gets a branded email with your logo and colors. Preview what they look like and customize the color scheme to match your brand.",
        'notifications': "Control what emails you get — daily digest of new leads, reminders for upcoming jobs, and payment alerts. Stay on top of your pipeline without checking the dashboard constantly.",
      }[activeTab!]}
    </p>
  </div>

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

  // ── CARD GRID VIEW ──
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <header className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 sm:py-6 flex items-center justify-between gap-3">
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
          <a href={`/${company.slug}/dashboard`}
            className="flex items-center gap-1.5 text-slate-500 hover:text-slate-800 font-semibold transition text-sm px-3 py-1.5 rounded-lg hover:bg-slate-100 flex-shrink-0">
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Dashboard</span>
          </a>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8">
        {TAB_GROUPS.map((group) => (
          <div key={group.label}>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 px-1">
              {group.label}
            </p>
            <div className={`grid gap-3 ${group.items.length === 1 ? 'grid-cols-1' : group.items.length === 2 ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'}`}>
              {group.items.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className="bg-white border border-slate-200 rounded-xl p-5 hover:border-indigo-300 hover:shadow-md transition-all duration-200 text-left group flex flex-col"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center"
                        style={{ backgroundColor: `${item.color}15` }}
                      >
                        <Icon className="w-5 h-5" style={{ color: item.color }} />
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-400 transition mt-1" />
                    </div>
                    <p className="text-sm font-bold text-slate-800 group-hover:text-indigo-600 transition">{item.label}</p>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">{item.desc}</p>
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