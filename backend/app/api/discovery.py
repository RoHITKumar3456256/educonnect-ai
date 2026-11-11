import csv
import io
import json
from typing import List, Optional
from fastapi import APIRouter, HTTPException, Response
from backend.app.core.database import get_db_connection
from backend.app.schemas.schemas import (
    DiscoveryRunRequest, DiscoveryRunResponse, CandidateResult,
    ScoreBreakdown, ProfileResponse, EvidenceItem
)
from backend.app.services.discovery_engine import discovery_engine

router = APIRouter(prefix="/discovery", tags=["Discovery"])

@router.post("/run", response_model=DiscoveryRunResponse)
def run_discovery_pipeline(request: DiscoveryRunRequest):
    """
    Executes end-to-end discovery:
    1. Extracts / parses reference profile.
    2. Encodes reference profile as dense vector.
    3. Retrieves candidate pool with metadata filtering.
    4. Applies hybrid ranking formula (0.45S + 0.20R + 0.15E + 0.10N + 0.10L).
    5. Produces evidence-grounded explanations.
    6. Persists run and returns sorted candidates.
    """
    return discovery_engine.run_discovery(request)

@router.get("/runs/recent")
def get_recent_discovery_runs(limit: int = 10):
    """
    Retrieves recent discovery runs history.
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
    SELECT r.id as run_id, r.reference_name, r.reference_query, r.status, r.created_at,
           COUNT(res.id) as candidates_count
    FROM discovery_runs r
    LEFT JOIN discovery_results res ON r.id = res.run_id
    GROUP BY r.id
    ORDER BY r.created_at DESC
    LIMIT ?;
    """, (limit,))
    rows = cursor.fetchall()
    conn.close()
    return [dict(r) for r in rows]

@router.get("/{run_id}", response_model=DiscoveryRunResponse)
def get_discovery_run(run_id: str):
    """
    Retrieves discovery run details and its ranked candidate results.
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("SELECT * FROM discovery_runs WHERE id = ?", (run_id,))
    run_row = cursor.fetchone()
    if not run_row:
        conn.close()
        raise HTTPException(status_code=404, detail=f"Discovery run '{run_id}' not found.")
        
    r_dict = dict(run_row)
    
    # Fetch results
    cursor.execute("""
    SELECT res.*, p.*
    FROM discovery_results res
    JOIN profiles p ON res.candidate_id = p.id
    WHERE res.run_id = ?
    ORDER BY res.final_score DESC
    """, (run_id,))
    res_rows = cursor.fetchall()
    
    candidates: List[CandidateResult] = []
    for r in res_rows:
        row_dict = dict(r)
        cand_id = row_dict["candidate_id"]
        
        # Evidence
        cursor.execute("SELECT * FROM profile_evidence WHERE profile_id = ?", (cand_id,))
        ev_rows = cursor.fetchall()
        evidence_items = [
            EvidenceItem(
                id=e["id"],
                profile_id=e["profile_id"],
                evidence_text=e["evidence_text"],
                source_url=e["source_url"],
                source_type=e["source_type"],
                retrieved_at=e["retrieved_at"]
            ) for e in ev_rows
        ]
        
        final_s = float(row_dict["final_score"])
        band = "High" if final_s >= 80 else ("Medium" if final_s >= 60 else "Low")
        
        scores = ScoreBreakdown(
            semantic_score=float(row_dict["semantic_score"]),
            role_score=float(row_dict["role_score"]),
            education_score=float(row_dict["education_score"]),
            network_score=float(row_dict["network_score"]),
            location_score=float(row_dict["location_score"]),
            final_score=final_s,
            relevance_band=band
        )
        
        profile = ProfileResponse(
            id=cand_id,
            name=row_dict["name"],
            profile_url=row_dict.get("profile_url"),
            role=row_dict["role"],
            organisation=row_dict["organisation"],
            location=row_dict["location"],
            experience_years=row_dict.get("experience_years", 0) or 0,
            role_category=row_dict.get("role_category", "other"),
            schools_count=row_dict.get("schools_count", 1) or 1,
            skills=row_dict.get("skills", ""),
            summary=row_dict.get("summary", ""),
            avatar_url=row_dict.get("avatar_url", ""),
            verification_status=row_dict.get("verification_status", "verified"),
            evidence=evidence_items,
            created_at=row_dict.get("created_at")
        )
        
        candidates.append(CandidateResult(
            candidate=profile,
            scores=scores,
            explanation=row_dict["explanation"],
            evidence_snippets=[e.evidence_text for e in evidence_items]
        ))
        
    conn.close()
    
    params = json.loads(r_dict["parameters"]) if r_dict.get("parameters") else {}
    
    return DiscoveryRunResponse(
        run_id=r_dict["id"],
        status=r_dict["status"],
        reference_profile_name=r_dict.get("reference_name", "Target Profile"),
        reference_summary=r_dict.get("reference_query", ""),
        created_at=r_dict["created_at"],
        total_candidates_analyzed=len(candidates),
        top_candidates=candidates,
        parameters=params
    )

@router.get("/{run_id}/results", response_model=List[CandidateResult])
def get_discovery_run_results(run_id: str):
    run_data = get_discovery_run(run_id)
    return run_data.top_candidates

@router.get("/{run_id}/export")
def export_discovery_csv(run_id: str):
    """
    Exports ranked candidate results into a structured CSV file.
    """
    run_data = get_discovery_run(run_id)
    
    output = io.StringIO()
    writer = csv.writer(output)
    
    # Headers
    writer.writerow([
        "Rank", "Name", "Role", "Organisation", "Location", "Final Score", "Relevance Band",
        "Semantic Score (45%)", "Role Score (20%)", "Education Score (15%)", "Network Score (10%)", "Location Score (10%)",
        "Schools Count", "Experience Years", "Verification Status", "Source Evidence", "Match Explanation"
    ])
    
    for idx, c in enumerate(run_data.top_candidates, start=1):
        writer.writerow([
            idx,
            c.candidate.name,
            c.candidate.role,
            c.candidate.organisation,
            c.candidate.location,
            c.scores.final_score,
            c.scores.relevance_band,
            c.scores.semantic_score,
            c.scores.role_score,
            c.scores.education_score,
            c.scores.network_score,
            c.scores.location_score,
            c.candidate.schools_count,
            c.candidate.experience_years,
            c.candidate.verification_status,
            " | ".join(c.evidence_snippets),
            c.explanation
        ])
        
    csv_content = output.getvalue()
    filename = f"EduConnect_Discovery_{run_id}.csv"
    
    return Response(
        content=csv_content,
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )

