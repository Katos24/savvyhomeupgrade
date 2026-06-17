'use client';

import { Inbox, Download, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import CardsView from '@/components/dashboard/views/CardsView';
import TableView from '@/components/dashboard/views/TableView';
import CalendarView from '@/components/dashboard/views/CalendarView';
import { can, type PlanTier } from '@/lib/permissions';

type ViewMode = 'cards' | 'table' | 'calendar';

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
}: {
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
}) {
  return (
    <>
      {/* New leads notification */}
      <AnimatePresence>
        {newLeadCount > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`mb-6 rounded-2xl px-5 py-3.5 flex items-center justify-between cursor-pointer transition-all ${
              isDark
                ? 'bg-blue-500/10 border border-blue-500/20 hover:bg-blue-500/15'
                : 'bg-blue-50 border border-blue-100 hover:bg-blue-100'
            }`}
            onClick={onDismissNewLeads}
          >
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              <p className={`text-sm font-bold ${isDark ? 'text-blue-300' : 'text-blue-700'}`}>
                {newLeadCount} new lead{newLeadCount > 1 ? 's' : ''} came in
              </p>
            </div>
            <span className={`text-xs font-bold uppercase tracking-widest ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
              Tap to refresh
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Leads Display */}
      <section aria-label="Leads" aria-live="polite" className="relative">
        {filteredLeads.length === 0 ? (
          <div className={`rounded-2xl px-6 py-14 sm:py-24 text-center border border-dashed transition-all ${
            isDark ? 'bg-white/[0.01] border-white/[0.06]' : 'bg-slate-50/30 border-slate-200'
          }`}>
            <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-blue-500/10 mb-5" aria-hidden>
              <Inbox className="w-7 h-7 sm:w-8 sm:h-8 text-blue-500/30" />
            </div>
            <h2 className={`text-lg sm:text-xl font-semibold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              No leads yet
            </h2>
            <p className="text-slate-400 text-sm max-w-xs mx-auto leading-relaxed">
              {hasActiveFilters ? "No leads match your current filters." : "Create your first lead to get started."}
            </p>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="mt-6 px-5 py-2.5 rounded-lg bg-blue-600 text-white text-xs font-medium hover:bg-blue-500 transition-all"
              >
                Clear filters
              </button>
            )}
          </div>
        ) : currentView === 'calendar' ? (
          <div className="animate-in fade-in zoom-in-95 duration-500">
            <CalendarView leads={allLeads} onSelectLead={onSelectLead} statusOptions={statusOptions} isDark={isDark} />
          </div>
        ) : currentView === 'cards' ? (
          <div className="space-y-12 sm:space-y-20">
            {groups.map(({ title, leads }) => leads.length > 0 && (
              <section key={title} aria-label={`${title} leads`} className="relative">
                <div className="flex items-center gap-4 sm:gap-6 mb-8 sm:mb-10 sticky top-24 z-10 py-4 backdrop-blur-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                    <h2 className={`text-[10px] sm:text-[12px] font-black uppercase tracking-[0.3em] sm:tracking-[0.5em] ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      {title}
                    </h2>
                  </div>
                  <div className={`h-[1px] flex-1 ${isDark ? 'bg-white/5' : 'bg-slate-100'}`} aria-hidden />
                  {title !== 'Older' && (
                    <span className={`text-[9px] sm:text-[11px] font-bold px-3 py-1 sm:px-4 sm:py-1.5 rounded-full ${
                      isDark ? 'bg-white/5 text-slate-400' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {leads.length}
                    </span>
                  )}
                </div>
                <CardsView leads={leads} onSelectLead={onSelectLead} statusOptions={statusOptions} isDark={isDark} planTier={planTier} />
              </section>
            ))}
          </div>
        ) : (
          <div key={`table-${refreshKey}`} className="animate-in fade-in slide-in-from-bottom-6 duration-700">
            <div className="mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4 px-2">
              <div>
                <h2 className={`text-[11px] sm:text-[12px] font-black uppercase tracking-[0.3em] sm:tracking-[0.4em] ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                  Database
                </h2>
                <p className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1 sm:mt-2">
                  {filteredLeads.length} total records
                </p>
              </div>
              {can(planTier, 'csv_export') ? (
                <button
                  onClick={onShowExportModal}
                  className={`inline-flex items-center justify-center gap-2 px-6 py-3 sm:px-8 sm:py-3.5 text-[9px] sm:text-[10px] font-black uppercase tracking-widest rounded-2xl transition-all border ${
                    isDark ? 'bg-white/5 border-white/10 text-white hover:bg-white hover:text-black' : 'bg-slate-900 border-slate-800 text-white hover:bg-slate-800 shadow-lg'
                  }`}
                >
                  <Download className="w-3.5 h-3.5" />
                  Export
                </button>
              ) : (
                <button
                  onClick={() => onLockedFeature('csv_export')}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 sm:px-8 sm:py-3.5 bg-slate-50 text-slate-400 text-[9px] sm:text-[10px] font-black uppercase tracking-widest rounded-2xl border border-slate-100 transition-all active:scale-95"
                >
                  <Lock className="w-3.5 h-3.5" />
                  Export (Basic)
                </button>
              )}
            </div>
            <div className={`rounded-[1.5rem] sm:rounded-[2.5rem] overflow-hidden border shadow-2xl transition-all ${
              isDark ? 'bg-[#0A0C14] border-white/5' : 'bg-white border-slate-100 shadow-[0_30px_60px_rgba(0,0,0,0.02)]'
            }`}>
              <TableView
                leads={filteredLeads} onSelectLead={onSelectLead} statusOptions={statusOptions}
                onBulkUpdate={onBulkUpdate} onBulkDelete={onBulkDelete}
                teamMembers={teamMembers} categories={company.form_categories || []}
                customQuestions={company.custom_questions || []} isDark={isDark}
              />
            </div>
          </div>
        )}
      </section>

      {/* Load More */}
      {pagination.page < pagination.pages && (
        <div className="flex flex-col items-center pt-10 sm:pt-14 pb-8 sm:pb-10 gap-2">
          <button
            onClick={onLoadMore}
            className={`w-full sm:w-auto px-8 py-3 rounded-lg text-xs font-medium border transition-all active:scale-[0.97] ${
              isDark
                ? 'border-white/10 text-white/70 hover:bg-white/[0.06]'
                : 'border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            Load more
          </button>
          <span className="text-[11px] text-slate-400">
            {pagination.total - allLeads.length} remaining
          </span>
        </div>
      )}
    </>
  );
}