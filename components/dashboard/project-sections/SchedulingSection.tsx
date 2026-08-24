'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
  Calendar, User,
  X, Eye,
  ChevronDown, CheckCircle2, Clock,
  History, Loader2, Save, Mail, MapPin
} from 'lucide-react';
import SchedulingCalendarModal from './SchedulingCalendarModal';
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
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);

  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [timeHour, setTimeHour] = useState('');
  const [timeMinute, setTimeMinute] = useState('');
  const [timeAmPm, setTimeAmPm] = useState('AM');
  const [selectedAssignees, setSelectedAssignees] = useState<string[]>([]);
  const [assigneePickerOpen, setAssigneePickerOpen] = useState(false);
  const [customNameInput, setCustomNameInput] = useState('');

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
  const [endTimeHour, setEndTimeHour] = useState('');
  const [endTimeMinute, setEndTimeMinute] = useState('');
  const [endTimeAmPm, setEndTimeAmPm] = useState('PM');

  // Track initial state to indicate dirty / unsaved changes
  const [initialState, setInitialState] = useState<any>({});

  // Outside click ref for Assignee Dropdown
  const assigneeRef = useRef<HTMLDivElement>(null);
  const assigneeTriggerRef = useRef<HTMLButtonElement>(null);
  const assigneeDropdownRef = useRef<HTMLDivElement>(null);
  const [assigneeDropdownPos, setAssigneeDropdownPos] = useState({ top: 0, left: 0, width: 0 });

  const positionAssigneeDropdown = () => {
    if (!assigneeTriggerRef.current) return;
    const rect = assigneeTriggerRef.current.getBoundingClientRect();
    setAssigneeDropdownPos({ top: rect.bottom + 4, left: rect.left, width: rect.width });
  };

  const toggleAssigneePicker = () => {
    if (!assigneePickerOpen) positionAssigneeDropdown();
    setAssigneePickerOpen((o) => !o);
  };

  // Keep the portaled dropdown aligned with its trigger while open
  useEffect(() => {
    if (!assigneePickerOpen) return;
    positionAssigneeDropdown();
    window.addEventListener('scroll', positionAssigneeDropdown, true);
    window.addEventListener('resize', positionAssigneeDropdown);
    return () => {
      window.removeEventListener('scroll', positionAssigneeDropdown, true);
      window.removeEventListener('resize', positionAssigneeDropdown);
    };
  }, [assigneePickerOpen]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      const insideTrigger = assigneeRef.current && assigneeRef.current.contains(target);
      const insideDropdown = assigneeDropdownRef.current && assigneeDropdownRef.current.contains(target);
      if (!insideTrigger && !insideDropdown) {
        setAssigneePickerOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    setScheduledEndTime(lead?.scheduled_end_time ? lead.scheduled_end_time : '');
    setEventLocation(lead?.event_location || '');
    if (lead?.scheduled_end_time) {
      const { hour, minute, ampm } = parseTimeString(lead.scheduled_end_time);
      setEndTimeHour(hour); setEndTimeMinute(minute); setEndTimeAmPm(ampm);
    }
  }, [lead]);

  useEffect(() => {
    setScheduledEndTime(buildTimeString(endTimeHour, endTimeMinute, endTimeAmPm));
  }, [endTimeHour, endTimeMinute, endTimeAmPm]);

  const scheduleEmailLog = useMemo(() => {
    try {
      const raw = lead?.schedule_emails;
      const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw || [];
      return Array.isArray(parsed) ? [...parsed].reverse() : [];
    } catch { return []; }
  }, [lead?.schedule_emails]);

  const schedulingConfig = getSchedulingConfig(company?.business_type);
  const lastEmailSentAt = scheduleEmailLog.length > 0 ? scheduleEmailLog[0].sent_at : null;

  const parseTimeString = (time24: string) => {
    if (!time24) return { hour: '', minute: '', ampm: 'AM' };
    const [hours, minutes] = time24.split(':');
    const hour24 = parseInt(hours, 10);
    const ampm = hour24 >= 12 ? 'PM' : 'AM';
    const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
    return { hour: hour12.toString(), minute: minutes, ampm };
  };

  const buildTimeString = (hour: string, minute: string, ampm: string) => {
    if (!hour || !minute) return '';
    let hour24 = parseInt(hour, 10);
    if (ampm === 'PM' && hour24 !== 12) hour24 += 12;
    else if (ampm === 'AM' && hour24 === 12) hour24 = 0;
    return `${hour24.toString().padStart(2, '0')}:${minute}`;
  };

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
    
    let sTime = '';
    if (lead?.scheduled_time) {
      const { hour, minute, ampm } = parseTimeString(lead.scheduled_time);
      setTimeHour(hour); 
      setTimeMinute(minute); 
      setTimeAmPm(ampm);
      sTime = lead.scheduled_time;
      setScheduledTime(lead.scheduled_time);
    } else {
      setTimeHour(''); setTimeMinute(''); setTimeAmPm('AM'); setScheduledTime('');
    }

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
      date: sDate,
      time: sTime,
      endTime: lead?.scheduled_end_time || '',
      location: lead?.event_location || '',
      assignees: JSON.stringify(assignees),
      estH,
      actH
    });
  }, [lead]);

  useEffect(() => {
    setScheduledTime(buildTimeString(timeHour, timeMinute, timeAmPm));
  }, [timeHour, timeMinute, timeAmPm]);

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

  // Formatted date and time strings for modal reference
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

  const scheduledTimeFormatted = useMemo(() => {
    if (!timeHour || !timeMinute) return null;
    const start = `${timeHour}:${timeMinute} ${timeAmPm}`;
    if (schedulingConfig.showEndTime && endTimeHour && endTimeMinute) {
      const end = `${endTimeHour}:${endTimeMinute} ${endTimeAmPm}`;
      return `${start} - ${end}`;
    }
    return start;
  }, [timeHour, timeMinute, timeAmPm, endTimeHour, endTimeMinute, endTimeAmPm, schedulingConfig.showEndTime]);

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
    <div className="max-w-4xl mx-auto w-full space-y-4">
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

      {/* CALENDAR MODAL */}
      <SchedulingCalendarModal
        isOpen={showCalendarModal}
        onClose={() => setShowCalendarModal(false)}
        onSelectDateTime={(d: string, t: string, endT?: string) => {
          setScheduledDate(d);
          const { hour, minute, ampm } = parseTimeString(t);
          setTimeHour(hour);
          setTimeMinute(minute);
          setTimeAmPm(ampm);
          if (endT) {
            const end = parseTimeString(endT);
            setEndTimeHour(end.hour);
            setEndTimeMinute(end.minute);
            setEndTimeAmPm(end.ampm);
          }
        }}
        companySlug={companySlug}
        currentScheduledDate={scheduledDate}
        currentScheduledTime={scheduledTime}
        currentScheduledEndTime={scheduledEndTime}
        selectedAssignees={selectedAssignees}
        currentLeadId={lead?.id}
        bufferMinutes={schedulingConfig.bufferMinutes}
        showEndTime={schedulingConfig.showEndTime}
      />

      {/* EMAIL PREVIEW MODAL */}
      <AnimatePresence>
        {previewHtml && (
          <motion.div
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-slate-900/85 backdrop-blur-sm"
            onClick={() => setPreviewHtml(null)}
          >
            <motion.div
              initial={{ scale: 0.97, y: 12 }} 
              animate={{ scale: 1, y: 0 }} 
              exit={{ scale: 0.97, y: 12 }}
              className="bg-white w-full max-w-2xl rounded-2xl overflow-hidden flex flex-col shadow-2xl h-[85vh]"
              onClick={e => e.stopPropagation()}
            >
              <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                  <Eye size={14} className="text-slate-400" />
                  <p className="text-xs font-medium text-slate-700">Email preview</p>
                </div>
                <button onClick={() => setPreviewHtml(null)} className="p-1.5 hover:bg-slate-100 rounded-lg transition touch-manipulation">
                  <X size={16} />
                </button>
              </div>
              <div className="flex-1 p-3">
                <iframe
                  title="Email Preview"
                  srcDoc={`${previewHtml}<style>a,button{pointer-events:none!important;cursor:default!important;}</style>`}
                  className="w-full h-full rounded-xl border border-slate-100"
                  sandbox="allow-same-origin"
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MAIN CONTAINER */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm flex flex-col relative z-10">
        
        {/* HEADER & PRIMARY ACTIONS */}
        <div className="px-4 sm:px-5 py-3.5 border-b border-slate-100 bg-slate-50/50 rounded-t-2xl flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Schedule Overview
            </h3>
            {isDirty ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-200/80 rounded-md text-[10px] font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                Unsaved
              </span>
            ) : (
              <span className="text-[10px] text-slate-400 font-medium">Saved</span>
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
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 sm:py-1.5 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold shadow-xs transition touch-manipulation disabled:opacity-40 min-h-[42px] sm:min-h-0"
            >
              <Mail className="w-3.5 h-3.5 text-blue-600" />
              <span>{outboxLog.length > 0 ? 'Resend Schedule' : 'Send Schedule'}</span>
            </button>

            <button
              type="button"
              onClick={() => handleSave()}
              disabled={saving}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 sm:py-1.5 text-xs font-semibold rounded-xl transition shadow-xs touch-manipulation min-h-[42px] sm:min-h-0 ${
                isDirty ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-slate-900 hover:bg-slate-800 text-white'
              } disabled:opacity-50`}
            >
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>

        {/* MAIN BODY: FORM & SIDEBAR */}
        <div className="p-4 sm:p-5 grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* LEFT 2 COLS: ASSIGNEE, DATE & TIME */}
          <div className="lg:col-span-2 space-y-4">
            
            {/* ASSIGNED TO */}
            <div className="relative" ref={assigneeRef}>
              <label className="flex items-center gap-1.5 text-[11px] font-medium text-slate-400 uppercase tracking-wider mb-1.5">
                <User size={12} className="text-slate-400" /> Assigned to
              </label>

              <button
                ref={assigneeTriggerRef}
                type="button"
                onClick={toggleAssigneePicker}
                className="w-full flex flex-wrap items-center gap-1.5 min-h-[44px] px-3.5 py-2 bg-slate-50/70 border border-slate-200/80 rounded-xl text-left hover:bg-slate-50 transition touch-manipulation"
              >
                {selectedAssignees.length === 0 ? (
                  <span className="text-[16px] sm:text-xs font-medium text-slate-400">Choose staff...</span>
                ) : (
                  selectedAssignees.map((name, i) => (
                    <span
                      key={name}
                      className={`flex items-center gap-1.5 pl-2.5 pr-1 py-1 rounded-lg text-xs font-medium ${
                        i === 0 ? 'bg-blue-50 text-blue-700 border border-blue-100' : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {i === 0 && <span className="text-[9px] font-bold uppercase tracking-wide opacity-70">Primary</span>}
                      {name}
                      <span
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedAssignees((prev) => prev.filter((n) => n !== name));
                        }}
                        className="p-1.5 -mr-0.5 hover:bg-black/10 rounded-md cursor-pointer transition touch-manipulation"
                      >
                        <X size={12} />
                      </span>
                    </span>
                  ))
                )}
                <ChevronDown className="ml-auto w-4 h-4 text-slate-400 shrink-0" />
              </button>

              {assigneePickerOpen && typeof document !== 'undefined' && createPortal(
                <div
                  ref={assigneeDropdownRef}
                  style={{
                    position: 'fixed',
                    top: assigneeDropdownPos.top,
                    left: assigneeDropdownPos.left,
                    width: assigneeDropdownPos.width,
                  }}
                  className="z-[500] bg-white border border-slate-200 rounded-xl shadow-xl p-2 max-h-60 overflow-y-auto"
                >
                  {teamMembers.map((m: any) => {
                    const checked = selectedAssignees.includes(m.name);
                    return (
                      <label
                        key={m.id}
                        className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg hover:bg-slate-50 cursor-pointer text-xs font-medium text-slate-700 transition touch-manipulation"
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => {
                            setSelectedAssignees((prev) =>
                              checked ? prev.filter((n) => n !== m.name) : [...prev, m.name]
                            );
                          }}
                          className="w-4 h-4 rounded accent-blue-600 cursor-pointer"
                        />
                        {m.name}
                      </label>
                    );
                  })}
                  <div className="flex gap-1.5 mt-1.5 pt-2 border-t border-slate-100">
                    <input
                      type="text"
                      placeholder="Custom name..."
                      value={customNameInput}
                      onChange={(e) => setCustomNameInput(e.target.value)}
                      onKeyDown={(e) => {
                        const val = customNameInput.trim();
                        if (e.key === 'Enter' && val && !selectedAssignees.includes(val)) {
                          setSelectedAssignees((prev) => [...prev, val]);
                          setCustomNameInput('');
                        }
                      }}
                      className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-[16px] sm:text-xs font-medium text-slate-900 outline-none focus:border-blue-400"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const val = customNameInput.trim();
                        if (val && !selectedAssignees.includes(val)) {
                          setSelectedAssignees((prev) => [...prev, val]);
                          setCustomNameInput('');
                        }
                      }}
                      className="px-3 py-2 bg-slate-900 text-white rounded-lg text-xs font-medium hover:bg-slate-800 transition touch-manipulation"
                    >
                      Add
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAssigneePickerOpen(false)}
                    className="w-full mt-2 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 rounded-lg transition touch-manipulation"
                  >
                    Done
                  </button>
                </div>,
                document.body
              )}
            </div>

            {/* DATE & START TIME */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Date & Start Time</label>
                <button
                  type="button"
                  onClick={() => setShowCalendarModal(true)}
                  className="flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-700 hover:underline transition touch-manipulation"
                >
                  <Calendar size={12} />
                  Calendar View ↗
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="min-w-0">
                  <input
                    type="date" 
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50/70 border border-slate-200/80 rounded-xl text-slate-900 text-[16px] sm:text-xs font-medium outline-none focus:border-blue-400 focus:bg-white transition-all min-h-[44px] touch-manipulation"
                  />
                </div>
                <div>
                  <div className="flex items-center px-3 py-2 bg-slate-50/70 border border-slate-200/80 rounded-xl gap-1 focus-within:border-blue-400 focus-within:bg-white transition-all min-h-[44px]">
                    <select value={timeHour} onChange={(e) => setTimeHour(e.target.value)} className="bg-transparent text-[16px] sm:text-xs font-medium outline-none flex-1 cursor-pointer min-w-0 touch-manipulation">
                      <option value="">HH</option>
                      {Array.from({ length: 12 }, (_, i) => i + 1).map(h => <option key={h} value={h}>{h}</option>)}
                    </select>
                    <span className="text-slate-300 text-xs">:</span>
                    <select value={timeMinute} onChange={(e) => setTimeMinute(e.target.value)} className="bg-transparent text-[16px] sm:text-xs font-medium outline-none flex-1 cursor-pointer min-w-0 touch-manipulation">
                      <option value="">MM</option>
                      {['00', '15', '30', '45'].map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                    <select value={timeAmPm} onChange={(e) => setTimeAmPm(e.target.value)} className="bg-white border border-slate-200 px-2 py-1 rounded-lg text-[16px] sm:text-xs font-semibold text-blue-600 outline-none shadow-sm touch-manipulation">
                      <option value="AM">AM</option>
                      <option value="PM">PM</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* END TIME & LOCATION */}
            {schedulingConfig.showEndTime && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                <div>
                  <label className="text-[11px] font-medium text-slate-400 uppercase tracking-wider mb-1.5 block">End Time</label>
                  <div className="flex items-center px-3 py-2 bg-slate-50/70 border border-slate-200/80 rounded-xl gap-1 focus-within:border-blue-400 focus-within:bg-white transition-all min-h-[44px]">
                    <select value={endTimeHour} onChange={(e) => setEndTimeHour(e.target.value)} className="bg-transparent text-[16px] sm:text-xs font-medium outline-none flex-1 cursor-pointer min-w-0 touch-manipulation">
                      <option value="">HH</option>
                      {Array.from({ length: 12 }, (_, i) => i + 1).map(h => <option key={h} value={h}>{h}</option>)}
                    </select>
                    <span className="text-slate-300 text-xs">:</span>
                    <select value={endTimeMinute} onChange={(e) => setEndTimeMinute(e.target.value)} className="bg-transparent text-[16px] sm:text-xs font-medium outline-none flex-1 cursor-pointer min-w-0 touch-manipulation">
                      <option value="">MM</option>
                      {['00', '15', '30', '45'].map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                    <select value={endTimeAmPm} onChange={(e) => setEndTimeAmPm(e.target.value)} className="bg-white border border-slate-200 px-2 py-1 rounded-lg text-[16px] sm:text-xs font-semibold text-blue-600 outline-none shadow-sm touch-manipulation">
                      <option value="AM">AM</option>
                      <option value="PM">PM</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-[11px] font-medium text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                    <MapPin size={11} /> Event Location
                  </label>
                  <input
                    type="text"
                    value={eventLocation}
                    onChange={(e) => setEventLocation(e.target.value)}
                    placeholder="Venue name and address..."
                    className="w-full px-3.5 py-2 bg-slate-50/70 border border-slate-200/80 rounded-xl text-[16px] sm:text-xs font-medium text-slate-900 outline-none focus:border-blue-400 focus:bg-white transition-all min-h-[44px]"
                  />
                </div>
              </div>
            )}
          </div>

          {/* RIGHT 1 COL: JOB HOURS WIDGET */}
          <div className="bg-slate-50/70 p-4 rounded-2xl border border-slate-200/70 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Clock size={13} className="text-amber-500" />
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  Job Hours
                </p>
              </div>
              <button
                type="button"
                onClick={() => setClockOpen(true)}
                className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg text-xs font-semibold text-slate-700 shadow-xs transition touch-manipulation min-h-[36px] sm:min-h-0"
              >
                {estimatedHours || actualHours ? 'Edit Hours' : '+ Log Hours'}
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <div className="p-2.5 bg-white rounded-xl border border-slate-200/60 text-center">
                <p className="text-[10px] text-slate-400 font-medium uppercase">Estimated</p>
                <p className="text-xs font-bold text-slate-800 mt-0.5">
                  {estimatedHours ? `${estimatedHours} hrs` : '—'}
                </p>
              </div>
              <div className="p-2.5 bg-white rounded-xl border border-slate-200/60 text-center">
                <p className="text-[10px] text-slate-400 font-medium uppercase">Actual</p>
                <p className="text-xs font-bold text-slate-800 mt-0.5">
                  {actualHours ? `${actualHours} hrs` : '—'}
                </p>
              </div>
            </div>

            {estimatedHours && actualHours && (
              <div className="px-3 py-2 bg-white rounded-xl border border-slate-200/60 flex items-center justify-between">
                <span className="text-[11px] text-slate-400 font-medium">Variance</span>
                <span className={`text-xs font-bold ${parseFloat(actualHours) > parseFloat(estimatedHours) ? 'text-red-500' : 'text-emerald-600'}`}>
                  {parseFloat(actualHours) > parseFloat(estimatedHours)
                    ? `+${(parseFloat(actualHours) - parseFloat(estimatedHours)).toFixed(1)}h over`
                    : `${(parseFloat(estimatedHours) - parseFloat(actualHours)).toFixed(1)}h under`}
                </span>
              </div>
            )}
          </div>

        </div>

        {/* SENT HISTORY */}
        {outboxLog.length > 0 && (
          <div className="px-4 sm:px-5 py-3 bg-slate-50/50 border-t border-slate-100 rounded-b-2xl">
            <div className="flex items-center gap-1.5 mb-2">
              <History size={12} className="text-slate-400" />
              <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                Sent Email History ({outboxLog.length})
              </span>
            </div>
            <div className="max-h-[120px] overflow-y-auto space-y-1.5 pr-1">
              {outboxLog.map((entry: any, i: number) => (
                <div key={i} className="flex items-center justify-between p-2 bg-white rounded-xl border border-slate-200/80 transition hover:bg-slate-50">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${entry.status === 'failed' ? 'bg-red-500' : 'bg-emerald-500'}`} />
                    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${entry.status === 'failed' ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-700'}`}>
                      {entry.status}
                    </span>
                    <p className="text-[11px] font-medium text-slate-700 truncate">
                      {new Date(entry.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} at {new Date(entry.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  {entry.html_body && (
                    <button
                      type="button"
                      onClick={() => setPreviewHtml(entry.html_body)}
                      className="flex items-center gap-1 px-2 py-1 bg-slate-50 border border-slate-200 rounded-md text-[10px] font-medium text-blue-600 hover:bg-blue-50 transition shrink-0 touch-manipulation"
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
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => setClockOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.96, y: 12 }} 
              animate={{ scale: 1, y: 0 }} 
              exit={{ scale: 0.96, y: 12 }}
              transition={{ type: 'spring', damping: 28, stiffness: 320 }}
              className="bg-white w-full max-w-xs rounded-2xl shadow-2xl overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock size={14} className="text-amber-500" />
                  <h3 className="text-xs font-bold text-slate-800">Edit Job Hours</h3>
                </div>
                <button onClick={() => setClockOpen(false)} className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600">
                  <X size={15} />
                </button>
              </div>

              <div className="p-5 space-y-4">
                <div>
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                    Estimated Hours
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    placeholder="e.g. 4.5"
                    value={estimatedHours}
                    onChange={(e) => setEstimatedHours(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs font-semibold outline-none focus:border-blue-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                    Actual Hours Worked
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    placeholder="e.g. 5.0"
                    value={actualHours}
                    onChange={(e) => setActualHours(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs font-semibold outline-none focus:border-blue-500 focus:bg-white"
                  />
                </div>

                <div className="pt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setClockOpen(false)}
                    className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition"
                  >
                    Done
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}