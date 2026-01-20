
import React, { useState, useMemo, useEffect } from 'react';
import { performMycoAnalysis } from './services/geminiService';
import { AnalysisResult } from './types';
import { StrainMap } from './components/StrainMap';
import { NetworkGraph } from './components/NetworkGraph';
import { 
  Dna, Search, Loader2, AlertCircle, Download, Target, Globe, FileText, Link, Scale, Activity, ChevronDown, ChevronUp, BookOpen, MousePointer2, GitBranch, FlaskConical, Sparkles, Key, ShieldCheck, ExternalLink, Trash2, LogOut
} from 'lucide-react';

const FOCUS_OPTIONS = ["National Survey", "Pacific Northwest (PNW)", "Appalachian Mountains", "Northeast Deciduous", "Southeast Coastal Plain", "Rocky Mountains / Alpine", "California Floristic", "Boreal Forest / Taiga"];
const SUGGESTED_SPECIES = ["Trametes versicolor", "Amanita muscaria", "Cordyceps militaris", "Laccaria bicolor"];

export default function App() {
  const [species, setSpecies] = useState('');
  const [focusArea, setFocusArea] = useState(FOCUS_OPTIONS[0]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showGuide, setShowGuide] = useState(false);
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [tempKey, setTempKey] = useState('');
  const [hasActiveSession, setHasActiveSession] = useState(false);

  useEffect(() => {
    setHasActiveSession(!!sessionStorage.getItem('MYCO_EXPLORER_KEY'));
  }, []);

  const nutritionalMode = useMemo(() => {
    if (!result?.dossier) return "Dynamic";
    const match = result.dossier.match(/(?:STRATEGY|MODE):\s*([^\n.]+)/i);
    return match ? match[1].trim() : "Model Grounded";
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
      if (err.message === "MISSING_KEY") {
        setShowKeyModal(true);
      } else {
        setError("Analysis failed. Verify your API Key permissions and species name.");
      }
    } finally {
      setLoading(false);
    }
  };

  const saveKey = () => {
    if (tempKey.trim()) {
      sessionStorage.setItem('MYCO_EXPLORER_KEY', tempKey.trim());
      setHasActiveSession(true);
      setShowKeyModal(false);
      handleSearch();
    }
  };

  const clearSession = () => {
    sessionStorage.removeItem('MYCO_EXPLORER_KEY');
    setHasActiveSession(false);
    setResult(null);
    window.location.reload();
  };

  const handleExportDossier = () => {
    if (!result) return;
    const blob = new Blob([result.dossier], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `MycoStrain_${result.speciesName.replace(/\s/g, '_')}.txt`;
    a.click();
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Access Guard Modal */}
      {showKeyModal && (
        <div className="fixed inset-0 z-[100] bg-slate-900/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] p-10 max-w-md w-full shadow-2xl animate-in zoom-in-95 border border-slate-200">
            <div className="flex items-center gap-4 mb-8">
              <div className="bg-indigo-600 p-4 rounded-2xl text-white shadow-lg shadow-indigo-200"><Key size={28} /></div>
              <div>
                <h3 className="text-2xl font-black text-slate-900 leading-tight">Secure Access</h3>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Research Session Only</p>
              </div>
            </div>
            
            <p className="text-slate-600 text-sm mb-8 leading-relaxed">
              This deployment requires an <strong>API Key</strong> to interact with the Gemini-3-Pro model. Your key is stored locally in this browser tab's memory and is destroyed when you close it.
            </p>

            <div className="space-y-4">
              <div className="relative">
                <input 
                  type="password"
                  placeholder="Paste Gemini API Key..."
                  className="w-full px-6 py-5 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-indigo-500 focus:bg-white transition-all outline-none font-mono text-sm shadow-inner"
                  value={tempKey}
                  onChange={(e) => setTempKey(e.target.value)}
                />
              </div>
              
              <button 
                onClick={saveKey} 
                className="w-full bg-slate-900 hover:bg-indigo-600 text-white py-5 rounded-2xl font-black flex items-center justify-center gap-3 transition-all shadow-xl active:scale-[0.98]"
              >
                <ShieldCheck size={20} /> START ANALYSIS
              </button>

              <div className="flex items-center justify-between pt-4 px-2">
                <a href="https://aistudio.google.com/app/apikey" target="_blank" className="text-[10px] font-black text-slate-400 hover:text-indigo-600 flex items-center gap-1.5 uppercase tracking-widest transition-colors">
                  Get Key <ExternalLink size={12} />
                </a>
                <button onClick={() => setShowKeyModal(false)} className="text-[10px] font-black text-slate-400 hover:text-red-500 uppercase tracking-widest">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2.5 rounded-xl text-white shadow-lg shadow-indigo-100"><Dna size={24} /></div>
            <div>
              <h1 className="text-xl font-black text-slate-900 tracking-tight leading-none">MycoStrain <span className="text-indigo-600">Explorer</span></h1>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">Bioinformatics Interface</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {hasActiveSession && (
              <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-100 rounded-full text-[10px] font-black text-green-700 uppercase tracking-widest">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                Session Active
              </div>
            )}
            <button 
              onClick={hasActiveSession ? clearSession : () => setShowKeyModal(true)} 
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${hasActiveSession ? 'bg-slate-100 text-slate-500 hover:bg-red-50 hover:text-red-600 border border-slate-200' : 'bg-indigo-50 text-indigo-600 border border-indigo-100'}`}
              title={hasActiveSession ? "Clear API Key" : "Enter API Key"}
            >
              {hasActiveSession ? <LogOut size={14} /> : <Key size={14} />}
              {hasActiveSession ? "End Session" : "Access"}
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-10 flex-grow w-full">
        <section className="mb-12 text-center max-w-4xl mx-auto">
          <h2 className="text-5xl font-black text-slate-900 mb-4 tracking-tighter">Genomic Haplotype Modeling</h2>
          <p className="text-slate-500 text-lg font-medium leading-relaxed mb-10">Cross-referencing metabolic pathways with geographic genetic drift.</p>
          
          <div className="bg-white p-4 rounded-[2.5rem] shadow-2xl border border-slate-200/60 ring-8 ring-slate-100/50">
            <form onSubmit={(e) => handleSearch(e)} className="flex flex-col lg:flex-row gap-4">
              <div className="relative flex-[1.5]">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={22} />
                <input 
                  type="text" 
                  value={species} 
                  onChange={(e) => setSpecies(e.target.value)} 
                  placeholder="Enter scientific name (e.g. Cordyceps militaris)" 
                  className="w-full pl-16 pr-6 py-6 rounded-3xl bg-slate-50 border-none focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-slate-800 placeholder:text-slate-300 transition-all shadow-inner" 
                />
              </div>
              <div className="relative flex-1">
                <Target className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <select 
                  value={focusArea} 
                  onChange={(e) => setFocusArea(e.target.value)} 
                  className="w-full pl-14 pr-12 py-6 rounded-3xl bg-slate-50 border-none focus:ring-2 focus:ring-indigo-500 outline-none font-black text-slate-600 appearance-none shadow-inner"
                >
                  {FOCUS_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
                <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
              </div>
              <button 
                disabled={loading} 
                className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 text-white px-10 py-6 rounded-3xl font-black shadow-lg shadow-indigo-100 transition-all hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-3"
              >
                {loading ? <Loader2 className="animate-spin" size={24} /> : 'ANALYZE SPECIES'}
              </button>
            </form>
          </div>
          
          <div className="flex flex-wrap items-center justify-center gap-3 mt-8">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mr-2">
              <Sparkles size={14} className="text-amber-400" /> Reference Strains:
            </span>
            {SUGGESTED_SPECIES.map(s => (
              <button
                key={s}
                onClick={() => handleSearch(undefined, s)}
                disabled={loading}
                className="px-4 py-2 bg-white border border-slate-200 rounded-2xl text-[11px] font-black text-slate-500 hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all shadow-sm active:scale-95"
              >
                {s}
              </button>
            ))}
          </div>
        </section>

        {error && (
          <div className="max-w-2xl mx-auto mb-10 bg-red-50 border-2 border-red-100 p-6 rounded-[2rem] text-red-700 font-black flex items-center gap-4 animate-in slide-in-from-top-4">
            <div className="bg-red-100 p-3 rounded-xl"><AlertCircle size={24} /></div>
            <div>
              <p className="text-sm">Process Interrupted</p>
              <p className="text-xs font-bold text-red-500 mt-0.5">{error}</p>
            </div>
          </div>
        )}

        {loading && (
          <div className="py-32 text-center animate-pulse">
            <div className="relative w-24 h-24 mx-auto mb-8">
              <div className="absolute inset-0 border-4 border-indigo-100 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
            <h3 className="text-2xl font-black text-slate-800 tracking-tight">Accessing Genomic Repositories</h3>
            <p className="text-slate-400 mt-3 text-sm font-bold uppercase tracking-[0.2em]">JGI • NCBI • GBIF • Grounding Search</p>
          </div>
        )}

        {result && !loading && (
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { label: "Regional Est.", val: result.estimatedTotalHaplotypes, icon: Target, color: "text-slate-900" },
                { label: "Global Est.", val: result.estimatedGlobalHaplotypes, icon: Globe, color: "text-indigo-600" },
                { label: "Drift (π)", val: result.nucleotideDiversity.toFixed(4), icon: Scale, color: "text-slate-900" },
                { label: "Analysis Mode", val: "High Fidelity", icon: Sparkles, color: "text-amber-500" }
              ].map((stat, i) => (
                <div key={i} className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest flex items-center gap-2 mb-3">
                    <stat.icon size={12} /> {stat.label}
                  </p>
                  <p className={`text-3xl font-black tracking-tight ${stat.color}`}>{stat.val}</p>
                </div>
              ))}
            </div>

            <StrainMap data={result.haplotypes} speciesName={result.speciesName} />
            
            <NetworkGraph data={result.haplotypes} />

            <div className="grid lg:grid-cols-3 gap-10">
              <div className="lg:col-span-2">
                <div className="bg-white p-10 md:p-14 rounded-[3rem] border border-slate-200 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
                    <FileText size={200} />
                  </div>
                  <div className="flex items-center gap-4 mb-10 pb-6 border-b border-slate-100">
                    <div className="bg-indigo-50 p-3 rounded-2xl text-indigo-600"><FileText size={24} /></div>
                    <h3 className="text-2xl font-black uppercase tracking-tight text-slate-900">Research Dossier</h3>
                  </div>
                  <div className="prose prose-slate max-w-none text-slate-700 leading-relaxed whitespace-pre-wrap font-medium text-base md:text-lg">
                    {result.dossier}
                  </div>
                </div>
              </div>
              
              <div className="space-y-8">
                <div className="bg-slate-900 p-10 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden group">
                  <Activity className="absolute bottom-0 right-0 text-white/5 -mb-6 -mr-6 group-hover:scale-110 transition-transform duration-1000" size={160} />
                  <h3 className="font-black text-2xl mb-2 tracking-tight">Export Findings</h3>
                  <p className="text-slate-400 text-xs mb-8 font-medium">Generate a detailed summary report for offline review.</p>
                  <button onClick={handleExportDossier} className="w-full bg-indigo-600 hover:bg-indigo-500 py-5 rounded-2xl font-black flex items-center justify-center gap-3 transition-all shadow-xl active:scale-95 group-hover:ring-4 ring-indigo-600/20">
                    <Download size={22} /> DOWNLOAD TXT
                  </button>
                </div>

                <div className="bg-white p-10 rounded-[2.5rem] border border-slate-200">
                  <h4 className="font-black text-[10px] uppercase tracking-widest text-slate-400 mb-8 flex items-center gap-2">
                    <Link size={14} className="text-indigo-400" /> Evidence Grounding
                  </h4>
                  <div className="space-y-5">
                    {result.sources.length > 0 ? result.sources.map((s, i) => (
                      <a key={i} href={s.uri} target="_blank" rel="noopener noreferrer" className="group block p-5 rounded-2xl bg-slate-50 hover:bg-indigo-50 border border-slate-100 hover:border-indigo-200 transition-all">
                        <p className="font-black text-slate-800 text-sm mb-1 group-hover:text-indigo-700 transition-colors line-clamp-1">{s.title}</p>
                        <p className="text-slate-400 group-hover:text-indigo-400 truncate font-mono text-[10px] flex items-center gap-1.5">
                          <Globe size={10} /> {new URL(s.uri).hostname}
                        </p>
                      </a>
                    )) : (
                      <p className="text-xs text-slate-400 italic">No external citations found in response metadata.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="bg-white border-t border-slate-200 py-12 mt-20">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 text-slate-400">
            <div className="bg-slate-100 p-1.5 rounded-lg"><Dna size={16} /></div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em]">Mycological Data Explorer v1.2</p>
          </div>
          <p className="text-slate-300 text-[10px] font-medium tracking-wide">
            Powered by Gemini-3-Pro & Google Search Grounding
          </p>
        </div>
      </footer>
    </div>
  );
}
