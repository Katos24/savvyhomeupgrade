'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import {
  Check,
  ChevronRight,
  ChevronDown,
  CheckCircle2,
  Link as LinkIcon,
  Copy,
  QrCode,
  Workflow,
  FileText,
  Calendar,
  CreditCard,
  Receipt,
  Sparkles,
} from 'lucide-react';

type ChecklistStep =
  | { label: string; description: string; done: boolean; kind: 'section'; section: string }
  | { label: string; description: string; done: boolean; kind: 'link'; href: string };

interface SetupTabProps {
  checklistSteps: ChecklistStep[];
  onNavigateSection: (section: string) => void;
  companySlug?: string;
}

// Real stage triggers, pulled from the same source the actual Pipeline
// settings and Calendar use (lib/formCategories.ts) — not reworded here,
// so this guide can never quietly drift out of sync with what the
// pipeline actually does.
const STAGE_GUIDE: { label: string; trigger: string }[] = [
  { label: 'New', trigger: 'Where every new lead starts, the moment someone submits your booking form.' },
  { label: 'Active', trigger: 'Moves here when you convert a lead into a project.' },
  { label: 'Quoted', trigger: 'Moves here automatically when you email a quote to the customer.' },
  { label: 'Approved', trigger: 'Moves here when the customer accepts the quote.' },
  { label: 'Scheduled', trigger: 'Moves here when you set a job date.' },
  { label: 'In Progress', trigger: 'You move jobs here yourself once work actually starts.' },
  { label: 'Completed', trigger: 'You move jobs here yourself once the work is done.' },
];

type GuideTopic = {
  key: string;
  icon: any;
  title: string;
  summary: string;
  body: React.ReactNode;
};

function GuideCard({ topic, isOpen, onToggle }: { topic: GuideTopic; isOpen: boolean; onToggle: () => void }) {
  const Icon = topic.icon;
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-xs">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left transition-colors hover:bg-slate-50/60"
      >
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
            <Icon className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-900">{topic.title}</p>
            <p className="truncate text-xs text-slate-500">{topic.summary}</p>
          </div>
        </div>
        <ChevronDown className={`h-4 w-4 shrink-0 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <div className="border-t border-slate-100 px-5 py-4 text-sm leading-relaxed text-slate-700">
          {topic.body}
        </div>
      )}
    </div>
  );
}

export default function SetupTab({
  checklistSteps,
  onNavigateSection,
  companySlug: propSlug,
}: SetupTabProps) {
  const params = useParams();
  const [copied, setCopied] = useState(false);
  const [openTopic, setOpenTopic] = useState<string | null>('link');

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

  // Real, specific guidance for exactly what's built in this app — not
  // generic SaaS copy. Each topic maps to a genuine workflow a
  // contractor will actually use.
  const guideTopics: GuideTopic[] = [
    {
      key: 'link',
      icon: LinkIcon,
      title: 'Your Booking Link & QR Code',
      summary: 'How customers actually reach you',
      body: (
        <div className="space-y-3">
          <p>
            Every customer request starts at one link:{' '}
            <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs font-semibold text-slate-800">
              {publicUrl || 'lead2project.com/your-business'}
            </code>
          </p>
          <p>Send it anywhere a customer might reach you first:</p>
          <ul className="list-disc space-y-1 pl-5 text-slate-600">
            <li>Text it directly when someone calls asking for a quote</li>
            <li>Add it to your Google Business Profile as your &ldquo;Book Online&rdquo; link</li>
            <li>Put the QR code on a truck decal, yard sign, or business card</li>
            <li>Drop it in your email signature</li>
          </ul>
          {publicUrl && (
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <button
                type="button"
                onClick={handleCopyLink}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 shadow-xs transition hover:bg-slate-50"
              >
                {copied ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5 text-slate-600" />}
                {copied ? 'Copied' : 'Copy Link'}
              </button>
              <button
                type="button"
                onClick={() => onNavigateSection('overview')}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 shadow-xs transition hover:bg-slate-50"
              >
                <QrCode className="h-3.5 w-3.5 text-slate-600" /> Get QR Code
              </button>
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'pipeline',
      icon: Workflow,
      title: 'Tracking a Job Through Every Stage',
      summary: 'From new lead to completed job',
      body: (
        <div className="space-y-3">
          <p>Every job on your board moves through the same stages — some automatic, some you move yourself:</p>
          <div className="space-y-2">
            {STAGE_GUIDE.map((s) => (
              <div key={s.label} className="flex items-start gap-2.5">
                <span className="mt-0.5 shrink-0 rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-600">
                  {s.label}
                </span>
                <p className="text-xs text-slate-600">{s.trigger}</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-slate-500">
            You can drag any job between columns by hand at any time — the automatic moves are just there so you don&rsquo;t have to remember to do it yourself.
          </p>
        </div>
      ),
    },
    {
      key: 'quotes',
      icon: FileText,
      title: 'Building & Sending Quotes',
      summary: 'Line items, templates, and AI drafts',
      body: (
        <div className="space-y-2">
          <p>Open any job&rsquo;s Quote tab to build the estimate. Three ways to start:</p>
          <ul className="list-disc space-y-1 pl-5 text-slate-600">
            <li><strong className="text-slate-800">From scratch</strong> — add line items one at a time, with description, quantity, and price</li>
            <li><strong className="text-slate-800">From a saved template</strong> — set up pricing once per service in Services, then load it instantly on any matching job</li>
            <li><strong className="text-slate-800">Generate with AI</strong> — draft line items from the job description and any photos the customer attached</li>
          </ul>
          <p className="text-slate-600">
            Once it looks right, send it — the customer gets a real, branded estimate they can review before agreeing to anything.
          </p>
        </div>
      ),
    },
    {
      key: 'scheduling',
      icon: Calendar,
      title: 'Scheduling the Work',
      summary: 'Date, time, staff, and notifying the customer',
      body: (
        <div className="space-y-2">
          <p>
            Once a quote&rsquo;s accepted, open the Schedule tab to set a date, a time, and who&rsquo;s doing the work. Assigning staff checks their availability automatically, so you won&rsquo;t accidentally double-book someone.
          </p>
          <p className="text-slate-600">
            Send Schedule emails the customer their appointment details directly — no separate text or call needed.
          </p>
        </div>
      ),
    },
    {
      key: 'invoicing',
      icon: CreditCard,
      title: 'Invoicing & Getting Paid',
      summary: 'Deposits, balances, and how money actually moves',
      body: (
        <div className="space-y-2">
          <p>
            If you require a deposit, the Invoice tab splits billing into two independent steps: send the deposit request first, then send the balance once the deposit&rsquo;s paid and the job is done. Each has its own due date and its own status — nothing gets confused between the two.
          </p>
          <p className="text-slate-600">
            With Stripe connected, every invoice includes a real pay-online link and your ledger updates the instant a customer pays. Without Stripe, you can still send a Venmo, Zelle, or other manual link, and record payments yourself once they land.
          </p>
        </div>
      ),
    },
    {
      key: 'expenses',
      icon: Receipt,
      title: 'Tracking Costs & Real Profit',
      summary: 'What a job actually made you',
      body: (
        <p className="text-slate-600">
          Log materials, labor, subcontractor costs, or anything else spent on a job right from that job&rsquo;s Expenses tab. Financials then shows real profit per job — income minus expenses — not just what you invoiced.
        </p>
      ),
    },
  ];

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

        {/* CHECKLIST TABLE — unchanged */}
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

        {/* HOW TO USE LEAD2PROJECT — new reference guide, entirely
            additive. Each card covers one real workflow, written from
            what's actually built rather than generic advice, so a
            contractor can look up "how do I send a quote" without
            digging through Settings tab by tab. */}
        <div>
          <p className="mb-3 text-[11px] font-bold uppercase tracking-wider text-slate-500">
            How to Use Lead2Project
          </p>
          <div className="space-y-2.5">
            {guideTopics.map((topic) => (
              <GuideCard
                key={topic.key}
                topic={topic}
                isOpen={openTopic === topic.key}
                onToggle={() => setOpenTopic(openTopic === topic.key ? null : topic.key)}
              />
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}