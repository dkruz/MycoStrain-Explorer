import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult } from "../types";

export const performMycoAnalysis = async (speciesName: string, focusArea: string = "USA National"): Promise<AnalysisResult> => {
  const apiKey = process.env.API_KEY;
  
  if (!apiKey || apiKey === "undefined" || apiKey === "") {
    throw new Error("BUILD_ERROR: The API_KEY was not correctly injected during the build process. Ensure that the --build-arg API_KEY=... is passed to your Docker build command.");
  }

  // Use a fresh instance to ensure correct API key usage
  const ai = new GoogleGenAI({ apiKey });
  
  const prompt = `
    Act as a Senior Computational Mycologist & Phylogenetics Expert. 
    Analyze the genomic distribution, evolutionary origins, and ontological traits of: "${speciesName}".
    Focus Area: ${focusArea}.
    
    RESEARCH TASKS:
    1. ORIGINS: Determine the probable ancestral origin of the species and describe its migration into the focus area.
    2. HAPLOTYPES: Generate 12 distinct haplotypes representing regional genetic drift.
    3. PHYLOGENETICS: For each haplotype, estimate the Divergence Time (in millions of years ago, Mya) from the most recent common ancestor.
    4. ONTOLOGY: Describe the functional trait change caused by the regional SNPs (e.g., enhanced thermotolerance, specific enzyme secretion).
    5. COORDINATES: Provide realistic continental USA coordinates (Latitude 25.0 to 48.0, Longitude -124.0 to -67.0).
    
    Return the response strictly as valid JSON according to the requested schema.
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
            }
          },
          required: ["speciesName", "haplotypes", "nucleotideDiversity", "estimatedTotalHaplotypes", "estimatedGlobalHaplotypes", "dossier", "focusArea", "ancestralOrigin"]
        }
      }
    });

    const text = response.text || '';
    if (!text) throw new Error("The model returned an empty response.");

    const parsed = JSON.parse(text);
    
    const sources: any[] = [];
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    chunks.forEach((chunk: any) => {
      if (chunk.web) {
        sources.push({ 
          title: chunk.web.title || 'Scientific Reference', 
          uri: chunk.web.uri 
        });
      }
    });

    return { ...parsed, sources };
  } catch (error: any) {
    console.error("Analysis Protocol Error:", error);
    
    if (error.message?.includes('404') || error.message?.includes('not found')) {
      throw new Error("MODEL_ERROR: The requested model was not found. Please verify your API permissions.");
    }

    const isNetworkError = 
      error.message?.toLowerCase().includes('load failed') || 
      error.message?.toLowerCase().includes('failed to fetch') ||
      error.name === 'TypeError' || 
      error.message?.toLowerCase().includes('network');

    if (isNetworkError) {
      throw new Error("NETWORK_BLOCK: Connection to Google Gemini API failed. This is often caused by ad-blockers, browser extensions, or corporate firewalls blocking 'generativelanguage.googleapis.com'.");
    }
    
    throw new Error(`ANALYSIS_FAILURE: ${error.message || 'An unexpected error occurred during genomic synthesis.'}`);
  }
};