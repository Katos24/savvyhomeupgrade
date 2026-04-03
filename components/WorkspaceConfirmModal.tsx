'use client';

import { useEffect, useRef } from 'react';
import { ArrowRight, Globe, Lock, Pencil } from 'lucide-react';

interface WorkspaceConfirmModalProps {
  isOpen: boolean;
  slug: string;
  onConfirm: () => void;
  onEdit: () => void;
}

export default function WorkspaceConfirmModal({
  isOpen,
  slug,
  onConfirm,
  onEdit,
}: WorkspaceConfirmModalProps) {
  if (!isOpen || !slug) return null;

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
        position: 'relative', width: '100%', maxWidth: '460px',
        backgroundColor: '#ffffff', borderRadius: '24px',
        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', overflow: 'hidden',
      }}>

        {/* Header */}
<div style={{ padding: 'clamp(16px, 5vw, 28px) clamp(16px, 5vw, 28px) 20px', textAlign: 'center', borderBottom: '1px solid #f1f5f9' }}>
          <div style={{
            display: 'inline-flex', padding: '5px 12px',
            backgroundColor: '#FEF2F2', border: '1px solid #FEE2E2',
            borderRadius: '100px', marginBottom: '14px',
          }}>
            <span style={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#EF4444' }}>
              Double-check before continuing
            </span>
          </div>
          <h2 style={{ margin: '0 0 8px', fontSize: '22px', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
            Does your URL look right?
          </h2>
          <p style={{ margin: 0, fontSize: '13px', color: '#64748b', fontWeight: 500, lineHeight: 1.6 }}>
            This becomes your permanent address — it cannot be changed later.<br />
            Words are separated by hyphens <strong style={{ color: '#0f172a' }}>( - )</strong>.
          </p>
        </div>

        {/* URL Preview */}
        <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>

          {/* Customer Form */}
          <div style={{ borderRadius: '14px', border: '1px solid #BFDBFE', backgroundColor: '#EFF6FF', overflow: 'hidden' }}>
            <div style={{ padding: '8px 14px', borderBottom: '1px solid #C8D5B0', display: 'flex', alignItems: 'center', gap: '7px', backgroundColor: '#DBEAFE' }}>
              <Globe size={12} color="#1E3A5F" />
              <span style={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#1E3A5F' }}>
                Share with customers
              </span>
              <span style={{ marginLeft: 'auto', fontSize: '10px', fontWeight: 700, color: '#1E3A5F', backgroundColor: '#BFDBFE', padding: '2px 8px', borderRadius: '100px' }}>
                Public
              </span>
            </div>
            <div style={{ padding: '14px' }}>
              <div style={{ backgroundColor: 'white', border: '1px solid #BFDBFE', borderRadius: '10px', padding: '10px 14px', fontFamily: 'monospace', fontSize: '14px', wordBreak: 'break-all' }}>
                <span style={{ color: '#94a3b8' }}>lead2project.com/</span>
                <span style={{ color: '#0F2744', fontWeight: 900 }}>{slug}</span>
              </div>
            </div>
          </div>

          {/* Dashboard */}
          <div style={{ borderRadius: '14px', border: '1px solid #334155', backgroundColor: '#0F172A', overflow: 'hidden' }}>
            <div style={{ padding: '8px 14px', borderBottom: '1px solid #334155', display: 'flex', alignItems: 'center', gap: '7px', backgroundColor: '#1E293B' }}>
              <Lock size={12} color="#A5B4FC" />
              <span style={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#A5B4FC' }}>
                Your dashboard
              </span>
              <span style={{ marginLeft: 'auto', fontSize: '10px', fontWeight: 700, color: '#818CF8', backgroundColor: '#1E2A4A', padding: '2px 8px', borderRadius: '100px' }}>
                Private
              </span>
            </div>
            <div style={{ padding: '14px' }}>
              <div style={{ backgroundColor: '#1E293B', border: '1px solid #334155', borderRadius: '10px', padding: '10px 14px', fontFamily: 'monospace', fontSize: '14px', wordBreak: 'break-all' }}>
                <span style={{ color: '#475569' }}>lead2project.com/</span>
                <span style={{ color: '#818CF8', fontWeight: 900 }}>{slug}</span>
                <span style={{ color: '#475569' }}>/dashboard</span>
              </div>
            </div>
          </div>

        </div>

        {/* Actions */}
<div style={{ padding: '0 clamp(16px, 4vw, 24px) 24px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <button
            onClick={onConfirm}
            style={{
              width: '100%', height: '52px', backgroundColor: '#4F46E5',
              color: 'white', border: 'none', borderRadius: '14px',
              fontSize: '15px', fontWeight: 800, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            }}
          >
            Looks good — continue
            <ArrowRight size={17} />
          </button>

          <button
            onClick={onEdit}
            style={{
              width: '100%', height: '44px', backgroundColor: 'transparent',
              color: '#64748b', border: '1px solid #e2e8f0', borderRadius: '14px',
              fontSize: '13px', fontWeight: 700, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px',
            }}
          >
            <Pencil size={13} />
            Fix my spelling
          </button>
        </div>

      </div>
    </div>
  );
}