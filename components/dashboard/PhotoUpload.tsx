'use client';

import { useState, useRef } from 'react';
import { toast } from 'sonner';

type PhotoUploadProps = {
  leadId: number;
  currentUser: any;
  onUploadComplete: () => Promise<void>;
};

export default function PhotoUpload({ leadId, currentUser, onUploadComplete }: PhotoUploadProps) {
  const [uploadingPhotos, setUploadingPhotos] = useState(false);
  const [photoType, setPhotoType] = useState<'before' | 'after'>('before');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingPhotos(true);
    
    try {
      const formData = new FormData();
      formData.append('leadId', leadId.toString());
      formData.append('photoType', photoType);
      formData.append('userName', currentUser?.name || currentUser?.email || 'Unknown User');
      
      for (let i = 0; i < files.length; i++) {
        formData.append('photos', files[i]);
      }

      const response = await fetch('/api/leads/upload-photos', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (response.ok && result.success) {
        toast.success(`✅ ${files.length} ${photoType} photo${files.length > 1 ? 's' : ''} uploaded!`);
        await onUploadComplete();
      } else {
        toast.error('Failed to upload photos');
      }
    } catch (error) {
      console.error('Photo upload error:', error);
      toast.error('Failed to upload photos');
    } finally {
      setUploadingPhotos(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-xl border-2 border-green-200 p-4 sm:p-6">
      <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">📸 Add Job Photos</h3>
      
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
            ref={fileInputRef}
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
            Click to select multiple photos • Max 10MB each
          </p>
        </div>

        {uploadingPhotos && (
          <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
            <div className="animate-spin text-xl">⏳</div>
            <span>Uploading photos...</span>
          </div>
        )}
      </div>
    </div>
  );
}