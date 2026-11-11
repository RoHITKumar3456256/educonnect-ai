-- ==========================================================
-- EduConnect AI - Database Schema (PostgreSQL + pgvector compatible)
-- ==========================================================

-- Enable pgvector extension (for Supabase / Postgres)
CREATE EXTENSION IF NOT EXISTS vector;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Profiles Table
CREATE TABLE IF NOT EXISTS profiles (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    profile_url TEXT,
    role VARCHAR(255) NOT NULL,
    organisation VARCHAR(255) NOT NULL,
    location VARCHAR(255) NOT NULL,
    experience_years INTEGER DEFAULT 0,
    summary TEXT,
    verification_status VARCHAR(50) DEFAULT 'unverified', -- 'verified', 'unverified', 'test_data'
    role_category VARCHAR(100) DEFAULT 'other',          -- 'Principal', 'Director', 'Consultant', 'Trustee', 'Edupreneur'
    schools_count INTEGER DEFAULT 1,                     -- number of schools advised or led
    skills TEXT,                                         -- comma-separated or JSON
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Profile Evidence Table
CREATE TABLE IF NOT EXISTS profile_evidence (
    id VARCHAR(64) PRIMARY KEY,
    profile_id VARCHAR(64) REFERENCES profiles(id) ON DELETE CASCADE,
    evidence_text TEXT NOT NULL,
    source_url TEXT,
    source_type VARCHAR(100) NOT NULL,                  -- 'public_institution_page', 'conference_speaker_bio', 'advisory_board_listing', 'curated_directory'
    retrieved_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Profile Embeddings Table
CREATE TABLE IF NOT EXISTS profile_embeddings (
    profile_id VARCHAR(64) PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
    embedding vector(384),                              -- 384 dimensions for all-MiniLM-L6-v2
    model_name VARCHAR(100) DEFAULT 'all-MiniLM-L6-v2',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Discovery Runs Table
CREATE TABLE IF NOT EXISTS discovery_runs (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64),
    reference_profile_id VARCHAR(64),
    reference_input_type VARCHAR(50),                   -- 'text', 'url', 'csv', 'saved'
    reference_query TEXT,
    status VARCHAR(50) DEFAULT 'completed',             -- 'pending', 'processing', 'completed', 'failed'
    parameters JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Discovery Results Table
CREATE TABLE IF NOT EXISTS discovery_results (
    id VARCHAR(64) PRIMARY KEY,
    run_id VARCHAR(64) REFERENCES discovery_runs(id) ON DELETE CASCADE,
    candidate_id VARCHAR(64) REFERENCES profiles(id) ON DELETE CASCADE,
    semantic_score NUMERIC(5, 2) NOT NULL,
    role_score NUMERIC(5, 2) NOT NULL,
    education_score NUMERIC(5, 2) NOT NULL,
    network_score NUMERIC(5, 2) NOT NULL,
    location_score NUMERIC(5, 2) NOT NULL,
    final_score NUMERIC(5, 2) NOT NULL,
    explanation TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Saved Profiles Table (Shortlist)
CREATE TABLE IF NOT EXISTS saved_profiles (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64),
    profile_id VARCHAR(64) REFERENCES profiles(id) ON DELETE CASCADE,
    notes TEXT,
    saved_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. Data Sources Table
CREATE TABLE IF NOT EXISTS data_sources (
    id VARCHAR(64) PRIMARY KEY,
    source_name VARCHAR(255) NOT NULL,
    source_type VARCHAR(100) NOT NULL,
    permission_status VARCHAR(100) NOT NULL,
    records_count INTEGER DEFAULT 0,
    notes TEXT,
    last_synced_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_location ON profiles(location);
CREATE INDEX IF NOT EXISTS idx_discovery_results_run ON discovery_results(run_id);
CREATE INDEX IF NOT EXISTS idx_saved_profiles_user ON saved_profiles(user_id);

