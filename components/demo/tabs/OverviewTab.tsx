'use client';

import Link from 'next/link';
import { Mail, Phone, MapPin, Camera, Lock, ArrowRight } from 'lucide-react';
import { Lead } from '@/components/demo/types'

export default function OverviewTab({ lead }: { lead: Lead }) {
  return (
    <>
      {/* Client card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-3.5 border-b border-gray-50">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Client info</h3>
        </div>
        <div className="p-5 grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div><p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">Name</p><p className="text-sm font-semibold text-gray-900">{lead.name}</p></div>
          <div><p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">Email</p><p className="text-sm font-semibold text-blue-600 truncate">{lead.email}</p></div>
          <div><p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">Phone</p><p className="text-sm font-semibold text-blue-600">{lead.phone}</p></div>
          {lead.address_line_1 && (
            <div className="col-span-2">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">Address</p>
              <p className="text-sm font-semibold text-gray-900">{lead.address_line_1}, {lead.city}</p>
            </div>
          )}
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">Category</p>
            <span className="inline-flex items-center px-2.5 py-1 bg-blue-50 border border-blue-100 text-xs font-bold text-blue-600 rounded-lg">{lead.category}</span>
          </div>
        </div>
        <div className="flex gap-2 px-5 pb-4">
          {[
            { icon: <Mail className="w-4 h-4" />, label: 'Email',      color: '#3b82f6' },
            { icon: <Phone className="w-4 h-4" />, label: 'Call',       color: '#22c55e' },
            { icon: <MapPin className="w-4 h-4" />, label: 'Directions', color: '#ef4444' },
          ].map(btn => (
            <div key={btn.label} className="flex-1 flex items-center justify-center gap-2 py-2.5 border border-gray-100 bg-gray-50 rounded-xl">
              <span style={{ color: btn.color }}>{btn.icon}</span>
              <span className="text-xs font-semibold text-gray-600">{btn.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Description */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-3.5 border-b border-gray-50">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Customer's message</h3>
        </div>
        <div className="p-5">
          <p className="text-sm text-gray-600 leading-relaxed">{lead.description}</p>
          {lead.file_urls?.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">{lead.file_urls.length} photos submitted</p>
              <div className="flex gap-2">
                {lead.file_urls.slice(0, 4).map((_: any, i: number) => (
                  <div key={i} className="w-12 h-12 bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl border border-blue-200 flex items-center justify-center">
                    <Camera className="w-4 h-4 text-blue-400" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Demo CTA */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-center gap-3">
        <Lock className="w-5 h-5 text-blue-400 shrink-0" />
        <div className="flex-1">
          <p className="text-sm font-bold text-blue-800">This is a live demo</p>
          <p className="text-xs text-blue-600">Sign up to send quotes, schedule jobs, collect payment, and more.</p>
        </div>
        <Link href="/signup" className="shrink-0 px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl hover:bg-blue-700 transition">
          Try free
        </Link>
      </div>
    </>
  );
}