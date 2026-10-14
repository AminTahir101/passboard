// JSON schemas for GPT-4o structured outputs

export const FINDINGS_SCHEMA = {
  type: "object",
  properties: {
    quality_pass: { type: "boolean" },
    quality_issue: { type: "string" },
    morphology: { type: "string" },
    colour: { type: "string" },
    border: { type: "string" },
    size_cm: { type: "array", items: { type: "number" }, maxItems: 2 },
    distribution: { type: "string" },
    configuration: { type: "string" },
    secondary_changes: { type: "array", items: { type: "string" } },
  },
  required: ["quality_pass"],
  additionalProperties: false,
};

const DIFFERENTIAL_ITEM = {
  type: "object",
  properties: {
    condition: { type: "string" },
    icd10: { type: "string" },
    probability: { type: "number" },
    for: { type: "array", items: { type: "string" } },
    against: { type: "array", items: { type: "string" } },
    fp_lookalikes: { type: "array", items: { type: "string" } },
    discriminator: { type: "string" },
    cant_miss: { type: "boolean" },
  },
  required: ["condition", "icd10", "probability", "for", "against", "fp_lookalikes", "discriminator", "cant_miss"],
  additionalProperties: false,
};

export const DIFFERENTIAL_SCHEMA = {
  type: "object",
  properties: {
    problem_representation: { type: "string" },
    differential: { type: "array", items: DIFFERENTIAL_ITEM, minItems: 1, maxItems: 5 },
    cant_miss: {
      type: "array",
      items: {
        type: "object",
        properties: { condition: { type: "string" }, action: { type: "string" } },
        required: ["condition", "action"],
        additionalProperties: false,
      },
    },
    missing_information: { type: "array", items: { type: "string" } },
    workup: { type: "array", items: { type: "string" } },
    management_direction: { type: "array", items: { type: "string" } },
    referral: {
      type: "object",
      properties: {
        specialty: { type: ["string", "null"] },
        timeframe: { type: ["string", "null"] },
      },
      required: ["specialty", "timeframe"],
      additionalProperties: false,
    },
    learning: {
      type: "object",
      properties: {
        discriminating_features: { type: "array", items: { type: "string" } },
        exam_tips: { type: "array", items: { type: "string" } },
        linked_question_categories: { type: "array", items: { type: "string" } },
      },
      required: ["discriminating_features", "exam_tips", "linked_question_categories"],
      additionalProperties: false,
    },
    abstain: { type: "boolean" },
  },
  required: [
    "problem_representation", "differential", "cant_miss",
    "missing_information", "workup", "management_direction",
    "referral", "learning", "abstain",
  ],
  additionalProperties: false,
};

export const RED_FLAG_SCHEMA = {
  type: "object",
  properties: {
    level: { type: "string", enum: ["emergency", "urgent", "routine"] },
    triggers: { type: "array", items: { type: "string" } },
  },
  required: ["level", "triggers"],
  additionalProperties: false,
};

export const REVIEWER_SCHEMA = {
  type: "object",
  properties: {
    agrees_with_top: { type: "boolean" },
    alternative_condition: { type: ["string", "null"] },
    argument_for_alternative: { type: ["string", "null"] },
    discriminating_finding: { type: ["string", "null"] },
  },
  required: ["agrees_with_top", "alternative_condition", "argument_for_alternative", "discriminating_finding"],
  additionalProperties: false,
};

export const CALIBRATOR_SCHEMA = {
  type: "object",
  properties: {
    agreement: { type: "number" },
    abstain: { type: "boolean" },
    final_differential: { type: "array", items: DIFFERENTIAL_ITEM },
  },
  required: ["agreement", "abstain", "final_differential"],
  additionalProperties: false,
};
