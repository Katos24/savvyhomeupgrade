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
  Search
} from 'lucide-react';

interface Project {
  id: number;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  service_address: string | null;
  status: string;
  category: string;
  updated_at: string;
}

interface CustomerGroup {
  name: string;
  email: string;
  phone: string;
  projects: Project[];
}

export default function CustomerListClient({
  projects = [], // Default to empty array to prevent 'undefined' errors
  companySlug
}: {
  projects?: Project[];
  companySlug: string;
}) {
  const [expandedEmail, setExpandedEmail] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // 1. Safe Grouping Logic
  const groupedCustomers = useMemo(() => {
    const groups: Record<string, CustomerGroup> = {};

    // The safety check (projects || []) ensures forEach never runs on undefined
    (projects || []).forEach((p) => {
      const email = p.customer_email || 'no-email@provided.com';
      if (!groups[email]) {
        groups[email] = {
          name: p.customer_name || 'Unknown Customer',
          email: email,
          phone: p.customer_phone || 'No Phone',
          projects: []
        };
      }
      groups[email].projects.push(p);
    });

    const list = Object.values(groups).sort((a, b) => a.name.localeCompare(b.name));

    if (!searchTerm) return list;

    return list.filter(c => 
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      c.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [projects, searchTerm]);

  // Early return if no data at all
  if (!projects || projects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
          <User className="w-8 h-8 text-gray-600" />
        </div>
        <h2 className="text-xl font-bold text-white">No customers found</h2>
        <p className="text-gray-500 max-w-xs mt-2">We couldn't find any customer records for this company.</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-12" style={{ background: '#0a0c10', minHeight: '100vh', color: '#e8eaf0' }}>
      <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white mb-2 uppercase">Customer Directory</h1>
          <p className="text-gray-500 text-sm font-bold uppercase tracking-widest">
            {groupedCustomers.length} Unique Client Profiles
          </p>
        </div>

        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
          <input 
            type="text"
            placeholder="Search directory..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#111318] border border-white/10 rounded-2xl py-2.5 pl-10 pr-4 text-sm outline-none focus:border-orange-500/50 transition-all"
          />
        </div>
      </header>

      <div className="space-y-3">
        {groupedCustomers.map((customer) => {
          const isExpanded = expandedEmail === customer.email;
          const projectCount = customer.projects?.length || 0;

          return (
            <div 
              key={customer.email} 
              className={`rounded-[32px] border transition-all duration-500 ${
                isExpanded ? 'bg-[#161921] border-orange-500/40 shadow-2xl' : 'bg-[#111318] border-white/5 hover:border-white/10'
              }`}
            >
              {/* Customer Row */}
              <div 
                onClick={() => setExpandedEmail(isExpanded ? null : customer.email)}
                className="p-5 sm:p-6 cursor-pointer flex items-center justify-between select-none"
              >
                <div className="flex items-center gap-4 sm:gap-6">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border transition-colors ${isExpanded ? 'bg-orange-500/10 border-orange-500/20' : 'bg-white/5 border-white/10'}`}>
                    <User className={`w-6 h-6 ${isExpanded ? 'text-orange-500' : 'text-gray-600'}`} />
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-white leading-none mb-2">{customer.name}</h2>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                      <span className="flex items-center gap-1.5 text-[10px] font-black text-gray-500 uppercase tracking-widest">
                        <Mail className="w-3 h-3" /> {customer.email}
                      </span>
                      <span className="flex items-center gap-1.5 text-[10px] font-black text-orange-500/80 uppercase tracking-widest">
                        <Briefcase className="w-3 h-3" /> {projectCount} {projectCount === 1 ? 'Job' : 'Jobs'}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                   {isExpanded ? <ChevronDown className="w-5 h-5 text-orange-500" /> : <ChevronRight className="w-5 h-5 text-gray-700" />}
                </div>
              </div>

              {/* Bulked Projects Card Grid */}
              {isExpanded && (
                <div className="px-6 pb-6 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-5 border-t border-white/5">
                    {customer.projects.map((project) => (
                      <a
                        key={project.id}
                        href={`/${companySlug}/dashboard?project=${project.id}`}
                        className="group flex flex-col p-5 bg-black/40 border border-white/5 rounded-[24px] hover:border-orange-500/50 transition-all no-underline"
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex flex-col">
                            <span className="text-[10px] font-black text-orange-500 uppercase tracking-widest">Job ID</span>
                            <span className="text-xs font-mono text-white">#{project.id}</span>
                          </div>
                          <span className="text-[9px] font-black px-2 py-1 rounded-md bg-white/10 text-gray-300 uppercase tracking-widest border border-white/5">
                            {project.status?.replace('_', ' ') || 'active'}
                          </span>
                        </div>
                        
                        <p className="text-sm font-black text-white mb-1 uppercase tracking-tight">
                          {project.category?.replace('_', ' ') || 'service request'}
                        </p>
                        
                        <p className="text-[11px] font-bold text-gray-500 flex items-center gap-2 mt-1">
                          <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-gray-700" />
                          <span className="truncate">{project.service_address || 'Address Not Provided'}</span>
                        </p>
                        
                        <div className="mt-6 flex items-center justify-between pt-4 border-t border-white/5">
                          <span className="text-[9px] font-black text-gray-600 uppercase tracking-tighter">
                            Last Touch: {new Date(project.updated_at).toLocaleDateString()}
                          </span>
                          <div className="flex items-center gap-1 text-[10px] font-black text-white uppercase opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0">
                            Open Project <ArrowRight className="w-3 h-3" />
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
    </div>
  );
}