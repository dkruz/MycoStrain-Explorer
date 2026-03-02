
import React, { useState, useMemo, useEffect } from 'react';
import { performMycoAnalysis } from './services/geminiService';
import { trackSearch, trackProtocolView } from './services/analytics';
import { UsageTracker } from './services/usageTracker';
import { Tooltip } from './components/Tooltip';
import { AnalysisResult, Haplotype } from './types';
import { StrainMap } from './components/StrainMap';
import { NetworkGraph } from './components/NetworkGraph';
import { EvolutionaryTimeline } from './components/Timeline';
import { UserGuide } from './components/UserGuide';
import { CitizenScienceHub } from './components/CitizenScienceHub';
import { NetworkConsole, ResourceStatus } from './components/NetworkConsole';
import { DataTrustIndicator } from './components/DataTrustIndicator';
import { 
  Dna, Search, Loader2, AlertCircle, Download, Target, Globe, 
  FileText, Link, Scale, Activity, Sparkles, Shield, ListFilter, 
  History, Zap, BookOpen, Users, ShieldAlert, WifiOff, ExternalLink,
  Wifi, Microscope, Binoculars, RefreshCw, XCircle, ShieldCheck, Key, Info
} from 'lucide-react';

const FOCUS_OPTIONS = ["National Survey", "Pacific Northwest (PNW)", "Appalachian Mountains", "Northeast Deciduous", "Southeast Coastal Plain", "Rocky Mountains / Alpine", "California Floristic", "Boreal Forest / Taiga"];
const APP_VERSION = "v4.2-Dual";

export default function App() {
  const [species, setSpecies] = useState('');
  const [focusArea, setFocusArea] = useState(FOCUS_OPTIONS[0]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showGuide, setShowGuide] = useState(false);
  const [showConsole, setShowConsole] = useState(false);
  const [viewMode, setViewMode] = useState<'amateur' | 'professional'>('professional');
  const [hasApiKey, setHasApiKey] = useState<boolean | null>(null);
  const [userKeyInput, setUserKeyInput] = useState('');

  useEffect(() => {
    const checkKey = async () => {
      // A. Detect Google AI Studio Environment
      if ((window as any).aistudio) {
        const hasKey = await (window as any).aistudio.hasSelectedApiKey();
        setHasApiKey(hasKey);
        return;
      }

      // B. Detect Vercel/Production BYOK
      const savedKey = localStorage.getItem('sma_user_api_key');
      const envKey = (import.meta as any).env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
      setHasApiKey(!!(savedKey || envKey));
    };
    checkKey();
    UsageTracker.render();
  }, []);

  const handleSaveUserKey = () => {
    if (userKeyInput.trim().startsWith('AIza')) {
      localStorage.setItem('sma_user_api_key', userKeyInput.trim());
      setHasApiKey(true);
      window.location.reload(); // Refresh to re-initialize the AI client
    }
  };

  const handleClearKey = () => {
    localStorage.removeItem('sma_user_api_key');
    setHasApiKey(false);
    window.location.reload();
  };

  // Check if API key is present at runtime (baked in at build time)
  const isKeyLoaded = !!(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== "undefined");

  const [ledger, setLedger] = useState({ 
    gemini: isKeyLoaded ? 'idle' : 'blocked' as ResourceStatus, 
    search: 'idle' as ResourceStatus, 
    basemap: 'idle' as ResourceStatus, 
    cdn: 'success' as ResourceStatus 
  });

  const resources = [
    { id: '1', name: 'Phylogenetic Intel', url: 'generativelanguage.googleapis.com', status: ledger.gemini, category: 'API' as const },
    { id: '2', name: 'Grounding Crawl', url: 'google.com/search', status: ledger.search, category: 'Data' as const },
    { id: '3', name: 'Cartographic Baseline', url: 'raw.githubusercontent.com', status: ledger.basemap, category: 'Data' as const },
    { id: '4', name: 'Dependency Engine', url: 'esm.sh', status: ledger.cdn, category: 'CDN' as const },
  ];

  const uniqueSnps = useMemo(() => {
    if (!result) return [];
    const snpSet = new Set<string>();
    (result.haplotypes || []).forEach(h => (h.snps || []).forEach(s => snpSet.add(s)));
    return Array.from(snpSet).sort();
  }, [result]);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!species.trim()) return;
    
    if (!isKeyLoaded) {
      setError("BUILD_INTEGRITY_FAILURE: No GEMINI_API_KEY detected. For Vercel deployments, ensure the 'GEMINI_API_KEY' environment variable is set in the Project Settings before building.");
      return;
    }

    setLoading(true); 
    setError(null);
    setResult(null);
    setLedger(prev => ({ ...prev, gemini: 'pending', search: 'pending' }));
    
    try {
      const data = await performMycoAnalysis(species, focusArea, viewMode);
      setResult(data);
      setLedger(prev => ({ ...prev, gemini: 'success', search: 'success' }));
      trackSearch(species, focusArea);
    } catch (err: any) {
      console.error("Analysis Error:", err);
      setError(err.message || "Protocol Interrupted. Please check your network connection.");
      setLedger(prev => ({ ...prev, gemini: 'blocked', search: 'blocked' }));
    } finally { 
      setLoading(false); 
    }
  };

  const handleExportDossier = () => {
    if (!result) return;
    const timestamp = new Date().toLocaleString();
    const isPro = viewMode === 'professional';
    let fullContent = `========================================================\n`;
    fullContent += `MYCOSTRAIN EXPLORER: ${viewMode.toUpperCase()} DOSSIER\n`;
    fullContent += `========================================================\n\n`;
    fullContent += `[GENERAL METADATA]\nSpecies: ${result.speciesName}\nMode: ${isPro ? 'Professional Mycologist' : 'Nature Enthusiast'}\nFocus Area: ${result.focusArea}\nTimestamp: ${timestamp}\nProtocol Version: ${APP_VERSION}\n\n`;
    fullContent += `[VITAL STATISTICS]\nNucleotide Diversity (π): ${(result.nucleotideDiversity ?? 0).toFixed(6)}\nEstimated Regional Haplotypes: ${result.estimatedTotalHaplotypes}\nEstimated Global Haplotypes: ${result.estimatedGlobalHaplotypes}\nAncestral Center of Origin: ${result.ancestralOrigin}\n\n`;
    fullContent += `[DATA PROVENANCE TRUST PROFILE]\nNetwork Confidence: ${result.trustProfile.network.deterministicRatio}% Deterministic / ${result.trustProfile.network.probabilisticRatio}% Probabilistic\nTimeline Accuracy: ${result.trustProfile.timeline.deterministicRatio}% Deterministic / ${result.trustProfile.timeline.probabilisticRatio}% Probabilistic\nDataTable Veracity: ${result.trustProfile.dataTable.deterministicRatio}% Deterministic / ${result.trustProfile.dataTable.probabilisticRatio}% Probabilistic\n\n`;
    fullContent += `[RESEARCH SUMMARY]\n--------------------------------------------------------\n${result.dossier}\n--------------------------------------------------------\n\n`;
    fullContent += `[GENOMIC HAPLOTYPE REGISTRY]\nID\tRegion\tSimilarity\tAge (Mya)\tFunctional Trait\tSNP Markers\n`;
    (result.haplotypes || []).forEach(h => {
      fullContent += `${h.id}\t${h.region}\t${h.similarity}%\t${h.divergenceTime}\t${h.functionalTrait}\t[${(h.snps || []).join(', ')}]\n`;
    });
    fullContent += `\n`;

    if (!isPro && result.citizenScienceMissions && (result.citizenScienceMissions || []).length > 0) {
      fullContent += `[ADVENTURE & FIELD MISSIONS]\n`;
      (result.citizenScienceMissions || []).forEach((m, idx) => {
        fullContent += `\n${idx + 1}. ${m.title.toUpperCase()} [PRIORITY: ${m.priority.toUpperCase()}]\nMission: ${m.action}\nContext: ${m.description}\n`;
      });
      fullContent += `\n`;
    }

    if (isPro && (result.sources || []).length > 0) {
      fullContent += `[GROUNDING EVIDENCE SOURCES]\n`;
      (result.sources || []).forEach((s, idx) => {
        fullContent += `${idx + 1}. ${s.title} (${s.uri})\n`;
      });
      fullContent += `\n`;
    }

    fullContent += `[END OF DOSSIER]`;
    const blob = new Blob([fullContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `MycoStrain_${result.speciesName.replace(/\s/g, '_')}_${viewMode}_Dossier.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (hasApiKey === false) {
    const isAIS = !!(window as any).aistudio;
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#010101] text-slate-100 p-6" role="dialog" aria-modal="true" aria-labelledby="lock-title">
        <div className="max-w-md w-full text-center p-10 border border-emerald-500/20 rounded-3xl bg-black/50 backdrop-blur-xl shadow-2xl">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-emerald-500/10 text-emerald-500 rounded-2xl ring-1 ring-emerald-500/30" aria-hidden="true">
              <ShieldAlert size={32} />
            </div>
          </div>
          <h2 id="lock-title" className="text-emerald-500 font-mono text-base uppercase tracking-[0.4em] mb-4">Bio-Kernel Locked</h2>
          <p className="text-slate-400 text-sm mb-8 leading-relaxed">
            {isAIS 
              ? "Please select a valid API key from the platform dialog to continue."
              : "Please provide your own Gemini API Key. Your key is stored locally in your browser and never sent to our servers."}
          </p>
          
          {!isAIS && (
            <div className="space-y-4">
              <div className="relative group">
                <label htmlFor="api-key-input" className="sr-only">Gemini API Key</label>
                <input 
                  id="api-key-input"
                  type="password"
                  placeholder="Enter Gemini API Key (AIza...)"
                  value={userKeyInput}
                  onChange={(e) => setUserKeyInput(e.target.value)}
                  className="w-full bg-white/5 border border-emerald-500/30 rounded-xl px-4 py-3 pr-10 text-sm font-mono text-emerald-400 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500 placeholder:text-emerald-900"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-500/40 hover:text-emerald-500 cursor-help transition-colors">
                  <button 
                    className="focus:outline-none focus:ring-2 focus:ring-emerald-500 rounded-full p-0.5"
                    aria-label="API Key Privacy Information"
                  >
                    <Info size={16} aria-hidden="true" />
                  </button>
                  <div className="absolute bottom-full mb-2 right-0 w-48 p-3 bg-slate-900 border border-emerald-500/30 rounded-xl text-[10px] font-medium text-slate-300 leading-relaxed opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-2xl z-50">
                    <p className="flex items-center gap-2 mb-1 text-emerald-500 font-black uppercase tracking-widest">
                      <Shield size={10} aria-hidden="true" /> Privacy Note
                    </p>
                    Your key is stored strictly in your browser's <code className="text-emerald-400 bg-emerald-400/10 px-1 rounded">localStorage</code> and is never transmitted to any external server.
                  </div>
                </div>
              </div>
              <button 
                onClick={handleSaveUserKey}
                className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-mono tracking-[0.2em] uppercase rounded-xl font-black transition-all shadow-[0_0_20px_rgba(16,185,129,0.2)] focus:ring-4 focus:ring-emerald-500 focus:outline-none"
                aria-label="Initialize Kernel with provided API Key"
              >
                Initialize Kernel
              </button>
            </div>
          )}
          
          {isAIS && (
            <button 
              onClick={() => (window as any).aistudio.openSelectKey()} 
              className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-mono tracking-[0.2em] uppercase rounded-xl font-black transition-all focus:ring-4 focus:ring-emerald-500 focus:outline-none"
              aria-label="Open API Key selection dialog"
            >
              Select Key
            </button>
          )}

          <div className="mt-8 pt-8 border-t border-white/5 flex items-center justify-center gap-2 text-[10px] font-black text-slate-600 uppercase tracking-widest">
            <Shield size={12} aria-hidden="true" /> Secure Client-Side Auth
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex flex-col font-sans overflow-x-hidden transition-colors duration-500 ${viewMode === 'amateur' ? 'bg-emerald-50/40' : 'bg-slate-50'}`}>
      <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50" role="navigation" aria-label="Main Navigation">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`p-2.5 rounded-xl text-white shadow-lg transition-all duration-500 ${viewMode === 'amateur' ? 'bg-emerald-600' : 'bg-indigo-600'}`} aria-hidden="true">
              <Dna size={24} />
            </div>
            <div className="flex flex-col">
              <h1 className="text-xl font-black text-slate-900 tracking-tight leading-none">
                MycoStrain <span className={viewMode === 'amateur' ? 'text-emerald-600' : 'text-indigo-600'}>Explorer</span>
              </h1>
              <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mt-1">
                {viewMode === 'amateur' ? 'Nature Heritage Mode' : 'Phylogenetic Analysis Mode'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center bg-slate-100 p-1.5 rounded-2xl border border-slate-200 shadow-inner" role="group" aria-label="View Mode Selection">
              <Tooltip content="Simplified experience for nature enthusiasts">
                <button 
                  onClick={() => setViewMode('amateur')} 
                  className={`flex items-center gap-2 px-4 py-1.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all focus:ring-2 focus:ring-emerald-500 focus:outline-none ${viewMode === 'amateur' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                  aria-pressed={viewMode === 'amateur'}
                >
                  <Binoculars size={14} aria-hidden="true" /> Enthusiast
                </button>
              </Tooltip>
              <Tooltip content="Advanced phylogenetic tools for researchers">
                <button 
                  onClick={() => setViewMode('professional')} 
                  className={`flex items-center gap-2 px-4 py-1.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all focus:ring-2 focus:ring-indigo-500 focus:outline-none ${viewMode === 'professional' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                  aria-pressed={viewMode === 'professional'}
                >
                  <Microscope size={14} aria-hidden="true" /> Mycologist
                </button>
              </Tooltip>
            </div>
            <div className="flex items-center gap-3">
              {localStorage.getItem('sma_user_api_key') && (
                <Tooltip content="Clear stored API Key">
                  <button 
                    onClick={handleClearKey} 
                    className="p-2.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl transition-all focus:ring-2 focus:ring-red-500 focus:outline-none" 
                    aria-label="Clear stored API Key"
                  >
                    <XCircle size={18} aria-hidden="true" />
                  </button>
                </Tooltip>
              )}
              <Tooltip content={showConsole ? "Close Console" : "Open Console"}>
                <button 
                  onClick={() => setShowConsole(!showConsole)} 
                  className={`p-2.5 rounded-xl transition-all focus:ring-2 focus:ring-slate-900 focus:outline-none ${showConsole ? 'bg-slate-900 text-white shadow-lg' : (isKeyLoaded ? 'bg-slate-100 text-slate-600 hover:bg-slate-200' : 'bg-amber-100 text-amber-700 ring-2 ring-amber-400 animate-pulse')}`}
                  aria-label={showConsole ? "Close Network Console" : "Open Network Console"}
                  aria-expanded={showConsole}
                >
                  <Wifi size={18} aria-hidden="true" />
                </button>
              </Tooltip>
              <Tooltip content="Open Guide">
                <button 
                  onClick={() => setShowGuide(true)} 
                  className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-all focus:ring-2 focus:ring-slate-400 focus:outline-none"
                  aria-label="Open User Guide"
                >
                  <BookOpen size={18} aria-hidden="true" />
                </button>
              </Tooltip>
            </div>
          </div>
        </div>
      </nav>

      <UserGuide isOpen={showGuide} onClose={() => setShowGuide(false)} />
      <NetworkConsole resources={resources} isOpen={showConsole} onClose={() => setShowConsole(false)} />

      <main className="max-w-7xl mx-auto px-6 py-10 flex-grow w-full transition-all duration-300" role="main">
        {!isKeyLoaded && (
          <div className="max-w-4xl mx-auto mb-10 bg-amber-50 border-2 border-amber-200 p-6 rounded-[2rem] flex items-center gap-6 shadow-xl shadow-amber-100/50" role="alert">
            <div className="p-4 bg-amber-100 text-amber-700 rounded-2xl" aria-hidden="true">
              <Key size={28} />
            </div>
            <div>
              <p className="text-sm font-black text-amber-900 uppercase tracking-widest mb-1">Deployment Alert: API Key Missing</p>
              <p className="text-xs text-amber-800 font-medium leading-relaxed">
                This build was initialized without a <code>GEMINI_API_KEY</code>. Remote users will not be able to perform analyses. Set the environment variable in your Vercel or Cloud Run dashboard and redeploy.
              </p>
            </div>
          </div>
        )}

        <section className="mb-12 text-center max-w-4xl mx-auto">
          <h2 className="text-5xl font-black text-slate-900 mb-4 tracking-tighter">
            {viewMode === 'amateur' ? 'Explore Local Varieties' : 'Phylogenetic Origin Tracking'}
          </h2>
          <p className="text-slate-600 text-lg font-medium mb-10 max-w-2xl mx-auto">
            {viewMode === 'amateur' ? 'Learn about where your favorite mushrooms come from and how they have changed over time.' : 'Computational synthesis of genetic divergence and ancestral migration vectors using deep reasoning.'}
          </p>
          <div className={`bg-white p-4 rounded-[2.5rem] shadow-2xl border ring-8 transition-all duration-500 ${viewMode === 'amateur' ? 'border-emerald-100 ring-emerald-50/50' : 'border-slate-200 ring-slate-100/50'}`}>
            <form onSubmit={handleSearch} className="flex flex-col lg:flex-row gap-4">
              <div className="flex-[1.5] relative">
                <label htmlFor="species-input" className="sr-only">Species Name</label>
                <input 
                  id="species-input"
                  type="text" 
                  value={species} 
                  onChange={(e) => setSpecies(e.target.value)} 
                  placeholder={viewMode === 'amateur' ? "e.g. Lion's Mane or Morels" : "e.g. Hericium erinaceus"} 
                  className="w-full px-10 py-6 rounded-3xl bg-slate-50 border-none focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-slate-800 shadow-inner" 
                />
              </div>
              <div className="flex-1 relative">
                <label htmlFor="focus-area-select" className="sr-only">Focus Area</label>
                <select 
                  id="focus-area-select"
                  value={focusArea} 
                  onChange={(e) => setFocusArea(e.target.value)} 
                  className="w-full px-10 py-6 rounded-3xl bg-slate-50 border-none focus:ring-2 focus:ring-indigo-500 outline-none font-black text-slate-700 shadow-inner"
                >
                  {FOCUS_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </div>
              <Tooltip content={loading ? "Analyzing..." : "Start Analysis"}>
                <button 
                  disabled={loading} 
                  className={`px-10 py-6 rounded-3xl font-black shadow-lg flex items-center justify-center gap-3 transition-all text-white focus:ring-2 focus:ring-offset-2 focus:outline-none ${viewMode === 'amateur' ? 'bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500' : 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500'}`}
                  aria-live="polite"
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin" size={24} aria-hidden="true" />
                      <span>Analyzing...</span>
                    </>
                  ) : (
                    viewMode === 'amateur' ? 'DISCOVER' : 'ANALYZE'
                  )}
                </button>
              </Tooltip>
            </form>
          </div>
        </section>

        {error && (
          <div className="max-w-3xl mx-auto mb-12 animate-in zoom-in-95 duration-300" role="alert" aria-live="assertive">
            <div className="bg-white/40 backdrop-blur-xl border-2 border-red-200 rounded-[2.5rem] p-10 flex flex-col md:flex-row items-center gap-8 shadow-2xl shadow-red-100">
              <div className="p-6 bg-red-100 text-red-600 rounded-3xl shadow-inner" aria-hidden="true">
                <AlertCircle size={48} />
              </div>
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-2xl font-black text-slate-900 mb-2">Protocol Interrupted</h3>
                <p className="text-sm font-medium text-slate-700 leading-relaxed mb-6">{error}</p>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                  <Tooltip content="Retry Analysis">
                    <button 
                      onClick={() => handleSearch()} 
                      className="px-6 py-3 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-slate-800 transition-colors focus:ring-2 focus:ring-slate-500 focus:outline-none"
                    >
                      <RefreshCw size={14} aria-hidden="true" /> Retry Protocol
                    </button>
                  </Tooltip>
                  <Tooltip content="Clear Error Message">
                    <button 
                      onClick={() => setError(null)} 
                      className="px-6 py-3 bg-white border border-slate-200 text-slate-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-colors focus:ring-2 focus:ring-slate-300 focus:outline-none"
                    >
                      Clear Error
                    </button>
                  </Tooltip>
                </div>
              </div>
            </div>
          </div>
        )}

        {result && !loading && (
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { label: viewMode === 'amateur' ? "Original Home" : "Ancestral Root", val: result.ancestralOrigin, icon: History },
                { label: viewMode === 'amateur' ? "Variety Score" : "Drift Index (Pi)", val: (result.nucleotideDiversity ?? 0).toFixed(4), icon: Scale },
                { label: viewMode === 'amateur' ? "Cousins Found" : "Haplotype Count", val: result.haplotypes.length, icon: Users },
                { label: "AI Protocol", val: "Thinking-32k", icon: Zap }
              ].map((stat, i) => (
                <div key={i} className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm">
                  <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest flex items-center gap-2 mb-3">
                    <stat.icon size={12} aria-hidden="true" /> {stat.label}
                  </p>
                  <p className="text-2xl font-black tracking-tight text-slate-900 truncate">{stat.val}</p>
                </div>
              ))}
            </div>

            <StrainMap data={result.haplotypes} mode={viewMode} onStatusChange={(status) => setLedger(prev => ({ ...prev, basemap: status }))} />
            <NetworkGraph data={result.haplotypes} trust={viewMode === 'professional' ? result.trustProfile.network : undefined} mode={viewMode} />
            <EvolutionaryTimeline data={result.haplotypes} trust={viewMode === 'professional' ? result.trustProfile.timeline : undefined} mode={viewMode} />

            <div className="bg-slate-900 p-10 rounded-[3rem] shadow-2xl border border-slate-800 overflow-hidden">
              <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-6">
                <h3 className="text-2xl font-black text-white flex items-center gap-3">
                  <ListFilter className={viewMode === 'amateur' ? 'text-emerald-400' : 'text-indigo-400'} /> 
                  {viewMode === 'amateur' ? 'Variety Overview' : 'Genomic Drift Data Table'}
                </h3>
                {viewMode === 'professional' && <DataTrustIndicator metrics={result.trustProfile.dataTable} label="Allelic Veracity" />}
              </div>
              <div className="overflow-x-auto custom-scrollbar pb-4">
                <table className="w-full text-left border-collapse">
                  <thead><tr><th className="p-4 bg-slate-800 text-[10px] font-black text-slate-400 uppercase border border-slate-700">{viewMode === 'amateur' ? 'Variety' : 'Haplotype'}</th><th className="p-4 bg-slate-800 text-[10px] font-black text-slate-400 uppercase border border-slate-700">{viewMode === 'amateur' ? 'Estimated Age' : 'Divergence (Mya)'}</th><th className="p-4 bg-slate-800 text-[10px] font-black text-slate-400 uppercase border border-slate-700">{viewMode === 'amateur' ? 'Unique Traits' : 'Functional Ontology'}</th>{viewMode === 'professional' && uniqueSnps.slice(0, 8).map(snp => (<th key={snp} className="p-4 bg-slate-800 text-[10px] font-mono font-black text-indigo-300 border border-slate-700 text-center">{snp}</th>))}</tr></thead>
                  <tbody>{(result.haplotypes || []).map((h) => (<tr key={h.id} className="hover:bg-slate-800/50"><td className="p-4 text-xs font-black text-white border border-slate-800">{h.id}</td><td className="p-4 text-xs font-mono text-indigo-400 border border-slate-800">{viewMode === 'amateur' ? `${h.divergenceTime} Million Yrs` : `${h.divergenceTime} Mya`}</td><td className="p-4 text-[11px] text-slate-400 font-medium italic border border-slate-800">{h.functionalTrait}</td>{viewMode === 'professional' && uniqueSnps.slice(0, 8).map(snp => (<td key={snp} className="p-4 border border-slate-800 text-center">{(h.snps || []).includes(snp) ? <div className="w-2 h-2 rounded-full bg-indigo-500 mx-auto"></div> : <div className="w-1 h-1 rounded-full bg-slate-700 mx-auto opacity-30"></div>}</td>))}</tr>))}</tbody>
                </table>
              </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-10">
              <div className="lg:col-span-2">
                <div className="bg-white p-12 rounded-[3rem] border border-slate-200 shadow-sm h-full">
                  <div className="flex items-center gap-4 mb-8 pb-6 border-b border-slate-100">
                    <FileText className={viewMode === 'amateur' ? 'text-emerald-600' : 'text-indigo-600'} aria-hidden="true" />
                    <h3 className="text-2xl font-black uppercase text-slate-900 tracking-tight">
                      {viewMode === 'amateur' ? 'The Species Story' : 'Origin & Evolutionary Dossier'}
                    </h3>
                  </div>
                  <p className={`text-lg text-slate-800 border-l-4 pl-6 py-2 mb-10 leading-relaxed ${viewMode === 'amateur' ? 'border-emerald-200 bg-emerald-50/20' : 'border-indigo-200 bg-indigo-50/20'}`}>
                    {result.dossier}
                  </p>
                </div>
              </div>
              <div className="space-y-8">
                <Tooltip content="Download Full Research Dossier" position="left">
                  <button 
                    onClick={handleExportDossier} 
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white p-10 rounded-[2.5rem] font-black flex flex-col items-center gap-4 shadow-2xl transition-all active:scale-95 focus:ring-4 focus:ring-slate-300 focus:outline-none"
                    aria-label="Download Full Research Dossier"
                  >
                    <Download size={32} aria-hidden="true" />
                    <div className="text-center">
                      <p className="text-xl">Export Report</p>
                      <p className="text-[10px] text-slate-400 uppercase mt-1 tracking-widest">Full {viewMode} Dossier</p>
                    </div>
                  </button>
                </Tooltip>
                <div className="bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-sm">
                  <h4 className="font-black text-[10px] uppercase text-slate-500 mb-8 flex items-center gap-2">
                    <Link size={14} className="text-indigo-500" aria-hidden="true" /> Grounding Evidence
                  </h4>
                  <div className="space-y-4">
                    {(result.sources || []).length > 0 ? (result.sources || []).map((s, i) => (
                      <a 
                        key={i} 
                        href={s.uri} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="block p-4 rounded-2xl bg-slate-50 hover:bg-indigo-50 transition-colors focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        aria-label={`Visit source: ${s.title}`}
                      >
                        <p className="font-bold text-slate-800 text-xs truncate flex items-center gap-2">
                          {s.title} <ExternalLink size={10} className="text-slate-400" aria-hidden="true" />
                        </p>
                        <p className="text-[9px] text-slate-500 font-mono mt-1">{new URL(s.uri).hostname}</p>
                      </a>
                    )) : <p className="text-xs text-slate-500 text-center py-4 italic">No external links found.</p>}
                  </div>
                </div>
              </div>
            </div>
            {viewMode === 'amateur' && (<CitizenScienceHub missions={result.citizenScienceMissions} speciesName={result.speciesName} onDownloadDossier={handleExportDossier} />)}
          </div>
        )}
      </main>
      <footer className="bg-white border-t border-slate-200 py-12 mt-20 text-center" role="contentinfo">
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">MycoStrain Protocol {APP_VERSION}</p>
      </footer>
    </div>
  );
}
