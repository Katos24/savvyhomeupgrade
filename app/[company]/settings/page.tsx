'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import SettingsPage from './SettingsPage';

export default function SettingsPageRoute() {
  const params = useParams();
  const companySlug = params?.company as string;

  const [loading, setLoading] = useState(true);
  const [company, setCompany] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (!companySlug) {
      setLoading(false);
      return;
    }

    async function loadData() {
      try {
        // Fetch current user
        const userRes = await fetch('/api/auth/me');
        const userData = await userRes.json();

        if (!userData.success || !userData.user) {
          window.location.href = `/login`;
          return;
        }

        setCurrentUser(userData.user);

        // Fetch company info
        const companyRes = await fetch(`/api/company/${companySlug}/info`);
        const companyData = await companyRes.json();

        if (companyData.success && companyData.company) {
          setCompany(companyData.company);
        } else {
          setError('Failed to load company data');
        }
      } catch (error) {
        console.error('Error loading data:', error);
        setError('An error occurred loading data');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [companySlug]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 text-xl">{error}</p>
          <a href={`/${companySlug}/dashboard`} className="text-blue-600 hover:underline mt-4 inline-block">
            ← Back to Dashboard
          </a>
        </div>
      </div>
    );
  }

  if (!companySlug || loading || !company || !currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-6xl mb-4">⏳</div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <SettingsPage
      companySlug={companySlug}
      companyName={company.name}
      companyLogoUrl={company.logo_url}
      currentUser={currentUser}
    />
  );
}