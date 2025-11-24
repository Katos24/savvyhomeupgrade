import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center sm:text-left">
              SavvyHome<span className="text-blue-600">Upgrade</span>
            </h1>
            <div className="flex gap-3">
              <Link href="/demo" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition text-center">
                See Demo
              </Link>
              <Link href="/dashboard" className="bg-gray-800 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition text-center">
                Login
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
        <div className="text-center">
          <div className="inline-block bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-semibold mb-6">
            🚀 For Contractors & Service Businesses
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 mb-4 sm:mb-6 px-4">
            Stop Chasing Unqualified Leads
          </h2>
          <p className="text-lg sm:text-xl md:text-2xl text-gray-600 mb-6 sm:mb-8 max-w-3xl mx-auto px-4">
            Get photos + AI analysis before you drive. Add to your website in 2 minutes. Save 10+ hours per week.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center px-4">
            <Link href="/demo" className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition shadow-lg text-center">
              🎯 See Live Demo
            </Link>
            <a href="#how-it-works" className="bg-white text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-50 transition border-2 border-blue-600 text-center">
              How It Works
            </a>
          </div>
          <p className="mt-6 text-sm text-gray-500">
            ✓ Works with your existing website  ✓ No app download  ✓ Setup in 2 minutes
          </p>
        </div>
      </section>

      {/* The Problem Section */}
      <section className="bg-white py-12 sm:py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h3 className="text-2xl sm:text-3xl font-bold mb-4">
              Sound Familiar?
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-lg">
              <div className="text-3xl mb-3">😤</div>
              <p className="text-gray-700">
                "Can you send me a picture?" → 3 days of back-and-forth texts
              </p>
            </div>
            <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-lg">
              <div className="text-3xl mb-3">🚗</div>
              <p className="text-gray-700">
                Drive 45 minutes for a "quick look" that's actually a $50 job
              </p>
            </div>
            <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-lg">
              <div className="text-3xl mb-3">📞</div>
              <p className="text-gray-700">
                Spend 20 minutes on phone trying to understand the problem
              </p>
            </div>
            <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-lg">
              <div className="text-3xl mb-3">❌</div>
              <p className="text-gray-700">
                Show up and realize you need different tools/materials
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* The Solution */}
      <section className="py-12 sm:py-20 bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="text-2xl sm:text-3xl font-bold mb-4">
              Here's How It Works
            </h3>
            <p className="text-lg text-gray-600">
              Simple for you. Even simpler for your customers.
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center mb-16">
            <div className="bg-white rounded-xl p-8 shadow-lg">
              <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-lg inline-block mb-4 font-semibold text-sm">
                STEP 1: 2-MINUTE SETUP
              </div>
              <h4 className="text-2xl font-bold mb-4">Add Widget to Your Website</h4>
              <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm mb-4 overflow-x-auto">
                <div>&lt;script src="...embed.js"&gt;&lt;/script&gt;</div>
                <div>&lt;div data-company="acme-roofing"&gt;&lt;/div&gt;</div>
              </div>
              <p className="text-gray-600 mb-4">
                Paste 2 lines of code on your Contact page, Get a Quote page, or anywhere you want.
              </p>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">✓</span>
                  <span>Works with WordPress, Squarespace, Wix, custom sites</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">✓</span>
                  <span>No monthly fees, no complicated setup</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">✓</span>
                  <span>Looks professional, matches your brand</span>
                </li>
              </ul>
            </div>
            
            <div className="bg-gradient-to-br from-blue-600 to-purple-600 text-white rounded-xl p-8 shadow-lg">
              <div className="text-4xl mb-4">📸</div>
              <h4 className="text-2xl font-bold mb-4">Your Customers Upload Photos</h4>
              <p className="mb-4 text-blue-100">
                They visit your site, fill out a simple form, upload photos/videos of the project. Takes them 2 minutes.
              </p>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                <p className="text-sm mb-2 font-semibold">Sample Form Fields:</p>
                <ul className="text-sm space-y-1 text-blue-100">
                  <li>• Name & Contact Info</li>
                  <li>• Project Type (Roofing, Plumbing, etc.)</li>
                  <li>• Description</li>
                  <li>• Photo/Video Upload</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-xl p-8 shadow-lg order-2 lg:order-1">
              <div className="text-4xl mb-4">🤖</div>
              <h4 className="text-2xl font-bold mb-4">AI Analyzes in Seconds</h4>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-5 border border-white/20 mb-4">
                <div className="space-y-3 text-sm">
                  <div><span className="font-bold">Condition:</span> Critical ⚠️</div>
                  <div><span className="font-bold">Urgency:</span> Emergency</div>
                  <div><span className="font-bold">Complexity:</span> Simple</div>
                  <div><span className="font-bold">Est. Cost:</span> $225 - $310</div>
                  <div className="pt-2 border-t border-white/20 text-xs text-green-100">
                    "Exposed electrical outlet with live wires. Must shut off breaker before work..."
                  </div>
                </div>
              </div>
              <p className="text-green-100">
                Instant analysis tells you: urgency, complexity, safety concerns, and estimated cost range.
              </p>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-lg order-1 lg:order-2">
              <div className="bg-green-100 text-green-800 px-4 py-2 rounded-lg inline-block mb-4 font-semibold text-sm">
                STEP 2: YOU RESPOND SMARTER
              </div>
              <h4 className="text-2xl font-bold mb-4">See Everything in Your Dashboard</h4>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start gap-3">
                  <div className="bg-blue-100 text-blue-600 rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">1</div>
                  <div>
                    <strong>See photos + AI report</strong>
                    <p className="text-sm text-gray-600">Know exactly what you're dealing with</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="bg-blue-100 text-blue-600 rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">2</div>
                  <div>
                    <strong>Decide: Quote remotely or schedule visit</strong>
                    <p className="text-sm text-gray-600">Skip the wasted trips for simple jobs</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="bg-blue-100 text-blue-600 rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">3</div>
                  <div>
                    <strong>Call or text with one tap</strong>
                    <p className="text-sm text-gray-600">Contact info right there, ready to go</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Perfect For Section */}
      <section className="bg-white py-12 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-2xl sm:text-3xl font-bold text-center mb-8 sm:mb-12">
            Perfect For Local Service Businesses
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            <div className="text-center p-6 hover:bg-blue-50 rounded-lg transition">
              <div className="text-4xl sm:text-5xl mb-4">🏠</div>
              <h4 className="font-bold text-lg sm:text-xl mb-2">Home Contractors</h4>
              <p className="text-sm sm:text-base text-gray-600">
                Roofing, Plumbing, HVAC, Electrical, General Contractors
              </p>
            </div>
            <div className="text-center p-6 hover:bg-blue-50 rounded-lg transition">
              <div className="text-4xl sm:text-5xl mb-4">🚗</div>
              <h4 className="font-bold text-lg sm:text-xl mb-2">Auto Services</h4>
              <p className="text-sm sm:text-base text-gray-600">
                Body Shops, Mechanics, Detailing, Tire Shops
              </p>
            </div>
            <div className="text-center p-6 hover:bg-blue-50 rounded-lg transition">
              <div className="text-4xl sm:text-5xl mb-4">🏢</div>
              <h4 className="font-bold text-lg sm:text-xl mb-2">Property Management</h4>
              <p className="text-sm sm:text-base text-gray-600">
                Landlords, HOAs, Commercial Property Managers
              </p>
            </div>
            <div className="text-center p-6 hover:bg-blue-50 rounded-lg transition">
              <div className="text-4xl sm:text-5xl mb-4">🌳</div>
              <h4 className="font-bold text-lg sm:text-xl mb-2">Outdoor Services</h4>
              <p className="text-sm sm:text-base text-gray-600">
                Landscaping, Tree Service, Pool Service, Pest Control
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-12 sm:py-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-2xl sm:text-3xl font-bold text-center mb-12">
            What You'll Save
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl p-8 shadow-md text-center">
              <div className="text-5xl mb-4">⏰</div>
              <div className="text-4xl font-bold text-blue-600 mb-2">10+</div>
              <div className="text-xl font-semibold mb-2">Hours Per Week</div>
              <p className="text-gray-600 text-sm">
                Less time chasing details, more time doing actual work
              </p>
            </div>
            <div className="bg-white rounded-xl p-8 shadow-md text-center">
              <div className="text-5xl mb-4">🚗</div>
              <div className="text-4xl font-bold text-blue-600 mb-2">50%</div>
              <div className="text-xl font-semibold mb-2">Fewer Wasted Trips</div>
              <p className="text-gray-600 text-sm">
                Only drive when it's worth your time and gas
              </p>
            </div>
            <div className="bg-white rounded-xl p-8 shadow-md text-center">
              <div className="text-5xl mb-4">💰</div>
              <div className="text-4xl font-bold text-blue-600 mb-2">3x</div>
              <div className="text-xl font-semibold mb-2">More Qualified Leads</div>
              <p className="text-gray-600 text-sm">
                Focus on serious customers who are ready to hire
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-12 sm:py-20">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6">
            Ready to Stop Wasting Time?
          </h3>
          <p className="text-lg sm:text-xl mb-6 sm:mb-8 px-4 opacity-95">
            See the live demo in action. Watch how easy it is to add to your website.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/demo" className="inline-block bg-white text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition shadow-lg">
              🎯 View Live Demo
            </Link>
            <Link href="mailto:contact@savvyhomeupgrade.com" className="inline-block bg-transparent border-2 border-white text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-white/10 transition">
              💬 Schedule a Call
            </Link>
          </div>
          <p className="mt-6 text-sm opacity-90">
            Local Long Island businesses get priority setup • Free for first 30 days
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <h4 className="font-bold text-lg mb-4">SavvyHomeUpgrade</h4>
              <p className="text-gray-400 text-sm">
                Helping local contractors pre-screen leads and save time.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-lg mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/demo" className="text-gray-400 hover:text-white">Live Demo</Link></li>
                <li><Link href="/dashboard" className="text-gray-400 hover:text-white">Business Login</Link></li>
                <li><a href="#how-it-works" className="text-gray-400 hover:text-white">How It Works</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-lg mb-4">Contact</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>📧 contact@savvyhomeupgrade.com</li>
                <li>📍 Serving Long Island, NY</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-6 text-center text-sm text-gray-400">
<p>&copy; {new Date().getFullYear()} SavvyHomeUpgrade. Built for service professionals who value their time.</p>          </div>
        </div>
      </footer>
    </div>
  );
}