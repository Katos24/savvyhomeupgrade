import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Header */}
      <header className="fixed top-0 w-full bg-white shadow-sm z-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-700 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">L2P</span>
            </div>
            <span className="text-2xl font-extrabold tracking-tight">
              Lead2Project
            </span>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/login" className="hidden sm:block text-gray-700 hover:text-gray-900 font-medium">
              Login
            </Link>
            <Link
              href="/signup"
              className="bg-blue-700 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-blue-800 transition"
            >
              Start Free Trial
            </Link>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="pt-32 pb-20 bg-gray-50 border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h1 className="text-5xl sm:text-6xl font-extrabold leading-tight mb-6">
            Stop Losing Jobs Because<br />
            <span className="text-blue-700">Your Leads Are Everywhere</span>
          </h1>

          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-10">
            Customers send photos. You get organized.  
            No more scattered texts, missed messages, or forgotten quotes.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/signup"
              className="bg-blue-700 text-white px-10 py-4 rounded-lg text-lg font-bold hover:bg-blue-800 transition"
            >
              Start Free Trial →
            </Link>
            <Link
              href="/demo"
              className="border-2 border-gray-300 text-gray-800 px-10 py-4 rounded-lg text-lg font-bold hover:border-gray-400 transition"
            >
              See Live Demo
            </Link>
          </div>

          {/* Dashboard Preview */}
          <div className="mt-16 max-w-4xl mx-auto">
            <div className="rounded-xl border border-gray-300 shadow-lg bg-white p-10">
              <div className="text-center">
                <div className="text-6xl mb-4">📋</div>
                <h3 className="text-2xl font-bold mb-2">Your Job Board</h3>
                <p className="text-gray-600">
                  Every lead. Every photo. Every note.  
                  All in one clean dashboard.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PROBLEM SECTION */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-4xl font-extrabold text-center mb-12">
            The Daily Chaos You Deal With
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            {[
              { emoji: "📞", text: "Customers texting random photos at random times" },
              { emoji: "🤯", text: "Leads scattered across Facebook, voicemail, email, and texts" },
              { emoji: "📝", text: "Sticky notes and reminders everywhere — something always slips" },
              { emoji: "❓", text: "People asking for quotes with zero details or context" },
            ].map((item, i) => (
              <div key={i} className="p-6 border border-gray-200 rounded-xl bg-gray-50 hover:shadow-md transition">
                <div className="text-4xl mb-3">{item.emoji}</div>
                <p className="text-lg font-medium text-gray-700">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-20 bg-gray-50 border-t border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-4xl font-extrabold text-center mb-16">
            How It Works (Simple)
          </h2>

          <div className="grid md:grid-cols-3 gap-10">
            {[
              {
                emoji: "🔗",
                title: "1. Get Your Link",
                desc: "Your custom link collects job details, photos, and customer info.",
              },
              {
                emoji: "📸",
                title: "2. Customers Submit",
                desc: "They upload photos and explain the job. You get notified instantly.",
              },
              {
                emoji: "📋",
                title: "3. You Get Organized",
                desc: "Every lead goes into your job board. Track status from start to finish.",
              },
            ].map((step, i) => (
              <div key={i} className="text-center">
                <div className="text-5xl mb-4">{step.emoji}</div>
                <h3 className="text-2xl font-bold mb-3">{step.title}</h3>
                <p className="text-gray-600">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* INDUSTRIES */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-4xl font-extrabold text-center mb-12">
            Built for Real Service Pros
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              "Contractors",
              "HVAC",
              "Plumbing",
              "Electricians",
              "Roofing",
              "Landscaping",
              "Cleaning",
              "Handyman",
            ].map((title, i) => (
              <div
                key={i}
                className="p-6 bg-gray-50 border border-gray-200 rounded-xl text-center font-bold hover:shadow-md transition"
              >
                {title}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING CTA */}
      <section className="py-20 bg-blue-700 text-white text-center">
        <h2 className="text-4xl sm:text-5xl font-extrabold mb-4">
          Try It Free for 14 Days
        </h2>
        <p className="text-xl mb-6">Just $39.99/month after trial</p>

        <Link
          href="/signup"
          className="bg-white text-blue-700 px-10 py-4 rounded-lg text-xl font-bold hover:bg-gray-100 transition"
        >
          Start Free Trial →
        </Link>

        <p className="mt-6 text-sm opacity-90">Cancel anytime</p>
      </section>

      {/* FOOTER */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-gray-400 text-sm">
            © {new Date().getFullYear()} Lead2Project — Built for Service Providers
          </p>
        </div>
      </footer>
    </div>
  );
}