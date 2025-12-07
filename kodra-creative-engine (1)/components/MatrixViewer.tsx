
import React from 'react';
import { PromptJson } from '../types';
import { 
  Zap, 
  Camera, 
  Sun, 
  Layers, 
  Palette, 
  Type, 
  Monitor, 
  User, 
  Box, 
  MapPin,
  LucideIcon 
} from 'lucide-react';
import { KodraIcon } from './KodraIcon';

interface MatrixViewerProps {
  json: PromptJson;
}

const MatrixCard: React.FC<{ title: string; icon: LucideIcon; content: string | string[]; color: string }> = ({ title, icon, content, color }) => (
  <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4 border border-slate-100 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-colors group">
    <div className={`text-[10px] font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5 ${color}`}>
        <KodraIcon icon={icon} size={12}/> {title}
    </div>
    <div className="text-sm font-medium text-slate-700 dark:text-slate-300 leading-relaxed">
      {Array.isArray(content) ? (
        <div className="flex flex-wrap gap-1">
          {content.map((c, i) => (
            <span key={i} className="bg-white dark:bg-slate-800 px-2 py-1 rounded-md text-xs border border-slate-200 dark:border-slate-700">{c}</span>
          ))}
        </div>
      ) : (
        content
      )}
    </div>
  </div>
);

export const MatrixViewer: React.FC<MatrixViewerProps> = ({ json }) => {
  return (
    <div className="space-y-6 animate-fade-in" dir="rtl">
      
      {/* 1. Hero Subject */}
      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-2xl p-6 border border-indigo-100 dark:border-indigo-800/50">
         <div className="flex items-start gap-4">
            <div className="bg-indigo-100 dark:bg-indigo-900/50 p-3 rounded-xl text-indigo-600 dark:text-indigo-400">
                <KodraIcon icon={User} size={24}/>
            </div>
            <div>
                <h4 className="text-xs font-bold text-indigo-500 uppercase tracking-wider mb-1">العنصر الأساسي (Subject)</h4>
                <h3 className="text-lg font-black text-slate-800 dark:text-white mb-2">{json.subject.type}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                    {json.subject.description}
                </p>
                <div className="flex flex-wrap gap-2 mt-3">
                    <span className="text-[10px] bg-white/50 dark:bg-black/20 px-2 py-1 rounded flex items-center gap-1"><KodraIcon icon={Box} size={10}/> {json.subject.pose}</span>
                    <span className="text-[10px] bg-white/50 dark:bg-black/20 px-2 py-1 rounded flex items-center gap-1"><KodraIcon icon={MapPin} size={10}/> {json.subject.position}</span>
                </div>
            </div>
         </div>
      </div>

      {/* 2. The Matrix Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <MatrixCard 
            title="الإضاءة (Lighting)" 
            icon={Sun} 
            content={json.lighting} 
            color="text-amber-500"
          />
          <MatrixCard 
            title="الكاميرا (Camera)" 
            icon={Camera} 
            content={json.camera} 
            color="text-blue-500"
          />
          <MatrixCard 
            title="التكوين (Composition)" 
            icon={Layers} 
            content={json.composition} 
            color="text-purple-500"
          />
          <MatrixCard 
            title="البيئة (Environment)" 
            icon={Monitor} 
            content={json.environment} 
            color="text-emerald-500"
          />
          <MatrixCard 
            title="النمط (Style)" 
            icon={Palette} 
            content={json.style} 
            color="text-pink-500"
          />
          <MatrixCard 
            title="الحالة (Mood)" 
            icon={Zap} 
            content={json.mood} 
            color="text-orange-500"
          />
      </div>

      {/* 3. Tech Specs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-slate-900 text-slate-300 p-4 rounded-xl font-mono text-xs border border-slate-800">
              <div className="flex items-center gap-2 mb-2 text-slate-500 font-bold uppercase"><KodraIcon icon={Monitor} size={12}/> Technical Details</div>
              {json.technical_details}
          </div>
          {json.typography && (
              <div className="bg-amber-50 dark:bg-amber-900/10 p-4 rounded-xl border border-amber-100 dark:border-amber-800/50">
                  <div className="flex items-center gap-2 mb-2 text-amber-600 dark:text-amber-500 font-bold uppercase text-[10px]"><KodraIcon icon={Type} size={12}/> Typography Protocol</div>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{json.typography}</p>
              </div>
          )}
      </div>

    </div>
  );
};
