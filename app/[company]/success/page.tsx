'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';

export default function CompanySuccessPage() {
  const router = useRouter();
  const params = useParams();
  const companySlug = params.company as string;
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    if (countdown === 0) {
      router.push(`/${companySlug}`);
      return;
    }

    const timer = setTimeout(() => {
      setCountdown(prev => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown, router, companySlug]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 flex items-center justify-center px-6">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-8">
          <div className="inline-block animate-bounce">
            <div className="w-24 h-24 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl">
              <span className="text-5xl text-white">✓</span>
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-3 gradient-text">Request Submitted!</h1>
          <p className="text-xl text-gray-600">We've received your project details</p>
        </div>

        <div className="card mb-6">
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-xl">
              <span className="text-2xl">📧</span>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Check Your Email</h3>
                <p className="text-gray-600 text-sm">You'll receive a confirmation email shortly.</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-purple-50 rounded-xl">
              <span className="text-2xl">⏰</span>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Response Time</h3>
                <p className="text-gray-600 text-sm">We typically respond within <strong>24 hours</strong> with a detailed quote.</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-green-50 rounded-xl">
              <span className="text-2xl">📸</span>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Photos Received</h3>
                <p className="text-gray-600 text-sm">Your photos help us provide an accurate estimate.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center mt-8">
          <p className="text-gray-500 text-sm">
            Redirecting in <span className="font-bold text-blue-600">{countdown}</span> seconds...
          </p>
          <button 
            onClick={() => router.push(`/${companySlug}`)}
            className="mt-4 text-blue-600 hover:text-blue-700 font-medium text-sm underline"
          >
            Return now
          </button>
        </div>
      </div>
    </div>
  );
}
