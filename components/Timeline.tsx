
import React from 'react';
import { Haplotype } from '../types';
import { History, Clock, ArrowRight } from 'lucide-react';

interface EvolutionaryTimelineProps {
  data: Haplotype[];
  focusArea?: string;
}

// Fixed: Component updated to accept focusArea prop to resolve the scope error on line 49.
export const EvolutionaryTimeline: React.FC<EvolutionaryTimelineProps> = ({ data, focusArea }) => {
  const sortedData = [...data].sort((a, b) => b.divergenceTime - a.divergenceTime);
  const maxTime = Math.max(...data.map(d => d.divergenceTime), 1);

  return (
    <div className="bg-white p-10 rounded-[3rem] shadow-xl border border-slate-200">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h3 className="text-2xl font-black text-slate-900 flex items-center gap-3">
            <History className="text-emerald-600" /> Phylogenetic Divergence Timeline
          </h3>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Estimated Drift Sequence (Mya)</p>
        </div>
      </div>

      <div className="relative pt-12 pb-20">
        <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-100 -translate-y-1/2 rounded-full"></div>
        
        <div className="relative flex justify-between items-center px-4">
          {sortedData.map((h, i) => (
            <div key={h.id} className="relative flex flex-col items-center group">
              <div className="mb-6 flex flex-col items-center">
                 <span className="text-[10px] font-bold text-slate-400 mb-2">{h.divergenceTime.toFixed(1)} Mya</span>
                 <div className="w-4 h-4 rounded-full bg-emerald-500 border-4 border-white shadow-lg group-hover:scale-150 transition-transform"></div>
              </div>
              
              <div className="absolute top-12 w-32 text-center">
                <p className="text-[11px] font-black text-slate-800 leading-tight mb-1">{h.id}</p>
                <p className="text-[9px] text-slate-400 font-medium uppercase tracking-tighter line-clamp-1">{h.region}</p>
              </div>

              {i < sortedData.length - 1 && (
                <div className="absolute top-1/2 left-full w-full h-px border-t border-dashed border-slate-300 -translate-y-1/2 pointer-events-none"></div>
              )}
            </div>
          ))}
        </div>
        
        <div className="mt-32 p-6 bg-slate-50 rounded-3xl border border-slate-100 flex items-start gap-4">
          <Clock className="text-emerald-600 shrink-0" size={20} />
          <div>
            <p className="text-xs font-bold text-slate-700">Evolutionary Sequence Interpretation</p>
            <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">
              {/* Fixed: Use the focusArea prop here instead of the undefined 'h' variable. */}
              This timeline illustrates the estimated temporal sequence of genetic drift. Strains on the left represent deeper ancestral lineages, while those on the right are more recent evolutionary diversifications within the {focusArea || 'study'} region.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
