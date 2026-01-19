
export interface Haplotype {
  id: string;
  region: string;
  snps: string[];
  lat: number;
  lng: number;
  similarity: number;
  substrate: string; // Changed from 'host' to be inclusive of saprophytes
  chemistry: string;
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
  estimatedTotalHaplotypes: number; // Local/Regional estimate
  estimatedGlobalHaplotypes: number; // Worldwide estimate
  dossier: string;
  sources: GroundingSource[];
  focusArea: string;
}
