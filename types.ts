
export interface Haplotype {
  id: string;
  region: string;
  snps: string[];
  lat: number;
  lng: number;
  similarity: number;
  substrate: string; 
  chemistry: string;
  insectAssociations: string; // New: Ecological interactions with insects
  regionalPrevalence: number; // 1-10 scale
  parentHaplotypeId?: string; 
}

export interface GroundingSource {
  title: string;
  uri: string;
}

export interface AnalysisResult {
  speciesName: string;
  haplotypes: Haplotype[];
  nucleotideDiversity: number;
  estimatedTotalHaplotypes: number; 
  estimatedGlobalHaplotypes: number; 
  dossier: string;
  sources: GroundingSource[];
  focusArea: string;
}
