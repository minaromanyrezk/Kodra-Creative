import React from 'react';

interface LoadingSpinnerProps {
  message?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ message = "جاري المعالجة..." }) => (
  <div className="flex items-center justify-center p-8 w-full h-full min-h-[200px]">
    <div className="flex flex-col items-center gap-4">
      <div className="w-10 h-10 border-4 border-slate-200 dark:border-slate-700 border-t-amber-500 rounded-full animate-spin"></div>
      <p className="text-slate-500 dark:text-slate-400 text-sm font-medium animate-pulse">{message}</p>
    </div>
  </div>
);