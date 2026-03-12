'use client';

import { useState } from 'react';
import { X, Loader2, User, Mail, Phone, Tag, AlignLeft, Plus } from 'lucide-react';
import { toast } from 'sonner';

type CreateLeadModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  companySlug: string;
  companyId: number;
  categories: string[];
};

export default function CreateLeadModal({ 
  isOpen, 
  onClose, 
  onSuccess, 
  companySlug, 
  companyId,
  categories 
}: CreateLeadModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    category: categories[0] || '',
    description: ''
  });

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    const rawPhone = formData.phone.replace(/\D/g, '');
    if (rawPhone.length !== 10) {
      toast.error('Please enter a valid 10-digit phone number');
      return;
    }

    setLoading(true);

    try {
      // Using the exact same endpoint as your UploadForm customer face
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: rawPhone,
          category: formData.category,
          description: formData.description,
          file_urls: [], // Quick add starts with no files
          company_slug: companySlug,
          company_id: companyId,
          lead_source: 'dashboard_manual', // Tracking source for analytics
          custom_answers: {},
        }),
      });

      const result = await res.json();

      if (result.success) {
        toast.success('Lead created successfully');
        onSuccess(); // Refresh the dashboard list
        onClose();
        setFormData({ name: '', email: '', phone: '', category: categories[0] || '', description: '' });
      } else {
        toast.error(result.error || 'Submission failed');
      }
    } catch (err) {
      toast.error('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-300" 
        onClick={onClose} 
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-lg bg-slate-900 border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-black text-white tracking-tight">Quick Add Lead</h2>
              <p className="text-indigo-400 text-[10px] uppercase tracking-[0.2em] font-bold mt-1">Direct Entry</p>
            </div>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-white/5 rounded-xl transition-colors text-slate-400 hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Customer Name */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Customer Name</label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-indigo-500 transition-colors" />
                <input
                  required
                  type="text"
                  placeholder="John Smith"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-white focus:border-indigo-500 focus:outline-none transition-all text-base"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Email */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <input
                    type="email"
                    placeholder="john@email.com"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-white focus:border-indigo-500 focus:outline-none transition-all text-base"
                  />
                </div>
              </div>
              {/* Phone */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Phone</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <input
                    type="tel"
                    placeholder="(555) 000-0000"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-white focus:border-indigo-500 focus:outline-none transition-all text-base"
                  />
                </div>
              </div>
            </div>

            {/* Category */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Category</label>
              <div className="relative">
                <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <select
  value={formData.category}
  onChange={(e) => setFormData({...formData, category: e.target.value})}
  className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-10 py-4 text-white focus:border-indigo-500 focus:outline-none appearance-none cursor-pointer text-base"
>
  <option value="" disabled className="bg-slate-900 text-white/40">Select Category</option>
  {categories.map((cat: any) => {
    // This safely handles both objects {value, label} and strings
    const val = typeof cat === 'object' ? cat.value : cat;
    const label = typeof cat === 'object' ? cat.label : cat;
    
    return (
      <option key={val} value={val} className="bg-slate-900">
        {label}
      </option>
    );
  })}
</select>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Project Details</label>
              <div className="relative">
                <AlignLeft className="absolute left-4 top-4 w-5 h-5 text-slate-500" />
                <textarea
                  rows={3}
                  placeholder="What needs to be done?"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-white focus:border-indigo-500 focus:outline-none transition-all text-base resize-none"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="pt-4 flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-4 rounded-2xl border border-white/10 text-white font-bold hover:bg-white/5 transition-all active:scale-95"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-[2] px-6 py-4 rounded-2xl bg-indigo-600 text-white font-black shadow-xl shadow-indigo-600/20 hover:bg-indigo-500 disabled:opacity-50 transition-all flex items-center justify-center gap-2 active:scale-95"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5 stroke-[3px]" />}
                Create Lead
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}