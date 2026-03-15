'use client';

import { useState, useImperativeHandle, forwardRef } from 'react';
import { Plus, Trash2, RotateCcw, X } from 'lucide-react';
import { CATEGORY_MAP } from '@/lib/formCategories';
import type { Category } from '../types';

export interface CategoriesStepRef {
  getData: () => { categories: Category[] };
}

const CategoriesStep = forwardRef<CategoriesStepRef, { company: any; showErr: (msg: string) => void }>(
  ({ company, showErr }, ref) => {
    const defaultCategories: Category[] = CATEGORY_MAP[company.business_type || 'general'] || CATEGORY_MAP.general;
    const [categories, setCategories] = useState<Category[]>(
      company.form_categories?.length > 0 ? company.form_categories : defaultCategories
    );
    const [newLabel, setNewLabel] = useState('');
    const [showAdd, setShowAdd] = useState(false);

    useImperativeHandle(ref, () => ({ getData: () => ({ categories }) }));

    const add = () => {
      if (!newLabel.trim()) return;
      if (categories.length >= 20) { showErr('Maximum 20 categories'); return; }
      const value = newLabel.toLowerCase().replace(/[^a-z0-9]+/g, '_');
      setCategories(prev => [...prev, { value, label: newLabel.trim() }]);
      setNewLabel(''); setShowAdd(false);
    };

    const remove = (idx: number) => {
      if (categories.length <= 3) { showErr('Minimum 3 categories'); return; }
      setCategories(prev => prev.filter((_, i) => i !== idx));
    };

    return (
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">

        {/* Header */}
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Service Categories</span>
            <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs font-bold rounded-full">{categories.length}</span>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setCategories(defaultCategories)}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs font-bold rounded-lg transition">
              <RotateCcw className="w-3 h-3" /> Reset
            </button>
            <button onClick={() => setShowAdd(true)}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition">
              <Plus className="w-3 h-3" /> Add
            </button>
          </div>
        </div>

        {/* Add input */}
        {showAdd && (
          <div className="px-5 py-3 bg-indigo-50 border-b border-indigo-100">
            <div className="flex gap-2">
              <input
                type="text" value={newLabel} onChange={e => setNewLabel(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && add()}
                placeholder="e.g., Emergency Repair" autoFocus
                className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-indigo-400 focus:outline-none bg-white transition"
              />
              <button onClick={add} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-lg transition">Add</button>
              <button onClick={() => { setShowAdd(false); setNewLabel(''); }}
                className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg transition"><X className="w-4 h-4" /></button>
            </div>
          </div>
        )}

        {/* Grid */}
        <div className="p-4 grid grid-cols-2 sm:grid-cols-3 gap-2">
          {categories.map((cat, idx) => (
            <div key={idx}
              className="group relative flex items-center justify-between gap-2 px-3 py-2.5 bg-gray-50 hover:bg-indigo-50 border border-gray-200 hover:border-indigo-200 rounded-lg transition">
              <span className="text-sm font-semibold text-gray-700 group-hover:text-indigo-700 truncate">{cat.label}</span>
              <button onClick={() => remove(idx)}
                className="flex-shrink-0 opacity-0 group-hover:opacity-100 p-0.5 text-red-400 hover:text-red-600 transition">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-gray-50 border-t border-gray-100">
          <p className="text-xs text-gray-400">Min 3 · Max 20 · Customers pick from these when submitting a lead</p>
        </div>
      </div>
    );
  }
);

CategoriesStep.displayName = 'CategoriesStep';
export default CategoriesStep;