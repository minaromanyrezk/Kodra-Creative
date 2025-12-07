
import React from 'react';
import { Project, Client } from '../types';
import { X, Trash2, History, FolderOpen, User, Users, Briefcase, Folder } from 'lucide-react';
import { KodraIcon } from './KodraIcon';

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  projects: Project[];
  clients: Client[];
  onLoad: (project: Project) => void;
  onDelete: (id: string, e: React.MouseEvent) => void;
  onShowHistory: (project: Project, e: React.MouseEvent) => void;
}

export const ProjectModal: React.FC<ProjectModalProps> = ({ 
  isOpen, 
  onClose, 
  projects, 
  clients,
  onLoad, 
  onDelete, 
  onShowHistory 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl border dark:border-slate-800">
        <div className="p-6 border-b dark:border-slate-800 flex justify-between items-center">
          <h3 className="text-xl font-bold dark:text-white flex items-center gap-2">
            <KodraIcon icon={FolderOpen} className="text-amber-500" size={24} /> ملفاتي (Project Catalog)
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white">
            <KodraIcon icon={X} size={20} />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 space-y-3 custom-scrollbar">
          {projects.length === 0 ? (
            <div className="text-center py-16 text-slate-400 flex flex-col items-center gap-4">
              <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center">
                 <KodraIcon icon={FolderOpen} size={40} className="opacity-30" strokeWidth={1} />
              </div>
              <div>
                 <p className="font-bold text-lg">لا توجد مشاريع محفوظة</p>
                 <p className="text-sm opacity-60">ابدأ بإنشاء مشروع جديد وحفظه ليظهر هنا</p>
              </div>
            </div>
          ) : (
            projects.map(p => {
              const client = clients.find(c => c.id === p.clientId);
              return (
                <div 
                  key={p.id} 
                  className="p-4 border dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950/50 hover:border-amber-500 dark:hover:border-amber-500 hover:shadow-md group flex flex-col gap-3 transition-all duration-200"
                >
                  <div 
                    className="flex justify-between items-start cursor-pointer" 
                    onClick={() => onLoad(p)}
                  >
                    <div className="flex flex-col gap-1.5">
                      <div className="dark:text-white font-bold text-lg group-hover:text-amber-500 transition-colors flex items-center gap-2">
                        <KodraIcon icon={Folder} size={18} className="text-slate-400 group-hover:text-amber-500 transition-colors" />
                        {p.name}
                      </div>
                      {client && (
                        <div className="flex items-center gap-2">
                             <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                                <KodraIcon icon={Users} size={10}/> {client.name}
                            </span>
                            {client.industry && (
                                <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                                    <KodraIcon icon={Briefcase} size={10}/> {client.industry}
                                </span>
                            )}
                        </div>
                      )}
                    </div>
                    <span className="text-[10px] font-mono text-slate-500 bg-white dark:bg-slate-900 px-2 py-1 rounded-md border dark:border-slate-800">
                      {new Date(p.date).toLocaleDateString('ar-EG')}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center border-t border-slate-200 dark:border-slate-800 pt-3 mt-1">
                    <div className="text-xs text-slate-400 truncate max-w-[200px] flex items-center gap-1">
                      {p.briefText ? p.briefText.substring(0, 40) + '...' : 'بدون وصف'}
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={(e) => onShowHistory(p, e)} 
                        className="text-blue-500 text-xs font-bold flex items-center gap-1.5 hover:bg-blue-50 dark:hover:bg-blue-900/20 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        <KodraIcon icon={History} size={14}/> النسخ
                      </button>
                      <button 
                        onClick={(e) => onDelete(p.id, e)} 
                        className="text-red-500 text-xs font-bold flex items-center gap-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        <KodraIcon icon={Trash2} size={14}/> حذف
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
