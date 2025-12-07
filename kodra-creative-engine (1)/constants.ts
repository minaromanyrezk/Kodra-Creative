import { ModelType, Project, SocialAssetType } from './types';

// ==========================================
// 1. TEXT MODE CONSTANTS (Brief to JSON)
// ==========================================
export const TEXT_BRIEF_SYS_PROMPT = `
You are a professional AI image prompt engineer running on the 'Kodra Engine' (Charter v4.3).
Your core function is to execute the 'Vision Matrix 3.0' analysis to convert client briefs into 'Kodra Syntax'.

VISION MATRIX 3.0 LAYERS (Charter Art 2.2):
1. COMPOSITION: Framing, Camera Angle, Focal Points (Neuro-Design).
2. LIGHTING: Light Source, Color Temperature, Shadow Falloff.
3. TEXTURE: Surface Details, Material Physics, Micro-Contrast.
4. CONTEXT: Environment, Atmosphere, Cultural Nuances.

Requirements:
1. Extract ALL visual elements using the Vision Matrix layers above.
2. Ignore any non-visual instructions (marketing goals, target audience, etc.).
3. Structure the output as a complete JSON with these keys:
   - client_input_analysis: { 
       brief_complexity_score: number (1-10)
     }
   - subject: {
       type: "string",
       description: "string (High-fidelity visual description)",
       pose: "string",
       position: "string",
       features: ["string array"]
     }
   - environment (Context Layer)
   - lighting (Lighting Layer)
   - camera (Composition Layer)
   - style (Artistic Direction)
   - color_palette
   - typography (Nano Banana Pro 2 Protocol if Arabic)
   - composition (Composition Layer)
   - mood (Context Layer)
   - technical_details (Texture/Rendering Layer - e.g. Octane, 8k)

CRITICAL LOGIC CHECK:
Before outputting, verify Spatial Consistency between 'position' and 'composition'.
- IF 'composition' dictates placement (e.g. Rule of Thirds), force 'subject.position' to match.
- NEVER output contradictory spatial commands.

Return ONLY valid JSON.
`;

export const TEXT_PREFIX_CODE = `"Generate a photorealistic image based on this Kodra Syntax specification. Apply Vision Matrix 3.0 layers strictly."`;


// ==========================================
// 2. IMAGE MODE CONSTANTS (Image to JSON)
// ==========================================
export const IMAGE_ANALYSIS_SYS_PROMPT = `
"Execute Vision Matrix 3.0 Analysis on this image. Deconstruct it into independent layers:
1. COMPOSITION (Framing, Angles)
2. LIGHTING (Sources, Temperature)
3. TEXTURE (Materials, Surface)
4. CONTEXT (Environment, Story)

Create a comprehensive JSON strictly following the Kodra Schema:
{
   "client_input_analysis": { "brief_complexity_score": 10 },
   "subject": { "type": "string", "description": "string", "pose": "string", "position": "string", "features": [] },
   "environment": "string",
   "lighting": "string",
   "camera": "string",
   "style": "string",
   "color_palette": "string",
   "typography": "string",
   "composition": "string",
   "mood": "string",
   "technical_details": "string"
}
`;

export const IMAGE_PREFIX_CODE = `"Generate an image exactly matching this Vision Matrix specification:`;


// ==========================================
// 3. MODEL GROUPS (For UI - Charter v1.0)
// ==========================================

export const ARABIC_MODELS = [
  ModelType.NANO_BANANA_PRO_2,
  ModelType.NANO_BANANA
];

export const GOOGLE_MODELS = [
    ModelType.GEMINI_3_PRO_2K,
    ModelType.GEMINI_3_PRO,
    ModelType.IMAGEN_4_ULTRA,
    ModelType.IMAGEN_3
];

export const FLUX_MODELS = [
    ModelType.FLUX_KONTEXT_PRO,
    ModelType.FLUX_2_PRO,
    ModelType.SEEDREAM_4_5
];

export const SPECIALIZED_MODELS = [
    ModelType.MIDJOURNEY_PRO,
    ModelType.ADOBE_FIREFLY,
    ModelType.DALLE_3,
    ModelType.RECRAFT_V3,
    ModelType.IDEOGRAM_V3
];

export const SEEDREAM_MODELS = []; // Merged into Flux or unused

export const NON_ARABIC_MODELS = [
    ...GOOGLE_MODELS,
    ...FLUX_MODELS,
    ...SPECIALIZED_MODELS
];

// Fallback for types/mocks
export const PREFIX_CODE = TEXT_PREFIX_CODE; 
export const SYSTEM_PROMPT = TEXT_BRIEF_SYS_PROMPT;

export const SCHEMA_TOOLTIPS: Record<string, string> = {
  "client_input_analysis": "تحليل أولي لمدى تعقيد البريف.",
  "subject": "تفاصيل الكائن الأساسي (النوع، الوضعية، الميزات).",
  "environment": "الطبقة الرابعة: السياق والبيئة المحيطة.",
  "lighting": "الطبقة الثانية: توزيع الإضاءة والحرارة اللونية.",
  "camera": "الطبقة الأولى: زاوية التصوير والبعد البؤري.",
  "style": "المدرسة الفنية أو النمط البصري.",
  "color_palette": "الألوان المهيمنة وأكواد الهوية البصرية.",
  "typography": "مواصفات النصوص (بروتوكول Nano Banana).",
  "composition": "الطبقة الأولى: قواعد التكوين وتوزيع العناصر.",
  "mood": "الحالة الشعورية أو الجو العام للصورة.",
  "technical_details": "الطبقة الثالثة: الملمس وإعدادات الريندر التقنية."
};

export const MOCK_PROJECTS: Project[] = [];