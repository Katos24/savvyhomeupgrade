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
  const [selectedLeadPayments, setSelectedLeadPayments] = useState<any[]>([]);
  const [selectedLeadActivity, setSelectedLeadActivity] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [calendarRefreshKey, setCalendarRefreshKey] = useState(0);
  // Which top-level tab LeadModal should open on. Stays 'overview' for
  // every normal path through Calendar; only set to 'schedule' by the
  // "+ Add a job to this day" flow below, then reset once the modal closes
  // so the next lead opened the normal way still lands on Overview.
  const [modalInitialTab, setModalInitialTab] = useState<'overview' | 'schedule'>('overview');

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
    setModalInitialTab('overview');
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

  // "+ Add a job to this day" — picked from Calendar's day drawer. Fetches
  // the job's real detail same as openLead above, then seeds
  // scheduled_date with the day that was clicked (client-side only, not
  // saved to the DB) so the Schedule tab's Date badge shows up already
  // filled in when the modal opens. The person still has to hit Save
  // inside Schedule to actually persist it — this only pre-fills the
  // starting point, it doesn't silently schedule anything on its own.
  // Same seed-then-fetch shape LeadsClient.tsx already uses for its
  // deep-link flow, applied here to a new field instead of a new lead.
  const scheduleJobOnDay = useCallback(async (job: { lead_id: number; project_id: number; customer_name: string }, day: string) => {
    setModalInitialTab('schedule');
    setSelectedLead({ id: job.lead_id, name: job.customer_name, project_id: job.project_id });
    setSelectedLeadPayments([]);
    setSelectedLeadActivity([]);
    try {
      const res = await fetch(`/api/leads/${job.lead_id}`, { cache: 'no-store' });
      const data = await res.json();
      if (data.success && data.lead) {
        const seeded = data.lead.scheduled_date
          ? data.lead
          : { ...data.lead, scheduled_date: day };
        setSelectedLead(seeded);
        setSelectedLeadPayments(data.payments || []);
        setSelectedLeadActivity(data.activity || []);
      }
    } catch (error) {
      console.error('Failed to load job detail:', error);
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
    onScheduleJob={scheduleJobOnDay}
    statusOptions={statusOptions}
    refreshTrigger={calendarRefreshKey}
  />

      {/* LEAD MODAL */}
      {selectedLead && (
      <LeadModal
          lead={selectedLead}
          onClose={() => { setSelectedLead(null); setModalInitialTab('overview'); }}
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
          initialTab={modalInitialTab}
        />
      )}
    </div>
  );
}