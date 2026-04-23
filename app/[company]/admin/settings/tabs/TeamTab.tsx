'use client';

import { useState, useEffect } from 'react';
import { 
  Users, UserPlus, Mail, Trash2, Crown, X, 
  CheckCircle2, Loader2, Search, AlertCircle, 
  ShieldCheck, UserCircle2, ArrowRight, ChevronDown,
  Sparkles, Fingerprint
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
    role: 'member' as 'admin' | 'member'
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [emailError, setEmailError] = useState(false);

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
      setError('Connection lost. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  async function handleSendInvite() {
    if (!formData.name || !formData.email) {
      setError('Please provide both name and email.');
      return;
    }

    if (!validateEmail(formData.email)) {
      setEmailError(true);
      setError('Invalid email format. Please check for typos.');
      return;
    }

    setSaving(true);
    setError('');
    setEmailError(false);

    try {
      const response = await fetch(`/api/company/${company.slug}/team/invite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const result = await response.json();
      if (result.success) {
        setSuccess(`Invitation sent to ${formData.name}`);
        setFormData({ name: '', email: '', role: 'member' });
        setShowInviteModal(false);
        fetchTeamData();
        setTimeout(() => setSuccess(''), 5000);
      } else {
        setError(result.error || 'Invitation failed');
      }
    } catch (err) {
      setError('Something went wrong.');
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
        setSuccess(`Permissions updated.`);
        fetchTeamData();
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      setError('Could not update role.');
    }
  }

  async function handleRemoveMember(userId: number, memberName: string) {
    if (!confirm(`Remove ${memberName}? Access will be revoked immediately.`)) return;

    try {
      const response = await fetch(`/api/company/${company.slug}/team/remove`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });
      if (response.ok) {
        setSuccess(`${memberName} removed.`);
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
      <div className="flex flex-col items-center justify-center py-40">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
        <p className="mt-4 text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px]">Syncing Team</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-32 pt-6 lg:pt-10">
      
      {/* CSS For Shake Animation */}
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          75% { transform: translateX(4px); }
        }
        .animate-shake { animation: shake 0.2s ease-in-out 0s 2; }
      `}</style>

      {/* --- TOP BAR --- */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
        <div className="space-y-2">
            <div className="flex items-center gap-2 mb-1">
                <Sparkles className="w-4 h-4 text-blue-500" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-500">Access Control</span>
            </div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Your Team</h1>
            <p className="text-slate-400 font-bold text-sm">Manage seats for <span className="text-slate-900">{company.name}</span>.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                <input 
                    type="text"
                    placeholder="Search members..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full sm:w-64 pl-11 pr-4 py-3.5 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-4 focus:ring-blue-500/10 transition-all outline-none"
                />
            </div>
            <button
                onClick={() => setShowInviteModal(true)}
                className="flex items-center justify-center gap-2 px-6 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-sm font-black shadow-xl shadow-blue-100 transition-all active:scale-95"
            >
                <UserPlus className="w-4 h-4" />
                Invite
            </button>
        </div>
      </div>

      {/* --- NOTIFICATIONS --- */}
      {(success || error) && (
        <div className={`mb-8 flex items-center gap-3 px-6 py-4 rounded-[2rem] border animate-in slide-in-from-top-4 ${
            success ? 'bg-emerald-50/50 border-emerald-100 text-emerald-800' : 'bg-red-50/50 border-red-100 text-red-800'
        }`}>
            {success ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : <AlertCircle className="w-5 h-5 text-red-500" />}
            <span className="text-xs font-black uppercase tracking-tight flex-1">{success || error}</span>
            <button onClick={() => {setSuccess(''); setError('');}} className="p-1 hover:bg-black/5 rounded-lg">
                <X className="w-4 h-4" />
            </button>
        </div>
      )}

      {/* --- ROLES GUIDE --- */}
      <div className="mb-8 p-5 bg-slate-50 rounded-[2rem] border border-slate-100">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-3">Role Permissions</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { role: 'Owner', color: 'text-amber-600', bg: 'bg-amber-50', perms: 'Full access, billing, delete company, manage team' },
            { role: 'Admin', color: 'text-blue-600', bg: 'bg-blue-50', perms: 'Full access, manage team & leads, cannot access billing' },
            { role: 'Member', color: 'text-slate-500', bg: 'bg-slate-50', perms: 'View and update leads, add notes, cannot delete or manage team' },
          ].map(r => (
            <div key={r.role} className="flex items-start gap-3">
              <div className={`w-8 h-8 rounded-xl ${r.bg} flex items-center justify-center shrink-0`}>
                <span className={`text-xs font-black ${r.color}`}>{r.role.charAt(0)}</span>
              </div>
              <div>
                <p className={`text-xs font-black ${r.color}`}>{r.role}</p>
                <p className="text-[10px] text-slate-400 font-medium leading-relaxed">{r.perms}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* --- CARDS GRID --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMembers.map(member => {
          const isYou = currentUser?.email === member.email;
          const isOwner = member.role === 'owner';

          return (
            <div key={member.id} className="group relative bg-white border border-slate-100 rounded-[2.5rem] p-7 shadow-sm hover:shadow-2xl hover:shadow-blue-500/5 hover:-translate-y-1 transition-all duration-500">
              <div className="flex justify-between items-start mb-8">
                <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center text-xl font-black ${
                  isOwner ? 'bg-amber-100 text-amber-600' : 'bg-blue-50 text-blue-600'
                }`}>
                  {member.name?.charAt(0).toUpperCase()}
                </div>
                <div className="flex flex-col items-end gap-2">
                    <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                        isOwner ? 'bg-amber-50 border-amber-100 text-amber-600' : 
                        member.role === 'admin' ? 'bg-blue-50 border-blue-100 text-blue-600' : 
                        'bg-slate-50 border-slate-100 text-slate-500'
                    }`}>
                        {member.role}
                    </span>
                    {isYou && (
                        <div className="flex items-center gap-1.5 text-[8px] font-black text-blue-400 bg-blue-50/50 px-2 py-1 rounded-lg">
                            <Fingerprint className="w-3 h-3" /> YOU
                        </div>
                    )}
                </div>
              </div>
             <div className="space-y-1 mb-8">
                <h4 className="text-xl font-black text-slate-900 tracking-tight truncate">{member.name}</h4>
                <p className="text-sm font-bold text-slate-400 truncate">{member.email}</p>
                <p className="text-[10px] font-bold text-slate-300 mt-1">
                  {member.role === 'owner' ? 'Full access · Billing · Can delete company'
                    : member.role === 'admin' ? 'Full access · Can manage team & leads'
                    : 'Can view & update leads only'}
                </p>
              </div>
              <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                {(!isOwner && !isYou) ? (
                    <>
                        <div className="relative flex-1 max-w-[140px]">
                            <select 
                                value={member.role}
                                onChange={(e) => handleUpdateRole(member.user_id, e.target.value as any)}
                                className="w-full appearance-none bg-slate-50 border-none text-[10px] font-black uppercase tracking-widest text-slate-500 rounded-xl pl-4 pr-10 py-3 cursor-pointer hover:bg-blue-50 hover:text-blue-600 transition-all outline-none"
                            >
                                <option value="member">Member</option>
                                <option value="admin">Admin</option>
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-300 pointer-events-none" />
                        </div>
                        <button onClick={() => handleRemoveMember(member.user_id, member.name)} className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
                            <Trash2 className="w-5 h-5" />
                        </button>
                    </>
                ) : (
                    <div className="text-[10px] font-black text-slate-300 uppercase tracking-widest flex items-center justify-between w-full">
                        <span>Joined {new Date(member.invited_at).toLocaleDateString(undefined, { month: 'short', year: 'numeric'})}</span>
                        {isOwner && <Crown className="w-4 h-4 text-amber-400" />}
                    </div>
                )}
              </div>
            </div>
          );
        })}

        <button 
            onClick={() => setShowInviteModal(true)}
            className="flex flex-col items-center justify-center border-4 border-dashed border-slate-50 rounded-[2.5rem] p-10 hover:border-blue-100 hover:bg-blue-50/20 transition-all group min-h-[280px]"
        >
            <div className="w-16 h-16 rounded-[1.5rem] bg-slate-50 flex items-center justify-center mb-4 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500 group-hover:scale-110">
                <UserPlus className="w-6 h-6 text-slate-400 group-hover:text-white" />
            </div>
            <p className="font-black text-slate-900 text-sm uppercase tracking-widest">New Seat</p>
        </button>
      </div>

      {/* --- MODAL --- */}
      {showInviteModal && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in" onClick={() => setShowInviteModal(false)}>
          <div className="bg-white rounded-t-[3rem] sm:rounded-[3rem] p-8 sm:p-12 w-full max-w-lg relative animate-in slide-in-from-bottom-20 sm:zoom-in-95" onClick={e => e.stopPropagation()}>
            <div className="w-12 h-1.5 bg-slate-100 rounded-full mx-auto mb-8 sm:hidden" />
            <div className="flex items-center justify-between mb-10">
                <h3 className="text-3xl font-black text-slate-900 tracking-tight">Invite</h3>
                <button onClick={() => setShowInviteModal(false)} className="p-3 bg-slate-50 text-slate-400 hover:text-slate-900 rounded-2xl transition-all">
                    <X className="w-5 h-5" />
                </button>
            </div>
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Full Name</label>
                <div className="relative group">
                    <UserCircle2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-blue-500 transition-colors" />
                    <input autoFocus type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. Michael Scott" className="w-full pl-12 pr-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-bold" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Work Email</label>
                <div className={`relative group ${emailError ? 'animate-shake' : ''}`}>
                    <Mail className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${emailError ? 'text-red-500' : 'text-slate-300 group-focus-within:text-blue-500'}`} />
                    <input 
                      type="email" 
                      value={formData.email} 
                      onChange={e => {
                        setFormData({...formData, email: e.target.value});
                        if(emailError) setEmailError(false);
                      }} 
                      placeholder="name@company.com" 
                      className={`w-full pl-12 pr-5 py-4 border-none rounded-2xl focus:ring-4 outline-none transition-all font-bold ${emailError ? 'bg-red-50 focus:ring-red-500/10' : 'bg-slate-50 focus:ring-blue-500/10'}`} 
                    />
                </div>
              </div>

              <div className="pt-6">
                <button onClick={handleSendInvite} disabled={saving} className="w-full py-5 bg-blue-600 hover:bg-blue-700 text-white rounded-[1.5rem] font-black text-sm uppercase tracking-widest transition-all active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-50">
                    {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Send Access Link <ArrowRight className="w-4 h-4" /></>}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}