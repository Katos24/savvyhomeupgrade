'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
  Calendar, User,
  X, Eye,
  ChevronDown, Hash, CheckCircle2, Clock,
  History, Loader2, Save, Mail
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

  // First selected = primary. Everything that only understands a single
  // "assigned_to" string (calendar view, filters, the schedule email,
  // the buffer-conflict message) reads this derived value — nothing
  // downstream needs to know the picker is now multi-select.
  const assignedTo = selectedAssignees[0] || '';
  const additionalAssignees = selectedAssignees.slice(1);
  const [estimatedHours, setEstimatedHours] = useState('');
  const [actualHours, setActualHours] = useState('');
  
  const teamLoading = false;
  const [lastHtmlBody, setLastHtmlBody] = useState<string | null>(null);
  const [outboxLog, setOutboxLog] = useState<any[]>([]);
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);
  const [clockOpen, setClockOpen] = useState(false);
  const [scheduledEndTime, setScheduledEndTime] = useState('');
  const [eventLocation, setEventLocation] = useState('');
const [endTimeHour, setEndTimeHour] = useState('');
const [endTimeMinute, setEndTimeMinute] = useState('');
const [endTimeAmPm, setEndTimeAmPm] = useState('PM');

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
    setScheduledDate(lead?.scheduled_date ? lead.scheduled_date.split('T')[0].split(' ')[0] : '');
    if (lead?.scheduled_time) {
      const { hour, minute, ampm } = parseTimeString(lead.scheduled_time);
      setTimeHour(hour); 
      setTimeMinute(minute); 
      setTimeAmPm(ampm);
      setScheduledTime(lead.scheduled_time);
    } else {
      setTimeHour(''); setTimeMinute(''); setTimeAmPm('AM'); setScheduledTime('');
    }
   setEstimatedHours(lead?.estimated_hours || '');
    setActualHours(lead?.actual_hours || '');
    let extra: string[] = [];
    try {
      const raw = lead?.additional_assignees;
      const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
      extra = Array.isArray(parsed) ? parsed : [];
    } catch { extra = []; }
    setSelectedAssignees([lead?.assigned_to, ...extra].filter(Boolean));
  }, [lead]);

  useEffect(() => {
    setScheduledTime(buildTimeString(timeHour, timeMinute, timeAmPm));
  }, [timeHour, timeMinute, timeAmPm]);

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
    <>
      {/* EMAIL PREVIEW MODAL */}
      <AnimatePresence>
        {previewHtml && (
          <motion.div
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[10000] flex items-center justify-center p-6 bg-slate-900/85 backdrop-blur-sm"
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
                <button onClick={() => setPreviewHtml(null)} className="p-1.5 hover:bg-slate-100 rounded-lg transition">
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

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden flex flex-col">
        {/* HEADER */}
        <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Schedule</h3>
            {lastEmailSentAt && (
              <div className="flex items-center gap-1 mt-0.5">
                <CheckCircle2 size={11} className="text-emerald-500" />
                <p className="text-[11px] text-emerald-600">
                  Sent {new Date(lastEmailSentAt).toLocaleDateString()}
                </p>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setClockOpen(true)}
              className="flex items-center justify-center w-8 h-8 border border-slate-200 text-slate-500 rounded-lg transition-all hover:bg-slate-50 relative"
              title="Job hours"
            >
              <Clock size={14} />
              {(estimatedHours || actualHours) && (
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full" />
              )}
            </button>
            <button
              onClick={() => setShowCalendarModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 text-slate-600 rounded-lg text-xs font-medium transition-all hover:bg-slate-50"
            >
              <Calendar size={13} />
              <span className="hidden sm:inline">Calendar</span>
            </button>
          </div>
        </div>

        <div className="p-4 space-y-3">
         {/* ASSIGNED TO */}
          <div className="relative">
            <label className="flex items-center gap-1.5 text-[11px] font-medium text-slate-400 mb-1.5">
              <User size={11} /> Assigned to
            </label>

            <button
              type="button"
              onClick={() => setAssigneePickerOpen((o) => !o)}
              className="w-full flex flex-wrap items-center gap-1.5 min-h-[42px] px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-left"
            >
              {selectedAssignees.length === 0 ? (
                <span className="text-sm font-medium text-slate-400">Choose staff...</span>
              ) : (
                selectedAssignees.map((name, i) => (
                  <span
                    key={name}
                    className={`flex items-center gap-1 pl-2.5 pr-1.5 py-1 rounded-lg text-xs font-medium ${
                      i === 0 ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {i === 0 && <span className="text-[9px] font-bold uppercase tracking-wide opacity-70">Primary</span>}
                    {name}
                    <span
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedAssignees((prev) => prev.filter((n) => n !== name));
                      }}
                      className="p-0.5 hover:bg-black/10 rounded-md cursor-pointer"
                    >
                      <X size={10} />
                    </span>
                  </span>
                ))
              )}
              <ChevronDown className="ml-auto w-4 h-4 text-slate-400 shrink-0" />
            </button>

            {assigneePickerOpen && (
              <div className="absolute z-10 mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-lg p-2 max-h-56 overflow-y-auto">
                {teamMembers.map((m: any) => {
                  const checked = selectedAssignees.includes(m.name);
                  return (
                    <label
                      key={m.id}
                      className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-slate-50 cursor-pointer text-sm font-medium text-slate-700"
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => {
                          setSelectedAssignees((prev) =>
                            checked ? prev.filter((n) => n !== m.name) : [...prev, m.name]
                          );
                        }}
                        className="w-4 h-4 accent-blue-600"
                      />
                      {m.name}
                    </label>
                  );
                })}
                <div className="flex gap-1.5 mt-1.5 pt-1.5 border-t border-slate-100">
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
                    className="flex-1 px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-900 outline-none focus:border-blue-400"
                  />
                  <button
                    onClick={() => {
                      const val = customNameInput.trim();
                      if (val && !selectedAssignees.includes(val)) {
                        setSelectedAssignees((prev) => [...prev, val]);
                        setCustomNameInput('');
                      }
                    }}
                    className="px-2.5 bg-slate-900 text-white rounded-lg text-xs font-medium"
                  >
                    Add
                  </button>
                </div>
                <button
                  onClick={() => setAssigneePickerOpen(false)}
                  className="w-full mt-1.5 py-1.5 text-xs font-medium text-slate-500 hover:text-slate-700"
                >
                  Done
                </button>
              </div>
            )}
          </div>

          {/* DATE & TIME */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div className="min-w-0 overflow-hidden">
              <label className="text-[11px] font-medium text-slate-400 mb-1.5 block">Date</label>
              <input
                type="date" 
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                className="w-full min-w-0 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs outline-none focus:border-blue-400 focus:bg-white transition-all"
                style={{ maxWidth: '100%', WebkitAppearance: 'none' }}
              />
            </div>
            <div>
              <label className="text-[11px] font-medium text-slate-400 mb-1.5 block">Time</label>
              <div className="flex items-center px-2.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl gap-1 focus-within:border-blue-400 focus-within:bg-white transition-all">
                <select value={timeHour} onChange={(e) => setTimeHour(e.target.value)} className="bg-transparent text-xs font-medium outline-none flex-1 cursor-pointer min-w-0">
                  <option value="">HH</option>
                  {Array.from({ length: 12 }, (_, i) => i + 1).map(h => <option key={h} value={h}>{h}</option>)}
                </select>
                <span className="text-slate-300 text-xs">:</span>
                <select value={timeMinute} onChange={(e) => setTimeMinute(e.target.value)} className="bg-transparent text-xs font-medium outline-none flex-1 cursor-pointer min-w-0">
                  <option value="">MM</option>
                  {['00', '15', '30', '45'].map(m => <option key={m} value={m}>{m}</option>)}
                </select>
                <select value={timeAmPm} onChange={(e) => setTimeAmPm(e.target.value)} className="bg-white border border-slate-200 px-1.5 py-0.5 rounded-lg text-[11px] font-medium text-blue-600 outline-none">
                  <option value="AM">AM</option>
                  <option value="PM">PM</option>
                </select>
              </div>
            </div>
          </div>

          {schedulingConfig.showEndTime && (
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
    <div /> {/* spacer to align under Date column */}
    <div>
      <label className="text-[11px] font-medium text-slate-400 mb-1.5 block">End Time</label>
      <div className="flex items-center px-2.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl gap-1 focus-within:border-blue-400 focus-within:bg-white transition-all">
        <select value={endTimeHour} onChange={(e) => setEndTimeHour(e.target.value)} className="bg-transparent text-xs font-medium outline-none flex-1 cursor-pointer min-w-0">
          <option value="">HH</option>
          {Array.from({ length: 12 }, (_, i) => i + 1).map(h => <option key={h} value={h}>{h}</option>)}
        </select>
        <span className="text-slate-300 text-xs">:</span>
        <select value={endTimeMinute} onChange={(e) => setEndTimeMinute(e.target.value)} className="bg-transparent text-xs font-medium outline-none flex-1 cursor-pointer min-w-0">
          <option value="">MM</option>
          {['00', '15', '30', '45'].map(m => <option key={m} value={m}>{m}</option>)}
        </select>
        <select value={endTimeAmPm} onChange={(e) => setEndTimeAmPm(e.target.value)} className="bg-white border border-slate-200 px-1.5 py-0.5 rounded-lg text-[11px] font-medium text-blue-600 outline-none">
          <option value="AM">AM</option>
          <option value="PM">PM</option>
        </select>
      </div>
    </div>
    <div className="mt-2">
      <label className="text-[11px] font-medium text-slate-400 mb-1.5 block">Event Location</label>
      <input
        type="text"
        value={eventLocation}
        onChange={(e) => setEventLocation(e.target.value)}
        placeholder="Venue name and address..."
        className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 outline-none focus:border-blue-400 focus:bg-white transition-all"
      />
    </div>
  </div>
)}
          {/* SENT HISTORY */}
          {outboxLog.length > 0 && (
            <div className="pt-3 border-t border-slate-100 -mx-4 px-4 pb-1 bg-slate-50">
              <div className="flex items-center gap-1.5 mb-2.5">
                <History size={11} className="text-slate-400" />
                <span className="text-[11px] font-medium text-slate-400">
                  Sent history ({outboxLog.length})
                </span>
              </div>
              <div className="max-h-[160px] overflow-y-auto pr-1 space-y-1.5">
                {outboxLog.map((entry: any, i: number) => (
                  <div key={i} className="flex items-center justify-between p-2.5 bg-white rounded-lg border border-slate-200 transition-all hover:border-slate-300">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${entry.status === 'failed' ? 'bg-red-500' : 'bg-emerald-500'}`} />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${entry.status === 'failed' ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-700'}`}>
                            {entry.status}
                          </span>
                          <p className="text-[11px] font-medium text-slate-700">
                            {new Date(entry.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                          </p>
                          <span className="text-[10px] text-slate-400">
                            {new Date(entry.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        {entry.sent_by_email && (
                          <p className="text-[10px] text-slate-400 truncate mt-0.5">{entry.sent_by_email}</p>
                        )}
                        {entry.status === 'failed' && entry.error_message && (
                          <p className="text-[10px] text-red-500 mt-0.5">{entry.error_message}</p>
                        )}
                      </div>
                    </div>
                    {entry.html_body && (
                      <button
                        onClick={() => setPreviewHtml(entry.html_body)}
                        className="flex items-center gap-1 px-2 py-1 bg-slate-100 border border-slate-200 rounded-md text-[10px] font-medium text-blue-600 hover:bg-blue-50 hover:border-blue-300 transition-all shrink-0"
                      >
                        <Eye size={11} /> Preview
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="px-4 py-3 bg-slate-900 flex items-center justify-between mt-auto">
          <span className="text-xs text-slate-400">
            {scheduledDate
              ? new Date(scheduledDate + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
              : 'Not scheduled'}
          </span>
          <div className="flex items-center bg-slate-800 rounded-lg p-1">
            <button
              onClick={() => handleSave()}
              disabled={saving}
              className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition disabled:opacity-30 text-slate-300 hover:bg-slate-700"
            >
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              {saving ? 'Saving...' : 'Save'}
            </button>
            <div className="w-px h-4 bg-slate-700 mx-1" />
            <div className="relative group">
              <button
                onClick={() => {
                  if (!hasProject) {
                    toast.error('Create a project first');
                    return;
                  }
                  if (!scheduledDate) {
                    toast.error('Add a date to send the schedule');
                    return;
                  }
                  setShowEmailModal(true);
                }}
                className={`flex items-center justify-center w-8 h-8 rounded-md text-white hover:bg-slate-700 transition ${(!hasProject || !scheduledDate) ? 'opacity-30' : ''}`}
              >
                <Mail className="w-4 h-4" />
              </button>
              {(!hasProject || !scheduledDate) && (
                <div className="absolute bottom-full right-0 mb-2 w-44 bg-slate-700 text-white text-[11px] font-medium px-3 py-2 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none text-center leading-relaxed">
                  {!hasProject ? 'Create a project first' : 'Add a date to send schedule'}
                </div>
              )}
            </div>
          </div>
        </div>
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
                  <Clock size={14} className="text-slate-400" />
                  <p className="text-sm font-semibold text-slate-900">Job hours</p>
                </div>
                <button onClick={() => setClockOpen(false)} className="p-1.5 hover:bg-slate-100 rounded-lg transition">
                  <X size={14} className="text-slate-400" />
                </button>
              </div>
              <div className="px-5 py-5 space-y-4">
                <div>
                  <label className="text-[11px] font-medium text-slate-400 mb-1.5 block uppercase tracking-wide">Estimated hours</label>
                  <input
                    type="number"
                    step="0.5"
                    value={estimatedHours}
                    onChange={e => setEstimatedHours(e.target.value)}
                    placeholder="0.0"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 outline-none focus:border-blue-400 focus:bg-white transition-all"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-medium text-slate-400 mb-1.5 block uppercase tracking-wide">Actual hours</label>
                  <input
                    type="number"
                    step="0.5"
                    value={actualHours}
                    onChange={e => setActualHours(e.target.value)}
                    placeholder="0.0"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 outline-none focus:border-blue-400 focus:bg-white transition-all"
                  />
                </div>
                {estimatedHours && actualHours && (
                  <div className="flex items-center justify-between px-3.5 py-2.5 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[11px] font-medium text-slate-500">Over/under</span>
                    <span className={`text-xs font-bold ${parseFloat(actualHours) > parseFloat(estimatedHours) ? 'text-red-500' : 'text-emerald-600'}`}>
                      {parseFloat(actualHours) > parseFloat(estimatedHours)
                        ? `+${(parseFloat(actualHours) - parseFloat(estimatedHours)).toFixed(1)} hrs over`
                        : `${(parseFloat(estimatedHours) - parseFloat(actualHours)).toFixed(1)} hrs under`}
                    </span>
                  </div>
                )}
              </div>
              <div className="px-5 pb-5">
                <button
                  onClick={() => { handleSave(); setClockOpen(false); }}
                  disabled={saving}
                  className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2"
                >
                  {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                  {saving ? 'Saving...' : 'Save hours'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MODALS */}
   <SchedulingCalendarModal
        isOpen={showCalendarModal}
        onClose={() => setShowCalendarModal(false)}
        onSelectDateTime={(d, t, endT) => {
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

      <SendEmailModal
        open={showEmailModal}
        onClose={() => setShowEmailModal(false)}
        onSuccess={async () => { await onRefresh(); await fetchOutbox(); }}
        type="schedule"
        leadId={lead.id}
        currentUser={currentUser}
        customerName={lead.name}
        customerEmail={lead.email}
        contextLine={scheduledDate ? new Date(scheduledDate + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) : null}
        lastSentAt={lastEmailSentAt}
        lastHtmlBody={lastHtmlBody}
      />
    </>
  );
}