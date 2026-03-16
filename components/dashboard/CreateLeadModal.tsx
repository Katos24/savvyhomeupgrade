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
  categories: any[];
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
  const [notifyCustomer, setNotifyCustomer] = useState(false);
  const [notifyOwner, setNotifyOwner] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    category: categories[0]?.value || categories[0] || '',
    description: ''
  });

  if (!isOpen) return null;

  // Formatter: (123) 456-7890
  const formatPhoneNumber = (value: string) => {
    const phone = value.replace(/\D/g, '');
    if (phone.length <= 3) return phone;
    if (phone.length <= 6) return `(${phone.slice(0, 3)}) ${phone.slice(3)}`;
    return `(${phone.slice(0, 3)}) ${phone.slice(3, 6)}-${phone.slice(6, 10)}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    const rawDigits = input.replace(/\D/g, '');
    
    // Strict stop at 10 digits
    if (rawDigits.length <= 10) {
      const formatted = formatPhoneNumber(input);
      setFormData({ ...formData, phone: formatted });
    }
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    const rawPhone = formData.phone.replace(/\D/g, '');
    if (rawPhone.length !== 10) {
      toast.error('Please enter a full 10-digit phone number');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          phone: rawPhone,
          file_urls: [],
          company_slug: companySlug,
          company_id: companyId,
          lead_source: 'dashboard_manual',
          custom_answers: {},
          created_by: 'team',
          notify_customer: notifyCustomer,
          notify_owner: notifyOwner,
        }),
      });

      const result = await res.json();

      if (result.success) {
        toast.success('Lead created successfully');
        onSuccess();
        onClose();
        setFormData({ name: '', email: '', phone: '', category: categories[0]?.value || categories[0] || '', description: '' });
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
    <div className="fixed inset-0 z-[150] flex items-end sm:items-center justify-center sm:p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-300" 
        onClick={onClose} 
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-lg bg-slate-900 border-x border-t sm:border border-white/10 rounded-t-[2rem] sm:rounded-[2.5rem] shadow-2xl overflow-hidden animate-in slide-in-from-bottom-10 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-300 max-h-[92vh] flex flex-col">
        
        {/* Mobile Grabber */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-12 h-1.5 bg-white/10 rounded-full" />
        </div>

        <div className="p-6 sm:p-8 overflow-y-auto">
          <div className="flex items-start justify-between mb-6 sm:mb-8">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">Quick Add Lead</h2>
              <p className="text-indigo-400 text-[10px] uppercase tracking-[0.2em] font-bold mt-1">Direct Entry</p>
            </div>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-white/5 rounded-xl transition-colors text-slate-400 hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
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
                  className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-3 sm:py-4 text-white focus:border-indigo-500 focus:outline-none transition-all text-base"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Email */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Email <span className="text-red-400">*</span></label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <input
  required
  type="email"
  inputMode="email"
  placeholder="john@email.com"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-3 sm:py-4 text-white focus:border-indigo-500 focus:outline-none transition-all text-base"
                  />
                </div>
              </div>
              
              {/* Phone - Hard Stop at 10 Digits */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Phone Number</label>
                <div className="relative group">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-indigo-500 transition-colors" />
                  <input
                    required
                    type="tel"
                    inputMode="tel"
                    placeholder="(555) 000-0000"
                    value={formData.phone}
                    onChange={handlePhoneChange}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-3 sm:py-4 text-white focus:border-indigo-500 focus:outline-none transition-all text-base font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Category */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Category</label>
              <div className="relative">
                <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 pointer-events-none" />
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-10 py-3 sm:py-4 text-white focus:border-indigo-500 focus:outline-none appearance-none cursor-pointer text-base"
                >
                  <option value="" disabled className="bg-slate-900 text-white/40">Select Category</option>
                  {categories.map((cat: any, i: number) => {
                    const val = typeof cat === 'object' ? cat.value : cat;
                    const label = typeof cat === 'object' ? cat.label : cat;
                    return (
                      <option key={`${val}-${i}`} value={val} className="bg-slate-900">
                        {label}
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
<label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Project Details</label>          <div className="relative">
                <AlignLeft className="absolute left-4 top-4 w-5 h-5 text-slate-500" />
                <textarea
  rows={2}
  placeholder="What needs to be done?"
  value={formData.description}
  onChange={(e) => setFormData({...formData, description: e.target.value})}
  className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-3 sm:py-4 text-white focus:border-indigo-500 focus:outline-none transition-all text-base resize-none"
/>
              </div>
            </div>

            {/* Notifications */}
            <div className="flex flex-col gap-2 pt-1">
              <label className="flex items-center gap-3 cursor-pointer group">
                <div
                  onClick={() => setNotifyOwner(!notifyOwner)}
                  className={`w-9 h-5 rounded-full transition-colors flex-shrink-0 relative ${notifyOwner ? 'bg-indigo-600' : 'bg-white/10'}`}
                >
                  <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${notifyOwner ? 'translate-x-4' : 'translate-x-0.5'}`} />
                </div>
                <span className="text-xs text-slate-400 group-hover:text-slate-300 transition-colors">Notify owner</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer group">
                <div
                  onClick={() => setNotifyCustomer(!notifyCustomer)}
                  className={`w-9 h-5 rounded-full transition-colors flex-shrink-0 relative ${notifyCustomer ? 'bg-indigo-600' : 'bg-white/10'}`}
                >
                  <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${notifyCustomer ? 'translate-x-4' : 'translate-x-0.5'}`} />
                </div>
                <span className="text-xs text-slate-400 group-hover:text-slate-300 transition-colors">Send confirmation to customer</span>
              </label>
            </div>

            {/* Actions */}
            <div className="pt-2 flex gap-3 pb-[env(safe-area-inset-bottom)] sm:pb-0">
              <button
                type="button"
                onClick={onClose}
                className="hidden sm:block flex-1 px-6 py-4 rounded-2xl border border-white/10 text-white font-bold hover:bg-white/5 transition-all active:scale-95"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-[3] sm:flex-[2] px-6 py-4 rounded-2xl bg-indigo-600 text-white font-black shadow-xl shadow-indigo-600/20 hover:bg-indigo-500 disabled:opacity-50 transition-all flex items-center justify-center gap-2 active:scale-95 text-lg sm:text-base"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-6 h-6 sm:w-5 sm:h-5 stroke-[3px]" />}
                Create Lead
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}