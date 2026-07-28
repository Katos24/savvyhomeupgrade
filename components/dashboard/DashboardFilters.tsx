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
  accentColor?: string;
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

function getContrastTextColor(input: string): string {
  let c = input.trim().replace('#', '');
  if (c.length === 3) {
    c = c.split('').map((ch) => ch + ch).join('');
  }
  const r = parseInt(c.substring(0, 2), 16);
  const g = parseInt(c.substring(2, 4), 16);
  const b = parseInt(c.substring(4, 6), 16);
  if (Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b)) {
    return '#ffffff';
  }
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.6 ? '#0f172a' : '#ffffff';
}

export default function DashboardFilters({
  searchQuery, filterStatus, timeFilter, filterCategory, filterAssignee,
  filterPayment, startDate, endDate, currentView, isDark, planTier,
  isSearching, hasActiveFilters, serverStatusCounts,
  statusOptions, teamMembers, categories, accentColor = '#2563eb',
  setSearchQuery, setFilterStatus, setTimeFilter, setFilterCategory,
  setFilterAssignee, setFilterPayment, setStartDate, setEndDate,
  setCurrentView, setIsDark, setIsSearching,
  fetchLeads, clearFilters, onLockedFeature,
}: DashboardFiltersProps) {
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const isScheduledTodayActive = timeFilter === 'scheduled_today';
  const isUnpaidActive = filterPayment === 'unpaid';
  const buttonTextColor = getContrastTextColor(accentColor);

  return (
    <section aria-label="Search and filter leads" className="mb-5 flex flex-col gap-2.5">

      {/* ROW 1: PRIMARY ACTIONS */}
      <div className="flex items-center gap-2">
        {/* Search Bar */}
        <div className="relative flex-1 group">
          <Search
            className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${
              isDark ? 'text-slate-500 group-focus-within:text-white' : 'text-slate-400 group-focus-within:text-slate-800'
            }`}
          />
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
            className={`w-full pl-9.5 pr-9 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold outline-none border transition-all ${
              isDark
                ? 'bg-[#0A0C14]/80 border-white/10 text-white placeholder-slate-500 shadow-[0_4px_16px_rgba(0,0,0,0.2)]'
                : 'bg-white/90 border-slate-200/90 text-slate-900 placeholder-slate-400 shadow-xs'
            }`}
            style={{
              borderColor: searchQuery.trim() !== '' ? accentColor : undefined,
            }}
          />
          {isSearching && (
            <Loader2 className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-slate-400" />
          )}
          {!isSearching && searchQuery.trim() !== '' && (
            <button
              onClick={() => { setSearchQuery(''); fetchLeads(1, true, { search: '' }); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-rose-500/10 rounded-lg text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* View Switcher + Theme */}
        <div
          className={`flex items-center p-1 rounded-2xl border shrink-0 backdrop-blur-md ${
            isDark
              ? 'bg-[#0A0C14]/80 border-white/10 shadow-[0_4px_16px_rgba(0,0,0,0.2)]'
              : 'bg-white/90 border-slate-200/90 shadow-xs'
          }`}
        >
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
                style={
                  active
                    ? { backgroundColor: accentColor, color: buttonTextColor }
                    : undefined
                }
                className={`p-2 rounded-xl transition-all relative cursor-pointer ${
                  active
                    ? 'font-bold'
                    : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <v.icon className="w-4 h-4" />
                {locked && <Lock className="w-2.5 h-2.5 absolute -top-0.5 -right-0.5 text-amber-500" />}
              </button>
            );
          })}
          <div className={`w-px h-4 mx-1 ${isDark ? 'bg-white/10' : 'bg-slate-200'}`} />
          <button
            onClick={() => setIsDark(v => !v)}
            className={`p-2 rounded-xl transition-all cursor-pointer ${isDark ? 'text-amber-400' : 'text-slate-500 hover:text-slate-900'}`}
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* ROW 2: QUICK FILTERS */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-0.5">
        <button
          onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
          style={
            showAdvancedFilters || hasActiveFilters
              ? { backgroundColor: accentColor, color: buttonTextColor, borderColor: accentColor }
              : undefined
          }
          className={`shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-extrabold border transition-all cursor-pointer ${
            showAdvancedFilters || hasActiveFilters
              ? 'shadow-xs'
              : isDark
              ? 'bg-[#0A0C14]/60 border-white/10 text-slate-300 hover:bg-white/10'
              : 'bg-white border-slate-200/90 text-slate-700 hover:bg-slate-50 shadow-xs'
          }`}
        >
          <Filter className="w-3.5 h-3.5" />
          Filters
          <ChevronDown className={`w-3 h-3 transition-transform ${showAdvancedFilters ? 'rotate-180' : ''}`} />
        </button>

        <div className={`w-px h-4 mx-0.5 shrink-0 ${isDark ? 'bg-white/10' : 'bg-slate-200'}`} />

        <button
          onClick={() => setTimeFilter(isScheduledTodayActive ? 'all' : 'scheduled_today')}
          className={`shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-extrabold border transition-all cursor-pointer ${
            isScheduledTodayActive
              ? 'bg-emerald-500 text-white border-emerald-500 shadow-xs'
              : isDark
              ? 'bg-[#0A0C14]/60 border-white/10 text-slate-300 hover:bg-white/10'
              : 'bg-white border-slate-200/90 text-slate-700 hover:bg-slate-50 shadow-xs'
          }`}
        >
          <Clock className={`w-3.5 h-3.5 ${isScheduledTodayActive ? 'text-white' : 'text-emerald-500'}`} />
          <span className="hidden sm:inline">Scheduled Today</span>
          <span className="sm:hidden">Today</span>
        </button>

        <button
          onClick={() => setFilterPayment(isUnpaidActive ? 'all' : 'unpaid')}
          className={`shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-extrabold border transition-all cursor-pointer ${
            isUnpaidActive
              ? 'bg-rose-500 text-white border-rose-500 shadow-xs'
              : isDark
              ? 'bg-[#0A0C14]/60 border-white/10 text-slate-300 hover:bg-white/10'
              : 'bg-white border-slate-200/90 text-slate-700 hover:bg-slate-50 shadow-xs'
          }`}
        >
          <DollarSign className={`w-3.5 h-3.5 ${isUnpaidActive ? 'text-white' : 'text-rose-500'}`} />
          Unpaid
        </button>

        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="shrink-0 p-2 rounded-xl bg-rose-500/10 text-rose-500 border border-rose-500/20 hover:bg-rose-500 hover:text-white transition-all cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* ADVANCED FILTERS */}
      {showAdvancedFilters && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setShowAdvancedFilters(false)} />

          {/* Desktop Dropdown */}
          <div className="relative z-[100] hidden sm:block">
            <div
              className={`absolute top-0 left-0 w-[400px] p-5 rounded-2xl border shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-200 ${
                isDark
                  ? 'bg-[#0A0C14]/95 border-white/10'
                  : 'bg-white/95 border-slate-200 shadow-xl'
              }`}
            >
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="space-y-1.5">
                  <label className="flex items-center gap-1.5 text-xs font-bold" style={{ color: accentColor }}>
                    <User className="w-3.5 h-3.5" /> Assignee
                  </label>
                  <select
                    value={filterAssignee}
                    onChange={e => setFilterAssignee(e.target.value)}
                    className={`w-full rounded-xl px-3 py-2 text-xs font-bold border outline-none cursor-pointer ${
                      isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  >
                    <option value="all">Everyone</option>
                    <option value="unassigned">Unassigned</option>
                    {teamMembers.map(m => <option key={m.name} value={m.name}>{m.name}</option>)}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="flex items-center gap-1.5 text-xs font-bold" style={{ color: accentColor }}>
                    <Tag className="w-3.5 h-3.5" /> Category
                  </label>
                  <select
                    value={filterCategory}
                    onChange={e => setFilterCategory(e.target.value)}
                    className={`w-full rounded-xl px-3 py-2 text-xs font-bold border outline-none cursor-pointer ${
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
                  <label className="text-xs font-bold" style={{ color: accentColor }}>From</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={e => setStartDate(e.target.value)}
                    className={`w-full rounded-xl px-3 py-2 text-xs font-bold outline-none border ${
                      isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold" style={{ color: accentColor }}>To</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={e => setEndDate(e.target.value)}
                    className={`w-full rounded-xl px-3 py-2 text-xs font-bold outline-none border ${
                      isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  />
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <label className="text-xs font-bold" style={{ color: accentColor }}>Status</label>
                <div className="flex flex-wrap gap-1.5">
                  {statusOptions.map(s => {
                    const active = filterStatus === s.value;
                    return (
                      <button
                        key={s.value}
                        onClick={() => setFilterStatus(active ? 'all' : s.value)}
                        style={
                          active
                            ? { backgroundColor: accentColor, color: buttonTextColor, borderColor: accentColor }
                            : undefined
                        }
                        className={`px-3 py-1.5 rounded-lg text-xs font-extrabold border transition-all cursor-pointer ${
                          active
                            ? 'shadow-xs'
                            : isDark ? 'bg-white/5 border-white/10 text-slate-400 hover:text-white' : 'bg-slate-100 border-slate-200 text-slate-600'
                        }`}
                      >
                        {s.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className={`flex gap-2 pt-4 border-t ${isDark ? 'border-white/10' : 'border-slate-100'}`}>
                <button
                  onClick={() => { clearFilters(); setShowAdvancedFilters(false); }}
                  className="flex-1 py-2.5 rounded-xl text-xs font-extrabold text-rose-500 bg-rose-500/10 hover:bg-rose-500/20 transition-all cursor-pointer"
                >
                  Clear all
                </button>
                <button
                  onClick={() => setShowAdvancedFilters(false)}
                  style={{ backgroundColor: accentColor, color: buttonTextColor }}
                  className="flex-1 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer shadow-xs"
                >
                  Apply
                </button>
              </div>
            </div>
          </div>

          {/* Mobile Bottom Drawer */}
          <div className="sm:hidden fixed inset-0 z-[300] flex flex-col justify-end">
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowAdvancedFilters(false)}
            />
            <div
              className={`relative rounded-t-3xl px-5 pt-4 pb-8 max-h-[85vh] overflow-y-auto ${
                isDark ? 'bg-[#0A0C14] border-t border-white/10' : 'bg-white border-t border-slate-200'
              }`}
            >
              <div className="w-12 h-1 bg-slate-500/30 rounded-full mx-auto mb-6" />

              <div className="space-y-5">
                <div className="space-y-1.5">
                  <label className="flex items-center gap-1.5 text-xs font-bold" style={{ color: accentColor }}>
                    <User className="w-3.5 h-3.5" /> Assignee
                  </label>
                  <select
                    value={filterAssignee}
                    onChange={e => setFilterAssignee(e.target.value)}
                    className={`w-full rounded-xl px-3 py-2.5 text-sm font-bold border outline-none ${
                      isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  >
                    <option value="all">Everyone</option>
                    <option value="unassigned">Unassigned</option>
                    {teamMembers.map(m => <option key={m.name} value={m.name}>{m.name}</option>)}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="flex items-center gap-1.5 text-xs font-bold" style={{ color: accentColor }}>
                    <Tag className="w-3.5 h-3.5" /> Category
                  </label>
                  <select
                    value={filterCategory}
                    onChange={e => setFilterCategory(e.target.value)}
                    className={`w-full rounded-xl px-3 py-2.5 text-sm font-bold border outline-none ${
                      isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  >
                    <option value="all">All categories</option>
                    {categories.map(c => <option key={c} value={c}>{String(c).replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</option>)}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold" style={{ color: accentColor }}>Date range</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="date"
                      value={startDate}
                      onChange={e => setStartDate(e.target.value)}
                      className={`w-full rounded-xl px-3 py-2.5 text-sm font-bold border outline-none ${
                        isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                      }`}
                    />
                    <input
                      type="date"
                      value={endDate}
                      onChange={e => setEndDate(e.target.value)}
                      className={`w-full rounded-xl px-3 py-2.5 text-sm font-bold border outline-none ${
                        isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                      }`}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold" style={{ color: accentColor }}>Status</label>
                  <div className="flex flex-wrap gap-1.5">
                    {statusOptions.map(s => {
                      const active = filterStatus === s.value;
                      return (
                        <button
                          key={s.value}
                          onClick={() => setFilterStatus(active ? 'all' : s.value)}
                          style={
                            active
                              ? { backgroundColor: accentColor, color: buttonTextColor, borderColor: accentColor }
                              : undefined
                          }
                          className={`px-3 py-2 rounded-xl text-xs font-extrabold border transition-all ${
                            active
                              ? 'shadow-xs'
                              : isDark ? 'bg-white/5 border-white/10 text-slate-400' : 'bg-slate-100 border-slate-200 text-slate-600'
                          }`}
                        >
                          {s.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 mt-6">
                <button
                  onClick={() => { clearFilters(); setShowAdvancedFilters(false); }}
                  className="py-3 rounded-xl text-xs font-extrabold text-rose-500 bg-rose-500/10 hover:bg-rose-500/20 transition-all cursor-pointer"
                >
                  Clear all
                </button>
                <button
                  onClick={() => setShowAdvancedFilters(false)}
                  style={{ backgroundColor: accentColor, color: buttonTextColor }}
                  className="py-3 rounded-xl text-xs font-extrabold transition-all cursor-pointer shadow-xs"
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