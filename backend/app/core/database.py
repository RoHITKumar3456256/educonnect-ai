import sqlite3
import json
import csv
import uuid
from pathlib import Path
from typing import List, Dict, Any, Optional
from datetime import datetime
from backend.app.core.config import settings

def get_db_connection():
    conn = sqlite3.connect(str(settings.DB_PATH))
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Enable foreign keys
    cursor.execute("PRAGMA foreign_keys = ON;")
    
    # 1. Users
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
    """)
    
    # 2. Profiles
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS profiles (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        profile_url TEXT,
        role TEXT NOT NULL,
        organisation TEXT NOT NULL,
        location TEXT NOT NULL,
        experience_years INTEGER DEFAULT 0,
        role_category TEXT DEFAULT 'other',
        schools_count INTEGER DEFAULT 1,
        skills TEXT DEFAULT '',
        summary TEXT DEFAULT '',
        avatar_url TEXT DEFAULT '',
        verification_status TEXT DEFAULT 'verified',
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
    """)
    
    # 3. Profile Evidence
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS profile_evidence (
        id TEXT PRIMARY KEY,
        profile_id TEXT NOT NULL,
        evidence_text TEXT NOT NULL,
        source_url TEXT,
        source_type TEXT NOT NULL,
        retrieved_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE
    );
    """)
    
    # 4. Profile Embeddings
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS profile_embeddings (
        profile_id TEXT PRIMARY KEY,
        embedding_json TEXT NOT NULL,
        model_name TEXT DEFAULT 'all-MiniLM-L6-v2',
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE
    );
    """)
    
    # 5. Discovery Runs
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS discovery_runs (
        id TEXT PRIMARY KEY,
        user_id TEXT,
        reference_profile_id TEXT,
        reference_input_type TEXT,
        reference_query TEXT,
        reference_name TEXT,
        status TEXT DEFAULT 'completed',
        parameters TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
    """)
    
    # 6. Discovery Results
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS discovery_results (
        id TEXT PRIMARY KEY,
        run_id TEXT NOT NULL,
        candidate_id TEXT NOT NULL,
        semantic_score REAL NOT NULL,
        role_score REAL NOT NULL,
        education_score REAL NOT NULL,
        network_score REAL NOT NULL,
        location_score REAL NOT NULL,
        final_score REAL NOT NULL,
        explanation TEXT NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (run_id) REFERENCES discovery_runs(id) ON DELETE CASCADE,
        FOREIGN KEY (candidate_id) REFERENCES profiles(id) ON DELETE CASCADE
    );
    """)
    
    # 7. Saved Profiles (Shortlist)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS saved_profiles (
        id TEXT PRIMARY KEY,
        user_id TEXT,
        profile_id TEXT NOT NULL,
        notes TEXT DEFAULT '',
        saved_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE
    );
    """)
    
    # 8. Data Sources
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS data_sources (
        id TEXT PRIMARY KEY,
        source_name TEXT NOT NULL,
        source_type TEXT NOT NULL,
        permission_status TEXT NOT NULL,
        records_count INTEGER DEFAULT 0,
        notes TEXT,
        last_synced_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
    """)
    
    conn.commit()
    
    # Check if profiles exist, if not seed from CSV
    cursor.execute("SELECT COUNT(*) FROM profiles;")
    count = cursor.fetchone()[0]
    if count == 0:
        seed_profiles_from_csv(conn)
        
    conn.close()

def seed_profiles_from_csv(conn):
    csv_file = settings.DATA_DIR / "sample_profiles.csv"
    if not csv_file.exists():
        print(f"Seed file not found at {csv_file}")
        return
        
    cursor = conn.cursor()
    with open(csv_file, mode="r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        seeded_count = 0
        for row in reader:
            profile_id = row.get("id", str(uuid.uuid4()))
            name = row.get("name", "")
            role = row.get("role", "")
            organisation = row.get("organisation", "")
            location = row.get("location", "")
            try:
                experience_years = int(str(row.get("experience_years", 0)).strip() or 0)
            except (ValueError, TypeError):
                experience_years = 0

            role_category = row.get("role_category", "other")
            try:
                schools_count = int(str(row.get("schools_count", 1)).strip() or 1)
            except (ValueError, TypeError):
                schools_count = 1
            skills = row.get("skills", "")
            summary = row.get("summary", "")
            profile_url = row.get("profile_url", "")
            verification_status = row.get("verification_status", "verified")
            
            # Deterministic avatar generator using Dicebear
            avatar_url = f"https://api.dicebear.com/7.x/avataaars/svg?seed={name.replace(' ', '')}"
            
            cursor.execute("""
            INSERT OR REPLACE INTO profiles 
            (id, name, profile_url, role, organisation, location, experience_years, role_category, schools_count, skills, summary, avatar_url, verification_status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (profile_id, name, profile_url, role, organisation, location, experience_years, role_category, schools_count, skills, summary, avatar_url, verification_status))
            
            # Evidence
            evidence_text = row.get("evidence_text", "")
            source_url = row.get("source_url", "")
            source_type = row.get("source_type", "curated_directory")
            
            if evidence_text:
                evidence_id = str(uuid.uuid4())
                cursor.execute("""
                INSERT OR REPLACE INTO profile_evidence
                (id, profile_id, evidence_text, source_url, source_type)
                VALUES (?, ?, ?, ?, ?)
                """, (evidence_id, profile_id, evidence_text, source_url, source_type))
                
            seeded_count += 1
            
        # Add default data sources
        cursor.execute("""
        INSERT OR REPLACE INTO data_sources (id, source_name, source_type, permission_status, records_count, notes)
        VALUES 
        ('ds_1', 'National School Leadership Directories & Public Portals', 'public_institution_page', 'Public Access / Fair Use', 18, 'Curated school leadership registries and university advisory councils.'),
        ('ds_2', 'All India Education Summits & Conferences Bio Registry', 'conference_speaker_bio', 'Publicly Disclosed Speaker Profiles', 8, 'Verified speakers and panelists from Bett Asia and EDX Global.'),
        ('ds_3', 'Authorised School Trustee & Board Registry', 'curated_directory', 'Consent & Verified Directories', 4, 'Direct verification with school foundations and trust charters.')
        """)
        
        conn.commit()
        print(f"Successfully seeded {seeded_count} profiles into SQLite database.")
