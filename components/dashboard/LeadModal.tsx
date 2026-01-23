'use client';

import { useState, useEffect, useRef } from 'react';
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
  const [newNote, setNewNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showCustomerInfo, setShowCustomerInfo] = useState(false);
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number } | null>(null);
  const [isGeocodingAddress, setIsGeocodingAddress] = useState(false);

  // Track if there are unsaved changes
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Photo upload states
  const [uploadingPhotos, setUploadingPhotos] = useState(false);
  const [photoType, setPhotoType] = useState<'before' | 'after'>('before');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Google Maps
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    libraries,
  });

  const notesArray = parseNotes(lead.notes);

  // Watch for changes to detect unsaved data
  useEffect(() => {
    const noteAdded = newNote.trim().length > 0;
    setHasUnsavedChanges(noteAdded);
  }, [newNote]);

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

  const handleSaveAllAndClose = async () => {
    if (!hasUnsavedChanges) {
      onClose();
      return;
    }

    setSaving(true);

    try {
      if (newNote.trim()) {
        const success = await onAddNote(lead.id, newNote);
        if (success) {
          setNewNote('');
          toast.success('✅ Note saved!');
          await onRefresh();
          onClose();
        } else {
          toast.error('Failed to save note');
        }
      }
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  // Handle photo uploads
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingPhotos(true);
    
    try {
      const formData = new FormData();
      formData.append('leadId', lead.id.toString());
      formData.append('photoType', photoType);
      formData.append('userName', currentUser?.name || currentUser?.email || 'Unknown User');
      
      for (let i = 0; i < files.length; i++) {
        formData.append('photos', files[i]);
      }

      const response = await fetch('/api/leads/upload-photos', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (response.ok && result.success) {
        toast.success(`✅ ${files.length} ${photoType} photo${files.length > 1 ? 's' : ''} uploaded!`);
        await onRefresh();
      } else {
        toast.error('Failed to upload photos');
      }
    } catch (error) {
      console.error('Photo upload error:', error);
      toast.error('Failed to upload photos');
    } finally {
      setUploadingPhotos(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Parse photo URLs from JSON arrays
  const customerPhotos = Array.isArray(lead.file_urls) ? lead.file_urls : [];
  const beforePhotos = lead.before_photos ? (typeof lead.before_photos === 'string' ? JSON.parse(lead.before_photos) : lead.before_photos) : [];
  const afterPhotos = lead.after_photos ? (typeof lead.after_photos === 'string' ? JSON.parse(lead.after_photos) : lead.after_photos) : [];

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

  // Get full address
  const getFullAddress = () => {
    if (!lead.address_line_1) return null;
    if (lead.address_line_2) {
      return `${lead.address_line_1}, ${lead.address_line_2}`;
    }
    return lead.address_line_1;
  };

  const fullAddress = getFullAddress();

  const handleToggleCustomerInfo = () => {
    const newState = !showCustomerInfo;
    setShowCustomerInfo(newState);
    
    if (newState && fullAddress && !mapCenter) {
      geocodeAddress(lead.address_line_1);
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
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-start sm:items-center justify-center z-50 p-0 sm:p-4" 
      onClick={onClose}
      style={{ overflow: 'auto', WebkitOverflowScrolling: 'touch' }}
    >
      <div 
        className="bg-white w-full sm:max-w-4xl sm:rounded-lg shadow-xl min-h-screen sm:min-h-0 sm:max-h-[90vh] flex flex-col" 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 sm:p-6 z-10">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">{lead.name}</h2>
              <p className="text-xs sm:text-sm text-gray-600 mt-1">
                {new Date(lead.created_at).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                  hour: 'numeric',
                  minute: '2-digit'
                })}
              </p>
              {hasUnsavedChanges && (
                <p className="text-xs text-orange-600 font-semibold mt-1 flex items-center gap-1">
                  <span className="inline-block w-2 h-2 bg-orange-600 rounded-full animate-pulse"></span>
                  Unsaved note
                </p>
              )}
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              {!showDeleteConfirm ? (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="text-gray-400 hover:text-red-600 transition text-sm px-2 sm:px-3 py-1 rounded hover:bg-red-50"
                  title="Delete lead"
                >
                  🗑️
                </button>
              ) : (
                <div className="flex items-center gap-2 bg-red-50 px-2 sm:px-3 py-1 rounded border border-red-200">
                  <span className="text-xs sm:text-sm text-red-700 font-medium">Delete?</span>
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
              <button 
                onClick={onClose} 
                className="text-3xl text-gray-400 hover:text-gray-600 transition leading-none"
              >
                ×
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          
          {/* Customer Info section */}
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl border-2 border-blue-200 mb-6">
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

            {showCustomerInfo && (
              <div className="px-6 pb-6 space-y-4">
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

                {fullAddress && (
                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <span className="text-xs font-medium text-gray-500 uppercase tracking-wide block mb-1">
                          Service Address
                        </span>
                        <p className="text-gray-900 font-medium">{lead.address_line_1}</p>
                        {lead.address_line_2 && <p className="text-gray-700 text-sm">{lead.address_line_2}</p>}
                        {lead.city && <p className="text-gray-600 text-sm mt-1">📍 {lead.city}</p>}
                      </div>
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-3 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition"
                      >
                        🗺️ Directions
                      </a>
                    </div>

                    {isLoaded && mapCenter && (
                      <div className="mt-3">
                        <GoogleMap mapContainerStyle={mapContainerStyle} center={mapCenter} zoom={15} options={mapOptions}>
                          <Marker position={mapCenter} />
                        </GoogleMap>
                      </div>
                    )}
                  </div>
                )}

                <div className="pt-2">
                  <div className="flex flex-col sm:flex-row gap-2">
                    <button
                      onClick={() => {
                        const subject = encodeURIComponent(`Re: Your ${formatCategory(lead.category)} Project`);
                        const body = encodeURIComponent(`Hi ${lead.name},\n\nThank you for reaching out!`);
                        window.location.href = `mailto:${lead.email}?subject=${subject}&body=${body}`;
                      }}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition"
                    >
                      📧 Email
                    </button>
                    <button
                      onClick={() => window.location.href = `tel:${lead.phone}`}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg transition"
                    >
                      📞 Call
                    </button>
                    <button
                      onClick={() => {
                        const message = encodeURIComponent(`Hi ${lead.name}, I reviewed your project.`);
                        window.location.href = `sms:${lead.phone}?body=${message}`;
                      }}
                      className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-4 rounded-lg transition"
                    >
                      💬 Text
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

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

          <ProjectSection 
            lead={lead}
            currentUser={currentUser}
            onRefresh={onRefresh}
            statusOptions={statusOptions}
            onUpdateStatus={onUpdateStatus}
          />

          {/* Activity Timeline */}
          <div className="bg-white rounded-xl border-2 border-gray-200 p-4 sm:p-6">
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">Activity Timeline ({notesArray.length})</h3>
            
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
                          : noteType === 'photo_upload'
                          ? 'bg-pink-50 border-pink-500'
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
                            <p className="text-xs text-gray-500 mt-2">
                              👤 {userName} • {new Date(timestamp).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                                hour: 'numeric',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <p className="text-gray-800 mb-2 whitespace-pre-wrap">{noteText}</p>
                          <p className="text-xs text-gray-500">
                            👤 {userName} • {new Date(timestamp).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                              hour: 'numeric',
                              minute: '2-digit'
                            })}
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

          {/* 🔥 NEW: Company Photo Upload Section */}
          <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-xl border-2 border-green-200 p-4 sm:p-6">
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">📸 Add Job Photos</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Photo Type
                </label>
                <select
                  value={photoType}
                  onChange={(e) => setPhotoType(e.target.value as 'before' | 'after')}
                  className="w-full px-4 py-2 rounded-lg border-2 border-gray-300 focus:border-blue-500 focus:outline-none bg-white text-gray-900"
                >
                  <option value="before">📸 Before Photos</option>
                  <option value="after">✨ After Photos</option>
                </select>
              </div>

              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handlePhotoUpload}
                  disabled={uploadingPhotos}
                  className="hidden"
                  id="photo-upload"
                />
                <label
                  htmlFor="photo-upload"
                  className={`w-full flex items-center justify-center gap-2 px-6 py-4 rounded-lg border-2 border-dashed border-gray-300 hover:border-blue-500 transition cursor-pointer ${
                    uploadingPhotos ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <span className="text-2xl">{photoType === 'before' ? '📸' : '✨'}</span>
                  <span className="font-semibold text-gray-700">
                    {uploadingPhotos ? 'Uploading...' : `Upload ${photoType === 'before' ? 'Before' : 'After'} Photos`}
                  </span>
                </label>
                <p className="text-xs text-gray-500 mt-2 text-center">
                  Click to select multiple photos • Max 10MB each
                </p>
              </div>
            </div>
          </div>

          {/* Customer Photos (from form) */}
          {customerPhotos.length > 0 && (
            <div className="bg-white rounded-xl border-2 border-gray-200 p-4 sm:p-6">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">📷 Customer Photos ({customerPhotos.length})</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                {customerPhotos.map((file: any, idx: number) => (
                  <a 
                    key={idx}
                    href={file.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="block rounded-lg overflow-hidden shadow-md hover:shadow-lg transition"
                  >
                    <img src={file.url} alt={`Customer photo ${idx + 1}`} className="w-full h-32 sm:h-48 object-cover" />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Before Photos */}
          {beforePhotos.length > 0 && (
            <div className="bg-white rounded-xl border-2 border-gray-200 p-4 sm:p-6">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">📸 Before Photos ({beforePhotos.length})</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                {beforePhotos.map((url: string, idx: number) => (
                  <a 
                    key={idx}
                    href={url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="block rounded-lg overflow-hidden shadow-md hover:shadow-lg transition relative group"
                  >
                    <img src={url} alt={`Before photo ${idx + 1}`} className="w-full h-32 sm:h-48 object-cover" />
                    <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-2 opacity-0 group-hover:opacity-100 transition">
                      Before #{idx + 1}
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* After Photos */}
          {afterPhotos.length > 0 && (
            <div className="bg-white rounded-xl border-2 border-green-200 p-4 sm:p-6">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">✨ After Photos ({afterPhotos.length})</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                {afterPhotos.map((url: string, idx: number) => (
                  <a 
                    key={idx}
                    href={url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="block rounded-lg overflow-hidden shadow-md hover:shadow-lg transition relative group"
                  >
                    <img src={url} alt={`After photo ${idx + 1}`} className="w-full h-32 sm:h-48 object-cover" />
                    <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-2 opacity-0 group-hover:opacity-100 transition">
                      After #{idx + 1}
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t-2 border-gray-200 p-4 sm:p-6 flex flex-col sm:flex-row gap-3">
          <button
            onClick={onClose}
            className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-6 rounded-lg transition"
          >
            Close
          </button>
          {hasUnsavedChanges && (
            <button
              onClick={handleSaveAllAndClose}
              disabled={saving}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition disabled:bg-gray-400"
            >
              {saving ? '💾 Saving Note...' : '💾 Save Note'}
            </button>
          )}
        </div>

      </div>
    </div>
  );
}