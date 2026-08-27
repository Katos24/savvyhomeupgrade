'use client';

import { useState, useEffect } from 'react';
import { 
  X, Loader2, User, Mail, Phone, Tag, AlignLeft, 
  Plus, ChevronDown, ChevronUp, MapPin, Home, 
  Calendar, Clock, Megaphone, Search
} from 'lucide-react';
import { toast } from 'sonner';

// ---------------------------------------------------------------------------
// Helper: Text color contrast
// ---------------------------------------------------------------------------
function isColorTooDark(hex: string): boolean {
  let c = hex.trim().replace('#', '');
  if (c.length === 3) c = c.split('').map((ch) => ch + ch).join('');
  const r = parseInt(c.substring(0, 2), 16);
  const g = parseInt(c.substring(2, 4), 16);
  const b = parseInt(c.substring(4, 6), 16);
  if (Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b)) return false;
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 < 0.5;
}

type CreateLeadModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  companySlug: string;
  companyId: number;
  categories: any[];
  company?: any;
  isDark?: boolean;
  accentColor?: string;
};

export default function CreateLeadModal({
  isOpen,
  onClose,
  onSuccess,
  companySlug,
  companyId,
  categories,
  company,
  isDark = false,
  accentColor = '#2563eb',
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


    const [showCustomerSearch, setShowCustomerSearch] = useState(false);
  const [customerQuery, setCustomerQuery] = useState('');
  const [customerResults, setCustomerResults] = useState<any[]>([]);
  const [searchingCustomers, setSearchingCustomers] = useState(false);
  const [prefilledFrom, setPrefilledFrom] = useState<string | null>(null);

  // Must run before the `if (!isOpen) return null` below — hooks can't
  // sit after a conditional return, or their call order changes between
  // renders depending on isOpen, which is exactly what React just flagged.
   useEffect(() => {
    if (!showCustomerSearch || customerQuery.trim().length < 2) {
      setCustomerResults([]);
      return;
    }
    const t = setTimeout(async () => {
      setSearchingCustomers(true);
      try {
        const res = await fetch(`/api/company/${companySlug}/customers/search?q=${encodeURIComponent(customerQuery)}`);
        const data = await res.json();
        if (data.success) setCustomerResults(data.customers || []);
      } catch {
        // silent — search is a convenience, not required
      } finally {
        setSearchingCustomers(false);
      }
    }, 300);
    return () => clearTimeout(t);
  }, [customerQuery, companySlug, showCustomerSearch]);
  
  if (!isOpen) return null;

  const isAccentDark = isColorTooDark(accentColor);
  const accentTextColor = isAccentDark ? '#ffffff' : '#000000';

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
    if (rawPhone.length > 0 && rawPhone.length !== 10) {
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

   const handleSelectCustomer = (c: any) => {
    setFormData((prev) => ({
      ...prev,
      name: c.name || prev.name,
      email: c.email || prev.email,
      phone: c.phone ? formatPhoneNumber(c.phone) : prev.phone,
      address_line_1: c.address_line_1 || prev.address_line_1,
      address_line_2: c.address_line_2 || prev.address_line_2,
      city: c.city || prev.city,
      zip_code: c.zip_code || prev.zip_code,
    }));
    setPrefilledFrom(c.name);
    setCustomerQuery('');
    setCustomerResults([]);
    setShowCustomerSearch(false);
    if (c.address_line_1) setShowOptional(true);
  };

  // Polished input styling dependent on light/dark mode
  const inputClass = `w-full rounded-2xl px-4 py-3 sm:py-3.5 border transition-all duration-200 outline-none text-[15px] ${
    isDark 
      ? 'bg-white/5 border-white/10 text-white placeholder-slate-500 focus:bg-white/10' 
      : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:bg-white'
  }`;

  return (
    <div className="fixed inset-0 z-[150] flex items-end sm:items-center justify-center sm:p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300" 
        onClick={onClose} 
      />

      {/* Modal Container */}
      <div className={`relative w-full max-w-lg border-x border-t sm:border rounded-t-[2rem] sm:rounded-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-8 sm:zoom-in-95 duration-300 max-h-[92vh] flex flex-col ${
        isDark ? 'bg-[#0A0C14] border-white/10' : 'bg-white border-slate-100'
      }`}>

        {/* Mobile Drag Handle */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className={`w-12 h-1.5 rounded-full ${isDark ? 'bg-white/10' : 'bg-slate-200'}`} />
        </div>

        <div className="p-6 sm:p-8 overflow-y-auto custom-scrollbar">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className={`text-2xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Quick Add Lead
              </h2>
              <p className="text-xs uppercase tracking-widest font-bold mt-1.5" style={{ color: accentColor }}>
                Direct Entry
              </p>
            </div>
            <button 
              onClick={onClose} 
              className={`p-2 rounded-xl transition-colors ${
                isDark ? 'hover:bg-white/10 text-slate-400 hover:text-white' : 'hover:bg-slate-100 text-slate-500 hover:text-slate-900'
              }`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

                   <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
                      {/* Existing customer lookup — a deliberate button + reveal,
                not an always-visible field next to Name. Two similar
                text inputs stacked together risked someone typing a new
                customer's name into the search box by mistake. Nothing
                happens here unless the button is clicked on purpose. */}
            {!prefilledFrom && !showCustomerSearch && (
              <button
                type="button"
                onClick={() => setShowCustomerSearch(true)}
                className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-dashed text-sm font-semibold transition-colors ${
                  isDark
                    ? 'border-white/15 text-slate-300 hover:bg-white/5'
                    : 'border-slate-300 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Search className="w-4 h-4" />
                Add from existing customer
              </button>
            )}

            {showCustomerSearch && (
              <div className="relative space-y-1.5">
                <div className="flex items-center justify-between ml-1">
                  <label className={`text-[11px] font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    Search customers
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setShowCustomerSearch(false);
                      setCustomerQuery('');
                      setCustomerResults([]);
                    }}
                    className={`text-[11px] font-semibold ${isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-800'}`}
                  >
                    Cancel
                  </button>
                </div>
                <div className="relative">
                  <Search className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                  <input
                    autoFocus
                    type="text"
                    placeholder="Search by name, email, or phone..."
                    value={customerQuery}
                    onChange={(e) => setCustomerQuery(e.target.value)}
                    className={`${inputClass} pl-11 focus:ring-2 focus:ring-offset-0 focus:border-transparent`}
                    style={{ '--tw-ring-color': `${accentColor}80` } as React.CSSProperties}
                  />
                  {searchingCustomers && (
                    <Loader2 className={`absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                  )}
                </div>

                {customerQuery.trim().length >= 2 && !searchingCustomers && (
                  <div
                    className={`rounded-2xl border overflow-hidden ${
                      isDark ? 'bg-[#0A0C14] border-white/10' : 'bg-white border-slate-200'
                    }`}
                  >
                    {customerResults.length > 0 ? (
                      customerResults.map((c) => (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => handleSelectCustomer(c)}
                          className={`w-full text-left px-4 py-2.5 transition-colors ${
                            isDark ? 'hover:bg-white/5' : 'hover:bg-slate-50'
                          }`}
                        >
                          <p className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>{c.name}</p>
                          <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                            {[c.email, c.phone].filter(Boolean).join(' · ')}
                          </p>
                        </button>
                      ))
                    ) : (
                      <p className={`px-4 py-3 text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                        No matches — this looks like a new customer.
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

            {prefilledFrom && (
              <div
                className={`flex items-center justify-between px-4 py-2.5 rounded-xl border ${
                  isDark ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-emerald-50 border-emerald-200'
                }`}
              >
                <p className={`text-xs font-medium ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>
                  Prefilled from {prefilledFrom}'s last job
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setPrefilledFrom(null);
                    setShowCustomerSearch(true);
                  }}
                  className={`text-xs font-semibold ${isDark ? 'text-emerald-400 hover:text-emerald-300' : 'text-emerald-700 hover:text-emerald-800'}`}
                >
                  Search again
                </button>
              </div>
            )}

            {/* Name */}
            <div className="space-y-1.5 group">
              <label className={`text-[11px] font-bold uppercase tracking-wider ml-1 transition-colors ${isDark ? 'text-slate-400 group-focus-within:text-slate-300' : 'text-slate-500 group-focus-within:text-slate-700'}`}>
                Customer Name
              </label>
              <div className="relative">
                <User className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                <input 
                  required 
                  type="text" 
                  placeholder="John Smith" 
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={`${inputClass} pl-12 focus:ring-2 focus:ring-offset-0 focus:border-transparent`} 
                  style={{ '--tw-ring-color': `${accentColor}80` } as React.CSSProperties}
                />
              </div>
            </div>

            {/* Email + Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5 group">
                <label className={`text-[11px] font-bold uppercase tracking-wider ml-1 transition-colors ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Email <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <Mail className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                  <input 
                    required 
                    type="email" 
                    inputMode="email" 
                    placeholder="john@email.com" 
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className={`${inputClass} pl-12 focus:ring-2 focus:ring-offset-0 focus:border-transparent`}
                    style={{ '--tw-ring-color': `${accentColor}80` } as React.CSSProperties}
                  />
                </div>
              </div>
              <div className="space-y-1.5 group">
                <label className={`text-[11px] font-bold uppercase tracking-wider ml-1 transition-colors ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                  <input 
                    type="tel" 
                    inputMode="tel" 
                    placeholder="(555) 000-0000" 
                    value={formData.phone}
                    onChange={handlePhoneChange}
                    className={`${inputClass} pl-12 font-mono focus:ring-2 focus:ring-offset-0 focus:border-transparent`}
                    style={{ '--tw-ring-color': `${accentColor}80` } as React.CSSProperties}
                  />
                </div>
              </div>
            </div>

            {/* Category */}
            <div className="space-y-1.5 group">
              <label className={`text-[11px] font-bold uppercase tracking-wider ml-1 transition-colors ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Category
              </label>
              <div className="relative">
                <Tag className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none transition-colors ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                <select 
                  value={formData.category} 
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className={`${inputClass} pl-12 pr-10 appearance-none cursor-pointer focus:ring-2 focus:ring-offset-0 focus:border-transparent`}
                  style={{ '--tw-ring-color': `${accentColor}80` } as React.CSSProperties}
                >
                  <option value="" disabled className={isDark ? 'bg-slate-900 text-white/40' : 'bg-white text-slate-400'}>
                    Select Category
                  </option>
                  {categories.map((cat: any, i: number) => {
                    const val = typeof cat === 'object' ? cat.value : cat;
                    const label = typeof cat === 'object' ? cat.label : cat;
                    return <option key={`${val}-${i}`} value={val} className={isDark ? 'bg-[#0A0C14]' : 'bg-white'}>{label}</option>;
                  })}
                </select>
                <ChevronDown className={`absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1.5 group">
              <label className={`text-[11px] font-bold uppercase tracking-wider ml-1 transition-colors ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Project Details
              </label>
              <div className="relative">
                <AlignLeft className={`absolute left-4 top-3.5 w-5 h-5 transition-colors ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                <textarea 
                  rows={2} 
                  placeholder="What needs to be done?" 
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className={`${inputClass} pl-12 resize-none focus:ring-2 focus:ring-offset-0 focus:border-transparent`}
                  style={{ '--tw-ring-color': `${accentColor}80` } as React.CSSProperties}
                />
              </div>
            </div>

            {/* Optional Fields Accordion */}
            {hasOptionalFields && (
              <div className={`rounded-2xl border overflow-hidden transition-all duration-300 ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
                <button
                  type="button"
                  onClick={() => setShowOptional(v => !v)}
                  className={`w-full flex items-center justify-between px-4 py-3.5 transition-colors ${
                    isDark ? 'hover:bg-white/5' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`text-[12px] font-bold uppercase tracking-wider ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      Additional Details
                    </span>
                    {filledOptional > 0 && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: `${accentColor}20`, color: accentColor }}>
                        {filledOptional} filled
                      </span>
                    )}
                  </div>
                  <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isDark ? 'text-slate-500' : 'text-slate-400'} ${showOptional ? 'rotate-180' : ''}`} />
                </button>

                {showOptional && (
                  <div className={`px-4 pb-5 space-y-4 border-t pt-4 ${isDark ? 'border-white/10 bg-white/[0.02]' : 'border-slate-100 bg-slate-50/50'}`}>

                    {/* Address Fields */}
                    {showAddress && (
                      <>
                        <div className="space-y-1.5">
                          <label className={`text-[11px] font-bold uppercase tracking-wider ml-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Service Address</label>
                          <div className="relative">
                            <MapPin className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none z-10 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                            <input
                              type="text"
                              value={formData.address_line_1}
                              onChange={e => setFormData({ ...formData, address_line_1: e.target.value })}
                              placeholder="123 Main St"
                              className={`${inputClass} pl-11 focus:ring-2 focus:ring-offset-0 focus:border-transparent`}
                              style={{ '--tw-ring-color': `${accentColor}80` } as React.CSSProperties}
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                          <div className="space-y-1.5">
                            <label className={`text-[11px] font-bold uppercase tracking-wider ml-1 truncate ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>City</label>
                            <input
                              type="text"
                              value={formData.city}
                              onChange={e => setFormData({ ...formData, city: e.target.value })}
                              placeholder="City"
                              className={`${inputClass} text-sm focus:ring-2 focus:ring-offset-0 focus:border-transparent`}
                              style={{ '--tw-ring-color': `${accentColor}80` } as React.CSSProperties}
                            />
                          </div>
                          <div className="space-y-1.5">
                            <label className={`text-[11px] font-bold uppercase tracking-wider ml-1 truncate ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Zip Code</label>
                            <div className="relative">
                              <MapPin className={`absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                              <input
                                type="text"
                                value={formData.zip_code}
                                onChange={e => setFormData({ ...formData, zip_code: e.target.value.replace(/\D/g, '').slice(0, 5) })}
                                placeholder="12345"
                                maxLength={5}
                                className={`${inputClass} pl-9 text-sm focus:ring-2 focus:ring-offset-0 focus:border-transparent`}
                                style={{ '--tw-ring-color': `${accentColor}80` } as React.CSSProperties}
                              />
                            </div>
                          </div>
                          <div className="space-y-1.5">
                            <label className={`text-[11px] font-bold uppercase tracking-wider ml-1 truncate ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Unit / Apt</label>
                            <div className="relative">
                              <Home className={`absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                              <input
                                type="text"
                                value={formData.address_line_2}
                                onChange={e => setFormData({ ...formData, address_line_2: e.target.value })}
                                placeholder="Apt 4B"
                                className={`${inputClass} pl-9 text-sm focus:ring-2 focus:ring-offset-0 focus:border-transparent`}
                                style={{ '--tw-ring-color': `${accentColor}80` } as React.CSSProperties}
                              />
                            </div>
                          </div>
                        </div>
                      </>
                    )}

                    {/* Date & Time */}
                    {(showDate || showTime) && (
                      <div className="grid grid-cols-2 gap-3">
                        {showDate && (
                          <div className="space-y-1.5 min-w-0 overflow-hidden">
                            <label className={`text-[11px] font-bold uppercase tracking-wider ml-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Preferred Date</label>
                            <div className="relative">
                              <Calendar className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                              <input
                                type="date"
                                value={formData.preferred_date}
                                onChange={(e) => setFormData({ ...formData, preferred_date: e.target.value })}
                                style={{ colorScheme: isDark ? 'dark' : 'light', '--tw-ring-color': `${accentColor}80` } as React.CSSProperties}
                                className={`${inputClass} pl-9 text-sm w-full focus:ring-2 focus:ring-offset-0 focus:border-transparent [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:w-full`}
                              />
                            </div>
                          </div>
                        )}
                        {showTime && (
                          <div className="space-y-1.5">
                            <label className={`text-[11px] font-bold uppercase tracking-wider ml-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Preferred Time</label>
                            <div className="relative">
                              <Clock className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                              <input 
                                type="text" 
                                placeholder="Morning" 
                                value={formData.preferred_time}
                                onChange={(e) => setFormData({ ...formData, preferred_time: e.target.value })}
                                className={`${inputClass} pl-9 text-sm focus:ring-2 focus:ring-offset-0 focus:border-transparent`} 
                                style={{ '--tw-ring-color': `${accentColor}80` } as React.CSSProperties}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Lead Source */}
                    {showLeadSource && (
                      <div className="space-y-1.5">
                        <label className={`text-[11px] font-bold uppercase tracking-wider ml-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>How Did They Hear?</label>
                        <div className="relative">
                          <Megaphone className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                          <select 
                            value={formData.lead_source}
                            onChange={(e) => setFormData({ ...formData, lead_source: e.target.value })}
                            className={`${inputClass} pl-11 pr-10 appearance-none cursor-pointer focus:ring-2 focus:ring-offset-0 focus:border-transparent`}
                            style={{ '--tw-ring-color': `${accentColor}80` } as React.CSSProperties}
                          >
                            <option value="" className={isDark ? 'bg-[#0A0C14]' : 'bg-white'}>Select...</option>
                            <option value="website" className={isDark ? 'bg-[#0A0C14]' : 'bg-white'}>Website / Google Search</option>
                            <option value="facebook" className={isDark ? 'bg-[#0A0C14]' : 'bg-white'}>Facebook</option>
                            <option value="instagram" className={isDark ? 'bg-[#0A0C14]' : 'bg-white'}>Instagram</option>
                            <option value="google_ads" className={isDark ? 'bg-[#0A0C14]' : 'bg-white'}>Google Ads</option>
                            <option value="referral" className={isDark ? 'bg-[#0A0C14]' : 'bg-white'}>Referral</option>
                            <option value="yard_sign" className={isDark ? 'bg-[#0A0C14]' : 'bg-white'}>Yard Sign</option>
                            <option value="truck" className={isDark ? 'bg-[#0A0C14]' : 'bg-white'}>Saw your truck</option>
                            <option value="other" className={isDark ? 'bg-[#0A0C14]' : 'bg-white'}>Other</option>
                          </select>
                          <ChevronDown className={`absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                        </div>
                      </div>
                    )}

                    {/* Custom Questions */}
                    {customQuestions.map((q: any) => (
                      <div key={q.id} className="space-y-1.5">
                        <label className={`text-[11px] font-bold uppercase tracking-wider ml-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                          {q.label} {q.required && <span className="text-red-400">*</span>}
                        </label>
                        {q.type === 'text' && (
                          <input 
                            type="text" 
                            placeholder="Enter answer..." 
                            value={formData.custom_answers[q.id] || ''}
                            onChange={(e) => setFormData({ ...formData, custom_answers: { ...formData.custom_answers, [q.id]: e.target.value } })}
                            className={`${inputClass} focus:ring-2 focus:ring-offset-0 focus:border-transparent`} 
                            style={{ '--tw-ring-color': `${accentColor}80` } as React.CSSProperties}
                          />
                        )}
                        {q.type === 'select' && (
                          <div className="relative">
                            <select 
                              value={formData.custom_answers[q.id] || ''}
                              onChange={(e) => setFormData({ ...formData, custom_answers: { ...formData.custom_answers, [q.id]: e.target.value } })}
                              className={`${inputClass} appearance-none cursor-pointer focus:ring-2 focus:ring-offset-0 focus:border-transparent`}
                              style={{ '--tw-ring-color': `${accentColor}80` } as React.CSSProperties}
                            >
                              <option value="" className={isDark ? 'bg-[#0A0C14]' : 'bg-white'}>Select...</option>
                              {q.options?.map((opt: string) => (
                                <option key={opt} value={opt} className={isDark ? 'bg-[#0A0C14]' : 'bg-white'}>{opt}</option>
                              ))}
                            </select>
                            <ChevronDown className={`absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                          </div>
                        )}
                        {q.type === 'checkbox' && (
                          <div className="flex gap-2.5">
                            {['Yes', 'No'].map(opt => (
                              <button 
                                key={opt} 
                                type="button"
                                onClick={() => setFormData({ ...formData, custom_answers: { ...formData.custom_answers, [q.id]: opt } })}
                                className={`flex-1 py-2.5 rounded-xl border text-sm font-bold transition-all duration-200 ${
                                  formData.custom_answers[q.id] === opt
                                    ? 'border-transparent shadow-sm'
                                    : isDark ? 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10' : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                                }`}
                                style={formData.custom_answers[q.id] === opt ? { backgroundColor: accentColor, color: accentTextColor } : undefined}
                              >
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

            {/* Notification Toggles */}
            <div className="flex flex-col gap-3.5 pt-2 pb-2">
              <label className="flex items-center gap-3 cursor-pointer group w-fit">
                <div 
                  className={`w-11 h-6 rounded-full transition-colors flex-shrink-0 relative border ${
                    notifyOwner ? 'border-transparent' : isDark ? 'bg-white/10 border-white/5' : 'bg-slate-200 border-slate-300'
                  }`}
                  style={notifyOwner ? { backgroundColor: accentColor } : {}}
                  onClick={() => setNotifyOwner(!notifyOwner)}
                >
                  <div className={`absolute top-[2px] bottom-[2px] w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${notifyOwner ? 'translate-x-[20px]' : 'translate-x-[2px]'}`} />
                </div>
                <span className={`text-[13px] font-medium transition-colors ${isDark ? 'text-slate-300 group-hover:text-white' : 'text-slate-600 group-hover:text-slate-900'}`}>
                  Notify team of new lead
                </span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer group w-fit">
                <div 
                  className={`w-11 h-6 rounded-full transition-colors flex-shrink-0 relative border ${
                    notifyCustomer ? 'border-transparent' : isDark ? 'bg-white/10 border-white/5' : 'bg-slate-200 border-slate-300'
                  }`}
                  style={notifyCustomer ? { backgroundColor: accentColor } : {}}
                  onClick={() => setNotifyCustomer(!notifyCustomer)}
                >
                  <div className={`absolute top-[2px] bottom-[2px] w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${notifyCustomer ? 'translate-x-[20px]' : 'translate-x-[2px]'}`} />
                </div>
                <span className={`text-[13px] font-medium transition-colors ${isDark ? 'text-slate-300 group-hover:text-white' : 'text-slate-600 group-hover:text-slate-900'}`}>
                  Send confirmation to customer
                </span>
              </label>
            </div>

            {/* Action Buttons */}
            <div className="pt-3 flex gap-3 pb-[env(safe-area-inset-bottom)] sm:pb-0">
              <button 
                type="button" 
                onClick={onClose}
                className={`hidden sm:block flex-1 px-6 py-3.5 rounded-xl border font-bold transition-all active:scale-95 ${
                  isDark ? 'border-white/10 text-white hover:bg-white/5' : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={loading}
                className="flex-[3] sm:flex-[2] px-6 py-3.5 rounded-xl font-bold transition-all duration-200 flex items-center justify-center gap-2 active:scale-95 text-[15px] shadow-lg disabled:opacity-50 disabled:active:scale-100"
                style={{ backgroundColor: accentColor, color: accentTextColor, boxShadow: `0 8px 24px ${accentColor}40` }}
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5 stroke-[2.5px]" />}
                Create Lead
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}