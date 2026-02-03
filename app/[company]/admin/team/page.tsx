'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { canAccessTeamPage } from '@/lib/permissions';
import TeamAdminPage from './TeamAdminPage';

export default function TeamAdminPageRoute() {
  const params = useParams();
  const router = useRouter();
  const companySlug = params?.company as string;
  
  const [loading, setLoading] = useState(true);
  const [company, setCompany] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    console.log('useEffect triggered, companySlug:', companySlug);
    
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

        // 🔒 CHECK IF USER BELONGS TO THIS COMPANY
        const userCompanySlug = userData.user.companySlug || userData.user.company_slug;
        console.log('🔍 Security check - userCompanySlug:', userCompanySlug, 'requestedSlug:', companySlug);
        
        if (userData.user.role !== 'admin' && userCompanySlug !== companySlug) {
          console.log('⛔ User trying to access different company - redirecting');
          window.location.href = `/${userCompanySlug}/admin/team`;
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
          
          // 🔒 CHECK SUBSCRIPTION STATUS
          const isTrialExpired = companyData.company.subscription_status === 'trialing' && 
                                 companyData.company.trial_ends_at && 
                                 new Date(companyData.company.trial_ends_at) < new Date();

          const needsPayment = !companyData.company.subscription_status || 
                               companyData.company.subscription_status === 'canceled' ||
                               companyData.company.subscription_status === 'past_due' ||
                               companyData.company.subscription_status === 'inactive' ||
                               isTrialExpired;

          if (needsPayment) {
            console.log('⛔ Subscription required - redirecting to subscribe');
            window.location.href = `/subscribe?reason=payment_required&company=${companySlug}`;
            return;
          }

          // 🔒 CHECK PERMISSION
          const userRole = userData.user.role || 'member';
          if (!canAccessTeamPage(userRole)) {
            console.log('⛔ User does not have permission to access team page');
            setError('You do not have permission to access team management. Only admins and owners can manage team members.');
            setLoading(false);
            return;
          }
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 px-6">
        <div className="max-w-md w-full text-center">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="text-6xl mb-4">⛔</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-3">Access Denied</h1>
            <p className="text-gray-600 mb-6">{error}</p>
            <a 
              href={`/${companySlug}/dashboard`} 
              className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition"
            >
              ← Back to Dashboard
            </a>
          </div>
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
          company={company}  // 👈 ADD THIS

    />
  );
}