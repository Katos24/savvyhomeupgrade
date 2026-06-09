'use client';

import { useState, useRef } from 'react';
import { toast } from 'sonner';
import {
  Camera, FileText, UploadCloud, File, FileCode,
  FileSpreadsheet, Download, Plus, Loader2,
} from 'lucide-react';
import PhotoUpload from '../PhotoUpload';

import {
  X, ChevronLeft, ChevronRight,
} from 'lucide-react';
import { useEffect } from 'react';

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
  const touchStartX = useRef<number | null>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') setCurrent(c => (c + 1) % photos.length);
      if (e.key === 'ArrowLeft') setCurrent(c => (c - 1 + photos.length) % photos.length);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [photos.length, onClose]);

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

  const handleDownload = async () => {
    const url = photos[current];
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      const ext = url.split('.').pop()?.split('?')[0] || 'jpg';
      a.download = `photo-${current + 1}.${ext}`;
      a.click();
      URL.revokeObjectURL(blobUrl);
    } catch {
      window.open(url, '_blank');
    }
  };

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 99999,
        backgroundColor: 'rgba(0,0,0,0.92)',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
      }}
      onClick={onClose}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Top bar */}
      <div
        style={{
          position: 'absolute', top: 0, left: 0, right: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '16px',
          paddingTop: 'max(16px, env(safe-area-inset-top))',
          zIndex: 10,
        }}
        onClick={e => e.stopPropagation()}
      >
        <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          {label} {photos.length > 1 && `· ${current + 1} / ${photos.length}`}
        </span>
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={handleDownload}
            style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '50%', width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
          >
            <Download style={{ width: 18, height: 18, color: 'white' }} />
          </button>
          <button
            onClick={onClose}
            style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '50%', width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
          >
            <X style={{ width: 18, height: 18, color: 'white' }} />
          </button>
        </div>
      </div>

      {/* Image */}
      <div
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, width: '100%', padding: '80px 8px' }}
        onClick={e => e.stopPropagation()}
      >
        {photos.length > 1 && (
          <button
            onClick={() => setCurrent(c => (c - 1 + photos.length) % photos.length)}
            style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '50%', width: 44, height: 44, minWidth: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}
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
            objectFit: 'contain', borderRadius: 12,
            WebkitUserSelect: 'none', userSelect: 'none',
          }}
          draggable={false}
        />
        {photos.length > 1 && (
          <button
            onClick={() => setCurrent(c => (c + 1) % photos.length)}
            style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '50%', width: 44, height: 44, minWidth: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}
          >
            <ChevronRight style={{ width: 22, height: 22, color: 'white' }} />
          </button>
        )}
      </div>

      {/* Thumbnails */}
      {photos.length > 1 && (
        <div
          style={{
            position: 'absolute',
            bottom: 'max(16px, env(safe-area-inset-bottom))',
            left: 0, right: 0,
            display: 'flex', justifyContent: 'center', gap: 6,
            padding: '0 16px', overflowX: 'auto',
          }}
          onClick={e => e.stopPropagation()}
        >
          {photos.map((url, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              style={{
                width: 44, height: 44, minWidth: 44, borderRadius: 8,
                overflow: 'hidden', flexShrink: 0, padding: 0, cursor: 'pointer',
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

// ─── Helpers ──────────────────────────────────────────────────────────────────

function isImageFile(f: any): boolean {
  const name = (typeof f === 'string' ? f : f?.name || f?.url || '').toLowerCase();
  if (f?.type?.startsWith('image/')) return true;
  return !!name.match(/\.(jpg|jpeg|png|gif|webp|heic)(\?|$)/i);
}

function isVideoFile(f: any): boolean {
  const name = (typeof f === 'string' ? f : f?.name || f?.url || '').toLowerCase();
  if (f?.type?.startsWith('video/')) return true;
  return !!name.match(/\.(mp4|mov|avi|webm|quicktime)(\?|$)/i);
}

function isDocFile(f: any): boolean {
  return !isImageFile(f) && !isVideoFile(f);
}

function getFileUrl(f: any): string {
  if (typeof f === 'string') return f;
  return f?.url || f?.path || '';
}

function getFileName(f: any): string {
  if (typeof f === 'string') {
    const parts = f.split('/');
    return parts[parts.length - 1]?.split('?')[0] || 'File';
  }
  return f?.name || 'Document';
}

// ─── Types ────────────────────────────────────────────────────────────────────

type MediaSectionProps = {
  lead: any;
  currentUser: any;
  onRefresh: () => Promise<void>;
  hasProject: boolean;
};

// ─── Main Component ───────────────────────────────────────────────────────────

export default function MediaSection({ lead, currentUser, onRefresh, hasProject }: MediaSectionProps) {
  const [activeTab, setActiveTab] = useState<'photos' | 'docs'>('photos');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [docType, setDocType] = useState<'document' | 'receipt' | 'permit' | 'contract'>('document');
  const [lightbox, setLightbox] = useState<{ photos: string[]; index: number; label?: string } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const parseJson = (val: any) => {
    if (!val) return [];
    if (typeof val === 'string') {
      try { return JSON.parse(val); } catch { return []; }
    }
    return val;
  };

  const beforePhotos = parseJson(lead?.before_photos);
  const afterPhotos = parseJson(lead?.after_photos);

  // Split customer uploads into photos vs documents
  const customerFiles = Array.isArray(lead?.file_urls) ? lead.file_urls : [];

  const customerPhotos: string[] = customerFiles
    .filter((f: any) => isImageFile(f))
    .map((f: any) => getFileUrl(f))
    .filter(Boolean);

  const customerVideos: any[] = customerFiles
    .filter((f: any) => isVideoFile(f))
    .map((f: any) => ({ url: getFileUrl(f), name: getFileName(f) }))
    .filter((f: any) => f.url);

  const customerDocs: any[] = customerFiles
    .filter((f: any) => isDocFile(f))
    .map((f: any) => ({ url: getFileUrl(f), name: getFileName(f) }))
    .filter((f: any) => f.url);

  const photoCount = beforePhotos.length + afterPhotos.length;
  const documents = parseJson(lead?.documents);
  const allDocs = [...documents, ...customerDocs];
  

  const MAX_SIZE = 15 * 1024 * 1024;

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    for (const file of Array.from(files)) {
      if (file.size > MAX_SIZE) {
        toast.error(`${file.name} exceeds 15MB limit.`);
        if (inputRef.current) inputRef.current.value = '';
        return;
      }
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('leadId', lead.id.toString());
formData.append('docType', docType);
      formData.append('uploadType', 'document');
      formData.append('userName', currentUser?.name || currentUser?.email || 'System');
      Array.from(files).forEach(file => formData.append('documents', file));

      const interval = setInterval(() => {
        setUploadProgress((p) => (p >= 90 ? p : p + 5));
      }, 300);

const res = await fetch(`/api/leads/upload-photos`, {
        method: 'POST',
        body: formData,
      });

      clearInterval(interval);
      const result = await res.json();

      if (res.ok && result.success) {
        toast.success(`Uploaded ${files.length} file(s)`);
        await onRefresh();
      } else {
        toast.error(result.error || 'Upload failed');
      }
    } catch {
      toast.error('Network error during upload');
    } finally {
      setUploading(false);
      setUploadProgress(0);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const getDocIcon = (name: string) => {
    const ext = name.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'pdf': return <FileText className="w-5 h-5 text-rose-500" />;
      case 'xls':
      case 'xlsx':
      case 'csv': return <FileSpreadsheet className="w-5 h-5 text-emerald-500" />;
      case 'doc':
      case 'docx': return <FileCode className="w-5 h-5 text-blue-500" />;
      default: return <File className="w-5 h-5 text-slate-400" />;
    }
  };

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

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        {/* Tabs Header */}
        <div className="px-5 pt-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex gap-6">
            <button
              onClick={() => setActiveTab('photos')}
              className={`pb-3 text-xs font-black uppercase tracking-widest transition-all relative ${
                activeTab === 'photos' ? 'text-pink-600' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <div className="flex items-center gap-2">
                <Camera className="w-3.5 h-3.5" />
                Photos
                {(photoCount + customerPhotos.length + customerVideos.length) > 0 && (
                  <span className={`ml-1.5 px-2 py-0.5 rounded-full text-[10px] ${
                    activeTab === 'photos' ? 'bg-pink-100 text-pink-700' : 'bg-slate-200 text-slate-500'
                  }`}>
                    {photoCount + customerPhotos.length + customerVideos.length}
                  </span>
                )}
              </div>
              {activeTab === 'photos' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-pink-600" />}
            </button>

            <button
              onClick={() => setActiveTab('docs')}
              className={`pb-3 text-xs font-black uppercase tracking-widest transition-all relative ${
                activeTab === 'docs' ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <div className="flex items-center gap-2">
                <FileText className="w-3.5 h-3.5" />
                Documents
                {allDocs.length > 0 && (
                  <span className={`ml-1.5 px-2 py-0.5 rounded-full text-[10px] ${
                    activeTab === 'docs' ? 'bg-blue-100 text-blue-700' : 'bg-slate-200 text-slate-500'
                  }`}>
                    {allDocs.length}
                  </span>
                )}
              </div>
              {activeTab === 'docs' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />}
            </button>
          </div>

          {activeTab === 'docs' && (
            <div className="pb-3">
              <input
                ref={inputRef}
                type="file"
                accept=".pdf,.doc,.docx,.txt,.xlsx,.xls,.csv"
                multiple
                onChange={handleUpload}
                disabled={uploading}
                className="hidden"
                id="doc-upload"
              />
             <div className="flex items-center gap-2">
  <select
    value={docType}
    onChange={e => setDocType(e.target.value as typeof docType)}
    className="text-[10px] font-bold uppercase tracking-widest border border-slate-200 rounded-lg px-2 py-1.5 bg-white text-slate-600 cursor-pointer"
  >
    <option value="document">Document</option>
    <option value="receipt">Receipt</option>
    <option value="permit">Permit</option>
    <option value="contract">Contract</option>
  </select>
  <label
    htmlFor="doc-upload"
    className="flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest bg-blue-600 text-white hover:bg-blue-700 shadow-md cursor-pointer transition-all active:scale-95"
  >
    {uploading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3" />}
    {uploading ? 'Uploading' : 'Add'}
  </label>
</div>
            </div>
          )}
        </div>

        {/* Progress Bar */}
        {uploading && (
          <div className="h-1 w-full bg-slate-100">
            <div
              className="h-full bg-blue-500 transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        )}

        <div className="min-h-[400px]">
          {activeTab === 'photos' ? (
            <div className="p-4 sm:p-6 space-y-6">
              {/* Customer Photos with Lightbox */}
              {customerPhotos.length > 0 && (
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <Camera className="w-3.5 h-3.5 text-pink-400" />
                    Submitted by Customer ({customerPhotos.length})
                  </p>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {customerPhotos.map((url: string, i: number) => (
                      <button
                        key={i}
                        onClick={() => setLightbox({ photos: customerPhotos, index: i, label: 'Customer Photos' })}
                        className="group aspect-square rounded-xl overflow-hidden border border-slate-100 hover:border-pink-300 hover:shadow-md transition-all"
                      >
                        <img
                          src={url}
                          alt={`Customer photo ${i + 1}`}
                          className="w-full h-full object-cover group-hover:opacity-90 transition"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Customer Videos */}
              {customerVideos.length > 0 && (
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <Camera className="w-3.5 h-3.5 text-blue-400" />
                    Videos from Customer ({customerVideos.length})
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {customerVideos.map((vid: any, i: number) => (
                      <a
                        key={i}
                        href={vid.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/50 transition-all"
                      >
                        <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                          <Camera className="w-5 h-5 text-blue-500" />
                        </div>
                        <span className="text-xs font-bold text-slate-700 truncate">{vid.name}</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              <PhotoUpload
                leadId={lead.id}
                currentUser={currentUser}
                onUploadComplete={onRefresh}
                beforePhotos={beforePhotos}
                afterPhotos={afterPhotos}
                hasProject={hasProject}
              />
            </div>
          ) : (
            <div className="p-4 sm:p-6">
              {allDocs.length > 0 ? (
                <div className="space-y-6">
                  {/* Customer-submitted docs */}
                  {customerDocs.length > 0 && (
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                        <FileText className="w-3.5 h-3.5 text-blue-400" />
                        From Customer ({customerDocs.length})
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {customerDocs.map((doc: any, i: number) => (
                          <a
                            key={`cust-${i}`}
                            href={doc.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group flex items-center justify-between p-4 rounded-2xl border border-slate-100 bg-white hover:border-blue-200 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                          >
                            <div className="flex items-center gap-4 min-w-0 flex-1">
                              <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center group-hover:bg-blue-50 transition-colors shrink-0">
                                {getDocIcon(doc.name)}
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-black text-slate-800 truncate pr-4">
                                  {doc.name}
                                </p>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight mt-1">
                                  Submitted by customer
                                </p>
                              </div>
                            </div>
                            <Download className="w-4 h-4 text-slate-300 shrink-0" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Team-uploaded docs */}
                  {documents.length > 0 && (
                    <div>
                      {customerDocs.length > 0 && (
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                          <FileText className="w-3.5 h-3.5 text-slate-400" />
                          Team Documents ({documents.length})
                        </p>
                      )}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {documents.map((doc: any, i: number) => (
                          <a
                            key={`team-${i}`}
                            href={doc.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group flex items-center justify-between p-4 rounded-2xl border border-slate-100 bg-white hover:border-blue-200 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                          >
                            <div className="flex items-center gap-4 min-w-0 flex-1">
                              <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center group-hover:bg-blue-50 transition-colors shrink-0">
                                {getDocIcon(doc.name)}
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-black text-slate-800 truncate pr-4">
                                  {doc.name}
                                </p>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight mt-1">
  {new Date(doc.uploadedAt).toLocaleDateString()} · {doc.uploadedBy}
</p>
<p className="text-[10px] font-bold uppercase tracking-tight mt-0.5" style={{color: doc.type === 'receipt' ? '#f59e0b' : doc.type === 'permit' ? '#10b981' : doc.type === 'contract' ? '#6366f1' : '#94a3b8'}}>
  {doc.type || 'document'}
</p>
                              </div>
                            </div>
                            <Download className="w-4 h-4 text-slate-300 shrink-0" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-slate-100 rounded-3xl bg-slate-50/30">
                  <UploadCloud className="w-10 h-10 text-slate-200 mb-4" />
                  <h4 className="text-xs font-black uppercase tracking-widest text-slate-400">Project Documents</h4>
                  <p className="text-[11px] text-slate-400 mt-2 text-center max-w-[240px] font-medium leading-relaxed">
                    Upload contracts, permits, or insurance docs to keep the project organized.
                  </p>
                  <label
                    htmlFor="doc-upload"
                    className="mt-8 px-6 py-2.5 rounded-xl border border-slate-200 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 hover:bg-white hover:border-blue-300 hover:text-blue-600 transition-all cursor-pointer shadow-sm"
                  >
                    Browse Files
                  </label>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}