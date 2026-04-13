'use client';

import { useState } from 'react';
import { Calendar, Clock, Mail, User, Check, Sparkles, Send, ChevronDown, ChevronUp, Hash } from 'lucide-react';
import { Lead } from '@/app/demo/page';
import { TourTipBanner, FlowDoneCard } from '@/components/demo/DemoTour';

const CREW = ['Mike T.', 'Carlos R.', 'Jay B.', 'Jack', 'Unassigned'];

export default function ScheduleTab({
  lead, onUpdate, tourStep, onTourAdvance,
}: {
  lead: Lead;
  onUpdate: (u: Partial<Lead>) => void;
  tourStep?: string;
  onTourAdvance?: (step: any) => void;
}) {
  const parseTime = (time24: string) => {
    if (!time24) return { hour: '', minute: '', ampm: 'AM' };
    const [h, m] = time24.split(':');
    const hour24 = parseInt(h);
    return {
      hour: (hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24).toString(),
      minute: m,
      ampm: hour24 >= 12 ? 'PM' : 'AM',
    };
  };

  const parsed = parseTime(lead.scheduled_time || '');
  const [crew, setCrew]           = useState(lead.assigned_to || '');
  const [date, setDate]           = useState(lead.scheduled_date || '');
  const [timeHour, setTimeHour]   = useState(parsed.hour);
  const [timeMin, setTimeMin]     = useState(parsed.minute);
  const [timeAmPm, setTimeAmPm]   = useState(parsed.ampm);
  const [showHours, setShowHours] = useState(false);
  const [estHours, setEstHours]   = useState('');
  const [actHours, setActHours]   = useState('');
  const [saved, setSaved]         = useState(false);
  const [sent, setSent]               = useState(false);
const [done, setDone]               = useState(false);
const [showHistory, setShowHistory] = useState(false);
const [sentHistory, setSentHistory] = useState<{date: string}[]>([]);

  const buildTime = () => {
    if (!timeHour || !timeMin) return '';
    let h = parseInt(timeHour);
    if (timeAmPm === 'PM' && h !== 12) h += 12;
    if (timeAmPm === 'AM' && h === 12) h = 0;
    return `${h.toString().padStart(2, '0')}:${timeMin}`;
  };

  const handleSave = () => {
    onUpdate({
      scheduled_date: date || undefined,
      scheduled_time: buildTime() || undefined,
      assigned_to: crew && crew !== 'Unassigned' ? crew : undefined,
      status: date && (lead.status === 'new' || lead.status === 'contacted') ? 'scheduled' : lead.status,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    // Advance tour
    if (tourStep === 'schedule-assign') {
      setTimeout(() => {
        setDone(true);
        onTourAdvance?.('schedule-done');
      }, 800);
    }
  };

  const handleSend = () => {
  setSent(true);
  setSentHistory(prev => [{ date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) }, ...prev]);
  setTimeout(() => setSent(false), 2000);
};

  const inputCls = 'w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-[#0F1F3D] outline-none focus:border-blue-500 focus:bg-white transition-all';

  return (
    <div className="space-y-4">

      {/* ── TOUR TIP ── */}
      {tourStep === 'schedule-assign' && !done && onTourAdvance && (
        <TourTipBanner
          color="sky"
          message="Assign a crew member and pick a date — then hit Save to schedule the job."
        />
      )}

      {/* ── DONE STATE ── */}
      {done && tourStep === 'schedule-done' && (
        <FlowDoneCard
          title="Job scheduled!"
          subtitle="Shows on your calendar instantly"
          body="In your real account every team member gets a notification, the customer gets a confirmation email, and the job appears on your calendar view."
          accentColor="#38bdf8"
          onDismiss={() => onTourAdvance?.('idle')}
        />
      )}

      {/* Assigned To */}
      <div>
        <label className="flex items-center gap-1.5 text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
          <User className="w-3 h-3 text-blue-500" /> Assigned To
        </label>
        <div className="relative">
          <select
            value={crew}
            onChange={e => setCrew(e.target.value)}
            className={`w-full pl-4 pr-10 py-3 bg-slate-50 border rounded-xl text-sm font-bold text-[#0F1F3D] outline-none appearance-none cursor-pointer focus:border-blue-500 focus:bg-white transition-all ${
              tourStep === 'schedule-assign' && !crew ? 'border-sky-400 ring-2 ring-sky-100' : 'border-slate-200'
            }`}
          >
            <option value="">Choose team member...</option>
            {CREW.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        </div>
      </div>

      {/* Date + Time */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Date</label>
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            className={`${inputCls} ${tourStep === 'schedule-assign' && !date ? 'border-sky-400 ring-2 ring-sky-100' : ''}`}
          />
        </div>
        <div>
          <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Time</label>
          <div className="flex items-center px-2.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl gap-1 focus-within:border-blue-500 focus-within:bg-white transition-all">
            <select value={timeHour} onChange={e => setTimeHour(e.target.value)} className="bg-transparent text-xs font-black outline-none flex-1 cursor-pointer min-w-0 text-[#0F1F3D]">
              <option value="">HH</option>
              {Array.from({ length: 12 }, (_, i) => i + 1).map(h => <option key={h} value={h}>{h}</option>)}
            </select>
            <span className="text-slate-300 font-black text-xs">:</span>
            <select value={timeMin} onChange={e => setTimeMin(e.target.value)} className="bg-transparent text-xs font-black outline-none flex-1 cursor-pointer min-w-0 text-[#0F1F3D]">
              <option value="">MM</option>
              {['00', '15', '30', '45'].map(m => <option key={m} value={m}>{m}</option>)}
            </select>
            <select value={timeAmPm} onChange={e => setTimeAmPm(e.target.value)} className="bg-white border border-slate-200 px-1.5 py-0.5 rounded-lg text-[9px] font-black text-blue-600 outline-none">
              <option value="AM">AM</option>
              <option value="PM">PM</option>
            </select>
          </div>
        </div>
      </div>

      {/* Save + Send */}
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={handleSave}
          disabled={!date}
          className={`py-3 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 transition disabled:opacity-40 ${
            saved ? 'bg-emerald-600 text-white' : 'bg-[#0F1F3D] hover:bg-[#1a2a4a] text-white'
          }`}
        >
          {saved ? <Check className="w-3.5 h-3.5" /> : <Sparkles className="w-3.5 h-3.5 text-blue-400" />}
          {saved ? 'Saved!' : 'Save Schedule'}
        </button>
        <button
          onClick={handleSend}
          disabled={!date}
          className={`py-3 bg-white border-2 border-slate-100 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 transition disabled:opacity-30 ${
            sent ? 'border-emerald-300 text-emerald-600' : 'text-[#0F1F3D] hover:border-blue-300 hover:text-blue-600'
          }`}
        >
          {sent ? <Check className="w-3.5 h-3.5" /> : <Send className="w-3.5 h-3.5" />}
          {sent ? 'Sent!' : 'Send Confirmation'}
        </button>
      </div>

      {/* Job Hours collapsible */}
      <div className="pt-2 border-t border-slate-100">
        <button onClick={() => setShowHours(v => !v)} className="flex items-center justify-between w-full py-1">
          <span className="flex items-center gap-1.5 text-[9px] font-black text-slate-400 uppercase tracking-widest">
            <Hash className="w-3 h-3 text-blue-400" /> Job Hours
          </span>
          {showHours ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
        </button>
        {showHours && (
          <div className="mt-2 grid grid-cols-2 gap-2 pb-1">
            <div>
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Estimated</label>
              <input type="number" step="0.5" value={estHours} onChange={e => setEstHours(e.target.value)} placeholder="0.0" className={inputCls} />
            </div>
            <div>
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Actual</label>
              <input type="number" step="0.5" value={actHours} onChange={e => setActHours(e.target.value)} placeholder="0.0" className={inputCls} />
            </div>
          </div>
        )}
      </div>

      {sentHistory.length > 0 && (
  <div className="border-t border-slate-100 pt-2">
    <button
      onClick={() => setShowHistory(v => !v)}
      className="flex items-center justify-between w-full py-1"
    >
      <span className="flex items-center gap-1.5 text-[9px] font-black text-slate-400 uppercase tracking-widest">
        <Mail className="w-3 h-3 text-slate-400" /> Sent History ({sentHistory.length})
      </span>
      {showHistory
        ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
        : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
    </button>
    {showHistory && (
      <div className="mt-2 space-y-2">
        {sentHistory.map((entry, i) => (
          <div key={i} className="flex items-center justify-between px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
              <div className="min-w-0">
                <span className="text-xs font-black text-slate-800">{entry.date}</span>
                <p className="text-[10px] text-slate-400 truncate">Schedule confirmation sent</p>
              </div>
            </div>
            <span className="text-[8px] font-black uppercase px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 shrink-0 ml-2">
              sent
            </span>
          </div>
        ))}
      </div>
    )}
  </div>
)}

<p className="text-center text-xs text-gray-400 pt-1">
  In your real account this sends a branded confirmation email automatically.
</p>
    </div>
  );
}