'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
  Mail, Calendar, Clock, User,
  ChevronRight, X, Eye, Loader2, Send,
  ChevronDown, ChevronUp, Hash, CheckCircle2,
  Sparkles, History
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
  const [showHistory, setShowHistory] = useState<boolean>(false);

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

  // ── Derived from lead.schedule_emails (restored from original) ──
  const scheduleEmailLog = useMemo(() => {
    try {
      const raw = lead?.schedule_emails;
      const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw || [];
      return Array.isArray(parsed) ? [...parsed].reverse() : [];
    } catch { return []; }
  }, [lead?.schedule_emails]);

  const lastEmailSentAt = scheduleEmailLog.length > 0 ? scheduleEmailLog[0].sent_at : null;

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

  // ── handleSave with mobile fix (re-apply assignee after refresh) ──
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
        if (finalAssignee) setAssignedTo(finalAssignee); // re-apply after refresh overwrites
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
      {/* EMAIL PREVIEW MODAL */}
      <AnimatePresence>
        {previewHtml && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[10000] flex items-center justify-center p-6 bg-[#0F1F3D]/90 backdrop-blur-md"
            onClick={() => setPreviewHtml(null)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
              className="bg-white w-full max-w-2xl rounded-3xl overflow-hidden flex flex-col shadow-2xl border border-white/20"
              style={{ height: '85vh' }}
              onClick={e => e.stopPropagation()}
            >
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between shrink-0 bg-slate-50/50">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-blue-100 rounded-lg text-blue-600"><Eye size={14} /></div>
                  <p className="text-xs font-black text-[#0F1F3D] uppercase tracking-widest">Email Preview</p>
                </div>
                <button onClick={() => setPreviewHtml(null)} className="p-1.5 hover:bg-slate-200 rounded-full transition"><X size={18} /></button>
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

      <div className="bg-white rounded-2xl border border-[#D1C9BD]/50 shadow-lg overflow-hidden">

        {/* HEADER — compact single row */}
        <div className="px-4 py-3 bg-gradient-to-br from-slate-50 to-white border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#0F1F3D] flex items-center justify-center text-white shadow-md">
              <Sparkles size={14} className="text-blue-400" />
            </div>
            <div>
              <h3 className="text-[10px] font-black text-[#0F1F3D] uppercase tracking-[0.2em]">Schedule</h3>
              {lastEmailSentAt && (
                <div className="flex items-center gap-1">
                  <CheckCircle2 size={10} className="text-emerald-500" />
                  <p className="text-[9px] font-black text-emerald-600 uppercase tracking-tight">
                    Confirmed {new Date(lastEmailSentAt).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>
          </div>
          <button
            onClick={() => setShowCalendarModal(true)}
            className="group flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#D1C9BD] text-[#0F1F3D] rounded-xl text-[9px] font-black uppercase tracking-widest transition-all hover:bg-[#0F1F3D] hover:text-white shadow-sm"
          >
            <Calendar size={12} className="group-hover:scale-110 transition-transform" /> Calendar
          </button>
        </div>

        <div className="p-4 space-y-3">

          {/* ASSIGNED TO */}
          <div>
            <label className="flex items-center gap-1.5 text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-0.5">
              <User size={10} className="text-blue-500" /> Assigned To
            </label>
            {!showCustomAssignee ? (
              <div className="relative">
                <select
                  value={assignedTo}
                  onChange={(e) => e.target.value === '__custom__' ? setShowCustomAssignee(true) : setAssignedTo(e.target.value)}
                  className="w-full pl-3 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-[#0F1F3D] outline-none appearance-none cursor-pointer"
                >
                  <option value="">Choose team member...</option>
                  {teamMembers.map(m => <option key={m.id} value={m.name}>{m.name}</option>)}
                  {assignedTo && !teamMembers.find(m => m.name === assignedTo) && (
                    <option value={assignedTo}>{assignedTo}</option>
                  )}
                  <option value="__custom__">+ Add Custom Name</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
            ) : (
              <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="flex gap-2">
                <input
                  type="text" autoFocus placeholder="Enter full name..."
                  value={customAssignee}
                  onChange={(e) => setCustomAssignee(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddCustomName()}
                  className="flex-1 px-4 py-2.5 bg-white border-2 border-blue-500 rounded-xl text-sm font-black text-[#0F1F3D] outline-none"
                />
                <button onClick={handleAddCustomName} className="px-4 bg-[#0F1F3D] text-white rounded-xl text-[10px] font-black uppercase tracking-wide">Add</button>
                <button onClick={() => { setShowCustomAssignee(false); setCustomAssignee(''); }} className="p-2.5 bg-slate-100 text-slate-400 rounded-xl hover:bg-red-50 hover:text-red-500 transition-colors">
                  <X size={16} />
                </button>
              </motion.div>
            )}
          </div>

          {/* DATE & TIME — single row */}
          <div className="grid grid-cols-2 gap-2">
           <div className="min-w-0">
  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-0.5 mb-1.5 block">Date</label>
  <input
    type="date" value={scheduledDate}
    onChange={(e) => setScheduledDate(e.target.value)}
    className="w-full min-w-0 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-black text-[#0F1F3D] outline-none focus:border-blue-500 focus:bg-white transition-all"
  />
</div>
            <div>
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-0.5 mb-1.5 block">Time</label>
              <div className="flex items-center px-2.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl gap-1 focus-within:border-blue-500 focus-within:bg-white transition-all">
                <select value={timeHour} onChange={(e) => setTimeHour(e.target.value)} className="bg-transparent text-xs font-black outline-none flex-1 cursor-pointer min-w-0">
                  <option value="">HH</option>
                  {Array.from({ length: 12 }, (_, i) => i + 1).map(h => <option key={h} value={h}>{h}</option>)}
                </select>
                <span className="text-slate-300 font-black text-xs">:</span>
                <select value={timeMinute} onChange={(e) => setTimeMinute(e.target.value)} className="bg-transparent text-xs font-black outline-none flex-1 cursor-pointer min-w-0">
                  <option value="">MM</option>
                  {['00', '15', '30', '45'].map(m => <option key={m} value={m}>{m}</option>)}
                </select>
                <select value={timeAmPm} onChange={(e) => setTimeAmPm(e.target.value)} className="bg-white border border-slate-200 px-1.5 py-0.5 rounded-lg text-[9px] font-black text-blue-600 outline-none">
                  <option value="AM">AM</option>
                  <option value="PM">PM</option>
                </select>
              </div>
            </div>
          </div>

          {/* ACTION BUTTONS — side by side */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => handleSave()}
              disabled={saving}
              className="py-3 bg-[#0F1F3D] text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all hover:bg-[#1a6645] disabled:opacity-50"
            >
              {saving ? <Loader2 className="animate-spin w-3.5 h-3.5" /> : <Sparkles size={13} className="text-blue-400" />}
              {saving ? 'Saving…' : 'Save'}
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowEmailModal(true)}
              disabled={!hasProject || !scheduledDate || saving}
              className="py-3 bg-white border-2 border-slate-100 text-[#0F1F3D] text-[10px] font-black uppercase tracking-widest rounded-xl flex items-center justify-center gap-2 transition-all hover:border-blue-500 hover:text-blue-600 disabled:opacity-30 shadow-sm"
            >
              <Send size={13} /> Send
            </motion.button>
          </div>

          {/* JOB HOURS — collapsible */}
          <div className="pt-2 border-t border-slate-100">
            <button onClick={() => setShowHours(v => !v)} className="flex items-center justify-between w-full py-1">
              <span className="flex items-center gap-1.5 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                <Hash size={10} className="text-blue-400" /> Job Hours
              </span>
              <div className="text-slate-400">
                {showHours ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
              </div>
            </button>
            <AnimatePresence>
              {showHours && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="mt-2 grid grid-cols-2 gap-2 pb-1">
                    <div>
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-0.5 mb-1 block">Estimated</label>
                      <input type="number" step="0.5" value={estimatedHours} onChange={(e) => setEstimatedHours(e.target.value)} placeholder="0.0" className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-black text-[#0F1F3D] outline-none" />
                    </div>
                    <div>
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-0.5 mb-1 block">Actual</label>
                      <input type="number" step="0.5" value={actualHours} onChange={(e) => setActualHours(e.target.value)} placeholder="0.0" className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-black text-[#0F1F3D] outline-none" />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* SENT HISTORY — collapsible */}
          {outboxLog.length > 0 && (
            <div className="pt-2 border-t border-slate-100">
              <button onClick={() => setShowHistory(v => !v)} className="flex items-center justify-between w-full py-1">
                <span className="flex items-center gap-1.5 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                  <History size={10} className="text-blue-400" /> Sent History ({outboxLog.length})
                </span>
                {showHistory ? <ChevronUp size={13} className="text-slate-400" /> : <ChevronDown size={13} className="text-slate-400" />}
              </button>
              <AnimatePresence>
                {showHistory && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-2 space-y-2">
                      {outboxLog.map((entry: any, i: number) => (
                        <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100 group">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${entry.status === 'failed' ? 'bg-red-500 animate-pulse' : 'bg-emerald-500'}`} />
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className={`text-[8px] font-black uppercase px-1 py-0.5 rounded ${entry.status === 'failed' ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-700'}`}>
                                  {entry.status}
                                </span>
                                <p className="text-[9px] font-black text-[#0F1F3D]">{new Date(entry.created_at).toLocaleDateString()}</p>
                              </div>
                              {entry.sent_by_email && <p className="text-[9px] text-slate-400 truncate">{entry.sent_by_email}</p>}
                              {entry.status === 'failed' && entry.error_message && (
                                <p className="text-[9px] text-red-500 font-bold">{entry.error_message}</p>
                              )}
                            </div>
                          </div>
                          {entry.html_body && (
                            <button
                              onClick={() => setPreviewHtml(entry.html_body)}
                              className="flex items-center gap-1 px-2 py-1 bg-white border border-slate-200 rounded-lg text-[8px] font-black text-blue-600 uppercase hover:border-blue-400 transition-colors opacity-0 group-hover:opacity-100 shadow-sm shrink-0 ml-2"
                            >
                              <Eye size={10} /> Preview
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>

      {/* MODALS */}
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