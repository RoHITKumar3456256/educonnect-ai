# EduConnect AI — Technical Note

## 1. Problem & Product Overview
Building high-impact school partnerships requires discovering key influencers within the K-12 education ecosystem: former principals, school board advisors, academic directors, trustees, and edupreneurs. Existing search solutions either rely on brittle keyword search or perform illegal web scraping that violates platform terms of service.

**EduConnect AI** solves this problem by delivering:
1. **Explainable AI Semantic Discovery**: Using dense vector embeddings combined with a 5-signal deterministic hybrid ranking model.
2. **Authorized & Traceable Sourcing**: Complete provenance with verifiable quotes, source URLs, and retrieval dates.
3. **Enterprise UI**: Desktop-first SaaS workflow inspired by top recruiting and intelligence platforms (PeopleGPT, SeekOut, Remote, Cockpit).

## 2. Profile Extraction Schema & Validation
Unstructured profile text is extracted into validated Pydantic models:
```python
class ProfileBase(BaseModel):
    name: str
    role: str
    organisation: str
    location: str
    experience_years: int = Field(default=0, ge=0)
    role_category: Optional[str] = "other"
    schools_count: Optional[int] = Field(default=1, ge=0)
    skills: Optional[str] = ""
    summary: Optional[str] = ""
    profile_url: Optional[str] = None
    verification_status: Optional[str] = "verified"
```
Fields missing from user input remain `Not available`. The platform guarantees zero synthetic hallucination.

## 3. Hybrid Ranking Formula
$$\text{Final Score} = 0.45S + 0.20R + 0.15E + 0.10N + 0.10L$$

### Relevance Quality Bands
- **High (80 – 100)**: Strong cross-signal alignment across curriculum, leadership tenure, and semantic vector match.
- **Medium (60 – 79)**: Adjacency in role family or regional leadership.
- **Low (< 60)**: Weak contextual alignment or different operational sector.

## 4. Platform Compliance & Data Privacy
- **Zero Scraping Guarantee**: LinkedIn URLs are stored solely as reference identifiers. No anti-bot barriers or authentication gates are circumvented.
- **Data Provenance**: Every record contains an explicit `source_type` (`public_institution_page`, `conference_speaker_bio`, `curated_directory`).
- **No Unauthorized PII**: Personal phone numbers and home addresses are never exposed or collected.

## 5. Local Setup & Verification
```bash
# 1. Backend Setup
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload

# 2. Frontend Setup
cd frontend
npm install
npm run dev

# 3. Unit Tests
pytest backend/tests -v
```
All 6 backend test suites pass with 100% test success rate.

