'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity,
  FileText,
  Send,
  CheckCircle2,
  Receipt,
  Percent,
  HandCoins,
  Calendar,
  UserCog,
  Star,
  X,
  ChevronRight,
} from 'lucide-react';
import { parseNotes } from '@/lib/utils';

type LeadActivityTabProps = {
  lead: any;
  currentUser: any;
  onAddNote: (id: number, text: string) => Promise<boolean>;
  onRefresh: () => Promise<void>;
};

// One entry per real `type` value written by /api/leads/update/route.ts's
// addActivityToProject calls. Each maps to an icon + a color, so the log
// reads as a real timeline at a glance instead of a flat list of grey
// text — a $4,000 quote change and a plain note now look visibly
// different from each other. Falls back to a generic dot for any type
// not listed here (including plain 'note' and old string-only entries),
// so a new activity type added later never renders as broken, just plain.
const TYPE_CONFIG: Record<string, { icon: any; color: string; bg: string }> = {
  status_change: { icon: UserCog, color: 'text-indigo-600', bg: 'bg-indigo-50' },
  quote_created: { icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50' },
  quote_sent: { icon: Send, color: 'text-blue-600', bg: 'bg-blue-50' },
  quote_accepted: { icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  invoice_saved: { icon: Receipt, color: 'text-amber-600', bg: 'bg-amber-50' },
  invoice_sent: { icon: Send, color: 'text-amber-600', bg: 'bg-amber-50' },
  deposit_terms_updated: { icon: HandCoins, color: 'text-violet-600', bg: 'bg-violet-50' },
  tax_rate_updated: { icon: Percent, color: 'text-violet-600', bg: 'bg-violet-50' },
  schedule_sent: { icon: Calendar, color: 'text-rose-600', bg: 'bg-rose-50' },
  project_updated: { icon: Calendar, color: 'text-rose-600', bg: 'bg-rose-50' },
  review_request_sent: { icon: Star, color: 'text-amber-500', bg: 'bg-amber-50' },
    details_updated: { icon: UserCog, color: 'text-slate-600', bg: 'bg-slate-100' },
    payment_recorded: { icon: HandCoins, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  payment_reversed: { icon: HandCoins, color: 'text-rose-600', bg: 'bg-rose-50' },
  bulk_update: { icon: UserCog, color: 'text-indigo-600', bg: 'bg-indigo-50' },
};
const DEFAULT_TYPE = { icon: Activity, color: 'text-gray-500', bg: 'bg-gray-100' };

// status_change entries carry old_status/new_status, not a text field —
// rendering `note.text` directly for these silently prints "undefined."
// This builds the display line for every entry, whatever shape it has.
function displayText(note: any): string {
  if (note.type === 'status_change' && note.old_status && note.new_status) {
    return `Status changed: ${note.old_status} → ${note.new_status}`;
  }
  return note.text || 'Activity logged';
}

// Only entries with a genuinely long line, or real extra fields beyond
// what's already shown inline, get the click-to-expand affordance —
// most notes and short activity lines don't need a modal at all.
function hasExpandableDetail(note: any): boolean {
  const text = displayText(note);
  if (text.length > 140) return true;
  if (note.type === 'status_change' && note.old_status && note.new_status) return true;
  return false;
}

function ActivityDetailModal({ note, onClose }: { note: any; onClose: () => void }) {
  const config = TYPE_CONFIG[note.type] || DEFAULT_TYPE;
  const Icon = config.icon;
  return (
    <div
      className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.97, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm rounded-2xl bg-white shadow-xl p-5"
      >
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-lg ${config.bg} flex items-center justify-center shrink-0`}>
              <Icon className={`w-4 h-4 ${config.color}`} />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">
                {note.user_name || 'System'}
              </p>
              <p className="text-xs text-gray-400">
                {new Date(note.timestamp).toLocaleDateString('en-US', {
                  month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit',
                })}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 -m-1 text-gray-400 hover:text-gray-600 shrink-0">
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{displayText(note)}</p>

        {note.type === 'status_change' && note.old_status && note.new_status && (
          <div className="mt-4 flex items-center gap-2 text-xs font-semibold">
            <span className="px-2 py-1 rounded-md bg-gray-100 text-gray-600">{note.old_status}</span>
            <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
            <span className="px-2 py-1 rounded-md bg-indigo-50 text-indigo-700">{note.new_status}</span>
          </div>
        )}

        {note.user_email && (
          <p className="mt-4 pt-4 border-t border-gray-100 text-xs text-gray-400">{note.user_email}</p>
        )}
      </motion.div>
    </div>
  );
}

export default function LeadActivityTab({
  lead,
  currentUser,
  onAddNote,
  onRefresh,
}: LeadActivityTabProps) {
  const [newNote, setNewNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [localNotes, setLocalNotes] = useState<any[] | null>(null);
  const [detailNote, setDetailNote] = useState<any | null>(null);

  const notesArray = localNotes ?? parseNotes(lead.project_notes || lead.notes);

  const handleAddNote = async () => {
    if (!newNote.trim()) return;
    setSaving(true);
    const noteText = newNote;
    setNewNote('');

    const currentNotes = parseNotes(lead.project_notes || lead.notes);
    const optimisticNote = {
      type: 'note',
      text: noteText,
      user_name: currentUser?.name || currentUser?.email || 'You',
      timestamp: new Date().toISOString(),
    };
    setLocalNotes([...currentNotes, optimisticNote]);

    const success = await onAddNote(lead.id, noteText);
    setSaving(false);

    if (success) {
      toast.success('Note added!');
    } else {
      setLocalNotes(null);
      setNewNote(noteText);
      toast.error('Failed to add note');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
    >
      <div className="px-5 py-4 border-b border-gray-50">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-[0.12em] flex items-center gap-2">
          <span className="w-5 h-5 rounded-lg bg-blue-50 flex items-center justify-center">
            <Activity className="w-3 h-3 text-blue-400" />
          </span>
          Activity Log
          {notesArray.length > 0 && (
            <span className="ml-auto px-2 py-0.5 bg-gray-100 text-gray-600 text-xs font-bold rounded-md">
              {notesArray.length}
            </span>
          )}
        </h3>
      </div>

      <div className="p-5 space-y-4">
        <div>
          <textarea
            value={newNote}
            onChange={e => setNewNote(e.target.value)}
            placeholder="Add a note..."
            rows={3}
            className="w-full px-4 py-3 text-sm rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 focus:outline-none resize-none bg-gray-50 focus:bg-white transition"
          />
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={handleAddNote}
            disabled={saving || !newNote.trim()}
            className="w-full mt-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white font-bold py-3 text-sm rounded-xl transition"
          >
            {saving ? 'Adding...' : 'Add Note'}
          </motion.button>
        </div>

        {notesArray.length > 0 && (
          <div className="space-y-2 max-h-[50vh] sm:max-h-80 overflow-y-auto -mx-1 px-1">
            <AnimatePresence>
              {[...notesArray].reverse().map((note: any, idx: number) => {
                const isOld = typeof note === 'string';
                const noteObj = isOld ? { text: note, type: 'note' } : note;
                const text = displayText(noteObj);
                const user = isOld ? 'Unknown' : (noteObj.user_name || 'System');
                const ts = isOld ? lead.created_at : noteObj.timestamp;
                const config = TYPE_CONFIG[noteObj.type] || DEFAULT_TYPE;
                const Icon = config.icon;
                const expandable = !isOld && hasExpandableDetail(noteObj);
                // Long entries truncate inline; the modal shows the full text.
                const truncated = text.length > 140 ? `${text.slice(0, 140)}…` : text;

                return (
                  <motion.button
                    key={idx}
                    type="button"
                    onClick={() => expandable && setDetailNote(noteObj)}
                    initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.04 }}
                    className={`w-full text-left flex gap-3 p-3 bg-gray-50 rounded-xl transition-colors ${
                      expandable ? 'hover:bg-gray-100 cursor-pointer' : 'cursor-default'
                    }`}
                  >
                    <div className={`w-7 h-7 rounded-full ${config.bg} flex items-center justify-center flex-shrink-0`}>
                      <Icon className={`w-3.5 h-3.5 ${config.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-xs font-bold text-gray-800">{user}</span>
                        <span className="text-xs text-gray-400">
                          {new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{truncated}</p>
                    </div>
                    {expandable && (
                      <ChevronRight className="w-3.5 h-3.5 text-gray-300 self-center shrink-0" />
                    )}
                  </motion.button>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      <AnimatePresence>
        {detailNote && (
          <ActivityDetailModal note={detailNote} onClose={() => setDetailNote(null)} />
        )}
      </AnimatePresence>
    </motion.div>
  );
}