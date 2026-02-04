import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Fixed Header */}
      <header className="fixed top-0 w-full bg-white/90 backdrop-blur-md shadow-sm z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-xl">L2P</span>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Lead2Project
              </span>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/login" className="text-gray-600 hover:text-gray-900 font-medium px-4 py-2 hidden sm:block">
                Login
              </Link>
              <Link href="/signup" className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2.5 rounded-xl hover:shadow-lg transition font-semibold">
                Start Free Trial
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 px-4 py-2 rounded-full text-sm font-semibold mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            14-Day Free Trial • Card Required • Cancel Anytime
          </div>
          
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-gray-900 mb-6 leading-tight">
            Stop Losing Track of <br />
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Customer Requests
            </span>
          </h1>
          
          <p className="text-xl sm:text-2xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed">
            Customers upload photos. You get organized leads. Close more deals.<br />
            <span className="text-base text-gray-500 mt-2 block">Perfect for contractors, home services, and repair businesses.</span>
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/signup" className="group bg-gradient-to-r from-blue-600 to-purple-600 text-white px-10 py-5 rounded-xl text-lg font-bold hover:shadow-2xl hover:scale-105 transition transform flex items-center gap-2">
              Start Free Trial
              <svg className="w-5 h-5 group-hover:translate-x-1 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
            <Link href="/demo" className="bg-white text-gray-700 border-2 border-gray-200 px-10 py-5 rounded-xl text-lg font-bold hover:border-gray-300 hover:shadow-lg transition">
              See Live Demo
            </Link>
          </div>
          
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>14-day free trial</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Setup in 2 minutes</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Cancel anytime</span>
            </div>
          </div>
        </div>

        {/* Dashboard Preview */}
        <div className="mt-20 max-w-5xl mx-auto">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur-3xl opacity-20"></div>
            <div className="relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl shadow-2xl p-2 border border-gray-700">
              <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-8 min-h-[400px] flex items-center justify-center">
                <div className="text-center space-y-6 max-w-md">
                  <div className="text-7xl">📊</div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Your Command Center</h3>
                    <p className="text-gray-600">Every lead with photos, contacts, and notes—all in one dashboard</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The Problem */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Sound Familiar?
            </h2>
            <p className="text-xl text-gray-600">The daily chaos of running a service business</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { emoji: "📞", text: "\"Can you send me a picture?\" followed by 3 days of back-and-forth" },
              { emoji: "🤯", text: "Requests scattered across texts, emails, voicemails, and Facebook" },
              { emoji: "📝", text: "Sticky notes everywhere. You know you're forgetting someone." },
              { emoji: "❓", text: "Customers asking for quotes without telling you what they need" }
            ].map((item, i) => (
              <div key={i} className="bg-white border-2 border-red-100 p-6 rounded-xl hover:shadow-lg transition">
                <div className="text-4xl mb-3">{item.emoji}</div>
                <p className="text-gray-700 text-lg">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Dead Simple. 3 Steps.
            </h2>
            <p className="text-xl text-gray-600">For you AND your customers</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl">🔗</span>
              </div>
              <h3 className="text-2xl font-bold mb-3">1. Get Your Link</h3>
              <p className="text-gray-600 mb-4">
                Sign up, get your custom link:<br />
                <span className="font-mono text-sm bg-gray-100 px-3 py-1 rounded mt-2 inline-block">
                  lead2project.com/your-business
                    </span>
              </p>
              <p className="text-sm text-gray-500">Takes 2 minutes to set up</p>
            </div>

            <div className="text-center">
              <div className="bg-purple-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl">📸</span>
              </div>
              <h3 className="text-2xl font-bold mb-3">2. Customers Submit</h3>
              <p className="text-gray-600 mb-4">
                They upload photos, add details, and hit send. You get notified instantly.
              </p>
              <p className="text-sm text-gray-500">Name, phone, email, photos—all captured</p>
            </div>

            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl">✅</span>
              </div>
              <h3 className="text-2xl font-bold mb-3">3. You Get Organized</h3>
              <p className="text-gray-600 mb-4">
                See all leads in your dashboard. Track status. Add notes. Never lose track.
              </p>
              <p className="text-sm text-gray-500">New → Contacted → Quoted → Done</p>
            </div>
          </div>
        </div>
      </section>

      {/* Perfect For */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Perfect For Service Providers
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              If you need to see photos before quoting, this is for you
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { emoji: "🏠", title: "Contractors" },
              { emoji: "🔧", title: "HVAC & Plumbing" },
              { emoji: "🎨", title: "Painters" },
              { emoji: "⚡", title: "Electricians" },
              { emoji: "🚗", title: "Auto Repair" },
              { emoji: "🧹", title: "Cleaning" },
              { emoji: "🌳", title: "Landscaping" },
              { emoji: "🔨", title: "Handyman" }
            ].map((service, i) => (
              <div key={i} className="bg-white p-6 rounded-xl text-center hover:shadow-xl transition transform hover:scale-105">
                <div className="text-5xl mb-3">{service.emoji}</div>
                <h3 className="font-bold text-gray-900">{service.title}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing CTA */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl sm:text-5xl font-bold mb-6">
            Try It Free for 14 Days
          </h2>
          <p className="text-xl mb-4 opacity-95">
            Just <span className="font-bold">$39.99/month</span> after trial
          </p>
          <p className="text-lg mb-8 opacity-90">
            Card required, but you won't be charged if you cancel during the trial
          </p>
          
          <Link href="/signup" className="inline-block bg-white text-blue-600 px-10 py-5 rounded-xl text-xl font-bold hover:shadow-2xl hover:scale-105 transition transform">
            Start Your Free Trial →
          </Link>
          
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Unlimited leads</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Photo uploads</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Cancel anytime</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">L2P</span>
                </div>
                <span className="text-xl font-bold">Lead2Project</span>
              </div>
              <p className="text-gray-400 text-sm">
                Simple lead management for service providers. Get organized. Close more deals.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-lg mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/signup" className="text-gray-400 hover:text-white">Start Free Trial</Link></li>
                <li><Link href="/demo" className="text-gray-400 hover:text-white">Live Demo</Link></li>
                <li><Link href="/login" className="text-gray-400 hover:text-white">Login</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-lg mb-4">Contact</h4>
              <p className="text-gray-400 text-sm">
                📧 support@lead2project.com
              </p>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-6 text-center text-sm text-gray-400">
            <p>&copy; {new Date().getFullYear()} Lead2Project. Built for service providers.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}