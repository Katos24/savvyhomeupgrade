'use client';

import { useState } from 'react';
import { Calendar, Clock, User, Check, Send, ChevronDown, ChevronUp, Hash, Mail } from 'lucide-react';
import { Lead } from '@/app/demo/page';

const CREW = ['Mike T.', 'Carlos R.', 'Jay B.', 'Jack', 'Unassigned'];

export default function ScheduleTab({
  lead, onUpdate,
}: {
  lead: Lead;
  onUpdate: (u: Partial<Lead>) => void;
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
  const [sent, setSent]           = useState(false);
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
  };

  const handleSend = () => {
    setSent(true);
    setSentHistory(prev => [{ date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) }, ...prev]);
    setTimeout(() => setSent(false), 2000);
  };

  const inputCls = 'w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 outline-none focus:border-indigo-400 focus:bg-white transition-all';

  return (
    <div className="space-y-5 overflow-hidden w-full">

      {/* Assigned To */}
      <div>
        <label className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
          <User className="w-3 h-3 text-indigo-400" /> Assign To
        </label>
        <div className="relative">
          <select
            value={crew}
            onChange={e => setCrew(e.target.value)}
            className="w-full pl-4 pr-10 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 outline-none appearance-none cursor-pointer focus:border-indigo-400 focus:bg-white transition-all"
          >
            <option value="">Choose team member...</option>
            {CREW.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        </div>
      </div>

  {/* Date */}
      <div className="overflow-hidden">
        <label className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
          <Calendar className="w-3 h-3 text-indigo-400" /> Job Date
        </label>
        <input
          type="date"
          value={date}
          onChange={e => setDate(e.target.value)}
          className={inputCls}
          style={{ width: '100%', maxWidth: '100%', minWidth: 0, boxSizing: 'border-box' }}
        />
      </div>

      {/* Time */}
      <div>
        <label className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
          <Clock className="w-3 h-3 text-indigo-400" /> Start Time
        </label>
        <div className="flex items-center gap-1 px-3 py-3 bg-slate-50 border border-slate-200 rounded-xl focus-within:border-indigo-400 focus-within:bg-white transition-all">
          <select value={timeHour} onChange={e => setTimeHour(e.target.value)} className="bg-transparent text-xs font-black outline-none flex-1 cursor-pointer text-slate-900 min-w-0">
            <option value="">HH</option>
            {Array.from({ length: 12 }, (_, i) => i + 1).map(h => <option key={h} value={h}>{h}</option>)}
          </select>
          <span className="text-slate-300 font-black">:</span>
          <select value={timeMin} onChange={e => setTimeMin(e.target.value)} className="bg-transparent text-sm font-black outline-none flex-1 cursor-pointer text-slate-900">
            <option value="">MM</option>
            {['00', '15', '30', '45'].map(m => <option key={m} value={m}>{m}</option>)}
          </select>
          <select value={timeAmPm} onChange={e => setTimeAmPm(e.target.value)} className="bg-white border border-slate-200 px-2 py-1 rounded-lg text-xs font-black text-indigo-600 outline-none">
            <option value="AM">AM</option>
            <option value="PM">PM</option>
          </select>
        </div>
      </div>

      {/* Save + Send */}
      <div className="flex flex-col gap-2 pt-1">
        <button
          onClick={handleSave}
          disabled={!date}
          className={`w-full py-4 rounded-xl font-black text-sm flex items-center justify-center gap-2 transition disabled:opacity-40 ${
            saved ? 'bg-emerald-600 text-white' : 'bg-slate-900 hover:bg-slate-800 text-white'
          }`}
        >
          {saved ? <Check className="w-4 h-4" /> : <Calendar className="w-4 h-4" />}
          {saved ? 'Saved!' : 'Save Schedule'}
        </button>
        <button
          onClick={handleSend}
          disabled={!date}
          className={`w-full py-4 bg-white border-2 rounded-xl font-black text-sm flex items-center justify-center gap-2 transition disabled:opacity-30 ${
            sent ? 'border-emerald-300 text-emerald-600' : 'border-slate-200 text-slate-700 hover:border-indigo-300 hover:text-indigo-600'
          }`}
        >
          {sent ? <Check className="w-4 h-4" /> : <Send className="w-4 h-4" />}
          {sent ? 'Sent!' : 'Send Confirmation Email'}
        </button>
      </div>

      <p className="text-center text-xs text-slate-400">
        Sends a branded confirmation email to the customer automatically.
      </p>

      {/* Job Hours collapsible */}
      <div className="border-t border-slate-100 pt-3">
        <button onClick={() => setShowHours(v => !v)} className="flex items-center justify-between w-full py-1">
          <span className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
            <Hash className="w-3 h-3" /> Job Hours
          </span>
          {showHours ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </button>
        {showHours && (
          <div className="mt-3 flex flex-col gap-3">
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Estimated Hours</label>
              <input type="number" step="0.5" value={estHours} onChange={e => setEstHours(e.target.value)} placeholder="0.0" className={inputCls} />
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Actual Hours</label>
              <input type="number" step="0.5" value={actHours} onChange={e => setActHours(e.target.value)} placeholder="0.0" className={inputCls} />
            </div>
          </div>
        )}
      </div>

      {/* Sent History */}
      {sentHistory.length > 0 && (
        <div className="border-t border-slate-100 pt-3">
          <button onClick={() => setShowHistory(v => !v)} className="flex items-center justify-between w-full py-1">
            <span className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
              <Mail className="w-3 h-3" /> Sent History ({sentHistory.length})
            </span>
            {showHistory ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
          </button>
          {showHistory && (
            <div className="mt-3 space-y-2">
              {sentHistory.map((entry, i) => (
                <div key={i} className="flex items-center justify-between px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                    <div>
                      <p className="text-xs font-black text-slate-800">{entry.date}</p>
                      <p className="text-[10px] text-slate-400">Confirmation sent</p>
                    </div>
                  </div>
                  <span className="text-[9px] font-black uppercase px-2 py-1 rounded-lg bg-emerald-100 text-emerald-700">
                    Sent
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
}