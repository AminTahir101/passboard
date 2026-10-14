import OpenAI from "openai";
import type { ChatCompletionContentPart } from "openai/resources/chat/completions";
import {
  SYSTEM_FINDINGS,
  SYSTEM_RED_FLAG,
  SYSTEM_DIFFERENTIAL,
  SYSTEM_REVIEWER,
  SYSTEM_CALIBRATOR,
} from "./prompts";
import {
  FINDINGS_SCHEMA,
  RED_FLAG_SCHEMA,
  DIFFERENTIAL_SCHEMA,
  REVIEWER_SCHEMA,
  CALIBRATOR_SCHEMA,
} from "./schema";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function structuredCall<T>(
  system: string,
  userContent: ChatCompletionContentPart[],
  schema: Record<string, unknown>,
  name: string,
  temperature = 0.2,
): Promise<T> {
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    temperature,
    response_format: {
      type: "json_schema",
      json_schema: { name, strict: true, schema },
    },
    messages: [
      { role: "system", content: system },
      { role: "user", content: userContent },
    ],
  });
  return JSON.parse(response.choices[0].message.content ?? "{}") as T;
}

export type CaseInput = {
  signedImageUrls: string[];
  history: Record<string, string>;
  confirmedLabValues: string;
};

export type AnalysisOutput = {
  urgency: { level: string; triggers: string[] };
  image_quality: { pass: boolean; issues: string[] };
  findings: Record<string, unknown>;
  problem_representation: string;
  differential: unknown[];
  cant_miss: { condition: string; action: string }[];
  missing_information: string[];
  workup: string[];
  management_direction: string[];
  referral: { specialty: string | null; timeframe: string | null };
  learning: { discriminating_features: string[]; exam_tips: string[]; linked_question_categories: string[] };
  abstain: boolean;
  agreement: number;
  prompt_version: string;
};

function text(content: string): ChatCompletionContentPart {
  return { type: "text", text: content };
}

function imageUrl(url: string): ChatCompletionContentPart {
  return { type: "image_url", image_url: { url, detail: "high" } };
}

export async function runCaseAnalysis(input: CaseInput): Promise<AnalysisOutput> {
  const imageContent = input.signedImageUrls.map(imageUrl);

  const historyText = Object.entries(input.history)
    .filter(([, v]) => v)
    .map(([k, v]) => `${k}: ${v}`)
    .join("\n");

  // Step 1 — Image findings
  const findings = await structuredCall<Record<string, unknown>>(
    SYSTEM_FINDINGS,
    [...imageContent, text(`Patient history:\n${historyText}`)],
    FINDINGS_SCHEMA as Record<string, unknown>,
    "image_findings",
    0.2,
  );

  if (!findings.quality_pass) {
    return {
      urgency: { level: "routine", triggers: [] },
      image_quality: { pass: false, issues: [String(findings.quality_issue ?? "Quality check failed")] },
      findings: {},
      problem_representation: "",
      differential: [],
      cant_miss: [],
      missing_information: [],
      workup: [],
      management_direction: [],
      referral: { specialty: null, timeframe: null },
      learning: { discriminating_features: [], exam_tips: [], linked_question_categories: [] },
      abstain: true,
      agreement: 0,
      prompt_version: "caselab-v1.0",
    };
  }

  const findingsText = JSON.stringify(findings, null, 2);

  // Step 2 — Red flag
  const urgency = await structuredCall<{ level: string; triggers: string[] }>(
    SYSTEM_RED_FLAG,
    [text(`Image findings:\n${findingsText}\n\nPatient history:\n${historyText}`)],
    RED_FLAG_SCHEMA as Record<string, unknown>,
    "red_flag",
    0.1,
  );

  // Step 3 — Differential x3 (parallel)
  const reasoningContext = `Image findings:\n${findingsText}\n\nPatient history:\n${historyText}\n\nConfirmed lab values:\n${input.confirmedLabValues || "None"}\n\nUrgency: ${urgency.level}`;

  const [run1, run2, run3] = await Promise.all(
    [1, 2, 3].map((n) =>
      structuredCall<Record<string, unknown>>(
        SYSTEM_DIFFERENTIAL(n),
        [text(reasoningContext)],
        DIFFERENTIAL_SCHEMA as Record<string, unknown>,
        "differential",
        0.7,
      )
    )
  );

  // Step 4 — Reviewer
  const reviewer = await structuredCall<{
    agrees_with_top: boolean;
    alternative_condition: string | null;
    argument_for_alternative: string | null;
    discriminating_finding: string | null;
  }>(
    SYSTEM_REVIEWER,
    [text(`Run 1: ${JSON.stringify(run1.differential)}\nRun 2: ${JSON.stringify(run2.differential)}\nRun 3: ${JSON.stringify(run3.differential)}`)],
    REVIEWER_SCHEMA as Record<string, unknown>,
    "reviewer",
    0.3,
  );

  // Step 5 — Calibrate
  const calibrated = await structuredCall<{
    agreement: number;
    abstain: boolean;
    final_differential: unknown[];
  }>(
    SYSTEM_CALIBRATOR,
    [text(`Run 1: ${JSON.stringify(run1)}\nRun 2: ${JSON.stringify(run2)}\nRun 3: ${JSON.stringify(run3)}\nReviewer: ${JSON.stringify(reviewer)}`)],
    CALIBRATOR_SCHEMA as Record<string, unknown>,
    "calibrator",
    0.1,
  );

  // Use run1 as the source of the rich output fields, since all three use the same schema
  const base = run1 as {
    problem_representation: string;
    cant_miss: { condition: string; action: string }[];
    missing_information: string[];
    workup: string[];
    management_direction: string[];
    referral: { specialty: string | null; timeframe: string | null };
    learning: { discriminating_features: string[]; exam_tips: string[]; linked_question_categories: string[] };
  };

  return {
    urgency,
    image_quality: { pass: true, issues: [] },
    findings,
    problem_representation: base.problem_representation,
    differential: calibrated.final_differential,
    cant_miss: base.cant_miss,
    missing_information: base.missing_information,
    workup: base.workup,
    management_direction: base.management_direction,
    referral: base.referral,
    learning: base.learning,
    abstain: calibrated.abstain,
    agreement: calibrated.agreement,
    prompt_version: "caselab-v1.0",
  };
}
