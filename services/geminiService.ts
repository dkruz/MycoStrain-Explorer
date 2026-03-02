
import { GoogleGenAI, Type, ThinkingLevel } from "@google/genai";
import { AnalysisResult } from "../types";
import { UsageTracker } from "./usageTracker";

export const performMycoAnalysis = async (
  speciesName: string, 
  focusArea: string = "USA National", 
  mode: 'amateur' | 'professional' = 'professional'
): Promise<AnalysisResult> => {
  // Use process.env.GEMINI_API_KEY which is defined in vite.config.ts
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey || apiKey === "undefined" || apiKey === "" || apiKey === "null") {
    throw new Error("BUILD_INTEGRITY_FAILURE: The GEMINI_API_KEY environment variable was missing during the Vercel build process. Please add 'GEMINI_API_KEY' to your Vercel Project Settings and trigger a manual Redeploy.");
  }

  const ai = new GoogleGenAI({ apiKey });
  
  const basePrompt = `
    Act as a Senior Computational Mycologist. Analyze: "${speciesName}".
    Focus Area: ${focusArea}.
    Mode: ${mode}.

    CRITICAL TRUST PROTOCOL:
    You must use the googleSearch tool to find established scientific records. 
    In your response, you must quantify "Data Provenance":
    - DETERMINISTIC DATA: Facts found directly in search results (taxonomic records, specific lat/lng from studies, verified host trees).
    - PROBABILISTIC DATA: Hypothesized inferences where data is missing (simulated SNP sequences, inferred divergence times, projected regional prevalence).

    TASKS:
    1. Origin/Migration analysis.
    2. 12 Haplotypes with SNP markers.
    3. 3 Citizen Science Missions.
    4. Provide a 'trustProfile' quantifying the ratio of Deterministic vs Probabilistic info for the Network, Timeline, and Data Table based on your search success.

    Return valid JSON.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.1-pro-preview',
      contents: basePrompt,
      config: {
        tools: [{ googleSearch: {} }],
        thinkingConfig: { thinkingLevel: ThinkingLevel.HIGH },
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            speciesName: { type: Type.STRING },
            nucleotideDiversity: { type: Type.NUMBER },
            estimatedTotalHaplotypes: { type: Type.INTEGER },
            estimatedGlobalHaplotypes: { type: Type.INTEGER },
            ancestralOrigin: { type: Type.STRING },
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
                  regionalPrevalence: { type: Type.INTEGER },
                  divergenceTime: { type: Type.NUMBER },
                  originCenter: { type: Type.STRING },
                  functionalTrait: { type: Type.STRING }
                },
                required: ["id", "region", "snps", "lat", "lng", "similarity", "substrate", "chemistry", "insectAssociations", "regionalPrevalence", "divergenceTime", "originCenter", "functionalTrait"]
              }
            },
            citizenScienceMissions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                  priority: { type: Type.STRING, enum: ["High", "Medium", "Low"] },
                  action: { type: Type.STRING }
                },
                required: ["title", "description", "priority", "action"]
              }
            },
            trustProfile: {
              type: Type.OBJECT,
              properties: {
                network: {
                  type: Type.OBJECT,
                  properties: {
                    deterministicRatio: { type: Type.NUMBER },
                    probabilisticRatio: { type: Type.NUMBER },
                    confidenceScore: { type: Type.NUMBER }
                  }
                },
                timeline: {
                  type: Type.OBJECT,
                  properties: {
                    deterministicRatio: { type: Type.NUMBER },
                    probabilisticRatio: { type: Type.NUMBER },
                    confidenceScore: { type: Type.NUMBER }
                  }
                },
                dataTable: {
                  type: Type.OBJECT,
                  properties: {
                    deterministicRatio: { type: Type.NUMBER },
                    probabilisticRatio: { type: Type.NUMBER },
                    confidenceScore: { type: Type.NUMBER }
                  }
                }
              }
            }
          },
          required: ["speciesName", "haplotypes", "nucleotideDiversity", "estimatedTotalHaplotypes", "estimatedGlobalHaplotypes", "dossier", "focusArea", "ancestralOrigin", "citizenScienceMissions", "trustProfile"]
        }
      }
    });

    let jsonStr = response.text || '{}';
    
    // The model should now strictly follow the schema, but we still handle potential markdown wrapping
    jsonStr = jsonStr.trim();
    if (jsonStr.startsWith('```')) {
      const match = jsonStr.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (match) jsonStr = match[1];
    }

    // Fallback to brace extraction if JSON.parse fails or if there's still conversational noise
    try {
      JSON.parse(jsonStr);
    } catch (e) {
      const startIndex = jsonStr.indexOf('{');
      if (startIndex !== -1) {
        let depth = 0;
        let inString = false;
        let escape = false;
        for (let i = startIndex; i < jsonStr.length; i++) {
          const char = jsonStr[i];
          if (inString) {
            if (escape) escape = false;
            else if (char === '\\') escape = true;
            else if (char === '"') inString = false;
          } else {
            if (char === '"') inString = true;
            else if (char === '{') depth++;
            else if (char === '}') {
              depth--;
              if (depth === 0) {
                jsonStr = jsonStr.substring(startIndex, i + 1);
                break;
              }
            }
          }
        }
      }
    }

    const parsed = JSON.parse(jsonStr);
    const sources: any[] = [];
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    chunks.forEach((chunk: any) => {
      if (chunk.web) {
        sources.push({ title: chunk.web.title || 'Scientific Reference', uri: chunk.web.uri });
      }
    });

    // Ensure all required fields have defaults to prevent UI crashes
    return { 
      speciesName: parsed.speciesName || speciesName,
      nucleotideDiversity: parsed.nucleotideDiversity ?? 0,
      estimatedTotalHaplotypes: parsed.estimatedTotalHaplotypes ?? 0,
      estimatedGlobalHaplotypes: parsed.estimatedGlobalHaplotypes ?? 0,
      dossier: parsed.dossier || "No detailed dossier available for this species.",
      focusArea: parsed.focusArea || focusArea,
      ancestralOrigin: parsed.ancestralOrigin || "Unknown",
      trustProfile: {
        network: { 
          deterministicRatio: parsed.trustProfile?.network?.deterministicRatio ?? 0, 
          probabilisticRatio: parsed.trustProfile?.network?.probabilisticRatio ?? 0, 
          confidenceScore: parsed.trustProfile?.network?.confidenceScore ?? 0 
        },
        timeline: { 
          deterministicRatio: parsed.trustProfile?.timeline?.deterministicRatio ?? 0, 
          probabilisticRatio: parsed.trustProfile?.timeline?.probabilisticRatio ?? 0, 
          confidenceScore: parsed.trustProfile?.timeline?.confidenceScore ?? 0 
        },
        dataTable: { 
          deterministicRatio: parsed.trustProfile?.dataTable?.deterministicRatio ?? 0, 
          probabilisticRatio: parsed.trustProfile?.dataTable?.probabilisticRatio ?? 0, 
          confidenceScore: parsed.trustProfile?.dataTable?.confidenceScore ?? 0 
        }
      },
      haplotypes: (parsed.haplotypes || []).map((h: any) => ({
        ...h,
        id: h.id || "H-UNK",
        region: h.region || "Unknown Region",
        similarity: h.similarity ?? 0,
        snps: h.snps || [],
        divergenceTime: h.divergenceTime ?? 0,
        functionalTrait: h.functionalTrait || "Unknown functional trait"
      })),
      citizenScienceMissions: (parsed.citizenScienceMissions || []).map((m: any) => ({
        ...m,
        title: m.title || "Field Observation",
        description: m.description || "No description provided.",
        priority: m.priority || "Medium",
        action: m.action || "Observe and document."
      })),
      sources 
    };
  } catch (error: any) {
    throw new Error(`ANALYSIS_FAILURE: ${error.message}`);
  }
};
