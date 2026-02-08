'use client';

import { useState, useEffect } from 'react';
import Calendar from '@/components/dashboard/Calendar';
import LeadModal from '@/components/dashboard/LeadModal';
import { Toaster } from 'sonner';

type Company = {
  id: number;
  name: string;
  slug: string;
  logo_url?: string | null;
  status_options?: any[];
  form_categories?: any[];
};

export default function CalendarClient({ company }: { company: Company }) {
  const [selectedLead, setSelectedLead] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [calendarRefreshKey, setCalendarRefreshKey] = useState(0);

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
    try {
      const response = await fetch(`/api/company/${company.slug}/leads`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache'
        }
      });
      const data = await response.json();
      
      if (selectedLead) {
        const updatedLead = data.leads.find((l: any) => l.id === selectedLead.id);
        if (updatedLead) {
          setSelectedLead(updatedLead);
        }
      }
      
      setCalendarRefreshKey(prev => prev + 1);
    } catch (error) {
      console.error('Failed to refresh:', error);
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
    <div className="min-h-screen" style={{ background: 'linear-gradient(to bottom right, #1e293b, #0f172a, #020617)' }}>
      <Toaster position="top-right" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        
        {/* CALENDAR - has its own back button */}
       <Calendar
  companySlug={company.slug}
  onSelectLead={setSelectedLead}
  statusOptions={statusOptions}
  key={calendarRefreshKey}
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
            categories={company.form_categories || []}  // ← ADD THIS LINE

        />
      )}
    </div>
  );
}