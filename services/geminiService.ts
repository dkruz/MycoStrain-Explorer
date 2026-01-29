import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult } from "../types";

export const performMycoAnalysis = async (speciesName: string, focusArea: string = "USA National"): Promise<AnalysisResult> => {
  // Robustly attempt to find the API key in various possible locations
  // 1. process.env (shimmed or injected)
  // 2. window.API_KEY (some platforms)
  // 3. window.process.env (browser-based shims)
  const apiKey = 
    (process.env as any).API_KEY || 
    (process.env as any).GOOGLE_API_KEY || 
    (window as any).API_KEY || 
    (window as any).process?.env?.API_KEY ||
    (window as any).process?.env?.GOOGLE_API_KEY;
  
  if (!apiKey) {
    console.error("API Key Search Failure. Checked: process.env.API_KEY, GOOGLE_API_KEY, window.API_KEY");
    throw new Error("MISSING_KEY");
  }

  const ai = new GoogleGenAI({ apiKey });
  
  const prompt = `
    Act as a Senior Computational Mycologist. 
    Analyze the genomic distribution and ecological niche of: "${speciesName}".
    Focus Area: ${focusArea}.
    
    CRITICAL RESEARCH REQUIREMENTS:
    1. HAPLOTYPES: Model exactly 12 scientifically plausible haplotypes.
    2. GEOGRAPHIC SPREAD: Ensure the coordinates (lat/lng) are realistically distributed across the USA. 
       - COORDINATE RANGE (MANDATORY): Latitude 25.0 to 48.0, Longitude -124.0 to -67.0.
       - DO NOT generate points in Canada, Mexico, or the open ocean.
       - These points must strictly fall within the continental USA silhouette.
       - Use precision decimals (e.g. 45.5231, -122.6765).
    3. HOST ASSOCIATION (MANDATORY): For every haplotype, identify the specific primary host species (e.g., "Abies balsamea").
    4. ENTOMOLOGICAL DATA: Describe specific insect vectors, symbionts, or mycophages for each regional clade.
    5. GENOMICS: Provide regional nucleotide diversity (pi) and 3-5 defining SNPs.
    
    Return the analysis as a structured JSON object.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: prompt,
    config: {
      tools: [{ googleSearch: {} }],
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
                insectAssociations: { type: Type.STRING },
                regionalPrevalence: { type: Type.INTEGER }
              },
              required: ["id", "region", "snps", "lat", "lng", "similarity", "substrate", "chemistry", "insectAssociations", "regionalPrevalence"]
            }
          }
        },
        required: ["speciesName", "haplotypes", "nucleotideDiversity", "estimatedTotalHaplotypes", "estimatedGlobalHaplotypes", "dossier", "focusArea"]
      }
    }
  });

  const rawText = response.text || '';
  
  let jsonStr = '';
  const jsonMatch = rawText.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    jsonStr = jsonMatch[0];
  } else {
    throw new Error("The model did not return a valid JSON structure.");
  }

  const parsed = JSON.parse(jsonStr);
  
  const sources: any[] = [];
  const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
  chunks.forEach((chunk: any) => {
    if (chunk.web) {
      sources.push({ 
        title: chunk.web.title || 'Research Source', 
        uri: chunk.web.uri 
      });
    }
  });

  return { ...parsed, sources };
};