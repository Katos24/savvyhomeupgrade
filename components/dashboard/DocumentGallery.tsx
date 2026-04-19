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
  borderColor = "border-blue-200" 
}: DocumentGalleryProps) {
  if (!documents || documents.length === 0) return null;

  const getDocIcon = (name: string) => {
    const ext = name.split('.').pop()?.toLowerCase();
    if (ext === 'pdf') return '📕';
    if (ext === 'doc' || ext === 'docx') return '📘';
    if (ext === 'xls' || ext === 'xlsx') return '📊';
    if (ext === 'txt') return '📄';
    return '📎';
  };

  return (
    <div className={`bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl border-2 ${borderColor} p-4 shadow-sm`}>
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xl">{emoji}</span>
        <h3 className="text-sm font-bold text-gray-900">{title}</h3>
        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-bold rounded-full">
          {documents.length}
        </span>
      </div>

      <div className="space-y-2">
        {documents.map((doc, index) => (
          <a
            key={index}
            href={doc.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group block bg-white rounded-xl border-2 border-gray-200 hover:border-blue-500 p-3 transition-all hover:shadow-lg"
          >
            <div className="flex items-start gap-3">
              {/* Icon */}
              <div className="text-2xl flex-shrink-0">
                {getDocIcon(doc.name)}
              </div>
              
              {/* Content */}
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-gray-900 text-sm truncate group-hover:text-blue-600 transition mb-1">
                  {doc.name}
                </h4>
                
                {/* Meta info - stacks on mobile */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-xs text-gray-500">
                  <span className="truncate">{doc.uploadedBy}</span>
                  <span className="hidden sm:inline">•</span>
                  <span className="text-gray-400">
                    {new Date(doc.uploadedAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
              </div>
              
              {/* Download icon */}
              <div className="text-gray-400 group-hover:text-blue-600 transition flex-shrink-0 text-xl">
                ⬇️
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}