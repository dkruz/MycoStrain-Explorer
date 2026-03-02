
import React from 'react';
import { trackProtocolExport } from '../services/analytics';
import { Tooltip } from './Tooltip';
import { 
  X, Info, BookOpen, Target, Dna, Share2, History, Shield, Zap, 
  ChevronRight, Microscope, Globe, Activity, FileDown, Binoculars, Camera,
  Map as MapIcon, ListFilter, FileText, ShieldCheck, BrainCircuit
} from 'lucide-react';

interface UserGuideProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UserGuide: React.FC<UserGuideProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const workflowSteps = [
    { id: "01", title: "Geographic Distribution (Map)", icon: MapIcon, desc: "Analyze the Mercator projection to identify 'Steel Silhouette' clusters.", op: "Operational Procedure: Zoom into specific geographic quadrants to analyze 'Genetic Outliers'.", detail: "Novice Tip: Use the zoom controls to isolate specific state boundaries." },
    { id: "02", title: "Mutational Network Structure", icon: Share2, desc: "Navigate the force-directed graph to see how haplotypes cluster by genomic similarity.", op: "Operational Procedure: Identify 'Bottleneck Nodes' representing pivotal mutational events.", detail: "Novice Tip: Hover over nodes to reveal Metamorphotic Chemistry markers." },
    { id: "03", title: "Phylogenetic Timeline", icon: History, desc: "Read the temporal sequence from left (ancestral) to right (recent).", op: "Operational Procedure: Compare the divergence times of regional haplotypes.", detail: "Novice Tip: A 'High Mya' branch point suggests an ancient lineage." },
    { id: "04", title: "Genomic Drift Ontologies (Table)", icon: ListFilter, desc: "Cross-reference specific SNP markers across all 12 haplotypes.", op: "Operational Procedure: Look for 'Conserved Columns' to identify core genomic markers.", detail: "Novice Tip: Look for columns with sparse markers indicating rare mutations." },
    { id: "05", title: "Executive Origin Dossier", icon: FileText, desc: "Synthesize the AI-generated research summary.", op: "Operational Procedure: Read the dossier to identify hypothesized 'Ancestral Refugia' locations.", detail: "Novice Tip: This text provides the 'narrative' of the species' journey." },
    { id: "06", title: "Field Mission Engagement", icon: Binoculars, desc: "Transition from digital analysis to physical validation.", op: "Operational Procedure: Select missions based on proximity to predicted coordinates.", detail: "Novice Tip: Use the 'Download Dossier' button for offline use." }
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 md:p-10" role="dialog" aria-modal="true" aria-labelledby="guide-title">
      <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-md" onClick={onClose} aria-hidden="true" />
      <div className="relative bg-white w-full max-w-6xl max-h-[90vh] rounded-[3.5rem] shadow-2xl border border-slate-200 overflow-hidden flex flex-col animate-in fade-in zoom-in duration-300">
        <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-6">
            <div className="bg-indigo-600 p-4 rounded-3xl text-white shadow-xl shadow-indigo-100" aria-hidden="true">
              <BookOpen size={28} />
            </div>
            <div>
              <h2 id="guide-title" className="text-3xl font-black text-slate-900 tracking-tighter">Researcher Protocol Operation Guide</h2>
              <p className="text-[11px] font-black text-slate-500 uppercase tracking-[0.3em] mt-1">Synthesis Manual v4.2.0</p>
            </div>
          </div>
          <Tooltip content="Close Guide">
            <button 
              onClick={onClose} 
              className="p-4 hover:bg-slate-200 rounded-2xl transition-colors focus:ring-2 focus:ring-slate-400 focus:outline-none"
              aria-label="Close User Guide"
            >
              <X size={24} className="text-slate-500" aria-hidden="true" />
            </button>
          </Tooltip>
        </div>

        <div className="flex-1 overflow-y-auto p-10 md:p-14 custom-scrollbar bg-white">
          <div className="max-w-5xl mx-auto space-y-20">
            
            {/* Provenance Section */}
            <section className="p-10 bg-slate-900 rounded-[3.5rem] text-white">
              <h3 className="text-sm font-black text-indigo-400 uppercase tracking-[0.4em] mb-8 flex items-center gap-3">
                <ShieldCheck size={20} aria-hidden="true" /> IV. Understanding Data Provenance
              </h3>
              <div className="grid md:grid-cols-2 gap-12">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-indigo-300">
                    <ShieldCheck size={24} aria-hidden="true" />
                    <p className="font-black text-xl">Deterministic Data</p>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Represented by <span className="text-indigo-400 font-bold italic">Solid Indigo Meters</span>. These data points are sourced directly from established scientific records, paleobiological papers, and geolocated herbarium samples found via real-time search grounding. 
                  </p>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-amber-400">
                    <BrainCircuit size={24} aria-hidden="true" />
                    <p className="font-black text-xl">Probabilistic Data</p>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Represented by <span className="text-amber-500 font-bold italic">Amber/Faded Gauges</span>. This represents AI-synthesized biological drift. Where physical samples are missing, the Gemini model uses molecular clock simulation and adaptive radiation logic to project the most likely genomic outcomes.
                  </p>
                </div>
              </div>
              <div className="mt-10 p-6 bg-white/5 rounded-2xl border border-white/10 text-[10px] text-slate-300 italic">
                Trust Balance: We report these ratios to ensure researchers can distinguish between physical evidence and high-reasoning bioinformatic projections.
              </div>
            </section>

            {/* Model Intelligence Section */}
            <section className="p-10 bg-indigo-50 rounded-[3.5rem] border border-indigo-100">
              <h3 className="text-sm font-black text-indigo-600 uppercase tracking-[0.4em] mb-8 flex items-center gap-3">
                <Zap size={20} aria-hidden="true" /> V. Model Intelligence & Processing
              </h3>
              <div className="grid md:grid-cols-3 gap-8">
                <div className="space-y-4 p-6 bg-white rounded-3xl border border-indigo-100 shadow-sm">
                  <div className="flex items-center gap-3 text-indigo-600">
                    <BrainCircuit size={20} aria-hidden="true" />
                    <p className="font-black text-sm uppercase tracking-wider">Gemini 3.1 Pro</p>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    The primary engine for <span className="font-bold">Complex Genomic Reasoning</span>. It handles phylogenetic synthesis, mutational network clustering, and high-fidelity interpretation of evolutionary divergence.
                  </p>
                </div>
                <div className="space-y-4 p-6 bg-white rounded-3xl border border-indigo-100 shadow-sm">
                  <div className="flex items-center gap-3 text-emerald-600">
                    <Zap size={20} aria-hidden="true" />
                    <p className="font-black text-sm uppercase tracking-wider">Gemini 3 Flash</p>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Optimized for <span className="font-bold">Rapid Data Processing</span> and real-time search grounding. It powers the application logic, search indexing, and immediate researcher feedback loops.
                  </p>
                </div>
                <div className="space-y-4 p-6 bg-white rounded-3xl border border-indigo-100 shadow-sm">
                  <div className="flex items-center gap-3 text-amber-600">
                    <Globe size={20} aria-hidden="true" />
                    <p className="font-black text-sm uppercase tracking-wider">Gemini 2.5 Flash</p>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Specialized for <span className="font-bold">Geographic Grounding</span>. This model integrates with Google Maps to synthesize location-based data and predict regional distribution patterns.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <div className="flex items-center gap-3 mb-10">
                <div className="h-px flex-1 bg-slate-100" aria-hidden="true"></div>
                <h3 className="text-[12px] font-black text-indigo-500 uppercase tracking-[0.4em] flex items-center gap-3 shrink-0">
                  <Activity size={18} aria-hidden="true" /> I. Workflow Execution
                </h3>
                <div className="h-px flex-1 bg-slate-100" aria-hidden="true"></div>
              </div>
              <div className="grid md:grid-cols-2 gap-8">
                {workflowSteps.map((step) => (
                  <div key={step.id} className="p-8 bg-slate-50 hover:bg-white rounded-[2.5rem] border border-slate-100 transition-all duration-300">
                    <div className="flex items-start gap-6">
                      <span className="font-black text-indigo-200 text-3xl tracking-tighter" aria-hidden="true">{step.id}</span>
                      <div>
                        <p className="font-black text-slate-900 text-lg mb-3 tracking-tight">{step.title}</p>
                        <p className="text-sm text-slate-600 leading-relaxed font-medium mb-3">{step.desc}</p>
                        <p className="text-xs text-slate-800 font-bold leading-relaxed">{step.op}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};
