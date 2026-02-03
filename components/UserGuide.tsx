import React from 'react';
import { trackProtocolExport } from '../services/analytics';
import { 
  X, Info, BookOpen, Target, Dna, Share2, History, Shield, Zap, 
  ChevronRight, Microscope, Globe, Activity, FileDown, Binoculars, Camera,
  Map as MapIcon, ListFilter, FileText
} from 'lucide-react';

interface UserGuideProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UserGuide: React.FC<UserGuideProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const workflowSteps = [
    {
      id: "01",
      title: "Geographic Distribution (Map)",
      icon: MapIcon,
      desc: "Analyze the Mercator projection to identify 'Steel Silhouette' clusters. The color intensity (Similarity Index) indicates genetic proximity to the type specimen. Higher percentages suggest recent migration or stable ancestral populations.",
      op: "Operational Procedure: Zoom into specific geographic quadrants to analyze 'Genetic Outliers'—nodes that exhibit low similarity but are located near core populations. These often indicate recent human-mediated transport or rapid adaptation to urban micro-climates.",
      detail: "Novice Tip: Use the zoom controls to isolate specific state boundaries for localized ecological niche identification."
    },
    {
      id: "02",
      title: "Mutational Network Structure",
      icon: Share2,
      desc: "Navigate the force-directed graph to see how haplotypes cluster by genomic similarity. Nodes (Haplotypes) are connected by minimum spanning trees representing the most likely evolutionary path between variants.",
      op: "Operational Procedure: Identify 'Bottleneck Nodes'—single nodes that connect two large clusters. These represent pivotal mutational events where a new lineage gained the ability to colonize a drastically different ecological niche.",
      detail: "Novice Tip: Hover over nodes to reveal Metamorphotic Chemistry markers—these are specific chemical signatures unique to that regional drift."
    },
    {
      id: "03",
      title: "Phylogenetic Timeline",
      icon: History,
      desc: "Read the temporal sequence from left (ancestral) to right (recent). The divergence time (measured in Mya) estimates when a specific lineage branched off from the main ancestral center.",
      op: "Operational Procedure: Compare the divergence times of regional haplotypes. If two geographically distant regions show identical divergence times, investigate historical land-bridge or oceanic current migration vectors.",
      detail: "Novice Tip: A 'High Mya' branch point suggests a very ancient, stable lineage that may harbor unique functional traits."
    },
    {
      id: "04",
      title: "Genomic Drift Ontologies (Table)",
      icon: ListFilter,
      desc: "Cross-reference specific SNP (Single Nucleotide Polymorphism) markers across all 12 haplotypes. This grid allows you to visualize the exact mutational load and functional trait emergence per region.",
      op: "Operational Procedure: Look for 'Conserved Columns'—SNPs that are identical across all haplotypes. These are the core genomic markers of the species. Focus field research on 'Variable Columns' to identify regional sub-species.",
      detail: "Novice Tip: Look for columns with sparse markers; these represent rare mutations that might indicate a rapid adaptive radiation event."
    },
    {
      id: "05",
      title: "Executive Origin Dossier",
      icon: FileText,
      desc: "Synthesize the AI-generated research summary. This section uses 'Deep Thinking' to hypothesize on ancestral centers and migration vectors based on the visualized data blocks above.",
      op: "Operational Procedure: Read the dossier to identify hypothesized 'Ancestral Refugia'—geographic locations where the species survived glacial events. These are high-priority targets for citizen science missions.",
      detail: "Novice Tip: This text provides the 'narrative' of the species' journey across millions of years."
    },
    {
      id: "06",
      title: "Field Mission Engagement",
      icon: Binoculars,
      desc: "Transition from digital analysis to physical validation. The Hub provides actionable 'Missions' to locate and document rare haplotypes in their predicted ecological contexts.",
      op: "Operational Procedure: Select missions based on your proximity to predicted coordinates. Ensure you follow the specific macro-photography angles requested to allow our AI to verify the physical ontology of the specimen.",
      detail: "Novice Tip: Use the 'Download Dossier' button to take these protocols into the field offline."
    }
  ];

  const exportToRTF = () => {
    const rtfContent = `{\\rtf1\\ansi\\ansicpg1252\\deff0\\deflang1033
{\\fonttbl{\\f0\\fnil\\fcharset0 Arial;}{\\f1\\fnil\\fcharset0 Courier New;}}
{\\colortbl ;\\red79\\green70\\blue229;\\red30\\green41\\blue59;\\red100\\green116\\blue139;\\red16\\green185\\blue129;\\red5\\green150\\blue105;}
\\viewkind4\\uc1\\pard\\cf1\\f0\\fs36\\b MYCOSTRAIN EXPLORER: FULL RESEARCHER PROTOCOL v4.2.0\\b0\\par
\\cf2\\fs20\\b Origins & Ontologies Bioinformatics Standard\\b0\\par
\\cf3\\fs16 Generated: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}\\cf0\\par
\\par
\\cf1\\fs24\\b I. COMPREHENSIVE WORKFLOW EXECUTION & OPERATIONAL PROCEDURES\\b0\\par
\\cf2\\fs20
\\b STEP 01: GEOGRAPHIC DISTRIBUTION (MAP ANALYSIS)\\b0\\par
Analyze the Mercator projection. Color intensity (Similarity Index) indicates genetic proximity to type specimen. \\par
\\b Procedure:\\b0 Zoom into specific geographic quadrants to analyze 'Genetic Outliers'. Target boundaries between high and low similarity zones for potential hybridization evidence.\\par
\\par
\\b STEP 02: MUTATIONAL NETWORK NAVIGATION\\b0\\par
Navigate force-directed graph. Nodes are connected by minimum spanning trees representing evolutionary paths. \\par
\\b Procedure:\\b0 Identify 'Bottleneck Nodes'—single nodes connecting two clusters. These represent pivotal mutational events. Hovering reveals Metamorphotic Chemistry signatures.\\par
\\par
\\b STEP 03: PHYLOGENETIC SEQUENCING (TIMELINE)\\b0\\par
Temporal sequence from left (ancestral) to right (recent). Divergence time (Mya) estimates branch points. \\par
\\b Procedure:\\b0 Compare divergence times of distant haplotypes to hypothesize land-bridge or oceanic migration vectors. High Mya suggests ancient, stable lineages.\\par
\\par
\\b STEP 04: GENOMIC DRIFT ONTOLOGIES (DATA GRID)\\b0\\par
Cross-reference SNP markers across 12 haplotypes. Visualize mutational load. \\par
\\b Procedure:\\b0 Look for 'Conserved Columns' to find core genomic markers. Variable columns indicate regional sub-species and adaptive radiation.\\par
\\par
\\b STEP 05: EXECUTIVE ORIGIN DOSSIER SYNTHESIS\\b0\\par
AI-synthesized narrative of ancestral centers and migration vectors. \\par
\\b Procedure:\\b0 Identify hypothesized 'Ancestral Refugia' locations. These are high-priority targets for citizen science field validation missions.\\par
\\par
\\b STEP 06: FIELD RESEARCH & CITIZEN SCIENCE VALIDATION\\b0\\par
Transition to physical biology. Missions find evidence of predicted genomic drift. \\par
\\b Procedure:\\b0 Select missions based on proximity. Adhere to macro-photography angles requested to allow AI-verification of specimen ontology.\\par
\\par
\\cf5\\fs24\\b II. FIELD DOCUMENTATION & VERIFICATION STANDARDS\\b0\\par
\\cf2\\fs20
The MycoStrain engine requires high-fidelity metadata for model refinement:\\par
\\bullet  \\b Macro-Photography:\\b0  Focus on the attachment point (stipe/substrate interface). Color accuracy is critical; use neutral light.\\par
\\bullet  \\b Host/Substrate Analysis:\\b0  Document the tree species (bark texture, leaf shape) or insect host (instar, species).\\par
\\bullet  \\b GPS Precision:\\b0  Enable high-accuracy GPS on mobile devices. Coordinates must match digital model predictions within 500m for validation credit.\\par
\\par
\\cf1\\fs24\\b III. DATA INTEGRITY & GROUNDING PROTOCOLS\\b0\\par
\\cf2\\fs20
This protocol utilizes Google Search Grounding to verify recent phylogenetic literature. The AI Thinking budget (32k tokens) ensures high-reasoning accuracy. \\par
\\b Verification:\\b0 All haplotypes are cross-referenced with regional soil/climate databases to ensure the "functional trait" (ontology) is ecologically plausible for the specified region.\\par
\\par
\\cf3\\i --- End of Research Protocol --- \\par
Generated via MycoStrain Explorer v4.2 Engine\\i0\\cf0
}`;

    const blob = new Blob([rtfContent], { type: 'application/rtf' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'MycoStrain_v4.2_Full_Researcher_Protocol.rtf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    trackProtocolExport('RTF');
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 md:p-10">
      <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-md" onClick={onClose} />
      
      <div className="relative bg-white w-full max-w-6xl max-h-[90vh] rounded-[3.5rem] shadow-2xl border border-slate-200 overflow-hidden flex flex-col animate-in fade-in zoom-in duration-300">
        {/* Header */}
        <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-6">
            <div className="bg-indigo-600 p-4 rounded-3xl text-white shadow-xl shadow-indigo-100">
              <BookOpen size={28} />
            </div>
            <div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tighter">Researcher Protocol Operation Guide</h2>
              <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] mt-1">Full Synthesis Manual v4.2.0</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={exportToRTF}
              className="group flex items-center gap-3 px-6 py-3 bg-white border border-slate-200 hover:border-indigo-400 hover:text-indigo-600 rounded-2xl font-black text-[12px] uppercase tracking-widest transition-all shadow-sm active:scale-95"
            >
              <FileDown size={18} className="group-hover:scale-110 transition-transform" /> Export Detailed Protocol
            </button>
            <button onClick={onClose} className="p-4 hover:bg-slate-200 rounded-2xl transition-colors">
              <X size={24} className="text-slate-500" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-10 md:p-14 custom-scrollbar bg-white">
          <div className="max-w-5xl mx-auto space-y-20">
            
            {/* Expanded Workflow Section */}
            <section>
              <div className="flex items-center gap-3 mb-10">
                <div className="h-px flex-1 bg-slate-100"></div>
                <h3 className="text-[12px] font-black text-indigo-500 uppercase tracking-[0.4em] flex items-center gap-3 shrink-0">
                  <Activity size={18} /> I. Comprehensive Workflow Execution
                </h3>
                <div className="h-px flex-1 bg-slate-100"></div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-8">
                {workflowSteps.map((step) => (
                  <div key={step.id} className="group p-8 bg-slate-50 hover:bg-white rounded-[2.5rem] border border-slate-100 hover:border-indigo-200 transition-all duration-300 hover:shadow-xl hover:shadow-indigo-50/50">
                    <div className="flex items-start gap-6">
                      <div className="flex flex-col items-center">
                        <span className="font-black text-indigo-200 text-3xl tracking-tighter mb-2 group-hover:text-indigo-500 transition-colors">{step.id}</span>
                        <div className="p-3 bg-white rounded-xl shadow-sm text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                          <step.icon size={20} />
                        </div>
                      </div>
                      <div>
                        <p className="font-black text-slate-900 text-lg mb-3 tracking-tight">{step.title}</p>
                        <p className="text-sm text-slate-500 leading-relaxed font-medium mb-3">{step.desc}</p>
                        <p className="text-xs text-slate-700 font-bold leading-relaxed mb-4 border-l-2 border-indigo-200 pl-4">{step.op}</p>
                        <div className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100/50">
                          <p className="text-[11px] text-indigo-700 leading-relaxed font-bold italic flex items-start gap-2">
                             <Zap size={14} className="shrink-0 mt-0.5" />
                             {step.detail}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <div className="grid md:grid-cols-2 gap-16">
              {/* Field Documentation Section */}
              <section>
                <h3 className="text-sm font-black text-emerald-600 uppercase tracking-[0.2em] mb-8 flex items-center gap-3">
                  <Camera size={20} /> II. Field Documentation Standards
                </h3>
                
                <div className="space-y-6">
                  <div className="p-8 bg-white border border-slate-100 rounded-[2.5rem] shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
                        <Microscope size={20} />
                      </div>
                      <p className="font-black text-slate-800 text-base">Anatomy & Photography</p>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed font-medium">
                      Novice researchers often miss the <span className="text-emerald-600 font-bold">attachment point</span>. Ensure high-resolution shots capture how the mycelium interacts with the substrate. Focus on the interface between stipe and soil/wood.
                    </p>
                  </div>

                  <div className="p-8 border-2 border-emerald-500 bg-emerald-50/30 rounded-[2.5rem] shadow-inner">
                    <div className="flex items-center gap-3 mb-4">
                       <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-white">
                        <Target size={20} />
                      </div>
                      <p className="font-black text-slate-900 text-base">Host-Specific Metadata</p>
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed font-bold">
                      Identifying the host tree or insect species is critical for validating the "Functional Ontology" (Metabolic Drift) proposed by our model. Record bark texture and leaf genus.
                    </p>
                  </div>
                </div>
              </section>

              {/* Data Integrity Section */}
              <section>
                <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] mb-8 flex items-center gap-3">
                  <Shield size={20} /> III. Data Integrity Protocols
                </h3>
                
                <div className="bg-slate-50 p-10 rounded-[2.5rem] border border-slate-100 space-y-6">
                  <div className="flex gap-4">
                    <Globe className="text-indigo-400 shrink-0" size={24} />
                    <div>
                      <p className="font-black text-slate-800 text-sm mb-1">Grounding Mechanism</p>
                      <p className="text-[11px] text-slate-500 leading-relaxed font-medium italic">Our v4.2 engine utilizes real-time Google Search grounding to ensure that generated haplotypes are consistent with recent scientific literature. Check the 'Grounding Evidence' side panel for links.</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <Zap className="text-amber-500 shrink-0" size={24} />
                    <div>
                      <p className="font-black text-slate-800 text-sm mb-1">Deep Thinking Synthesis</p>
                      <p className="text-[11px] text-slate-500 leading-relaxed font-medium italic">The 32,768-token thinking budget allows for complex simulation of phylogenetic drift that standard AI models cannot achieve. This results in high-reasoning accuracy for ancestral root mapping.</p>
                    </div>
                  </div>
                </div>
              </section>
            </div>

            {/* Bottom Call to Action */}
            <div className="p-10 bg-slate-950 rounded-[3.5rem] flex flex-col md:flex-row items-center justify-between gap-10 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-10 opacity-10 pointer-events-none rotate-12">
                <Dna size={120} className="text-indigo-400" />
              </div>
              <div className="flex items-center gap-8 relative z-10">
                <div className="w-20 h-20 bg-indigo-600 rounded-3xl flex items-center justify-center text-white shadow-2xl shadow-indigo-500/50">
                  <Shield size={36} />
                </div>
                <div>
                  <p className="text-white font-black text-2xl tracking-tight">Bioinformatics Standard v4.2</p>
                  <p className="text-slate-400 text-xs font-medium leading-relaxed max-w-xl mt-2">
                    Citizen science validation bridges the gap between digital AI synthesis and physical biology. Your observations help refine our regional prevalence indices and mutational drift models.
                  </p>
                </div>
              </div>
              <button onClick={onClose} className="px-12 py-5 bg-white hover:bg-indigo-50 text-slate-900 rounded-2xl font-black text-sm transition-all shadow-xl active:scale-95 shrink-0 relative z-10">
                ACKNOWLEDGE PROTOCOL
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
