'use client';

import { useState, useEffect, useMemo } from 'react';
import { toast } from 'sonner';
import { Mail, MoreVertical, Calendar, Clock, AlertCircle, CheckCircle2, User, Hash, ChevronRight, X, Eye, Loader2 } from 'lucide-react';
import SendCustomerEmailButtons from '@/components/dashboard/SendCustomerEmailButtons';
import SchedulingCalendarModal from './SchedulingCalendarModal';

type SchedulingSectionProps = {
  lead: any;
  currentUser: any;
  onRefresh: () => Promise<void>;
  hasProject: boolean;
  companySlug: string;
};

export default function SchedulingSection({ lead, currentUser, onRefresh, hasProject, companySlug }: SchedulingSectionProps) {
  const [saving, setSaving] = useState(false);
  const [showMoreActions, setShowMoreActions] = useState(false);
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [previewEmail, setPreviewEmail] = useState<any>(null);
  
  // Form States
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
  const [showHours, setShowHours] = useState(false);

  // --- Logic Helpers ---
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

  // --- Core Data Fetching ---
  useEffect(() => {
    async function fetchTeamMembers() {
      try {
        const res = await fetch('/api/team/members');
        const data = await res.json();
        if (data.success) setTeamMembers(data.members);
      } catch (e) { console.error('Failed to fetch team members:', e); }
    }
    fetchTeamMembers();
  }, []);

  useEffect(() => {
    setScheduledDate(lead?.scheduled_date ? lead.scheduled_date.split('T')[0].split(' ')[0] : '');
    if (lead?.scheduled_time) {
      const { hour, minute, ampm } = parseTimeString(lead.scheduled_time);
      setTimeHour(hour); setTimeMinute(minute); setTimeAmPm(ampm);
      setScheduledTime(lead.scheduled_time);
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
      return Array.isArray(parsed) ? parsed : [];
    } catch { return []; }
  }, [lead?.schedule_emails]);

  const lastEmailSentAt = scheduleEmailLog.length > 0 
    ? scheduleEmailLog[scheduleEmailLog.length - 1].sent_at 
    : null;

  // Optimized Save Logic
  const handleSave = async (overrideAssignee?: string) => {
    setSaving(true);
    try {
      // Determine the final name: 
      // 1. Explicit override (from "ADD" button)
      // 2. Custom input (if currently visible)
      // 3. Dropdown value
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
        toast.success('Scheduling updated');
        setShowCustomAssignee(false);
        setCustomAssignee('');
        await onRefresh();
      }
    } catch { toast.error('Failed to save'); } 
    finally { setSaving(false); }
  };

  const handleAddCustomName = () => {
    if (!customAssignee.trim()) {
      toast.error("Please enter a name");
      return;
    }
    handleSave(customAssignee);
  };

  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm relative">
      
      {/* EMAIL PREVIEW OVERLAY */}
      {previewEmail && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white w-full max-w-2xl h-[80vh] rounded-3xl overflow-hidden flex flex-col shadow-2xl">
            <div className="px-6 py-4 border-b flex items-center justify-between bg-white">
              <div>
                <h4 className="text-xs font-black uppercase text-gray-400 tracking-widest">Sent Email Preview</h4>
                <p className="text-sm font-bold text-gray-800">{previewEmail.subject}</p>
              </div>
              <button onClick={() => setPreviewEmail(null)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="flex-1 bg-gray-50 p-4">
              <iframe 
                title="Email Preview"
                srcDoc={previewEmail.html_body} 
                className="w-full h-full border-0 rounded-xl shadow-inner bg-white"
              />
            </div>
          </div>
        </div>
      )}

      {/* HEADER SECTION */}
      <div className="px-6 py-5 border-b border-gray-50 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-indigo-500" />
            <h3 className="text-[11px] font-black text-gray-500 uppercase tracking-[0.15em]">Project Schedule</h3>
          </div>
          <div className="flex items-center">
            {lastEmailSentAt ? (
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-100">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span className="text-[10px] font-black uppercase tracking-tight">Confirmed {new Date(lastEmailSentAt).toLocaleDateString()}</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 text-amber-700 rounded-full border border-amber-100">
                <AlertCircle className="w-3.5 h-3.5" />
                <span className="text-[10px] font-black uppercase tracking-tight">Notification Pending</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => handleSave()}
            disabled={saving}
            className="flex-1 sm:flex-none h-10 px-6 bg-indigo-600 hover:bg-indigo-700 active:scale-95 disabled:opacity-50 text-white text-xs font-black rounded-xl transition-all shadow-lg shadow-indigo-100 uppercase tracking-wider"
          >
            {saving ? 'Saving...' : 'Save Updates'}
          </button>
          
          <div className="relative">
            <button
              onClick={() => setShowMoreActions(!showMoreActions)}
              className="h-10 w-10 flex items-center justify-center bg-gray-50 hover:bg-gray-100 text-gray-400 border border-gray-200 rounded-xl transition-colors"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
            {showMoreActions && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowMoreActions(false)} />
                <div className="absolute right-0 top-full mt-2 bg-white shadow-2xl border border-gray-100 z-50 w-64 p-2 rounded-2xl animate-in fade-in zoom-in-95">
                  <SendCustomerEmailButtons
                    leadId={lead.id}
                    type="schedule"
                    currentUser={currentUser}
                    onRefresh={onRefresh}
                    hasSchedule={!!scheduledDate}
                    disabled={!hasProject}
                    scheduleSentAt={lastEmailSentAt}
                  />
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* FORM CONTENT */}
      <div className="p-6 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
              <User className="w-3 h-3 text-indigo-400" /> Team Assignment
            </label>
            {!showCustomAssignee ? (
              <div className="relative group">
                <select
                  value={assignedTo}
                  onChange={(e) => {
                    if (e.target.value === '__custom__') {
                      setShowCustomAssignee(true);
                    } else {
                      setAssignedTo(e.target.value);
                    }
                  }}
                  className="w-full h-12 pl-4 pr-10 text-sm font-bold bg-gray-50 border border-gray-100 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all appearance-none"
                >
                  <option value="">Choose team member...</option>
                  {teamMembers.map((m) => <option key={m.id} value={m.name}>{m.name}</option>)}
                  <option value="__custom__" className="text-indigo-600 font-black">+ Add Custom Name</option>
                </select>
                <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 pointer-events-none rotate-90" />
              </div>
            ) : (
              <div className="flex gap-2 animate-in slide-in-from-left-2">
                <input
                  type="text"
                  placeholder="Enter name..."
                  value={customAssignee}
                  onChange={(e) => setCustomAssignee(e.target.value)}
                  className="flex-1 h-12 px-4 text-sm font-bold bg-gray-50 border border-indigo-200 rounded-xl outline-none"
                  autoFocus
                  onKeyDown={(e) => e.key === 'Enter' && handleAddCustomName()}
                />
                <button 
                  onClick={handleAddCustomName} 
                  disabled={saving}
                  className="h-12 px-5 bg-indigo-600 text-white rounded-xl text-xs font-black flex items-center gap-2"
                >
                  {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : 'ADD'}
                </button>
                <button 
                  onClick={() => setShowCustomAssignee(false)} 
                  className="h-12 w-12 flex items-center justify-center bg-gray-100 text-gray-400 rounded-xl"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
              <Calendar className="w-3 h-3 text-indigo-400" /> Date of Service
            </label>
            <input
              type="date"
              value={scheduledDate}
              onChange={(e) => setScheduledDate(e.target.value)}
              className="w-full h-12 px-4 text-sm font-bold bg-gray-50 border border-gray-100 rounded-xl focus:bg-white outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
              <Clock className="w-3 h-3 text-indigo-400" /> Start Time
            </label>
            <div className="flex items-center h-12 px-4 bg-gray-50 border border-gray-100 rounded-xl focus-within:bg-white focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all">
              <select value={timeHour} onChange={(e) => setTimeHour(e.target.value)} className="bg-transparent text-sm font-bold w-full outline-none">
                <option value="">HH</option>
                {Array.from({ length: 12 }, (_, i) => i + 1).map(h => <option key={h} value={h}>{h}</option>)}
              </select>
              <span className="text-gray-300 font-black px-2">:</span>
              <select value={timeMinute} onChange={(e) => setTimeMinute(e.target.value)} className="bg-transparent text-sm font-bold w-full outline-none">
                <option value="">MM</option>
                {['00','15','30','45'].map(m => <option key={m} value={m}>{m}</option>)}
              </select>
              <div className="h-6 w-px bg-gray-200 mx-3" />
              <select value={timeAmPm} onChange={(e) => setTimeAmPm(e.target.value)} className="bg-transparent text-xs font-black text-indigo-600 outline-none">
                <option value="AM">AM</option>
                <option value="PM">PM</option>
              </select>
            </div>
          </div>

          <div className="flex items-end gap-3">
            <button
              onClick={() => setShowCalendarModal(true)}
              className="flex-1 h-12 flex items-center justify-center gap-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 text-xs font-black text-gray-600 transition-all"
            >
              <Calendar className="w-4 h-4 text-indigo-500" /> OPEN CALENDAR
            </button>
            <button
              onClick={() => setShowHours(!showHours)}
              className={`flex-1 h-12 text-xs font-black rounded-xl transition-all ${showHours ? 'bg-indigo-50 text-indigo-600 border border-indigo-100' : 'bg-gray-900 text-white'}`}
            >
              {showHours ? 'HIDE HOURS' : 'SET HOURS'}
            </button>
          </div>
        </div>

        {showHours && (
          <div className="pt-2 grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-3">
            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-2">
              <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Est. Duration</label>
              <div className="flex items-center gap-2">
                <Hash className="w-3.5 h-3.5 text-gray-300" />
                <input type="number" step="0.5" value={estimatedHours} onChange={e => setEstimatedHours(e.target.value)} placeholder="0.0" className="w-full bg-transparent text-sm font-black outline-none" />
              </div>
            </div>
            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-2">
              <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Actual Time</label>
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-gray-300" />
                <input type="number" step="0.5" value={actualHours} onChange={e => setActualHours(e.target.value)} placeholder="0.0" className="w-full bg-transparent text-sm font-black outline-none" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* FOOTER: HISTORY LOG */}
      {scheduleEmailLog.length > 0 && (
        <div className="px-6 py-5 bg-gray-50/50 border-t border-gray-50">
          <div className="flex items-center gap-2 mb-4">
            <Mail className="w-3 h-3 text-indigo-500" />
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Sent Email History</span>
          </div>
          <div className="space-y-2">
            {[...scheduleEmailLog].reverse().map((entry: any, i: number) => (
              <button 
                key={i} 
                onClick={() => setPreviewEmail(entry)}
                className="w-full flex items-center justify-between p-3 bg-white rounded-xl border border-gray-100 hover:border-indigo-400 hover:shadow-md transition-all group"
              >
                <div className="flex flex-col items-start gap-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-black text-gray-800 uppercase">Notification Sent</span>
                    <Eye className="w-3 h-3 text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <span className="text-[10px] text-gray-400 font-medium">By {entry.sent_by_email}</span>
                </div>
                <div className="text-right">
                  <span className="block text-[10px] font-black text-indigo-600">
                    {new Date(entry.sent_at).toLocaleDateString()}
                  </span>
                  <span className="text-[9px] text-gray-400 font-bold">
                    {new Date(entry.sent_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

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
    </div>
  );
}