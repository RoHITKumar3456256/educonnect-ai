# EduConnect AI — 5-10 Minute Demonstration Script

## Overview
This walkthrough script provides an exact step-by-step roadmap for demonstrating **EduConnect AI** during the EDXSO AI Intern assignment review.

---

### Step 1: Introduction & Problem Statement (0:00 – 1:00)
- **Visual**: Show EduConnect AI Dashboard (`http://localhost:5173`).
- **Talking Points**:
  - *"Welcome to EduConnect AI — an AI-powered school influencer discovery platform designed to find the right people and build the right school network."*
  - *"Traditional tools either scrape LinkedIn illegally or fail to explain why someone is relevant. EduConnect AI introduces explainable semantic matching over authorized, traceable datasets."*
  - Point out live metrics: Total Candidates (30 active records), Discovery Runs, Shortlisted Candidates, and Verified Provenance.

---

### Step 2: Reference Profile Ingestion & AI Analysis (1:00 – 2:30)
- **Visual**: Navigate to **New Discovery**.
- **Action**: Select the **Select Test Persona** tab.
- **Select**: `CBSE Turnaround Principal` (Dr. Rajesh K. Sharma - 24 years exp, 18 schools).
- **Click**: `Extract & Validate Profile`.
- **Talking Points**:
  - *"Notice the extraction stage: Pydantic validates key signals — role category (Director/Principal), years of experience (24 years), schools advised (18+ campuses), and core competencies."*
  - *"If a field like location is missing from text, it is marked as 'Not available'. The system never hallucinates fake credentials."*
  - Switch briefly to **Profile URL Reference** tab to show the strict compliance notice: URLs are recorded as immutable identifiers without scraping or bypassing CAPTCHAs.

---

### Step 3: Retrieval & Hybrid Re-ranking Execution (2:30 – 4:30)
- **Action**: Click **Run Discovery & Generate Ranking**.
- **Visual**: Watch progress and land on **Ranked Influencer Results**.
- **Talking Points**:
  - *"The backend encoded the query using Sentence Transformers into a 384-dimensional vector, performed pgvector cosine similarity, and applied our deterministic hybrid formula:"*
  - $$\text{Final Score} = 0.45S + 0.20R + 0.15E + 0.10N + 0.10L$$
  - *"Highlight the **Top AI Pick** at the top of the screen: the highest scoring candidate with an AI match explanation."*
  - *"Hover over any candidate's Score Badge (e.g. 88% Match) to inspect the live breakdown: Semantic Vector, Role, School Relevance, Network Exposure, and Location."*

---

### Step 4: Evidence Inspection & Candidate Dossier (4:30 – 6:00)
- **Action**: Click **Dossier** on any candidate to open the slide-out drawer (inspired by PeopleGPT).
- **Visual**: Review the AI Spotlight summary, deterministic scoring bars, and **Audited Source Evidence**.
- **Talking Points**:
  - *"Notice that every claim is grounded in an audited quote from a public institution directory or conference speaker bio with verifiable links."*
  - Add a note: *"Top choice for Q3 CBSE Curriculum Advisory Board"* and click **Add to Shortlist**.
- **Action**: Click **View Network Map** to open the interactive graph (inspired by reference image 1).
- **Talking Points**:
  - *"Here we visualize the influencer's institutional network: connection to school chains, curriculum reform taskforces, and academic summits."*

---

### Step 5: Network Analytics & Shortlist Management (6:00 – 7:30)
- **Action**: Navigate to **Network Analytics**.
- **Visual**: Showcase the 4 interactive Recharts charts:
  - Role Category Distribution (Principals, Directors, Consultants, Trustees, Edupreneurs).
  - Geographic Hubs (Delhi NCR, Bengaluru, Mumbai, Pune, International).
  - Experience Tenure Segments (Histograms).
  - Relevance Score Quality Bands (Donut chart).
- **Action**: Navigate to **Saved Shortlist**.
- **Talking Points**:
  - Show the bookmarked candidate with your custom note.
  - Click **Export Shortlist CSV** to demonstrate instant export.

---

### Step 6: Data Ethics & Settings Customization (7:30 – 8:30)
- **Action**: Navigate to **Weights & Settings**.
- **Talking Points**:
  - Show the dynamic sliders for the hybrid formula ($S, R, E, N, L$).
  - *"Recruitment teams can adjust priorities in real-time — for example, placing 60% weight on multi-school network exposure when building a franchise."*
- **Action**: Navigate to **Data Sources & Ethics**.
  - Review the Zero-Scraping compliance charter and dataset transparency table.

---

### Step 7: Conclusion & Summary (8:30 – 9:00)
- *"EduConnect AI provides a fully operational, testable, and compliant discovery platform that is production-ready for the school education ecosystem."*

