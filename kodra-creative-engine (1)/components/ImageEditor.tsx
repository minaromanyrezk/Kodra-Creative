
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { editImageWithGemini } from '../services/geminiService';
import { CompareSlider } from './CompareSlider';
import { Client, Layer, ImageEditorState, ProjectAsset } from '../types';
import { 
  Image as ImageIcon, UploadCloud, Sparkles, Download, Trash2, ImagePlus, Wand2, Stamp, Layers, 
  Palette, Eye, EyeOff, ArrowUp, ArrowDown, RotateCcw, RotateCw, Plus, Save, FolderPlus, 
  ChevronDown, ChevronUp, Sun, Contrast, Droplet, CornerUpLeft, BrainCircuit
} from 'lucide-react';
import { KodraIcon } from './KodraIcon';

interface ImageEditorProps {
  addToast: (message: string, type: 'success' | 'error' | 'info') => void;
  
  // Persistence Props
  state: ImageEditorState;
  onStateChange: (newState: Partial<ImageEditorState>) => void;

  pendingImage?: string | null;
  onAnalyze?: (image: string) => void;
  clients?: Client[];
  activeClientId?: string;
  onUpdateClient?: (client: Client) => void;
  currentProjectId?: string | null;
  onSaveAsset?: (assetBlob: string) => void;
  onOpenLibrary?: (target: 'editor-base' | 'editor-layer') => void;
  currentProjectAssets?: ProjectAsset[];
}

const EDITOR_PRESETS = [
  { label: 'سينمائي', prompt: 'Apply a cinematic lighting style, high contrast, teal and orange color grading.' },
  { label: 'أبيض وأسود', prompt: 'Convert to artistic black and white photography, high contrast, noir style.' },
  { label: 'سايبربانك', prompt: 'Apply cyberpunk aesthetic, neon lights, futuristic atmosphere, glow effects.' },
  { label: 'HDR', prompt: 'Enhance details, apply HDR effect, sharpen image, improve lighting.' }
];

export const ImageEditor: React.FC<ImageEditorProps> = ({ 
    addToast, 
    state,
    onStateChange,
    pendingImage, 
    onAnalyze, 
    clients = [], 
    activeClientId,
    onUpdateClient,
    currentProjectId,
    onSaveAsset,
    onOpenLibrary,
    currentProjectAssets
}) => {
  const { editorImage, editorPrompt, editedResult, layers, adjustments, mode } = state;
  const [isControlsOpen, setIsControlsOpen] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Sync Pending Image (One-off)
  useEffect(() => {
    if (pendingImage && pendingImage !== editorImage) {
        onStateChange({ editorImage: pendingImage, editedResult: null });
    }
  }, [pendingImage, editorImage, onStateChange]); 

  // Load Client Assets (Only if layers are empty to avoid overwriting work)
  useEffect(() => {
    if (mode === 'branding' && activeClientId && layers.length === 0) {
       const client = clients.find(c => c.id === activeClientId);
       if (client) {
           let newLayers: Layer[] = [];
           if (client.logo) newLayers.push({ id: 'client-logo', type: 'logo', src: client.logo, visible: true, x: client.logoSettings?.x ?? 50, y: client.logoSettings?.y ?? 50, scale: client.logoSettings?.scale ?? 20, opacity: client.logoSettings?.opacity ?? 100, zIndex: 10 });
           if (client.watermark) newLayers.push({ id: 'client-watermark', type: 'watermark', src: client.watermark, visible: true, x: client.watermarkSettings?.x ?? 90, y: client.watermarkSettings?.y ?? 90, scale: client.watermarkSettings?.scale ?? 10, opacity: client.watermarkSettings?.opacity ?? 50, zIndex: 20 });
           
           if (newLayers.length > 0) {
               onStateChange({ layers: newLayers });
               addToast(`تم استيراد هوية: ${client.name}`, "info");
           }
       }
    }
  }, [mode, activeClientId, clients, layers.length, onStateChange, addToast]); 

  // --- Handlers ---
  const handleEditorUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => { 
        if (typeof reader.result === 'string') {
            onStateChange({ editorImage: reader.result, editedResult: null });
            addToast("تم رفع الصورة الأساسية", "success");
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLayerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        Array.from(files).forEach((file: File) => {
            const reader = new FileReader();
            reader.onloadend = () => { 
              if (typeof reader.result === 'string') {
                const newLayer: Layer = { id: Date.now() + Math.random().toString(), type: 'upload', src: reader.result, visible: true, x: 50, y: 50, scale: 30, opacity: 100, zIndex: layers.length + 10 };
                onStateChange({ layers: [...layers, newLayer] });
                addToast("تم إضافة طبقة", "success");
              }
            };
            reader.readAsDataURL(file);
        });
      }
  };

  const handleImageEdit = async () => {
    if (!editorImage) return; setIsEditing(true);
    try {
      const result = await editImageWithGemini(editorImage, editorPrompt);
      onStateChange({ editedResult: result });
      addToast("تم التعديل بنجاح", "success");
    } catch (e) { addToast("خطأ في التعديل", "error"); } finally { setIsEditing(false); }
  };

  const updateLayer = (id: string, updates: Partial<Layer>) => {
      const newLayers = layers.map(l => l.id === id ? { ...l, ...updates } : l);
      onStateChange({ layers: newLayers });
  };

  const deleteLayer = (id: string) => {
      const newLayers = layers.filter(l => l.id !== id);
      onStateChange({ layers: newLayers });
      if (selectedLayerId === id) setSelectedLayerId(null);
  };

  const moveLayer = (index: number, direction: 'up' | 'down') => {
      const newLayers = [...layers];
      if (direction === 'up' && index > 0) [newLayers[index], newLayers[index - 1]] = [newLayers[index - 1], newLayers[index]];
      else if (direction === 'down' && index < newLayers.length - 1) [newLayers[index], newLayers[index + 1]] = [newLayers[index + 1], newLayers[index]];
      onStateChange({ layers: newLayers });
  };

  // Canvas Render (Optimized & Safe)
  useEffect(() => {
    let isMounted = true;
    
    const render = async () => {
        const canvas = canvasRef.current;
        if (!canvas || !editorImage) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const loadImage = (src: string) => new Promise<HTMLImageElement>((resolve) => {
            const img = new Image(); 
            img.crossOrigin = "anonymous";
            img.onload = () => resolve(img); 
            img.onerror = () => resolve(img);
            img.src = src;
        });

        const baseImg = await loadImage(editedResult || editorImage);
        
        if (!isMounted) return; 

        canvas.width = baseImg.width; canvas.height = baseImg.height;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        ctx.filter = `brightness(${adjustments.brightness}%) contrast(${adjustments.contrast}%) saturate(${adjustments.saturation}%)`;
        ctx.drawImage(baseImg, 0, 0);
        ctx.filter = 'none';

        for (const layer of layers) {
            if (!layer.visible) continue;
            const layerImg = await loadImage(layer.src);
            
            if (!isMounted) return;

            const w = (layerImg.width * layer.scale) / 100;
            const h = (layerImg.height * layer.scale) / 100;
            const x = (canvas.width * layer.x) / 100 - (w/2);
            const y = (canvas.height * layer.y) / 100 - (h/2);
            ctx.save(); ctx.globalAlpha = layer.opacity / 100;
            ctx.drawImage(layerImg, x, y, w, h); ctx.restore();
        }
    };
    if (mode === 'branding') render();
    
    return () => { isMounted = false; };
  }, [editorImage, editedResult, layers, adjustments, mode]);

  const handleDownload = () => {
      if (canvasRef.current) {
          const link = document.createElement('a'); link.download = 'kodra_edit.png'; link.href = canvasRef.current.toDataURL('image/png'); link.click();
      }
  };

  const handleSaveToProject = () => {
      if (canvasRef.current && onSaveAsset) onSaveAsset(canvasRef.current.toDataURL('image/png'));
  };

  const handleAnalyzeBridge = () => {
      if (!onAnalyze) return;
      const targetImage = editedResult || editorImage;
      if (targetImage) onAnalyze(targetImage);
  };

  const clearEditor = () => {
    onStateChange({ editorImage: null, editedResult: null, editorPrompt: '', layers: [], adjustments: { brightness: 100, contrast: 100, saturation: 100 } });
  };

  const activeClient = clients.find(c => c.id === activeClientId);
  const selectedLayer = layers.find(l => l.id === selectedLayerId);

  return (
    <article className="bg-white dark:bg-slate-900 border dark:border-slate-800 rounded-2xl p-6 shadow-xl relative min-h-[600px] flex flex-col h-full animate-fade-in">
      
      <div className="flex gap-2 mb-6 border-b border-slate-100 dark:border-slate-800 pb-4 justify-between items-center">
          <div className="flex gap-2">
            <button onClick={() => onStateChange({ mode: 'ai_edit' })} className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${mode === 'ai_edit' ? 'bg-amber-500 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'}`}><KodraIcon icon={Sparkles} size={16}/> التعديل الذكي</button>
            <button onClick={() => onStateChange({ mode: 'branding' })} className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${mode === 'branding' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'}`}><KodraIcon icon={Stamp} size={16}/> التركيب والهوية</button>
          </div>
          {(editorImage || editedResult) && onAnalyze && (
               <button onClick={() => { if(editedResult || editorImage) onAnalyze(editedResult || editorImage); }} className="px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all bg-purple-50 text-purple-600 hover:bg-purple-100 dark:bg-purple-900/20 dark:text-purple-400 border border-purple-200 dark:border-purple-800"><KodraIcon icon={BrainCircuit} size={16}/> تحليل النتيجة</button>
          )}
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* CONTROLS */}
        <div className="lg:col-span-1 border-l border-slate-100 dark:border-slate-800 pl-0 lg:pl-6 order-2 lg:order-1 flex flex-col h-full">
          <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-800 cursor-pointer lg:cursor-default" onClick={() => window.innerWidth < 1024 && setIsControlsOpen(!isControlsOpen)}>
            <h3 className="font-bold dark:text-white flex items-center gap-2 text-lg">{mode === 'ai_edit' ? 'المحرر الذكي' : 'الطبقات والتعديلات'}<span className="lg:hidden ml-2 text-slate-400">{isControlsOpen ? <KodraIcon icon={ChevronUp} size={16}/> : <KodraIcon icon={ChevronDown} size={16}/>}</span></h3>
            <div className="flex gap-1" onClick={e => e.stopPropagation()}>
                {editorImage && <button onClick={clearEditor} className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 p-2 rounded-lg transition-colors"><KodraIcon icon={Trash2} size={18} /></button>}
            </div>
          </div>

          <div className={`space-y-6 flex-1 overflow-y-auto custom-scrollbar pr-2 transition-all duration-300 ${isControlsOpen ? 'max-h-[500px] opacity-100 mt-4' : 'max-h-0 opacity-0 overflow-hidden mt-0'} lg:max-h-full lg:opacity-100 lg:mt-4`}>
            
            {!editorImage && (
                <div className="space-y-3">
                    <div className="relative group cursor-pointer border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-amber-500 dark:hover:border-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/10 rounded-xl p-8 text-center transition-all">
                        <input type="file" onChange={handleEditorUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"/>
                        <div className="flex flex-col items-center justify-center gap-2 text-slate-500 dark:text-slate-400"><KodraIcon icon={ImagePlus} size={32}/><span className="text-sm font-bold">رفع الصورة</span></div>
                    </div>
                    {onOpenLibrary && <button onClick={() => onOpenLibrary('editor-base')} className="w-full py-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"><KodraIcon icon={FolderPlus} size={18}/> اختيار من المكتبة</button>}
                </div>
            )}

            {mode === 'ai_edit' && editorImage && (
                <>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1"><KodraIcon icon={Wand2} size={12}/> فلاتر</label>
                        <div className="grid grid-cols-2 gap-2">{EDITOR_PRESETS.map((preset, idx) => (<button key={idx} onClick={() => onStateChange({ editorPrompt: preset.prompt })} className="text-xs bg-slate-100 dark:bg-slate-800 hover:bg-amber-100 dark:hover:bg-amber-900/30 text-slate-600 dark:text-slate-300 hover:text-amber-600 px-2 py-2 rounded-lg transition-colors text-right truncate" title={preset.prompt}>{preset.label}</button>))}</div>
                    </div>
                    <textarea value={editorPrompt} onChange={e => onStateChange({ editorPrompt: e.target.value })} placeholder="وصف التعديل..." className="w-full h-32 border border-slate-200 dark:border-slate-700 rounded-xl p-4 bg-slate-50 dark:bg-slate-950 dark:text-white focus:ring-2 ring-amber-500 outline-none resize-none text-sm leading-relaxed"/>
                    <button onClick={handleImageEdit} disabled={!editorImage || isEditing || !editorPrompt.trim()} className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl font-bold hover:shadow-lg transition-all flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">{isEditing ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><KodraIcon icon={Sparkles} size={20} /> تطبيق التعديل</>}</button>
                    {editedResult && <button onClick={() => onStateChange({ editedResult: null })} className="w-full py-2 border border-slate-200 dark:border-slate-700 text-slate-500 rounded-xl font-bold text-xs hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-center gap-2"><KodraIcon icon={CornerUpLeft} size={14}/> تراجع</button>}
                </>
            )}

            {mode === 'branding' && editorImage && (
                <div className="space-y-6 animate-slide-up">
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border dark:border-slate-700 space-y-4">
                        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1"><KodraIcon icon={Palette} size={12}/> ألوان (Global)</h4>
                        <div className="space-y-3">
                            <div className="flex items-center gap-2"><KodraIcon icon={Sun} size={14} className="text-amber-500"/><input type="range" min="0" max="200" value={adjustments.brightness} onChange={(e) => onStateChange({ adjustments: { ...adjustments, brightness: Number(e.target.value) } })} className="flex-1 accent-amber-500 h-1.5 bg-slate-200 rounded-full appearance-none"/></div>
                            <div className="flex items-center gap-2"><KodraIcon icon={Contrast} size={14} className="text-slate-500"/><input type="range" min="0" max="200" value={adjustments.contrast} onChange={(e) => onStateChange({ adjustments: { ...adjustments, contrast: Number(e.target.value) } })} className="flex-1 accent-slate-500 h-1.5 bg-slate-200 rounded-full appearance-none"/></div>
                            <div className="flex items-center gap-2"><KodraIcon icon={Droplet} size={14} className="text-blue-500"/><input type="range" min="0" max="200" value={adjustments.saturation} onChange={(e) => onStateChange({ adjustments: { ...adjustments, saturation: Number(e.target.value) } })} className="flex-1 accent-blue-500 h-1.5 bg-slate-200 rounded-full appearance-none"/></div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2"><KodraIcon icon={Layers} size={14}/> الطبقات ({layers.length})</label>
                            <div className="flex gap-1">
                                {onOpenLibrary && <button onClick={() => onOpenLibrary('editor-layer')} className="text-[10px] font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded hover:bg-slate-200 transition-colors" title="إضافة من المكتبة"><KodraIcon icon={FolderPlus} size={14}/></button>}
                                <label className="cursor-pointer text-[10px] font-bold text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 px-2 py-1 rounded flex items-center gap-1 hover:bg-indigo-100 transition-colors"><KodraIcon icon={Plus} size={12}/> رفع<input type="file" multiple className="hidden" onChange={handleLayerUpload} /></label>
                            </div>
                        </div>
                        <div className="max-h-48 overflow-y-auto custom-scrollbar space-y-1.5 pr-1">
                            {[...layers].reverse().map((layer, idx) => {
                                const realIndex = layers.length - 1 - idx;
                                return (
                                    <div key={layer.id} onClick={() => setSelectedLayerId(layer.id)} className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-all ${selectedLayerId === layer.id ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800' : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 hover:border-indigo-200'}`}>
                                        <div className="w-8 h-8 rounded bg-slate-100 dark:bg-slate-700 overflow-hidden shrink-0"><img src={layer.src} className="w-full h-full object-cover"/></div>
                                        <div className="flex-1 min-w-0"><div className="text-xs font-bold dark:text-white truncate">{layer.type}</div></div>
                                        <div className="flex gap-1">
                                            <button onClick={(e) => { e.stopPropagation(); updateLayer(layer.id, { visible: !layer.visible }); }} className="p-1 text-slate-400 hover:text-slate-600"><KodraIcon icon={layer.visible ? Eye : EyeOff} size={12}/></button>
                                            <button onClick={(e) => { e.stopPropagation(); moveLayer(realIndex, 'up'); }} className="p-1 text-slate-400 hover:text-slate-600"><KodraIcon icon={ArrowUp} size={12}/></button>
                                            <button onClick={(e) => { e.stopPropagation(); moveLayer(realIndex, 'down'); }} className="p-1 text-slate-400 hover:text-slate-600"><KodraIcon icon={ArrowDown} size={12}/></button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {selectedLayer && (
                        <div className="bg-white dark:bg-slate-900 border border-indigo-100 dark:border-indigo-900/50 p-4 rounded-xl space-y-4 shadow-sm animate-fade-in">
                            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-2"><span className="text-xs font-bold text-indigo-600">خصائص</span><button onClick={() => deleteLayer(selectedLayer.id)} className="text-red-400 hover:text-red-500"><KodraIcon icon={Trash2} size={14}/></button></div>
                            <div className="space-y-3">
                                <div><div className="flex justify-between text-[10px] text-slate-500 mb-1"><span>Pos X</span><span>{selectedLayer.x}%</span></div><input type="range" min="0" max="100" value={selectedLayer.x} onChange={e => updateLayer(selectedLayer.id, { x: Number(e.target.value) })} className="w-full h-1 bg-slate-200 rounded-full appearance-none accent-indigo-500"/></div>
                                <div><div className="flex justify-between text-[10px] text-slate-500 mb-1"><span>Pos Y</span><span>{selectedLayer.y}%</span></div><input type="range" min="0" max="100" value={selectedLayer.y} onChange={e => updateLayer(selectedLayer.id, { y: Number(e.target.value) })} className="w-full h-1 bg-slate-200 rounded-full appearance-none accent-indigo-500"/></div>
                                <div><div className="flex justify-between text-[10px] text-slate-500 mb-1"><span>Scale</span><span>{selectedLayer.scale}%</span></div><input type="range" min="1" max="200" value={selectedLayer.scale} onChange={e => updateLayer(selectedLayer.id, { scale: Number(e.target.value) })} className="w-full h-1 bg-slate-200 rounded-full appearance-none accent-indigo-500"/></div>
                                <div><div className="flex justify-between text-[10px] text-slate-500 mb-1"><span>Opacity</span><span>{selectedLayer.opacity}%</span></div><input type="range" min="0" max="100" value={selectedLayer.opacity} onChange={e => updateLayer(selectedLayer.id, { opacity: Number(e.target.value) })} className="w-full h-1 bg-slate-200 rounded-full appearance-none accent-indigo-500"/></div>
                            </div>
                        </div>
                    )}

                    <div className="pt-2 flex flex-col gap-2">
                        <div className="flex gap-2">
                            {activeClient && (
                                <button onClick={() => { if(onUpdateClient) onUpdateClient({...activeClient, logoSettings: {x:50,y:50,scale:20,opacity:100}}) }} className="flex-1 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-xl font-bold text-xs hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex justify-center items-center gap-2"><KodraIcon icon={Save} size={16}/> حفظ كـ Preset</button>
                            )}
                            <button onClick={handleDownload} className="flex-[2] py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg transition-all flex justify-center items-center gap-2 text-sm"><KodraIcon icon={Download} size={18} /> تحميل</button>
                        </div>
                        {currentProjectId && onSaveAsset && <button onClick={handleSaveToProject} className="w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold shadow-lg transition-all flex justify-center items-center gap-2 text-sm"><KodraIcon icon={FolderPlus} size={18} /> حفظ في معرض المشروع</button>}
                    </div>
                </div>
            )}
          </div>
        </div>

        {/* IMAGE DISPLAY */}
        <div className="lg:col-span-2 order-1 lg:order-2 bg-slate-100 dark:bg-slate-950/50 rounded-2xl border dark:border-slate-800 flex items-center justify-center h-full min-h-[400px] overflow-hidden relative shadow-inner">
          {mode === 'ai_edit' ? (
             editedResult && editorImage ? <CompareSlider before={editorImage} after={editedResult} /> : editorImage ? <div className="relative w-full h-full flex items-center justify-center p-4"><img src={editorImage} className="max-h-full max-w-full object-contain shadow-2xl rounded-lg" alt="Original" />{isEditing && <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center z-20 rounded-2xl"><KodraIcon icon={Sparkles} className="mx-auto mb-4 animate-bounce text-amber-500" size={48} /><p className="font-bold text-white text-lg">جاري التنفيذ...</p></div>}</div> : <div className="text-center text-slate-400 p-8"><KodraIcon icon={UploadCloud} size={32} className="mx-auto mb-4 opacity-50"/><p>لا توجد صورة</p></div>
          ) : (
             <div className="relative w-full h-full flex items-center justify-center p-4 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]">{editorImage ? <canvas ref={canvasRef} className="max-h-full max-w-full shadow-2xl rounded-lg border border-slate-200 dark:border-slate-700"/> : <div className="text-center text-slate-400"><KodraIcon icon={Layers} size={48} className="mx-auto mb-4 opacity-50"/><p>ابدأ برفع الصورة</p></div>}</div>
          )}
        </div>
      </div>
    </article>
  );
};
