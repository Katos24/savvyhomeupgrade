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
      {/* New leads notification */}
      <AnimatePresence>
        {newLeadCount > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`mb-6 rounded-2xl px-4 py-3 flex items-center justify-between cursor-pointer transition-all border backdrop-blur-md ${
              isDark
                ? 'bg-[#0A0C14]/80 shadow-[0_4px_16px_rgba(0,0,0,0.2)]'
                : 'bg-white/90 shadow-xs'
            }`}
            style={{ borderColor: `${accentColor}40` }}
            onClick={onDismissNewLeads}
          >
            <div className="flex items-center gap-3">
              <span
                className="w-2.5 h-2.5 rounded-full animate-pulse"
                style={{ backgroundColor: accentColor }}
              />
              <p className={`text-xs sm:text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {newLeadCount} new lead{newLeadCount > 1 ? 's' : ''} came in
              </p>
            </div>
            <span
              className="text-xs font-extrabold uppercase tracking-wider"
              style={{ color: accentColor }}
            >
              Tap to refresh
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Leads Display */}
      <section aria-label="Leads" aria-live="polite" className="relative">
        {filteredLeads.length === 0 ? (
          <div
            className={`rounded-3xl px-6 py-14 sm:py-24 text-center border border-dashed transition-all backdrop-blur-md ${
              isDark ? 'bg-[#0A0C14]/40 border-white/10' : 'bg-white/60 border-slate-200/90'
            }`}
          >
            <div
              className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-2xl mb-5"
              style={{ backgroundColor: `${accentColor}15` }}
              aria-hidden
            >
              <Inbox className="w-7 h-7 sm:w-8 sm:h-8" style={{ color: accentColor }} />
            </div>
            <h2 className={`text-lg sm:text-xl font-extrabold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              No leads yet
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm max-w-xs mx-auto leading-relaxed font-medium">
              {hasActiveFilters ? 'No leads match your current filters.' : 'Create your first lead to get started.'}
            </p>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                style={{ backgroundColor: accentColor, color: buttonTextColor }}
                className="mt-6 px-5 py-2.5 rounded-xl text-xs font-extrabold hover:opacity-90 transition-all cursor-pointer shadow-xs"
              >
                Clear filters
              </button>
            )}
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
          <div className="space-y-7 sm:space-y-9">
            {groups.map(
              ({ title, leads }) =>
                leads.length > 0 && (
                  <section key={title} aria-label={`${title} leads`} className="relative">
                    <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-5 sticky top-20 z-10 py-2.5 backdrop-blur-md">
                      <div className="flex items-center gap-2.5">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: accentColor }} />
                        <h2 className={`text-xs font-extrabold uppercase tracking-wider ${isDark ? 'text-white' : 'text-slate-900'}`}>
                          {title}
                        </h2>
                      </div>
                      <div className={`h-px flex-1 ${isDark ? 'bg-white/10' : 'bg-slate-200'}`} aria-hidden />
                      {title !== 'Older' && (
                        <span
                          className={`text-xs font-extrabold px-3 py-1 rounded-full ${
                            isDark ? 'bg-white/5 text-slate-300' : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {leads.length}
                        </span>
                      )}
                    </div>
                    <CardsView
                      leads={leads}
                      onSelectLead={onSelectLead}
                      statusOptions={statusOptions}
                      isDark={isDark}
                      planTier={planTier}
                      accentColor={accentColor}
                    />
                  </section>
                )
            )}
          </div>
        ) : (
          <div key={`table-${refreshKey}`} className="animate-in fade-in slide-in-from-bottom-6 duration-700">
            <div className="mb-4 flex flex-col sm:flex-row sm:items-end justify-between gap-4 px-1">
              <div>
                <h2 className="text-xs font-extrabold uppercase tracking-wider" style={{ color: accentColor }}>
                  Database
                </h2>
                <p className="text-xs font-bold text-slate-400 mt-0.5">
                  {filteredLeads.length} total records
                </p>
              </div>
              {can(planTier, 'csv_export') ? (
                <button
                  onClick={onShowExportModal}
                  className={`inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-extrabold rounded-xl transition-all border cursor-pointer ${
                    isDark
                      ? 'bg-[#0A0C14]/80 border-white/10 text-white hover:bg-white/10'
                      : 'bg-white border-slate-200/90 text-slate-800 hover:bg-slate-50 shadow-xs'
                  }`}
                >
                  <Download className="w-3.5 h-3.5 text-slate-400" />
                  Export
                </button>
              ) : (
                <button
                  onClick={() => onLockedFeature('csv_export')}
                  className={`inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-extrabold rounded-xl border transition-all cursor-pointer ${
                    isDark
                      ? 'bg-white/5 border-white/5 text-slate-500'
                      : 'bg-slate-100 border-slate-200 text-slate-400'
                  }`}
                >
                  <Lock className="w-3.5 h-3.5 text-amber-500" />
                  Export (Basic)
                </button>
              )}
            </div>
            <div
              className={`rounded-2xl overflow-hidden border transition-all ${
                isDark ? 'bg-[#0A0C14]/80 border-white/10 shadow-[0_4px_20px_rgba(0,0,0,0.2)]' : 'bg-white/90 border-slate-200 shadow-xs'
              }`}
            >
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

      {/* Load More */}
      {pagination.page < pagination.pages && (
        <div className="flex flex-col items-center pt-8 sm:pt-10 pb-8 sm:pb-10 gap-2">
          <button
            onClick={onLoadMore}
            className={`w-full sm:w-auto px-8 py-3 rounded-2xl text-xs font-extrabold border transition-all cursor-pointer active:scale-95 ${
              isDark
                ? 'bg-[#0A0C14]/80 border-white/10 text-white hover:bg-white/10 shadow-[0_4px_16px_rgba(0,0,0,0.2)]'
                : 'bg-white border-slate-200/90 text-slate-800 hover:bg-slate-50 shadow-xs'
            }`}
          >
            Load More
          </button>
          <span className="text-[11px] font-bold text-slate-400">
            {pagination.total - allLeads.length} remaining
          </span>
        </div>
      )}
    </>
  );
}