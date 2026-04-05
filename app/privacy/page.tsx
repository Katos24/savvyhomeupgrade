import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        <div className="mb-8">
          <Link href="/" className="text-blue-600 hover:text-blue-700 font-semibold mb-4 inline-block">
            ← Back to Home
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
          <p className="text-gray-600">Last updated: April 3, 2026</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8 space-y-8">

          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
            <p className="text-gray-800 font-semibold text-sm leading-relaxed">
              This Privacy Policy explains how Lead2Project collects, uses, stores, and protects your information. By using the Service, you consent to the practices described in this policy.
            </p>
          </div>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Who We Are</h2>
            <p className="text-gray-700 leading-relaxed">
              Lead2Project ("we," "our," or "us") is a software-as-a-service platform serving home service contractors and professionals. We operate at lead2project.com. For privacy-related questions, contact us at privacy@lead2project.com.
            </p>
            <p className="text-gray-700 leading-relaxed mt-3">
              Lead2Project processes two categories of users: (1) <strong>Subscribers</strong> — contractors and business owners who pay for and use our platform, and (2) <strong>End Customers</strong> — individuals who submit service requests through a subscriber's Lead2Project-powered form. This policy applies to both categories.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Information We Collect</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">From Subscribers (Contractors)</h3>
                <p className="text-gray-700 leading-relaxed mb-2">When you create an account, we collect:</p>
                <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                  <li>Full name and business name</li>
                  <li>Email address and phone number</li>
                  <li>Business address and website</li>
                  <li>Payment information (processed securely by Stripe — we do not store card numbers)</li>
                  <li>Account credentials</li>
                  <li>Logo and branding assets you upload</li>
                  <li>Communication preferences and settings</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">From End Customers</h3>
                <p className="text-gray-700 leading-relaxed mb-2">
                  When a customer submits a request through a subscriber's form, we collect on behalf of that subscriber:
                </p>
                <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                  <li>Name, email address, and phone number</li>
                  <li>Service address (if provided)</li>
                  <li>Description of the service request</li>
                  <li>Photos and videos uploaded as part of the request</li>
                  <li>Any additional fields configured by the subscriber</li>
                </ul>
                <p className="text-gray-700 leading-relaxed mt-3">
                  End customer data is collected and stored on behalf of the subscribing contractor. Lead2Project acts as a data processor for this information — the contractor is the data controller responsible for how their customers' data is used and shared.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Automatically Collected Information</h3>
                <p className="text-gray-700 leading-relaxed mb-2">When you use our Service, we automatically collect:</p>
                <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                  <li>IP address and approximate location</li>
                  <li>Browser type and version</li>
                  <li>Operating system and device type</li>
                  <li>Pages visited and features used</li>
                  <li>Time and duration of visits</li>
                  <li>Referring URLs</li>
                  <li>Error logs and performance data</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Photo and Media Data</h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              Our Service allows end customers of subscribers to upload photos, videos, and other media files as part of submitting service requests. These files are stored securely using Vercel Blob Storage.
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li>Media files are accessible only to the subscribing contractor and authorized team members</li>
              <li>We do not use uploaded media for any purpose other than delivering the Service</li>
              <li>We do not sell, share, or analyze media content for advertising or any other purpose</li>
              <li>Media files are retained for the duration of the subscription and for 30 days following account cancellation, after which they are permanently deleted</li>
              <li>The contractor (subscriber) is solely responsible for obtaining any necessary consents from individuals who appear in uploaded media</li>
              <li>Lead2Project assumes no liability for the content of uploaded media or any privacy violations arising from media uploads</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. How We Use Your Information</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">To Provide the Service</h3>
                <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                  <li>Create and manage your account</li>
                  <li>Process subscription payments via Stripe</li>
                  <li>Store and display lead and customer data for subscribers</li>
                  <li>Send transactional emails including confirmations, notifications, and digests</li>
                  <li>Enable team collaboration features</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">To Improve and Protect the Service</h3>
                <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                  <li>Monitor usage patterns and diagnose technical issues</li>
                  <li>Detect and prevent fraud, abuse, or security threats</li>
                  <li>Analyze performance and improve features</li>
                  <li>Comply with legal obligations</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">To Communicate With You</h3>
                <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                  <li>Send service updates, security alerts, and policy changes</li>
                  <li>Respond to support requests</li>
                  <li>Send marketing communications (subscribers only, with opt-out available)</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Information Sharing and Disclosure</h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              We do not sell your personal information. We do not share your data with advertisers. We may share your information only in the following limited circumstances:
            </p>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Service Providers</h3>
                <p className="text-gray-700 leading-relaxed">
                  We share data with trusted third-party providers who help us deliver the Service, including:
                </p>
                <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4 mt-2">
                  <li><strong>Stripe</strong> — payment processing for subscriptions</li>
                  <li><strong>Vercel</strong> — hosting and blob storage</li>
                  <li><strong>Resend</strong> — transactional email delivery</li>
                  <li><strong>Neon</strong> — database hosting</li>
                  <li><strong>Sentry</strong> — error monitoring and diagnostics</li>
                  <li><strong>Anthropic (Claude AI)</strong> — AI-powered features on Pro plan</li>
                </ul>
                <p className="text-gray-700 leading-relaxed mt-2">
                  All service providers are contractually obligated to protect your data and use it only for the purposes we specify.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Legal Requirements</h3>
                <p className="text-gray-700 leading-relaxed">
                  We may disclose your information if required by law, court order, or government authority, or if we believe disclosure is necessary to protect our rights, prevent fraud, or protect the safety of users or the public.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Business Transfers</h3>
                <p className="text-gray-700 leading-relaxed">
                  If Lead2Project is acquired, merged, or sells its assets, your information may be transferred as part of that transaction. You will be notified of any such change via email or prominent notice on the Service.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Data Security</h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              We implement industry-standard technical and organizational measures to protect your data, including:
            </p>
            <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
              <li>256-bit SSL/TLS encryption for all data in transit</li>
              <li>Encrypted storage for sensitive data at rest</li>
              <li>Access controls limiting data access to authorized personnel only</li>
              <li>Regular security monitoring via Sentry and infrastructure providers</li>
              <li>PCI-compliant payment processing via Stripe (we never store card numbers)</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-3">
              However, no method of transmission over the internet or electronic storage is 100% secure. We cannot guarantee absolute security. In the event of a data breach affecting your information, we will notify you as required by applicable law.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Data Retention</h2>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li>Subscriber account data is retained for the duration of your subscription</li>
              <li>Upon cancellation, your data is retained for 30 days to allow account recovery</li>
              <li>After 30 days, all data including leads, photos, and account information is permanently and irreversibly deleted</li>
              <li>Billing records may be retained longer as required by law</li>
              <li>Anonymized, aggregated usage data may be retained indefinitely for analytics purposes</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Your Rights</h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              Depending on your location, you may have the following rights regarding your personal data:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li><strong>Access:</strong> Request a copy of the personal data we hold about you</li>
              <li><strong>Correction:</strong> Request correction of inaccurate or incomplete data</li>
              <li><strong>Deletion:</strong> Request deletion of your personal data, subject to legal retention requirements</li>
              <li><strong>Portability:</strong> Request your data in a portable, machine-readable format</li>
              <li><strong>Opt-out:</strong> Opt out of marketing communications at any time</li>
              <li><strong>Withdraw consent:</strong> Withdraw consent where processing is based on consent</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-3">
              To exercise any of these rights, contact us at privacy@lead2project.com. We will respond within 30 days. Note that deleting your account will result in permanent loss of all your data after the 30-day retention period.
            </p>
            <p className="text-gray-700 leading-relaxed mt-3">
              <strong>End customers</strong> seeking to exercise their rights regarding data submitted through a contractor's form should contact the contractor directly, as the contractor is the data controller for that information.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Cookies and Tracking</h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              We use essential cookies required for the Service to function, including session authentication cookies. We do not use third-party advertising cookies or tracking pixels.
            </p>
            <p className="text-gray-700 leading-relaxed">
              You can configure your browser to refuse cookies, but doing so may prevent certain features of the Service from functioning correctly.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Children's Privacy</h2>
            <p className="text-gray-700 leading-relaxed">
              The Service is intended for use by businesses and is not directed to individuals under 18 years of age. We do not knowingly collect personal information from anyone under 18. If we become aware that we have collected data from a minor, we will delete it promptly. If you believe a minor has submitted data through our Service, contact us at privacy@lead2project.com.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">11. International Data Transfers</h2>
            <p className="text-gray-700 leading-relaxed">
              Our Service is operated in the United States. If you access the Service from outside the US, your data will be transferred to and processed in the US. By using the Service, you consent to this transfer. We take appropriate measures to ensure your data is handled securely regardless of where it is processed.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">12. AI Features and Data</h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              Pro plan subscribers have access to AI-powered features powered by Anthropic's Claude AI. When you use these features:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li>Lead and project data may be sent to Anthropic's API to generate responses</li>
              <li>We do not send personally identifiable customer information to AI services where avoidable</li>
              <li>Anthropic's data handling is governed by their own privacy policy</li>
              <li>AI-generated content is provided as-is and should be reviewed before use</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">13. Changes to This Policy</h2>
            <p className="text-gray-700 leading-relaxed">
              We may update this Privacy Policy from time to time. Material changes will be communicated via email or prominent notice within the Service. Your continued use of the Service after changes take effect constitutes acceptance of the updated policy. We encourage you to review this policy periodically.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">14. Contact Us</h2>
            <p className="text-gray-700 leading-relaxed mb-2">
              For privacy-related questions, requests, or concerns:
            </p>
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <p className="text-gray-700"><strong>Email:</strong> privacy@lead2project.com</p>
              <p className="text-gray-700"><strong>Address:</strong> Lead2Project, New York, NY</p>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}