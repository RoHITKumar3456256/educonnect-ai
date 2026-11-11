import re
from typing import Dict, Any, Tuple, List, Optional

class RankingEngine:
    # Role family grouping
    ROLE_FAMILIES = {
        "principal": {"principal", "headmaster", "headmistress", "head of school", "vice principal"},
        "director": {"director", "academic director", "managing director", "executive director", "chief learning officer", "head of academics"},
        "consultant": {"consultant", "advisor", "educational advisor", "strategy consultant", "school turnaround"},
        "trustee": {"trustee", "founder", "managing trustee", "board member", "secretary", "vice-chairman"},
        "edupreneur": {"edupreneur", "founder", "ceo", "edtech founder", "education technology founder"}
    }
    
    # Common geographic regions
    GEO_REGIONS = {
        "north_india": {"delhi", "new delhi", "noida", "gurugram", "gurgaon", "chandigarh", "jaipur", "punjab", "haryana", "rajasthan", "uttar pradesh", "lucknow"},
        "south_india": {"bengaluru", "bangalore", "chennai", "hyderabad", "coimbatore", "karnataka", "tamil nadu", "telangana", "kerala"},
        "west_india": {"mumbai", "pune", "ahmedabad", "gujarat", "maharashtra"},
        "east_india": {"kolkata", "odisha", "bhubaneswar", "west bengal", "bihar"},
        "international_uk": {"london", "edinburgh", "united kingdom", "uk"},
        "international_uae": {"dubai", "abu dhabi", "united arab emirates", "uae"},
        "international_apac": {"singapore", "sydney", "australia", "bangkok", "thailand", "malaysia"}
    }

    @staticmethod
    def calculate_role_similarity(ref_role: str, cand_role: str, cand_category: str) -> float:
        """
        Calculates role similarity score (0-100).
        Evaluates title keywords, role categories, and leadership seniority.
        """
        ref_lower = (ref_role or "").lower()
        cand_lower = (cand_role or "").lower()
        cand_cat_lower = (cand_category or "").lower()
        
        if not ref_lower:
            return 75.0 # Neutral baseline if reference role unknown
            
        # Exact match
        if ref_lower == cand_lower or cand_cat_lower in ref_lower:
            return 100.0
            
        # Identify reference family
        ref_matched_family = None
        for family, keywords in RankingEngine.ROLE_FAMILIES.items():
            if any(k in ref_lower for k in keywords):
                ref_matched_family = family
                break
                
        # Identify candidate family
        cand_matched_family = cand_cat_lower if cand_cat_lower in RankingEngine.ROLE_FAMILIES else None
        if not cand_matched_family:
            for family, keywords in RankingEngine.ROLE_FAMILIES.items():
                if any(k in cand_lower for k in keywords):
                    cand_matched_family = family
                    break
                    
        if ref_matched_family and cand_matched_family:
            if ref_matched_family == cand_matched_family:
                return 95.0
            # Adjacent leadership roles (e.g., Principal <-> Director, Consultant <-> Advisor)
            adjacent_pairs = [
                {"principal", "director"},
                {"director", "consultant"},
                {"trustee", "director"},
                {"consultant", "edupreneur"}
            ]
            pair = {ref_matched_family, cand_matched_family}
            if any(p == pair for p in adjacent_pairs):
                return 80.0
            return 65.0
            
        # Word overlap fallback
        ref_words = set(re.findall(r'\w+', ref_lower))
        cand_words = set(re.findall(r'\w+', cand_lower))
        overlap = len(ref_words.intersection(cand_words))
        if overlap > 0:
            return min(100.0, 50.0 + (overlap * 20.0))
            
        return 50.0

    @staticmethod
    def calculate_education_relevance(cand_profile: Dict[str, Any]) -> float:
        """
        Measures candidate's school-education ecosystem depth (0-100).
        Based on school indicators (CBSE, ICSE, IB, K-12, NEP), years of experience, and role depth.
        """
        text = f"{cand_profile.get('role', '')} {cand_profile.get('summary', '')} {cand_profile.get('skills', '')}".lower()
        
        score = 40.0 # baseline for in-dataset profile
        
        # High impact school indicators
        indicators = ["cbse", "icse", "ib", "k-12", "k12", "curriculum", "pedagogy", "school leadership", "turnaround", "nep 2020", "accreditation"]
        for ind in indicators:
            if ind in text:
                score += 6.0
                
        # Experience tenure contribution
        exp = cand_profile.get("experience_years", 0) or 0
        if exp >= 20:
            score += 20.0
        elif exp >= 15:
            score += 15.0
        elif exp >= 10:
            score += 10.0
        else:
            score += 5.0
            
        return min(100.0, round(score, 2))

    @staticmethod
    def calculate_network_experience(schools_count: int, summary_text: str) -> float:
        """
        Measures multi-school footprint / network exposure (0-100).
        """
        score = 30.0
        if schools_count >= 20:
            score = 100.0
        elif schools_count >= 15:
            score = 90.0
        elif schools_count >= 10:
            score = 80.0
        elif schools_count >= 5:
            score = 65.0
        elif schools_count >= 2:
            score = 50.0
            
        # Mention of network or multiple branches
        sum_lower = (summary_text or "").lower()
        if any(term in sum_lower for term in ["network", "branches", "campuses", "chain", "clusters", "multi-academy"]):
            score = min(100.0, score + 10.0)
            
        return min(100.0, round(score, 2))

    @staticmethod
    def calculate_location_relevance(ref_location: str, cand_location: str) -> float:
        """
        Measures geographic proximity or regional relevance (0-100).
        """
        ref_loc = (ref_location or "").lower()
        cand_loc = (cand_location or "").lower()
        
        if not ref_loc or not cand_loc or ref_loc == "not available" or cand_loc == "not available":
            return 70.0 # Neutral score when location is unspecified (prevents penalizing)
            
        # Exact city match
        ref_city = ref_loc.split(',')[0].strip()
        cand_city = cand_loc.split(',')[0].strip()
        if ref_city == cand_city:
            return 100.0
            
        # Same country / regional zone match
        for region_name, loc_list in RankingEngine.GEO_REGIONS.items():
            ref_in = any(loc in ref_loc for loc in loc_list)
            cand_in = any(loc in cand_loc for loc in loc_list)
            if ref_in and cand_in:
                return 85.0
                
        # Common country check
        if ("india" in ref_loc and "india" in cand_loc) or ("united kingdom" in ref_loc and "united kingdom" in cand_loc):
            return 75.0
            
        return 50.0

    @classmethod
    def rank_candidate(
        cls,
        semantic_score: float,
        ref_profile: Dict[str, Any],
        cand_profile: Dict[str, Any],
        weights: Optional[Dict[str, float]] = None
    ) -> Dict[str, Any]:
        """
        Applies formula: Final Score = 0.45S + 0.20R + 0.15E + 0.10N + 0.10L
        With dynamic renormalization if weights adjusted.
        """
        w_s = weights.get("semantic_weight", 0.45) if weights else 0.45
        w_r = weights.get("role_weight", 0.20) if weights else 0.20
        w_e = weights.get("education_weight", 0.15) if weights else 0.15
        w_n = weights.get("network_weight", 0.10) if weights else 0.10
        w_l = weights.get("location_weight", 0.10) if weights else 0.10
        
        # Ensure weights sum to 1.0
        total_w = w_s + w_r + w_e + w_n + w_l
        if total_w <= 0:
            total_w = 1.0
        w_s, w_r, w_e, w_n, w_l = w_s / total_w, w_r / total_w, w_e / total_w, w_n / total_w, w_l / total_w

        # S - Semantic (0-100)
        s_score = max(0.0, min(100.0, float(semantic_score)))
        
        # R - Role (0-100)
        r_score = cls.calculate_role_similarity(
            ref_profile.get("role", ""),
            cand_profile.get("role", ""),
            cand_profile.get("role_category", "")
        )
        
        # E - Education Relevance (0-100)
        e_score = cls.calculate_education_relevance(cand_profile)
        
        # N - Network Experience (0-100)
        n_score = cls.calculate_network_experience(
            cand_profile.get("schools_count", 1) or 1,
            cand_profile.get("summary", "")
        )
        
        # L - Location Relevance (0-100)
        l_score = cls.calculate_location_relevance(
            ref_profile.get("location", ""),
            cand_profile.get("location", "")
        )
        
        # Final weighted score
        final_score = (w_s * s_score) + (w_r * r_score) + (w_e * e_score) + (w_n * n_score) + (w_l * l_score)
        final_score = round(max(0.0, min(100.0, final_score)), 2)
        
        # Relevance band
        if final_score >= 80.0:
            relevance_band = "High"
        elif final_score >= 60.0:
            relevance_band = "Medium"
        else:
            relevance_band = "Low"
            
        # Generate evidence-grounded explanation
        explanation = cls.generate_explanation(
            cand_profile, s_score, r_score, e_score, n_score, l_score, final_score
        )
        
        return {
            "scores": {
                "semantic_score": round(s_score, 2),
                "role_score": round(r_score, 2),
                "education_score": round(e_score, 2),
                "network_score": round(n_score, 2),
                "location_score": round(l_score, 2),
                "final_score": final_score,
                "relevance_band": relevance_band
            },
            "explanation": explanation
        }

    @staticmethod
    def generate_explanation(
        cand: Dict[str, Any],
        s: float, r: float, e: float, n: float, l: float, final: float
    ) -> str:
        """
        Generates deterministic, evidence-grounded match justification.
        """
        name = cand.get("name", "Candidate")
        role = cand.get("role", "Education Leader")
        org = cand.get("organisation", "Education Ecosystem")
        schools = cand.get("schools_count", 1)
        exp = cand.get("experience_years", 0)
        
        reasons = []
        if r >= 85:
            reasons.append(f"direct leadership alignment as {role}")
        elif r >= 70:
            reasons.append(f"complementary institutional governance role at {org}")
            
        if schools >= 10:
            reasons.append(f"proven multi-school footprint across {schools}+ campuses")
        elif schools >= 5:
            reasons.append(f"active advisory across {schools} school institutions")
            
        if exp >= 15:
            reasons.append(f"{exp} years of verified educational administration experience")
            
        if s >= 75:
            reasons.append("strong semantic alignment with school turnaround and curriculum strategies")
            
        if not reasons:
            reasons.append(f"relevant practitioner background within {org}")
            
        justification = f"{name} shows {', and '.join(reasons)}."
        return justification

ranking_engine = RankingEngine()

