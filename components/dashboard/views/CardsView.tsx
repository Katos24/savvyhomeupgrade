import { safeJSONParse, parseNotes } from '@/lib/utils';

interface CardsViewProps {
  leads: any[];
  onSelectLead: (lead: any) => void;
  statusOptions: any[];
}

export default function CardsView({ leads, onSelectLead, statusOptions }: CardsViewProps) {
  const formatCategory = (cat: string) => {
    if (!cat) return '';
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

  const getReminderStatus = (followUpDate: string) => {
    if (!followUpDate) return null;
    
    const now = new Date();
    const todayStart = new Date(now.setHours(0, 0, 0, 0));
    const todayEnd = new Date(now.setHours(23, 59, 59, 999));
    const reminderDate = new Date(followUpDate);
    
    if (reminderDate < todayStart) {
      return { label: 'Overdue', emoji: '🔴', color: '#ef4444' };
    } else if (reminderDate >= todayStart && reminderDate <= todayEnd) {
      return { label: 'Today', emoji: '⚠️', color: '#eab308' };
    } else {
      return { label: 'Upcoming', emoji: '⏰', color: '#3b82f6' };
    }
  };

  // 🔥 Smart info: Show the most relevant info based on what's available
  const getSmartInfo = (lead: any) => {
    const isProject = !!lead.project_id;
    
    // For projects, prioritize: Quote > Schedule > Address
    if (isProject) {
      if (lead.quote_total) {
        return {
          icon: '💰',
          text: `Quote: $${parseFloat(lead.quote_total).toLocaleString()}`,
          subtext: lead.payment_status ? `Payment: ${lead.payment_status}` : null
        };
      }
      
      if (lead.scheduled_date) {
        const scheduleText = new Date(lead.scheduled_date).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        });
        return {
          icon: '📅',
          text: `Scheduled: ${scheduleText}`,
          subtext: lead.scheduled_time || null
        };
      }
      
      if (lead.address_line_1) {
        return {
          icon: '📍',
          text: lead.address_line_1,
          subtext: lead.city || null
        };
      }
    }
    
    // For leads, show description if available
    if (lead.description) {
      const preview = lead.description.length > 80 
        ? lead.description.substring(0, 80) + '...' 
        : lead.description;
      return {
        icon: '📝',
        text: preview,
        subtext: null
      };
    }
    
    // Fallback: show address if available
    if (lead.address_line_1) {
      return {
        icon: '📍',
        text: lead.address_line_1,
        subtext: lead.city || null
      };
    }
    
    return null;
  };

  const renderLeadCard = (lead: any) => {
    const fileUrls = safeJSONParse(lead.file_urls);
    const leadStatus = lead.status || statusOptions[0]?.value || 'new';
    const statusConfig = getStatusConfig(leadStatus);
    const statusColorHex = getStatusColorHex(statusConfig.color);
    const notesArray = parseNotes(lead.notes);
    const isProject = !!lead.project_id;
    const hasReminder = !!lead.follow_up_date;
    const reminderStatus = hasReminder ? getReminderStatus(lead.follow_up_date) : null;
    const smartInfo = getSmartInfo(lead);
    
    const images = fileUrls?.filter((f: any) => 
      f.type?.startsWith('image/') || f.name?.match(/\.(jpg|jpeg|png|gif|webp)$/i)
    ) || [];
    
    const videos = fileUrls?.filter((f: any) => 
      f.type?.startsWith('video/') || f.name?.match(/\.(mp4|mov|avi|webm)$/i)
    ) || [];

    return (
      <div
        key={lead.id}
        onClick={() => onSelectLead(lead)}
        className="group relative rounded-xl p-4 border-2 transition-all cursor-pointer overflow-hidden shadow-lg hover:border-purple-500"
        style={{
          backgroundColor: isProject ? '#064e3b' : '#1e293b',
          borderColor: isProject ? '#059669' : '#334155'
        }}
      >
        {/* Status indicator bar - left side */}
        <div 
          className="absolute left-0 top-0 bottom-0 w-1" 
          style={{ backgroundColor: statusColorHex }}
        />
        
        {/* Top row: Name + Status + Project # */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <h3 className="text-white font-semibold text-lg truncate flex-1">
            {lead.name}
          </h3>
          
          {/* Status and Project # on top right */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <span 
              className="text-white px-2 py-1 rounded font-medium text-xs"
              style={{ backgroundColor: statusColorHex }}
            >
              {statusConfig.label}
            </span>
            
            {isProject && (
              <span className="bg-emerald-500/20 text-emerald-300 text-xs px-2 py-1 rounded font-bold border border-emerald-500/30">
                #{lead.project_number}
              </span>
            )}
          </div>
        </div>

        {/* Email */}
        <div className="mb-3">
          <p className="text-white/80 text-sm flex items-center gap-2">
            <span className="text-white/50">📧</span>
            <span className="truncate">{lead.email}</span>
          </p>
        </div>

        {/* Smart Info Section */}
        {smartInfo && (
          <div className="mb-3 bg-white/5 rounded-lg p-2 border border-white/10">
            <p className="text-white text-sm flex items-start gap-2">
              <span className="flex-shrink-0">{smartInfo.icon}</span>
              <span className="flex-1 break-words text-white">{smartInfo.text}</span>
            </p>
            {smartInfo.subtext && (
              <p className="text-white/70 text-xs mt-1 ml-6">
                {smartInfo.subtext}
              </p>
            )}
          </div>
        )}

        {/* 🔥 Reminder indicator - ONE LINE, SMALLER */}
        {hasReminder && reminderStatus && (
          <div 
            className="mb-3 px-2 py-1 rounded border flex items-center justify-between gap-2"
            style={{ 
              backgroundColor: `${reminderStatus.color}20`,
              borderColor: `${reminderStatus.color}60`
            }}
          >
            <div className="flex items-center gap-1.5">
              <span className="text-sm">{reminderStatus.emoji}</span>
              <span className="text-xs font-semibold text-white">
                {reminderStatus.label}
              </span>
            </div>
            <span className="text-xs text-white/80">
              {new Date(lead.follow_up_date).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric'
              })}
            </span>
          </div>
        )}

        {/* Category at bottom */}
        <div className="flex items-center justify-between gap-2 text-xs">
          <span className="bg-blue-500/20 text-blue-300 px-2 py-1 rounded font-medium border border-blue-500/30">
            {formatCategory(lead.category)}
          </span>
        </div>

        {/* Date - bottom */}
        <p className="text-white/40 text-xs mt-3">
          {new Date(lead.created_at).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit'
          })}
        </p>

        {/* Hover effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 to-pink-500/0 group-hover:from-purple-500/5 group-hover:to-pink-500/5 transition-all pointer-events-none rounded-xl" />
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {leads.map(lead => renderLeadCard(lead))}
    </div>
  );
}