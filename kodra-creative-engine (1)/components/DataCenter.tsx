
import React, { useState, useEffect, useMemo } from 'react';
import { Project, Client, KodraBackup, UIFontWeight } from '../types';
import { exportToMarkdown, parseBackupFile } from '../services/dataService';
import { 
  Users, Trash2, Plus, Search, Mail, UserRound, Folder, Briefcase, StickyNote, 
  Edit, X, RotateCcw, Sparkles, ExternalLink, Settings, Download, 
  Upload, AlertTriangle, Database, FileText, FileJson, Check, Filter,
  Hash, ImageIcon
} from 'lucide-react';
import { KodraIcon } from './KodraIcon';
import { SkeletonLoader } from './SkeletonLoader';
import { StatusBadge } from './StatusBadge';

interface DataCenterProps {
  projects: Project[];
  setProjects: (projects: Project[]) => void;
  clients: Client[];
  setClients: React.Dispatch<React.SetStateAction<Client[]>>;
  addToast: (msg: string, type: 'success' | 'error' | 'info') => void;
  onLoadProject: (p: Project) => void;
  onCreateProjectForClient: (clientId: string) => void;
  
  // Backup Props
  currentSettings: { theme: 'light' | 'dark', font: UIFontWeight };
  onImportBackup: (data: KodraBackup) => void;

  // Visual Highlight Context
  currentProjectId?: string | null;
}

// Optimized Search Logic (Extracted)
const smartSearch = (text: string | undefined, query: string): boolean => {
    if (!query) return true;
    if (!text) return false;
    
    const t = text.toLowerCase();
    const q = query.toLowerCase();
    
    if (t.includes(q)) return true;

    const tTokens = t.split(/\s+/);
    const qTokens = q.split(/\s+/);

    return qTokens.every(qToken => {
        return tTokens.some(tToken => {
            if (tToken.includes(qToken)) return true;
            if (qToken.length > 1 && qToken === tToken[0]) return false;
            
            if (tToken.length > 3 && qToken.length > 3) {
                let differences = 0;
                const minLen = Math.min(tToken.length, qToken.length);
                for (let i = 0; i < minLen; i++) {
                    if (tToken[i] !== qToken[i]) differences++;
                }
                if (Math.abs(tToken.length - qToken.length) <= 1 && differences <= 1) return true;
            }
            return false;
        });
    });
};

export const DataCenter: React.FC<DataCenterProps> = ({ 
  projects, setProjects, clients, setClients, addToast,
  onLoadProject, onCreateProjectForClient,
  currentSettings, onImportBackup, currentProjectId
}) => {
  const [activeTab, setActiveTab] = useState<'clients' | 'projects' | 'system'>('clients');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Backup State
  const [exportFormat, setExportFormat] = useState<'json' | 'markdown'>('json');
  const [exportScope, setExportScope] = useState<'all' | 'clients' | 'projects'>('all');

  // Client Management State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [clientToDelete, setClientToDelete] = useState<string | null>(null);
  
  // Project Management State (Inline Edit)
  const [projectEditingId, setProjectEditingId] = useState<string | null>(null);
  const [targetClientId, setTargetClientId] = useState<string>('');
  
  // Form State
  const [clientName, setClientName] = useState('');
  const [clientIndustry, setClientIndustry] = useState('');
  const [clientContact, setClientContact] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientNotes, setClientNotes] = useState('');
  const [clientLogo, setClientLogo] = useState<string | undefined>(undefined);
  const [clientWatermark, setClientWatermark] = useState<string | undefined>(undefined);

  // Simulate Data Fetching Effect
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, [activeTab]);

  const filteredClients = useMemo(() => clients.filter(c => 
    smartSearch(c.name, searchTerm) ||
    smartSearch(c.industry, searchTerm) ||
    smartSearch(c.contactPerson, searchTerm)
  ), [clients, searchTerm]);
  
  const filteredProjects = useMemo(() => projects.filter(p => 
    smartSearch(p.name, searchTerm) || 
    smartSearch(p.tags?.join(' '), searchTerm)
  ), [projects, searchTerm]);

  // --- Handlers ---

  const resetForm = () => {
      setClientName('');
      setClientIndustry('');
      setClientContact('');
      setClientEmail('');
      setClientNotes('');
      setClientLogo(undefined);
      setClientWatermark(undefined);
      setEditingId(null);
  };

  const startEditing = (client: Client) => {
      setClientName(client.name);
      setClientIndustry(client.industry || '');
      setClientContact(client.contactPerson || '');
      setClientEmail(client.email || '');
      setClientNotes(client.notes || '');
      setClientLogo(client.logo);
      setClientWatermark(client.watermark);
      setEditingId(client.id);
      window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAssetUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'watermark') => {
      const file = e.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onloadend = () => {
              if (typeof reader.result === 'string') {
                if (type === 'logo') setClientLogo(reader.result);
                else setClientWatermark(reader.result);
              }
          };
          reader.readAsDataURL(file);
      }
  };

  const handleSaveClient = () => {
    if (!clientName.trim()) return;

    if (editingId) {
        setClients(prev => prev.map(c => {
            if (c.id === editingId) {
                return {
                    ...c,
                    name: clientName,
                    industry: clientIndustry,
                    contactPerson: clientContact,
                    email: clientEmail,
                    notes: clientNotes,
                    logo: clientLogo,
                    watermark: clientWatermark
                };
            }
            return c;
        }));
        addToast('تم تحديث بيانات العميل', 'success');
    } else {
        const newClient: Client = {
            id: Date.now().toString(),
            name: clientName,
            industry: clientIndustry,
            contactPerson: clientContact,
            email: clientEmail,
            notes: clientNotes,
            logo: clientLogo,
            watermark: clientWatermark
        };
        setClients(prev => [...prev, newClient]);
        addToast('تم إضافة العميل بنجاح', 'success');
    }
    resetForm();
  };

  const handleDeleteClientClick = (id: string) => {
      setClientToDelete(id);
  };

  const confirmDeleteClient = () => {
    if (clientToDelete) {
      setClients(prev => prev.filter(c => c.id !== clientToDelete));
      if (editingId === clientToDelete) resetForm();
      addToast('تم حذف العميل', 'info');
      setClientToDelete(null);
    }
  };

  const handleDeleteProject = (id: string) => {
     if (confirm('هل أنت متأكد من حذف هذا المشروع؟')) {
      setProjects(projects.filter(p => p.id !== id));
      addToast('تم حذف المشروع', 'info');
    }
  };

  const handleStartEditProject = (p: Project) => {
      setProjectEditingId(p.id);
      setTargetClientId(p.clientId || '');
  };

  const handleCancelEditProject = () => {
      setProjectEditingId(null);
      setTargetClientId('');
  };

  const handleSaveProjectClient = () => {
      if (!projectEditingId) return;
      const updatedProjects = projects.map(p => {
          if (p.id === projectEditingId) {
              return { ...p, clientId: targetClientId || undefined };
          }
          return p;
      });
      setProjects(updatedProjects);
      addToast('تم تحديث ارتباط المشروع', 'success');
      handleCancelEditProject();
  };

  const jumpToClientProjects = (clientName: string) => {
      setSearchTerm(clientName);
      setActiveTab('projects');
      addToast(`عرض مشاريع: ${clientName}`, 'info');
  };

  // --- BACKUP HANDLERS ---
  
  const handleQuickExport = (scope: 'clients' | 'projects') => {
      const backup: KodraBackup = {
          meta: { version: '3.0', timestamp: new Date().toISOString(), exportedBy: 'Quick Export' },
          settings: currentSettings,
          data: {
              clients: scope === 'clients' ? clients : undefined,
              projects: scope === 'projects' ? projects : undefined
          }
      };
      
      const content = JSON.stringify(backup, null, 2);
      const blob = new Blob([content], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `kodra_${scope}_export_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      addToast(`تم تصدير قائمة ${scope === 'clients' ? 'العملاء' : 'المشاريع'}`, "success");
  };

  const handleExportSystem = () => {
      const backup: KodraBackup = {
          meta: {
              version: '3.0',
              timestamp: new Date().toISOString(),
              exportedBy: 'Kodra Admin'
          },
          settings: currentSettings,
          data: {
              clients: (exportScope === 'all' || exportScope === 'clients') ? clients : undefined,
              projects: (exportScope === 'all' || exportScope === 'projects') ? projects : undefined
          }
      };
      
      let content = '';
      let filename = `kodra_backup_${exportScope}_${new Date().toISOString().split('T')[0]}`;
      let mimeType = '';

      if (exportFormat === 'json') {
          content = JSON.stringify(backup, null, 2);
          filename += '.json';
          mimeType = 'application/json';
      } else {
          content = exportToMarkdown(backup);
          filename += '.md';
          mimeType = 'text/markdown';
      }
      
      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      addToast(exportFormat === 'json' ? "تم تصدير ملف JSON" : "تم تصدير تقرير Markdown", "success");
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
          try {
              const content = event.target?.result as string;
              const json = parseBackupFile(content);
              
              if (!json.meta || !json.data) {
                  throw new Error("Invalid backup file format structure");
              }
              
              const hasClients = json.data.clients && json.data.clients.length > 0;
              const hasProjects = json.data.projects && json.data.projects.length > 0;
              
              let msg = "سيتم استعادة: ";
              if (hasClients) msg += `${json.data.clients?.length} عميل `;
              if (hasClients && hasProjects) msg += "و ";
              if (hasProjects) msg += `${json.data.projects?.length} مشروع.`;
              if (!hasClients && !hasProjects) msg = "الملف لا يحتوي على بيانات.";

              if (confirm(`تحذير: استعادة النسخة ستؤدي لاستبدال البيانات الحالية (دمج/تحديث). ${msg} هل أنت متأكد؟`)) {
                  onImportBackup(json);
              }
          } catch (err) {
              addToast("الملف تالف أو غير مدعوم. تأكد من الصيغة.", "error");
          }
      };
      reader.readAsText(file);
      e.target.value = ''; 
  };

  return (
    <div className="space-y-6 animate-fade-in pb-10">
       
       {clientToDelete && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-2xl max-w-sm w-full border dark:border-slate-800 transform transition-all scale-100">
                    <div className="flex items-center gap-3 mb-4 text-red-500">
                        <KodraIcon icon={AlertTriangle} size={32} />
                        <h3 className="text-xl font-bold dark:text-white">تأكيد الحذف</h3>
                    </div>
                    <p className="text-slate-600 dark:text-slate-300 mb-6 text-sm leading-relaxed">
                        هل أنت متأكد من حذف هذا العميل نهائياً؟ <br/>
                        <span className="text-xs text-red-500 font-bold mt-1 block">⚠️ هذا الإجراء لا يمكن التراجع عنه.</span>
                    </p>
                    <div className="flex gap-3">
                        <button
                            onClick={() => setClientToDelete(null)}
                            className="flex-1 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                            إلغاء
                        </button>
                        <button
                            onClick={confirmDeleteClient}
                            className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold shadow-lg shadow-red-500/20 transition-colors"
                        >
                            نعم، حذف
                        </button>
                    </div>
                </div>
            </div>
       )}

       <header className="bg-white dark:bg-slate-900 p-6 rounded-2xl border dark:border-slate-800 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold dark:text-white flex items-center gap-2">
              <span className="bg-blue-500 text-white p-2 rounded-lg"><KodraIcon icon={Users} size={20}/></span>
              قاعدة البيانات المركزية
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">إدارة العملاء وأرشيف المشاريع (CRM)</p>
          </div>
          <div className="flex gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <button onClick={() => setActiveTab('clients')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'clients' ? 'bg-white dark:bg-slate-700 shadow text-blue-600 dark:text-blue-400' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>العملاء ({clients.length})</button>
            <button onClick={() => setActiveTab('projects')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'projects' ? 'bg-white dark:bg-slate-700 shadow text-amber-600 dark:text-amber-400' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>المشاريع ({projects.length})</button>
            <button onClick={() => setActiveTab('system')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-1 ${activeTab === 'system' ? 'bg-white dark:bg-slate-700 shadow text-purple-600 dark:text-purple-400' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>
                <KodraIcon icon={Settings} size={14}/> النظام
            </button>
          </div>
       </header>

       {/* Render rest of the UI (Search, Skeleton, Tables) ... */}
       {activeTab !== 'system' && (
       <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <KodraIcon icon={Search} className="absolute right-4 top-3.5 text-slate-400" size={18} />
            <input 
                type="text" 
                placeholder={activeTab === 'clients' ? "بحث ذكي (الاسم، المجال، الشخص)..." : "بحث ذكي عن مشروع (اسم، تاج)..."}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-4 pr-12 py-3 bg-white dark:bg-slate-900 border dark:border-slate-800 rounded-xl outline-none focus:ring-2 ring-blue-500 dark:text-white transition-all shadow-sm focus:shadow-md"
            />
            {searchTerm && (
                <button 
                    onClick={() => setSearchTerm('')} 
                    className="absolute left-4 top-3.5 text-slate-400 hover:text-slate-600"
                >
                    <KodraIcon icon={X} size={18}/>
                </button>
            )}
          </div>
          <button 
             onClick={() => handleQuickExport(activeTab as 'clients' | 'projects')}
             className="bg-white dark:bg-slate-900 border dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:text-green-600 hover:border-green-500 dark:hover:border-green-500 px-6 py-3 rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 font-bold text-sm"
             title={`تصدير ${activeTab === 'clients' ? 'العملاء' : 'المشاريع'} (JSON)`}
          >
             <KodraIcon icon={Download} size={18}/> تصدير
          </button>
       </div>
       )}

       {isLoading && activeTab !== 'system' && (
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
             <SkeletonLoader type="card" count={3} />
         </div>
       )}

       {!isLoading && activeTab === 'system' && (
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-slide-up">
               <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
                   <div>
                       <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-xl flex items-center justify-center mb-4">
                           <KodraIcon icon={Download} size={24}/>
                       </div>
                       <h3 className="text-lg font-bold dark:text-white mb-2">تصدير قاعدة البيانات (Backup)</h3>
                       <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg mb-6">
                           <button onClick={() => setExportFormat('json')} className={`flex-1 py-1.5 rounded-md text-xs font-bold flex items-center justify-center gap-1 transition-all ${exportFormat === 'json' ? 'bg-white dark:bg-slate-700 shadow text-green-600 dark:text-green-400' : 'text-slate-500'}`}><KodraIcon icon={FileJson} size={14}/> JSON</button>
                           <button onClick={() => setExportFormat('markdown')} className={`flex-1 py-1.5 rounded-md text-xs font-bold flex items-center justify-center gap-1 transition-all ${exportFormat === 'markdown' ? 'bg-white dark:bg-slate-700 shadow text-blue-600 dark:text-blue-400' : 'text-slate-500'}`}><KodraIcon icon={FileText} size={14}/> Markdown</button>
                       </div>
                   </div>
                   <button onClick={handleExportSystem} className={`w-full py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 text-white ${exportFormat === 'json' ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'}`}><KodraIcon icon={Download} size={18}/> {exportFormat === 'json' ? 'تصدير ملف JSON' : 'تصدير تقرير Markdown'}</button>
               </div>
               <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
                   <div>
                       <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-xl flex items-center justify-center mb-4"><KodraIcon icon={Upload} size={24}/></div>
                       <h3 className="text-lg font-bold dark:text-white mb-2">استعادة النظام (Restore)</h3>
                   </div>
                   <label className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg"><input type="file" className="hidden" accept=".json,.md" onChange={handleImportFile} /><KodraIcon icon={Upload} size={18}/> رفع ملف النسخة</label>
               </div>
           </div>
       )}

       {!isLoading && activeTab === 'clients' && (
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className={`p-6 flex flex-col gap-4 transition-all border-2 rounded-xl group relative overflow-hidden ${editingId 
                ? 'bg-amber-50 dark:bg-amber-900/10 border-amber-400 dark:border-amber-600 shadow-lg scale-[1.02]' 
                : 'bg-slate-50 dark:bg-slate-900/50 border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500'
            }`}>
               <div className="flex justify-between items-center">
                    <h3 className={`font-bold flex items-center gap-2 ${editingId ? 'text-amber-700 dark:text-amber-400' : 'text-slate-700 dark:text-slate-300'}`}>
                        {editingId ? <KodraIcon icon={Edit} size={18}/> : <KodraIcon icon={Plus} size={18}/>}
                        {editingId ? 'تعديل بيانات العميل' : 'إضافة عميل جديد'}
                    </h3>
                    {editingId && (
                        <button onClick={resetForm} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200" title="إلغاء التعديل">
                            <KodraIcon icon={X} size={18}/>
                        </button>
                    )}
               </div>
               <div className="space-y-3">
                 <input value={clientName} onChange={(e) => setClientName(e.target.value)} placeholder="اسم العميل / الشركة *" className="w-full p-2.5 rounded-lg border dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white text-sm focus:ring-1 ring-blue-500 outline-none" />
                 <input value={clientIndustry} onChange={(e) => setClientIndustry(e.target.value)} placeholder="المجال (مثلاً: مطاعم، عقارات)" className="w-full p-2.5 rounded-lg border dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white text-sm focus:ring-1 ring-blue-500 outline-none" />
                 <button onClick={handleSaveClient} disabled={!clientName} className={`w-full py-2.5 rounded-lg font-bold text-white transition-all shadow-sm flex items-center justify-center gap-2 ${editingId ? 'bg-amber-500 hover:bg-amber-600' : 'bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed'}`}>{editingId ? <><KodraIcon icon={RotateCcw} size={16}/> تحديث البيانات</> : <><KodraIcon icon={Plus} size={16}/> إضافة للقائمة</>}</button>
               </div>
            </div>

            {filteredClients.map(client => (
              <div key={client.id} className={`bg-white dark:bg-slate-900 p-5 rounded-xl border shadow-sm flex flex-col justify-between group relative overflow-hidden hover:shadow-md transition-all ${editingId === client.id ? 'border-amber-500 ring-1 ring-amber-500' : 'dark:border-slate-800'}`}>
                 {editingId !== client.id && <div className="absolute top-0 left-0 w-1 h-full bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>}
                 <div className="space-y-4">
                    <div className="flex justify-between items-start">
                        <div className="flex flex-col gap-1">
                            <h3 className="font-bold text-lg dark:text-white flex items-center gap-2">
                                {client.name}
                                {editingId === client.id && <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full animate-pulse">جاري التعديل</span>}
                            </h3>
                            {client.industry && <span className="self-start inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-800"><KodraIcon icon={Briefcase} size={10}/> {client.industry}</span>}
                        </div>
                        <button onClick={() => onCreateProjectForClient(client.id)} className="text-emerald-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 p-2 rounded-lg transition-colors flex flex-col items-center gap-1" title="مشروع جديد لهذا العميل"><KodraIcon icon={Sparkles} size={20} /></button>
                    </div>
                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
                        {client.contactPerson && <div className="text-xs text-slate-600 dark:text-slate-300 flex items-center gap-2 bg-slate-50 dark:bg-slate-800/50 p-1.5 rounded-lg"><KodraIcon icon={UserRound} size={14} className="text-blue-500"/> <span className="font-medium">{client.contactPerson}</span></div>}
                    </div>
                 </div>
                 <div className="mt-4 pt-3 border-t dark:border-slate-800 flex items-center justify-between gap-2">
                    <button onClick={() => jumpToClientProjects(client.name)} className="flex-1 text-xs font-bold text-slate-500 hover:text-blue-600 bg-slate-50 hover:bg-blue-50 dark:bg-slate-800 dark:hover:bg-blue-900/20 py-2 rounded-lg transition-colors flex items-center justify-center gap-1"><KodraIcon icon={Folder} size={14}/> الأرشيف</button>
                    <div className="flex gap-1">
                        <button onClick={() => startEditing(client)} className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg transition-colors" title="تعديل"><KodraIcon icon={Edit} size={16}/></button>
                        <button onClick={() => handleDeleteClientClick(client.id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors" title="حذف"><KodraIcon icon={Trash2} size={16}/></button>
                    </div>
                 </div>
              </div>
            ))}
         </div>
       )}

       {!isLoading && activeTab === 'projects' && (
         <div className="bg-white dark:bg-slate-900 rounded-xl border dark:border-slate-800 overflow-hidden shadow-sm animate-slide-up">
            <table className="w-full text-right">
              <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-xs uppercase font-bold tracking-wider">
                <tr>
                  <th className="p-4 w-16">Preview</th>
                  <th className="p-4">اسم المشروع / الحالة</th>
                  <th className="p-4">العميل المرتبط</th>
                  <th className="p-4">التاريخ</th>
                  <th className="p-4 text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredProjects.map(project => {
                  const client = clients.find(c => c.id === project.clientId);
                  const isEditing = projectEditingId === project.id;
                  
                  return (
                    <tr key={project.id} className={`hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors text-sm dark:text-slate-300 group ${isEditing ? 'bg-amber-50/50 dark:bg-amber-900/10' : ''}`}>
                      <td className="p-4 align-middle">
                          <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-lg border dark:border-slate-700 overflow-hidden flex items-center justify-center">
                              {project.thumbnail || project.briefImage ? (
                                  <img src={project.thumbnail || project.briefImage} className="w-full h-full object-cover" alt="Preview" />
                              ) : (
                                  <KodraIcon icon={ImageIcon} className="text-slate-300 dark:text-slate-600" size={18} />
                              )}
                          </div>
                      </td>
                      <td className="p-4">
                         <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg relative ${isEditing ? 'bg-amber-500 text-white' : 'bg-amber-100 dark:bg-amber-900/20 text-amber-600 dark:text-amber-500'}`}>
                                <KodraIcon icon={Folder} size={18}/>
                            </div>
                            <div>
                                <div className="font-bold flex items-center gap-2">
                                    {project.name}
                                    <StatusBadge status={project.status} size="sm" />
                                </div>
                                {project.tags && (
                                    <div className="flex gap-1 mt-1">
                                        {project.tags.slice(0, 3).map((t, i) => (
                                            <span key={i} className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                                                <KodraIcon icon={Hash} size={8}/> {t}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                         </div>
                      </td>
                      <td className="p-4">
                        {isEditing ? (
                           <select value={targetClientId} onChange={(e) => setTargetClientId(e.target.value)} className="w-full p-2 rounded-lg border dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white text-xs outline-none focus:ring-2 ring-amber-500">
                               <option value="">-- بدون عميل (عام) --</option>
                               {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                           </select>
                        ) : (
                            client ? (
                            <div className="flex flex-col items-start gap-1">
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-800 cursor-help" title={client.industry}>
                                    <KodraIcon icon={Users} size={12} /> {client.name}
                                </span>
                            </div>
                            ) : <span className="text-slate-400 text-xs italic opacity-50 px-2">-- عام --</span>
                        )}
                      </td>
                      <td className="p-4 font-mono text-xs text-slate-500">{new Date(project.date).toLocaleDateString('ar-EG')}</td>
                      <td className="p-4 text-center flex items-center justify-center gap-2">
                         {isEditing ? (
                             <>
                                <button onClick={handleSaveProjectClient} className="text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 p-2 rounded-lg transition-colors" title="حفظ"><KodraIcon icon={Check} size={18}/></button>
                                <button onClick={handleCancelEditProject} className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 p-2 rounded-lg transition-colors" title="إلغاء"><KodraIcon icon={X} size={18}/></button>
                             </>
                         ) : (
                             <>
                                <button onClick={() => onLoadProject(project)} className="text-blue-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 px-3 py-1.5 rounded-lg transition-colors text-xs font-bold flex items-center gap-1"><KodraIcon icon={ExternalLink} size={14} /> فتح</button>
                                <button onClick={() => handleStartEditProject(project)} className="text-slate-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20 p-2 rounded-lg transition-colors" title="تعديل الارتباط"><KodraIcon icon={Edit} size={16}/></button>
                                <button onClick={() => handleDeleteProject(project.id)} className="text-slate-400 hover:text-red-500 p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"><KodraIcon icon={Trash2} size={16}/></button>
                             </>
                         )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
         </div>
       )}
    </div>
  );
};
