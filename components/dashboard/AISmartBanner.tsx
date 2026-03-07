'use client';

import React from 'react';
import { Sparkles, AlertTriangle, ArrowRight, Zap, Clock, X } from 'lucide-react';
import { AIAnalysisData } from '@/lib/types';

interface AISmartBannerProps {
  analysis: AIAnalysisData;
  onViewLead: () => void;
  onClose?: () => void;
}

export default function AISmartBanner({ analysis, onViewLead, onClose }: AISmartBannerProps) {
  // Determine if this is high priority
  const isUrgent = analysis.urgency === 'Emergency' || analysis.urgency === 'High Priority';
  
  return (
    <div className={`relative group overflow-hidden rounded-2xl border transition-all duration-300 shadow-2xl ${
      isUrgent 
        ? 'bg-red-500/10 border-red-500/30 hover:border-red-500/50' 
        : 'bg-indigo-500/10 border-indigo-500/30 hover:border-indigo-500/50'
    }`}>
      {/* Animated Background Glow */}
      <div className={`absolute -inset-x-20 -top-20 -bottom-20 opacity-20 blur-3xl transition-opacity group-hover:opacity-30 ${
        isUrgent ? 'bg-red-600' : 'bg-indigo-600'
      }`} />

      <div className="relative px-5 py-4 flex flex-col md:flex-row items-center justify-between gap-4 backdrop-blur-md">
        <div className="flex items-center gap-4 text-left w-full md:w-auto">
          {/* Icon Orb */}
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 border shadow-inner ${
            isUrgent 
              ? 'bg-red-500/20 border-red-400/30 text-red-400' 
              : 'bg-indigo-500/20 border-indigo-400/30 text-indigo-400'
          }`}>
            {isUrgent ? (
              <AlertTriangle className="w-6 h-6 animate-pulse" />
            ) : (
              <Sparkles className="w-6 h-6" />
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border ${
                isUrgent ? 'bg-red-500/20 border-red-500/50 text-red-200' : 'bg-indigo-500/20 border-indigo-500/50 text-indigo-200'
              }`}>
                AI Insight
              </span>
              {analysis.urgency && (
                <span className="text-[10px] font-medium text-white/50 uppercase tracking-tight">
                  • {analysis.urgency}
                </span>
              )}
            </div>
            
            <h4 className="text-white font-bold text-base leading-tight truncate">
              {analysis.customer_name ? `${analysis.customer_name}: ` : ''}
              {analysis.summary || "New lead analysis available."}
            </h4>
            
            {analysis.next_steps?.[0] && (
              <p className="text-white/60 text-sm mt-0.5 flex items-center gap-1.5 truncate">
                <Zap className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                Next: {analysis.next_steps[0]}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <button 
            onClick={onViewLead}
            className={`flex-1 md:flex-none px-5 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-lg ${
              isUrgent 
                ? 'bg-red-600 hover:bg-red-500 text-white shadow-red-900/20' 
                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-900/20'
            }`}
          >
            Review Analysis <ArrowRight className="w-4 h-4" />
          </button>
          
          {onClose && (
            <button onClick={onClose} className="p-2 text-white/30 hover:text-white transition">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}