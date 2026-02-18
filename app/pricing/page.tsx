// app/pricing/page.tsx

import { Check, Zap, Rocket, Crown, X } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
  title: 'Pricing | Lead Management for Contractors',
  description: 'Simple, transparent pricing. Choose the plan that fits your business. Get started from $99/month.',
};

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-4">
            Stop losing leads. Start getting organized. One job pays for a year.
          </p>
          <p className="text-sm text-gray-500">
            No contracts. Cancel anytime. 14-day free trial.
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-8">
            
            {/* Basic Plan */}
            <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-200 p-8 hover:shadow-xl transition flex flex-col">
              <div className="flex items-center gap-2 mb-4">
                <Zap className="w-6 h-6 text-gray-600" />
                <h3 className="text-2xl font-bold text-gray-900">Basic</h3>
              </div>
              
              <div className="mb-6">
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-bold text-gray-900">$99</span>
                  <span className="text-gray-600">/month</span>
                </div>
                <p className="text-gray-600 mt-2">Essential lead management</p>
              </div>

              <div className="mb-6">
                <div className="text-sm font-semibold text-gray-700 mb-1">Setup:</div>
                <div className="text-2xl font-bold text-green-600">FREE</div>
                <div className="text-xs text-gray-500 mt-1">Self-setup, no onboarding call</div>
              </div>

              <Link 
                href="/signup?plan=basic"
                className="block w-full py-3 px-6 bg-gray-900 hover:bg-gray-800 text-white font-semibold rounded-lg text-center transition mb-8"
              >
                Start Free Trial
              </Link>

              <div className="space-y-3 flex-1">
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Unlimited users</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Unlimited leads</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Visual calendar scheduling</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Team assignment</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Customer request form</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Email templates</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Mobile-friendly</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Email support</span>
                </div>
                
                {/* What's NOT included */}
                <div className="pt-4 border-t border-gray-200 mt-4">
                  <div className="flex items-start gap-3 opacity-50">
                    <X className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-500">Quote templates</span>
                  </div>
                  <div className="flex items-start gap-3 opacity-50">
                    <X className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-500">AI brief generation</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Pro Plan */}
            <div className="bg-white rounded-2xl shadow-2xl border-2 border-blue-600 p-8 relative hover:shadow-3xl transition flex flex-col lg:scale-105">
              {/* Most Popular Badge */}
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-1 rounded-full text-sm font-semibold shadow-lg">
                  ⭐ MOST POPULAR
                </span>
              </div>

              <div className="flex items-center gap-2 mb-4">
                <Rocket className="w-6 h-6 text-blue-600" />
                <h3 className="text-2xl font-bold text-gray-900">Pro</h3>
              </div>
              
              <div className="mb-6">
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-bold text-gray-900">$179</span>
                  <span className="text-gray-600">/month</span>
                </div>
                <p className="text-gray-600 mt-2">For growing businesses</p>
              </div>

              <div className="mb-6">
                <div className="text-sm font-semibold text-gray-700 mb-1">Setup Fee:</div>
                <div className="text-2xl font-bold text-blue-600">$199</div>
                <div className="text-xs text-gray-500 mt-1">One-time • Full onboarding + training</div>
              </div>

              <Link 
                href="/signup?plan=pro"
                className="block w-full py-3 px-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg text-center transition mb-8 shadow-md"
              >
                Start Free Trial
              </Link>

              <div className="space-y-3 flex-1">
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700"><strong>Everything in Basic</strong></span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700"><strong>Quote templates</strong></span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700"><strong>AI brief generation</strong></span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Task management</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Advanced calendar features</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Custom QR code</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Website embed code</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">30-min onboarding call</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Priority email support</span>
                </div>
              </div>
            </div>

            {/* Premium Plan */}
            <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl shadow-xl border-2 border-purple-600 p-8 relative hover:shadow-2xl transition flex flex-col">
              {/* Best Value Badge */}
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <span className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-1 rounded-full text-sm font-semibold shadow-lg">
                  👑 BEST VALUE
                </span>
              </div>

              <div className="flex items-center gap-2 mb-4">
                <Crown className="w-6 h-6 text-purple-600" />
                <h3 className="text-2xl font-bold text-gray-900">Premium</h3>
              </div>
              
              <div className="mb-6">
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-bold text-gray-900">$299</span>
                  <span className="text-gray-600">/month</span>
                </div>
                <p className="text-gray-600 mt-2">Complete lead generation system</p>
              </div>

              <div className="mb-6">
                <div className="text-sm font-semibold text-gray-700 mb-1">Setup Fee:</div>
                <div className="text-2xl font-bold text-purple-600">$299</div>
                <div className="text-xs text-gray-500 mt-1">One-time • Includes marketing materials</div>
              </div>

              <Link 
                href="/signup?plan=premium"
                className="block w-full py-3 px-6 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-lg text-center transition mb-8 shadow-md"
              >
                Start Free Trial
              </Link>

              <div className="space-y-3 flex-1">
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700"><strong>Everything in Pro</strong></span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700"><strong>250 business cards</strong> (shipped)</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700"><strong>50 truck stickers</strong> (shipped)</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700"><strong>100 door hangers</strong> (shipped)</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Social media graphics</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">All materials custom designed</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">QR codes on all materials</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Priority phone support</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">White-glove onboarding</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700"><strong>Start generating leads Day 1</strong></span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Why Premium Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-white to-slate-50">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-8 md:p-12 text-white">
            <h2 className="text-3xl font-bold mb-6">
              Why Premium is the Best Value
            </h2>
            <div className="space-y-4 text-lg">
              <p>
                Most contractors struggle to <strong>GET leads</strong>, not just manage them.
              </p>
              <p>
                Premium gives you physical marketing materials that <strong>generate appointments</strong>:
              </p>
              <ul className="space-y-2 ml-6">
                <li>• Business cards with QR codes → Instant appointment requests</li>
                <li>• Truck stickers → Mobile billboard generating leads 24/7</li>
                <li>• Door hangers → Target specific neighborhoods</li>
              </ul>
              <p className="pt-4">
                <strong>You're not just buying software. You're buying a complete lead generation system.</strong>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-12">
            The Math Makes Sense
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="text-5xl font-bold text-blue-600 mb-2">$60K</div>
              <div className="text-gray-600">Lost per year from missed leads</div>
            </div>
            <div>
              <div className="text-5xl font-bold text-blue-600 mb-2">20-30%</div>
              <div className="text-gray-600">Of leads lost to disorganization</div>
            </div>
            <div>
              <div className="text-5xl font-bold text-blue-600 mb-2">1 Job</div>
              <div className="text-gray-600">Pays for an entire year</div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-4 bg-slate-50">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Frequently Asked Questions
          </h2>

          <div className="space-y-6">
            <details className="bg-white rounded-lg shadow-md p-6 group">
              <summary className="font-semibold text-lg text-gray-900 cursor-pointer list-none flex justify-between items-center">
                Is there a free trial?
                <span className="text-2xl group-open:rotate-45 transition-transform">+</span>
              </summary>
              <p className="text-gray-600 mt-4">
                Yes! 14-day free trial on all plans. No credit card required. Setup fees only apply if you continue after trial.
              </p>
            </details>

            <details className="bg-white rounded-lg shadow-md p-6 group">
              <summary className="font-semibold text-lg text-gray-900 cursor-pointer list-none flex justify-between items-center">
                Can I switch plans later?
                <span className="text-2xl group-open:rotate-45 transition-transform">+</span>
              </summary>
              <p className="text-gray-600 mt-4">
                Absolutely. Upgrade anytime - you'll only pay the difference in setup fees. Downgrade anytime as well.
              </p>
            </details>

            <details className="bg-white rounded-lg shadow-md p-6 group">
              <summary className="font-semibold text-lg text-gray-900 cursor-pointer list-none flex justify-between items-center">
                When do I pay the setup fee?
                <span className="text-2xl group-open:rotate-45 transition-transform">+</span>
              </summary>
              <p className="text-gray-600 mt-4">
                Setup fees are charged after your free trial ends, when you convert to a paid plan. Pro: $199. Premium: $299 (includes physical materials).
              </p>
            </details>

            <details className="bg-white rounded-lg shadow-md p-6 group">
              <summary className="font-semibold text-lg text-gray-900 cursor-pointer list-none flex justify-between items-center">
                How long does Premium setup take?
                <span className="text-2xl group-open:rotate-45 transition-transform">+</span>
              </summary>
              <p className="text-gray-600 mt-4">
                Software setup: Same day. Marketing materials: 5-7 business days to design, print, and ship to you.
              </p>
            </details>

            <details className="bg-white rounded-lg shadow-md p-6 group">
              <summary className="font-semibold text-lg text-gray-900 cursor-pointer list-none flex justify-between items-center">
                What if I don't have a website?
                <span className="text-2xl group-open:rotate-45 transition-transform">+</span>
              </summary>
              <p className="text-gray-600 mt-4">
                No problem! The QR codes work standalone. Put them on business cards, trucks, door hangers. Customers scan and request appointments - no website needed.
              </p>
            </details>

            <details className="bg-white rounded-lg shadow-md p-6 group">
              <summary className="font-semibold text-lg text-gray-900 cursor-pointer list-none flex justify-between items-center">
                Are there contracts?
                <span className="text-2xl group-open:rotate-45 transition-transform">+</span>
              </summary>
              <p className="text-gray-600 mt-4">
                Nope. Month-to-month. Cancel anytime. No questions asked. (Setup fees are non-refundable once materials are ordered/work is done.)
              </p>
            </details>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">
            Ready to Stop Losing Leads?
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            Join contractors who are finally organized and growing their business.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/signup?plan=pro"
              className="px-8 py-4 bg-white text-blue-600 font-bold rounded-lg hover:bg-gray-100 transition text-lg shadow-xl"
            >
              Start Free Trial
            </Link>
            <Link 
              href="/demo"
              className="px-8 py-4 bg-white/10 border-2 border-white text-white font-bold rounded-lg hover:bg-white/20 transition text-lg"
            >
              Watch Demo
            </Link>
          </div>
          <p className="text-sm text-blue-100 mt-6">
            14-day free trial • No credit card required • Cancel anytime
          </p>
        </div>
      </section>
    </div>
  );
}