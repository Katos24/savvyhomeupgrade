'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import ProjectSection from '@/components/dashboard/ProjectSection';
import PhotoUpload from '@/components/dashboard/PhotoUpload';
import PhotoGallery from '@/components/dashboard/PhotoGallery';
import ConvertToProjectButton from '@/components/dashboard/ConvertToProjectButton';
import { safeJSONParse, parseNotes } from '@/lib/utils';
import styles from '@/app/dashboard/dashboard.module.css';
import { useLoadScript, GoogleMap, Marker } from '@react-google-maps/api';
import { canDeleteLead } from '@/lib/permissions';

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

// ============================================
// STATUS UPDATE COMPONENT (COMPACT)
// ============================================
function StatusUpdateSection({ lead, statusOptions, onUpdateStatus, onRefresh }: any) {
  const [selectedStatus, setSelectedStatus] = useState(lead.status || statusOptions[0]?.value);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleStatusChange = async () => {
    const oldStatus = lead.status || statusOptions[0]?.value;
    
    if (isUpdating || selectedStatus === oldStatus) return;
    
    setIsUpdating(true);
    
    try {
      const success = await onUpdateStatus(lead.id, selectedStatus, oldStatus);
      
      if (success) {
        toast.success(`Status updated to ${selectedStatus}!`);
        await onRefresh();
      } else {
        toast.error('Failed to update status');
        setSelectedStatus(oldStatus);
      }
    } catch (error) {
      console.error('Status update error:', error);
      toast.error('Failed to update status');
      setSelectedStatus(oldStatus);
    } finally {
      setTimeout(() => setIsUpdating(false), 1000);
    }
  };

  return (
    <div>
      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5 block">
        Change Status
      </label>
      <div className="flex gap-2">
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          disabled={isUpdating}
          className="flex-1 px-3 py-2 text-sm rounded-lg border border-gray-300 hover:border-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none bg-white text-gray-900 font-medium transition disabled:opacity-50 appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20stroke%3D%22%236b7280%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%221.5%22%20d%3D%22m6%208%204%204%204-4%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25rem] bg-[right_0.5rem_center] bg-no-repeat pr-10"
        >
          {statusOptions.map((option: any) => (
            <option key={option.value} value={option.value}>
              {option.emoji && `${option.emoji} `}{option.label}
            </option>
          ))}
        </select>
        
        <button
          onClick={handleStatusChange}
          disabled={isUpdating || selectedStatus === lead.status}
          className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-semibold rounded-lg transition"
        >
          {isUpdating ? '⏳' : 'Update'}
        </button>
      </div>
    </div>
  );
}

// ============================================
// MAIN LEAD MODAL (COMPACT VERSION)
// ============================================
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
  const [showActivityLog, setShowActivityLog] = useState(false);
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number } | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    libraries,
  });

  const notesArray = parseNotes(lead.notes);
  const isProject = !!lead.project_id;

  useEffect(() => {
    setHasUnsavedChanges(newNote.trim().length > 0);
  }, [newNote]);
  
  const userRole = currentUser?.role || 'member';
  const canDelete = canDeleteLead(userRole);
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

  // Parse photo arrays
  const customerPhotos = Array.isArray(lead.file_urls) ? lead.file_urls : [];
  const beforePhotos = lead.before_photos ? (typeof lead.before_photos === 'string' ? JSON.parse(lead.before_photos) : lead.before_photos) : [];
  const afterPhotos = lead.after_photos ? (typeof lead.after_photos === 'string' ? JSON.parse(lead.after_photos) : lead.after_photos) : [];

  const formatCategory = (category: string) => {
    if (lead.category_label) return lead.category_label;
    return category.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const getFullAddress = () => {
    if (!lead.address_line_1) return null;
    if (lead.address_line_2) return `${lead.address_line_1}, ${lead.address_line_2}`;
    return lead.address_line_1;
  };

  const fullAddress = getFullAddress();

  const handleToggleCustomerInfo = () => {
    setShowCustomerInfo(!showCustomerInfo);
  };

  const mapContainerStyle = { width: '100%', height: '250px', borderRadius: '8px' };
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
        {/* COMPACT HEADER */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-3 z-10">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900">{lead.name}</h2>
                {lead.category && (
                  <span className="inline-block px-2 py-0.5 bg-purple-100 text-purple-800 rounded text-xs font-semibold">
                    {formatCategory(lead.category)}
                  </span>
                )}
                {isProject && (
                  <span className="inline-block px-2 py-0.5 bg-emerald-600 text-white rounded text-xs font-semibold">
                    PROJECT
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-600 mt-0.5">
                {new Date(lead.created_at).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                  hour: 'numeric',
                  minute: '2-digit'
                })}
              </p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              {canDelete && !showDeleteConfirm ? (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="text-gray-400 hover:text-red-600 transition text-sm px-2 py-1 rounded hover:bg-red-50"
                >
                  🗑️
                </button>
              ) : canDelete && showDeleteConfirm ? (
                <div className="flex items-center gap-1.5 bg-red-50 px-2 py-1 rounded border border-red-200">
                  <span className="text-xs text-red-700 font-medium">Delete?</span>
                  <button
                    onClick={handleDelete}
                    disabled={saving}
                    className="text-xs bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-bold px-2 py-0.5 rounded"
                  >
                    Yes
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    disabled={saving}
                    className="text-xs bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium px-2 py-0.5 rounded"
                  >
                    No
                  </button>
                </div>
              ) : null}
              <button 
                onClick={onClose} 
                className="text-2xl text-gray-400 hover:text-gray-600 transition leading-none"
              >
                ×
              </button>
            </div>
          </div>
        </div>

        {/* COMPACT CONTENT */}
        <div className="flex-1 overflow-y-auto p-3 space-y-3">

          {/* Customer Info - COMPACT */}
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg border border-blue-200">
            <button
              onClick={handleToggleCustomerInfo}
              className="w-full flex items-center justify-between p-3 hover:bg-blue-50/50 transition rounded-lg"
            >
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-gray-900">Customer Information</h3>
                <span className="text-xs text-gray-600">({lead.name})</span>
              </div>
              <span className={`text-lg transition-transform ${showCustomerInfo ? 'rotate-180' : ''}`}>▼</span>
            </button>

            {showCustomerInfo && (
              <div className="px-3 pb-3 space-y-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div className="bg-white rounded-lg p-2 border border-gray-200">
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wide block mb-0.5">Email</span>
                    <a href={`mailto:${lead.email}`} className="text-sm text-gray-900 font-medium hover:underline break-all">{lead.email}</a>
                  </div>
                  <div className="bg-white rounded-lg p-2 border border-gray-200">
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wide block mb-0.5">Phone</span>
                    <a href={`tel:${lead.phone}`} className="text-sm text-gray-900 font-medium hover:underline">
                      {`(${lead.phone.slice(0, 3)}) ${lead.phone.slice(3, 6)}-${lead.phone.slice(6)}`}
                    </a>
                  </div>
                </div>

                {fullAddress && (
                  <div className="bg-white rounded-lg p-2 border border-gray-200">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <span className="text-xs font-medium text-gray-500 uppercase tracking-wide block mb-0.5">Address</span>
                        <p className="text-sm text-gray-900 font-medium">{lead.address_line_1}</p>
                        {lead.address_line_2 && <p className="text-xs text-gray-700">{lead.address_line_2}</p>}
                        {lead.city && <p className="text-xs text-gray-600 mt-0.5">{lead.city}</p>}
                      </div>
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-2 px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded transition"
                      >
                        Directions
                      </a>
                    </div>

                    {isLoaded && mapCenter && (
                      <div className="mt-2">
                        <GoogleMap mapContainerStyle={mapContainerStyle} center={mapCenter} zoom={15} options={mapOptions}>
                          <Marker position={mapCenter} />
                        </GoogleMap>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      const subject = encodeURIComponent(`Re: Your ${formatCategory(lead.category)} Project`);
                      const body = encodeURIComponent(`Hi ${lead.name},\n\nThank you for reaching out!`);
                      window.location.href = `mailto:${lead.email}?subject=${subject}&body=${body}`;
                    }}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-3 text-sm rounded-lg transition"
                  >
                    Email
                  </button>
                  <button
                    onClick={() => window.location.href = `tel:${lead.phone}`}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-3 text-sm rounded-lg transition"
                  >
                    Call
                  </button>
                  <button
                    onClick={() => {
                      const message = encodeURIComponent(`Hi ${lead.name}, I reviewed your project.`);
                      window.location.href = `sms:${lead.phone}?body=${message}`;
                    }}
                    className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-3 text-sm rounded-lg transition"
                  >
                    Text
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Description - COMPACT */}
          {lead.description && (
            <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
              <h3 className="text-sm font-semibold text-gray-900 mb-2">Description</h3>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{lead.description}</p>
            </div>
          )}

          {/* Customer Photos - COMPACT */}
         {customerPhotos.length > 0 && (
  <PhotoGallery 
    title="Customer Photos" 
    photos={customerPhotos}
    emoji="📷"
  />
)}

          {/* Convert to Project Button */}
          <ConvertToProjectButton 
            lead={lead}
            currentUser={currentUser}
            onRefresh={onRefresh}
          />

          {/* Status Section - COMPACT */}
          <div className={`rounded-lg border p-3 ${isProject ? 'bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-200' : 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200'}`}>
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-sm font-bold text-gray-900">
                {isProject ? 'Project Status' : 'Lead Status'}
              </h3>
              <div className={`inline-flex items-center px-2 py-1 rounded-lg font-semibold text-xs ${isProject ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'}`}>
                {currentStatusConfig.emoji && `${currentStatusConfig.emoji} `}{currentStatusConfig.label}
              </div>
            </div>
            
            <div className="space-y-2">

              {/* Update Status */}
              <StatusUpdateSection 
                lead={lead}
                statusOptions={statusOptions}
                onUpdateStatus={onUpdateStatus}
                onRefresh={onRefresh}
              />
            </div>
          </div>

          {/* Project Section */}
          {lead.project_id && (
            <ProjectSection 
              lead={lead}
              currentUser={currentUser}
              onRefresh={onRefresh}
              statusOptions={statusOptions}
              onUpdateStatus={onUpdateStatus}
            />
          )}

  
          {/* Activity Timeline - COLLAPSIBLE */}
          <div className="bg-white rounded-lg border border-gray-200">
            <button
              onClick={() => setShowActivityLog(!showActivityLog)}
              className="w-full flex items-center justify-between p-3 hover:bg-gray-50 transition rounded-lg"
            >
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-gray-900">Activity</h3>
                {notesArray.length > 0 && !showActivityLog && (
                  <span className="text-xs text-gray-600">({notesArray.length})</span>
                )}
              </div>
              <span className={`text-lg transition-transform ${showActivityLog ? 'rotate-180' : ''}`}>▼</span>
            </button>

            {showActivityLog && (
              <div className="px-3 pb-3 space-y-3">
                <div>
                  <textarea
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder="Add a note..."
                    rows={2}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2 bg-white text-gray-900"
                  />
                  <button
                    onClick={handleAddNote}
                    disabled={saving || !newNote.trim()}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-1.5 text-sm rounded-lg transition disabled:opacity-50"
                  >
                    {saving ? 'Adding...' : 'Add Note'}
                  </button>
                </div>

                {notesArray.length > 0 ? (
                  <div className="space-y-2 max-h-80 overflow-y-auto">
                    {[...notesArray].reverse().map((note: any, idx: number) => {
                      const isOldFormat = typeof note === 'string';
                      const noteText = isOldFormat ? note : note.text;
                      const noteType = isOldFormat ? 'note' : note.type;
                      const userName = isOldFormat ? 'Unknown' : (note.user_name || 'System');
                      const timestamp = isOldFormat ? lead.created_at : note.timestamp;

                      return (
                        <div 
                          key={idx} 
                          className={`p-2 rounded-lg border-l-4 text-xs ${
                            noteType === 'status_change' ? 'bg-blue-50 border-blue-500' 
                            : noteType === 'project_created' || noteType === 'project_updated' ? 'bg-purple-50 border-purple-500'
                            : noteType === 'quote_created' || noteType === 'quote_sent' ? 'bg-green-50 border-green-500'
                            : noteType === 'payment_updated' ? 'bg-orange-50 border-orange-500'
                            : noteType === 'photo_upload' ? 'bg-pink-50 border-pink-500'
                            : 'bg-gray-50 border-gray-400'
                          }`}
                        >
                          {noteType === 'status_change' ? (
                            <div className="flex items-start gap-2">
                              <span className="text-base">📊</span>
                              <div className="flex-1">
                                <p className="text-gray-900 font-semibold">Status Changed</p>
                                <p className="text-gray-700 mt-0.5">
                                  <span className="inline-block px-1.5 py-0.5 bg-gray-200 rounded text-xs mr-1">{note.old_status}</span>
                                  →
                                  <span className="inline-block px-1.5 py-0.5 bg-blue-200 rounded text-xs ml-1">{note.new_status}</span>
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                  {userName} • {new Date(timestamp).toLocaleDateString('en-US', {
                                    month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'
                                  })}
                                </p>
                              </div>
                            </div>
                          ) : (
                            <div>
                              <p className="text-gray-800 mb-1 whitespace-pre-wrap">{noteText}</p>
                              <p className="text-xs text-gray-500">
                                {userName} • {new Date(timestamp).toLocaleDateString('en-US', {
                                  month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'
                                })}
                              </p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="bg-gray-50 p-4 rounded-lg text-center text-gray-500 text-sm">No activity yet</div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* COMPACT FOOTER */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-3 flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 text-sm rounded-lg transition"
          >
            Close
          </button>
          {hasUnsavedChanges && (
            <button
              onClick={async () => {
                if (newNote.trim()) {
                  setSaving(true);
                  const success = await onAddNote(lead.id, newNote);
                  setSaving(false);
                  if (success) {
                    setNewNote('');
                    toast.success('Note saved!');
                    await onRefresh();
                    onClose();
                  }
                }
              }}
              disabled={saving}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 text-sm rounded-lg transition disabled:bg-gray-400"
            >
              {saving ? 'Saving...' : 'Save Note'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}