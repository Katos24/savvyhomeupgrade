import Link from 'next/link';

export default function SuccessPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="text-6xl mb-4">✅</div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Thank You!
        </h1>
        <p className="text-lg text-gray-600 mb-6">
          We received your project inquiry and photos.
        </p>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-blue-800">
            📸 We're analyzing your photos now and will contact you within 24 hours with an assessment.
          </p>
        </div>
        <p className="text-sm text-gray-500 mb-6">
          Check your email for confirmation.
        </p>
        <Link 
          href="/"
          className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}
