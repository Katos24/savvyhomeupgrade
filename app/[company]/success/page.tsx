'use client';

import { useRouter } from 'next/navigation';
import { CheckCircle } from 'lucide-react';

type Company = {
  id: number;
  name: string;
  slug: string;
  business_type?: string;
  cta_success_message?: string | null;
  logo_url?: string | null;
};

interface SuccessPageProps {
  company?: Company;
  headerTitle?: string;
  showHomeButton?: boolean;
}

export default function SuccessPage({
  company,
  headerTitle = "Submission Successful",
  showHomeButton = true,
}: SuccessPageProps) {
  const router = useRouter();

  const businessType = company?.business_type || 'general';

  // Dynamically get success message
  const getCtaSuccessMessage = () => {
    if (company?.cta_success_message) return company.cta_success_message;

    switch (businessType) {
      case 'restaurant':
        return 'Your order has been received!';
      case 'salon':
        return 'Your appointment is booked!';
      case 'photography':
        return 'Your session request was submitted!';
      default:
        return 'Thank you! Your project was submitted successfully.';
    }
  };

  const ctaSuccessMessage = getCtaSuccessMessage();

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="bg-white rounded-xl shadow-xl p-8 text-center">
        {company?.logo_url && (
          <div className="mb-6 flex justify-center">
            <img
              src={company.logo_url}
              alt={company.name}
              className="h-20 w-auto object-contain"
            />
          </div>
        )}

        <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />

        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {headerTitle}
        </h1>
        <p className="text-lg text-gray-700 mb-6">
          {ctaSuccessMessage}
        </p>

        {showHomeButton && (
          <button
            onClick={() => router.push('/')}
            className="bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            Back to Home
          </button>
        )}
      </div>
    </div>
  );
}
