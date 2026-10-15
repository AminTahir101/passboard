#!/usr/bin/env node
/**
 * Import extracted vault questions into Supabase
 *
 * Reads the extracted_questions.json and batch-inserts into the questions table.
 * Handles schema constraints (option_c/option_d NOT NULL) and option_e gracefully.
 *
 * Usage:
 *   node scripts/import_vault_questions.mjs [--dry-run] [--batch-size N]
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY env vars");
  process.exit(1);
}

const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const INPUT_FILE = "/Users/codeaccount/Passboard/scripts/extracted_questions.json";

async function checkOptionESupport() {
  const { error } = await admin.from("questions").select("option_e").limit(1);
  return !error;
}

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes("--dry-run");
  const batchSizeIdx = args.indexOf("--batch-size");
  const BATCH_SIZE = batchSizeIdx >= 0 ? parseInt(args[batchSizeIdx + 1]) : 50;

  console.log("=".repeat(60));
  console.log("Import Vault Questions → Supabase");
  console.log("=".repeat(60));
  console.log(`Mode: ${dryRun ? "DRY RUN" : "LIVE IMPORT"}`);
  console.log(`Batch size: ${BATCH_SIZE}`);
  console.log();

  // Check if option_e column exists
  const hasOptionE = await checkOptionESupport();
  console.log(`option_e support: ${hasOptionE ? "YES" : "NO (will merge into justification)"}`);

  // Load extracted questions
  const raw = JSON.parse(readFileSync(INPUT_FILE, "utf8"));
  console.log(`Loaded ${raw.length} questions from extraction\n`);

  // Check for existing questions to avoid duplicates
  console.log("Checking for existing questions...");
  const { data: existing, error: fetchErr } = await admin
    .from("questions")
    .select("question_text")
    .limit(10000);

  if (fetchErr) {
    console.error("Error fetching existing questions:", fetchErr.message);
    // Continue anyway
  }

  const existingFingerprints = new Set(
    (existing || []).map((q) =>
      q.question_text.toLowerCase().replace(/\s+/g, " ").substring(0, 100)
    )
  );
  console.log(`Found ${existingFingerprints.size} existing questions in DB\n`);

  // Prepare questions for import
  const toImport = [];
  let skippedExisting = 0;
  let skippedInvalid = 0;

  for (const q of raw) {
    // Check for duplicate
    const fp = q.question_text.toLowerCase().replace(/\s+/g, " ").substring(0, 100);
    if (existingFingerprints.has(fp)) {
      skippedExisting++;
      continue;
    }

    // Validate minimum fields
    if (!q.question_text || q.question_text.length < 20) {
      skippedInvalid++;
      continue;
    }
    if (!q.option_a || !q.option_b) {
      skippedInvalid++;
      continue;
    }

    // Handle option_c NOT NULL constraint
    const option_c = q.option_c || "None of the above";
    // Handle option_d NOT NULL constraint
    const option_d = q.option_d || (q.option_c ? "All of the above" : "None of the above");

    // Build the record
    const record = {
      question_text: q.question_text,
      option_a: q.option_a,
      option_b: q.option_b,
      option_c: option_c,
      option_d: option_d,
      correct_answer: q.correct_answer || "A", // Default to A if unknown
      justification: q.justification || null,
      exam: q.exam || null,
      category: q.category || null,
      topic: q.topic || null,
      subtopic: q.subtopic || null,
      difficulty: q.difficulty || "medium",
      year: q.year || null,
      source: q.source || null,
      status: "draft",
    };

    // Handle option_e
    if (q.option_e) {
      if (hasOptionE) {
        record.option_e = q.option_e;
      } else {
        // Append to justification
        const eNote = `[Option E: ${q.option_e}]`;
        record.justification = record.justification
          ? `${record.justification} ${eNote}`
          : eNote;
      }
    }

    // Track if answer was unknown
    if (!q.correct_answer) {
      const note = "[Answer not extracted from source - needs verification]";
      record.justification = record.justification
        ? `${record.justification} ${note}`
        : note;
    }

    toImport.push(record);
  }

  console.log(`Questions to import: ${toImport.length}`);
  console.log(`Skipped (duplicates): ${skippedExisting}`);
  console.log(`Skipped (invalid): ${skippedInvalid}`);
  console.log();

  if (dryRun) {
    console.log("DRY RUN - no changes made");
    console.log("\nSample record:");
    console.log(JSON.stringify(toImport[0], null, 2));
    return;
  }

  // Batch import
  let imported = 0;
  let failed = 0;

  for (let i = 0; i < toImport.length; i += BATCH_SIZE) {
    const batch = toImport.slice(i, i + BATCH_SIZE);
    const { error } = await admin.from("questions").insert(batch);

    if (error) {
      console.error(`Batch ${i}-${i + batch.length} FAILED: ${error.message}`);
      failed += batch.length;

      // Try inserting one by one to find the problematic record
      if (batch.length > 1) {
        for (const record of batch) {
          const { error: singleErr } = await admin.from("questions").insert(record);
          if (singleErr) {
            failed++;
            // Skip silently unless verbose
          } else {
            imported++;
          }
        }
        failed -= batch.length; // Already counted
      }
    } else {
      imported += batch.length;
      if ((imported % 500 === 0) || i + BATCH_SIZE >= toImport.length) {
        console.log(`Progress: ${imported}/${toImport.length} imported (${failed} failed)`);
      }
    }
  }

  console.log("\n" + "=".repeat(60));
  console.log("IMPORT COMPLETE");
  console.log("=".repeat(60));
  console.log(`Successfully imported: ${imported}`);
  console.log(`Failed: ${failed}`);
  console.log(`Total in DB: ~${existingFingerprints.size + imported}`);

  // Print category breakdown of imported questions
  const catCounts = {};
  for (const q of toImport.slice(0, imported)) {
    catCounts[q.category] = (catCounts[q.category] || 0) + 1;
  }
  console.log("\nImported by Category:");
  for (const [cat, count] of Object.entries(catCounts).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${cat}: ${count}`);
  }
}

main().catch(console.error);
