'use client';

import { useState, useRef } from 'react';
import {
  Search, X, Filter, ChevronDown, LayoutGrid, List,
  Calendar, Lock, Sun, Moon, Clock, DollarSign, Loader2, User, Tag
} from 'lucide-react';
import { can, type PlanTier } from '@/lib/permissions';

type StatusOption = { value: string; label: string; color: string; emoji?: string };
type ViewMode = 'cards' | 'table' | 'calendar';
type TimeFilter = 'today' | 'week' | 'month' | 'all' | 'scheduled_today';

type DashboardFiltersProps = {
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
  statusOptions: StatusOption[];
  teamMembers: any[];
  categories: string[];
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

  const isScheduledTodayActive = timeFilter === 'scheduled_today';

  return (
    <section aria-label="Search and filter leads" className="mb-5 flex flex-col gap-2.5">

      {/* ROW 1: PRIMARY ACTIONS */}
      <div className="flex items-center gap-1.5">
        {/* Search Bar */}
        <div className="relative flex-1 group">
          <Search className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 transition-colors ${
            isDark ? 'text-white/20 group-focus-within:text-blue-400' : 'text-slate-400 group-focus-within:text-blue-500'
          }`} />
          <input
            type="search"
            placeholder="Search leads..."
            value={searchQuery === ' ' ? '' : searchQuery}
            onChange={e => {
              const val = e.target.value;
              setSearchQuery(val);
              if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
              setIsSearching(true);
              searchTimeoutRef.current = setTimeout(async () => {
                await fetchLeads(1, true, { search: val.trim() });
                setIsSearching(false);
              }, 400);
            }}
            className={`w-full pl-9 pr-9 py-2.5 rounded-xl text-sm font-medium outline-none border transition-all ${
              isDark
                ? 'bg-[#0A0C14] border-white/10 text-white placeholder-white/25 focus:border-blue-500/40'
: 'bg-white border-slate-300 text-slate-900 shadow-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-500/5'
            }`}
          />
          {isSearching && (
            <Loader2 className="absolute right-9 top-1/2 -translate-y-1/2 w-3 h-3 animate-spin text-blue-500" />
          )}
          {searchQuery.trim() !== '' && (
            <button
              onClick={() => { setSearchQuery(''); fetchLeads(1, true, { search: '' }); }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 hover:bg-red-500/10 rounded-md text-slate-400 hover:text-red-500 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* View Switcher + Theme combined */}
<div className={`flex items-center p-0.5 rounded-xl border shrink-0 ${isDark ? 'bg-[#0A0C14] border-white/10' : 'bg-white border-slate-300 shadow-sm'}`}>          {[
            { id: 'cards', icon: LayoutGrid, feature: null },
            { id: 'table', icon: List, feature: 'table_view' },
            { id: 'calendar', icon: Calendar, feature: 'calendar_view' },
          ].map((v) => {
            const locked = v.feature && !can(planTier, v.feature as any);
            const active = currentView === v.id;
            return (
              <button
                key={v.id}
                onClick={() => locked ? onLockedFeature(v.feature!) : setCurrentView(v.id as ViewMode)}
                className={`p-1.5 rounded-lg transition-all relative ${
                  active
                    ? 'bg-blue-600 text-white'
                    : isDark ? 'text-white/30 hover:text-white' : 'text-slate-400 hover:text-slate-900'
                }`}
              >
                <v.icon className="w-3.5 h-3.5" />
                {locked && <Lock className="w-2 h-2 absolute -top-0.5 -right-0.5 text-amber-500" />}
              </button>
            );
          })}
          <div className={`w-px h-4 mx-0.5 ${isDark ? 'bg-white/10' : 'bg-slate-200'}`} />
          <button
            onClick={() => setIsDark(v => !v)}
            className={`p-1.5 rounded-lg transition-all ${isDark ? 'text-amber-400' : 'text-slate-400'}`}
          >
            {isDark ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* ROW 2: QUICK FILTERS */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
        <button
          onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
          className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
            showAdvancedFilters || hasActiveFilters
              ? 'bg-blue-600 text-white border-blue-500'
: isDark ? 'bg-[#0A0C14] border-white/10 text-white/60' : 'bg-white border-slate-300 text-slate-600 shadow-sm'          }`}
        >
          <Filter className="w-3 h-3" />
          Filters
          <ChevronDown className={`w-2.5 h-2.5 transition-transform ${showAdvancedFilters ? 'rotate-180' : ''}`} />
        </button>

        <div className={`w-px h-4 mx-0.5 shrink-0 ${isDark ? 'bg-white/10' : 'bg-slate-200'}`} />

        <button
onClick={() => setTimeFilter(isScheduledTodayActive ? 'all' : 'scheduled_today')}
className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
isScheduledTodayActive
              ? 'bg-emerald-600 text-white border-emerald-500'
: isDark ? 'bg-white/10 border-white/10 text-white/80' : 'bg-white border-slate-400 text-slate-800 shadow-sm'
}`}
>
          <Clock className="w-3 h-3" />
          <span className="hidden sm:inline">Scheduled today</span>
          <span className="sm:hidden">Today</span>
        </button>

        <button
onClick={() => setFilterPayment(filterPayment === 'unpaid' ? 'all' : 'unpaid')}
className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
filterPayment === 'unpaid'
              ? 'bg-amber-500 text-white border-amber-400'
: isDark ? 'bg-white/10 border-white/10 text-white/80' : 'bg-white border-slate-400 text-slate-800 shadow-sm'
}`}
>
          <DollarSign className="w-3 h-3" />
          Unpaid
        </button>

        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="shrink-0 p-1.5 rounded-lg bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white transition-all"
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* ADVANCED FILTERS */}
      {showAdvancedFilters && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setShowAdvancedFilters(false)} />

          {/* Desktop Dropdown */}
          <div className="relative z-[100] hidden sm:block">
            <div className={`absolute top-0 left-0 w-[380px] p-5 rounded-2xl border shadow-2xl animate-in fade-in zoom-in-95 duration-200 ${
isDark ? 'bg-[#0D0F17] border-white/10' : 'bg-white border-slate-300 shadow-xl'
            }`}>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="space-y-1.5">
                  <label className="flex items-center gap-1.5 text-[11px] font-medium text-blue-500">
                    <User className="w-3 h-3" /> Assignee
                  </label>
                  <select
                    value={filterAssignee}
                    onChange={e => setFilterAssignee(e.target.value)}
                    className={`w-full rounded-lg px-3 py-2 text-xs font-medium border outline-none appearance-none cursor-pointer ${
                      isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  >
                    <option value="all">Everyone</option>
                    <option value="unassigned">Unassigned</option>
                    {teamMembers.map(m => <option key={m.name} value={m.name}>{m.name}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="flex items-center gap-1.5 text-[11px] font-medium text-blue-500">
                    <Tag className="w-3 h-3" /> Category
                  </label>
                  <select
                    value={filterCategory}
                    onChange={e => setFilterCategory(e.target.value)}
                    className={`w-full rounded-lg px-3 py-2 text-xs font-medium border outline-none appearance-none cursor-pointer ${
                      isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  >
                    <option value="all">All categories</option>
                    {categories.map(c => <option key={c} value={c}>{String(c).replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-medium text-blue-500">From</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={e => setStartDate(e.target.value)}
                    className={`w-full rounded-lg px-3 py-2 text-xs font-medium outline-none border ${
                      isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-medium text-blue-500">To</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={e => setEndDate(e.target.value)}
                    className={`w-full rounded-lg px-3 py-2 text-xs font-medium outline-none border ${
                      isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  />
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <label className="text-[11px] font-medium text-blue-500">Status</label>
                <div className="flex flex-wrap gap-1.5">
                  {statusOptions.map(s => (
                    <button
                      key={s.value}
                      onClick={() => setFilterStatus(filterStatus === s.value ? 'all' : s.value)}
                      className={`px-2.5 py-1.5 rounded-md text-[11px] font-medium border transition-all ${
                        filterStatus === s.value
                          ? 'bg-blue-600 border-blue-500 text-white'
                          : isDark ? 'bg-white/5 border-white/5 text-white/50 hover:text-white' : 'bg-slate-100 border-slate-200 text-slate-600'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className={`flex gap-2 pt-4 border-t ${isDark ? 'border-white/5' : 'border-slate-100'}`}>
                <button
                  onClick={() => { clearFilters(); setShowAdvancedFilters(false); }}
                  className="flex-1 py-2.5 rounded-lg text-xs font-medium text-red-400 bg-red-400/5 hover:bg-red-400/10 transition-all"
                >
                  Clear all
                </button>
                <button
                  onClick={() => setShowAdvancedFilters(false)}
                  className="flex-1 py-2.5 rounded-lg text-xs font-medium bg-blue-600 text-white hover:bg-blue-500 transition-all"
                >
                  Apply
                </button>
              </div>
            </div>
          </div>

          {/* Mobile Bottom Drawer */}
          <div className="sm:hidden fixed inset-0 z-[300] flex flex-col justify-end">
            <div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setShowAdvancedFilters(false)}
            />
            <div className={`relative rounded-t-2xl px-5 pt-5 pb-8 max-h-[85vh] overflow-y-auto ${
isDark ? 'bg-[#0D0F17] border-t border-white/10' : 'bg-white border-t border-slate-300'
            }`}>
              <div className="w-10 h-1 bg-slate-300/30 rounded-full mx-auto mb-5" />

              <div className="space-y-5">
                <div className="space-y-1.5">
                  <label className="flex items-center gap-1.5 text-xs font-medium text-blue-500">
                    <User className="w-3 h-3" /> Assignee
                  </label>
                  <select
                    value={filterAssignee}
                    onChange={e => setFilterAssignee(e.target.value)}
                    className={`w-full rounded-lg px-3 py-2.5 text-sm font-medium border outline-none appearance-none ${
                      isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  >
                    <option value="all">Everyone</option>
                    <option value="unassigned">Unassigned</option>
                    {teamMembers.map(m => <option key={m.name} value={m.name}>{m.name}</option>)}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="flex items-center gap-1.5 text-xs font-medium text-blue-500">
                    <Tag className="w-3 h-3" /> Category
                  </label>
                  <select
                    value={filterCategory}
                    onChange={e => setFilterCategory(e.target.value)}
                    className={`w-full rounded-lg px-3 py-2.5 text-sm font-medium border outline-none appearance-none ${
                      isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  >
                    <option value="all">All categories</option>
                    {categories.map(c => <option key={c} value={c}>{String(c).replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</option>)}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-blue-500">Date range</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="date"
                      value={startDate}
                      onChange={e => setStartDate(e.target.value)}
                      className={`w-full rounded-lg px-3 py-2.5 text-sm font-medium border outline-none ${
                        isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                      }`}
                    />
                    <input
                      type="date"
                      value={endDate}
                      onChange={e => setEndDate(e.target.value)}
                      className={`w-full rounded-lg px-3 py-2.5 text-sm font-medium border outline-none ${
                        isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                      }`}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-blue-500">Status</label>
                  <div className="flex flex-wrap gap-1.5">
                    {statusOptions.map(s => (
                      <button
                        key={s.value}
                        onClick={() => setFilterStatus(filterStatus === s.value ? 'all' : s.value)}
                        className={`px-3 py-2 rounded-md text-xs font-medium border transition-all ${
                          filterStatus === s.value
                            ? 'bg-blue-600 border-blue-500 text-white'
                            : isDark ? 'bg-white/5 border-white/5 text-white/50' : 'bg-slate-100 border-slate-200 text-slate-600'
                        }`}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 mt-6">
                <button
                  onClick={() => { clearFilters(); setShowAdvancedFilters(false); }}
                  className="py-3 rounded-lg text-xs font-medium text-red-400 bg-red-400/5 hover:bg-red-400/10 transition-all"
                >
                  Clear all
                </button>
                <button
                  onClick={() => setShowAdvancedFilters(false)}
                  className="py-3 rounded-lg text-xs font-medium bg-blue-600 text-white hover:bg-blue-500 transition-all"
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </section>
  );
}