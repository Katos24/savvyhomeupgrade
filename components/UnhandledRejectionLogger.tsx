'use client';

import { useEffect } from 'react';

export default function UnhandledRejectionLogger() {
  useEffect(() => {
    const handler = (e: PromiseRejectionEvent) => {
      console.error('Unhandled rejection:', e.reason ?? 'No reason provided');
      e.preventDefault();
    };
    window.addEventListener('unhandledrejection', handler);
    return () => window.removeEventListener('unhandledrejection', handler);
  }, []);
  return null;
}