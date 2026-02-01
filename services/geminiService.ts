
import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult } from "../types";

export const performMycoAnalysis = async (speciesName: string, focusArea: string = "USA National"): Promise<AnalysisResult> => {
  const apiKey = process.env.API_KEY;
  
  if (!apiKey || apiKey === "undefined" || apiKey === "") {
    throw new Error("MISSING_KEY");
  }

  const ai = new GoogleGenAI({ apiKey });
  
  const prompt = `
    Act as a Senior Computational Mycologist & Phylogenetics Expert. 
    Analyze the genomic distribution, evolutionary origins, and ontological traits of: "${speciesName}".
    Focus Area: ${focusArea}.
    
    RESEARCH TASKS:
    1. ORIGINS: Determine the probable ancestral origin of the species and describe its migration into the focus area.
    2. HAPLOTYPES: Generate 12 distinct haplotypes.
    3. PHYLOGENETICS: For each haplotype, estimate the Divergence Time (in millions of years ago, Mya) from the most recent common ancestor.
    4. ONTOLOGY: Describe the functional trait change caused by the regional SNPs (e.g., enhanced thermotolerance, specific enzyme secretion).
    5. COORDINATES: Latitude 25.0 to 48.0, Longitude -124.0 to -67.0 (Strictly continental USA).
    
    Return a structured JSON object.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: prompt,
    config: {
      thinkingConfig: { thinkingBudget: 32768 },
      tools: [{ googleSearch: {} }],
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
          }
        },
        required: ["speciesName", "haplotypes", "nucleotideDiversity", "estimatedTotalHaplotypes", "estimatedGlobalHaplotypes", "dossier", "focusArea", "ancestralOrigin"]
      }
    }
  });

  const rawText = response.text || '';
  const jsonMatch = rawText.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("Invalid Genomic Stream Response");

  const parsed = JSON.parse(jsonMatch[0]);
  const sources: any[] = [];
  const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
  chunks.forEach((chunk: any) => {
    if (chunk.web) {
      sources.push({ title: chunk.web.title || 'Source', uri: chunk.web.uri });
    }
  });

  return { ...parsed, sources };
};