'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Settings, Workflow, Mail, Grid, Bell, ArrowLeft } from 'lucide-react';
import GeneralTab from './tabs/GeneralTab';
import PipelineTab from './tabs/PipelineTab';
import EmailTemplatesTab from './tabs/EmailTemplatesTab';
import CategoriesTab from './tabs/CategoriesTab';
import NotificationsTab from './tabs/NotificationsTab';

type Tab = 'general' | 'pipeline' | 'email-templates' | 'categories' | 'notifications';

export default function CompanySettingsClient({ 
  company, 
  currentUser 
}: { 
  company: any; 
  currentUser: any; 
}) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>('general');

  const tabs = [
    { id: 'general' as Tab, label: 'General', icon: Settings },
    { id: 'pipeline' as Tab, label: 'Pipeline', icon: Workflow },
    { id: 'email-templates' as Tab, label: 'Email Templates', icon: Mail },
    { id: 'categories' as Tab, label: 'Categories', icon: Grid },
    { id: 'notifications' as Tab, label: 'Notifications', icon: Bell },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      
      {/* HEADER */}
      <header className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {company.logo_url ? (
                <img 
                  src={company.logo_url} 
                  alt={`${company.name} logo`}
                  className="h-12 w-auto object-contain"
                />
              ) : (
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg">
                  {company.name.charAt(0)}
                </div>
              )}
              <div>
                <h1 className="text-2xl font-bold text-slate-900">{company.name}</h1>
                <p className="text-sm text-slate-600">Company Settings</p>
              </div>
            </div>
            
            <a 
              href={`/${company.slug}/dashboard`} 
              className="flex items-center gap-2 text-slate-600 hover:text-slate-900 font-medium transition"
            >
              <ArrowLeft className="w-4 h-4" />
              Dashboard
            </a>
          </div>
        </div>
      </header>

      {/* TABS NAVIGATION */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-1 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-4 font-semibold whitespace-nowrap transition border-b-2 ${
                    activeTab === tab.id
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* TAB CONTENT */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {activeTab === 'general' && <GeneralTab company={company} currentUser={currentUser} />}
        {activeTab === 'pipeline' && <PipelineTab company={company} currentUser={currentUser} />}
        {activeTab === 'email-templates' && <EmailTemplatesTab company={company} currentUser={currentUser} />}
        {activeTab === 'categories' && <CategoriesTab company={company} currentUser={currentUser} />}
        {activeTab === 'notifications' && <NotificationsTab company={company} currentUser={currentUser} />}
      </div>
    </div>
  );
}
