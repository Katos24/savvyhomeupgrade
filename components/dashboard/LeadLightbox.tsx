'use client';

import { useState, useEffect, useRef } from 'react';
import { X, ChevronLeft, ChevronRight, Download } from 'lucide-react';

type LightboxProps = {
  photos: string[];
  startIndex: number;
  onClose: () => void;
  label?: string;
};

export default function LeadLightbox({ photos, startIndex, onClose, label }: LightboxProps) {
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
    if (Math.abs(delta) > 50)
      delta < 0
        ? setCurrent(c => (c + 1) % photos.length)
        : setCurrent(c => (c - 1 + photos.length) % photos.length);
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
        backgroundColor: 'rgba(0,0,0,0.93)',
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
          padding: '16px', paddingTop: 'max(16px, env(safe-area-inset-top))', zIndex: 10,
        }}
        onClick={e => e.stopPropagation()}
      >
        <span style={{ color: 'rgba(255,255,255,0.55)', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          {label}{photos.length > 1 && ` · ${current + 1} / ${photos.length}`}
        </span>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={handleDownload} style={{ background: 'rgba(255,255,255,0.12)', border: 'none', borderRadius: '50%', width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <Download style={{ width: 17, height: 17, color: 'white' }} />
          </button>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.12)', border: 'none', borderRadius: '50%', width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <X style={{ width: 17, height: 17, color: 'white' }} />
          </button>
        </div>
      </div>

      {/* Image + nav */}
      <div
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, width: '100%', padding: '80px 8px' }}
        onClick={e => e.stopPropagation()}
      >
        {photos.length > 1 && (
          <button onClick={() => setCurrent(c => (c - 1 + photos.length) % photos.length)}
            style={{ background: 'rgba(255,255,255,0.12)', border: 'none', borderRadius: '50%', width: 44, height: 44, minWidth: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
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
          <button onClick={() => setCurrent(c => (c + 1) % photos.length)}
            style={{ background: 'rgba(255,255,255,0.12)', border: 'none', borderRadius: '50%', width: 44, height: 44, minWidth: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
            <ChevronRight style={{ width: 22, height: 22, color: 'white' }} />
          </button>
        )}
      </div>

      {/* Thumbnails */}
      {photos.length > 1 && (
        <div
          style={{
            position: 'absolute', bottom: 'max(16px, env(safe-area-inset-bottom))',
            left: 0, right: 0, display: 'flex', justifyContent: 'center',
            gap: 6, padding: '0 16px', overflowX: 'auto',
          }}
          onClick={e => e.stopPropagation()}
        >
          {photos.map((url, i) => (
            <button key={i} onClick={() => setCurrent(i)}
              style={{
                width: 44, height: 44, minWidth: 44, borderRadius: 8,
                overflow: 'hidden', flexShrink: 0, padding: 0, cursor: 'pointer',
                border: i === current ? '2px solid white' : '2px solid rgba(255,255,255,0.2)',
                opacity: i === current ? 1 : 0.5,
                transform: i === current ? 'scale(1.1)' : 'scale(1)',
                transition: 'all 0.15s',
              }}>
              <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}