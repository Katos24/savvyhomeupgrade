// components/FaqModal.tsx
'use client';

import { useState } from 'react';
import { X, Link2, FileText, Kanban, Tags, Mail, Sparkles, Download } from 'lucide-react';

type FaqTabKey = 'start' | 'form' | 'pipeline' | 'categories' | 'emails' | 'ai' | 'data';

const TABS: { key: FaqTabKey; label: string; icon: React.ElementType }[] = [
  { key: 'start', label: 'Getting Started', icon: Link2 },
  { key: 'form', label: 'Booking Form', icon: FileText },
  { key: 'pipeline', label: 'Leads & Board', icon: Kanban },
  { key: 'categories', label: 'Categories & Quotes', icon: Tags },
  { key: 'emails', label: 'Emails & Outbox', icon: Mail },
  { key: 'ai', label: 'AI Tools', icon: Sparkles },
  { key: 'data', label: 'Data & Export', icon: Download },
];

function TabContent({ tab }: { tab: FaqTabKey }) {
  const h = "text-sm font-bold text-slate-900 mb-1.5";
  const p = "text-[13px] font-medium leading-relaxed text-slate-600 mb-4";

  switch (tab) {
    case 'start':
      return (
        <>
          <p className={h}>Your link and QR code</p>
          <p className={p}>
            When you sign up, you get a public booking link and a matching QR code.
            Share either one anywhere — your Google Business Profile, social bios,
            flyers, or a truck decal. Customers who click or scan land on your form,
            no app or login required on their end.
          </p>
          <p className={h}>Your dashboard</p>
          <p className={p}>
            You also get a private dashboard URL where every submission becomes a
            lead. That's where you manage jobs, quotes, payments, and all your
            settings — pipeline stages, email templates, categories, and the form
            itself.
          </p>
        </>
      );
    case 'form':
      return (
        <>
          <p className={h}>What customers see</p>
          <p className={p}>
            Your booking form always collects name, email, phone, service needed,
            and a project description. Beyond that, you control what else shows up.
          </p>
          <p className={h}>What you can customize</p>
          <p className={p}>
            Turn on address, preferred date, preferred time, or how they heard about
            you. Add your own custom questions — text, dropdown, or yes/no — to
            gather exactly what your business needs before the first phone call.
          </p>
        </>
      );
    case 'pipeline':
      return (
        <>
          <p className={h}>From lead to job</p>
          <p className={p}>
            Every form submission lands on your board as a lead card. From there you
            schedule the job, add a quote, update payment status, and attach photos,
            documents, or short videos directly to the card.
          </p>
          <p className={h}>Your workflow, your stages</p>
          <p className={p}>
            The pipeline stages themselves are customizable in settings, so the board
            can match how your business actually moves work from first contact to
            paid and done.
          </p>
        </>
      );
    case 'categories':
      return (
        <>
          <p className={h}>Categories</p>
          <p className={p}>
            Set up the service categories customers choose from on your form. Each
            category can have its own custom quote templates and custom tasks, so
            the quote and to-do list you generate for a "roof repair" lead looks
            different from a "landscaping" lead.
          </p>
        </>
      );
    case 'emails':
      return (
        <>
          <p className={h}>One-click sends</p>
          <p className={p}>
            From a lead card, you can send a branded schedule confirmation, a quote
            with accept/decline buttons built in, or a payment reminder — each in one
            click, using your own branded templates.
          </p>
          <p className={h}>Outbox</p>
          <p className={p}>
            Every email you send is logged in the Outbox, so you can review exactly
            what went out and when — no wondering whether a reminder actually sent.
          </p>
          <p className={h}>Daily digest (Pro)</p>
          <p className={p}>
            On the Pro plan, you'll get a daily digest email at 6 AM summarizing
            what's new and what needs attention, so you can start the day already
            caught up.
          </p>
        </>
      );
    case 'ai':
      return (
        <>
          <p className={h}>AI Brief</p>
          <p className={p}>
            Get a quick AI-generated summary of a lead or job — useful for catching
            up fast before a call.
          </p>
          <p className={h}>AI Chat</p>
          <p className={p}>
            Ask questions about your leads and pipeline in plain language instead of
            digging through the board manually.
          </p>
          <p className={h}>AI Quote Generator</p>
          <p className={p}>
            Generates a starting-point quote based on the category and job details.
            It's a helpful first draft, not a final answer — always review and adjust
            pricing before sending it to a customer.
          </p>
        </>
      );
    case 'data':
      return (
        <>
          <p className={h}>Export anytime</p>
          <p className={p}>
            Download your leads and job data as a CSV whenever you want — your data
            isn't locked in. Useful for backups, reporting, or moving it into another
            tool.
          </p>
          <p className={h}>QuickBooks format</p>
          <p className={p}>
            You can also export in a QuickBooks-compatible CSV format, so getting
            your job and payment data into your books doesn't mean re-typing
            everything by hand.
          </p>
          <p className={h}>Bulk edits</p>
          <p className={p}>
            Update multiple leads or jobs at once from the table view instead of
            opening each card individually.
          </p>
        </>
      );
  }
}

export default function FaqModal({ onClose }: { onClose: () => void }) {
  const [activeTab, setActiveTab] = useState<FaqTabKey>('start');

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-150 px-6 py-4 shrink-0">
          <span className="text-sm font-bold uppercase tracking-wider text-slate-900">
            How Lead2Project works
          </span>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex gap-1.5 overflow-x-auto border-b border-slate-150 px-4 py-2.5 shrink-0">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12px] font-bold transition ${
                activeTab === t.key
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              <t.icon className="h-3.5 w-3.5" />
              {t.label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          <TabContent tab={activeTab} />
        </div>
      </div>
    </div>
  );
}