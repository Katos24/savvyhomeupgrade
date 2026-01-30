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
  const [docType, setDocType] = useState<'contract' | 'invoice' | 'permit' | 'other'>('contract');
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
      formData.append('docType', docType);
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

  const getDocIcon = (name: string, type: string) => {
    const ext = name.split('.').pop()?.toLowerCase();
    if (ext === 'pdf') return '📕';
    if (ext === 'doc' || ext === 'docx') return '📘';
    if (ext === 'xls' || ext === 'xlsx') return '📊';
    if (ext === 'txt') return '📄';
    if (type === 'contract') return '📋';
    if (type === 'invoice') return '💰';
    if (type === 'permit') return '🏛️';
    return '📎';
  };

  const getDocTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      contract: 'Contract',
      invoice: 'Invoice',
      permit: 'Permit',
      other: 'Document'
    };
    return labels[type] || 'Document';
  };

  return (
    <div className="p-4 space-y-3">
      {/* UPLOAD SECTION */}
      <div className="space-y-2">
        <div className="flex gap-2 items-end">
          <div className="flex-1">
            <label className="block text-xs font-semibold text-gray-700 mb-1">Type</label>
            <div className="flex bg-gray-200 rounded-lg p-1">
              <button
                type="button"
                onClick={() => setDocType('contract')}
                disabled={uploadingDocs}
                className={`flex-1 px-2 py-1.5 text-xs font-semibold rounded-md transition-all ${
                  docType === 'contract'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Contract
              </button>
              <button
                type="button"
                onClick={() => setDocType('invoice')}
                disabled={uploadingDocs}
                className={`flex-1 px-2 py-1.5 text-xs font-semibold rounded-md transition-all ${
                  docType === 'invoice'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Invoice
              </button>
              <button
                type="button"
                onClick={() => setDocType('permit')}
                disabled={uploadingDocs}
                className={`flex-1 px-2 py-1.5 text-xs font-semibold rounded-md transition-all ${
                  docType === 'permit'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Permit
              </button>
              <button
                type="button"
                onClick={() => setDocType('other')}
                disabled={uploadingDocs}
                className={`flex-1 px-2 py-1.5 text-xs font-semibold rounded-md transition-all ${
                  docType === 'other'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Other
              </button>
            </div>
          </div>

          <div>
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
              className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-gray-300 hover:border-green-500 transition cursor-pointer whitespace-nowrap ${
                uploadingDocs ? 'opacity-50 cursor-not-allowed' : 'hover:bg-green-50'
              }`}
            >
              <span className="text-lg">📄</span>
              <span className="font-semibold text-gray-700 text-xs">
                {uploadingDocs ? 'Uploading...' : 'Upload'}
              </span>
            </label>
          </div>
        </div>

        <p className="text-xs text-gray-500 text-center">
          PDF, DOC, DOCX, TXT, XLS, XLSX • Max 15MB
        </p>

        {uploadingDocs && (
          <div className="space-y-1">
            <div className="flex items-center justify-center gap-2 text-xs text-gray-600">
              <div className="animate-spin">⏳</div>
              <span>Uploading... {uploadProgress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div 
                className="bg-green-600 h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* DISPLAY DOCUMENTS */}
      {documents.length > 0 && (
        <div className="space-y-2 pt-3 border-t border-green-200">
          <h4 className="text-xs font-bold text-gray-900">Uploaded Files</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {documents.map((doc: any, index: number) => (
              <a
                key={index}
                href={doc.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group bg-white rounded-lg border border-gray-200 hover:border-green-500 p-2 transition-all hover:shadow-md"
              >
                <div className="flex items-start gap-2">
                  <div className="text-xl flex-shrink-0">
                    {getDocIcon(doc.name, doc.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-1 mb-0.5">
                      <h5 className="font-semibold text-gray-900 text-xs truncate group-hover:text-green-600 transition">
                        {doc.name}
                      </h5>
                      <span className="text-xs px-1.5 py-0.5 bg-green-100 text-green-800 rounded-full font-medium flex-shrink-0">
                        {getDocTypeLabel(doc.type)}
                      </span>
                    </div>
                    
                    <p className="text-xs text-gray-500">
                      {doc.uploadedBy}
                    </p>
                    
                    <p className="text-xs text-gray-400">
                      {new Date(doc.uploadedAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  
                  <div className="text-gray-400 group-hover:text-green-600 transition flex-shrink-0">
                    ⬇️
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}