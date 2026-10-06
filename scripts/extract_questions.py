#!/usr/bin/env python3
"""
Extract medical questions from Amedex PDF screenshots and output CSV files.

Format: PDF pages are mobile app screenshots with:
  - Question page: question text + options A-E + "See the correct option" button
  - Answer page: same + ✓/✗ markers + "Hide the correct option"
  - Explanation page: "Option X Is correct" + explanation text

Usage:
  python3 scripts/extract_questions.py /path/to/Drive /output/dir
"""

import os
import re
import csv
import sys
import zipfile
import tempfile
import subprocess
from pathlib import Path
from PIL import Image
import pytesseract

# ── Page classification ──────────────────────────────────────────────────────

def ocr_page(image_path: str) -> str:
    """OCR a page image and return the text."""
    try:
        img = Image.open(image_path)
        text = pytesseract.image_to_string(img, config='--psm 6')
        return text
    except Exception as e:
        print(f"  OCR error on {image_path}: {e}", file=sys.stderr)
        return ""

PAGE_TYPE_ANSWER = "answer"        # Has "Hide the correct option"
PAGE_TYPE_EXPLAIN = "explanation"  # Starts with "Option X is correct"
PAGE_TYPE_QUESTION = "question"    # Has "See the correct option"
PAGE_TYPE_OTHER = "other"          # Cover, images, etc.

def classify_page(text: str) -> str:
    tl = text.lower()
    if "hide the correct option" in tl:
        return PAGE_TYPE_ANSWER
    if re.search(r"option\s+[a-e]\s+(is|Is)\s+correct", text):
        return PAGE_TYPE_EXPLAIN
    if "see the correct option" in tl:
        return PAGE_TYPE_QUESTION
    return PAGE_TYPE_OTHER

# ── Data extraction from pages ───────────────────────────────────────────────

OPTION_LABEL_RE = re.compile(
    r'(?:^|\n)\s*(?:[xX✗✘×•\*]|[vV✓√]\s*)?\s*[(\[]?\s*([A-E])\s*[)\]]?\s*(.+?)(?=\n\s*(?:[xX✗✘×•\*]|[vV✓√]\s*)?\s*[(\[]?\s*[A-E]\s*[)\]]|$)',
    re.DOTALL
)

def extract_options_from_answer_page(text: str) -> dict:
    """
    Parse the answer page to get options A-D(E) and the correct answer.
    Returns dict with keys: option_a..option_e, correct_answer
    """
    options = {}
    correct_answer = None

    lines = text.splitlines()
    # Look for lines that match option pattern:
    # "x ( )A  Aspirin."  or  "v C Reassurance."  or  "vc Reassurance."
    i = 0
    while i < len(lines):
        line = lines[i].strip()
        # Detect checkmark line or combined
        # Pattern: optional (x|v) then optional () then letter then text
        m = re.match(
            r'^([xXvV✓✗×✘]?)\s*[(\[]?\s*[)\]]?\s*([xXvV✓✗×✘]?)\s*[(\[]?\s*([A-E])\s*[)\]]?\s*(.*)$',
            line
        )
        if m:
            marks = (m.group(1) + m.group(2)).lower()
            letter = m.group(3).upper()
            opt_text = m.group(4).strip()
            # Collect continuation lines
            j = i + 1
            while j < len(lines):
                nxt = lines[j].strip()
                if re.match(r'^([xXvV✓✗×✘]?)\s*[(\[]?\s*[)\]]?\s*([xXvV✓✗×✘]?)\s*[(\[]?\s*[A-E]\s*[)\]]?', nxt):
                    break
                if any(k in nxt.lower() for k in ['hide the correct', 'see explanations', 'finish', 'continue later']):
                    break
                if nxt:
                    opt_text += ' ' + nxt
                j += 1
            if letter in 'ABCDE' and opt_text:
                options[f'option_{letter.lower()}'] = opt_text.strip()
                if 'v' in marks or '✓' in marks or '√' in marks:
                    correct_answer = letter
            i = j
        else:
            i += 1

    # Fallback: scan for checkmark pattern more loosely
    if not correct_answer:
        for line in lines:
            m = re.search(r'\bv\s*[(\[]?\s*([A-E])\b', line, re.IGNORECASE)
            if m:
                correct_answer = m.group(1).upper()
                break

    return options, correct_answer

def extract_question_text(pages_text: list[str]) -> str:
    """
    Extract question text from one or more question pages.
    Remove UI chrome (app bar, font size controls, buttons).
    """
    combined = '\n'.join(pages_text)
    lines = combined.splitlines()

    # Remove known UI noise patterns
    NOISE = [
        r'^\d{1,2}:\d{2}$',           # time like "4:18"
        r'^Font Size',
        r'^A\s+A\s+A',                  # Font size controls
        r'See the correct option',
        r'See explanations',
        r'Finish\s*(now)?',
        r'Continue later',
        r'^\s*[◄►▶◀]\s*$',            # navigation arrows
        r'^\s*$',
    ]
    noise_re = re.compile('|'.join(NOISE), re.IGNORECASE)

    question_lines = []
    for line in lines:
        if noise_re.search(line):
            continue
        # Stop when we hit the options section (A B C D radio buttons)
        if re.match(r'^\s*[(\[O]?\s*[OABCDE]\s*[)\]]?\s+\w', line):
            break
        question_lines.append(line)

    return ' '.join(question_lines).strip()

def extract_explanation(pages_text: list[str]) -> str:
    """Extract explanation from explanation page(s)."""
    combined = '\n'.join(pages_text)
    # Remove "Option X is correct" header
    text = re.sub(r'Option\s+[A-E]\s+[Ii]s\s+correct\s*', '', combined, count=1)
    # Remove reference section
    text = re.sub(r'Reference\(s\).*$', '', text, flags=re.DOTALL)
    return text.strip()

# ── Group pages into questions ────────────────────────────────────────────────

def group_pages_into_questions(page_data: list[dict]) -> list[dict]:
    """
    page_data: list of {idx, type, text}
    Returns list of raw question dicts with question_pages, answer_page, explain_pages
    """
    questions = []
    i = 0
    n = len(page_data)

    while i < n:
        page = page_data[i]

        if page['type'] == PAGE_TYPE_ANSWER:
            # Found answer page — collect preceding question pages
            q_pages = []
            j = i - 1
            while j >= 0 and page_data[j]['type'] in (PAGE_TYPE_QUESTION, PAGE_TYPE_OTHER):
                # Stop if we already consumed this page in a previous question
                if page_data[j].get('consumed'):
                    break
                q_pages.insert(0, page_data[j])
                j -= 1
            for p in q_pages:
                p['consumed'] = True

            # Collect explanation pages after answer
            e_pages = []
            k = i + 1
            while k < n and page_data[k]['type'] in (PAGE_TYPE_EXPLAIN, PAGE_TYPE_OTHER):
                if page_data[k]['type'] == PAGE_TYPE_EXPLAIN:
                    e_pages.append(page_data[k])
                    page_data[k]['consumed'] = True
                    k += 1
                    # One explanation page per question usually
                    break
                k += 1

            page['consumed'] = True
            questions.append({
                'question_pages': q_pages,
                'answer_page': page,
                'explain_pages': e_pages,
            })

        i += 1

    return questions

def parse_question(q_group: dict, category: str) -> dict | None:
    """Convert a group of pages into a question row dict."""
    q_pages_text = [p['text'] for p in q_group['question_pages']]
    answer_text = q_group['answer_page']['text']
    e_text = [p['text'] for p in q_group['explain_pages']]

    options, correct_answer = extract_options_from_answer_page(answer_text)

    if not correct_answer:
        return None  # Can't determine correct answer

    if not options.get('option_a') or not options.get('option_b'):
        return None  # Too few options extracted

    # Skip if correct answer is E (not supported by DB schema)
    if correct_answer == 'E':
        correct_answer = None  # Will be flagged as invalid

    question_text = extract_question_text(q_pages_text) if q_pages_text else ""
    if not question_text:
        # Try to get it from the answer page itself
        question_text = extract_question_text([answer_text])

    explanation = extract_explanation(e_text) if e_text else ""

    return {
        'question_text': question_text,
        'option_a': options.get('option_a', ''),
        'option_b': options.get('option_b', ''),
        'option_c': options.get('option_c', ''),
        'option_d': options.get('option_d', ''),
        'correct_answer': correct_answer or '',
        'justification': explanation,
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

# ── PDF processing ────────────────────────────────────────────────────────────

def pdf_to_questions(pdf_path: str, category: str, tmp_dir: str) -> list[dict]:
    """Extract all questions from a single PDF."""
    print(f"  Processing: {os.path.basename(pdf_path)}")

    # Convert PDF pages to images
    page_prefix = os.path.join(tmp_dir, 'page')
    result = subprocess.run(
        ['pdftoppm', '-r', '150', '-png', pdf_path, page_prefix],
        capture_output=True
    )
    if result.returncode != 0:
        print(f"  pdftoppm failed: {result.stderr.decode()}", file=sys.stderr)
        return []

    page_files = sorted([
        f for f in os.listdir(tmp_dir) if f.startswith('page') and f.endswith('.png')
    ])

    print(f"  {len(page_files)} pages, OCR-ing...", end='', flush=True)

    page_data = []
    for i, fname in enumerate(page_files):
        img_path = os.path.join(tmp_dir, fname)
        text = ocr_page(img_path)
        ptype = classify_page(text)
        page_data.append({'idx': i, 'type': ptype, 'text': text, 'consumed': False})
        if (i + 1) % 20 == 0:
            print(f" {i+1}", end='', flush=True)

    print(f" done")

    # Group into questions
    q_groups = group_pages_into_questions(page_data)
    print(f"  Found {len(q_groups)} question groups")

    questions = []
    for g in q_groups:
        row = parse_question(g, category)
        if row and row['question_text'] and row['correct_answer'] in 'ABCD':
            questions.append(row)

    print(f"  Parsed {len(questions)} valid questions")
    return questions

# ── Specialty processing ──────────────────────────────────────────────────────

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
    """Process a single zip file, return number of questions extracted."""
    zip_name = os.path.basename(zip_path)
    # Determine specialty from zip name
    specialty_key = None
    for key in SPECIALTY_MAP:
        if zip_name.startswith(key):
            specialty_key = key
            break
    if not specialty_key:
        # Try fuzzy match
        zip_base = zip_name.split('-2026')[0].split('-2025')[0]
        specialty_key = zip_base
    category = SPECIALTY_MAP.get(specialty_key, specialty_key)

    print(f"\n{'='*60}")
    print(f"Specialty: {category}")
    print(f"ZIP: {zip_name}")

    all_questions = []

    with tempfile.TemporaryDirectory() as tmp_dir:
        # Extract zip
        with zipfile.ZipFile(zip_path, 'r') as zf:
            zf.extractall(tmp_dir)

        # Find all PDFs
        pdfs = sorted(Path(tmp_dir).rglob('*.pdf'))
        print(f"PDFs found: {[p.name for p in pdfs]}")

        for pdf in pdfs:
            pdf_tmp = tempfile.mkdtemp(dir=tmp_dir)
            questions = pdf_to_questions(str(pdf), category, pdf_tmp)
            all_questions.extend(questions)

    if not all_questions:
        print(f"  No questions extracted!")
        return 0

    # Write CSV
    safe_name = category.replace(' ', '_').replace('&', 'and').replace('/', '_')
    out_path = os.path.join(output_dir, f'{safe_name}.csv')
    with open(out_path, 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=CSV_COLUMNS)
        writer.writeheader()
        writer.writerows(all_questions)

    print(f"  ✓ Wrote {len(all_questions)} questions → {out_path}")
    return len(all_questions)

# ── Main ──────────────────────────────────────────────────────────────────────

def main():
    if len(sys.argv) < 3:
        print(f"Usage: {sys.argv[0]} <drive_folder> <output_folder>")
        sys.exit(1)

    drive_dir = sys.argv[1]
    output_dir = sys.argv[2]
    os.makedirs(output_dir, exist_ok=True)

    # Find all zips
    zips = sorted(Path(drive_dir).glob('*.zip'))
    if not zips:
        print(f"No zip files found in {drive_dir}")
        sys.exit(1)

    print(f"Found {len(zips)} zip files")

    # Allow filtering: optional 3rd arg = specialty keyword to process only one
    filter_kw = sys.argv[3].lower() if len(sys.argv) > 3 else None

    total = 0
    for zp in zips:
        if filter_kw and filter_kw not in zp.name.lower():
            continue
        count = process_zip(str(zp), output_dir)
        total += count

    print(f"\n{'='*60}")
    print(f"TOTAL: {total} questions extracted across all specialties")
    print(f"CSVs written to: {output_dir}")

if __name__ == '__main__':
    main()
