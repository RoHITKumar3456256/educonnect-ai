from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime

class EvidenceItem(BaseModel):
    id: Optional[str] = None
    profile_id: Optional[str] = None
    evidence_text: str
    source_url: Optional[str] = None
    source_type: str = "curated_directory"
    retrieved_at: Optional[str] = None

class ProfileBase(BaseModel):
    name: str
    role: str
    organisation: str
    location: str
    experience_years: int = Field(default=0, ge=0)
    role_category: Optional[str] = "other"
    schools_count: Optional[int] = Field(default=1, ge=0)
    skills: Optional[str] = ""
    summary: Optional[str] = ""
    profile_url: Optional[str] = None
    verification_status: Optional[str] = "verified" # 'verified', 'unverified', 'test_data'
    avatar_url: Optional[str] = None

class ProfileCreate(ProfileBase):
    id: Optional[str] = None
    evidence: Optional[List[EvidenceItem]] = None

class ProfileResponse(ProfileBase):
    id: str
    evidence: Optional[List[EvidenceItem]] = []
    created_at: Optional[str] = None

class ProfileAnalyzeRequest(BaseModel):
    raw_text: Optional[str] = ""
    profile_url: Optional[str] = None

class ProfileAnalyzeResponse(BaseModel):
    extracted_profile: ProfileBase
    identified_evidence: List[EvidenceItem]
    missing_fields: List[str]
    confidence_score: float
    traceability_note: str

class DiscoveryWeights(BaseModel):
    semantic_weight: float = 0.45
    role_weight: float = 0.20
    education_weight: float = 0.15
    network_weight: float = 0.10
    location_weight: float = 0.10

class DiscoveryRunRequest(BaseModel):
    reference_input_type: str = "text" # 'text', 'url', 'profile_id', 'csv'
    reference_text: Optional[str] = None
    reference_url: Optional[str] = None
    reference_profile_id: Optional[str] = None
    role_filter: Optional[str] = None
    location_filter: Optional[str] = None
    min_experience: Optional[int] = None
    min_schools: Optional[int] = None
    weights: Optional[DiscoveryWeights] = None
    top_k: Optional[int] = 20

class ScoreBreakdown(BaseModel):
    semantic_score: float
    role_score: float
    education_score: float
    network_score: float
    location_score: float
    final_score: float
    relevance_band: str # 'High', 'Medium', 'Low'

class CandidateResult(BaseModel):
    candidate: ProfileResponse
    scores: ScoreBreakdown
    explanation: str
    evidence_snippets: List[str]

class DiscoveryRunResponse(BaseModel):
    run_id: str
    status: str
    reference_profile_name: str
    reference_summary: str
    created_at: str
    total_candidates_analyzed: int
    top_candidates: List[CandidateResult]
    parameters: Dict[str, Any]

class SaveProfileRequest(BaseModel):
    profile_id: str
    notes: Optional[str] = ""

class SavedProfileItem(BaseModel):
    id: str
    profile: ProfileResponse
    notes: Optional[str] = ""
    saved_at: str

class CSVImportResult(BaseModel):
    total_rows: int
    imported_count: int
    rejected_count: int
    errors: List[str]
    profiles: List[ProfileResponse]

class AnalyticsOverview(BaseModel):
    total_profiles: int
    total_discovery_runs: int
    total_shortlisted: int
    verified_count: int
    average_experience_years: float
    role_distribution: Dict[str, int]
    location_distribution: Dict[str, int]
    experience_brackets: Dict[str, int]
    score_bands: Dict[str, int]

