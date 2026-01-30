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
  afterPhotos = [],
  hasProject
}: PhotoUploadProps) {
  const [uploadingPhotos, setUploadingPhotos] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [photoType, setPhotoType] = useState<'before' | 'after'>('before');
  const [showPhotos, setShowPhotos] = useState(false);
  
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
      formData.append('photoType', photoType);
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
        toast.success(`${files.length} ${photoType} photo${files.length > 1 ? 's' : ''} uploaded!`);
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
    <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg border border-blue-200">
      <button
        onClick={() => setShowPhotos(!showPhotos)}
        className="w-full flex items-center justify-between p-3 hover:bg-blue-50/50 transition rounded-lg"
      >
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-bold text-gray-900">Project Photos</h3>
          {(beforePhotos.length > 0 || afterPhotos.length > 0) && !showPhotos && (
            <span className="text-xs text-gray-600">
              ({beforePhotos.length + afterPhotos.length})
            </span>
          )}
        </div>
        <span className={`text-lg transition-transform ${showPhotos ? 'rotate-180' : ''}`}>▼</span>
      </button>

      {showPhotos && (
        <div className="px-3 pb-3 space-y-3">
          {/* SEGMENTED CONTROL */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Type</label>
            <div className="flex bg-gray-200 rounded-lg p-1">
              <button
                type="button"
                onClick={() => setPhotoType('before')}
                disabled={uploadingPhotos}
                className={`flex-1 px-3 py-2 text-sm font-semibold rounded-md transition-all ${
                  photoType === 'before'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Before
              </button>
              <button
                type="button"
                onClick={() => setPhotoType('after')}
                disabled={uploadingPhotos}
                className={`flex-1 px-3 py-2 text-sm font-semibold rounded-md transition-all ${
                  photoType === 'after'
                    ? 'bg-white text-green-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                After
              </button>
            </div>
          </div>

          {/* DISPLAY PHOTOS FOR ACTIVE TAB */}
          {photoType === 'before' && beforePhotos.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-gray-900 mb-2">Before ({beforePhotos.length})</h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {beforePhotos.map((photo: Photo, index) => {
                  const photoUrl = typeof photo === 'string' ? photo : photo.url;
                  const thumbnailUrl = typeof photo === 'string' ? photo : (photo.thumbnail || photo.url);
                  
                  return (
                    <a
                      key={index}
                      href={photoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group relative aspect-square rounded-lg overflow-hidden border border-gray-200 hover:border-blue-500 transition-all hover:shadow-md"
                    >
                      <img
                        src={thumbnailUrl}
                        alt={`Before ${index + 1}`}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center">
                        <span className="text-white text-xl opacity-0 group-hover:opacity-100 transition-opacity">
                          🔍
                        </span>
                      </div>
                    </a>
                  );
                })}
              </div>
            </div>
          )}

          {photoType === 'after' && afterPhotos.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-gray-900 mb-2">After ({afterPhotos.length})</h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {afterPhotos.map((photo: Photo, index) => {
                  const photoUrl = typeof photo === 'string' ? photo : photo.url;
                  const thumbnailUrl = typeof photo === 'string' ? photo : (photo.thumbnail || photo.url);
                  
                  return (
                    <a
                      key={index}
                      href={photoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group relative aspect-square rounded-lg overflow-hidden border border-gray-200 hover:border-green-500 transition-all hover:shadow-md"
                    >
                      <img
                        src={thumbnailUrl}
                        alt={`After ${index + 1}`}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center">
                        <span className="text-white text-xl opacity-0 group-hover:opacity-100 transition-opacity">
                          🔍
                        </span>
                      </div>
                    </a>
                  );
                })}
              </div>
            </div>
          )}

          {/* UPLOAD BUTTON - BELOW PHOTOS */}
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
              className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 border-dashed border-gray-300 hover:border-blue-500 transition cursor-pointer ${
                uploadingPhotos ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-50'
              }`}
            >
              <span className="text-xl">{photoType === 'before' ? '📸' : '✨'}</span>
              <span className="font-semibold text-gray-700 text-sm">
                {uploadingPhotos ? 'Uploading...' : `Upload ${photoType === 'before' ? 'Before' : 'After'} Photos`}
              </span>
            </label>
            <p className="text-xs text-gray-500 text-center">
              JPG, PNG • Max 10MB each
            </p>

            {uploadingPhotos && (
              <div className="space-y-1">
                <div className="flex items-center justify-center gap-2 text-xs text-gray-600">
                  <div className="animate-spin">⏳</div>
                  <span>Uploading... {uploadProgress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div 
                    className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}