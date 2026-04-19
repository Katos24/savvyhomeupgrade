'use client';

import Link from 'next/link';
import { Sparkles, ArrowRight } from 'lucide-react';
import { Lead }  from '@/components/demo/types'

export default function AIBriefTab({ lead }: { lead: Lead }) {
  if (lead.ai_brief) {
    return (
      <div className="space-y-4">
        <div className="bg-gradient-to-br from-blue-900 to-blue-900 rounded-2xl p-5 border border-blue-700/40">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-blue-300" />
            <span className="text-sm font-bold text-white">AI summary</span>
            {lead.ai_brief.urgency === 'high' && (
              <span className="ml-auto text-[9px] font-bold px-2 py-0.5 bg-red-500/20 text-red-300 border border-red-500/30 rounded-full uppercase">
                High priority
              </span>
            )}
          </div>
          <p className="text-sm text-slate-300 leading-relaxed">{lead.ai_brief.summary}</p>
        </div>

        {lead.ai_brief.next_steps && (
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Recommended next steps</p>
            <div className="space-y-2">
              {lead.ai_brief.next_steps.map((step: string, i: number) => (
                <div key={i} className="flex items-center gap-3 bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-3">
                  <span className="text-emerald-500 font-black text-sm">→</span>
                  <span className="text-sm font-medium text-gray-800">{step}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-center gap-3">
          <Sparkles className="w-5 h-5 text-blue-400 shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-bold text-blue-800">Every lead gets a brief like this</p>
            <p className="text-xs text-blue-600">Photo analysis, urgency scoring, and next steps — all automatic.</p>
          </div>
          <Link href="/signup" className="shrink-0 px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl hover:bg-blue-700 transition">
            Try free
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
      <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
        <Sparkles className="w-7 h-7 text-blue-400" />
      </div>
      <p className="font-black text-gray-800 text-lg mb-1">AI Brief</p>
      <p className="text-sm text-gray-400 mb-2 max-w-xs leading-relaxed">
        Every lead gets an AI summary — scope, urgency, and next steps. Auto-generated from the customer's photos and description.
      </p>
      <p className="text-xs text-blue-500 font-bold mb-6">See the Michael Johnson lead for a live example →</p>
      <Link href="/signup" className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-200">
        Start Free Trial <ArrowRight className="w-4 h-4" />
      </Link>
      <p className="mt-3 text-xs text-gray-400">14-day free trial · Cancel anytime</p>
    </div>
  );
}