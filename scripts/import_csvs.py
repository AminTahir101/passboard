#!/usr/bin/env python3
"""
Import all completed CSVs from /tmp/passboard_csvs_v2/ into Supabase.
Uses the service role key — bypasses auth, inserts as published.
"""

import csv
import json
import os
import sys
import urllib.request
import urllib.error

SUPABASE_URL = "https://bcvegyedcqyblozvjyco.supabase.co"
SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJjdmVneWVkY3F5YmxvenZqeWNvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTMzNDA5NywiZXhwIjoyMDk0OTEwMDk3fQ.xzJGU7S-F1hXZ66kFG8EwotRRIoPFGlDU0CqZMm-8gA"
CSV_DIR = "/tmp/passboard_csvs_v2"
BATCH_SIZE = 50

HEADERS = {
    "apikey": SERVICE_ROLE_KEY,
    "Authorization": f"Bearer {SERVICE_ROLE_KEY}",
    "Content-Type": "application/json",
    "Prefer": "return=minimal",
}

def supabase_insert(rows):
    url = f"{SUPABASE_URL}/rest/v1/questions"
    data = json.dumps(rows).encode("utf-8")
    req = urllib.request.Request(url, data=data, headers=HEADERS, method="POST")
    try:
        with urllib.request.urlopen(req) as resp:
            return resp.status, None
    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8")
        return e.code, body

def parse_csv(path):
    rows = []
    with open(path, newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for r in reader:
            row = {
                "question_text": r.get("question_text", "").strip(),
                "option_a": r.get("option_a", "").strip(),
                "option_b": r.get("option_b", "").strip(),
                "option_c": r.get("option_c", "").strip(),
                "option_d": r.get("option_d", "").strip(),
                "correct_answer": r.get("correct_answer", "").strip().upper(),
                "justification": r.get("justification", "").strip() or None,
                "explanation_a": r.get("explanation_a", "").strip() or None,
                "explanation_b": r.get("explanation_b", "").strip() or None,
                "explanation_c": r.get("explanation_c", "").strip() or None,
                "explanation_d": r.get("explanation_d", "").strip() or None,
                "exam": r.get("exam", "").strip() or None,
                "category": r.get("category", "").strip() or None,
                "topic": r.get("topic", "").strip() or None,
                "subtopic": r.get("subtopic", "").strip() or None,
                "difficulty": r.get("difficulty", "medium").strip().lower() or "medium",
                "year": int(r["year"]) if r.get("year", "").strip().isdigit() else None,
                "source": r.get("source", "").strip() or None,
                "status": "published",
            }
            if row["question_text"] and row["correct_answer"] in ("A", "B", "C", "D"):
                rows.append(row)
    return rows

def main():
    csv_files = sorted(f for f in os.listdir(CSV_DIR) if f.endswith(".csv"))
    if not csv_files:
        print("No CSV files found.")
        sys.exit(1)

    total_imported = 0
    total_failed = 0

    for fname in csv_files:
        path = os.path.join(CSV_DIR, fname)
        specialty = fname.replace(".csv", "").replace("_", " ")
        rows = parse_csv(path)
        if not rows:
            print(f"[SKIP] {specialty}: no valid rows")
            continue

        imported = 0
        failed = 0
        for i in range(0, len(rows), BATCH_SIZE):
            batch = rows[i:i + BATCH_SIZE]
            status, err = supabase_insert(batch)
            if status in (200, 201):
                imported += len(batch)
            else:
                failed += len(batch)
                print(f"  [ERROR] batch {i//BATCH_SIZE + 1}: HTTP {status} — {err[:200] if err else ''}")

        mark = "✓" if failed == 0 else "⚠"
        print(f"{mark} {specialty}: {imported} imported, {failed} failed (total in file: {len(rows)})")
        total_imported += imported
        total_failed += failed

    print(f"\n{'='*50}")
    print(f"TOTAL: {total_imported} imported, {total_failed} failed")

if __name__ == "__main__":
    main()
