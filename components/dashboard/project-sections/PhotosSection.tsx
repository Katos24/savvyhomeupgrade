'use client';

import PhotoUpload from '../PhotoUpload';

type PhotosSectionProps = {
  lead: any;
  currentUser: any;
  onRefresh: () => Promise<void>;
  hasProject: boolean;
};

export default function PhotosSection({ lead, currentUser, onRefresh, hasProject }: PhotosSectionProps) {
  // Parse photos
  const beforePhotos = lead?.before_photos ? (typeof lead.before_photos === 'string' ? JSON.parse(lead.before_photos) : lead.before_photos) : [];
  const afterPhotos = lead?.after_photos ? (typeof lead.after_photos === 'string' ? JSON.parse(lead.after_photos) : lead.after_photos) : [];

  return (
    <div>
      <PhotoUpload
        leadId={lead.id}
        currentUser={currentUser}
        onUploadComplete={onRefresh}
        beforePhotos={beforePhotos}
        afterPhotos={afterPhotos}
        hasProject={hasProject}
      />
    </div>
  );
}