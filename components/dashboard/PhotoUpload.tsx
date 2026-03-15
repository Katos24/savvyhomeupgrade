'use client';

import { useState, useRef } from 'react';
import { toast } from 'sonner';
import { 
  Camera, Plus, Loader2, Maximize2, Trash2, 
  Image as ImageIcon 
} from 'lucide-react';

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
  const [deletingId, setDeletingId] = useState<number | null>(null);
  
  const photoInputRef = useRef<HTMLInputElement>(null);
  const MAX_PHOTO_SIZE = 10 * 1024 * 1024; // 10MB

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    for (const file of Array.from(files)) {
      if (file.size > MAX_PHOTO_SIZE) {
        toast.error(`${file.name} is too large (Max 10MB)`);
        return;
      }
    }

    setUploadingPhotos(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('leadId', leadId.toString());
      formData.append('photoType', 'before'); 
      formData.append('uploadType', 'photo');
      formData.append('userName', currentUser?.name || currentUser?.email || 'User');

      Array.from(files).forEach(file => formData.append('photos', file));

      const interval = setInterval(() => {
        setUploadProgress(prev => (prev >= 95 ? prev : prev + 5));
      }, 200);

      const response = await fetch('/api/leads/upload-photos', {
        method: 'POST',
        body: formData,
      });

      clearInterval(interval);
      
      const result = await response.json();

      if (response.ok && result.success) {
        toast.success(`Uploaded ${files.length} photo${files.length > 1 ? 's' : ''}`);
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
      if (photoInputRef.current) photoInputRef.current.value = '';
    }
  };

  const handleDelete = async (photoUrl: string, index: number) => {
    if (!confirm("Remove this photo? This cannot be undone.")) return;
    
    setDeletingId(index);
    try {
      const res = await fetch(`/api/leads/${leadId}/delete-media`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ photoUrl }),
});
      
      const data = await res.json();
      
      if (res.ok && data.success) {
        toast.success("Photo removed");
        await onUploadComplete();
      } else {
        toast.error(data.error || "Failed to delete photo");
      }
    } catch (err) {
      console.error('Delete error:', err);
      toast.error("Network error. Failed to delete.");
    } finally {
      setDeletingId(null);
    }
  };

  if (!hasProject) return null;

  return (
    <div className="space-y-6">
      {/* Header with Counter */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-slate-100 rounded-lg text-slate-600">
            <Camera className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-black uppercase tracking-tight text-slate-900">Project Gallery</h3>
          <span className="ml-1 px-2 py-0.5 bg-indigo-50 text-indigo-600 text-[10px] font-black rounded-full border border-indigo-100">
            {beforePhotos.length}
          </span>
        </div>
        
        {beforePhotos.length > 0 && (
          <label 
            htmlFor={`photo-upload-${leadId}`} 
            className="text-[10px] font-black text-indigo-600 hover:text-indigo-700 cursor-pointer uppercase tracking-widest flex items-center gap-1"
          >
            <Plus className="w-3 h-3" /> Add More
          </label>
        )}
      </div>

      {/* PHOTO GRID */}
      {beforePhotos.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {beforePhotos.map((photo: Photo, index) => {
            const photoUrl = typeof photo === 'string' ? photo : photo.url;
            const thumbnailUrl = typeof photo === 'string' ? photo : (photo.thumbnail || photo.url);
            
            return (
              <div key={index} className="group relative aspect-square rounded-2xl overflow-hidden bg-slate-100 border border-slate-200">
                <img
                  src={thumbnailUrl}
                  alt="Project site"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                
                {/* Overlay Actions */}
                <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                  <a 
                    href={photoUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="p-2 bg-white text-slate-900 rounded-full hover:scale-110 transition-transform shadow-xl"
                  >
                    <Maximize2 className="w-4 h-4" />
                  </a>
                  <button 
                    onClick={() => handleDelete(photoUrl, index)}
                    disabled={deletingId !== null}
                    className="p-2 bg-white text-rose-600 rounded-full hover:scale-110 transition-transform shadow-xl disabled:opacity-50"
                  >
                    {deletingId === index ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="border-2 border-dashed border-slate-100 rounded-[2rem] p-12 text-center bg-slate-50/30">
          <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-4">
            <ImageIcon className="w-8 h-8 text-slate-200" />
          </div>
          <h4 className="text-sm font-bold text-slate-900">No project photos</h4>
          <p className="text-xs text-slate-500 mt-1 max-w-[220px] mx-auto leading-relaxed">
            Upload site photos to track progress and share with the customer.
          </p>
        </div>
      )}

      {/* UPLOAD TRIGGER AREA */}
      <div className="relative">
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
        
        {uploadingPhotos ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Loader2 className="w-5 h-5 text-indigo-600 animate-spin" />
                <span className="text-sm font-bold text-slate-700">Uploading Assets...</span>
              </div>
              <span className="text-xs font-black text-slate-400">{uploadProgress}%</span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-indigo-600 h-full transition-all duration-300 ease-out"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        ) : (
          <label
            htmlFor={`photo-upload-${leadId}`}
            className="group flex flex-col items-center justify-center p-8 rounded-[2rem] border-2 border-dashed border-indigo-200 bg-indigo-50/50 hover:bg-indigo-50 hover:border-indigo-400 transition-all cursor-pointer"
          >
            <div className="p-4 bg-white rounded-2xl shadow-sm mb-3 group-hover:scale-110 transition-transform">
              <Camera className="w-6 h-6 text-indigo-600" />
            </div>
            <span className="text-sm font-black text-indigo-900 uppercase tracking-widest">
              Upload New Photos
            </span>
            <span className="text-[10px] text-indigo-400 mt-2 font-bold uppercase tracking-tight">
              JPG, PNG • Max 10MB per file
            </span>
          </label>
        )}
      </div>
    </div>
  );
}