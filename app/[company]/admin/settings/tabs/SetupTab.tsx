'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import {
  Check,
  ChevronRight,
  Copy,
  ExternalLink,
  CheckCircle2,
  Globe,
  Sliders,
} from 'lucide-react';

type ChecklistStep =
  | { label: string; description: string; done: boolean; kind: 'section'; section: string }
  | { label: string; description: string; done: boolean; kind: 'link'; href: string };

interface SetupTabProps {
  checklistSteps: ChecklistStep[];
  onNavigateSection: (section: string) => void;
  companySlug?: string;
}

export default function SetupTab({
  checklistSteps,
  onNavigateSection,
  companySlug: propSlug,
}: SetupTabProps) {
  const params = useParams();
  const [copied, setCopied] = useState(false);

  // Extract the actual route parameter if prop isn't directly passed
  const routeSlug = params?.companySlug as string | undefined;
  const slug = propSlug || routeSlug || '';

  const publicUrl = slug ? `https://lead2project.com/${slug}` : '';

  const doneCount = checklistSteps.filter((s) => s.done).length;
  const totalCount = checklistSteps.length;
  const allDone = totalCount > 0 && doneCount === totalCount;
  const percentComplete = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;

  const handleCopyLink = () => {
    if (!publicUrl) return;
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50/60 px-4 py-8 sm:px-8 lg:px-12 font-sans text-slate-900 antialiased">
      <div className="mx-auto max-w-4xl space-y-6 pb-12">

        {/* HEADER & PROGRESS ROW */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-slate-900">
                Workspace Setup
              </h1>
              {allDone && (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Complete
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Configure your business details and public booking parameters.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-white px-3.5 py-2 rounded-lg border border-slate-200 shadow-xs">
            <div className="text-right">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Completion</p>
              <p className="text-xs font-mono font-bold text-slate-900">{doneCount}/{totalCount} Steps ({percentComplete}%)</p>
            </div>
            <div className="h-2 w-24 rounded-full bg-slate-100 overflow-hidden border border-slate-200/60">
              <div
                className={`h-full transition-all duration-300 ${allDone ? 'bg-emerald-600' : 'bg-slate-900'}`}
                style={{ width: `${percentComplete}%` }}
              />
            </div>
          </div>
        </div>

      

        {/* CHECKLIST TABLE */}
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="px-5 py-3.5 bg-slate-50/80 border-b border-slate-200/80 flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
            <span>Action Required</span>
            <span>Status</span>
          </div>

          <div className="divide-y divide-slate-100">
            {checklistSteps.map((step, idx) => {
              const content = (
                <div className="flex items-center justify-between px-5 py-4 hover:bg-slate-50/60 transition-colors group cursor-pointer">
                  <div className="flex items-start gap-3.5 min-w-0 pr-4">
                    
                    {/* Status Box */}
                    <div
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-all mt-0.5 ${
                        step.done
                          ? 'border-emerald-600 bg-emerald-600 text-white'
                          : 'border-slate-300 bg-white group-hover:border-slate-400'
                      }`}
                    >
                      {step.done ? (
                        <Check className="h-3.5 w-3.5 stroke-[3]" />
                      ) : (
                        <span className="text-[10px] font-mono text-slate-400 group-hover:text-slate-600">
                          {idx + 1}
                        </span>
                      )}
                    </div>

                    {/* Content */}
                    <div className="min-w-0">
                      <p className={`text-xs sm:text-sm font-semibold transition ${
                        step.done ? 'text-slate-400 line-through' : 'text-slate-900 group-hover:text-slate-950'
                      }`}>
                        {step.label}
                      </p>
                      {step.description && (
                        <p className="text-xs text-slate-500 mt-0.5 leading-normal truncate sm:whitespace-normal">
                          {step.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-3 shrink-0">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                      step.done
                        ? 'text-slate-500 bg-slate-100 border-slate-200'
                        : 'text-amber-800 bg-amber-50 border-amber-200'
                    }`}>
                      {step.done ? 'Done' : 'Pending'}
                    </span>

                    <div className="flex items-center gap-1 text-xs font-semibold text-slate-400 group-hover:text-slate-900 transition-colors">
                      <span className="hidden sm:inline">{step.done ? 'Manage' : 'Configure'}</span>
                      <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                    </div>
                  </div>
                </div>
              );

              return step.kind === 'link' ? (
                <a key={step.label} href={step.href} className="block">
                  {content}
                </a>
              ) : (
                <button
                  key={step.label}
                  type="button"
                  onClick={() => onNavigateSection(step.section)}
                  className="w-full text-left"
                >
                  {content}
                </button>
              );
            })}
          </div>
        </div>

      

      </div>
    </div>
  );
}