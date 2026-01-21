'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Calendar from '@/components/dashboard/Calendar';
import LeadModal from '@/components/dashboard/LeadModal';
import { Toaster } from 'sonner';
import styles from '@/app/dashboard/dashboard.module.css';

type Company = {
  id: number;
  name: string;
  slug: string;
  logo_url?: string | null;
  status_options?: any[];
};

export default function CalendarClient({ company }: { company: Company }) {
  const router = useRouter();
  const [selectedLead, setSelectedLead] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Fetch current user
  useEffect(() => {
    fetchCurrentUser();
  }, []);

  async function fetchCurrentUser() {
    try {
      const response = await fetch('/api/auth/me');
      const data = await response.json();
      if (data.success) {
        setCurrentUser(data.user);
      }
    } catch (error) {
      console.error('Failed to fetch user:', error);
    }
  }

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/login';
  }

  async function updateLeadStatus(id: number, status: string, oldStatus: string) {
    try {
      const response = await fetch('/api/leads/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          id, 
          status,
          action: 'update_status',
          user_name: currentUser?.name || currentUser?.email || 'Unknown User',
          user_email: currentUser?.email || '',
          old_status: oldStatus
        })
      });
      
      const result = await response.json();
      
      if (response.ok && result.success) {
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error('Update status error:', error);
      return false;
    }
  }

  async function addNote(id: number, noteText: string) {
    try {
      const response = await fetch('/api/leads/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          id, 
          notes: noteText, 
          action: 'add_note',
          user_name: currentUser?.name || currentUser?.email || 'Unknown User',
          user_email: currentUser?.email || ''
        })
      });
      
      const result = await response.json();
      
      if (response.ok && result.success) {
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error('Add note error:', error);
      return false;
    }
  }

  async function deleteLead(id: number) {
    try {
      const response = await fetch('/api/leads/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          id,
          user_name: currentUser?.name || currentUser?.email || 'Unknown User',
          user_email: currentUser?.email || ''
        })
      });
      
      const result = await response.json();
      
      if (response.ok && result.success) {
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error('Delete lead error:', error);
      return false;
    }
  }

  async function refreshModalLead() {
    if (selectedLead) {
      try {
        const response = await fetch(`/api/company/${company.slug}/leads`);
        const data = await response.json();
        const updatedLead = data.leads.find((l: any) => l.id === selectedLead.id);
        if (updatedLead) {
          setSelectedLead(updatedLead);
        }
      } catch (error) {
        console.error('Failed to refresh modal lead:', error);
      }
    }
  }

  const DEFAULT_STATUSES = [
    { value: 'new', label: 'New', color: 'blue', emoji: '🆕' },
    { value: 'contacted', label: 'Contacted', color: 'yellow', emoji: '📞' },
    { value: 'quoted', label: 'Quoted', color: 'purple', emoji: '💰' },
    { value: 'in-progress', label: 'In Progress', color: 'orange', emoji: '🔨' },
    { value: 'completed', label: 'Completed', color: 'green', emoji: '✅' },
  ];

  const statusOptions = company.status_options && company.status_options.length > 0 
    ? company.status_options 
    : DEFAULT_STATUSES;

  return (
    <div className={styles.container}>
      <Toaster position="top-right" />
      <div className={styles.innerContainer}>
        
        {/* HEADER */}
        <div className="bg-white/10 backdrop-blur rounded-xl p-4 sm:p-6 mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            {/* Left: Logo + Company Name */}
            <div className="flex items-center gap-3">
              {company.logo_url ? (
                <img 
                  src={company.logo_url} 
                  alt={`${company.name} logo`}
                  className="h-10 sm:h-12 w-auto object-contain"
                />
              ) : (
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center text-white font-bold text-lg sm:text-xl flex-shrink-0">
                  {company.name.charAt(0)}
                </div>
              )}
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-white">{company.name}</h1>
                <p className="text-sm text-white/70">Calendar View</p>
              </div>
            </div>
            
            {/* Right: Navigation + User Menu */}
            {currentUser && (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => router.push(`/${company.slug}/dashboard`)}
                  className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg font-semibold transition border border-white/30"
                >
                  📋 Back to Leads
                </button>
                <a
                  href={`/${company.slug}`}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition shadow-lg flex items-center gap-2"
                >
                  ➕ Create Lead
                </a>
                <div className="bg-white/10 backdrop-blur rounded-lg px-4 py-2 border border-white/20">
                  <p className="text-sm font-semibold text-white">{currentUser.name}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-white rounded-lg font-semibold transition border border-red-500/30 text-sm"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>

        {/* CALENDAR */}
        <Calendar 
          companySlug={company.slug}
          onSelectLead={setSelectedLead}
        />
      </div>

      {/* LEAD MODAL */}
      {selectedLead && (
        <LeadModal
          lead={selectedLead}
          onClose={() => setSelectedLead(null)}
          onUpdateStatus={updateLeadStatus}
          onAddNote={addNote}
          onDeleteLead={deleteLead}
          onRefresh={refreshModalLead}
          currentUser={currentUser}
          statusOptions={statusOptions}
        />
      )}
    </div>
  );
}