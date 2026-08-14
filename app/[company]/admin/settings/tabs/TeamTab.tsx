'use client';

import { useState, useEffect } from 'react';
import { 
  Users, UserPlus, Mail, Trash2, Crown, X, 
  CheckCircle2, Loader2, Search, AlertCircle, 
  ShieldCheck, UserCircle2, ArrowRight, ChevronDown,
  Sparkles, Fingerprint, Save, CalendarClock,
  ShieldAlert, UserCheck
} from 'lucide-react';
import { getSchedulingConfig } from '@/lib/schedulingConfig';

type SavedStaff = { name: string };

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
  const [savedStaff, setSavedStaff] = useState<SavedStaff[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showAddStaffModal, setShowAddStaffModal] = useState(false);
  const [newStaffName, setNewStaffName] = useState('');
  const [staffSaving, setStaffSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'member' as 'admin' | 'member'
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [emailError, setEmailError] = useState(false);

  const showCapacitySetting = getSchedulingConfig(company.business_type).showEndTime;
  const [maxConcurrent, setMaxConcurrent] = useState(String(company.max_concurrent_bookings || 1));
  const [maxConcurrentSaving, setMaxConcurrentSaving] = useState(false);
  const [maxConcurrentSaved, setMaxConcurrentSaved] = useState(false);
  const [maxConcurrentError, setMaxConcurrentError] = useState('');

  const handleSaveCapacity = async () => {
    const val = parseInt(maxConcurrent, 10);
    if (isNaN(val) || val < 1) {
      setMaxConcurrentError('Enter a number of 1 or more.');
      return;
    }
    setMaxConcurrentError('');
    setMaxConcurrentSaving(true);
    try {
      const res = await fetch(`/api/company/${company.slug}/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update-capacity', data: { max_concurrent_bookings: val } }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Failed to save');
      setMaxConcurrentSaved(true);
      setTimeout(() => setMaxConcurrentSaved(false), 2000);
    } catch (err) {
      setMaxConcurrentError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setMaxConcurrentSaving(false);
    }
  };

  useEffect(() => {
    fetchTeamData();
  }, []);

  async function fetchTeamData() {
    try {
      const [teamRes, membersRes] = await Promise.all([
        fetch(`/api/company/${company.slug}/team`),
        fetch(`/api/team/members`),
      ]);
      const teamData = await teamRes.json();
      const membersData = await membersRes.json();

      if (teamData.success) {
        setTeamMembers(teamData.teamMembers || []);
      } else {
        setError('Failed to fetch team');
      }

      if (membersData.success) {
        const loginNames = new Set((membersData.members || []).map((m: any) => m.name));
        const staffOnly = (membersData.allAssignees || []).filter((n: string) => !loginNames.has(n));
        setSavedStaff(staffOnly.map((name: string) => ({ name })));
      }
    } catch (err) {
      setError('Connection lost. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleAddStaff() {
    const name = newStaffName.trim();
    if (!name) { setError('Enter a name.'); return; }
    if (savedStaff.some(s => s.name === name) || teamMembers.some(m => m.name === name)) {
      setError('That name is already on your team.');
      return;
    }
    setStaffSaving(true);
    setError('');
    try {
      const res = await fetch('/api/team/save-assignee', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      const result = await res.json();
      if (result.success) {
        setSuccess(`${name} added.`);
        setNewStaffName('');
        setShowAddStaffModal(false);
        fetchTeamData();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError('Could not add staff member.');
      }
    } catch {
      setError('Something went wrong.');
    } finally {
      setStaffSaving(false);
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
      <div className="flex flex-col items-center justify-center py-32">
        <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
        <p className="mt-4 text-xs font-bold uppercase tracking-wider text-slate-400">Syncing Team...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8 pb-16 pt-2 sm:pt-6">
      
      {/* Shake Animation */}
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          75% { transform: translateX(4px); }
        }
        .animate-shake { animation: shake 0.2s ease-in-out 0s 2; }
      `}</style>

      {/* --- TOP HEADER & CONTROLS --- */}
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50/80 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-blue-700 mb-2">
            <Sparkles className="h-3.5 w-3.5 text-blue-600" /> Access & Roster
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Team Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Manage user seats, permissions, and non-login assignees for <span className="font-semibold text-slate-800">{company.name}</span>.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative flex-1 sm:w-60 sm:flex-none">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input 
              type="text"
              placeholder="Search team..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-xs font-medium text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <button
            onClick={() => setShowAddStaffModal(true)}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-xs transition hover:bg-slate-50 active:scale-95"
          >
            <UserCircle2 className="h-4 w-4 text-slate-500" />
            Add Staff
          </button>

          <button
            onClick={() => setShowInviteModal(true)}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-blue-700 active:scale-95"
          >
            <UserPlus className="h-4 w-4" />
            Invite Member
          </button>
        </div>
      </div>

      {/* --- ALERTS & NOTIFICATIONS --- */}
      {(success || error) && (
        <div className={`flex items-center justify-between rounded-xl border p-4 shadow-xs transition-all ${
          success ? 'border-emerald-200 bg-emerald-50/80 text-emerald-900' : 'border-rose-200 bg-rose-50/80 text-rose-900'
        }`}>
          <div className="flex items-center gap-2.5">
            {success ? <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" /> : <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />}
            <span className="text-xs font-bold">{success || error}</span>
          </div>
          <button 
            onClick={() => { setSuccess(''); setError(''); }}
            className="rounded-lg p-1 transition hover:bg-black/5"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* --- ROLES EXPLANATION BANNER --- */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
          Role Access Levels
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            { role: 'Owner', color: 'text-amber-700 bg-amber-50 border-amber-200', desc: 'Full access, billing control, delete company, manage all seats.' },
            { role: 'Admin', color: 'text-blue-700 bg-blue-50 border-blue-200', desc: 'Full operational access, manage team & leads. No billing rights.' },
            { role: 'Member', color: 'text-slate-700 bg-slate-50 border-slate-200', desc: 'View and update assigned leads, add notes. Restricted settings.' },
          ].map((item) => (
            <div key={item.role} className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/50 p-3">
              <span className={`inline-flex items-center justify-center rounded-lg border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${item.color}`}>
                {item.role}
              </span>
              <p className="text-xs text-slate-500 leading-snug">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* --- NON-LOGIN STAFF ROSTER --- */}
      {savedStaff.length > 0 && (
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Staff without logins ({savedStaff.length})
            </h2>
            <span className="text-[11px] font-medium text-slate-400">Assignable to jobs only</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {savedStaff.map((s) => (
              <span
                key={s.name}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700"
              >
                <UserCircle2 className="h-3.5 w-3.5 text-slate-400" />
                {s.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* --- TEAM MEMBERS GRID --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredMembers.map((member) => {
          const isYou = currentUser?.email === member.email;
          const isOwner = member.role === 'owner';

          return (
            <div 
              key={member.id} 
              className="group relative flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition hover:border-slate-300 hover:shadow-md"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl text-lg font-bold border ${
                    isOwner 
                      ? 'bg-amber-50 text-amber-700 border-amber-200' 
                      : 'bg-blue-50 text-blue-700 border-blue-200'
                  }`}>
                    {member.name?.charAt(0).toUpperCase()}
                  </div>

                  <div className="flex flex-col items-end gap-1">
                    <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                      isOwner 
                        ? 'border-amber-200 bg-amber-50 text-amber-700' 
                        : member.role === 'admin'
                        ? 'border-blue-200 bg-blue-50 text-blue-700'
                        : 'border-slate-200 bg-slate-50 text-slate-600'
                    }`}>
                      {isOwner && <Crown className="h-3 w-3 text-amber-500" />}
                      {member.role}
                    </span>

                    {isYou && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-600 bg-blue-50/80 px-2 py-0.5 rounded-md">
                        <Fingerprint className="h-3 w-3" /> YOU
                      </span>
                    )}
                  </div>
                </div>

                <div className="space-y-1 mb-6">
                  <h3 className="text-base font-bold text-slate-900 truncate">{member.name}</h3>
                  <p className="text-xs text-slate-500 font-medium truncate">{member.email}</p>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                {(!isOwner && !isYou) ? (
                  <>
                    <div className="relative flex-1 max-w-[130px]">
                      <select 
                        value={member.role}
                        onChange={(e) => handleUpdateRole(member.user_id, e.target.value as any)}
                        className="w-full appearance-none rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 pr-8 text-xs font-bold text-slate-700 outline-none transition focus:border-blue-500 focus:bg-white cursor-pointer"
                      >
                        <option value="member">Member</option>
                        <option value="admin">Admin</option>
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                    </div>

                    <button 
                      onClick={() => handleRemoveMember(member.user_id, member.name)}
                      title="Remove Member"
                      className="rounded-lg p-2 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </>
                ) : (
                  <div className="flex items-center justify-between w-full text-[11px] font-semibold text-slate-400">
                    <span>Joined {new Date(member.invited_at).toLocaleDateString(undefined, { month: 'short', year: 'numeric'})}</span>
                    {isOwner && <ShieldCheck className="h-4 w-4 text-amber-500" />}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Quick Add Button Tile */}
        <button 
          onClick={() => setShowInviteModal(true)}
          className="flex min-h-[160px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 p-6 text-center transition hover:border-blue-400 hover:bg-blue-50/20 active:scale-98 group"
        >
          <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-500 transition group-hover:bg-blue-600 group-hover:text-white">
            <UserPlus className="h-5 w-5" />
          </div>
          <span className="text-xs font-bold text-slate-800">Invite New Member</span>
          <span className="text-[11px] text-slate-400">Send an invitation link</span>
        </button>
      </div>

      {/* --- BOOKING CAPACITY SETTING --- */}
      {showCapacitySetting && (
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs">
          <div className="mb-4">
            <div className="inline-flex items-center gap-1.5 rounded-md bg-blue-50 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-blue-700 mb-1">
              <CalendarClock className="h-3.5 w-3.5 text-blue-600" /> Booking Capacity
            </div>
            <h3 className="text-base font-bold text-slate-900">
              Concurrent Booking Limit
            </h3>
            <p className="mt-1 text-xs leading-relaxed text-slate-500 max-w-2xl">
              You currently have <strong className="text-slate-800">{teamMembers.length + savedStaff.length} team members</strong> (including non-login staff). 
              Capacity determines how many simultaneous events your public calendar allows.
            </p>
          </div>

          <div className="flex items-center gap-4 rounded-xl border border-slate-100 bg-slate-50/60 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-slate-200 bg-white text-xl font-bold text-slate-900 shadow-xs">
              {Math.max(1, Math.floor((teamMembers.length + savedStaff.length) / 2))}
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800">
                Recommended Simultaneous Slots
              </p>
              <p className="text-[11px] font-medium text-slate-400">
                Calculated automatically based on staff size.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL: ADD NON-LOGIN STAFF --- */}
      {showAddStaffModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs animate-in fade-in"
          onClick={() => setShowAddStaffModal(false)}
        >
          <div 
            className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl animate-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">Add Staff Member</h3>
              <button 
                onClick={() => setShowAddStaffModal(false)}
                className="rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="mb-5 text-xs text-slate-500 leading-relaxed">
              Creates an internal roster profile. No email or login access required—perfect for assigning jobs to field crew.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <UserCircle2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    autoFocus
                    type="text"
                    value={newStaffName}
                    onChange={(e) => setNewStaffName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddStaff()}
                    placeholder="e.g. Alex Rivera"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-9 pr-4 text-xs font-semibold text-slate-800 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>

              <button
                onClick={handleAddStaff}
                disabled={staffSaving}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 py-2.5 text-xs font-bold text-white shadow-xs transition hover:bg-slate-800 active:scale-98 disabled:opacity-50"
              >
                {staffSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save Staff Member'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL: INVITE USER --- */}
      {showInviteModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs animate-in fade-in"
          onClick={() => setShowInviteModal(false)}
        >
          <div 
            className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl animate-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">Invite Team Member</h3>
              <button 
                onClick={() => setShowInviteModal(false)}
                className="rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="mb-5 text-xs text-slate-500 leading-relaxed">
              An email invite with registration instructions will be dispatched immediately.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <UserCircle2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input 
                    autoFocus 
                    type="text" 
                    value={formData.name} 
                    onChange={(e) => setFormData({...formData, name: e.target.value})} 
                    placeholder="e.g. Sarah Connor" 
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-9 pr-4 text-xs font-semibold text-slate-800 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100" 
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Work Email Address
                </label>
                <div className={`relative ${emailError ? 'animate-shake' : ''}`}>
                  <Mail className={`pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transition-colors ${
                    emailError ? 'text-rose-500' : 'text-slate-400'
                  }`} />
                  <input 
                    type="email" 
                    value={formData.email} 
                    onChange={(e) => {
                      setFormData({...formData, email: e.target.value});
                      if(emailError) setEmailError(false);
                    }} 
                    placeholder="name@company.com" 
                    className={`w-full rounded-xl border py-2.5 pl-9 pr-4 text-xs font-semibold outline-none transition ${
                      emailError 
                        ? 'border-rose-300 bg-rose-50/50 text-rose-900 focus:ring-2 focus:ring-rose-100' 
                        : 'border-slate-200 bg-slate-50/50 text-slate-800 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100'
                    }`} 
                  />
                </div>
              </div>

              <button 
                onClick={handleSendInvite} 
                disabled={saving} 
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-2.5 text-xs font-bold text-white shadow-xs transition hover:bg-blue-700 active:scale-98 disabled:opacity-50 mt-2"
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>Send Invite Link <ArrowRight className="h-4 w-4" /></>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}