'use client';

import { useState } from 'react';
import { Calendar, FileText, CreditCard, CheckSquare, Bell, Image, FileIcon, AlertCircle } from 'lucide-react';
import SchedulingSection from './project-sections/SchedulingSection';
import QuoteSection from './project-sections/QuoteSection';
import PaymentSection from './project-sections/PaymentSection';
import DocumentsSection from './project-sections/DocumentsSection';
import PhotosSection from './project-sections/PhotosSection';
import TasksSection from './project-sections/TasksSection';
import RemindersSection from './project-sections/RemindersSection';


type ProjectSectionProps = {
  lead: any;
  currentUser: any;
  onRefresh: () => Promise<void>;
  statusOptions: any[];
  onUpdateStatus: (id: number, status: string, oldStatus: string) => Promise<boolean>;
  companySlug: string;
};

type TabType = 'schedule' | 'quote' | 'payment' | 'tasks' | 'reminders' | 'photos' | 'documents';

export default function ProjectSection({ lead, currentUser, onRefresh, statusOptions, onUpdateStatus, companySlug }: ProjectSectionProps) {
  const hasProject = !!lead?.project_id;
  const [planningTab, setPlanningTab] = useState<'schedule' | 'tasks' | 'reminders'>('schedule');
  const [financialsTab, setFinancialsTab] = useState<'quote' | 'payment' | 'documents' | 'photos'>('quote');

  if (!lead) {
    return (
      <div className="border-t border-blue-200 mt-4 pt-3">
        <p className="text-gray-500 text-sm">Loading project information...</p>
      </div>
    );
  }

  const planningTabs = [
    { 
      id: 'schedule' as const, 
      label: 'Schedule', 
      icon: Calendar,
      iconColor: '#22c55e',
      count: lead?.scheduled_date ? 1 : 0
    },
    { 
      id: 'tasks' as const, 
      label: 'Tasks', 
      icon: CheckSquare,
      iconColor: '#8b5cf6',
      count: lead?.tasks ? (Array.isArray(lead.tasks) ? lead.tasks.filter((t: any) => !t.completed).length : 0) : 0
    },
    { 
      id: 'reminders' as const, 
      label: 'Reminders', 
      icon: Bell,
      iconColor: '#ef4444',
      count: lead?.follow_up_date ? 1 : 0
    },
  ];

  const financialsTabs = [
    { 
      id: 'quote' as const, 
      label: 'Quote', 
      icon: FileText,
      iconColor: '#3b82f6',
      count: lead?.quote_data?.length || 0
    },
    { 
      id: 'payment' as const, 
      label: 'Payment Status', 
      icon: CreditCard,
      iconColor: '#f59e0b',
      count: lead?.payment_amount ? 1 : 0
    },
    { 
      id: 'documents' as const, 
      label: 'Docs', 
      icon: FileIcon,
      iconColor: '#6366f1',
      count: lead?.documents ? (Array.isArray(lead.documents) ? lead.documents.length : JSON.parse(lead.documents).length) : 0
    },
    { 
      id: 'photos' as const, 
      label: 'Photos', 
      icon: Image,
      iconColor: '#ec4899',
      count: (() => {
        const beforePhotos = lead?.before_photos ? (typeof lead.before_photos === 'string' ? JSON.parse(lead.before_photos) : lead.before_photos) : [];
        const afterPhotos = lead?.after_photos ? (typeof lead.after_photos === 'string' ? JSON.parse(lead.after_photos) : lead.after_photos) : [];
        return beforePhotos.length + afterPhotos.length;
      })()
    },
  ];

  return (
    <div className="space-y-3">
      
      {!hasProject && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
          <div className="p-2 bg-amber-100 rounded-lg">
            <AlertCircle className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <p className="text-amber-900 font-semibold text-sm">
              Convert to Project First
            </p>
            <p className="text-amber-700 text-xs mt-1">
              To use scheduling, quotes, and payments, convert this lead to a project
            </p>
          </div>
        </div>
      )}

      {hasProject && (
        <div className="space-y-4">
          
          {/* PROJECT PLANNING SECTION */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 border-b border-blue-200">
              <h3 className="text-xs font-bold text-blue-900 uppercase tracking-wide mb-3 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Project Planning
              </h3>
              <div 
                className="flex gap-2 overflow-x-auto snap-x snap-mandatory pb-1"
                style={{
                  scrollbarWidth: 'none',
                  msOverflowStyle: 'none',
                  WebkitOverflowScrolling: 'touch'
                }}
              >
                {planningTabs.map((tab) => {
                  const IconComponent = tab.icon;
                  const isActive = planningTab === tab.id;
                  
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setPlanningTab(tab.id)}
                      className={`
                        flex-shrink-0 snap-start px-4 py-2.5 rounded-lg font-medium transition-all
                        flex items-center gap-2.5 relative group
                        ${isActive
                          ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' 
                          : 'bg-white text-gray-700 border border-gray-200 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700'
                        }
                      `}
                    >
                      <IconComponent 
                        className="w-4 h-4" 
                        style={{ color: isActive ? '#ffffff' : tab.iconColor }}
                      />
                      <span className="text-sm">{tab.label}</span>
                      {tab.count > 0 && (
                        <span className={`
                          min-w-[20px] h-5 px-1.5 rounded-full text-xs font-bold
                          flex items-center justify-center
                          ${isActive
                            ? 'bg-blue-500 text-white' 
                            : 'bg-gray-100 text-gray-600 group-hover:bg-blue-100 group-hover:text-blue-700'
                          }
                        `}>
                          {tab.count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* PLANNING CONTENT */}
            <div className="bg-white">
              {planningTab === 'schedule' && (
                <SchedulingSection
                  lead={lead}
                  currentUser={currentUser}
                  onRefresh={onRefresh}
                  hasProject={hasProject}
                    companySlug={companySlug} 

                />
              )}

              {planningTab === 'tasks' && (
                <TasksSection
                  lead={lead}
                  currentUser={currentUser}
                  onRefresh={onRefresh}
                  hasProject={hasProject}
                />
              )}

              {planningTab === 'reminders' && (
                <RemindersSection
                  lead={lead}
                  currentUser={currentUser}
                  onRefresh={onRefresh}
                  hasProject={hasProject}
                />
              )}
            </div>
          </div>

          {/* FINANCIALS & DELIVERABLES SECTION */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-4 bg-gradient-to-r from-purple-50 to-purple-100 border-b border-purple-200">
              <h3 className="text-xs font-bold text-purple-900 uppercase tracking-wide mb-3 flex items-center gap-2">
                <CreditCard className="w-4 h-4" />
                Financials & Deliverables
              </h3>
              <div 
                className="flex gap-2 overflow-x-auto snap-x snap-mandatory pb-1"
                style={{
                  scrollbarWidth: 'none',
                  msOverflowStyle: 'none',
                  WebkitOverflowScrolling: 'touch'
                }}
              >
                {financialsTabs.map((tab) => {
                  const IconComponent = tab.icon;
                  const isActive = financialsTab === tab.id;
                  
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setFinancialsTab(tab.id)}
                      className={`
                        flex-shrink-0 snap-start px-4 py-2.5 rounded-lg font-medium transition-all
                        flex items-center gap-2.5 relative group
                        ${isActive
                          ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30' 
                          : 'bg-white text-gray-700 border border-gray-200 hover:border-purple-300 hover:bg-purple-50 hover:text-purple-700'
                        }
                      `}
                    >
                      <IconComponent 
                        className="w-4 h-4" 
                        style={{ color: isActive ? '#ffffff' : tab.iconColor }}
                      />
                      <span className="text-sm">{tab.label}</span>
                      {tab.count > 0 && (
                        <span className={`
                          min-w-[20px] h-5 px-1.5 rounded-full text-xs font-bold
                          flex items-center justify-center
                          ${isActive
                            ? 'bg-purple-500 text-white' 
                            : 'bg-gray-100 text-gray-600 group-hover:bg-purple-100 group-hover:text-purple-700'
                          }
                        `}>
                          {tab.count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* FINANCIALS CONTENT */}
            <div className="bg-white">
              {financialsTab === 'quote' && (
                <QuoteSection
                  lead={lead}
                  currentUser={currentUser}
                  onRefresh={onRefresh}
                  hasProject={hasProject}
                />
              )}

              {financialsTab === 'payment' && (
                <PaymentSection
                  lead={lead}
                  currentUser={currentUser}
                  onRefresh={onRefresh}
                  hasProject={hasProject}
                />
              )}

              {financialsTab === 'documents' && (
                <DocumentsSection
                  lead={lead}
                  currentUser={currentUser}
                  onRefresh={onRefresh}
                  hasProject={hasProject}
                />
              )}

              {financialsTab === 'photos' && (
                <PhotosSection
                  lead={lead}
                  currentUser={currentUser}
                  onRefresh={onRefresh}
                  hasProject={hasProject}
                />
              )}
            </div>
          </div>

        </div>
      )}

    </div>
  );
}