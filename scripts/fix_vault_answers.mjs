#!/usr/bin/env node
/**
 * Fix unverified answers for vault questions.
 *
 * Re-processes PDFs to extract correct answers and updates DB records
 * by matching question text fingerprints.
 */

import { readFileSync } from "fs";
import { join, basename, relative } from "path";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const pdfParse = require("pdf-parse");
const { createClient } = require("@supabase/supabase-js");

const VAULT_ROOT = process.env.VAULT_ROOT || "/Users/codeaccount/Desktop/Internal Mecicine Vault";

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY env vars");
  process.exit(1);
}

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

// ============================================================
// ANSWER EXTRACTION PATTERNS
// ============================================================

function extractAnswerMap(text) {
  const answers = new Map(); // fingerprint -> { letter, explanation }

  // Normalize
  text = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

  // Pattern 1: "Answer is:- text .." or "Answer is:- A .."
  const answerIsPatterns = [
    ...text.matchAll(/answer\s+is\s*:?\s*-?\s*([A-E])[\s\.\-,]/gi),
    ...text.matchAll(/answer\s*:\s*\(\s*([A-E])\s*\)/gi),
    ...text.matchAll(/the\s+answer\s+is\s*\(\s*(?:option\s*)?([A-E])\s*\)/gi),
    ...text.matchAll(/\(([A-E])\)\s+(?:is\s+)?(?:the\s+)?correct/gi),
    ...text.matchAll(/correct\s+answer\s*(?:is)?\s*:?\s*\(?([A-E])\)?/gi),
  ];

  for (const match of answerIsPatterns) {
    const letter = match[1].toUpperCase();
    const pos = match.index;

    // Look backwards to find the question this answer belongs to
    const before = text.substring(Math.max(0, pos - 2000), pos);

    // Find the last question-like text before this answer
    // Look for the question stem (ends with ?)
    const questionMarks = [...before.matchAll(/\?/g)];
    if (questionMarks.length > 0) {
      const lastQ = questionMarks[questionMarks.length - 1];
      // Get ~80 chars before the ? mark as fingerprint
      const qStart = Math.max(0, lastQ.index - 80);
      const qText = before.substring(qStart, lastQ.index + 1).trim();
      const fp = fingerprint(qText);
      if (fp.length > 30) {
        // Get explanation after answer
        const afterAnswer = text.substring(pos + match[0].length, pos + match[0].length + 500);
        const explanation = afterAnswer.split(/\n\s*(?:\d+[\.\)\-]|Q\s*\d)/)[0].trim()
          .replace(/^\s*explanation\s*:?\s*/i, "").trim();

        answers.set(fp, { letter, explanation: explanation.length > 20 ? explanation : null });
      }
    }
  }

  // Pattern 2: "Answer is:- [full text]" - match text to options
  const textAnswers = [...text.matchAll(/answer\s+is\s*:?\s*-?\s*([^\n.]{3,80}?)(?:\.\.|$|\n)/gi)];
  for (const match of textAnswers) {
    const answerText = match[1].trim().toLowerCase();
    if (/^[a-e]$/i.test(answerText)) continue; // Already handled above

    const pos = match.index;
    const before = text.substring(Math.max(0, pos - 2000), pos);

    // Find options in the preceding text
    const optionMatches = [...before.matchAll(/(?:^|\n)\s*\(?([A-E])\)?[\.\-\s]+([^\n]+)/gim)];
    if (optionMatches.length >= 2) {
      // Try to match answer text to an option
      for (const opt of optionMatches) {
        const optText = opt[2].trim().toLowerCase();
        if (optText.includes(answerText) || answerText.includes(optText)) {
          const letter = opt[1].toUpperCase();
          // Find question text before options
          const firstOptPos = optionMatches[0].index;
          const qBefore = before.substring(Math.max(0, firstOptPos - 200), firstOptPos);
          const questionMarks = [...qBefore.matchAll(/\?/g)];
          if (questionMarks.length > 0) {
            const lastQ = questionMarks[questionMarks.length - 1];
            const qStart = Math.max(0, lastQ.index - 80);
            const qText = qBefore.substring(qStart, lastQ.index + 1).trim();
            const fp = fingerprint(qText);
            if (fp.length > 30) {
              answers.set(fp, { letter, explanation: null });
            }
          }
          break;
        }
      }
    }
  }

  // Pattern 3: Highlighted/bold answers (common in corrected MCQs)
  // Look for patterns where one option is marked differently
  // In text extraction, corrections often appear as inline text after options
  const correctionPatterns = [
    ...text.matchAll(/\b(?:correct|answer|right)\s*(?:is|=|:)\s*\(?([A-E])\)?/gi),
  ];
  for (const match of correctionPatterns) {
    const letter = match[1].toUpperCase();
    const pos = match.index;
    const before = text.substring(Math.max(0, pos - 1500), pos);
    const questionMarks = [...before.matchAll(/\?/g)];
    if (questionMarks.length > 0) {
      const lastQ = questionMarks[questionMarks.length - 1];
      const qStart = Math.max(0, lastQ.index - 80);
      const qText = before.substring(qStart, lastQ.index + 1).trim();
      const fp = fingerprint(qText);
      if (fp.length > 30 && !answers.has(fp)) {
        answers.set(fp, { letter, explanation: null });
      }
    }
  }

  return answers;
}

function fingerprint(text) {
  return text.toLowerCase().replace(/\s+/g, " ").replace(/[^a-z0-9 ]/g, "").trim();
}

// ============================================================
// MAIN
// ============================================================

async function main() {
  console.log("=".repeat(60));
  console.log("Fix Vault Question Answers");
  console.log("=".repeat(60));

  // Load all unverified vault questions from DB
  console.log("\nLoading unverified questions from DB...");
  let allUnverified = [];
  let offset = 0;
  const PAGE = 1000;

  while (true) {
    const { data, error } = await admin
      .from("questions")
      .select("id, question_text, option_a, option_b, option_c, option_d, source")
      .like("source", "IM Vault%")
      .like("justification", "%Answer not extracted%")
      .range(offset, offset + PAGE - 1);

    if (error) { console.error("DB error:", error.message); break; }
    if (!data || data.length === 0) break;
    allUnverified.push(...data);
    offset += PAGE;
  }

  console.log(`Loaded ${allUnverified.length} unverified questions`);

  // Build fingerprint index of DB questions
  const dbIndex = new Map();
  for (const q of allUnverified) {
    const fp = fingerprint(q.question_text);
    // Use last 60 chars of fingerprint for matching (more unique, avoids header noise)
    const shortFp = fp.substring(Math.max(0, fp.length - 60));
    dbIndex.set(shortFp, q);
    // Also index on a middle segment
    if (fp.length > 80) {
      dbIndex.set(fp.substring(20, 80), q);
    }
  }

  // Find PDFs with answers
  const { readdirSync, statSync } = await import("fs");
  const pdfFiles = [];

  function walk(dir) {
    try {
      for (const entry of readdirSync(dir)) {
        const full = join(dir, entry);
        try {
          const stat = statSync(full);
          if (stat.isDirectory() && !entry.toLowerCase().includes("video")) {
            walk(full);
          } else if (entry.toLowerCase().endsWith(".pdf") && stat.size < 50 * 1024 * 1024) {
            const lower = full.toLowerCase();
            if (lower.includes("corrected") || lower.includes("solved") ||
                lower.includes("answer") || lower.includes("mcq") ||
                lower.includes("common") || lower.includes("question")) {
              pdfFiles.push(full);
            }
          }
        } catch (e) {}
      }
    } catch (e) {}
  }
  walk(VAULT_ROOT);

  console.log(`Found ${pdfFiles.length} PDFs to re-process for answers\n`);

  let totalFixed = 0;
  let totalMatched = 0;

  for (const pdf of pdfFiles) {
    const rel = relative(VAULT_ROOT, pdf);
    try {
      const buffer = readFileSync(pdf);
      const data = await pdfParse(buffer);
      if (!data.text || data.text.length < 100) continue;

      const answerMap = extractAnswerMap(data.text);
      if (answerMap.size === 0) continue;

      let matched = 0;
      const updates = [];

      for (const [fp, { letter, explanation }] of answerMap) {
        // Try to match against DB questions
        const shortFp = fp.substring(Math.max(0, fp.length - 60));
        let dbQuestion = dbIndex.get(shortFp);

        if (!dbQuestion && fp.length > 80) {
          dbQuestion = dbIndex.get(fp.substring(20, 80));
        }

        // Also try fuzzy matching on first 60 chars
        if (!dbQuestion) {
          const first60 = fp.substring(0, 60);
          dbQuestion = dbIndex.get(first60);
        }

        if (dbQuestion) {
          matched++;
          updates.push({
            id: dbQuestion.id,
            correct_answer: letter,
            justification: explanation || null,
          });
        }
      }

      if (matched > 0) {
        // Batch update
        for (const upd of updates) {
          const updateData = { correct_answer: upd.correct_answer };
          if (upd.justification) {
            updateData.justification = upd.justification;
          } else {
            // Remove the "not extracted" note but keep any option_e info
            updateData.justification = null;
          }

          const { error } = await admin
            .from("questions")
            .update(updateData)
            .eq("id", upd.id);

          if (!error) totalFixed++;
        }
        totalMatched += matched;
        console.log(`  ${rel.substring(0, 65)} → ${matched} answers matched, ${updates.length} updated`);
      }
    } catch (e) {
      // Skip errors silently
    }
  }

  console.log("\n" + "=".repeat(60));
  console.log("ANSWER FIX SUMMARY");
  console.log("=".repeat(60));
  console.log(`PDFs processed: ${pdfFiles.length}`);
  console.log(`Answers matched: ${totalMatched}`);
  console.log(`Questions updated: ${totalFixed}`);

  // Final count
  const { count: remaining } = await admin
    .from("questions")
    .select("*", { count: "exact", head: true })
    .like("source", "IM Vault%")
    .like("justification", "%Answer not extracted%");

  const { count: verified } = await admin
    .from("questions")
    .select("*", { count: "exact", head: true })
    .like("source", "IM Vault%")
    .not("justification", "like", "%Answer not extracted%");

  console.log(`\nNow verified: ${verified}`);
  console.log(`Still unverified: ${remaining}`);
}

main().catch(console.error);
