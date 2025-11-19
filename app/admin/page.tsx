'use client';

import { useState, useEffect } from 'react';

type Company = {
  id: number;
  name: string;
  slug: string;
  email: string;
  phone: string;
  created_at: string;
};

export default function AdminPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    email: '',
    phone: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    try {
      const response = await fetch('/api/admin/companies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(`${formData.name} created successfully!`);
        setShowAddForm(false);
        setFormData({ name: '', slug: '', email: '', phone: '', password: '' });
        fetchCompanies();
        
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.error || 'Failed to create company');
      }
    } catch (error) {
      console.error('Error adding company:', error);
      setError('An error occurred. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold gradient-text">Admin Dashboard</h1>
          <a href="/" className="text-gray-600 hover:text-gray-900">← Home</a>
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
          <h2 className="text-3xl font-bold">Companies</h2>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="btn btn-primary"
          >
            {showAddForm ? 'Cancel' : '+ Add Company'}
          </button>
        </div>

        {showAddForm && (
          <form onSubmit={handleSubmit} className="card mb-8">
            <h3 className="text-xl font-bold mb-4">Add New Company</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="form-label">Company Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="form-input"
                  placeholder="LEX Construction"
                />
              </div>
              <div>
                <label className="form-label">Slug (URL) *</label>
                <input
                  type="text"
                  required
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
                  className="form-input"
                  placeholder="lex"
                />
                <p className="text-xs text-gray-500 mt-1">Will be: savvyhomeupgrade.com/{formData.slug}</p>
              </div>
              <div>
                <label className="form-label">Email *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="form-input"
                  placeholder="contact@lexconstruction.net"
                />
              </div>
              <div>
                <label className="form-label">Phone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="form-input"
                  placeholder="(631) 555-0100"
                />
              </div>
              <div>
                <label className="form-label">Login Password *</label>
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="form-input"
                  placeholder="••••••••"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button type="submit" className="btn btn-primary">Create Company</button>
              <button type="button" onClick={() => setShowAddForm(false)} className="btn btn-secondary">Cancel</button>
            </div>
          </form>
        )}

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {companies.filter(c => c.slug !== 'admin').map(company => (
            <div key={company.id} className="card">
              <h3 className="text-xl font-bold mb-2">{company.name}</h3>
              <p className="text-gray-600 text-sm mb-4">/{company.slug}</p>
              <div className="space-y-2 text-sm">
                <p className="flex items-center gap-2">
                  <span>📧</span> {company.email}
                </p>
                {company.phone && (
                  <p className="flex items-center gap-2">
                    <span>📱</span> {company.phone}
                  </p>
                )}
              </div>
              <div className="flex gap-2 mt-4">
                <a href={`/${company.slug}`} target="_blank" className="text-blue-600 text-sm hover:underline">
                  View Form →
                </a>
                <a href={`/${company.slug}/dashboard`} className="text-purple-600 text-sm hover:underline">
                  Dashboard →
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
