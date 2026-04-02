'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { BUSINESS_TYPES } from '@/lib/formCategories';
import { 
  ArrowRight, 
  ShieldCheck, 
  Zap, 
  Clock, 
  Lock,
  Loader2,
  X,
  UserPlus,
  AlertCircle,
  Link2,
  EyeOff, Eye
} from 'lucide-react';

interface CustomInputProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  type?: string;
  hint?: string;
  important?: boolean;
}

function SignupForm() {
  const searchParams = useSearchParams();
const plan = searchParams.get('plan') || 'starter';
  
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    companyName: '',
    slug: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    businessType: 'general',
    ownerName: '',
  });

  const handleCompanyNameChange = (name: string) => {
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .substring(0, 50);
    setFormData({ ...formData, companyName: name, slug });
  };

  const handlePhoneChange = (value: string) => {
    const digits = value.replace(/\D/g, '').substring(0, 10);
    let formatted = digits;
    if (digits.length > 0) {
      if (digits.length <= 3) formatted = `(${digits}`;
      else if (digits.length <= 6) formatted = `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
      else formatted = `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
    }
    setFormData({ ...formData, phone: formatted });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }
    
    const phoneDigits = formData.phone.replace(/\D/g, '');
    
    try {
      const response = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
body: JSON.stringify({ ...formData, phone: phoneDigits, plan }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        window.location.href = `/subscribe?plan=${plan}`;
      } else {
        setError(data.error || 'Failed to create account');
        setLoading(false);
      }
    } catch {
      setError('Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col lg:flex-row">
      {/* Sidebar: Branding */}
      <div className="hidden lg:flex lg:w-[400px] bg-slate-900 p-12 flex-col justify-between text-white sticky top-0 h-screen">
        <div>
          <div className="flex items-center gap-3 mb-16 cursor-pointer" onClick={() => router.push('/')}>
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center font-black text-xl">
              L2P
            </div>
            <span className="text-2xl font-black tracking-tighter text-white">Lead2Project</span>
          </div>

          <h2 className="text-4xl font-black leading-tight mb-8">
            The Operating System for <span className="text-indigo-400">Pro Services.</span>
          </h2>
          
          <div className="space-y-8">
            {[
              { icon: <Clock className="w-5 h-5 text-indigo-400" />, text: 'Start with a 14-day free trial' },
              { icon: <Zap className="w-5 h-5 text-indigo-400" />, text: 'Convert leads to projects in seconds' },
              { icon: <ShieldCheck className="w-5 h-5 text-indigo-400" />, text: 'Secure, automated client payments' },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-4 text-slate-300 font-medium">
                <div className="mt-1">{item.icon}</div>
                <span className="text-lg leading-snug">{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
          <p className="text-xs font-black uppercase tracking-widest text-indigo-400 mb-2">Step 1 of 2</p>
          <p className="text-sm text-slate-300 font-bold">Create your administrative account to get started.</p>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto px-4 py-8 md:px-12 lg:px-24">
        <div className="max-w-xl mx-auto">
          {/* Mobile Header */}
          <div className="flex lg:hidden items-center justify-between mb-10">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-black text-sm">
                L2P
              </div>
              <span className="font-black tracking-tighter text-slate-900">Lead2Project</span>
            </div>
          </div>

          <div className="mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full mb-4">
              <UserPlus className="w-3.5 h-3.5" />
              <span className="text-[10px] font-black uppercase tracking-widest">Account Setup</span>
            </div>
            <h1 className="text-3xl font-black text-slate-900 mb-2">Let's build your portal</h1>
            <p className="text-slate-500 font-medium text-sm">Enter your business details to create your secure workspace.</p>
          </div>

          {error && (
            <div className="bg-rose-50 border border-rose-100 text-rose-600 px-4 py-3 rounded-xl mb-6 text-sm font-bold flex items-center gap-2">
              <X className="w-4 h-4" /> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-5">
              <CustomInput 
                label="Company Name" 
                placeholder="e.g. Blueline Mechanical" 
                value={formData.companyName}
                onChange={handleCompanyNameChange}
                important
              />
              
           {/* THE DUAL PORTAL PREVIEW */}
           {/* THE PORTAL ARCHITECTURE PREVIEW */}
              {formData.slug && (
                <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-700">
                  <div className="relative space-y-3">
                    
                    {/* 1. PUBLIC INTAKE PORTAL */}
                    <div className="relative z-10 p-5 bg-white border-2 border-indigo-100 rounded-3xl shadow-sm overflow-hidden group">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-indigo-600 rounded-xl">
                          <Eye className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-indigo-600 leading-none mb-1">Public Intake Portal</p>
                          <p className="text-[9px] font-bold text-slate-400">Where customers request quotes & book projects</p>
                        </div>
                      </div>
                      
                      {/* URL Box - Handles long strings */}
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex items-center gap-2 overflow-hidden">
                        <Link2 className="w-4 h-4 text-slate-400 shrink-0" />
                        <code className="text-sm font-black text-slate-700 break-all leading-tight">
                          lead2project.com/<span className="text-indigo-600">{formData.slug}</span>
                        </code>
                      </div>
                    </div>

                    {/* Connecting Arrow Line */}
                    <div className="absolute left-9 top-1/2 bottom-0 w-0.5 bg-dashed bg-slate-200 -z-0 h-20 border-l-2 border-dashed border-slate-200 ml-[-1px]" />

                    {/* 2. PRIVATE ADMIN DASHBOARD */}
                    <div className="relative z-10 p-5 bg-[#0F172A] border-2 border-slate-800 rounded-3xl shadow-xl overflow-hidden group">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-slate-700 rounded-xl">
                          <ShieldCheck className="w-4 h-4 text-emerald-400" />
                        </div>
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 leading-none mb-1">Internal Dashboard</p>
                          <p className="text-[9px] font-bold text-slate-500">Where you manage leads and convert to projects</p>
                        </div>
                      </div>

                      {/* URL Box */}
                      <div className="bg-white/5 p-3 rounded-xl border border-white/5 flex items-center gap-2 overflow-hidden">
                        <Lock className="w-4 h-4 text-slate-500 shrink-0" />
                        <code className="text-sm font-black text-white break-all leading-tight">
                          lead2project.com/<span className="text-indigo-400">{formData.slug}</span>/dashboard
                        </code>
                      </div>
                    </div>
                  </div>

                  {/* Warning Callout */}
                  <div className="flex items-start gap-2.5 px-4 py-3 bg-amber-50 rounded-2xl border border-amber-100">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <p className="text-[11px] font-bold text-amber-800 leading-snug">
                      Your slug <span className="underline font-black text-amber-900">"{formData.slug}"</span> is permanent. 
                      Clients will see this name when they submit requests.
                    </p>
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider ml-1">Business Type</label>
                <select 
                  value={formData.businessType}
                  onChange={(e) => setFormData({ ...formData, businessType: e.target.value })}
                  className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 outline-none transition-all font-bold text-slate-700 appearance-none cursor-pointer text-base"
                >
                  {BUSINESS_TYPES.map(type => (
                    <option key={type.value} value={type.value}> {type.label}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <CustomInput 
                  label="Contact Name" 
                  placeholder="John Smith" 
                  value={formData.ownerName}
                  onChange={(v) => setFormData({...formData, ownerName: v})}
                />
                <CustomInput 
                  label="Phone Number" 
                  placeholder="(555) 000-0000" 
                  value={formData.phone}
                  onChange={handlePhoneChange}
                />
              </div>

              <CustomInput 
                label="Work Email Address" 
                type="email"
                placeholder="john@company.com" 
                value={formData.email}
                onChange={(v) => setFormData({...formData, email: v})}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <CustomInput 
                  label="Create Password" 
                  type="password"
                  placeholder="••••••••" 
                  value={formData.password}
                  onChange={(v) => setFormData({...formData, password: v})}
                  hint="6+ characters"
                />
                <CustomInput 
                  label="Confirm Password" 
                  type="password"
                  placeholder="••••••••" 
                  value={formData.confirmPassword}
                  onChange={(v) => setFormData({...formData, confirmPassword: v})}
                />
              </div>
            </div>

            <div className="pt-4">
              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-4 rounded-xl shadow-lg shadow-indigo-200 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    Continue to Plan Selection
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>

            <div className="flex flex-col items-center gap-6 py-4">
              <div className="flex items-center gap-2">
                <Lock className="w-3.5 h-3.5 text-slate-300" />
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                  Secure Identity Management
                </p>
              </div>
              <p className="text-center text-slate-500 text-sm">
                Already registered?{' '}
                <a href="/login" className="text-indigo-600 font-black hover:underline">Log in here</a>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

function CustomInput({ label, value, onChange, placeholder, type = "text", hint, important }: CustomInputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';

  return (
    <div className="space-y-1.5 flex-1">
      <div className="flex justify-between items-center ml-1">
        <label className={`text-[11px] font-black uppercase tracking-wider ${important ? 'text-indigo-500' : 'text-slate-400'}`}>
          {label} {important && "— Check spelling"}
        </label>
        {hint && <span className="text-[10px] font-bold text-slate-300">{hint}</span>}
      </div>
      <div className="relative">
        <input
          type={isPassword ? (showPassword ? 'text' : 'password') : type}
          required
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full px-4 py-3.5 bg-slate-50 border rounded-xl focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 outline-none transition-all font-bold text-slate-700 placeholder:text-slate-300 placeholder:font-medium text-base shadow-sm ${isPassword ? 'pr-12' : ''} ${important ? 'border-indigo-200' : 'border-slate-200'}`}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        )}
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-indigo-600" /></div>}>
      <SignupForm />
    </Suspense>
  );
}