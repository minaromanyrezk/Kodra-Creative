import React, { useEffect, useState } from 'react';
import { Project, ProjectStatus } from '../types';
import { 
  Image, 
  Database, 
  Clock, 
  ArrowRight, 
  HardDrive,
  Activity,
  Zap,
  Hash,
  Folder,
  Sparkles
} from 'lucide-react';
import { KodraIcon } from './KodraIcon';
import { SkeletonLoader } from './SkeletonLoader';
import { StatusBadge } from './StatusBadge';

interface DashboardProps {
  onCreateNew: () => void;
  onOpenEditor: () => void;
  onOpenDataCenter: () => void;
  recentProjects: Project[];
  onLoadProject: (p: Project) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  onCreateNew,
  onOpenEditor,
  onOpenDataCenter,
  recentProjects,
  onLoadProject
}) => {
  const [greeting, setGreeting] = useState('');
  const [storageUsed, setStorageUsed] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate initial loading for effect
    const timer = setTimeout(() => setIsLoading(false), 500);

    // Time-based greeting
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('صباح الخير، يا مبدع ☀️');
    else if (hour < 18) setGreeting('مساء الخير، يا فنان 🌤️');
    else setGreeting('سهرة سعيدة، يا بطل 🌙');

    // Calculate Storage Usage (Safe check)
    let total = 0;
    try {
        if (typeof localStorage !== 'undefined') {
            for (let x in localStorage) {
                if (Object.prototype.hasOwnProperty.call(localStorage, x)) {
                    total += (localStorage[x].length + x.length) * 2;
                }
            }
        }
    } catch (e) {
        total = 0;
    }
    setStorageUsed(total / 1024 / 1024); // in MB
    return () => clearTimeout(timer);
  }, []);

  const usagePercent = Math.min((storageUsed / 5) * 100, 100); // Assume 5MB limit safety zone
  const usageColor = usagePercent > 80 ? 'bg-red-500' : usagePercent > 50 ? 'bg-amber-500' : 'bg-green-500';

  return (
    <div className="space-y-8 animate-fade-in">
        
        {/* HERO SECTION */}
        <div className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-3xl p-8 md:p-12 text-white shadow-2xl relative overflow-hidden">
            <div className="relative z-10">
                <h1 className="text-3xl md:text-5xl font-black mb-4 tracking-tight leading-tight">
                    {greeting}
                </h1>
                <p className="text-indigo-200 text-lg md:text-xl font-medium max-w-2xl leading-relaxed opacity-90">
                    أهلاً بك في <strong>Kodra Engine</strong>. المركز المتكامل لهندسة البرومبت وإدارة العمليات الإبداعية. جاهز لإنتاج التحفة القادمة؟
                </p>
                <div className="mt-8 flex gap-4">
                    <button 
                        onClick={onCreateNew}
                        className="bg-amber-500 hover:bg-amber-600 text-white px-8 py-3.5 rounded-xl font-bold shadow-lg hover:shadow-amber-500/20 transition-all flex items-center gap-2 transform hover:-translate-y-1"
                    >
                        <KodraIcon icon={Zap} size={20} className="fill-current" /> مشروع جديد
                    </button>
                    <button 
                        onClick={onOpenDataCenter}
                        className="bg-white/10 hover:bg-white/20 text-white px-6 py-3.5 rounded-xl font-bold backdrop-blur-sm transition-all flex items-center gap-2 border border-white/10"
                    >
                        <KodraIcon icon={Database} size={20} /> الأرشيف
                    </button>
                </div>
            </div>
            {/* Background Decoration */}
            <div className="absolute right-0 top-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
            <div className="absolute left-0 bottom-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl -ml-20 -mb-20 pointer-events-none"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* STORAGE MONITOR */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border dark:border-slate-800 shadow-sm flex flex-col justify-between">
                <div>
                    <div className="flex items-center gap-2 mb-2 text-slate-500 dark:text-slate-400 font-bold uppercase text-xs tracking-wider">
                        <KodraIcon icon={HardDrive} size={14} /> حالة التخزين (Browser Storage)
                    </div>
                    <div className="flex items-end gap-2 mb-2">
                        <span className="text-3xl font-black dark:text-white">{storageUsed.toFixed(2)}</span>
                        <span className="text-sm font-medium text-slate-400 mb-1">MB / 5.0 MB</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div 
                            className={`h-full rounded-full transition-all duration-1000 ${usageColor}`} 
                            style={{ width: `${usagePercent}%` }}
                        ></div>
                    </div>
                </div>
                {usagePercent > 80 && (
                     <div className="mt-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-2 rounded-lg text-xs font-bold">
                         تنبيه: المساحة ممتلئة تقريباً. يرجى تصدير البيانات ومسح الأرشيف.
                     </div>
                )}
            </div>

            {/* QUICK LAUNCH - EDITOR */}
            <button 
                onClick={onOpenEditor}
                className="bg-gradient-to-br from-purple-500 to-indigo-600 p-6 rounded-2xl shadow-lg text-white text-right flex flex-col justify-between group relative overflow-hidden transition-transform hover:scale-[1.02]"
            >
                 <div className="relative z-10">
                    <div className="bg-white/20 w-12 h-12 rounded-xl flex items-center justify-center mb-4 backdrop-blur-md">
                        <KodraIcon icon={Image} size={24} />
                    </div>
                    <h3 className="text-xl font-bold mb-1">محرر الصور</h3>
                    <p className="text-indigo-100 text-sm opacity-80">تعديل بالذكاء الاصطناعي + إضافة الشعارات</p>
                 </div>
                 <ArrowRight className="absolute bottom-6 left-6 opacity-0 group-hover:opacity-100 transition-opacity transform group-hover:-translate-x-2" />
                 <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
            </button>

            {/* QUICK LAUNCH - DATA CENTER */}
            <button 
                onClick={onOpenDataCenter}
                className="bg-white dark:bg-slate-900 p-6 rounded-2xl border dark:border-slate-800 shadow-sm text-right flex flex-col justify-between group hover:border-amber-500 dark:hover:border-amber-500 transition-all"
            >
                 <div>
                    <div className="bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
                        <KodraIcon icon={Database} size={24} />
                    </div>
                    <h3 className="text-xl font-bold dark:text-white mb-1">قاعدة البيانات</h3>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">إدارة العملاء وأرشيف المشاريع</p>
                 </div>
                 <div className="flex justify-end text-blue-500 font-bold text-sm items-center gap-1 group-hover:gap-2 transition-all">
                     دخول <KodraIcon icon={ArrowRight} size={16} />
                 </div>
            </button>
        </div>

        {/* RECENT ACTIVITY */}
        <section>
            <h3 className="text-xl font-bold dark:text-white mb-6 flex items-center gap-2">
                <KodraIcon icon={Activity} className="text-amber-500" /> آخر المشاريع
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {isLoading ? (
                    <SkeletonLoader type="card" count={3} />
                ) : recentProjects.length > 0 ? (
                    recentProjects.map(project => (
                        <div 
                            key={project.id}
                            onClick={() => onLoadProject(project)}
                            className="bg-white dark:bg-slate-900 rounded-2xl border dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-md hover:border-amber-400 dark:hover:border-amber-600 transition-all cursor-pointer group flex flex-col"
                        >
                            {/* Thumbnail */}
                            <div className="h-32 w-full bg-slate-100 dark:bg-slate-800 relative overflow-hidden">
                                {project.thumbnail || project.briefImage ? (
                                    <img 
                                        src={project.thumbnail || project.briefImage} 
                                        alt={project.name} 
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-300 dark:text-slate-600">
                                        <KodraIcon icon={Sparkles} size={32} />
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60"></div>
                                <div className="absolute top-2 right-2">
                                    <StatusBadge status={project.status} size="sm" />
                                </div>
                                <div className="absolute bottom-3 right-3 text-white text-xs font-bold flex items-center gap-1">
                                    <KodraIcon icon={Clock} size={12}/> {new Date(project.date).toLocaleDateString('ar-EG')}
                                </div>
                            </div>
                            {/* Content */}
                            <div className="p-5 flex-1 flex flex-col justify-between">
                                <div>
                                    <h4 className="font-bold text-lg dark:text-white mb-1 truncate group-hover:text-amber-500 transition-colors">{project.name}</h4>
                                    <p className="text-slate-500 dark:text-slate-400 text-xs line-clamp-2 leading-relaxed mb-3">
                                        {project.briefText || "بدون وصف..."}
                                    </p>
                                </div>
                                {project.tags && project.tags.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mt-auto">
                                        {project.tags.slice(0, 3).map((t, i) => (
                                            <span key={i} className="text-[9px] bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-1.5 py-0.5 rounded flex items-center gap-0.5 border dark:border-slate-700">
                                                <KodraIcon icon={Hash} size={8}/> {t}
                                            </span>
                                        ))}
                                        {project.tags.length > 3 && (
                                            <div className="relative group/tooltip">
                                                <span className="text-[9px] text-slate-400 cursor-help">+{project.tags.length - 3}</span>
                                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 p-2 bg-slate-800 text-white text-[10px] rounded-lg opacity-0 group-hover/tooltip:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-20">
                                                    {project.tags.slice(3).join(', ')}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-span-3 py-10 text-center text-slate-400 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border dashed border-slate-200 dark:border-slate-800">
                        <KodraIcon icon={Clock} size={32} className="mx-auto mb-2 opacity-30"/>
                        <p>لا توجد مشاريع حديثة. ابدأ الإبداع الآن!</p>
                    </div>
                )}
            </div>
        </section>

    </div>
  );
};
