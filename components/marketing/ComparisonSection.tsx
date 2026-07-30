'use client';

import { Check } from 'lucide-react';

const font = "'Nunito', sans-serif";

const FEATURES = [
  'Scheduling & Quoting',
  'Reusable Estimating Templates',
  'Instant Field Invoicing',
  'Automated Appointment Reminders',
  'Online Client Payments',
  'Job & Revenue Tracking',
];

export default function FeaturesSection() {
  return (
    <section
      style={{ fontFamily: font }}
      className="bg-white py-20 sm:py-28 px-6 sm:px-12 border-b border-slate-200/80"
    >
      <div className="max-w-6xl mx-auto grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
        
        {/* Left Column: Heading & Subtitle */}
        <div className="lg:col-span-6 space-y-6">
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.05] text-slate-900">
            <span className="text-teal-700 block mb-1">Software built</span>
            for trade & field businesses.
          </h2>
          <p className="text-slate-600 font-semibold text-base sm:text-lg leading-relaxed max-w-xl">
            Run your entire workflow—from field estimate to bank deposit—without losing track of leads or chasing down payments.
          </p>
        </div>

        {/* Right Column: Rounded Pill Feature List */}
        <div className="lg:col-span-6 space-y-3.5">
          {FEATURES.map((feature) => (
            <div
              key={feature}
              className="flex items-center gap-4 bg-teal-50/70 border border-teal-100/80 rounded-full px-6 py-4 transition-all duration-200 hover:bg-teal-100/50 hover:border-teal-200"
            >
              <div className="w-8 h-8 rounded-full bg-teal-700 flex items-center justify-center shrink-0 shadow-sm">
                <Check className="w-4 h-4 text-white stroke-[3]" />
              </div>
              <span className="text-slate-900 font-extrabold text-base sm:text-lg">
                {feature}
              </span>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}