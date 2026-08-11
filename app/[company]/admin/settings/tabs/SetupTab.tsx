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
  const allDone = doneCount === checklistSteps.length;

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-8 sm:px-8 font-sans antialiased text-slate-900">
      <div className="mx-auto max-w-3xl space-y-6 pb-12">

        <div className="flex items-center gap-2.5">
          {allDone ? (
            <PartyPopper className="h-5 w-5 text-emerald-600" />
          ) : (
            <Rocket className="h-5 w-5 text-slate-700" />
          )}
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            {allDone ? "You're fully set up" : 'Get set up'}
          </h1>
        </div>
        <p className="text-xs text-slate-500 -mt-4">
          {allDone
            ? 'All done here — come back anytime to revisit a step.'
            : 'A few quick steps to get your booking flow fully ready.'}
        </p>

        <div className="rounded border border-slate-300 bg-white">
          <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-4 py-2.5">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-600">
              {doneCount}/{checklistSteps.length} completed
            </span>
            <div className="h-1.5 w-32 rounded-full bg-slate-200 overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${allDone ? 'bg-emerald-600' : 'bg-slate-900'}`}
                style={{ width: `${(doneCount / checklistSteps.length) * 100}%` }}
              />
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {checklistSteps.map((step) => {
              const content = (
                <div className="flex items-center justify-between px-4 py-4 hover:bg-slate-50 transition group">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                      step.done ? 'border-emerald-600 bg-emerald-600 text-white' : 'border-slate-300 bg-white'
                    }`}>
                      {step.done && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                    </div>
                    <div>
                      <p className={`text-sm font-bold ${step.done ? 'text-slate-400 line-through' : 'text-slate-900'}`}>
                        {step.label}
                      </p>
                      <p className="text-[12px] text-slate-500">{step.description}</p>
                    </div>
                  </div>
                  {!step.done && <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-slate-700" />}
                </div>
              );

              return step.kind === 'link' ? (
                <a key={step.label} href={step.href} className="block">
                  {content}
                </a>
              ) : (
                <button key={step.label} onClick={() => onNavigateSection(step.section)} className="w-full text-left">
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