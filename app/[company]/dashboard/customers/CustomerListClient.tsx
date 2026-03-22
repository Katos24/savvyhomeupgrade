"use client";

import { useState, useMemo } from 'react';
import {
  ChevronDown,
  ChevronRight,
  Mail,
  MapPin,
  Briefcase,
  ArrowRight,
  User,
  Phone,
  Search,
  ArrowLeft,
} from 'lucide-react';

interface Project {
  id: number;
  lead_id: number;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  service_address: string | null;
  status: string;
  category: string;
  updated_at: string;
  quote_total?: number | null;
  payment_status?: string | null;
}

interface CustomerGroup {
  name: string;
  email: string;
  phone: string;
  projects: Project[];
}

export default function CustomerListClient({
  projects = [],
  companySlug,
}: {
  projects?: Project[];
  companySlug: string;
}) {
  const [expandedEmail, setExpandedEmail] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const groupedCustomers = useMemo(() => {
    const groups: Record<string, CustomerGroup> = {};
    (projects || []).forEach((p) => {
      const email = p.customer_email || 'no-email@provided.com';
      if (!groups[email]) {
        groups[email] = {
          name: p.customer_name || 'Unknown Customer',
          email,
          phone: p.customer_phone || '',
          projects: [],
        };
      }
      groups[email].projects.push(p);
    });

    const list = Object.values(groups).sort((a, b) => a.name.localeCompare(b.name));
    if (!searchTerm) return list;
    return list.filter(
      (c) =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.phone.includes(searchTerm)
    );
  }, [projects, searchTerm]);

  if (!projects || projects.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center text-center px-4">
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
          <User className="w-8 h-8 text-slate-400" />
        </div>
        <h2 className="text-xl font-black text-slate-800">No customers yet</h2>
        <p className="text-slate-500 max-w-xs mt-2 text-sm">
          Customer profiles will appear here once leads are created.
        </p>
        
          <a
  href={`/${companySlug}/dashboard`}
  className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-indigo-600 hover:text-indigo-700"
>
  <ArrowLeft className="w-4 h-4" /> Back to Dashboard
</a>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-100 sticky top-0 z-20 shadow-sm">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-3">
          
            <a
  href={`/${companySlug}/dashboard`}
  className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition shrink-0"
  aria-label="Back to dashboard"
>
  <ArrowLeft className="w-5 h-5" />
</a>
          <div className="flex-1 min-w-0">
            <h1 className="text-base font-black text-slate-900 tracking-tight">Customers</h1>
            <p className="text-xs text-slate-400 font-medium">{groupedCustomers.length} profiles</p>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, email or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-2xl py-3 pl-10 pr-4 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all shadow-sm"
          />
        </div>

        {/* Customer list */}
        <div className="space-y-3">
          {groupedCustomers.map((customer) => {
            const isExpanded = expandedEmail === customer.email;
            const jobCount = customer.projects.length;
            const totalRevenue = customer.projects.reduce(
              (sum, p) => sum + (parseFloat(String(p.quote_total || 0))),
              0
            );
            const lastJob = customer.projects.reduce((latest, p) => {
              const d = new Date(p.updated_at);
              return d > latest ? d : latest;
            }, new Date(0));

            return (
              <div
                key={customer.email}
                className={`bg-white rounded-2xl border transition-all duration-200 overflow-hidden shadow-sm ${
                  isExpanded ? 'border-indigo-200 shadow-md' : 'border-slate-100 hover:border-slate-200'
                }`}
              >
                {/* Customer row */}
                <div
                  onClick={() => setExpandedEmail(isExpanded ? null : customer.email)}
                  className="p-4 sm:p-5 cursor-pointer flex items-center gap-4 select-none"
                >
                  {/* Avatar */}
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 font-black text-base transition-colors ${
                    isExpanded ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {customer.name.charAt(0).toUpperCase()}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-black text-slate-900 text-sm leading-tight truncate">{customer.name}</p>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-1">
                      {customer.phone && (
                        <span className="flex items-center gap-1 text-[11px] text-slate-400 font-medium">
                          <Phone className="w-3 h-3" /> {customer.phone}
                        </span>
                      )}
                      <span className="flex items-center gap-1 text-[11px] text-slate-400 font-medium">
                        <Briefcase className="w-3 h-3" /> {jobCount} {jobCount === 1 ? 'job' : 'jobs'}
                      </span>
                      {totalRevenue > 0 && (
                        <span className="text-[11px] font-black text-emerald-600">
                          ${totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 0 })}
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-300 mt-0.5">
                      Last job {lastJob.toLocaleDateString()}
                    </p>
                  </div>

                  {/* Chevron */}
                  {isExpanded
                    ? <ChevronDown className="w-4 h-4 text-indigo-500 shrink-0" />
                    : <ChevronRight className="w-4 h-4 text-slate-300 shrink-0" />
                  }
                </div>

                {/* Expanded jobs */}
                {isExpanded && (
                  <div className="border-t border-slate-100 px-4 pb-4 pt-3 space-y-2 animate-in fade-in slide-in-from-top-1 duration-200">
                    {/* Contact row */}
                    <div className="flex flex-wrap gap-3 mb-3">
                      {customer.email !== 'no-email@provided.com' && (
                        
                         <a
  href={`mailto:${customer.email}`}
  className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg hover:bg-indigo-100 transition"
  onClick={(e) => e.stopPropagation()}
>
                          <Mail className="w-3.5 h-3.5" /> {customer.email}
                        </a>
                      )}
                      {customer.phone && customer.phone !== 'No Phone' && (
                        
                        <a
  href={`tel:${customer.phone}`}
  className="flex items-center gap-1.5 text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg hover:bg-slate-200 transition"
  onClick={(e) => e.stopPropagation()}
>
                          <Phone className="w-3.5 h-3.5" /> {customer.phone}
                        </a>
                      )}
                    </div>

                    {/* Job cards */}
                    {customer.projects.map((project) => (
                      
                     <a
  key={project.id}
href={`/${companySlug}/dashboard?lead=${project.lead_id}`}
  className="group flex items-center justify-between p-3.5 bg-slate-50 border border-slate-100 rounded-xl hover:border-indigo-200 hover:bg-indigo-50/40 transition-all no-underline"
>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-black text-slate-800 capitalize">
                              {project.category?.replace(/_/g, ' ') || 'Service Request'}
                            </span>
                            <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wide ${
                              project.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                              project.status === 'cancelled' ? 'bg-red-100 text-red-600' :
                              'bg-slate-200 text-slate-600'
                            }`}>
                              {project.status?.replace(/_/g, ' ') || 'active'}
                            </span>
                          </div>
                          {project.service_address && (
                            <p className="text-[11px] text-slate-400 flex items-center gap-1 truncate">
                              <MapPin className="w-3 h-3 shrink-0" />
                              {project.service_address}
                            </p>
                          )}
                          <p className="text-[10px] text-slate-300 mt-0.5">
                            {new Date(project.updated_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0 ml-3">
                          {project.quote_total && (
                            <span className="text-xs font-black text-slate-700">
                              ${parseFloat(String(project.quote_total)).toLocaleString()}
                            </span>
                          )}
                          <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-500 transition" />
                        </div>
                      </a>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {groupedCustomers.length === 0 && searchTerm && (
          <div className="text-center py-16">
            <p className="text-slate-400 font-medium text-sm">No results for "{searchTerm}"</p>
            <button
              onClick={() => setSearchTerm('')}
              className="mt-2 text-xs text-indigo-500 font-bold hover:underline"
            >
              Clear search
            </button>
          </div>
        )}
      </div>
    </div>
  );
}