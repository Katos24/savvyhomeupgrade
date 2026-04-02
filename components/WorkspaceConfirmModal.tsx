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
    const grid: number[][] = [];
    for (let r = 0; r < modules; r++) {
      grid[r] = [];
      for (let c = 0; c < modules; c++) {
        const finder =
          (r < 7 && c < 7) ||
          (r < 7 && c >= modules - 7) ||
          (r >= modules - 7 && c < 7);
        if (finder) { grid[r][c] = 1; continue; }
        grid[r][c] = ((seed * (r + 1) * (c + 1) * 7) % 17 < 8) ? 1 : 0;
      }
    }

    ctx.clearRect(0, 0, size, size);
    for (let r = 0; r < modules; r++) {
      for (let c = 0; c < modules; c++) {
        if (grid[r][c]) {
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
      style={{ display: 'block' }}
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
  const dashUrl   = `${BASE_URL}/${slug}/dashboard`;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px',
    }}>
      {/* Backdrop */}
      <div
        onClick={onEdit}
        style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(2,6,23,0.75)', backdropFilter: 'blur(4px)' }}
      />

      {/* Card */}
      <div style={{
        position: 'relative', width: '100%', maxWidth: '520px',
        backgroundColor: '#ffffff', borderRadius: '20px',
        boxShadow: '0 25px 50px rgba(0,0,0,0.25)', overflow: 'hidden',
      }}>

        {/* Close */}
        <button
          onClick={onEdit}
          style={{
            position: 'absolute', top: '16px', right: '16px',
            width: '32px', height: '32px', borderRadius: '50%',
            border: 'none', backgroundColor: 'transparent',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#94a3b8',
          }}
        >
          <X size={16} />
        </button>

        {/* Header */}
        <div style={{ padding: '28px 28px 0' }}>
          <p style={{ margin: '0 0 4px', fontSize: '10px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#94a3b8' }}>
            Step 1 of 2 — confirm your workspace
          </p>
          <h2 style={{ margin: '0 0 4px', fontSize: '20px', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.02em' }}>
            Your workspace is ready to activate
          </h2>
          <p style={{ margin: 0, fontSize: '14px', color: '#64748b', lineHeight: 1.5 }}>
            Two URLs will be created for your business. Review them before continuing.
          </p>
        </div>

        {/* URL Cards */}
        <div style={{ padding: '20px 28px 0', display: 'flex', flexDirection: 'column', gap: '10px' }}>

          {/* ── Customer Booking Form ── */}
          <div style={{ borderRadius: '14px', overflow: 'hidden', border: '1px solid #C8D5B0' }}>
            {/* Label bar */}
            <div style={{ backgroundColor: '#F5F0E8', borderBottom: '1px solid #C8D5B0', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '24px', height: '24px', borderRadius: '6px', backgroundColor: '#1e293b', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Globe size={12} color="white" />
              </div>
              <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#1e293b' }}>
                Customer booking form
              </span>
              <span style={{ marginLeft: 'auto', fontSize: '10px', fontWeight: 700, color: '#1e293b', backgroundColor: '#C8D5B0', padding: '2px 10px', borderRadius: '20px' }}>
                Public
              </span>
            </div>

            {/* Body with QR */}
            <div style={{ backgroundColor: '#F5F0E8', display: 'flex', alignItems: 'stretch' }}>
              {/* QR panel */}
              <div style={{ width: '88px', backgroundColor: '#EAE6DC', borderRight: '1px solid #C8D5B0', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px 0', flexShrink: 0 }}>
                <MiniQR value={publicUrl} />
              </div>
              {/* Content */}
              <div style={{ padding: '14px 16px', flex: 1, minWidth: 0 }}>
                <p style={{ margin: '0 0 8px', fontSize: '11px', fontWeight: 700, color: '#374151', lineHeight: 1.4 }}>
                  Share this link with customers. They fill out a request and it lands straight in your dashboard.
                </p>
                <div style={{ backgroundColor: 'white', border: '1px solid #C8D5B0', borderRadius: '8px', padding: '8px 12px', fontFamily: 'monospace', fontSize: '12px', color: '#1e293b', wordBreak: 'break-all', lineHeight: 1.4 }}>
                  {BASE_URL}/<span style={{ color: '#2D5A1B', fontWeight: 900 }}>{slug}</span>
                </div>
              </div>
            </div>
          </div>

          {/* ── Private Dashboard ── */}
          <div style={{ borderRadius: '14px', overflow: 'hidden', border: '1px solid #334155' }}>
            {/* Label bar */}
            <div style={{ backgroundColor: '#1E2A3B', borderBottom: '1px solid #334155', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '24px', height: '24px', borderRadius: '6px', backgroundColor: '#4F46E5', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Lock size={12} color="white" />
              </div>
              <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#CBD5E1' }}>
                Your private dashboard
              </span>
              <span style={{ marginLeft: 'auto', fontSize: '10px', fontWeight: 700, color: '#a5b4fc', backgroundColor: 'rgba(99,102,241,0.2)', padding: '2px 10px', borderRadius: '20px' }}>
                Password protected
              </span>
            </div>
            {/* Body — no QR */}
            <div style={{ backgroundColor: '#0F172A', padding: '14px 16px' }}>
              <p style={{ margin: '0 0 8px', fontSize: '11px', fontWeight: 700, color: '#94a3b8', lineHeight: 1.4 }}>
                Password protected. Manage leads, quotes, payments, and your team here.
              </p>
              <div style={{ backgroundColor: '#1E293B', border: '1px solid #334155', borderRadius: '8px', padding: '8px 12px', fontFamily: 'monospace', fontSize: '12px', color: '#ffffff', wordBreak: 'break-all', lineHeight: 1.4 }}>
                {BASE_URL}/<span style={{ color: '#A5B4FC', fontWeight: 900 }}>{slug}</span>/dashboard
              </div>
            </div>
          </div>

        </div>

        {/* Edit hint */}
        <div style={{ padding: '12px 28px 0' }}>
          <button
            onClick={onEdit}
            style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', borderRadius: '10px', border: '1px solid #e2e8f0', backgroundColor: '#f8fafc', cursor: 'pointer', color: '#64748b', fontSize: '13px', fontWeight: 700 }}
          >
            <Pencil size={14} />
            Want to change your URL? Go back and edit
          </button>
        </div>

        {/* Confirm button */}
        <div style={{ padding: '16px 28px 28px' }}>
          <button
            onClick={onConfirm}
            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '16px', backgroundColor: '#4F46E5', color: 'white', border: 'none', borderRadius: '12px', fontSize: '14px', fontWeight: 900, cursor: 'pointer', letterSpacing: '-0.01em' }}
          >
            Confirm and continue to plan selection
            <ArrowRight size={16} />
          </button>
        </div>

      </div>
    </div>
  );
}