
import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult } from "../types";

export const performMycoAnalysis = async (speciesName: string, focusArea: string = "USA National"): Promise<AnalysisResult> => {
  // Use the named parameter apiKey and get it from process.env.API_KEY
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `
    Act as a Computational Mycologist and Bioinformatics Researcher. Conduct a deep-dive analysis of: "${speciesName}".
    
    SEARCH STRATEGY: 
    1. Query academic databases (UniProt, MycoCosm/JGI, PubMed) and citizen science (GBIF, iNaturalist) for "${speciesName}".
    2. Identify known secondary metabolite clusters (BGCs) or documented enzyme profiles associated with this taxa.
    3. Ground geographic distribution in search results for both the specific focus area (${focusArea}) and worldwide records.
    
    TASKS:
    - Determine NUTRITIONAL STRATEGY: (e.g., Saprophytic, Ectomycorrhizal, Endophytic, Parasitic).
    - Estimate TOTAL haplotypes for the regional focus area (${focusArea}).
    - Estimate WORLDWIDE total distinct haplotypes based on global biogeography.
    - Model 12 specific haplotypes representing genetic drift within ${focusArea}.
    - BIO-SIGNATURE INFERENCE: Describe predicted metabolic pathways based on available genomic literature.
    - MANDATORY: Use the term 'Substrate' or 'Ecological Niche' instead of 'Host' unless a strict symbiosis is verified.
    
    DOSSIER CONTENT REQUIREMENTS:
    Return a 900-word report in 'dossier' with these headers:
    - ## EXECUTIVE SUMMARY: Status of ${speciesName} research.
    - ## GLOBAL BIOGEOGRAPHY: Contrast the regional findings in ${focusArea} with the global estimated genetic diversity.
    - ## NUTRITIONAL STRATEGY: [MANDATORY: Start this section with "STRATEGY: [Classification]"] Detailed breakdown of how this species interacts with its environment.
    - ## HAPLOTYPE DATA: List entries for 12 strains including ID, GPS, SNP markers, Substrate/Niche, and Predicted Bio-signature.
    - ## PHYLOGEOGRAPHIC DRIFT & MUTATION NETWORK: Analysis of lineage branching.
    - ## DATA FIDELITY & CONFIDENCE ANALYSIS: Explicitly distinguish between 'Grounded Facts' and 'Inferred Models'. 
    
    Return as structured JSON.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: prompt,
    config: {
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          speciesName: { type: Type.STRING },
          nucleotideDiversity: { type: Type.NUMBER },
          estimatedTotalHaplotypes: { type: Type.INTEGER, description: "Estimated distinct haplotypes in the regional focus area." },
          estimatedGlobalHaplotypes: { type: Type.INTEGER, description: "Estimated distinct haplotypes worldwide." },
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
                regionalPrevalence: { type: Type.INTEGER },
                parentHaplotypeId: { type: Type.STRING }
              },
              required: ["id", "region", "snps", "lat", "lng", "similarity", "substrate", "chemistry", "regionalPrevalence"]
            }
          }
        },
        required: ["speciesName", "haplotypes", "nucleotideDiversity", "estimatedTotalHaplotypes", "estimatedGlobalHaplotypes", "dossier", "focusArea"]
      }
    }
  });

  // Access text property directly without calling it as a method
  const jsonStr = response.text || '{}';
  const parsed = JSON.parse(jsonStr);
  
  const sources: any[] = [];
  const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
  chunks.forEach((chunk: any) => {
    if (chunk.web) sources.push({ title: chunk.web.title, uri: chunk.web.uri });
  });

  return { ...parsed, sources };
};
