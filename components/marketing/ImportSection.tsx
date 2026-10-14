import Link from 'next/link';
import { Check, FileSpreadsheet, ArrowRight } from 'lucide-react';
import { Eyebrow } from '@/components/marketing/marketingUI';

// Homepage: "Bring your customers with you" — answers the switching worry.
// Claims match the real importer (Settings → Import): CSV upload, automatic
// column matching, duplicates skipped by email/phone, no emails sent, one-click undo.

const POINTS = [
  'Upload any spreadsheet saved as CSV',
  'We match the columns for you',
  'Duplicates are skipped, and nobody gets emailed',
  'Changed your mind? Undo the whole import in one click',
];

const SAMPLE = [
  { name: 'Maria Lopez', service: 'Roof repair', type: 'Past customer' },
  { name: 'Dan Kowalski', service: 'Gutters', type: 'New lead' },
  { name: 'Priya Shah', service: 'Siding', type: 'New lead' },
];

export default function ImportSection() {
  return (
    <section className="bg-[#F4EFE6] px-5 py-16 sm:px-6 sm:py-24 lg:px-8">
      <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-2 lg:gap-14">
        {/* Copy */}
        <div className="text-center sm:text-left">
          <Eyebrow>Switching is easy</Eyebrow>
          <h2 className="mt-4 font-[family-name:var(--font-display)] text-4xl font-extrabold uppercase leading-[0.95] tracking-tight sm:text-5xl lg:text-6xl">
            Bring your customers with you
          </h2>
          <p className="mx-auto mt-5 max-w-[46ch] text-base leading-relaxed text-[#3a3f45] sm:mx-0 sm:text-lg">
            Already have a list of leads and past customers? Upload it and your history is ready from day one. No
            retyping, no starting from scratch.
          </p>

          <ul className="mx-auto mt-6 max-w-md space-y-3 text-left sm:mx-0">
            {POINTS.map((p) => (
              <li key={p} className="flex items-start gap-3 text-base font-semibold text-[#1C1F23]">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#00828A] text-white">
                  <Check className="h-3 w-3" strokeWidth={3} />
                </span>
                {p}
              </li>
            ))}
          </ul>

          <div className="mt-8 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
            <Link
              href="/signup"
              className="inline-flex min-h-[48px] items-center justify-center rounded-md bg-[#00828A] px-7 py-3 font-[family-name:var(--font-display)] text-base font-bold uppercase tracking-wider text-white shadow-md transition hover:bg-[#006e75]"
            >
              Start free
            </Link>
<p className="text-sm text-[#5a6067]">Import leads on any plan. Past customers and active jobs import as jobs on Pro.</p>
          </div>
        </div>

        {/* Visual: spreadsheet → jobs */}
        <div className="relative mx-auto w-full max-w-lg">
          <div className="rounded-xl border border-[#1C1F23]/15 bg-white shadow-xl">
            <div className="flex items-center gap-2 border-b border-[#1C1F23]/10 px-4 py-3">
              <FileSpreadsheet className="h-5 w-5 text-[#00828A]" />
              <span className="text-sm font-bold text-[#1C1F23]">customers.csv</span>
              <span className="ml-auto rounded-full bg-[#F4EFE6] px-2.5 py-0.5 text-xs font-semibold text-[#3a3f45]">
                3 rows
              </span>
            </div>

            <div className="px-4 py-3">
              <p className="text-xs font-bold uppercase tracking-wider text-[#5a6067]">Columns matched</p>
              <div className="mt-2 flex flex-wrap gap-1.5 text-xs font-semibold">
                {['Name → Name', 'Phone → Phone', 'Email → Email', 'Job → Service'].map((m) => (
                  <span key={m} className="inline-flex items-center gap-1 rounded-md bg-[#00828A]/10 px-2 py-1 text-[#006e75]">
                    <Check className="h-3 w-3" strokeWidth={3} /> {m}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex justify-center py-1">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1C1F23] text-white shadow-md">
                <ArrowRight className="h-4 w-4 rotate-90" />
              </span>
            </div>

            <ul className="divide-y divide-[#1C1F23]/10 border-t border-[#1C1F23]/10">
              {SAMPLE.map((r) => (
                <li key={r.name} className="flex items-center justify-between gap-3 px-4 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-[#1C1F23]">{r.name}</p>
                    <p className="truncate text-xs text-[#5a6067]">{r.service}</p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      r.type === 'New lead' ? 'bg-[#1C1F23] text-white' : 'bg-[#F4EFE6] text-[#3a3f45]'
                    }`}
                  >
                    {r.type}
                  </span>
                </li>
              ))}
            </ul>

            <div className="rounded-b-xl bg-[#1C1F23] px-4 py-3 text-sm font-semibold text-white">
              <Check className="mr-1.5 inline h-4 w-4 text-[#5EC4C9]" strokeWidth={3} />
              3 imported · 0 emails sent
            </div>
          </div>
          <p className="mt-3 text-center text-xs text-[#5a6067]">Example only, not real customers.</p>
        </div>
      </div>
    </section>
  );
}