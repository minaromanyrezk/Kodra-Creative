
import React, { useState, useEffect, useRef } from 'react';
import { MoveHorizontal } from 'lucide-react';
import { KodraIcon } from './KodraIcon';

interface CompareSliderProps {
  before: string;
  after: string;
}

export const CompareSlider: React.FC<CompareSliderProps> = ({ before, after }) => {
    const [sliderPosition, setSliderPosition] = useState(50);
    const containerRef = useRef<HTMLDivElement>(null);
    const isDragging = useRef(false);

    const handleMove = (clientX: number) => {
        if (containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect();
            const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
            const percent = Math.max(0, Math.min((x / rect.width) * 100, 100));
            setSliderPosition(percent);
        }
    };

    const handleMouseDown = () => { isDragging.current = true; };
    const handleMouseUp = () => { isDragging.current = false; };
    const handleMouseMove = (e: React.MouseEvent) => { if (isDragging.current) handleMove(e.clientX); };
    const handleTouchMove = (e: React.TouchEvent) => { handleMove(e.touches[0].clientX); };

    useEffect(() => {
        const handleGlobalMouseUp = () => { isDragging.current = false; };
        window.addEventListener('mouseup', handleGlobalMouseUp);
        return () => window.removeEventListener('mouseup', handleGlobalMouseUp);
    }, []);

    return (
        <div 
            ref={containerRef}
            className="relative w-full h-full select-none overflow-hidden group cursor-ew-resize rounded-xl shadow-inner bg-slate-900"
            onMouseMove={handleMouseMove}
            onMouseDown={handleMouseDown}
            onTouchMove={handleTouchMove}
        >
            <img src={after} alt="Edited" className="absolute inset-0 w-full h-full object-contain" />
            <div 
                className="absolute inset-0 w-full h-full overflow-hidden border-r-2 border-white/50"
                style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
            >
                <img src={before} alt="Original" className="absolute inset-0 w-full h-full object-contain bg-slate-900" />
            </div>
            <div 
                className="absolute top-0 bottom-0 w-0.5 bg-white cursor-ew-resize z-10 shadow-[0_0_15px_rgba(0,0,0,0.8)] transition-all duration-75"
                style={{ left: `${sliderPosition}%` }}
            >
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-9 h-9 bg-white rounded-full flex items-center justify-center shadow-xl text-amber-500 hover:scale-110 transition-transform cursor-ew-resize border-2 border-slate-100">
                    <KodraIcon icon={MoveHorizontal} size={18} strokeWidth={2.5} />
                </div>
            </div>
            <div className="absolute top-4 left-4 bg-black/60 text-white text-[10px] font-bold px-3 py-1.5 rounded-full backdrop-blur-sm pointer-events-none border border-white/10 shadow-lg">الأصل (Original)</div>
            <div className="absolute top-4 right-4 bg-amber-500/90 text-white text-[10px] font-bold px-3 py-1.5 rounded-full backdrop-blur-sm pointer-events-none shadow-lg border border-amber-400/50">التعديل (Edited)</div>
        </div>
    );
};
