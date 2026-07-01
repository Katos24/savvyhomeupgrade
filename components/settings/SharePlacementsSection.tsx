'use client';

import { useState } from 'react';
import { X, Globe, Truck, MapPin, Facebook, FileText, ExternalLink } from 'lucide-react';

type Placement = {
  id: string;
  label: string;
  icon: React.ReactNode;
  modal: React.ReactNode;
};

function Modal({ placement, onClose }: { placement: Placement; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="text-slate-600">{placement.icon}</span>
            <h3 className="text-[14px] font-semibold text-slate-900">{placement.label}</h3>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 transition">
            <X className="w-4 h-4 text-slate-500" />
          </button>
        </div>
        <div className="p-5">{placement.modal}</div>
      </div>
    </div>
  );
}

export default function SharePlacementsSection({ companySlug, publicLink }: { companySlug: string; publicLink: string }) {
  const [active, setActive] = useState<string | null>(null);

  const placements: Placement[] = [
    {
      id: 'google',
      label: 'Google Profile',
      icon: <Globe className="w-3.5 h-3.5" />,
      modal: (
        <div className="space-y-4">
          <p className="text-[13.5px] text-slate-700 leading-relaxed">
            Adding your booking link to your Google Business Profile lets customers request a quote directly from Google search — without ever calling you first.
          </p>
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
            <p className="text-[12px] font-semibold text-slate-700 uppercase tracking-wide">How to add it</p>
            {[
              'Go to your Google Business Profile and click "Edit profile"',
              'Select "Contact" then scroll to "Website"',
              'Paste your Lead2Project link and save',
            ].map((step, i) => (
              <div key={i} className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-[11px] font-semibold flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                <p className="text-[13px] text-slate-700">{step}</p>
              </div>
            ))}
          </div>
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
            <p className="text-[12px] font-semibold text-blue-800 mb-1">Your link</p>
            <code className="text-[12px] text-blue-700 break-all">{publicLink}</code>
          </div>
          <a href="https://business.google.com" target="_blank" rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-2.5 bg-slate-900 text-white rounded-xl text-[13px] font-medium hover:bg-slate-800 transition">
            Open Google Business Profile <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      ),
    },
    {
      id: 'website',
      label: 'Your Website',
      icon: <Globe className="w-3.5 h-3.5" />,
      modal: (
        <div className="space-y-4">
          <p className="text-[13.5px] text-slate-700 leading-relaxed">
            Add a "Get a Quote" button to your website that links directly to your booking form. No contact forms to check, no emails to chase — leads come straight to your dashboard.
          </p>
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
            <p className="text-[12px] font-semibold text-slate-700 uppercase tracking-wide">Button HTML you can paste in</p>
            <pre className="text-[11.5px] text-slate-600 bg-white border border-slate-200 rounded-lg p-3 overflow-x-auto whitespace-pre-wrap break-all">{`<a href="${publicLink}" target="_blank">\n  Get a Free Quote\n</a>`}</pre>
          </div>
          <p className="text-[12px] text-slate-500">Works with any website builder — Wix, Squarespace, WordPress, Webflow, or plain HTML.</p>
        </div>
      ),
    },
    {
      id: 'facebook',
      label: 'Facebook',
      icon: <Facebook className="w-3.5 h-3.5" />,
      modal: (
        <div className="space-y-4">
          <p className="text-[13.5px] text-slate-700 leading-relaxed">
            Three places to add your link on Facebook — each one puts your booking form in front of customers at different moments.
          </p>
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
            {[
              { title: 'Page button', desc: 'Set your page\'s main CTA button to "Book Now" and link it to your form. It sits right under your cover photo.' },
              { title: 'Bio / About section', desc: 'Paste your link in the "Website" field of your About section so it\'s always visible on your profile.' },
              { title: 'Pinned post', desc: 'Create a post with your QR code image and link, then pin it to the top of your page so it\'s the first thing visitors see.' },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-[11px] font-semibold flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                <div>
                  <p className="text-[13px] font-semibold text-slate-800">{item.title}</p>
                  <p className="text-[12px] text-slate-600 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ),
    },
    {
      id: 'truck',
      label: 'Truck / Vehicle',
      icon: <Truck className="w-3.5 h-3.5" />,
      modal: (
        <div className="space-y-4">
          <p className="text-[13.5px] text-slate-700 leading-relaxed">
            Your truck is a moving billboard. A branded QR code on your vehicle lets anyone who sees you working in their neighborhood scan and request a quote on the spot.
          </p>
          <img
            src="/images/qrbranded2.webp"
            alt="Branded QR code on truck and yard sign examples"
            className="w-full rounded-xl border border-slate-200 object-cover"
          />
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
            <p className="text-[12px] font-semibold text-slate-700 uppercase tracking-wide">Tips</p>
            {[
              'Download your branded QR code from the button above and bring it to a local print shop or use a vinyl decal service',
              'Include your URL below the QR code — some people prefer to type it',
              'High contrast colors scan better — use the dark QR style for vehicle decals',
            ].map((tip, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="text-blue-500 mt-0.5 shrink-0">•</span>
                <p className="text-[12.5px] text-slate-700">{tip}</p>
              </div>
            ))}
          </div>
        </div>
      ),
    },
    {
      id: 'yardsign',
      label: 'Yard Sign',
      icon: <MapPin className="w-3.5 h-3.5" />,
      modal: (
        <div className="space-y-4">
          <p className="text-[13.5px] text-slate-700 leading-relaxed">
            Leave a yard sign at every job site. Neighbors walking by are your warmest leads — they already see your work in person.
          </p>
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
            <p className="text-[12px] font-semibold text-slate-700 uppercase tracking-wide mb-2">Coming soon</p>
            <p className="text-[12.5px] text-slate-600">We're putting together yard sign templates you can take straight to a print shop. Check back soon.</p>
          </div>
        </div>
      ),
    },
    {
      id: 'flyer',
      label: 'Flyer',
      icon: <FileText className="w-3.5 h-3.5" />,
      modal: (
        <div className="space-y-4">
          <p className="text-[13.5px] text-slate-700 leading-relaxed">
            Door hangers and flyers with your QR code let you blanket a neighborhood after finishing a job nearby. Strike while the iron is hot.
          </p>
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
            <p className="text-[12px] font-semibold text-slate-700 uppercase tracking-wide mb-2">Coming soon</p>
            <p className="text-[12.5px] text-slate-600">Flyer and door hanger templates are on the way. You'll be able to download and print them directly.</p>
          </div>
        </div>
      ),
    },
  ];

  const activePlacement = placements.find(p => p.id === active);

  return (
    <>
      <div className="mt-3">
<p className="text-[13px] font-semibold text-white mb-2">Where can you put your link?</p>
<div className="flex flex-wrap gap-2">
          {placements.map(p => (
            <button
              key={p.id}
              onClick={() => setActive(p.id)}
className="flex items-center gap-1.5 px-3.5 py-2 rounded-full border border-slate-200 bg-slate-50 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 text-slate-700 text-[13px] font-medium transition-colors"            >
              {p.icon}
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {activePlacement && (
        <Modal placement={activePlacement} onClose={() => setActive(null)} />
      )}
    </>
  );
}