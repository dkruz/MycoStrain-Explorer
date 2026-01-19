
import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult } from "../types";

export const performMycoAnalysis = async (speciesName: string, focusArea: string = "USA National"): Promise<AnalysisResult> => {
  let apiKey: string | undefined;

  // 1. Check if key is in session storage (provided by user via UI)
  apiKey = sessionStorage.getItem('MYCO_EXPLORER_KEY') || undefined;

  // 2. Fallback to env variables (works in AI Studio development)
  if (!apiKey) {
    try {
      apiKey = (process.env as any)?.API_KEY || (process.env as any)?.VITE_API_KEY;
    } catch (e) {}
  }

  // 3. Fallback to global window (some specific wrappers)
  if (!apiKey) {
    apiKey = (window as any).VITE_API_KEY || (window as any).API_KEY;
  }

  if (!apiKey) {
    // This custom error code triggers the UI Modal in App.tsx
    throw new Error("MISSING_KEY");
  }

  const ai = new GoogleGenAI({ apiKey });
  
  const prompt = `
    Act as a Computational Mycologist and Bioinformatics Researcher. Conduct a deep-dive analysis of: "${speciesName}".
    
    SEARCH STRATEGY: 
    1. Query academic databases (UniProt, MycoCosm/JGI, PubMed) and citizen science (GBIF, iNaturalist).
    2. Identify known secondary metabolite clusters (BGCs) or documented enzyme profiles.
    
    TASKS:
    - Determine NUTRITIONAL STRATEGY.
    - Estimate TOTAL haplotypes for the regional focus area (${focusArea}).
    - Model 12 specific haplotypes representing genetic drift.
    
    Return as structured JSON.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: prompt,
    config: {
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          speciesName: { type: Type.STRING },
          nucleotideDiversity: { type: Type.NUMBER },
          estimatedTotalHaplotypes: { type: Type.INTEGER },
          estimatedGlobalHaplotypes: { type: Type.INTEGER },
          dossier: { type: Type.STRING },
          focusArea: { type: Type.STRING },
          haplotypes: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                region: { type: Type.STRING },
                snps: { type: Type.ARRAY, items: { type: Type.STRING } },
                lat: { type: Type.NUMBER },
                lng: { type: Type.NUMBER },
                similarity: { type: Type.NUMBER },
                substrate: { type: Type.STRING },
                chemistry: { type: Type.STRING },
                regionalPrevalence: { type: Type.INTEGER }
              },
              required: ["id", "region", "snps", "lat", "lng", "similarity", "substrate", "chemistry", "regionalPrevalence"]
            }
          }
        },
        required: ["speciesName", "haplotypes", "nucleotideDiversity", "estimatedTotalHaplotypes", "estimatedGlobalHaplotypes", "dossier", "focusArea"]
      }
    }
  });

  const jsonStr = response.text || '{}';
  const parsed = JSON.parse(jsonStr);
  
  const sources: any[] = [];
  const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
  chunks.forEach((chunk: any) => {
    if (chunk.web) sources.push({ title: chunk.web.title, uri: chunk.web.uri });
  });

  return { ...parsed, sources };
};
