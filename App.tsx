import React, { useState, useMemo } from 'react';
import { performMycoAnalysis } from './services/geminiService';
import { trackSearch, trackProtocolView } from './services/analytics';
import { AnalysisResult, Haplotype } from './types';
import { StrainMap } from './components/StrainMap';
import { NetworkGraph } from './components/NetworkGraph';
import { EvolutionaryTimeline } from './components/Timeline';
import { UserGuide } from './components/UserGuide';
import { CitizenScienceHub } from './components/CitizenScienceHub';
import { 
  Dna, Search, Loader2, AlertCircle, Download, Target, Globe, 
  FileText, Link, Scale, Activity, Sparkles, Shield, ListFilter, 
  History, Zap, BookOpen, Users
} from 'lucide-react';

const FOCUS_OPTIONS = ["National Survey", "Pacific Northwest (PNW)", "Appalachian Mountains", "Northeast Deciduous", "Southeast Coastal Plain", "Rocky Mountains / Alpine", "California Floristic", "Boreal Forest / Taiga"];
const APP_VERSION = "v4.2-CS";

export default function App() {
  const [species, setSpecies] = useState('');
  const [focusArea, setFocusArea] = useState(FOCUS_OPTIONS[0]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showGuide, setShowGuide] = useState(false);

  const uniqueSnps = useMemo(() => {
    if (!result) return [];
    const snpSet = new Set<string>();
    result.haplotypes.forEach(h => h.snps.forEach(s => snpSet.add(s)));
    return Array.from(snpSet).sort();
  }, [result]);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!species.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const data = await performMycoAnalysis(species, focusArea);
      setResult(data);
      trackSearch(species, focusArea);
    } catch (err: any) {
      setError(err.message || "Genomic Protocol Interrupted.");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenGuide = () => {
    setShowGuide(true);
    trackProtocolView();
  };

  const handleExportDossier = () => {
    if (!result) return;
    
    const groundingRefs = result.sources.length > 0 
      ? result.sources.map(s => `- ${s.title}\n  URL: ${s.uri}`).join('\n\n')
      : "No external grounding references retrieved for this specific query. Please consult primary mycological databases like Index Fungorum or MycoBank.";

    const fullContent = `
MYCOSTRAIN EXPLORER: v4.2 GENOMIC ORIGINS & FIELD RESEARCH DOSSIER
==================================================================
Species: ${result.speciesName}
Ancestral Origin: ${result.ancestralOrigin}
Focus Area: ${result.focusArea}
Generation Date: ${new Date().toLocaleString()}
Protocol Version: ${APP_VERSION}

I. EXECUTIVE RESEARCH SUMMARY
-----------------------------
${result.dossier}

II. COMPREHENSIVE WORKFLOW EXECUTION GUIDE
------------------------------------------
Follow these steps to interpret the synthesized digital model and transition to field research.

STEP 01: GEOGRAPHIC DISTRIBUTION (MAP ANALYSIS)
- Objective: Locate "Steel Silhouette" clusters within the focus area.
- Procedure: Analyze the Similarity Index (95-100%). High-similarity nodes represent the core populations, while distal nodes represent recent adaptive drift.
- Research Tip: Target boundaries between high and low similarity zones for potential hybridization evidence.

STEP 02: MUTATIONAL NETWORK NAVIGATION
- Objective: Visualize evolutionary pathways and genomic connectivity.
- Procedure: Inspect the force-directed graph. Clusters indicate shared lineage, while isolated nodes suggest long-term geographic isolation (e.g., Alpine island populations).
- Research Tip: Hover over nodes to identify "Metamorphotic Chemistry"—the specific metabolic shifts associated with that haplotype.

STEP 03: PHYLOGENETIC SEQUENCING (TIMELINE)
- Objective: Sequence the temporal emergence of the species.
- Procedure: Read from left (Deep Ancestral) to right (Recent Adaptive). The Mya (Millions of years ago) index provides a scale for the divergence.
- Research Tip: Branches older than 2.0 Mya often harbor cryptic species traits.

STEP 04: GENOMIC DRIFT ONTOLOGIES (DATA GRID)
- Objective: Precise SNP identification and functional mapping.
- Procedure: Use the ontology table to cross-reference specific mutations (SNPs) across all 12 haplotypes.
- Research Tip: Identify "Signature SNPs"—mutations present in only one regional cluster.

STEP 05: EXECUTIVE ORIGIN DOSSIER SYNTHESIS
- Objective: Deep-thinking narrative synthesis.
- Procedure: Review the AI-generated origin dossier to understand the migration vectors (e.g., "Pleistocene Refugia Hypothesis").

STEP 06: FIELD RESEARCH & CITIZEN SCIENCE HUB
- Objective: Physical validation of the digital model.
- Procedure: Activate one of the synthesized field missions below. Document all findings using the provided macro-photography protocols.

III. EXPANDED CITIZEN SCIENCE MISSIONS & FIELD PROTOCOLS
-------------------------------------------------------
The following protocols have been generated to bridge the gap between AI-driven genomic modeling 
and in-situ field validation. Researchers are encouraged to document findings according to 
the specific validation strategies outlined below.

${result.citizenScienceMissions.map((m, i) => `
MISSION #${i + 1}: ${m.title}
PRIORITY: ${m.priority}
CONTEXT: ${m.description}
ACTIONABLE PROTOCOL: 
${m.action}
`).join('\n')}

IV. ONTOLOGICAL TRAITS & REGIONAL DRIFT (HAPLOTYPES)
-----------------------------------------------------
${result.haplotypes.map(h => `
[${h.id}] ${h.region}
- Divergence: ${h.divergenceTime} Mya Branch
- Trait: ${h.functionalTrait}
- Substrate: ${h.substrate}
- Insect Associations: ${h.insectAssociations}
- Chemistry: ${h.chemistry}
- SNPs Identified: ${h.snps.join(', ')}
`).join('\n')}

V. GROUNDING REFERENCES & LITERATURE EVIDENCE
---------------------------------------------
The following sources were utilized to ground the genomic synthesis in existing research.

${groundingRefs}

------------------------------------------------------------------
END OF PROTOCOL - MYCOSTRAIN EXPLORER ENGINE
    `.trim();

    const blob = new Blob([fullContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `MycoStrain_${result.speciesName.replace(/\s/g, '_')}_Research_Dossier.txt`;
    a.click();
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-indigo-600 p-2.5 rounded-xl text-white shadow-lg"><Dna size={24} /></div>
            <div className="flex flex-col">
              <h1 className="text-xl font-black text-slate-900 tracking-tight leading-none">MycoStrain <span className="text-indigo-600">Explorer</span></h1>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">Origins & Ontologies v4.2</p>
            </div>
          </div>
          
          <button 
            onClick={handleOpenGuide}
            className="flex items-center gap-2 px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all"
          >
            <BookOpen size={16} /> Protocol Guide
          </button>
        </div>
      </nav>

      <UserGuide isOpen={showGuide} onClose={() => setShowGuide(false)} />

      <main className="max-w-7xl mx-auto px-6 py-10 flex-grow w-full">
        <section className="mb-12 text-center max-w-4xl mx-auto">
          <h2 className="text-5xl font-black text-slate-900 mb-4 tracking-tighter">Phylogenetic Origin Tracking</h2>
          <p className="text-slate-500 text-lg font-medium mb-10">Deep-thinking genomic synthesis for elucidating ancestral centers and regional drift ontologies.</p>
          <div className="bg-white p-4 rounded-[2.5rem] shadow-2xl border border-slate-200/60 ring-8 ring-slate-100/50">
            <form onSubmit={handleSearch} className="flex flex-col lg:flex-row gap-4">
              <input type="text" value={species} onChange={(e) => setSpecies(e.target.value)} placeholder="Scientific Name (e.g. Ophiocordyceps sinensis)" className="flex-[1.5] px-10 py-6 rounded-3xl bg-slate-50 border-none focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-slate-800 shadow-inner" />
              <select value={focusArea} onChange={(e) => setFocusArea(e.target.value)} className="flex-1 px-10 py-6 rounded-3xl bg-slate-50 border-none focus:ring-2 focus:ring-indigo-500 outline-none font-black text-slate-600 shadow-inner">
                {FOCUS_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
              <button disabled={loading} className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 text-white px-10 py-6 rounded-3xl font-black shadow-lg flex items-center justify-center gap-3 transition-all">
                {loading ? <Loader2 className="animate-spin" size={24} /> : 'TRACE ORIGINS'}
              </button>
            </form>
          </div>
        </section>

        {error && <div className="max-w-2xl mx-auto mb-10 bg-red-50 border border-red-200 p-8 rounded-[2rem] text-red-700 flex items-start gap-4 animate-in slide-in-from-top-4"><AlertCircle /> <p className="text-sm font-bold">{error}</p></div>}

        {loading && <div className="py-32 text-center"><div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div><h3 className="text-xl font-black text-slate-800">Synthesizing Phylogenetic Divergence...</h3></div>}

        {result && !loading && (
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8">
            {/* Executive Stats Summary - Retained at top for immediate context */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { label: "Ancestral Root", val: result.ancestralOrigin, icon: History },
                { label: "Field Status", val: "Missions Ready", icon: Users },
                { label: "Drift Index", val: result.nucleotideDiversity.toFixed(4), icon: Scale },
                { label: "AI Protocol", val: "Thinking-32k", icon: Zap }
              ].map((stat, i) => (
                <div key={i} className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm">
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest flex items-center gap-2 mb-3"><stat.icon size={12} /> {stat.label}</p>
                  <p className="text-2xl font-black tracking-tight text-slate-900 truncate">{stat.val}</p>
                </div>
              ))}
            </div>

            {/* 1. Genomic Distribution & Ecological Map */}
            <StrainMap data={result.haplotypes} />
            
            {/* 2. Niche-Driven Mutational Network */}
            <NetworkGraph data={result.haplotypes} />

            {/* 3. Phylogenetic Divergence Timeline */}
            <EvolutionaryTimeline data={result.haplotypes} focusArea={result.focusArea} />

            {/* 4. Genomic Drift Ontologies Table (Logical extension of the Timeline) */}
            <div className="bg-slate-900 p-10 rounded-[3rem] shadow-2xl border border-slate-800 overflow-hidden">
              <h3 className="text-2xl font-black text-white flex items-center gap-3 mb-8"><ListFilter className="text-indigo-400" /> Genomic Drift Ontologies</h3>
              <div className="overflow-x-auto custom-scrollbar pb-4">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr>
                      <th className="p-4 bg-slate-800 text-[10px] font-black text-slate-400 uppercase border border-slate-700">Haplotype</th>
                      <th className="p-4 bg-slate-800 text-[10px] font-black text-slate-400 uppercase border border-slate-700">Divergence</th>
                      <th className="p-4 bg-slate-800 text-[10px] font-black text-slate-400 uppercase border border-slate-700">Functional Ontology</th>
                      {uniqueSnps.slice(0, 8).map(snp => <th key={snp} className="p-4 bg-slate-800 text-[10px] font-mono font-black text-indigo-300 border border-slate-700">{snp}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {result.haplotypes.map((h) => (
                      <tr key={h.id} className="hover:bg-slate-800/50">
                        <td className="p-4 text-xs font-black text-white border border-slate-800">{h.id}</td>
                        <td className="p-4 text-xs font-mono text-indigo-400 border border-slate-800">{h.divergenceTime} Mya</td>
                        <td className="p-4 text-[11px] text-slate-400 font-medium italic border border-slate-800">{h.functionalTrait}</td>
                        {uniqueSnps.slice(0, 8).map(snp => (
                          <td key={snp} className="p-4 border border-slate-800 text-center">
                            {h.snps.includes(snp) ? <div className="w-2 h-2 rounded-full bg-indigo-500 mx-auto"></div> : <div className="w-1 h-1 rounded-full bg-slate-700 mx-auto opacity-30"></div>}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 5. Executive Origin Dossier */}
            <div className="grid lg:grid-cols-3 gap-10">
              <div className="lg:col-span-2">
                <div className="bg-white p-12 rounded-[3rem] border border-slate-200 shadow-sm h-full">
                  <div className="flex items-center gap-4 mb-8 pb-6 border-b border-slate-100">
                    <FileText className="text-indigo-600" />
                    <h3 className="text-2xl font-black uppercase text-slate-900 tracking-tight">Executive Origin Dossier</h3>
                  </div>
                  <p className="text-lg text-slate-800 border-l-4 border-indigo-200 pl-6 py-2 bg-indigo-50/20 mb-10">{result.dossier}</p>
                  <div className="space-y-6">
                    {result.haplotypes.slice(0, 5).map(h => (
                      <div key={h.id} className="bg-slate-50 p-8 rounded-3xl border border-slate-100">
                        <div className="flex justify-between items-start mb-4">
                          <h4 className="font-black text-slate-900">{h.id} - {h.region}</h4>
                          <span className="text-[10px] font-mono text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">{h.divergenceTime} Mya Branch</span>
                        </div>
                        <p className="text-xs text-slate-500 leading-relaxed"><span className="font-black text-slate-700 uppercase">Trait:</span> {h.functionalTrait}</p>
                      </div>
                    ))}
                    <p className="text-center text-[10px] font-black text-slate-300 uppercase tracking-widest pt-4">Additional lineages detailed in full research export</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-8">
                <button onClick={handleExportDossier} className="w-full bg-slate-900 hover:bg-slate-800 text-white p-10 rounded-[2.5rem] font-black flex flex-col items-center gap-4 shadow-2xl transition-all active:scale-95">
                  <Download size={32} />
                  <div className="text-center">
                    <p className="text-xl">Download Data v4.2</p>
                    <p className="text-[10px] text-slate-500 uppercase mt-1">Full Research Dossier</p>
                  </div>
                </button>
                <div className="bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-sm">
                  <h4 className="font-black text-[10px] uppercase text-slate-400 mb-8 flex items-center gap-2"><Link size={14} className="text-indigo-400" /> Grounding Evidence</h4>
                  <div className="space-y-4">
                    {result.sources.length > 0 ? result.sources.map((s, i) => (
                      <a key={i} href={s.uri} target="_blank" rel="noopener noreferrer" className="block p-4 rounded-2xl bg-slate-50 hover:bg-indigo-50 transition-colors">
                        <p className="font-bold text-slate-800 text-xs truncate">{s.title}</p>
                        <p className="text-[9px] text-slate-400 font-mono mt-1">{new URL(s.uri).hostname}</p>
                      </a>
                    )) : (
                      <div className="p-4 text-center">
                        <p className="text-[10px] font-black text-slate-400 uppercase">Searching references...</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* 6. Field Research & Citizen Science Hub (Now at the bottom as requested) */}
            <CitizenScienceHub 
              missions={result.citizenScienceMissions} 
              speciesName={result.speciesName} 
              onDownloadDossier={handleExportDossier}
            />
          </div>
        )}
      </main>
      <footer className="bg-white border-t border-slate-200 py-12 mt-20 text-center">
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">MycoStrain Origins Protocol {APP_VERSION}</p>
      </footer>
    </div>
  );
}
