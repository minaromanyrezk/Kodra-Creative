import React from 'react';

interface SkeletonLoaderProps {
  type: 'card' | 'row' | 'text' | 'thumbnail';
  count?: number;
  className?: string;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({ type, count = 1, className = '' }) => {
  const items = Array.from({ length: count });

  const renderSkeleton = (index: number) => {
    if (type === 'card') {
      return (
        <div key={index} className={`bg-white dark:bg-slate-900 rounded-2xl border dark:border-slate-800 p-4 shadow-sm animate-pulse flex flex-col gap-4 ${className}`}>
          <div className="w-full h-32 bg-slate-200 dark:bg-slate-800 rounded-xl"></div>
          <div className="space-y-2">
            <div className="w-3/4 h-4 bg-slate-200 dark:bg-slate-800 rounded"></div>
            <div className="w-1/2 h-3 bg-slate-200 dark:bg-slate-800 rounded"></div>
          </div>
          <div className="flex gap-2 mt-auto pt-2">
             <div className="w-12 h-4 bg-slate-200 dark:bg-slate-800 rounded-full"></div>
             <div className="w-12 h-4 bg-slate-200 dark:bg-slate-800 rounded-full"></div>
          </div>
        </div>
      );
    }

    if (type === 'row') {
      return (
        <div key={index} className={`flex items-center gap-4 p-4 border-b border-slate-100 dark:border-slate-800 animate-pulse ${className}`}>
           <div className="w-10 h-10 bg-slate-200 dark:bg-slate-800 rounded-lg shrink-0"></div>
           <div className="flex-1 space-y-2">
              <div className="w-1/3 h-4 bg-slate-200 dark:bg-slate-800 rounded"></div>
              <div className="w-1/4 h-3 bg-slate-200 dark:bg-slate-800 rounded"></div>
           </div>
           <div className="w-20 h-6 bg-slate-200 dark:bg-slate-800 rounded-full"></div>
        </div>
      );
    }

    if (type === 'thumbnail') {
        return (
            <div key={index} className={`w-full h-full bg-slate-200 dark:bg-slate-800 animate-pulse ${className}`}></div>
        );
    }

    // Default 'text'
    return (
      <div key={index} className={`h-4 bg-slate-200 dark:bg-slate-800 rounded w-full animate-pulse my-1 ${className}`}></div>
    );
  };

  return (
    <>
      {items.map((_, i) => renderSkeleton(i))}
    </>
  );
};
