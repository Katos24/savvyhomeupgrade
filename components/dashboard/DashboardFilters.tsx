'use client';

import { useState, useRef } from 'react';
import {
  Search, X, Filter, ChevronDown, LayoutGrid, List,
  Calendar, Lock, Sun, Moon, Clock, DollarSign, Loader2, User, Tag
} from 'lucide-react';
import { can, type PlanTier } from '@/lib/permissions';

type StatusOption = { value: string; label: string; color: string; emoji?: string };
type ViewMode = 'cards' | 'table' | 'calendar';
type TimeFilter = 'today' | 'week' | 'month' | 'all';

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

  const isScheduledTodayActive = timeFilter === 'today' && filterStatus === 'scheduled';

  return (
    <section aria-label="Search and filter leads" className="mb-6 flex flex-col gap-4">

      {/* ROW 1: PRIMARY ACTIONS */}
      <div className="flex items-center gap-2">
        {/* Search Bar */}
        <div className="relative flex-1 group">
          <Search className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${
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
            className={`w-full pl-11 pr-10 py-3 rounded-2xl text-sm font-bold outline-none border transition-all ${
              isDark
                ? 'bg-[#0A0C14] border-white/10 text-white placeholder-white/20 focus:border-blue-500/40'
                : 'bg-white border-slate-200 text-slate-900 shadow-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5'
            }`}
          />
          {isSearching && (
            <Loader2 className="absolute right-12 top-1/2 -translate-y-1/2 w-3.5 h-3.5 animate-spin text-blue-500" />
          )}
          {searchQuery.trim() !== '' && (
            <button
              onClick={() => { setSearchQuery(''); fetchLeads(1, true, { search: '' }); }}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 hover:bg-red-500/10 rounded-lg text-slate-400 hover:text-red-500 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* View Switcher */}
        <div className={`flex p-1 rounded-2xl border shrink-0 ${isDark ? 'bg-[#0A0C14] border-white/10' : 'bg-white border-slate-200 shadow-sm'}`}>
          {[
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
                className={`p-2 rounded-xl transition-all relative ${
                  active
                    ? 'bg-blue-600 text-white shadow-md'
                    : isDark ? 'text-white/30 hover:text-white' : 'text-slate-400 hover:text-slate-900'
                }`}
              >
                <v.icon className="w-4 h-4" />
                {locked && <Lock className="w-2.5 h-2.5 absolute -top-1 -right-1 text-amber-500" />}
              </button>
            );
          })}
        </div>

        {/* Theme */}
        <button
          onClick={() => setIsDark(v => !v)}
          className={`p-2.5 rounded-2xl border transition-all shrink-0 ${
            isDark ? 'bg-[#0A0C14] border-white/10 text-amber-400' : 'bg-white border-slate-200 text-slate-500 shadow-sm'
          }`}
        >
          {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
      </div>

      {/* ROW 2: QUICK FILTERS */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        {/* Advanced Filters Toggle */}
        <button
          onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
          className={`shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
            showAdvancedFilters || hasActiveFilters
              ? 'bg-blue-600 text-white border-blue-500'
              : isDark ? 'bg-[#0A0C14] border-white/10 text-white/50' : 'bg-white border-slate-200 text-slate-600 shadow-sm'
          }`}
        >
          <Filter className="w-3.5 h-3.5" />
          Filters
          <ChevronDown className={`w-3 h-3 transition-transform ${showAdvancedFilters ? 'rotate-180' : ''}`} />
        </button>

        <div className={`w-px h-5 mx-1 shrink-0 ${isDark ? 'bg-white/10' : 'bg-slate-200'}`} />

        {/* Scheduled Today */}
        <button
          onClick={() => {
            if (isScheduledTodayActive) {
              setTimeFilter('all');
              setFilterStatus('all');
            } else {
              setTimeFilter('today');
              setFilterStatus('scheduled');
            }
          }}
          className={`shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
            isScheduledTodayActive
              ? 'bg-emerald-600 text-white border-emerald-500 shadow-lg shadow-emerald-600/20'
              : isDark ? 'bg-white/5 border-white/5 text-white/40' : 'bg-white border-slate-200 text-slate-500 shadow-sm'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Scheduled Today</span>
          <span className="sm:hidden">Today</span>
        </button>

        {/* Unpaid */}
        <button
          onClick={() => setFilterPayment(filterPayment === 'unpaid' ? 'all' : 'unpaid')}
          className={`shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
            filterPayment === 'unpaid'
              ? 'bg-amber-500 text-white border-amber-400 shadow-lg shadow-amber-500/20'
              : isDark ? 'bg-white/5 border-white/5 text-white/40' : 'bg-white border-slate-200 text-slate-500 shadow-sm'
          }`}
        >
          <DollarSign className="w-3.5 h-3.5" />
          Unpaid
        </button>

        {/* Clear All */}
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="shrink-0 p-2.5 rounded-xl bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white transition-all"
          >
            <X className="w-3.5 h-3.5 stroke-[3px]" />
          </button>
        )}
      </div>

      {/* ADVANCED FILTERS */}
      {showAdvancedFilters && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-40" onClick={() => setShowAdvancedFilters(false)} />

          {/* Desktop Dropdown */}
          <div className="relative z-[100] hidden sm:block">
            <div className={`absolute top-0 left-0 w-[400px] p-6 rounded-2xl border shadow-2xl animate-in fade-in zoom-in-95 duration-200 ${
              isDark ? 'bg-[#0D0F17] border-white/10' : 'bg-white border-slate-200'
            }`}>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-blue-500">
                    <User className="w-3 h-3" /> Assignee
                  </label>
                  <select
                    value={filterAssignee}
                    onChange={e => setFilterAssignee(e.target.value)}
                    className={`w-full rounded-xl px-4 py-3 text-xs font-bold border outline-none appearance-none cursor-pointer ${
                      isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  >
                    <option value="all">Everyone</option>
                    <option value="unassigned">Unassigned</option>
                    {teamMembers.map(m => <option key={m.name} value={m.name}>{m.name}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-blue-500">
                    <Tag className="w-3 h-3" /> Category
                  </label>
                  <select
                    value={filterCategory}
                    onChange={e => setFilterCategory(e.target.value)}
                    className={`w-full rounded-xl px-4 py-3 text-xs font-bold border outline-none appearance-none cursor-pointer ${
                      isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  >
                    <option value="all">All Categories</option>
                    {categories.map(c => <option key={c} value={c}>{String(c).replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-blue-500">From</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={e => setStartDate(e.target.value)}
                    className={`w-full rounded-xl px-4 py-3 text-xs font-bold outline-none border ${
                      isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-blue-500">To</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={e => setEndDate(e.target.value)}
                    className={`w-full rounded-xl px-4 py-3 text-xs font-bold outline-none border ${
                      isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  />
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <label className="text-[10px] font-bold uppercase tracking-widest text-blue-500">Status</label>
                <div className="flex flex-wrap gap-2">
                  {statusOptions.map(s => (
                    <button
                      key={s.value}
                      onClick={() => setFilterStatus(filterStatus === s.value ? 'all' : s.value)}
                      className={`px-3 py-2 rounded-lg text-[10px] font-bold border transition-all ${
                        filterStatus === s.value
                          ? 'bg-blue-600 border-blue-500 text-white'
                          : isDark ? 'bg-white/5 border-white/5 text-white/40 hover:text-white' : 'bg-slate-100 border-slate-200 text-slate-600'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className={`flex gap-3 pt-5 border-t ${isDark ? 'border-white/5' : 'border-slate-100'}`}>
                <button
                  onClick={() => { clearFilters(); setShowAdvancedFilters(false); }}
                  className="flex-1 py-3 rounded-xl text-[11px] font-bold uppercase tracking-widest text-red-400 bg-red-400/5 hover:bg-red-400/10 transition-all"
                >
                  Clear All
                </button>
                <button
                  onClick={() => setShowAdvancedFilters(false)}
                  className="flex-1 py-3 rounded-xl text-[11px] font-bold uppercase tracking-widest bg-blue-600 text-white hover:bg-blue-500 transition-all"
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
            <div className={`relative rounded-t-3xl px-6 pt-6 pb-10 max-h-[85vh] overflow-y-auto ${
              isDark ? 'bg-[#0D0F17] border-t border-white/10' : 'bg-white border-t border-slate-200'
            }`}>
              {/* Drag Handle */}
              <div className="w-12 h-1 bg-slate-300/30 rounded-full mx-auto mb-6" />

              <div className="space-y-6">
                {/* Assignee */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-blue-500">
                    <User className="w-3 h-3" /> Assignee
                  </label>
                  <select
                    value={filterAssignee}
                    onChange={e => setFilterAssignee(e.target.value)}
                    className={`w-full rounded-xl px-4 py-3.5 text-sm font-bold border outline-none appearance-none ${
                      isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  >
                    <option value="all">Everyone</option>
                    <option value="unassigned">Unassigned</option>
                    {teamMembers.map(m => <option key={m.name} value={m.name}>{m.name}</option>)}
                  </select>
                </div>

                {/* Category */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-blue-500">
                    <Tag className="w-3 h-3" /> Category
                  </label>
                  <select
                    value={filterCategory}
                    onChange={e => setFilterCategory(e.target.value)}
                    className={`w-full rounded-xl px-4 py-3.5 text-sm font-bold border outline-none appearance-none ${
                      isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  >
                    <option value="all">All Categories</option>
                    {categories.map(c => <option key={c} value={c}>{String(c).replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</option>)}
                  </select>
                </div>

                {/* Date Range */}
                <div className="space-y-2">
                  <label className="text-[11px] font-bold uppercase tracking-widest text-blue-500">Date Range</label>
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="date"
                      value={startDate}
                      onChange={e => setStartDate(e.target.value)}
                      className={`w-full rounded-xl px-4 py-3.5 text-sm font-bold border outline-none ${
                        isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                      }`}
                    />
                    <input
                      type="date"
                      value={endDate}
                      onChange={e => setEndDate(e.target.value)}
                      className={`w-full rounded-xl px-4 py-3.5 text-sm font-bold border outline-none ${
                        isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                      }`}
                    />
                  </div>
                </div>

                {/* Status */}
                <div className="space-y-2">
                  <label className="text-[11px] font-bold uppercase tracking-widest text-blue-500">Status</label>
                  <div className="flex flex-wrap gap-2">
                    {statusOptions.map(s => (
                      <button
                        key={s.value}
                        onClick={() => setFilterStatus(filterStatus === s.value ? 'all' : s.value)}
                        className={`px-3.5 py-2.5 rounded-lg text-xs font-bold border transition-all ${
                          filterStatus === s.value
                            ? 'bg-blue-600 border-blue-500 text-white'
                            : isDark ? 'bg-white/5 border-white/5 text-white/40' : 'bg-slate-100 border-slate-200 text-slate-600'
                        }`}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="grid grid-cols-2 gap-3 mt-8">
                <button
                  onClick={() => { clearFilters(); setShowAdvancedFilters(false); }}
                  className="py-3.5 rounded-xl text-xs font-bold uppercase tracking-widest text-red-400 bg-red-400/5 hover:bg-red-400/10 transition-all"
                >
                  Clear All
                </button>
                <button
                  onClick={() => setShowAdvancedFilters(false)}
                  className="py-3.5 rounded-xl text-xs font-bold uppercase tracking-widest bg-blue-600 text-white hover:bg-blue-500 transition-all"
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