from typing import List
from fastapi import APIRouter, HTTPException
from backend.app.core.database import get_db_connection
from backend.app.schemas.schemas import SavedProfileItem, ProfileResponse, EvidenceItem

router = APIRouter(prefix="/saved", tags=["Shortlist"])

@router.get("", response_model=List[SavedProfileItem])
def get_saved_profiles():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("""
    SELECT s.id as saved_id, s.notes, s.saved_at, p.*
    FROM saved_profiles s
    JOIN profiles p ON s.profile_id = p.id
    ORDER BY s.saved_at DESC;
    """)
    rows = cursor.fetchall()
    
    saved_list = []
    for r in rows:
        r_dict = dict(r)
        saved_id = r_dict["saved_id"]
        notes = r_dict["notes"]
        saved_at = r_dict["saved_at"]
        
        # Evidence
        cursor.execute("SELECT * FROM profile_evidence WHERE profile_id = ?", (r_dict["id"],))
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
        
        profile = ProfileResponse(
            id=r_dict["id"],
            name=r_dict["name"],
            profile_url=r_dict["profile_url"],
            role=r_dict["role"],
            organisation=r_dict["organisation"],
            location=r_dict["location"],
            experience_years=r_dict["experience_years"] or 0,
            role_category=r_dict["role_category"] or "other",
            schools_count=r_dict["schools_count"] or 1,
            skills=r_dict["skills"] or "",
            summary=r_dict["summary"] or "",
            avatar_url=r_dict["avatar_url"] or "",
            verification_status=r_dict["verification_status"] or "verified",
            evidence=evidence_items,
            created_at=r_dict["created_at"]
        )
        
        saved_list.append(SavedProfileItem(
            id=saved_id,
            profile=profile,
            notes=notes,
            saved_at=saved_at
        ))
        
    conn.close()
    return saved_list

@router.delete("/{profile_id}")
def remove_saved_profile(profile_id: str):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM saved_profiles WHERE profile_id = ?", (profile_id,))
    conn.commit()
    conn.close()
    return {"status": "removed", "profile_id": profile_id}

