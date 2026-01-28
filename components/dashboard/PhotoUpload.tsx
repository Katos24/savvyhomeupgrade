'use client';

import { useState, useRef } from 'react';
import { toast } from 'sonner';

type PhotoUploadProps = {
  leadId: number;
  currentUser: any;
  onUploadComplete: () => Promise<void>;
  beforePhotos?: string[];
  afterPhotos?: string[];
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

  // Validate file size
  const validateFileSize = (file: File, maxSize: number): boolean => {
    if (file.size > maxSize) {
      const maxSizeMB = maxSize / (1024 * 1024);
      toast.error(`${file.name} is too large! Max ${maxSizeMB}MB.`);
      return false;
    }
    return true;
  };

  // Handle Photo Upload
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Validate all files first
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

      // Simulate progress for better UX
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
        toast.success(`✅ ${files.length} ${photoType} photo${files.length > 1 ? 's' : ''} uploaded!`);
        await onUploadComplete();
      } else {
        toast.error(result.error || 'Failed to upload photos');
      }
    } catch (error) {
      console.error('Photo upload error:', error);
      toast.error('Failed to upload photos. Please try again.');
    } finally {
      setUploadingPhotos(false);
      setUploadProgress(0);
      if (photoInputRef.current) {
        photoInputRef.current.value = '';
      }
    }
  };

  if (!hasProject) {
    return null; // Don't show if not a project
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl border-2 border-blue-200">
      <button
        onClick={() => setShowPhotos(!showPhotos)}
        className="w-full flex items-center justify-between p-4 sm:p-6 hover:bg-blue-50/50 transition rounded-xl"
      >
        <div className="flex items-center gap-3">
          <h3 className="text-base sm:text-lg font-bold text-gray-900">📸 Project Photos</h3>
          {(beforePhotos.length > 0 || afterPhotos.length > 0) && !showPhotos && (
            <span className="text-xs sm:text-sm text-gray-600">
              ({beforePhotos.length + afterPhotos.length} photo{beforePhotos.length + afterPhotos.length !== 1 ? 's' : ''})
            </span>
          )}
        </div>
        <span className={`text-2xl transition-transform ${showPhotos ? 'rotate-180' : ''}`}>
          ▼
        </span>
      </button>

      {showPhotos && (
        <div className="px-4 sm:px-6 pb-4 sm:pb-6 space-y-6">
          {/* 🔥 UPLOAD SECTION */}
          <div className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Photo Type
          </label>
          <select
            value={photoType}
            onChange={(e) => setPhotoType(e.target.value as 'before' | 'after')}
            disabled={uploadingPhotos}
            className="w-full px-4 py-2 rounded-lg border-2 border-gray-300 focus:border-blue-500 focus:outline-none bg-white text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <option value="before">📸 Before Photos</option>
            <option value="after">✨ After Photos</option>
          </select>
        </div>

        <div>
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
            className={`w-full flex items-center justify-center gap-2 px-6 py-4 rounded-lg border-2 border-dashed border-gray-300 hover:border-blue-500 transition cursor-pointer ${
              uploadingPhotos ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-50'
            }`}
          >
            <span className="text-2xl">{photoType === 'before' ? '📸' : '✨'}</span>
            <span className="font-semibold text-gray-700">
              {uploadingPhotos ? '⏳ Uploading...' : `Upload ${photoType === 'before' ? 'Before' : 'After'} Photos`}
            </span>
          </label>
          <p className="text-xs text-gray-500 mt-2 text-center">
            Click to select multiple photos • JPG, PNG • Max 10MB each
          </p>
        </div>

        {uploadingPhotos && (
          <div className="space-y-2">
            <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
              <div className="animate-spin text-xl">⏳</div>
              <span>Uploading photos... {uploadProgress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* 🔥 DISPLAY PHOTOS - BEFORE AND AFTER IN ONE SECTION */}
      {(beforePhotos.length > 0 || afterPhotos.length > 0) ? (
        <div className="space-y-6 pt-6 border-t-2 border-blue-200">
          
          {/* BEFORE PHOTOS */}
          {beforePhotos.length > 0 && (
            <div>
              <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                📸 Before Photos ({beforePhotos.length})
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {beforePhotos.map((photo, index) => {
                  // Support both old format (string) and new format (object with thumbnail)
                  const photoUrl = typeof photo === 'string' ? photo : photo.url;
                  const thumbnailUrl = typeof photo === 'string' ? photo : (photo.thumbnail || photo.url);
                  
                  return (
                    <a
                      key={index}
                      href={photoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group relative aspect-square rounded-lg overflow-hidden border-2 border-gray-200 hover:border-blue-500 transition-all hover:shadow-lg"
                    >
                      <img
                        src={thumbnailUrl}
                        alt={`Before photo ${index + 1}`}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center">
                        <span className="text-white text-2xl opacity-0 group-hover:opacity-100 transition-opacity">
                          🔍
                        </span>
                      </div>
                    </a>
                  );
                })}
              </div>
            </div>
          )}

          {/* AFTER PHOTOS */}
          {afterPhotos.length > 0 && (
            <div>
              <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                ✨ After Photos ({afterPhotos.length})
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {afterPhotos.map((photo, index) => {
                  // Support both old format (string) and new format (object with thumbnail)
                  const photoUrl = typeof photo === 'string' ? photo : photo.url;
                  const thumbnailUrl = typeof photo === 'string' ? photo : (photo.thumbnail || photo.url);
                  
                  return (
                    <a
                      key={index}
                      href={photoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group relative aspect-square rounded-lg overflow-hidden border-2 border-gray-200 hover:border-green-500 transition-all hover:shadow-lg"
                    >
                      <img
                        src={thumbnailUrl}
                        alt={`After photo ${index + 1}`}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center">
                        <span className="text-white text-2xl opacity-0 group-hover:opacity-100 transition-opacity">
                          🔍
                        </span>
                      </div>
                    </a>
                  );
                })}
              </div>
            </div>
          )}
          
          <div className="text-xs text-gray-500 text-center mt-3">
            Click any photo to view full size
          </div>
        </div>
      ) : (
        <div className="text-center py-6 text-gray-500">
          <div className="text-4xl mb-2">📸</div>
          <p className="text-sm">No photos uploaded yet</p>
        </div>
      )}
        </div>
      )}
    </div>
  );
}