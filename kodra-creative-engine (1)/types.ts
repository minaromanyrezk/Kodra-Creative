

export enum AppStep {
  BRIEF_INPUT = 'BRIEF_INPUT',
  STRATEGY_GENERATION = 'STRATEGY_GENERATION',
  JSON_ENGINEERING = 'JSON_ENGINEERING',
  VALIDATION = 'VALIDATION',
  FINAL_OUTPUT = 'FINAL_OUTPUT'
}

export enum ViewMode {
  DASHBOARD = 'DASHBOARD',
  PROMPT_ENGINEER = 'PROMPT_ENGINEER',
  IMAGE_EDITOR = 'IMAGE_EDITOR',
  DATA_CENTER = 'DATA_CENTER',
  DOCS = 'DOCS'
}

// --- DIGITAL-ONLY ASSET TAXONOMY ---
export enum SocialAssetType {
  STATIC_POST = 'Static Post (1:1 / 4:5)',
  CAROUSEL = 'Carousel / Slider (4:5)',
  STORY_REEL = 'Story / Reel (9:16)',
  WEB_BANNER = 'Web / Cover Banner (16:9)',
  DIGITAL_CARD = 'Digital Card (9:16 / 1:1)',
  MOTION_GRAPHIC = 'Motion Graphic / Video (16:9 / 9:16)'
}

export enum ProjectStatus {
  DRAFT = 'Draft',
  IN_PROGRESS = 'In Progress',
  IN_REVIEW = 'In Review',
  APPROVED = 'Approved',
  COMPLETED = 'Completed',
  ARCHIVED = 'Archived'
}

export enum ModelType {
  // --- KODRA ARSENAL (Charter v1.0) ---
  
  // Arabic & Fonts (Charter Art. 5)
  NANO_BANANA_PRO_2 = 'Nano Banana Pro 2',
  NANO_BANANA = 'Nano Banana',
  
  // Core Engine (Charter Art. 4)
  GEMINI_3_PRO = 'Gemini 3 Pro',
  GEMINI_3_PRO_2K = 'Gemini 3 Pro (2K)',
  
  // Direct Text / Photorealism
  IMAGEN_3 = 'Imagen 3',
  IMAGEN_4_ULTRA = 'Imagen 4 Ultra',
  
  // Art & Cinema (Charter Art. 5)
  MIDJOURNEY_PRO = 'Midjourney Pro',
  
  // Commercial Reality
  ADOBE_FIREFLY = 'Adobe Firefly',
  
  // --- LEGACY / FLUX SUPPORT ---
  FLUX_KONTEXT_PRO = 'Flux 1 Kontext Pro',
  FLUX_2_PRO = 'Flux 2 Pro',
  SEEDREAM_4_5 = 'SeeDream 4.5',
  
  // --- SPECIALIZED ---
  DALLE_3 = 'DALL-E 3',
  RECRAFT_V3 = 'Recraft v3',
  IDEOGRAM_V3 = 'Ideogram v3'
}

export type UIFontWeight = 'light' | 'regular' | 'medium' | 'bold';

// Global Toast Interface
export interface Toast { 
  id: string; 
  message: string; 
  type: 'success' | 'error' | 'info'; 
}

// STRICT CLEAN SCHEMA
export interface PromptJson {
  client_input_analysis: {
    brief_complexity_score: number;
  };
  subject: {
    type: string;
    description: string;
    pose: string;
    position: string;
    features: string[];
  };
  environment: string;
  lighting: string;
  camera: string;
  style: string;
  color_palette: string;
  typography: string;
  composition: string;
  mood: string;
  /**
   * Professional image generation specs.
   * e.g., "8k resolution, octane render, commercial grade, sharp focus"
   */
  technical_details: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface StrategyReport {
  sourceMode: 'text' | 'image';
  tasks: string[];
  approach: string;
  targetPlatform: string;
  recommendedAspectRatio: string;
  targetAudience: string;
  coreMessage: string;
  hardConstraints: string[];
  
  // New Digital Classification Fields
  assetClass: SocialAssetType;
  printConversionLog?: string; // e.g. "Converted 'Flyer' to 'Static Post'"
  
  deliverableTypes: { type: string; ratio: string }[];
  recommendedModel?: string;
  requiresArabicTextRendering?: boolean;
  isBriefVague?: boolean;
  trendAnalysis?: string;
  colorPsychology?: string;
  clarifications?: string[];
  referenceImageUrls?: string[];
}

export interface ProjectVersion {
  id: string;
  timestamp: string;
  briefText: string;
  briefImage?: string;
  strategy?: StrategyReport;
  jsonPrompts?: PromptJson[];
  note?: string;
}

export interface BrandPreset {
  x: number;
  y: number;
  scale: number;
  opacity: number;
}

export interface Client {
  id: string;
  name: string;
  industry?: string;
  notes?: string;
  contactPerson?: string;
  email?: string;
  // Brand Assets
  logo?: string;      // Base64
  watermark?: string; // Base64
  // Brand Memory (Layout Preferences)
  logoSettings?: BrandPreset;
  watermarkSettings?: BrandPreset;
}

export interface Layer {
  id: string;
  type: 'logo' | 'watermark' | 'upload';
  src: string;
  visible: boolean;
  x: number;
  y: number;
  scale: number;
  opacity: number;
  zIndex: number;
}

export interface ProjectAsset {
  id: string;
  type: 'final' | 'draft' | 'upload';
  src: string;
  timestamp: string;
  name?: string;
}

export interface Project {
  id: string;
  name: string;
  clientId?: string;
  date: string;
  status?: ProjectStatus;
  tags?: string[];
  briefText: string;
  briefLink?: string;
  briefImage?: string;
  thumbnail?: string;
  strategy?: StrategyReport;
  jsonPrompts?: PromptJson[]; 
  requiresArabic?: boolean;
  selectedModel?: ModelType;
  versionHistory?: ProjectVersion[];
  assets?: ProjectAsset[];
}

export interface ImageEditorState {
  editorImage: string | null;
  editorPrompt: string;
  editedResult: string | null;
  layers: Layer[];
  adjustments: {
    brightness: number;
    contrast: number;
    saturation: number;
  };
  mode: 'ai_edit' | 'branding';
}

// System Backup Interface
export interface KodraBackup {
  meta: {
    version: string;
    timestamp: string;
    exportedBy: string;
  };
  settings: {
    theme: 'light' | 'dark';
    font: UIFontWeight;
  };
  data: {
    clients?: Client[];
    projects?: Project[];
  };
}

export interface AutoSaveSession {
    timestamp: number;
    briefText?: string;
    briefImage?: string | null;
    strategy?: StrategyReport | null;
    jsonPrompts?: PromptJson[] | null;
    promptHistory?: PromptJson[][]; // History Stack
    historyIndex?: number;          // Current Pointer
    selectedModel?: ModelType;
    requiresArabic?: boolean;
    selectedClientId?: string;
    currentView?: ViewMode;
    step?: AppStep;
    currentProjectId?: string | null;
    imageEditorState?: ImageEditorState;
}