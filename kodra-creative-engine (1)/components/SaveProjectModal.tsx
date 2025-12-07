
import React, { useState, useEffect } from 'react';
import { Client, ProjectStatus, StrategyReport, Project } from '../types';
import { Save, X, Folder, User, FileText, Tag, Hash, Activity } from 'lucide-react';
import { KodraIcon } from './KodraIcon';

interface SaveProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string, clientId: string | undefined, status: ProjectStatus, tags: string[]) => void;
  clients: Client[];
  defaultName: string;
  defaultClientId?: string;
  strategy?: StrategyReport | null;
  existingProjects?: Project[];
}

export const SaveProjectModal: React.FC<SaveProjectModalProps> = ({
  isOpen,
  onClose,
  onSave,
  clients,
  defaultName,
  defaultClientId,
  strategy,
  existingProjects
}) => {
  const [name, setName] = useState(defaultName);
  const [selectedClient, setSelectedClient] = useState<string>(defaultClientId || '');
  const [status, setStatus] = useState<ProjectStatus>(ProjectStatus.DRAFT);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setName(defaultName);
      setSelectedClient(defaultClientId || '');
      setStatus(ProjectStatus.DRAFT);
      
      // Smart Tagging Initialization
      const newTags: string[] = [];
      if (strategy) {
          if (strategy.targetPlatform) newTags.push(strategy.targetPlatform);
          if (strategy.assetClass) newTags.push(strategy.assetClass.split('(')[0].trim());
      }
      setTags(newTags);
    }
  }, [isOpen, defaultName, defaultClientId, strategy]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (!name.trim()) return;
    onSave(name, selectedClient || undefined, status, tags);
    onClose();
  };

  const addTag = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && tagInput.trim()) {
          e.preventDefault();
          if (!tags.includes(tagInput.trim())) {
              setTags([...tags, tagInput.trim()]);
          }
          setTagInput('');
      }
  };

  const removeTag = (tagToRemove: string) => {
      setTags(tags.filter(t => t !== tagToRemove));
  };

  const statusColors = {
      [ProjectStatus.DRAFT]: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
      [ProjectStatus.IN_PROGRESS]: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
      [ProjectStatus.IN_REVIEW]: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
      [ProjectStatus.APPROVED]: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
      [ProjectStatus.COMPLETED]: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400',
      [ProjectStatus.ARCHIVED]: 'bg-slate-200 text-slate-500 dark:bg-slate-700 dark:text-slate-400',
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-lg p-6 shadow-2xl border dark:border-slate-800 transform transition-all scale-100 max-h-[90vh] overflow-y-auto custom-scrollbar">
        
        <div className="flex justify-between items-center mb-6 border-b border-slate-100 dark:border-slate-800 pb-4">
          <h3 className="text-xl font-bold dark:text-white flex items-center gap-2">
            <KodraIcon icon={Save} className="text-amber-500" size={24} />
            حفظ المشروع
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
            <KodraIcon icon={X} size={20} />
          </button>
        </div>

        <div className="space-y-6">
          
          {/* Project Name Input */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <KodraIcon icon={FileText} size={14} /> اسم المشروع
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 dark:text-white outline-none focus:ring-2 ring-amber-500 transition-all font-bold text-sm"
              placeholder="أدخل اسم المشروع..."
              autoFocus
            />
          </div>

          {/* Client Selector */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <KodraIcon icon={User} size={14} /> العميل (اختياري)
            </label>
            <div className="relative">
              <select
                value={selectedClient}
                onChange={(e) => setSelectedClient(e.target.value)}
                className="w-full p-3.5 pl-4 pr-10 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 dark:text-white outline-none focus:ring-2 ring-amber-500 appearance-none text-sm cursor-pointer"
              >
                <option value="">-- بدون عميل (مشروع عام) --</option>
                {clients.map(client => (
                  <option key={client.id} value={client.id}>
                    {client.name} {client.industry ? `(${client.industry})` : ''}
                  </option>
                ))}
              </select>
              <div className="absolute top-3.5 left-3 pointer-events-none text-slate-400">
                <KodraIcon icon={Folder} size={16} />
              </div>
            </div>
          </div>

          {/* Status Selector */}
          <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <KodraIcon icon={Activity} size={14}/> حالة المشروع
              </label>
              <div className="grid grid-cols-3 gap-2">
                  {Object.values(ProjectStatus).map((s) => (
                      <button
                        key={s}
                        onClick={() => setStatus(s)}
                        className={`text-[10px] font-bold py-2 px-2 rounded-lg border transition-all ${
                            status === s 
                            ? 'border-amber-500 ring-1 ring-amber-500 ' + statusColors[s] 
                            : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
                        }`}
                      >
                          {s}
                      </button>
                  ))}
              </div>
          </div>

          {/* Tags Input */}
          <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <KodraIcon icon={Tag} size={14}/> الكلمات المفتاحية (Tags)
              </label>
              <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 flex flex-wrap gap-2 focus-within:ring-2 ring-amber-500 transition-all min-h-[52px]">
                  {tags.map((tag, idx) => (
                      <span key={idx} className="bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold px-2 py-1 rounded-md border border-slate-200 dark:border-slate-600 flex items-center gap-1 animate-fade-in">
                          <KodraIcon icon={Hash} size={10} className="text-amber-500"/>
                          {tag}
                          <button onClick={() => removeTag(tag)} className="hover:text-red-500 transition-colors"><KodraIcon icon={X} size={12}/></button>
                      </span>
                  ))}
                  <input 
                    type="text" 
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={addTag}
                    className="bg-transparent outline-none flex-1 min-w-[120px] text-sm dark:text-white placeholder:text-slate-400"
                    placeholder="اكتب واضغط Enter..."
                  />
              </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button 
              onClick={onClose} 
              className="flex-1 py-3 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors font-bold text-sm"
            >
              إلغاء
            </button>
            <button 
              onClick={handleSave} 
              disabled={!name.trim()}
              className="flex-1 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-xl font-bold hover:shadow-lg hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2 text-sm"
            >
              <KodraIcon icon={Save} size={18} /> حفظ التغييرات
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};