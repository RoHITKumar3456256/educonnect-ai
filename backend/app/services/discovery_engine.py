import uuid
import json
from datetime import datetime
from typing import List, Dict, Any, Optional

from backend.app.core.database import get_db_connection
from backend.app.schemas.schemas import (
    DiscoveryRunRequest, DiscoveryRunResponse, CandidateResult,
    ScoreBreakdown, ProfileResponse, EvidenceItem
)
from backend.app.services.profile_extractor import profile_extractor
from backend.app.services.embedding_service import embedding_service
from backend.app.services.ranking_engine import ranking_engine

class DiscoveryEngine:
    def run_discovery(self, request: DiscoveryRunRequest) -> DiscoveryRunResponse:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # 1. Resolve reference profile
        ref_name = "Target Profile"
        ref_summary = ""
        ref_profile_dict = {}
        
        if request.reference_profile_id:
            cursor.execute("SELECT * FROM profiles WHERE id = ?", (request.reference_profile_id,))
            row = cursor.fetchone()
            if row:
                ref_profile_dict = dict(row)
                ref_name = row["name"]
                ref_summary = row["summary"]
            else:
                ref_name = "Custom Reference"
        elif request.reference_text:
            extracted = profile_extractor.analyze(request.reference_text, request.reference_url or "")
            ref_profile_dict = extracted.extracted_profile.model_dump()
            ref_name = extracted.extracted_profile.name
            ref_summary = extracted.extracted_profile.summary
        elif request.reference_url:
            extracted = profile_extractor.analyze("", request.reference_url)
            ref_profile_dict = extracted.extracted_profile.model_dump()
            ref_name = extracted.extracted_profile.name
            ref_summary = extracted.extracted_profile.summary
        else:
            # Default fallback query
            ref_name = "K-12 School Leadership & Governance Advisor"
            ref_summary = "Senior school advisor, former principal, and curriculum strategist guiding CBSE/ICSE/IB schools."
            ref_profile_dict = {
                "name": ref_name,
                "role": "School Advisor & Former Principal",
                "organisation": "Independent K-12 Advisory",
                "location": "India",
                "experience_years": 18,
                "role_category": "Consultant",
                "schools_count": 12,
                "skills": "CBSE, IB, School Turnaround, Curriculum Design",
                "summary": ref_summary
            }

        # 2. Compute reference vector
        ref_text_to_encode = f"{ref_name} {ref_profile_dict.get('role', '')} {ref_profile_dict.get('skills', '')} {ref_summary}"
        ref_vector = embedding_service.encode(ref_text_to_encode)
        
        # 3. Fetch candidate profiles from database with filters
        query = "SELECT * FROM profiles WHERE 1=1"
        params = []
        
        # Do not include the reference profile itself if it's already in DB
        if request.reference_profile_id:
            query += " AND id != ?"
            params.append(request.reference_profile_id)
            
        if request.role_filter and request.role_filter != "all":
            query += " AND LOWER(role_category) = LOWER(?)"
            params.append(request.role_filter)
            
        if request.location_filter and request.location_filter != "all":
            query += " AND LOWER(location) LIKE LOWER(?)"
            params.append(f"%{request.location_filter}%")
            
        if request.min_experience:
            query += " AND experience_years >= ?"
            params.append(request.min_experience)
            
        if request.min_schools:
            query += " AND schools_count >= ?"
            params.append(request.min_schools)
            
        cursor.execute(query, params)
        candidate_rows = cursor.fetchall()
        
        # If candidate pool is small due to aggressive filters, fetch all to guarantee results
        if len(candidate_rows) == 0:
            cursor.execute("SELECT * FROM profiles;")
            candidate_rows = cursor.fetchall()

        # 4. Hybrid Ranking across all candidate profiles
        ranked_candidates: List[CandidateResult] = []
        custom_weights = request.weights.model_dump() if request.weights else None
        
        for row in candidate_rows:
            cand_dict = dict(row)
            cand_id = cand_dict["id"]
            
            # Fetch evidence for candidate
            cursor.execute("SELECT * FROM profile_evidence WHERE profile_id = ?", (cand_id,))
            evidence_rows = cursor.fetchall()
            evidence_items = [
                EvidenceItem(
                    id=e["id"],
                    profile_id=e["profile_id"],
                    evidence_text=e["evidence_text"],
                    source_url=e["source_url"],
                    source_type=e["source_type"],
                    retrieved_at=e["retrieved_at"]
                ) for e in evidence_rows
            ]
            evidence_snippets = [e["evidence_text"] for e in evidence_rows]
            
            # Candidate profile object
            profile_resp = ProfileResponse(
                id=cand_dict["id"],
                name=cand_dict["name"],
                profile_url=cand_dict.get("profile_url"),
                role=cand_dict["role"],
                organisation=cand_dict["organisation"],
                location=cand_dict["location"],
                experience_years=cand_dict.get("experience_years", 0) or 0,
                role_category=cand_dict.get("role_category", "other"),
                schools_count=cand_dict.get("schools_count", 1) or 1,
                skills=cand_dict.get("skills", ""),
                summary=cand_dict.get("summary", ""),
                avatar_url=cand_dict.get("avatar_url", ""),
                verification_status=cand_dict.get("verification_status", "verified"),
                evidence=evidence_items,
                created_at=cand_dict.get("created_at")
            )
            
            # Semantic embedding vector for candidate
            cand_text_to_encode = f"{cand_dict['name']} {cand_dict['role']} {cand_dict.get('skills', '')} {cand_dict.get('summary', '')}"
            cand_vector = embedding_service.get_or_create_profile_embedding(cand_id, cand_text_to_encode)
            
            # Cosine similarity
            sem_score = embedding_service.cosine_similarity(ref_vector, cand_vector)
            
            # Re-ranking using the 5-component hybrid formula
            rank_result = ranking_engine.rank_candidate(
                semantic_score=sem_score,
                ref_profile=ref_profile_dict,
                cand_profile=cand_dict,
                weights=custom_weights
            )
            
            score_data = rank_result["scores"]
            breakdown = ScoreBreakdown(
                semantic_score=score_data["semantic_score"],
                role_score=score_data["role_score"],
                education_score=score_data["education_score"],
                network_score=score_data["network_score"],
                location_score=score_data["location_score"],
                final_score=score_data["final_score"],
                relevance_band=score_data["relevance_band"]
            )
            
            candidate_res = CandidateResult(
                candidate=profile_resp,
                scores=breakdown,
                explanation=rank_result["explanation"],
                evidence_snippets=evidence_snippets
            )
            ranked_candidates.append(candidate_res)
            
        # 5. Sort candidates by final_score descending
        ranked_candidates.sort(key=lambda c: c.scores.final_score, reverse=True)
        
        # Limit to top_k (default 20+)
        top_k = request.top_k or 20
        final_list = ranked_candidates[:top_k]
        
        # 6. Persist discovery run into DB
        run_id = f"run_{uuid.uuid4().hex[:8]}"
        created_at = datetime.utcnow().isoformat()
        
        cursor.execute("""
        INSERT INTO discovery_runs (id, reference_profile_id, reference_input_type, reference_query, reference_name, status, parameters, created_at)
        VALUES (?, ?, ?, ?, ?, 'completed', ?, ?)
        """, (
            run_id,
            request.reference_profile_id,
            request.reference_input_type,
            ref_summary[:200],
            ref_name,
            json.dumps(request.model_dump()),
            created_at
        ))
        
        # Persist top results
        for item in final_list:
            res_id = str(uuid.uuid4())
            cursor.execute("""
            INSERT INTO discovery_results 
            (id, run_id, candidate_id, semantic_score, role_score, education_score, network_score, location_score, final_score, explanation, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                res_id,
                run_id,
                item.candidate.id,
                item.scores.semantic_score,
                item.scores.role_score,
                item.scores.education_score,
                item.scores.network_score,
                item.scores.location_score,
                item.scores.final_score,
                item.explanation,
                created_at
            ))
            
        conn.commit()
        conn.close()
        
        return DiscoveryRunResponse(
            run_id=run_id,
            status="completed",
            reference_profile_name=ref_name,
            reference_summary=ref_summary,
            created_at=created_at,
            total_candidates_analyzed=len(candidate_rows),
            top_candidates=final_list,
            parameters=request.model_dump()
        )

discovery_engine = DiscoveryEngine()

