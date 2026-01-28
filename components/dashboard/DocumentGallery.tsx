'use client';

type Document = {
  url: string;
  name: string;
  type: 'contract' | 'invoice' | 'permit' | 'other';
  uploadedAt: string;
  uploadedBy: string;
};

type DocumentGalleryProps = {
  title: string;
  documents: Document[];
  emoji?: string;
  borderColor?: string;
};

export default function DocumentGallery({ 
  title, 
  documents, 
  emoji = "📄",
  borderColor = "border-green-200" 
}: DocumentGalleryProps) {
  if (!documents || documents.length === 0) return null;

  const getDocIcon = (name: string, type: string) => {
    const ext = name.split('.').pop()?.toLowerCase();
    
    if (ext === 'pdf') return '📕';
    if (ext === 'doc' || ext === 'docx') return '📘';
    if (ext === 'xls' || ext === 'xlsx') return '📊';
    if (ext === 'txt') return '📄';
    
    // Fallback to type-based icons
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
    <div className={`bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border-2 ${borderColor} p-4 sm:p-6`}>
      <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
        {emoji} {title} ({documents.length})
      </h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {documents.map((doc, index) => (
          <a
            key={index}
            href={doc.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group bg-white rounded-lg border-2 border-gray-200 hover:border-green-500 p-4 transition-all hover:shadow-md"
          >
            <div className="flex items-start gap-3">
              <div className="text-3xl flex-shrink-0">
                {getDocIcon(doc.name, doc.type)}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h4 className="font-semibold text-gray-900 text-sm truncate group-hover:text-green-600 transition">
                    {doc.name}
                  </h4>
                  <span className="text-xs px-2 py-0.5 bg-green-100 text-green-800 rounded-full font-medium flex-shrink-0">
                    {getDocTypeLabel(doc.type)}
                  </span>
                </div>
                
                <p className="text-xs text-gray-500 mb-2">
                  📤 {doc.uploadedBy}
                </p>
                
                <p className="text-xs text-gray-400">
                  {new Date(doc.uploadedAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
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
      
      <div className="mt-3 text-xs text-gray-500 text-center">
        Click any document to download
      </div>
    </div>
  );
}