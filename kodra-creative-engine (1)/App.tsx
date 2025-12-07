
import React, { useState, useEffect, useCallback } from 'react';
import { Sidebar } from './components/Sidebar';
import { ProjectModal } from './components/ProjectModal';
import { HistoryModal } from './components/HistoryModal';
import { SaveProjectModal } from './components/SaveProjectModal'; 
import { DocsPage } from './components/DocsPage'; 
import { ImageEditor } from './components/ImageEditor'; 
import { PromptStudio } from './components/PromptStudio';
import { DataCenter } from './components/DataCenter'; 
import { Dashboard } from './components/Dashboard';
import { AssetPicker } from './components/AssetPicker';
import { KodraIcon } from './components/KodraIcon';
import { 
  AppStep, 
  PromptJson, 
  StrategyReport, 
  ValidationResult, 
  ModelType, 
  ViewMode, 
  UIFontWeight, 
  Project, 
  ProjectVersion, 
  Client, 
  Toast, 
  KodraBackup, 
  ProjectStatus,
  AutoSaveSession,
  ProjectAsset,
  ImageEditorState
} from './types';
import { generateStrategy, generateJsonPrompt, validatePromptJson, fixJsonPrompt, generateTextFromImage } from './services/geminiService';
import { Save, FolderOpen, Menu, PlusCircle, LogOut, RefreshCw, Sun, Moon, Wifi, WifiOff } from 'lucide-react';

// Utility: Move outside component to prevent recreation on every render
const readFileAsBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
          if (typeof reader.result === 'string') resolve(reader.result);
          else reject(new Error("Failed to read file"));
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
  });
};

export const App: React.FC = () => {
  // --- STATE INITIALIZATION & SETTINGS ---
  const [theme, setTheme] = useState<'light' | 'dark'>(() => (typeof window !== 'undefined' ? (localStorage.getItem('theme') as 'light'|'dark') || 'dark' : 'dark'));
  const [uiFontWeight, setUiFontWeight] = useState<UIFontWeight>(() => (typeof window !== 'undefined' ? (localStorage.getItem('uiFontWeight') as UIFontWeight) || 'regular' : 'regular'));
  
  const [currentView, setCurrentView] = useState<ViewMode>(ViewMode.DASHBOARD);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // --- GLOBAL UI STATE ---
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showProjectsModal, setShowProjectsModal] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false); 
  const [showAssetPicker, setShowAssetPicker] = useState(false);
  const [assetPickerTarget, setAssetPickerTarget] = useState<'prompt' | 'editor-base' | 'editor-layer'>('prompt');
  
  // --- DATA CENTER STATE ---
  const [projects, setProjects] = useState<Project[]>([]);
  const [clients, setClients] = useState<Client[]>([]);

  const [showHistoryModal, setShowHistoryModal] = useState<Project | null>(null);
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  const [selectedClientId, setSelectedClientId] = useState<string>('');

  // --- PROMPT STUDIO STATE ---
  const [step, setStep] = useState<AppStep>(AppStep.BRIEF_INPUT);
  const [briefText, setBriefText] = useState('');
  const [briefLink, setBriefLink] = useState('');
  const [briefImage, setBriefImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [strategy, setStrategy] = useState<StrategyReport | null>(null);
  const [jsonPrompts, setJsonPrompts] = useState<PromptJson[] | null>(null);
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [selectedModel, setSelectedModel] = useState<ModelType>(ModelType.GEMINI_3_PRO_2K);
  const [selectedVariationIndex, setSelectedVariationIndex] = useState(0);
  const [requiresArabic, setRequiresArabic] = useState(false);
  const [selectedDeliverableIndex, setSelectedDeliverableIndex] = useState(0);
  const [forceAspectRatio, setForceAspectRatio] = useState<string>('Auto');
  const [refinementText, setRefinementText] = useState('');

  // --- HISTORY STACK (Time Travel) ---
  const [promptHistory, setPromptHistory] = useState<PromptJson[][]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // --- STRATEGY LOCK STATE (Visual DNA Cloning) ---
  const [isStrategyLocked, setIsStrategyLocked] = useState(false);

  // --- IMAGE EDITOR BRIDGE STATE ---
  const [imageEditorState, setImageEditorState] = useState<ImageEditorState>({
      editorImage: null,
      editorPrompt: '',
      editedResult: null,
      layers: [], 
      adjustments: { brightness: 100, contrast: 100, saturation: 100 },
      mode: 'ai_edit'
  });
  
  const [pendingImageForEditor, setPendingImageForEditor] = useState<string | null>(null);

  const SESSION_KEY = 'kodra_draft_session';

  const addToast = useCallback((message: string, type: 'success' | 'error' | 'info') => {
    const id = Date.now().toString() + Math.random().toString(36).substring(7);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  }, []);

  // --- SESSION PERSISTENCE & RESTORATION ---
  useEffect(() => {
      const savedSession = sessionStorage.getItem(SESSION_KEY);
      if (savedSession) {
          try {
              const session: AutoSaveSession = JSON.parse(savedSession);
              if (session.currentView) setCurrentView(session.currentView);
              if (session.step) setStep(session.step);
              if (session.briefText) setBriefText(session.briefText);
              if (session.briefImage) setBriefImage(session.briefImage);
              if (session.strategy) setStrategy(session.strategy);
              if (session.jsonPrompts) setJsonPrompts(session.jsonPrompts);
              if (session.selectedModel) setSelectedModel(session.selectedModel);
              if (session.requiresArabic !== undefined) setRequiresArabic(session.requiresArabic);
              if (session.selectedClientId) setSelectedClientId(session.selectedClientId);
              if (session.currentProjectId) setCurrentProjectId(session.currentProjectId);
              if (session.promptHistory) setPromptHistory(session.promptHistory);
              if (session.historyIndex !== undefined) setHistoryIndex(session.historyIndex);
              
              if (session.imageEditorState) setImageEditorState(session.imageEditorState);
              
              if (session.briefText || session.strategy || session.imageEditorState?.editorImage) {
                  addToast("تم استعادة جلسة العمل السابقة (Draft Restored)", "info");
              }
          } catch (e) {
              console.error("Failed to restore session", e);
          }
      }

      const handleOnline = () => { setIsOnline(true); addToast("تم استعادة الاتصال بالإنترنت", "success"); };
      const handleOffline = () => { setIsOnline(false); addToast("أنت الآن غير متصل. يرجى التحقق من الشبكة.", "error"); };
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);
      return () => {
          window.removeEventListener('online', handleOnline);
          window.removeEventListener('offline', handleOffline);
      };
  }, [addToast]);

  // 3. Save Draft on Change (Debounced)
  useEffect(() => {
      const saveToStorage = () => {
          if (currentView === ViewMode.DASHBOARD && !briefText && !strategy && !imageEditorState.editorImage) return;

          const session: AutoSaveSession = {
              timestamp: Date.now(),
              currentView,
              step,
              briefText,
              briefImage,
              strategy,
              jsonPrompts,
              promptHistory,
              historyIndex,
              selectedModel,
              requiresArabic,
              selectedClientId,
              currentProjectId,
              imageEditorState
          };

          try {
              sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
          } catch (e) {
              // If quota exceeded (likely due to image), try saving without image
              const { briefImage: _, imageEditorState: __, ...rest } = session;
              try {
                  sessionStorage.setItem(SESSION_KEY, JSON.stringify(rest));
              } catch (e2) {
                  // Silent fail if still too large
              }
          }
      };

      const timeoutId = setTimeout(saveToStorage, 1000);
      return () => clearTimeout(timeoutId);

  }, [currentView, step, briefText, briefImage, strategy, jsonPrompts, promptHistory, historyIndex, selectedModel, requiresArabic, selectedClientId, currentProjectId, imageEditorState]);

  // 4. Warn before Unload
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      const hasUnsavedWork = (briefText || briefImage) && !projects.find(p => p.id === currentProjectId);
      if (hasUnsavedWork) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [briefText, briefImage, projects, currentProjectId]);


  // --- PERSISTENCE EFFECTS ---
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') root.classList.add('dark'); else root.classList.remove('dark');
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('uiFontWeight', uiFontWeight);
  }, [uiFontWeight]);

  const toggleTheme = useCallback(() => setTheme(prev => prev === 'light' ? 'dark' : 'light'), []);
  
  // --- HANDLERS ---
  const handleImageUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        try {
            const base64 = await readFileAsBase64(file);
            setBriefImage(base64);
            addToast("تم رفع الصورة بنجاح", "success");
        } catch (error) {
            addToast("فشل رفع الصورة", "error");
        }
    }
  }, [addToast]);
  
  const onFileDrop = useCallback(async (file: File) => {
      try {
          const base64 = await readFileAsBase64(file);
          setBriefImage(base64);
          addToast("تم رفع الصورة بنجاح", "success");
      } catch (error) {
          addToast("فشل رفع الصورة", "error");
      }
  }, [addToast]);

  const clearImage = useCallback((e: React.MouseEvent) => {
    e.stopPropagation(); e.preventDefault();
    setBriefImage(null); addToast("تم حذف الصورة", "info");
  }, [addToast]);

  const handleImageToText = useCallback(async () => {
      if (!briefImage) return;
      setIsLoading(true);
      try {
          const extractedText = await generateTextFromImage(briefImage);
          if (extractedText) {
              setBriefText(prev => prev ? prev + "\n\n" + extractedText : extractedText);
              addToast("تم استخراج الوصف بنجاح", "success");
          } else { addToast("لم يتمكن النظام من استخراج وصف دقيق", "info"); }
      } catch (e) { addToast("حدث خطأ أثناء تحليل الصورة", "error"); } finally { setIsLoading(false); }
  }, [briefImage, addToast]);

  // Asset Picker Handlers
  const openAssetPicker = (target: 'prompt' | 'editor-base' | 'editor-layer') => {
      setAssetPickerTarget(target);
      setShowAssetPicker(true);
  };

  const handleAssetSelect = (src: string) => {
      if (assetPickerTarget === 'prompt') {
          setBriefImage(src);
          addToast("تم اختيار صورة مرجعية", "success");
      } else if (assetPickerTarget === 'editor-base') {
          setImageEditorState(prev => ({ ...prev, editorImage: src, editedResult: null }));
          setCurrentView(ViewMode.IMAGE_EDITOR);
          addToast("تم تحميل الصورة في المحرر", "success");
      } else if (assetPickerTarget === 'editor-layer') {
          const newLayer = {
              id: Date.now().toString(),
              type: 'upload' as const,
              src,
              visible: true,
              x: 50, y: 50, scale: 30, opacity: 100, zIndex: imageEditorState.layers.length + 10
          };
          setImageEditorState(prev => ({ ...prev, layers: [...prev.layers, newLayer] }));
          addToast("تم إضافة طبقة جديدة", "success");
      }
  };

  const updateImageEditorState = (newState: Partial<ImageEditorState>) => {
      setImageEditorState(prev => ({ ...prev, ...newState }));
  };

  const handleGenerateStrategy = useCallback(async () => {
    if (!isOnline) { addToast("تعذر الاتصال. تأكد من الإنترنت.", "error"); return; }
    if (!briefText.trim() && !briefImage) { addToast("يرجى إدخال تفاصيل الطلب أو رفع صورة", "error"); return; }
    
    setIsLoading(true);
    try {
      const activeClient = clients.find(c => c.id === selectedClientId);
      let clientContext = activeClient?.notes || '';
      if (activeClient) {
          clientContext = `CLIENT IDENTITY: ${activeClient.name} (${activeClient.industry || 'Unknown Industry'}). ` + clientContext;
      }

      const result = await generateStrategy(briefText, briefImage, briefLink.trim() || undefined, clientContext);
      
      setStrategy(result);
      setSelectedDeliverableIndex(0);
      setStep(AppStep.STRATEGY_GENERATION);
      setIsStrategyLocked(false); 
      setPromptHistory([]);
      setHistoryIndex(-1);
      
      if (result.requiresArabicTextRendering) {
          setRequiresArabic(true);
          setSelectedModel(ModelType.NANO_BANANA_PRO_2);
      }
      if (result.recommendedModel) {
          const recommendedEnum = Object.values(ModelType).find(m => m === result.recommendedModel);
          if (recommendedEnum && !result.requiresArabicTextRendering) {
              setSelectedModel(recommendedEnum);
          }
      }
      addToast(result.isBriefVague ? "تم تحسين طلبك تلقائياً!" : "تم تحليل الاستراتيجية بنجاح", "success");
    } catch (error) { addToast("حدث خطأ أثناء تحليل البريف", "error"); } finally { setIsLoading(false); }
  }, [briefText, briefImage, briefLink, clients, selectedClientId, isOnline, addToast]);

  const updatePromptHistory = (newPrompts: PromptJson[]) => {
      const newHistory = promptHistory.slice(0, historyIndex + 1);
      newHistory.push(newPrompts);
      setPromptHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
  };

  const handleEngineering = useCallback(async () => {
    if (!isOnline) { addToast("لا يوجد اتصال بالإنترنت", "error"); return; }
    if (!strategy) return;
    setIsLoading(true);
    try {
      setStep(AppStep.JSON_ENGINEERING);
      const results = await generateJsonPrompt(briefText, strategy, selectedDeliverableIndex, undefined, forceAspectRatio === 'Auto' ? undefined : forceAspectRatio);
      if (!results || results.length === 0) throw new Error("Empty JSON response");
      
      setJsonPrompts(results);
      updatePromptHistory(results);

      setStep(AppStep.VALIDATION);
      const valResult = await validatePromptJson(results, strategy);
      setValidation(valResult);
      if(valResult.isValid) addToast("تم التحقق من كود JSON", "success");
      else addToast("تم العثور على ملاحظات", "info");
    } catch (error) { addToast("فشل في توليد أو قراءة كود JSON.", "error"); setStep(AppStep.STRATEGY_GENERATION); } finally { setIsLoading(false); }
  }, [strategy, briefText, selectedDeliverableIndex, forceAspectRatio, isOnline, addToast, promptHistory, historyIndex]);

  const handleRegenerate = useCallback(async () => {
    if (!isOnline) { addToast("لا يوجد اتصال بالإنترنت", "error"); return; }
    if (!strategy) return;
    setIsLoading(true);
    setStep(AppStep.JSON_ENGINEERING); 
    try {
      const refinement = refinementText || "Refine for better realism";
      const results = await generateJsonPrompt(briefText, strategy, selectedDeliverableIndex, refinement, forceAspectRatio === 'Auto' ? undefined : forceAspectRatio);
      if (!results || results.length === 0) throw new Error("Empty regeneration response");
      setJsonPrompts(results);
      updatePromptHistory(results);
      setStep(AppStep.VALIDATION);
      const valResult = await validatePromptJson(results, strategy);
      setValidation(valResult);
      addToast("تم تحديث المشروع", "success");
    } catch (error) { addToast("حدث خطأ أثناء إعادة التوليد", "error"); } finally { setIsLoading(false); }
  }, [strategy, briefText, selectedDeliverableIndex, refinementText, forceAspectRatio, isOnline, addToast, promptHistory, historyIndex]);

  const handleUndoGeneration = useCallback(() => {
      if (historyIndex > 0) {
          const prevIndex = historyIndex - 1;
          setHistoryIndex(prevIndex);
          setJsonPrompts(promptHistory[prevIndex]);
          addToast("تم التراجع عن التوليد الأخير", "info");
      }
  }, [historyIndex, promptHistory, addToast]);

  const handleRedoGeneration = useCallback(() => {
      if (historyIndex < promptHistory.length - 1) {
          const nextIndex = historyIndex + 1;
          setHistoryIndex(nextIndex);
          setJsonPrompts(promptHistory[nextIndex]);
          addToast("تم إعادة التوليد", "info");
      }
  }, [historyIndex, promptHistory, addToast]);

  const handleReuseStrategy = useCallback(() => {
      setStep(AppStep.BRIEF_INPUT);
      setJsonPrompts(null);
      setValidation(null);
      setBriefText(''); 
      setBriefImage(null); 
      setRefinementText('');
      setIsStrategyLocked(true);
      setPromptHistory([]);
      setHistoryIndex(-1);
      addToast("تم تفعيل وضع استنساخ الروح (Strategy Locked)", "info");
  }, [addToast]);

  const handleAutoFix = useCallback(async () => {
      if (!isOnline) { addToast("لا يوجد اتصال بالإنترنت", "error"); return; }
      if (!jsonPrompts || !validation || validation.isValid) return;
      setIsLoading(true);
      try {
          const brokenJson = jsonPrompts[selectedVariationIndex];
          const errors = validation.errors;
          const fixedJson = await fixJsonPrompt(brokenJson, errors);
          const updatedPrompts = [...jsonPrompts];
          updatedPrompts[selectedVariationIndex] = fixedJson;
          setJsonPrompts(updatedPrompts);
          updatePromptHistory(updatedPrompts);
          const valResult = await validatePromptJson(updatedPrompts, strategy || undefined);
          setValidation(valResult);
          if (valResult.isValid) addToast("تم إصلاح الأخطاء بنجاح", "success");
          else addToast("تم التحسين، ولكن قد تبقى بعض الملاحظات", "info");
      } catch (e) {
          addToast("فشل الإصلاح التلقائي", "error");
      } finally {
          setIsLoading(false);
      }
  }, [jsonPrompts, validation, selectedVariationIndex, strategy, isOnline, addToast, promptHistory, historyIndex]);

  const handleOpenSaveModal = useCallback(() => {
    if (!briefText && !strategy) { addToast("لا يوجد شيء لحفظه حالياً", "error"); return; }
    setShowSaveModal(true);
  }, [briefText, strategy, addToast]);

  const handleFinalSave = useCallback((name: string, clientId: string | undefined, status: ProjectStatus, tags: string[]) => {
    const newId = currentProjectId || Date.now().toString();
    const version: ProjectVersion = { id: Date.now().toString(), timestamp: new Date().toISOString(), briefText, briefImage: briefImage || undefined, strategy: strategy || undefined, jsonPrompts: jsonPrompts || undefined, note: `Version ${new Date().toLocaleTimeString()}` };
    
    setProjects(prevProjects => {
        const updatedProjects = [...prevProjects];
        const existingIndex = updatedProjects.findIndex(p => p.name === name || p.id === newId);

        if (existingIndex >= 0) {
            const existing = updatedProjects[existingIndex];
            updatedProjects[existingIndex] = { 
                ...existing, 
                name, 
                clientId, 
                status,
                tags,
                date: new Date().toISOString(), 
                briefText, briefLink, briefImage: briefImage || undefined, thumbnail: briefImage || undefined, strategy: strategy || undefined, jsonPrompts: jsonPrompts || undefined, requiresArabic, selectedModel, 
                versionHistory: [version, ...(existing.versionHistory || [])] 
            };
            setCurrentProjectId(existing.id);
            addToast("تم تحديث المشروع (الجلسة الحالية فقط)", "success");
        } else {
            const newProject: Project = { 
                id: newId, 
                name, 
                clientId, 
                status,
                tags,
                date: new Date().toISOString(), 
                briefText, briefLink, briefImage: briefImage || undefined, thumbnail: briefImage || undefined, strategy: strategy || undefined, jsonPrompts: jsonPrompts || undefined, requiresArabic, selectedModel, 
                versionHistory: [version] 
            };
            updatedProjects.unshift(newProject);
            setCurrentProjectId(newId);
            addToast("تم حفظ المشروع الجديد (الجلسة الحالية فقط)", "success");
        }
        return updatedProjects;
    });
  }, [currentProjectId, briefText, briefImage, strategy, jsonPrompts, requiresArabic, selectedModel, briefLink, addToast]);

  // Save Project Asset
  const handleSaveProjectAsset = useCallback((assetBlob: string) => {
      if (!currentProjectId) {
          addToast("يرجى حفظ المشروع أولاً لإضافة الأصول", "error");
          return;
      }
      
      const newAsset: ProjectAsset = {
          id: Date.now().toString(),
          type: 'final',
          src: assetBlob,
          timestamp: new Date().toISOString(),
          name: `Asset ${new Date().toLocaleTimeString()}`
      };

      setProjects(prevProjects => prevProjects.map(p => {
          if (p.id === currentProjectId) {
              return {
                  ...p,
                  assets: [newAsset, ...(p.assets || [])],
                  thumbnail: newAsset.src 
              };
          }
          return p;
      }));
      addToast("تم حفظ التصميم في معرض المشروع", "success");
  }, [currentProjectId, addToast]);

  const loadProject = useCallback((p: Project) => {
      setBriefText(p.briefText); setBriefLink(p.briefLink || '');
      setBriefImage(p.briefImage || null);
      setStrategy(p.strategy || null); setJsonPrompts(p.jsonPrompts || null);
      setRequiresArabic(p.requiresArabic || false); setSelectedModel(p.selectedModel || ModelType.MIDJOURNEY_PRO);
      setSelectedClientId(p.clientId || ''); 
      if (p.jsonPrompts) setStep(AppStep.FINAL_OUTPUT);
      else if (p.strategy) setStep(AppStep.STRATEGY_GENERATION);
      else setStep(AppStep.BRIEF_INPUT);
      setCurrentProjectId(p.id);
      setIsStrategyLocked(false);
      
      // Clear history on load to avoid confusion
      setPromptHistory([]);
      setHistoryIndex(-1);
      
      // Reset Editor
      setImageEditorState({ editorImage: null, editorPrompt: '', editedResult: null, layers: [], adjustments: { brightness: 100, contrast: 100, saturation: 100 }, mode: 'ai_edit' });

      setShowProjectsModal(false);
      addToast(`تم تحميل مشروع: ${p.name}`, "success");
  }, [addToast]);

  const handleLoadProjectFromDataCenter = useCallback((p: Project) => {
    loadProject(p);
    setCurrentView(ViewMode.PROMPT_ENGINEER);
    setSidebarOpen(false); 
  }, [loadProject]);

  const resetApp = useCallback((options?: { clientId?: string; keepClient?: boolean }) => {
    // Clear Session Draft
    sessionStorage.removeItem(SESSION_KEY);

    setStep(AppStep.BRIEF_INPUT); 
    setBriefText(''); 
    setBriefLink(''); 
    setBriefImage(null);
    setStrategy(null); 
    setJsonPrompts(null); 
    setValidation(null);
    setSelectedVariationIndex(0); 
    setSelectedDeliverableIndex(0);
    setForceAspectRatio('Auto'); 
    setRequiresArabic(false); 
    setShowResetConfirm(false);
    setRefinementText(''); 
    setCurrentProjectId(null); 
    setIsStrategyLocked(false);
    
    // Clear History
    setPromptHistory([]);
    setHistoryIndex(-1);
    
    // Reset Editor
    setImageEditorState({ editorImage: null, editorPrompt: '', editedResult: null, layers: [], adjustments: { brightness: 100, contrast: 100, saturation: 100 }, mode: 'ai_edit' });
    
    if (options?.clientId) {
        setSelectedClientId(options.clientId);
    } else if (options?.keepClient) {
        // Keeps current client
    } else {
        setSelectedClientId('');
    }
    
    if (options?.clientId) {
         // handled by wrapper
    } else if (!options?.keepClient) {
        addToast("تم بدء مشروع جديد (Session Cleared)", "info");
    } else {
        addToast("مشروع جديد (نفس العميل)", "info");
    }
  }, [addToast, SESSION_KEY]);

  const handleCreateProjectForClient = useCallback((clientId: string) => {
    resetApp({ clientId });
    setCurrentView(ViewMode.PROMPT_ENGINEER);
    setSidebarOpen(false); 
    const clientName = clients.find(c => c.id === clientId)?.name;
    addToast(`مشروع جديد للعميل: ${clientName || 'غير معروف'}`, 'info');
  }, [clients, resetApp, addToast]);

  const handleCreateClient = useCallback((newClientData: { name: string, industry: string, contactPerson: string, email: string }) => {
      const newClient: Client = {
          id: Date.now().toString(),
          ...newClientData
      };
      setClients(prev => [...prev, newClient]);
      setSelectedClientId(newClient.id);
      addToast(`تم تسجيل العميل "${newClient.name}" بنجاح`, "success");
  }, [addToast]);

  const handleUpdateClient = useCallback((updatedClient: Client) => {
      setClients(prev => prev.map(c => c.id === updatedClient.id ? updatedClient : c));
  }, []);

  const deleteProject = useCallback((id: string, e: React.MouseEvent) => {
      e.stopPropagation();
      setProjects(prev => {
          const updated = prev.filter(p => p.id !== id);
          return updated;
      });
      if (currentProjectId === id) setCurrentProjectId(null);
      addToast("تم الحذف", "info");
  }, [currentProjectId, addToast]);

  const restoreVersion = useCallback((version: ProjectVersion) => {
     setBriefText(version.briefText); setStrategy(version.strategy || null);
     setJsonPrompts(version.jsonPrompts || null);
     if (version.jsonPrompts) setStep(AppStep.FINAL_OUTPUT);
     else if (version.strategy) setStep(AppStep.STRATEGY_GENERATION);
     else setStep(AppStep.BRIEF_INPUT);
     setShowHistoryModal(null); setShowProjectsModal(false);
     addToast("تم استعادة النسخة", "success");
  }, [addToast]);

  const handleImportBackup = useCallback((backup: KodraBackup) => {
      try {
          if (backup.data.clients) setClients(backup.data.clients);
          if (backup.data.projects) setProjects(backup.data.projects);
          if (backup.settings.theme) setTheme(backup.settings.theme);
          if (backup.settings.font) setUiFontWeight(backup.settings.font);
          
          addToast("تم استعادة نسخة النظام بنجاح", "success");
      } catch(e) {
          addToast("حدث خطأ أثناء استعادة النسخة الاحتياطية", "error");
      }
  }, [addToast]);

  const handleSendToEditor = useCallback((imageUrl: string) => {
      setPendingImageForEditor(imageUrl);
      setCurrentView(ViewMode.IMAGE_EDITOR);
      addToast("تم نقل الصورة إلى المحرر", "info");
  }, [addToast]);

  const handleSendToStrategy = useCallback((imageUrl: string) => {
      setBriefImage(imageUrl);
      setPendingImageForEditor(null);
      setCurrentView(ViewMode.PROMPT_ENGINEER);
      setStep(AppStep.BRIEF_INPUT);
      addToast("تم اعتماد الصورة كمرجع للاستراتيجية", "success");
  }, [addToast]);

  // Current Project Context for Editor
  const activeProject = projects.find(p => p.id === currentProjectId);

  return (
    <div className={`min-h-screen bg-slate-50 dark:bg-slate-950 flex font-sans ${uiFontWeight === 'bold' ? 'font-bold' : uiFontWeight === 'medium' ? 'font-semibold' : uiFontWeight === 'light' ? 'font-light' : 'font-normal'} transition-colors duration-300`} dir="rtl">
      
      {/* Global Toasts */}
      <div className="fixed bottom-6 left-6 z-50 flex flex-col gap-2 pointer-events-none">
        {toasts.map(t => (<div key={t.id} className={`pointer-events-auto px-4 py-3 rounded-xl shadow-lg flex items-center gap-3 ${t.type==='success'?'bg-green-600':t.type==='error'?'bg-red-600':'bg-slate-800'} text-white animate-fade-in`}><span className="text-sm font-bold">{t.message}</span></div>))}
      </div>
      
      {/* Global Modals */}
      {showResetConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-2xl max-w-md w-full border dark:border-slate-800">
                  <h3 className="text-xl font-bold dark:text-white flex items-center gap-2">
                      <KodraIcon icon={RefreshCw} className="text-amber-500" /> خيارات المشروع الجديد
                  </h3>
                  <div className="flex flex-col gap-3">
                       <button onClick={() => resetApp({ keepClient: true })} className="py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold shadow-lg transition-all flex items-center justify-center gap-2">
                           <KodraIcon icon={PlusCircle} size={18}/> المشروع الجديد (نفس العميل)
                       </button>
                       <button onClick={() => resetApp()} className="py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold transition-all flex items-center justify-center gap-2">
                           <KodraIcon icon={LogOut} size={18}/> خروج واختيار عميل آخر
                       </button>
                       <button onClick={()=>setShowResetConfirm(false)} className="py-2 mt-2 text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 font-medium transition-colors">
                           إلغاء
                       </button>
                  </div>
              </div>
          </div>
      )}
      
      <ProjectModal isOpen={showProjectsModal} onClose={() => setShowProjectsModal(false)} projects={projects} clients={clients} onLoad={loadProject} onDelete={deleteProject} onShowHistory={(p, e) => { e.stopPropagation(); setShowHistoryModal(p); }} />
      <HistoryModal project={showHistoryModal} onClose={() => setShowHistoryModal(null)} onRestore={restoreVersion} />
      
      <SaveProjectModal 
        isOpen={showSaveModal} 
        onClose={() => setShowSaveModal(false)} 
        onSave={handleFinalSave} 
        clients={clients} 
        defaultName={projects.find(p => p.id === currentProjectId)?.name || `Project ${new Date().toLocaleDateString()}`}
        defaultClientId={selectedClientId}
        strategy={strategy}
        existingProjects={projects} 
      />
      
      <AssetPicker isOpen={showAssetPicker} onClose={() => setShowAssetPicker(false)} projects={projects} onSelect={handleAssetSelect} />

      <Sidebar currentView={currentView} onViewChange={setCurrentView} uiFontWeight={uiFontWeight} onFontWeightChange={setUiFontWeight} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/50 backdrop-blur-md flex items-center px-4 md:px-8 justify-between z-10">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="md:hidden p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"><KodraIcon icon={Menu} size={24} /></button>
            <button onClick={() => setCurrentView(ViewMode.DASHBOARD)} className="text-xl text-slate-800 dark:text-white font-bold flex items-center gap-2 hover:opacity-80 transition-opacity">Kodra Engine</button>
            {!isOnline && (
                <span className="text-[10px] font-bold bg-red-100 text-red-600 px-2 py-0.5 rounded-full flex items-center gap-1 animate-pulse"><KodraIcon icon={WifiOff} size={10}/> Offline</span>
            )}
          </div>
          <div className="flex items-center gap-2 md:gap-4">
             {currentView === ViewMode.PROMPT_ENGINEER && (<><button onClick={() => setShowProjectsModal(true)} className="p-2 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"><KodraIcon icon={FolderOpen} size={20} /></button><button onClick={handleOpenSaveModal} className="p-2 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"><KodraIcon icon={Save} size={20} /></button></>)}
             <button onClick={toggleTheme} className="p-2 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                {theme === 'dark' ? <KodraIcon icon={Sun} size={20} /> : <KodraIcon icon={Moon} size={20} />}
             </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 relative custom-scrollbar">
          <div className="max-w-7xl mx-auto space-y-8 pb-10">
            {currentView === ViewMode.DASHBOARD && <Dashboard 
                onCreateNew={() => { resetApp(); setCurrentView(ViewMode.PROMPT_ENGINEER); }}
                onOpenEditor={() => setCurrentView(ViewMode.IMAGE_EDITOR)}
                onOpenDataCenter={() => setCurrentView(ViewMode.DATA_CENTER)}
                recentProjects={projects.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0,3)}
                onLoadProject={handleLoadProjectFromDataCenter}
            />}

            {currentView === ViewMode.DOCS && <DocsPage />}

            {currentView === ViewMode.PROMPT_ENGINEER && (
                <PromptStudio 
                    step={step} setStep={setStep}
                    briefText={briefText} setBriefText={setBriefText}
                    briefImage={briefImage} 
                    handleImageUpload={handleImageUpload} onFileDrop={onFileDrop} clearImage={clearImage}
                    isLoading={isLoading}
                    strategy={strategy} handleGenerateStrategy={handleGenerateStrategy}
                    jsonPrompts={jsonPrompts} handleEngineering={handleEngineering}
                    validation={validation}
                    selectedModel={selectedModel} setSelectedModel={setSelectedModel}
                    requiresArabic={requiresArabic} setRequiresArabic={setRequiresArabic}
                    forceAspectRatio={forceAspectRatio} setForceAspectRatio={setForceAspectRatio}
                    selectedDeliverableIndex={selectedDeliverableIndex} setSelectedDeliverableIndex={setSelectedDeliverableIndex}
                    selectedVariationIndex={selectedVariationIndex} setSelectedVariationIndex={setSelectedVariationIndex}
                    refinementText={refinementText} setRefinementText={setRefinementText}
                    handleRegenerate={handleRegenerate}
                    handleAutoFix={handleAutoFix}
                    onReset={() => setShowResetConfirm(true)}
                    addToast={addToast}
                    
                    clients={clients}
                    selectedClientId={selectedClientId}
                    setSelectedClientId={setSelectedClientId}
                    onCreateClient={handleCreateClient}
                    
                    onEditImage={handleSendToEditor}
                    
                    isStrategyLocked={isStrategyLocked}
                    onReuseStrategy={handleReuseStrategy}
                    onUnlockStrategy={() => setIsStrategyLocked(false)}

                    setJsonPrompts={setJsonPrompts}

                    // HISTORY PROPS
                    promptHistory={promptHistory}
                    historyIndex={historyIndex}
                    onUndo={handleUndoGeneration}
                    onRedo={handleRedoGeneration}

                    // NEW: Image to Text Prop
                    onImageToText={handleImageToText}
                />
            )}
            
            {currentView === ViewMode.IMAGE_EDITOR && (
                <ImageEditor 
                    addToast={addToast} 
                    state={imageEditorState}
                    onStateChange={updateImageEditorState}
                    pendingImage={pendingImageForEditor}
                    onAnalyze={handleSendToStrategy}
                    clients={clients}
                    activeClientId={selectedClientId}
                    onUpdateClient={handleUpdateClient}
                    
                    // NEW: Asset Saving
                    currentProjectId={currentProjectId}
                    onSaveAsset={handleSaveProjectAsset}
                    currentProjectAssets={activeProject?.assets}
                    onOpenLibrary={(type) => openAssetPicker(type)}
                />
            )}

            {currentView === ViewMode.DATA_CENTER && (
                <DataCenter 
                    projects={projects} 
                    setProjects={setProjects}
                    clients={clients}
                    setClients={setClients}
                    addToast={addToast}
                    onLoadProject={handleLoadProjectFromDataCenter}
                    onCreateProjectForClient={handleCreateProjectForClient}
                    
                    currentSettings={{ theme, font: uiFontWeight }}
                    onImportBackup={handleImportBackup}
                    currentProjectId={currentProjectId}
                />
            )}
          </div>
        </div>
      </main>
    </div>
  );
};
