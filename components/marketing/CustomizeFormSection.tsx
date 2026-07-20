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
} from 'lucide-react';

const font = "'Nunito', sans-serif";

// Fixed brand navy stays constant; second gradient stop is the roofing
// example's accent color — matches the treatment used in DashboardShowcase.
const BRAND_NAVY = '#0B3C6D';
const ACCENT = '#0F766E';
const VERIFIED_GREEN = '#166534';

const labelClass = 'text-[10px] font-black text-gray-700 uppercase tracking-[0.12em] ml-1';
const inputClass =
  'w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-medium text-gray-900';

function CalloutTag({ icon: Icon, text, className = '' }: { icon: any; text: string; className?: string }) {
  return (
    <div
      className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-slate-200 shadow-sm transition-all duration-300 hover:border-slate-300 ${className}`}
    >
      <Icon size={14} className="text-emerald-600" />
      <span className="text-xs font-bold text-slate-700" style={{ fontFamily: font }}>{text}</span>
    </div>
  );
}

// ==========================================
// Real, static replica of the actual UploadFormStepOne styling — shows the
// genuine roofing intake form a customer would fill out, not a fake demo.
// ==========================================

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
  const selected = 0;

  return (
    <div className="w-full max-w-md mx-auto" style={{ fontFamily: font }}>
      <div className="flex items-center gap-3 justify-center mb-4">
        <div className={`flex items-center gap-2 ${step === 2 ? 'opacity-40' : ''}`}>
          <div
            className="w-6 h-6 rounded-full text-[11px] font-black flex items-center justify-center text-white shadow-sm"
            style={{ background: step === 1 ? color1 : '#9ca3af' }}
          >
            {step === 2 ? <Check className="w-3 h-3" strokeWidth={3} /> : 1}
          </div>
          <span className="text-xs font-black text-gray-800 uppercase tracking-widest">Your Info</span>
        </div>
        <div className="flex-1 max-w-[40px] h-px bg-gray-200" />
        <div className={`flex items-center gap-2 ${step === 1 ? 'opacity-40' : ''}`}>
          <div
            className="w-6 h-6 rounded-full text-[11px] font-black flex items-center justify-center text-white shadow-sm"
            style={{ background: step === 2 ? color1 : '#e5e7eb', color: step === 2 ? '#fff' : '#6b7280' }}
          >
            2
          </div>
          <span className="text-xs font-bold text-gray-800 uppercase tracking-widest">Details</span>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-gray-200 shadow-md overflow-hidden">
        <div className="px-5 py-4 flex items-center gap-4" style={{ backgroundColor: color2 }}>
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white flex items-center justify-center shrink-0 p-2 shadow-sm">
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
            <p className="text-white/80 uppercase tracking-widest font-extrabold text-[9px] mt-1">
              Work Request Form
            </p>
          </div>
        </div>

        {step === 1 && (
          <>
            <div className="p-5 space-y-4">
              <div className="space-y-1.5">
                <label className={labelClass}>Full Name</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                  <div className={inputClass}>Jennifer L.</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="space-y-1.5">
                  <label className={labelClass}>Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                    <div className={`${inputClass} truncate`}>jennifer@example.com</div>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className={labelClass}>Phone</label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                    <div className={`${inputClass} pr-9`}>(555) 382-9102</div>
                    <div
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: `${VERIFIED_GREEN}20` }}
                    >
                      <Check className="w-3 h-3" strokeWidth={3} style={{ color: VERIFIED_GREEN }} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className={labelClass}>Service Needed</label>
                <div className="flex flex-wrap gap-1.5">
                  {serviceOptions.map((opt, i) => {
                    const isSelected = i === selected;
                    return (
                      <div
                        key={opt}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold border ${
                          isSelected
                            ? 'text-white border-transparent shadow-sm'
                            : 'bg-gray-50 text-gray-500 border-gray-200'
                        }`}
                        style={isSelected ? { background: `linear-gradient(135deg, ${color1}, ${color2})` } : undefined}
                      >
                        {opt}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className={labelClass}>Tell Us About Your Project</label>
                <div className="relative">
                  <FileText className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-300" />
                  <div className={`${inputClass} min-h-[64px] leading-relaxed`}>
                    Looking for help with roof repair at my property. Please reach out to schedule a time to take a look.
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className={labelClass}>Site Photos</label>
                <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-2xl p-2.5">
                  <img
                    src="/images/roof-damage.webp"
                    alt="Uploaded site photo"
                    className="w-14 h-14 rounded-xl object-cover border border-gray-200 shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-gray-800 truncate">roof-damage.webp</p>
                    <p
                      className="text-[10px] font-black uppercase tracking-wider mt-0.5"
                      style={{ color: VERIFIED_GREEN }}
                    >
                      Attached successfully
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-5 pb-5">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="w-full flex items-center justify-center gap-2 text-white py-3.5 rounded-2xl font-black text-sm shadow-lg transition-transform active:scale-[0.98]"
                style={{ background: `linear-gradient(135deg, ${color1}, ${color2})` }}
              >
                Continue
                <ChevronRight className="w-4 h-4" />
              </button>
              <p className="text-center mt-2.5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                Continue To Additional Details (Optional)
              </p>
            </div>
        </>
        )}

        {step === 2 && (
          <>
            <div className="p-5 space-y-4">
              <div className="space-y-1.5">
                <label className={labelClass}>Service Address</label>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                  <div className={inputClass}>42 Maple Ave, Brooklyn NY</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="space-y-1.5">
                  <label className={labelClass}>Preferred Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                    <div className={inputClass}>Jul 22, 2026</div>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className={labelClass}>Preferred Time</label>
                  <div className="relative">
                    <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                    <div className={inputClass}>Morning</div>
                  </div>
                </div>
              </div>

             <div className="space-y-4 pt-1">
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.12em]">
                  A few more details for this job
                </p>
                {MOCK_CUSTOM_QUESTIONS.map((q) => (
                  <div key={q.id} className="space-y-1.5">
                    <label className={labelClass}>
                      {q.label}
                      {q.required && <span className="text-red-500 ml-0.5">*</span>}
                    </label>
                    {q.type === 'text' && (
                      <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-medium text-gray-400">
                        Type your answer...
                      </div>
                    )}
                    {q.type === 'select' && (
                      <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-medium text-gray-700">
                        {q.options?.[0]}
                      </div>
                    )}
                    {q.type === 'checkbox' && (
                      <div className="flex gap-2.5">
                        <div className="px-4 py-2 rounded-xl border border-gray-200 bg-white text-xs font-bold text-gray-500">Yes</div>
                        <div className="px-4 py-2 rounded-xl border border-gray-200 bg-white text-xs font-bold text-gray-500">No</div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="px-5 pb-5 flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex items-center justify-center gap-1.5 px-4 py-3.5 rounded-2xl font-black text-sm text-gray-600 border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                className="flex-1 flex items-center justify-center gap-2 text-white py-3.5 rounded-2xl font-black text-sm shadow-lg transition-transform active:scale-[0.98]"
                style={{ background: `linear-gradient(135deg, ${color1}, ${color2})` }}
              >
                Submit Request
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
        </>
        )}

        {step === 3 && (
          <div className="p-10 flex flex-col items-center text-center">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mb-5"
              style={{ backgroundColor: `${VERIFIED_GREEN}18` }}
            >
              <Check className="w-8 h-8" strokeWidth={3} style={{ color: VERIFIED_GREEN }} />
            </div>
            <h4 className="text-lg font-black text-gray-900 mb-2">Request sent!</h4>
            <p className="text-sm font-bold text-gray-500 leading-relaxed max-w-xs">
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
// Main Exported Component
// ==========================================
export default function CustomizeFormSection() {
  return (
    <section className="relative overflow-hidden py-24 sm:py-28 lg:py-36 bg-slate-100">
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(#000 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />

      <div className="relative z-10 max-w-6xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-[45%_55%] gap-12 lg:gap-16 items-center">

          {/* LEFT */}
          <div className="order-1 lg:order-last flex flex-col justify-center">
            <div className="flex items-center gap-3 mb-5">
              <span
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-xl font-black text-white"
                style={{ backgroundColor: ACCENT }}
              >
                1
              </span>
              <span
                className="text-[10px] sm:text-xs font-black uppercase tracking-[0.25em] text-slate-500"
                style={{ fontFamily: font }}
              >
                Sign up and build your form
              </span>
            </div>

            <h2
              className="text-4xl sm:text-5xl text-slate-950 font-black leading-[1.05] tracking-tight mb-0 lg:mb-5"
              style={{ fontFamily: font }}
            >
              Sign up, then{' '}
              <span className="block pt-1" style={{ color: ACCENT }}>
                build your intake form.
              </span>
            </h2>

            <div className="hidden lg:block">
              <p
                className="text-slate-600 font-bold text-base sm:text-lg mb-8 mt-5 max-w-sm leading-relaxed"
                style={{ fontFamily: font }}
              >
                Add custom questions to capture exactly what your business needs from a lead. Customers can attach photos and short videos right on the form. No developer required.
              </p>
              <div className="flex flex-wrap gap-2.5 max-w-md">
                <CalloutTag icon={ListChecks} text="Custom questions for your business" />
                <CalloutTag icon={Camera} text="Photo & short video attachments" />
                <CalloutTag icon={MapPin} text="Clean address capture" />
                <CalloutTag icon={Palette} text="Your branding & logo (Basic plan)" />
              </div>
            </div>
          </div>

          {/* RIGHT — the real form */}
          <div className="order-2 lg:order-first flex flex-col items-center w-full">
            <RealisticFormPreview />

            <div className="block lg:hidden w-full mt-8">
              <p
                className="text-slate-600 font-bold text-base leading-relaxed mb-6"
                style={{ fontFamily: font }}
              >
                Add custom questions to capture exactly what your business needs from a lead. Customers can attach photos and short videos right on the form. No developer required.
              </p>
              <div className="flex flex-wrap gap-2.5">
                <CalloutTag icon={ListChecks} text="Custom questions for your business" />
                <CalloutTag icon={Camera} text="Photo & short video attachments" />
                <CalloutTag icon={MapPin} text="Clean address capture" />
                <CalloutTag icon={Palette} text="Your branding & logo (Basic plan)" />
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}