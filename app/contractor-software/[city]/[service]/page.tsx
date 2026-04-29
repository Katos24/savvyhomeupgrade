// app/contractor-software/[city]/[service]/page.tsx

import type { Metadata } from 'next';
import Link from 'next/link';
import { cities } from '@/lib/cities';
import { serviceDetails } from '@/lib/serviceDetails';

// ─── STATIC PARAMS ───

export async function generateStaticParams() {
  const services = [
    'hvac', 'electrical', 'plumbing', 'roofing', 'painting',
    'handyman', 'landscaping', 'cleaning', 'moving', 'locksmith',
    'fencing', 'concrete', 'flooring', 'siding', 'gutters',
    'pressure-washing', 'tree-service', 'pest-control', 'garage-door',
    'window-installation', 'drywall', 'demolition', 'excavation',
    'septic', 'paving', 'masonry', 'welding', 'insulation',
    'solar', 'pool-service', 'irrigation', 'appliance-repair',
    'chimney', 'waterproofing', 'foundation-repair', 'junk-removal',
    'carpet-cleaning', 'auto-detailing', 'towing',
  ];

  const params = [];

  for (const city of cities) {
    for (const service of services) {
      params.push({
        city,
        service,
      });
    }
  }

  return params;
}

// ─── HELPERS ───

function formatCity(slug: string) {
  const specialCases: Record<string, string> = {
    dc: 'DC',
    nj: 'NJ',
    ct: 'CT',
    pa: 'PA',
    ma: 'MA',
    ca: 'CA',
    tx: 'TX',
    fl: 'FL',
    il: 'IL',
    oh: 'OH',
    ga: 'GA',
    nc: 'NC',
    va: 'VA',
    md: 'MD',
    mi: 'MI',
    az: 'AZ',
    co: 'CO',
    wa: 'WA',
    or: 'OR',
    nv: 'NV',
    tn: 'TN',
    mn: 'MN',
    wi: 'WI',
    in: 'IN',
    mo: 'MO',
    sc: 'SC',
    al: 'AL',
    la: 'LA',
    ky: 'KY',
    ok: 'OK',
    ia: 'IA',
    ks: 'KS',
    ne: 'NE',
    ar: 'AR',
    ms: 'MS',
    ut: 'UT',
    nm: 'NM',
    id: 'ID',
    mt: 'MT',
    wy: 'WY',
    nd: 'ND',
    sd: 'SD',
    wv: 'WV',
    nh: 'NH',
    vt: 'VT',
    me: 'ME',
    ri: 'RI',
    de: 'DE',
    st: 'St.',
  };

  return slug
    .split('-')
    .map(word => {
      if (specialCases[word]) return specialCases[word];
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');
}

function formatService(slug: string) {
  const serviceNames: Record<string, string> = {
    hvac: 'HVAC',
    electrical: 'Electrical',
    plumbing: 'Plumbing',
    roofing: 'Roofing',
    painting: 'Painting',
    handyman: 'Handyman',
    landscaping: 'Landscaping',
    cleaning: 'Cleaning',
    moving: 'Moving',
    locksmith: 'Locksmith',
    fencing: 'Fencing',
    concrete: 'Concrete',
    flooring: 'Flooring',
    siding: 'Siding',
    gutters: 'Gutter',
    'pressure-washing': 'Pressure Washing',
    'tree-service': 'Tree Service',
    'pest-control': 'Pest Control',
    'garage-door': 'Garage Door',
    'window-installation': 'Window Installation',
    drywall: 'Drywall',
    demolition: 'Demolition',
    excavation: 'Excavation',
    septic: 'Septic',
    paving: 'Paving',
    masonry: 'Masonry',
    welding: 'Welding',
    insulation: 'Insulation',
    solar: 'Solar',
    'pool-service': 'Pool Service',
    irrigation: 'Irrigation',
    'appliance-repair': 'Appliance Repair',
    chimney: 'Chimney',
    waterproofing: 'Waterproofing',
    'foundation-repair': 'Foundation Repair',
    'junk-removal': 'Junk Removal',
    'carpet-cleaning': 'Carpet Cleaning',
    'auto-detailing': 'Auto Detailing',
    towing: 'Towing',
  };

  return (
    serviceNames[slug] ||
    slug
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  );
}

// ─── SERVICE DETAILS ───
// Keep your full serviceDetails object here exactly as built
// (No changes needed)

// ─── METADATA ───

export async function generateMetadata({
  params,
}: {
  params: Promise<{ city: string; service: string }>;
}): Promise<Metadata> {
  const { city: citySlug, service: serviceSlug } = await params;

  const city = formatCity(citySlug);
  const service = formatService(serviceSlug);

  return {
    title: `${service} Software for ${city} Contractors | Lead2Project`,
    description: `${city} ${service.toLowerCase()} contractors: get a booking link and QR code your customers can use to submit jobs with photos. Add leads yourself or let them come to you. Quote, schedule, and track every job from one dashboard. Try Lead2Project free for 14 days.`,
    alternates: {
      canonical: `https://lead2project.com/contractor-software/${citySlug}/${serviceSlug}`,
    },
    openGraph: {
      title: `${service} Job Management in ${city} | Lead2Project`,
      description: `Stop losing ${service.toLowerCase()} leads in ${city}. One booking link, one dashboard. Customers submit jobs with photos, you quote and schedule from your phone.`,
      url: `https://lead2project.com/contractor-software/${citySlug}/${serviceSlug}`,
      siteName: 'Lead2Project',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${service} Software for ${city} Contractors | Lead2Project`,
      description: `${city} ${service.toLowerCase()} pros: one booking link, one dashboard. Capture leads, send quotes, schedule jobs.`,
    },
  };
}

// ─── PAGE COMPONENT ───

export default async function CityServicePage({
  params,
}: {
  params: Promise<{ city: string; service: string }>;
}) {
  const { city: citySlug, service: serviceSlug } = await params;

  const city = formatCity(citySlug);
  const service = formatService(serviceSlug);
  const detail = serviceDetails[serviceSlug] || serviceDetails.hvac;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800">

      {/* Hero */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <p className="text-blue-400 font-semibold text-sm tracking-wide uppercase mb-4">
            {service} Software for {city}
          </p>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
            Stop Losing {service} Leads in {city}
          </h1>
          <p className="text-lg sm:text-xl text-gray-300 max-w-3xl mx-auto mb-4">
            You run a {service.toLowerCase()} business in {city}. Leads come in from texts, calls, 
            social media, word of mouth. You lose track. Jobs slip through the cracks.
          </p>
          <p className="text-lg sm:text-xl text-gray-300 max-w-3xl mx-auto mb-10">
            Lead2Project gives you one booking link and one dashboard. Your customers submit 
            job requests with photos, or you add leads yourself. Everything in one place. 
            No more sticky notes and forgotten callbacks.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/signup"
              className="px-8 py-4 bg-blue-600 text-white rounded-lg font-bold text-lg hover:bg-blue-700 transition"
            >
              Start Free Trial
            </a>
            <a
              href="/"
              className="px-8 py-4 bg-white/10 border border-white/20 text-white rounded-lg font-bold text-lg hover:bg-white/20 transition"
            >
              See How It Works
            </a>
          </div>
          <p className="text-sm text-gray-500 mt-4">14-day free trial. Cancel anytime.</p>
        </div>
      </section>

      {/* The Problem */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6 text-center">
            Sound Familiar?
          </h2>
          <p className="text-gray-400 text-center text-lg max-w-3xl mx-auto mb-12">
            We talked to {service.toLowerCase()} contractors in {city} and heard the same thing 
            over and over.
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <h3 className="text-xl font-bold text-white mb-4">
                How leads come in now
              </h3>
              <p className="text-gray-400 leading-relaxed">
                A homeowner texts you from a friend&apos;s referral. Someone DMs you on Instagram. 
                Your buddy sends you a number. A customer calls while you are on a job. 
                You scribble it on a napkin, tell yourself you will call back later, and forget. 
                By the time you remember, they already called someone else.
              </p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <h3 className="text-xl font-bold text-white mb-4">
                What {service.toLowerCase()} pros actually need
              </h3>
              <p className="text-gray-400 leading-relaxed">
                One place where every lead lands. A booking link you can put on 
                your truck, your cards, your lawn sign, your Instagram bio. Customers fill out 
                what they need, upload photos of the job, and it shows up on your dashboard. 
                You open your phone, see every lead, send a quote, schedule the job. Done.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 px-4 bg-white/[0.02]">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 text-center">
            How Lead2Project Works for {city} {service} Contractors
          </h2>
          <p className="text-gray-400 text-center text-lg max-w-2xl mx-auto mb-12">
            Set up takes two minutes. Here is what happens next.
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-600/20 border border-blue-500/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-blue-400 font-bold text-lg">1</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">
                Get Your Booking Link and QR Code
              </h3>
              <p className="text-gray-400">
                Every Lead2Project account comes with a custom booking link and a downloadable 
                QR code. Put the QR code on your truck, yard signs, business cards, flyers. 
                Share the link on social media. Customers scan it or tap it and land on your 
                custom form.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-600/20 border border-blue-500/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-blue-400 font-bold text-lg">2</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">
                Leads Land on Your Dashboard
              </h3>
              <p className="text-gray-400">
                When a customer submits a request through your link, it shows up on your 
                dashboard instantly. They pick their service category, describe the job, 
                and upload photos. You can also add leads yourself when someone calls or texts 
                you directly. Either way, everything is in one place.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-600/20 border border-blue-500/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-blue-400 font-bold text-lg">3</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">
                Quote, Schedule, and Get Paid
              </h3>
              <p className="text-gray-400">
                Review the job details, send a quote with one tap, schedule the work, and 
                track the whole thing from start to finish. Every morning at 6AM you get a 
                summary email with new leads, today&apos;s schedule, and payment status. No more 
                guessing what is on your plate.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Service Specific Section */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 text-center">
            Built for {service} Contractors Who Are Tired of the Chaos
          </h2>
          <p className="text-gray-400 text-center text-lg max-w-3xl mx-auto mb-12">
            Whether you are handling {detail.jobs.slice(0, 3).join(', ')}, or {detail.jobs[detail.jobs.length - 1]}, 
            you know the pain of {detail.pain}. Lead2Project keeps it all organized so nothing falls through the cracks.
          </p>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <h3 className="text-xl font-bold text-white mb-3">
                Your Customers Can Book You Directly
              </h3>
              <p className="text-gray-400 leading-relaxed">
                No app download required. Your customer scans your QR code or clicks your 
                booking link, picks the type of {service.toLowerCase()} work they need, writes a 
                description, and uploads photos. You get it instantly. They do not have to 
                call, text, or DM you. It just works.
              </p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <h3 className="text-xl font-bold text-white mb-3">
                You Can Add Leads Yourself Too
              </h3>
              <p className="text-gray-400 leading-relaxed">
                Not every lead comes through your booking link. Someone calls you on the 
                job site. A neighbor flags you down. Your buddy sends you a number. Open 
                Lead2Project, add the lead in 30 seconds, and it is on your board. 
                No more forgetting to follow up.
              </p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <h3 className="text-xl font-bold text-white mb-3">
                Send Quotes Without the Back and Forth
              </h3>
              <p className="text-gray-400 leading-relaxed">
                The customer already told you what they need and showed you photos. 
                Review the details, build your quote, and send it. They get a professional 
                email with your company branding. No more scribbling estimates on the back 
                of a business card.
              </p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <h3 className="text-xl font-bold text-white mb-3">
                Look Like a Real Company
              </h3>
              <p className="text-gray-400 leading-relaxed">
                Set up your company identity once. Your logo, your colors, your info. It 
                flows through every customer email, your booking form, and your QR code. 
                Homeowners in {city} trust a {service.toLowerCase()} contractor who looks professional 
                and organized.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Daily Workflow */}
      <section className="py-16 px-4 bg-white/[0.02]">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 text-center">
            What Your Morning Looks Like with Lead2Project
          </h2>
          <p className="text-gray-400 text-center text-lg max-w-3xl mx-auto mb-12">
            Every day at 6AM, you get one email. Here is what is in it.
          </p>
          <div className="bg-white/5 border border-white/10 rounded-xl p-8 max-w-2xl mx-auto">
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 shrink-0"></div>
                <p className="text-gray-300">
                  <span className="text-white font-semibold">New leads overnight.</span> Two 
                  homeowners in {city} submitted {service.toLowerCase()} requests through your booking link while 
                  you were asleep. Photos included.
                </p>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-2 h-2 bg-green-400 rounded-full mt-2 shrink-0"></div>
                <p className="text-gray-300">
                  <span className="text-white font-semibold">Today&apos;s schedule.</span> You have three 
                  jobs lined up. Addresses, customer info, and job details all in one place.
                </p>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2 shrink-0"></div>
                <p className="text-gray-300">
                  <span className="text-white font-semibold">Payment status.</span> One invoice 
                  is overdue. One got paid yesterday.
                </p>
              </div>
            </div>
            <p className="text-gray-500 text-sm mt-6">
              You have not even left the house yet and you already know exactly what your day looks like.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-12 text-center">
            Questions {city} {service} Contractors Ask Us
          </h2>
          <div className="space-y-8">
            <div>
              <h3 className="text-xl font-bold text-white mb-2">
                I already have a system that works. Why switch?
              </h3>
              <p className="text-gray-400 leading-relaxed">
                If your system is texts, calls, and notes on your phone, it works until it 
                does not. One missed callback is one lost job. Lead2Project does not replace 
                how leads come in. It gives you one place to see all of them so nothing 
                gets lost.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-bold text-white mb-2">
                I am not great with technology. Is this complicated?
              </h3>
              <p className="text-gray-400 leading-relaxed">
                If you can use your phone, you can use Lead2Project. Sign up, add your 
                company name and logo, and your booking link and QR code are ready in two 
                minutes. No training needed. No complicated setup.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-bold text-white mb-2">
                What if my customers are not tech-savvy?
              </h3>
              <p className="text-gray-400 leading-relaxed">
                Your booking form is just a simple web page. No app download. They scan your 
                QR code, fill in what they need, take a photo, and hit submit. If your customer 
                can use Facebook, they can use this. And if they would rather just call you, 
                that is fine too. You add the lead yourself in 30 seconds.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-bold text-white mb-2">
                How much does it cost?
              </h3>
              <p className="text-gray-400 leading-relaxed">
                Simple monthly pricing. No setup fees, no contracts. Start with a 14-day free 
                trial. If one saved lead pays for a year of Lead2Project, it pays for itself 
                on day one.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-bold text-white mb-2">
                I tried Jobber and Housecall Pro but they were too much.
              </h3>
              <p className="text-gray-400 leading-relaxed">
                Those tools are built for big operations with fleets and dispatchers. 
                Lead2Project is built for contractors who work solo or with a small crew 
                and just need a simple way to capture leads, send quotes, and stay organized. 
                No bloat. No features you will never use.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Stop Letting {service} Leads Slip Through the Cracks
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Get your booking link and QR code in two minutes. Start capturing every lead 
            in {city} today.
          </p>
          <a
            href="/signup"
            className="inline-block px-10 py-4 bg-white text-blue-700 rounded-lg font-bold text-lg hover:shadow-2xl transition"
          >
            Start Your Free 14-Day Trial
          </a>
          <p className="text-sm text-white/60 mt-4">Cancel anytime.</p>
        </div>
      </section>

      {/* SEO text */}
      <section className="sr-only" aria-hidden="true">
        <h2>{service} contractor software {city}</h2>
        <p>
          {detail.searchTerms.join('. ')}. 
          Best {service.toLowerCase()} app for contractors in {city}. 
          {service} lead tracking {city}. 
          {service.toLowerCase()} job management app. 
          How to get more {service.toLowerCase()} leads in {city}. 
          {service.toLowerCase()} booking software. 
          {service.toLowerCase()} estimate and quoting app. 
          Best app for {service.toLowerCase()} contractors. 
          {service.toLowerCase()} business software {city}. 
          {city} {service.toLowerCase()} contractor scheduling. 
          Simple CRM for {service.toLowerCase()} businesses. 
          How to organize {service.toLowerCase()} leads.
          {service.toLowerCase()} contractor app for iPhone.
          {service.toLowerCase()} contractor app for Android.
          Free {service.toLowerCase()} scheduling software.
          {service.toLowerCase()} invoice and payment app.
        </p>
      </section>
    </div>
  );
}