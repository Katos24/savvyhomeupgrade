'use client';

import PhotoUpload from '../PhotoUpload';

type PhotosSectionProps = {
  lead: any;
  currentUser: any;
  onRefresh: () => Promise<void>;
  hasProject: boolean;
};

export default function PhotosSection({ lead, currentUser, onRefresh, hasProject }: PhotosSectionProps) {
  const beforePhotos = lead?.before_photos
    ? typeof lead.before_photos === 'string'
      ? JSON.parse(lead.before_photos)
      : lead.before_photos
    : [];

  const afterPhotos = lead?.after_photos
    ? typeof lead.after_photos === 'string'
      ? JSON.parse(lead.after_photos)
      : lead.after_photos
    : [];

  const totalCount = beforePhotos.length + afterPhotos.length;

  return (
    <div className="overflow-hidden">
      {/* Section header */}
      <div className="px-5 py-4 border-b border-gray-50 flex items-center gap-2">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
          <span className="w-5 h-5 bg-pink-50 flex items-center justify-center text-xs">📷</span>
          Photos
          {totalCount > 0 && (
            <span className="px-2 py-0.5 bg-pink-100 text-pink-700 text-xs font-bold">
              {totalCount}
            </span>
          )}
        </h3>
      </div>

      {/* Photo upload component */}
      <div className="p-5">
        <PhotoUpload
          leadId={lead.id}
          currentUser={currentUser}
          onUploadComplete={onRefresh}
          beforePhotos={beforePhotos}
          afterPhotos={afterPhotos}
          hasProject={hasProject}
        />
      </div>
    </div>
  );
}