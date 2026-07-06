'use client';
import Link from 'next/link';
import { Menu, Plus, Lock, Loader2, Home } from 'lucide-react';
import { can, type PlanTier } from '@/lib/permissions';
export default function DashboardHeader({
company,
isDark,
isRefreshing,
planTier,
onSidebarOpen,
onCreateLead,
onLockedFeature,
}: {
company: { name: string; logo_url?: string | null; slug: string };
isDark: boolean;
isRefreshing: boolean;
planTier: PlanTier;
onSidebarOpen: () => void;
onCreateLead: () => void;
onLockedFeature: (key: string) => void;
}) {
return (
<header className={`sticky top-3 z-50 rounded-2xl px-3 py-2.5 sm:px-5 sm:py-3 mb-5 transition-all backdrop-blur-xl ${
isDark
    ? 'bg-[#0A0C14]/80 border border-white/5 shadow-[0_8px_24px_rgba(0,0,0,0.25)]'
    : 'bg-white/90 border border-slate-300 shadow-[0_4px_16px_rgba(0,0,0,0.03)]'
}`}>
<div className="flex items-center justify-between gap-2 sm:gap-3">
<div className="flex items-center gap-2 sm:gap-4 min-w-0">
<button
data-tour="sidebar-toggle"
onClick={onSidebarOpen}
className={`p-2 rounded-xl transition-all active:scale-90 shrink-0 ${
isDark ? 'bg-white/5 hover:bg-white/10 text-white' : 'bg-slate-50 hover:bg-slate-100 text-slate-600'
}`}
>
<Menu className="w-4.5 h-4.5" />
</button>
<div className={`flex items-center gap-2.5 sm:gap-3 min-w-0 border-l pl-2.5 sm:pl-4 ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
{company.logo_url ? (
<img
src={company.logo_url}
alt="Logo"
className="h-7 sm:h-9 w-auto object-contain shrink-0"
/>
            ) : (
<div className={`w-7 h-7 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center font-semibold shrink-0 text-sm ${
isDark ? 'bg-white/10 text-white' : 'bg-slate-100 text-slate-700'
}`}>
{company.name.charAt(0)}
</div>
            )}
<div className="min-w-0">
<h1 className={`text-sm font-semibold tracking-tight truncate leading-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
{company.name}
</h1>
<div className="flex items-center gap-1.5 mt-0.5">
<span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
<p className={`text-[10px] font-medium truncate ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Live</p>
</div>
</div>
</div>
</div>
<div className="flex items-center gap-2 shrink-0">
{isRefreshing && <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-500 hidden xs:block" />}
{can(planTier, 'create_lead_manual') ? (
<button
data-tour="create-lead"
onClick={onCreateLead}
className="inline-flex items-center gap-1.5 px-3 py-2 sm:px-4 sm:py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium text-sm transition-all active:scale-95"
>
<Plus className="w-4 h-4" />
<span className="hidden sm:inline">New Lead</span>
</button>
          ) : (
<button
onClick={() => onLockedFeature('create_lead')}
className={`inline-flex items-center gap-1.5 px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl font-medium text-sm transition-all active:scale-95 ${
isDark ? 'bg-white/5 text-slate-400' : 'bg-slate-100 text-slate-500'
}`}
>
<Lock className="w-3.5 h-3.5" />
<span className="hidden sm:inline">New Lead</span>
</button>
          )}
</div>
</div>
</header>
  );
}