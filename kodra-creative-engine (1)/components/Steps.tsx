import React from 'react';
import { AppStep } from '../types';
import { 
  Check, 
  FileText, 
  BrainCircuit, 
  Cpu, 
  ScanEye, 
  Rocket,
  LucideIcon
} from 'lucide-react';
import { KodraIcon } from './KodraIcon';

interface StepsProps {
  currentStep: AppStep;
}

const stepsOrder = [
  AppStep.BRIEF_INPUT,
  AppStep.STRATEGY_GENERATION,
  AppStep.JSON_ENGINEERING,
  AppStep.VALIDATION,
  AppStep.FINAL_OUTPUT
];

const stepConfig: Record<AppStep, { label: string; icon: LucideIcon }> = {
  [AppStep.BRIEF_INPUT]: { label: 'البريف', icon: FileText },
  [AppStep.STRATEGY_GENERATION]: { label: 'الاستراتيجية', icon: BrainCircuit },
  [AppStep.JSON_ENGINEERING]: { label: 'الهندسة', icon: Cpu },
  [AppStep.VALIDATION]: { label: 'التحقق', icon: ScanEye },
  [AppStep.FINAL_OUTPUT]: { label: 'الإنتاج', icon: Rocket }
};

export const Steps: React.FC<StepsProps> = ({ currentStep }) => {
  const currentIndex = stepsOrder.indexOf(currentStep);
  const progressPercentage = (currentIndex / (stepsOrder.length - 1)) * 100;

  return (
    <div className="w-full mb-10 px-4 pt-4" dir="rtl">
      <div className="relative flex items-center justify-between">
        {/* Background Track */}
        <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-full h-1 bg-slate-200 dark:bg-slate-800 rounded-full z-0"></div>
        
        {/* Active Progress Fill */}
        <div 
            className="absolute right-0 top-1/2 transform -translate-y-1/2 h-1 bg-gradient-to-l from-amber-400 to-amber-600 rounded-full transition-[width] duration-1000 ease-[cubic-bezier(0.4,0,0.2,1)] z-0 shadow-[0_0_8px_rgba(245,158,11,0.4)]"
            style={{ width: `${progressPercentage}%` }}
        ></div>
        
        {stepsOrder.map((step, index) => {
          const isCompleted = index < currentIndex;
          const isActive = index === currentIndex;
          const Icon = stepConfig[step].icon;
          
          return (
            <div key={step} className="flex flex-col items-center gap-3 relative z-10 group cursor-default">
              <div 
                className={`w-10 h-10 md:w-12 md:h-12 rounded-2xl flex items-center justify-center border-4 transition-all duration-500 transform ${
                  isCompleted 
                    ? 'bg-amber-500 border-amber-500 text-white shadow-lg scale-95' 
                    : isActive 
                      ? 'bg-white dark:bg-slate-900 border-amber-500 text-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.4)] scale-110 -translate-y-1' 
                      : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-300 dark:text-slate-600'
                }`}
              >
                {isCompleted ? <KodraIcon icon={Check} size={18} strokeWidth={4} /> : <KodraIcon icon={Icon} size={20} isActive={isActive} />}
              </div>
              
              <div className={`absolute top-14 whitespace-nowrap text-[10px] md:text-xs font-bold transition-all duration-500 ${
                isActive 
                  ? 'opacity-100 -translate-y-1 text-amber-600 dark:text-amber-400' 
                  : isCompleted
                    ? 'opacity-80 text-slate-500'
                    : 'opacity-40 text-slate-400 translate-y-1'
              }`}>
                {stepConfig[step].label}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};