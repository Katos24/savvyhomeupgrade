'use client';
import { useState, useEffect } from 'react';
type FollowUpBannerProps = {
  leads: any[];
  onFilterFollowUps: () => void;
  isFiltered: boolean;
};
export default function FollowUpBanner({ leads, onFilterFollowUps, isFiltered }: FollowUpBannerProps) {
  const [counts, setCounts] = useState({ overdue: 0, today: 0, upcoming: 0 });
  useEffect(() => {
    const now = new Date();
    const todayStart = new Date(now.setHours(0, 0, 0, 0));
    const todayEnd = new Date(now.setHours(23, 59, 59, 999));
    const followUpLeads = leads.filter(lead => lead.follow_up_date);
    const overdue = followUpLeads.filter(lead => {
      const followUpDate = new Date(lead.follow_up_date);
      return followUpDate < todayStart;
    }).length;
    const today = followUpLeads.filter(lead => {
      const followUpDate = new Date(lead.follow_up_date);
      return followUpDate >= todayStart && followUpDate <= todayEnd;
    }).length;
    const upcoming = followUpLeads.filter(lead => {
      const followUpDate = new Date(lead.follow_up_date);
      return followUpDate > todayEnd;
    }).length;
    setCounts({ overdue, today, upcoming });
  }, [leads]);
  const totalFollowUps = counts.overdue + counts.today + counts.upcoming;
  if (totalFollowUps === 0) return null;
  return (
    <div className="mb-6">
      <div className="bg-gradient-to-r from-orange-500/20 to-red-500/20 backdrop-blur-xl rounded-xl p-4 border-2 border-orange-500/30">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <span className="text-3xl">⏰</span>
            <div className="flex-1 sm:flex-initial">
              <h3 className="text-white font-bold text-lg">Follow-up Reminders</h3>
              <div className="flex items-center gap-3 mt-1">
                {counts.overdue > 0 && (
                  <span className="text-red-300 text-sm font-semibold">
                    🔴 {counts.overdue} Overdue
                  </span>
                )}
                {counts.today > 0 && (
                  <span className="text-yellow-300 text-sm font-semibold">
                    ⚠️ {counts.today} Today
                  </span>
                )}
                {counts.upcoming > 0 && (
                  <span className="text-blue-300 text-sm font-semibold">
                    📅 {counts.upcoming} Upcoming
                  </span>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={onFilterFollowUps}
            className={`px-4 py-2 rounded-lg font-semibold transition text-sm whitespace-nowrap w-full sm:w-auto ${
              isFiltered
                ? 'bg-white/20 text-white border-2 border-white'
                : 'bg-white text-gray-900 hover:bg-gray-100'
            }`}
          >
            {isFiltered ? '✓ Showing Follow-ups' : 'View All'}
          </button>
        </div>
      </div>
    </div>
  );
}