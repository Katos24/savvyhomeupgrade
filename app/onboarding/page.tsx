'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [company, setCompany] = useState<any>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const userRes = await fetch('/api/auth/me');
        const userData = await userRes.json();

        if (!userData.success || !userData.user) {
          router.push('/login');
          return;
        }

        const slug = userData.user.companySlug || userData.user.company_slug;
        const companyRes = await fetch(`/api/company/${slug}/info`);
        const companyData = await companyRes.json();
        
        if (companyData.success && companyData.company) {
          setCompany(companyData.company);
          
          if (companyData.company.onboarding_completed) {
            router.push(`/${slug}/dashboard`);
            return;
          }
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [router]);

  const nextStep = () => setCurrentStep(Math.min(currentStep + 1, 4));
  const prevStep = () => setCurrentStep(Math.max(currentStep - 1, 1));

  const skipOnboarding = async () => {
    if (!company) return;
    
    try {
      await fetch('/api/onboarding/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyId: company.id, skipped: true })
      });
      router.push(`/${company.slug}/dashboard`);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-6xl animate-spin">⏳</div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-600">Error loading data</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <span className="text-xl font-bold">Setup Wizard</span>
          <button onClick={skipOnboarding} className="text-gray-600 hover:text-gray-900 text-sm">
            Skip
          </button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex items-center flex-1">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${currentStep >= step ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                  {step}
                </div>
                {step < 4 && <div className={`flex-1 h-1 mx-2 ${currentStep > step ? 'bg-blue-600' : 'bg-gray-200'}`} />}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {currentStep === 1 && <Step1 onNext={nextStep} />}
          {currentStep === 2 && <Step2 onNext={nextStep} onPrev={prevStep} />}
          {currentStep === 3 && <Step3 company={company} onNext={nextStep} onPrev={prevStep} />}
          {currentStep === 4 && <Step4 company={company} onComplete={() => router.push(`/${company.slug}/dashboard`)} onPrev={prevStep} />}
        </div>
      </div>
    </div>
  );
}

function Step1({ onNext }: any) {
  return (
    <div className="text-center">
      <div className="text-7xl mb-6">🎉</div>
      <h1 className="text-4xl font-bold mb-4">Welcome!</h1>
      <p className="text-xl text-gray-600 mb-8">Setup takes 3 minutes</p>
      <button onClick={onNext} className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-4 rounded-xl">
        Start
      </button>
    </div>
  );
}

function Step2({ onNext, onPrev }: any) {
  const [statusOptions, setStatusOptions] = useState([
    { value: 'new', label: 'New', color: 'blue', emoji: '🆕' },
    { value: 'contacted', label: 'Contacted', color: 'yellow', emoji: '📞' },
    { value: 'quoted', label: 'Quoted', color: 'purple', emoji: '💰' },
    { value: 'in-progress', label: 'In Progress', color: 'orange', emoji: '🔨' },
    { value: 'completed', label: 'Completed', color: 'green', emoji: '✅' },
  ]);

  const getStatusColor = (colorName: string) => {
    const colorMap: Record<string, string> = {
      blue: '#3b82f6',
      yellow: '#eab308',
      purple: '#a855f7',
      orange: '#f97316',
      green: '#22c55e',
      red: '#ef4444',
      gray: '#6b7280',
    };
    return colorMap[colorName] || '#3b82f6';
  };

  return (
    <div>
      <h2 className="text-3xl font-bold text-gray-900 mb-2">
        Customize Your Workflow
      </h2>
      <p className="text-gray-600 mb-6">
        These are your default lead statuses. You can customize them later in settings.
      </p>

      <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 mb-6">
        <h3 className="font-bold text-blue-900 mb-4">Lead Statuses</h3>
        <div className="space-y-2">
          {statusOptions.map((status, index) => (
            <div key={index} className="flex items-center gap-3 bg-white p-3 rounded-lg border">
              <span className="text-2xl">{status.emoji}</span>
              <span
                className="px-3 py-1 rounded-full text-sm font-semibold text-white"
                style={{ backgroundColor: getStatusColor(status.color) }}
              >
                {status.label}
              </span>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-500 mt-3">
          You can add custom statuses and categories in Settings after setup
        </p>
      </div>

      <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4 mb-6">
        <div className="flex items-start gap-2">
          <span className="text-green-600 text-xl">✓</span>
          <div>
            <p className="font-semibold text-green-900">Service categories are set!</p>
            <p className="text-sm text-green-700">
              Based on your business type, we have set up relevant service categories for your form.
            </p>
          </div>
        </div>
      </div>

      <div className="flex gap-4">
        <button
          onClick={onPrev}
          className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 rounded-lg transition"
        >
          Back
        </button>
        <button
          onClick={onNext}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition"
        >
          Next
        </button>
      </div>
    </div>
  );
}

function Step3({ company, onNext, onPrev }: any) {
  const [copied, setCopied] = useState(false);
  const link = typeof window !== 'undefined' ? `${window.location.origin}/${company.slug}` : '';

  return (
    <div className="text-center">
      <div className="text-7xl mb-6">🎊</div>
      <h2 className="text-3xl font-bold mb-4">Your Link</h2>
      <div className="bg-blue-50 border-2 border-blue-300 rounded-xl p-6 mb-8">
        <div className="flex items-center gap-3 bg-white rounded-lg p-4 border-2">
          <span className="text-blue-600 flex-1 truncate font-mono">{link}</span>
          <button
            onClick={() => {
              navigator.clipboard.writeText(link);
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm"
          >
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>
      </div>
      <div className="flex gap-4">
        <button onClick={onPrev} className="flex-1 bg-gray-200 hover:bg-gray-300 py-3 rounded-lg">Back</button>
        <button onClick={onNext} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg">Next</button>
      </div>
    </div>
  );
}

function Step4({ company, onComplete, onPrev }: any) {
  return (
    <div>
      <h2 className="text-3xl font-bold mb-4">Share Your Link</h2>
      <p className="text-gray-600 mb-8">QR codes coming soon</p>
      <div className="flex gap-4">
        <button onClick={onPrev} className="flex-1 bg-gray-200 hover:bg-gray-300 py-3 rounded-lg">Back</button>
        <button onClick={onComplete} className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg">Done</button>
      </div>
    </div>
  );
}