# EduConnect AI

> **"Find the right people. Build the right school network."**  
> **EDXSO AI Intern Assignment — LinkedIn School Influencer Discovery Tool**

EduConnect AI is an AI-powered school influencer discovery MVP that analyzes reference education leadership profiles, discovers similar professionals from an authorized, traceable dataset, and ranks them using semantic vector embeddings and a deterministic 5-component hybrid ranking engine.

---

## 🌟 Key Features

1. **Multi-Modal Profile Ingestion**:
   - Paste unstructured bio text, CV summaries, or reference URLs.
   - Select from preloaded high-impact test personas (Turnaround Principal, IB Director, School Trustee, Edupreneur).
   - Batch CSV file upload with schema validation and error reporting.
2. **Deterministic Hybrid Ranking Engine**:
   - Re-ranks candidates using the exact weighted formula:
     $$\text{Final Score} = 0.45S + 0.20R + 0.15E + 0.10N + 0.10L$$
     - **S (45%)**: Semantic Similarity (Dense Vector Cosine Similarity)
     - **R (20%)**: Role Family & Leadership Seniority
     - **E (15%)**: School Education Indicators (CBSE, ICSE, IB, NEP 2020)
     - **N (10%)**: Multi-school network footprint & campuses led
     - **L (10%)**: Geographic proximity
3. **PeopleGPT & Lessie AI Inspired Interface**:
   - Top AI Pick highlight banner.
   - Slide-out candidate dossier drawer with verified source evidence quotes.
   - Interactive institutional network map.
   - Dynamic match breakdown tooltips.
4. **Outreach Shortlist & CSV Export**:
   - Bookmark candidates and attach custom notes.
   - One-click structured CSV export.
5. **Real-Time Network Analytics**:
   - Interactive Recharts visualizing role distribution, geographic dispersion, tenure histograms, and score band donut charts.
6. **Strict Ethics & Compliance**:
   - Zero scraping of LinkedIn or unauthorized bypass of authentication/CAPTCHAs.
   - 100% traceable public sources with audit dates.

---

## 📁 Repository Structure

```
educonnect-ai/
├── frontend/                     # React + Vite + TypeScript + Tailwind CSS UI
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/           # Deep navy Sidebar, Topbar
│   │   │   ├── discovery/        # ScoreBadge, NetworkGraphModal
│   │   │   └── profiles/         # ProfileDetailDrawer
│   │   ├── pages/                # Dashboard, NewDiscovery, Results, Analytics, SavedProfiles, DataSources, Settings
│   │   ├── services/             # REST API Client (api.ts)
│   │   ├── types/                # TypeScript interfaces
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   └── vite.config.ts
├── backend/                      # Python FastAPI REST Server
│   ├── app/
│   │   ├── api/                  # profiles.py, discovery.py, saved.py, analytics.py
│   │   ├── core/                 # config.py, database.py (SQLite + pgvector adapter)
│   │   ├── services/             # ranking_engine.py, embedding_service.py, profile_extractor.py, discovery_engine.py
│   │   ├── schemas/              # Pydantic models
│   │   └── main.py               # FastAPI entrypoint & /health
│   ├── tests/                    # Pytest unit tests (test_ranking.py, test_api.py)
│   ├── requirements.txt
│   └── .env.example
├── database/
│   ├── schema.sql                # PostgreSQL + pgvector schema definition
│   └── seed.sql                  # Initial seed dataset
├── data/
│   ├── sample_profiles.csv       # 30 Curated, traceable education influencer profiles
│   └── README.md                 # Data provenance & ethics documentation
├── docs/
│   ├── architecture.md           # Architecture flow & component diagrams
│   ├── technical-note.md         # Technical note for submission
│   └── demo-script.md            # 5-10 minute video demonstration script
├── .gitignore
└── README.md
```

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Python**: 3.10+ (Tested on Python 3.12)
- **Node.js**: 18+ (Tested on Node.js v24 / npm 11)

### 2. Backend Setup
```bash
# Navigate to backend
cd backend

# Create & activate virtual environment (Windows)
python -m venv venv
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run backend API server (runs on http://localhost:8000)
python -m uvicorn app.main:app --reload --port 8000
```
- API Documentation (Swagger): `http://localhost:8000/docs`
- Health Check: `http://localhost:8000/health`

### 3. Frontend Setup
```bash
# Open a new terminal and navigate to frontend
cd frontend

# Install dependencies
npm install

# Start Vite dev server (runs on http://localhost:5173)
npm run dev
```

### 4. Running Backend Tests
```bash
$env:PYTHONPATH="C:\Users\DELL\OneDrive\Desktop\educonnect-ai"
backend\venv\Scripts\pytest backend\tests -v
```

---

## 🧪 Testing & Verification
All 6 unit tests verify:
- ✅ Backend health & dynamic DB profile count
- ✅ Profile listing and detail retrieval
- ✅ End-to-end discovery run with hybrid re-ranking
- ✅ Pydantic profile text extraction and evidence quotes
- ✅ Mathematical ranking weight calculations and ordering
- ✅ Missing location neutral normalization

---

## 📜 License
MIT License. Built for the EDXSO AI Intern Assignment.

