
import React, { useState } from 'react';
import { StrategyReport } from '../types';
import { 
  Maximize, 
  BrainCircuit, 
  ChevronUp, 
  ChevronDown, 
  Users, 
  Palette, 
  ShieldAlert, 
  Monitor 
} from 'lucide-react';
import { KodraIcon } from './KodraIcon';

interface StrategyContextBarProps {
  strategy: StrategyReport;
}

export const StrategyContextBar: React.FC<StrategyContextBarProps> = ({ strategy }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    
    return (
        <aside className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-lg border-b border-slate-200 dark:border-slate-800 mb-6 -mx-8 px-8 py-3 shadow-sm sticky top-0 z-30 transition-all duration-300">
            <div className="max-w-6xl mx-auto">
                <div 
                    className="flex items-center justify-between cursor-pointer group select-none" 
                    onClick={() => setIsExpanded(!isExpanded)}
                    role="button"
                    aria-expanded={isExpanded}
                    tabIndex={0}
                >
                    <div className="flex items-center gap-3">
                        <div className={`p-1.5 rounded-lg transition-colors shadow-sm ${strategy.sourceMode === 'image' ? 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400' : 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'}`}>
                            {strategy.sourceMode === 'image' ? <KodraIcon icon={Maximize} size={16} /> : <KodraIcon icon={BrainCircuit} size={16} />}
                        </div>
                        <div>
                            <h4 className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-0.5">سياق الاستراتيجية</h4>
                            <p className="text-sm font-bold text-slate-800 dark:text-white truncate max-w-xs md:max-w-md group-hover:text-amber-500 transition-colors">
                                {strategy.coreMessage}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="hidden md:flex items-center gap-3 text-xs font-medium text-slate-500 dark:text-slate-400">
                             <span className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded-md">
                                <KodraIcon icon={Users} size={12}/> 
                                {strategy.targetAudience?.split(',')[0]}
                             </span>
                             <span className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded-md">
                                <KodraIcon icon={Monitor} size={12}/> 
                                {strategy.targetPlatform}
                             </span>
                        </div>
                        <div className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                             {isExpanded ? <KodraIcon icon={ChevronUp} size={16} className="text-slate-400" /> : <KodraIcon icon={ChevronDown} size={16} className="text-slate-400" />}
                        </div>
                    </div>
                </div>
                {isExpanded && (
                    <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 md:grid-cols-3 gap-6 animate-slide-up">
                         <div className="space-y-2">
                             <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1.5 tracking-wider"><KodraIcon icon={Users} size={12}/> الجمهور المستهدف</span>
                             <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border dark:border-slate-800">{strategy.targetAudience}</p>
                         </div>
                         <div className="space-y-2">
                             <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1.5 tracking-wider"><KodraIcon icon={Palette} size={12}/> السيكولوجية اللونية</span>
                             <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border dark:border-slate-800">{strategy.colorPsychology}</p>
                         </div>
                         <div className="space-y-2">
                             <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1.5 tracking-wider"><KodraIcon icon={ShieldAlert} size={12}/> القيود والمحاذير</span>
                             <div className="flex flex-wrap gap-1.5 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border dark:border-slate-800 min-h-[60px] content-start">
                                 {strategy.hardConstraints?.length > 0 ? strategy.hardConstraints.map((c, i) => (
                                     <span key={i} className="text-[10px] font-bold bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-2 py-1 rounded border border-red-100 dark:border-red-900/50">{c}</span>
                                 )) : <span className="text-[10px] text-slate-400 italic">لا توجد قيود صارمة مسجلة.</span>}
                             </div>
                         </div>
                    </div>
                )}
            </div>
        </aside>
    );
};
