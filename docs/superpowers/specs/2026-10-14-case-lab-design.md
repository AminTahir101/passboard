# Case Lab — AI Image Diagnosis (Student v1)

**Date:** 2026-10-14  
**Author:** @Amin  
**Status:** Approved — ready for implementation  
**Scope:** Student mode only. No clinician sign-off, no patient summary release, no reviewer queue in v1.

---

## 1. Overview

Case Lab lets a Passboard student upload a clinical photo (skin lesion, rash, wound, nail, eye, swelling) plus optional history and scanned documents (lab results, discharge summaries), and receive a structured differential diagnosis with calibrated confidence, ranked reasoning, can't-miss conditions, and a linked learning layer of Passboard MCQs.

It ships inside Passboard as a sixth learning tool alongside Practice, Question Bank, Mock Exams, Anatomy, and AI Tutor.

**Student guardrail on every screen and every export:**  
> "Educational use only. Do not use for real patient decisions."

---

## 2. Users and use cases (v1 scope)

Only the **Student** role is active in v1.

| Role | Who | What they upload | What they get | Guardrail |
|---|---|---|---|---|
| Student | Passboard learner (SMLE, USMLE, PLAB prep) | De-identified teaching images, textbook cases, own case notes | Differential + reasoning + linked MCQs + "commit your answer first" mode | Educational banner; no real-patient workflow |

Clinician and Reviewer roles are out of scope for v1.

### Core student use cases
1. Student uploads a rash photo, writes their own differential first, then compares it with the AI's ranked differential and reasoning.
2. Student uploads a lesion photo plus a scanned lab PDF; gets a report integrating image findings with lab values.
3. Image quality is poor (blurred, dark, partial); system refuses to diagnose and explains how to retake.
4. History contains a red flag (fever + rapidly spreading erythema + pain out of proportion); report leads with an urgent-care warning before any differential.

---

## 3. End-to-end flow

```
Clinical images (up to 6)     History form          Documents (PDFs/images)
        │                          │                         │
        ▼                          │                         ▼
  Quality gate ──fail: retake      │               OCR worker (Tesseract)
  blur, light, de-identify         │               GPT-4o fallback
        │                          │                         │
        └──────────────────────────┴─────────────────────────┘
                                   │
                             Red-flag screen
                      urgent findings → top of report
                                   │
                          Vision findings
                     describe before naming
                                   │
                        Reasoning ×3 + reviewer pass
                           ranked differential
                                   │
                        Calibrate confidence
                        TP/FP risk, abstain rule
                                   │
                         Medical report (JSON)
                    rendered in-app + PDF export
                                   │
                            Student feedback
                           verdict + learning
```

**Commit-first rule:** The student sees a "Write your differential" step before the analysis result is revealed. The AI's differential is hidden until the student has submitted their own.

---

## 4. Functional requirements

### 4.1 Image upload
- **FR-1.1** Accept JPEG, PNG, HEIC, WebP; max 20 MB per image; up to 6 images per case.
- **FR-1.2** Per image: user tags body site (body-map picker), view (close-up / overview), capture date.
- **FR-1.3** Strip EXIF (GPS, device ID) on upload. Offer one-tap face blur; auto-detect faces for blurring when the site is not the face.
- **FR-1.4** Quality gate before analysis: blur (Laplacian variance), exposure, resolution ≥ 1024 px short side, subject in frame. Fail → explain problem, ask for retake; never diagnose from a failed image.

### 4.2 Patient context and history
Structured form (all optional except age range, sex, chief complaint) plus free text.

| Block | Fields |
|---|---|
| Demographics | Age range, sex, Fitzpatrick skin type |
| Presenting complaint | Chief complaint, onset, duration, progression, symptoms, triggers |
| Systemic symptoms | Fever, weight loss, night sweats, fatigue, joint pain |
| Medications | Current and recent (last 3 months), OTC, herbal |
| Allergies | Drug, food, contact |
| Past medical history | Chronic conditions, previous similar episodes |
| Prior investigations | Lab results, imaging reports, previous diagnoses |

### 4.3 Document upload and OCR
- **FR-2.1** PDF, image of paper report, DOCX. Up to 20 files per case.
- **FR-2.2** Every value extracted is shown to the student for confirmation before use.
- **FR-2.3** OCR pipeline: pdftoppm (300 DPI) → OpenCV pre-process (deskew, denoise, binarise) → Tesseract 5 (eng+ara) with per-word confidence → if page confidence <80% or handwritten/table detected → GPT-4o vision re-reads the page → parse into structured fields (name, value, unit, ref_range, flag, LOINC code, date).

### 4.4 Image analysis and diagnosis
- **FR-4.1** Vision step describes findings in dermatology/clinical vocabulary before naming any disease: morphology (macule, papule, plaque, vesicle, nodule, ulcer), colour, size estimate, border, distribution, configuration, secondary changes.
- **FR-4.2** Reasoning step combines image findings + history + confirmed labs into a ranked differential of 3–5 conditions.
- **FR-4.3** For each condition: probability, supporting findings, findings against, missing information that would confirm or exclude it, false-positive look-alikes, discriminating feature.
- **FR-4.4** Red-flag screen runs first and can override the whole output with an urgent banner.
- **FR-4.5** System outputs "Cannot assess reliably" when confidence is below threshold (see §6.4).
- **FR-4.6** Self-consistency: reasoning runs 3 times at temperature 0.7; agreement = share that rank the same top diagnosis.
- **FR-4.7** Second-opinion pass: a separate sceptical-reviewer prompt receives findings + proposed differential and argues for the strongest alternative.

### 4.5 Report
- **FR-5.1** Report follows the 13-section template in §7.
- **FR-5.2** Generated in English or Arabic (student's app language).
- **FR-5.3** Export as PDF with case ID, model version, timestamp, and educational disclaimer.
- **FR-5.4** "Ask the tutor" button opens existing AI Tutor with the case in context.
- **FR-5.5** Student records final diagnosis and rates the AI (correct / partly correct / wrong).

---

## 5. Diagnostic reasoning — 13 required sections

| # | Aspect | What the AI must produce |
|---|---|---|
| 1 | Red-flag triage | Urgency level: emergency / urgent (24–48 h) / routine; trigger findings |
| 2 | History synthesis | One-paragraph case summary in clinical language |
| 3 | Image findings | Morphology, colour, border, size, distribution, secondary changes — findings only, no disease names |
| 4 | Document/lab findings | Abnormal values with dates and trend |
| 5 | Problem representation | One-line semantic summary |
| 6 | Differential diagnosis | 3–5 ranked conditions, probability, for/against |
| 7 | Can't-miss diagnoses | Dangerous conditions to exclude even if unlikely |
| 8 | Confidence and error risk | Calibrated probability, likely FP and FN traps |
| 9 | Missing information | Questions or exam findings that would change the ranking |
| 10 | Recommended workup | Tests in priority order with why |
| 11 | Management direction | General, guideline-level direction; no drug doses |
| 12 | Referral and follow-up | Specialty, timeframe, safety-netting advice |
| 13 | Learning layer (students) | Key discriminating features, 3 linked Passboard MCQs by category match, exam tips |

**Reasoning rules enforced in prompt and validator:**
- Describe before naming: findings first, diagnoses second.
- Every probability must cite at least one finding for and one against, or state "none found".
- Base rates matter: prior adjusted by age, sex, region, skin type; rare conditions cannot rank first without strong specific evidence.
- Skin type: model is told the Fitzpatrick type and warned that erythema and pigment changes look different on darker skin.
- Contradictions between image, history, and documents are listed explicitly rather than silently resolved.

---

## 6. Confidence, true positives and false positives

### 6.1 How confidence is measured
1. **Self-consistency** — 3 runs at temperature 0.7; agreement = share ranking the same top diagnosis. 3/3 high, 2/3 moderate, 1/3 low.
2. **Second-opinion model** — separate sceptical-reviewer prompt argues for the strongest alternative.
3. **Guideline check** — retrieve relevant criteria (ABCDE for melanoma, Wells for DVT, Centor for pharyngitis) from pgvector knowledge store; disagreement lowers confidence.

### 6.2 Per-diagnosis output
- Calibrated probability (rounded to 5%) and confidence band: high ≥70%, moderate 40–69%, low <40%.
- False-positive risk: look-alikes most often confused with it, and the one finding that would separate them.
- False-negative risk: for can't-miss conditions, if probability ≥5% they stay on the list with an explicit "exclude" action.
- Model agreement string (e.g. "3 of 3 runs agreed").

### 6.3 Abstention rules
System outputs "Cannot assess reliably" when any of these hold:
- Image fails the quality gate.
- Top-diagnosis agreement ≤ 1/3 and the reviewer proposes a different leader.
- Body site or condition class is outside the validated scope.
- Calibrated top probability < 30%.

Abstention still returns the findings description, red-flag screen, and missing-information questions.

---

## 7. The medical report — template

```
PASSBOARD CASE LAB — EDUCATIONAL REPORT
Case ID: CL-YYYY-XXXXXX · Model: caselab-v1.0 · Generated: <timestamp>
Educational use only. Do not use for real patient decisions.

1. URGENCY
   [EMERGENCY / URGENT / ROUTINE] — [trigger findings]

2. CASE SUMMARY
   [one paragraph]

3. WHAT THE IMAGE SHOWS
   [morphology, colour, border, size, distribution, secondary changes]
   Image quality: [good / acceptable / poor (retake recommended)]

4. WHAT THE DOCUMENTS SHOW
   [abnormal values with dates and trend]

5. MOST LIKELY DIAGNOSES
   a) [Condition] — [probability]% ([confidence band], [agreement]/3 runs[, reviewer agreed/disagreed])
      For: [findings]
      Against: [findings]
      False-positive risk: [look-alikes + discriminator]

6. MUST NOT MISS
   [Condition]: [action — exclude with X]

7. INFORMATION THAT WOULD CHANGE THIS ASSESSMENT
   [missing exam findings or investigations]

8. SUGGESTED NEXT STEPS
   [workup in priority order]

9. MANAGEMENT DIRECTION
   [guideline-level direction; no drug doses]

10. FOLLOW-UP AND SAFETY-NETTING
    [timeframe; when to seek emergency care]

11. LIMITATIONS
    [scope and abstention notes]

12. LEARNING — KEY DISCRIMINATING FEATURES
    [exam-relevant pattern recognition]

13. LINKED PASSBOARD QUESTIONS
    [up to 3 MCQs from matching category]
```

---

## 8. Technical architecture

### 8.1 Components

| Component | Tech | Responsibility |
|---|---|---|
| Upload UI | `src/app/[lang]/(app)/case-lab/` | Body map, camera guidance, history form, document upload, report view (RTL-ready) |
| Storage | Supabase Storage, private bucket `case-media` | Images and documents, signed URLs (5 min), encrypted at rest |
| API routes | `src/app/api/case-lab/*` | Case CRUD, start analysis, poll status, feedback, export |
| OCR worker | Python 3.12, `ocr-worker/` → Fly.io me-central | pdftoppm, OpenCV pre-processing, Tesseract 5 eng+ara, GPT-4o vision fallback |
| Job queue | Supabase table `case_jobs` + Postgres LISTEN/NOTIFY | Async OCR steps, retries, timeouts |
| Vision + reasoning | GPT-4o with JSON-schema structured outputs | Findings, differential, self-consistency runs, reviewer pass |
| Knowledge retrieval | pgvector over curated guideline snippets | Criteria scores (ABCDE, Wells, Centor), guideline citations in report |
| Report renderer | React PDF (`@react-pdf/renderer`) | Clinician PDF, Arabic shaping |

### 8.2 Data model — new tables

```sql
-- Pseudonymous patient records (no names, no national IDs)
patients (id, owner_id, pseudonym, birth_year, sex, fitzpatrick, created_at)

-- One case per upload session
cases (id, patient_id, owner_id, mode, status, chief_complaint,
       history_json, consent_at, model_version)
-- mode = 'student' always in v1
-- status: draft | images_uploaded | ocr_pending | ocr_done | analyzing | done | failed

-- Up to 6 images per case
case_images (id, case_id, storage_path, body_site, view,
             captured_at, quality_json, faces_blurred)

-- Uploaded PDFs and documents
case_documents (id, case_id, storage_path, doc_type,
                ocr_engine, ocr_confidence)

-- Values extracted by OCR worker, confirmed by student
case_extracted_values (id, document_id, loinc, name, value, unit,
                       ref_range, flag, observed_at, confidence,
                       confirmed_by, page)

-- AI analysis result (one per case, re-runnable)
case_analyses (id, case_id, findings_json, differential_json, urgency,
               agreement, abstained, prompt_version, tokens, latency_ms)

-- Rendered report (JSON + optional PDF path)
case_reports (id, analysis_id, lang, audience, content_json,
              pdf_path, released_at, signed_by)
-- released_at and signed_by are NULL in student v1

-- Student feedback
case_feedback (id, case_id, final_diagnosis_icd, confirmation,
               verdict, notes)
-- verdict: correct | partial | wrong

-- Full audit trail
case_audit_log (id, case_id, actor_id, action, at, ip_hash)
```

**RLS:** A case is readable only by its `owner_id`. No reviewer access in v1.

### 8.3 API routes

| Method | Route | Purpose |
|---|---|---|
| POST | `/api/case-lab/cases` | Create case with consent and history |
| POST | `/api/case-lab/cases/:id/uploads` | Get signed upload URLs for images/documents |
| POST | `/api/case-lab/cases/:id/extract` | Start OCR on documents (queues case_jobs row) |
| PATCH | `/api/case-lab/cases/:id/values` | Confirm or correct extracted values |
| POST | `/api/case-lab/cases/:id/analyze` | Run quality gate, red-flag screen, full analysis |
| GET | `/api/case-lab/cases/:id` | Status, analysis and report |
| POST | `/api/case-lab/cases/:id/report` | Generate report (lang, audience) |
| POST | `/api/case-lab/cases/:id/feedback` | Record verdict and final diagnosis |

### 8.4 Model output contract (JSON schema)

```json
{
  "urgency": { "level": "urgent|emergency|routine", "triggers": ["..."] },
  "image_quality": { "pass": true, "issues": [] },
  "findings": {
    "morphology": "...", "colour": "...", "border": "...",
    "size_cm": [0, 0], "distribution": "...", "secondary": []
  },
  "problem_representation": "...",
  "differential": [
    {
      "condition": "...", "icd10": "...", "probability": 0.0,
      "for": ["..."], "against": ["..."],
      "fp_lookalikes": ["..."], "discriminator": "...",
      "cant_miss": false
    }
  ],
  "cant_miss": [{ "condition": "...", "action": "exclude with ..." }],
  "missing_information": ["..."],
  "workup": ["..."],
  "management_direction": ["..."],
  "referral": { "specialty": null, "timeframe": null },
  "learning": {
    "discriminating_features": ["..."],
    "exam_tips": ["..."],
    "linked_question_categories": ["..."]
  },
  "abstain": false,
  "agreement": 0.0,
  "prompt_version": "caselab-v1.0"
}
```

### 8.5 OCR worker (Python — `ocr-worker/`)

```
ocr-worker/
  main.py           ← FastAPI app, Supabase Realtime subscription on case_jobs
  pipeline.py       ← pdftoppm → OpenCV → Tesseract → GPT-4o fallback → parse
  Dockerfile
  fly.toml          ← me-central region, 1 shared CPU, 512 MB RAM
  requirements.txt  ← fastapi, supabase, pytesseract, opencv-python, pdf2image, openai
```

Job lifecycle: `pending` → `processing` → `done` | `failed`. Retry up to 3 times. Timeout: 120 s per document.

### 8.6 Navigation addition

- Add `caseLab` entry to `navItems` in `AppSidebar.tsx`
- Icon: `FlaskConical` from lucide-react
- Localization keys: `nav.caseLab` (EN: "Case Lab", AR: "مختبر الحالات")
- Route: `localePath(lang, "/case-lab")`

---

## 9. Safety guardrails

- Educational disclaimer on every screen and every PDF export.
- Red-flag screen runs before the differential and cannot be suppressed.
- No drug doses in any output; management direction is guideline-level only.
- Quality gate must pass before any AI opinion is produced.
- Abstention is a first-class outcome, not an error state.
- EXIF stripped; face blur offered on upload.
- Images stored only in private Supabase bucket with short-lived signed URLs.
- OpenAI called under zero-data-retention agreement.
- Prohibited scope in v1: children under 2, genital images, eye emergencies, burns triage, psychiatric assessment → return "out of scope, seek in-person care".

---

## 10. UI pages

```
src/app/[lang]/(app)/case-lab/
  page.tsx                   ← My Cases list + New Case button
  new/
    page.tsx                 ← Multi-step wizard
      Step 1: Consent screen
      Step 2: Image upload (body map, quality check, face blur)
      Step 3: History form
      Step 4: Document upload + OCR confirmation table
      Step 5: Commit-first (student writes their differential)
      Step 6: Analysis progress (streamed status)
      Step 7: Report view
  [id]/
    page.tsx                 ← Report view + PDF export + Ask Tutor
    feedback/
      page.tsx               ← Close the loop (verdict + final diagnosis)
```

Analysis progress steps streamed to UI:
1. Checking image quality…
2. Reading documents…
3. Screening for urgent findings…
4. Describing image findings…
5. Reasoning (run 1/3, 2/3, 3/3)…
6. Second-opinion review…
7. Calibrating confidence…
8. Generating report…

---

## 11. Out of scope for v1

- Clinician mode (licence confirmation, sign-off, patient summary release)
- Reviewer queue and feedback-to-evaluation-set pipeline
- DICOM / CT / MRI / X-ray reading
- Pathology slides, ECG waveforms, fundus grading
- pgvector knowledge retrieval (guideline snippets) — confidence calibration uses model self-consistency only in v1
- React PDF Arabic shaping — PDF export is English-only in v1
- Longitudinal patient records (follow-up comparison)
- Validation set metrics dashboard
