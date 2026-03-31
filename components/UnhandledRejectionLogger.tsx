'use client';

import { useEffect } from 'react';

export default function UnhandledRejectionLogger() {
  useEffect(() => {
    const handler = (e: PromiseRejectionEvent) => {
  // Suppress known Google Maps internal rejections
  const reason = e.reason;
  if (!reason || (typeof reason === 'object' && Object.keys(reason).length === 0)) {
    e.preventDefault();
    return;
  }
  console.error('Unhandled rejection:', reason);
  e.preventDefault();
};
    window.addEventListener('unhandledrejection', handler);
    return () => window.removeEventListener('unhandledrejection', handler);
  }, []);
  return null;
}