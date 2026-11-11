import io
import csv
import uuid
from typing import List, Optional
from fastapi import APIRouter, HTTPException, Query, UploadFile, File
from backend.app.core.database import get_db_connection
from backend.app.schemas.schemas import (
    ProfileResponse, ProfileAnalyzeRequest, ProfileAnalyzeResponse,
    SaveProfileRequest, SavedProfileItem, CSVImportResult, EvidenceItem, ProfileCreate
)
from backend.app.services.profile_extractor import profile_extractor

router = APIRouter(prefix="/profiles", tags=["Profiles"])

@router.post("/analyze", response_model=ProfileAnalyzeResponse)
def analyze_profile(request: ProfileAnalyzeRequest):
    """
    Extracts structured fields from raw profile text or reference URL.
    Validates with Pydantic and returns identified evidence and confidence score.
    """
    if not request.raw_text and not request.profile_url:
        raise HTTPException(status_code=400, detail="Either raw_text or profile_url must be provided.")
        
    return profile_extractor.analyze(request.raw_text or "", request.profile_url or "")

@router.get("", response_model=List[ProfileResponse])
def get_profiles(
    search: Optional[str] = Query(None, description="Search query for name, role, organisation, or skills"),
    category: Optional[str] = Query(None, description="Filter by role category"),
    location: Optional[str] = Query(None, description="Filter by location"),
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0)
):
    """
    Returns a paginated list of authorized candidate profiles.
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    
    query = "SELECT * FROM profiles WHERE 1=1"
    params = []
    
    if search:
        query += " AND (LOWER(name) LIKE LOWER(?) OR LOWER(role) LIKE LOWER(?) OR LOWER(organisation) LIKE LOWER(?) OR LOWER(skills) LIKE LOWER(?))"
        pattern = f"%{search}%"
        params.extend([pattern, pattern, pattern, pattern])
        
    if category and category.lower() != "all":
        query += " AND LOWER(role_category) = LOWER(?)"
        params.append(category)
        
    if location and location.lower() != "all":
        query += " AND LOWER(location) LIKE LOWER(?)"
        params.append(f"%{location}%")
        
    query += " ORDER BY experience_years DESC LIMIT ? OFFSET ?"
    params.extend([limit, offset])
    
    cursor.execute(query, params)
    rows = cursor.fetchall()
    
    profiles = []
    for r in rows:
        p_dict = dict(r)
        # Fetch evidence
        cursor.execute("SELECT * FROM profile_evidence WHERE profile_id = ?", (p_dict["id"],))
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
        p_dict["evidence"] = evidence_items
        profiles.append(ProfileResponse(**p_dict))
        
    conn.close()
    return profiles

@router.get("/{profile_id}", response_model=ProfileResponse)
def get_profile_by_id(profile_id: str):
    """
    Retrieves full profile details with source evidence.
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("SELECT * FROM profiles WHERE id = ?", (profile_id,))
    row = cursor.fetchone()
    
    if not row:
        conn.close()
        raise HTTPException(status_code=404, detail=f"Profile with id '{profile_id}' not found.")
        
    p_dict = dict(row)
    cursor.execute("SELECT * FROM profile_evidence WHERE profile_id = ?", (profile_id,))
    ev_rows = cursor.fetchall()
    conn.close()
    
    p_dict["evidence"] = [
        EvidenceItem(
            id=e["id"],
            profile_id=e["profile_id"],
            evidence_text=e["evidence_text"],
            source_url=e["source_url"],
            source_type=e["source_type"],
            retrieved_at=e["retrieved_at"]
        ) for e in ev_rows
    ]
    return ProfileResponse(**p_dict)

@router.post("/import", response_model=CSVImportResult)
async def import_profiles_csv(file: UploadFile = File(...)):
    """
    Imports and validates CSV profile records.
    Reports rejected rows and validates schema.
    """
    if not file.filename.endswith(('.csv', '.txt')):
        raise HTTPException(status_code=400, detail="File must be a valid CSV format.")
        
    content = await file.read()
    try:
        decoded = content.decode('utf-8')
    except UnicodeDecodeError:
        decoded = content.decode('latin-1')
        
    reader = csv.DictReader(io.StringIO(decoded))
    
    required_cols = {"name", "role", "organisation"}
    if not reader.fieldnames or not required_cols.issubset(set(reader.fieldnames)):
        raise HTTPException(
            status_code=400, 
            detail=f"CSV is missing required headers: {required_cols - set(reader.fieldnames or [])}"
        )
        
    conn = get_db_connection()
    cursor = conn.cursor()
    
    total = 0
    imported = 0
    rejected = 0
    errors = []
    imported_profiles = []
    
    for row_idx, row in enumerate(reader, start=1):
        total += 1
        name = row.get("name", "").strip()
        role = row.get("role", "").strip()
        org = row.get("organisation", "").strip()
        
        if not name or not role or not org:
            rejected += 1
            errors.append(f"Row {row_idx}: Name, role, or organisation is missing.")
            continue
            
        pid = row.get("id", f"csv_{uuid.uuid4().hex[:8]}").strip()
        location = row.get("location", "India").strip()
        try:
            exp = int(row.get("experience_years", 0) or 0)
        except ValueError:
            exp = 0
            
        try:
            schools = int(row.get("schools_count", 1) or 1)
        except ValueError:
            schools = 1
            
        skills = row.get("skills", "").strip()
        summary = row.get("summary", "").strip()
        profile_url = row.get("profile_url", "").strip()
        role_category = row.get("role_category", "other").strip()
        avatar_url = f"https://api.dicebear.com/7.x/avataaars/svg?seed={name.replace(' ', '')}"
        
        cursor.execute("""
        INSERT OR REPLACE INTO profiles 
        (id, name, profile_url, role, organisation, location, experience_years, role_category, schools_count, skills, summary, avatar_url, verification_status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'verified')
        """, (pid, name, profile_url, role, org, location, exp, role_category, schools, skills, summary, avatar_url))
        
        evidence_text = row.get("evidence_text", "").strip()
        if evidence_text:
            cursor.execute("""
            INSERT INTO profile_evidence (id, profile_id, evidence_text, source_url, source_type)
            VALUES (?, ?, ?, ?, ?)
            """, (str(uuid.uuid4()), pid, evidence_text, row.get("source_url", ""), row.get("source_type", "csv_import")))
            
        imported += 1
        imported_profiles.append(ProfileResponse(
            id=pid,
            name=name,
            role=role,
            organisation=org,
            location=location,
            experience_years=exp,
            role_category=role_category,
            schools_count=schools,
            skills=skills,
            summary=summary,
            avatar_url=avatar_url,
            verification_status="verified"
        ))
        
    conn.commit()
    conn.close()
    
    return CSVImportResult(
        total_rows=total,
        imported_count=imported,
        rejected_count=rejected,
        errors=errors,
        profiles=imported_profiles
    )

@router.post("/{profile_id}/save")
def save_profile_to_shortlist(profile_id: str, payload: Optional[SaveProfileRequest] = None):
    """
    Saves or updates a candidate in the user's outreach shortlist.
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("SELECT id FROM profiles WHERE id = ?", (profile_id,))
    if not cursor.fetchone():
        conn.close()
        raise HTTPException(status_code=404, detail="Profile not found.")
        
    notes = payload.notes if payload else ""
    cursor.execute("SELECT id FROM saved_profiles WHERE profile_id = ?", (profile_id,))
    existing = cursor.fetchone()
    
    if existing:
        cursor.execute("UPDATE saved_profiles SET notes = ?, saved_at = CURRENT_TIMESTAMP WHERE profile_id = ?", (notes, profile_id))
    else:
        cursor.execute("""
        INSERT INTO saved_profiles (id, profile_id, notes, saved_at)
        VALUES (?, ?, ?, CURRENT_TIMESTAMP)
        """, (str(uuid.uuid4()), profile_id, notes))
        
    conn.commit()
    conn.close()
    return {"status": "saved", "profile_id": profile_id, "message": "Candidate added to shortlist."}

