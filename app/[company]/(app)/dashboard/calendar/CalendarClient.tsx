'use client';

import { useState, useEffect } from 'react';
import Calendar from '@/components/dashboard/Calendar';
import LeadModal from '@/components/dashboard/LeadModal';
import { Toaster } from 'sonner';
import { DEFAULT_STATUSES } from '@/lib/formCategories';

type Company = {
  id: number;
  name: string;
  slug: string;
  logo_url?: string | null;
  status_options?: any[];
  form_categories?: any[];
  plan_tier?: string;
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

  // Was a locally hardcoded, stale 5-stage list (no active/approved/scheduled)
  // duplicated from the same pre-automation snapshot that broke the pipeline
  // status page — a lead in any of those three stages had nothing to match
  // against here. Now sourced from the single canonical list.
  const statusOptions = company.status_options && company.status_options.length > 0
    ? company.status_options
    : DEFAULT_STATUSES;

  return (
    <div className="min-h-screen">
  <Toaster position="top-right" />
  <Calendar
    companySlug={company.slug}
    onSelectLead={setSelectedLead}
    statusOptions={statusOptions}
    key={calendarRefreshKey}
  />

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
          categories={company.form_categories || []}
          companySlug={company.slug}
          company={company}
        />
      )}
    </div>
  );
}