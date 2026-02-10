'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { 
  Mail, 
  Phone, 
  MessageSquare, 
  MapPin, 
  Navigation,
  ChevronDown,
  Trash2,
  X,
  Calendar,
  Tag,
  Briefcase,
  Edit2,
  Save,
  MoreVertical
} from 'lucide-react';
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
  categories: any[];
  company?: any;
};

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
      <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2 block">
        Change Status
      </label>
      <div className="flex gap-3">
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          disabled={isUpdating}
          className="flex-1 max-w-xs px-3 py-2.5 text-sm rounded-lg border border-gray-300 hover:border-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none bg-white text-gray-900 font-medium transition disabled:opacity-50"
        >
          {statusOptions.map((option: any) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <button
          onClick={handleStatusChange}
          disabled={isUpdating || selectedStatus === lead.status}
          className="px-8 py-2.5 text-sm bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-semibold rounded-lg transition whitespace-nowrap"
        >
          {isUpdating ? 'Updating...' : 'Update'}
        </button>
      </div>
    </div>
  );
}

export default function LeadModal({
  lead,
  onClose,
  onUpdateStatus,
  onAddNote,
  onDeleteLead,
  onRefresh,
  currentUser,
  statusOptions,
  categories = [],
  company
}: LeadModalProps) {
  const [newNote, setNewNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showCustomerInfo, setShowCustomerInfo] = useState(false);
  const [showActivityLog, setShowActivityLog] = useState(false);
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number } | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  
  // Edit mode state
  const [isEditingDetails, setIsEditingDetails] = useState(false);
  const [editedDetails, setEditedDetails] = useState({
    name: lead.name || '',
    email: lead.email || '',
    phone: lead.phone || '',
    address_line_1: lead.address_line_1 || '',
    address_line_2: lead.address_line_2 || '',
    city: lead.city || '',
    category: lead.category || '',
    description: lead.description || '',
  });

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    libraries,
  });

  const getStatusColor = (colorName: string) => {
    const colorMap: Record<string, string> = {
      blue: '#3b82f6',
      yellow: '#eab308',
      purple: '#a855f7',
      orange: '#f97316',
      green: '#22c55e',
      red: '#ef4444',
      gray: '#6b7280',
      indigo: '#6366f1',
      pink: '#ec4899',
    };
    return colorMap[colorName] || '#3b82f6';
  };

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

  const handleSaveDetails = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/leads/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: lead.id,
          action: 'update_details',
          ...editedDetails,
          user_name: currentUser?.name || currentUser?.email,
          user_email: currentUser?.email,
        }),
      });

      if (response.ok) {
        toast.success('Details updated!');
        setIsEditingDetails(false);
        await onRefresh();
      } else {
        toast.error('Failed to update details');
      }
    } catch (error) {
      console.error('Update error:', error);
      toast.error('Failed to update details');
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setEditedDetails({
      name: lead.name || '',
      email: lead.email || '',
      phone: lead.phone || '',
      address_line_1: lead.address_line_1 || '',
      address_line_2: lead.address_line_2 || '',
      city: lead.city || '',
      category: lead.category || '',
      description: lead.description || '',
    });
    setIsEditingDetails(false);
  };

  const formatPhoneNumber = (value: string): string => {
    const phoneNumber = value.replace(/\D/g, '');
    const limitedNumber = phoneNumber.slice(0, 10);
    
    if (limitedNumber.length === 0) return '';
    if (limitedNumber.length <= 3) return `(${limitedNumber}`;
    if (limitedNumber.length <= 6) return `(${limitedNumber.slice(0, 3)}) ${limitedNumber.slice(3)}`;
    return `(${limitedNumber.slice(0, 3)}) ${limitedNumber.slice(3, 6)}-${limitedNumber.slice(6)}`;
  };

  const customerPhotos = Array.isArray(lead.file_urls) ? lead.file_urls : [];

  const formatCategory = (category: string) => {
    if (!category) return 'No category';
    if (lead.category_label) return lead.category_label;
    const cat = categories.find((c: any) => c.value === category);
    return cat ? cat.label : category.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const getFullAddress = () => {
    const addr = isEditingDetails ? editedDetails.address_line_1 : lead.address_line_1;
    if (!addr) return null;
    const line2 = isEditingDetails ? editedDetails.address_line_2 : lead.address_line_2;
    if (line2) return `${addr}, ${line2}`;
    return addr;
  };

  const fullAddress = getFullAddress();

  const mapContainerStyle = { width: '100%', height: '250px', borderRadius: '8px' };
  const mapOptions = {
    disableDefaultUI: false,
    zoomControl: true,
    mapTypeControl: false,
    streetViewControl: true,
    fullscreenControl: true,
  };

  const displayName = isEditingDetails ? editedDetails.name : lead.name;
  const displayEmail = isEditingDetails ? editedDetails.email : lead.email;
  const displayPhone = isEditingDetails ? editedDetails.phone : lead.phone;
  const displayCategory = isEditingDetails ? editedDetails.category : lead.category;
  const displayDescription = isEditingDetails ? editedDetails.description : lead.description;

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-start sm:items-center justify-center z-50 p-0 sm:p-4" 
      onClick={onClose}
      style={{ overflow: 'auto', WebkitOverflowScrolling: 'touch' }}
    >
      <div 
        className="bg-white w-full sm:max-w-4xl sm:rounded-xl shadow-2xl min-h-screen sm:min-h-0 sm:max-h-[90vh] flex flex-col" 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-200 p-4 z-10 rounded-t-xl">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              {isEditingDetails ? (
                <input
                  type="text"
                  value={editedDetails.name}
                  onChange={(e) => setEditedDetails({ ...editedDetails, name: e.target.value })}
                  className="text-xl font-bold text-gray-900 border-2 border-blue-300 rounded px-2 py-1 mb-2 w-full"
                  placeholder="Customer Name"
                />
              ) : (
                <div className="flex items-center gap-2 flex-wrap mb-2">
                  <h2 className="text-xl font-bold text-gray-900">{displayName}</h2>
                  {displayCategory && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-purple-100 text-purple-700 rounded-lg text-xs font-semibold">
                      <Tag className="w-3 h-3" />
                      {formatCategory(displayCategory)}
                    </span>
                  )}
                  {isProject && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-600 text-white rounded-lg text-xs font-bold shadow-sm">
                     #{lead.project_number}
                    </span>
                  )}
{/* Status Badge - Shows ALWAYS (both leads and projects) */}
{/* Status Badge - Smaller version */}
<span 
  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold"
  style={{ 
    backgroundColor: `${getStatusColor(currentStatusConfig.color)}15`,
    border: `1px solid ${getStatusColor(currentStatusConfig.color)}`,
    color: getStatusColor(currentStatusConfig.color)
  }}
>
  {currentStatusConfig.emoji && <span>{currentStatusConfig.emoji}</span>}
  {currentStatusConfig.label}
</span>

                  
                </div>
              )}
              <div className="flex items-center gap-1.5 text-xs text-gray-600">
                <Calendar className="w-3.5 h-3.5" />
                <p>
                  {new Date(lead.created_at).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 flex-shrink-0">
              {!isEditingDetails && (
                <button
                  onClick={() => setIsEditingDetails(true)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                  title="Edit Details"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              )}
              
              {!isEditingDetails && (
                <button 
                  onClick={onClose} 
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">

          {/* Save/Cancel buttons when editing */}
          {isEditingDetails && (
            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 flex gap-3">
              <button
                onClick={handleSaveDetails}
                disabled={saving}
                className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold py-3 rounded-lg transition"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                onClick={handleCancelEdit}
                disabled={saving}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 rounded-lg transition"
              >
                Cancel
              </button>
            </div>
          )}

          {/* Customer Information */}
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl border border-blue-200">
            <button
              onClick={() => setShowCustomerInfo(!showCustomerInfo)}
              className="w-full flex items-center justify-between p-4 hover:bg-blue-50/50 transition rounded-xl"
            >
              <h3 className="text-sm font-bold text-gray-900">Customer Information</h3>
              <ChevronDown className={`w-5 h-5 text-gray-600 transition-transform ${showCustomerInfo ? 'rotate-180' : ''}`} />
            </button>

            {showCustomerInfo && (
              <div className="px-4 pb-4 space-y-3">
                {isEditingDetails ? (
                  // EDIT MODE
                  <div className="space-y-3">
                    {/* Email & Phone */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-semibold text-gray-600 mb-1 block">EMAIL</label>
                        <input
                          type="email"
                          value={editedDetails.email}
                          onChange={(e) => setEditedDetails({ ...editedDetails, email: e.target.value })}
                          className="w-full px-3 py-2 border-2 border-blue-300 rounded-lg text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-gray-600 mb-1 block">PHONE</label>
                        <input
                          type="tel"
                          value={editedDetails.phone}
                          onChange={(e) => setEditedDetails({ ...editedDetails, phone: formatPhoneNumber(e.target.value) })}
                          className="w-full px-3 py-2 border-2 border-blue-300 rounded-lg text-sm"
                          maxLength={14}
                        />
                      </div>
                    </div>

                    {/* Address */}
                    <div>
                      <label className="text-xs font-semibold text-gray-600 mb-1 block">ADDRESS LINE 1</label>
                      <input
                        type="text"
                        value={editedDetails.address_line_1}
                        onChange={(e) => setEditedDetails({ ...editedDetails, address_line_1: e.target.value })}
                        className="w-full px-3 py-2 border-2 border-blue-300 rounded-lg text-sm"
                        placeholder="123 Main St"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-semibold text-gray-600 mb-1 block">ADDRESS LINE 2</label>
                        <input
                          type="text"
                          value={editedDetails.address_line_2}
                          onChange={(e) => setEditedDetails({ ...editedDetails, address_line_2: e.target.value })}
                          className="w-full px-3 py-2 border-2 border-blue-300 rounded-lg text-sm"
                          placeholder="Apt 4B"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-gray-600 mb-1 block">CITY</label>
                        <input
                          type="text"
                          value={editedDetails.city}
                          onChange={(e) => setEditedDetails({ ...editedDetails, city: e.target.value })}
                          className="w-full px-3 py-2 border-2 border-blue-300 rounded-lg text-sm"
                          placeholder="New York"
                        />
                      </div>
                    </div>

                    {/* Category */}
                    <div>
                      <label className="text-xs font-semibold text-gray-600 mb-1 block">CATEGORY</label>
                      <select
                        value={editedDetails.category}
                        onChange={(e) => setEditedDetails({ ...editedDetails, category: e.target.value })}
                        className="w-full px-3 py-2 border-2 border-blue-300 rounded-lg text-sm"
                      >
                        <option value="">Select category...</option>
                        
                        {/* Show current category if it's not in the active list (orphaned) */}
                        {editedDetails.category && 
                         !categories.find((c: any) => c.value === editedDetails.category) && (
                          <option value={editedDetails.category} className="text-orange-600">
                            ⚠️ {formatCategory(editedDetails.category)} (Legacy)
                          </option>
                        )}
                        
                        {/* Show all current active categories */}
                        {categories.map((cat: any) => (
                          <option key={cat.value} value={cat.value}>
                            {cat.emoji} {cat.label}
                          </option>
                        ))}
                      </select>
                      
                      {/* Warning if category is orphaned */}
                      {editedDetails.category && 
                       !categories.find((c: any) => c.value === editedDetails.category) && (
                        <p className="text-xs text-orange-600 mt-1">
                          ⚠️ This category is no longer active. Please select a new one.
                        </p>
                      )}
                    </div>

                    {/* Description */}
                    <div>
                      <label className="text-xs font-semibold text-gray-600 mb-1 block">DESCRIPTION</label>
                      <textarea
                        value={editedDetails.description}
                        onChange={(e) => setEditedDetails({ ...editedDetails, description: e.target.value })}
                        rows={4}
                        className="w-full px-3 py-2 border-2 border-blue-300 rounded-lg text-sm resize-none"
                        placeholder="Project description..."
                      />
                    </div>
                  </div>
                ) : (
                  // VIEW MODE
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="bg-white rounded-lg p-3 border border-gray-200">
                        <span className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">
                          <Mail className="w-3.5 h-3.5" style={{ color: '#3b82f6' }} />
                          Email
                        </span>
                        <a href={`mailto:${displayEmail}`} className="text-sm text-gray-900 font-medium hover:text-blue-600 hover:underline break-all">
                          {displayEmail}
                        </a>
                      </div>
                      <div className="bg-white rounded-lg p-3 border border-gray-200">
                        <span className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">
                          <Phone className="w-3.5 h-3.5" style={{ color: '#22c55e' }} />
                          Phone
                        </span>
                        <a href={`tel:${displayPhone}`} className="text-sm text-gray-900 font-medium hover:text-green-600 hover:underline">
                          {displayPhone && formatPhoneNumber(displayPhone)}
                        </a>
                      </div>
                    </div>

                    {fullAddress && (
                      <div className="bg-white rounded-lg p-3 border border-gray-200">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <span className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">
                              <MapPin className="w-3.5 h-3.5" style={{ color: '#ef4444' }} />
                              Address
                            </span>
                            <p className="text-sm text-gray-900 font-medium">{isEditingDetails ? editedDetails.address_line_1 : lead.address_line_1}</p>
                            {(isEditingDetails ? editedDetails.address_line_2 : lead.address_line_2) && (
                              <p className="text-xs text-gray-700 mt-0.5">{isEditingDetails ? editedDetails.address_line_2 : lead.address_line_2}</p>
                            )}
                            {(isEditingDetails ? editedDetails.city : lead.city) && (
                              <p className="text-xs text-gray-600 mt-0.5">{isEditingDetails ? editedDetails.city : lead.city}</p>
                            )}
                          </div>
                          <a
                            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 ml-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition shadow-sm"
                          >
                            <Navigation className="w-3.5 h-3.5" />
                            Directions
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

                    {/* Action Buttons */}
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        onClick={() => {
                          const subject = encodeURIComponent(`Re: Your ${formatCategory(displayCategory)} Project`);
                          const body = encodeURIComponent(`Hi ${displayName},\n\nThank you for reaching out!`);
                          window.location.href = `mailto:${displayEmail}?subject=${subject}&body=${body}`;
                        }}
                        className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-3 text-sm rounded-lg transition shadow-sm"
                      >
                        <Mail className="w-4 h-4" />
                        Email
                      </button>
                      <button
                        onClick={() => window.location.href = `tel:${displayPhone}`}
                        className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-3 text-sm rounded-lg transition shadow-sm"
                      >
                        <Phone className="w-4 h-4" />
                        Call
                      </button>
                      <button
                        onClick={() => {
                          const message = encodeURIComponent(`Hi ${displayName}, I reviewed your project.`);
                          window.location.href = `sms:${displayPhone}?body=${message}`;
                        }}
                        className="flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-3 text-sm rounded-lg transition shadow-sm"
                      >
                        <MessageSquare className="w-4 h-4" />
                        Text
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          

          {/* Description (when not editing) */}
          {!isEditingDetails && displayDescription && (
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
              <h3 className="text-sm font-bold text-gray-900 mb-2">Description</h3>
              <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{displayDescription}</p>
            </div>
          )}

          {/* Customer Photos */}
          {customerPhotos.length > 0 && (
            <PhotoGallery 
              title="Customer Photos" 
              photos={customerPhotos}
              emoji="📷"
            />
          )}

          {/* Custom Questions */}
          {lead.custom_answers && Object.keys(lead.custom_answers).length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-indigo-600" />
                Custom Questions
              </h3>
              <div className="space-y-3">
                {(() => {
                  // Get company's custom questions to map IDs to labels
                  const companyQuestions = company?.custom_questions || [];
                  
                  return Object.entries(lead.custom_answers).map(([questionId, answer]: [string, any], idx: number) => {
                    // Find the question definition
                    const questionDef = companyQuestions.find((q: any) => q.id === questionId);
                    const questionLabel = questionDef?.label || questionId;
                    
                    return (
                      <div key={idx} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                        <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">
                          {questionLabel}
                        </p>
                        <p className="text-sm text-gray-900 font-medium">
                          {typeof answer === 'boolean' 
                            ? (answer ? 'Yes' : 'No')
                            : answer || <span className="text-gray-400 italic">No answer provided</span>
                          }
                        </p>
                      </div>
                    );
                  });
                })()}
              </div>
            </div>
          )}

          

          {/* Convert to Project Button */}
          <ConvertToProjectButton 
            lead={lead}
            currentUser={currentUser}
            onRefresh={onRefresh}
          />

                    {lead.project_id && (
  <div className="bg-white rounded-xl border border-gray-200 p-4">
    <StatusUpdateSection
      lead={lead}
      statusOptions={statusOptions}
      onUpdateStatus={onUpdateStatus}
      onRefresh={onRefresh}
    />
  </div>
)}

          {/* Project Section - Only show if converted to project */}
          {lead.project_id && (
            <ProjectSection 
              lead={lead}
              currentUser={currentUser}
              onRefresh={onRefresh}
              statusOptions={statusOptions}
              onUpdateStatus={onUpdateStatus}
            />
          )}

          {/* Activity Log */}
          <div className="bg-white rounded-xl border border-gray-200">
            <button
              onClick={() => setShowActivityLog(!showActivityLog)}
              className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition rounded-xl"
            >
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-gray-900">Activity</h3>
                {notesArray.length > 0 && !showActivityLog && (
                  <span className="px-2 py-0.5 bg-gray-200 text-gray-700 text-xs font-bold rounded-full">{notesArray.length}</span>
                )}
              </div>
              <ChevronDown className={`w-5 h-5 text-gray-600 transition-transform ${showActivityLog ? 'rotate-180' : ''}`} />
            </button>

            {showActivityLog && (
              <div className="px-4 pb-4 space-y-3">
                <div>
                  <textarea
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder="Add a note..."
                    rows={3}
                    className="w-full px-3 py-3 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mb-2 bg-white text-gray-900"
                  />
                  <button
                    onClick={handleAddNote}
                    disabled={saving || !newNote.trim()}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 text-sm rounded-lg transition disabled:opacity-50 shadow-sm"
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
                          className={`p-3 rounded-lg border-l-4 text-xs ${
                            noteType === 'status_change' ? 'bg-blue-50 border-blue-500' 
                            : noteType === 'project_created' || noteType === 'project_updated' ? 'bg-purple-50 border-purple-500'
                            : noteType === 'quote_created' || noteType === 'quote_sent' ? 'bg-green-50 border-green-500'
                            : noteType === 'payment_updated' ? 'bg-orange-50 border-orange-500'
                            : noteType === 'photo_upload' ? 'bg-pink-50 border-pink-500'
                            : noteType === 'details_updated' ? 'bg-yellow-50 border-yellow-500'
                            : 'bg-gray-50 border-gray-400'
                          }`}
                        >
                          {noteType === 'status_change' ? (
                            <div className="flex items-start gap-2">
                              <div className="flex-1">
                                <p className="text-gray-900 font-semibold">Status Changed</p>
                                <p className="text-gray-700 mt-1">
                                  <span className="inline-block px-2 py-0.5 bg-gray-200 rounded text-xs mr-1">{note.old_status}</span>
                                  →
                                  <span className="inline-block px-2 py-0.5 bg-blue-200 rounded text-xs ml-1">{note.new_status}</span>
                                </p>
                                <p className="text-xs text-gray-500 mt-1.5">
                                  {userName} • {new Date(timestamp).toLocaleDateString('en-US', {
                                    month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'
                                  })}
                                </p>
                              </div>
                            </div>
                          ) : (
                            <div>
                              <p className="text-gray-800 mb-1.5 whitespace-pre-wrap">{noteText}</p>
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
                  <div className="bg-gray-50 p-6 rounded-lg text-center text-gray-500 text-sm">No activity yet</div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 flex gap-2 rounded-b-xl">
          {isEditingDetails ? (
            <>
              <button
                onClick={handleSaveDetails}
                disabled={saving}
                className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold py-3 rounded-lg transition"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                onClick={handleCancelEdit}
                disabled={saving}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 rounded-lg transition"
              >
                Cancel
              </button>
            </>
          ) : (
            <>
              {/* 3-Dot Menu - Left of Close */}
              {canDelete && (
                <div className="relative">
                  <button
                    onClick={() => setShowMoreMenu(!showMoreMenu)}
                    className="p-3 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition"
                  >
                    <MoreVertical className="w-5 h-5" />
                  </button>
                  
                  {/* Dropdown Menu */}
                  {showMoreMenu && (
                    <>
                      {/* Overlay */}
                      <div 
                        className="fixed inset-0 z-40" 
                        onClick={() => setShowMoreMenu(false)}
                      />
                      
                      {/* Menu */}
                      <div 
                        className="absolute left-0 bg-white rounded-lg shadow-2xl border border-gray-200 z-50 w-48"
                        style={{ bottom: '100%', marginBottom: '8px' }}
                      >
                        {!showDeleteConfirm ? (
                          <div className="p-2">
                            <button
                              onClick={() => {
                                setShowDeleteConfirm(true);
                              }}
                              className="w-full flex items-center gap-2 px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 rounded-lg transition"
                            >
                              <Trash2 className="w-4 h-4" />
                              Delete Lead
                            </button>
                          </div>
                        ) : (
                          <div className="p-3">
                            <p className="text-xs font-semibold text-gray-700 mb-3">Confirm deletion?</p>
                            <div className="space-y-2">
                              <button
                                onClick={handleDelete}
                                disabled={saving}
                                className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-semibold text-xs py-2 rounded transition"
                              >
                                {saving ? 'Deleting...' : 'Yes, Delete'}
                              </button>
                              <button
                                onClick={() => {
                                  setShowDeleteConfirm(false);
                                  setShowMoreMenu(false);
                                }}
                                disabled={saving}
                                className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium text-xs py-2 rounded transition"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              )}
              
              <button
                onClick={onClose}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-4 text-sm rounded-lg transition"
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
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 text-sm rounded-lg transition disabled:bg-gray-400 shadow-sm"
                >
                  {saving ? 'Saving...' : 'Save Note'}
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}