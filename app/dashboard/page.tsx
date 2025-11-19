'use client';

import { useState, useEffect } from 'react';
import AIAnalysis from '@/components/dashboard/AIAnalysis';
import styles from './dashboard.module.css';

// Helper function to safely parse JSON
function safeJSONParse(data: any) {
  if (!data) return null;
  if (typeof data === 'object') return data;
  
  try {
    return JSON.parse(data);
  } catch (e) {
    console.error('Failed to parse JSON:', data);
    return null;
  }
}

export default function DashboardPage() {
  const [leads, setLeads] = useState<any[]>([]);
  const [selectedLead, setSelectedLead] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLeads() {
      try {
        const response = await fetch('/api/leads');
        const data = await response.json();
        setLeads(data.leads || []);
      } catch (error) {
        console.error('Failed to fetch leads:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchLeads();
  }, []);

  if (loading) {
    return (
      <div className={styles.loading}>
        <p className={styles.loadingText}>Loading your dashboard...</p>
      </div>
    );
  }

  // Calculate stats
  const totalLeads = leads.length;
  const emergencyLeads = leads.filter(l => {
    const analysis = safeJSONParse(l.ai_analysis);
    return analysis?.urgency === 'Emergency';
  }).length;
  const highPriorityLeads = leads.filter(l => {
    const analysis = safeJSONParse(l.ai_analysis);
    return analysis?.urgency === 'High Priority';
  }).length;

  return (
    <div className={styles.container}>
      <div className={styles.innerContainer}>
        {/* Header */}
        <div className={styles.header}>
          <h1 className={styles.title}>Contractor Dashboard</h1>
          <p className={styles.subtitle}>Manage your leads and AI-powered insights</p>
        </div>

        {/* Stats Bar */}
        <div className={styles.statsBar}>
          <div className={styles.statCard}>
            <p className={styles.statLabel}>Total Leads</p>
            <p className={styles.statValue}>{totalLeads}</p>
          </div>
          <div className={styles.statCard}>
            <p className={styles.statLabel}>🚨 Emergency</p>
            <p className={styles.statValue}>{emergencyLeads}</p>
          </div>
          <div className={styles.statCard}>
            <p className={styles.statLabel}>⚠️ High Priority</p>
            <p className={styles.statValue}>{highPriorityLeads}</p>
          </div>
          <div className={styles.statCard}>
            <p className={styles.statLabel}>This Month</p>
            <p className={styles.statValue}>
              {leads.filter(l => {
                const date = new Date(l.created_at);
                const now = new Date();
                return date.getMonth() === now.getMonth() && 
                       date.getFullYear() === now.getFullYear();
              }).length}
            </p>
          </div>
        </div>

        {/* Lead Cards Grid */}
        <div className={styles.cardsGrid}>
          {leads.map((lead: any) => {
            const fileUrls = safeJSONParse(lead.file_urls);
            const aiAnalysis = safeJSONParse(lead.ai_analysis);
            const firstImage = fileUrls?.find((f: any) => 
              f.name?.match(/\.(jpg|jpeg|png|gif|webp)$/i)
            );

            return (
              <div
                key={lead.id}
                onClick={() => setSelectedLead(lead)}
                className={styles.card}
              >
                {/* Card Image */}
                {firstImage ? (
                  <div className={styles.cardImage}>
                    <img
                      src={firstImage.url}
                      alt="Project preview"
                    />
                    {fileUrls && fileUrls.length > 1 && (
                      <span className={styles.imageCount}>
                        +{fileUrls.length - 1} photos
                      </span>
                    )}
                  </div>
                ) : (
                  <div className={styles.noImage}>
                    <span>📷 No image</span>
                  </div>
                )}

                {/* Card Content */}
                <div className={styles.cardContent}>
                  <div className={styles.cardHeader}>
                    <h3 className={styles.cardName}>{lead.name}</h3>
                    <span className={styles.categoryBadge}>
                      {lead.category}
                    </span>
                  </div>

                  <p className={styles.cardEmail}>
                    📧 {lead.email}
                  </p>
                  <p className={styles.cardPhone}>
                    📞 {lead.phone}
                  </p>

                  {lead.description && (
                    <p className={styles.cardDescription}>
                      {lead.description}
                    </p>
                  )}

                  {/* AI Quick Stats */}
                  {aiAnalysis && (
                    <div className={styles.badges}>
                      <span className={`${styles.badge} ${
                        aiAnalysis.urgency === 'Emergency' ? styles.urgencyEmergency :
                        aiAnalysis.urgency === 'High Priority' ? styles.urgencyHigh :
                        aiAnalysis.urgency === 'Low Priority' ? styles.urgencyLow :
                        styles.urgencyNormal
                      }`}>
                        {aiAnalysis.urgency}
                      </span>
                      <span className={`${styles.badge} ${
                        aiAnalysis.complexity === 'Simple' ? styles.complexitySimple :
                        aiAnalysis.complexity === 'Complex' ? styles.complexityComplex :
                        styles.complexityModerate
                      }`}>
                        {aiAnalysis.complexity}
                      </span>
                    </div>
                  )}

                  <p className={styles.cardDate}>
                    🕒 {new Date(lead.created_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {leads.length === 0 && (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>📋</div>
            <p className={styles.emptyTitle}>No leads yet</p>
            <p className={styles.emptyText}>
              Leads will appear here when customers submit photos
            </p>
          </div>
        )}
      </div>

      {/* Modal for Full Lead Details */}
      {selectedLead && (
        <div
          className={styles.modalOverlay}
          onClick={() => setSelectedLead(null)}
        >
          <div
            className={styles.modal}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className={styles.modalHeader}>
              <div>
                <h2 className={styles.modalTitle}>
                  {selectedLead.name}
                </h2>
                <p className={styles.modalDate}>
                  {new Date(selectedLead.created_at).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit'
                  })}
                </p>
              </div>
              <button
                onClick={() => setSelectedLead(null)}
                className={styles.closeButton}
              >
                ×
              </button>
            </div>

            {/* Modal Content */}
            <div className={styles.modalContent}>
              {(() => {
                const fileUrls = safeJSONParse(selectedLead.file_urls);
                const aiAnalysis = safeJSONParse(selectedLead.ai_analysis);

                return (
                  <>
                    {/* Contact Info */}
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

                    {/* Description */}
                    {selectedLead.description && (
                      <div className={styles.section}>
                        <h3 className={styles.sectionTitle}>Customer Description</h3>
                        <div className={styles.description}>
                          {selectedLead.description}
                        </div>
                      </div>
                    )}

                    {/* Photos */}
                    {fileUrls && Array.isArray(fileUrls) && fileUrls.length > 0 && (
                      <div className={styles.section}>
                        <h3 className={styles.sectionTitle}>Photos ({fileUrls.length})</h3>
                        <div className={styles.photosGrid}>
                          {fileUrls.map((file: any, idx: number) => (
                            file.name && file.name.match(/\.(jpg|jpeg|png|gif|webp)$/i) && (
                              <a 
                                key={idx}
                                href={file.url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className={styles.photoLink}
                              >
                                <img 
                                  src={file.url} 
                                  alt={`Upload ${idx + 1}`}
                                  className={styles.photo}
                                />
                              </a>
                            )
                          ))}
                        </div>
                      </div>
                    )}

                    {/* AI Analysis */}
                    <div className={styles.section}>
                      <h3 className={styles.sectionTitle}>AI Analysis</h3>
                      {aiAnalysis ? (
                        <AIAnalysis analysis={aiAnalysis} />
                      ) : (
                        <div className={styles.noAnalysis}>
                          No AI analysis available for this lead
                        </div>
                      )}
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
