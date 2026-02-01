
import React from 'react';
import { 
  X, Info, BookOpen, Target, Dna, Share2, History, Shield, Zap, 
  ChevronRight, Microscope, Globe, Activity, FileDown
} from 'lucide-react';

interface UserGuideProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UserGuide: React.FC<UserGuideProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const exportToRTF = () => {
    const rtfContent = `{\\rtf1\\ansi\\ansicpg1252\\deff0\\deflang1033{\\fonttbl{\\f0\\fnil\\fcharset0 Arial;}{\\f1\\fnil\\fcharset0 Courier New;}}
{\\colortbl ;\\red0\\green75\\blue150;\\red100\\blue100\\green100;}
\\viewkind4\\uc1\\pard\\f0\\fs32\\b MYCOSTRAIN EXPLORER: RESEARCHER PROTOCOL v4.2.0\\b0\\fs20\\par
\\cf2 \\fs16 ORIGINS & ONTOLOGIES BIOINFORMATICS STANDARD\\cf0\\fs20\\par
\\par
\\b 1. WORKFLOW EXECUTION\\b0\\par
\\bullet  \\b 01. Species Input:\\b0  Enter full Latin binomial name (e.g., Cordyceps militaris) to initiate phylogenetic fetch.\\par
\\bullet  \\b 02. Regional Focus:\\b0  Select geographic biome to constrain Deep Thinking simulation to regional datasets.\\par
\\bullet  \\b 03. Origin Trace:\\b0  Trigger 32k-token synthesis and Google Search grounding.\\par
\\par
\\b 2. DEEP THINKING MODE\\b0\\par
This application utilizes Gemini 3 Pro with a 32,768-token thinking budget. It simulates biological drift patterns internally before output. Expect 10-15 seconds for phylogenetic logic consideration.\\par
\\par
\\b 3. DATA INTERPRETATION: ONTOLOGIES & HAPLOTYPES\\b0\\par
\\par
\\b Haplotype (Variant):\\b0\\par
A unique genetic signature belonging to a specific regional population. Represents a cluster of shared Single Nucleotide Polymorphisms (SNPs).\\par
\\par
\\b Ontological Trait (Functional Impact):\\b0\\par
The biological meaning of the mutation. Translates raw genetic code into functional shifts (e.g., adaptive resistance, host-jumping, or thermotolerance).\\par
\\par
\\b Divergence (Mya):\\b0\\par
Estimated millions of years since the branch point from the most recent common ancestor.\\par
\\par
\\b 4. AUTHENTICITY NOTICE\\b0\\par
Results are synthesized via real-time search grounding and advanced reasoning. Cross-reference markers with NCBI GenBank or MycoBank for peer-reviewed publication.\\par
\\par
\\i Generated via MycoStrain Explorer v4.2 Protocol Engine.\\i0\\par
}`;

    const blob = new Blob([rtfContent], { type: 'application/rtf' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'MycoStrain_Researcher_Protocol_v4.2.rtf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 md:p-10">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-white w-full max-w-5xl max-h-[90vh] rounded-[3rem] shadow-2xl border border-slate-200 overflow-hidden flex flex-col animate-in fade-in zoom-in duration-300">
        {/* Header */}
        <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-4">
            <div className="bg-indigo-600 p-3 rounded-2xl text-white">
              <BookOpen size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Researcher Protocol</h2>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Operation Guide v4.2.0</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={exportToRTF}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 hover:border-indigo-300 hover:text-indigo-600 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all shadow-sm"
              title="Download as RTF"
            >
              <FileDown size={16} /> Export RTF
            </button>
            <button onClick={onClose} className="p-3 hover:bg-slate-200 rounded-2xl transition-colors">
              <X size={24} className="text-slate-500" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-8 md:p-12 custom-scrollbar">
          <div className="grid md:grid-cols-2 gap-12">
            
            {/* Column 1: Workflow */}
            <div className="space-y-10">
              <section>
                <h3 className="text-sm font-black text-indigo-600 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                  <Activity size={16} /> Workflow Execution
                </h3>
                <div className="space-y-4">
                  {[
                    { step: "01", title: "Species Input", desc: "Enter the full Latin binomial name (e.g., Cordyceps militaris) to initiate the phylogenetic fetch." },
                    { step: "02", title: "Regional Focus", desc: "Select a geographic biome. This constrains the 'Deep Thinking' simulation to specific regional datasets." },
                    { step: "03", title: "Origin Trace", desc: "Click 'Trace Origins' to trigger the 32k-token synthesis and Google Search grounding." }
                  ].map((item) => (
                    <div key={item.step} className="flex gap-4 p-5 bg-slate-50 rounded-2xl border border-slate-100">
                      <span className="font-black text-indigo-300 text-lg">{item.step}</span>
                      <div>
                        <p className="font-black text-slate-800 text-sm">{item.title}</p>
                        <p className="text-xs text-slate-500 mt-1 leading-relaxed">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section className="bg-indigo-50 p-8 rounded-[2rem] border border-indigo-100">
                <h3 className="text-sm font-black text-indigo-700 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Zap size={16} /> Deep Thinking Mode
                </h3>
                <p className="text-xs text-indigo-900/70 leading-relaxed font-medium">
                  This webapp uses <strong>Gemini 3 Pro</strong> with a high-token "Thinking" budget. Unlike standard models, it simulates biological drift patterns internally before presenting data. This may result in a 10-15 second wait as it "considers" the phylogenetic logic.
                </p>
              </section>
            </div>

            {/* Column 2: Data Interpretation */}
            <div className="space-y-10">
              <section>
                <h3 className="text-sm font-black text-emerald-600 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                  <Microscope size={16} /> Interpreting Ontologies
                </h3>
                
                <div className="space-y-6">
                  <div className="p-6 border border-slate-100 rounded-3xl">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                        <Dna size={16} />
                      </div>
                      <p className="font-black text-slate-800 text-sm">Haplotype (Variant)</p>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      A unique genetic "signature" belonging to a specific regional population. Each haplotype represents a cluster of shared Single Nucleotide Polymorphisms (SNPs).
                    </p>
                  </div>

                  <div className="p-6 border-2 border-emerald-500 bg-emerald-50/30 rounded-3xl">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white">
                        <Target size={16} />
                      </div>
                      <p className="font-black text-slate-900 text-sm">Ontological Trait</p>
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed font-medium">
                      The "Meaning" of the mutation. The webapp translates raw genetic code into biological function—telling you <em>why</em> a specific strain has drifted (e.g., adaptive resistance to higher altitudes or host-jumping to a new insect order).
                    </p>
                  </div>

                  <div className="p-6 border border-slate-100 rounded-3xl">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
                        <History size={16} />
                      </div>
                      <p className="font-black text-slate-800 text-sm">Divergence (Mya)</p>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Millions of years ago since the branch point. Lower numbers indicate recent regional drift; higher numbers indicate deep ancestral divergence.
                    </p>
                  </div>
                </div>
              </section>
            </div>
          </div>

          {/* Footer Callout */}
          <div className="mt-12 p-8 bg-slate-900 rounded-[2.5rem] flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <Shield className="text-indigo-400 shrink-0" size={32} />
              <div>
                <p className="text-white font-black text-lg">Bioinformatics Authenticity</p>
                <p className="text-slate-400 text-[11px] font-medium leading-relaxed max-w-lg">
                  Results are synthesized using real-time search grounding and advanced language reasoning. For peer-reviewed publication, always cross-reference haplotype markers with NCBI GenBank or MycoBank.
                </p>
              </div>
            </div>
            <button onClick={onClose} className="px-8 py-4 bg-white text-slate-900 rounded-2xl font-black text-sm hover:bg-indigo-50 transition-colors">
              I UNDERSTAND
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
