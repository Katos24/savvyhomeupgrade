'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import TeamAdminPage from './TeamAdminPage';

export default function TeamAdminPageRoute() {
  const params = useParams();
  const companySlug = params?.company as string; // Changed from company_slug to company
  
  const [loading, setLoading] = useState(true);
  const [company, setCompany] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    console.log('useEffect triggered, companySlug:', companySlug);
    
    // Don't fetch if we don't have the company slug yet
    if (!companySlug) {
      console.log('No companySlug, returning');
      setLoading(false);
      return;
    }
    
    async function loadData() {
      console.log('Starting to load data...');
      try {
        // Fetch current user first
        console.log('Fetching user...');
        const userRes = await fetch('/api/auth/me');
        const userData = await userRes.json();
        console.log('User data:', userData);
        
        if (!userData.success || !userData.user) {
          console.log('No user, redirecting to login');
          window.location.href = `/${companySlug}/login`;
          return;
        }
        
        setCurrentUser(userData.user);
        
        // Fetch company info
        console.log('Fetching company info...');
        const companyRes = await fetch(`/api/company/${companySlug}/info`);
        const companyData = await companyRes.json();
        console.log('Company data:', companyData);
        
        if (companyData.success && companyData.company) {
          setCompany(companyData.company);
        } else {
          setError('Failed to load company data');
        }
        
      } catch (error) {
        console.error('Error loading data:', error);
        setError('An error occurred loading data');
      } finally {
        console.log('Setting loading to false');
        setLoading(false);
      }
    }
    
    loadData();
  }, [companySlug]);

  console.log('Render - loading:', loading, 'company:', company, 'currentUser:', currentUser, 'error:', error);

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
          <p className="text-xs text-gray-400 mt-2">
            Slug: {companySlug || 'undefined'} | 
            Loading: {loading ? 'yes' : 'no'} | 
            Company: {company ? 'yes' : 'no'} | 
            User: {currentUser ? 'yes' : 'no'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <TeamAdminPage
      companySlug={companySlug}
      companyName={company.name}
      companyLogoUrl={company.logo_url}
      currentUser={currentUser}
    />
  );
}