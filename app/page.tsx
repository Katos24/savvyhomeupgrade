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
            <Link href="/dashboard" className="w-full sm:w-auto bg-gray-800 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition text-center">
              Dashboard Login
            </Link>
          </div>
        </div>
      </header>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
        <div className="text-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 mb-4 sm:mb-6 px-4">
            Know Before You Go
          </h2>
          <p className="text-lg sm:text-xl md:text-2xl text-gray-600 mb-6 sm:mb-8 max-w-3xl mx-auto px-4">
            Stop wasting time on unqualified leads. See photos and AI analysis before you drive there.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center px-4">
            <Link href="/upload" className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition shadow-lg text-center">
              📸 Submit Your Project
            </Link>
            <a href="#how-it-works" className="bg-white text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-50 transition border-2 border-blue-600 text-center">
              Learn More
            </a>
          </div>
        </div>
      </section>

      <section className="bg-white py-12 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-2xl sm:text-3xl font-bold text-center mb-8 sm:mb-12">
            Perfect For Service Businesses
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            <div className="text-center p-6">
              <div className="text-4xl sm:text-5xl mb-4">🏠</div>
              <h4 className="font-bold text-lg sm:text-xl mb-2">Home Services</h4>
              <p className="text-sm sm:text-base text-gray-600">
                Contractors, Roofing, Plumbing, HVAC, Electrical
              </p>
            </div>
            <div className="text-center p-6">
              <div className="text-4xl sm:text-5xl mb-4">🚗</div>
              <h4 className="font-bold text-lg sm:text-xl mb-2">Auto Services</h4>
              <p className="text-sm sm:text-base text-gray-600">
                Body Shops, Mechanics, Detailing
              </p>
            </div>
            <div className="text-center p-6">
              <div className="text-4xl sm:text-5xl mb-4">🌳</div>
              <h4 className="font-bold text-lg sm:text-xl mb-2">Outdoor Services</h4>
              <p className="text-sm sm:text-base text-gray-600">
                Landscaping, Tree Service, Pools
              </p>
            </div>
            <div className="text-center p-6">
              <div className="text-4xl sm:text-5xl mb-4">🔧</div>
              <h4 className="font-bold text-lg sm:text-xl mb-2">Other Services</h4>
              <p className="text-sm sm:text-base text-gray-600">
                Appliance Repair, Pest Control, Property Management
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="py-12 sm:py-20 bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-2xl sm:text-3xl font-bold text-center mb-8 sm:mb-12">
            How It Works
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            <div className="bg-white rounded-lg p-6 sm:p-8 shadow-md">
              <div className="text-3xl sm:text-4xl mb-4">1️⃣</div>
              <h4 className="font-bold text-lg sm:text-xl mb-3">Customer Uploads Photos</h4>
              <p className="text-sm sm:text-base text-gray-600">
                Simple form. Upload photos or videos. Describe the issue. Takes 2 minutes.
              </p>
            </div>
            <div className="bg-white rounded-lg p-6 sm:p-8 shadow-md">
              <div className="text-3xl sm:text-4xl mb-4">2️⃣</div>
              <h4 className="font-bold text-lg sm:text-xl mb-3">AI Analyzes the Job</h4>
              <p className="text-sm sm:text-base text-gray-600">
                Instant analysis: Urgency level, complexity, damage scope, recommended action.
              </p>
            </div>
            <div className="bg-white rounded-lg p-6 sm:p-8 shadow-md">
              <div className="text-3xl sm:text-4xl mb-4">3️⃣</div>
              <h4 className="font-bold text-lg sm:text-xl mb-3">You Decide Before You Drive</h4>
              <p className="text-sm sm:text-base text-gray-600">
                See everything in your dashboard. Quote remotely or schedule a visit. No more wasted trips.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-blue-600 text-white py-12 sm:py-20">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6">
            Ready to Stop Wasting Time?
          </h3>
          <p className="text-lg sm:text-xl mb-6 sm:mb-8 px-4">
            Join service businesses that are pre-screening leads and saving 10 plus hours per week.
          </p>
          <Link href="/upload" className="inline-block bg-white text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition shadow-lg">
            Get Started Free
          </Link>
        </div>
      </section>

      <footer className="bg-gray-900 text-white py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm sm:text-base">&copy; 2024 SavvyHomeUpgrade. Built for service professionals.</p>
          <div className="mt-4">
            <Link href="/dashboard" className="text-blue-400 hover:text-blue-300 text-sm sm:text-base">
              Business Login
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
