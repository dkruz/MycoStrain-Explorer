
import React from 'react';
import { ShieldCheck, BrainCircuit, Info } from 'lucide-react';
import { ComponentTrust } from '../types';

interface DataTrustIndicatorProps {
  metrics: ComponentTrust;
  label: string;
}

export const DataTrustIndicator: React.FC<DataTrustIndicatorProps> = ({ metrics, label }) => {
  // Helper to ensure values are in 0-100 range for CSS widths
  const normalize = (val: number | undefined) => {
    if (val === undefined || isNaN(val)) return 0;
    // If the value is 1 or less (and not exactly 0), it's likely a decimal probability
    if (val > 0 && val <= 1) return val * 100;
    return val;
  };

  const det = normalize(metrics.deterministicRatio);
  const prob = normalize(metrics.probabilisticRatio);
  
  // Calculate total to ensure we don't overflow, though we should be at ~100%
  const total = det + prob;
  const detWidth = total > 0 ? (det / total) * 100 : 0;
  const probWidth = total > 0 ? (prob / total) * 100 : 0;

  return (
    <div className="flex flex-col gap-2 min-w-[200px]">
      <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-[0.15em] text-slate-500">
        <span className="flex items-center gap-1.5">
          <ShieldCheck size={10} className="text-indigo-600" /> 
          Det: {det.toFixed(0)}%
        </span>
        <span className="flex items-center gap-1.5 text-right">
          {prob.toFixed(0)}% Prob 
          <BrainCircuit size={10} className="text-amber-600" />
        </span>
      </div>
      
      <div className="h-3 w-full bg-slate-200 rounded-full overflow-hidden flex shadow-[inset_0_1px_3px_rgba(0,0,0,0.1)] border border-slate-300/50">
        {detWidth > 0 && (
          <div 
            className="h-full bg-indigo-600 transition-all duration-1000 ease-out border-r border-white/40" 
            style={{ width: `${detWidth}%` }} 
          />
        )}
        {probWidth > 0 && (
          <div 
            className="h-full bg-amber-500 transition-all duration-1000 ease-out" 
            style={{ width: `${probWidth}%` }} 
          />
        )}
      </div>

      <div className="flex items-center justify-between mt-0.5">
        <p className="text-[10px] font-black text-slate-800 uppercase tracking-tighter">{label}</p>
        <div className="group relative">
          <Info size={12} className="text-slate-400 cursor-help hover:text-indigo-600 transition-colors" />
          <div className="absolute bottom-full right-0 mb-3 w-56 p-4 bg-slate-900 text-white text-[10px] font-medium leading-relaxed rounded-2xl opacity-0 group-hover:opacity-100 transition-all pointer-events-none z-[100] shadow-2xl translate-y-1 group-hover:translate-y-0">
            <p className="mb-2 font-black border-b border-white/10 pb-2 uppercase tracking-widest text-[8px] text-indigo-400">Data Provenance Protocol</p>
            This metric calculates the balance between <span className="text-indigo-400 font-bold">Empirical Evidence</span> (Geographic records/PubMed citations) and <span className="text-amber-400 font-bold">Synthesized Inference</span> (AI-modeled genomic drift).
          </div>
        </div>
      </div>
    </div>
  );
};
