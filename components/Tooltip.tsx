
import React, { ReactNode } from 'react';

interface TooltipProps {
  children: ReactNode;
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export const Tooltip: React.FC<TooltipProps> = ({ children, content, position = 'top' }) => {
  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  return (
    <div className="group relative inline-block">
      {children}
      <div className={`absolute ${positionClasses[position]} z-[110] px-3 py-2 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-lg opacity-0 group-hover:opacity-100 transition-all pointer-events-none shadow-2xl whitespace-nowrap border border-white/10`}>
        {content}
        {/* Arrow */}
        <div className={`absolute w-2 h-2 bg-slate-900 rotate-45 border-slate-900 ${
          position === 'top' ? 'bottom-[-4px] left-1/2 -translate-x-1/2 border-r border-b border-white/10' :
          position === 'bottom' ? 'top-[-4px] left-1/2 -translate-x-1/2 border-l border-t border-white/10' :
          position === 'left' ? 'right-[-4px] top-1/2 -translate-y-1/2 border-r border-t border-white/10' :
          'left-[-4px] top-1/2 -translate-y-1/2 border-l border-b border-white/10'
        }`} />
      </div>
    </div>
  );
};
