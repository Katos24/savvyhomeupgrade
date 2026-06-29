'use client';

import { ArrowLeft } from 'lucide-react';

export default function StandalonePageShell({
  companySlug, title, children,
}: {
  companySlug: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#0B0E14]">
      <div className="border-b border-white/[0.06]">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-3">
          <a
            href={`/${companySlug}/home`}
            className="flex items-center gap-1.5 text-[12.5px] text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Home
          </a>
          <span className="text-white/20">/</span>
          <span className="text-[12.5px] font-medium text-white">{title}</span>
        </div>
      </div>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <div className="bg-white rounded-lg border border-slate-200/80 p-4 sm:p-6">
          {children}
        </div>
      </div>
    </div>
  );
}