'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Settings, Workflow, Mail, Grid, FileText, ArrowLeft } from 'lucide-react';
import GeneralTab from './tabs/GeneralTab';
import FormTab from './tabs/FormTab';
import PipelineTab from './tabs/PipelineTab';
import EmailTemplatesTab from './tabs/EmailTemplatesTab';
import CategoriesTab from './tabs/CategoriesTab';

type Tab = 'general' | 'form' | 'pipeline' | 'email-templates' | 'categories';

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
    { id: 'form' as Tab, label: 'Form Settings', icon: FileText },
    { id: 'pipeline' as Tab, label: 'Pipeline', icon: Workflow },
    { id: 'email-templates' as Tab, label: 'Email Templates', icon: Mail },
    { id: 'categories' as Tab, label: 'Categories', icon: Grid },
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
                  className="h-14 w-auto object-contain"
                />
              ) : (
                <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-2xl shadow-lg">
                  {company.name.charAt(0)}
                </div>
              )}
              <div>
                <h1 className="text-3xl font-bold text-slate-900">{company.name}</h1>
                <p className="text-sm text-slate-600">Company Settings</p>
              </div>
            </div>
            
            <a 
              href={`/${company.slug}/dashboard`} 
              className="flex items-center gap-2 text-slate-600 hover:text-slate-900 font-semibold transition px-4 py-2 rounded-lg hover:bg-slate-100"
            >
              <ArrowLeft className="w-5 h-5" />
              Dashboard
            </a>
          </div>
        </div>
      </header>

      {/* TABS NAVIGATION */}
      <div className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-2 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3 px-6 py-4 font-semibold whitespace-nowrap transition border-b-3 ${
                    activeTab === tab.id
                      ? 'border-blue-600 text-blue-600 bg-blue-50/50'
                      : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
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
        {activeTab === 'form' && <FormTab company={company} currentUser={currentUser} />}
        {activeTab === 'pipeline' && <PipelineTab company={company} currentUser={currentUser} />}
        {activeTab === 'email-templates' && <EmailTemplatesTab company={company} currentUser={currentUser} />}
        {activeTab === 'categories' && <CategoriesTab company={company} currentUser={currentUser} />}
      </div>
    </div>
  );
}