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
            
            const images = fileUrls?.filter((f: any) => 
              f.type?.startsWith('image/') || f.name?.match(/\.(jpg|jpeg|png|gif|webp)$/i)
            ) || [];
            
            const videos = fileUrls?.filter((f: any) => 
              f.type?.startsWith('video/') || f.name?.match(/\.(mp4|mov|avi|webm)$/i)
            ) || [];
            
            const firstImage = images[0];

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
                    {(images.length > 1 || videos.length > 0) && (
                      <span className={styles.imageCount}>
                        {images.length > 1 && `+${images.length - 1} photos`}
                        {images.length > 1 && videos.length > 0 && ' • '}
                        {videos.length > 0 && `${videos.length} video${videos.length > 1 ? 's' : ''}`}
                      </span>
                    )}
                  </div>
                ) : videos.length > 0 ? (
                  <div className={styles.noImage}>
                    <div className="text-center">
                      <div className="text-5xl mb-2">🎥</div>
                      <p className="text-sm">{videos.length} video{videos.length > 1 ? 's' : ''}</p>
                    </div>
                  </div>
                ) : (
                  <div className={styles.noImage}>
                    <span>📷 No media</span>
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
                  {aiAnalysis ? (
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
                  ) : videos.length > 0 && images.length === 0 ? (
                    <div className={styles.badges}>
                      <span className={`${styles.badge} ${styles.urgencyNormal}`}>
                        📹 Manual Review
                      </span>
                    </div>
                  ) : null}

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
                
                const images = fileUrls?.filter((f: any) => 
                  f.type?.startsWith('image/') || f.name?.match(/\.(jpg|jpeg|png|gif|webp)$/i)
                ) || [];
                
                const videos = fileUrls?.filter((f: any) => 
                  f.type?.startsWith('video/') || f.name?.match(/\.(mp4|mov|avi|webm)$/i)
                ) || [];

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
                    {images.length > 0 && (
                      <div className={styles.section}>
                        <h3 className={styles.sectionTitle}>Photos ({images.length})</h3>
                        <div className={styles.photosGrid}>
                          {images.map((file: any, idx: number) => (
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
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Videos */}
                    {videos.length > 0 && (
                      <div className={styles.section}>
                        <h3 className={styles.sectionTitle}>Videos ({videos.length}) - Manual Review Required</h3>
                        <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4 mb-4">
                          <p className="text-yellow-800 text-sm">
                            📹 Videos require manual review. AI analysis works on photos only.
                          </p>
                        </div>
                        <div className={styles.photosGrid}>
                          {videos.map((file: any, idx: number) => (
                            <a 
                              key={idx}
                              href={file.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className={styles.photoLink}
                            >
                              <div className="w-full h-48 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex flex-col items-center justify-center border-2 border-blue-200">
                                <div className="text-6xl mb-2">🎥</div>
                                <p className="text-sm font-medium text-gray-700">Video {idx + 1}</p>
                                <p className="text-xs text-gray-500">Click to view</p>
                              </div>
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* AI Analysis */}
                    <div className={styles.section}>
                      <h3 className={styles.sectionTitle}>AI Analysis</h3>
                      {aiAnalysis ? (
                        <>
                          {videos.length > 0 && (
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                              <p className="text-blue-800 text-sm">
                                ℹ️ AI analysis based on {images.length} photo(s). {videos.length} video(s) available for manual review above.
                              </p>
                            </div>
                          )}
                          <AIAnalysis analysis={aiAnalysis} />
                        </>
                      ) : videos.length > 0 && images.length === 0 ? (
                        <div className={styles.noAnalysis}>
                          <div className="text-5xl mb-3">🎥</div>
                          <p className="font-semibold text-gray-700 mb-2">Videos Only - Manual Review Required</p>
                          <p className="text-gray-600 text-sm">
                            AI analysis works on photos. Please review the {videos.length} video(s) manually above.
                          </p>
                        </div>
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
