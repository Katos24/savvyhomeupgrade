'use client';

import { useState, useRef } from 'react';
import { toast } from 'sonner';

type DocumentsSectionProps = {
  lead: any;
  currentUser: any;
  onRefresh: () => Promise<void>;
  hasProject: boolean;
};

export default function DocumentsSection({ lead, currentUser, onRefresh, hasProject }: DocumentsSectionProps) {
  const [uploadingDocs, setUploadingDocs] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const docInputRef = useRef<HTMLInputElement>(null);

  const documents = lead?.documents ? (typeof lead.documents === 'string' ? JSON.parse(lead.documents) : lead.documents) : [];
  const MAX_DOC_SIZE = 15 * 1024 * 1024; // 15MB

  const validateFileSize = (file: File, maxSize: number): boolean => {
    if (file.size > maxSize) {
      const maxSizeMB = maxSize / (1024 * 1024);
      toast.error(`${file.name} is too large! Max ${maxSizeMB}MB.`);
      return false;
    }
    return true;
  };

  const handleDocumentUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    for (let i = 0; i < files.length; i++) {
      if (!validateFileSize(files[i], MAX_DOC_SIZE)) {
        if (docInputRef.current) docInputRef.current.value = '';
        return;
      }
    }

    setUploadingDocs(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('leadId', lead.id.toString());
      formData.append('docType', 'other'); // Default to 'other' since we removed categories
      formData.append('uploadType', 'document');
      formData.append('userName', currentUser?.name || currentUser?.email || 'Unknown User');

      for (let i = 0; i < files.length; i++) {
        formData.append('documents', files[i]);
      }

      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) return prev;
          return prev + 10;
        });
      }, 500);

      const response = await fetch('/api/leads/upload-photos', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      const result = await response.json();

      if (response.ok && result.success) {
        toast.success(`${files.length} document${files.length > 1 ? 's' : ''} uploaded!`);
        await onRefresh();
      } else {
        toast.error(result.error || 'Failed to upload documents');
      }
    } catch (error) {
      console.error('Document upload error:', error);
      toast.error('Failed to upload documents');
    } finally {
      setUploadingDocs(false);
      setUploadProgress(0);
      if (docInputRef.current) {
        docInputRef.current.value = '';
      }
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
    <div className="p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <span className="text-xl">📁</span>
        <h3 className="text-sm font-bold text-gray-900">Project Documents</h3>
        {documents.length > 0 && (
          <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-xs font-bold rounded-full">
            {documents.length}
          </span>
        )}
      </div>

      {/* UPLOAD SECTION */}
      <div className="space-y-2">
        <input
          ref={docInputRef}
          type="file"
          accept=".pdf,.doc,.docx,.txt,.xlsx,.xls"
          multiple
          onChange={handleDocumentUpload}
          disabled={uploadingDocs}
          className="hidden"
          id={`doc-upload-${lead.id}`}
        />
        <label
          htmlFor={`doc-upload-${lead.id}`}
          className={`w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl border-2 border-dashed transition cursor-pointer ${
            uploadingDocs 
              ? 'opacity-50 cursor-not-allowed border-gray-300 bg-gray-50' 
              : 'border-indigo-300 hover:border-indigo-500 hover:bg-indigo-50 bg-white'
          }`}
        >
          <span className="text-2xl">📄</span>
          <span className="font-bold text-gray-700 text-sm">
            {uploadingDocs ? 'Uploading...' : 'Upload Documents'}
          </span>
        </label>
        <p className="text-xs text-gray-500 text-center">
          PDF, Word, Excel, TXT • Max 15MB each • Multiple files supported
        </p>

        {uploadingDocs && (
          <div className="space-y-2 bg-indigo-50 rounded-lg p-3">
            <div className="flex items-center justify-center gap-2 text-xs text-indigo-700 font-medium">
              <div className="animate-spin">⏳</div>
              <span>Uploading... {uploadProgress}%</span>
            </div>
            <div className="w-full bg-indigo-200 rounded-full h-2">
              <div 
                className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* DISPLAY DOCUMENTS */}
      {documents.length > 0 ? (
        <div className="space-y-2">
          <div className="grid grid-cols-1 gap-2">
            {documents.map((doc: any, index: number) => (
              <a
                key={index}
                href={doc.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group bg-white rounded-xl border-2 border-gray-200 hover:border-indigo-500 p-4 transition-all hover:shadow-lg"
              >
                <div className="flex items-start gap-3">
                  <div className="text-2xl flex-shrink-0">
                    {getDocIcon(doc.name)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h5 className="font-bold text-gray-900 text-sm truncate group-hover:text-indigo-600 transition mb-1">
                      {doc.name}
                    </h5>
                    
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span>Uploaded by {doc.uploadedBy}</span>
                      <span>•</span>
                      <span>
                        {new Date(doc.uploadedAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: 'numeric',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  </div>
                  
                  <div className="text-gray-400 group-hover:text-indigo-600 transition flex-shrink-0 text-xl">
                    ⬇️
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <span className="text-4xl mb-2 block">📂</span>
          <p className="text-sm font-medium">No documents yet</p>
          <p className="text-xs mt-1">Upload contracts, invoices, or other files</p>
        </div>
      )}
    </div>
  );
}