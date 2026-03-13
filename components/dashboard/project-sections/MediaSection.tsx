'use client';

import { useState, useRef } from 'react';
import { toast } from 'sonner';
import { 
  Camera, FileText, UploadCloud, File, FileCode, 
  FileSpreadsheet, Download, Plus, Loader2, Trash2
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

      // Simulating progress for UX
      const interval = setInterval(() => {
        setUploadProgress((p) => (p >= 90 ? p : p + 5));
      }, 300);

      // POINTING TO NEW DYNAMIC ROUTE TO AVOID 404
      const res = await fetch(`/api/leads/${lead.id}/upload-docs`, { 
        method: 'POST', 
        body: formData 
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

const deleteDocument = async (index: number) => {
  if (!confirm("Delete this document?")) return;

  try {
    const res = await fetch(`/api/leads/${lead.id}/delete-media`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'document',
        index
      })
    });

    const result = await res.json();

    if (result.success) {
      toast.success('Document deleted');
      await onRefresh();
    } else {
      toast.error(result.error || 'Delete failed');
    }

  } catch {
    toast.error('Delete failed');
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
              {photoCount > 0 && (
                <span className={`ml-1.5 px-2 py-0.5 rounded-full text-[10px] ${
                  activeTab === 'photos' ? 'bg-pink-100 text-pink-700' : 'bg-slate-200 text-slate-500'
                }`}>
                  {photoCount}
                </span>
              )}
            </div>
            {activeTab === 'photos' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-pink-600" />}
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
                <span className={`ml-1.5 px-2 py-0.5 rounded-full text-[10px] ${
                  activeTab === 'docs' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-200 text-slate-500'
                }`}>
                  {documents.length}
                </span>
              )}
            </div>
            {activeTab === 'docs' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600" />}
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
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest bg-indigo-600 text-white hover:bg-indigo-700 shadow-md cursor-pointer transition-all active:scale-95 disabled:opacity-50"
            >
              {uploading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3" />}
              {uploading ? 'Uploading' : 'Add Document'}
            </label>
          </div>
        )}
      </div>

      {/* Progress Bar */}
      {uploading && (
        <div className="h-1 w-full bg-slate-100">
          <div 
            className="h-full bg-indigo-500 transition-all duration-300"
            style={{ width: `${uploadProgress}%` }}
          />
        </div>
      )}

      <div className="min-h-[400px]">
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {documents.map((doc: any, i: number) => (
                  <div
                    key={i}
                    className="group relative flex items-center justify-between p-4 rounded-2xl border border-slate-100 bg-white hover:border-indigo-200 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                  >
                    <a
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-4 min-w-0 flex-1"
                    >
                      <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center group-hover:bg-indigo-50 transition-colors">
                        {getDocIcon(doc.name)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-black text-slate-800 truncate pr-4">
                          {doc.name}
                        </p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight mt-1">
                          {new Date(doc.uploadedAt).toLocaleDateString()} • {doc.uploadedBy}
                        </p>
                      </div>
                    </a>

                    <div className="flex items-center gap-2 ml-2">
                       <button
                        onClick={(e) => {
                          e.preventDefault();
                          deleteDocument(i);
                        }}
                        className="p-2 opacity-0 group-hover:opacity-100 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <Download className="w-4 h-4 text-slate-300" />
                    </div>
                  </div>
                ))}
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
                  className="mt-8 px-6 py-2.5 rounded-xl border border-slate-200 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 hover:bg-white hover:border-indigo-300 hover:text-indigo-600 transition-all cursor-pointer shadow-sm"
                >
                  Browse Files
                </label>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}