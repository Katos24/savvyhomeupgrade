'use client';

import { useState, useEffect } from 'react';

type Company = {
  id: number;
  name: string;
  slug: string;
  email: string;
  phone: string;
  business_type?: string;
  logo_url?: string;
  created_at: string;
  lead_count?: number;
  last_lead_at?: string;
};

const BUSINESS_TYPES = [
  { value: 'general', label: 'General Services', emoji: '📋' },
  { value: 'home_services', label: 'Home Services', emoji: '🏠' },
  { value: 'construction', label: 'Construction', emoji: '🏗️' },
  { value: 'hvac', label: 'HVAC', emoji: '❄️' },
  { value: 'auto_services', label: 'Auto Services', emoji: '🚗' },
  { value: 'beauty_services', label: 'Beauty Services', emoji: '💇' },
  { value: 'pet_services', label: 'Pet Services', emoji: '🐕' },
  { value: 'video_production', label: 'Video Production', emoji: '🎥' },
];

export default function AdminPage() {
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
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [uploadingLogo, setUploadingLogo] = useState(false);

  useEffect(() => {
    fetchCompanies();
  }, []);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
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
          id: editingCompany?.id
        })
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(`${formData.name} ${editingCompany ? 'updated' : 'created'} successfully!`);
        setShowAddForm(false);
        setEditingCompany(null);
        setFormData({ name: '', slug: '', email: '', phone: '', password: '', business_type: 'general', logo_url: '' });
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
    setLogoFile(null);
    setLogoPreview('');
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
                  Determines which service categories show on the form
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
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
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