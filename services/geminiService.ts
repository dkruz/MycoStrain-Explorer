
import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult } from "../types";

export const performMycoAnalysis = async (speciesName: string, focusArea: string = "USA National"): Promise<AnalysisResult> => {
  const apiKey = process.env.API_KEY;

  if (!apiKey) {
    throw new Error("MISSING_KEY");
  }

  const ai = new GoogleGenAI({ apiKey });
  
  const prompt = `
    Act as a Senior Computational Mycologist and Ecological Researcher. 
    Analyze the genomic distribution and ecological interactions of: "${speciesName}".
    Focus Area: ${focusArea}.
    
    Research Requirements:
    1. Model exactly 12 scientifically plausible clades (haplotypes) reflecting regional genetic drift.
    2. Determine the ecological strategy of this species (Saprophytic, Mycorrhizal, or Pathogenic).
    3. For EACH haplotype, provide a detailed "Insect Associations" field:
       - If Saprophytic: Include details on Symbionts, Fungal Feeders (Mycetophagous), Saproxylic/Detritivorous insects, and Opportunistic Associations.
       - If Mycorrhizal: Include details on Tri-trophic Interactions (Plant-Fungus-Insect) and Mycophages.
       - Be specific with Genus/Species of insects where possible.
    4. For each haplotype, include Chemistry (physiological adaptations) and SNPs (defining markers like ITS1, TEF1, RPB2).
    5. Return as structured JSON adhering to the provided schema.
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
          dossier: { type: Type.STRING, description: "Executive summary of regional diversity and entomological context." },
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
                insectAssociations: { type: Type.STRING, description: "Detailed entomological data based on the requested categories." },
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

  const jsonStr = response.text || '{}';
  const parsed = JSON.parse(jsonStr);
  
  const sources: any[] = [];
  const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
  chunks.forEach((chunk: any) => {
    if (chunk.web) sources.push({ title: chunk.web.title, uri: chunk.web.uri });
  });

  return { ...parsed, sources };
};
