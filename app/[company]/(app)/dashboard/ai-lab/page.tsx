'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import LeadAIAnalysis from '@/components/LeadAIAnalysis';
import { Sparkles, Search, ChevronRight, LayoutGrid, Zap, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function CompanyAILab() {
  const params = useParams();
  const company = params?.company as string;
  
  const [leads, setLeads] = useState([]);
  const [selectedLead, setSelectedLead] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    async function fetchLeads() {
      try {
        // Fetching leads scoped to this specific company
        const res = await fetch(`/api/leads/get-all?company=${company}`); 
        const data = await res.json();
        
        // Filter for leads that actually have photos to test the AI
        const leadsWithPhotos = (data.leads || []).filter(
          (l: any) => l.photos && l.photos.length > 0
        );
        setLeads(leadsWithPhotos);
      } catch (err) {
        console.error("Failed to load leads", err);
      } finally {
        setLoading(false);
      }
    }
    if (company) fetchLeads();
  }, [company]);

  const filteredLeads = leads.filter((l: any) => 
    l.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.service_type?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50/50 p-4 sm:p-8">
      <div className="max-w-6xl mx-auto">
        
        {/* Breadcrumb / Back Navigation */}
        <div className="mb-6">
          <Link 
            href={`/${company}/dashboard`}
            className="inline-flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-indigo-600 transition-colors"
          >
            <ArrowLeft className="w-3 h-3" />
            Back to Dashboard
          </Link>
        </div>

        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">
              AI Site Intelligence
            </h1>
            <p className="text-slate-500 font-bold text-xs uppercase tracking-[0.2em] mt-1">
              {company} Internal Lab • Powered by Claude 3.5
            </p>
          </div>

          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search leads..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-11 pr-6 py-3 bg-white border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-indigo-50 transition-all w-full md:w-64 shadow-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Lead Selection Sidebar */}
          <div className="lg:col-span-4">
            <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden h-fit">
              <div className="p-5 border-b border-slate-50 bg-slate-50/50 flex justify-between items-center">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Customer Photos
                </span>
                <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                  {filteredLeads.length}
                </span>
              </div>
              
              <div className="p-3 space-y-2 max-h-[500px] overflow-y-auto">
                {loading ? (
                  <div className="p-8 text-center text-slate-300 animate-pulse font-bold text-xs">Fetching Data...</div>
                ) : filteredLeads.length === 0 ? (
                  <div className="p-12 text-center text-slate-400 font-bold text-[10px] uppercase tracking-widest leading-relaxed">
                    No leads found <br/> with image assets
                  </div>
                ) : (
                  filteredLeads.map((lead: any) => (
                    <button
                      key={lead.id}
                      onClick={() => setSelectedLead(lead)}
                      className={`w-full text-left p-4 rounded-[20px] transition-all flex items-center justify-between group ${
                        selectedLead?.id === lead.id 
                          ? 'bg-slate-900 text-white shadow-xl shadow-slate-200 scale-[1.02]' 
                          : 'hover:bg-slate-50 text-slate-700 border border-transparent hover:border-slate-100'
                      }`}
                    >
                      <div className="overflow-hidden">
                        <p className={`text-xs font-black truncate uppercase tracking-wide ${selectedLead?.id === lead.id ? 'text-white' : 'text-slate-900'}`}>
                          {lead.first_name} {lead.last_name}
                        </p>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tight mt-0.5 italic">
                          {lead.service_type || 'Custom Work'}
                        </p>
                      </div>
                      <ChevronRight className={`w-4 h-4 transition-transform ${selectedLead?.id === lead.id ? 'translate-x-1 text-indigo-400' : 'text-slate-200 group-hover:text-slate-400'}`} />
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Analysis Workspace */}
          <div className="lg:col-span-8">
            {selectedLead ? (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                {/* Active Lead Header */}
                <div className="bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 shadow-inner">
                      <Zap className="w-5 h-5 fill-indigo-600" />
                    </div>
                    <div>
                      <h2 className="text-xl font-black text-slate-900 tracking-tight leading-none">
                        {selectedLead.first_name} {selectedLead.last_name}
                      </h2>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-2">
                        Active Lead ID: {selectedLead.id?.toString().slice(-6)}
                      </p>
                    </div>
                  </div>
                  <div className="hidden sm:flex -space-x-2">
                    {selectedLead.photos?.slice(0, 3).map((_: any, i: number) => (
                      <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center">
                         <span className="text-[8px] font-black text-slate-400">{i + 1}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* AI Intelligence Component */}
                <LeadAIAnalysis lead={selectedLead} />
              </div>
            ) : (
              <div className="h-full min-h-[450px] border-2 border-dashed border-slate-200 rounded-[48px] flex flex-col items-center justify-center text-center p-12 bg-white/40 shadow-inner">
                <div className="w-20 h-20 bg-white rounded-[28px] shadow-sm border border-slate-100 flex items-center justify-center mb-6">
                  <LayoutGrid className="w-8 h-8 text-slate-200" />
                </div>
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-[0.3em]">Select Image Source</h3>
                <p className="text-slate-400 max-w-xs mt-3 text-[10px] font-bold leading-relaxed uppercase">
                  Pick a customer from the left to start Claude's visual inspection and material takeoff.
                </p>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}