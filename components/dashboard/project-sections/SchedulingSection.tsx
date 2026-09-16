'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
  Calendar, User,
  X, Eye,
  CheckCircle2, Clock,
  History, Loader2, Save, Mail, MapPin, AlertTriangle
} from 'lucide-react';
import SchedulingCalendarModal, { type PickerMode } from './SchedulingCalendarModal';
import SendEmailModal from '@/components/dashboard/SendEmailModal';
import { getSchedulingConfig } from '@/lib/schedulingConfig';

type SchedulingSectionProps = {
  lead: any;
  company: any;
  currentUser: any;
  onRefresh: () => Promise<void>;
  hasProject: boolean;
  companySlug: string;
  teamMembers?: any[];
};

export default function SchedulingSection({ 
  lead, 
  company,
  currentUser, 
  onRefresh, 
  hasProject, 
  companySlug, 
  teamMembers = [] 
}: SchedulingSectionProps) {
  const [saving, setSaving] = useState(false);

  // Which single picker is open, if any — null means closed. Each mode
  // is a completely isolated flow now (see SchedulingCalendarModal.tsx):
  // opening 'date' only ever lets you pick a date and confirms only that;
  // it can't sweep you into time or people afterward.
  const [activePicker, setActivePicker] = useState<PickerMode | null>(null);

  const [showEmailModal, setShowEmailModal] = useState(false);

  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [selectedAssignees, setSelectedAssignees] = useState<string[]>([]);
  const [assigneeConflict, setAssigneeConflict] = useState(false);
  const assignedTo = selectedAssignees[0] || '';
  const additionalAssignees = selectedAssignees.slice(1);
  const [estimatedHours, setEstimatedHours] = useState('');
  const [actualHours, setActualHours] = useState('');
  
  const [lastHtmlBody, setLastHtmlBody] = useState<string | null>(null);
  const [outboxLog, setOutboxLog] = useState<any[]>([]);
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);
  const [clockOpen, setClockOpen] = useState(false);
  const [scheduledEndTime, setScheduledEndTime] = useState('');
  const [eventLocation, setEventLocation] = useState('');

  const [initialState, setInitialState] = useState<any>({});

  // Background check, independent of whichever picker (if any) is
  // currently open — this closes the actual gap: if People gets picked
  // before Date/Time exist, there's nothing to check against yet and the
  // picker correctly says so. But if Date/Time gets set or changed
  // AFTERWARD, nothing previously re-validated the assignees already
  // chosen. This re-checks whenever any of the three pieces change, so
  // the badge itself reflects the current truth instead of a stale count.
  useEffect(() => {
    if (!scheduledDate || !scheduledTime || selectedAssignees.length === 0 || teamMembers.length === 0) {
      setAssigneeConflict(false);
      return;
    }
    const params = new URLSearchParams({
      date: scheduledDate,
      start: scheduledTime,
      names: selectedAssignees.join(','),
    });
    if (scheduledEndTime) params.set('end', scheduledEndTime);
    if (lead?.project_id) params.set('excludeProjectId', String(lead.project_id));

    fetch(`/api/company/${companySlug}/availability/assignees?${params}`)
      .then((r) => r.json())
      .then((data) => {
        if (!data.success) return;
        const anyBusy = selectedAssignees.some((name) => data.availability?.[name]?.available === false);
        setAssigneeConflict(anyBusy);
      })
      .catch(() => {});
  }, [scheduledDate, scheduledTime, scheduledEndTime, selectedAssignees, teamMembers, companySlug, lead?.project_id]);


  useEffect(() => {
    setScheduledEndTime(lead?.scheduled_end_time ? lead.scheduled_end_time : '');
    setEventLocation(lead?.event_location || '');
  }, [lead]);

  const scheduleEmailLog = useMemo(() => {
    try {
      const raw = lead?.schedule_emails;
      const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw || [];
      return Array.isArray(parsed) ? [...parsed].reverse() : [];
    } catch { return []; }
  }, [lead?.schedule_emails]);

  const schedulingConfig = getSchedulingConfig(company?.business_type);
  const lastEmailSentAt = scheduleEmailLog.length > 0 ? scheduleEmailLog[0].sent_at : null;

  const fetchOutbox = async () => {
    if (!lead?.id) return;
    try {
      const res = await fetch(`/api/company/${companySlug}/outbox-preview?lead_id=${lead.id}&type=schedule`);
      const data = await res.json();
      if (data.entries) {
        setOutboxLog(data.entries);
        const latest = data.entries.find((e: any) => e.html_body);
        if (latest) setLastHtmlBody(latest.html_body);
      } else if (data.html_body) {
        setLastHtmlBody(data.html_body);
      }
    } catch {}
  };

  useEffect(() => { fetchOutbox(); }, [lead?.id, companySlug]);

  useEffect(() => {
    const sDate = lead?.scheduled_date ? lead.scheduled_date.split('T')[0].split(' ')[0] : '';
    setScheduledDate(sDate);
    const sTime = lead?.scheduled_time || '';
    setScheduledTime(sTime);

    const estH = lead?.estimated_hours || '';
    const actH = lead?.actual_hours || '';
    setEstimatedHours(estH);
    setActualHours(actH);

    let extra: string[] = [];
    try {
      const raw = lead?.additional_assignees;
      const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
      extra = Array.isArray(parsed) ? parsed : [];
    } catch { extra = []; }

    const assignees = [lead?.assigned_to, ...extra].filter(Boolean);
    setSelectedAssignees(assignees);

    setInitialState({
      // If this date was seeded client-side by Calendar's "+ Add job"
      // flow (not actually saved to the DB), the baseline must NOT match
      // the displayed value — otherwise isDirty evaluates false
      // immediately and Save stays disabled even though nothing has
      // actually been persisted yet.
      date: lead?._unsavedScheduleDateSeed ? '' : sDate,
      time: sTime,
      endTime: lead?.scheduled_end_time || '',
      location: lead?.event_location || '',
      assignees: JSON.stringify(assignees),
      estH,
      actH
    });
  }, [lead]);

  const isDirty = useMemo(() => {
    return (
      scheduledDate !== initialState.date ||
      scheduledTime !== initialState.time ||
      scheduledEndTime !== initialState.endTime ||
      eventLocation !== initialState.location ||
      JSON.stringify(selectedAssignees) !== initialState.assignees ||
      estimatedHours !== initialState.estH ||
      actualHours !== initialState.actH
    );
  }, [scheduledDate, scheduledTime, scheduledEndTime, eventLocation, selectedAssignees, estimatedHours, actualHours, initialState]);

  const scheduledDateFormatted = useMemo(() => {
    if (!scheduledDate) return null;
    try {
      const [year, month, day] = scheduledDate.split('-');
      return new Date(parseInt(year), parseInt(month) - 1, parseInt(day)).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return scheduledDate;
    }
  }, [scheduledDate]);

  const formatTimeDisplay = (t: string) => {
    if (!t) return null;
    const [h, m] = t.split(':').map(Number);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const hour = h % 12 || 12;
    return `${hour}:${String(m).padStart(2, '0')} ${ampm}`;
  };

  const scheduledTimeFormatted = useMemo(() => {
    if (!scheduledTime) return null;
    const start = formatTimeDisplay(scheduledTime);
    if (schedulingConfig.showEndTime && scheduledEndTime) {
      return `${start} - ${formatTimeDisplay(scheduledEndTime)}`;
    }
    return start;
  }, [scheduledTime, scheduledEndTime, schedulingConfig.showEndTime]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const knownNames = teamMembers.map((m: any) => m.name);
      const newNames = selectedAssignees.filter((n) => !knownNames.includes(n));
      newNames.forEach((name) => {
        fetch('/api/team/save-assignee', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name }),
        }).catch(() => {});
      });

      const res = await fetch('/api/leads/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: lead.id,
          action: 'update_project',
          scheduled_date: scheduledDate || null,
          scheduled_time: scheduledTime || null,
          scheduled_end_time: scheduledEndTime || null,
          event_location: eventLocation || null,
          assigned_to: assignedTo || null,
          additional_assignees: additionalAssignees,
          estimated_hours: estimatedHours || null,
          actual_hours: actualHours || null,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok && data.success) {
        toast.success('Schedule updated');
        await onRefresh();
      } else {
        toast.error(data.error || 'Failed to save');
      }
    } catch { 
      toast.error('Failed to save'); 
    } finally { 
      setSaving(false); 
    }
  };

   return (
    <div className="max-w-4xl mx-auto w-full space-y-4 pb-24 lg:pb-0">
      {/* SEND EMAIL MODAL */}
      <SendEmailModal
        open={showEmailModal}
        onClose={() => setShowEmailModal(false)}
        onSuccess={async () => { await onRefresh(); await fetchOutbox(); }}
        type="schedule"
        leadId={lead?.id}
        currentUser={currentUser}
        customerName={lead?.name || 'Customer'}
        customerEmail={lead?.email}
        scheduledDateDisplay={scheduledDateFormatted}
        scheduledTimeDisplay={scheduledTimeFormatted}
        lastSentAt={lastEmailSentAt}
        lastHtmlBody={lastHtmlBody}
      />

      {/* THE THREE ISOLATED PICKERS — one modal component, but each open
          only ever operates on the ONE field it was opened for. Confirming
          Date never touches time or assignees, and vice versa. */}
      {activePicker && (
        <SchedulingCalendarModal
          isOpen={true}
          mode={activePicker}
          onClose={() => setActivePicker(null)}
          onConfirmDate={(date) => setScheduledDate(date)}
          onConfirmTime={(time, endTime) => {
            setScheduledTime(time);
            setScheduledEndTime(endTime || '');
          }}
          onConfirmPeople={(assignees) => setSelectedAssignees(assignees)}
          companySlug={companySlug}
          currentScheduledDate={scheduledDate}
          currentScheduledTime={scheduledTime}
          currentScheduledEndTime={scheduledEndTime}
          selectedAssignees={selectedAssignees}
          teamMembers={teamMembers}
          currentLeadId={lead?.id}
          currentProjectId={lead?.project_id}
          bufferMinutes={schedulingConfig.bufferMinutes}
          showEndTime={schedulingConfig.showEndTime}
        />
      )}

      {/* EMAIL PREVIEW MODAL */}
      <AnimatePresence>
        {previewHtml && (
          <motion.div
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-[#1c1917]/85 backdrop-blur-sm"
            onClick={() => setPreviewHtml(null)}
          >
            <motion.div
              initial={{ scale: 0.97, y: 12 }} 
              animate={{ scale: 1, y: 0 }} 
              exit={{ scale: 0.97, y: 12 }}
              className="bg-white w-full max-w-2xl rounded-2xl overflow-hidden flex flex-col shadow-2xl h-[85vh] border border-[#e7e2d8]"
              onClick={e => e.stopPropagation()}
            >
              <div className="px-5 py-3 border-b border-[#e7e2d8] flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                  <Eye size={14} className="text-[#a8a29e]" />
                  <p className="text-xs font-medium text-[#57534e]">Email preview</p>
                </div>
                <button onClick={() => setPreviewHtml(null)} className="p-1.5 hover:bg-[#f5f1e8] rounded-lg transition touch-manipulation">
                  <X size={16} />
                </button>
              </div>
              <div className="flex-1 p-3">
                <iframe
                  title="Email Preview"
                  srcDoc={`${previewHtml}<style>a,button{pointer-events:none!important;cursor:default!important;}</style>`}
                  className="w-full h-full rounded-xl border border-[#e7e2d8]"
                  sandbox="allow-same-origin"
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MAIN CONTAINER — same bordered white card as the invoice
          panel: border-[#e7e2d8], rounded-2xl. */}
      <div className="bg-white rounded-2xl border border-[#e7e2d8] shadow-sm flex flex-col relative z-10">
        
        {/* HEADER — same header-strip treatment as the invoice panel's
            "Invoice Settings" bar: bg-[#faf9f5], border-b, uppercase
            tracking-wide label. Save moved OUT of here, into the sticky
            bar below. This header now just shows status + Send Schedule. */}
        <div className="px-4 sm:px-5 py-3.5 border-b border-[#e7e2d8] bg-[#faf9f5] rounded-t-2xl flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#78716c]">
              Schedule Overview
            </h3>
            {isDirty ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-200/80 rounded-md text-[10px] font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                Unsaved
              </span>
            ) : (
              <span className="text-[10px] text-[#a8a29e] font-medium">Saved</span>
            )}
            {lastEmailSentAt && (
              <div className="hidden sm:flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                <CheckCircle2 size={11} className="text-emerald-500" />
                <p className="text-[11px] text-emerald-700 font-medium">
                  Sent {new Date(lastEmailSentAt).toLocaleDateString()}
                </p>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={() => {
                if (!hasProject) return toast.error('Create a project first');
                if (!scheduledDate) return toast.error('Add a date to send the schedule');
                setShowEmailModal(true);
              }}
              disabled={!hasProject || !scheduledDate}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 border border-[#e7e2d8] bg-white hover:bg-[#f5f1e8] text-[#57534e] rounded-xl text-xs font-semibold shadow-xs transition touch-manipulation disabled:opacity-40 min-h-[42px]"
            >
              <Mail className="w-3.5 h-3.5 text-brand-700" />
              <span>{outboxLog.length > 0 ? 'Resend Schedule' : 'Send Schedule'}</span>
            </button>

            {/* Always in the same spot — transforms rather than
                appearing/disappearing. Muted and quiet when there's
                nothing new; flips to brand-700 with a gentle scale pulse
                (not Tailwind's default opacity-fade animate-pulse, which
                reads as more of an alert flash than a soft nudge) the
                moment something's unsaved. */}
            <motion.button
              type="button"
              onClick={handleSave}
              disabled={!isDirty || saving}
              animate={isDirty && !saving ? { scale: [1, 1.035, 1] } : { scale: 1 }}
              transition={isDirty && !saving ? { duration: 1.8, repeat: Infinity, ease: 'easeInOut' } : { duration: 0.15 }}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-colors touch-manipulation min-h-[42px] ${
                isDirty
                  ? 'bg-brand-700 hover:bg-brand-800 text-white shadow-md shadow-brand-700/30 active:scale-95'
                  : 'bg-[#f5f1e8] text-[#a8a29e] cursor-default'
              }`}
            >
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              {saving ? 'Saving...' : isDirty ? 'Save changes' : 'Saved'}
            </motion.button>
          </div>
        </div>

        {/* MAIN BODY */}
        <div className="p-4 sm:p-5 grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          <div className="lg:col-span-2 space-y-4">

            <div>
              <label className="text-[11px] font-medium uppercase tracking-wide text-[#a8a29e] mb-1.5 block">
                Schedule &amp; Assigned To
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setActivePicker('date')}
                  className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border text-xs font-semibold transition touch-manipulation min-h-[44px] ${
                    scheduledDate
                      ? 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                      : 'border-[#e7e2d8] bg-[#faf9f5] text-[#78716c] hover:bg-[#f5f1e8]'
                  }`}
                >
                  <Calendar size={13} className="shrink-0" />
                  {scheduledDateFormatted || 'Set date'}
                </button>

                <button
                  type="button"
                  onClick={() => setActivePicker('time')}
                  className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border text-xs font-semibold transition touch-manipulation min-h-[44px] ${
                    scheduledTime
                      ? 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                      : 'border-[#e7e2d8] bg-[#faf9f5] text-[#78716c] hover:bg-[#f5f1e8]'
                  }`}
                >
                  <Clock size={13} className="shrink-0" />
                  {scheduledTimeFormatted || 'Set time'}
                </button>

                <button
                  type="button"
                  onClick={() => setActivePicker('people')}
                  className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border text-xs font-semibold transition touch-manipulation min-h-[44px] ${
                    selectedAssignees.length === 0
                      ? 'border-[#e7e2d8] bg-[#faf9f5] text-[#78716c] hover:bg-[#f5f1e8]'
                      : assigneeConflict
                      ? 'border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100'
                      : 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                  }`}
                >
                  {assigneeConflict && selectedAssignees.length > 0 ? (
                    <AlertTriangle size={13} className="shrink-0" />
                  ) : (
                    <User size={13} className="shrink-0" />
                  )}
                  {selectedAssignees.length === 0
                    ? 'Assign staff'
                    : selectedAssignees.length === 1
                    ? assigneeConflict ? `${selectedAssignees[0]} · Busy` : selectedAssignees[0]
                    : assigneeConflict ? `${selectedAssignees.length} assigned · Conflict` : `${selectedAssignees.length} assigned`}
                </button>
              </div>
            </div>

            {schedulingConfig.showEndTime && (
              <div className="pt-2 border-t border-[#f0ece1]">
                <label className="text-[11px] font-medium uppercase tracking-wide text-[#a8a29e] mb-1.5 flex items-center gap-1">
                  <MapPin size={11} /> Event Location
                </label>
                <input
                  type="text"
                  value={eventLocation}
                  onChange={(e) => setEventLocation(e.target.value)}
                  placeholder="Venue name and address..."
                  className="w-full px-3.5 py-2 bg-[#faf9f5] border border-[#e7e2d8] rounded-xl text-[16px] sm:text-xs font-medium text-[#1c1917] outline-none focus:border-brand-700 focus:bg-white transition-all min-h-[44px]"
                />
              </div>
            )}
          </div>

          {/* JOB HOURS — same right-column panel treatment as the
              invoice card's "Invoice Settings" box: bg-[#faf9f5],
              border-[#e7e2d8], rounded-2xl. */}
          <div className="bg-[#faf9f5] p-4 rounded-2xl border border-[#e7e2d8] space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Clock size={13} className="text-amber-500" />
                <p className="text-[11px] font-semibold uppercase tracking-wide text-[#78716c]">
                  Job Hours
                </p>
              </div>
              <button
                type="button"
                onClick={() => setClockOpen(true)}
                className="px-3 py-1.5 bg-white border border-[#e7e2d8] hover:bg-[#f5f1e8] rounded-lg text-xs font-semibold text-[#57534e] shadow-xs transition touch-manipulation min-h-[36px] sm:min-h-0"
              >
                {estimatedHours || actualHours ? 'Edit Hours' : '+ Log Hours'}
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <div className="p-2.5 bg-white rounded-xl border border-[#e7e2d8]/70 text-center">
                <p className="text-[10px] text-[#a8a29e] font-medium uppercase">Estimated</p>
                <p className="text-xs font-bold text-[#1c1917] mt-0.5">
                  {estimatedHours ? `${estimatedHours} hrs` : '—'}
                </p>
              </div>
              <div className="p-2.5 bg-white rounded-xl border border-[#e7e2d8]/70 text-center">
                <p className="text-[10px] text-[#a8a29e] font-medium uppercase">Actual</p>
                <p className="text-xs font-bold text-[#1c1917] mt-0.5">
                  {actualHours ? `${actualHours} hrs` : '—'}
                </p>
              </div>
            </div>

            {estimatedHours && actualHours && (
              <div className="px-3 py-2 bg-white rounded-xl border border-[#e7e2d8]/70 flex items-center justify-between">
                <span className="text-[11px] text-[#a8a29e] font-medium">Variance</span>
                <span className={`text-xs font-bold ${parseFloat(actualHours) > parseFloat(estimatedHours) ? 'text-rose-600' : 'text-emerald-600'}`}>
                  {parseFloat(actualHours) > parseFloat(estimatedHours)
                    ? `+${(parseFloat(actualHours) - parseFloat(estimatedHours)).toFixed(1)}h over`
                    : `${(parseFloat(estimatedHours) - parseFloat(actualHours)).toFixed(1)}h under`}
                </span>
              </div>
            )}
          </div>

        </div>

        {/* SENT HISTORY — same treatment as the invoice card's
            "Outbox & Email History" panel. */}
        {outboxLog.length > 0 && (
          <div className="px-4 sm:px-5 py-3 bg-[#faf9f5] border-t border-[#e7e2d8] rounded-b-2xl">
            <div className="flex items-center gap-1.5 mb-2">
              <History size={12} className="text-[#a8a29e]" />
              <span className="text-[11px] font-medium uppercase tracking-wide text-[#a8a29e]">
                Sent Email History ({outboxLog.length})
              </span>
            </div>
            <div className="max-h-[120px] overflow-y-auto space-y-1.5 pr-1">
              {outboxLog.map((entry: any, i: number) => (
                <div key={i} className="flex items-center justify-between p-2 bg-white rounded-xl border border-[#e7e2d8] transition hover:bg-[#f5f1e8]">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${entry.status === 'failed' ? 'bg-rose-500' : 'bg-emerald-500'}`} />
                    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${entry.status === 'failed' ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-700'}`}>
                      {entry.status}
                    </span>
                    <p className="text-[11px] font-medium text-[#292524] truncate">
                      {new Date(entry.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} at {new Date(entry.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  {entry.html_body && (
                    <button
                      type="button"
                      onClick={() => setPreviewHtml(entry.html_body)}
                      className="flex items-center gap-1 px-2 py-1 bg-[#faf9f5] border border-[#e7e2d8] rounded-md text-[10px] font-medium text-brand-700 hover:bg-brand-50 transition shrink-0 touch-manipulation"
                    >
                      <Eye size={10} /> Preview
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* JOB HOURS MODAL */}
      <AnimatePresence>
        {clockOpen && (
          <motion.div
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-[#1c1917]/50 backdrop-blur-sm"
            onClick={() => setClockOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.96, y: 12 }} 
              animate={{ scale: 1, y: 0 }} 
              exit={{ scale: 0.96, y: 12 }}
              transition={{ type: 'spring', damping: 28, stiffness: 320 }}
              className="bg-white w-full max-w-xs rounded-2xl shadow-2xl overflow-hidden border border-[#e7e2d8]"
              onClick={e => e.stopPropagation()}
            >
              <div className="px-5 py-4 border-b border-[#e7e2d8] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock size={14} className="text-amber-500" />
                  <h3 className="text-xs font-bold text-[#1c1917]">Edit Job Hours</h3>
                </div>
                <button onClick={() => setClockOpen(false)} className="p-1 hover:bg-[#f5f1e8] rounded-lg text-[#a8a29e] hover:text-[#57534e]">
                  <X size={15} />
                </button>
              </div>

              <div className="p-5 space-y-4">
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wide text-[#a8a29e] block mb-1.5">
                    Estimated Hours
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    placeholder="e.g. 4.5"
                    value={estimatedHours}
                    onChange={(e) => setEstimatedHours(e.target.value)}
                    className="w-full px-3 py-2 bg-[#faf9f5] border border-[#e7e2d8] rounded-xl text-[#1c1917] text-xs font-semibold outline-none focus:border-brand-700 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wide text-[#a8a29e] block mb-1.5">
                    Actual Hours Worked
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    placeholder="e.g. 5.0"
                    value={actualHours}
                    onChange={(e) => setActualHours(e.target.value)}
                    className="w-full px-3 py-2 bg-[#faf9f5] border border-[#e7e2d8] rounded-xl text-[#1c1917] text-xs font-semibold outline-none focus:border-brand-700 focus:bg-white"
                  />
                </div>

                <div className="pt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setClockOpen(false)}
                    className="flex-1 py-2.5 bg-[#f5f1e8] hover:bg-[#e7e2d8] text-[#57534e] font-bold rounded-xl text-xs transition"
                  >
                    Done
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

          {/* PROMINENT STICKY SAVE BAR — viewport-fixed, not tucked into a
          shared header row. Only appears while something's actually
          unsaved, so it can't be missed on mobile after scrolling past
          the action buttons, Job Hours, or Sent Email History — without
          this, saving required scrolling all the way back up to the
          header. Desktop keeps just the header button, since nothing on
          this page is tall enough there to scroll the header out of
          view.

          BOTTOM OFFSET: stacked above the app's bottom mobile nav bar,
          not underneath it — the single number below (currently a guess
          at 64px) is the one place to adjust if it doesn't line up
          exactly against the real nav bar's height once checked on a
          real phone. If the bottom nav is actually hidden while a job's
          detail view is open, change this back to bottom-0. */}
      <AnimatePresence>
        {isDirty && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            className="lg:hidden fixed left-0 right-0 z-40 bg-white border-t border-[#e7e2d8] shadow-[0_-4px_16px_rgba(0,0,0,0.08)] px-4 pt-3"
            style={{
              bottom: '64px', // ← adjust to match your actual bottom nav height
              paddingBottom: 'calc(env(safe-area-inset-bottom) + 12px)',
            }}
          >
            <div className="flex items-center justify-between gap-3 max-w-4xl mx-auto">
              <p className="flex items-center gap-2 text-sm font-semibold text-[#1c1917]">
                <span className="h-2 w-2 shrink-0 animate-pulse rounded-full bg-amber-500" />
                Unsaved changes
              </p>
              <motion.button
                type="button"
                onClick={handleSave}
                disabled={saving}
                animate={!saving ? { scale: [1, 1.035, 1] } : { scale: 1 }}
                transition={!saving ? { duration: 1.8, repeat: Infinity, ease: 'easeInOut' } : { duration: 0.15 }}
                className="flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold bg-brand-700 hover:bg-brand-800 text-white shadow-md shadow-brand-700/30 active:scale-95 transition-colors min-h-[44px]"
              >
                {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                {saving ? 'Saving...' : 'Save changes'}
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}