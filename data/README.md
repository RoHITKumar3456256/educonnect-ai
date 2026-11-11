# EduConnect AI - Dataset & Data Ethics Documentation

## 1. Overview
EduConnect AI utilizes an authorized, curated dataset of school education ecosystem influencers, leaders, trustees, principals, and edupreneurs.

In accordance with strict compliance and privacy rules:
- **No Scraping or CAPTCHA Bypassing**: LinkedIn and private networks are NOT scraped. A user pasting a LinkedIn URL does not trigger unauthorized automated scraping; the URL is treated strictly as an external reference identifier.
- **Traceability & Provenance**: Every record contains an explicit internal ID, verifiable public source URL (e.g. public institution directories, conference speaker lists, advisory board pages), evidence text, and verification status.
- **Verification Levels**:
  - `verified`: Record matches publicly verified institutional directories or published leadership pages.
  - `unverified`: User-contributed or pending confirmation.
  - `test_data`: Clearly labelled synthetic test records.

## 2. Dataset Fields
| Field Name | Type | Description |
|---|---|---|
| `id` | String | Unique profile identifier |
| `name` | String | Full professional name |
| `role` | String | Current professional title / role |
| `organisation` | String | Primary institution, board, or company |
| `location` | String | City and country |
| `experience_years` | Integer | Total evidenced years in education |
| `role_category` | String | Principal, Director, Consultant, Trustee, Edupreneur |
| `schools_count` | Integer | Number of schools advised, led, or partnered with |
| `skills` | String | Core educational competencies |
| `summary` | Text | Professional summary |
| `evidence_text` | Text | Concrete excerpt proving school ecosystem impact |
| `source_url` | String | Publicly verifiable link |
| `source_type` | String | Source category (e.g., public_institution_page) |
| `verification_status` | String | Status flag (verified / unverified / test_data) |

