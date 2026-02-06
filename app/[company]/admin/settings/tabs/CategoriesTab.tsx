'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Grid, Plus, X, RotateCcw } from 'lucide-react';
import { CATEGORY_MAP } from '@/lib/formCategories';

type Category = {
  value: string;
  label: string;
  emoji?: string;
};

export default function CategoriesTab({ company, currentUser }: { company: any; currentUser: any }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const defaultCategories = CATEGORY_MAP[company.business_type || 'general'] || CATEGORY_MAP.general;
  const [categories, setCategories] = useState<Category[]>(
    company.form_categories && company.form_categories.length > 0 
      ? company.form_categories 
      : defaultCategories
  );
  const [useDefaults, setUseDefaults] = useState(
    !company.form_categories || company.form_categories.length === 0
  );
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCategory, setNewCategory] = useState({ label: '' });

  const handleRemoveCategory = (index: number) => {
    if (categories.length <= 3) {
      setError('You must have at least 3 categories');
      setTimeout(() => setError(''), 3000);
      return;
    }
    setCategories(categories.filter((_, i) => i !== index));
    setUseDefaults(false);
  };

  const handleAddCategory = () => {
    if (!newCategory.label.trim()) {
      setError('Please enter a category label');
      return;
    }

    if (categories.length >= 20) {
      setError('Maximum 20 categories allowed');
      return;
    }

    const value = newCategory.label.toLowerCase().replace(/[^a-z0-9]+/g, '_');
    setCategories([...categories, { 
      value, 
      label: newCategory.label.trim()
    }]);
    setNewCategory({ label: '' });
    setShowAddForm(false);
    setUseDefaults(false);
  };

  const handleRestoreDefaults = () => {
    setCategories(defaultCategories);
    setUseDefaults(true);
  };

  const handleSave = async () => {
    if (categories.length < 3) {
      setError('You must have at least 3 categories');
      return;
    }

    if (categories.length > 20) {
      setError('Maximum 20 categories allowed');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`/api/company/${company.slug}/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update-categories',
          data: {
            form_categories: useDefaults ? null : categories,
          },
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess('Categories saved successfully! Refreshing page...');
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        setError(data.error || 'Failed to save categories');
      }
    } catch (err) {
      console.error('Save error:', err);
      setError('Failed to save categories');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Service Categories</h2>
          <p className="text-slate-600">
            {useDefaults 
              ? `Using default categories for ${company.business_type}. Customize below if needed.`
              : 'Using custom categories.'}
          </p>
        </div>
        {!useDefaults && (
          <button
            onClick={handleRestoreDefaults}
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold transition"
          >
            <RotateCcw className="w-4 h-4" />
            Restore Defaults
          </button>
        )}
      </div>

      {success && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-lg flex items-center gap-2">
          <span className="text-lg">✓</span>
          {success}
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-6">
        
        <div>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-slate-600">
              {categories.length} categories • Min: 3, Max: 20
            </p>
            {categories.length < 20 && (
              <button
                onClick={() => setShowAddForm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition"
              >
                <Plus className="w-4 h-4" />
                Add Category
              </button>
            )}
          </div>

          {/* Add Category Form */}
          {showAddForm && (
            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 mb-4">
              <h4 className="font-bold mb-3 text-slate-900">Add Custom Category</h4>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Category Label *
                  </label>
                  <input
                    type="text"
                    value={newCategory.label}
                    onChange={(e) => setNewCategory({ label: e.target.value })}
                    placeholder="e.g., Emergency Repair"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleAddCategory}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-semibold"
                  >
                    Add Category
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddForm(false);
                      setNewCategory({ label: '' });
                    }}
                    className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-800 py-2 px-4 rounded-lg font-semibold"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Categories Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {categories.map((category, index) => (
              <div 
                key={index} 
                className="flex items-center justify-between gap-2 bg-slate-50 hover:bg-slate-100 p-3 rounded-lg border border-slate-200 group transition"
              >
                <span className="text-sm font-medium text-slate-900 truncate flex-1">
                  {category.label}
                </span>
                <button
                  onClick={() => handleRemoveCategory(index)}
                  className="opacity-0 group-hover:opacity-100 text-red-600 hover:text-red-800 transition-opacity"
                  title="Remove category"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-900">
            <strong>Note:</strong> These categories appear on your public booking form. 
            Customers select one when submitting a lead.
          </p>
        </div>

        {/* Save Button */}
        <div className="pt-4 border-t border-slate-200">
          <button
            onClick={handleSave}
            disabled={loading}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Saving...' : 'Save Categories'}
          </button>
        </div>
      </div>
    </div>
  );
}
