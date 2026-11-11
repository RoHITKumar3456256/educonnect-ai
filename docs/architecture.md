# EduConnect AI — System Architecture & Workflow

## 1. System Overview
**EduConnect AI** is an explainable school education influencer discovery platform built for the **EDXSO AI Intern Assignment**. It processes a reference professional profile (bio text, identifier URL, or existing record), encodes it semantically, retrieves candidates from an authorized, verifiable dataset, and re-ranks them using a transparent 5-signal deterministic formula.

```
┌────────────────┐     ┌───────────────┐     ┌─────────────────────┐
│  Browser UI    │ ──> │ FastAPI (App) │ ──> │  Profile Extractor  │
│  (React + TS)  │     │   REST Endpt  │     │  (Pydantic/Gemini)  │
└────────────────┘     └───────────────┘     └─────────────────────┘
        ▲                      │                        │
        │                      ▼                        ▼
┌────────────────┐     ┌───────────────┐     ┌─────────────────────┐
│  Results &     │ <── │ Ranking Engine│ <── │ Embedding Service   │
│  Analytics UI  │     │ (5-Component) │     │ (all-MiniLM-L6-v2)  │
└────────────────┘     └───────────────┘     └─────────────────────┘
                               │                        │
                               ▼                        ▼
                       ┌───────────────────────────────────────────┐
                       │   SQLite / Supabase + pgvector Storage    │
                       │   - profiles, evidence, embeddings, runs  │
                       └───────────────────────────────────────────┘
```

## 2. Core Components

### 2.1 Profile Ingestion & Validation
- **Reference Inputs**: Unstructured text, external profile identifier URL, pre-loaded personas, or batch CSV uploads.
- **Extraction Layer**: Validates required attributes (Name, Role, Organisation, Location, Experience Years, Schools Footprint, Skills, Evidence snippets) via Pydantic schemas.
- **Handling Missing Values**: Missing fields are marked explicitly as `Not available`. No false attributes or employer connections are hallucinated.

### 2.2 Dense Embedding Generation
- **Model**: `all-MiniLM-L6-v2` dense vector representations (384 dimensions).
- **Domain Weighting**: Tokens representing school-ecosystem leadership (e.g. CBSE, ICSE, IB, Turnaround, Governance, Headmaster) receive domain boosts.
- **Caching**: Generated embeddings are stored in `profile_embeddings` with `profile_id` primary key to eliminate redundant recalculation.

### 2.3 Candidate Retrieval
- **Vector Filter**: Computes Cosine Similarity scaled to `[0, 100]`.
- **Structured Metadata Filters**: Target role category, geographic zone, minimum experience years, and minimum schools count.

### 2.4 Hybrid Ranking Engine
Candidates are re-ranked using the exact mathematical formulation from Section 5:
$$\text{Final Score} = 0.45S + 0.20R + 0.15E + 0.10N + 0.10L$$

- **$S$ — Semantic Similarity (45%)**: Cosine similarity between reference query and candidate profile embeddings.
- **$R$ — Role Similarity (20%)**: Hierarchical role clustering (Principal, Director, Consultant, Trustee, Edupreneur).
- **$E$ — Education Relevance (15%)**: Evidenced tenure depth and school affiliation indicators (CBSE, ICSE, IB, NEP 2020).
- **$N$ — Network Exposure (10%)**: Footprint across multiple campuses, chains, or multi-academy trusts.
- **$L$ — Location Proximity (10%)**: Regional proximity match; neutral score (70%) if location is unstated to prevent unfair penalty.

### 2.5 Explainability & Traceability
- Every candidate displays a deterministic, evidence-grounded justification: *"Why this profile matches"*.
- Supporting quotes link directly to audited public records, conference directories, or institutional portals.

## 3. Technology Stack
- **Frontend**: React 18, Vite, TypeScript, Tailwind CSS, Lucide icons, Recharts.
- **Backend**: Python 3.12, FastAPI, Pydantic v2, Uvicorn, SQLite / Supabase PostgreSQL with pgvector.
- **AI/ML**: Sentence Transformers (`all-MiniLM-L6-v2`), Gemini API for structured extraction.

