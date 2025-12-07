
import React, { Suspense, useState, useEffect } from 'react';
import { Steps } from './Steps';
import { StrategyContextBar } from './StrategyContextBar';
import { LoadingSpinner } from './LoadingSpinner';
import { MatrixViewer } from './MatrixViewer';
import { AppStep, PromptJson, StrategyReport, ValidationResult, ModelType, Client } from '../types';
import { 
  Terminal, Layers, RefreshCw, FileJson, XCircle, X,
  Sparkles, Zap, Wand2, CheckCircle, AlertTriangle, Download, Copy, UploadCloud,
  ImageIcon, FileText, Cpu, User, ArrowRight, Briefcase, StickyNote, Pencil, UserPlus, Search,
  Palette as PaletteIcon, Monitor, Smartphone, Layout, Lock, Unlock, Repeat, RefreshCcw,
  Globe, Hexagon, Eye, Edit3, Save, ChevronDown, ChevronUp, RotateCcw, RotateCw, Grid
} from 'lucide-react';
import { KodraIcon } from './KodraIcon';
import { 
    ARABIC_MODELS, 
    GOOGLE_MODELS, 
    FLUX_MODELS, 
    SPECIALIZED_MODELS,
    TEXT_PREFIX_CODE, 
    IMAGE_PREFIX_CODE 
} from '../constants';

const JsonViewer = React.lazy(() => import('./JsonViewer'));

interface PromptStudioProps {
  step: AppStep;
  setStep: (step: AppStep) => void;
  briefText: string;
  setBriefText: (text: string) => void;
  briefImage: string | null;
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFileDrop: (file: File) => void;
  clearImage: (e: React.MouseEvent) => void;
  isLoading: boolean;
  strategy: StrategyReport | null;
  handleGenerateStrategy: () => void;
  jsonPrompts: PromptJson[] | null;
  handleEngineering: () => void;
  validation: ValidationResult | null;
  selectedModel: ModelType;
  setSelectedModel: (model: ModelType) => void;
  requiresArabic: boolean;
  setRequiresArabic: (req: boolean) => void;
  forceAspectRatio: string;
  setForceAspectRatio: (ratio: string) => void;
  selectedDeliverableIndex: number;
  setSelectedDeliverableIndex: (index: number) => void;
  selectedVariationIndex: number;
  setSelectedVariationIndex: (index: number) => void;
  refinementText: string;
  setRefinementText: (text: string) => void;
  handleRegenerate: () => void;
  handleAutoFix: () => void;
  onReset: () => void;
  addToast: (msg: string, type: 'success' | 'error' | 'info') => void;
  
  // Client Management Props
  clients: Client[];
  selectedClientId: string;
  setSelectedClientId: (id: string) => void;
  onCreateClient: (data: { name: string, industry: string, contactPerson: string, email: string }) => void;
  
  // Bridge Prop
  onEditImage?: (image: string) => void;

  // Strategy Locking (DNA Cloning)
  isStrategyLocked?: boolean;
  onReuseStrategy?: () => void;
  onUnlockStrategy?: () => void;

  // Manual Override (Charter Art 10.2)
  setJsonPrompts?: (prompts: PromptJson[]) => void;

  // History Props
  promptHistory?: PromptJson[][];
  historyIndex?: number;
  onUndo?: () => void;
  onRedo?: () => void;
}

const QUICK_FILLS = [
    {
        label: "قهوة في المطر",
        text: "إعلان لبراند قهوة 'Mood Brew'. كوب سيراميك ساخن على حافة شباك عليه مطر. إضاءة زرقاء خافتة مع بخار دافئ. شعور بالوحدة والراحة (Cozy/Melancholy). بدون نصوص."
    },
    {
        label: "سنيكرز نيون",
        text: "حذاء رياضي مستقبلي يطير في الهواء. خلفية مدينة طوكيو سايبربانك ليلاً. ألوان نيون وردي وسماوي. إضاءة ريم لايت قوية. ستايل دعائي 3D Octane Render."
    },
    {
        label: "عطر فاخر",
        text: "زجاجة عطر ذهبية 'Royal Oud' على قاعدة رخام أسود. إضاءة سينمائية درامية. تناثر قطرات ماء ذهبية. فخامة، غموض، أناقة. جودة 8k."
    }
];

const REFINEMENT_CHIPS = [
    { label: "💡 تحسين الواقعية", text: "Enhance photorealism, refine textures, better lighting physics." },
    { label: "🎬 سينمائي درامي", text: "Apply cinematic lighting, high contrast, dramatic shadows, movie still aesthetic." },
    { label: "🎨 ألوان زاهية", text: "Boost color saturation, make it vibrant and punchy, commercial advertisement style." },
    { label: "🚫 تطبيق القيود", text: "Strictly enforce all negative constraints and hard rules mentioned in strategy." },
    { label: "🇸🇦 ضبط النصوص", text: "Ensure Arabic typography is integrated naturally and legible." }
];

const extractColors = (text: string): string[] => {
    if (!text) return [];
    const hexRegex = /#[0-9A-Fa-f]{6}/g;
    return text.match(hexRegex) || [];
};

export const PromptStudio: React.FC<PromptStudioProps> = ({
  step, setStep, briefText, setBriefText, briefImage, handleImageUpload, onFileDrop, clearImage,
  isLoading, strategy, handleGenerateStrategy,
  jsonPrompts, handleEngineering, validation,
  selectedModel, setSelectedModel, requiresArabic, setRequiresArabic,
  forceAspectRatio, setForceAspectRatio, selectedDeliverableIndex, setSelectedDeliverableIndex,
  selectedVariationIndex, setSelectedVariationIndex,
  refinementText, setRefinementText, handleRegenerate, handleAutoFix, onReset, addToast,
  clients, selectedClientId, setSelectedClientId, onCreateClient,
  onEditImage,
  isStrategyLocked, onReuseStrategy, onUnlockStrategy,
  setJsonPrompts,
  promptHistory, historyIndex, onUndo, onRedo
}) => {

  const [isDragging, setIsDragging] = useState(false);
  const [clientGateMode, setClientGateMode] = useState<'search' | 'create'>('search');
  const [newClientForm, setNewClientForm] = useState({ name: '', industry: '', contactPerson: '', email: '' });

  // MANUAL OVERRIDE STATE (Charter Art 10.2)
  const [isEditingJson, setIsEditingJson] = useState(false);
  const [jsonEditValue, setJsonEditValue] = useState('');
  const [jsonError, setJsonError] = useState<string | null>(null);

  // INTEGRATION CONFIG COLLAPSE STATE
  const [isIntegrationExpanded, setIsIntegrationExpanded] = useState(false);
  
  // CLIENT WIDGET STATE
  const [isClientWidgetExpanded, setIsClientWidgetExpanded] = useState(true);

  // VIEW TOGGLE (MATRIX / CODE)
  const [viewMode, setViewMode] = useState<'code' | 'matrix'>('code');

  const selectedClientContext = clients.find(c => c.id === selectedClientId);

  const getLoadingMessage = () => {
      if (step === AppStep.BRIEF_INPUT) return isStrategyLocked ? "جاري استنساخ الروح البصرية على العنصر الجديد..." : "جاري تحليل البريف وبناء الاستراتيجية...";
      if (step === AppStep.STRATEGY_GENERATION) return "تنفيذ بروتوكول Vision Matrix 3.0...";
      if (step === AppStep.JSON_ENGINEERING) return "جاري إعادة التوليد والتحسين...";
      return "جاري المعالجة...";
  };

  const onDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
  const onDragLeave = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(false); };
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) onFileDrop(e.dataTransfer.files[0]);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); 
        if (isStrategyLocked) handleEngineering(); 
        else handleGenerateStrategy(); 
      }
  };

  const handleLanguageScopeChange = (isArabic: boolean) => {
      setRequiresArabic(isArabic);
      if (isArabic) {
          setSelectedModel(ModelType.NANO_BANANA_PRO_2);
      } else {
          if (selectedModel === ModelType.NANO_BANANA_PRO_2) {
             setSelectedModel(ModelType.GEMINI_3_PRO_2K);
          }
      }
  };

  const getPrefixCode = () => {
      if (strategy?.sourceMode === 'image') return IMAGE_PREFIX_CODE;
      return TEXT_PREFIX_CODE;
  };

  const copyToClipboard = () => {
    if (!jsonPrompts || !jsonPrompts[selectedVariationIndex]) return;
    const activeJson = jsonPrompts[selectedVariationIndex];
    const prefix = getPrefixCode();
    const fullText = `${prefix}\n\n${JSON.stringify(activeJson, null, 2)}`;
    navigator.clipboard.writeText(fullText);
    addToast("تم نسخ الكود + البرومبت", "success");
  };

  const downloadJsonFile = () => {
    if (!jsonPrompts || !jsonPrompts[selectedVariationIndex]) return;
    const blob = new Blob([JSON.stringify(jsonPrompts[selectedVariationIndex], null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kodra_project.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    addToast("تم تحميل ملف JSON بنجاح", "success");
  };

  const downloadTextFile = () => {
    if (!jsonPrompts || !jsonPrompts[selectedVariationIndex]) return;
    const prefix = getPrefixCode();
    const fullText = `${prefix}\n\n${JSON.stringify(jsonPrompts[selectedVariationIndex], null, 2)}`;
    const blob = new Blob([fullText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kodra_project.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    addToast("تم تحميل ملف TXT بنجاح", "success");
  };

  const getInpaintingJson = (promptData: PromptJson) => {
    return {
      task: "smart_object_integration",
      context_awareness: {
          lighting_match: promptData.lighting || "auto",
          perspective_match: promptData.camera || "auto",
          surface_interaction: "cast_shadows_and_reflections"
      },
      placement_guide: { target_surface: promptData.subject?.position || "center", blending_mode: "photorealistic" },
      style_preservation: promptData.style || "maintain_original"
    };
  };

  const copyInpaintingJson = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!jsonPrompts || !jsonPrompts[selectedVariationIndex]) return;
    navigator.clipboard.writeText(JSON.stringify(getInpaintingJson(jsonPrompts[selectedVariationIndex]), null, 2));
    addToast("تم نسخ كود الدمج", "success");
  };

  const submitNewClient = () => {
      if (!newClientForm.name.trim()) {
          addToast("يرجى إدخال اسم العميل", "error");
          return;
      }
      onCreateClient(newClientForm);
      setNewClientForm({ name: '', industry: '', contactPerson: '', email: '' });
      setClientGateMode('search');
  };

  // --- MANUAL OVERRIDE HANDLERS ---
  const startEditingJson = () => {
    if (!jsonPrompts || !jsonPrompts[selectedVariationIndex]) return;
    setJsonEditValue(JSON.stringify(jsonPrompts[selectedVariationIndex], null, 2));
    setIsEditingJson(true);
    setJsonError(null);
  };

  const cancelEditingJson = () => {
      setIsEditingJson(false);
      setJsonError(null);
  };

  const saveEditedJson = () => {
      try {
          const parsed = JSON.parse(jsonEditValue);
          if (setJsonPrompts && jsonPrompts) {
              const updated = [...jsonPrompts];
              updated[selectedVariationIndex] = parsed;
              setJsonPrompts(updated);
              setIsEditingJson(false);
              setJsonError(null);
              addToast("تم تحديث الكود يدوياً (Manual Override)", "success");
          }
      } catch (e) {
          setJsonError("Syntax Safety Lock: كود JSON يحتوي على أخطاء نحوية ولا يمكن حفظه.");
      }
  };

  const renderVisualRatio = (ratio: string) => {
      const r = ratio.replace(/\s/g, '');
      let w = 'w-6';
      let h = 'h-6';
      let icon = <Layout size={16}/>;

      if (r === '16:9') { w = 'w-8'; h = 'h-5'; icon = <Monitor size={12}/>; }
      else if (r === '9:16') { w = 'w-5'; h = 'h-8'; icon = <Smartphone size={12}/>; }
      else if (r === '4:5') { w = 'w-5'; h = 'h-7'; }
      else if (r === '3:2') { w = 'w-7'; h = 'h-5'; }
      else if (r === '21:9') { w = 'w-10'; h = 'h-4'; }

      return (
          <div className={`border-2 border-current rounded-sm ${w} ${h} flex items-center justify-center`}>
              {/* Optional inner icon if space permits */}
          </div>
      );
  };

  const renderDashboardInfo = () => {
      if (!jsonPrompts || !jsonPrompts[selectedVariationIndex]) return null;
      const active = jsonPrompts[selectedVariationIndex];
      const complexity = active.client_input_analysis?.brief_complexity_score || 5;
      
      let techDetailsDisplay = "N/A";
      let techDetailsFull = "N/A";
      if (active.technical_details) {
          const strVal = typeof active.technical_details === 'string' ? active.technical_details : JSON.stringify(active.technical_details);
          techDetailsDisplay = strVal.substring(0, 20) + '...';
          techDetailsFull = strVal;
      }

      // Extract colors
      const extractedColors = extractColors(active.color_palette || '');

      return (
        <>
            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border dark:border-slate-800 shadow-sm hover:shadow-md transition-all">
                <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1 flex justify-between">
                    <span>الموديل (Engine)</span>
                    <span className="text-[9px] bg-slate-100 dark:bg-slate-800 px-1.5 rounded text-slate-500">{selectedModel.split(' ')[0]}</span>
                </div>
                <div className="font-medium text-sm text-purple-600 dark:text-purple-400 truncate" title={selectedModel}>{selectedModel}</div>
            </div>
            
            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border dark:border-slate-800 shadow-sm hover:shadow-md transition-all">
                <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1">الموضوع (Subject)</div>
                <div className="font-mono text-sm dark:text-white font-bold truncate" title={active.subject?.description}>{active.subject?.type || "N/A"}</div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border dark:border-slate-800 shadow-sm hover:shadow-md transition-all">
                <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1">التفاصيل التقنية</div>
                <div className="font-medium text-sm text-amber-600 dark:text-amber-400 truncate" title={techDetailsFull}>{techDetailsDisplay}</div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border dark:border-slate-800 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
                <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1 flex items-center gap-1"><KodraIcon icon={Cpu} size={10}/> التعقيد</div>
                <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div 
                        className={`h-full rounded-full transition-all duration-500 ${complexity > 7 ? 'bg-green-500' : complexity > 4 ? 'bg-amber-500' : 'bg-red-500'}`} 
                        style={{ width: `${complexity * 10}%` }} 
                    />
                </div>
                <div className="flex justify-between text-[10px] mt-1 font-mono dark:text-slate-400">
                    <span>1</span>
                    <span className="font-bold text-slate-800 dark:text-white">{complexity}/10</span>
                    <span>10</span>
                </div>
            </div>

            {/* COLOR PALETTE VISUALIZER */}
            {extractedColors.length > 0 && (
                 <div className="col-span-1 md:col-span-2 lg:col-span-4 bg-white dark:bg-slate-900 p-4 rounded-xl border dark:border-slate-800 shadow-sm hover:shadow-md transition-all">
                    <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-2 flex items-center gap-1"><KodraIcon icon={PaletteIcon} size={10}/> باليت الألوان (Chromatic Analysis)</div>
                    <div className="flex gap-2 flex-wrap">
                        {extractedColors.map((color, idx) => (
                            <button
                                key={idx}
                                onClick={() => {
                                    navigator.clipboard.writeText(color);
                                    addToast(`تم نسخ كود اللون: ${color}`, 'info');
                                }}
                                className="group relative w-8 h-8 md:w-10 md:h-10 rounded-lg border dark:border-slate-700 shadow-sm hover:scale-110 transition-transform cursor-copy"
                                style={{ backgroundColor: color }}
                                title={`نسخ ${color}`}
                            >
                                <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[9px] bg-black text-white px-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
                                    {color}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </>
      );
  };

  return (
    <>
      <Steps currentStep={step} />
      <article className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 md:p-8 shadow-xl relative min-h-[500px] animate-fade-in transition-all">
      
      {(step > AppStep.STRATEGY_GENERATION || isStrategyLocked) && strategy && (<StrategyContextBar strategy={strategy} />)}

      {step === AppStep.BRIEF_INPUT && (
          <div className="space-y-6 animate-fade-in">
                
                {!selectedClientId ? (
                     <div className="max-w-xl mx-auto py-10 animate-slide-up">
                         <div className="text-center mb-8">
                             <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/20">
                                 <KodraIcon icon={User} size={32} />
                             </div>
                             <h2 className="text-2xl font-black dark:text-white mb-2">تسجيل الدخول للمشروع</h2>
                             <p className="text-slate-500 dark:text-slate-400">يرجى تحديد العميل لبدء جلسة العمل. يتم حفظ جميع البيانات تلقائياً في قاعدة البيانات.</p>
                         </div>

                         <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl border dark:border-slate-700 p-2 flex mb-6">
                             <button 
                                onClick={() => setClientGateMode('search')}
                                className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${clientGateMode === 'search' ? 'bg-white dark:bg-slate-700 shadow text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'}`}
                             >
                                 <KodraIcon icon={Search} size={16}/> عميل مسجل
                             </button>
                             <button 
                                onClick={() => setClientGateMode('create')}
                                className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${clientGateMode === 'create' ? 'bg-white dark:bg-slate-700 shadow text-amber-600 dark:text-amber-400' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'}`}
                             >
                                 <KodraIcon icon={UserPlus} size={16}/> عميل جديد
                             </button>
                         </div>

                         {clientGateMode === 'search' ? (
                             <div className="space-y-4">
                                 <div className="relative">
                                     <Search className="absolute right-4 top-3.5 text-slate-400" size={20}/>
                                     <select 
                                        className="w-full p-3.5 pr-12 rounded-xl border dark:border-slate-700 bg-white dark:bg-slate-900 dark:text-white outline-none focus:ring-2 ring-blue-500 appearance-none cursor-pointer"
                                        onChange={(e) => setSelectedClientId(e.target.value)}
                                        value=""
                                     >
                                         <option value="" disabled>-- اختر من القائمة --</option>
                                         {clients.map(c => (
                                             <option key={c.id} value={c.id}>{c.name} {c.industry ? `(${c.industry})` : ''}</option>
                                         ))}
                                     </select>
                                 </div>
                                 <p className="text-center text-xs text-slate-400">أو قم بالبحث في مركز البيانات إذا لم تجد العميل هنا.</p>
                             </div>
                         ) : (
                             <div className="space-y-3 bg-white dark:bg-slate-900 p-6 rounded-xl border dark:border-slate-800 shadow-sm">
                                 <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-500">اسم العميل / الشركة *</label>
                                    <input 
                                        value={newClientForm.name}
                                        onChange={(e) => setNewClientForm({...newClientForm, name: e.target.value})}
                                        className="w-full p-2.5 rounded-lg border dark:border-slate-700 bg-slate-50 dark:bg-slate-950 dark:text-white outline-none focus:ring-1 ring-amber-500"
                                        placeholder="مثلاً: شركة المصطفى"
                                    />
                                 </div>
                                 <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-500">المجال (Industry)</label>
                                    <input 
                                        value={newClientForm.industry}
                                        onChange={(e) => setNewClientForm({...newClientForm, industry: e.target.value})}
                                        className="w-full p-2.5 rounded-lg border dark:border-slate-700 bg-slate-50 dark:bg-slate-950 dark:text-white outline-none focus:ring-1 ring-amber-500"
                                        placeholder="مثلاً: أغذية ومشروبات"
                                    />
                                 </div>
                                 <div className="grid grid-cols-2 gap-3">
                                     <div className="space-y-1">
                                        <label className="text-xs font-bold text-slate-500">شخص التواصل</label>
                                        <input 
                                            value={newClientForm.contactPerson}
                                            onChange={(e) => setNewClientForm({...newClientForm, contactPerson: e.target.value})}
                                            className="w-full p-2.5 rounded-lg border dark:border-slate-700 bg-slate-50 dark:bg-slate-950 dark:text-white outline-none focus:ring-1 ring-amber-500"
                                        />
                                     </div>
                                     <div className="space-y-1">
                                        <label className="text-xs font-bold text-slate-500">البريد الإلكتروني</label>
                                        <input 
                                            value={newClientForm.email}
                                            onChange={(e) => setNewClientForm({...newClientForm, email: e.target.value})}
                                            className="w-full p-2.5 rounded-lg border dark:border-slate-700 bg-slate-50 dark:bg-slate-950 dark:text-white outline-none focus:ring-1 ring-amber-500"
                                        />
                                     </div>
                                 </div>
                                 <button 
                                    onClick={submitNewClient}
                                    className="w-full mt-2 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold transition-colors flex items-center justify-center gap-2"
                                 >
                                     <KodraIcon icon={CheckCircle} size={18}/> حفظ وبدء المشروع
                                 </button>
                             </div>
                         )}
                     </div>
                ) : (
                    // --- UNLOCKED INTERFACE ---
                    <div className="animate-fade-in">
                        {/* Header & Client Widget */}
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                            <div className="w-full md:w-2/3">
                                {/* CLIENT INTELLIGENCE WIDGET */}
                                {selectedClientContext && (
                                    <div className="bg-indigo-50 dark:bg-indigo-900/10 border-r-4 border-indigo-500 rounded-lg shadow-sm relative group overflow-hidden transition-all duration-300">
                                        {/* Widget Header (Always Visible) */}
                                        <div 
                                            className="p-3 flex items-center justify-between cursor-pointer"
                                            onClick={() => setIsClientWidgetExpanded(!isClientWidgetExpanded)}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">العميل الحالي:</span>
                                                    <span className="text-sm font-black dark:text-white">{selectedClientContext.name}</span>
                                                </div>
                                                
                                                {selectedClientContext.industry && (
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-300 shadow-sm border border-indigo-100 dark:border-indigo-800">
                                                        <KodraIcon icon={Briefcase} size={10}/> {selectedClientContext.industry}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                 <button 
                                                    onClick={(e) => { e.stopPropagation(); setSelectedClientId(''); }}
                                                    className="text-slate-400 hover:text-red-500 p-1 rounded transition-colors"
                                                    title="تغيير العميل"
                                                >
                                                    <KodraIcon icon={RefreshCw} size={14}/>
                                                </button>
                                                <div className="text-indigo-400">
                                                    {isClientWidgetExpanded ? <KodraIcon icon={ChevronUp} size={16}/> : <KodraIcon icon={ChevronDown} size={16}/>}
                                                </div>
                                            </div>
                                        </div>
                                        
                                        {/* Widget Body (Collapsible) */}
                                        {isClientWidgetExpanded && (
                                            <div className="px-3 pb-3 pt-0 border-t border-indigo-100 dark:border-indigo-800/30 animate-fade-in">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                                                    {selectedClientContext.notes && (
                                                        <div className="text-xs text-slate-600 dark:text-slate-400 bg-white/50 dark:bg-slate-800/50 p-2 rounded-md">
                                                            <div className="font-bold text-[10px] text-slate-400 mb-1 flex items-center gap-1"><KodraIcon icon={StickyNote} size={10}/> ملاحظات استراتيجية</div>
                                                            <span className="italic leading-relaxed">"{selectedClientContext.notes}"</span>
                                                        </div>
                                                    )}
                                                    <div className="flex flex-col gap-2">
                                                        {selectedClientContext.contactPerson && (
                                                            <div className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-2">
                                                                <KodraIcon icon={User} size={12} className="text-indigo-400"/> {selectedClientContext.contactPerson}
                                                            </div>
                                                        )}
                                                        {selectedClientContext.logo && (
                                                             <div className="text-[10px] text-green-600 flex items-center gap-1 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-md w-fit">
                                                                <KodraIcon icon={CheckCircle} size={10}/> شعار العميل متوفر
                                                             </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            <span className={`text-[10px] font-bold px-3 py-1 rounded-full flex items-center gap-1 transition-all self-start md:self-center ${briefImage ? 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400' : 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'}`}>
                                {briefImage ? <KodraIcon icon={ImageIcon} size={12}/> : <KodraIcon icon={FileText} size={12}/>}
                                {briefImage ? 'Image Analysis Mode' : 'Text Brief Mode'}
                            </span>
                        </div>
                        
                        {/* STRATEGY LOCKED ALERT */}
                        {isStrategyLocked && (
                             <div className="bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-400 p-4 rounded-xl border border-amber-300 dark:border-amber-700 mb-6 flex items-center justify-between shadow-sm animate-pulse-slow">
                                <div className="flex items-center gap-3">
                                    <div className="bg-amber-500 text-white p-2 rounded-full"><KodraIcon icon={Lock} size={18}/></div>
                                    <div>
                                        <h4 className="font-bold text-sm">وضع الحفاظ على الروح (Strategy Locked)</h4>
                                        <p className="text-xs opacity-90">يتم الآن تطبيق نفس الاستراتيجية والألوان والقيود على أي مدخلات جديدة.</p>
                                    </div>
                                </div>
                                <button 
                                    onClick={onUnlockStrategy}
                                    className="bg-white dark:bg-slate-900 hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-600 dark:text-slate-300 hover:text-red-600 px-3 py-1.5 rounded-lg text-xs font-bold border dark:border-slate-700 flex items-center gap-1 transition-colors"
                                >
                                    <KodraIcon icon={Unlock} size={14}/> إلغاء وتوليد جديد
                                </button>
                             </div>
                        )}

                        <div className="space-y-2 mb-6">
                            <div className="flex justify-between items-center">
                                <label className="font-bold dark:text-white flex gap-2 items-center"><KodraIcon icon={Terminal} size={18}/> {isStrategyLocked ? 'العنصر الجديد (New Subject Brief)' : 'طلب العميل (Client Brief)'}</label>
                                <div className="flex gap-2">
                                    {QUICK_FILLS.map((q, i) => (
                                        <button key={i} onClick={() => setBriefText(q.text)} className="text-[10px] bg-slate-100 dark:bg-slate-800 hover:bg-amber-100 dark:hover:bg-amber-900/30 text-slate-600 dark:text-slate-300 hover:text-amber-600 dark:hover:text-amber-400 px-2 py-1 rounded-md transition-colors flex items-center gap-1">
                                            <KodraIcon icon={Zap} size={10}/> {q.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="relative group">
                                <textarea 
                                    value={briefText} 
                                    onChange={(e)=>setBriefText(e.target.value)} 
                                    onKeyDown={handleKeyDown}
                                    placeholder={isStrategyLocked ? "أدخل وصف العنصر الجديد فقط (مثلاً: صورة لمنتج آخر، زاوية مختلفة)... الروح والستايل محفوظين." : "أدخل تفاصيل المشروع هنا (وصف، عناصر بصرية، جمهور، مود)..."}
                                    className={`w-full h-48 bg-slate-50 dark:bg-slate-950 border rounded-xl p-4 dark:text-white outline-none resize-none shadow-inner transition-shadow text-sm leading-relaxed ${isStrategyLocked ? 'border-amber-400 focus:ring-2 ring-amber-500' : 'border-slate-200 dark:border-slate-800 focus:ring-2 ring-amber-500'}`}
                                />
                                {briefText && (
                                    <button onClick={() => setBriefText('')} className="absolute bottom-4 left-4 p-1.5 bg-white dark:bg-slate-900 text-red-400 hover:text-red-500 border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm hover:shadow transition-all opacity-60 group-hover:opacity-100" title="مسح النص">
                                        <KodraIcon icon={X} size={14} />
                                    </button>
                                )}
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start mb-6">
                            <div className="md:col-span-1">
                                <label className="block mb-2 font-medium dark:text-white flex items-center gap-2 text-sm"><KodraIcon icon={Globe} size={16}/> لغة النص في التصميم</label>
                                <div className="grid grid-cols-2 gap-2 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-xl">
                                    <button 
                                        onClick={() => handleLanguageScopeChange(false)}
                                        className={`flex flex-col items-center justify-center py-3 rounded-lg text-xs font-bold transition-all ${!requiresArabic ? 'bg-white dark:bg-slate-700 shadow-md text-slate-800 dark:text-white' : 'text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
                                    >
                                        <span className="text-sm mb-0.5">Global / English</span>
                                        <span className="text-[9px] opacity-80 font-normal">جميع الموديلات</span>
                                    </button>
                                    <button 
                                        onClick={() => handleLanguageScopeChange(true)}
                                        className={`flex flex-col items-center justify-center py-3 rounded-lg text-xs font-bold transition-all ${requiresArabic ? 'bg-amber-500 text-white shadow' : 'text-slate-500 hover:text-slate-700'}`}
                                    >
                                        <span className="text-sm mb-0.5">عربي (Arabic)</span>
                                        <span className="text-[9px] opacity-80 font-normal">يُجبر Nano Banana</span>
                                    </button>
                                </div>
                            </div>

                            <div className="md:col-span-1">
                                <label className="block mb-2 font-medium dark:text-white text-sm"><KodraIcon icon={ImageIcon} size={16} className="inline mr-1"/> الموديل (AI Model)</label>
                                <div className="relative">
                                    <select 
                                        value={selectedModel} 
                                        onChange={(e)=>setSelectedModel(e.target.value as ModelType)} 
                                        className={`w-full p-3 rounded-xl border bg-white dark:bg-slate-950 dark:text-white focus:ring-2 ring-amber-500 outline-none text-sm appearance-none ${requiresArabic ? 'bg-amber-50 dark:bg-amber-900/10 border-amber-200 cursor-not-allowed' : ''}`}
                                        disabled={requiresArabic}
                                    >
                                        {requiresArabic ? (
                                            <optgroup label="Arabic Specialized">
                                                {ARABIC_MODELS.map(m => <option key={m} value={m}>{m}</option>)}
                                            </optgroup>
                                        ) : (
                                            <>
                                                <optgroup label="Core Engine (Google)">
                                                    {GOOGLE_MODELS.map(m => <option key={m} value={m}>{m}</option>)}
                                                </optgroup>
                                                <optgroup label="Flux Ecosystem">
                                                    {FLUX_MODELS.map(m => <option key={m} value={m}>{m}</option>)}
                                                </optgroup>
                                                <optgroup label="Specialized Arsenal">
                                                    {SPECIALIZED_MODELS.map(m => <option key={m} value={m}>{m}</option>)}
                                                </optgroup>
                                            </>
                                        )}
                                    </select>
                                    <div className="absolute top-4 left-3 pointer-events-none text-slate-500">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                                    </div>
                                </div>
                                {requiresArabic && <div className="text-[10px] text-amber-600 dark:text-amber-400 mt-1.5 flex items-center gap-1"><KodraIcon icon={AlertTriangle} size={10}/> تم تثبيت الموديل لدعم النصوص العربية</div>}
                            </div>

                            <div className="md:col-span-1">
                                <label className="block mb-2 font-medium dark:text-white text-sm">الأبعاد (Ratio)</label>
                                <select value={forceAspectRatio} onChange={(e)=>setForceAspectRatio(e.target.value)} className="w-full p-3 rounded-xl border bg-white dark:bg-slate-950 dark:text-white focus:ring-2 ring-amber-500 outline-none text-sm">
                                    <option>تلقائي (Auto)</option>
                                    <option>1:1 (Square)</option>
                                    <option>16:9 (Cinematic)</option>
                                    <option>9:16 (Story)</option>
                                    <option>4:5 (Portrait)</option>
                                    <option>3:2 (Classic)</option>
                                </select>
                            </div>
                        </div>
                        
                        <div className="mb-6">
                            <label className="block mb-2 font-medium dark:text-white">صورة مرجعية (Optional)</label>
                            <div 
                                className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer relative transition-all group ${briefImage ? 'border-amber-500 bg-amber-50/10' : isDragging ? 'border-green-500 bg-green-50/10' : 'hover:border-amber-500 hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}
                                onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop}
                            >
                                <input type="file" onChange={handleImageUpload} className="absolute inset-0 opacity-0 z-10 cursor-pointer"/>
                                {briefImage ? (
                                    <div className="relative z-20">
                                        <img src={briefImage} alt="Uploaded Brief" className="max-h-40 mx-auto rounded shadow-lg mb-3 object-contain"/>
                                        <div className="flex justify-center items-center gap-2">
                                            <span className="text-xs font-bold text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30 px-3 py-1 rounded-full flex items-center gap-1"><KodraIcon icon={CheckCircle} size={12}/> تم رفع الصورة</span>
                                            
                                            <div className="flex gap-1 z-30">
                                                {onEditImage && (
                                                    <button 
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            e.preventDefault();
                                                            onEditImage(briefImage);
                                                        }}
                                                        className="text-amber-500 hover:text-amber-700 bg-white dark:bg-slate-800 p-1.5 rounded-full shadow hover:scale-110 transition-transform" 
                                                        title="تعديل/تحسين الصورة"
                                                    >
                                                        <KodraIcon icon={Pencil} size={18}/>
                                                    </button>
                                                )}
                                                <button 
                                                    onClick={clearImage} 
                                                    className="text-red-500 hover:text-red-700 bg-white dark:bg-slate-800 p-1.5 rounded-full shadow hover:scale-110 transition-transform" 
                                                    title="حذف الصورة"
                                                >
                                                    <KodraIcon icon={XCircle} size={18}/>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="py-4">
                                        <KodraIcon icon={UploadCloud} className={`mx-auto mb-3 transition-colors ${isDragging ? 'text-green-500 scale-110' : 'text-slate-400 group-hover:text-amber-500'}`} size={40}/>
                                        <span className="text-sm dark:text-slate-400 font-medium">{isDragging ? "أفلت الصورة هنا!" : "اسحب الصورة هنا أو انقر للرفع"}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="flex justify-end pt-4">
                            {isStrategyLocked ? (
                                <button onClick={handleEngineering} disabled={isLoading} className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-10 py-3.5 rounded-xl font-bold w-full md:w-auto shadow-lg hover:shadow-xl transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                                    {isLoading ? <LoadingSpinner message={getLoadingMessage()} /> : <><KodraIcon icon={Wand2} size={18}/> تطبيق الروح على الجديد (Clone DNA)</>}
                                </button>
                            ) : (
                                <button onClick={handleGenerateStrategy} disabled={isLoading} className="bg-gradient-to-r from-amber-500 to-amber-600 hover:to-amber-700 text-white px-10 py-3.5 rounded-xl font-bold w-full md:w-auto shadow-lg hover:shadow-xl transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                                    {isLoading ? <LoadingSpinner message={getLoadingMessage()} /> : <><KodraIcon icon={Sparkles} size={18}/> بدء التحليل</>}
                                </button>
                            )}
                        </div>
                    </div>
                )}
          </div>
      )}
      
      {step === AppStep.STRATEGY_GENERATION && strategy && (
           <div className="space-y-8 animate-fade-in">
              <div className="flex justify-between flex-wrap gap-2 items-center">
                  <h3 className="text-2xl font-bold dark:text-white">الاستراتيجية المقترحة</h3>
                  <span className="bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                    {strategy.sourceMode === 'image' ? <KodraIcon icon={ImageIcon} size={12}/> : <KodraIcon icon={FileText} size={12}/>}
                    {strategy.sourceMode === 'image' ? 'تحليل بصري' : 'تحليل نصي'}
                  </span>
              </div>

              {strategy.recommendedModel && (
                 <div className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-200 dark:border-indigo-800 rounded-xl p-4 flex items-center justify-between animate-fade-in">
                    <div className="flex items-center gap-3">
                       <div className="bg-indigo-100 dark:bg-indigo-900/50 p-2 rounded-full text-indigo-600 dark:text-indigo-300 shadow-sm">
                           <KodraIcon icon={Cpu} size={24} />
                       </div>
                       <div>
                           <div className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider flex items-center gap-1">النظام الخبير يقترح (AI Suggestion)</div>
                           <div className="text-sm font-bold dark:text-white mt-0.5 flex items-center gap-2">
                              {strategy.recommendedModel}
                              <span className="text-[10px] font-normal text-slate-500 bg-white dark:bg-slate-900 px-2 py-0.5 rounded-full border border-indigo-100 dark:border-indigo-800">الأفضل لهذا الستايل</span>
                           </div>
                       </div>
                    </div>
                    {selectedModel === strategy.recommendedModel ? (
                       <div className="text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1 border border-green-100 dark:border-green-900">
                          <KodraIcon icon={CheckCircle} size={14} /> تم التفعيل
                       </div>
                    ) : (
                        <button 
                            onClick={() => {
                                const modelEnum = Object.values(ModelType).find(m => m === strategy.recommendedModel);
                                if (modelEnum) setSelectedModel(modelEnum);
                            }}
                            className="text-indigo-600 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-900/30 hover:bg-indigo-100 dark:hover:bg-indigo-800 px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1 border border-indigo-100 dark:border-indigo-700 transition-colors"
                        >
                           تطبيق الاقتراح <KodraIcon icon={ArrowRight} size={12}/>
                        </button>
                    )}
                 </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[{l:'الجمهور',v:strategy.targetAudience},{l:'الرسالة',v:strategy.coreMessage},{l:'المنصة',v:strategy.targetPlatform}].map((x,i)=>(
                      <div key={i} className="p-5 border rounded-xl dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50">
                          <h5 className="text-xs font-bold text-slate-500 mb-1">{x.l}</h5>
                          <p className="font-bold dark:text-white text-sm leading-relaxed">{x.v}</p>
                      </div>
                  ))}
              </div>
              <section className="p-6 border rounded-xl dark:border-slate-800 bg-white dark:bg-slate-900">
                  <h4 className="font-bold mb-4 dark:text-white flex items-center gap-2"><KodraIcon icon={Layers} className="text-amber-500" size={18}/> تحديد المخرجات (Deliverables)</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {strategy.deliverableTypes.map((d, i) => (
                          <button key={i} onClick={() => { setSelectedDeliverableIndex(i); setForceAspectRatio('Auto'); }} className={`p-4 border rounded-xl text-right transition-all flex justify-between items-center ${selectedDeliverableIndex === i ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20 shadow-md transform scale-[1.02]' : 'dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
                              <div className="flex items-center gap-3">
                                  {renderVisualRatio(d.ratio)}
                                  <div>
                                    <div className="font-bold dark:text-white">{d.type}</div>
                                    <div className="text-xs text-slate-500 mt-1">{d.ratio}</div>
                                  </div>
                              </div>
                              {selectedDeliverableIndex === i && <KodraIcon icon={CheckCircle} className="text-amber-500" size={20}/>}
                          </button>
                      ))}
                  </div>
              </section>
              <div className="flex flex-col md:flex-row justify-between pt-6 border-t dark:border-slate-800 gap-4">
                  <button onClick={()=>setStep(AppStep.BRIEF_INPUT)} className="dark:text-white text-slate-500 hover:text-slate-800 dark:hover:text-white px-4 py-2 order-2 md:order-1 transition-colors">تعديل المدخلات</button>
                  <div className="flex gap-4 order-1 md:order-2 w-full md:w-auto">
                      <button onClick={handleEngineering} disabled={isLoading} className="bg-amber-500 text-white px-8 py-3 rounded-xl font-bold w-full md:w-auto shadow-lg hover:bg-amber-600 transition-colors flex items-center justify-center gap-2 relative overflow-hidden group">
                           <div className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent to-white opacity-20 group-hover:animate-shine" />
                          {isLoading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"/> : <><KodraIcon icon={Eye} size={18}/> تفعيل Vision Matrix 3.0</>}
                      </button>
                  </div>
              </div>
          </div>
      )}

      {(step === AppStep.JSON_ENGINEERING || step === AppStep.VALIDATION) && (
          <div className="animate-fade-in space-y-6">
              {isLoading ? (
                  <LoadingSpinner message={getLoadingMessage()} />
              ) : (
                  <>
                  <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border dark:border-slate-800">
                      <h3 className="text-xl font-bold dark:text-white">تقرير التحقق (Validation)</h3>
                      {validation?.isValid ? <span className="text-green-500 font-bold flex gap-2 text-sm md:text-base bg-green-100 dark:bg-green-900/20 px-3 py-1 rounded-full"><KodraIcon icon={CheckCircle} size={18}/> 100% Valid</span> : <span className="text-red-500 font-bold flex gap-2 text-sm md:text-base bg-red-100 dark:bg-red-900/20 px-3 py-1 rounded-full"><KodraIcon icon={AlertTriangle} size={18}/> Issues Found</span>}
                  </div>
                  {validation && !validation.isValid && validation.errors.length > 0 && (
                      <div className="bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 p-5 rounded-xl text-sm border border-red-200 dark:border-red-900/30">
                          <strong className="block mb-2 flex items-center gap-2"><KodraIcon icon={XCircle} size={16}/> الأخطاء المكتشفة:</strong>
                          <ul className="list-disc pl-5 space-y-1 opacity-90">{validation.errors.map((e,i)=><li key={i}>{e}</li>)}</ul>
                          
                          <button 
                            onClick={handleAutoFix}
                            disabled={isLoading}
                            className="mt-4 bg-red-100 hover:bg-red-200 dark:bg-red-800/40 dark:hover:bg-red-800/60 text-red-700 dark:text-red-300 px-4 py-2 rounded-lg font-bold text-xs flex items-center gap-2 transition-colors"
                          >
                              <KodraIcon icon={Wand2} size={14}/> إصلاح الأخطاء تلقائياً (Auto-Fix)
                          </button>
                      </div>
                  )}
                  <div className="flex justify-end pt-4">
                      <button onClick={() => setStep(AppStep.FINAL_OUTPUT)} className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-xl font-bold w-full md:w-auto shadow-lg transition-all flex items-center justify-center gap-2"><KodraIcon icon={FileJson} size={18}/> عرض الكود النهائي</button>
                  </div>
                  </>
              )}
          </div>
      )}

      {step === AppStep.FINAL_OUTPUT && jsonPrompts && (
          <div className="space-y-6 animate-fade-in">
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/10 dark:to-orange-900/10 p-6 rounded-xl border border-amber-200 dark:border-amber-800/50">
                  <h3 className="text-xl font-bold dark:text-white mb-2 flex items-center gap-2"><KodraIcon icon={Terminal} className="text-amber-500"/> الكود المخصص (Ready for Model)</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">انسخ الكود التالي وضعه مباشرة في المولد ({selectedModel}).</p>
                  
                  {/* GENERATION NAVIGATION (History) */}
                  <div className="flex justify-between items-center mb-4">
                      <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
                          {jsonPrompts.map((_, index) => (
                              <button key={index} onClick={() => { setSelectedVariationIndex(index); setIsEditingJson(false); }} className={`px-4 py-2 rounded-lg font-bold text-sm whitespace-nowrap transition-all border ${selectedVariationIndex === index ? 'bg-amber-500 text-white border-amber-500 shadow-md' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'}`}><KodraIcon icon={Wand2} size={12} className="inline-block mr-1"/> نموذج {index + 1}</button>
                          ))}
                      </div>
                      
                      {/* UNDO / REDO CONTROLS */}
                      {promptHistory && promptHistory.length > 1 && (
                          <div className="flex gap-1 bg-white dark:bg-slate-800 p-1 rounded-lg border dark:border-slate-700 shadow-sm ml-2">
                              <button 
                                onClick={onUndo} 
                                disabled={(historyIndex || 0) <= 0} 
                                className="p-2 text-slate-500 hover:text-indigo-600 disabled:opacity-30 transition-colors" 
                                title="التوليد السابق (Undo)"
                              >
                                  <KodraIcon icon={RotateCcw} size={16}/>
                              </button>
                              <button 
                                onClick={onRedo} 
                                disabled={(historyIndex || 0) >= promptHistory.length - 1} 
                                className="p-2 text-slate-500 hover:text-indigo-600 disabled:opacity-30 transition-colors" 
                                title="التوليد التالي (Redo)"
                              >
                                  <KodraIcon icon={RotateCw} size={16}/>
                              </button>
                          </div>
                      )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">{renderDashboardInfo()}</div>
                  
                  {/* VIEW TOGGLE & MAIN CONTENT */}
                  <div className={`bg-[#1e1e1e] dark:bg-[#1e1e1e] rounded-xl border border-slate-700 shadow-2xl relative overflow-hidden group transition-all ${isEditingJson ? 'ring-2 ring-blue-500' : ''}`}>
                      <div className="absolute top-0 right-0 bg-blue-600/20 text-blue-400 text-[10px] px-2 py-0.5 rounded-bl-lg font-mono border-b border-l border-blue-600/30 backdrop-blur-sm z-10 pointer-events-none">
                         VISION MATRIX 3.0 :: ACTIVE
                      </div>
                      <div className="flex justify-between items-center bg-[#252526] px-4 py-2 border-b border-[#3e3e42]">
                          
                          {/* TOGGLE BUTTONS */}
                          <div className="flex items-center gap-1 bg-black/20 p-0.5 rounded-lg border border-white/5">
                              <button 
                                onClick={() => setViewMode('code')}
                                className={`px-3 py-1 text-xs font-bold rounded flex items-center gap-1 transition-all ${viewMode === 'code' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
                              >
                                  <KodraIcon icon={FileJson} size={12}/> Code
                              </button>
                              <button 
                                onClick={() => setViewMode('matrix')}
                                className={`px-3 py-1 text-xs font-bold rounded flex items-center gap-1 transition-all ${viewMode === 'matrix' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
                              >
                                  <KodraIcon icon={Grid} size={12}/> Matrix View
                              </button>
                          </div>

                          <div className="flex gap-2">
                              {!isEditingJson ? (
                                  <>
                                    <button onClick={startEditingJson} className="text-slate-400 hover:text-blue-400 p-1 rounded hover:bg-white/10 transition-colors" title="تعديل يدوي (Manual Override)"><KodraIcon icon={Edit3} size={16}/></button>
                                    <button onClick={downloadTextFile} className="text-slate-400 hover:text-white p-1 rounded hover:bg-white/10 transition-colors" title="تحميل ملف نصي (.txt)"><KodraIcon icon={FileText} size={16}/></button>
                                    <button onClick={downloadJsonFile} className="text-slate-400 hover:text-white p-1 rounded hover:bg-white/10 transition-colors" title="تحميل ملف JSON"><KodraIcon icon={Download} size={16}/></button>
                                    <button onClick={copyToClipboard} className="text-slate-400 hover:text-white p-1 rounded hover:bg-white/10 transition-colors" title="نسخ الكود"><KodraIcon icon={Copy} size={16}/></button>
                                  </>
                              ) : (
                                  <>
                                    <button onClick={cancelEditingJson} className="text-slate-400 hover:text-red-400 p-1 rounded hover:bg-white/10 transition-colors flex items-center gap-1 text-xs font-bold"><KodraIcon icon={X} size={14}/> إلغاء</button>
                                    <button onClick={saveEditedJson} className="text-green-400 hover:text-green-300 bg-green-500/10 hover:bg-green-500/20 px-2 py-1 rounded transition-colors flex items-center gap-1 text-xs font-bold border border-green-500/30"><KodraIcon icon={Save} size={14}/> حفظ التعديلات</button>
                                  </>
                              )}
                          </div>
                      </div>
                      
                      <div className="relative bg-[#1e1e1e] min-h-[500px]">
                        {viewMode === 'matrix' && !isEditingJson ? (
                            <div className="p-6 h-[500px] overflow-y-auto custom-scrollbar bg-white dark:bg-slate-950">
                                <MatrixViewer json={jsonPrompts[selectedVariationIndex]} />
                            </div>
                        ) : (
                            isEditingJson ? (
                                <textarea 
                                    value={jsonEditValue}
                                    onChange={(e) => setJsonEditValue(e.target.value)}
                                    className="w-full h-[500px] bg-[#1e1e1e] text-green-400 font-mono text-sm p-6 outline-none resize-none leading-relaxed"
                                    spellCheck={false}
                                    style={{ fontFamily: '"Fira Code", monospace', lineHeight: '1.6' }}
                                />
                            ) : (
                                <div className="p-6 overflow-x-auto custom-scrollbar font-mono text-sm leading-relaxed max-h-[500px]" dir="ltr">
                                    <div className="text-green-400 mb-4 font-bold border-b border-green-900/30 pb-2 select-all">{getPrefixCode()}</div>
                                    <Suspense fallback={<LoadingSpinner />}><JsonViewer json={jsonPrompts[selectedVariationIndex]} /></Suspense>
                                </div>
                            )
                        )}
                      </div>
                  </div>
                  {jsonError && (
                      <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-lg flex items-center gap-2 text-sm font-bold animate-pulse">
                          <KodraIcon icon={AlertTriangle} size={16}/> {jsonError}
                      </div>
                  )}
              </div>
              <div className="pt-8 border-t dark:border-slate-800">
                  
                  {/* COLLAPSIBLE SMART INTEGRATION */}
                  <div className="bg-[#1e1e1e] rounded-xl border border-slate-700 overflow-hidden">
                      <button 
                        onClick={() => setIsIntegrationExpanded(!isIntegrationExpanded)}
                        className="w-full flex justify-between items-center px-4 py-3 bg-[#252526] hover:bg-[#2d2d2e] transition-colors"
                      >
                         <h4 className="font-bold text-slate-300 flex gap-2 items-center text-sm">
                            <KodraIcon icon={Hexagon} className="text-purple-500" size={16}/> وحدة الدمج الذكي (Smart Integration)
                         </h4>
                         <div className="flex items-center gap-2">
                             <span className="text-[10px] text-slate-500 font-mono">integration_config.json</span>
                             {isIntegrationExpanded ? <KodraIcon icon={ChevronUp} size={16} className="text-slate-400"/> : <KodraIcon icon={ChevronDown} size={16} className="text-slate-400"/>}
                         </div>
                      </button>
                      
                      {isIntegrationExpanded && (
                          <div className="animate-slide-up border-t border-slate-700">
                                <div className="flex justify-end px-4 py-2 bg-[#1e1e1e] border-b border-slate-700/50">
                                    <button onClick={copyInpaintingJson} className="text-slate-400 hover:text-white hover:bg-white/10 px-2 py-1 rounded transition-colors text-xs flex items-center gap-1">
                                        <KodraIcon icon={Copy} size={12}/> نسخ الكود
                                    </button>
                                </div>
                                <div className="p-4 overflow-x-auto" dir="ltr">
                                    <Suspense fallback={<LoadingSpinner />}><JsonViewer json={getInpaintingJson(jsonPrompts[selectedVariationIndex])}/></Suspense>
                                </div>
                          </div>
                      )}
                  </div>

              </div>
              <div className="flex flex-col md:flex-row gap-4 pt-8 border-t dark:border-slate-800">
                  <div className="flex-1 space-y-3">
                      <div className="relative">
                          <input 
                            type="text" 
                            placeholder="تحسين النتيجة (Refinement)..." 
                            className="w-full bg-slate-50 dark:bg-slate-950 border dark:border-slate-700 rounded-xl pl-10 pr-10 py-3 dark:text-white outline-none focus:ring-2 ring-amber-500 shadow-sm transition-shadow" 
                            value={refinementText} 
                            onChange={(e) => setRefinementText(e.target.value)} 
                          />
                          <KodraIcon icon={RefreshCw} className="absolute right-3 top-3.5 text-slate-400" size={18}/>
                          {refinementText && (
                              <button 
                                onClick={() => setRefinementText('')}
                                className="absolute left-3 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                              >
                                  <KodraIcon icon={X} size={16}/>
                              </button>
                          )}
                      </div>
                      <div className="flex flex-wrap gap-2">
                          {REFINEMENT_CHIPS.map((chip, idx) => (
                              <button 
                                key={idx}
                                onClick={() => setRefinementText(chip.text)}
                                className="text-[10px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-amber-500 dark:hover:border-amber-500 text-slate-600 dark:text-slate-400 px-2 py-1 rounded-full transition-colors"
                              >
                                  {chip.label}
                              </button>
                          ))}
                      </div>
                  </div>
                  <div className="flex gap-3 flex-wrap md:flex-nowrap">
                      <button 
                         onClick={onReuseStrategy}
                         className="bg-purple-100 hover:bg-purple-200 text-purple-700 dark:bg-purple-900/30 dark:hover:bg-purple-900/50 dark:text-purple-300 px-4 py-3 rounded-xl font-bold flex items-center gap-2 transition-colors w-full md:w-auto justify-center border border-purple-200 dark:border-purple-800"
                         title="إنشاء تصميم جديد بنفس الاستراتيجية (Visual Cloning)"
                      >
                         <KodraIcon icon={Repeat} size={18}/> تصميم آخر بنفس الروح
                      </button>

                      <button onClick={handleRegenerate} disabled={isLoading} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-colors w-full md:w-auto justify-center shadow-md">{isLoading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/> : <KodraIcon icon={RefreshCcw} size={18}/>} تحديث</button>
                      <button onClick={onReset} className="text-red-500 px-6 py-3 border border-red-200 dark:border-red-900/30 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors w-full md:w-auto justify-center font-medium">مشروع جديد</button>
                  </div>
              </div>
          </div>
      )}
      </article>
    </>
  );
};
