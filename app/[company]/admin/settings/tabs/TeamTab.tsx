'use client';

import { useState, useEffect } from 'react';
import { 
  Users, UserPlus, Mail, Trash2, Crown, X, 
  CheckCircle2, Loader2, Search, AlertCircle, 
  ShieldCheck, UserCircle2, MoreHorizontal, ArrowRight
} from 'lucide-react';

type TeamMember = {
  id: number;
  user_id: number;
  name: string;
  email: string;
  role: 'owner' | 'admin' | 'member';
  status: 'active' | 'disabled' | 'pending';
  invited_at: string;
};

export default function TeamTab({ company, currentUser }: { company: any; currentUser: any }) {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
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
      const response = await fetch(`/api/company/${company.slug}/team`);
      const data = await response.json();
      if (data.success) {
        setTeamMembers(data.teamMembers || []);
      } else {
        setError('Failed to fetch team');
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setError('Connection lost. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleSendInvite() {
    if (!formData.name || !formData.email) {
      setError('Please provide both name and email.');
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
      if (result.success) {
        setSuccess(`Invitation sent to ${formData.name}`);
        setFormData({ name: '', email: '', phone: '', role: 'member' });
        setShowInviteModal(false);
        fetchTeamData();
        setTimeout(() => setSuccess(''), 5000);
      } else {
        setError(result.error || 'Invitation failed');
      }
    } catch (err) {
      setError('Something went wrong. Check your connection.');
    } finally {
      setSaving(false);
    }
  }

  async function handleUpdateRole(userId: number, newRole: 'admin' | 'member') {
    try {
      const response = await fetch(`/api/company/${company.slug}/team/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, role: newRole })
      });
      if (response.ok) {
        setSuccess(`Permissions updated successfully.`);
        fetchTeamData();
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      setError('Could not update role.');
    }
  }

  async function handleRemoveMember(userId: number, memberName: string) {
    if (!confirm(`Are you sure you want to remove ${memberName}? They will lose all access immediately.`)) return;

    try {
      const response = await fetch(`/api/company/${company.slug}/team/remove`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });
      if (response.ok) {
        setSuccess(`${memberName} has been removed.`);
        fetchTeamData();
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      setError('Failed to remove member.');
    }
  }

  const filteredMembers = teamMembers.filter(m => 
    m.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    m.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-4">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
        <p className="text-slate-400 font-medium tracking-tight">Loading your team...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-10 pb-32 pt-4">
      
      {/* --- HEADER SECTION --- */}
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-1">
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Team Management</h2>
          <div className="flex items-center gap-3">
            <p className="text-sm font-bold text-slate-500 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-indigo-500" />
                {teamMembers.length} Members
            </p>
            <span className="w-1 h-1 rounded-full bg-slate-300" />
            <p className="text-sm font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                Standard Plan
            </p>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row items-stretch gap-3">
            <div className="relative flex-1 sm:min-w-[280px]">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                    type="text"
                    placeholder="Search by name or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-11 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl text-sm focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none shadow-sm"
                />
            </div>
            <button
                onClick={() => setShowInviteModal(true)}
                className="flex items-center justify-center gap-2 px-8 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-sm font-black shadow-lg shadow-indigo-200 transition-all active:scale-95 whitespace-nowrap"
            >
                <UserPlus className="w-4 h-4" />
                Add Member
            </button>
        </div>
      </div>

      {/* --- FEEDBACK ALERTS --- */}
      {(success || error) && (
        <div className={`flex items-center gap-3 px-5 py-4 rounded-2xl border animate-in slide-in-from-top-4 duration-500 ${
            success ? 'bg-emerald-50 border-emerald-100 text-emerald-800' : 'bg-red-50 border-red-100 text-red-800'
        }`}>
            {success ? <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" /> : <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />}
            <span className="text-sm font-bold flex-1">{success || error}</span>
            <button className="p-1 hover:bg-black/5 rounded-lg transition-colors" onClick={() => {setSuccess(''); setError('');}}>
                <X className="w-4 h-4" />
            </button>
        </div>
      )}

      {/* --- TEAM GRID --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 sm:gap-6">
        {filteredMembers.map(member => {
          const isYou = currentUser?.email === member.email;
          const isOwner = member.role === 'owner';

          return (
            <div key={member.id} className="relative group flex flex-col bg-white border border-slate-200 rounded-[32px] p-6 hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-500 overflow-hidden">
              
              {/* Card Top: Identity */}
              <div className="flex items-start justify-between gap-4 mb-6">
                <div className={`shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-black shadow-inner ring-4 ring-white transition-transform group-hover:scale-110 ${
                  isOwner ? 'bg-amber-100 text-amber-600' : 'bg-indigo-50 text-indigo-600'
                }`}>
                  {member.name?.charAt(0).toUpperCase()}
                </div>
                
                <div className="flex flex-col items-end gap-1.5">
                    <span className={`px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-colors ${
                        isOwner ? 'bg-amber-50 border-amber-200 text-amber-700' : 
                        member.role === 'admin' ? 'bg-blue-50 border-blue-100 text-blue-600' : 
                        'bg-slate-50 border-slate-200 text-slate-500'
                    }`}>
                        {member.role}
                    </span>
                    {isYou && (
                        <div className="flex items-center gap-1 text-[9px] font-black text-indigo-400 uppercase tracking-tighter bg-indigo-50/50 px-2 py-0.5 rounded-full">
                            <ShieldCheck className="w-3 h-3" /> 
                            Logged In
                        </div>
                    )}
                </div>
              </div>

              {/* Card Middle: Contact Info (Truncated to prevent overlap) */}
              <div className="flex-1 min-w-0 mb-8">
                <h4 className="text-lg font-black text-slate-900 truncate tracking-tight mb-1">
                    {member.name || 'Anonymous'}
                </h4>
                <div className="flex items-center gap-2 text-slate-400 group-hover:text-indigo-400 transition-colors">
                    <Mail className="w-3.5 h-3.5 shrink-0" />
                    <p className="text-sm font-medium truncate">{member.email}</p>
                </div>
              </div>

              {/* Card Bottom: Actions */}
              <div className="pt-5 border-t border-slate-100 flex items-center justify-between gap-3 mt-auto">
                {(!isOwner && !isYou) ? (
                    <div className="flex items-center gap-2 w-full">
                        <select 
                            value={member.role}
                            onChange={(e) => handleUpdateRole(member.user_id, e.target.value as any)}
                            className="flex-1 bg-slate-50 border-none text-[11px] font-black uppercase text-slate-500 rounded-xl px-4 py-2.5 cursor-pointer hover:bg-slate-100 hover:text-indigo-600 transition-all outline-none"
                        >
                            <option value="member">Member</option>
                            <option value="admin">Admin</option>
                        </select>
                        <button 
                            onClick={() => handleRemoveMember(member.user_id, member.name)}
                            className="p-2.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all shrink-0"
                            title="Remove Member"
                        >
                            <Trash2 className="w-4.5 h-4.5" />
                        </button>
                    </div>
                ) : (
                    <div className="flex items-center justify-between w-full text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        <span className="flex items-center gap-1">
                            Joined {new Date(member.invited_at).toLocaleDateString()}
                        </span>
                        {isOwner && <Crown className="w-4 h-4 text-amber-400 animate-pulse" />}
                    </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Empty State / Add Member Trigger */}
        <button 
            onClick={() => setShowInviteModal(true)}
            className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-[32px] p-10 hover:border-indigo-400 hover:bg-indigo-50/30 transition-all group min-h-[220px]"
        >
            <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center mb-4 group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-all group-hover:rotate-12">
                <UserPlus className="w-6 h-6 text-slate-400 group-hover:text-indigo-600" />
            </div>
            <p className="font-black text-slate-900 text-sm tracking-tight">Add Team Member</p>
            <p className="text-xs text-slate-400 mt-1 max-w-[160px] text-center leading-relaxed">
                Grow your team and assign new leads instantly.
            </p>
        </button>
      </div>

      {/* --- MOBILE-OPTIMIZED MODAL --- */}
      {showInviteModal && (
        <div 
            className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-6 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300"
            onClick={() => setShowInviteModal(false)}
        >
          <div 
            className="bg-white rounded-t-[40px] sm:rounded-[48px] p-8 sm:p-12 w-full max-w-lg shadow-2xl relative animate-in slide-in-from-bottom-20 sm:zoom-in-95 duration-500 ease-out"
            onClick={e => e.stopPropagation()}
          >
            {/* Visual Polish: Mobile Handle */}
            <div className="w-16 h-1.5 bg-slate-100 rounded-full mx-auto mb-10 sm:hidden" />

            <div className="flex items-center justify-between mb-10">
                <div className="space-y-1">
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">Invite Teammate</h3>
                    <p className="text-sm text-slate-400 font-medium tracking-tight">Access will be sent via email.</p>
                </div>
                <button 
                    onClick={() => setShowInviteModal(false)} 
                    className="p-3 bg-slate-50 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-2xl transition-all"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>

            <div className="space-y-6">
              <div className="space-y-2 group">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] ml-1">Full Name</label>
                <div className="relative">
                    <UserCircle2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-indigo-500 transition-colors" />
                    <input 
                        type="text"
                        value={formData.name}
                        onChange={e => setFormData({...formData, name: e.target.value})}
                        placeholder="John Doe"
                        className="w-full pl-12 pr-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 outline-none transition-all font-bold placeholder:text-slate-300"
                    />
                </div>
              </div>

              <div className="space-y-2 group">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] ml-1">Email Address</label>
                <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-indigo-500 transition-colors" />
                    <input 
                        type="email"
                        value={formData.email}
                        onChange={e => setFormData({...formData, email: e.target.value})}
                        placeholder="john@company.com"
                        className="w-full pl-12 pr-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 outline-none transition-all font-bold placeholder:text-slate-300"
                    />
                </div>
              </div>

              <div className="pt-6">
                <button 
                    onClick={handleSendInvite}
                    disabled={saving}
                    className="w-full py-5 bg-slate-900 text-white rounded-3xl font-black text-base hover:bg-slate-800 transition-all active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-50 shadow-xl shadow-slate-200"
                >
                    {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowRight className="w-5 h-5" />}
                    {saving ? 'Sending Invitation...' : 'Send Invitation Link'}
                </button>
                <p className="text-center text-[11px] text-slate-400 mt-6 font-medium px-4 leading-relaxed">
                    By inviting a member, you agree they will have access to company leads and customer communications.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}