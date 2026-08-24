'use client';

import { useState, useEffect } from 'react';
import { 
  Users, UserPlus, Trash2, Crown, X, 
  CheckCircle2, Loader2, Search, AlertCircle, 
  UserCircle2, Sparkles, CalendarClock, HardHat, Info
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
  
  // Invited User Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'member' as 'admin' | 'member',
  });
  
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [, setEmailError] = useState(false);

  const showCapacitySetting = getSchedulingConfig(company.business_type).showEndTime;

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
    } catch {
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
        setSuccess(`${name} added to job assignees.`);
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

  const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

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
        setFormData({ 
          name: '', 
          email: '', 
          role: 'member'
        });
        setShowInviteModal(false);
        fetchTeamData();
        setTimeout(() => setSuccess(''), 5000);
      } else {
        setError(result.error || 'Invitation failed');
      }
    } catch {
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
    } catch {
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
    } catch {
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
    <div className="mx-auto max-w-7xl space-y-6 pb-16 pt-2 sm:pt-6">
      {/* --- TOP HEADER --- */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50/80 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-blue-700 mb-1.5">
            <Sparkles className="h-3.5 w-3.5 text-blue-600" /> Organization Roster
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Team & Staff Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Manage dashboard login credentials and assignable field staff for <span className="font-semibold text-slate-800">{company.name}</span>.
          </p>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input 
            type="text"
            placeholder="Search team or crew..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-xs font-medium text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>
      </div>

      {/* --- ALERTS --- */}
      {(success || error) && (
        <div className={`flex items-center justify-between rounded-xl border p-4 shadow-xs transition-all ${
          success ? 'border-emerald-200 bg-emerald-50/80 text-emerald-900' : 'border-rose-200 bg-rose-50/80 text-rose-900'
        }`}>
          <div className="flex items-center gap-2.5">
            {success ? <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" /> : <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />}
            <span className="text-xs font-bold">{success || error}</span>
          </div>
          <button onClick={() => { setSuccess(''); setError(''); }} className="rounded-lg p-1 transition hover:bg-black/5">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* --- SIDE-BY-SIDE EVEN GRID LAYOUT --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        
        {/* ================= LEFT COLUMN: APP USERS ================= */}
        <div className="space-y-4">
          <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs">
            <div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-blue-600" />
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                  App Users ({teamMembers.length})
                </h2>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Members with dashboard access & log-in permissions.
              </p>
            </div>
            <button
              onClick={() => setShowInviteModal(true)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-blue-700 active:scale-95"
            >
              <UserPlus className="h-4 w-4" />
              Invite App User
            </button>
          </div>

          {/* User List */}
          <div className="space-y-3">
            {filteredMembers.map((member) => {
              const isYou = currentUser?.email === member.email;
              const isOwner = member.role === 'owner';

              return (
                <div 
                  key={member.id} 
                  className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs transition hover:border-slate-300"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold border ${
                        isOwner 
                          ? 'bg-amber-50 text-amber-700 border-amber-200' 
                          : 'bg-blue-50 text-blue-700 border-blue-200'
                      }`}>
                        {member.name?.charAt(0).toUpperCase()}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-slate-900">{member.name}</h3>
                          {isYou && (
                            <span className="inline-flex items-center gap-1 text-[9px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                              YOU
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 font-medium">{member.email}</p>
                      </div>
                    </div>

                    <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase ${
                      isOwner 
                        ? 'border-amber-200 bg-amber-50 text-amber-700' 
                        : member.role === 'admin'
                        ? 'border-blue-200 bg-blue-50 text-blue-700'
                        : 'border-slate-200 bg-slate-50 text-slate-600'
                    }`}>
                      {isOwner && <Crown className="h-3 w-3 text-amber-500" />}
                      {member.role}
                    </span>
                  </div>

                  {/* Actions & Joining Info */}
                  <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
                    <span className="text-slate-400 font-medium">
                      Joined {new Date(member.invited_at).toLocaleDateString(undefined, { month: 'short', year: 'numeric'})}
                    </span>

                    {(!isOwner && !isYou) && (
                      <div className="flex items-center gap-2">
                        <select 
                          value={member.role}
                          onChange={(e) => handleUpdateRole(member.user_id, e.target.value as any)}
                          className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-bold text-slate-700 outline-none"
                        >
                          <option value="member">Member</option>
                          <option value="admin">Admin</option>
                        </select>
                        <button 
                          onClick={() => handleRemoveMember(member.user_id, member.name)}
                          className="rounded-lg p-1.5 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ================= RIGHT COLUMN: FIELD CREW ================= */}
        <div className="space-y-4">
          <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs">
            <div>
              <div className="flex items-center gap-2">
                <HardHat className="h-4 w-4 text-slate-700" />
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                  Field Crew ({savedStaff.length})
                </h2>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Dispatch assignees only (No dashboard login).
              </p>
            </div>
            <button
              onClick={() => setShowAddStaffModal(true)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-900 px-3.5 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-slate-800 active:scale-95"
            >
              <UserCircle2 className="h-4 w-4" />
              Add Crew
            </button>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs space-y-3">
            <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-3 text-xs text-blue-900 flex items-start gap-2">
              <Info className="h-4 w-4 shrink-0 text-blue-600 mt-0.5" />
              <span>Field crew members do not receive invitations or logins. They appear as options in job scheduling and dispatch dropdowns.</span>
            </div>

            {savedStaff.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {savedStaff.map((s) => (
                  <div key={s.name} className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600 font-bold text-xs">
                        {s.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-800">{s.name}</p>
                        <p className="text-[10px] text-slate-400 font-medium">Assignable to jobs</p>
                      </div>
                    </div>
                    <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-500">
                      No Login
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center border border-dashed border-slate-200 rounded-xl">
                <p className="text-xs font-medium text-slate-400">No field crew added yet.</p>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* --- BOOKING CAPACITY SETTING --- */}
      {showCapacitySetting && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs mt-6">
          <div className="flex items-center gap-2 mb-1">
            <CalendarClock className="h-4 w-4 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
              Booking Capacity & Slot Allocation
            </h3>
          </div>
          <p className="text-xs text-slate-500 max-w-2xl mb-4">
            Total staff capacity is calculated using combined App Users ({teamMembers.length}) and Field Crew ({savedStaff.length}).
          </p>

          <div className="inline-flex items-center gap-4 rounded-xl border border-slate-100 bg-slate-50 p-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-base font-bold text-slate-900 shadow-2xs">
              {Math.max(1, Math.floor((teamMembers.length + savedStaff.length) / 2))}
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800">Concurrent Booking Slots</p>
              <p className="text-[11px] text-slate-400">Maximum overlapping appointments on public booking pages.</p>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL: ADD FIELD CREW (NO LOGIN) --- */}
      {showAddStaffModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs"
          onClick={() => setShowAddStaffModal(false)}
        >
          <div 
            className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <HardHat className="h-5 w-5 text-slate-800" />
                <h3 className="text-base font-bold text-slate-900">Add Field Crew Member</h3>
              </div>
              <button onClick={() => setShowAddStaffModal(false)} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Crew / Member Name</label>
                <input
                  autoFocus
                  type="text"
                  value={newStaffName}
                  onChange={(e) => setNewStaffName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddStaff()}
                  placeholder="e.g. Mike, Electric Crew B"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-3 text-xs font-semibold text-slate-800 outline-none focus:border-blue-500 focus:bg-white"
                />
              </div>

              <button
                onClick={handleAddStaff}
                disabled={staffSaving}
                className="w-full rounded-xl bg-slate-900 py-2.5 text-xs font-bold text-white transition hover:bg-slate-800 disabled:opacity-50"
              >
                {staffSaving ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : 'Save Crew Member'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL: INVITE APP USER --- */}
      {showInviteModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs"
          onClick={() => setShowInviteModal(false)}
        >
          <div 
            className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-blue-600" />
                <h3 className="text-base font-bold text-slate-900">Invite App User</h3>
              </div>
              <button onClick={() => setShowInviteModal(false)} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                <input 
                  autoFocus 
                  type="text" 
                  value={formData.name} 
                  onChange={(e) => setFormData({...formData, name: e.target.value})} 
                  placeholder="e.g. Sarah Connor" 
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 px-3 text-xs font-semibold text-slate-800 outline-none focus:border-blue-500 focus:bg-white" 
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
                <input 
                  type="email" 
                  value={formData.email} 
                  onChange={(e) => setFormData({...formData, email: e.target.value})} 
                  placeholder="name@company.com" 
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 px-3 text-xs font-semibold text-slate-800 outline-none focus:border-blue-500 focus:bg-white" 
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Role Permission</label>
                <select 
                  value={formData.role} 
                  onChange={(e) => setFormData({...formData, role: e.target.value as any})}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 px-3 text-xs font-semibold text-slate-800 outline-none focus:border-blue-500 focus:bg-white"
                >
                  <option value="member">Member (Standard Access)</option>
                  <option value="admin">Admin (Full Operational Access)</option>
                </select>
              </div>

              <button 
                onClick={handleSendInvite} 
                disabled={saving} 
                className="w-full rounded-xl bg-blue-600 py-2.5 text-xs font-bold text-white transition hover:bg-blue-700 disabled:opacity-50 mt-2"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : 'Send Invite'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}