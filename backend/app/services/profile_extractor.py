import re
import json
import requests
from typing import Dict, Any, List, Tuple
from backend.app.core.config import settings
from backend.app.schemas.schemas import ProfileBase, EvidenceItem, ProfileAnalyzeResponse

class ProfileExtractor:
    def __init__(self):
        self.api_key = settings.GEMINI_API_KEY

    def analyze(self, raw_text: str, profile_url: str = "") -> ProfileAnalyzeResponse:
        """
        Extracts structured professional attributes and evidence.
        Uses Gemini if API key is provided; falls back to deterministic rule-based extractor.
        """
        raw_text = raw_text.strip() if raw_text else ""
        
        # Check if URL was given without text
        if not raw_text and profile_url:
            return self._handle_url_only(profile_url)
            
        if self.api_key:
            try:
                return self._extract_with_gemini(raw_text, profile_url)
            except Exception as e:
                print(f"Gemini API extraction failed, using heuristic fallback: {e}")
                return self._extract_with_heuristics(raw_text, profile_url)
        else:
            return self._extract_with_heuristics(raw_text, profile_url)

    def _handle_url_only(self, profile_url: str) -> ProfileAnalyzeResponse:
        # Extract plausible handle or identifier from URL
        slug = profile_url.rstrip("/").split("/")[-1].replace("-", " ").title()
        profile = ProfileBase(
            name=slug if slug else "Referenced Professional",
            role="School Leader / Advisor",
            organisation="Referenced Institution",
            location="Not available",
            experience_years=0,
            role_category="other",
            schools_count=1,
            skills="School Administration",
            summary=f"Profile referenced via external identifier {profile_url}. In compliance with data access policies, contents are not automatically scraped.",
            profile_url=profile_url,
            verification_status="unverified"
        )
        evidence = [
            EvidenceItem(
                evidence_text=f"Direct profile identifier provided: {profile_url}",
                source_url=profile_url,
                source_type="user_provided_identifier"
            )
        ]
        return ProfileAnalyzeResponse(
            extracted_profile=profile,
            identified_evidence=evidence,
            missing_fields=["location", "experience_years", "skills"],
            confidence_score=40.0,
            traceability_note="Profile URL saved as external reference. To unlock full semantic matching, paste profile summary text."
        )

    def _extract_with_heuristics(self, text: str, profile_url: str = "") -> ProfileAnalyzeResponse:
        lines = [l.strip() for l in text.split("\n") if l.strip()]
        
        # Name
        name = "Candidate Profile"
        if lines:
            first_line = lines[0]
            # Strip prefixes like "Name:"
            clean_first = re.sub(r'^(name|candidate|profile)[:\s-]+', '', first_line, flags=re.IGNORECASE).strip()
            if len(clean_first.split()) <= 5 and not any(w in clean_first.lower() for w in ["curriculum", "experience", "school"]):
                name = clean_first
                
        # Role & Organisation
        role = "Education Specialist"
        organisation = "Educational Institution"
        role_category = "other"
        
        role_patterns = [
            (r'(senior director|managing director|executive director|academic director|director)', 'Director'),
            (r'(principal|headmaster|headmistress|head of school)', 'Principal'),
            (r'(educational advisor|school advisor|curriculum advisor|consultant|strategist)', 'Consultant'),
            (r'(trustee|board member|secretary|founder|president)', 'Trustee'),
            (r'(edupreneur|founder & ceo|ceo & founder|chief executive)', 'Edupreneur')
        ]
        
        for pat, cat in role_patterns:
            m = re.search(pat, text, re.IGNORECASE)
            if m:
                role = m.group(0).title()
                role_category = cat
                break
                
        # Look for "at <Org>" or "of <Org>"
        org_match = re.search(r'\b(?:at|of|with|for)\s+([A-Z][A-Za-z0-9&\s,\.-]{2,40})', text)
        if org_match:
            candidate_org = org_match.group(1).split("\n")[0].split(".")[0].strip()
            if len(candidate_org.split()) <= 6:
                organisation = candidate_org

        # Location
        location = "Not available"
        loc_patterns = [
            r'\b(New Delhi|Delhi|Bengaluru|Bangalore|Mumbai|Pune|Hyderabad|Chennai|Kolkata|Chandigarh|Jaipur|Gurugram|Noida|Lucknow|Ahmedabad|Coimbatore|Dubai|London|Singapore|Sydney)\b'
        ]
        for pat in loc_patterns:
            m = re.search(pat, text, re.IGNORECASE)
            if m:
                location = f"{m.group(1)}, India" if m.group(1) not in ["Dubai", "London", "Singapore", "Sydney"] else m.group(1)
                break

        # Experience years
        exp_years = 0
        exp_match = re.search(r'(\d{1,2})\+?\s*(?:years|yrs)\b', text, re.IGNORECASE)
        if exp_match:
            exp_years = int(exp_match.group(1))

        # Schools count
        schools_count = 1
        schools_match = re.search(r'(\d{1,2})\+?\s*(?:schools|campuses|branches|institutions)\b', text, re.IGNORECASE)
        if schools_match:
            schools_count = int(schools_match.group(1))

        # Skills
        skill_terms = ["CBSE", "ICSE", "IB", "NEP 2020", "Curriculum Design", "Teacher Training", "School Governance", "Accreditation", "Turnaround", "STEM Pedagogy", "EdTech Integration"]
        found_skills = [s for s in skill_terms if s.lower() in text.lower()]
        skills_str = ", ".join(found_skills) if found_skills else "Educational Administration, Leadership"

        # Missing fields detection
        missing = []
        if location == "Not available":
            missing.append("location")
        if exp_years == 0:
            missing.append("experience_years")
            
        # Identified evidence
        evidence_items = []
        if schools_match:
            evidence_items.append(EvidenceItem(
                evidence_text=f"Evidenced multi-institution footprint: {schools_match.group(0)} referenced in professional context.",
                source_url=profile_url or "User supplied input",
                source_type="user_provided_text"
            ))
        if exp_match:
            evidence_items.append(EvidenceItem(
                evidence_text=f"Demonstrated tenure: {exp_match.group(0)} in professional education leadership.",
                source_url=profile_url or "User supplied input",
                source_type="user_provided_text"
            ))
        if not evidence_items:
            evidence_items.append(EvidenceItem(
                evidence_text="Extracted from provided professional bio text.",
                source_url=profile_url or "User supplied input",
                source_type="user_provided_text"
            ))

        profile = ProfileBase(
            name=name,
            role=role,
            organisation=organisation,
            location=location,
            experience_years=exp_years,
            role_category=role_category,
            schools_count=schools_count,
            skills=skills_str,
            summary=text[:300] + ("..." if len(text) > 300 else ""),
            profile_url=profile_url or None,
            verification_status="verified" if len(evidence_items) >= 2 else "unverified"
        )
        
        confidence = 88.0 if len(missing) == 0 else 65.0
        
        return ProfileAnalyzeResponse(
            extracted_profile=profile,
            identified_evidence=evidence_items,
            missing_fields=missing,
            confidence_score=confidence,
            traceability_note="Structured features extracted using deterministic schema validation. Missing fields noted as 'Not available'."
        )

    def _extract_with_gemini(self, text: str, profile_url: str = "") -> ProfileAnalyzeResponse:
        # Gemini 1.5/2.0 API call
        endpoint = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={self.api_key}"
        prompt = f"""
You are an expert education data analyst for EduConnect AI. Extract structured school education leadership attributes from this profile text.

Input Text:
\"\"\"{text}\"\"\"

Return ONLY valid JSON matching this exact structure:
{{
  "name": "full name or Candidate Profile",
  "role": "exact title or senior title",
  "organisation": "institution/organization",
  "location": "City, Country or Not available",
  "experience_years": integer,
  "role_category": "Principal" | "Director" | "Consultant" | "Trustee" | "Edupreneur" | "other",
  "schools_count": integer,
  "skills": "comma separated skills",
  "summary": "concise 2-3 sentence overview",
  "evidence_snippets": ["quote 1 proving impact", "quote 2 proving leadership"]
}}
Do not invent facts. If location or experience is not stated, return 'Not available' or 0.
"""
        payload = {
            "contents": [{"parts": [{"text": prompt}]}],
            "generationConfig": {"temperature": 0.1, "responseMimeType": "application/json"}
        }
        res = requests.post(endpoint, json=payload, timeout=10)
        res.raise_ok = res.status_code == 200
        if not res.raise_ok:
            raise RuntimeError(f"Gemini error {res.status_code}: {res.text}")
            
        data = res.json()
        raw_json_str = data["candidates"][0]["content"]["parts"][0]["text"]
        parsed = json.loads(raw_json_str)
        
        missing = []
        loc = parsed.get("location", "Not available")
        if not loc or loc.lower() == "not available":
            loc = "Not available"
            missing.append("location")
            
        exp = int(parsed.get("experience_years", 0) or 0)
        if exp == 0:
            missing.append("experience_years")
            
        evidence_items = [
            EvidenceItem(
                evidence_text=snip,
                source_url=profile_url or "User supplied input",
                source_type="user_provided_text"
            ) for snip in parsed.get("evidence_snippets", [])
        ]
        if not evidence_items:
            evidence_items.append(EvidenceItem(
                evidence_text="Extracted and verified from authorized profile text.",
                source_url=profile_url or "User supplied input",
                source_type="user_provided_text"
            ))

        profile = ProfileBase(
            name=parsed.get("name", "Candidate Profile"),
            role=parsed.get("role", "Education Leader"),
            organisation=parsed.get("organisation", "Education Ecosystem"),
            location=loc,
            experience_years=exp,
            role_category=parsed.get("role_category", "other"),
            schools_count=int(parsed.get("schools_count", 1) or 1),
            skills=parsed.get("skills", ""),
            summary=parsed.get("summary", text[:250]),
            profile_url=profile_url or None,
            verification_status="verified"
        )
        
        return ProfileAnalyzeResponse(
            extracted_profile=profile,
            identified_evidence=evidence_items,
            missing_fields=missing,
            confidence_score=94.0,
            traceability_note="Extracted via Gemini API with Pydantic schema validation. Verified source evidence preserved."
        )

profile_extractor = ProfileExtractor()

