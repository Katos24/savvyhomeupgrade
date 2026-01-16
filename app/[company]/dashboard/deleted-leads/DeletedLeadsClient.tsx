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
      <div className={styles.loading}>
        <div className="animate-spin text-6xl mb-4">⏳</div>
        <p className={styles.loadingText}>Loading deleted leads...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Toaster position="top-right" />
      <div className={styles.innerContainer}>
        {/* HEADER */}
        <div className={styles.header}>
          <div className="flex items-center justify-between w-full">
            <div>
              <h1 className={styles.title}>🗑️ Deleted Leads</h1>
              <p className="text-white/80 text-sm mt-1">{company.name}</p>
            </div>
            <a
              href={`/${company.slug}/dashboard`}
              className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg font-semibold transition"
            >
              ← Back to Dashboard
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
              Deleted leads can be restored at any time
            </div>
          </div>
        </div>

        {/* DELETED LEADS TABLE */}
        {deletedLeads.length === 0 ? (
          <div className="bg-white/10 backdrop-blur rounded-lg p-12 text-center">
            <div className="text-6xl mb-4">✨</div>
            <p className="text-white text-xl font-semibold">No deleted leads</p>
            <p className="text-white/70 mt-2">All your leads are active!</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Lead
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Deleted By
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Deleted At
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Reason
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {deletedLeads.map((lead) => (
                    <tr key={lead.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-semibold text-gray-900">{lead.name}</p>
                          <p className="text-sm text-gray-500">ID: {lead.id}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <p className="text-gray-900">{lead.email}</p>
                          <p className="text-gray-500">{lead.phone}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                          {lead.category}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <p className="font-medium text-gray-900">{lead.deleted_by_name || 'Unknown'}</p>
                          <p className="text-gray-500 text-xs">{lead.deleted_by_email || '—'}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(lead.deleted_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: 'numeric',
                          minute: '2-digit'
                        })}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {lead.deleted_reason || '—'}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => setSelectedLead(lead)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm font-semibold transition"
                          >
                            👁️ View
                          </button>
                          <button
                            onClick={() => handleRestore(lead.id, lead.name)}
                            className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm font-semibold transition"
                          >
                            ↩️ Restore
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* VIEW MODAL */}
      {selectedLead && (
        <div className={styles.modalOverlay} onClick={() => setSelectedLead(null)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div>
                <h2 className={styles.modalTitle}>{selectedLead.name}</h2>
                <p className={styles.modalDate}>
                  Deleted on {new Date(selectedLead.deleted_at).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit'
                  })}
                </p>
              </div>
              <button onClick={() => setSelectedLead(null)} className={styles.closeButton}>×</button>
            </div>

            <div className={styles.modalContent}>
              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>Contact Information</h3>
                <div className={styles.contactGrid}>
                  <div className={styles.contactItem}>
                    <span className={styles.contactLabel}>Email</span>
                    <span className={styles.contactValue}>{selectedLead.email}</span>
                  </div>
                  <div className={styles.contactItem}>
                    <span className={styles.contactLabel}>Phone</span>
                    <span className={styles.contactValue}>{selectedLead.phone}</span>
                  </div>
                  <div className={styles.contactItem}>
                    <span className={styles.contactLabel}>Category</span>
                    <span className={styles.contactValue}>{selectedLead.category}</span>
                  </div>
                </div>
              </div>

              {selectedLead.description && (
                <div className={styles.section}>
                  <h3 className={styles.sectionTitle}>Description</h3>
                  <div className={styles.description}>{selectedLead.description}</div>
                </div>
              )}

              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>Deletion Info</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Deleted By:</span>
                    <span className="font-medium">{selectedLead.deleted_by_name || 'Unknown'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Email:</span>
                    <span className="font-medium">{selectedLead.deleted_by_email || '—'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Deleted At:</span>
                    <span className="font-medium">
                      {new Date(selectedLead.deleted_at).toLocaleString()}
                    </span>
                  </div>
                  {selectedLead.deleted_reason && (
                    <div className="pt-2 mt-2 border-t">
                      <span className="text-gray-500">Reason:</span>
                      <p className="font-medium mt-1">{selectedLead.deleted_reason}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-4 mt-4 border-t">
                <button
                  onClick={() => {
                    handleRestore(selectedLead.id, selectedLead.name);
                    setSelectedLead(null);
                  }}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg transition"
                >
                  ↩️ Restore This Lead
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}