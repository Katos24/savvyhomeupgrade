'use client';

import { useState, useEffect } from 'react';

type TeamMember = {
  id: number;
  user_id: number;
  name: string;
  email: string;
  role: 'owner' | 'admin' | 'member';
  status: 'active' | 'disabled';
  invited_at: string;
};

export default function TeamAdminPage({ 
  companySlug, 
  companyName,
  companyLogoUrl,
  currentUser,
  company
}: { 
  companySlug: string;
  companyName: string;
  companyLogoUrl?: string | null;
  currentUser: any;
  company: any;
}) {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    role: 'member' as 'admin' | 'member'
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchTeamData();
  }, []);

  async function fetchTeamData() {
    try {
      const response = await fetch(`/api/company/${companySlug}/team`);
      const data = await response.json();
      
      if (data.success) {
        setTeamMembers(data.teamMembers || []);
      }
    } catch (error) {
      console.error('Failed to fetch team data:', error);
      setError('Failed to load team members');
    } finally {
      setLoading(false);
    }
  }

  async function handleManageSubscription() {
    try {
      const response = await fetch('/api/stripe/create-portal-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyId: company.id })
      });

      const data = await response.json();
      
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert('Unable to open billing portal. Please try again.');
      }
    } catch (error) {
      console.error('Error opening billing portal:', error);
      alert('Error opening billing portal');
    }
  }

  async function handleSendInvite() {
    if (!formData.email) {
      setError('Email is required');
      return;
    }

    // Check if email already exists
    const emailExists = teamMembers.some(m => m.email.toLowerCase() === formData.email.toLowerCase());
    if (emailExists) {
      setError('This email is already a team member');
      return;
    }

    setSaving(true);
    setError('');
    
    try {
      const response = await fetch(`/api/company/${companySlug}/team/invite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setSuccess(`✅ Invitation sent to ${formData.email}!`);
        setFormData({ email: '', role: 'member' });
        setShowInviteModal(false);
        setTimeout(() => setSuccess(''), 5000);
      } else {
        setError(result.error || 'Failed to send invitation');
      }
    } catch (error) {
      console.error('Invite error:', error);
      setError('Failed to send invitation');
    } finally {
      setSaving(false);
    }
  }

  async function handleUpdateRole(userId: number, newRole: 'admin' | 'member', memberName: string) {
    try {
      const response = await fetch(`/api/company/${companySlug}/team/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, role: newRole })
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setSuccess(`${memberName}'s role updated!`);
        await fetchTeamData();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError('Failed to update role');
      }
    } catch (error) {
      setError('Failed to update role');
    }
  }

  async function handleRemoveMember(userId: number, memberName: string) {
    if (!confirm(`Remove ${memberName} from the team? They will lose access to the dashboard.`)) return;

    try {
      const response = await fetch(`/api/company/${companySlug}/team/remove`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setSuccess(`${memberName} removed from team`);
        await fetchTeamData();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError('Failed to remove team member');
      }
    } catch (error) {
      setError('Failed to remove team member');
    }
  }

  const getRoleBadgeClass = (role: string) => {
    switch (role) {
      case 'owner': return 'bg-purple-500 text-white';
      case 'admin': return 'bg-blue-500 text-white';
      case 'member': return 'bg-gray-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner': return '👑';
      case 'admin': return '⚙️';
      case 'member': return '👤';
      default: return '👤';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      
      {/* HEADER */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            {companyLogoUrl ? (
              <img 
                src={companyLogoUrl} 
                alt={`${companyName} logo`}
                className="h-12 w-auto object-contain"
              />
            ) : (
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center text-white font-bold text-xl">
                {companyName.charAt(0)}
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold gradient-text">{companyName}</h1>
              <p className="text-sm text-gray-600">Team Management</p>
            </div>
          </div>
          
          <div className="flex gap-4 items-center">
            
<a href={`/${companySlug}/dashboard/deleted-leads`}
              className="bg-red-500/20 hover:bg-red-500/30 text-red-700 px-4 py-2 rounded-lg font-semibold transition border border-red-500/30 flex items-center gap-2"
            >
              🗑️ Deleted Leads
            </a>
            <a href={`/${companySlug}/dashboard`} className="text-gray-600 hover:text-gray-900">
              ← Dashboard
            </a>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-12">
        
        {/* Success/Error Messages */}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
            ✓ {success}
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            ✗ {error}
          </div>
        )}

        {/* 🔥 BILLING SECTION - OWNER ONLY */}
        {currentUser.role === 'owner' && (
          <div className="bg-gradient-to-br from-purple-50 to-blue-50 border-2 border-purple-200 rounded-xl p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                  💳 Billing & Subscription
                </h2>
                <p className="text-gray-600 text-sm">
                  Manage your subscription, payment method, and billing history
                </p>
              </div>
              
              <button
                onClick={handleManageSubscription}
                className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition shadow-lg flex items-center gap-2"
              >
                💳 Manage Billing
              </button>
            </div>
            
            {/* Show current subscription status */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="text-gray-600 text-xs uppercase font-semibold mb-1">Status</div>
                <div className="text-gray-900 font-bold text-lg">
                  {company.subscription_status === 'active' && '✅ Active'}
                  {company.subscription_status === 'trialing' && '🎉 Free Trial'}
                  {company.subscription_status === 'past_due' && '⚠️ Payment Due'}
                  {company.subscription_status === 'canceled' && '❌ Canceled'}
                  {!company.subscription_status && '⚠️ Inactive'}
                </div>
              </div>
              
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="text-gray-600 text-xs uppercase font-semibold mb-1">Plan</div>
                <div className="text-gray-900 font-bold text-lg">Professional - $39.99/mo</div>
              </div>
              
              {company.trial_ends_at && company.subscription_status === 'trialing' && (
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <div className="text-gray-600 text-xs uppercase font-semibold mb-1">Trial Ends</div>
                  <div className="text-gray-900 font-bold text-lg">
                    {new Date(company.trial_ends_at).toLocaleDateString()}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Header with Invite Button */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold">Team Members</h2>
            <p className="text-gray-600 mt-1">{teamMembers.length} active members</p>
          </div>
          <button
            onClick={() => setShowInviteModal(true)}
            className="btn btn-primary"
          >
            📧 Invite Team Member
          </button>
        </div>

        {/* ACTIVE TEAM MEMBERS */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {teamMembers.map((member) => (
            <div key={member.id} className="card relative">
              {/* Member Avatar */}
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-2xl mb-3">
                {member.name?.charAt(0)?.toUpperCase() || '?'}
              </div>

              <h3 className="text-xl font-bold mb-1">{member.name || 'Unknown User'}</h3>
              <p className="text-gray-600 text-sm mb-2">{member.email}</p>
              
              {/* Role Badge */}
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getRoleBadgeClass(member.role)} mb-3`}>
                {getRoleIcon(member.role)} {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
              </span>

              {/* Info */}
              <div className="space-y-2 text-sm mb-4">
                <p className="flex items-center gap-2 text-gray-600">
                  <span>📅</span> Added {new Date(member.invited_at).toLocaleDateString()}
                </p>
              </div>

              {/* Actions - Only show if not owner and not yourself */}
              {member.role !== 'owner' && currentUser?.email !== member.email && (
                <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
                  <select
                    value={member.role}
                    onChange={(e) => handleUpdateRole(member.user_id, e.target.value as 'admin' | 'member', member.name)}
                    className="flex-1 text-sm px-3 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="admin">⚙️ Admin</option>
                    <option value="member">👤 Member</option>
                  </select>
                  
                  <button
                    onClick={() => handleRemoveMember(member.user_id, member.name)}
                    className="text-sm bg-red-50 hover:bg-red-100 text-red-700 py-2 px-3 rounded font-medium transition"
                  >
                    Remove
                  </button>
                </div>
              )}

              {/* Owner/Self badge */}
              {(member.role === 'owner' || currentUser?.email === member.email) && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-xs text-gray-500 text-center">
                    {member.role === 'owner' ? '👑 Company Owner' : '✨ You'}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Empty State */}
        {teamMembers.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">👥</div>
            <p className="text-gray-500 text-lg mb-4">No team members yet</p>
            <button
              onClick={() => setShowInviteModal(true)}
              className="btn btn-primary"
            >
              📧 Invite Your First Team Member
            </button>
          </div>
        )}
      </div>

      {/* INVITE MODAL */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowInviteModal(false)}>
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold">📧 Invite Team Member</h3>
              <button
                onClick={() => setShowInviteModal(false)}
                className="text-gray-400 hover:text-gray-600 text-3xl leading-none"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="form-label">Email Address *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  placeholder="teammate@example.com"
                  className="form-input"
                  autoFocus
                />
                <p className="text-xs text-gray-500 mt-1">
                  They'll receive an email to set up their account
                </p>
              </div>

              <div>
                <label className="form-label">Role *</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({...formData, role: e.target.value as 'admin' | 'member'})}
                  className="form-input"
                >
                  <option value="member">👤 Member - Can view and manage leads</option>
                  <option value="admin">⚙️ Admin - Can manage team and settings</option>
                </select>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
                💡 <strong>How it works:</strong> They'll get an email with a link to create their account and set their own password.
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowInviteModal(false)}
                  className="btn btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendInvite}
                  disabled={saving}
                  className="btn btn-primary flex-1 disabled:opacity-50"
                >
                  {saving ? '📧 Sending...' : '✅ Send Invite'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}