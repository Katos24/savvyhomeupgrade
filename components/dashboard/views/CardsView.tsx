import { safeJSONParse, parseNotes } from '@/lib/utils';
import { Calendar, Bell, Tag } from 'lucide-react';

interface CardsViewProps {
  leads: any[];
  onSelectLead: (lead: any) => void;
  statusOptions: any[];
}

export default function CardsView({ leads, onSelectLead, statusOptions }: CardsViewProps) {
  const formatCategory = (cat: string) => {
    if (!cat) return 'Uncategorized';
    return cat
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const getStatusConfig = (statusValue: string) => {
    return statusOptions.find((s: any) => s.value === statusValue) || statusOptions[0];
  };

  const getStatusColorHex = (colorName: string) => {
    const colorMap: Record<string, string> = {
      blue: '#3b82f6',
      yellow: '#eab308',
      purple: '#a855f7',
      orange: '#f97316',
      green: '#22c55e',
      red: '#ef4444',
      gray: '#6b7280',
      indigo: '#6366f1',
      pink: '#ec4899',
    };
    return colorMap[colorName] || '#3b82f6';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const today = new Date(now.setHours(0, 0, 0, 0));
    const leadDate = new Date(date.setHours(0, 0, 0, 0));
    
    // If today, show time
    if (leadDate.getTime() === today.getTime()) {
      return new Date(dateString).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit'
      });
    }
    
    // Otherwise show date
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const renderLeadCard = (lead: any) => {
    const leadStatus = lead.status || statusOptions[0]?.value || 'new';
    const statusConfig = getStatusConfig(leadStatus);
    const statusColorHex = getStatusColorHex(statusConfig.color);
    const isProject = !!lead.project_id;
    const hasReminder = !!lead.follow_up_date;
    const hasSchedule = !!lead.scheduled_date;
    
    // Show description if it exists
    const descriptionPreview = lead.description && lead.description.trim().length > 0
      ? (lead.description.length > 80 ? lead.description.substring(0, 80) + '...' : lead.description)
      : null;

    return (
      <div
        key={lead.id}
        onClick={() => onSelectLead(lead)}
        className="group relative rounded-xl p-3 sm:p-4 border-2 transition-all cursor-pointer overflow-hidden shadow-lg active:scale-[0.98] sm:hover:shadow-2xl sm:hover:scale-[1.02]"
        style={{
          backgroundColor: isProject ? '#064e3b' : '#1e293b',
          borderColor: statusColorHex,
          boxShadow: `0 4px 20px ${statusColorHex}20`
        }}
      >
        {/* Status indicator bar - left side */}
        <div 
          className="absolute left-0 top-0 bottom-0 w-1.5" 
          style={{ backgroundColor: statusColorHex }}
        />

        {/* Top row: Name + Badges - Now stacks on mobile */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-3">
          <h3 className="text-white font-bold text-base sm:text-lg line-clamp-2 flex-1 pr-1">
            {lead.name}
          </h3>
          
          {/* Right side badges - Stack on mobile, inline on desktop */}
          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap sm:flex-shrink-0">
            {/* Status Badge - Responsive sizing */}
            <span 
              className="inline-flex items-center gap-1 px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-lg text-xs font-bold shadow-sm whitespace-nowrap"
              style={{ 
                backgroundColor: statusColorHex,
                color: '#ffffff'
              }}
            >
              {statusConfig.label}
            </span>
            
            {/* Project Number */}
            {isProject && (
              <span className="inline-flex items-center px-2 py-1 bg-emerald-600 text-white rounded-lg text-xs font-bold shadow-sm">
                #{lead.project_number}
              </span>
            )}
          </div>
        </div>

        {/* SCHEDULED DATE - Mobile optimized */}
        {hasSchedule && (
          <div className="mb-3 bg-emerald-500/20 border-2 border-emerald-500/40 rounded-lg px-2.5 sm:px-3 py-2">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-xs sm:text-sm font-bold text-emerald-300">
                  {new Date(lead.scheduled_date).toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric'
                  })}
                </div>
                {lead.scheduled_time && (
                  <div className="text-xs text-emerald-200">
                    {lead.scheduled_time}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* REMINDER - Mobile optimized */}
        {hasReminder && !hasSchedule && (
          <div className="mb-3 bg-red-500/20 border-2 border-red-500/40 rounded-lg px-2.5 sm:px-3 py-2">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-red-400 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold text-red-300">
                  Follow-up: {new Date(lead.follow_up_date).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric'
                  })}
                </div>
                {lead.follow_up_notes && (
                  <div className="text-xs text-red-200 mt-0.5 line-clamp-1">
                    {lead.follow_up_notes}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Description - Only if meaningful */}
        {descriptionPreview && (
          <div className="mb-3 bg-white/5 rounded-lg px-2.5 sm:px-3 py-2 border border-white/10">
            <p className="text-white/70 text-xs leading-relaxed line-clamp-2">
              {descriptionPreview}
            </p>
          </div>
        )}

        {/* Footer: Category + Date - Stack on very small screens */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-white/10">
          <span className="inline-flex items-center gap-1 sm:gap-1.5 bg-blue-500/20 text-blue-300 px-2 sm:px-2.5 py-1 rounded-lg text-xs font-semibold border border-blue-500/30">
            <Tag className="w-3 h-3 flex-shrink-0" />
            <span className="truncate max-w-[120px] sm:max-w-none">{formatCategory(lead.category)}</span>
          </span>
          
          <span className="text-white/40 text-xs font-medium whitespace-nowrap">
            {formatDate(lead.created_at)}
          </span>
        </div>

        {/* Hover glow effect - Desktop only */}
        <div 
          className="hidden sm:block absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none rounded-xl"
          style={{
            background: `radial-gradient(circle at top right, ${statusColorHex}10, transparent 70%)`
          }}
        />
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {leads.map(lead => renderLeadCard(lead))}
    </div>
  );
}