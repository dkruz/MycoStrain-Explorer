
import React, { useState, useEffect } from 'react';
import { performMycoAnalysis } from './services/geminiService';
import { AnalysisResult } from './types';
import { StrainMap } from './components/StrainMap';
import { NetworkGraph } from './components/NetworkGraph';
import { 
  Dna, Search, Loader2, AlertCircle, Download, Target, Globe, FileText, Link, Scale, Activity, ChevronDown, Sparkles, Key, ShieldCheck, LogOut, Info, Shield, ExternalLink, HelpCircle, ArrowRight, AlertTriangle, CheckCircle2, ChevronRight, Zap, RefreshCw, Layers
} from 'lucide-react';

const FOCUS_OPTIONS = ["National Survey", "Pacific Northwest (PNW)", "Appalachian Mountains", "Northeast Deciduous", "Southeast Coastal Plain", "Rocky Mountains / Alpine", "California Floristic", "Boreal Forest / Taiga"];

export default function App() {
  const [species, setSpecies] = useState('');
  const [focusArea, setFocusArea] = useState(FOCUS_OPTIONS[0]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [envSupport, setEnvSupport] = useState<'supported' | 'unsupported' | 'checking'>('checking');
  const [showTroubleshooting, setShowTroubleshooting] = useState(false);

  useEffect(() => {
    let checkInterval: number;
    let attempts = 0;

    const performCheck = async () => {
      attempts++;
      // The handshake bridge (window.aistudio) is only present when the app is framed inside AI Studio
      if (window.aistudio && typeof window.aistudio.hasSelectedApiKey === 'function') {
        setEnvSupport('supported');
        const authed = await window.aistudio.hasSelectedApiKey();
        setIsAuthorized(authed);
        window.clearInterval(checkInterval);
      } else if (attempts > 10) {
        setEnvSupport('unsupported');
        window.clearInterval(checkInterval);
      }
    };

    checkInterval = window.setInterval(performCheck, 500);
    performCheck();

    return () => window.clearInterval(checkInterval);
  }, []);

  const handleAuth = () => {
    console.log("Initiating Secure Handshake Protocol...");
    
    if (envSupport === 'unsupported') {
      setError("Handshake bridge missing. You are likely viewing this app outside of the Google AI Studio 'App' frame. Please open the app via the AI Studio interface to link your key.");
      return;
    }

    try {
      if (window.aistudio?.openSelectKey) {
        // Trigger the Google-managed project selection UI
        window.aistudio.openSelectKey();
        
        // Immediate follow-through as per race condition rules
        setIsAuthorized(true);
        setShowAuthModal(false);
        setError(null);
      } else {
        throw new Error("Bridge function not available.");
      }
    } catch (err) {
      console.error("Auth Handshake failed:", err);
      setError("The project selection popup was blocked. Please disable your browser's popup blocker for this site and try again.");
    }
  };

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!species.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const data = await performMycoAnalysis(species, focusArea);
      setResult(data);
    } catch (err: any) {
      if (err.message?.includes("Requested entity was not found") || err.message === "MISSING_KEY") {
        setIsAuthorized(false);
        setShowAuthModal(true);
        setError("Your Google project selection has expired or is invalid. Please re-link your project.");
      } else {
        setError(err.message || "An unexpected error occurred during genomic analysis.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleExportDossier = () => {
    if (!result) return;
    const blob = new Blob([result.dossier], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `MycoStrain_${result.speciesName.replace(/\s/g, '_')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Researcher Setup Wizard Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 z-[100] bg-slate-900/95 backdrop-blur-xl flex items-center justify-center p-4">
          <div className="bg-white rounded-[3rem] p-8 md:p-12 max-w-2xl w-full shadow-[0_0_100px_rgba(0,0,0,0.5)] animate-in zoom-in-95 border border-slate-200 overflow-y-auto max-h-[90vh] custom-scrollbar">
            
            <header className="mb-10 text-center">
              <div className="bg-indigo-600 w-16 h-16 rounded-2xl text-white shadow-xl flex items-center justify-center mx-auto mb-6">
                <Shield size={32} />
              </div>
              <h3 className="text-3xl font-black text-slate-900 tracking-tight">Researcher Setup Wizard</h3>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-2">
                Secure Handshake Protocol
              </p>
            </header>

            <div className="space-y-4 mb-10">
              {envSupport === 'unsupported' && (
                <div className="bg-amber-50 border border-amber-200 p-6 rounded-3xl flex gap-4 mb-6">
                  <AlertCircle className="text-amber-600 shrink-0" size={24} />
                  <div>
                    <h4 className="text-[11px] font-black text-amber-900 uppercase tracking-widest mb-1">External Access Detected</h4>
                    <p className="text-[12px] text-amber-800 leading-relaxed">
                      You are viewing the app on a direct URL (e.g. Vercel). To use the <b>Project Linker</b>, you must access this app through your <b>Google AI Studio</b> dashboard.
                    </p>
                  </div>
                </div>
              )}

              {/* Step 1 */}
              <div className="group bg-slate-50 border border-slate-200 p-6 rounded-3xl transition-all hover:bg-white hover:shadow-md">
                <div className="flex items-start gap-4">
                  <div className="bg-indigo-100 text-indigo-600 w-8 h-8 rounded-full flex items-center justify-center font-black shrink-0">1</div>
                  <div className="flex-1">
                    <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight mb-1">Google Cloud Account</h4>
                    <p className="text-[13px] text-slate-500 leading-relaxed mb-3">
                      The researcher must have a Google account with an active Cloud Project.
                    </p>
                    <a href="https://console.cloud.google.com/" target="_blank" className="inline-flex items-center gap-2 text-[11px] font-black text-indigo-600 hover:gap-3 transition-all">
                      GO TO CLOUD CONSOLE <ExternalLink size={12} />
                    </a>
                  </div>
                </div>
              </div>

              {/* Step 2 */}
              <div className="group bg-slate-50 border border-slate-200 p-6 rounded-3xl transition-all hover:bg-white hover:shadow-md">
                <div className="flex items-start gap-4">
                  <div className="bg-indigo-100 text-indigo-600 w-8 h-8 rounded-full flex items-center justify-center font-black shrink-0">2</div>
                  <div className="flex-1">
                    <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight mb-1">Billing Verification</h4>
                    <p className="text-[13px] text-slate-500 leading-relaxed mb-3">
                      <b>Crucial:</b> Google will only display projects in the selection window if they have a <b>Paid Billing Account</b> attached.
                    </p>
                    <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" className="inline-flex items-center gap-2 text-[11px] font-black text-indigo-600 hover:gap-3 transition-all">
                      CHECK BILLING STATUS <ExternalLink size={12} />
                    </a>
                  </div>
                </div>
              </div>

              {/* Step 3 */}
              <div className="bg-indigo-600 text-white p-6 rounded-3xl shadow-xl shadow-indigo-200 relative overflow-hidden group">
                <Sparkles className="absolute top-0 right-0 text-white/10 -mt-4 -mr-4" size={80} />
                <div className="flex items-start gap-4 relative z-10">
                  <div className="bg-white/20 text-white w-8 h-8 rounded-full flex items-center justify-center font-black shrink-0">3</div>
                  <div className="flex-1">
                    <h4 className="text-sm font-black uppercase tracking-tight mb-1">Final Handshake</h4>
                    <p className="text-[13px] text-indigo-100 leading-relaxed mb-5">
                      Click below to open the Google Selection Window. Ensure <b>popups are allowed</b> in your browser.
                    </p>
                    
                    <button 
                      onClick={handleAuth} 
                      disabled={envSupport !== 'supported'}
                      className={`w-full py-4 rounded-2xl font-black flex items-center justify-center gap-3 transition-all ${
                        envSupport !== 'supported' 
                        ? 'bg-indigo-500/50 text-indigo-200 cursor-not-allowed' 
                        : 'bg-white text-indigo-600 hover:bg-slate-50 shadow-lg active:scale-95'
                      }`}
                    >
                      {envSupport === 'checking' ? <RefreshCw className="animate-spin" /> : <Zap size={20} />}
                      {envSupport === 'unsupported' ? 'INCOMPATIBLE ENVIRONMENT' : 'LINK GOOGLE PROJECT'}
                    </button>
                    
                    <div className="mt-4 p-3 bg-red-500/20 border border-red-400/30 rounded-xl flex items-center gap-2">
                      <AlertTriangle size={14} className="text-white shrink-0" />
                      <p className="text-[10px] font-bold text-white uppercase tracking-tight">
                        Warning: Popups must be enabled.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-6">
              <div className="flex items-center justify-between mb-6 px-2">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${envSupport === 'supported' ? 'bg-green-500 animate-pulse' : 'bg-slate-300'}`}></div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Connection: {envSupport === 'supported' ? 'Active Bridge' : envSupport === 'checking' ? 'Connecting...' : 'Standalone Mode'}
                  </span>
                </div>
                <button 
                  onClick={() => setShowTroubleshooting(!showTroubleshooting)}
                  className="flex items-center gap-1 text-[10px] font-black text-indigo-600 hover:text-indigo-800 uppercase tracking-widest"
                >
                  Troubleshooting <ChevronDown size={12} className={showTroubleshooting ? 'rotate-180' : ''} />
                </button>
              </div>
              
              {showTroubleshooting && (
                <div className="bg-slate-50 rounded-2xl p-5 text-[12px] text-slate-600 space-y-4 animate-in fade-in slide-in-from-top-2 mb-6 border border-slate-100">
                  <p><strong>"The selection window is empty?"</strong> This happens if you have no Google Cloud projects with billing. Go to the Cloud Console and create a project with a billing account attached.</p>
                  <p><strong>"Button does nothing?"</strong> Look for a small red 'blocked' icon in your browser's address bar. Click it and select "Always allow popups".</p>
                  <p><strong>"Still can't proceed?"</strong> Ensure you are using a modern browser like Chrome or Edge. Brave's aggressive shields may block this handshake.</p>
                </div>
              )}

              <button 
                onClick={() => setShowAuthModal(false)} 
                className="w-full text-center text-[10px] font-black text-slate-300 hover:text-slate-400 uppercase tracking-widest transition-colors"
              >
                DISMISS WIZARD
              </button>
            </div>
          </div>
        </div>
      )}

      <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2.5 rounded-xl text-white shadow-lg"><Dna size={24} /></div>
            <div>
              <h1 className="text-xl font-black text-slate-900 tracking-tight leading-none">MycoStrain <span className="text-indigo-600">Explorer</span></h1>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">Bioinformatics Platform</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {isAuthorized ? (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-100 rounded-full text-[10px] font-black text-green-700 uppercase tracking-widest">
                  <ShieldCheck size={14} /> Session Verified
                </div>
                <button 
                  onClick={() => setShowAuthModal(true)} 
                  className="text-[10px] font-black text-slate-400 hover:text-indigo-600 transition-colors uppercase tracking-widest"
                >
                  Change Project
                </button>
              </div>
            ) : (
              <button 
                onClick={() => setShowAuthModal(true)} 
                className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
              >
                <HelpCircle size={14} /> Setup Researcher Access
              </button>
            )}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-10 flex-grow w-full">
        <section className="mb-12 text-center max-w-4xl mx-auto">
          <h2 className="text-5xl font-black text-slate-900 mb-4 tracking-tighter">Genomic Haplotype Modeling</h2>
          <p className="text-slate-500 text-lg font-medium leading-relaxed mb-10">Intraspecific genetic diversity & distribution analyzer.</p>
          
          <div className="bg-white p-4 rounded-[2.5rem] shadow-2xl border border-slate-200/60 ring-8 ring-slate-100/50">
            <form onSubmit={handleSearch} className="flex flex-col lg:flex-row gap-4">
              <div className="relative flex-[1.5]">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={22} />
                <input 
                  type="text" 
                  value={species} 
                  onChange={(e) => setSpecies(e.target.value)} 
                  placeholder="Enter Scientific Name (e.g. Pleurotus ostreatus)" 
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
                className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 text-white px-10 py-6 rounded-3xl font-black shadow-lg transition-all flex items-center justify-center gap-3"
              >
                {loading ? <Loader2 className="animate-spin" size={24} /> : 'ANALYZE'}
              </button>
            </form>
          </div>
        </section>

        {error && (
          <div className="max-w-2xl mx-auto mb-10 bg-red-50 border border-red-200 p-8 rounded-[2rem] text-red-700 flex items-start gap-4">
            <div className="bg-red-100 p-2 rounded-lg shrink-0"><AlertTriangle size={20} /></div>
            <div>
              <h4 className="font-black text-sm uppercase tracking-tight mb-1">Access Error</h4>
              <p className="text-sm font-medium leading-relaxed">{error}</p>
              {!isAuthorized && (
                <button onClick={() => setShowAuthModal(true)} className="mt-4 text-[10px] font-black uppercase underline tracking-widest text-red-800 hover:text-red-950">
                  Fix Connectivity in Wizard
                </button>
              )}
            </div>
          </div>
        )}

        {loading && (
          <div className="py-32 text-center">
            <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
            <h3 className="text-xl font-black text-slate-800 tracking-tight tracking-tighter">Sequence Alignment in Progress...</h3>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-2">Connecting to Global Genomic Repositories</p>
          </div>
        )}

        {result && !loading && (
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { label: "Regional Est.", val: result.estimatedTotalHaplotypes, icon: Target, color: "text-slate-900" },
                { label: "Global Est.", val: result.estimatedGlobalHaplotypes, icon: Globe, color: "text-indigo-600" },
                { label: "Drift (π)", val: result.nucleotideDiversity.toFixed(4), icon: Scale, color: "text-slate-900" },
                { label: "Mode", val: "Research", icon: Sparkles, color: "text-amber-500" }
              ].map((stat, i) => (
                <div key={i} className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col justify-between">
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
                <div className="bg-white p-12 rounded-[3rem] border border-slate-200 relative overflow-hidden shadow-sm">
                  <div className="flex items-center gap-4 mb-8 pb-6 border-b border-slate-100">
                    <div className="bg-indigo-50 p-3 rounded-2xl text-indigo-600"><FileText size={24} /></div>
                    <h3 className="text-2xl font-black uppercase tracking-tight text-slate-900">Genomic Dossier</h3>
                  </div>
                  <div className="prose prose-slate max-w-none text-slate-700 leading-relaxed whitespace-pre-wrap font-medium">
                    {result.dossier}
                  </div>
                </div>
              </div>
              
              <div className="space-y-8">
                <div className="bg-slate-900 p-10 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden">
                  <Activity className="absolute bottom-0 right-0 text-white/5 -mb-6 -mr-6" size={160} />
                  <h3 className="font-black text-2xl mb-2 tracking-tight">Export Findings</h3>
                  <button onClick={handleExportDossier} className="w-full bg-indigo-600 hover:bg-indigo-500 py-5 rounded-2xl font-black flex items-center justify-center gap-3 transition-all">
                    <Download size={22} /> DOWNLOAD TXT
                  </button>
                </div>

                <div className="bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-sm">
                  <h4 className="font-black text-[10px] uppercase tracking-widest text-slate-400 mb-8 flex items-center gap-2">
                    <Link size={14} className="text-indigo-400" /> Evidence Grounding
                  </h4>
                  <div className="space-y-5">
                    {result.sources.length > 0 ? result.sources.map((s, i) => (
                      <a key={i} href={s.uri} target="_blank" rel="noopener noreferrer" className="group block p-5 rounded-2xl bg-slate-50 hover:bg-indigo-50 border border-slate-100 transition-all">
                        <p className="font-black text-slate-800 text-sm mb-1 group-hover:text-indigo-700 line-clamp-1">{s.title}</p>
                        <p className="text-slate-400 group-hover:text-indigo-400 truncate font-mono text-[10px] flex items-center gap-1.5">
                          <Globe size={10} /> {new URL(s.uri).hostname}
                        </p>
                      </a>
                    )) : (
                      <p className="text-xs text-slate-400 italic">Citations pending...</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
      
      <footer className="bg-white border-t border-slate-200 py-12 mt-20">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Mycological Genomics Protocol v2.1</p>
        </div>
      </footer>
    </div>
  );
}
