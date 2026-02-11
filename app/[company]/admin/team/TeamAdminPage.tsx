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
  name: '',
  email: '',
  phone: '',
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
      if (data.success) setTeamMembers(data.teamMembers || []);
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
      if (data.url) window.location.href = data.url;
      else alert('Unable to open billing portal. Please try again.');
    } catch (error) {
      console.error('Error opening billing portal:', error);
      alert('Error opening billing portal');
    }
  }

  async function handleSendInvite() {
  if (!formData.name) {
    setError('Name is required');
    return;
  }
  
  if (!formData.email) {
    setError('Email is required');
    return;
  }

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
      setSuccess(`✅ Invitation sent to ${formData.name} (${formData.email})!`);
      setFormData({ name: '', email: '', phone: '', role: 'member' });
      setShowInviteModal(false);
      setTimeout(() => setSuccess(''), 5000);
    } else setError(result.error || 'Failed to send invitation');
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
      } else setError('Failed to update role');
    } catch {
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
      } else setError('Failed to remove team member');
    } catch {
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
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-xl font-medium text-gray-700">Loading team members...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">

      {/* HEADER */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            {companyLogoUrl ? (
              <img src={companyLogoUrl} alt={`${companyName} logo`} className="h-12 w-auto object-contain" />
            ) : (
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center text-white font-bold text-xl">
                {companyName.charAt(0)}
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{companyName}</h1>
              <p className="text-sm text-gray-500">Team Management</p>
            </div>
          </div>

          <div className="flex gap-3 items-center flex-wrap">
            <a href={`/${companySlug}/admin/settings`} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-yellow-100 text-yellow-800 font-semibold hover:bg-yellow-200 transition">
              ⚙️ Settings
            </a>
            <a href={`/${companySlug}/dashboard/deleted-leads`} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-100 text-red-800 font-semibold hover:bg-red-200 transition">
              🗑️ Deleted Leads
            </a>
            <a href={`/${companySlug}/dashboard`} className="text-gray-600 hover:text-gray-900">
              ← Dashboard
            </a>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {/* Success/Error Alerts */}
        {success && <div className="mb-6 px-4 py-3 rounded-lg bg-green-50 border border-green-200 text-green-800">{success}</div>}
        {error && <div className="mb-6 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-800">{error}</div>}

        {/* BILLING SECTION */}
        {currentUser.role === 'owner' && (
          <section className="bg-white rounded-xl shadow p-6 mb-10 space-y-6">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">💳 Billing & Subscription</h2>
                <p className="text-gray-500 text-sm mt-1">Manage subscription, payment methods, and billing history.</p>
              </div>
              <button
                onClick={handleManageSubscription}
                className="px-5 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition shadow-sm flex items-center gap-2"
              >
                💳 Manage Billing
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg text-center shadow-sm">
                <div className="text-gray-500 text-xs font-semibold uppercase mb-1">Status</div>
                <div className="text-gray-900 font-bold">
                  {company.subscription_status === 'active' && '✅ Active'}
                  {company.subscription_status === 'trialing' && '🎉 Free Trial'}
                  {company.subscription_status === 'past_due' && '⚠️ Payment Due'}
                  {company.subscription_status === 'canceled' && '❌ Canceled'}
                  {!company.subscription_status && '⚠️ Inactive'}
                </div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg text-center shadow-sm">
                <div className="text-gray-500 text-xs font-semibold uppercase mb-1">Plan</div>
                <div className="text-gray-900 font-bold">Professional - $39.99/mo</div>
              </div>
              {company.trial_ends_at && company.subscription_status === 'trialing' && (
                <div className="bg-gray-50 p-4 rounded-lg text-center shadow-sm">
                  <div className="text-gray-500 text-xs font-semibold uppercase mb-1">Trial Ends</div>
                  <div className="text-gray-900 font-bold">{new Date(company.trial_ends_at).toLocaleDateString()}</div>
                </div>
              )}
            </div>
          </section>
        )}

        {/* TEAM HEADER */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Team Members</h2>
            <p className="text-gray-500 mt-1">{teamMembers.length} active members</p>
          </div>
          <button
            onClick={() => setShowInviteModal(true)}
            className="px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition shadow-sm flex items-center gap-2"
          >
            📧 Invite Team Member
          </button>
        </div>

        {/* TEAM GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {teamMembers.map(member => (
            <div key={member.id} className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-2xl mb-3">
                {member.name?.charAt(0)?.toUpperCase() || '?'}
              </div>
              <h3 className="text-xl font-bold">{member.name || 'Unknown User'}</h3>
              <p className="text-gray-500 text-sm mb-2 break-all">{member.email}</p>
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getRoleBadgeClass(member.role)} mb-3`}>
                {getRoleIcon(member.role)} {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
              </span>
              <p className="text-gray-400 text-xs mb-4">📅 Added {new Date(member.invited_at).toLocaleDateString()}</p>

              {/* Actions */}
              {member.role !== 'owner' && currentUser?.email !== member.email && (
                <div className="flex gap-2 w-full mt-auto">
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
                    className="flex-1 text-sm bg-red-50 hover:bg-red-100 text-red-700 py-2 rounded font-medium transition"
                  >
                    Remove
                  </button>
                </div>
              )}

              {(member.role === 'owner' || currentUser?.email === member.email) && (
                <p className="text-xs text-gray-400 mt-3">{member.role === 'owner' ? '👑 Company Owner' : '✨ You'}</p>
              )}
            </div>
          ))}
        </div>

        {/* EMPTY STATE */}
        {teamMembers.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">👥</div>
            <p className="text-gray-500 text-lg mb-4">No team members yet</p>
            <button
              onClick={() => setShowInviteModal(true)}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition shadow-sm flex items-center justify-center gap-2 mx-auto"
            >
              📧 Invite Your First Team Member
            </button>
          </div>
        )}
      </main>

      {/* INVITE MODAL */}
{showInviteModal && (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={() => setShowInviteModal(false)}>
    <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 relative" onClick={(e) => e.stopPropagation()}>
      <button
        onClick={() => setShowInviteModal(false)}
        className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-3xl leading-none"
      >
        ×
      </button>
      <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">📧 Invite Team Member</h3>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            placeholder="John Doe"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoFocus
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            placeholder="teammate@example.com"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-xs text-gray-500 mt-1">They'll receive an email to set up their account</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number (Optional)</label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({...formData, phone: e.target.value})}
            placeholder="+1 (555) 123-4567"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Role *</label>
          <select
            value={formData.role}
            onChange={(e) => setFormData({...formData, role: e.target.value as 'admin' | 'member'})}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="member">👤 Member - Can view and manage leads</option>
            <option value="admin">⚙️ Admin - Can manage team and settings</option>
          </select>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
          💡 <strong>How it works:</strong> They'll get an email with a link to create their account and set their own password.
        </div>
        <div className="flex flex-col sm:flex-row gap-3 mt-2">
          <button
            onClick={() => setShowInviteModal(false)}
            className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg font-semibold transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSendInvite}
            disabled={saving}
            className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition disabled:opacity-50"
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
