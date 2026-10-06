#!/usr/bin/env python3
"""
Extract medical questions from Amedex PDF screenshots using GPT-4o Vision.

Strategy:
1. Convert PDF pages to images
2. Use fast OCR to classify pages (question / answer / explanation)
3. Group pages into question triplets
4. Send key pages to GPT-4o for accurate structured extraction
5. Output CSV per specialty

Usage:
  python3 scripts/extract_questions_v2.py <drive_folder> <output_folder> [specialty_keyword]
"""

import os
import re
import csv
import sys
import json
import base64
import zipfile
import tempfile
import subprocess
from pathlib import Path
from PIL import Image
import pytesseract
from openai import OpenAI

# ── OpenAI client ─────────────────────────────────────────────────────────────

OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY", "")
client = OpenAI(api_key=OPENAI_API_KEY)

# ── Page classification ───────────────────────────────────────────────────────

def ocr_page_fast(image_path: str) -> str:
    """Fast OCR scan of a page — used only for page type classification."""
    try:
        img = Image.open(image_path)
        # Resize to speed up OCR (only need rough classification)
        w, h = img.size
        if w > 600:
            scale = 600 / w
            img = img.resize((600, int(h * scale)), Image.LANCZOS)
        return pytesseract.image_to_string(img, config='--psm 6 --oem 1')
    except Exception:
        return ""

PAGE_ANSWER = "answer"
PAGE_EXPLAIN = "explanation"
PAGE_QUESTION = "question"
PAGE_OTHER = "other"

def classify_page(text: str) -> str:
    tl = text.lower()
    # Check explanation first — "Option X is correct" is the most reliable signal
    if re.search(r"option\s+[a-e]\s+is\s+correct", tl):
        return PAGE_EXPLAIN
    if "hide the correct" in tl:
        return PAGE_ANSWER
    if "see the correct option" in tl:
        return PAGE_QUESTION
    return PAGE_OTHER

# ── GPT-4o Vision extraction ──────────────────────────────────────────────────

EXTRACT_PROMPT = """You are extracting a medical exam question from screenshot images of a mobile app (Amedex).

The images show:
1. A question page with the question text and answer options A, B, C, D (sometimes E)
2. An answer page showing which option is correct (marked with ✓) and which are wrong (marked with ✗)
3. An explanation page starting with "Option X Is correct" followed by the explanation text

Extract the following as JSON (no markdown, raw JSON only):
{
  "question_text": "full question text",
  "option_a": "text of option A",
  "option_b": "text of option B",
  "option_c": "text of option C",
  "option_d": "text of option D",
  "correct_answer": "A or B or C or D",
  "justification": "full explanation text (combine if split across pages)"
}

Important rules:
- If there is an option E, ignore it (our system only supports A-D)
- If the correct answer is E, set correct_answer to "" (empty)
- The explanation usually starts with "Option X Is correct" — include all text after that header
- Trim whitespace from all fields
- If you cannot determine a field with confidence, use ""
- Return ONLY the JSON object, no other text"""

def image_to_base64(path: str) -> str:
    """Convert image to base64 string."""
    with open(path, 'rb') as f:
        return base64.b64encode(f.read()).decode('utf-8')

def extract_question_via_gpt4o(image_paths: list[str]) -> dict | None:
    """Send question images to GPT-4o and extract structured data."""
    content = [{"type": "text", "text": EXTRACT_PROMPT}]

    for path in image_paths:
        content.append({
            "type": "image_url",
            "image_url": {
                "url": f"data:image/png;base64,{image_to_base64(path)}",
                "detail": "low"  # Use low detail to reduce tokens/cost
            }
        })

    try:
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[{"role": "user", "content": content}],
            max_tokens=800,
            temperature=0,
        )
        raw = response.choices[0].message.content.strip()
        # Parse JSON
        # Remove markdown code blocks if present
        raw = re.sub(r'^```json?\s*', '', raw)
        raw = re.sub(r'\s*```$', '', raw)
        return json.loads(raw)
    except Exception as e:
        print(f"  GPT-4o error: {e}", file=sys.stderr)
        return None

# ── PDF processing ────────────────────────────────────────────────────────────

def pdf_to_questions(pdf_path: str, category: str, tmp_dir: str) -> list[dict]:
    """Extract all questions from a single PDF using page classification + GPT-4o."""
    pdf_name = os.path.basename(pdf_path)
    print(f"  PDF: {pdf_name}")

    # 1. Convert PDF pages to images at 120 DPI
    page_prefix = os.path.join(tmp_dir, 'p')
    result = subprocess.run(
        ['pdftoppm', '-r', '120', '-png', pdf_path, page_prefix],
        capture_output=True
    )
    if result.returncode != 0:
        print(f"  pdftoppm failed: {result.stderr.decode()}", file=sys.stderr)
        return []

    page_files = sorted([
        os.path.join(tmp_dir, f)
        for f in os.listdir(tmp_dir)
        if f.startswith('p') and f.endswith('.png')
    ])
    total = len(page_files)
    print(f"  {total} pages, classifying...", end='', flush=True)

    # 2. Classify each page via OCR
    # NOTE: "answer" pages (showing correct/wrong markers) are unreliable via OCR
    # because button text is on colored backgrounds. We use EXPLANATION pages
    # as the anchor — they have clean black-on-white "Option X Is correct" text.
    pages = []
    for i, path in enumerate(page_files):
        text = ocr_page_fast(path)
        ptype = classify_page(text)
        pages.append({'path': path, 'type': ptype, 'text': text})
        if (i + 1) % 20 == 0:
            print(f" {i+1}", end='', flush=True)

    print(f" {total} done")

    explain_count = sum(1 for p in pages if p['type'] == PAGE_EXPLAIN)
    print(f"  Explanation pages: {explain_count}")

    # 3. Group pages into questions using EXPLANATION pages as anchors.
    #    For each explanation page at index E:
    #      - Pages from (previous_E + 1) to (E - 1) are question/answer context
    #      - Page E (and possibly E+1 if it's more explanation) = explanation
    #    We send 1-4 context pages + explanation to GPT-4o.
    questions_raw = []
    prev_explain_idx = -1

    for i, page in enumerate(pages):
        if page['type'] != PAGE_EXPLAIN:
            continue

        # Context pages: between previous explanation end and this one
        context_start = prev_explain_idx + 1
        context_end = i  # exclusive

        context_pages = list(range(context_start, context_end))

        # Collect explanation page(s): this page + any immediately following OTHER pages
        # that are likely explanation continuation (substantial text)
        explain_pages = [i]
        k = i + 1
        while k < len(pages) and pages[k]['type'] in (PAGE_OTHER,):
            if len(pages[k]['text'].strip()) > 150:
                explain_pages.append(k)
                k += 1
                break  # Max 1 continuation page for explanation
            else:
                break

        prev_explain_idx = explain_pages[-1]

        # Select which context pages to send to GPT-4o
        # We want: the question text pages + the answer reveal page
        # Typically: last 3-4 context pages contain the answer reveal + question bottom
        # Earlier context pages might have images (ECGs, X-rays) - less useful
        if len(context_pages) == 0:
            # No context — skip (can't extract question without seeing it)
            continue

        # Strategy: send up to 3 context pages + explanation
        # Prefer the LAST context pages (closest to explanation) as they have answer reveal
        selected_context = context_pages[-3:] if len(context_pages) > 3 else context_pages

        send_images = [pages[j]['path'] for j in selected_context]
        send_images += [pages[j]['path'] for j in explain_pages[:1]]  # First explain page only

        questions_raw.append(send_images)

    print(f"  Found {len(questions_raw)} question groups, extracting via GPT-4o...")

    # 4. Extract each question via GPT-4o
    questions = []
    for idx, image_paths in enumerate(questions_raw):
        if not image_paths:
            continue

        result = extract_question_via_gpt4o(image_paths)
        if result:
            # Validate
            q_text = result.get('question_text', '').strip()
            correct = result.get('correct_answer', '').strip().upper()
            opt_a = result.get('option_a', '').strip()
            opt_b = result.get('option_b', '').strip()

            if not q_text or not correct or correct not in 'ABCD' or not opt_a or not opt_b:
                print(f"  [SKIP] Q{idx+1}: invalid data (correct={correct!r}, q={q_text[:40]!r})")
                continue

            row = {
                'question_text': q_text,
                'option_a': opt_a,
                'option_b': opt_b,
                'option_c': result.get('option_c', '').strip(),
                'option_d': result.get('option_d', '').strip(),
                'correct_answer': correct,
                'justification': result.get('justification', '').strip(),
                'explanation_a': '',
                'explanation_b': '',
                'explanation_c': '',
                'explanation_d': '',
                'exam': 'Amedex 2025',
                'category': category,
                'topic': '',
                'subtopic': '',
                'difficulty': 'medium',
                'year': '2025',
                'source': 'Amedex 2025',
            }
            questions.append(row)
            print(f"  ✓ Q{idx+1}: [{correct}] {q_text[:60]}...")
        else:
            print(f"  [FAIL] Q{idx+1}: GPT-4o returned no result")

    print(f"  Extracted {len(questions)} valid questions from {pdf_name}")
    return questions

# ── Specialty map ─────────────────────────────────────────────────────────────

SPECIALTY_MAP = {
    'CVS': 'Cardiovascular',
    'Dermatology': 'Dermatology',
    'ENDO - Breast': 'Endocrinology & Breast',
    'Emergency medicine': 'Emergency Medicine',
    'Ethics': 'Ethics',
    'GIT': 'Gastroenterology',
    'GYNE': 'Gynecology',
    'Hematology': 'Hematology',
    'Immunology': 'Immunology',
    'Infectious diseases': 'Infectious Diseases',
    'Neurology': 'Neurology',
    'Nutrition - Metabolism': 'Nutrition & Metabolism',
    'Obstetrics': 'Obstetrics',
    'Oncology': 'Oncology',
    'Ophthalmology - ENT': 'Ophthalmology & ENT',
    'Orthopaedic - Rheumatology': 'Orthopaedics & Rheumatology',
    'Pediatric': 'Pediatrics',
    'Pharmacology': 'Pharmacology',
    'Psychiatry': 'Psychiatry',
    'Public health': 'Public Health',
    'Respiratory': 'Respiratory',
    'Urology - Neurology': 'Urology & Neurology',
}

CSV_COLUMNS = [
    'question_text', 'option_a', 'option_b', 'option_c', 'option_d',
    'correct_answer', 'justification', 'explanation_a', 'explanation_b',
    'explanation_c', 'explanation_d', 'exam', 'category', 'topic',
    'subtopic', 'difficulty', 'year', 'source',
]

def process_zip(zip_path: str, output_dir: str) -> int:
    """Process a single zip file → CSV. Returns question count."""
    zip_name = os.path.basename(zip_path)

    # Determine specialty
    category = None
    matched_key = None
    for key, cat in SPECIALTY_MAP.items():
        if zip_name.startswith(key):
            category = cat
            matched_key = key
            break
    if not category:
        category = zip_name.split('-2026')[0].split('-2025')[0]

    # Output file
    safe_name = category.replace(' ', '_').replace('&', 'and').replace('/', '_')
    out_path = os.path.join(output_dir, f'{safe_name}.csv')

    # Skip if already done
    if os.path.exists(out_path):
        count = sum(1 for _ in open(out_path)) - 1  # minus header
        print(f"\n[SKIP] {category}: already done ({count} questions in {out_path})")
        return count

    print(f"\n{'='*60}")
    print(f"Specialty: {category}")
    print(f"ZIP: {zip_name}")

    all_questions = []

    with tempfile.TemporaryDirectory() as tmp_root:
        # Extract zip
        with zipfile.ZipFile(zip_path, 'r') as zf:
            zf.extractall(tmp_root)

        # Find all PDFs
        pdfs = sorted(Path(tmp_root).rglob('*.pdf'))
        print(f"PDFs: {[p.name for p in pdfs]}")

        for pdf in pdfs:
            pdf_tmp = tempfile.mkdtemp(dir=tmp_root)
            qs = pdf_to_questions(str(pdf), category, pdf_tmp)
            all_questions.extend(qs)

    if not all_questions:
        print(f"  ⚠ No questions extracted for {category}")
        return 0

    # Write CSV
    with open(out_path, 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=CSV_COLUMNS)
        writer.writeheader()
        writer.writerows(all_questions)

    print(f"\n✓ {category}: {len(all_questions)} questions → {out_path}")
    return len(all_questions)

# ── Main ──────────────────────────────────────────────────────────────────────

def main():
    if len(sys.argv) < 3:
        print(f"Usage: {sys.argv[0]} <drive_folder> <output_folder> [specialty_keyword]")
        sys.exit(1)

    drive_dir = sys.argv[1]
    output_dir = sys.argv[2]
    os.makedirs(output_dir, exist_ok=True)

    filter_kw = sys.argv[3].lower() if len(sys.argv) > 3 else None

    zips = sorted(Path(drive_dir).glob('*.zip'))
    print(f"Found {len(zips)} zip files")
    if filter_kw:
        print(f"Filter: '{filter_kw}'")

    total = 0
    for zp in zips:
        if filter_kw and filter_kw not in zp.name.lower():
            continue
        count = process_zip(str(zp), output_dir)
        total += count

    print(f"\n{'='*60}")
    print(f"TOTAL: {total} questions extracted")
    print(f"Output: {output_dir}")

if __name__ == '__main__':
    main()
