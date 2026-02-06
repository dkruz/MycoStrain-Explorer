
import React from 'react';
import { Haplotype, ComponentTrust } from '../types';
import { History, Clock, TreeDeciduous } from 'lucide-react';
import { DataTrustIndicator } from './DataTrustIndicator';

interface EvolutionaryTimelineProps {
  data: Haplotype[];
  trust?: ComponentTrust;
  mode?: 'amateur' | 'professional';
}

export const EvolutionaryTimeline: React.FC<EvolutionaryTimelineProps> = ({ data, trust, mode = 'professional' }) => {
  const sortedData = [...data].sort((a, b) => b.divergenceTime - a.divergenceTime).slice(0, 10);

  return (
    <div className="bg-white p-10 rounded-[3rem] shadow-xl border border-slate-200">
      <div className="flex items-center justify-between mb-12">
        <div>
          <h3 className="text-2xl font-black text-slate-900 flex items-center gap-3">
            <History className={mode === 'amateur' ? 'text-emerald-600' : 'text-indigo-600'} /> 
            {mode === 'amateur' ? 'The Family Journey' : 'Phylogenetic Timeline'}
          </h3>
          <p className="text-xs font-black text-slate-500 uppercase tracking-widest mt-2">
            {mode === 'amateur' ? 'When these cousins first appeared' : 'Divergence sequence (Mya)'}
          </p>
        </div>
        {trust && <DataTrustIndicator metrics={trust} label="Temporal Accuracy" />}
      </div>

      <div className="relative pt-12 pb-24 overflow-x-auto custom-scrollbar">
        <div className="min-w-[800px] relative">
          <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-100 -translate-y-1/2 rounded-full"></div>
          <div className="relative flex justify-between items-center px-10">
            {sortedData.map((h, i) => (
              <div key={h.id} className="relative flex flex-col items-center group">
                <div className="mb-6 flex flex-col items-center">
                   <span className={`text-[10px] font-black mb-2 px-2 py-0.5 rounded-md ${mode === 'amateur' ? 'bg-emerald-50 text-emerald-600' : 'bg-indigo-50 text-indigo-600'}`}>
                     {mode === 'amateur' ? `${h.divergenceTime} Million Yrs Old` : `${h.divergenceTime} Mya`}
                   </span>
                   <div className={`w-4 h-4 rounded-full border-4 border-white shadow-md transition-all group-hover:scale-150 ${mode === 'amateur' ? 'bg-emerald-500' : 'bg-indigo-500'}`}></div>
                </div>
                <div className="absolute top-12 w-32 text-center">
                  <p className="text-[11px] font-black text-slate-900 truncate uppercase">{h.id}</p>
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter truncate">{h.region}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className={`mt-32 p-8 rounded-[2.5rem] border flex items-start gap-6 shadow-inner ${mode === 'amateur' ? 'bg-emerald-50 border-emerald-100' : 'bg-slate-50 border-slate-100'}`}>
          <div className="p-3 bg-white rounded-2xl shadow-sm text-indigo-600">
            {mode === 'amateur' ? <TreeDeciduous size={24} /> : <Clock size={24} />}
          </div>
          <div>
            <p className="text-base font-black text-slate-900 mb-2">{mode === 'amateur' ? 'How to Read the Family Tree' : 'Timeline Interpretation'}</p>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              {mode === 'amateur' 
                ? "Items on the left are the 'Ancestors'. To the right are more recent variants. Solid indicators reflect verified geological records, while faded areas represent AI-modeled time gaps."
                : "Phylogenetic sequence based on molecular clock data. Basal taxa on the left represent ancestral roots, while those progressing to the right indicate recent genomic divergence. Deterministic points align with published paleobiological records; probabilistic intervals are modeled drift projections."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
