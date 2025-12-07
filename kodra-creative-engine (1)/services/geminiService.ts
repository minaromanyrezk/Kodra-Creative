
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { 
  SYSTEM_PROMPT,
} from "../constants";
import { PromptJson, StrategyReport, ValidationResult, SocialAssetType } from "../types";

// KODRA CHARTER v4.3: "The Core Engine... exclusively on Google AI Suite"
const MODEL_NAME = 'gemini-3-pro-preview';
const IMAGE_EDIT_MODEL = 'gemini-2.5-flash-image';
const FALLBACK_MODEL = 'gemini-2.5-flash';

interface GeminiPart {
  text?: string;
  inlineData?: {
    mimeType: string;
    data: string;
  };
}

const getAiClient = (): GoogleGenAI => {
  if (!process.env.API_KEY) {
    throw new Error("API_KEY is missing from environment variables");
  }
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

/**
 * Robust JSON Extractor and Sanitizer
 * Intelligent extraction handling Markdown code blocks, raw JSON, and cleanup.
 */
const extractJson = (input: unknown): string => {
  if (!input || typeof input !== 'string') return "{}";
  const str = input as string;

  // 1. Try finding Markdown Code Block explicitly first
  const jsonBlockRegex = /```json\s*([\s\S]*?)\s*```/;
  const match = str.match(jsonBlockRegex);
  if (match && match[1]) {
    return match[1].trim();
  }

  // 2. If no code block, try to find the structure based on brackets
  const firstOpenBrace = str.indexOf('{');
  const firstOpenBracket = str.indexOf('[');

  let startIndex = -1;
  let endIndex = -1;
  let mode: 'object' | 'array' = 'object';

  if (firstOpenBracket !== -1 && (firstOpenBrace === -1 || firstOpenBracket < firstOpenBrace)) {
    startIndex = firstOpenBracket;
    mode = 'array';
  } else if (firstOpenBrace !== -1) {
    startIndex = firstOpenBrace;
    mode = 'object';
  }

  if (startIndex === -1) return str; // Return raw if no JSON structure found

  if (mode === 'array') {
      endIndex = str.lastIndexOf(']');
  } else {
      endIndex = str.lastIndexOf('}');
  }

  if (endIndex !== -1 && endIndex > startIndex) {
    let candidate = str.substring(startIndex, endIndex + 1);
    // Sanitize control characters that break JSON.parse
    candidate = candidate.replace(/[\x00-\x09\x0B-\x1F\x7F]/g, ' '); 
    return candidate;
  }

  // Fallback cleanup
  return str.replace(/```json\s*/g, '').replace(/```\s*/g, '');
};

const safeJsonParse = <T>(jsonString: string, fallback: T): T => {
  try {
    return JSON.parse(jsonString) as T;
  } catch (error) {
    // Only log critical parse errors if structure looked somewhat valid
    if(jsonString.trim().startsWith('{') || jsonString.trim().startsWith('[')) {
       console.warn("JSON Parse Warning: Failed to parse potential JSON content.", error);
    }
    return fallback;
  }
};

export const generateStrategy = async (text: string, imageBase64: string | null, link?: string, clientContext?: string): Promise<StrategyReport> => {
  const ai = getAiClient();
  const parts: GeminiPart[] = [];
  let sourceMode: 'text' | 'image' = 'text';
  
  if (imageBase64) {
    sourceMode = 'image';
    const mimeType = imageBase64.startsWith('data:image/png') ? 'image/png' : 'image/jpeg';
    const base64Data = imageBase64.split(',')[1];
    parts.push({ inlineData: { mimeType: mimeType, data: base64Data } });
    parts.push({ text: `PRIMARY INSTRUCTION: Analyze this image to understand the visual requirements.` });
    if (text) parts.push({ text: `CLIENT BRIEF: ${text}` });
  } else {
    sourceMode = 'text';
    parts.push({ text: `PRIMARY INSTRUCTION: Analyze this Client Brief.` });
    parts.push({ text: `CLIENT BRIEF: ${text}` });
  }

  if (clientContext) {
    parts.push({ text: `CLIENT BRAND GUIDELINES / CONTEXT: ${clientContext}` });
  }

  const strategyPrompt = `
  You are a Senior Digital Strategist at Kodra Creative. Analyze the input based on the 'Kodra Global Charter v4.3'.
  
  1. DIGITAL-ONLY ASSET TAXONOMY (The Allowed List):
     Classify the request into EXACTLY ONE of these types:
     - 'Static Post (1:1 / 4:5)'
     - 'Carousel / Slider (4:5)'
     - 'Story / Reel (9:16)'
     - 'Web / Cover Banner (16:9)'
     - 'Digital Card (9:16 / 1:1)'
     - 'Motion Graphic / Video (16:9 / 9:16)'

  2. THE NO-PRINT FIREWALL (Critical):
     - STRICTLY FORBID all print formats (Flyers, Brochures, Roll-ups, Business Cards, CMYK, Bleed, Inches).
     - IF user asks for a 'Flyer' or 'Poster', AUTO-CONVERT to 'Static Post'.
     - IF user asks for 'Brochure' or 'Menu', AUTO-CONVERT to 'Carousel / Slider'.
     - Output ONLY RGB and Pixels.
     - Log this conversion in the 'printConversionLog' field.

  3. INTELLIGENT MAPPING LOGIC & SMART ROUTING PROTOCOL (Charter Art. 2.5):
     - THE ARABIC RULE: If the design contains ANY Arabic text/typography -> You MUST set 'requiresArabicTextRendering' to true. Recommended Model MUST be 'Nano Banana Pro 2'.
     - THE HYPER-REALISM RULE: If the request is for Photorealistic/Commercial Photography AND contains NO specific text -> Recommended Model: 'Imagen 3' or 'Flux 2 Pro'.
     - THE CREATIVE RULE: For Artistic/Abstract/Fast concepts -> Recommended Model: 'Seedream 4.5' or 'Ideogram v3'.
     - DEFAULT: For complex reasoning or general use -> 'Gemini 3 Pro'.

  OUTPUT JSON (StrategyReport):
  {
    "assetClass": "SocialAssetType string",
    "printConversionLog": "string",
    "tasks": ["string"],
    "approach": "string",
    "targetPlatform": "string",
    "recommendedAspectRatio": "string",
    "targetAudience": "string",
    "coreMessage": "string",
    "hardConstraints": ["string"],
    "requiresArabicTextRendering": boolean,
    "deliverableTypes": [{"type": "string", "ratio": "string"}],
    "isBriefVague": boolean,
    "recommendedModel": "string",
    "trendAnalysis": "string",
    "colorPsychology": "string"
  }
  `;

  parts.push({ text: strategyPrompt });

  const executeGeneration = async (model: string) => {
      return await ai.models.generateContent({
          model: model,
          contents: { parts },
          config: { 
              tools: [{ googleSearch: {} }],
              responseMimeType: "application/json"
          }
      });
  };

  try {
    let response: GenerateContentResponse;
    try {
        response = await executeGeneration(MODEL_NAME);
    } catch (primaryError: unknown) {
        console.warn(`Strategy: Primary model (${MODEL_NAME}) failed. Attempting fallback to ${FALLBACK_MODEL}.`);
        response = await executeGeneration(FALLBACK_MODEL);
    }

    const cleanJson = extractJson(response.text || "{}");
    
    let parsed: unknown;
    try {
        parsed = JSON.parse(cleanJson);
    } catch (e) {
        const textData = response.text || "";
        const looseMatch = textData.match(/\{[\s\S]*\}/);
        if (looseMatch) {
            try { parsed = JSON.parse(looseMatch[0]); } catch(e2) { parsed = {}; }
        } else {
            parsed = {};
        }
    }

    const report = (typeof parsed === 'object' && parsed !== null) 
        ? (Array.isArray(parsed) ? parsed[0] : parsed) as Partial<StrategyReport> 
        : {};
    
    return {
        sourceMode: sourceMode,
        tasks: report.tasks || [],
        approach: report.approach || "Analysis generated.",
        targetPlatform: report.targetPlatform || "General",
        recommendedAspectRatio: report.recommendedAspectRatio || "1:1",
        targetAudience: report.targetAudience || "General Audience",
        coreMessage: report.coreMessage || "Visual Content",
        hardConstraints: report.hardConstraints || [],
        deliverableTypes: report.deliverableTypes || [{ type: "Standard", ratio: "1:1" }],
        requiresArabicTextRendering: report.requiresArabicTextRendering || false,
        isBriefVague: report.isBriefVague || false,
        recommendedModel: report.recommendedModel || 'Gemini 3 Pro',
        assetClass: report.assetClass || SocialAssetType.STATIC_POST,
        printConversionLog: report.printConversionLog,
        trendAnalysis: report.trendAnalysis,
        colorPsychology: report.colorPsychology,
        clarifications: report.clarifications,
        referenceImageUrls: report.referenceImageUrls
    } as StrategyReport;
  } catch (e) {
    return {
        sourceMode: sourceMode,
        approach: "System Error: Strategy generation failed due to quota/network issues.",
        tasks: [], 
        targetPlatform: "Unknown", 
        recommendedAspectRatio: "1:1", 
        targetAudience: "N/A", 
        coreMessage: "Error processing request", 
        hardConstraints: [], 
        deliverableTypes: [{ type: "Default", ratio: "1:1" }], 
        requiresArabicTextRendering: false,
        isBriefVague: false,
        assetClass: SocialAssetType.STATIC_POST
    };
  }
};

export const generateJsonPrompt = async (
  text: string, 
  strategy: StrategyReport, 
  selectedDeliverableIndex: number = 0, 
  customInstruction?: string,
  overrideAspectRatio?: string
): Promise<PromptJson[]> => {
  const ai = getAiClient();
  const deliverable = strategy.deliverableTypes[selectedDeliverableIndex] || strategy.deliverableTypes[0];
  const targetRatio = overrideAspectRatio || deliverable.ratio; 

  const prompt = `
  ${SYSTEM_PROMPT}

  ADDITIONAL CONTEXT FROM STRATEGY:
  - Asset Class: ${strategy.assetClass}
  - Mood/Core Message: ${strategy.coreMessage}
  - Platform/Ratio: ${targetRatio}
  - Hard Constraints: ${JSON.stringify(strategy.hardConstraints)}
  - Source Context: ${strategy.sourceMode === 'image' ? 'Reference Image' : 'Text Brief'}

  ${customInstruction ? `USER REFINEMENT INSTRUCTION: ${customInstruction}` : ''}

  TASK: Generate 5 DISTINCT VARIATIONS of the JSON Prompt.
  Execute 'Vision Matrix 3.0' for each variation.

  OUTPUT: A JSON ARRAY of 5 objects matching the specified keys.
  `;

  const attemptGeneration = async (model: string) => {
      const response = await ai.models.generateContent({
        model: model,
        contents: prompt,
        config: { responseMimeType: "application/json" }
      });
      const cleanJson = extractJson(response.text || "[]");
      const result = safeJsonParse(cleanJson, []);
      
      if (Array.isArray(result)) return result as PromptJson[];
      if (result && typeof result === 'object') return [result] as PromptJson[];
      return [];
  };

  try {
    return await attemptGeneration(MODEL_NAME);
  } catch (e: unknown) {
    console.warn(`Engineering: Primary model (${MODEL_NAME}) failed. Attempting fallback to ${FALLBACK_MODEL}.`);
    try {
        return await attemptGeneration(FALLBACK_MODEL);
    } catch (e2) {
        return [];
    }
  }
};

export const validatePromptJson = async (jsons: PromptJson[], strategy?: StrategyReport): Promise<ValidationResult> => {
  const ai = getAiClient();
  if (!jsons || jsons.length === 0) return { isValid: false, errors: ["No data to validate"], warnings: [] };
  
  const strategyContext = strategy ? `
  STRATEGY CONTEXT:
  - Core Message: ${strategy.coreMessage || "N/A"}
  - Target Audience: ${strategy.targetAudience || "N/A"}
  - Hard Constraints: ${JSON.stringify(strategy.hardConstraints || [])}
  ` : "STRATEGY CONTEXT: None available.";

  const prompt = `
  You are a Lead Technical Auditor for AI Imaging.
  Perform a DEEP SEMANTIC AUDIT on the provided JSON object.

  ${strategyContext}

  AUDIT RULES:
  1. **Completeness**: 'subject' must be a detailed OBJECT. 'technical_details' must be professional.
  2. **Internal Consistency**: Lighting vs Mood.
  3. **Constraint Adherence**: Verify Hard Constraints.

  JSON TO AUDIT: ${JSON.stringify(jsons[0])}

  OUTPUT JSON:
  { "isValid": boolean, "errors": ["string"], "warnings": ["string"] }
  `;

  const attemptValidation = async (model: string) => {
      const response = await ai.models.generateContent({
        model: model,
        contents: prompt,
        config: { responseMimeType: "application/json" }
      });
      const cleanJson = extractJson(response.text || "{}");
      const result = safeJsonParse(cleanJson, { isValid: false, errors: ["Parse Error"], warnings: [] }) as { isValid: boolean; errors?: string[]; warnings?: string[] };
      return { isValid: !!result.isValid, errors: result.errors || [], warnings: result.warnings || [] };
  };

  try {
    return await attemptValidation(MODEL_NAME);
  } catch (e: unknown) {
    console.warn(`Validation: Primary model (${MODEL_NAME}) failed. Attempting fallback to ${FALLBACK_MODEL}.`);
    try {
        return await attemptValidation(FALLBACK_MODEL);
    } catch (e2) {
        return { isValid: false, errors: ["Validation Audit Failed - System Error"], warnings: [] };
    }
  }
};

export const fixJsonPrompt = async (json: PromptJson, errors: string[]): Promise<PromptJson> => {
    const ai = getAiClient();
    const prompt = `
    You are an Expert AI Repair Engineer.
    REPORTED ERRORS: ${JSON.stringify(errors)}
    BROKEN JSON: ${JSON.stringify(json)}
  
    TASK: Generate a FIXED JSON object that resolves all errors.
    `;
  
    const attemptFix = async (model: string) => {
        const response = await ai.models.generateContent({
            model: model,
            contents: prompt,
            config: { responseMimeType: "application/json" }
        });
        const cleanJson = extractJson(response.text || "{}");
        return safeJsonParse(cleanJson, json) as PromptJson;
    };

    try {
      return await attemptFix(MODEL_NAME);
    } catch (e: unknown) {
      console.warn(`Repair: Primary model (${MODEL_NAME}) failed. Attempting fallback to ${FALLBACK_MODEL}.`);
      try {
          return await attemptFix(FALLBACK_MODEL);
      } catch (e2) {
          return json;
      }
    }
};

export const editImageWithGemini = async (imageBase64: string, promptText: string): Promise<string> => {
  const ai = getAiClient();
  const mimeType = imageBase64.startsWith('data:image/png') ? 'image/png' : 'image/jpeg';
  const base64Data = imageBase64.split(',')[1];
  
  const response = await ai.models.generateContent({
      model: IMAGE_EDIT_MODEL,
      contents: { parts: [{ inlineData: { mimeType, data: base64Data } }, { text: promptText }] }
  });
  
  if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) {
              return `data:image/png;base64,${part.inlineData.data}`;
          }
      }
  }
  throw new Error("No image generated.");
};

export const generateTextFromImage = async (imageBase64: string): Promise<string> => {
  const ai = getAiClient();
  const mimeType = imageBase64.startsWith('data:image/png') ? 'image/png' : 'image/jpeg';
  const base64Data = imageBase64.split(',')[1];

  const prompt = `
  You are a Reverse Prompt Engineer.
  Analyze the uploaded image and generate a high-fidelity text prompt that allows a generative AI model to reproduce this exact image.
  
  Focus on:
  - Subject details (features, pose, attire)
  - Medium (photography, 3D render, illustration, painting)
  - Style (cyberpunk, minimalism, baroque, cinematic)
  - Lighting (hard/soft, direction, color temperature)
  - Composition (camera angle, framing, depth of field)
  
  Output ONLY the text prompt description. Do not add introductory phrases.
  `;

  const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: { parts: [{ inlineData: { mimeType, data: base64Data } }, { text: prompt }] }
  });

  return response.text || "";
};
