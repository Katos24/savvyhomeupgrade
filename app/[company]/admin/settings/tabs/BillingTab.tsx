'use client';

import { useState } from 'react';

export default function BillingTab({ company, currentUser }: { company: any; currentUser: any }) {
  const [loading, setLoading] = useState(false);

  const handleManageBilling = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/stripe/create-portal-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companySlug: company.slug }),
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        alert('Failed to open billing portal');
      }
    } catch (error) {
      alert('Failed to open billing portal');
    } finally {
      setLoading(false);
    }
  };

  const getSubscriptionStatusBadge = () => {
    switch (company.subscription_status) {
      case 'active':
        return <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full font-semibold">Active</span>;
      case 'trialing':
        return <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full font-semibold">Trial</span>;
      case 'past_due':
        return <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full font-semibold">Past Due</span>;
      case 'canceled':
        return <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full font-semibold">Canceled</span>;
      default:
        return <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full font-semibold">Inactive</span>;
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Billing & Subscription</h2>
        <p className="text-gray-600">Manage your subscription, payment method, and billing history</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
        
        <div className="border-b pb-6">
          <h3 className="text-lg font-bold mb-4">Current Subscription</h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Status</p>
              {getSubscriptionStatusBadge()}
            </div>
            {company.subscription_status === 'trialing' && company.trial_ends_at && (
              <div className="text-right">
                <p className="text-sm text-gray-600 mb-1">Trial Ends</p>
                <p className="font-semibold">{formatDate(company.trial_ends_at)}</p>
              </div>
            )}
            {company.subscription_status === 'active' && company.subscription_current_period_end && (
              <div className="text-right">
                <p className="text-sm text-gray-600 mb-1">Next Billing Date</p>
                <p className="font-semibold">{formatDate(company.subscription_current_period_end)}</p>
              </div>
            )}
          </div>
        </div>

        <div className="border-b pb-6">
          <h3 className="text-lg font-bold mb-4">Plan Details</h3>
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="text-2xl font-bold text-gray-900">Professional Plan</h4>
                <p className="text-gray-600">Full access to all features</p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-blue-600">$49</p>
                <p className="text-sm text-gray-600">per month</p>
              </div>
            </div>
            <ul className="space-y-2">
              <li className="flex items-center gap-2 text-sm">
                <span className="text-green-600">✓</span>
                <span>Unlimited leads</span>
              </li>
              <li className="flex items-center gap-2 text-sm">
                <span className="text-green-600">✓</span>
                <span>Project management</span>
              </li>
              <li className="flex items-center gap-2 text-sm">
                <span className="text-green-600">✓</span>
                <span>Quote builder</span>
              </li>
              <li className="flex items-center gap-2 text-sm">
                <span className="text-green-600">✓</span>
                <span>Calendar & scheduling</span>
              </li>
              <li className="flex items-center gap-2 text-sm">
                <span className="text-green-600">✓</span>
                <span>Email notifications</span>
              </li>
              <li className="flex items-center gap-2 text-sm">
                <span className="text-green-600">✓</span>
                <span>Team collaboration</span>
              </li>
            </ul>
          </div>
        </div>

        <div>
          <button
            onClick={handleManageBilling}
            disabled={loading}
            className="w-full px-6 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? 'Opening Billing Portal...' : 'Manage Billing & Payment Method'}
          </button>
          <p className="text-xs text-gray-500 text-center mt-2">
            Update payment method, view invoices, or cancel subscription
          </p>
        </div>

        {company.subscription_status === 'inactive' && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-yellow-800 font-semibold mb-2">No Active Subscription</p>
            <p className="text-sm text-yellow-700 mb-3">
              Subscribe to unlock all features and start capturing leads.
            </p>
            
              href={`/${company.slug}/subscribe`}
              className="inline-block px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white font-semibold rounded-lg transition"
            >
              Subscribe Now
            </a>
          </div>
        )}
      </div>
    </div>
  );
}