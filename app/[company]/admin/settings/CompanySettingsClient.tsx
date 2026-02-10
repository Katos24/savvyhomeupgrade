'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Settings, Workflow, Mail, Grid, FileText, ArrowLeft, Menu, X } from 'lucide-react';
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
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const tabs = [
    { id: 'general' as Tab, label: 'General', icon: Settings },
    { id: 'form' as Tab, label: 'Form Settings', icon: FileText },
    { id: 'pipeline' as Tab, label: 'Pipeline', icon: Workflow },
    { id: 'email-templates' as Tab, label: 'Email Templates', icon: Mail },
    { id: 'categories' as Tab, label: 'Categories', icon: Grid },
  ];

  const handleTabChange = (tabId: Tab) => {
    setActiveTab(tabId);
    setShowMobileMenu(false);
  };

  const currentTab = tabs.find(t => t.id === activeTab);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      
      {/* HEADER - Mobile Optimized */}
      <header className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
          <div className="flex items-center justify-between gap-3">
            {/* Logo and Title */}
            <div className="flex items-center gap-3 min-w-0 flex-1">
              {company.logo_url ? (
                <img 
                  src={company.logo_url} 
                  alt={`${company.name} logo`}
                  className="h-10 sm:h-14 w-auto object-contain flex-shrink-0"
                />
              ) : (
                <div className="w-10 h-10 sm:w-14 sm:h-14 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-lg sm:text-2xl shadow-lg flex-shrink-0">
                  {company.name.charAt(0)}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <h1 className="text-xl sm:text-3xl font-bold text-slate-900 truncate">{company.name}</h1>
                <p className="text-xs sm:text-sm text-slate-600 hidden sm:block">Company Settings</p>
              </div>
            </div>
            
            {/* Desktop: Back to Dashboard */}
            <a 
              href={`/${company.slug}/dashboard`} 
              className="hidden md:flex items-center gap-2 text-slate-600 hover:text-slate-900 font-semibold transition px-4 py-2 rounded-lg hover:bg-slate-100"
            >
              <ArrowLeft className="w-5 h-5" />
              Dashboard
            </a>

            {/* Mobile: Menu Button */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="md:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition"
            >
              {showMobileMenu ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </header>

      {/* MOBILE MENU OVERLAY */}
      {showMobileMenu && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 md:hidden" onClick={() => setShowMobileMenu(false)}>
          <div className="bg-white w-4/5 max-w-sm h-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="p-4 border-b border-slate-200">
              <h2 className="text-lg font-bold text-slate-900">Settings Menu</h2>
            </div>
            <div className="p-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => handleTabChange(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-semibold transition text-left ${
                      activeTab === tab.id
                        ? 'bg-blue-600 text-white'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {tab.label}
                  </button>
                );
              })}
              <div className="border-t border-slate-200 mt-2 pt-2">
                <a 
                  href={`/${company.slug}/dashboard`} 
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg font-semibold text-slate-600 hover:bg-slate-100 transition"
                >
                  <ArrowLeft className="w-5 h-5" />
                  Back to Dashboard
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DESKTOP TABS NAVIGATION */}
      <div className="hidden md:block bg-white border-b border-slate-200 shadow-sm sticky top-[88px] z-30">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-2 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3 px-6 py-4 font-semibold whitespace-nowrap transition border-b-4 ${
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

      {/* MOBILE: Current Tab Indicator */}
      <div className="md:hidden bg-white border-b border-slate-200 px-4 py-3 sticky top-[72px] z-30">
        <div className="flex items-center gap-2 text-slate-600">
          {currentTab && (
            <>
              <currentTab.icon className="w-5 h-5" />
              <span className="font-semibold">{currentTab.label}</span>
            </>
          )}
        </div>
      </div>

      {/* TAB CONTENT */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {activeTab === 'general' && <GeneralTab company={company} currentUser={currentUser} />}
        {activeTab === 'form' && <FormTab company={company} currentUser={currentUser} />}
        {activeTab === 'pipeline' && <PipelineTab company={company} currentUser={currentUser} />}
        {activeTab === 'email-templates' && <EmailTemplatesTab company={company} currentUser={currentUser} />}
        {activeTab === 'categories' && <CategoriesTab company={company} currentUser={currentUser} />}
      </div>
    </div>
  );
}