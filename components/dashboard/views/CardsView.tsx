import { safeJSONParse, parseNotes } from '@/lib/utils';
import styles from '@/app/dashboard/dashboard.module.css';

interface CardsViewProps {
  leads: any[];
  onSelectLead: (lead: any) => void;
}

export default function CardsView({ leads, onSelectLead }: CardsViewProps) {
  const renderLeadCard = (lead: any) => {
    const fileUrls = safeJSONParse(lead.file_urls);
    const aiAnalysis = safeJSONParse(lead.ai_analysis);
    const leadStatus = lead.status || 'new';
    const notesArray = parseNotes(lead.notes);
    
    const images = fileUrls?.filter((f: any) => 
      f.type?.startsWith('image/') || f.name?.match(/\.(jpg|jpeg|png|gif|webp)$/i)
    ) || [];
    
    const videos = fileUrls?.filter((f: any) => 
      f.type?.startsWith('video/') || f.name?.match(/\.(mp4|mov|avi|webm)$/i)
    ) || [];

    const statusColors: any = {
      new: 'bg-blue-500',
      contacted: 'bg-yellow-500',
      quoted: 'bg-purple-500',
      'in-progress': 'bg-orange-500',
      completed: 'bg-green-500',
      lost: 'bg-gray-500',
    };

    return (
      <div
        key={lead.id}
        onClick={() => onSelectLead(lead)}
        className={styles.card}
      >
        <div className="absolute top-3 right-3 z-10">
          <span className={`${statusColors[leadStatus]} text-white text-xs px-2 py-1 rounded-full font-semibold uppercase`}>
            {leadStatus}
          </span>
        </div>

        {notesArray.length > 0 && (
          <div className="absolute top-3 left-3 z-10">
            <span className="bg-gray-800 text-white text-xs px-2 py-1 rounded-full font-semibold">
              📝 {notesArray.length} note{notesArray.length > 1 ? 's' : ''}
            </span>
          </div>
        )}

        <div className={styles.cardIconHeader}>
          {images.length > 0 && (
            <div className={styles.mediaIcon}>
              <span className="text-4xl">📸</span>
              <span className={styles.mediaCount}>{images.length} photo{images.length > 1 ? 's' : ''}</span>
            </div>
          )}
          {videos.length > 0 && (
            <div className={styles.mediaIcon}>
              <span className="text-4xl">🎥</span>
              <span className={styles.mediaCount}>{videos.length} video{videos.length > 1 ? 's' : ''}</span>
            </div>
          )}
          {images.length === 0 && videos.length === 0 && (
            <div className={styles.mediaIcon}>
              <span className="text-4xl">📝</span>
              <span className={styles.mediaCount}>No media</span>
            </div>
          )}
        </div>

        <div className={styles.cardContent}>
          <div className={styles.cardHeader}>
            <h3 className={styles.cardName}>{lead.name}</h3>
            <span className={styles.categoryBadge}>{lead.category}</span>
          </div>

          <p className={styles.cardEmail}>📧 {lead.email}</p>
          <p className={styles.cardPhone}>📞 {lead.phone}</p>

          {lead.description && (
            <p className={styles.cardDescription}>
              {lead.description.substring(0, 80)}{lead.description.length > 80 ? '...' : ''}
            </p>
          )}

          {aiAnalysis ? (
            <div className={styles.badges}>
              <span className={`${styles.badge} ${
                aiAnalysis.urgency === 'Emergency' ? styles.urgencyEmergency :
                aiAnalysis.urgency === 'High Priority' ? styles.urgencyHigh :
                aiAnalysis.urgency === 'Low Priority' ? styles.urgencyLow :
                styles.urgencyNormal
              }`}>
                {aiAnalysis.urgency}
              </span>
              <span className={`${styles.badge} ${
                aiAnalysis.complexity === 'Simple' ? styles.complexitySimple :
                aiAnalysis.complexity === 'Complex' ? styles.complexityComplex :
                styles.complexityModerate
              }`}>
                {aiAnalysis.complexity}
              </span>
            </div>
          ) : videos.length > 0 && images.length === 0 ? (
            <div className={styles.badges}>
              <span className={`${styles.badge} ${styles.urgencyNormal}`}>
                📹 Manual Review
              </span>
            </div>
          ) : null}

          <p className={styles.cardDate}>
            🕒 {new Date(lead.created_at).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
              hour: 'numeric',
              minute: '2-digit'
            })}
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className={styles.cardsGrid}>
      {leads.map(lead => renderLeadCard(lead))}
    </div>
  );
}
