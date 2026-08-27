'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import {
  Check,
  ChevronRight,
  CheckCircle2,
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
    <div className="w-full font-sans text-slate-900 antialiased">
      <div className="w-full space-y-6">

        {/* HEADER & PROGRESS ROW */}
        <div className="flex flex-col gap-4 border-b border-slate-200 pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-slate-900">
                Workspace Setup
              </h1>
              {allDone && (
                <span className="inline-flex items-center gap-1 rounded border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
                  <CheckCircle2 className="h-3 w-3 text-emerald-600" /> Complete
                </span>
              )}
            </div>
            <p className="mt-0.5 text-xs font-medium text-slate-500">
              Configure your business details and public booking parameters.
            </p>
          </div>

          <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-3.5 py-2 shadow-xs">
            <div className="text-right">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Completion</p>
              <p className="font-mono text-xs font-bold text-slate-900">{doneCount}/{totalCount} Steps ({percentComplete}%)</p>
            </div>
            <div className="h-2 w-24 overflow-hidden rounded-full border border-slate-200/60 bg-slate-100">
              <div
                className={`h-full transition-all duration-300 ${allDone ? 'bg-emerald-600' : 'bg-slate-900'}`}
                style={{ width: `${percentComplete}%` }}
              />
            </div>
          </div>
        </div>

        {/* CHECKLIST TABLE */}
        <div className="overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-200/80 bg-slate-50/80 px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-500">
            <span>Action Required</span>
            <span>Status</span>
          </div>

          <div className="divide-y divide-slate-100">
            {checklistSteps.map((step, idx) => {
              const content = (
                <div className="group flex cursor-pointer items-center justify-between px-5 py-4 transition-colors hover:bg-slate-50/60">
                  <div className="flex min-w-0 items-start gap-3.5 pr-4">
                    
                    {/* Status Box */}
                    <div
                      className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-all ${
                        step.done
                          ? 'border-emerald-600 bg-emerald-600 text-white'
                          : 'border-slate-300 bg-white group-hover:border-slate-400'
                      }`}
                    >
                      {step.done ? (
                        <Check className="h-3.5 w-3.5 stroke-[3]" />
                      ) : (
                        <span className="font-mono text-[10px] text-slate-400 group-hover:text-slate-600">
                          {idx + 1}
                        </span>
                      )}
                    </div>

                    {/* Content */}
                    <div className="min-w-0">
                      <p className={`text-xs font-semibold transition sm:text-sm ${
                        step.done ? 'line-through text-slate-400' : 'text-slate-900 group-hover:text-slate-950'
                      }`}>
                        {step.label}
                      </p>
                      {step.description && (
                        <p className="mt-0.5 truncate text-xs leading-normal text-slate-500 sm:whitespace-normal">
                          {step.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex shrink-0 items-center gap-3">
                    <span className={`rounded border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                      step.done
                        ? 'border-slate-200 bg-slate-100 text-slate-500'
                        : 'border-amber-200 bg-amber-50 text-amber-800'
                    }`}>
                      {step.done ? 'Done' : 'Pending'}
                    </span>

                    <div className="flex items-center gap-1 text-xs font-semibold text-slate-400 transition-colors group-hover:text-slate-900">
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