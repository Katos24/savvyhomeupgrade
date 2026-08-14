'use client';

import { Check, ChevronRight, Rocket, PartyPopper } from 'lucide-react';

type ChecklistStep =
  | { label: string; description: string; done: boolean; kind: 'section'; section: string }
  | { label: string; description: string; done: boolean; kind: 'link'; href: string };

export default function SetupTab({
  checklistSteps,
  onNavigateSection,
}: {
  checklistSteps: ChecklistStep[];
  onNavigateSection: (section: string) => void;
}) {
  const doneCount = checklistSteps.filter((s) => s.done).length;
  const totalCount = checklistSteps.length;
  const allDone = doneCount === totalCount;
  const percentComplete = totalCount > 0 ? (doneCount / totalCount) * 100 : 0;

  return (
    <div className="min-h-screen bg-slate-50/50 px-6 py-10 lg:px-12 font-sans text-slate-900 antialiased">
      <div className="mx-auto max-w-6xl space-y-8 pb-16">

        {/* Page Title & Status Header */}
        <div className="pb-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={`flex h-10 w-10 items-center justify-center rounded-lg border ${
              allDone ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : 'bg-slate-100 border-slate-200 text-slate-800'
            }`}>
              {allDone ? (
                <PartyPopper className="h-5 w-5" />
              ) : (
                <Rocket className="h-5 w-5" />
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                {allDone ? "You're Fully Set Up!" : 'Get Set Up'}
              </h1>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                {allDone
                  ? 'All steps completed — revisit any section below to update your settings.'
                  : 'A few quick steps to get your contractor account and booking flow ready.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-start sm:self-center">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              {doneCount}/{totalCount} Completed
            </span>
            <div className="h-2 w-36 rounded-full bg-slate-200 overflow-hidden shrink-0">
              <div
                className={`h-full transition-all duration-500 ${allDone ? 'bg-emerald-600' : 'bg-slate-900'}`}
                style={{ width: `${percentComplete}%` }}
              />
            </div>
          </div>
        </div>

        {/* Main Checklist Card */}
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="divide-y divide-slate-100">
            {checklistSteps.map((step) => {
              const content = (
                <div className="flex items-center justify-between px-6 py-5 hover:bg-slate-50/80 transition-colors group cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition-all ${
                        step.done
                          ? 'border-emerald-600 bg-emerald-600 text-white'
                          : 'border-slate-300 bg-white group-hover:border-slate-400'
                      }`}
                    >
                      {step.done && <Check className="h-4 w-4 stroke-[3]" />}
                    </div>
                    <div>
                      <p className={`text-sm font-semibold transition ${
                        step.done ? 'text-slate-400 line-through' : 'text-slate-900 group-hover:text-black'
                      }`}>
                        {step.label}
                      </p>
                      {step.description && (
                        <p className="text-xs text-slate-500 mt-0.5">{step.description}</p>
                      )}
                    </div>
                  </div>

                  {!step.done && (
                    <div className="flex items-center gap-1 text-xs font-semibold text-slate-400 group-hover:text-slate-900 transition">
                      <span className="hidden sm:inline">Configure</span>
                      <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                    </div>
                  )}
                </div>
              );

              return step.kind === 'link' ? (
                <a key={step.label} href={step.href} className="block">
                  {content}
                </a>
              ) : (
                <button
                  key={step.label}
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