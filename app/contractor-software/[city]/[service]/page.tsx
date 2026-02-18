// app/contractor-software/[city]/[service]/page.tsx

import type { Metadata } from 'next';

// Generate static params for all city + service combinations
export async function generateStaticParams() {
  const cities = [
    'new-york', 'brooklyn', 'queens', 'bronx', 'manhattan', 'staten-island',
    'long-island', 'westchester', 'newark', 'jersey-city', 'hoboken',
    'yonkers', 'white-plains', 'stamford', 'bridgeport', 'new-haven'
  ];
  
  const services = [
    'hvac', 'electrical', 'plumbing', 'roofing', 'painting', 
    'handyman', 'landscaping', 'cleaning', 'moving', 'locksmith'
  ];

  const params = [];
  for (const city of cities) {
    for (const service of services) {
      params.push({ city, service });
    }
  }
  
  return params;
}

// FIX: Await params in Next.js 15+
export async function generateMetadata({ params }: { params: Promise<{ city: string; service: string }> }): Promise<Metadata> {
  const { city: citySlug, service: serviceSlug } = await params;
  
  const city = citySlug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  const service = serviceSlug.toUpperCase();
  
  return {
    title: `${service} Lead Management Software ${city} | Contractor Scheduling CRM`,
    description: `Best ${service} scheduling software and lead management system for contractors in ${city}. Capture leads 24/7, automate scheduling, manage your ${service} team. Free trial.`,
    keywords: [
      `${service} software ${city}`,
      `${service} scheduling ${city}`,
      `${service} lead management`,
      `${service} contractor crm`,
      `${service} business software ${city}`,
      `${service} appointment booking`,
      `${service} job scheduling`,
      `lead tracking ${service}`,
      `${service} customer management ${city}`,
      `${service} field service software`
    ].join(', '),
    alternates: {
      canonical: `https://yourdomain.com/contractor-software/${citySlug}/${serviceSlug}`,
    },
    openGraph: {
      title: `${service} Contractor Software - ${city}`,
      description: `Manage leads and schedule jobs for your ${service} business in ${city}`,
    },
  };
}

// FIX: Await params in the page component too
export default async function CityServicePage({ params }: { params: Promise<{ city: string; service: string }> }) {
  const { city: citySlug, service: serviceSlug } = await params;
  
  const city = citySlug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  const service = serviceSlug.toUpperCase();

  const serviceDetails: Record<string, { emoji: string; jobs: string[]; pain: string }> = {
    hvac: {
      emoji: '❄️',
      jobs: ['AC installations', 'heating repairs', 'duct cleaning', 'maintenance calls'],
      pain: 'seasonal demand spikes and emergency service calls'
    },
    electrical: {
      emoji: '⚡',
      jobs: ['panel upgrades', 'wiring repairs', 'lighting installations', 'inspections'],
      pain: 'emergency calls and scheduling conflicts'
    },
    plumbing: {
      emoji: '🔧',
      jobs: ['pipe repairs', 'drain cleaning', 'water heater installations', 'emergency leaks'],
      pain: 'urgent service requests and unpredictable schedules'
    },
    roofing: {
      emoji: '🏠',
      jobs: ['roof replacements', 'leak repairs', 'inspections', 'gutter installations'],
      pain: 'weather-dependent scheduling and large project coordination'
    },
    painting: {
      emoji: '🎨',
      jobs: ['interior painting', 'exterior painting', 'cabinet refinishing', 'commercial jobs'],
      pain: 'multi-day projects and team coordination'
    },
    handyman: {
      emoji: '🔨',
      jobs: ['home repairs', 'furniture assembly', 'drywall repairs', 'small renovations'],
      pain: 'variety of job types and quick turnaround expectations'
    },
    landscaping: {
      emoji: '🌳',
      jobs: ['lawn care', 'tree trimming', 'garden design', 'seasonal cleanups'],
      pain: 'weather dependencies and seasonal workload fluctuations'
    },
    cleaning: {
      emoji: '🧹',
      jobs: ['house cleaning', 'deep cleaning', 'move-out cleaning', 'commercial cleaning'],
      pain: 'high volume of bookings and recurring appointments'
    },
    moving: {
      emoji: '📦',
      jobs: ['residential moves', 'commercial moves', 'packing services', 'storage'],
      pain: 'tight scheduling windows and resource allocation'
    },
    locksmith: {
      emoji: '🔑',
      jobs: ['lock changes', 'car lockouts', 'safe installations', 'security upgrades'],
      pain: 'emergency calls and immediate response requirements'
    },
  };

  const detail = serviceDetails[serviceSlug] || serviceDetails.hvac;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800">
      
      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
              {detail.emoji} {service} Lead Management & Scheduling Software in {city}
            </h1>
            <h2 className="text-2xl sm:text-3xl text-gray-300 mb-8">
              Built for {city} {service} Contractors Who Want to Stop Losing Leads
            </h2>
            <p className="text-lg text-gray-400 max-w-3xl mx-auto mb-8">
              If you run a {serviceSlug} business in {city}, you know the challenge of {detail.pain}. 
              Our contractor management software helps {city} {serviceSlug} companies capture every lead, 
              automate scheduling, and manage their team—all from one dashboard.
            </p>
          </div>

          {/* Problem Section - City Specific */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-8 mb-12">
            <h3 className="text-2xl font-bold text-white mb-6">
              Challenges for {service} Contractors in {city}
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-lg font-semibold text-blue-400 mb-3">❌ Before Our Software</h4>
                <ul className="space-y-2 text-gray-400">
                  <li>• Missed {serviceSlug} leads from {city} homeowners calling after hours</li>
                  <li>• Double-booked appointments across {city} neighborhoods</li>
                  <li>• Techs showing up late to jobs in {city}</li>
                  <li>• Lost customer information and job notes</li>
                  <li>• No visibility into team schedules</li>
                  <li>• Hours wasted on phone calls and paperwork</li>
                </ul>
              </div>
              <div>
                <h4 className="text-lg font-semibold text-green-400 mb-3">✅ After Our Software</h4>
                <ul className="space-y-2 text-gray-400">
                  <li>• Capture 100% of {serviceSlug} leads in {city} automatically</li>
                  <li>• Visual calendar prevents scheduling conflicts</li>
                  <li>• Technicians get automatic job notifications</li>
                  <li>• All customer data in one secure {serviceSlug} CRM</li>
                  <li>• Real-time team scheduling across {city}</li>
                  <li>• Save 10+ hours per week on admin work</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Features - Service Specific */}
          <div className="mb-12">
            <h3 className="text-3xl font-bold text-white mb-8 text-center">
              Features Built for {city} {service} Businesses
            </h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-blue-600/20 to-blue-800/20 border border-blue-500/30 rounded-xl p-6">
                <div className="text-3xl mb-4">📞</div>
                <h4 className="text-xl font-bold text-white mb-3">24/7 Lead Capture</h4>
                <p className="text-gray-400">
                  Never miss a {serviceSlug} lead in {city}. Capture inquiries from your website, 
                  phone calls, texts, and social media—even when you're on a job site.
                </p>
              </div>

              <div className="bg-gradient-to-br from-purple-600/20 to-purple-800/20 border border-purple-500/30 rounded-xl p-6">
                <div className="text-3xl mb-4">📅</div>
                <h4 className="text-xl font-bold text-white mb-3">Smart Scheduling</h4>
                <p className="text-gray-400">
                  Visual calendar for {detail.jobs.join(', ')} across {city}. 
                  See your team's availability, prevent double-bookings, schedule jobs in seconds.
                </p>
              </div>

              <div className="bg-gradient-to-br from-green-600/20 to-green-800/20 border border-green-500/30 rounded-xl p-6">
                <div className="text-3xl mb-4">👥</div>
                <h4 className="text-xl font-bold text-white mb-3">Team Management</h4>
                <p className="text-gray-400">
                  Coordinate your {serviceSlug} technicians across {city}. Assign jobs, 
                  track locations, manage schedules—all in real-time.
                </p>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-12">
            <h3 className="text-3xl font-bold text-white mb-4">
              Ready to Stop Losing {service} Leads in {city}?
            </h3>
            <p className="text-xl text-white/90 mb-8">
              Join hundreds of {city} {serviceSlug} contractors who've automated their lead management
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="/signup" className="px-8 py-4 bg-white text-blue-600 rounded-lg font-bold text-lg hover:shadow-2xl transition">
                Start Free Trial
              </a>
              <a href="/demo" className="px-8 py-4 bg-white/20 border-2 border-white text-white rounded-lg font-bold text-lg hover:bg-white/30 transition">
                Schedule Demo
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}