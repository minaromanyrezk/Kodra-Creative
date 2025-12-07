import React, { useState, useRef } from 'react';
import { UploadCloud, X, Image as ImageIcon } from 'lucide-react';
import { KodraIcon } from './KodraIcon';

interface AssetPickerProps {
  label?: string;
  subLabel?: string;
  accept?: string;
  currentAsset?: string | null; // Base64 string or URL
  onAssetSelect: (file: File) => void;
  onClear?: (e?: React.MouseEvent) => void;
  className?: string;
}

export const AssetPicker: React.FC<AssetPickerProps> = ({
  label = "رفع صورة مرجعية",
  subLabel = "اسحب الصورة هنا أو انقر للرفع",
  accept = "image/*",
  currentAsset,
  onAssetSelect,
  onClear,
  className = ""
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onAssetSelect(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onAssetSelect(e.target.files[0]);
    }
  };

  return (
    <div className={`w-full ${className}`}>
      <div
        className={`relative border-2 border-dashed rounded-xl transition-all duration-200 group overflow-hidden
          ${currentAsset 
            ? 'border-amber-500 bg-amber-50/10' 
            : isDragging 
              ? 'border-green-500 bg-green-50/10 scale-[1.01]' 
              : 'border-slate-300 dark:border-slate-700 hover:border-amber-500 hover:bg-slate-50 dark:hover:bg-slate-800/50'
          }
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {/* Hidden Input Layer */}
        <input
          ref={inputRef}
          type="file"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          accept={accept}
          onChange={handleChange}
          disabled={!!currentAsset} // Disable click if asset exists to prevent accidental replace when trying to view
        />

        {currentAsset ? (
          <div className="p-4 relative z-20 flex flex-col items-center justify-center min-h-[180px]">
            <img 
              src={currentAsset} 
              alt="Preview" 
              className="max-h-40 max-w-full rounded-lg shadow-md object-contain mb-2" 
            />
            
            <div className="flex items-center gap-2 mt-2">
                <span className="text-xs font-bold text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30 px-3 py-1 rounded-full flex items-center gap-1 pointer-events-none">
                    <KodraIcon icon={ImageIcon} size={12}/> تم الرفع
                </span>
                
                {onClear && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent file dialog
                      if (onClear) onClear(e);
                      if (inputRef.current) inputRef.current.value = '';
                    }}
                    className="z-30 p-1.5 bg-white dark:bg-slate-800 text-red-500 hover:text-red-600 border border-slate-200 dark:border-slate-700 rounded-full shadow-sm hover:scale-110 transition-transform"
                    title="حذف الصورة"
                  >
                    <KodraIcon icon={X} size={16} />
                  </button>
                )}
            </div>
          </div>
        ) : (
          <div className="p-8 text-center flex flex-col items-center justify-center min-h-[180px] pointer-events-none">
            <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-4 transition-colors ${isDragging ? 'bg-green-100 text-green-600' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 group-hover:text-amber-500'}`}>
               <KodraIcon icon={UploadCloud} size={28} />
            </div>
            <p className="text-sm font-bold text-slate-600 dark:text-slate-300 mb-1">{label}</p>
            <p className="text-xs text-slate-400 dark:text-slate-500">{subLabel}</p>
          </div>
        )}
      </div>
    </div>
  );
};