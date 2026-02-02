'use client';
import { useState } from 'react';

type PhotoGalleryProps = {
  title: string;
  photos: string[] | any[];
  emoji?: string;
};

export default function PhotoGallery({ title, photos, emoji = '📷' }: PhotoGalleryProps) {
  const [show, setShow] = useState(false);
  
  if (!photos || photos.length === 0) return null;
  
  const urls = photos.map((p: string | { url: string }) => typeof p === 'string' ? p : p.url);

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
            <div className="grid grid-cols-3 gap-2">
              {urls.map((url: string, i: number) => (
                <a key={i} href={url} target="_blank" rel="noopener noreferrer">
                  <img src={url} alt={`${i + 1}`} className="w-full h-32 object-cover rounded" />
                </a>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}