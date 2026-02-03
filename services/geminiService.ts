import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult } from "../types";

export const performMycoAnalysis = async (speciesName: string, focusArea: string = "USA National"): Promise<AnalysisResult> => {
  const apiKey = process.env.API_KEY;
  
  if (!apiKey || apiKey === "undefined" || apiKey === "") {
    throw new Error("BUILD_ERROR: The API_KEY was not correctly injected during the build process.");
  }

  const ai = new GoogleGenAI({ apiKey });
  
  const prompt = `
    Act as a Senior Computational Mycologist & Citizen Science Coordinator. 
    Analyze the genomic distribution, evolutionary origins, and ontological traits of: "${speciesName}".
    Focus Area: ${focusArea}.
    
    CRITICAL INSTRUCTION: You MUST use the googleSearch tool to find and cite actual phylogenetic studies, regional prevalence surveys, and peer-reviewed descriptions of this species. 
    Your response must be grounded in real-world data to provide valid references for the researcher dossier.

    RESEARCH TASKS:
    1. ORIGINS: Determine ancestral origin and migration patterns based on known fossil or genomic records.
    2. HAPLOTYPES: Generate 12 regional haplotypes with specific divergence times (Mya) and functional traits (e.g., adaptive mutations for specific substrates).
    3. CITIZEN SCIENCE: Create 3 specific, highly detailed "Field Missions" for amateur mycologists. 
       - Missions MUST include comprehensive validation strategies: exact substrates, associated micro-flora, and specific macro-photography angles.
       - These details will be used in an expanded research dossier.
    
    Return the response strictly as valid JSON.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
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
            }
          },
          required: ["speciesName", "haplotypes", "nucleotideDiversity", "estimatedTotalHaplotypes", "estimatedGlobalHaplotypes", "dossier", "focusArea", "ancestralOrigin", "citizenScienceMissions"]
        }
      }
    });

    const text = response.text || '';
    const parsed = JSON.parse(text);
    
    const sources: any[] = [];
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    chunks.forEach((chunk: any) => {
      if (chunk.web) {
        sources.push({ title: chunk.web.title || 'Scientific Reference', uri: chunk.web.uri });
      }
    });

    // If no grounding chunks, try to extract from grounding metadata search queries or other parts if available
    // But primarily we rely on the candidate's chunks.

    return { ...parsed, sources };
  } catch (error: any) {
    throw new Error(`ANALYSIS_FAILURE: ${error.message}`);
  }
};
