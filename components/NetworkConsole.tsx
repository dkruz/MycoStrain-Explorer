
import React from 'react';
import { Wifi, Activity, Globe, Shield, Terminal, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

export type ResourceStatus = 'idle' | 'pending' | 'success' | 'blocked';

interface Resource {
  id: string;
  name: string;
  url: string;
  status: ResourceStatus;
  category: 'API' | 'Data' | 'CDN';
}

interface NetworkConsoleProps {
  resources: Resource[];
  isOpen: boolean;
  onClose: () => void;
}

export const NetworkConsole: React.FC<NetworkConsoleProps> = ({ resources, isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-80 bg-slate-900 border-l border-slate-800 shadow-2xl z-[60] flex flex-col animate-in slide-in-from-right duration-300">
      <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-950">
        <div className="flex items-center gap-3">
          <Terminal size={18} className="text-indigo-400" />
          <h3 className="text-xs font-black text-white uppercase tracking-widest">Resource Ledger</h3>
        </div>
        <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
          <Activity size={18} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        <div className="p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl mb-6">
          <p className="text-[10px] font-black text-indigo-300 uppercase tracking-widest mb-1">Live Connection Pulse</p>
          <div className="flex items-center gap-2">
            <div className="flex gap-1 h-3 items-end">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="w-1 bg-indigo-500 animate-pulse" style={{ height: `${Math.random() * 100}%`, animationDelay: `${i * 0.1}s` }} />
              ))}
            </div>
            <span className="text-[9px] font-mono text-indigo-400">Monitoring Port 443...</span>
          </div>
        </div>

        {resources.map((res) => (
          <div key={res.id} className="p-4 bg-slate-800/50 rounded-2xl border border-slate-700/50 hover:bg-slate-800 transition-colors group">
            <div className="flex items-center justify-between mb-3">
              <span className={`text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-tighter ${
                res.category === 'API' ? 'bg-indigo-500/20 text-indigo-400' :
                res.category === 'Data' ? 'bg-emerald-500/20 text-emerald-400' :
                'bg-slate-500/20 text-slate-400'
              }`}>
                {res.category}
              </span>
              {res.status === 'pending' && <Loader2 size={12} className="text-indigo-400 animate-spin" />}
              {res.status === 'success' && <CheckCircle2 size={12} className="text-emerald-500" />}
              {res.status === 'blocked' && <AlertCircle size={12} className="text-amber-500" />}
            </div>
            
            <h4 className="text-[11px] font-black text-slate-200 mb-1">{res.name}</h4>
            <p className="text-[9px] font-mono text-slate-500 truncate group-hover:text-slate-400 transition-colors">{res.url}</p>
            
            <div className="mt-3 flex items-center gap-2">
              <div className={`w-1.5 h-1.5 rounded-full ${
                res.status === 'success' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' :
                res.status === 'pending' ? 'bg-indigo-500 animate-pulse' :
                res.status === 'blocked' ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]' :
                'bg-slate-700'
              }`} />
              <span className="text-[9px] font-black uppercase text-slate-500 tracking-widest">
                {res.status === 'idle' ? 'Ready' :
                 res.status === 'pending' ? 'Handshaking...' :
                 res.status === 'success' ? 'Connected' : 'Blocked / Fail'}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="p-6 bg-slate-950 border-t border-slate-800">
        <div className="flex items-center gap-3 text-amber-500/80 mb-3">
          <Shield size={14} />
          <p className="text-[9px] font-black uppercase tracking-widest">Security Advisory</p>
        </div>
        <p className="text-[10px] text-slate-500 leading-relaxed font-medium">
          If a resource appears <span className="text-amber-500">Blocked</span>, check your VPN tunnel or local browser firewall permissions for the specified domain.
        </p>
      </div>
    </div>
  );
};
