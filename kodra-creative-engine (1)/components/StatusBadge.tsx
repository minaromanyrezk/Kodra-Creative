
import React from 'react';
import { ProjectStatus } from '../types';
import { 
  FileText, 
  Loader2, 
  Eye, 
  CheckCircle2, 
  Archive, 
  CheckCheck,
  LucideIcon
} from 'lucide-react';
import { KodraIcon } from './KodraIcon';

interface StatusBadgeProps {
  status?: ProjectStatus;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status = ProjectStatus.DRAFT, size = 'sm' }) => {
  const config: Record<ProjectStatus, { color: string; icon: LucideIcon; animate?: boolean }> = {
    [ProjectStatus.DRAFT]: { 
      color: 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700', 
      icon: FileText 
    },
    [ProjectStatus.IN_PROGRESS]: { 
      color: 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 border-blue-100 dark:border-blue-800', 
      icon: Loader2,
      animate: true
    },
    [ProjectStatus.IN_REVIEW]: { 
      color: 'bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400 border-purple-100 dark:border-purple-800', 
      icon: Eye 
    },
    [ProjectStatus.APPROVED]: { 
      color: 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400 border-green-100 dark:border-green-800', 
      icon: CheckCircle2 
    },
    [ProjectStatus.COMPLETED]: { 
      color: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800', 
      icon: CheckCheck 
    },
    [ProjectStatus.ARCHIVED]: { 
      color: 'bg-slate-200 text-slate-500 dark:bg-slate-700 dark:text-slate-400 border-slate-300 dark:border-slate-600', 
      icon: Archive 
    },
  };

  const current = config[status] || config[ProjectStatus.DRAFT];
  const Icon = current.icon;
  
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs';
  const iconSize = size === 'sm' ? 10 : 12;

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border font-bold ${sizeClasses} ${current.color} transition-colors`}>
      <KodraIcon icon={Icon} size={iconSize} className={current.animate ? 'animate-spin' : ''} />
      {status}
    </span>
  );
};
