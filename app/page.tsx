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
            🚀 For Service Providers Who Get Requests to Work
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 mb-4 sm:mb-6 px-4">
            Customers Send Photos. You Stay Organized.
          </h2>
          <p className="text-lg sm:text-xl md:text-2xl text-gray-600 mb-6 sm:mb-8 max-w-3xl mx-auto px-4">
            Stop playing phone tag. Customers upload photos/videos + explain what they need. All their contact info captured. Every request becomes an organized lead in your dashboard.
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
            ✓ Works with your existing website  ✓ Built-in CRM  ✓ Setup in 2 minutes
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
              <div className="text-3xl mb-3">📞</div>
              <p className="text-gray-700">
                <strong>"Can you send me a picture?"</strong> → 3 days of back-and-forth texts trying to see what they need
              </p>
            </div>
            <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-lg">
              <div className="text-3xl mb-3">🤯</div>
              <p className="text-gray-700">
                Requests scattered everywhere: texts, voicemails, emails, Facebook DMs. <strong>Which ones did you reply to?</strong>
              </p>
            </div>
            <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-lg">
              <div className="text-3xl mb-3">❓</div>
              <p className="text-gray-700">
                <strong>"Can you just give me a ballpark?"</strong> when they haven't even described what they need
              </p>
            </div>
            <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-lg">
              <div className="text-3xl mb-3">📝</div>
              <p className="text-gray-700">
                Sticky notes and screenshots everywhere. <strong>You know you're forgetting to follow up</strong> with someone important.
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
              Dead simple. For you AND your customers.
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center mb-16">
            <div className="bg-white rounded-xl p-8 shadow-lg">
              <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-lg inline-block mb-4 font-semibold text-sm">
                STEP 1: 2-MINUTE SETUP
              </div>
              <h4 className="text-2xl font-bold mb-4">Get Your Unique Link</h4>
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-lg mb-4 text-center">
                <p className="text-sm opacity-90 mb-2">Your personal link:</p>
                <p className="text-lg font-bold">savvyhome.co/your-business</p>
              </div>
              <p className="text-gray-600 mb-4">
                We give you a custom link. Share it anywhere. That's it. No coding required.
              </p>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">✓</span>
                  <span>Post it on Facebook, Instagram, your website</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">✓</span>
                  <span>Text it to customers who ask for quotes</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">✓</span>
                  <span>Print a QR code for business cards, vehicles, yard signs</span>
                </li>
              </ul>
              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-sm font-semibold text-gray-700 mb-2">Plus, you get:</p>
                <div className="flex flex-wrap gap-2">
                  <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-medium">📱 QR Code</span>
                  <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-medium">🌐 Embeddable Widget</span>
                  <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-medium">📧 Email Ready</span>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-blue-600 to-purple-600 text-white rounded-xl p-8 shadow-lg">
              <div className="text-4xl mb-4">📸</div>
              <h4 className="text-2xl font-bold mb-4">Customers Fill Out Simple Form</h4>
              <p className="mb-4 text-blue-100">
                They click your link, fill out a form, and upload photos/videos showing what they need. Takes them 2 minutes.
              </p>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                <p className="text-sm mb-2 font-semibold">What They Submit:</p>
                <ul className="text-sm space-y-1 text-blue-100">
                  <li>• Name & Contact Info (phone, email)</li>
                  <li>• Service Type (haircut, oil change, dog grooming, etc.)</li>
                  <li>• Description of what they need</li>
                  <li>• Photos/Videos showing the situation</li>
                  <li>• When they need it done</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-8 shadow-lg">
            <div className="bg-green-100 text-green-800 px-4 py-2 rounded-lg inline-block mb-4 font-semibold text-sm">
              STEP 2: EVERYTHING IN YOUR DASHBOARD
            </div>
            <h4 className="text-2xl font-bold mb-6">See All Your Leads. Stay Organized.</h4>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h5 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <span className="bg-blue-100 text-blue-600 rounded-full w-8 h-8 flex items-center justify-center text-sm">1</span>
                  Every Request Becomes a Lead
                </h5>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600">•</span>
                    <span>See photos/videos they uploaded</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600">•</span>
                    <span>Read their description</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600">•</span>
                    <span>All contact info right there</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600">•</span>
                    <span>One-tap to call, text, or email</span>
                  </li>
                </ul>
              </div>
              
              <div>
                <h5 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <span className="bg-blue-100 text-blue-600 rounded-full w-8 h-8 flex items-center justify-center text-sm">2</span>
                  Track Status Through Pipeline
                </h5>
                <div className="space-y-2">
                  <div className="bg-gray-50 px-4 py-2 rounded border-l-4 border-blue-500">
                    <span className="font-semibold">🆕 New</span> → Just came in
                  </div>
                  <div className="bg-gray-50 px-4 py-2 rounded border-l-4 border-yellow-500">
                    <span className="font-semibold">📞 Contacted</span> → You reached out
                  </div>
                  <div className="bg-gray-50 px-4 py-2 rounded border-l-4 border-purple-500">
                    <span className="font-semibold">💰 Quoted</span> → Sent them a price
                  </div>
                  <div className="bg-gray-50 px-4 py-2 rounded border-l-4 border-green-500">
                    <span className="font-semibold">✅ Completed</span> → Job done!
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-8 border-t border-gray-200">
              <h5 className="font-bold text-lg mb-4 flex items-center gap-2">
                <span className="bg-blue-100 text-blue-600 rounded-full w-8 h-8 flex items-center justify-center text-sm">3</span>
                Add Notes & Set Reminders
              </h5>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-700">
                    <strong className="text-blue-700">💭 Notes:</strong> "Customer wants same color as last time" or "Called, left voicemail"
                  </p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-700">
                    <strong className="text-purple-700">🔔 Reminders:</strong> "Follow up Friday" or "Estimate expires next week"
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How to Use It Section */}
      <section className="bg-gradient-to-br from-purple-50 to-pink-50 py-12 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="text-2xl sm:text-3xl font-bold mb-4">
              Multiple Ways to Capture Leads
            </h3>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              One tool, endless possibilities. Use your unique link or QR code anywhere you connect with customers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition">
              <div className="bg-blue-100 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <span className="text-2xl">🌐</span>
              </div>
              <h4 className="text-lg font-bold mb-2">Embed on Your Website</h4>
              <p className="text-gray-600 text-sm mb-3">
                Add the widget directly to your Contact, Get a Quote, or Services page. Visitors submit right there.
              </p>
              <div className="bg-gray-50 px-3 py-2 rounded text-xs text-gray-700">
                Perfect for: Contact pages, service pages
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition">
              <div className="bg-green-100 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <span className="text-2xl">🔗</span>
              </div>
              <h4 className="text-lg font-bold mb-2">Share Your Link</h4>
              <p className="text-gray-600 text-sm mb-3">
                Get a unique URL (e.g., savvyhome.co/your-business). Share it in emails, texts, or DMs.
              </p>
              <div className="bg-gray-50 px-3 py-2 rounded text-xs text-gray-700">
                Perfect for: Email signatures, text messages
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition">
              <div className="bg-purple-100 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <span className="text-2xl">📱</span>
              </div>
              <h4 className="text-lg font-bold mb-2">QR Code</h4>
              <p className="text-gray-600 text-sm mb-3">
                Generate a QR code that opens your form instantly. Print it or display it anywhere.
              </p>
              <div className="bg-gray-50 px-3 py-2 rounded text-xs text-gray-700">
                Perfect for: Business cards, yard signs, vehicles
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition">
              <div className="bg-blue-100 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <span className="text-2xl">👍</span>
              </div>
              <h4 className="text-lg font-bold mb-2">Facebook & Social Media</h4>
              <p className="text-gray-600 text-sm mb-3">
                Post your link on Facebook, Instagram bio, LinkedIn. Drive followers directly to your form.
              </p>
              <div className="bg-gray-50 px-3 py-2 rounded text-xs text-gray-700">
                Perfect for: Social media posts, bio links
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition">
              <div className="bg-yellow-100 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <span className="text-2xl">📧</span>
              </div>
              <h4 className="text-lg font-bold mb-2">Email Campaigns</h4>
              <p className="text-gray-600 text-sm mb-3">
                Include your link in newsletters, follow-up emails, or promotional campaigns.
              </p>
              <div className="bg-gray-50 px-3 py-2 rounded text-xs text-gray-700">
                Perfect for: Marketing emails, follow-ups
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition">
              <div className="bg-red-100 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <span className="text-2xl">📢</span>
              </div>
              <h4 className="text-lg font-bold mb-2">Google/Facebook Ads</h4>
              <p className="text-gray-600 text-sm mb-3">
                Use your form link as the landing page for paid ads. Capture leads with photos instantly.
              </p>
              <div className="bg-gray-50 px-3 py-2 rounded text-xs text-gray-700">
                Perfect for: Paid advertising campaigns
              </div>
            </div>
          </div>

          <div className="mt-12 bg-white rounded-xl p-8 shadow-lg border-2 border-purple-200">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h4 className="text-xl font-bold mb-4">Real-World Example</h4>
                <div className="space-y-3 text-gray-700">
                  <div className="flex gap-3">
                    <span className="text-purple-600 font-bold">1.</span>
                    <p><strong>Website embed:</strong> Visitors request quotes directly from your site</p>
                  </div>
                  <div className="flex gap-3">
                    <span className="text-purple-600 font-bold">2.</span>
                    <p><strong>QR on truck:</strong> People scan it when they see your work</p>
                  </div>
                  <div className="flex gap-3">
                    <span className="text-purple-600 font-bold">3.</span>
                    <p><strong>Facebook post:</strong> "Need repairs? Submit photos here 👉 [link]"</p>
                  </div>
                  <div className="flex gap-3">
                    <span className="text-purple-600 font-bold">4.</span>
                    <p><strong>Text to customer:</strong> "Send me details here: [link]"</p>
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-purple-100 to-blue-100 rounded-lg p-6">
                <div className="text-center mb-4">
                  <div className="inline-block bg-white p-4 rounded-lg shadow-md">
                    <div className="w-32 h-32 bg-gray-800 rounded flex items-center justify-center text-white text-xs">
                      [QR CODE]
                    </div>
                  </div>
                </div>
                <p className="text-center text-sm text-gray-700 font-semibold">
                  Scan to Submit Your Project
                </p>
                <p className="text-center text-xs text-gray-600 mt-2">
                  YourBusiness.com/quote
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Perfect For Section */}
      <section className="bg-white py-12 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-2xl sm:text-3xl font-bold text-center mb-4">
            Perfect For Anyone Who Gets Requests to Work
          </h3>
          <p className="text-center text-gray-600 mb-8 sm:mb-12 max-w-3xl mx-auto">
            If customers need to show you something before you can give them a quote or schedule them, this is for you.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            <div className="text-center p-6 hover:bg-blue-50 rounded-lg transition">
              <div className="text-4xl sm:text-5xl mb-4">💇</div>
              <h4 className="font-bold text-lg sm:text-xl mb-2">Hair & Beauty</h4>
              <p className="text-sm sm:text-base text-gray-600">
                Hairdressers, Barbers, Nail Salons, Estheticians, Makeup Artists
              </p>
              <p className="text-xs text-blue-600 mt-2 font-medium">
                "Send me a photo of your current hair color"
              </p>
            </div>
            <div className="text-center p-6 hover:bg-blue-50 rounded-lg transition">
              <div className="text-4xl sm:text-5xl mb-4">🔧</div>
              <h4 className="font-bold text-lg sm:text-xl mb-2">Auto & Repair</h4>
              <p className="text-sm sm:text-base text-gray-600">
                Mechanics, Body Shops, Mobile Detailing, Tire Shops, Windshield Repair
              </p>
              <p className="text-xs text-blue-600 mt-2 font-medium">
                "Show me the damage/noise/issue"
              </p>
            </div>
            <div className="text-center p-6 hover:bg-blue-50 rounded-lg transition">
              <div className="text-4xl sm:text-5xl mb-4">🐕</div>
              <h4 className="font-bold text-lg sm:text-xl mb-2">Pet Services</h4>
              <p className="text-sm sm:text-base text-gray-600">
                Dog Groomers, Pet Sitters, Dog Trainers, Mobile Vet Services
              </p>
              <p className="text-xs text-blue-600 mt-2 font-medium">
                "Send me a photo of your dog/breed"
              </p>
            </div>
            <div className="text-center p-6 hover:bg-blue-50 rounded-lg transition">
              <div className="text-4xl sm:text-5xl mb-4">🏠</div>
              <h4 className="font-bold text-lg sm:text-xl mb-2">Home Services</h4>
              <p className="text-sm sm:text-base text-gray-600">
                Contractors, Plumbers, Electricians, HVAC, Painters, Roofers
              </p>
              <p className="text-xs text-blue-600 mt-2 font-medium">
                "Can you send me pictures?"
              </p>
            </div>
            <div className="text-center p-6 hover:bg-blue-50 rounded-lg transition">
              <div className="text-4xl sm:text-5xl mb-4">🧹</div>
              <h4 className="font-bold text-lg sm:text-xl mb-2">Cleaning Services</h4>
              <p className="text-sm sm:text-base text-gray-600">
                House Cleaning, Carpet Cleaning, Window Washing, Pressure Washing
              </p>
              <p className="text-xs text-blue-600 mt-2 font-medium">
                "How big is the space?"
              </p>
            </div>
            <div className="text-center p-6 hover:bg-blue-50 rounded-lg transition">
              <div className="text-4xl sm:text-5xl mb-4">📱</div>
              <h4 className="font-bold text-lg sm:text-xl mb-2">Tech Repair</h4>
              <p className="text-sm sm:text-base text-gray-600">
                Phone Repair, Computer Repair, Screen Replacement, IT Support
              </p>
              <p className="text-xs text-blue-600 mt-2 font-medium">
                "Show me what's broken"
              </p>
            </div>
            <div className="text-center p-6 hover:bg-blue-50 rounded-lg transition">
              <div className="text-4xl sm:text-5xl mb-4">🌳</div>
              <h4 className="font-bold text-lg sm:text-xl mb-2">Outdoor Services</h4>
              <p className="text-sm sm:text-base text-gray-600">
                Landscaping, Tree Service, Snow Removal, Lawn Care, Pool Service
              </p>
              <p className="text-xs text-blue-600 mt-2 font-medium">
                "Send pics of your yard/tree"
              </p>
            </div>
            <div className="text-center p-6 hover:bg-blue-50 rounded-lg transition">
              <div className="text-4xl sm:text-5xl mb-4">🎨</div>
              <h4 className="font-bold text-lg sm:text-xl mb-2">Creative Services</h4>
              <p className="text-sm sm:text-base text-gray-600">
                Photographers, Tattoo Artists, Custom Furniture, Tailors, Bakers
              </p>
              <p className="text-xs text-blue-600 mt-2 font-medium">
                "Show me your inspiration/design"
              </p>
            </div>
          </div>
          
          <div className="mt-12 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-8 border-2 border-blue-200">
            <div className="text-center">
              <h4 className="text-xl font-bold mb-3">The Common Thread?</h4>
              <p className="text-gray-700 max-w-2xl mx-auto leading-relaxed">
                You're tired of saying <strong>"Can you text me a picture?"</strong> and waiting days for a response. You want customers to give you ALL the details upfront so you can quote faster and stay organized. No more losing track of who said what or forgetting to follow up.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-12 sm:py-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-2xl sm:text-3xl font-bold text-center mb-12">
            What You Get
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl p-8 shadow-md">
              <div className="text-4xl mb-4">📋</div>
              <h4 className="text-xl font-bold mb-3">All Leads in One Place</h4>
              <p className="text-gray-600 text-sm">
                No more sticky notes, lost texts, or forgotten voicemails. Every request is captured with photos, contact info, and description.
              </p>
            </div>
            <div className="bg-white rounded-xl p-8 shadow-md">
              <div className="text-4xl mb-4">📸</div>
              <h4 className="text-xl font-bold mb-3">See Before You Quote</h4>
              <p className="text-gray-600 text-sm">
                Customers upload photos/videos showing exactly what they need. No more "can you send me a picture?" back-and-forth.
              </p>
            </div>
            <div className="bg-white rounded-xl p-8 shadow-md">
              <div className="text-4xl mb-4">📊</div>
              <h4 className="text-xl font-bold mb-3">Track Your Pipeline</h4>
              <p className="text-gray-600 text-sm">
                Move leads through stages: New → Contacted → Quoted → Completed. See exactly where every customer is in the process.
              </p>
            </div>
            <div className="bg-white rounded-xl p-8 shadow-md">
              <div className="text-4xl mb-4">💭</div>
              <h4 className="text-xl font-bold mb-3">Add Notes</h4>
              <p className="text-gray-600 text-sm">
                Remember important details. "Customer wants same style as last time" or "Called, needs work done by Friday."
              </p>
            </div>
            <div className="bg-white rounded-xl p-8 shadow-md">
              <div className="text-4xl mb-4">🔔</div>
              <h4 className="text-xl font-bold mb-3">Never Forget Follow-Ups</h4>
              <p className="text-gray-600 text-sm">
                Set reminders to follow up with customers. "Check back next week" or "Quote expires tomorrow" — never lose a sale.
              </p>
            </div>
            <div className="bg-white rounded-xl p-8 shadow-md">
              <div className="text-4xl mb-4">📞</div>
              <h4 className="text-xl font-bold mb-3">One-Tap Communication</h4>
              <p className="text-gray-600 text-sm">
                Click to call, text, or email. All contact info right there when you need it. No hunting through old messages.
              </p>
            </div>
          </div>

          <div className="mt-16 bg-white rounded-xl p-8 shadow-lg border-2 border-blue-200">
            <h3 className="text-2xl font-bold text-center mb-8">Real Results</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="text-5xl mb-3">⏰</div>
                <div className="text-4xl font-bold text-blue-600 mb-2">10+</div>
                <div className="text-lg font-semibold mb-2">Hours Saved Per Week</div>
                <p className="text-gray-600 text-sm">
                  Less time playing phone tag, more time actually working
                </p>
              </div>
              <div className="text-center">
                <div className="text-5xl mb-3">📈</div>
                <div className="text-4xl font-bold text-blue-600 mb-2">2x</div>
                <div className="text-lg font-semibold mb-2">Faster Quotes</div>
                <p className="text-gray-600 text-sm">
                  See photos upfront, give prices immediately without extra calls
                </p>
              </div>
              <div className="text-center">
                <div className="text-5xl mb-3">✅</div>
                <div className="text-4xl font-bold text-blue-600 mb-2">0</div>
                <div className="text-lg font-semibold mb-2">Lost Opportunities</div>
                <p className="text-gray-600 text-sm">
                  Track every lead, follow up on time, close more deals
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-12 sm:py-20">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6">
            Ready to Stop Losing Track of Customers?
          </h3>
          <p className="text-lg sm:text-xl mb-6 sm:mb-8 px-4 opacity-95">
            See the live demo. Watch how customers submit photos and how you track everything in one simple dashboard.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/demo" className="inline-block bg-white text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition shadow-lg">
              🎯 View Live Demo
            </Link>
            <Link href="mailto:contact@savvyhomeupgrade.com" className="inline-block bg-transparent border-2 border-white text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-white/10 transition">
              💬 Get Your Link
            </Link>
          </div>
          <p className="mt-6 text-sm opacity-90">
            Get your custom link in minutes • Simple dashboard included • No credit card required to start
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
                Simple lead capture + organization for service providers. Get photos from customers. Stay organized. Close more deals.
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
                <li>📍 Helping service providers everywhere</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-6 text-center text-sm text-gray-400">
            <p>&copy; {new Date().getFullYear()} SavvyHomeUpgrade. Built for service providers who value organization.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}