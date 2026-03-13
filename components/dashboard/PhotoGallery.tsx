'use client';
import { useState } from 'react';
import { Trash2, Loader2 } from 'lucide-react'; // Added icons for the delete button
import { toast } from 'sonner';

type PhotoGalleryProps = {
  leadId: string | number; // Added leadId to build the URL
  title: string;
  photos: string[] | any[];
  emoji?: string;
};

export default function PhotoGallery({ leadId, title, photos: initialPhotos, emoji = '📷' }: PhotoGalleryProps) {
  const [show, setShow] = useState(false);
  const [photos, setPhotos] = useState(initialPhotos);
  const [deleting, setDeleting] = useState<string | null>(null);
  
  if (!photos || photos.length === 0) return null;
  
  const urls = photos.map((p: string | { url: string }) => typeof p === 'string' ? p : p.url);

  const handleDelete = async (e: React.MouseEvent, url: string) => {
    e.preventDefault(); // Prevent opening the link
    if (!confirm("Delete this photo?")) return;

    setDeleting(url);
    try {
      const res = await fetch(`/api/leads/${leadId}/delete-photo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ photoUrl: url }),
      });

      const data = await res.json();
      
      if (data.success) {
        // Update local state so it disappears immediately
        setPhotos(photos.filter((p: any) => (typeof p === 'string' ? p : p.url) !== url));
        toast.success('Photo removed');
      } else {
        toast.error(data.error || 'Failed to delete');
      }
    } catch (err) {
      toast.error('Error deleting photo');
    } finally {
      setDeleting(null);
    }
  };

  return (
    <>
      <button 
        onClick={() => setShow(!show)}
        className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-sm font-medium transition"
      >
        {emoji} {urls.length}
      </button>
      
      {show && (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4" onClick={() => setShow(false)}>
          <div className="bg-white rounded-lg p-4 max-w-4xl w-full max-h-[90vh] overflow-auto" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold">{title}</h3>
              <button onClick={() => setShow(false)} className="text-2xl">×</button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {urls.map((url: string, i: number) => (
                <div key={i} className="relative group aspect-square">
                  <a href={url} target="_blank" rel="noopener noreferrer">
                    <img src={url} alt={`${i + 1}`} className="w-full h-full object-cover rounded shadow-sm" />
                  </a>
                  
                  {/* Delete Button - Positioned in top right of each image */}
                  <button
                    onClick={(e) => handleDelete(e, url)}
                    disabled={deleting === url}
                    className="absolute top-1 right-1 p-1.5 bg-red-500 text-white rounded-md shadow-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 disabled:opacity-100 disabled:bg-gray-400"
                  >
                    {deleting === url ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}