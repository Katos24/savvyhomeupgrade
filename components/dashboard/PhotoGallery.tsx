'use client';

type PhotoGalleryProps = {
  title: string;
  photos: string[] | any[];
  emoji?: string;
  borderColor?: string;
};

export default function PhotoGallery({ 
  title, 
  photos, 
  emoji = '📷',
  borderColor = 'border-gray-200'
}: PhotoGalleryProps) {
  if (!photos || photos.length === 0) return null;

  // Handle both array of URLs (string[]) and array of objects with url property
  const photoUrls = photos.map(photo => 
    typeof photo === 'string' ? photo : photo.url
  );

  return (
    <div className={`bg-white rounded-xl border-2 ${borderColor} p-4 sm:p-6`}>
      <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">
        {emoji} {title} ({photoUrls.length})
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
        {photoUrls.map((url: string, idx: number) => (
          <a 
            key={idx}
            href={url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="block rounded-lg overflow-hidden shadow-md hover:shadow-lg transition relative group"
          >
            <img 
              src={url} 
              alt={`${title} ${idx + 1}`} 
              className="w-full h-32 sm:h-48 object-cover"
              loading="lazy"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-2 opacity-0 group-hover:opacity-100 transition">
              {title} #{idx + 1}
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}