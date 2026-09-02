'use client';

import { useState, useEffect, useCallback } from 'react';
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
  // Previously never fetched at all for leads opened from the calendar —
  // the list endpoint that feeds the calendar grid doesn't include either
  // of these, so BillingSection silently showed no payment history for
  // any lead opened this way, even ones that had real payments recorded.
  const [selectedLeadPayments, setSelectedLeadPayments] = useState<any[]>([]);
  const [selectedLeadActivity, setSelectedLeadActivity] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [calendarRefreshKey, setCalendarRefreshKey] = useState(0);

  useEffect(() => {
    fetchCurrentUser();
    fetchTeamMembers();
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

  async function fetchTeamMembers() {
    try {
      const res = await fetch('/api/team/members');
      const data = await res.json();
      if (data.success) {
        const assigneeList = (data.allAssignees || []).map((name: string) => ({ id: name, name }));
        setTeamMembers(assigneeList);
      }
    } catch (error) {
      console.error('Failed to fetch team members:', error);
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

  // Calendar's own list fetch has no payments/activity — this is the same
  // "show what we have immediately, then fill in the real detail" pattern
  // already used in LeadsClient.tsx and CompanyDashboardClient.tsx. Without
  // this, selectedLead stayed permanently stuck on the bare list row.
  const openLead = useCallback(async (job: any) => {
    setSelectedLead(job);
    setSelectedLeadPayments([]);
    setSelectedLeadActivity([]);
    try {
      const res = await fetch(`/api/leads/${job.id}`, { cache: 'no-store' });
      const data = await res.json();
      if (data.success && data.lead) {
        setSelectedLead(data.lead);
        setSelectedLeadPayments(data.payments || []);
        setSelectedLeadActivity(data.activity || []);
      }
    } catch (error) {
      console.error('Failed to load lead detail:', error);
    }
  }, []);

  // Was refetching the whole calendar list and matching a row out of it —
  // the same incomplete shape as the initial click, so "refresh" never
  // actually recovered payments/activity either. Now refetches the single
  // lead's real detail, same as openLead above.
  async function refreshModalLead() {
    setCalendarRefreshKey(prev => prev + 1);
    if (!selectedLead) return;
    try {
      const res = await fetch(`/api/leads/${selectedLead.id}`, {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache' },
      });
      const data = await res.json();
      if (data.success && data.lead) {
        setSelectedLead(data.lead);
        setSelectedLeadPayments(data.payments || []);
        setSelectedLeadActivity(data.activity || []);
      }
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
    onSelectLead={openLead}
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
          payments={selectedLeadPayments}
          activity={selectedLeadActivity}
          currentUser={currentUser}
          statusOptions={statusOptions}
          categories={company.form_categories || []}
          companySlug={company.slug}
          company={company}
          teamMembers={teamMembers}
        />
      )}
    </div>
  );
}