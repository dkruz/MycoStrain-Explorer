
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
  divergenceTime: number; 
  originCenter: string;   
  functionalTrait: string; 
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

export interface ComponentTrust {
  deterministicRatio: number; // 0-100
  probabilisticRatio: number; // 0-100
  confidenceScore: number;    // Overall 0-1
}

export interface TrustProfile {
  network: ComponentTrust;
  timeline: ComponentTrust;
  dataTable: ComponentTrust;
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
  trustProfile: TrustProfile;
}
