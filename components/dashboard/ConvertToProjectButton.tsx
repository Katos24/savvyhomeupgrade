'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { ChevronDown, Rocket, AlertTriangle, CheckCircle2, X } from 'lucide-react';

type ConvertToProjectButtonProps = {
  lead: any;
  currentUser: any;
  onRefresh: () => Promise<void>;
  categories?: any[];
};

export default function ConvertToProjectButton({
  lead,
  currentUser,
  onRefresh,
  categories = [],
}: ConvertToProjectButtonProps) {
  const [isConverting, setIsConverting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(lead.category || '');

  if (lead.project_id) return null;

  const formatCategory = (cat: string) => {
    if (!cat) return 'No category';
    const match = categories.find((c: any) => c.value === cat);
    return match ? match.label : cat.split('_').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  };

  const handleConvert = async () => {
    setIsConverting(true);
    try {
      const response = await fetch('/api/leads/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
  id: lead.id,
  action: 'create_project',
  category: selectedCategory,
  user_name: currentUser?.name || 'Unknown User',
  user_email: currentUser?.email || '',
}),
      });

      const result = await response.json();

      if (response.ok && result.success) {
  toast.success(`Project #${result.project_number} created!`);
  setShowConfirm(false);

  // Update category if it changed from original
  if (selectedCategory && selectedCategory !== lead.category) {
    await fetch('/api/leads/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: lead.id,
        action: 'update_details',
        name: lead.name,
        email: lead.email,
        phone: lead.phone,
        address_line_1: lead.address_line_1 || '',
        address_line_2: lead.address_line_2 || '',
        city: lead.city || '',
        category: selectedCategory,
        description: lead.description,
        user_name: currentUser?.name || 'Unknown',
        user_email: currentUser?.email || '',
      }),
    });
  }

  // Auto-save quote template...
        try {
          const companySlug = window.location.pathname.split('/')[1];
          const tmplRes = await fetch(`/api/company/${companySlug}/quote-templates`);
          const tmplData = await tmplRes.json();

          if (tmplData.success) {
            const match = (tmplData.templates || []).find((t: any) => t.category === selectedCategory);
            if (match) {
              const items = match.items.map((item: any, i: number) => ({
                id: Date.now() + i,
                description: item.description,
                quantity: item.quantity || 1,
                unitPrice: item.unitPrice || item.amount / (item.quantity || 1),
                amount: item.amount,
              }));
              const total = items.reduce((s: number, i: any) => s + i.amount, 0);
              await fetch('/api/leads/update', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  id: lead.id,
                  action: 'save_quote',
                  quote_data: items,
                  quote_total: total,
                  user_name: currentUser?.name || 'Unknown',
                  user_email: currentUser?.email || '',
                }),
              });
            }
          }
        } catch (e) {
          console.error('Auto-save quote failed:', e);
        }

        await onRefresh();
      } else {
        toast.error(result.error || 'Failed to create project');
      }
    } catch (error) {
      console.error('Conversion error:', error);
      toast.error('Failed to create project');
    } finally {
      setIsConverting(false);
    }
  };

  return (
    <div className="rounded-none border border-indigo-100 overflow-hidden mb-4"
      style={{ background: 'linear-gradient(to br, #eff6ff, #eef2ff)' }}>

      {!showConfirm ? (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-none bg-indigo-100 flex items-center justify-center flex-shrink-0">
              <Rocket className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h3 className="text-sm font-black text-gray-900">Ready to start work?</h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Convert to a project to schedule, quote, and track payments.
              </p>
              {lead.category && (
                <span className="inline-flex items-center gap-1 mt-1.5 text-xs font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-none">
                  {formatCategory(lead.category)}
                </span>
              )}
            </div>
          </div>
          <button
            onClick={() => setShowConfirm(true)}
            className="w-full sm:w-auto flex-shrink-0 bg-indigo-600 hover:bg-indigo-700 text-white font-black py-3 px-6 rounded-none transition shadow-lg text-sm uppercase tracking-widest"
          >
            Convert to Project
          </button>
        </div>
      ) : (
        <div className="p-5 space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-none bg-amber-100 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h3 className="text-sm font-black text-gray-900">Confirm Project Category</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Tasks and pricing will auto-load based on this category.
                  Make sure it's correct before converting.
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowConfirm(false)}
              className="p-1.5 hover:bg-gray-100 rounded-none transition flex-shrink-0"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          </div>

          {/* Category selector */}
          <div className="bg-white border border-gray-200 rounded-none p-4">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">
              Category for this project
            </label>
            {categories.length > 0 ? (
              <div className="relative">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full appearance-none bg-indigo-50 border border-indigo-200 rounded-none px-3 py-2.5 text-sm font-bold text-indigo-700 focus:outline-none focus:border-indigo-400 cursor-pointer pr-8"
                >
                  <option value="">— Select a category —</option>
                  {categories.map((cat: any) => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-400 pointer-events-none" />
              </div>
            ) : (
              <div className="px-3 py-2.5 bg-indigo-50 border border-indigo-200 rounded-none text-sm font-bold text-indigo-700">
                {formatCategory(selectedCategory) || 'No category set'}
              </div>
            )}
            {selectedCategory && (
              <p className="text-[10px] text-gray-400 mt-2 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                Tasks and pricing template for <strong>{formatCategory(selectedCategory)}</strong> will be loaded automatically.
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleConvert}
              disabled={isConverting}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-black py-3 px-6 rounded-none transition text-sm uppercase tracking-widest"
            >
              {isConverting ? 'Creating Project...' : 'Confirm & Convert'}
            </button>
            <button
              onClick={() => setShowConfirm(false)}
              disabled={isConverting}
              className="flex-1 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 text-gray-700 font-bold py-3 px-6 rounded-none transition text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}