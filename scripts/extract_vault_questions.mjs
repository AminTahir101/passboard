#!/usr/bin/env node
/**
 * Internal Medicine Vault → Passboard Question Extraction Script
 *
 * Extracts MCQs from PDF files in the vault, categorizes them based on
 * folder structure, and outputs structured JSON for database import.
 *
 * Usage:
 *   node scripts/extract_vault_questions.mjs [--dry-run] [--limit N] [--verbose]
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from "fs";
import { join, basename, dirname, relative } from "path";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const pdfParse = require("pdf-parse");

const VAULT_ROOT = "/Users/codeaccount/Desktop/Internal Mecicine Vault";
const OUTPUT_FILE = "/Users/codeaccount/Passboard/scripts/extracted_questions.json";

// ============================================================
// CATEGORY MAPPING - uses folder segment matching (whole segments)
// ============================================================

function detectCategoryFromPath(relPath) {
  const lower = relPath.toLowerCase();
  // Split on / and also on common delimiters in filenames
  const segments = lower.split(/[\/\\]/);
  const fileName = segments[segments.length - 1].replace(".pdf", "");

  // Check each path segment for category keywords
  // Order matters - more specific matches first
  for (const seg of segments) {
    // Exact folder name matches
    if (seg === "cardiology" || seg.startsWith("cardio ") || seg === "cvs")
      return { category: "Cardiology" };
    if (seg === "endocrinology" || seg.startsWith("endo ") || seg === "endo")
      return { category: "Endocrinology" };
    if (seg === "gastroenterology" || seg.startsWith("gastro ") || seg === "gastro")
      return { category: "Gastroenterology" };
    if (seg === "nephrology" || seg.startsWith("nephro ") || seg === "nephro")
      return { category: "Nephrology" };
    if (seg === "neurology" || seg.startsWith("neuro ") || seg === "neuro")
      return { category: "Neurology" };
    if (seg === "pulmonology" || seg.startsWith("pulmo") || seg === "pulmocritical" || seg.includes("pulmonary"))
      return { category: "Pulmonology" };
    if (seg === "rheumatology" || seg === "rhumatology" || seg === "rehumatology" || seg.startsWith("rheum") || seg.startsWith("rhuma"))
      return { category: "Rheumatology" };
    if (seg === "hematology" || seg.startsWith("hema ") || seg === "hema" || seg === "hem-onc" || seg.includes("hematology"))
      return { category: "Hematology & Oncology" };
    if (seg === "oncology")
      return { category: "Hematology & Oncology" };
    if (seg === "infectious diseases" || seg === "id" || seg.startsWith("infectious"))
      return { category: "Infectious Diseases" };
    if (seg === "dermatology")
      return { category: "Dermatology" };
    if (seg === "ophthalmology")
      return { category: "Ophthalmology" };
    if (seg === "psychiatry" || seg.includes("psychiatric"))
      return { category: "Psychiatry" };
    if (seg === "surgery" || seg.includes("surgical"))
      return { category: "Surgery" };
    if (seg === "pediatrics")
      return { category: "Pediatrics" };
    if (seg === "pharmacology")
      return { category: "Pharmacology" };
    if (seg === "pathology")
      return { category: "Pathology" };
    if (seg === "biochemistry")
      return { category: "Biochemistry" };
    if (seg === "genetics")
      return { category: "Genetics" };
    if (seg === "immunology")
      return { category: "Immunology" };
    if (seg === "microbiology")
      return { category: "Microbiology" };
    if (seg === "anatomy" || seg.includes("anatomy"))
      return { category: "Anatomy" };
    if (seg === "physiology")
      return { category: "Physiology" };
    if (seg.includes("biostatistics") || seg.includes("epidemiology"))
      return { category: "Biostatistics & Epidemiology" };
    if (seg.includes("ear, nose") || seg === "ent")
      return { category: "ENT" };
    if (seg === "im" || seg === "gim" || seg.includes("general internal"))
      return { category: "General Internal Medicine" };
    if (seg === "emergency")
      return { category: "Emergency Medicine" };
    if (seg.includes("family medicine"))
      return { category: "Family Medicine" };
    if (seg.includes("obstetrics") || seg.includes("gynecology"))
      return { category: "Obstetrics & Gynecology" };
    if (seg.includes("poisoning") || seg.includes("environmental"))
      return { category: "Toxicology" };
    if (seg.includes("social") || seg.includes("ethics"))
      return { category: "Medical Ethics" };
    if (seg.includes("radiology") || seg.includes("radiograph"))
      return { category: "Radiology" };
    if (seg.includes("cardiovascular"))
      return { category: "Cardiology" };
    if (seg.includes("nervous system"))
      return { category: "Neurology" };
    if (seg.includes("renal") || seg.includes("urinary"))
      return { category: "Nephrology" };
    if (seg.includes("female reproductive") || seg.includes("male reproductive") || seg.includes("pregnancy"))
      return { category: "Obstetrics & Gynecology" };
    if (seg.includes("gastrointestinal"))
      return { category: "Gastroenterology" };
    if (seg.includes("endocrine") || seg.includes("diabetes"))
      return { category: "Endocrinology" };
  }

  // Check filename for category keywords
  if (fileName.includes("cardio")) return { category: "Cardiology" };
  if (fileName.includes("endo") && !fileName.includes("endos")) return { category: "Endocrinology" };
  if (fileName.includes("gastro")) return { category: "Gastroenterology" };
  if (fileName.includes("nephro")) return { category: "Nephrology" };
  if (fileName.includes("neuro")) return { category: "Neurology" };
  if (fileName.includes("pulmo")) return { category: "Pulmonology" };
  if (fileName.includes("rheum") || fileName.includes("rhuma")) return { category: "Rheumatology" };
  if (fileName.includes("hema") || fileName.includes("hem-onc")) return { category: "Hematology & Oncology" };
  if (fileName.startsWith("id ") || fileName.includes("infectious")) return { category: "Infectious Diseases" };
  if (fileName.includes("dm ") || fileName.includes("diabetes")) return { category: "Endocrinology" };
  if (fileName.includes("gim ") || fileName.includes("general internal") || fileName.includes("internal medicine")) return { category: "General Internal Medicine" };

  return { category: "Internal Medicine" };
}

function getExamType(relPath) {
  const lower = relPath.toLowerCase();
  if (lower.includes("part 1 sbim") || lower.includes("part 1 exam") || lower.includes("part i"))
    return "SBIM Part 1";
  if (lower.includes("part 2 sbim") || lower.includes("part 2 exam") || lower.includes("part 2 written") || lower.includes("part ii"))
    return "SBIM Part 2";
  if (lower.includes("uworld"))
    return "USMLE (UWorld)";
  if (lower.includes("usmle"))
    return "USMLE";
  if (lower.includes("pretest"))
    return "PreTest";
  if (lower.includes("mccqe") || lower.includes("canada"))
    return "MCCQE";
  if (lower.includes("passmedicine"))
    return "PassMedicine";
  if (lower.includes("mksap"))
    return "MKSAP";
  if (lower.includes("guardian"))
    return "Guardian QBank";
  if (lower.includes("kfsh") || lower.includes("board review") || lower.includes("elaf"))
    return "SBIM Board Review";
  if (lower.includes("hybr"))
    return "SBIM Part 2";
  return "Internal Medicine";
}

function getSourceInfo(relPath) {
  const yearMatch = relPath.match(/\b(20[12]\d)\b/);
  const year = yearMatch ? parseInt(yearMatch[1]) : null;
  const fileName = basename(relPath, ".pdf");
  return { year, source: `IM Vault - ${fileName}` };
}

// ============================================================
// MCQ PARSING — IMPROVED
// ============================================================

function parseQuestions(text, relPath) {
  if (!text || text.trim().length < 50) return [];

  // Normalize text
  text = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

  // Remove duplicate content (PowerPoint PDFs often duplicate question+answer slides)
  text = removeDuplicateBlocks(text);

  const questions = [];
  const { category } = detectCategoryFromPath(relPath);
  const exam = getExamType(relPath);
  const { year, source } = getSourceInfo(relPath);

  // Try the answer-block strategy first (most reliable)
  let parsed = parseByAnswerBlocks(text);
  if (!parsed || parsed.length === 0) {
    parsed = parseByNumberedBlocks(text);
  }
  if (!parsed || parsed.length === 0) {
    parsed = parseByOptionGroups(text);
  }

  for (const q of parsed || []) {
    if (!q.question_text || q.question_text.length < 20) continue;
    if (!q.option_a || !q.option_b || !q.option_c) continue;

    questions.push({
      question_text: clean(q.question_text),
      option_a: clean(q.option_a),
      option_b: clean(q.option_b),
      option_c: clean(q.option_c),
      option_d: q.option_d ? clean(q.option_d) : null,
      option_e: q.option_e ? clean(q.option_e) : null,
      correct_answer: q.correct_answer || null,
      justification: q.justification ? clean(q.justification) : null,
      exam,
      category,
      topic: null,
      subtopic: null,
      difficulty: "medium",
      year,
      source,
      status: "draft",
    });
  }

  return questions;
}

function clean(text) {
  if (!text) return text;
  return text.replace(/\s+/g, " ").replace(/^\s+|\s+$/g, "").replace(/\u0000/g, "");
}

function removeDuplicateBlocks(text) {
  // PowerPoint PDFs often have the question duplicated on the answer slide
  // We keep the first occurrence
  const lines = text.split("\n");
  const seen = new Set();
  const result = [];
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.length > 80 && seen.has(trimmed)) {
      continue; // Skip exact duplicate long lines
    }
    if (trimmed.length > 80) seen.add(trimmed);
    result.push(line);
  }
  return result.join("\n");
}

// Strategy 1: Parse by answer patterns (Answer: (X), The answer is (Option X), Answer is:- text)
function parseByAnswerBlocks(text) {
  const answerPatterns = [
    /answer\s*:\s*\(\s*([A-E])\s*\)\s*(.*?)(?=\n|$)/gi,
    /the\s+answer\s+is\s*\(\s*option\s*([A-E])\s*\)/gi,
    /the\s+answer\s+is\s*\(\s*([A-E])\s*\)/gi,
    /\(([A-E])\)\s+(?:is\s+)?(?:the\s+)?correct(?:\s+answer)?/gi,
    /answer\s+is\s*:\s*-?\s*([A-E])[\s\.\-]/gi,
  ];

  // Find all answer positions
  const answers = [];
  for (const pattern of answerPatterns) {
    for (const match of text.matchAll(pattern)) {
      answers.push({
        letter: (match[1]).toUpperCase(),
        pos: match.index,
        length: match[0].length,
      });
    }
  }

  if (answers.length === 0) return null;

  // Sort by position
  answers.sort((a, b) => a.pos - b.pos);

  // Deduplicate answers that are close together
  const dedupedAnswers = [answers[0]];
  for (let i = 1; i < answers.length; i++) {
    if (answers[i].pos - dedupedAnswers[dedupedAnswers.length - 1].pos > 50) {
      dedupedAnswers.push(answers[i]);
    }
  }

  const questions = [];

  for (let i = 0; i < dedupedAnswers.length; i++) {
    const answer = dedupedAnswers[i];

    // The question text is somewhere before the answer
    const prevEnd = i > 0 ? dedupedAnswers[i - 1].pos + dedupedAnswers[i - 1].length : 0;
    const questionBlock = text.substring(prevEnd, answer.pos).trim();

    // The explanation is after the answer until the next question
    const nextStart = i + 1 < dedupedAnswers.length ? dedupedAnswers[i + 1].pos : text.length;
    // Try to find just the explanation part (between this answer and next question)
    let explanationBlock = text.substring(answer.pos + answer.length, nextStart).trim();

    // Extract the question and options from the block
    const q = extractQuestionAndOptions(questionBlock);
    if (q) {
      q.correct_answer = answer.letter;

      // Clean up explanation - remove any subsequent question text
      if (explanationBlock) {
        // Remove lines that look like the start of a new question
        explanationBlock = explanationBlock.split(/\n\s*(?:Q?\s*\d+[\.\)\-:\s])/i)[0].trim();
        // Remove "Explanation:" prefix
        explanationBlock = explanationBlock.replace(/^\s*explanation\s*:\s*/i, "").trim();
        if (explanationBlock.length > 20) {
          q.justification = explanationBlock;
        }
      }

      questions.push(q);
    }
  }

  return questions.length > 0 ? questions : null;
}

// Strategy 2: Parse by numbered question blocks
function parseByNumberedBlocks(text) {
  // Split text at question number boundaries
  const parts = text.split(/\n\s*(?:Q\s*)?(\d{1,3})\s*[\.\)\-:]\s*(?:\n|(?=[A-Z]))/i);

  if (parts.length < 3) {
    // Try alternative: split on lines starting with a number
    const altParts = text.split(/(?:^|\n)(\d{1,3})[\.\)\-]\s+/m);
    if (altParts.length >= 3) {
      return processNumberedParts(altParts);
    }
    return null;
  }

  return processNumberedParts(parts);
}

function processNumberedParts(parts) {
  const questions = [];

  // parts alternates: [preamble, num, content, num, content, ...]
  for (let i = 1; i < parts.length; i += 2) {
    const content = parts[i + 1];
    if (!content) continue;

    // Try to find answer in the content or after it
    let answerLetter = null;
    let justification = null;

    // Check for answer pattern within the content
    const answerMatch = content.match(
      /answer\s*:\s*\(\s*([A-E])\s*\)|the\s+answer\s+is\s*\(\s*(?:option\s*)?([A-E])\s*\)/i
    );
    if (answerMatch) {
      answerLetter = (answerMatch[1] || answerMatch[2]).toUpperCase();
      const afterAnswer = content.substring(
        answerMatch.index + answerMatch[0].length
      ).trim();
      if (afterAnswer.length > 20) {
        justification = afterAnswer.replace(/^\s*explanation\s*:\s*/i, "").trim();
      }
    }

    // Extract question and options from just the question part
    const questionPart = answerMatch
      ? content.substring(0, answerMatch.index)
      : content;
    const q = extractQuestionAndOptions(questionPart);
    if (q) {
      q.correct_answer = answerLetter;
      q.justification = justification;
      questions.push(q);
    }
  }

  return questions.length > 0 ? questions : null;
}

// Strategy 3: Find option groups (A/B/C/D patterns) and work backwards for question text
function parseByOptionGroups(text) {
  // Find groups of options
  const optionGroupRegex =
    /(?:^|\n)\s*\(?A\)?[\.\-\s]+.+(?:\n\s*\(?B\)?[\.\-\s]+.+)(?:\n\s*\(?C\)?[\.\-\s]+.+)(?:\n\s*\(?D\)?[\.\-\s]+.+)?/gim;
  const matches = [...text.matchAll(optionGroupRegex)];

  if (matches.length === 0) return null;

  const questions = [];

  for (let i = 0; i < matches.length; i++) {
    const optionBlock = matches[i][0];
    const optionStart = matches[i].index;

    // Question text is before the options
    const prevEnd = i > 0 ? matches[i - 1].index + matches[i - 1][0].length : 0;
    const questionText = text.substring(prevEnd, optionStart).trim();

    // Clean up question text - remove headers, numbers, etc.
    const cleanedQ = questionText
      .replace(/^.*?((?:A\s+\d+|An?\s+\d+|\d+[\-\.]\s*A|Which|What|How|Where|When|Who|The\s+most).)/is, "$1")
      .trim();

    if (cleanedQ.length < 20) continue;

    // Extract options
    const options = extractOptions(optionBlock);
    if (!options || !options.A || !options.B || !options.C) continue;

    // Look for answer after options
    const afterOptions = matches[i].index + matches[i][0].length;
    const nextQ = i + 1 < matches.length ? matches[i + 1].index : text.length;
    const afterBlock = text.substring(afterOptions, nextQ).trim();

    let correctAnswer = null;
    let justification = null;

    const answerMatch = afterBlock.match(
      /answer\s*:\s*\(\s*([A-E])\s*\)|the\s+answer\s+is\s*\(\s*(?:option\s*)?([A-E])\s*\)/i
    );
    if (answerMatch) {
      correctAnswer = (answerMatch[1] || answerMatch[2]).toUpperCase();
      const explanation = afterBlock.substring(answerMatch.index + answerMatch[0].length).trim();
      if (explanation.length > 20) {
        justification = explanation.replace(/^\s*explanation\s*:\s*/i, "").trim();
      }
    }

    questions.push({
      question_text: cleanedQ,
      option_a: options.A,
      option_b: options.B,
      option_c: options.C,
      option_d: options.D || null,
      option_e: options.E || null,
      correct_answer: correctAnswer,
      justification,
    });
  }

  return questions.length > 0 ? questions : null;
}

// Extract question text and options from a text block
function extractQuestionAndOptions(block) {
  if (!block || block.length < 30) return null;

  // Remove leading whitespace, numbers, Q prefix
  block = block.replace(/^\s*Q?\s*\d*[\.\)\-:\s]*/i, "").trim();

  // Find where options start
  const optionStart = findOptionStart(block);
  if (optionStart < 0) return null;

  const questionText = block.substring(0, optionStart).trim();
  const optionsText = block.substring(optionStart).trim();

  if (questionText.length < 20) return null;

  const options = extractOptions(optionsText);
  if (!options || !options.A || !options.B || !options.C) return null;

  return {
    question_text: questionText,
    option_a: options.A,
    option_b: options.B,
    option_c: options.C,
    option_d: options.D || null,
    option_e: options.E || null,
    correct_answer: null,
    justification: null,
  };
}

function findOptionStart(text) {
  // Look for the first option pattern
  const patterns = [
    /(?:^|\n)\s*\(?A\)?[\.\-\s]+/im,
    /(?:^|\n)\s*[•\-\*]\s*\(?A\)?[\.\-\s]*/im,
    /(?:^|\n)\s*A[\.\-]\s+/m,
  ];

  for (const p of patterns) {
    const m = text.match(p);
    if (m) return m.index;
  }

  return -1;
}

function extractOptions(text) {
  const options = {};
  const lines = text.split("\n");

  for (const line of lines) {
    const trimmed = line.trim();
    // Match various option formats
    const m = trimmed.match(
      /^[•\-\*]?\s*\(?([A-E])\)?[\.\-\s]+(.+)/i
    );
    if (m) {
      options[m[1].toUpperCase()] = m[2].trim();
    }
  }

  // If line-by-line didn't work, try regex on full text
  if (!options.A) {
    const fullMatch = [...text.matchAll(
      /\(?([A-E])\)?[\.\-\s]+([^\n]+)/gi
    )];
    for (const m of fullMatch) {
      const letter = m[1].toUpperCase();
      if (!options[letter]) {
        options[letter] = m[2].trim();
      }
    }
  }

  return Object.keys(options).length >= 3 ? options : null;
}

// ============================================================
// FILE DISCOVERY
// ============================================================

function findQuestionPDFs(dir) {
  const pdfs = [];
  const questionKeywords = [
    "mcq", "question", "qbank", "quiz", "recall", "mock",
    "pretest", "corrected", "common", "guardian", "uworld",
    "solved", "exam ", " exam", "booklet",
  ];

  function walk(currentDir) {
    try {
      const entries = readdirSync(currentDir);
      for (const entry of entries) {
        const fullPath = join(currentDir, entry);
        try {
          const stat = statSync(fullPath);
          if (stat.isDirectory()) {
            // Skip directories that don't contain questions
            const skipDirs = ["videos", "video", "academic activity lectures",
              "morning meeting", "master rota", "kfsh-b schedules",
              "physical examinations", "oncall guide", "summaries",
              "topics presentations", "medical books", "topics summaries"];
            if (skipDirs.includes(entry.toLowerCase())) continue;
            // Skip history-taking and similar non-MCQ directories
            if (entry.toLowerCase().includes("history-taking")) continue;
            walk(fullPath);
          } else if (entry.toLowerCase().endsWith(".pdf") && !entry.startsWith(".")) {
            const lower = fullPath.toLowerCase();
            const fileName = entry.toLowerCase();
            const isQuestion = questionKeywords.some((kw) => lower.includes(kw));
            const inQuestionDir =
              lower.includes("questions bank") ||
              lower.includes("question booklet") ||
              lower.includes("old exams") ||
              lower.includes("mcqs bank") ||
              lower.includes("progress test") ||
              lower.includes("common mcqs") ||
              lower.includes("common questions") ||
              lower.includes("old mcqs") ||
              lower.includes("elaf course qs");

            // Exclude non-question files
            const isExcluded =
              lower.includes("radiograph") ||
              lower.includes("schedule") ||
              lower.includes("wifi") ||
              lower.includes("links") ||
              lower.includes("rota") ||
              lower.includes("booklet_") ||
              lower.includes("handout") ||
              lower.includes("summary") ||
              lower.includes("clinical examination") ||
              lower.includes("history taking") ||
              lower.includes("hx and exam") ||
              lower.includes("collection map") ||
              lower.includes("topics.jpg") ||
              lower.includes("answer key") || // Answer keys without questions
              lower.includes("oncall") ||
              fileName === "internal medicine booklet_.pdf" ||
              fileName === "important links.pdf" ||
              fileName === "board rules and regulations_.pdf";

            if ((isQuestion || inQuestionDir) && !isExcluded) {
              if (stat.size < 50 * 1024 * 1024) {
                pdfs.push(fullPath);
              }
            }
          }
        } catch (e) {}
      }
    } catch (e) {}
  }

  walk(dir);
  return pdfs;
}

// ============================================================
// MAIN
// ============================================================

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes("--dry-run");
  const verbose = args.includes("--verbose");
  const limitIdx = args.indexOf("--limit");
  const limit = limitIdx >= 0 ? parseInt(args[limitIdx + 1]) : Infinity;

  console.log("=".repeat(60));
  console.log("Internal Medicine Vault → Passboard Question Extractor");
  console.log("=".repeat(60));
  console.log(`Vault: ${VAULT_ROOT}`);
  console.log(`Mode: ${dryRun ? "DRY RUN" : "EXTRACT"}`);
  console.log();

  const pdfs = findQuestionPDFs(VAULT_ROOT).slice(0, limit);
  console.log(`Found ${pdfs.length} question-containing PDFs\n`);

  const allQuestions = [];
  const stats = {
    totalPDFs: pdfs.length,
    processedPDFs: 0,
    failedPDFs: 0,
    totalQuestions: 0,
    withAnswers: 0,
    withExplanations: 0,
    byCategory: {},
    byExam: {},
  };

  for (const pdf of pdfs) {
    const relPath = relative(VAULT_ROOT, pdf);
    const shortPath = relPath.length > 70 ? relPath.substring(0, 67) + "..." : relPath;
    process.stdout.write(`  ${shortPath} `);

    try {
      const buffer = readFileSync(pdf);
      const data = await pdfParse(buffer);
      const text = data.text;

      if (!text || text.trim().length < 50) {
        console.log("→ SKIP (no text)");
        stats.failedPDFs++;
        continue;
      }

      const questions = parseQuestions(text, relPath);
      if (questions.length === 0) {
        console.log("→ SKIP (0 MCQs)");
        stats.failedPDFs++;
        continue;
      }

      allQuestions.push(...questions);
      stats.processedPDFs++;
      stats.totalQuestions += questions.length;

      const withAns = questions.filter((q) => q.correct_answer).length;
      const withExp = questions.filter((q) => q.justification).length;
      stats.withAnswers += withAns;
      stats.withExplanations += withExp;

      for (const q of questions) {
        stats.byCategory[q.category] = (stats.byCategory[q.category] || 0) + 1;
        stats.byExam[q.exam] = (stats.byExam[q.exam] || 0) + 1;
      }

      console.log(`→ ${questions.length} Qs (${withAns} answered, ${withExp} explained)`);

      if (verbose && questions.length > 0) {
        const q = questions[0];
        console.log(`    Sample: "${q.question_text.substring(0, 80)}..."`);
        console.log(`    Category: ${q.category} | Exam: ${q.exam} | Answer: ${q.correct_answer || "N/A"}`);
      }
    } catch (err) {
      console.log(`→ ERROR: ${err.message.substring(0, 60)}`);
      stats.failedPDFs++;
    }
  }

  // Post-processing: try to extract answers from "Answer is:- text" patterns
  console.log("\nPost-processing: resolving text-based answers...");
  let resolvedAnswers = 0;
  for (const q of allQuestions) {
    if (q.correct_answer) continue;
    // Check if justification or question_text contains "Answer is:- text"
    const fullText = (q.justification || "") + " " + (q.question_text || "");
    const textAnswerMatch = fullText.match(
      /answer\s+is\s*:?\s*-?\s*(.+?)(?:\.\.|$)/i
    );
    if (textAnswerMatch) {
      const ansText = textAnswerMatch[1].trim().toLowerCase();
      // Try to match against options
      const opts = [
        { letter: "A", text: q.option_a },
        { letter: "B", text: q.option_b },
        { letter: "C", text: q.option_c },
        { letter: "D", text: q.option_d },
        { letter: "E", text: q.option_e },
      ].filter(o => o.text);

      for (const opt of opts) {
        if (opt.text.toLowerCase().includes(ansText) ||
            ansText.includes(opt.text.toLowerCase())) {
          q.correct_answer = opt.letter;
          if (!q.justification) q.justification = textAnswerMatch[1].trim();
          resolvedAnswers++;
          break;
        }
      }
    }
  }
  console.log(`Resolved ${resolvedAnswers} additional answers from text`);

  // Deduplication pass
  console.log("\nDeduplicating questions...");
  const seen = new Set();
  const uniqueQuestions = [];
  for (const q of allQuestions) {
    // Create a fingerprint from question text (first 100 chars normalized)
    const fp = q.question_text.toLowerCase().replace(/\s+/g, " ").substring(0, 100);
    if (!seen.has(fp)) {
      seen.add(fp);
      uniqueQuestions.push(q);
    }
  }
  const dupes = allQuestions.length - uniqueQuestions.length;

  console.log("\n" + "=".repeat(60));
  console.log("EXTRACTION SUMMARY");
  console.log("=".repeat(60));
  console.log(`PDFs processed:    ${stats.processedPDFs}/${stats.totalPDFs}`);
  console.log(`PDFs skipped:      ${stats.failedPDFs}`);
  console.log(`Raw questions:     ${stats.totalQuestions}`);
  console.log(`Duplicates removed: ${dupes}`);
  console.log(`Unique questions:  ${uniqueQuestions.length}`);
  console.log(`With answers:      ${stats.withAnswers}`);
  console.log(`With explanations: ${stats.withExplanations}`);
  console.log();
  console.log("By Category:");
  for (const [cat, count] of Object.entries(stats.byCategory).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${cat}: ${count}`);
  }
  console.log();
  console.log("By Exam:");
  for (const [exam, count] of Object.entries(stats.byExam).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${exam}: ${count}`);
  }

  if (!dryRun) {
    writeFileSync(OUTPUT_FILE, JSON.stringify(uniqueQuestions, null, 2));
    console.log(`\nSaved ${uniqueQuestions.length} questions to: ${OUTPUT_FILE}`);
  }
}

main().catch(console.error);
