'use client';

import { useState, useRef } from 'react';
import { toast } from 'sonner';
import PhotoUpload from '../PhotoUpload';

type MediaSectionProps = {
  lead: any;
  currentUser: any;
  onRefresh: () => Promise<void>;
  hasProject: boolean;
};

export default function MediaSection({ lead, currentUser, onRefresh, hasProject }: MediaSectionProps) {
  const [activeTab, setActiveTab] = useState<'photos' | 'docs'>('photos');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const beforePhotos = lead?.before_photos
    ? typeof lead.before_photos === 'string' ? JSON.parse(lead.before_photos) : lead.before_photos
    : [];
  const afterPhotos = lead?.after_photos
    ? typeof lead.after_photos === 'string' ? JSON.parse(lead.after_photos) : lead.after_photos
    : [];
  const photoCount = beforePhotos.length + afterPhotos.length;

  const documents: any[] = lead?.documents
    ? typeof lead.documents === 'string' ? JSON.parse(lead.documents) : lead.documents
    : [];

  const MAX_SIZE = 15 * 1024 * 1024;

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    for (let i = 0; i < files.length; i++) {
      if (files[i].size > MAX_SIZE) {
        toast.error(`${files[i].name} is too large! Max 15MB.`);
        if (inputRef.current) inputRef.current.value = '';
        return;
      }
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('leadId', lead.id.toString());
      formData.append('docType', 'other');
      formData.append('uploadType', 'document');
      formData.append('userName', currentUser?.name || currentUser?.email || 'Unknown');
      for (let i = 0; i < files.length; i++) formData.append('documents', files[i]);

      const interval = setInterval(() => {
        setUploadProgress((p) => (p >= 90 ? p : p + 10));
      }, 500);

      const res = await fetch('/api/leads/upload-photos', { method: 'POST', body: formData });
      clearInterval(interval);
      setUploadProgress(100);

      const result = await res.json();
      if (res.ok && result.success) {
        toast.success(`${files.length} document${files.length > 1 ? 's' : ''} uploaded!`);
        await onRefresh();
      } else {
        toast.error(result.error || 'Upload failed');
      }
    } catch {
      toast.error('Upload failed');
    } finally {
      setUploading(false);
      setUploadProgress(0);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const getDocIcon = (name: string) => {
    const ext = name.split('.').pop()?.toLowerCase();
    if (ext === 'pdf') return '📕';
    if (ext === 'doc' || ext === 'docx') return '📘';
    if (ext === 'xls' || ext === 'xlsx') return '📊';
    if (ext === 'txt') return '📄';
    return '📎';
  };

  return (
    <div className="overflow-hidden">
      {/* Header with sub-tabs */}
      <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
        <div className="flex gap-1">
          <button
            onClick={() => setActiveTab('photos')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold transition ${
              activeTab === 'photos'
                ? 'bg-pink-100 text-pink-700'
                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
            }`}
          >
            📷 Photos
            {photoCount > 0 && (
              <span className={`px-1.5 py-0.5 text-xs font-bold rounded-full ${
                activeTab === 'photos' ? 'bg-pink-200 text-pink-800' : 'bg-gray-200 text-gray-600'
              }`}>
                {photoCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('docs')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold transition ${
              activeTab === 'docs'
                ? 'bg-indigo-100 text-indigo-700'
                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
            }`}
          >
            📁 Docs
            {documents.length > 0 && (
              <span className={`px-1.5 py-0.5 text-xs font-bold rounded-full ${
                activeTab === 'docs' ? 'bg-indigo-200 text-indigo-800' : 'bg-gray-200 text-gray-600'
              }`}>
                {documents.length}
              </span>
            )}
          </button>
        </div>

        {/* Upload button for docs tab */}
        {activeTab === 'docs' && (
          <div>
            <input
              ref={inputRef}
              type="file"
              accept=".pdf,.doc,.docx,.txt,.xlsx,.xls"
              multiple
              onChange={handleUpload}
              disabled={uploading}
              className="hidden"
              id={`doc-upload-${lead.id}`}
            />
            <label
              htmlFor={`doc-upload-${lead.id}`}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
                uploading
                  ? 'opacity-50 cursor-not-allowed bg-gray-100 text-gray-400'
                  : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-600'
              }`}
            >
              📤 {uploading ? `Uploading ${uploadProgress}%` : 'Upload'}
            </label>
          </div>
        )}
      </div>

      {/* Progress bar */}
      {uploading && (
        <div className="w-full bg-indigo-100 h-1">
          <div className="bg-indigo-500 h-1 transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
        </div>
      )}

      {/* Photos tab */}
      {activeTab === 'photos' && (
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
      )}

      {/* Docs tab */}
      {activeTab === 'docs' && (
        <div className="p-5">
          {documents.length > 0 ? (
            <div className="space-y-2">
              {documents.map((doc: any, i: number) => (
                <a
                  key={i}
                  href={doc.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-3 p-3 border border-gray-100 hover:border-indigo-200 hover:bg-indigo-50 transition"
                >
                  <span className="text-xl flex-shrink-0">{getDocIcon(doc.name)}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate group-hover:text-indigo-600 transition">
                      {doc.name}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {doc.uploadedBy} ·{' '}
                      {new Date(doc.uploadedAt).toLocaleDateString('en-US', {
                        month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
                      })}
                    </p>
                  </div>
                  <span className="text-gray-300 group-hover:text-indigo-400 transition text-lg flex-shrink-0">⬇️</span>
                </a>
              ))}
            </div>
          ) : (
            <div className="py-10 flex flex-col items-center gap-2 text-center">
              <span className="text-4xl">📂</span>
              <p className="text-sm font-semibold text-gray-500">No documents yet</p>
              <p className="text-xs text-gray-400">Upload contracts, invoices, or other files</p>
              <p className="text-xs text-gray-300 mt-1">PDF, Word, Excel, TXT · Max 15MB</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}