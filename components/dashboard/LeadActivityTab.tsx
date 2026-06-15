'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity } from 'lucide-react';
import { parseNotes } from '@/lib/utils';

type LeadActivityTabProps = {
  lead: any;
  currentUser: any;
  onAddNote: (id: number, text: string) => Promise<boolean>;
  onRefresh: () => Promise<void>;
};

export default function LeadActivityTab({
  lead,
  currentUser,
  onAddNote,
  onRefresh,
}: LeadActivityTabProps) {
  const [newNote, setNewNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [localNotes, setLocalNotes] = useState<any[] | null>(null);

  const notesArray = localNotes ?? parseNotes(lead.project_notes || lead.notes);

  const handleAddNote = async () => {
    if (!newNote.trim()) return;
    setSaving(true);
    const noteText = newNote;
    setNewNote('');

    const currentNotes = parseNotes(lead.project_notes || lead.notes);
    const optimisticNote = {
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
                const text = isOld ? note : note.text;
                const user = isOld ? 'Unknown' : (note.user_name || 'System');
                const ts = isOld ? lead.created_at : note.timestamp;
                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.04 }}
                    className="flex gap-3 p-3 bg-gray-50 rounded-xl"
                  >
                    <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-600 flex-shrink-0">
                      {user.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-xs font-bold text-gray-800">{user}</span>
                        <span className="text-xs text-gray-400">
                          {new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{text}</p>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </motion.div>
  );
}