
import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult } from "../types";

export const performMycoAnalysis = async (
  speciesName: string, 
  focusArea: string = "USA National", 
  mode: 'amateur' | 'professional' = 'professional'
): Promise<AnalysisResult> => {
  const apiKey = process.env.API_KEY;
  
  if (!apiKey || apiKey === "undefined" || apiKey === "") {
    throw new Error("BUILD_ERROR: The API_KEY was not correctly injected during the build process.");
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
        thinkingConfig: { thinkingBudget: 32768 },
        tools: [{ googleSearch: {} }],
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

    const parsed = JSON.parse(response.text || '{}');
    const sources: any[] = [];
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    chunks.forEach((chunk: any) => {
      if (chunk.web) {
        sources.push({ title: chunk.web.title || 'Scientific Reference', uri: chunk.web.uri });
      }
    });

    return { ...parsed, sources };
  } catch (error: any) {
    throw new Error(`ANALYSIS_FAILURE: ${error.message}`);
  }
};
