
import React from 'react';
import { Project, ProjectVersion } from '../types';
import { X, History, RotateCcw } from 'lucide-react';
import { KodraIcon } from './KodraIcon';

interface HistoryModalProps {
  project: Project | null;
  onClose: () => void;
  onRestore: (version: ProjectVersion) => void;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({ project, onClose, onRestore }) => {
  if (!project) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-lg max-h-[70vh] flex flex-col shadow-2xl border dark:border-slate-800">
        <div className="p-6 border-b dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900 rounded-t-2xl">
          <h3 className="text-xl font-bold dark:text-white flex items-center gap-2">
            <KodraIcon icon={History} className="text-blue-500" size={24}/> تاريخ التعديلات
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors text-slate-500 dark:text-slate-400">
            <KodraIcon icon={X} size={20} />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 space-y-3 custom-scrollbar">
          {project.versionHistory && project.versionHistory.length > 0 ? (
            project.versionHistory.map((v, i) => (
              <div 
                key={i} 
                className="p-4 border dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 flex justify-between items-center hover:shadow-md hover:border-blue-400 dark:hover:border-blue-600 transition-all group"
              >
                <div>
                  <div className="font-bold dark:text-white text-sm flex items-center gap-2 mb-1">
                    <span className="w-2 h-2 bg-blue-500 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.6)]"></span>
                    {v.note || "نسخة تلقائية"}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                    <KodraIcon icon={History} size={10} />
                    {new Date(v.timestamp).toLocaleString('ar-EG')}
                  </div>
                </div>
                <button 
                  onClick={() => onRestore(v)} 
                  className="bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:border-blue-200 dark:group-hover:border-blue-800 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all"
                >
                  <KodraIcon icon={RotateCcw} size={12} /> استعادة
                </button>
              </div>
            ))
          ) : (
            <div className="text-center py-12 text-slate-400 flex flex-col items-center gap-4">
              <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center">
                 <KodraIcon icon={History} size={32} className="opacity-30" />
              </div>
              <p>لا توجد نسخ سابقة محفوظة لهذا المشروع</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
