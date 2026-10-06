# Passboard

Private-access medical licensing exam preparation platform. Practice questions, understand every answer, and learn with an AI tutor built for clinical reasoning.

**Live:** [passboard.ai](https://passboard.ai)

---

## What it is

Passboard is a focused study platform for medical licensing exams (SMLE, SDLE, SPLE, USMLE, PLAB, MCCQE, AMC MCQ). It provides:

- **Question bank** — 980+ hand-curated MCQs across 19 specialties, with full clinical rationale and per-option explanations
- **Practice sessions** — filter by specialty, topic, exam type, and difficulty
- **Mock exams** — timed 50 or 100-question exams, optionally filtered by specialty
- **AI tutor** — conversational tutor powered by GPT-4o, context-aware per question
- **Mistake review** — questions you got wrong resurface automatically
- **Progress tracking** — accuracy by specialty and topic

Access is private — users apply via the request-access form and are approved manually.

---

## Tech stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Database & Auth | Supabase (Postgres + Row Level Security) |
| AI | OpenAI GPT-4o via `/api/ai/chat` |
| Deployment | Vercel |
| i18n | Arabic + English (custom dictionary system) |

---

## Project structure

```
src/
├── app/
│   ├── [lang]/               # All pages under locale prefix (/en, /ar)
│   │   ├── (app)/            # Authenticated app shell
│   │   │   ├── dashboard/
│   │   │   ├── practice/
│   │   │   ├── questions/
│   │   │   ├── mock-exams/
│   │   │   ├── tutor/
│   │   │   ├── mistakes/
│   │   │   ├── performance/
│   │   │   └── admin/
│   │   ├── login/
│   │   ├── request-access/
│   │   ├── privacy/
│   │   ├── terms/
│   │   └── page.tsx          # Landing page
│   └── api/
│       ├── practice/         # questions, submit, filters
│       ├── mock-exams/       # create, submit, questions
│       ├── ai/               # chat, conversations, messages
│       └── admin/            # questions, students, access-requests
├── components/
│   └── landing/              # Nav, Hero, StatsBand, Exams, Platform, Testimonials, Cta, Footer
├── dictionaries/
│   ├── en.ts
│   └── ar.ts
├── lib/
│   ├── i18n.ts               # Dictionary type + getDictionary()
│   └── supabase/             # server.ts + client.ts
└── types/
    └── database.ts
scripts/
├── extract_questions_v2.py   # GPT-4o vision extraction from PDF → CSV
└── import_csvs.py            # Bulk CSV → Supabase importer
```

---

## Local development

### Prerequisites

- Node.js 20+
- A Supabase project with the schema applied
- An OpenAI API key

### Setup

```bash
git clone <repo>
cd Passboard
npm install
```

Create `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://<project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
OPENAI_API_KEY=<openai-key>
OPENAI_MODEL=gpt-4o
```

Or pull from Vercel:

```bash
vercel env pull --environment development .env.local
```

### Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Question extraction pipeline

Questions are extracted from Amedex 2025 PDF exam books using GPT-4o Vision.

```bash
# Extract a specialty folder (contains zips of PDFs)
python3 scripts/extract_questions_v2.py <drive_folder> <output_csv_dir> [specialty_filter]

# Import CSVs into Supabase
python3 scripts/import_csvs.py
```

The extractor:
1. Converts PDF pages to images via `pdftoppm`
2. Classifies pages (question / answer / explanation) with Tesseract OCR
3. Groups pages into question triplets
4. Sends each group to GPT-4o Vision for structured extraction
5. Outputs one CSV per specialty

---

## Deployment

Deployed automatically via Vercel on push to `main`.

To deploy manually:

```bash
vercel --prod
```

Environment variables are managed in the Vercel dashboard. The following are required in production:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `OPENAI_API_KEY`
- `OPENAI_MODEL`

---

## Database

Supabase (Postgres) with RLS enabled. Key tables:

| Table | Purpose |
|---|---|
| `profiles` | User access status, expiry |
| `questions` | Question bank (status: draft / published / archived) |
| `question_attempts` | Per-user answer history |
| `mock_exams` | Mock exam sessions |
| `mock_exam_questions` | Questions assigned to a mock exam |
| `ai_conversations` | AI tutor conversation threads |
| `ai_messages` | Individual messages per conversation |
| `access_requests` | Waitlist / access request submissions |

---

## i18n

All UI text lives in `src/dictionaries/en.ts` and `src/dictionaries/ar.ts`. The `Dictionary` type in `src/lib/i18n.ts` enforces the shape across both locales. Arabic uses RTL layout via `dir="rtl"` on root elements.
