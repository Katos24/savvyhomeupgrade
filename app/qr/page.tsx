'use client';

import { useRef } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { Download } from 'lucide-react';

export default function QRDownloadPage() {
  const qrRef = useRef<HTMLDivElement>(null);

  const handleDownload = () => {
    const canvas = qrRef.current?.querySelector('canvas');
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = 'lead2project-qr-code.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-white mb-2">Lead2Project</h1>
        <p className="text-slate-400 mb-8">Scan or download the QR code</p>

        <div ref={qrRef} className="inline-block p-6 bg-white rounded-2xl mb-8">
          <QRCodeCanvas
            value="https://lead2project.com"
            size={250}
            bgColor="#ffffff"
            fgColor="#000000"
            level="H"
          />
        </div>

        <div>
          <button
            onClick={handleDownload}
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition active:scale-95"
          >
            <Download className="w-4 h-4" />
            Download QR Code
          </button>
        </div>
      </div>
    </div>
  );
}