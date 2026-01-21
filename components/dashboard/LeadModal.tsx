'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import ProjectSection from '@/components/dashboard/ProjectSection';
import { safeJSONParse, parseNotes } from '@/lib/utils';
import styles from '@/app/dashboard/dashboard.module.css';
import { useLoadScript, GoogleMap, Marker } from '@react-google-maps/api';

const libraries: ("places")[] = ["places"];

type LeadModalProps = {
  lead: any;
  onClose: () => void;
  onUpdateStatus: (id: number, status: string, oldStatus: string) => Promise<boolean>;
  onAddNote: (id: number, noteText: string) => Promise<boolean>;
  onDeleteLead: (id: number) => Promise<boolean>;
  onRefresh: () => Promise<void>;
  currentUser: any;
  statusOptions: any[];
};

export default function LeadModal({
  lead,
  onClose,
  onUpdateStatus,
  onAddNote,
  onDeleteLead,
  onRefresh,
  currentUser,
  statusOptions
}: LeadModalProps) {
  const [status, setStatus] = useState(lead.status || statusOptions[0].value);
  const [newNote, setNewNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showCustomerInfo, setShowCustomerInfo] = useState(false);
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number } | null>(null);
  const [isGeocodingAddress, setIsGeocodingAddress] = useState(false);

  // Google Maps
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    libraries,
  });

  const notesArray = parseNotes(lead.notes);

  const handleStatusChange = async () => {
    const oldStatus = lead.status || statusOptions[0].value;
    
    if (status === oldStatus) return;
    
    setSaving(true);
    const success = await onUpdateStatus(lead.id, status, oldStatus);
    setSaving(false);
    
    if (success) {
      toast.success('Status updated!');
      setStatus(status);
    } else {
      toast.error('Failed to update status');
    }
  };

  const getStatusConfig = (statusValue: string) => {
    return statusOptions.find((s: any) => s.value === statusValue) || statusOptions[0];
  };

  const currentStatusConfig = getStatusConfig(lead.status || statusOptions[0].value);

  const handleAddNote = async () => {
    if (!newNote.trim()) return;
    
    setSaving(true);
    const success = await onAddNote(lead.id, newNote);
    setSaving(false);
    
    if (success) {
      setNewNote('');
      toast.success('Note added!');
    } else {
      toast.error('Failed to add note');
    }
  };

  const handleDelete = async () => {
    setSaving(true);
    const success = await onDeleteLead(lead.id);
    setSaving(false);
    
    if (success) {
      toast.success('Lead deleted!');
      onClose();
    } else {
      toast.error('Failed to delete lead');
    }
  };

  const fileUrls = safeJSONParse(lead.file_urls);
  
  const images = fileUrls?.filter((f: any) => 
    f.type?.startsWith('image/') || f.name?.match(/\.(jpg|jpeg|png|gif|webp)$/i)
  ) || [];
  
  const videos = fileUrls?.filter((f: any) => 
    f.type?.startsWith('video/') || f.name?.match(/\.(mp4|mov|avi|webm)$/i)
  ) || [];

  // Helper function to format category for display
  const formatCategory = (category: string) => {
    if (lead.category_label) {
      return lead.category_label;
    }
    return category
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Geocode address to get coordinates for map
  const geocodeAddress = async (address: string) => {
    if (!isLoaded || !address || mapCenter) return;
    
    setIsGeocodingAddress(true);
    try {
      const geocoder = new google.maps.Geocoder();
      const result = await geocoder.geocode({ address });
      
      if (result.results && result.results[0]) {
        const location = result.results[0].geometry.location;
        setMapCenter({
          lat: location.lat(),
          lng: location.lng()
        });
      }
    } catch (error) {
      console.error('Geocoding error:', error);
    } finally {
      setIsGeocodingAddress(false);
    }
  };

  // Get full address (combining address_line_1 and address_line_2)
  const getFullAddress = () => {
    if (!lead.address_line_1) return null;
    if (lead.address_line_2) {
      return `${lead.address_line_1}, ${lead.address_line_2}`;
    }
    return lead.address_line_1;
  };

  const fullAddress = getFullAddress();

  // Geocode address when customer info is expanded and we have an address
  const handleToggleCustomerInfo = () => {
    const newState = !showCustomerInfo;
    setShowCustomerInfo(newState);
    
    if (newState && fullAddress && !mapCenter) {
      geocodeAddress(lead.address_line_1); // Use base address for geocoding, not including unit
    }
  };

  const mapContainerStyle = {
    width: '100%',
    height: '300px',
    borderRadius: '12px'
  };

  const mapOptions = {
    disableDefaultUI: false,
    zoomControl: true,
    mapTypeControl: false,
    streetViewControl: true,
    fullscreenControl: true,
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <div>
            <h2 className={styles.modalTitle}>{lead.name}</h2>
            <p className={styles.modalDate}>
              {new Date(lead.created_at).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
                hour: 'numeric',
                minute: '2-digit'
              })}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {/* Discreet Delete Button */}
            {!showDeleteConfirm ? (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="text-gray-400 hover:text-red-600 transition text-sm px-3 py-1 rounded hover:bg-red-50"
                title="Delete lead"
              >
                🗑️
              </button>
            ) : (
              <div className="flex items-center gap-2 bg-red-50 px-3 py-1 rounded border border-red-200">
                <span className="text-sm text-red-700 font-medium">Delete?</span>
                <button
                  onClick={handleDelete}
                  disabled={saving}
                  className="text-xs bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-bold px-2 py-1 rounded"
                >
                  Yes
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={saving}
                  className="text-xs bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium px-2 py-1 rounded"
                >
                  No
                </button>
              </div>
            )}
            <button onClick={onClose} className={styles.closeButton}>×</button>
          </div>
        </div>

        <div className={styles.modalContent}>
          
          {/* ==================== CUSTOMER INFO (EXPANDABLE) ==================== */}
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl border-2 border-blue-200 mb-6">
            {/* Header - Always Visible */}
            <button
              onClick={handleToggleCustomerInfo}
              className="w-full flex items-center justify-between p-6 hover:bg-blue-50/50 transition rounded-xl"
            >
              <div className="flex items-center gap-3">
                <h3 className="text-xl font-bold text-gray-900">👤 Customer Information</h3>
                <span className="text-sm text-gray-600">({lead.name})</span>
              </div>
              <span className={`text-2xl transition-transform ${showCustomerInfo ? 'rotate-180' : ''}`}>
                ▼
              </span>
            </button>

            {/* Expandable Content */}
            {showCustomerInfo && (
              <div className="px-6 pb-6 space-y-4">
                {/* Contact Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="bg-white rounded-lg p-3 border border-gray-200">
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wide block mb-1">Email</span>
                    <a href={`mailto:${lead.email}`} className="text-gray-900 font-medium hover:underline">
                      {lead.email}
                    </a>
                  </div>
                  <div className="bg-white rounded-lg p-3 border border-gray-200">
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wide block mb-1">Phone</span>
                    <a href={`tel:${lead.phone}`} className="text-gray-900 font-medium hover:underline">
                      {lead.phone}
                    </a>
                  </div>
                </div>

                {/* Address Section */}
                {fullAddress && (
                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <span className="text-xs font-medium text-gray-500 uppercase tracking-wide block mb-1">
                          Service Address
                        </span>
                        <p className="text-gray-900 font-medium">
                          {lead.address_line_1}
                        </p>
                        {lead.address_line_2 && (
                          <p className="text-gray-700 text-sm">
                            {lead.address_line_2}
                          </p>
                        )}
                        {lead.city && (
                          <p className="text-gray-600 text-sm mt-1">
                            📍 {lead.city}
                          </p>
                        )}
                      </div>
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-3 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition flex items-center gap-1"
                      >
                        🗺️ Directions
                      </a>
                    </div>

                    {/* Google Map */}
                    {isLoaded && mapCenter && (
                      <div className="mt-3">
                        <GoogleMap
                          mapContainerStyle={mapContainerStyle}
                          center={mapCenter}
                          zoom={15}
                          options={mapOptions}
                        >
                          <Marker position={mapCenter} />
                        </GoogleMap>
                      </div>
                    )}

                    {/* Loading state for geocoding */}
                    {isGeocodingAddress && (
                      <div className="mt-3 bg-gray-50 rounded-lg p-4 text-center">
                        <p className="text-gray-600 text-sm">📍 Loading map...</p>
                      </div>
                    )}

                    {/* No map available */}
                    {isLoaded && !mapCenter && !isGeocodingAddress && (
                      <div className="mt-3 bg-gray-50 rounded-lg p-4 text-center">
                        <p className="text-gray-500 text-sm">Map unavailable for this address</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Quick Action Buttons */}
                <div className="pt-2">
                  <div className="flex flex-col sm:flex-row gap-2">
                    <button
                      onClick={() => {
                        const subject = encodeURIComponent(`Re: Your ${formatCategory(lead.category)} Project`);
                        const body = encodeURIComponent(`Hi ${lead.name},\n\nThank you for reaching out!`);
                        window.location.href = `mailto:${lead.email}?subject=${subject}&body=${body}`;
                      }}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition flex items-center justify-center gap-2"
                    >
                      📧 Email
                    </button>
                    <button
                      onClick={() => window.location.href = `tel:${lead.phone}`}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg transition flex items-center justify-center gap-2"
                    >
                      📞 Call
                    </button>
                    <button
                      onClick={() => {
                        const message = encodeURIComponent(`Hi ${lead.name}, I reviewed your project.`);
                        window.location.href = `sms:${lead.phone}?body=${message}`;
                      }}
                      className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-4 rounded-lg transition flex items-center justify-center gap-2"
                    >
                      💬 Text
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ==================== CATEGORY & DESCRIPTION (OUTSIDE EXPANDABLE) ==================== */}
          {lead.category && (
            <div className="mb-6">
              <span className="inline-block px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-semibold">
                {formatCategory(lead.category)}
              </span>
            </div>
          )}

          {lead.description && (
            <div className="bg-gray-50 rounded-xl p-6 border-2 border-gray-200 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
              <p className="text-gray-700 whitespace-pre-wrap">{lead.description}</p>
            </div>
          )}

          {/* ==================== PROJECT SECTION (COMPONENT) ==================== */}
          <ProjectSection 
            lead={lead}
            currentUser={currentUser}
            onRefresh={onRefresh}
            statusOptions={statusOptions}
            onUpdateStatus={onUpdateStatus}
          />

          {/* ==================== ACTIVITY TIMELINE ==================== */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Activity Timeline ({notesArray.length})</h3>
            
            <div className="mb-4">
              <textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Add a note..."
                rows={3}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2 bg-white text-gray-900"
              />
              <button
                onClick={handleAddNote}
                disabled={saving || !newNote.trim()}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-lg transition disabled:opacity-50"
              >
                {saving ? '💾 Adding...' : '➕ Add Note'}
              </button>
            </div>

            {notesArray.length > 0 ? (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {[...notesArray].reverse().map((note: any, idx: number) => {
                  const isOldFormat = typeof note === 'string';
                  const noteText = isOldFormat ? note : note.text;
                  const noteType = isOldFormat ? 'note' : note.type;
                  const userName = isOldFormat ? 'Unknown' : (note.user_name || 'System');
                  const timestamp = isOldFormat ? lead.created_at : note.timestamp;

                  return (
                    <div 
                      key={idx} 
                      className={`p-4 rounded-lg border-l-4 ${
                        noteType === 'status_change' 
                          ? 'bg-blue-50 border-blue-500' 
                          : noteType === 'project_created' || noteType === 'project_updated'
                          ? 'bg-purple-50 border-purple-500'
                          : noteType === 'quote_created' || noteType === 'quote_sent'
                          ? 'bg-green-50 border-green-500'
                          : noteType === 'payment_updated'
                          ? 'bg-orange-50 border-orange-500'
                          : 'bg-gray-50 border-gray-400'
                      }`}
                    >
                      {noteType === 'status_change' ? (
                        <div className="flex items-start gap-3">
                          <span className="text-2xl">📊</span>
                          <div className="flex-1">
                            <p className="text-gray-900 font-semibold text-sm">Status Changed</p>
                            <p className="text-gray-700 mt-1">
                              <span className="inline-block px-2 py-0.5 bg-gray-200 rounded text-xs mr-2">
                                {note.old_status}
                              </span>
                              →
                              <span className="inline-block px-2 py-0.5 bg-blue-200 rounded text-xs ml-2">
                                {note.new_status}
                              </span>
                            </p>
                            <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                              <span className="font-semibold">👤 {userName}</span>
                              <span>•</span>
                              <span>{new Date(timestamp).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                                hour: 'numeric',
                                minute: '2-digit'
                              })}</span>
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <p className="text-gray-800 mb-2 whitespace-pre-wrap">{noteText}</p>
                          <p className="text-xs text-gray-500 flex items-center gap-1">
                            <span className="font-semibold">👤 {userName}</span>
                            <span>•</span>
                            <span>{new Date(timestamp).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                              hour: 'numeric',
                              minute: '2-digit'
                            })}</span>
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-gray-50 p-8 rounded-lg text-center text-gray-500">
                No activity yet
              </div>
            )}
          </div>

          {/* ==================== PHOTOS & VIDEOS ==================== */}
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
                    <img src={file.url} alt={`Photo ${idx + 1}`} className={styles.photo} />
                  </a>
                ))}
              </div>
            </div>
          )}

          {videos.length > 0 && (
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>Videos ({videos.length})</h3>
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
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* ==================== FOOTER ACTIONS ==================== */}
          <div className="mt-8 pt-6 border-t-2 border-gray-200 flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-6 rounded-lg transition"
            >
              Close
            </button>
            <button
              onClick={onClose}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition"
            >
              ✅ Save & Close
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}