'use client';

import { useState } from 'react';
import { X, Loader2, User, Mail, Phone, Tag, AlignLeft, Plus, ChevronDown, ChevronUp, MapPin, Home, Calendar, Clock, HelpCircle, Megaphone } from 'lucide-react';
import { toast } from 'sonner';

type CreateLeadModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  companySlug: string;
  companyId: number;
  categories: any[];
  company?: any;
};

export default function CreateLeadModal({
  isOpen,
  onClose,
  onSuccess,
  companySlug,
  companyId,
  categories,
  company,
}: CreateLeadModalProps) {
  const [loading, setLoading] = useState(false);
  const [notifyCustomer, setNotifyCustomer] = useState(false);
  const [notifyOwner, setNotifyOwner] = useState(true);
  const [showOptional, setShowOptional] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    category: categories[0]?.value || categories[0] || '',
    description: '',
    address_line_1: '',
    address_line_2: '',
    city: '',
    zip_code: '',
    preferred_date: '',
    preferred_time: '',
    lead_source: '',
    custom_answers: {} as Record<string, string>,
  });

  

  if (!isOpen) return null;

  const fieldConfig = company?.form_field_config || {};
  const customQuestions: any[] = company?.custom_questions || [];

  const showAddress = fieldConfig?.address?.enabled ?? false;
  const showDate = fieldConfig?.preferred_date?.enabled ?? false;
  const showTime = fieldConfig?.preferred_time?.enabled ?? false;
  const showLeadSource = fieldConfig?.lead_source?.enabled ?? false;
  const hasOptionalFields = showAddress || showDate || showTime || showLeadSource || customQuestions.length > 0;

  const filledOptional = [
    showAddress && formData.address_line_1,
    showDate && formData.preferred_date,
    showTime && formData.preferred_time,
    showLeadSource && formData.lead_source,
    ...customQuestions.map(q => formData.custom_answers[q.id]),
  ].filter(Boolean).length;

  const formatPhoneNumber = (value: string) => {
    const phone = value.replace(/\D/g, '');
    if (phone.length <= 3) return phone;
    if (phone.length <= 6) return `(${phone.slice(0, 3)}) ${phone.slice(3)}`;
    return `(${phone.slice(0, 3)}) ${phone.slice(3, 6)}-${phone.slice(6, 10)}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawDigits = e.target.value.replace(/\D/g, '');
    if (rawDigits.length <= 10) {
      setFormData({ ...formData, phone: formatPhoneNumber(e.target.value) });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '', email: '', phone: '',
      category: categories[0]?.value || categories[0] || '',
      description: '', address_line_1: '', address_line_2: '',
      city: '', zip_code: '', preferred_date: '', preferred_time: '',
      lead_source: '', custom_answers: {},
    });
    setShowOptional(false);
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
          lead_source: formData.lead_source || 'dashboard_manual',
          custom_answers: formData.custom_answers,
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
        resetForm();
      } else {
        toast.error(result.error || 'Submission failed');
      }
    } catch {
      toast.error('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  const inputClass = "w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 sm:py-4 text-white focus:border-blue-500 focus:outline-none transition-all text-base";

  return (
    <div className="fixed inset-0 z-[150] flex items-end sm:items-center justify-center sm:p-4">
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose} />

      <div className="relative w-full max-w-lg bg-slate-900 border-x border-t sm:border border-white/10 rounded-t-[2rem] sm:rounded-[2.5rem] shadow-2xl overflow-hidden animate-in slide-in-from-bottom-10 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-300 max-h-[92vh] flex flex-col">

        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-12 h-1.5 bg-white/10 rounded-full" />
        </div>

        <div className="p-6 sm:p-8 overflow-y-auto">
          <div className="flex items-start justify-between mb-6 sm:mb-8">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">Quick Add Lead</h2>
              <p className="text-blue-400 text-[10px] uppercase tracking-[0.2em] font-bold mt-1">Direct Entry</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-xl transition-colors text-slate-400 hover:text-white">
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">

            {/* Name */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Customer Name</label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
                <input required type="text" placeholder="John Smith" value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={`${inputClass} pl-12`} />
              </div>
            </div>

            {/* Email + Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Email <span className="text-red-400">*</span></label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <input required type="email" inputMode="email" placeholder="john@email.com" value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className={`${inputClass} pl-12`} />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Phone Number</label>
                <div className="relative group">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
                  <input required type="tel" inputMode="tel" placeholder="(555) 000-0000" value={formData.phone}
                    onChange={handlePhoneChange}
                    className={`${inputClass} pl-12 font-mono`} />
                </div>
              </div>
            </div>

            {/* Category */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Category</label>
              <div className="relative">
                <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 pointer-events-none" />
                <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className={`${inputClass} pl-12 pr-10 appearance-none cursor-pointer`}>
                  <option value="" disabled className="bg-slate-900 text-white/40">Select Category</option>
                  {categories.map((cat: any, i: number) => {
                    const val = typeof cat === 'object' ? cat.value : cat;
                    const label = typeof cat === 'object' ? cat.label : cat;
                    return <option key={`${val}-${i}`} value={val} className="bg-slate-900">{label}</option>;
                  })}
                </select>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Project Details</label>
              <div className="relative">
                <AlignLeft className="absolute left-4 top-4 w-5 h-5 text-slate-500" />
                <textarea rows={2} placeholder="What needs to be done?" value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className={`${inputClass} pl-12 resize-none`} />
              </div>
            </div>

            {/* Optional accordion */}
            {hasOptionalFields && (
              <div className="rounded-2xl border border-white/10 overflow-hidden">
                <button
                  type="button"
                  onClick={() => setShowOptional(v => !v)}
                  className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      Additional Details
                    </span>
                    {filledOptional > 0 && (
                      <span className="text-[10px] font-black bg-blue-600 text-white px-2 py-0.5 rounded-full">
                        {filledOptional} filled
                      </span>
                    )}
                  </div>
                  {showOptional
                    ? <ChevronUp className="w-4 h-4 text-slate-500" />
                    : <ChevronDown className="w-4 h-4 text-slate-500" />
                  }
                </button>

                {showOptional && (
                  <div className="px-4 pb-4 space-y-4 border-t border-white/10 pt-4">

                    {/* Address with Google Maps autocomplete */}
                    {showAddress && (
  <>
    <div className="space-y-2">
      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
Service Address
</label>
      <div className="relative">
        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 pointer-events-none z-10" />
        <input
          type="text"
          value={formData.address_line_1}
          onChange={e => setFormData({ ...formData, address_line_1: e.target.value })}
          placeholder="123 Main St"
          className={`${inputClass} pl-12`}
        />
      </div>
    </div>
                       <div className="grid grid-cols-3 gap-3">
      <div className="space-y-2">
        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">City</label>
        <input
          type="text"
          value={formData.city}
          onChange={e => setFormData({ ...formData, city: e.target.value })}
          placeholder="City"
          className={`${inputClass} text-sm`}
        />
      </div>
      <div className="space-y-2">
        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Zip Code</label>
                            <div className="relative">
                              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                              <input
                                type="text"
                                value={formData.zip_code}
                                onChange={e => setFormData({ ...formData, zip_code: e.target.value.replace(/\D/g, '').slice(0, 5) })}
                                placeholder="12345"
                                maxLength={5}
                                className={`${inputClass} pl-10 text-sm`}
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Unit / Apt</label>
                            <div className="relative">
                              <Home className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                              <input
                                type="text"
                                value={formData.address_line_2}
                                onChange={e => setFormData({ ...formData, address_line_2: e.target.value })}
                                placeholder="Apt 4B"
                                className={`${inputClass} pl-10 text-sm`}
                              />
                            </div>
                          </div>
                        </div>
                      </>
                    )}

                    {/* Date + Time */}
                    {(showDate || showTime) && (
                      <div className="grid grid-cols-2 gap-3">
                        {showDate && (
  <div className="space-y-2 min-w-0 overflow-hidden">
    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Preferred Date</label>
    <input
      type="date"
      value={formData.preferred_date}
      onChange={(e) => setFormData({ ...formData, preferred_date: e.target.value })}
      style={{ colorScheme: 'dark' }}
      className={`${inputClass} text-sm w-full`}
    />
  </div>
)}
                        {showTime && (
                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Preferred Time</label>
                            <div className="relative">
                              <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                              <input type="text" placeholder="Morning" value={formData.preferred_time}
                                onChange={(e) => setFormData({ ...formData, preferred_time: e.target.value })}
                                className={`${inputClass} pl-10 text-sm`} />
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Lead Source */}
                    {showLeadSource && (
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">How Did They Hear About You?</label>
                        <div className="relative">
                          <Megaphone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 pointer-events-none" />
                          <select value={formData.lead_source}
                            onChange={(e) => setFormData({ ...formData, lead_source: e.target.value })}
                            className={`${inputClass} pl-12 pr-10 appearance-none cursor-pointer`}>
                            <option value="" className="bg-slate-900">Select...</option>
                            <option value="website" className="bg-slate-900">Website / Google Search</option>
                            <option value="facebook" className="bg-slate-900">Facebook</option>
                            <option value="instagram" className="bg-slate-900">Instagram</option>
                            <option value="google_ads" className="bg-slate-900">Google Ads</option>
                            <option value="referral" className="bg-slate-900">Referral from friend/family</option>
                            <option value="yard_sign" className="bg-slate-900">Yard Sign</option>
                            <option value="truck" className="bg-slate-900">Saw your truck</option>
                            <option value="other" className="bg-slate-900">Other</option>
                          </select>
                        </div>
                      </div>
                    )}

                    {/* Custom Questions */}
                    {customQuestions.map((q: any) => (
                      <div key={q.id} className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                          {q.label} {q.required && <span className="text-red-400">*</span>}
                        </label>
                        {q.type === 'text' && (
                          <input type="text" placeholder="Enter answer..." value={formData.custom_answers[q.id] || ''}
                            onChange={(e) => setFormData({ ...formData, custom_answers: { ...formData.custom_answers, [q.id]: e.target.value } })}
                            className={inputClass} />
                        )}
                        {q.type === 'select' && (
                          <select value={formData.custom_answers[q.id] || ''}
                            onChange={(e) => setFormData({ ...formData, custom_answers: { ...formData.custom_answers, [q.id]: e.target.value } })}
                            className={`${inputClass} appearance-none cursor-pointer`}>
                            <option value="" className="bg-slate-900">Select...</option>
                            {q.options?.map((opt: string) => (
                              <option key={opt} value={opt} className="bg-slate-900">{opt}</option>
                            ))}
                          </select>
                        )}
                        {q.type === 'checkbox' && (
                          <div className="flex gap-3">
                            {['Yes', 'No'].map(opt => (
                              <button key={opt} type="button"
                                onClick={() => setFormData({ ...formData, custom_answers: { ...formData.custom_answers, [q.id]: opt } })}
                                className={`flex-1 py-3 rounded-2xl border font-bold text-sm transition-all ${
                                  formData.custom_answers[q.id] === opt
                                    ? 'border-blue-500 bg-blue-600 text-white'
                                    : 'border-white/10 bg-white/5 text-slate-400 hover:border-white/20'
                                }`}>
                                {opt}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}

                  </div>
                )}
              </div>
            )}

            {/* Notifications */}
            <div className="flex flex-col gap-2 pt-1">
              <label className="flex items-center gap-3 cursor-pointer group">
                <div onClick={() => setNotifyOwner(!notifyOwner)}
                  className={`w-9 h-5 rounded-full transition-colors flex-shrink-0 relative ${notifyOwner ? 'bg-blue-600' : 'bg-white/10'}`}>
                  <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${notifyOwner ? 'translate-x-4' : 'translate-x-0.5'}`} />
                </div>
                <span className="text-xs text-slate-400 group-hover:text-slate-300 transition-colors">Notify owner</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer group">
                <div onClick={() => setNotifyCustomer(!notifyCustomer)}
                  className={`w-9 h-5 rounded-full transition-colors flex-shrink-0 relative ${notifyCustomer ? 'bg-blue-600' : 'bg-white/10'}`}>
                  <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${notifyCustomer ? 'translate-x-4' : 'translate-x-0.5'}`} />
                </div>
                <span className="text-xs text-slate-400 group-hover:text-slate-300 transition-colors">Send confirmation to customer</span>
              </label>
            </div>

            {/* Actions */}
            <div className="pt-2 flex gap-3 pb-[env(safe-area-inset-bottom)] sm:pb-0">
              <button type="button" onClick={onClose}
                className="hidden sm:block flex-1 px-6 py-4 rounded-2xl border border-white/10 text-white font-bold hover:bg-white/5 transition-all active:scale-95">
                Cancel
              </button>
              <button type="submit" disabled={loading}
                className="flex-[3] sm:flex-[2] px-6 py-4 rounded-2xl bg-blue-600 text-white font-black shadow-xl shadow-blue-600/20 hover:bg-blue-500 disabled:opacity-50 transition-all flex items-center justify-center gap-2 active:scale-95 text-lg sm:text-base">
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