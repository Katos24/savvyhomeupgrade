'use client';

import { useState, useRef } from 'react';
import { toast } from 'sonner';
import { 
  Camera, FileText, UploadCloud, File, FileCode, 
  FileSpreadsheet, Download, Plus, Loader2, AlertCircle 
} from 'lucide-react';
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

  // Parse photos safely
  const parseJson = (val: any) => {
    if (!val) return [];
    if (typeof val === 'string') {
      try { return JSON.parse(val); } catch { return []; }
    }
    return val;
  };

  const beforePhotos = parseJson(lead?.before_photos);
  const afterPhotos = parseJson(lead?.after_photos);
  const photoCount = beforePhotos.length + afterPhotos.length;
  const documents = parseJson(lead?.documents);

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
      formData.append('docType', 'other');
      formData.append('uploadType', 'document');
      formData.append('userName', currentUser?.name || currentUser?.email || 'System');
      Array.from(files).forEach(file => formData.append('documents', file));

      // Simple simulated progress
      const interval = setInterval(() => {
        setUploadProgress((p) => (p >= 90 ? p : p + 5));
      }, 300);

      const res = await fetch('/api/leads/upload-photos', { method: 'POST', body: formData });
      clearInterval(interval);
      
      const result = await res.json();
      if (res.ok && result.success) {
        toast.success(`Successfully uploaded ${files.length} file(s)`);
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
      case 'xlsx': return <FileSpreadsheet className="w-5 h-5 text-emerald-500" />;
      case 'doc':
      case 'docx': return <FileCode className="w-5 h-5 text-blue-500" />;
      default: return <File className="w-5 h-5 text-slate-400" />;
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
      {/* Tab Navigation */}
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
              {photoCount > 0 && (
                <span className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] ${
                  activeTab === 'photos' ? 'bg-pink-100 text-pink-700' : 'bg-slate-200 text-slate-500'
                }`}>
                  {photoCount}
                </span>
              )}
            </div>
            {activeTab === 'photos' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-pink-600 rounded-t-full" />}
          </button>

          <button
            onClick={() => setActiveTab('docs')}
            className={`pb-3 text-xs font-black uppercase tracking-widest transition-all relative ${
              activeTab === 'docs' ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <div className="flex items-center gap-2">
              <FileText className="w-3.5 h-3.5" />
              Documents
              {documents.length > 0 && (
                <span className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] ${
                  activeTab === 'docs' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-200 text-slate-500'
                }`}>
                  {documents.length}
                </span>
              )}
            </div>
            {activeTab === 'docs' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-t-full" />}
          </button>
        </div>

        {activeTab === 'docs' && (
          <div className="pb-3">
            <input
              ref={inputRef}
              type="file"
              accept=".pdf,.doc,.docx,.txt,.xlsx,.xls"
              multiple
              onChange={handleUpload}
              disabled={uploading}
              className="hidden"
              id="doc-upload"
            />
            <label
              htmlFor="doc-upload"
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                uploading
                  ? 'bg-slate-100 text-slate-400'
                  : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm'
              }`}
            >
              {uploading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3" />}
              {uploading ? 'Uploading...' : 'Add Doc'}
            </label>
          </div>
        )}
      </div>

      {/* Progress Bar Overlay */}
      {uploading && (
        <div className="h-1 w-full bg-slate-100 overflow-hidden">
          <div 
            className="h-full bg-indigo-500 transition-all duration-300 ease-out" 
            style={{ width: `${uploadProgress}%` }} 
          />
        </div>
      )}

      <div className="min-h-[300px]">
        {activeTab === 'photos' ? (
          <div className="p-6">
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
          <div className="p-6">
            {documents.length > 0 ? (
              <div className="grid grid-cols-1 gap-3">
                {documents.map((doc: any, i: number) => (
                  <a
                    key={i}
                    href={doc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center justify-between p-4 rounded-xl border border-slate-100 bg-white hover:border-indigo-200 hover:shadow-md transition-all"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center group-hover:bg-indigo-50 transition-colors">
                        {getDocIcon(doc.name)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-slate-800 truncate group-hover:text-indigo-600 transition-colors">
                          {doc.name}
                        </p>
                        <p className="text-[10px] font-medium text-slate-400 uppercase tracking-tighter mt-0.5">
                          {doc.uploadedBy} • {new Date(doc.uploadedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </p>
                      </div>
                    </div>
                    <Download className="w-4 h-4 text-slate-300 group-hover:text-indigo-500 transition-colors" />
                  </a>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-slate-100 rounded-2xl bg-slate-50/30">
                <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-sm mb-4">
                  <UploadCloud className="w-8 h-8 text-slate-300" />
                </div>
                <h4 className="text-sm font-bold text-slate-900">No documents found</h4>
                <p className="text-xs text-slate-500 mt-1 max-w-[200px] text-center leading-relaxed">
                  Store contracts, site plans, and permits here for easy access.
                </p>
                <label htmlFor="doc-upload" className="mt-6 text-xs font-black text-indigo-600 hover:text-indigo-700 cursor-pointer uppercase tracking-widest">
                  Choose Files
                </label>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}