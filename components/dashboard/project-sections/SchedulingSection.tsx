'use client';

import { useState, useEffect, useMemo } from 'react';
import { toast } from 'sonner';
import {
  Mail, Calendar, Clock, User,
  ChevronRight, X, Eye, Loader2, Send,
  ChevronDown, ChevronUp, Hash
} from 'lucide-react';
import SchedulingCalendarModal from './SchedulingCalendarModal';
import SendEmailModal from '@/components/dashboard/SendEmailModal';

type SchedulingSectionProps = {
  lead: any;
  currentUser: any;
  onRefresh: () => Promise<void>;
  hasProject: boolean;
  companySlug: string;
};

export default function SchedulingSection({ lead, currentUser, onRefresh, hasProject, companySlug }: SchedulingSectionProps) {
  const [saving, setSaving] = useState(false);
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [showHours, setShowHours] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);

  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [timeHour, setTimeHour] = useState('');
  const [timeMinute, setTimeMinute] = useState('');
  const [timeAmPm, setTimeAmPm] = useState('AM');
  const [assignedTo, setAssignedTo] = useState('');
  const [showCustomAssignee, setShowCustomAssignee] = useState(false);
  const [customAssignee, setCustomAssignee] = useState('');
  const [estimatedHours, setEstimatedHours] = useState('');
  const [actualHours, setActualHours] = useState('');
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [lastHtmlBody, setLastHtmlBody] = useState<string | null>(null);
  const [outboxLog, setOutboxLog] = useState<any[]>([]);
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);

  const parseTimeString = (time24: string) => {
    if (!time24) return { hour: '', minute: '', ampm: 'AM' };
    const [hours, minutes] = time24.split(':');
    const hour24 = parseInt(hours);
    const ampm = hour24 >= 12 ? 'PM' : 'AM';
    const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
    return { hour: hour12.toString(), minute: minutes, ampm };
  };

  const buildTimeString = (hour: string, minute: string, ampm: string) => {
    if (!hour || !minute) return '';
    let hour24 = parseInt(hour);
    if (ampm === 'PM' && hour24 !== 12) hour24 += 12;
    else if (ampm === 'AM' && hour24 === 12) hour24 = 0;
    return `${hour24.toString().padStart(2, '0')}:${minute}`;
  };

  useEffect(() => {
    async function fetchTeam() {
      try {
        const res = await fetch('/api/team/members');
        const data = await res.json();
        if (data.success) setTeamMembers(data.members);
      } catch {}
    }
    fetchTeam();
  }, []);

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
      setTimeHour(hour); setTimeMinute(minute); setTimeAmPm(ampm);
      setScheduledTime(lead.scheduled_time);
    } else {
      setTimeHour(''); setTimeMinute(''); setTimeAmPm('AM'); setScheduledTime('');
    }
    setAssignedTo(lead?.assigned_to || '');
    setEstimatedHours(lead?.estimated_hours || '');
    setActualHours(lead?.actual_hours || '');
  }, [lead]);

  useEffect(() => {
    setScheduledTime(buildTimeString(timeHour, timeMinute, timeAmPm));
  }, [timeHour, timeMinute, timeAmPm]);

  const scheduleEmailLog = useMemo(() => {
    try {
      const raw = lead?.schedule_emails;
      const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw || [];
      return Array.isArray(parsed) ? [...parsed].reverse() : [];
    } catch { return []; }
  }, [lead?.schedule_emails]);

  const lastEmailSentAt = scheduleEmailLog.length > 0 ? scheduleEmailLog[0].sent_at : null;

  const handleSave = async (overrideAssignee?: string) => {
    setSaving(true);
    try {
      const finalAssignee = overrideAssignee || (showCustomAssignee ? customAssignee : assignedTo);
      const res = await fetch('/api/leads/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: lead.id,
          action: 'update_project',
          scheduled_date: scheduledDate || null,
          scheduled_time: scheduledTime || null,
          assigned_to: finalAssignee || null,
          estimated_hours: estimatedHours || null,
          actual_hours: actualHours || null,
        }),
      });
      if (res.ok) {
        toast.success('Schedule updated');
        if (finalAssignee) setAssignedTo(finalAssignee);
        setShowCustomAssignee(false);
        setCustomAssignee('');
        await onRefresh();
      } else {
        toast.error('Failed to save');
      }
    } catch { toast.error('Failed to save'); }
    finally { setSaving(false); }
  };

  const handleAddCustomName = () => {
    if (!customAssignee.trim()) { toast.error('Please enter a name'); return; }
    handleSave(customAssignee);
  };

  return (
    <>
      {/* EMAIL CONTENT PREVIEW MODAL */}
      {previewHtml && (
        <div
          className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={() => setPreviewHtml(null)}
        >
          <div
            className="bg-white w-full max-w-2xl rounded-3xl overflow-hidden flex flex-col shadow-2xl"
            style={{ height: '88vh' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-slate-400" />
                <p className="text-sm font-black text-slate-800 uppercase tracking-tight">Email Preview</p>
              </div>
              <button onClick={() => setPreviewHtml(null)} className="p-2 hover:bg-slate-100 rounded-full transition">
                <X className="w-4 h-4 text-slate-500" />
              </button>
            </div>
            <div className="flex-1 overflow-hidden p-3">
              <iframe
                title="Email Preview"
                srcDoc={`${previewHtml}<style>a,button{pointer-events:none!important;cursor:default!important;}</style>`}
                className="w-full border-0 rounded-xl bg-white"
                style={{ height: '100%', width: '100%', display: 'block' }}
                sandbox="allow-same-origin"
              />
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-200">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-[11px] font-black text-slate-800 uppercase tracking-widest">Schedule</h3>
              {lastEmailSentAt && (
                <p className="text-[9px] font-bold text-emerald-600">
                  Confirmed {new Date(lastEmailSentAt).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={() => setShowCalendarModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 text-slate-500 rounded-xl text-[10px] font-black uppercase tracking-widest transition hover:border-indigo-300"
          >
            <Calendar className="w-3.5 h-3.5" /> Calendar
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Assigned To - Clean Select */}
          <div>
            <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Assigned To</label>
            {!showCustomAssignee ? (
              <div className="relative">
                <select
                  value={assignedTo}
                  onChange={(e) => e.target.value === '__custom__' ? setShowCustomAssignee(true) : setAssignedTo(e.target.value)}
                  className="w-full pl-4 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 outline-none appearance-none"
                >
                  <option value="">Choose team member...</option>
                  {teamMembers.map(m => <option key={m.id} value={m.name}>{m.name}</option>)}
                  {assignedTo && !teamMembers.find(m => m.name === assignedTo) && <option value={assignedTo}>{assignedTo}</option>}
                  <option value="__custom__">+ Add Custom Name</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Name..."
                  value={customAssignee}
                  onChange={(e) => setCustomAssignee(e.target.value)}
                  className="flex-1 px-4 py-3 bg-slate-50 border border-indigo-200 rounded-xl text-sm font-bold text-slate-900 outline-none"
                />
                <button onClick={handleAddCustomName} className="px-4 py-3 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest">Add</button>
                <button onClick={() => setShowCustomAssignee(false)} className="p-3 bg-slate-100 text-slate-400 rounded-xl"><X className="w-4 h-4" /></button>
              </div>
            )}
          </div>

          {/* Date & Time Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Service Date</label>
              <input
                type="date"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-[12px] font-bold text-slate-900 outline-none"
              />
            </div>

            <div>
              <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Start Time</label>
              <div className="flex items-center px-2 py-3 bg-slate-50 border border-slate-200 rounded-xl gap-1">
                <select value={timeHour} onChange={(e) => setTimeHour(e.target.value)} className="bg-transparent text-sm font-bold outline-none flex-1">
                  <option value="">HH</option>
                  {Array.from({ length: 12 }, (_, i) => i + 1).map(h => <option key={h} value={h}>{h}</option>)}
                </select>
                <span className="text-slate-300 font-black">:</span>
                <select value={timeMinute} onChange={(e) => setTimeMinute(e.target.value)} className="bg-transparent text-sm font-bold outline-none flex-1">
                  <option value="">MM</option>
                  {['00', '15', '30', '45'].map(m => <option key={m} value={m}>{m}</option>)}
                </select>
                <select value={timeAmPm} onChange={(e) => setTimeAmPm(e.target.value)} className="bg-transparent text-[10px] font-black text-indigo-600 outline-none">
                  <option value="AM">AM</option>
                  <option value="PM">PM</option>
                </select>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="space-y-3">
            <button
              onClick={() => handleSave()}
              disabled={saving}
              className="w-full py-4 bg-slate-900 text-white text-[11px] font-black uppercase tracking-[0.2em] rounded-xl transition active:scale-95"
            >
              {saving ? 'Saving...' : 'Save Schedule'}
            </button>
            <button
              onClick={() => setShowEmailModal(true)}
              disabled={!hasProject || !scheduledDate || saving}
              className="w-full py-4 border-2 border-slate-100 text-slate-600 text-[11px] font-black uppercase tracking-[0.2em] rounded-xl flex items-center justify-center gap-2 transition active:scale-95"
            >
              <Send className="w-3.5 h-3.5" /> Send to Customer
            </button>
          </div>

          {/* Hours Section Restoration */}
          <div className="pt-2 border-t border-slate-100">
            <button onClick={() => setShowHours(v => !v)} className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
              <Hash className="w-3 h-3" /> {showHours ? 'Hide' : 'Job'} Hours {showHours ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
            {showHours && (
              <div className="mt-3 grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">Est.</label>
                  <input type="number" step="0.5" value={estimatedHours} onChange={(e) => setEstimatedHours(e.target.value)} placeholder="0.0" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 outline-none" />
                </div>
                <div>
                  <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">Actual</label>
                  <input type="number" step="0.5" value={actualHours} onChange={(e) => setActualHours(e.target.value)} placeholder="0.0" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 outline-none" />
                </div>
              </div>
            )}
          </div>

          {/* Sent History Full Logic Restoration */}
          {outboxLog.length > 0 && (
            <div className="pt-2 border-t border-slate-100">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2"><Mail className="w-3 h-3" /> Sent History</p>
              <div className="space-y-2">
                {outboxLog.map((entry: any, i: number) => (
                  <div key={i} className="flex flex-col p-3 bg-slate-50 border border-slate-100 rounded-xl gap-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded ${entry.status === 'failed' ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-700'}`}>{entry.status}</span>
                        <span className="text-[10px] font-black text-slate-700">{new Date(entry.created_at).toLocaleDateString()}</span>
                      </div>
                      {entry.html_body && <button onClick={() => setPreviewHtml(entry.html_body)} className="text-[9px] font-black text-indigo-600 uppercase">Preview</button>}
                    </div>
                    {entry.sent_by_email && <span className="text-[9px] text-slate-400 truncate">{entry.sent_by_email}</span>}
                    {entry.status === 'failed' && entry.error_message && <span className="text-[9px] text-red-500 font-bold">{entry.error_message}</span>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <SchedulingCalendarModal
        isOpen={showCalendarModal}
        onClose={() => setShowCalendarModal(false)}
        onSelectDateTime={(d, t) => {
          setScheduledDate(d);
          const { hour, minute, ampm } = parseTimeString(t);
          setTimeHour(hour); setTimeMinute(minute); setTimeAmPm(ampm);
        }}
        companySlug={companySlug}
        currentScheduledDate={scheduledDate}
        currentScheduledTime={scheduledTime}
        selectedTeamMember={assignedTo}
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