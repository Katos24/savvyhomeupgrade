'use client';

import { useState, useRef, useEffect } from 'react';
import { toast } from 'sonner';
import {
  Camera, Plus, Loader2, Image as ImageIcon,
  X, ChevronLeft, ChevronRight, Download, UploadCloud,
} from 'lucide-react';

type Photo = string | { url: string; thumbnail: string };

type PhotoUploadProps = {
  leadId: number;
  currentUser: any;
  onUploadComplete: () => Promise<void>;
  beforePhotos?: Photo[];
  afterPhotos?: Photo[];
  hasProject: boolean;
  customerPhotos?: string[];
};

function Lightbox({
  photos,
  startIndex,
  onClose,
  label,
}: {
  photos: string[];
  startIndex: number;
  onClose: () => void;
  label?: string;
}) {
  const [current, setCurrent] = useState(startIndex);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') setCurrent(c => (c + 1) % photos.length);
      if (e.key === 'ArrowLeft') setCurrent(c => (c - 1 + photos.length) % photos.length);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [photos.length, onClose]);

  // Touch swipe support
  const touchStartX = useRef<number | null>(null);
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(delta) > 50) {
      if (delta < 0) setCurrent(c => (c + 1) % photos.length);
      else setCurrent(c => (c - 1 + photos.length) % photos.length);
    }
    touchStartX.current = null;
  };

  const prev = () => setCurrent(c => (c - 1 + photos.length) % photos.length);
  const next = () => setCurrent(c => (c + 1) % photos.length);

  const handleDownload = async () => {
    const url = photos[current];
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      const ext = url.split('.').pop()?.split('?')[0] || 'jpg';
      a.download = `photo-${current + 1}.${ext}`;
      a.click();
      URL.revokeObjectURL(blobUrl);
    } catch {
      // Fallback: open in new tab so mobile users can long-press save
      window.open(url, '_blank');
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        backgroundColor: 'rgba(0,0,0,0.92)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      onClick={onClose}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Top bar */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px',
          zIndex: 10,
          // Safe area for iPhone notch
          paddingTop: 'max(16px, env(safe-area-inset-top))',
        }}
        onClick={e => e.stopPropagation()}
      >
        <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          {label} {photos.length > 1 && `· ${current + 1} / ${photos.length}`}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Download / Save button */}
          <button
            onClick={handleDownload}
            title="Download photo"
            style={{
              background: 'rgba(255,255,255,0.15)',
              border: 'none',
              borderRadius: '50%',
              width: 40,
              height: 40,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <Download style={{ width: 18, height: 18, color: 'white' }} />
          </button>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.15)',
              border: 'none',
              borderRadius: '50%',
              width: 40,
              height: 40,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <X style={{ width: 18, height: 18, color: 'white' }} />
          </button>
        </div>
      </div>

      {/* Image area */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 12,
          width: '100%',
          padding: '80px 8px 80px',
        }}
        onClick={e => e.stopPropagation()}
      >
        {photos.length > 1 && (
          <button
            onClick={prev}
            style={{
              background: 'rgba(255,255,255,0.15)',
              border: 'none',
              borderRadius: '50%',
              // Larger tap target on mobile
              width: 44,
              height: 44,
              minWidth: 44,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              flexShrink: 0,
            }}
          >
            <ChevronLeft style={{ width: 22, height: 22, color: 'white' }} />
          </button>
        )}

        <img
          src={photos[current]}
          alt={`Photo ${current + 1}`}
          style={{
            maxHeight: '65vh',
            maxWidth: photos.length > 1 ? 'calc(100vw - 120px)' : '92vw',
            objectFit: 'contain',
            borderRadius: 12,
            // Prevent context menu / long-press saving is still allowed for mobile
            WebkitUserSelect: 'none',
            userSelect: 'none',
          }}
          draggable={false}
        />

        {photos.length > 1 && (
          <button
            onClick={next}
            style={{
              background: 'rgba(255,255,255,0.15)',
              border: 'none',
              borderRadius: '50%',
              width: 44,
              height: 44,
              minWidth: 44,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              flexShrink: 0,
            }}
          >
            <ChevronRight style={{ width: 22, height: 22, color: 'white' }} />
          </button>
        )}
      </div>

      {/* Thumbnails — hidden on very small screens to save space */}
      {photos.length > 1 && (
        <div
          style={{
            position: 'absolute',
            bottom: 'max(16px, env(safe-area-inset-bottom))',
            left: 0,
            right: 0,
            display: 'flex',
            justifyContent: 'center',
            gap: 6,
            padding: '0 16px',
            overflowX: 'auto',
          }}
          onClick={e => e.stopPropagation()}
        >
          {photos.map((url, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              style={{
                width: 44,
                height: 44,
                minWidth: 44,
                borderRadius: 8,
                overflow: 'hidden',
                flexShrink: 0,
                padding: 0,
                cursor: 'pointer',
                border: i === current ? '2px solid white' : '2px solid rgba(255,255,255,0.2)',
                opacity: i === current ? 1 : 0.5,
                transform: i === current ? 'scale(1.1)' : 'scale(1)',
                transition: 'all 0.15s',
              }}
            >
              <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function PhotoUpload({
  leadId,
  currentUser,
  onUploadComplete,
  beforePhotos = [],
  hasProject,
  customerPhotos = [],
}: PhotoUploadProps) {
  const [uploadingPhotos, setUploadingPhotos] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [localPhotos, setLocalPhotos] = useState<Photo[]>(beforePhotos);
  const [lightbox, setLightbox] = useState<{ photos: string[]; index: number; label?: string } | null>(null);

  const photoInputRef = useRef<HTMLInputElement>(null);
  const MAX_PHOTO_SIZE = 10 * 1024 * 1024;

  useEffect(() => {
    setLocalPhotos(beforePhotos);
  }, [beforePhotos]);

  const getUrl = (photo: Photo) => typeof photo === 'string' ? photo : photo.url;
  const getThumb = (photo: Photo) => typeof photo === 'string' ? photo : (photo.thumbnail || photo.url);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    for (const file of Array.from(files)) {
      if (file.size > MAX_PHOTO_SIZE) {
        toast.error(`${file.name} is too large (Max 10MB)`);
        return;
      }
    }

    const previewUrls = Array.from(files).map(f => URL.createObjectURL(f));
    setLocalPhotos(prev => [...prev, ...previewUrls]);

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
        setLocalPhotos(beforePhotos);
        toast.error(result.error || 'Failed to upload photos');
      }
    } catch (error) {
      console.error('Photo upload error:', error);
      setLocalPhotos(beforePhotos);
      toast.error('Failed to upload photos');
    } finally {
      setUploadingPhotos(false);
      setUploadProgress(0);
      if (photoInputRef.current) photoInputRef.current.value = '';
    }
  };

  if (!hasProject) return null;

  const projectPhotoUrls = localPhotos.map(getUrl);

 return (
    <>
      {lightbox && (
        <Lightbox
          photos={lightbox.photos}
          startIndex={lightbox.index}
          onClose={() => setLightbox(null)}
          label={lightbox.label}
        />
      )}

      <div className="space-y-5">

        {/* Customer Photos */}
        {customerPhotos.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Camera className="w-3.5 h-3.5 text-pink-400" />
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Submitted by Customer ({customerPhotos.length})
              </p>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 sm:gap-3">
              {customerPhotos.map((url, i) => (
                <button
                  key={i}
                  onClick={() => setLightbox({ photos: customerPhotos, index: i, label: 'Customer Photos' })}
                  className="group relative aspect-square rounded-xl overflow-hidden bg-slate-100 border border-slate-200 hover:border-pink-300 hover:shadow-md transition-all"
                >
                  <img
                    src={url}
                    alt={`Customer photo ${i + 1}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="bg-white/90 rounded-full p-1.5">
                      <ImageIcon className="w-4 h-4 text-slate-700" />
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Project Gallery Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-slate-100 rounded-lg">
              <Camera className="w-4 h-4 text-slate-600" />
            </div>
            <h3 className="text-sm font-black uppercase tracking-tight text-slate-900">Project Gallery</h3>
            <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-[10px] font-black rounded-full border border-blue-100">
              {localPhotos.length}
            </span>
          </div>
          {localPhotos.length > 0 && (
            <label
              htmlFor={`photo-upload-${leadId}`}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest cursor-pointer hover:bg-blue-700 transition-all active:scale-95 shadow-sm"
            >
              <Plus className="w-3 h-3" />
              Add Photos
            </label>
          )}
        </div>

        {/* Photo Grid */}
        {localPhotos.length > 0 ? (
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 sm:gap-3">
            {localPhotos.map((photo, index) => (
              <button
                key={index}
                onClick={() => setLightbox({ photos: projectPhotoUrls, index, label: 'Project Gallery' })}
                className="group relative aspect-square rounded-xl overflow-hidden bg-slate-100 border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all"
              >
                <img
                  src={getThumb(photo)}
                  alt="Project site"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="bg-white/90 rounded-full p-1.5">
                    <ImageIcon className="w-4 h-4 text-slate-700" />
                  </div>
                </div>
              </button>
            ))}
          </div>
        ) : (
          /* Empty State */
          <label
            htmlFor={`photo-upload-${leadId}`}
            className="group flex flex-col items-center justify-center gap-4 p-10 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 hover:border-blue-300 hover:bg-blue-50/40 transition-all cursor-pointer active:bg-blue-50"
          >
            <div className="w-16 h-16 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-center group-hover:border-blue-200 group-hover:shadow-md transition-all">
              <UploadCloud className="w-8 h-8 text-slate-300 group-hover:text-blue-400 transition-colors" />
            </div>
            <div className="text-center space-y-1">
              <p className="text-sm font-black text-slate-700 uppercase tracking-widest">Upload Project Photos</p>
              <p className="text-xs text-slate-400 font-medium">Track progress and keep the job organized</p>
              <p className="text-[10px] text-slate-300 font-bold uppercase tracking-tight mt-2">JPG, PNG · Max 10MB</p>
            </div>
            <div className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-black uppercase tracking-widest shadow-md group-hover:bg-blue-700 transition-all">
              <Camera className="w-4 h-4" />
              Add Photos
            </div>
          </label>
        )}

        {/* Upload input + progress */}
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

          {uploadingPhotos && (
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
                  <span className="text-sm font-bold text-slate-700">Uploading photos...</span>
                </div>
                <span className="text-xs font-black text-slate-400">{uploadProgress}%</span>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-blue-600 h-full transition-all duration-300 ease-out rounded-full"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}
        </div>

      </div>
    </>
  );
}