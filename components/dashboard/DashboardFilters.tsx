'use client';

import { useState, useRef } from 'react';
import {
  Search, X, Filter, ChevronDown, LayoutGrid, List,
  Calendar, Lock, Sun, Moon, Sparkles, Clock, DollarSign, Loader2,
} from 'lucide-react';
import { can, type PlanTier } from '@/lib/permissions';

type StatusOption = { value: string; label: string; color: string; emoji?: string };
type ViewMode = 'cards' | 'table' | 'calendar';
type TimeFilter = 'today' | 'week' | 'month' | 'all';

type DashboardFiltersProps = {
  // State values
  searchQuery: string;
  filterStatus: string;
  timeFilter: TimeFilter;
  filterCategory: string;
  filterAssignee: string;
  filterPayment: string;
  startDate: string;
  endDate: string;
  currentView: ViewMode;
  isDark: boolean;
  planTier: PlanTier;
  isSearching: boolean;
  hasActiveFilters: boolean;
  serverStatusCounts: Record<string, number>;

  // Data
  statusOptions: StatusOption[];
  teamMembers: any[];
  categories: string[];

  // Setters
  setSearchQuery: (v: string) => void;
  setFilterStatus: (v: string) => void;
  setTimeFilter: (v: TimeFilter) => void;
  setFilterCategory: (v: string) => void;
  setFilterAssignee: (v: string) => void;
  setFilterPayment: (v: string) => void;
  setStartDate: (v: string) => void;
  setEndDate: (v: string) => void;
  setCurrentView: (v: ViewMode) => void;
  setIsDark: (fn: (v: boolean) => boolean) => void;
  setIsSearching: (v: boolean) => void;

  // Actions
  fetchLeads: (page: number, silent: boolean, overrides?: Record<string, string>) => Promise<void>;
  clearFilters: () => void;
  onLockedFeature: (feature: string) => void;
};

export default function DashboardFilters({
  searchQuery, filterStatus, timeFilter, filterCategory, filterAssignee,
  filterPayment, startDate, endDate, currentView, isDark, planTier,
  isSearching, hasActiveFilters, serverStatusCounts,
  statusOptions, teamMembers, categories,
  setSearchQuery, setFilterStatus, setTimeFilter, setFilterCategory,
  setFilterAssignee, setFilterPayment, setStartDate, setEndDate,
  setCurrentView, setIsDark, setIsSearching,
  fetchLeads, clearFilters, onLockedFeature,
}: DashboardFiltersProps) {
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  return (
    <section aria-label="Search and filter leads" className="mb-8 flex flex-col gap-2">
      {/* Row 1: Search + View Switcher + Theme */}
      <div className="flex items-center gap-2">
        {/* Expandable Search */}
        <div className="flex items-center flex-1 min-w-0">
          {searchQuery ? (
            <div className="relative flex-1">
              <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? 'text-white/30' : 'text-slate-400'}`} />
              <input
                autoFocus
                type="search"
                placeholder="Search..."
                value={searchQuery}
                onChange={e => {
                  const val = e.target.value;
                  setSearchQuery(val);
                  if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
                  if (val.trim().length >= 2) {
                    setIsSearching(true);
                    searchTimeoutRef.current = setTimeout(async () => {
                      await fetchLeads(1, true, { search: val.trim() });
                      setIsSearching(false);
                    }, 400);
                  } else if (val.trim() === '') {
                    fetchLeads(1, true, { search: '' });
                  }
                }}
                className={`w-full pl-9 pr-8 py-2.5 rounded-xl text-sm font-bold outline-none border transition-all ${
                  isDark ? 'bg-[#0A0C14] border-white/10 text-white placeholder-white/20' : 'bg-white border-slate-200 text-slate-900 shadow-sm'
                }`}
              />
              <button onClick={() => { setSearchQuery(''); fetchLeads(1, true, { search: '' }); }}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-red-400">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setSearchQuery(' ')}
              className={`p-2.5 rounded-xl border transition-all shrink-0 ${
                isDark ? 'bg-[#0A0C14] border-white/5 text-white/40 hover:text-white' : 'bg-white border-slate-200 text-slate-500 hover:text-slate-900 shadow-sm'
              }`}
            >
              {isSearching ? <Loader2 className="w-4 h-4 animate-spin text-blue-500" /> : <Search className="w-4 h-4" />}
            </button>
          )}
        </div>

        {/* View Switcher */}
        <div
          data-tour="view-switcher"
          className={`flex p-1 rounded-xl border shrink-0 ${isDark ? 'bg-[#0A0C14] border-white/5' : 'bg-white border-slate-200 shadow-sm'}`}
        >
          {[
            { id: 'cards', icon: LayoutGrid, feature: null },
            { id: 'table', icon: List, feature: 'table_view' as const },
            { id: 'calendar', icon: Calendar, feature: 'calendar_view' as const },
          ].map((v) => {
            const locked = v.feature && !can(planTier, v.feature);
            return (
              <button
                key={v.id}
                onClick={() => locked ? onLockedFeature(v.feature!) : setCurrentView(v.id as ViewMode)}
                className={`p-2 rounded-lg transition-all relative ${
                  locked
                    ? 'text-slate-600 cursor-not-allowed opacity-40'
                    : currentView === v.id
                      ? 'bg-blue-500 text-white shadow-lg'
                      : isDark ? 'text-white/30 hover:text-white' : 'text-slate-400 hover:text-slate-900'
                }`}
              >
                <v.icon className="w-4 h-4" />
                {locked && <Lock className="w-2 h-2 absolute -top-0.5 -right-0.5 text-slate-500" />}
              </button>
            );
          })}
        </div>

        {/* Theme Toggle */}
        <button
          data-tour="theme-toggle"
          onClick={() => setIsDark(v => !v)}
          className={`p-2.5 rounded-xl border transition-all active:scale-95 shrink-0 ${
            isDark ? 'bg-[#0A0C14] border-white/5 text-amber-400' : 'bg-white border-slate-200 text-slate-600 shadow-sm'
          }`}
        >
          {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
      </div>

      {/* Row 2: Filter Pills */}
      <div
        data-tour="filters"
        className="flex items-center gap-2 overflow-x-auto no-scrollbar"
      >
        {/* Advanced Filter Launcher */}
        <button
          onClick={() => setShowAdvancedFilters(v => !v)}
          className={`shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
            showAdvancedFilters || hasActiveFilters
              ? 'bg-blue-600 text-white border-blue-500 shadow-lg shadow-blue-600/20'
              : isDark ? 'bg-[#0A0C14] border-white/10 text-white/60' : 'bg-white border-slate-200 text-slate-600 shadow-sm'
          }`}
        >
          <Filter className="w-3.5 h-3.5 stroke-[3px]" />
          Filters
          <ChevronDown className={`w-3 h-3 transition-transform ${showAdvancedFilters ? 'rotate-180' : ''}`} />
        </button>

        <div className={`w-px h-4 mx-1 shrink-0 ${isDark ? 'bg-white/10' : 'bg-slate-200'}`} />

        {/* Today */}
        <button
          onClick={() => {
            const isActive = timeFilter === 'today' && filterStatus === 'scheduled';
            setTimeFilter(isActive ? 'all' : 'today');
            setFilterStatus(isActive ? 'all' : 'scheduled');
          }}
          className={`shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
            timeFilter === 'today' && filterStatus === 'scheduled'
              ? 'bg-emerald-600 text-white border-emerald-600'
              : isDark ? 'bg-white/5 border-white/5 text-white/40' : 'bg-white border-slate-200 text-slate-500'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          Today
        </button>

        {/* Unpaid */}
        <button
          onClick={() => setFilterPayment(filterPayment === 'unpaid' ? 'all' : 'unpaid')}
          className={`shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all active:scale-95 ${
            filterPayment === 'unpaid'
              ? 'bg-amber-500 text-white border-amber-400 shadow-lg shadow-amber-500/20'
              : isDark ? 'bg-white/5 border-white/5 text-white/40' : 'bg-white border-slate-200 text-slate-500'
          }`}
        >
          <DollarSign className="w-3.5 h-3.5" />
          Unpaid
        </button>

        {/* New */}
        <button
          onClick={() => setFilterStatus(filterStatus === 'new' ? 'all' : 'new')}
          className={`shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
            filterStatus === 'new'
              ? 'bg-blue-600 text-white border-blue-500 shadow-lg'
              : isDark ? 'bg-white/5 border-white/5 text-white/40' : 'bg-white border-slate-200 text-slate-500'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          New {(serverStatusCounts['new'] || 0) > 0 && <span className="opacity-70">({serverStatusCounts['new']})</span>}
        </button>

        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="shrink-0 p-2.5 rounded-xl bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white transition-all"
          >
            <X className="w-4 h-4 stroke-[3px]" />
          </button>
        )}
      </div>

      {/* Advanced Filter Dropdown */}
      <div className="relative">
        {showAdvancedFilters && (
          <div>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setShowAdvancedFilters(false)}
            />

            {/* Desktop Dropdown */}
            <div
              className="hidden sm:block absolute top-full left-0 mt-2 z-[200] w-[380px] rounded-2xl border shadow-2xl p-5"
              style={{
                background: isDark ? '#0D0F17' : '#ffffff',
                border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #e2e8f0',
                boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
              }}
            >
              <div className="grid grid-cols-2 gap-6 mb-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">Assignee</label>
                  <select
                    value={filterAssignee}
                    onChange={e => setFilterAssignee(e.target.value)}
                    className={`w-full rounded-xl px-4 py-3 text-xs font-bold outline-none border transition-all appearance-none cursor-pointer ${
                      isDark ? 'bg-white/5 border-white/10 text-white hover:border-blue-500/50' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  >
                    <option value="all">Everyone</option>
                    <option value="unassigned">Unassigned</option>
                    {teamMembers.map(m => <option key={m.name} value={m.name}>{m.name}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">Category</label>
                  <select
                    value={filterCategory}
                    onChange={e => setFilterCategory(e.target.value)}
                    className={`w-full rounded-xl px-4 py-3 text-xs font-bold outline-none border transition-all appearance-none cursor-pointer ${
                      isDark ? 'bg-white/5 border-white/10 text-white hover:border-blue-500/50' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  >
                    <option value="all">All Sectors</option>
                    {categories.map(c => (
                      <option key={c} value={c}>{String(c).replace(/_/g, ' ').toUpperCase()}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6 mb-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={e => setStartDate(e.target.value)}
                    className={`w-full rounded-xl px-4 py-3 text-xs font-bold outline-none border transition-all ${
                      isDark ? 'bg-white/5 border-white/10 text-white invert-calendar' : 'bg-slate-50 border-slate-200'
                    }`}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">End Date</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={e => setEndDate(e.target.value)}
                    className={`w-full rounded-xl px-4 py-3 text-xs font-bold outline-none border transition-all ${
                      isDark ? 'bg-white/5 border-white/10 text-white invert-calendar' : 'bg-slate-50 border-slate-200'
                    }`}
                  />
                </div>
              </div>

              <div className="mb-8 space-y-3">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">Lifecycle Status</label>
                <div className="flex flex-wrap gap-2">
                  {statusOptions.map(s => (
                    <button
                      key={s.value}
                      onClick={() => setFilterStatus(filterStatus === s.value ? 'all' : s.value)}
                      className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                        filterStatus === s.value
                          ? 'bg-blue-600 text-white border-blue-500 shadow-lg shadow-blue-600/30'
                          : isDark ? 'bg-white/5 border-white/5 text-white/40 hover:text-white hover:bg-white/10' : 'bg-slate-100 border-slate-200 text-slate-500'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-4 pt-6 border-t border-white/5">
                <button
                  onClick={() => { clearFilters(); setShowAdvancedFilters(false); }}
                  className="flex-1 py-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] text-red-400 bg-red-500/5 hover:bg-red-500/10 transition-all"
                >
                  Reset Engine
                </button>
                <button
                  onClick={() => setShowAdvancedFilters(false)}
                  className="flex-1 py-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] bg-blue-600 text-white hover:bg-blue-500 shadow-xl shadow-blue-600/20 transition-all"
                >
                  Apply Changes
                </button>
              </div>
            </div>

            {/* Mobile Drawer */}
            <div className="sm:hidden fixed inset-0 z-[300] flex flex-col justify-end">
              <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={() => setShowAdvancedFilters(false)}
              />
              <div className={`relative rounded-t-[3rem] p-8 pb-12 max-h-[90vh] overflow-y-auto shadow-[0_-24px_48px_rgba(0,0,0,0.6)] ${
                isDark ? 'bg-[#0D0F17] border-t border-white/10' : 'bg-white border-t border-slate-200'
              }`}>
                <div className="w-16 h-1.5 bg-blue-500/20 rounded-full mx-auto mb-10" />

                <div className="space-y-10">
                  <div className="space-y-4">
                    <label className="text-[11px] font-black uppercase tracking-[0.2em] text-blue-500">Target Segment</label>
                    <div className="grid grid-cols-1 gap-3">
                      <select
                        value={filterAssignee}
                        onChange={e => setFilterAssignee(e.target.value)}
                        className={`w-full rounded-2xl px-5 py-4 text-base font-bold border outline-none appearance-none ${
                          isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                        }`}
                      >
                        <option value="all">Everyone</option>
                        {teamMembers.map(m => <option key={m.name} value={m.name}>{m.name}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="text-[11px] font-black uppercase tracking-[0.2em] text-blue-500">Timeline</label>
                    <div className="grid grid-cols-2 gap-4">
                      <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
                        className={`w-full rounded-2xl px-5 py-4 text-sm font-bold border outline-none ${isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-50 border-slate-200'}`} />
                      <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)}
                        className={`w-full rounded-2xl px-5 py-4 text-sm font-bold border outline-none ${isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-50 border-slate-200'}`} />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 mt-12">
                  <button
                    onClick={() => setShowAdvancedFilters(false)}
                    className="w-full py-5 rounded-[1.5rem] text-[12px] font-black uppercase tracking-[0.2em] bg-blue-500 text-white shadow-2xl shadow-blue-600/40"
                  >
                    Apply Filters
                  </button>
                  <button
                    onClick={() => { clearFilters(); setShowAdvancedFilters(false); }}
                    className="w-full py-4 rounded-[1.5rem] text-[11px] font-black uppercase tracking-[0.2em] text-slate-500"
                  >
                    Reset All
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}