
import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult } from "../types";

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
      model: 'gemini-3-pro-preview',
      contents: basePrompt,
      config: {
        tools: [{ googleSearch: {} }],
      }
    });

    let jsonStr = response.text || '{}';
    
    // Robustly extract the first JSON object by counting braces
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
