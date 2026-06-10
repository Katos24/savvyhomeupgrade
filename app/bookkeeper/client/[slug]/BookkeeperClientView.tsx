'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import FinancialsClient from '@/app/[company]/dashboard/financials/FinancialsClient';

type Props = {
  company: any;
  projects: any[];
  bookkeeper: any;
};

export default function BookkeeperClientView({ company, projects, bookkeeper }: Props) {
  return (
    <div>
      {/* Bookkeeper nav bar */}
      <div
        className="sticky top-0 z-50 px-6 py-2 flex items-center gap-3"
        style={{ background: 'rgba(16,185,129,0.08)', borderBottom: '1px solid rgba(16,185,129,0.15)' }}
      >
        <Link
          href="/bookkeeper/dashboard"
          className="flex items-center gap-1.5 text-xs font-black text-emerald-400 hover:text-emerald-300 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to clients
        </Link>
        <span className="text-emerald-800 text-xs">·</span>
        <span className="text-xs text-emerald-600 font-medium">Viewing as bookkeeper partner</span>
      </div>

      {/* Reuse the exact same financials page */}
      <FinancialsClient
        company={company}
        projects={projects}
        isBookkeeperView={true}
      />
    </div>
  );
}