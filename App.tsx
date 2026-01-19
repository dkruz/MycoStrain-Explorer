
import React, { useState, useMemo } from 'react';
import { performMycoAnalysis } from './services/geminiService';
import { AnalysisResult } from './types';
import { StrainMap } from './components/StrainMap';
import { NetworkGraph } from './components/NetworkGraph';
import { 
  Dna, 
  Search, 
  Loader2, 
  Info,
  Beaker,
  AlertCircle,
  Download,
  Target,
  Globe,
  FileText,
  Link,
  MapPin,
  Scale,
  Layers,
  Activity,
  ChevronDown,
  ChevronUp,
  BookOpen,
  MousePointer2,
  GitBranch,
  FlaskConical,
  Sparkles
} from 'lucide-react';

const FOCUS_OPTIONS = [
  "National Survey",
  "Pacific Northwest (PNW)",
  "Appalachian Mountains",
  "Northeast Deciduous",
  "Southeast Coastal Plain",
  "Rocky Mountains / Alpine",
  "California Floristic",
  "Boreal Forest / Taiga"
];

const SUGGESTED_SPECIES = [
  "Trametes versicolor",
  "Amanita muscaria",
  "Cordyceps militaris",
  "Laccaria bicolor"
];

export default function App() {
  const [species, setSpecies] = useState('');
  const [focusArea, setFocusArea] = useState(FOCUS_OPTIONS[0]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showGuide, setShowGuide] = useState(false);

  const nutritionalMode = useMemo(() => {
    if (!result?.dossier) return "Dynamic";
    const strategyMatch = result.dossier.match(/(?:NUTRITIONAL STRATEGY|STRATEGY|MODE):\s*([^\n.]+)/i);
    if (strategyMatch && strategyMatch[1]) {
      return strategyMatch[1].trim();
    }
    return "Model Grounded";
  }, [result]);

  const handleSearch = async (e?: React.FormEvent, overrideSpecies?: string) => {
    if (e) e.preventDefault();
    const targetSpecies = overrideSpecies || species;
    if (!targetSpecies.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const data = await performMycoAnalysis(targetSpecies, focusArea);
      setResult(data);
      if (overrideSpecies) setSpecies(overrideSpecies);
    } catch (err: any) {
      console.error(err);
      setError("Analysis failed. Check your API connection or try a more specific species name.");
    } finally {
      setLoading(false);
    }
  };

  const handleExportDossier = () => {
    if (!result) return;
    let reportContent = `MYCOSTRAIN EXPLORER RESEARCH REPORT\nSPECIES: ${result.speciesName}\nSTRATEGY: ${nutritionalMode}\n...`;
    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `MycoStrain_${result.speciesName.replace(/\s/g, '_')}.txt`;
    a.click();
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-2 rounded-lg text-white shadow-lg"><Dna size={24} /></div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">MycoStrain <span className="text-indigo-600">Explorer</span></h1>
          </div>
          <div className="hidden md:flex items-center gap-4">
            <span className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-widest transition-all duration-700 ${result ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-slate-100 border-slate-200 text-slate-400'}`}>
              <Scale size={12} /> Nutritional Mode: {nutritionalMode}
            </span>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8 flex-grow">
        <section className="mb-8 text-center max-w-5xl mx-auto">
          <h2 className="text-4xl font-black text-slate-900 mb-2 tracking-tight">Fungal Genomic Extrapolation</h2>
          <p className="text-slate-500 mb-8 text-lg">Cross-referencing nutritional strategies with predictive metabolic clades.</p>
          
          <div className="max-w-4xl mx-auto mb-10">
            <form onSubmit={(e) => handleSearch(e)} className="space-y-4 mb-4">
              <div className="flex flex-col lg:flex-row gap-3 bg-white p-3 rounded-[2rem] shadow-2xl border border-slate-200 items-stretch">
                <div className="relative flex-1">
                  <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                  <input 
                    type="text" 
                    value={species}
                    onChange={(e) => setSpecies(e.target.value)}
                    placeholder="e.g. Pleurotus ostreatus"
                    className="w-full pl-14 pr-4 py-5 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 font-semibold"
                  />
                </div>
                <div className="relative flex-1">
                  <Target className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <select 
                    value={focusArea}
                    onChange={(e) => setFocusArea(e.target.value)}
                    className="w-full pl-14 pr-12 py-5 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-indigo-500 outline-none appearance-none text-slate-700 font-bold"
                  >
                    {FOCUS_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                  <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                </div>
                <button disabled={loading} className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-5 rounded-2xl font-black shadow-lg flex items-center justify-center gap-2 transition-all active:scale-95">
                  {loading ? <Loader2 className="animate-spin" size={20} /> : 'ANALYZE'}
                </button>
              </div>
            </form>
            
            <div className="flex flex-wrap items-center justify-center gap-2 px-4">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-2 flex items-center gap-1">
                <Sparkles size={12} className="text-amber-500" /> High-Confidence Samples:
              </span>
              {SUGGESTED_SPECIES.map(s => (
                <button
                  key={s}
                  onClick={() => handleSearch(undefined, s)}
                  disabled={loading}
                  className="px-3 py-1.5 bg-white border border-slate-200 rounded-full text-[10px] font-bold text-slate-600 hover:border-indigo-500 hover:text-indigo-600 transition-all shadow-sm active:bg-indigo-50"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="max-w-4xl mx-auto">
            <button 
              onClick={() => setShowGuide(!showGuide)}
              className="flex items-center gap-2 mx-auto text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-indigo-600 transition-colors"
            >
              <BookOpen size={14} /> {showGuide ? "Hide User Guide" : "Show How to Use Guide"} {showGuide ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
            
            {showGuide && (
              <div className="mt-4 bg-white border border-slate-200 rounded-3xl p-8 text-left grid md:grid-cols-2 gap-8 shadow-xl animate-in fade-in slide-in-from-top-4">
                <div className="space-y-6">
                  <div>
                    <h4 className="flex items-center gap-2 text-indigo-600 font-black text-xs uppercase tracking-widest mb-2">
                      <MousePointer2 size={14} /> 1. Initiate Search
                    </h4>
                    <p className="text-xs text-slate-600 leading-relaxed">Enter the scientific (Latin) name. Select a <strong>Geographic Focus</strong> to prioritize regional environmental data (GBIF/iNaturalist) over global consensus models.</p>
                  </div>
                  <div>
                    <h4 className="flex items-center gap-2 text-indigo-600 font-black text-xs uppercase tracking-widest mb-2">
                      <Globe size={14} /> 2. Use the Spatial Map
                    </h4>
                    <p className="text-xs text-slate-600 leading-relaxed">The map auto-zooms to clusters. <strong>Pulsing Halos</strong> represent high regional prevalence. Select any node to view specific substrate (e.g. <em>Hardwood logs</em>) and metabolic potency.</p>
                  </div>
                </div>
                <div className="space-y-6">
                  <div>
                    <h4 className="flex items-center gap-2 text-fuchsia-600 font-black text-xs uppercase tracking-widest mb-2">
                      <GitBranch size={14} /> 3. Mutation Network
                    </h4>
                    <p className="text-xs text-slate-600 leading-relaxed">Dashed lines represent predicted lineage branching based on SNP homology. Drag nodes to explore relationships; larger nodes indicate higher genetic similarity to the type-strain.</p>
                  </div>
                  <div>
                    <h4 className="flex items-center gap-2 text-amber-600 font-black text-xs uppercase tracking-widest mb-2">
                      <FlaskConical size={14} /> 4. Interpreting Results
                    </h4>
                    <p className="text-xs text-slate-600 leading-relaxed">The <strong>Scientific Dossier</strong> synthesizes grounding data. Pay close attention to the <em>Confidence Analysis</em> to distinguish between confirmed records and metabolic predictions.</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {error && (
          <div className="max-w-md mx-auto mb-8 bg-red-50 border border-red-100 p-4 rounded-2xl flex items-center gap-3 text-red-700 font-bold text-sm">
            <AlertCircle size={20} /> {error}
          </div>
        )}

        {loading && (
          <div className="py-24 text-center">
            <div className="w-24 h-24 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mx-auto mb-6"></div>
            <h3 className="text-xl font-black text-slate-800 tracking-tight">Synthesizing Genomic Records...</h3>
            <p className="text-slate-400 mt-2 text-sm italic">Querying JGI/UniProt and GBIF clades.</p>
          </div>
        )}

        {result && !loading && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white p-6 rounded-2xl border border-slate-200">
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Regional Est.</p>
                <p className="text-2xl font-black text-slate-900">{result.estimatedTotalHaplotypes}</p>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-slate-200">
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Global Est.</p>
                <p className="text-2xl font-black text-indigo-600">{result.estimatedGlobalHaplotypes}</p>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-slate-200">
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Drift (π)</p>
                <p className="text-2xl font-black text-slate-900">{result.nucleotideDiversity.toFixed(4)}</p>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-slate-200">
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Status</p>
                <div className="flex items-center gap-2 mt-2"><div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" /> <span className="text-[10px] font-bold text-green-600">LIVE</span></div>
              </div>
            </div>

            <StrainMap data={result.haplotypes} speciesName={result.speciesName} />
            <NetworkGraph data={result.haplotypes} />

            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <div className="bg-white p-8 md:p-12 rounded-3xl border border-slate-200 shadow-sm">
                  <div className="flex items-center gap-3 mb-8 pb-6 border-b border-slate-100">
                    <FileText className="text-indigo-600" size={28} />
                    <h3 className="text-2xl font-black uppercase tracking-tight">Research Dossier</h3>
                  </div>
                  <div className="prose prose-slate max-w-none text-slate-700 leading-relaxed whitespace-pre-wrap font-medium text-sm md:text-base">
                    {result.dossier}
                  </div>
                </div>
              </div>
              <div className="space-y-6">
                <div className="bg-slate-900 p-8 rounded-3xl text-white shadow-2xl relative overflow-hidden group">
                  <Activity className="absolute bottom-0 right-0 text-white/5 -mb-4 -mr-4 group-hover:scale-110 transition-transform duration-700" size={120} />
                  <h3 className="font-black text-xl mb-4 tracking-tight">Export Data</h3>
                  <button onClick={handleExportDossier} className="w-full bg-indigo-600 hover:bg-indigo-500 py-4 rounded-2xl font-black flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95">
                    <Download size={20} /> DOWNLOAD TXT
                  </button>
                </div>
                <div className="bg-white p-8 rounded-3xl border border-slate-200">
                  <h4 className="font-black text-[10px] uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
                    <Link size={12} /> External Grounding
                  </h4>
                  <div className="space-y-4">
                    {result.sources.map((s, i) => (
                      <a key={i} href={s.uri} target="_blank" rel="noopener noreferrer" className="block p-3 rounded-xl hover:bg-indigo-50 border border-slate-100 transition-all text-xs">
                        <p className="font-black text-slate-700 truncate">{s.title}</p>
                        <p className="text-indigo-400 truncate font-mono text-[10px]">{s.uri}</p>
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="bg-white border-t border-slate-200 py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">Mycological Research Interface</p>
        </div>
      </footer>
    </div>
  );
}
