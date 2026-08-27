'use client';

import { useState, useMemo } from 'react';
import { ChevronDown, Mail, MapPin, Briefcase, ArrowRight, User, Phone, Search, CalendarDays } from 'lucide-react';

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

const formatCurrency = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);

export default function CustomerListClient({
  projects = [],
  companySlug,
  accentColor = '#2563eb',
}: {
  projects?: Project[];
  companySlug: string;
  accentColor?: string;
}) {
  const [expandedEmail, setExpandedEmail] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const groupedCustomers = useMemo(() => {
    const groups: Record<string, CustomerGroup> = {};
    (projects || []).forEach((p) => {
      const email = p.customer_email || 'no-email@provided.com';
      if (!groups[email]) {
        groups[email] = { name: p.customer_name || 'Unknown Customer', email, phone: p.customer_phone || '', projects: [] };
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

  const totalRevenueAllCustomers = useMemo(
    () => (projects || []).reduce((sum, p) => sum + (parseFloat(String(p.quote_total || 0)) || 0), 0),
    [projects]
  );
  const unpaidCount = useMemo(
    () => (projects || []).filter((p) => p.payment_status && p.payment_status !== 'paid' && parseFloat(String(p.quote_total || 0)) > 0).length,
    [projects]
  );

  if (!projects || projects.length === 0) {
    return (
      <div className="min-h-screen bg-[#faf9f5] flex flex-col items-center justify-center text-center px-4">
        <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-5 border border-[#e7e2d8]">
          <User className="w-7 h-7 text-[#a8a29e]" />
        </div>
        <h2 className="text-xl font-semibold text-[#1c1917]">Your customer directory</h2>
        <p className="text-[#78716c] max-w-[300px] mt-2 text-sm leading-relaxed">
          When you convert leads into projects, customers automatically appear here with their full job history.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf9f5]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Header — no back arrow, no custom nav; the persistent sidebar
            already provides that */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-[#1c1917]">Customers</h1>
          <p className="text-xs text-[#a8a29e] mt-1">{groupedCustomers.length} total</p>
        </div>

        {/* Stats strip — same joined-strip pattern as DashboardStats */}
        <div className="flex rounded-2xl border border-[#e7e2d8] bg-white overflow-hidden mb-6">
          {[
            { label: 'Total revenue', value: formatCurrency(totalRevenueAllCustomers), sub: 'Lifetime' },
            { label: 'Customers', value: String(groupedCustomers.length), sub: `${projects.length} job${projects.length === 1 ? '' : 's'} total` },
            { label: 'Unpaid', value: String(unpaidCount), sub: unpaidCount > 0 ? 'Job(s) outstanding' : 'Nothing owed', dot: unpaidCount > 0 },
          ].map((s, i) => (
            <div key={s.label} className={`flex-1 px-5 py-4 min-w-0 ${i > 0 ? 'border-l border-[#e7e2d8]' : ''}`}>
              <div className="flex items-center gap-1.5 mb-1">
                {s.dot && <span className="w-1.5 h-1.5 rounded-full shrink-0 bg-amber-600" />}
                <p className="text-sm font-medium text-[#292524] truncate">{s.label}</p>
              </div>
              <p className="text-2xl font-semibold text-[#1c1917] tracking-tight truncate">{s.value}</p>
              <p className="text-xs text-[#a8a29e] mt-1 truncate">{s.sub}</p>
            </div>
          ))}
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#a8a29e]" />
          <input
            type="text"
            placeholder="Search name, email, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-[#e7e2d8] rounded-full py-3 pl-11 pr-4 text-sm placeholder:text-[#a8a29e] outline-none focus:border-[#1c1917] transition-colors"
          />
        </div>

        {/* Customer list */}
        <div className="rounded-2xl border border-[#e7e2d8] bg-white overflow-hidden">
          {groupedCustomers.map((customer, idx) => {
            const isExpanded = expandedEmail === customer.email;
            const jobCount = customer.projects.length;
            const totalRevenue = customer.projects.reduce((sum, p) => sum + (parseFloat(String(p.quote_total || 0)) || 0), 0);

            return (
              <div key={customer.email} className={idx > 0 ? 'border-t border-[#e7e2d8]' : ''}>
                <button
                  onClick={() => setExpandedEmail(isExpanded ? null : customer.email)}
                  className="w-full p-4 sm:p-5 flex items-center gap-4 text-left hover:bg-[#faf9f5] transition-colors"
                >
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center font-semibold text-sm shrink-0"
                    style={{ backgroundColor: `${accentColor}18`, color: accentColor }}
                  >
                    {customer.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-[#1c1917] text-sm">{customer.name}</h3>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="flex items-center gap-1 text-xs text-[#a8a29e]">
                        <Briefcase className="w-3 h-3" /> {jobCount} {jobCount === 1 ? 'job' : 'jobs'}
                      </span>
                      {totalRevenue > 0 && (
                        <span className="text-xs font-medium text-emerald-700">{formatCurrency(totalRevenue)}</span>
                      )}
                    </div>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-[#a8a29e] shrink-0 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                </button>

                {isExpanded && (
                  <div className="px-4 sm:px-5 pb-5 pt-1">
                    <div className="grid grid-cols-2 gap-2 mb-4">
                      <a
                        href={`mailto:${customer.email}`}
                        className="flex items-center justify-center gap-2 py-2.5 rounded-lg bg-[#1c1917] text-white text-xs font-medium hover:bg-[#292524] transition-colors"
                      >
                        <Mail className="w-3.5 h-3.5" /> Email
                      </a>
                      <a
                        href={customer.phone ? `tel:${customer.phone}` : undefined}
                        className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-medium transition-colors ${
                          customer.phone ? 'text-white hover:opacity-90' : 'bg-[#f5f1e8] text-[#a8a29e] pointer-events-none'
                        }`}
                        style={customer.phone ? { backgroundColor: accentColor } : undefined}
                      >
                        <Phone className="w-3.5 h-3.5" /> Call
                      </a>
                    </div>

                    <div className="flex flex-col gap-1.5 mb-4 text-xs text-[#78716c]">
                      <div className="flex items-center gap-1.5">
                        <CalendarDays className="w-3.5 h-3.5 text-[#d6d3d1]" />
                        Customer since {new Date(customer.projects[customer.projects.length - 1].updated_at).getFullYear()}
                      </div>
                      {customer.phone && (
                        <div className="flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-[#d6d3d1]" />
                          {customer.phone}
                        </div>
                      )}
                    </div>

                    <p className="text-[11px] font-mono font-medium text-[#a8a29e] uppercase tracking-wider mb-2">Project history</p>
                    <div className="space-y-1.5">
                      {customer.projects.map((project) => (
                        <a
                          key={project.id}
                          href={`/${companySlug}/dashboard?lead=${project.lead_id}`}
                          className="flex items-center gap-3 p-3 bg-[#faf9f5] border border-[#e7e2d8] rounded-xl hover:border-[#d6d3d1] transition-colors group"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-semibold text-[#292524] capitalize">
                                {project.category?.replace(/_/g, ' ') || 'General service'}
                              </span>
                              <span
                                className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
                                  project.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-[#e7e2d8] text-[#78716c]'
                                }`}
                              >
                                {project.status || 'Active'}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 text-[#a8a29e]">
                              <MapPin className="w-3 h-3 shrink-0" />
                              <p className="text-xs truncate">{project.service_address || 'Address not listed'}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            {project.quote_total ? (
                              <span className="text-xs font-semibold text-[#1c1917]">{formatCurrency(Number(project.quote_total))}</span>
                            ) : null}
                            <ArrowRight className="w-3.5 h-3.5 text-[#d6d3d1] group-hover:text-[#78716c] transition-colors" />
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

        {groupedCustomers.length === 0 && searchTerm && (
          <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-[#e7e2d8] mt-4">
            <p className="text-[#1c1917] font-medium text-sm">No matches found</p>
            <p className="text-[#a8a29e] text-xs mt-1">Try a different name or phone number</p>
            <button onClick={() => setSearchTerm('')} className="mt-3 text-xs font-medium" style={{ color: accentColor }}>
              Show all customers
            </button>
          </div>
        )}
      </div>
    </div>
  );
}