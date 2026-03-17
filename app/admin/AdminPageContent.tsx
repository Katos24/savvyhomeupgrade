'use client';

import { useState, useEffect } from 'react';
import { CATEGORY_MAP, type Category } from '@/lib/formCategories';

type Company = {
  id: number;
  name: string;
  slug: string;
  email: string;
  phone: string;
  business_type?: string;
  logo_url?: string;
  status_options?: StatusOption[];
  form_categories?: Category[];
  created_at: string;
  lead_count?: number;
  last_lead_at?: string;
};

type StatusOption = {
  value: string;
  label: string;
  color: string;
  emoji: string;
};

const DEFAULT_STATUSES: StatusOption[] = [
  { value: 'new', label: 'New', color: 'blue', emoji: '🆕' },
  { value: 'contacted', label: 'Contacted', color: 'yellow', emoji: '📞' },
  { value: 'quoted', label: 'Quoted', color: 'purple', emoji: '💰' },
  { value: 'in-progress', label: 'In Progress', color: 'orange', emoji: '🔨' },
  { value: 'completed', label: 'Completed', color: 'green', emoji: '✅' },
];

const COLOR_OPTIONS = [
  { value: 'blue', label: 'Blue', class: 'bg-blue-500' },
  { value: 'yellow', label: 'Yellow', class: 'bg-yellow-500' },
  { value: 'purple', label: 'Purple', class: 'bg-purple-500' },
  { value: 'orange', label: 'Orange', class: 'bg-orange-500' },
  { value: 'green', label: 'Green', class: 'bg-green-500' },
  { value: 'red', label: 'Red', class: 'bg-red-500' },
  { value: 'gray', label: 'Gray', class: 'bg-gray-500' },
  { value: 'indigo', label: 'Indigo', class: 'bg-indigo-500' },
  { value: 'pink', label: 'Pink', class: 'bg-pink-500' },
];

const BUSINESS_TYPES = [
  { value: 'general', label: 'General Services', emoji: '📋' },
  { value: 'home_services', label: 'Home Services', emoji: '🏠' },
  { value: 'construction', label: 'Construction', emoji: '🏗️' },
  { value: 'auto_services', label: 'Auto Services', emoji: '🚗' },
  { value: 'beauty_services', label: 'Beauty Services', emoji: '💇' },
  { value: 'pet_services', label: 'Pet Services', emoji: '🐕' },
  { value: 'video_production', label: 'Video Production', emoji: '🎥' },
  { value: 'legal_services', label: 'Legal Services', emoji: '⚖️' },
  { value: 'medical_services', label: 'Medical Services', emoji: '🏥' },
  { value: 'fitness_services', label: 'Fitness & Wellness', emoji: '💪' },
  { value: 'cleaning_services', label: 'Cleaning Services', emoji: '🧹' },
  { value: 'event_services', label: 'Event Services', emoji: '🎉' },
  { value: 'tech_services', label: 'Tech Services', emoji: '💻' },
  { value: 'real_estate', label: 'Real Estate', emoji: '🏘️' },
  { value: 'education_services', label: 'Education & Tutoring', emoji: '📚' },
  { value: 'food_services', label: 'Food Services', emoji: '🍽️' },
  { value: 'hvac', label: 'HVAC', emoji: '❄️' },
];

const STATUS_COLOR_CLASS: Record<string, string> = {
  blue: 'bg-blue-500',
  yellow: 'bg-yellow-500',
  purple: 'bg-purple-500',
  orange: 'bg-orange-500',
  green: 'bg-green-500',
  red: 'bg-red-500',
  gray: 'bg-gray-500',
  indigo: 'bg-indigo-500',
  pink: 'bg-pink-500',
};

const formatPhoneInput = (value: string) => {
  const cleaned = value.replace(/\D/g, '').slice(0, 10);

  const len = cleaned.length;
  if (len < 4) return cleaned;
  if (len < 7) return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3)}`;
  return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
};

// Add this function right after STATUS_COLOR_CLASS:
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



export default function AdminPageContent({ onLogout }: { onLogout?: () => void }) {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    email: '',
    phone: '',
    password: '',
    business_type: 'general',
    logo_url: ''
  });
  const [statusOptions, setStatusOptions] = useState<StatusOption[]>(DEFAULT_STATUSES);
  const [showAddStatus, setShowAddStatus] = useState(false);
  const [newStatus, setNewStatus] = useState({ label: '', color: 'blue', emoji: '📌' });
  
  // Form Categories State
  const [formCategories, setFormCategories] = useState<Category[]>([]);
  const [useDefaultCategories, setUseDefaultCategories] = useState(true);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategory, setNewCategory] = useState({ label: '', emoji: '📋' });
  
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [uploadingLogo, setUploadingLogo] = useState(false);

  useEffect(() => {
    fetchCompanies();
  }, []);

  // Load default categories when business type changes
  useEffect(() => {
    if (useDefaultCategories && formData.business_type) {
      const defaultCats = CATEGORY_MAP[formData.business_type] || CATEGORY_MAP.general;
      setFormCategories(defaultCats);
    }
  }, [formData.business_type, useDefaultCategories]);

  const fetchCompanies = async () => {
    try {
      const response = await fetch('/api/admin/companies');
      const data = await response.json();
      setCompanies(data.companies || []);
    } catch (error) {
      console.error('Error fetching companies:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setLogoFile(file);
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadLogo = async (slug: string) => {
    if (!logoFile) return null;

    setUploadingLogo(true);
    try {
      const formData = new FormData();
      formData.append('logo', logoFile);
      formData.append('companySlug', slug);

      const response = await fetch('/api/upload-logo', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      if (result.success) {
        return result.logoUrl;
      }
      return null;
    } catch (error) {
      console.error('Logo upload error:', error);
      return null;
    } finally {
      setUploadingLogo(false);
    }
  };

  const removeStatus = (index: number) => {
    setStatusOptions(statusOptions.filter((_, i) => i !== index));
  };

  const addCustomStatus = () => {
    if (!newStatus.label.trim()) {
      alert('Please enter a status label');
      return;
    }

    if (statusOptions.length >= 5) {
      alert('Maximum 5 statuses allowed');
      return;
    }

    const value = newStatus.label.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    setStatusOptions([...statusOptions, { ...newStatus, value }]);
    setNewStatus({ label: '', color: 'blue', emoji: '📌' });
    setShowAddStatus(false);
  };

  // Form Categories Functions
  const removeCategory = (index: number) => {
    setFormCategories(formCategories.filter((_, i) => i !== index));
    setUseDefaultCategories(false);
  };

  const addCustomCategory = () => {
    if (!newCategory.label.trim()) {
      alert('Please enter a category label');
      return;
    }

    if (formCategories.length >= 20) {
      alert('Maximum 20 categories allowed');
      return;
    }

    // Keep label as-is (human readable), slugify only the value
    const value = newCategory.label.toLowerCase().replace(/[^a-z0-9]+/g, '_');
    setFormCategories([...formCategories, { 
      value, 
      label: newCategory.label.trim(), // Keep original label formatting
      emoji: newCategory.emoji 
    }]);
    setNewCategory({ label: '', emoji: '📋' });
    setShowAddCategory(false);
    setUseDefaultCategories(false);
  };

  const restoreDefaultCategories = () => {
    const defaultCats = CATEGORY_MAP[formData.business_type] || CATEGORY_MAP.general;
    setFormCategories(defaultCats);
    setUseDefaultCategories(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (statusOptions.length < 2) {
      setError('Please have at least 2 statuses');
      return;
    }

    if (statusOptions.length > 5) {
      setError('Maximum 5 statuses allowed');
      return;
    }

    if (formCategories.length < 3) {
      setError('Please have at least 3 service categories');
      return;
    }

    if (formCategories.length > 20) {
      setError('Maximum 20 categories allowed');
      return;
    }

    try {
      // Upload logo first if provided
      let logoUrl = formData.logo_url;
      if (logoFile) {
        const uploadedUrl = await uploadLogo(formData.slug);
        if (uploadedUrl) {
          logoUrl = uploadedUrl;
        }
      }

      const response = await fetch('/api/admin/companies', {
        method: editingCompany ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          logo_url: logoUrl,
          status_options: statusOptions,
          form_categories: useDefaultCategories ? null : formCategories, // null = use defaults
          id: editingCompany?.id
        })
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(`${formData.name} ${editingCompany ? 'updated' : 'created'} successfully!`);
        setShowAddForm(false);
        setEditingCompany(null);
        setFormData({ name: '', slug: '', email: '', phone: '', password: '', business_type: 'general', logo_url: '' });
        setStatusOptions(DEFAULT_STATUSES);
        setFormCategories([]);
        setUseDefaultCategories(true);
        setLogoFile(null);
        setLogoPreview('');
        fetchCompanies();
        
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.error || `Failed to ${editingCompany ? 'update' : 'create'} company`);
      }
    } catch (error) {
      console.error('Error:', error);
      setError('An error occurred. Please try again.');
    }
  };

  const handleEdit = (company: Company) => {
    setEditingCompany(company);
    setFormData({
      name: company.name,
      slug: company.slug,
      email: company.email,
      phone: company.phone || '',
      password: '',
      business_type: company.business_type || 'general',
      logo_url: company.logo_url || ''
    });
    setStatusOptions(company.status_options || DEFAULT_STATUSES);
    
    // Set form categories
    if (company.form_categories && company.form_categories.length > 0) {
      setFormCategories(company.form_categories);
      setUseDefaultCategories(false);
    } else {
      const defaultCats = CATEGORY_MAP[company.business_type || 'general'] || CATEGORY_MAP.general;
      setFormCategories(defaultCats);
      setUseDefaultCategories(true);
    }
    
    setLogoPreview(company.logo_url || '');
    setShowAddForm(true);
  };

  const handleDelete = async (company: Company) => {
    if (!confirm(`Delete ${company.name}? This will also delete all their leads.`)) {
      return;
    }

    try {
      const response = await fetch('/api/admin/companies', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: company.id })
      });

      if (response.ok) {
        setSuccess(`${company.name} deleted successfully!`);
        fetchCompanies();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError('Failed to delete company');
      }
    } catch (error) {
      setError('An error occurred. Please try again.');
    }
  };

  const cancelEdit = () => {
    setEditingCompany(null);
    setShowAddForm(false);
    setFormData({ name: '', slug: '', email: '', phone: '', password: '', business_type: 'general', logo_url: '' });
    setStatusOptions(DEFAULT_STATUSES);
    setFormCategories([]);
    setUseDefaultCategories(true);
    setLogoFile(null);
    setLogoPreview('');
    setShowAddStatus(false);
    setShowAddCategory(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold gradient-text">Admin Dashboard</h1>
        <div className="flex gap-4 items-center">
  <button onClick={onLogout} className="text-red-600 hover:underline text-sm font-semibold">
    🚪 Logout
  </button>
  <a href="/admin/upload-logo" className="text-blue-600 hover:underline text-sm">
    Upload Logos
  </a>
  <a href="/" className="text-gray-600 hover:text-gray-900">← Home</a>
</div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
            ✓ {success}
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            ✗ {error}
          </div>
        )}

        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold">Companies</h2>
            <p className="text-gray-600 mt-1">{companies.length} total companies</p>
          </div>
          <button
            onClick={() => {
              if (showAddForm) {
                cancelEdit();
              } else {
                setShowAddForm(true);
              }
            }}
            className="btn btn-primary"
          >
            {showAddForm ? 'Cancel' : '+ Add Company'}
          </button>
        </div>

        {showAddForm && (
          <form onSubmit={handleSubmit} className="card mb-8">
            <h3 className="text-xl font-bold mb-4">
              {editingCompany ? `Edit ${editingCompany.name}` : 'Add New Company'}
            </h3>
            
            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="form-label">Company Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="form-input"
                  placeholder="Long Island Cooling & Heating"
                />
              </div>

              <div>
                <label className="form-label">Slug (URL) *</label>
                <input
                  type="text"
                  required
                  disabled={!!editingCompany}
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
                  className="form-input disabled:bg-gray-100"
                  placeholder="li-hvac"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {editingCompany ? 'Slug cannot be changed' : `Will be: yourdomain.com/${formData.slug}`}
                </p>
              </div>

              <div>
                <label className="form-label">Business Type *</label>
                <select
                  value={formData.business_type}
                  onChange={(e) => setFormData({ ...formData, business_type: e.target.value })}
                  className="form-input"
                >
                  {BUSINESS_TYPES.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.emoji} {type.label}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Determines default service categories for the form
                </p>
              </div>

              <div>
                <label className="form-label">Email *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="form-input"
                  placeholder="service@licooling.com"
                />
              </div>
<div>
  <label className="form-label">Phone</label>
  <input
    type="tel"
    value={formData.phone}
    onChange={(e) =>
      setFormData({
        ...formData,
        phone: formatPhoneInput(e.target.value)
      })
    }
    className="form-input"
    placeholder="(631) 555-1234"
  />
</div>

              <div>
                <label className="form-label">
                  {editingCompany ? 'New Password (leave blank to keep current)' : 'Login Password *'}
                </label>
                <input
                  type="password"
                  required={!editingCompany}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="form-input"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="mb-6">
              <label className="form-label">Logo</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoChange}
                className="form-input"
              />
              <p className="text-xs text-gray-500 mt-1">
                PNG, JPG, or SVG. Recommended size: 200x80px
              </p>
              
              {logoPreview && (
                <div className="mt-3 p-4 bg-gray-50 rounded-lg border">
                  <p className="text-sm font-medium mb-2">Logo Preview:</p>
                  <img src={logoPreview} alt="Logo preview" className="h-16 object-contain" />
                </div>
              )}
            </div>

            {/* STATUS OPTIONS SECTION */}
            <div className="mb-6 p-6 bg-blue-50 rounded-lg border-2 border-blue-200">
              <h4 className="text-lg font-bold mb-2">Lead Statuses (Max 5)</h4>
              <p className="text-sm text-gray-600 mb-4">
                Customize the workflow statuses for this company. Remove defaults or add custom ones.
              </p>

              <div className="space-y-2 mb-4">
                {statusOptions.map((status, index) => (
                  <div key={index} className="flex items-center gap-3 bg-white p-3 rounded-lg border">
                    <span className="text-2xl">{status.emoji}</span>
                <span
  className="px-3 py-1 rounded-full text-sm font-semibold text-white"
  style={{ backgroundColor: getStatusColor(status.color) }}
>

  {status.label}
</span>

                    <button
                      type="button"
                      onClick={() => removeStatus(index)}
                      className="ml-auto text-red-600 hover:text-red-800 font-bold text-lg"
                      title="Remove this status"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>

              {statusOptions.length < 5 && !showAddStatus && (
                <button
                  type="button"
                  onClick={() => setShowAddStatus(true)}
                  className="w-full py-2 border-2 border-dashed border-blue-300 rounded-lg text-blue-600 hover:bg-blue-50 font-semibold"
                >
                  + Add Custom Status
                </button>
              )}

              {showAddStatus && (
                <div className="bg-white p-4 rounded-lg border-2 border-blue-300">
                  <h5 className="font-bold mb-3">Add Custom Status</h5>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium mb-1">Status Label *</label>
                      <input
                        type="text"
                        value={newStatus.label}
                        onChange={(e) => setNewStatus({ ...newStatus, label: e.target.value })}
                        placeholder="e.g., Waiting for Approval"
                        className="form-input"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Color</label>
                      <div className="grid grid-cols-5 gap-2">
                        {COLOR_OPTIONS.map(color => (
                          <button
                            key={color.value}
                            type="button"
                            onClick={() => setNewStatus({ ...newStatus, color: color.value })}
                            className={`h-10 rounded-lg ${color.class} ${newStatus.color === color.value ? 'ring-4 ring-offset-2 ring-blue-500' : ''}`}
                            title={color.label}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <button
                        type="button"
                        onClick={addCustomStatus}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-semibold"
                      >
                        Add Status
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowAddStatus(false);
                          setNewStatus({ label: '', color: 'blue', emoji: '📌' });
                        }}
                        className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded-lg font-semibold"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <p className="text-xs text-gray-500 mt-3">
                {statusOptions.length} of 5 statuses used
              </p>
            </div>

            {/* FORM CATEGORIES SECTION */}
            <div className="mb-6 p-6 bg-purple-50 rounded-lg border-2 border-purple-200">
              <div className="flex justify-between items-center mb-2">
                <h4 className="text-lg font-bold">Service Categories (3-20)</h4>
                {!useDefaultCategories && (
                  <button
                    type="button"
                    onClick={restoreDefaultCategories}
                    className="text-sm text-purple-600 hover:text-purple-800 font-semibold"
                  >
                    ↻ Restore Defaults
                  </button>
                )}
              </div>
              <p className="text-sm text-gray-600 mb-4">
                {useDefaultCategories 
                  ? `Using default categories for ${BUSINESS_TYPES.find(t => t.value === formData.business_type)?.label}. Customize below if needed.`
                  : 'Using custom categories. Click "Restore Defaults" to reset.'}
              </p>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-4">
                {formCategories.map((category, index) => (
                  <div key={index} className="flex items-center gap-2 bg-white p-2 rounded-lg border group">
                    <span className="text-xl">{category.emoji}</span>
                    <span className="text-sm font-medium flex-1 truncate">{category.label}</span>
                    <button
                      type="button"
                      onClick={() => removeCategory(index)}
                      className="opacity-0 group-hover:opacity-100 text-red-600 hover:text-red-800 font-bold text-sm transition-opacity"
                      title="Remove"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>

              {formCategories.length < 20 && !showAddCategory && (
                <button
                  type="button"
                  onClick={() => setShowAddCategory(true)}
                  className="w-full py-2 border-2 border-dashed border-purple-300 rounded-lg text-purple-600 hover:bg-purple-50 font-semibold"
                >
                  + Add Custom Category
                </button>
              )}

              {showAddCategory && (
                <div className="bg-white p-4 rounded-lg border-2 border-purple-300">
                  <h5 className="font-bold mb-3">Add Custom Category</h5>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium mb-1">Category Label *</label>
                      <input
                        type="text"
                        value={newCategory.label}
                        onChange={(e) => setNewCategory({ ...newCategory, label: e.target.value })}
                        placeholder="e.g., Emergency Repair"
                        className="form-input"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Emoji</label>
                      <input
                        type="text"
                        value={newCategory.emoji}
                        onChange={(e) => setNewCategory({ ...newCategory, emoji: e.target.value })}
                        placeholder="📋"
                        className="form-input"
                        maxLength={2}
                      />
                    </div>
                    <div className="flex gap-2 pt-2">
                      <button
                        type="button"
                        onClick={addCustomCategory}
                        className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg font-semibold"
                      >
                        Add Category
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowAddCategory(false);
                          setNewCategory({ label: '', emoji: '📋' });
                        }}
                        className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded-lg font-semibold"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <p className="text-xs text-gray-500 mt-3">
                {formCategories.length} categories • Min: 3, Max: 20
              </p>
            </div>

            <div className="flex gap-3">
              <button 
                type="submit" 
                disabled={uploadingLogo}
                className="btn btn-primary disabled:opacity-50"
              >
                {uploadingLogo ? 'Uploading...' : editingCompany ? 'Update Company' : 'Create Company'}
              </button>
              <button 
                type="button" 
                onClick={cancelEdit} 
                className="btn btn-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {companies.filter(c => c.slug !== 'admin').map(company => {
            const businessType = BUSINESS_TYPES.find(t => t.value === company.business_type);
            
            return (
              <div key={company.id} className="card relative">
                {/* Logo */}
                {company.logo_url ? (
                  <img 
                    src={company.logo_url} 
                    alt={`${company.name} logo`}
                    className="h-12 w-auto object-contain mb-3"
                  />
                ) : (
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center text-white font-bold text-xl mb-3">
                    {company.name.charAt(0)}
                  </div>
                )}

                <h3 className="text-xl font-bold mb-1">{company.name}</h3>
                <p className="text-gray-600 text-sm mb-2">/{company.slug}</p>
                
                {businessType && (
                  <span className="inline-block bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-medium mb-3">
                    {businessType.emoji} {businessType.label}
                  </span>
                )}

                {/* Show custom statuses if available */}
                {company.status_options && company.status_options.length > 0 && (
                  <div className="mb-3">
                    <p className="text-xs font-semibold text-gray-500 mb-1">Lead Statuses:</p>
                    <div className="flex flex-wrap gap-1">
                      {company.status_options.map((status, idx) => (
                        <span key={idx} className="text-xs px-2 py-0.5 bg-gray-100 rounded">
                          {status.emoji} {status.label}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Show if using custom categories */}
                {company.form_categories && company.form_categories.length > 0 && (
                  <div className="mb-3">
                    <p className="text-xs font-semibold text-gray-500 mb-1">
                      Custom Categories ({company.form_categories.length})
                    </p>
                  </div>
                )}

                <div className="space-y-2 text-sm mb-4">
                  <p className="flex items-center gap-2">
                    <span>📧</span> {company.email}
                  </p>
                  {company.phone && (
                    <p className="flex items-center gap-2">
                      <span>📱</span> {company.phone}
                    </p>
                  )}
                  
                  {/* Stats */}
                  <div className="pt-3 mt-3 border-t border-gray-100">
                    <p className="flex items-center gap-2 text-gray-600">
                      <span>📊</span> {company.lead_count || 0} leads
                    </p>
                    {company.last_lead_at && (
                      <p className="flex items-center gap-2 text-gray-600 text-xs">
                        <span>🕐</span> Last: {new Date(company.last_lead_at).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 flex-wrap">
                  <a 
                    href={`/${company.slug}`} 
                    target="_blank" 
                    className="text-blue-600 text-sm hover:underline"
                  >
                    View Form →
                  </a>
                  <a 
                    href={`/${company.slug}/dashboard`} 
                    className="text-purple-600 text-sm hover:underline"
                  >
                    Dashboard →
                  </a>
                </div>

                {/* Edit/Delete Buttons */}
                <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
                  <button
                    onClick={() => handleEdit(company)}
                    className="flex-1 text-sm bg-blue-50 hover:bg-blue-100 text-blue-700 py-2 px-3 rounded font-medium transition"
                  >
                    ✏️ Edit
                  </button>
                  <button
                    onClick={() => handleDelete(company)}
                    className="flex-1 text-sm bg-red-50 hover:bg-red-100 text-red-700 py-2 px-3 rounded font-medium transition"
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {companies.filter(c => c.slug !== 'admin').length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg mb-4">No companies yet</p>
            <button
              onClick={() => setShowAddForm(true)}
              className="btn btn-primary"
            >
              + Add Your First Company
            </button>
          </div>
        )}
      </div>
    </div>
  );
}