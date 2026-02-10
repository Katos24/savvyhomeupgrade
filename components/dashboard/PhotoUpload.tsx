'use client';

import { useState, useRef } from 'react';
import { toast } from 'sonner';

type Photo = string | { url: string; thumbnail: string };

type PhotoUploadProps = {
  leadId: number;
  currentUser: any;
  onUploadComplete: () => Promise<void>;
  beforePhotos?: Photo[];
  afterPhotos?: Photo[];
  hasProject: boolean;
};

export default function PhotoUpload({ 
  leadId, 
  currentUser, 
  onUploadComplete,
  beforePhotos = [],
  hasProject
}: PhotoUploadProps) {
  const [uploadingPhotos, setUploadingPhotos] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  const photoInputRef = useRef<HTMLInputElement>(null);

  const MAX_PHOTO_SIZE = 10 * 1024 * 1024; // 10MB

  const validateFileSize = (file: File, maxSize: number): boolean => {
    if (file.size > maxSize) {
      const maxSizeMB = maxSize / (1024 * 1024);
      toast.error(`${file.name} is too large! Max ${maxSizeMB}MB.`);
      return false;
    }
    return true;
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    for (let i = 0; i < files.length; i++) {
      if (!validateFileSize(files[i], MAX_PHOTO_SIZE)) {
        if (photoInputRef.current) photoInputRef.current.value = '';
        return;
      }
    }

    setUploadingPhotos(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('leadId', leadId.toString());
      formData.append('photoType', 'before'); // Always use 'before' in database
      formData.append('uploadType', 'photo');
      formData.append('userName', currentUser?.name || currentUser?.email || 'Unknown User');

      for (let i = 0; i < files.length; i++) {
        formData.append('photos', files[i]);
      }

      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) return prev;
          return prev + 10;
        });
      }, 300);

      const response = await fetch('/api/leads/upload-photos', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      const result = await response.json();

      if (response.ok && result.success) {
        toast.success(`${files.length} photo${files.length > 1 ? 's' : ''} uploaded!`);
        await onUploadComplete();
      } else {
        toast.error(result.error || 'Failed to upload photos');
      }
    } catch (error) {
      console.error('Photo upload error:', error);
      toast.error('Failed to upload photos');
    } finally {
      setUploadingPhotos(false);
      setUploadProgress(0);
      if (photoInputRef.current) {
        photoInputRef.current.value = '';
      }
    }
  };

  if (!hasProject) {
    return null;
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl border-2 border-blue-200 shadow-sm p-4">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xl">📸</span>
        <h3 className="text-sm font-bold text-gray-900">Project Photos</h3>
        {beforePhotos.length > 0 && (
          <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-bold rounded-full">
            {beforePhotos.length}
          </span>
        )}
      </div>

      <div className="space-y-4">
          {/* PHOTO GALLERY */}
          {beforePhotos.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {beforePhotos.map((photo: Photo, index) => {
                const photoUrl = typeof photo === 'string' ? photo : photo.url;
                const thumbnailUrl = typeof photo === 'string' ? photo : (photo.thumbnail || photo.url);
                
                return (
                  <a
                    key={index}
                    href={photoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative aspect-square rounded-xl overflow-hidden border-2 border-gray-200 hover:border-blue-500 transition-all hover:shadow-lg"
                  >
                    <img
                      src={thumbnailUrl}
                      alt={`Photo ${index + 1}`}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center">
                      <span className="text-white text-2xl opacity-0 group-hover:opacity-100 transition-opacity">
                        🔍
                      </span>
                    </div>
                    <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                      #{index + 1}
                    </div>
                  </a>
                );
              })}
            </div>
          )}

          {beforePhotos.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <span className="text-4xl mb-2 block">📷</span>
              <p className="text-sm font-medium">No photos yet</p>
              <p className="text-xs mt-1">Upload your first project photo below</p>
            </div>
          )}

          {/* UPLOAD AREA */}
          <div className="space-y-2">
            <input
              ref={photoInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handlePhotoUpload}
              disabled={uploadingPhotos}
              className="hidden"
              id={`photo-upload-${leadId}`}
            />
            <label
              htmlFor={`photo-upload-${leadId}`}
              className={`w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl border-2 border-dashed transition cursor-pointer ${
                uploadingPhotos 
                  ? 'opacity-50 cursor-not-allowed border-gray-300 bg-gray-50' 
                  : 'border-blue-300 hover:border-blue-500 hover:bg-blue-50 bg-white'
              }`}
            >
              <span className="text-2xl">📸</span>
              <span className="font-bold text-gray-700 text-sm">
                {uploadingPhotos ? 'Uploading...' : 'Upload Photos'}
              </span>
            </label>
            <p className="text-xs text-gray-500 text-center">
              JPG, PNG • Max 10MB each • Multiple files supported
            </p>

            {uploadingPhotos && (
              <div className="space-y-2 bg-blue-50 rounded-lg p-3">
                <div className="flex items-center justify-center gap-2 text-xs text-blue-700 font-medium">
                  <div className="animate-spin">⏳</div>
                  <span>Uploading... {uploadProgress}%</span>
                </div>
                <div className="w-full bg-blue-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
  );
}