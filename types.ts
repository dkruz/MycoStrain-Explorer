
export interface Haplotype {
  id: string;
  region: string;
  snps: string[];
  lat: number;
  lng: number;
  similarity: number;
  substrate: string; 
  chemistry: string;
  insectAssociations: string;
  regionalPrevalence: number; 
  parentHaplotypeId?: string;
  divergenceTime: number; // Mya (Millions of years ago)
  originCenter: string;   // Probable ancestral region
  functionalTrait: string; // The ontological impact of the mutations
}

export interface GroundingSource {
  title: string;
  uri: string;
}

export interface CitizenScienceMission {
  title: string;
  description: string;
  priority: 'High' | 'Medium' | 'Low';
  action: string;
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
  ancestralOrigin: string; 
  citizenScienceMissions: CitizenScienceMission[];
}
