'use client';

import { Inbox, Download, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import CardsView from '@/components/dashboard/views/CardsView';
import TableView from '@/components/dashboard/views/TableView';
import CalendarView from '@/components/dashboard/views/CalendarView';
import { can, type PlanTier } from '@/lib/permissions';

type ViewMode = 'cards' | 'table' | 'calendar';

type DashboardLeadsSectionProps = {
  filteredLeads: any[];
  allLeads: any[];
  groups: { title: string; leads: any[] }[];
  currentView: ViewMode;
  isDark: boolean;
  planTier: PlanTier;
  statusOptions: any[];
  teamMembers: any[];
  company: any;
  hasActiveFilters: boolean;
  accentColor?: string;
  clearFilters: () => void;
  onSelectLead: (lead: any) => void;
  newLeadCount: number;
  onDismissNewLeads: () => void;
  refreshKey: number;
  onBulkUpdate: (ids: number[], updates: any) => Promise<void>;
  onBulkDelete: (ids: number[]) => Promise<void>;
  onShowExportModal: () => void;
  onLockedFeature: (key: string) => void;
  pagination: { page: number; pages: number; total: number };
  onLoadMore: () => void;
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

export default function DashboardLeadsSection({
  filteredLeads,
  allLeads,
  groups,
  currentView,
  isDark,
  planTier,
  statusOptions,
  teamMembers,
  company,
  hasActiveFilters,
  accentColor = '#2563eb',
  clearFilters,
  onSelectLead,
  newLeadCount,
  onDismissNewLeads,
  refreshKey,
  onBulkUpdate,
  onBulkDelete,
  onShowExportModal,
  onLockedFeature,
  pagination,
  onLoadMore,
}: DashboardLeadsSectionProps) {
  const buttonTextColor = getContrastTextColor(accentColor);

  return (
    <>
      {/* Premium Floating "New Leads" Notification */}
      <AnimatePresence>
        {newLeadCount > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="mb-8 max-w-md mx-auto relative group cursor-pointer"
            onClick={onDismissNewLeads}
          >
            <div
              className="absolute -inset-0.5 rounded-full blur-md opacity-30 group-hover:opacity-60 transition-opacity duration-500"
              style={{ backgroundColor: accentColor }}
            />
            <div className={`relative flex items-center justify-between px-5 py-3 rounded-full border shadow-2xl backdrop-blur-xl ${
              isDark ? 'bg-[#0b0f17] border-slate-700/80' : 'bg-white border-slate-300'
            }`}>
              <div className="flex items-center gap-3">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: accentColor }} />
                  <span className="relative inline-flex rounded-full h-3 w-3" style={{ backgroundColor: accentColor }} />
                </span>
                <p className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {newLeadCount} new lead{newLeadCount > 1 ? 's' : ''} came in
                </p>
              </div>
              <span className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full transition-colors ${
                isDark
                  ? 'bg-white/10 text-white group-hover:bg-white/20'
                  : 'bg-slate-900/5 text-slate-700 group-hover:bg-slate-900/10'
              }`}>
                Refresh
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Leads Display */}
      <section aria-label="Leads" aria-live="polite" className="relative">
        {filteredLeads.length === 0 ? (
          // Refined Empty State
          <div className={`rounded-3xl p-1 bg-gradient-to-b to-transparent backdrop-blur-sm ${
            isDark ? 'from-slate-800/40' : 'from-slate-200/50'
          }`}>
            <div className={`rounded-[22px] px-6 py-16 sm:py-24 text-center flex flex-col items-center justify-center transition-all ${
              isDark ? 'bg-[#0A0C14] shadow-[inset_0_0_40px_rgba(0,0,0,0.4)]' : 'bg-white border border-slate-200'
            }`}>
              <div
                className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-6 shadow-inner"
                style={{ backgroundColor: `${accentColor}15`, border: `1px solid ${accentColor}30` }}
                aria-hidden
              >
                <Inbox className="w-8 h-8" style={{ color: accentColor }} />
              </div>
              <h2 className={`text-xl font-bold mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                No leads yet
              </h2>
              <p className={`text-sm max-w-sm mx-auto leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                {hasActiveFilters
                  ? 'We couldn\'t find any leads matching your current filters. Try adjusting them or clearing your search.'
                  : 'Your pipeline is empty. Create your first lead to start tracking your opportunities.'}
              </p>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  style={{ backgroundColor: accentColor, color: buttonTextColor }}
                  className="mt-8 px-6 py-3 rounded-xl text-sm font-bold hover:opacity-90 transition-transform active:scale-95 shadow-lg"
                >
                  Clear all filters
                </button>
              )}
            </div>
          </div>
        ) : currentView === 'calendar' ? (
          <div className="animate-in fade-in zoom-in-95 duration-500">
            <CalendarView
              leads={allLeads}
              onSelectLead={onSelectLead}
              statusOptions={statusOptions}
              isDark={isDark}
            />
          </div>
        ) : currentView === 'cards' ? (
          <div className="space-y-8 sm:space-y-12">
            {groups.map(
              ({ title, leads }) =>
                leads.length > 0 && (
                  <section key={title} aria-label={`${title} leads`} className="relative">
                    {/* Group Headers scroll normally with the page */}
                    <div className="flex items-center gap-4 mb-5 sm:mb-6 py-4 -mx-2 px-2 bg-transparent">
                      <div className="flex items-center gap-3">
                        <h2 className={`text-sm font-bold uppercase tracking-widest drop-shadow-sm ${
                          isDark ? 'text-slate-100' : 'text-slate-900'
                        }`}>
                          {title}
                        </h2>
                        {title !== 'Older' && (
                          <span className={`px-2.5 py-0.5 rounded-full shadow-inner text-[10px] font-bold border ${
                            isDark
                              ? 'bg-slate-800/80 text-slate-300 border-slate-700/80'
                              : 'bg-white text-slate-600 border-slate-300'
                          }`}>
                            {leads.length}
                          </span>
                        )}
                      </div>
                      <div className={`h-px flex-1 bg-gradient-to-r to-transparent ${
                        isDark ? 'from-slate-700/80 via-slate-800/40' : 'from-slate-300/80 via-slate-200/40'
                      }`} aria-hidden />
                    </div>

                    <div className="pl-1">
                      <CardsView
                        leads={leads}
                        onSelectLead={onSelectLead}
                        statusOptions={statusOptions}
                        isDark={isDark}
                        accentColor={accentColor}
                      />
                    </div>
                  </section>
                )
            )}
          </div>
        ) : (
          <div key={`table-${refreshKey}`} className="animate-in fade-in slide-in-from-bottom-6 duration-700">
            {/* Structural Table Header */}
            <div className="mb-5 flex flex-col sm:flex-row sm:items-end justify-between gap-4 px-2">
              <div className="flex items-center gap-4">
                <div className="w-1.5 h-8 rounded-full" style={{ backgroundColor: accentColor }} />
                <div>
                  <h2 className={`text-sm font-bold uppercase tracking-widest ${
                    isDark ? 'text-slate-300' : 'text-slate-600'
                  }`}>
                    Database
                  </h2>
                  <p className={`text-xs font-semibold mt-1 ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
                    Showing {filteredLeads.length} active records
                  </p>
                </div>
              </div>

              {can(planTier, 'csv_export') ? (
                <button
                  onClick={onShowExportModal}
                  className={`inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-bold rounded-xl transition-all border shadow-sm ${
                    isDark
                      ? 'bg-slate-800/50 border-slate-700 text-slate-200 hover:bg-slate-800 hover:text-white hover:border-slate-600'
                      : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-400'
                  }`}
                >
                  <Download className={`w-4 h-4 ${isDark ? 'text-slate-400' : 'text-slate-400'}`} />
                  Export Data
                </button>
              ) : (
                <button
                  onClick={() => onLockedFeature('csv_export')}
                  className={`inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-bold rounded-xl transition-all border cursor-pointer ${
                    isDark
                      ? 'bg-slate-800/30 border-slate-800 text-slate-500 hover:bg-slate-800/50'
                      : 'bg-slate-100 border-slate-300 text-slate-400 hover:bg-slate-200'
                  }`}
                >
                  <Lock className="w-4 h-4 text-amber-500/70" />
                  Export (Pro)
                </button>
              )}
            </div>

            <div className={`rounded-2xl overflow-hidden border shadow-2xl backdrop-blur-md ${
              isDark ? 'border-slate-800/80 bg-[#0A0C14]/60' : 'border-slate-300 bg-white'
            }`}>
              <TableView
                leads={filteredLeads}
                onSelectLead={onSelectLead}
                statusOptions={statusOptions}
                onBulkUpdate={onBulkUpdate}
                onBulkDelete={onBulkDelete}
                teamMembers={teamMembers}
                categories={company.form_categories || []}
                customQuestions={company.custom_questions || []}
                isDark={isDark}
              />
            </div>
          </div>
        )}
      </section>

      {/* Refined Load More Section */}
      {pagination.page < pagination.pages && (
        <div className="flex flex-col items-center pt-12 pb-10 gap-3 relative">
          {/* Subtle fade effect for the bottom of the list */}
          <div className={`absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent to-transparent ${
            isDark ? 'via-slate-700/50' : 'via-slate-300/60'
          }`} />

          <button
            onClick={onLoadMore}
            className={`group relative inline-flex items-center justify-center px-8 py-3 rounded-2xl text-xs font-bold transition-all border shadow-lg overflow-hidden ${
              isDark
                ? 'bg-slate-800/40 border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white'
                : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300"
              style={{ backgroundColor: accentColor }}
            />
            <span className="relative z-10">Load More Records</span>
          </button>
          <span className={`text-[11px] font-semibold tracking-wide uppercase ${
            isDark ? 'text-slate-500' : 'text-slate-500'
          }`}>
            {pagination.total - allLeads.length} remaining
          </span>
        </div>
      )}
    </>
  );
}