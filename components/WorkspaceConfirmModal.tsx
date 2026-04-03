'use client';

import { useEffect, useRef } from 'react';
import { ArrowRight, Globe, Lock, Pencil, X } from 'lucide-react';

interface WorkspaceConfirmModalProps {
  isOpen: boolean;
  slug: string;
  onConfirm: () => void;
  onEdit: () => void;
}

const BASE_URL = 'lead2project.com';

function MiniQR({ value }: { value: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = 64;
    const modules = 21;
    const cell = Math.floor(size / modules);

    const seed = value.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
    
    ctx.clearRect(0, 0, size, size);
    for (let r = 0; r < modules; r++) {
      for (let c = 0; c < modules; c++) {
        const finder = (r < 7 && c < 7) || (r < 7 && c >= modules - 7) || (r >= modules - 7 && c < 7);
        if (finder || (seed * (r + 1) * (c + 1) * 7) % 17 < 8) {
          // Dark slate dots for high contrast on light backgrounds
          ctx.fillStyle = '#1e293b';
          ctx.fillRect(c * cell, r * cell, cell - 0.5, cell - 0.5);
        }
      }
    }
  }, [value]);

  return (
    <canvas
      ref={canvasRef}
      width={64}
      height={64}
      style={{ display: 'block', borderRadius: '4px' }}
    />
  );
}

export default function WorkspaceConfirmModal({
  isOpen,
  slug,
  onConfirm,
  onEdit,
}: WorkspaceConfirmModalProps) {
  if (!isOpen || !slug) return null;

  const publicUrl = `${BASE_URL}/${slug}`;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px',
    }}>
      {/* Backdrop */}
      <div
        onClick={onEdit}
        style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(2,6,23,0.85)', backdropFilter: 'blur(12px)' }}
      />

      {/* Card */}
      <div style={{
        position: 'relative', width: '100%', maxWidth: '480px',
        backgroundColor: '#ffffff', borderRadius: '28px',
        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', overflow: 'hidden',
      }}>

        {/* ── HEADER: FOCUS ON SPELLING ── */}
        <div style={{ padding: '32px 32px 24px', textAlign: 'center', borderBottom: '1px solid #f1f5f9' }}>
          <div style={{ display: 'inline-flex', padding: '6px 12px', backgroundColor: '#FEF2F2', border: '1px solid #FEE2E2', borderRadius: '100px', marginBottom: '16px' }}>
            <span style={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#EF4444' }}>
              Final Review Required
            </span>
          </div>
          <h2 style={{ margin: '0 0 10px', fontSize: '24px', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.03em', lineHeight: 1.1 }}>
            Check your spelling.
          </h2>
          <p style={{ margin: 0, fontSize: '14px', color: '#64748b', fontWeight: 600, lineHeight: 1.5 }}>
            Make sure your business name is correct. <br/>
            <span style={{ color: '#0f172a' }}>Note: Hyphens ( - ) are required between words.</span>
          </p>
        </div>

        {/* ── URL PREVIEW AREA ── */}
        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

          {/* Public Side */}
          <div style={{ borderRadius: '16px', border: '1px solid #C8D5B0', backgroundColor: '#F9FBF4', overflow: 'hidden' }}>
            <div style={{ padding: '10px 16px', borderBottom: '1px solid #C8D5B0', display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#F5F0E8' }}>
              <Globe size={14} color="#1A3A1A" />
              <span style={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', color: '#1A3A1A' }}>Customer View</span>
            </div>
            
            <div style={{ padding: '16px' }}>
               <div style={{ backgroundColor: 'white', border: '1px solid #C8D5B0', borderRadius: '10px', padding: '12px', fontFamily: 'monospace', fontSize: '14px', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)' }}>
                  <span style={{ color: '#94a3b8' }}>lead2project.com/</span>
                  <span style={{ color: '#1A3A1A', fontWeight: 900 }}>{slug}</span>
                </div>
            </div>
          </div>

          {/* Private Side - FIXED VISIBILITY */}
          <div style={{ borderRadius: '16px', border: '1px solid #334155', backgroundColor: '#0F172A', overflow: 'hidden' }}>
            <div style={{ padding: '10px 16px', borderBottom: '1px solid #334155', display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#1E293B' }}>
              <Lock size={14} color="#A5B4FC" />
              <span style={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', color: '#CBD5E1' }}>Your Private Dashboard</span>
            </div>
            
            <div style={{ padding: '16px' }}>
              <div style={{ backgroundColor: '#1E293B', border: '1px solid #475569', borderRadius: '10px', padding: '12px', fontFamily: 'monospace', fontSize: '14px' }}>
                <span style={{ color: '#64748b' }}>lead2project.com/</span>
                <span style={{ color: '#A5B4FC', fontWeight: 900 }}>{slug}</span>
                <span style={{ color: '#64748b' }}>/dashboard</span>
              </div>
            </div>
          </div>

        </div>

        {/* ── ACTIONS ── */}
        <div style={{ padding: '0 24px 32px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <button
            onClick={onConfirm}
            style={{ width: '100%', height: '56px', backgroundColor: '#4F46E5', color: 'white', border: 'none', borderRadius: '16px', fontSize: '15px', fontWeight: 900, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
          >
            Looks Good — Activate Now
            <ArrowRight size={18} />
          </button>
          
          <button
            onClick={onEdit}
            style={{ width: '100%', height: '48px', backgroundColor: 'transparent', color: '#64748b', border: '1px solid #e2e8f0', borderRadius: '16px', fontSize: '14px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
          >
            <Pencil size={14} />
            Go back and fix spelling
          </button>
        </div>

      </div>
    </div>
  );
}