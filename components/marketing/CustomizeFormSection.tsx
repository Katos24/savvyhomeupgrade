'use client';

import { useState } from 'react';
import {
  MapPin,
  Camera,
  Palette,
  ListChecks,
  User,
  Mail,
  Phone,
  FileText,
  Check,
  ChevronRight,
  ChevronLeft,
  Calendar,
  Clock,
  Sparkles,
  ShieldCheck,
  ChevronDown,
  Clock3,
  UserPlus,
} from 'lucide-react';

const font = "'Nunito', sans-serif";

const BRAND_NAVY = '#0B3C6D';
const ACCENT = '#0F766E';
const VERIFIED_GREEN = '#166534';

const labelClass = 'text-[11px] font-black text-gray-700 uppercase tracking-[0.1em] block mb-1';
const inputClass =
  'w-full pl-10 pr-3 py-2.5 sm:py-3 bg-gray-50 border border-gray-200 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-500/30 transition-all';

function CalloutTag({ icon: Icon, text, className = '' }: { icon: any; text: string; className?: string }) {
  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-slate-200 shadow-sm transition-all duration-300 hover:border-teal-500/50 hover:shadow-md ${className}`}
    >
      <Icon size={14} className="text-teal-700 shrink-0" />
      <span className="text-xs font-bold text-slate-800" style={{ fontFamily: font }}>{text}</span>
    </div>
  );
}

const MOCK_CUSTOM_QUESTIONS = [
  { id: 'q1', label: 'Do you have a copy of your last roof inspection?', type: 'text' as const, required: true },
  { id: 'q2', label: 'How many stories is the property?', type: 'select' as const, required: true, options: ['1 story', '2 stories', '3+ stories'] },
  { id: 'q3', label: 'Is anyone home during repairs?', type: 'checkbox' as const, required: false },
];

function RealisticFormPreview() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const color1 = BRAND_NAVY;
  const color2 = ACCENT;

  const serviceOptions = ['Roof Repair', 'Roof Replacement', 'Leak Detection', 'Inspection', 'Gutter Work'];
  const [selectedService, setSelectedService] = useState('Roof Repair');

  return (
    <div className="w-full max-w-md mx-auto relative z-10" style={{ fontFamily: font }}>
      
      {/* Wizard Progress Stepper */}
      <div className="flex items-center gap-2 sm:gap-3 justify-center mb-4 px-2">
        <div className={`flex items-center gap-1.5 ${step === 2 ? 'opacity-50' : ''}`}>
          <div
            className="w-5 h-5 sm:w-6 sm:h-6 rounded-full text-[10px] sm:text-[11px] font-black flex items-center justify-center text-white shadow-sm shrink-0"
            style={{ background: step === 1 ? color1 : VERIFIED_GREEN }}
          >
            {step === 2 ? <Check className="w-3 h-3" strokeWidth={3} /> : 1}
          </div>
          <span className="text-[11px] sm:text-xs font-black text-gray-800 uppercase tracking-wider">Your Info</span>
        </div>

        <div className="flex-1 max-w-[30px] sm:max-w-[40px] h-0.5 bg-gray-200" />

        <div className={`flex items-center gap-1.5 ${step === 1 ? 'opacity-50' : ''}`}>
          <div
            className="w-5 h-5 sm:w-6 sm:h-6 rounded-full text-[10px] sm:text-[11px] font-black flex items-center justify-center text-white shadow-sm shrink-0"
            style={{ background: step === 2 ? color1 : '#e5e7eb', color: step === 2 ? '#fff' : '#6b7280' }}
          >
            2
          </div>
          <span className="text-[11px] sm:text-xs font-black text-gray-800 uppercase tracking-wider">Details</span>
        </div>
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-gray-200 shadow-xl overflow-hidden">
        
        {/* Form Header */}
        <div className="px-4 py-3.5 sm:px-5 sm:py-4 flex items-center gap-3 sm:gap-4" style={{ backgroundColor: color2 }}>
          <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-white flex items-center justify-center shrink-0 p-1.5 shadow-sm">
            <img
              src="/images/ridgelinelogo.webp"
              alt="Ridge Line Roofing"
              className="w-full h-full object-contain"
            />
          </div>
          <div className="min-w-0">
            <h4 className="text-white font-black text-base sm:text-lg leading-tight truncate">
              Ridge Line Roofing
            </h4>
            <p className="text-white/80 uppercase tracking-widest font-extrabold text-[9px] sm:text-[10px] mt-0.5">
              Work Request Form
            </p>
          </div>
        </div>

        {/* STEP 1: Basic Contact & Service Selection */}
        {step === 1 && (
          <>
            <div className="p-4 sm:p-5 space-y-3.5 sm:space-y-4">
              
              {/* Full Name */}
              <div>
                <label className={labelClass}>Full Name</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    defaultValue="Jennifer L."
                    className={inputClass}
                  />
                </div>
              </div>

              {/* Email & Phone Split (Stacked on mobile so phone fits properly) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-2.5">
                <div>
                  <label className={labelClass}>Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="email"
                      defaultValue="jennifer@example.com"
                      className={inputClass}
                    />
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="tel"
                      defaultValue="(555) 382-9102"
                      className={`${inputClass} pr-8`}
                    />
                    <div
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full flex items-center justify-center shrink-0"
                      style={{ backgroundColor: `${VERIFIED_GREEN}20` }}
                    >
                      <Check className="w-2.5 h-2.5" strokeWidth={3} style={{ color: VERIFIED_GREEN }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Service Selection */}
              <div>
                <label className={labelClass}>Service Needed</label>
                <div className="flex flex-wrap gap-1.5">
                  {serviceOptions.map((opt) => {
                    const isSelected = opt === selectedService;
                    return (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setSelectedService(opt)}
                        className={`px-2.5 py-1.5 sm:px-3 sm:py-1.5 rounded-xl text-xs font-bold border transition-all ${
                          isSelected
                            ? 'text-white border-transparent shadow-sm'
                            : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                        }`}
                        style={isSelected ? { background: `linear-gradient(135deg, ${color1}, ${color2})` } : undefined}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Project Description */}
              <div>
                <label className={labelClass}>Tell Us About Your Project</label>
                <div className="relative">
                  <FileText className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-400" />
                  <textarea
                    rows={2}
                    defaultValue="Looking for help with roof repair at my property. Please reach out to schedule an estimate."
                    className={`${inputClass} pl-10 pt-2.5 min-h-[68px] leading-relaxed resize-none`}
                  />
                </div>
              </div>

              {/* Site Photo Attachment */}
              <div>
                <label className={labelClass}>Site Photos</label>
                <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-xl sm:rounded-2xl p-2.5">
                  <img
                    src="/images/roof-damage.webp"
                    alt="Uploaded site photo"
                    className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg sm:rounded-xl object-cover border border-gray-200 shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-gray-800 truncate">roof-damage.webp</p>
                    <p
                      className="text-[10px] font-black uppercase tracking-wider mt-0.5 flex items-center gap-1"
                      style={{ color: VERIFIED_GREEN }}
                    >
                      <Check className="w-3 h-3" strokeWidth={3} /> Attached successfully
                    </p>
                  </div>
                </div>
              </div>

            </div>

            {/* Bottom Actions */}
            <div className="px-4 pb-4 sm:px-5 sm:pb-5">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="w-full flex items-center justify-center gap-2 text-white py-3 sm:py-3.5 rounded-xl sm:rounded-2xl font-black text-xs sm:text-sm uppercase tracking-wider shadow-lg transition-transform active:scale-[0.98]"
                style={{ background: `linear-gradient(135deg, ${color1}, ${color2})` }}
              >
                Continue to Details
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </>
        )}

        {/* STEP 2: Address & Custom Business Questions */}
        {step === 2 && (
          <>
            <div className="p-4 sm:p-5 space-y-3.5 sm:space-y-4">
              
              {/* Service Address */}
              <div>
                <label className={labelClass}>Service Address</label>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    defaultValue="42 Maple Ave, Brooklyn NY"
                    className={inputClass}
                  />
                </div>
              </div>

              {/* Date & Time Preferences */}
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className={labelClass}>Preferred Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      defaultValue="Jul 22, 2026"
                      className={inputClass}
                    />
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Preferred Time</label>
                  <div className="relative">
                    <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      defaultValue="Morning"
                      className={inputClass}
                    />
                  </div>
                </div>
              </div>

              {/* Custom Questions Section */}
              <div className="space-y-3 pt-1 border-t border-gray-100">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">
                  Custom Questions
                </p>

                {MOCK_CUSTOM_QUESTIONS.map((q) => (
                  <div key={q.id}>
                    <label className={labelClass}>
                      {q.label}
                      {q.required && <span className="text-red-500 ml-0.5">*</span>}
                    </label>

                    {q.type === 'text' && (
                      <input
                        type="text"
                        placeholder="Type your answer..."
                        className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-800 focus:outline-none"
                      />
                    )}

                    {q.type === 'select' && (
                      <div className="relative">
                        <select className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-800 appearance-none focus:outline-none">
                          {q.options?.map((opt) => (
                            <option key={opt}>{opt}</option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                      </div>
                    )}

                    {q.type === 'checkbox' && (
                      <div className="flex gap-2">
                        <label className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl border border-gray-200 bg-gray-50 text-xs font-bold text-gray-700 cursor-pointer">
                          <input type="radio" name={q.id} className="accent-teal-600" defaultChecked />
                          Yes
                        </label>
                        <label className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl border border-gray-200 bg-gray-50 text-xs font-bold text-gray-700 cursor-pointer">
                          <input type="radio" name={q.id} className="accent-teal-600" />
                          No
                        </label>
                      </div>
                    )}
                  </div>
                ))}
              </div>

            </div>

            {/* Bottom Actions */}
            <div className="px-4 pb-4 sm:px-5 sm:pb-5 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex items-center justify-center gap-1 px-3.5 py-3 rounded-xl sm:rounded-2xl font-black text-xs sm:text-sm text-gray-600 border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </button>

              <button
                type="button"
                onClick={() => setStep(3)}
                className="flex-1 flex items-center justify-center gap-2 text-white py-3 sm:py-3.5 rounded-xl sm:rounded-2xl font-black text-xs sm:text-sm uppercase tracking-wider shadow-lg transition-transform active:scale-[0.98]"
                style={{ background: `linear-gradient(135deg, ${color1}, ${color2})` }}
              >
                Submit Request
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </>
        )}

        {/* STEP 3: Success Confirmation */}
        {step === 3 && (
          <div className="p-8 sm:p-10 flex flex-col items-center text-center">
            <div
              className="w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mb-4"
              style={{ backgroundColor: `${VERIFIED_GREEN}18` }}
            >
              <Check className="w-7 h-7 sm:w-8 sm:h-8" strokeWidth={3} style={{ color: VERIFIED_GREEN }} />
            </div>
            <h4 className="text-base sm:text-lg font-black text-gray-900 mb-1.5">Request Sent!</h4>
            <p className="text-xs sm:text-sm font-bold text-gray-600 leading-relaxed max-w-xs">
              Jennifer's request just landed on the Ridge Line Roofing dashboard — ready to quote and schedule.
            </p>
            <button
              type="button"
              onClick={() => setStep(1)}
              className="mt-6 text-xs font-black uppercase tracking-widest hover:underline"
              style={{ color: ACCENT }}
            >
              Watch it again
            </button>
          </div>
        )}

      </div>
    </div>
  );
}

// ==========================================
// Main Exported Section (Selling Points Update)
// ==========================================
export default function CustomizeFormSection() {
  return (
    <section className="relative overflow-hidden py-16 sm:py-24 lg:py-32 bg-slate-50 text-slate-900 border-t border-slate-200">
      
      {/* Subtle Light Pattern Background */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(#000 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />

      {/* Ambient Glow Effects */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] bg-teal-200/40 rounded-full blur-[100px] sm:blur-[140px] pointer-events-none" />
      <div className="absolute top-1/3 right-0 w-[250px] sm:w-[400px] h-[250px] sm:h-[400px] bg-blue-200/30 rounded-full blur-[100px] sm:blur-[140px] pointer-events-none" />

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-8 lg:px-12">
        {/* Changed items-center to items-start on lg to align elements to the top */}
        <div className="grid grid-cols-1 lg:grid-cols-[45%_55%] gap-8 lg:gap-16 items-start">

          {/* LEFT CONTENT (Update for Selling Points) */}
          <div className="order-1 lg:order-last flex flex-col justify-start text-left pt-2">
            <div className="flex items-center gap-2.5 mb-3 sm:mb-4">
              <span
                className="flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-xl text-sm font-black text-white shadow-md shadow-teal-700/20"
                style={{ backgroundColor: ACCENT }}
              >
                1
              </span>
              <span
                className="text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] text-teal-800"
                style={{ fontFamily: font }}
              >
                Zero-Code Client Intake
              </span>
            </div>

            <h2
              className="text-3xl sm:text-4xl lg:text-5xl text-slate-950 font-black leading-[1.1] tracking-tight mb-4"
              style={{ fontFamily: font }}
            >
              Stop chasing details. Let leads
              <span className="block pt-0.5" style={{ color: ACCENT }}>
                dispatch themselves.
              </span>
            </h2>

            <div className="hidden lg:block">
              <p
                className="text-slate-600 font-bold text-base sm:text-lg mb-6 max-w-md leading-relaxed"
                style={{ fontFamily: font }}
              >
                Turn your website into a 24/7 sales agent. Lead2Project's instant booking forms capture the exact job details, photos, and context you need to price the job—without you picking up the phone.
              </p>
              <div className="flex flex-wrap gap-2 max-w-md">
                <CalloutTag icon={ListChecks} text="Custom questions per job type" />
                <CalloutTag icon={Camera} text="Capture on-site CONTEXT immediately" />
                <CalloutTag icon={Clock3} text="Save HOURS on intake every week" />
                <CalloutTag icon={UserPlus} text="Impress clients with professional onboarding" />
              </div>
            </div>
          </div>

          {/* RIGHT — INTERACTIVE FORM WITH LIGHT GLASS CONTAINER */}
          <div className="order-2 lg:order-first flex flex-col items-center w-full relative">
            
            {/* Form Backing Frame */}
            <div className="w-full relative p-2.5 sm:p-6 bg-white/80 border border-slate-200/90 rounded-2xl sm:rounded-[2.5rem] shadow-xl backdrop-blur-md">
              
             

              {/* Form Component */}
              <RealisticFormPreview />

              {/* Responsive Footer Info */}
             <div className="mt-3 sm:mt-4 flex items-center justify-center gap-1.5 text-slate-500 text-[11px] sm:text-xs font-bold" style={{ fontFamily: font }}>
                <ShieldCheck size={14} className="text-teal-700 shrink-0" />
                <span>The first step to running everything from one place</span>
              </div>
            </div>

            {/* Mobile View Summary Below Form (Updated Selling Points) */}
            <div className="block lg:hidden w-full mt-6 text-left">
              <p
                className="text-slate-600 font-bold text-sm sm:text-base leading-relaxed mb-4"
                style={{ fontFamily: font }}
              >
                Stop losing time chasing down job details. Our zero-code intake forms give you everything you need—photos, address, context—immediately, so you can price jobs and dispatch crews faster.
              </p>
              <div className="flex flex-wrap gap-2">
                <CalloutTag icon={ListChecks} text="Custom questions" />
                <CalloutTag icon={Camera} text="On-site photos" />
                <CalloutTag icon={Clock3} text="Time-saver" />
                <CalloutTag icon={UserPlus} text="Pro onboarding" />
              </div>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}