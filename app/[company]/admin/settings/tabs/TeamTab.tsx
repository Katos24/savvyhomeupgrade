'use client';

import { useState, useEffect } from 'react';
import { Users, UserPlus, Shield, Trash2 } from 'lucide-react';

type TeamMember = {
  id: number;
  user_id: number;
  name: string;
  email: string;
  role: 'owner' | 'admin' | 'member';
  status: 'active' | 'disabled';
  invited_at: string;
};

export default function TeamTab({ company, currentUser }: { company: any; currentUser: any }) {
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
      const response = await fetch(`/api/company/${company.slug}/team`);
      const data = await response.json();
      if (data.success) setTeamMembers(data.teamMembers || []);
    } catch (error) {
      console.error('Failed to fetch team data:', error);
      setError('Failed to load team members');
    } finally {
      setLoading(false);
    }
  }

  async function handleSendInvite() {
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
      const response = await fetch(`/api/company/${company.slug}/team/invite`, {
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
        await fetchTeamData();
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
      const response = await fetch(`/api/company/${company.slug}/team/update`, {
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
      const response = await fetch(`/api/company/${company.slug}/team/remove`, {
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
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-3">⏳</div>
          <p className="text-gray-600">Loading team members...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-1 sm:mb-2">Team Members</h2>
          <p className="text-sm sm:text-base text-slate-600">{teamMembers.length} active members</p>
        </div>
        <button
          onClick={() => setShowInviteModal(true)}
          className="flex items-center justify-center gap-2 px-4 sm:px-5 py-2 sm:py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition shadow-sm text-sm sm:text-base"
        >
          <UserPlus className="w-4 h-4" />
          Invite Team Member
        </button>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-3 sm:px-4 py-2 sm:py-3 rounded-lg flex items-center gap-2 text-sm sm:text-base">
          <span className="text-lg flex-shrink-0">✓</span>
          <span className="flex-1">{success}</span>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-3 sm:px-4 py-2 sm:py-3 rounded-lg flex items-center gap-2 text-sm sm:text-base">
          <span className="text-lg flex-shrink-0">⚠</span>
          <span className="flex-1">{error}</span>
        </div>
      )}

      {/* Team Grid */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sm:p-6">
        {teamMembers.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {teamMembers.map(member => (
              <div key={member.id} className="bg-slate-50 p-4 sm:p-5 rounded-xl border border-slate-200 hover:border-blue-300 hover:shadow-md transition flex flex-col items-center text-center">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-xl sm:text-2xl mb-3">
                  {member.name?.charAt(0)?.toUpperCase() || '?'}
                </div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900">{member.name || 'Unknown User'}</h3>
                <p className="text-slate-500 text-xs sm:text-sm mb-2 break-all">{member.email}</p>
                <span className={`inline-block px-2.5 sm:px-3 py-1 rounded-full text-xs font-semibold ${getRoleBadgeClass(member.role)} mb-3`}>
                  {getRoleIcon(member.role)} {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                </span>
                <p className="text-slate-400 text-xs mb-4">Added {new Date(member.invited_at).toLocaleDateString()}</p>

                {/* Actions */}
                {member.role !== 'owner' && currentUser?.email !== member.email && (
                  <div className="flex flex-col sm:flex-row gap-2 w-full mt-auto">
                    <select
                      value={member.role}
                      onChange={(e) => handleUpdateRole(member.user_id, e.target.value as 'admin' | 'member', member.name)}
                      className="flex-1 text-xs sm:text-sm px-2 sm:px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    >
                      <option value="admin">⚙️ Admin</option>
                      <option value="member">👤 Member</option>
                    </select>
                    <button
                      onClick={() => handleRemoveMember(member.user_id, member.name)}
                      className="flex-1 text-xs sm:text-sm bg-red-50 hover:bg-red-100 text-red-700 py-2 rounded-lg font-medium transition"
                    >
                      Remove
                    </button>
                  </div>
                )}

                {(member.role === 'owner' || currentUser?.email === member.email) && (
                  <p className="text-xs text-slate-400 mt-3">{member.role === 'owner' ? '👑 Company Owner' : '✨ You'}</p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-4xl sm:text-5xl mb-4">👥</div>
            <p className="text-slate-500 text-base sm:text-lg mb-4">No team members yet</p>
            <button
              onClick={() => setShowInviteModal(true)}
              className="inline-flex items-center gap-2 px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition shadow-sm"
            >
              <UserPlus className="w-4 h-4" />
              Invite Your First Team Member
            </button>
          </div>
        )}
      </div>

      {/* INVITE MODAL */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowInviteModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-4 sm:p-6 relative" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setShowInviteModal(false)}
              className="absolute top-3 right-3 sm:top-4 sm:right-4 text-slate-400 hover:text-slate-600 text-2xl sm:text-3xl leading-none"
            >
              ×
            </button>
            <h3 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 flex items-center gap-2 text-slate-900">
              <UserPlus className="w-6 h-6 text-blue-600" />
              Invite Team Member
            </h3>
            <div className="space-y-3 sm:space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Email Address *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  placeholder="teammate@example.com"
                  className="w-full border-2 border-slate-300 rounded-lg px-3 sm:px-4 py-2 sm:py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  autoFocus
                />
                <p className="text-xs text-slate-500 mt-1">They'll receive an email to set up their account</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Role *</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({...formData, role: e.target.value as 'admin' | 'member'})}
                  className="w-full border-2 border-slate-300 rounded-lg px-3 sm:px-4 py-2 sm:py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="member">👤 Member - Can view and manage leads</option>
                  <option value="admin">⚙️ Admin - Can manage team and settings</option>
                </select>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs sm:text-sm text-blue-800">
                <strong>💡 How it works:</strong> They'll get an email with a link to create their account and set their own password.
              </div>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-2">
                <button
                  onClick={() => setShowInviteModal(false)}
                  className="flex-1 px-4 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg font-semibold transition text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendInvite}
                  disabled={saving}
                  className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition disabled:opacity-50 text-sm shadow-sm"
                >
                  {saving ? 'Sending...' : 'Send Invite'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}