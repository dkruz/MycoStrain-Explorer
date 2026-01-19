
import React, { useState, useMemo } from 'react';
import { performMycoAnalysis } from './services/geminiService';
import { AnalysisResult } from './types';
import { StrainMap } from './components/StrainMap';
import { NetworkGraph } from './components/NetworkGraph';
import { 
  Dna, Search, Loader2, AlertCircle, Download, Target, Globe, FileText, Link, Scale, Activity, ChevronDown, ChevronUp, BookOpen, MousePointer2, GitBranch, FlaskConical, Sparkles, Key, ShieldCheck, ExternalLink
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
        setError("Analysis failed. Check your API connection or species name.");
      }
    } finally {
      setLoading(false);
    }
  };

  const saveKey = () => {
    if (tempKey.trim()) {
      sessionStorage.setItem('MYCO_EXPLORER_KEY', tempKey.trim());
      setShowKeyModal(false);
      handleSearch();
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
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {showKeyModal && (
        <div className="fixed inset-0 z-[100] bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl animate-in zoom-in-95 border border-slate-200">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-indigo-100 p-3 rounded-2xl text-indigo-600"><Key size={24} /></div>
              <h3 className="text-xl font-black text-slate-900">Session Access</h3>
            </div>
            <p className="text-slate-600 text-sm mb-6 leading-relaxed">
              Environment variables are restricted in browser-direct deployments. Please provide your <strong>Gemini API Key</strong> for this session.
            </p>
            <input 
              type="password"
              placeholder="Paste Key here..."
              className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl mb-4 focus:ring-2 focus:ring-indigo-500 outline-none font-mono text-sm"
              value={tempKey}
              onChange={(e) => setTempKey(e.target.value)}
            />
            <button onClick={saveKey} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-2xl font-black flex items-center justify-center gap-2 shadow-lg mb-4">
              <ShieldCheck size={20} /> AUTHORIZE
            </button>
            <a href="https://aistudio.google.com/app/apikey" target="_blank" className="text-center text-[10px] font-black text-slate-400 hover:text-indigo-600 flex items-center justify-center gap-1 uppercase tracking-widest">
              Get Free Key <ExternalLink size={10} />
            </a>
          </div>
        </div>
      )}

      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-2 rounded-lg text-white shadow-lg"><Dna size={24} /></div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">MycoStrain <span className="text-indigo-600">Explorer</span></h1>
          </div>
          <button onClick={() => setShowKeyModal(true)} className="p-2 text-slate-400 hover:text-indigo-600"><Key size={18} /></button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8 flex-grow">
        <section className="mb-8 text-center max-w-5xl mx-auto">
          <h2 className="text-4xl font-black text-slate-900 mb-2 tracking-tight">Fungal Genomic Extrapolation</h2>
          <div className="max-w-4xl mx-auto mb-10 mt-8">
            <form onSubmit={(e) => handleSearch(e)} className="flex flex-col lg:flex-row gap-3 bg-white p-3 rounded-[2rem] shadow-2xl border border-slate-200">
              <div className="relative flex-1">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input type="text" value={species} onChange={(e) => setSpecies(e.target.value)} placeholder="e.g. Trametes versicolor" className="w-full pl-14 pr-4 py-5 rounded-2xl bg-slate-50 outline-none font-semibold" />
              </div>
              <select value={focusArea} onChange={(e) => setFocusArea(e.target.value)} className="lg:w-64 pl-6 pr-12 py-5 rounded-2xl bg-slate-50 outline-none font-bold appearance-none">
                {FOCUS_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
              <button disabled={loading} className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-5 rounded-2xl font-black shadow-lg">
                {loading ? <Loader2 className="animate-spin" size={20} /> : 'ANALYZE'}
              </button>
            </form>
          </div>
        </section>

        {error && <div className="max-w-md mx-auto mb-8 bg-red-50 border border-red-100 p-4 rounded-2xl text-red-700 font-bold flex items-center gap-3"><AlertCircle /> {error}</div>}

        {loading && <div className="py-24 text-center"><div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div><p className="font-black text-slate-800">Synthesizing Genomic Records...</p></div>}

        {result && !loading && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white p-6 rounded-2xl border border-slate-200"><p className="text-[10px] text-slate-400 font-black uppercase mb-1">Regional Est.</p><p className="text-2xl font-black">{result.estimatedTotalHaplotypes}</p></div>
              <div className="bg-white p-6 rounded-2xl border border-slate-200"><p className="text-[10px] text-slate-400 font-black uppercase mb-1">Global Est.</p><p className="text-2xl font-black text-indigo-600">{result.estimatedGlobalHaplotypes}</p></div>
              <div className="bg-white p-6 rounded-2xl border border-slate-200"><p className="text-[10px] text-slate-400 font-black uppercase mb-1">Drift (π)</p><p className="text-2xl font-black">{result.nucleotideDiversity.toFixed(4)}</p></div>
              <div className="bg-white p-6 rounded-2xl border border-slate-200"><p className="text-[10px] text-slate-400 font-black uppercase mb-1">Status</p><div className="flex items-center gap-2"><div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" /> <span className="text-[10px] font-bold text-green-600">LIVE</span></div></div>
            </div>
            <StrainMap data={result.haplotypes} />
            <NetworkGraph data={result.haplotypes} />
            <div className="bg-white p-8 rounded-3xl border border-slate-200 prose prose-slate max-w-none whitespace-pre-wrap">{result.dossier}</div>
          </div>
        )}
      </main>
    </div>
  );
}
