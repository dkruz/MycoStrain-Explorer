
import React from 'react';
import { Haplotype } from '../types';
import { History, Clock, ArrowRight } from 'lucide-react';

interface EvolutionaryTimelineProps {
  data: Haplotype[];
  focusArea?: string;
}

export const EvolutionaryTimeline: React.FC<EvolutionaryTimelineProps> = ({ data, focusArea }) => {
  // Sort by divergence time and limit to 10 taxa to prevent UI crowding as requested.
  const sortedData = [...data]
    .sort((a, b) => b.divergenceTime - a.divergenceTime)
    .slice(0, 10);

  return (
    <div className="bg-white p-10 rounded-[3rem] shadow-xl border border-slate-200">
      <div className="flex items-center justify-between mb-12">
        <div>
          <h3 className="text-2xl font-black text-slate-900 flex items-center gap-3 tracking-tight">
            <History className="text-emerald-600" /> Phylogenetic Divergence Timeline
          </h3>
          <p className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] mt-2">
            Estimated Drift Sequence (Mya) — Top 10 Lineages
          </p>
        </div>
      </div>

      <div className="relative pt-12 pb-24">
        {/* Main timeline track */}
        <div className="absolute top-1/2 left-0 w-full h-1.5 bg-slate-100 -translate-y-1/2 rounded-full"></div>
        
        <div className="relative flex justify-between items-center px-8">
          {sortedData.map((h, i) => (
            <div key={h.id} className="relative flex flex-col items-center group">
              {/* Divergence Label above node */}
              <div className="mb-8 flex flex-col items-center">
                 <span className="text-[11px] font-black text-emerald-600 mb-2 bg-emerald-50 px-2 py-0.5 rounded-md">
                   {h.divergenceTime.toFixed(1)} Mya
                 </span>
                 <div className="w-5 h-5 rounded-full bg-emerald-500 border-4 border-white shadow-lg group-hover:scale-150 group-hover:bg-indigo-500 transition-all duration-300"></div>
              </div>
              
              {/* Taxon & Region Label below node */}
              <div className="absolute top-14 w-40 text-center animate-in fade-in slide-in-from-top-2 duration-500">
                <p className="text-[12px] font-black text-slate-900 leading-tight mb-1 tracking-tighter uppercase">{h.id}</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter line-clamp-1 px-2">{h.region}</p>
              </div>

              {/* Connecting line for sorted sequence */}
              {i < sortedData.length - 1 && (
                <div className="absolute top-1/2 left-full w-full h-px border-t-2 border-dashed border-slate-200 -translate-y-1/2 pointer-events-none opacity-50"></div>
              )}
            </div>
          ))}
        </div>
        
        {/* Interpretation Footer */}
        <div className="mt-40 p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 flex items-start gap-6 shadow-inner">
          <div className="p-3 bg-white rounded-2xl shadow-sm text-emerald-600">
            <Clock size={24} />
          </div>
          <div>
            <p className="text-base font-black text-slate-900 mb-2">Evolutionary Sequence Interpretation</p>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed font-medium max-w-3xl">
              This timeline illustrates the estimated temporal sequence of genetic drift based on localized selection pressures. 
              Lineages on the left represent deeper ancestral divergences, while those on the right signify more recent 
              adaptive radiations within the <span className="text-indigo-600 font-bold">{focusArea || 'specified study'}</span> region. 
              Display limited to 10 taxa for optimized visual clarity of the phylogenetic branch points.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
