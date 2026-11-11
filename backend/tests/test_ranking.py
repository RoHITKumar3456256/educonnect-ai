import pytest
from backend.app.services.ranking_engine import ranking_engine

def test_hybrid_ranking_weights():
    # Reference: School Principal
    ref = {
        "name": "Dr. A",
        "role": "Principal",
        "organisation": "City High School",
        "location": "Bengaluru, India",
        "experience_years": 20,
        "schools_count": 5
    }
    
    # Candidate 1: Similar role & location
    cand1 = {
        "name": "Candidate One",
        "role": "Former Principal & Advisor",
        "role_category": "Principal",
        "organisation": "Global Academy",
        "location": "Bengaluru, India",
        "experience_years": 18,
        "schools_count": 8,
        "summary": "Former principal advising CBSE schools.",
        "skills": "CBSE, Turnaround"
    }
    
    # Candidate 2: Different role & location
    cand2 = {
        "name": "Candidate Two",
        "role": "Software Developer",
        "role_category": "other",
        "organisation": "Tech Corp",
        "location": "London, UK",
        "experience_years": 4,
        "schools_count": 1,
        "summary": "Software engineer building mobile apps.",
        "skills": "JavaScript, React"
    }
    
    res1 = ranking_engine.rank_candidate(
        semantic_score=85.0,
        ref_profile=ref,
        cand_profile=cand1
    )
    
    res2 = ranking_engine.rank_candidate(
        semantic_score=40.0,
        ref_profile=ref,
        cand_profile=cand2
    )
    
    # Candidate 1 should score significantly higher than Candidate 2
    assert res1["scores"]["final_score"] > res2["scores"]["final_score"]
    assert res1["scores"]["relevance_band"] in ["High", "Medium"]
    assert res2["scores"]["relevance_band"] == "Low"
    assert "Candidate One" in res1["explanation"]

def test_missing_location_normalization():
    ref = {"name": "Ref", "role": "Director", "location": "Not available"}
    cand = {"name": "Cand", "role": "Director", "role_category": "Director", "location": "Not available", "schools_count": 5}
    
    res = ranking_engine.rank_candidate(
        semantic_score=70.0,
        ref_profile=ref,
        cand_profile=cand
    )
    # Shouldn't fail or return 0 for neutral location
    assert res["scores"]["location_score"] >= 60.0

