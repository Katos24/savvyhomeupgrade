'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { 
  Mail, 
  Phone, 
  MessageSquare, 
  MapPin,
  Navigation,
  X,
  Calendar,
  Tag,
  Edit2,
  Save,
  MoreVertical,
  Trash2,
  FileText,
  ChevronDown
} from 'lucide-react';
import ProjectSection from '@/components/dashboard/ProjectSection';
import PhotoGallery from '@/components/dashboard/PhotoGallery';
import ConvertToProjectButton from '@/components/dashboard/ConvertToProjectButton';
import { parseNotes } from '@/lib/utils';
import { canDeleteLead } from '@/lib/permissions';

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
companySlug: string;};

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
  company,
    companySlug

}: LeadModalProps) {
  const [saving, setSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showClientActions, setShowClientActions] = useState(false);
  const [showCustomQuestions, setShowCustomQuestions] = useState(false);
  const [showActivityLog, setShowActivityLog] = useState(false);
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [internalNotesText, setInternalNotesText] = useState(lead.project_internal_notes || '');
  const [selectedCategory, setSelectedCategory] = useState(lead.category || '');
  const [isUpdatingCategory, setIsUpdatingCategory] = useState(false);
  const [showCategoryConfirm, setShowCategoryConfirm] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(lead.status || statusOptions[0]?.value);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [newNote, setNewNote] = useState('');
  
  // Edit mode
  const [isEditingDetails, setIsEditingDetails] = useState(false);
  const [editedDetails, setEditedDetails] = useState({
    name: lead.name || '',
    email: lead.email || '',
    phone: lead.phone || '',
    address_line_1: lead.address_line_1 || '',
    address_line_2: lead.address_line_2 || '',
    city: lead.city || '',
  });
  
  const notesArray = parseNotes(lead.notes);
  const isProject = !!lead.project_id;
  const userRole = currentUser?.role || 'member';
  const canDelete = canDeleteLead(userRole);
  
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
  
  useEffect(() => {
    setHasUnsavedChanges(newNote.trim().length > 0);
  }, [newNote]);
  
  const getStatusConfig = (statusValue: string) => {
    return statusOptions.find((s: any) => s.value === statusValue) || statusOptions[0];
  };

  const currentStatusConfig = getStatusConfig(lead.status || statusOptions[0].value);

  const formatPhoneNumber = (value: string): string => {
    const phoneNumber = value.replace(/\D/g, '');
    const limitedNumber = phoneNumber.slice(0, 10);
    
    if (limitedNumber.length === 0) return '';
    if (limitedNumber.length <= 3) return `(${limitedNumber}`;
    if (limitedNumber.length <= 6) return `(${limitedNumber.slice(0, 3)}) ${limitedNumber.slice(3)}`;
    return `(${limitedNumber.slice(0, 3)}) ${limitedNumber.slice(3, 6)}-${limitedNumber.slice(6)}`;
  };

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
    const city = isEditingDetails ? editedDetails.city : lead.city;
    return `${addr}${line2 ? ', ' + line2 : ''}${city ? ', ' + city : ''}`;
  };

  const handleCategoryChange = async () => {
    setIsUpdatingCategory(true);
    try {
      const response = await fetch('/api/leads/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: lead.id,
          action: 'update_details',
          name: lead.name,
          email: lead.email,
          phone: lead.phone,
          address_line_1: lead.address_line_1,
          address_line_2: lead.address_line_2,
          city: lead.city,
          description: lead.description,
          category: selectedCategory,
          user_name: currentUser?.name || currentUser?.email,
          user_email: currentUser?.email,
        }),
      });

      if (response.ok) {
        toast.success('Category updated!');
        setShowCategoryConfirm(false);
        await onRefresh();
      } else {
        toast.error('Failed to update category');
        setSelectedCategory(lead.category || '');
      }
    } catch (error) {
      console.error('Category update error:', error);
      toast.error('Failed to update category');
      setSelectedCategory(lead.category || '');
    } finally {
      setIsUpdatingCategory(false);
    }
  };

  const handleStatusChange = async () => {
    const oldStatus = lead.status || statusOptions[0]?.value;
    if (isUpdatingStatus || selectedStatus === oldStatus) return;
    setIsUpdatingStatus(true);
    try {
      const success = await onUpdateStatus(lead.id, selectedStatus, oldStatus);
      if (success) {
        toast.success('Status updated!');
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
      setIsUpdatingStatus(false);
    }
  };

  const handleSaveInternalNotes = async () => {
    if (!lead.project_id) {
      toast.error('Project not found');
      return;
    }

    setSaving(true);
    try {
      const response = await fetch('/api/leads/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: lead.id,
          action: 'update_internal_notes',
          internal_notes: internalNotesText,
          user_name: currentUser?.name || currentUser?.email,
          user_email: currentUser?.email,
        }),
      });

      if (response.ok) {
        toast.success('Notes saved!');
        setIsEditingNotes(false);
        await onRefresh();
      } else {
        toast.error('Failed to save notes');
      }
    } catch (error) {
      console.error('Save notes error:', error);
      toast.error('Failed to save notes');
    } finally {
      setSaving(false);
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
          category: lead.category,
          description: lead.description,
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

  const customerPhotos = Array.isArray(lead.file_urls) ? lead.file_urls : [];
  const fullAddress = getFullAddress();

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
        <div className="sticky top-0 bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-200 p-4 z-10 sm:rounded-t-xl">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 mb-1">{lead.name}</h2>
              {isProject && (
                <p className="text-sm text-gray-500">Project ID: #{lead.project_number}</p>
              )}
            </div>
            <button 
              onClick={onClose} 
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          {/* Status Dropdown */}
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-gray-700">Status:</span>
            <div className="relative">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="appearance-none px-4 py-2 pr-8 border border-gray-300 rounded-lg text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                style={{
                  backgroundColor: `${getStatusColor(getStatusConfig(selectedStatus).color)}20`,
                  color: getStatusColor(getStatusConfig(selectedStatus).color),
                  borderColor: getStatusColor(getStatusConfig(selectedStatus).color)
                }}
              >
                {statusOptions.map((option: any) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" 
                style={{ color: getStatusColor(getStatusConfig(selectedStatus).color) }}
              />
            </div>
            {selectedStatus !== lead.status && (
              <button
                onClick={handleStatusChange}
                disabled={isUpdatingStatus}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white text-sm font-semibold rounded-lg transition"
              >
                {isUpdatingStatus ? 'Saving...' : 'Save'}
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          
          {/* Client Card */}
          <div className="bg-gray-50 rounded-xl border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wide">Client</h3>
              <div className="relative">
                <button
                  onClick={() => setShowClientActions(!showClientActions)}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition"
                >
                  Actions ▼
                </button>
                
                {showClientActions && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowClientActions(false)} />
                    <div className="absolute right-0 top-full mt-2 bg-white rounded-lg shadow-xl border border-gray-200 z-50 w-48 py-1">
                      <button
                        onClick={() => {
                          window.location.href = `mailto:${lead.email}`;
                          setShowClientActions(false);
                        }}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 transition"
                      >
                        <Mail className="w-4 h-4 text-blue-600" />
                        Email
                      </button>
                      <button
                        onClick={() => {
                          window.location.href = `tel:${lead.phone}`;
                          setShowClientActions(false);
                        }}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-green-50 transition"
                      >
                        <Phone className="w-4 h-4 text-green-600" />
                        Call
                      </button>
                      <button
                        onClick={() => {
                          const message = encodeURIComponent(`Hi ${lead.name}, I reviewed your project.`);
                          window.location.href = `sms:${lead.phone}?body=${message}`;
                          setShowClientActions(false);
                        }}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-purple-50 transition"
                      >
                        <MessageSquare className="w-4 h-4 text-purple-600" />
                        Text
                      </button>
                      {fullAddress && (
                        <button
                          onClick={() => {
                            window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}`, '_blank');
                            setShowClientActions(false);
                          }}
                          className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-red-50 transition"
                        >
                          <Navigation className="w-4 h-4 text-red-600" />
                          Directions
                        </button>
                      )}
                      <div className="border-t border-gray-200 my-1"></div>
                      <button
                        onClick={() => {
                          setIsEditingDetails(true);
                          setShowClientActions(false);
                        }}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition"
                      >
                        <Edit2 className="w-4 h-4 text-gray-600" />
                        Edit Details
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
            
            {isEditingDetails ? (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-gray-600 mb-1 block">NAME</label>
                    <input
                      type="text"
                      value={editedDetails.name}
                      onChange={(e) => setEditedDetails({ ...editedDetails, name: e.target.value })}
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
                  <label className="text-xs font-semibold text-gray-600 mb-1 block">ADDRESS</label>
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
                    <label className="text-xs font-semibold text-gray-600 mb-1 block">APT/SUITE</label>
                    <input
                      type="text"
                      value={editedDetails.address_line_2}
                      onChange={(e) => setEditedDetails({ ...editedDetails, address_line_2: e.target.value })}
                      className="w-full px-3 py-2 border-2 border-blue-300 rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-600 mb-1 block">CITY</label>
                    <input
                      type="text"
                      value={editedDetails.city}
                      onChange={(e) => setEditedDetails({ ...editedDetails, city: e.target.value })}
                      className="w-full px-3 py-2 border-2 border-blue-300 rounded-lg text-sm"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleSaveDetails}
                    disabled={saving}
                    className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-2 rounded-lg transition text-sm"
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button
                    onClick={() => {
                      setEditedDetails({
                        name: lead.name || '',
                        email: lead.email || '',
                        phone: lead.phone || '',
                        address_line_1: lead.address_line_1 || '',
                        address_line_2: lead.address_line_2 || '',
                        city: lead.city || '',
                      });
                      setIsEditingDetails(false);
                    }}
                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 rounded-lg transition text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-4 text-xs">
                <div>
                  <div className="text-gray-600 mb-1">Name</div>
                  <div className="text-gray-900 font-semibold">{lead.name}</div>
                </div>
                <div>
                  <div className="text-gray-600 mb-1">Email</div>
                  <div className="text-gray-900 font-semibold">{lead.email}</div>
                </div>
                <div>
                  <div className="text-gray-600 mb-1">Phone</div>
                  <div className="text-gray-900 font-semibold">{formatPhoneNumber(lead.phone)}</div>
                </div>
                {lead.address_line_1 && (
                  <div className="col-span-3">
                    <div className="text-gray-600 mb-1">Address</div>
                    <div className="text-gray-900 font-semibold">{fullAddress}</div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Customer Message Card */}
          <div className="bg-gray-50 rounded-xl border border-gray-200 p-4">
            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wide mb-2">Customer's Message</h3>
            {lead.description ? (
              <p className="text-sm text-gray-700 leading-relaxed mb-3">{lead.description}</p>
            ) : (
              <p className="text-sm text-gray-400 italic mb-3">No message provided</p>
            )}

            {/* Expandable Q&A */}
            {lead.custom_answers && Object.keys(lead.custom_answers).length > 0 && (
              <div className="pt-3 border-t border-gray-300">
                <button
                  onClick={() => setShowCustomQuestions(!showCustomQuestions)}
                  className="text-sm text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1"
                >
                  <span className="text-xs">{showCustomQuestions ? '▼' : '▶'}</span>
                  Additional Questions ({Object.keys(lead.custom_answers).length})
                </button>
                
                {showCustomQuestions && (
                  <div className="mt-3 space-y-2">
                    {(() => {
                      const companyQuestions = company?.custom_questions || [];
                      
                      return Object.entries(lead.custom_answers).map(([questionId, answer]: [string, any]) => {
                        const questionDef = companyQuestions.find((q: any) => q.id === questionId);
                        const questionLabel = questionDef?.label || questionId;
                        
                        return (
                          <div key={questionId} className="text-sm">
                            <div className="text-gray-600 text-xs mb-0.5">{questionLabel}</div>
                            <div className="text-gray-900">
                              {typeof answer === 'boolean' 
                                ? (answer ? 'Yes' : 'No')
                                : answer || <span className="text-gray-400 italic">No answer</span>
                              }
                            </div>
                          </div>
                        );
                      });
                    })()}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Category & Internal Notes - Side by Side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Category Card */}
            <div className="bg-gray-50 rounded-xl border border-gray-200 p-4">
              <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wide mb-2">Category</h3>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                {categories.map((cat: any) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.emoji} {cat.label}
                  </option>
                ))}
              </select>
              {selectedCategory !== lead.category && (
                <button
                  onClick={() => setShowCategoryConfirm(true)}
                  disabled={isUpdatingCategory}
                  className="mt-2 w-full py-1.5 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 text-white text-xs font-semibold rounded-lg transition"
                >
                  {isUpdatingCategory ? 'Saving...' : 'Save Category'}
                </button>
              )}
            </div>

            {/* Internal Notes Card */}
            {isProject && (
              <div className="bg-gray-50 rounded-xl border border-gray-200 p-4">
                <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wide mb-2">Internal Notes</h3>
                {isEditingNotes ? (
                  <div className="space-y-2">
                    <textarea
                      value={internalNotesText}
                      onChange={(e) => setInternalNotesText(e.target.value)}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Add internal notes..."
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={handleSaveInternalNotes}
                        disabled={saving}
                        className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-1.5 rounded-lg transition text-xs"
                      >
                        {saving ? 'Saving...' : 'Save'}
                      </button>
                      <button
                        onClick={() => {
                          setIsEditingNotes(false);
                          setInternalNotesText(lead.project_internal_notes || '');
                        }}
                        className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-1.5 rounded-lg transition text-xs"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : lead.project_internal_notes ? (
                  <div>
                    <p className="text-sm text-gray-700 mb-2 line-clamp-2">{lead.project_internal_notes}</p>
                    <button
                      onClick={() => setIsEditingNotes(true)}
                      className="text-xs text-blue-600 hover:text-blue-700 font-semibold"
                    >
                      Edit Notes
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setIsEditingNotes(true)}
                    className="w-full py-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 hover:bg-gray-100 transition text-center"
                  >
                    <p className="text-xs font-semibold text-gray-600">+ Add Notes</p>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Photos */}
          {customerPhotos.length > 0 && (
            <PhotoGallery 
              title="Customer Photos" 
              photos={customerPhotos}
              emoji="📷"
            />
          )}

          {/* Convert Button */}
          {!isProject && (
            <ConvertToProjectButton 
              lead={lead}
              currentUser={currentUser}
              onRefresh={onRefresh}
            />
          )}

          {/* Project Section */}
          {isProject && (
            <ProjectSection 
              lead={lead}
              currentUser={currentUser}
              onRefresh={onRefresh}
              statusOptions={statusOptions}
              onUpdateStatus={onUpdateStatus}
companySlug={companySlug}
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
                {notesArray.length > 0 && (
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

                {notesArray.length > 0 && (
                  <div className="space-y-2 max-h-80 overflow-y-auto">
                    {[...notesArray].reverse().map((note: any, idx: number) => {
                      const isOldFormat = typeof note === 'string';
                      const noteText = isOldFormat ? note : note.text;
                      const userName = isOldFormat ? 'Unknown' : (note.user_name || 'System');
                      const timestamp = isOldFormat ? lead.created_at : note.timestamp;

                      return (
                        <div key={idx} className="text-sm text-gray-600 p-2 bg-gray-50 rounded">
                          <span className="font-medium text-gray-900">{userName}</span> • {noteText}
                          <span className="text-xs text-gray-400 ml-2">
                            {new Date(timestamp).toLocaleDateString('en-US', {
                              month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'
                            })}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer - Your Original Style */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 flex gap-2 sm:rounded-b-xl">
          {canDelete && (
            <div className="relative">
              <button
                onClick={() => setShowMoreMenu(!showMoreMenu)}
                className="p-3 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition"
              >
                <MoreVertical className="w-5 h-5" />
              </button>
              
              {showMoreMenu && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setShowMoreMenu(false)}
                  />
                  
                  <div 
                    className="absolute left-0 bg-white rounded-lg shadow-2xl border border-gray-200 z-50 w-48"
                    style={{ bottom: '100%', marginBottom: '8px' }}
                  >
                    {!showDeleteConfirm ? (
                      <div className="p-2">
                        <button
                          onClick={() => setShowDeleteConfirm(true)}
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
        </div>

        {/* Category Confirmation */}
        {showCategoryConfirm && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
            <div className="bg-white rounded-xl shadow-2xl p-6 max-w-sm w-full" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Confirm Change</h3>
              <p className="text-sm text-gray-600 mb-4">
                Change category to <span className="font-semibold">{formatCategory(selectedCategory)}</span>?
              </p>
              <div className="flex gap-2">
                <button
                  onClick={handleCategoryChange}
                  disabled={isUpdatingCategory}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white font-semibold py-2.5 rounded-lg transition"
                >
                  {isUpdatingCategory ? 'Saving...' : 'Yes'}
                </button>
                <button
                  onClick={() => {
                    setShowCategoryConfirm(false);
                    setSelectedCategory(lead.category);
                  }}
                  disabled={isUpdatingCategory}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2.5 rounded-lg transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}