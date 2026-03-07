'use client';

import { useState, useEffect } from 'react';
import { 
  Sparkles, AlertTriangle, Hammer, Clock, 
  DollarSign, ShieldCheck, ChevronDown, 
  ChevronUp, Zap, Loader2, Check, ArrowRight 
} from 'lucide-react';
import { toast } from 'sonner';

type Props = {
  lead: any;
  onUpdate?: () => void;
};

export default function LeadAIAnalysis({ lead, onUpdate }: Props) {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(0);
  const [analysis, setAnalysis] = useState<any>(null);
  const [isExpanded, setIsExpanded] = useState(true);
  const [importing, setImporting] = useState(false);

  const photos = lead?.photos || [];
  const steps = ["Scanning Assets", "Claude Vision Analysis", "Calculating Materials", "Finalizing Estimate"];

  // Mock "Processing" effect for better UX
  useEffect(() => {
    let interval: any;
    if (loading && step < steps.length - 1) {
      interval = setInterval(() => {
        setStep((s) => s + 1);
      }, 2500);
    }
    return () => clearInterval(interval);
  }, [loading, step]);

  const handleRunAnalysis = async () => {
    if (photos.length === 0) {
      toast.error("No photos available to analyze.");
      return;
    }

    setLoading(true);
    setStep(0);
    setAnalysis(null);

    try {
      const res = await fetch('/api/ai/analyze-photos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrls: photos,
          category: lead?.service_type || 'General',
          description: lead?.notes || ''
        }),
      });

      const data = await res.json();
      if (data.success) {
        setAnalysis(data.analysis);
        toast.success("Analysis synchronized!");
      } else {
        toast.error(data.error || "Analysis failed");
      }
    } catch (err) {
      toast.error("Connection error during AI processing.");
    } finally {
      setLoading(false);
    }
  };

  const handleImportToProject = async () => {
    setImporting(true);
    try {
      // Stripping symbols from Claude's currency strings
      const numericTotal = analysis.costBreakdown?.totalMid?.replace(/[^0-9.]/g, '') || 0;
      
      const res = await fetch('/api/leads/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: lead.id,
          action: 'import_ai_data',
          quote_total: parseFloat(numericTotal),
          ai_notes: analysis.summary,
          suggested_materials: analysis.materials?.required
        }),
      });

      if (res.ok) {
        toast.success("Project data updated with AI findings");
        if (onUpdate) onUpdate();
      }
    } catch (err) {
      toast.error("Failed to sync data to lead.");
    } finally {
      setImporting(false);
    }
  };

  if (photos.length === 0) return null;

  return (
    <div className="bg-white border border-slate-200 rounded-[32px] overflow-hidden shadow-sm mb-6 transition-all">
      {/* Header */}
      <div className="px-6 py-5 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-100">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Site Intelligence</h3>
            <p className="text-sm font-black text-slate-800">Claude 3.5 Photo Analysis</p>
          </div>
        </div>
        <button onClick={() => setIsExpanded(!isExpanded)} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
          {isExpanded ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
        </button>
      </div>

      {isExpanded && (
        <div className="p-8">
          {loading ? (
            <div className="py-12 flex flex-col items-center text-center">
              <div className="relative mb-6">
                <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-indigo-400" />
                </div>
              </div>
              <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-2">{steps[step]}</h4>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-tighter italic">Processing visual buffers & metadata...</p>
            </div>
          ) : !analysis ? (
            <div className="text-center py-10">
              <div className="w-16 h-16 bg-slate-50 rounded-[20px] flex items-center justify-center mx-auto mb-6">
                <Zap className="w-6 h-6 text-slate-300" />
              </div>
              <p className="text-sm text-slate-500 mb-6 font-medium max-w-xs mx-auto italic">Claude will scan the {photos.length} photos attached to this lead to build a material takeoff and labor estimate.</p>
              <button
                onClick={handleRunAnalysis}
                className="bg-slate-900 hover:bg-black text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.15em] transition-all shadow-xl shadow-slate-200 active:scale-95"
              >
                Initiate Inspection
              </button>
            </div>
          ) : (
            <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
              
              {/* Top Summary */}
              <div className="p-6 bg-indigo-600 rounded-[24px] text-white shadow-xl shadow-indigo-100 relative overflow-hidden">
                <Sparkles className="absolute -right-4 -top-4 w-24 h-24 text-white/10 rotate-12" />
                <span className="text-[10px] font-black text-indigo-200 uppercase tracking-widest block mb-2">Claude's Findings</span>
                <p className="text-sm font-medium leading-relaxed relative z-10">{analysis.summary}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Visual Condition */}
                <div className="p-5 border border-slate-100 rounded-[24px] bg-white">
                  <div className="flex items-center gap-2 mb-4">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Inspection Data</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed font-medium mb-4">{analysis.whatYouSee}</p>
                  <div className="flex gap-2">
                    <div className="bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
                       <span className="text-[9px] font-black text-slate-400 uppercase block">Urgency</span>
                       <span className="text-[10px] font-black text-slate-800 uppercase tracking-tight">{analysis.urgency}</span>
                    </div>
                    <div className="bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
                       <span className="text-[9px] font-black text-slate-400 uppercase block">Condition</span>
                       <span className="text-[10px] font-black text-slate-800 uppercase tracking-tight">{analysis.condition}</span>
                    </div>
                  </div>
                </div>

                {/* Labor */}
                <div className="p-5 border border-slate-100 rounded-[24px] bg-white">
                  <div className="flex items-center gap-2 mb-4">
                    <Clock className="w-4 h-4 text-indigo-500" />
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Labor Schedule</span>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center pb-2 border-b border-slate-50">
                      <span className="text-xs font-bold text-slate-400 uppercase">Est. Time</span>
                      <span className="text-xs font-black text-slate-700">{analysis.laborAndTime?.estimatedHours}</span>
                    </div>
                    <div className="flex justify-between items-center pb-2 border-b border-slate-50">
                      <span className="text-xs font-bold text-slate-400 uppercase">Crew Size</span>
                      <span className="text-xs font-black text-slate-700">{analysis.laborAndTime?.workers} Men</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-slate-400 uppercase">Complexity</span>
                      <span className="text-xs font-black text-slate-700">{analysis.complexity}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Materials */}
              <div className="p-6 bg-slate-50 rounded-[24px] border border-slate-100">
                <div className="flex items-center gap-2 mb-4">
                  <Hammer className="w-4 h-4 text-orange-500" />
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Required Materials</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {analysis.materials?.required?.map((m: string, i: number) => (
                    <div key={i} className="flex items-center gap-2 text-xs font-bold text-slate-700 bg-white p-2 rounded-xl border border-slate-100">
                      <div className="w-1.5 h-1.5 rounded-full bg-orange-400" />
                      {m}
                    </div>
                  ))}
                </div>
              </div>

              {/* Financial Review & Import */}
              <div className="bg-slate-900 rounded-[32px] p-8 text-white relative overflow-hidden">
                <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-emerald-500/10 skew-x-12" />
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-6">
                    <DollarSign className="w-4 h-4 text-emerald-400" />
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Project Estimate</span>
                  </div>
                  
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <div className="flex gap-8">
                      <div>
                        <p className="text-[10px] font-black text-slate-500 uppercase mb-1">Low Range</p>
                        <p className="text-2xl font-black text-white leading-none tracking-tight">{analysis.costBreakdown?.totalLow}</p>
                      </div>
                      <div className="h-10 w-px bg-slate-800" />
                      <div>
                        <p className="text-[10px] font-black text-emerald-500 uppercase mb-1">Recommended</p>
                        <p className="text-2xl font-black text-white leading-none tracking-tight">{analysis.costBreakdown?.totalMid}</p>
                      </div>
                    </div>

                    <button
                      onClick={handleImportToProject}
                      disabled={importing}
                      className="group relative flex items-center gap-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all active:scale-95 disabled:opacity-50"
                    >
                      {importing ? (
                        <>Syncing Data...</>
                      ) : (
                        <>
                          Sync to Quote 
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Reset Option */}
              <button 
                onClick={() => setAnalysis(null)}
                className="w-full py-4 text-[10px] font-black text-slate-300 uppercase tracking-widest hover:text-red-400 transition-colors border-t border-slate-50 mt-4"
              >
                Discard Results & Restart Scan
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}