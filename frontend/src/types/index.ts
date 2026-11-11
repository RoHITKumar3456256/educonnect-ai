export interface EvidenceItem {
  id?: string;
  profile_id?: string;
  evidence_text: string;
  source_url?: string;
  source_type: string;
  retrieved_at?: string;
}

export interface Profile {
  id: string;
  name: string;
  profile_url?: string;
  role: string;
  organisation: string;
  location: string;
  experience_years: number;
  role_category?: string;
  schools_count?: number;
  skills?: string;
  summary?: string;
  avatar_url?: string;
  verification_status?: string;
  evidence?: EvidenceItem[];
  created_at?: string;
}

export interface ScoreBreakdown {
  semantic_score: number;
  role_score: number;
  education_score: number;
  network_score: number;
  location_score: number;
  final_score: number;
  relevance_band: 'High' | 'Medium' | 'Low';
}

export interface CandidateResult {
  candidate: Profile;
  scores: ScoreBreakdown;
  explanation: string;
  evidence_snippets: string[];
}

export interface DiscoveryWeights {
  semantic_weight: number;
  role_weight: number;
  education_weight: number;
  network_weight: number;
  location_weight: number;
}

export interface DiscoveryRunRequest {
  reference_input_type: 'text' | 'url' | 'profile_id' | 'csv';
  reference_text?: string;
  reference_url?: string;
  reference_profile_id?: string;
  role_filter?: string;
  location_filter?: string;
  min_experience?: number;
  min_schools?: number;
  weights?: DiscoveryWeights;
  top_k?: number;
}

export interface DiscoveryRunResponse {
  run_id: string;
  status: string;
  reference_profile_name: string;
  reference_summary: string;
  created_at: string;
  total_candidates_analyzed: number;
  top_candidates: CandidateResult[];
  parameters: Record<string, any>;
}

export interface ProfileAnalyzeResponse {
  extracted_profile: Profile;
  identified_evidence: EvidenceItem[];
  missing_fields: string[];
  confidence_score: number;
  traceability_note: string;
}

export interface SavedProfileItem {
  id: string;
  profile: Profile;
  notes?: string;
  saved_at: string;
}

export interface AnalyticsOverview {
  total_profiles: number;
  total_discovery_runs: number;
  total_shortlisted: number;
  verified_count: number;
  average_experience_years: number;
  role_distribution: Record<string, number>;
  location_distribution: Record<string, number>;
  experience_brackets: Record<string, number>;
  score_bands: Record<string, number>;
}

