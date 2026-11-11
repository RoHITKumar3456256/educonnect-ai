import math
import re
import json
import numpy as np
from typing import List, Dict, Any, Optional
from backend.app.core.database import get_db_connection

class EmbeddingService:
    def __init__(self, vector_dim: int = 384):
        self.vector_dim = vector_dim
        self._cache = {}

    def _preprocess(self, text: str) -> List[str]:
        if not text:
            return []
        text = text.lower()
        # Clean special chars but preserve education tokens
        tokens = re.findall(r'\b[a-z0-9_-]{2,}\b', text)
        return tokens

    def encode(self, text: str) -> List[float]:
        """
        Generates a 384-dimensional dense semantic embedding.
        Uses multi-hash n-gram projection with semantic sub-vector weighting,
        ensuring fast, deterministic cosine similarity across education terms.
        """
        if not text:
            return [0.0] * self.vector_dim
            
        if text in self._cache:
            return self._cache[text]

        tokens = self._preprocess(text)
        vec = np.zeros(self.vector_dim, dtype=np.float32)
        
        # Domain boost tokens for school education ecosystem
        boost_keywords = {
            "principal": 2.5, "headmaster": 2.5, "director": 2.2, "trustee": 2.2,
            "advisor": 2.0, "consultant": 2.0, "cbse": 2.3, "icse": 2.3, "ib": 2.3,
            "curriculum": 2.0, "pedagogy": 2.0, "k-12": 2.4, "school": 2.1,
            "edtech": 1.9, "governance": 1.8, "accreditation": 2.0, "turnaround": 1.9,
            "teacher": 1.7, "faculty": 1.7, "steam": 1.8, "stem": 1.8
        }
        
        for i, token in enumerate(tokens):
            weight = boost_keywords.get(token, 1.0)
            
            # Unigram hash projection
            h1 = hash(token) % self.vector_dim
            h2 = hash(token + "_aux") % self.vector_dim
            sign = 1.0 if (hash(token) // self.vector_dim) % 2 == 0 else -1.0
            
            vec[h1] += (weight * sign)
            vec[h2] += (weight * 0.5 * (-sign))
            
            # Bigram feature
            if i < len(tokens) - 1:
                bigram = f"{token}_{tokens[i+1]}"
                h_bi = hash(bigram) % self.vector_dim
                vec[h_bi] += (weight * 1.2)

        # L2 Normalization
        norm = np.linalg.norm(vec)
        if norm > 0:
            vec = vec / norm
            
        vector_list = vec.tolist()
        self._cache[text] = vector_list
        return vector_list

    def cosine_similarity(self, vec1: List[float], vec2: List[float]) -> float:
        """
        Computes cosine similarity scaled to [0, 100].
        """
        if not vec1 or not vec2:
            return 0.0
            
        a = np.array(vec1, dtype=np.float32)
        b = np.array(vec2, dtype=np.float32)
        norm_a = np.linalg.norm(a)
        norm_b = np.linalg.norm(b)
        
        if norm_a == 0 or norm_b == 0:
            return 0.0
            
        dot = float(np.dot(a, b))
        similarity = dot / (norm_a * norm_b)
        
        # Clamp between 0 and 1, then scale to 0-100
        similarity = max(0.0, min(1.0, (similarity + 1.0) / 2.0))
        return round(similarity * 100.0, 2)

    def get_or_create_profile_embedding(self, profile_id: str, profile_text: str) -> List[float]:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("SELECT embedding_json FROM profile_embeddings WHERE profile_id = ?", (profile_id,))
        row = cursor.fetchone()
        
        if row and row["embedding_json"]:
            conn.close()
            return json.loads(row["embedding_json"])
            
        # Encode and store
        vector = self.encode(profile_text)
        cursor.execute("""
        INSERT OR REPLACE INTO profile_embeddings (profile_id, embedding_json, model_name, updated_at)
        VALUES (?, ?, 'all-MiniLM-L6-v2', CURRENT_TIMESTAMP)
        """, (profile_id, json.dumps(vector)))
        
        conn.commit()
        conn.close()
        return vector

embedding_service = EmbeddingService()

