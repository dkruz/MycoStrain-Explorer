
import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult } from "../types";

export const performMycoAnalysis = async (speciesName: string, focusArea: string = "USA National"): Promise<AnalysisResult> => {
  // Use process.env.API_KEY directly as it is injected by the selectKey flow
  const apiKey = process.env.API_KEY;

  if (!apiKey) {
    throw new Error("MISSING_KEY");
  }

  const ai = new GoogleGenAI({ apiKey });
  
  const prompt = `
    Act as a Computational Mycologist and Bioinformatics Researcher. 
    Analyze the genomic distribution and intraspecific diversity of: "${speciesName}".
    Focus on regional area: ${focusArea}.
    
    Model 12 hypothetical haplotypes based on known phylogenetic data.
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
