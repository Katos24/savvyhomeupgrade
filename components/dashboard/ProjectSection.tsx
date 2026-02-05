'use client';

import { useState } from 'react';
import SchedulingSection from './project-sections/SchedulingSection';
import QuoteSection from './project-sections/QuoteSection';
import PaymentSection from './project-sections/PaymentSection';
import DocumentsSection from './project-sections/DocumentsSection';
import PhotosSection from './project-sections/PhotosSection';
import TasksSection from './project-sections/TasksSection';


type ProjectSectionProps = {
  lead: any;
  currentUser: any;
  onRefresh: () => Promise<void>;
  statusOptions: any[];
  onUpdateStatus: (id: number, status: string, oldStatus: string) => Promise<boolean>;
};

type TabType = 'schedule' | 'quote' | 'payment' | 'tasks' | 'photos' | 'documents';

export default function ProjectSection({ lead, currentUser, onRefresh, statusOptions, onUpdateStatus }: ProjectSectionProps) {
  const hasProject = !!lead?.project_id;
  const [activeTab, setActiveTab] = useState<TabType>('schedule');

  if (!lead) {
    return (
      <div className="border-t border-blue-200 mt-4 pt-3">
        <p className="text-gray-500 text-sm">Loading project information...</p>
      </div>
    );
  }

  const tabs = [
    { 
      id: 'schedule' as TabType, 
      label: 'Schedule', 
      icon: '📅',
      count: lead?.scheduled_date ? 1 : 0
    },
    { 
      id: 'quote' as TabType, 
      label: 'Quote', 
      icon: '📝',
      count: lead?.quote_data?.length || 0
    },
    { 
      id: 'payment' as TabType, 
      label: 'Payment', 
      icon: '💳',
      count: lead?.payment_amount ? 1 : 0
    },
        { 
      id: 'tasks' as TabType, 
      label: 'Tasks', 
      icon: '✓',
      count: lead?.tasks ? (Array.isArray(lead.tasks) ? lead.tasks.filter((t: any) => !t.completed).length : 0) : 0
    },
    { 
      id: 'documents' as TabType, 
      label: 'Docs', 
      icon: '📄',
      count: lead?.documents ? (Array.isArray(lead.documents) ? lead.documents.length : JSON.parse(lead.documents).length) : 0
    },
    { 
      id: 'photos' as TabType, 
      label: 'Photos', 
      icon: '📸',
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
        <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-2 text-center">
          <p className="text-yellow-800 font-semibold text-sm">
            Convert to Project first to use scheduling, quotes, and payments
          </p>
        </div>
      )}

      {hasProject && (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          {/* HORIZONTAL BADGE NAVIGATION */}
          <div className="p-3 bg-gray-50 border-b border-gray-200">
            <div className="flex gap-2 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex-shrink-0 snap-start px-3 py-2 rounded-lg text-sm font-semibold transition-all
                    flex items-center gap-2
                    ${activeTab === tab.id 
                      ? 'bg-blue-600 text-white shadow-md' 
                      : 'bg-white text-gray-700 border border-gray-300 hover:border-blue-400 hover:bg-blue-50'
                    }
                  `}
                >
                  <span className="text-base">{tab.icon}</span>
                  <span>{tab.label}</span>
                  {tab.count > 0 && (
                    <span className={`
                      px-1.5 py-0.5 rounded-full text-xs font-bold
                      ${activeTab === tab.id 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-gray-100 text-gray-600'
                      }
                    `}>
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* ACTIVE TAB CONTENT */}
          <div className="bg-white">
            {activeTab === 'schedule' && (
              <SchedulingSection
                lead={lead}
                currentUser={currentUser}
                onRefresh={onRefresh}
                hasProject={hasProject}
              />
            )}

            {activeTab === 'quote' && (
              <QuoteSection
                lead={lead}
                currentUser={currentUser}
                onRefresh={onRefresh}
                hasProject={hasProject}
              />
            )}

            {activeTab === 'payment' && (
              <PaymentSection
                lead={lead}
                currentUser={currentUser}
                onRefresh={onRefresh}
                hasProject={hasProject}
              />
            )}

            {activeTab === 'tasks' && (
  <TasksSection
    lead={lead}
    currentUser={currentUser}
    onRefresh={onRefresh}
    hasProject={hasProject}
  />
)}

            {activeTab === 'documents' && (
              <DocumentsSection
                lead={lead}
                currentUser={currentUser}
                onRefresh={onRefresh}
                hasProject={hasProject}
              />
            )}

            {activeTab === 'photos' && (
              <PhotosSection
                lead={lead}
                currentUser={currentUser}
                onRefresh={onRefresh}
                hasProject={hasProject}
              />
            )}
          </div>
        </div>
      )}

    </div>
  );
}