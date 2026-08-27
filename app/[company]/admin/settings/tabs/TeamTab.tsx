'use client';

import { useState, useEffect } from 'react';
import { 
  Users, UserPlus, Trash2, Crown, X, 
  CheckCircle2, Loader2, Search, AlertCircle, 
  UserCircle2, CalendarClock, HardHat, Info, ChevronRight
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
    role: 'member' as 'admin' | 'member',
  });
  
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [, setEmailError] = useState(false);

  const showCapacitySetting = getSchedulingConfig(company?.business_type).showEndTime;

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
    if (savedStaff.some(s => s.name.toLowerCase() === name.toLowerCase()) || teamMembers.some(m => m.name.toLowerCase() === name.toLowerCase())) {
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
        setFormData({ name: '', email: '', role: 'member' });
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

  const filteredStaff = savedStaff.filter(s =>
    s.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 font-sans">
        <Loader2 className="h-6 w-6 text-slate-900 animate-spin" />
        <p className="mt-3 text-xs font-mono font-bold uppercase tracking-wider text-slate-400">Syncing Team...</p>
      </div>
    );
  }

  return (
    <div className="w-full font-sans text-slate-900 antialiased">
      <div className="w-full space-y-6">

        {/* HEADER & SEARCH ROW */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              Team & Staff Management
            </h1>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Manage dashboard credentials and job assignees for <span className="font-semibold text-slate-800">{company?.name}</span>.
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <input 
              type="text"
              placeholder="Search team or crew..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white py-1.5 pl-8 pr-3 text-xs font-medium text-slate-800 outline-none transition focus:border-slate-400 shadow-xs placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* ALERTS */}
        {(success || error) && (
          <div className={`flex items-center justify-between rounded-lg border px-3.5 py-2.5 shadow-xs transition-all ${
            success ? 'border-emerald-200 bg-emerald-50/80 text-emerald-900' : 'border-rose-200 bg-rose-50/80 text-rose-900'
          }`}>
            <div className="flex items-center gap-2">
              {success ? <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" /> : <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />}
              <span className="text-xs font-semibold">{success || error}</span>
            </div>
            <button onClick={() => { setSuccess(''); setError(''); }} className="rounded-md p-1 transition hover:bg-black/5">
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        {/* 2-COLUMN MAIN CONTENT GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          
          {/* APP USERS TABLE CONTAINER */}
          <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
            {/* Table Top Banner */}
            <div className="px-5 py-3 bg-slate-50/80 border-b border-slate-200/80 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-slate-700" />
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  App Users ({teamMembers.length})
                </span>
              </div>
              <button
                onClick={() => setShowInviteModal(true)}
                className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-2.5 py-1.5 text-xs font-semibold text-white shadow-xs transition hover:bg-slate-800"
              >
                <UserPlus className="h-3.5 w-3.5" />
                Invite User
              </button>
            </div>

            {/* List */}
            <div className="divide-y divide-slate-100">
              {filteredMembers.length > 0 ? (
                filteredMembers.map((member) => {
                  const isYou = currentUser?.email === member.email;
                  const isOwner = member.role === 'owner';

                  return (
                    <div 
                      key={member.id} 
                      className="flex items-center justify-between px-5 py-3.5 hover:bg-slate-50/60 transition-colors group"
                    >
                      <div className="flex items-center gap-3 min-w-0 pr-2">
                        <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded border font-mono text-xs font-bold ${
                          isOwner 
                            ? 'bg-amber-50 text-amber-800 border-amber-200' 
                            : 'bg-slate-50 text-slate-700 border-slate-200'
                        }`}>
                          {member.name?.charAt(0).toUpperCase()}
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <p className="text-xs sm:text-sm font-semibold text-slate-900 truncate">
                              {member.name}
                            </p>
                            {isYou && (
                              <span className="text-[9px] font-mono font-bold text-slate-600 bg-slate-100 px-1 py-0.2 rounded border border-slate-200">
                                YOU
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 truncate">{member.email}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {(!isOwner && !isYou) ? (
                          <div className="flex items-center gap-1.5">
                            <select 
                              value={member.role}
                              onChange={(e) => handleUpdateRole(member.user_id, e.target.value as any)}
                              className="rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] font-bold text-slate-700 outline-none hover:border-slate-300"
                            >
                              <option value="member">Member</option>
                              <option value="admin">Admin</option>
                            </select>
                            <button 
                              onClick={() => handleRemoveMember(member.user_id, member.name)}
                              className="rounded p-1 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ) : (
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                            isOwner 
                              ? 'text-amber-800 bg-amber-50 border-amber-200' 
                              : 'text-slate-600 bg-slate-50 border-slate-200'
                          }`}>
                            {isOwner && <Crown className="inline h-3 w-3 mr-1 text-amber-600 -mt-0.5" />}
                            {member.role}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="py-8 text-center text-xs text-slate-400 font-medium">
                  No matching app users found.
                </div>
              )}
            </div>
          </div>

          {/* FIELD CREW TABLE CONTAINER */}
          <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
            {/* Table Top Banner */}
            <div className="px-5 py-3 bg-slate-50/80 border-b border-slate-200/80 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <HardHat className="h-4 w-4 text-slate-700" />
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Field Crew ({savedStaff.length})
                </span>
              </div>
              <button
                onClick={() => setShowAddStaffModal(true)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-800 shadow-2xs hover:bg-slate-50 transition"
              >
                <UserCircle2 className="h-3.5 w-3.5" />
                Add Crew
              </button>
            </div>

            {/* Content Section */}
            <div>
              <div className="p-3 bg-slate-50/50 border-b border-slate-100 text-xs text-slate-500 flex items-start gap-2">
                <Info className="h-3.5 w-3.5 shrink-0 text-slate-400 mt-0.5" />
                <span>Field crew appear as options in job scheduling and dispatch. They do not get logins.</span>
              </div>

              <div className="divide-y divide-slate-100">
                {filteredStaff.length > 0 ? (
                  filteredStaff.map((s) => (
                    <div key={s.name} className="flex items-center justify-between px-5 py-3 hover:bg-slate-50/60 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="flex h-7 w-7 items-center justify-center rounded border border-slate-200 bg-slate-50 text-slate-600 font-mono text-xs font-bold">
                          {s.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-xs sm:text-sm font-semibold text-slate-900">{s.name}</p>
                          <p className="text-[10px] text-slate-400 font-mono">Assignable to jobs</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border text-slate-500 bg-slate-100 border-slate-200">
                        No Login
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="py-8 text-center text-xs text-slate-400 font-medium">
                    No field crew members added yet.
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>

        {/* BOOKING CAPACITY CARD */}
        {showCapacitySetting && (
          <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <CalendarClock className="h-4 w-4 text-slate-700" />
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Booking Capacity & Slot Allocation
                </h3>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-1 max-w-xl">
                Calculated using combined App Users ({teamMembers.length}) and Field Crew ({savedStaff.length}).
              </p>
            </div>

            <div className="flex items-center gap-3 bg-slate-50 px-3.5 py-2 rounded-lg border border-slate-200/80 shrink-0">
              <div className="flex h-8 w-8 items-center justify-center rounded border border-slate-200 bg-white font-mono text-sm font-bold text-slate-900 shadow-2xs">
                {Math.max(1, Math.floor((teamMembers.length + savedStaff.length) / 2))}
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">Concurrent Booking Slots</p>
                <p className="text-[10px] font-mono text-slate-400">Max overlapping appointments</p>
              </div>
            </div>
          </div>
        )}

        {/* MODAL: ADD FIELD CREW */}
        {showAddStaffModal && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-2xs"
            onClick={() => setShowAddStaffModal(false)}
          >
            <div 
              className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-5 shadow-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <HardHat className="h-4 w-4 text-slate-800" />
                  <h3 className="text-sm font-bold text-slate-900">Add Field Crew Member</h3>
                </div>
                <button onClick={() => setShowAddStaffModal(false)} className="rounded p-1 text-slate-400 hover:bg-slate-100">
                  <X className="h-4 w-4" />
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
                    className="w-full rounded-lg border border-slate-200 bg-white py-2 px-3 text-xs font-semibold text-slate-900 outline-none focus:border-slate-400"
                  />
                </div>

                <button
                  onClick={handleAddStaff}
                  disabled={staffSaving}
                  className="w-full rounded-lg bg-slate-900 py-2 text-xs font-bold text-white transition hover:bg-slate-800 disabled:opacity-50"
                >
                  {staffSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin mx-auto" /> : 'Save Crew Member'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL: INVITE APP USER */}
        {showInviteModal && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-2xs"
            onClick={() => setShowInviteModal(false)}
          >
            <div 
              className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-5 shadow-lg space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <UserPlus className="h-4 w-4 text-slate-900" />
                  <h3 className="text-sm font-bold text-slate-900">Invite App User</h3>
                </div>
                <button onClick={() => setShowInviteModal(false)} className="rounded p-1 text-slate-400 hover:bg-slate-100">
                  <X className="h-4 w-4" />
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
                    className="w-full rounded-lg border border-slate-200 bg-white py-2 px-3 text-xs font-semibold text-slate-900 outline-none focus:border-slate-400" 
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
                  <input 
                    type="email" 
                    value={formData.email} 
                    onChange={(e) => setFormData({...formData, email: e.target.value})} 
                    placeholder="name@company.com" 
                    className="w-full rounded-xl border border-slate-200 bg-white py-2 px-3 text-xs font-semibold text-slate-900 outline-none focus:border-slate-400" 
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Role Permission</label>
                  <select 
                    value={formData.role} 
                    onChange={(e) => setFormData({...formData, role: e.target.value as any})}
                    className="w-full rounded-lg border border-slate-200 bg-white py-2 px-3 text-xs font-semibold text-slate-900 outline-none focus:border-slate-400"
                  >
                    <option value="member">Member (Standard Access)</option>
                    <option value="admin">Admin (Full Operational Access)</option>
                  </select>
                </div>

                <button 
                  onClick={handleSendInvite} 
                  disabled={saving} 
                  className="w-full rounded-lg bg-slate-900 py-2 text-xs font-bold text-white transition hover:bg-slate-800 disabled:opacity-50 mt-1"
                >
                  {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin mx-auto" /> : 'Send Invite'}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}