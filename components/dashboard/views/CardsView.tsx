import { safeJSONParse, parseNotes } from '@/lib/utils';

interface CardsViewProps {
  leads: any[];
  onSelectLead: (lead: any) => void;
}

export default function CardsView({ leads, onSelectLead }: CardsViewProps) {
  const formatCategory = (cat: string) => {
    if (!cat) return '';
    return cat
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const formatPhoneNumber = (phone: string) => {
    if (!phone) return '';
    // Remove all non-digit characters
    const cleaned = phone.replace(/\D/g, '');
    
    // Format as (XXX) XXX-XXXX
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }
    // Format as +X (XXX) XXX-XXXX for 11 digits
    if (cleaned.length === 11) {
      return `+${cleaned[0]} (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
    }
    // Return as-is if not standard format
    return phone;
  };

  const getStatusColor = (status: string) => {
    const colors: any = {
      new: 'bg-blue-500',
      contacted: 'bg-yellow-500',
      quoted: 'bg-purple-500',
      scheduled: 'bg-blue-500',
      'in-progress': 'bg-orange-500',
      completed: 'bg-green-500',
      cancelled: 'bg-red-500',
      lost: 'bg-gray-500',
    };
    return colors[status] || colors.new;
  };

  const renderLeadCard = (lead: any) => {
    const fileUrls = safeJSONParse(lead.file_urls);
    const leadStatus = lead.status || 'new';
    const notesArray = parseNotes(lead.notes);
    const isProject = !!lead.project_id;
    
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
        className="group relative bg-slate-800 rounded-xl p-4 border-2 border-slate-700 hover:border-purple-500 hover:bg-slate-750 transition-all cursor-pointer overflow-hidden shadow-lg"
      >
        {/* Status indicator bar - left side */}
        <div className={`absolute left-0 top-0 bottom-0 w-1 ${getStatusColor(leadStatus)}`} />
        
        {/* Top row: Name + Badges */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <h3 className="text-white font-semibold text-lg truncate flex-1">
            {lead.name}
          </h3>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {isProject && (
              <span className="bg-emerald-500/20 text-emerald-300 text-xs px-2 py-0.5 rounded-full font-medium border border-emerald-500/30">
                🚀
              </span>
            )}
            {notesArray.length > 0 && (
              <span className="bg-slate-700/50 text-white text-xs px-2 py-0.5 rounded-full font-medium">
                📝 {notesArray.length}
              </span>
            )}
            {(images.length > 0 || videos.length > 0) && (
              <span className="bg-slate-700/50 text-white text-xs px-2 py-0.5 rounded-full font-medium">
                {images.length > 0 && `📸${images.length}`}
                {images.length > 0 && videos.length > 0 && ' '}
                {videos.length > 0 && `🎥${videos.length}`}
              </span>
            )}
          </div>
        </div>

        {/* Contact info */}
        <div className="space-y-1.5 mb-3">
          <p className="text-white/80 text-sm flex items-center gap-2">
            <span className="text-white/50">📧</span>
            <span className="truncate">{lead.email}</span>
          </p>
          <p className="text-white/80 text-sm flex items-center gap-2">
            <span className="text-white/50">📞</span>
            <span>{formatPhoneNumber(lead.phone)}</span>
          </p>
        </div>

        {/* Category + Status + Date */}
        <div className="flex items-center justify-between gap-2 text-xs">
          <span className="bg-blue-500/20 text-blue-300 px-2 py-1 rounded font-medium border border-blue-500/30">
            {formatCategory(lead.category)}
          </span>
          <span className={`${getStatusColor(leadStatus)} text-white px-2 py-1 rounded font-medium capitalize`}>
            {leadStatus}
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