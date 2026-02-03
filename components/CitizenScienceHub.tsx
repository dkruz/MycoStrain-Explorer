
import React from 'react';
import { CitizenScienceMission } from '../types';
import { Binoculars, Download, FileText, Info, ShieldCheck } from 'lucide-react';

interface CitizenScienceHubProps {
  missions: CitizenScienceMission[];
  speciesName: string;
  onDownloadDossier: () => void;
}

export const CitizenScienceHub: React.FC<CitizenScienceHubProps> = ({ missions, speciesName, onDownloadDossier }) => {
  return (
    <div className="bg-emerald-50 border border-emerald-100 rounded-[3rem] p-8 md:p-12 shadow-inner overflow-hidden relative">
      <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
        <Binoculars size={160} className="text-emerald-900" />
      </div>
      
      <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-10">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-8 text-center md:text-left">
          <div className="bg-emerald-600 p-5 rounded-3xl text-white shadow-xl shadow-emerald-200/50 flex-shrink-0">
            <Binoculars size={32} />
          </div>
          <div>
            <h3 className="text-3xl font-black text-slate-900 tracking-tighter mb-3">Field Research & Citizen Science Hub</h3>
            <p className="text-slate-600 font-medium max-w-2xl leading-relaxed">
              We have synthesized <span className="text-emerald-600 font-bold">{missions.length} custom field missions</span> to validate the <span className="font-bold text-slate-900">{speciesName}</span> model. 
              Please refer to the <span className="text-emerald-700 font-bold">Full Research Dossier</span> for expanded protocols, substrate validation strategies, and coordinate-specific priority maps.
            </p>
          </div>
        </div>

        <button 
          onClick={onDownloadDossier}
          className="group flex flex-col items-center gap-3 bg-white p-8 rounded-[2.5rem] border border-emerald-200 shadow-lg hover:shadow-2xl hover:border-emerald-400 transition-all duration-300 active:scale-95"
        >
          <div className="bg-emerald-50 p-4 rounded-2xl text-emerald-600 group-hover:scale-110 transition-transform">
            <Download size={24} />
          </div>
          <div className="text-center">
            <p className="font-black text-slate-900 text-sm uppercase tracking-wider">Expand Protocols</p>
            <p className="text-[10px] text-slate-400 font-black mt-1">DOWNLOAD RESEARCH DOSSIER</p>
          </div>
        </button>
      </div>

      <div className="mt-10 pt-8 border-t border-emerald-100 flex flex-wrap gap-8 justify-center lg:justify-start">
        <div className="flex items-center gap-3">
          <ShieldCheck className="text-emerald-500" size={18} />
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Protocol Version v4.2-CS</span>
        </div>
        <div className="flex items-center gap-3">
          <FileText className="text-emerald-500" size={18} />
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{missions.length} Missions Synthesized</span>
        </div>
        <div className="flex items-center gap-3">
          <Info className="text-emerald-500" size={18} />
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Expanded Field Analysis Ready</span>
        </div>
      </div>
    </div>
  );
};
