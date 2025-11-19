import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Header/Nav */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-600">SavvyHomeUpgrade</h1>
          <Link href="/demo">
            <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
              Get Started
            </button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 to-purple-700 text-white py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl md:text-6xl font-bold mb-6">
            Stop Losing Leads to Phone Tag
          </h2>
          <p className="text-xl md:text-2xl mb-8 opacity-90">
            Let customers show you the problem with photos & videos
          </p>
          <Link href="/demo">
            <button className="bg-white text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 shadow-xl">
              Try Demo Form →
            </button>
          </Link>
          <p className="mt-4 text-sm opacity-75">No credit card required</p>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12">How It Works</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="bg-white rounded-xl p-8 shadow-lg">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mb-4">
                1
              </div>
              <h3 className="text-xl font-bold mb-3">Customer Uploads</h3>
              <p className="text-gray-600">
                They snap photos of the issue and upload them with their contact request
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-white rounded-xl p-8 shadow-lg">
              <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mb-4">
                2
              </div>
              <h3 className="text-xl font-bold mb-3">You Get Notified</h3>
              <p className="text-gray-600">
                Instant email with all photos and details. See the scope before you call back
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-white rounded-xl p-8 shadow-lg">
              <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mb-4">
                3
              </div>
              <h3 className="text-xl font-bold mb-3">Close More Jobs</h3>
              <p className="text-gray-600">
                Quote accurately, respond faster, look more professional than competitors
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Screenshot/Demo Section */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">See It In Action</h2>
          <p className="text-gray-600 mb-8">Try our demo contact form</p>
          <Link href="/demo">
            <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:shadow-xl">
              Try Demo Form
            </button>
          </Link>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-4">Simple Pricing</h2>
          <p className="text-xl text-gray-600 mb-12">Less than $5/day</p>
          
          <div className="bg-white rounded-2xl p-10 shadow-xl max-w-md mx-auto border-2 border-blue-600">
            <h3 className="text-2xl font-bold mb-4">Professional</h3>
            <div className="mb-6">
              <span className="text-5xl font-bold text-blue-600">$149</span>
              <span className="text-gray-600">/month</span>
            </div>
            
            <ul className="text-left space-y-3 mb-8">
              <li className="flex items-center">
                <span className="text-green-600 mr-2">✓</span>
                Unlimited uploads
              </li>
              <li className="flex items-center">
                <span className="text-green-600 mr-2">✓</span>
                AI analysis
              </li>
              <li className="flex items-center">
                <span className="text-green-600 mr-2">✓</span>
                Email & SMS alerts
              </li>
              <li className="flex items-center">
                <span className="text-green-600 mr-2">✓</span>
                Dashboard
              </li>
            </ul>
            
            <Link href="/demo">
              <button className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700">
                Get Started
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-6 text-center">
        <p className="text-xl font-bold mb-2">SavvyHomeUpgrade</p>
        <p className="text-gray-400">Built for Long Island contractors</p>
      </footer>
    </div>
  );
}
