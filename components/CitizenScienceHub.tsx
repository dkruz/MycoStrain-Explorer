
import React from 'react';
import { CitizenScienceMission } from '../types';
import { Binoculars, Download, FileText, Info, ShieldCheck } from 'lucide-react';
import { Tooltip } from './Tooltip';

interface CitizenScienceHubProps {
  missions: CitizenScienceMission[];
  speciesName: string;
  onDownloadDossier: () => void;
}

export const CitizenScienceHub: React.FC<CitizenScienceHubProps> = ({ missions, speciesName, onDownloadDossier }) => {
  return (
    <div className="bg-emerald-50 border border-emerald-100 rounded-[3rem] p-8 md:p-12 shadow-inner overflow-hidden relative animate-in fade-in slide-in-from-bottom-8 duration-700" role="region" aria-labelledby="missions-title">
      <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none" aria-hidden="true">
        <Binoculars size={160} className="text-emerald-900" />
      </div>
      
      <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-10">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-8 text-center md:text-left">
          <div className="bg-emerald-600 p-5 rounded-3xl text-white shadow-xl shadow-emerald-200/50 flex-shrink-0" aria-hidden="true">
            <Binoculars size={32} />
          </div>
          <div>
            <h3 id="missions-title" className="text-3xl font-black text-slate-900 tracking-tighter mb-3">Adventure & Field Missions</h3>
            <p className="text-slate-700 font-medium max-w-2xl leading-relaxed">
              We have put together <span className="text-emerald-700 font-bold">{(missions || []).length} ways for you to help</span> out. These tasks are designed to help nature enthusiasts find and share observations of <span className="font-bold text-slate-900">{speciesName}</span>.
            </p>
          </div>
        </div>

        <Tooltip content="Download Research Dossier" position="left">
          <button 
            onClick={onDownloadDossier}
            className="group flex flex-col items-center gap-3 bg-white p-8 rounded-[2.5rem] border border-emerald-200 shadow-lg hover:shadow-2xl hover:border-emerald-400 transition-all duration-300 active:scale-95 w-full lg:w-auto focus:ring-4 focus:ring-emerald-500 focus:outline-none"
            aria-label={`Download Adventure Guide for ${speciesName}`}
          >
            <div className="bg-emerald-50 p-4 rounded-2xl text-emerald-600 group-hover:scale-110 transition-transform" aria-hidden="true">
              <Download size={24} />
            </div>
            <div className="text-center">
              <p className="font-black text-slate-900 text-sm uppercase tracking-wider">Save Adventure Guide</p>
              <p className="text-[10px] text-slate-500 font-black mt-1 tracking-widest">DOWNLOAD RESEARCH DOSSIER</p>
            </div>
          </button>
        </Tooltip>
      </div>

      <div className="mt-10 pt-8 border-t border-emerald-100 grid grid-cols-1 sm:grid-cols-3 gap-6">
        {(missions || []).map((mission, idx) => (
          <div key={idx} className="bg-white/50 p-6 rounded-3xl border border-emerald-100/50">
            <div className="flex items-center justify-between mb-3">
              <p className={`text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-widest ${
                mission.priority === 'High' ? 'bg-red-100 text-red-700' : 
                mission.priority === 'Medium' ? 'bg-amber-100 text-amber-700' : 
                'bg-emerald-100 text-emerald-700'
              }`}>
                {mission.priority} Priority
              </p>
              <Info size={12} className="text-emerald-500" aria-hidden="true" />
            </div>
            <h4 className="font-bold text-slate-900 text-sm mb-1">{mission.title}</h4>
            <p className="text-[11px] text-slate-600 leading-relaxed italic">{mission.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
