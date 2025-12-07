import React, { useMemo } from 'react';
import { 
  Sparkles, 
  Image, 
  Type,
  LayoutGrid,
  Library,
  X,
  Database,
  User,
  Settings,
  LucideIcon,
  LogOut,
  ChevronRight
} from 'lucide-react';
import { ViewMode, UIFontWeight } from '../types';
import { KodraIcon } from './KodraIcon';

interface SidebarProps {
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
  uiFontWeight: UIFontWeight;
  onFontWeightChange: (weight: UIFontWeight) => void;
  isOpen: boolean; 
  onClose: () => void; 
}

interface MenuItem {
    icon: LucideIcon;
    label: string;
    id: ViewMode;
    active: boolean;
    isHot?: boolean;
    isDocs?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  currentView, 
  onViewChange,
  uiFontWeight,
  onFontWeightChange,
  isOpen,
  onClose
}) => {
  const menuItems: MenuItem[] = useMemo(() => [
    { 
      icon: Sparkles, 
      label: 'استوديو البرومبت', 
      id: ViewMode.PROMPT_ENGINEER,
      active: currentView === ViewMode.PROMPT_ENGINEER 
    },
    { 
      icon: Image, 
      label: 'محرر الصور',
      id: ViewMode.IMAGE_EDITOR,
      active: currentView === ViewMode.IMAGE_EDITOR,
      isHot: true
    },
    { 
      icon: Database, 
      label: 'قاعدة البيانات',
      id: ViewMode.DATA_CENTER,
      active: currentView === ViewMode.DATA_CENTER 
    },
    { 
      icon: Library, 
      label: 'كتالوج المشروع',
      id: ViewMode.DOCS,
      active: currentView === ViewMode.DOCS,
      isDocs: true 
    }
  ], [currentView]);

  const fontOptions = useMemo(() => [
    { label: 'نحيف', value: 'light', class: 'font-light' },
    { label: 'عادي', value: 'regular', class: 'font-normal' },
    { label: 'متوسط', value: 'medium', class: 'font-semibold' },
    { label: 'عريض', value: 'bold', class: 'font-bold' },
  ] as const, []);

  // Common content for sidebar to reuse in mobile/desktop
  const SidebarContent = () => (
    <>
      <header className="p-6 flex items-center justify-between border-b border-slate-100 dark:border-slate-800/50">
        <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/20">
              <span className="text-white font-black text-2xl tracking-tighter">K</span>
            </div>
            <div>
              <h1 className="text-lg font-black text-slate-800 dark:text-white tracking-wide leading-none">KODRA</h1>
              <span className="text-[10px] text-slate-400 font-bold tracking-widest uppercase">Engine v4.3</span>
            </div>
        </div>
        {/* Mobile Close Button */}
        <button 
            onClick={onClose} 
            className="md:hidden p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            aria-label="Close menu"
        >
            <KodraIcon icon={X} size={24} />
        </button>
      </header>

      <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-2" aria-label="Main Navigation">
        <div className="text-[10px] font-bold text-slate-400 mb-2 px-3 uppercase tracking-widest flex items-center gap-2">
            <KodraIcon icon={LayoutGrid} size={12} /> الأدوات الأساسية
        </div>
        {menuItems.map((item, index) => (
          <button
            key={index}
            onClick={() => { 
                if (item.id) onViewChange(item.id as ViewMode); 
                onClose(); 
            }}
            aria-current={item.active ? 'page' : undefined}
            className={`
              w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-300 group relative
              ${item.active 
                ? 'bg-gradient-to-l from-amber-500/10 to-transparent text-amber-600 dark:text-amber-400 font-bold' 
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white'
              } 
            `}
          >
            {item.active && (
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-amber-500 rounded-l-full shadow-[0_0_10px_rgba(245,158,11,0.5)]"></div>
            )}

            <div className={`
               p-2 rounded-lg transition-all duration-300
               ${item.active ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400 scale-105' : 'bg-transparent group-hover:bg-white dark:group-hover:bg-slate-800 group-hover:scale-110 group-hover:shadow-sm'}
            `}>
               <KodraIcon icon={item.icon} size={20} isActive={item.active} />
            </div>
            
            <span className="flex-1 text-right">{item.label}</span>
            
            {item.isHot && (
              <span className="bg-red-500/10 text-red-600 dark:text-red-400 text-[9px] font-bold px-2 py-0.5 rounded-full border border-red-500/20">NEW</span>
            )}
            
            {item.active && <KodraIcon icon={ChevronRight} size={14} className="opacity-50" />}
          </button>
        ))}
      </nav>

      <footer className="p-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-5">
        
        {/* User Profile */}
        <div className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm">
          <div className="flex items-center gap-3 mb-3 border-b border-slate-100 dark:border-slate-700 pb-3">
             <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-500 to-cyan-400 flex items-center justify-center text-white shadow-md">
                <KodraIcon icon={User} size={18} strokeWidth={2} />
             </div>
             <div className="flex-1 min-w-0">
                <div className="text-xs font-bold text-slate-800 dark:text-white truncate">Admin User</div>
                <div className="text-[10px] text-slate-400 truncate">pro@kodra.ai</div>
             </div>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
             <button className="flex items-center justify-center gap-2 p-1.5 rounded-lg text-[10px] font-bold text-slate-500 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                 <KodraIcon icon={Settings} size={14} /> الإعدادات
             </button>
             <button className="flex items-center justify-center gap-2 p-1.5 rounded-lg text-[10px] font-bold text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                 <KodraIcon icon={LogOut} size={14} /> خروج
             </button>
          </div>
        </div>

        {/* Font Control */}
        <div>
            <div className="flex items-center justify-between mb-3 px-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <KodraIcon icon={Type} size={12} /> حجم الخط
            </span>
            </div>
            <div className="flex bg-white dark:bg-slate-950 p-1 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm">
            {fontOptions.map((opt) => (
                <button
                key={opt.value}
                onClick={() => onFontWeightChange(opt.value)}
                className={`flex-1 py-1.5 rounded-md text-[10px] transition-all ${
                    uiFontWeight === opt.value
                    ? 'bg-amber-500 text-white font-bold shadow-sm scale-105'
                    : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                } ${opt.class}`}
                title={opt.label}
                >
                Aa
                </button>
            ))}
            </div>
        </div>
      </footer>
    </>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-72 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 h-screen sticky top-0 transition-colors duration-300 z-20 shadow-2xl">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      <div 
        className={`fixed inset-0 z-50 md:hidden transition-all duration-300 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        aria-hidden={!isOpen}
      >
        <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
            onClick={onClose}
        ></div>
        
        <aside 
            className={`absolute top-0 right-0 w-[85%] max-w-sm h-full bg-white dark:bg-slate-900 shadow-2xl flex flex-col transition-transform duration-300 ease-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
        >
            <SidebarContent />
        </aside>
      </div>
    </>
  );
};