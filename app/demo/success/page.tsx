'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SuccessPage() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    if (countdown === 0) {
      router.push('/');
      return;
    }

    const timer = setTimeout(() => {
      setCountdown(prev => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 flex items-center justify-center px-6">
      <div className="max-w-2xl w-full">
        {/* Success Animation */}
        <div className="text-center mb-8">
          <div className="inline-block animate-bounce">
            <div className="w-24 h-24 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl">
              <span className="text-5xl text-white">✓</span>
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-3 gradient-text">Request Submitted!</h1>
          <p className="text-xl text-gray-600">We've received your project details</p>
        </div>

        {/* Info Card */}
        <div className="card mb-6">
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-xl">
              <span className="text-2xl">📧</span>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Check Your Email</h3>
                <p className="text-gray-600 text-sm">You'll receive a confirmation email shortly with your request details.</p>
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
                <p className="text-gray-600 text-sm">Your photos help us provide a more accurate estimate without an in-person visit.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Trusted Companies */}
        <div className="card text-center">
          <p className="text-sm font-semibold text-gray-600 mb-4">Trusted by Long Island businesses</p>
          <div className="flex flex-wrap justify-center gap-4">
            <span className="px-4 py-2 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full text-sm font-medium text-gray-700">
              🏗️ LEX Construction
            </span>
            <span className="px-4 py-2 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full text-sm font-medium text-gray-700">
              ❄️ Island HVAC
            </span>
            <span className="px-4 py-2 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full text-sm font-medium text-gray-700">
              🏠 Pro Roofing
            </span>
          </div>
        </div>

        {/* Redirect message */}
        <div className="text-center mt-8">
          <p className="text-gray-500 text-sm">
            Redirecting to homepage in <span className="font-bold text-blue-600">{countdown}</span> seconds...
          </p>
          <button 
            onClick={() => router.push('/')}
            className="mt-4 text-blue-600 hover:text-blue-700 font-medium text-sm underline"
          >
            Return to homepage now
          </button>
        </div>
      </div>
    </div>
  );
}
