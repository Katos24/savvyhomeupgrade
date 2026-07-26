'use client';

import { Check, Minus } from 'lucide-react';

// Matched to the rest of the site. This section was previously on Inter.
const font = "'Nunito', sans-serif";

/**
 * "The usual way" is deliberate. These rows describe running a trade business
 * on texts and spreadsheets — not competing software, which has scheduling and
 * invoicing too. Labelling this column "Others" makes a claim any prospect
 * trialling a competitor can disprove in five seconds.
 */
const ROWS = [
  {
    layer: 'Where leads live',
    us: 'One board, every job',
    them: 'Texts, voicemails, a notepad',
  },
  {
    layer: 'Building an estimate',
    us: 'Reusable templates per category',
    them: 'Retyped from scratch each time',
  },
  {
    layer: 'Confirming the appointment',
    us: 'Sends from the job card',
    them: 'A separate calendar, then a call',
  },
  {
    layer: 'Getting paid',
    us: 'Card payment in the email',
    them: 'Chase a check, or a separate app',
  },
  {
    layer: 'Follow-up',
    us: 'Reminders go out on their own',
    them: 'You remember, or you don\u2019t',
  },
];

export default function ComparisonSection() {
  return (
    <section
      style={{ fontFamily: font }}
      className="bg-slate-100 py-20 sm:py-28 px-4 sm:px-8 border-b border-slate-300/70"
    >
      <div className="max-w-4xl mx-auto">

        {/* Header sits above the table now — side-by-side halved the table's
            width on desktop and stacked awkwardly on mobile. */}
        <div className="max-w-2xl mb-10 sm:mb-14">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-teal-700 block mb-4">
            How it compares
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-[1.08] mb-5">
            One place, instead of five{' '}
            <span className="text-slate-500">that don&apos;t talk to each other.</span>
          </h2>
          <p className="text-slate-600 font-semibold text-base sm:text-lg leading-relaxed">
            Most crews run on a phone, a notepad, and whatever spreadsheet survived
            last season. Here&apos;s what changes.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-300 bg-white shadow-lg overflow-hidden">

          {/* Column headers — desktop only. On mobile each cell carries its own
              label instead, which is what makes the card transform readable. */}
          <div className="hidden sm:grid grid-cols-[1.1fr_1fr_1fr] gap-6 px-6 py-4 bg-slate-50 border-b border-slate-200">
            <span className="text-[11px] font-black uppercase tracking-[0.15em] text-slate-400">
              &nbsp;
            </span>
            <span className="text-[11px] font-black uppercase tracking-[0.15em] text-teal-700">
              Lead2Project
            </span>
            <span className="text-[11px] font-black uppercase tracking-[0.15em] text-slate-400">
              The usual way
            </span>
          </div>

          <div className="divide-y divide-slate-200">
            {ROWS.map((row) => (
              <div
                key={row.layer}
                className="sm:grid sm:grid-cols-[1.1fr_1fr_1fr] sm:gap-6 sm:items-center px-5 sm:px-6 py-5 sm:py-5"
              >
                {/* Row label */}
                <p className="text-base sm:text-[15px] font-black text-slate-900 leading-snug mb-3 sm:mb-0">
                  {row.layer}
                </p>

                {/* Ours — the emphasized side */}
                <div className="flex items-start gap-2.5 mb-2.5 sm:mb-0">
                  <span className="w-5 h-5 rounded-full bg-teal-600 flex items-center justify-center shrink-0 mt-px">
                    <Check className="w-3 h-3 text-white stroke-[3.5]" />
                  </span>
                  <div className="min-w-0">
                    <span className="sm:hidden block text-[10px] font-black uppercase tracking-widest text-teal-700 mb-0.5">
                      Lead2Project
                    </span>
                    <span className="block text-sm font-bold text-slate-900 leading-snug">
                      {row.us}
                    </span>
                  </div>
                </div>

                {/* Theirs — deliberately quieter. No red X: five of them down the
                    page reads as shouting, and the contrast alone makes the point. */}
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 mt-px">
                    <Minus className="w-3 h-3 text-slate-400 stroke-[3]" />
                  </span>
                  <div className="min-w-0">
                    <span className="sm:hidden block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-0.5">
                      The usual way
                    </span>
                    <span className="block text-sm font-semibold text-slate-500 leading-snug">
                      {row.them}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}