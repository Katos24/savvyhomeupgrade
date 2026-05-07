'use client';

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
  DollarSign,
  CalendarDays
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
        <div className="w-20 h-20 bg-white shadow-sm rounded-3xl flex items-center justify-center mb-6 border border-slate-100">
          <User className="w-10 h-10 text-slate-300" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Clean Slate</h2>
        <p className="text-slate-500 max-w-[240px] mt-2 text-sm font-medium leading-relaxed">
          Your customer database will grow as soon as you start creating projects.
        </p>
        <a
          href={`/${companySlug}/dashboard`}
          className="mt-8 px-6 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-black text-slate-900 shadow-sm hover:bg-slate-50 transition-all flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" /> Dashboard
        </a>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* HEADER */}
      <div className="bg-white/80 backdrop-blur-md border-b border-slate-200/60 sticky top-0 z-30">
        <div className="max-w-2xl mx-auto px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <a
              href={`/${companySlug}/dashboard`}
              className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-100 transition"
            >
              <ArrowLeft className="w-5 h-5" />
            </a>
            <div>
              <h1 className="text-lg font-black text-slate-900 tracking-tight">Directory</h1>
              <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest">{groupedCustomers.length} Total</p>
            </div>
          </div>
          
          <div className="w-10 h-10 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center">
            <Search className="w-4 h-4 text-indigo-500" />
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 pb-24 space-y-6">
        {/* SEARCH BAR - Floating Style */}
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
          <input
            type="text"
            placeholder="Search name, email, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border-none rounded-2xl py-4 pl-12 pr-4 text-sm font-medium placeholder:text-slate-400 outline-none ring-1 ring-slate-200 focus:ring-2 focus:ring-indigo-500 transition-all shadow-sm"
          />
        </div>

        {/* CUSTOMER LIST */}
        <div className="space-y-4">
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
                className={`group bg-white rounded-[2rem] border transition-all duration-300 ${
                  isExpanded ? 'ring-2 ring-indigo-500/10 border-indigo-200 shadow-xl' : 'border-slate-200/60 hover:border-slate-300 shadow-sm'
                }`}
              >
                {/* Main Row */}
                <div
                  onClick={() => setExpandedEmail(isExpanded ? null : customer.email)}
                  className="p-4 sm:p-6 cursor-pointer flex items-center gap-4"
                >
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-lg shadow-inner transition-all duration-300 ${
                    isExpanded ? 'bg-indigo-600 text-white rotate-3' : 'bg-slate-100 text-slate-400 group-hover:bg-slate-200'
                  }`}>
                    {customer.name.charAt(0).toUpperCase()}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-black text-slate-900 text-base leading-none mb-1.5">{customer.name}</h3>
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1 text-[10px] font-black text-slate-400 uppercase tracking-tight">
                        <Briefcase className="w-3 h-3 text-indigo-400" /> {jobCount} {jobCount === 1 ? 'Job' : 'Jobs'}
                      </span>
                      {totalRevenue > 0 && (
                        <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-600 text-[10px] font-black">
                          ${totalRevenue.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${isExpanded ? 'bg-indigo-50 text-indigo-500 rotate-180' : 'bg-slate-50 text-slate-300'}`}>
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </div>

                {/* Expanded Profile */}
                {isExpanded && (
                  <div className="px-4 pb-6 pt-2 animate-in fade-in slide-in-from-top-2 duration-300">
                    {/* Quick Contact Actions */}
                    <div className="grid grid-cols-2 gap-3 mb-6">
                      <a
                        href={`mailto:${customer.email}`}
                        className="flex items-center justify-center gap-2 py-3 px-4 bg-slate-900 text-white rounded-xl text-xs font-black shadow-lg shadow-slate-200 transition active:scale-95"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Mail className="w-4 h-4" /> Email
                      </a>
                      <a
                        href={`tel:${customer.phone}`}
                        className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-black transition active:scale-95 ${
                          customer.phone ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'bg-slate-100 text-slate-400 pointer-events-none'
                        }`}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Phone className="w-4 h-4" /> Call
                      </a>
                    </div>

                    {/* Meta Info */}
                    <div className="flex flex-col gap-2 mb-6 px-2">
                       <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                          <CalendarDays className="w-3.5 h-3.5 text-slate-300" />
                          <span>Customer since {new Date(customer.projects[0].updated_at).getFullYear()}</span>
                       </div>
                       {customer.phone && (
                         <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                            <Phone className="w-3.5 h-3.5 text-slate-300" />
                            <span>{customer.phone}</span>
                         </div>
                       )}
                    </div>

                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2 mb-3">Project History</p>
                    
                    <div className="space-y-2">
                      {customer.projects.map((project) => (
                        <a
                          key={project.id}
                          href={`/${companySlug}/dashboard?lead=${project.lead_id}`}
                          className="flex items-center gap-4 p-4 bg-slate-50 border border-slate-100 rounded-2xl hover:bg-indigo-50/50 hover:border-indigo-100 transition-all group/job"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1.5">
                              <span className="text-xs font-black text-slate-800 capitalize tracking-tight">
                                {project.category?.replace(/_/g, ' ') || 'General Service'}
                              </span>
                              <span className={`text-[8px] font-black px-2 py-0.5 rounded-md uppercase ${
                                project.status === 'completed' ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-600'
                              }`}>
                                {project.status || 'Active'}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 text-slate-400">
                              <MapPin className="w-3 h-3" />
                              <p className="text-[11px] font-medium truncate">{project.service_address || 'Address not listed'}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-3">
                            {project.quote_total && (
                              <span className="text-xs font-black text-slate-900">${Math.round(Number(project.quote_total))}</span>
                            )}
                            <div className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center group-hover/job:border-indigo-200 transition">
                              <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover/job:text-indigo-500" />
                            </div>
                          </div>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Empty State Search */}
        {groupedCustomers.length === 0 && searchTerm && (
          <div className="text-center py-20 bg-white rounded-[2rem] border border-dashed border-slate-200">
            <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
               <Search className="w-5 h-5 text-slate-300" />
            </div>
            <p className="text-slate-900 font-black text-sm">No matches found</p>
            <p className="text-slate-400 text-xs mt-1">Try a different name or phone number</p>
            <button
              onClick={() => setSearchTerm('')}
              className="mt-4 text-xs text-indigo-600 font-black"
            >
              Show all customers
            </button>
          </div>
        )}
      </div>
    </div>
  );
}