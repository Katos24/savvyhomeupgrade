import { safeJSONParse, parseNotes } from '@/lib/utils';
import { Mail, Calendar, Bell } from 'lucide-react';

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

  const renderLeadCard = (lead: any) => {
    const fileUrls = safeJSONParse(lead.file_urls);
    const leadStatus = lead.status || statusOptions[0]?.value || 'new';
    const statusConfig = getStatusConfig(leadStatus);
    const statusColorHex = getStatusColorHex(statusConfig.color);
    const notesArray = parseNotes(lead.notes);
    const isProject = !!lead.project_id;
    const hasReminder = !!lead.follow_up_date;
    
    // Get short description preview
    const descriptionPreview = lead.description 
      ? (lead.description.length > 60 ? lead.description.substring(0, 60) + '...' : lead.description)
      : null;
    
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

        {/* Bell Icon with Tooltip - Top Right */}
        {hasReminder && (
          <div className="absolute top-4 right-4 group/reminder z-10">
            <div className="relative">
              <div className="p-1.5 rounded-lg bg-red-500/20 border border-red-500/40">
                <Bell className="w-4 h-4 text-red-400" />
              </div>
              
              {/* Tooltip - Desktop only */}
              <div className="hidden md:block absolute right-0 top-full mt-2 w-56 p-3 bg-slate-900/95 backdrop-blur-sm text-white text-sm rounded-lg shadow-xl opacity-0 invisible group-hover/reminder:opacity-100 group-hover/reminder:visible transition-all duration-200 z-50 pointer-events-none">
                <div className="font-semibold mb-1 text-red-300">
                  Follow-up: {new Date(lead.follow_up_date).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </div>
                {lead.follow_up_notes && (
                  <div className="text-slate-300 text-xs leading-relaxed">
                    {lead.follow_up_notes}
                  </div>
                )}
                {/* Arrow pointer */}
                <div className="absolute -top-1 right-3 w-2 h-2 bg-slate-900/95 rotate-45"></div>
              </div>
            </div>
          </div>
        )}
        
        {/* Top row: Name + Status + Project # */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <h3 className="text-white font-semibold text-lg truncate flex-1">
            {lead.name}
          </h3>
          
          {/* Status and Project # on top right */}
          <div className="flex items-center gap-1.5 flex-shrink-0" style={{ marginRight: hasReminder ? '40px' : '0' }}>
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
            <Mail className="w-4 h-4 text-white/50" />
            <span className="truncate">{lead.email}</span>
          </p>
        </div>

        {/* Scheduled Date Section */}
        {lead.scheduled_date && (
          <div className="mb-3">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-400" />
              <span className="text-sm font-semibold text-emerald-300">
                {new Date(lead.scheduled_date).toLocaleDateString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                })}
                {lead.scheduled_time && (
                  <span className="text-emerald-200 ml-2">at {lead.scheduled_time}</span>
                )}
              </span>
            </div>
          </div>
        )}

        {/* Description (if available) */}
        {descriptionPreview && (
          <div className="mb-3">
            <p className="text-white/70 text-xs italic">{descriptionPreview}</p>
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