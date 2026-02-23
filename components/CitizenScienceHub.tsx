
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
    <div className="bg-emerald-50 border border-emerald-100 rounded-[3rem] p-8 md:p-12 shadow-inner overflow-hidden relative animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
        <Binoculars size={160} className="text-emerald-900" />
      </div>
      
      <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-10">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-8 text-center md:text-left">
          <div className="bg-emerald-600 p-5 rounded-3xl text-white shadow-xl shadow-emerald-200/50 flex-shrink-0">
            <Binoculars size={32} />
          </div>
          <div>
            <h3 className="text-3xl font-black text-slate-900 tracking-tighter mb-3">Adventure & Field Missions</h3>
            <p className="text-slate-600 font-medium max-w-2xl leading-relaxed">
              We have put together <span className="text-emerald-600 font-bold">{(missions || []).length} ways for you to help</span> out. These tasks are designed to help nature enthusiasts find and share observations of <span className="font-bold text-slate-900">{speciesName}</span>.
            </p>
          </div>
        </div>

        <button 
          onClick={onDownloadDossier}
          className="group flex flex-col items-center gap-3 bg-white p-8 rounded-[2.5rem] border border-emerald-200 shadow-lg hover:shadow-2xl hover:border-emerald-400 transition-all duration-300 active:scale-95 w-full lg:w-auto"
        >
          <div className="bg-emerald-50 p-4 rounded-2xl text-emerald-600 group-hover:scale-110 transition-transform">
            <Download size={24} />
          </div>
          <div className="text-center">
            <p className="font-black text-slate-900 text-sm uppercase tracking-wider">Save Adventure Guide</p>
            <p className="text-[10px] text-slate-400 font-black mt-1">DOWNLOAD RESEARCH DOSSIER</p>
          </div>
        </button>
      </div>

      <div className="mt-10 pt-8 border-t border-emerald-100 grid grid-cols-1 sm:grid-cols-3 gap-6">
        {(missions || []).map((mission, idx) => (
          <div key={idx} className="bg-white/50 p-6 rounded-3xl border border-emerald-100/50">
            <div className="flex items-center justify-between mb-3">
              <p className={`text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-widest ${
                mission.priority === 'High' ? 'bg-red-100 text-red-600' : 
                mission.priority === 'Medium' ? 'bg-amber-100 text-amber-600' : 
                'bg-emerald-100 text-emerald-600'
              }`}>
                {mission.priority} Priority
              </p>
              <Info size={12} className="text-emerald-400" />
            </div>
            <h4 className="font-bold text-slate-800 text-sm mb-1">{mission.title}</h4>
            <p className="text-[11px] text-slate-500 leading-relaxed italic">{mission.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
