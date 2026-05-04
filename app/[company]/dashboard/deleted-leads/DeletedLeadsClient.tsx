'use client';

import { useState, useEffect } from 'react';
import { toast, Toaster } from 'sonner';
import { safeJSONParse } from '@/lib/utils';
import styles from '@/app/dashboard/dashboard.module.css';

type Company = {
  id: number;
  name: string;
  slug: string;
};

export default function DeletedLeadsClient({ company }: { company: Company }) {
  const [deletedLeads, setDeletedLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLead, setSelectedLead] = useState<any>(null);

  useEffect(() => {
    fetchDeletedLeads();
  }, []);

  async function fetchDeletedLeads() {
    try {
      const response = await fetch(`/api/company/${company.slug}/deleted-leads`);
      const data = await response.json();
      setDeletedLeads(data.leads || []);
    } catch (error) {
      console.error('Failed to fetch deleted leads:', error);
      toast.error('Failed to load deleted leads');
    } finally {
      setLoading(false);
    }
  }

  async function handleRestore(id: number, name: string) {
    if (!confirm(`Restore lead for ${name}?`)) return;

    try {
      const response = await fetch('/api/leads/restore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Lead restored successfully!');
        fetchDeletedLeads();
      } else {
        toast.error('Failed to restore lead');
      }
    } catch (error) {
      console.error('Restore error:', error);
      toast.error('Failed to restore lead');
    }
  }

  if (loading) {
    return (
      <div className="fixed inset-0 bg-[#0a1628] flex flex-col items-center justify-center z-[100]">
        {/* Using a custom spinner that matches your Emerald/Yellow theme */}
        <div className="relative">
          <div className="w-16 h-16 border-4 border-white/10 border-t-emerald-500 rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 bg-yellow-400 rotate-45 animate-pulse"></div>
          </div>
        </div>
        <p className="mt-6 text-white font-black uppercase tracking-[0.2em] text-xs">
          Loading Data...
        </p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Toaster position="top-right" />
      <div className={styles.innerContainer}>
        
        {/* HEADER - Adjusted for mobile stack */}
        <div className={styles.header}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between w-full gap-4">
            <div>
              <h1 className={styles.title}>🗑️ Deleted Leads</h1>
              <p className="text-white/80 text-sm mt-1">{company.name}</p>
            </div>
            <a
              href={`/${company.slug}/dashboard`}
              className="w-full sm:w-auto text-center bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg font-semibold transition"
            >
              ← Back
            </a>
          </div>
        </div>

        {/* STATS */}
        <div className="bg-white/10 backdrop-blur rounded-xl p-4 mb-8">
          <div className="flex items-center gap-4">
            <div>
              <p className="text-xs text-white/70">Total Deleted</p>
              <p className="text-2xl font-bold text-white">{deletedLeads.length}</p>
            </div>
            <div className="text-white/60 text-sm">
              Leads can be restored at any time
            </div>
          </div>
        </div>

        {/* EMPTY STATE */}
        {deletedLeads.length === 0 ? (
          <div className="bg-white/10 backdrop-blur rounded-lg p-12 text-center">
            <div className="text-6xl mb-4">✨</div>
            <p className="text-white text-xl font-semibold">No deleted leads</p>
          </div>
        ) : (
          <>
            {/* MOBILE LIST (Cards) - Shown only on small screens */}
            <div className="grid grid-cols-1 gap-4 md:hidden">
              {deletedLeads.map((lead) => (
                <div key={lead.id} className="bg-white rounded-xl p-4 shadow-lg border-l-4 border-red-500">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-bold text-gray-900">{lead.name}</h3>
                      <p className="text-xs text-gray-500">ID: {lead.id} • {lead.category}</p>
                    </div>
                    <span className="text-[10px] bg-gray-100 px-2 py-1 rounded text-gray-600 font-bold">
                      {new Date(lead.deleted_at).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <div className="text-sm text-gray-600 mb-4 italic">
                    "{lead.deleted_reason || 'No reason provided'}"
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedLead(lead)}
                      className="flex-1 bg-blue-50 py-2 rounded-lg text-blue-700 text-sm font-bold border border-blue-100"
                    >
                      👁️ Details
                    </button>
                    <button
                      onClick={() => handleRestore(lead.id, lead.name)}
                      className="flex-1 bg-green-600 py-2 rounded-lg text-white text-sm font-bold shadow-sm"
                    >
                      ↩️ Restore
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* DESKTOP TABLE - Hidden on small screens */}
            <div className="hidden md:block bg-white rounded-lg shadow overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Lead</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Deleted At</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reason</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {deletedLeads.map((lead) => (
                    <tr key={lead.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <p className="font-semibold text-gray-900">{lead.name}</p>
                        <span className="text-xs bg-gray-100 px-2 py-0.5 rounded">{lead.category}</span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <p>{lead.email}</p>
                        <p className="text-gray-500">{lead.phone}</p>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(lead.deleted_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 truncate max-w-[150px]">
                        {lead.deleted_reason || '—'}
                      </td>
                      <td className="px-6 py-4 flex gap-2">
                        <button onClick={() => setSelectedLead(lead)} className="text-blue-600 font-bold text-sm">View</button>
                        <button onClick={() => handleRestore(lead.id, lead.name)} className="text-green-600 font-bold text-sm">Restore</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* MODAL FIX: Mobile Friendly Modal */}
      {selectedLead && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedLead(null)}>
          <div 
            className="bg-white w-full max-w-lg rounded-t-2xl sm:rounded-2xl overflow-hidden animate-in slide-in-from-bottom duration-300" 
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b flex justify-between items-center">
              <h2 className="text-xl font-bold">{selectedLead.name}</h2>
              <button onClick={() => setSelectedLead(null)} className="text-2xl">&times;</button>
            </div>
            
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase">Contact</label>
                <p className="text-gray-900 font-medium">{selectedLead.email}</p>
                <p className="text-gray-900 font-medium">{selectedLead.phone}</p>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase">Reason for Deletion</label>
                <p className="text-gray-700 bg-gray-50 p-3 rounded-lg mt-1 italic">
                  {selectedLead.deleted_reason || "No reason specified"}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-4 border-t text-sm">
                <div>
                  <label className="text-xs text-gray-400 block">Deleted By</label>
                  <p className="font-bold">{selectedLead.deleted_by_name || 'Unknown'}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-400 block">Date</label>
                  <p className="font-bold">{new Date(selectedLead.deleted_at).toLocaleString()}</p>
                </div>
              </div>
            </div>

            <div className="p-6 bg-gray-50">
              <button
                onClick={() => {
                  handleRestore(selectedLead.id, selectedLead.name);
                  setSelectedLead(null);
                }}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-xl shadow-lg transition-transform active:scale-95"
              >
                ↩️ Restore Lead
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}