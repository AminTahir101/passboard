import OpenAI from "openai";
import type { Question } from "@/types/database";

let client: OpenAI | null = null;

function getOpenAI(): OpenAI {
  if (!client) {
    client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      timeout: 30000,
    });
  }
  return client;
}

export const TUTOR_SYSTEM_PROMPT = `You are Passboard AI, an educational medical licensing exam tutor.

Your purpose is to help students understand medical concepts and prepare for professional licensing examinations.

When discussing a specific question:
- Use the stored correct answer and justification as your primary source
- Explain clearly why the correct answer is right
- Explain why the other options are incorrect
- Highlight high-yield learning points for the exam

Teaching approach:
- Teach rather than just give short answers
- Use clinical reasoning
- Connect concepts to exam-relevant patterns
- Be clear, structured, and educational

Response format:
- Lead with the key concept or explanation
- Follow with clinical reasoning when appropriate
- End with a memorable exam tip when helpful

Always:
- Be honest if information is uncertain
- Do not invent citations
- Keep responses focused and educational

Note: Passboard is an independent educational platform, not affiliated with any licensing authority.`;

export function buildQuestionContext(question: Question): string {
  const lines = [
    `QUESTION CONTEXT:`,
    `Question: ${question.question_text}`,
    `A) ${question.option_a}`,
    `B) ${question.option_b}`,
    `C) ${question.option_c}`,
    `D) ${question.option_d}`,
    `Correct Answer: ${question.correct_answer}`,
  ];

  if (question.justification) {
    lines.push(`Justification: ${question.justification}`);
  }
  if (question.explanation_a) lines.push(`Why A: ${question.explanation_a}`);
  if (question.explanation_b) lines.push(`Why B: ${question.explanation_b}`);
  if (question.explanation_c) lines.push(`Why C: ${question.explanation_c}`);
  if (question.explanation_d) lines.push(`Why D: ${question.explanation_d}`);
  if (question.category) lines.push(`Category: ${question.category}`);
  if (question.topic) lines.push(`Topic: ${question.topic}`);
  if (question.source) lines.push(`Source: ${question.source}`);

  return lines.join("\n");
}

export async function generateChatResponse(
  messages: Array<{ role: "user" | "assistant" | "system"; content: string }>,
  question?: Question | null
): Promise<string> {
  const openai = getOpenAI();
  const model = process.env.OPENAI_MODEL || "gpt-4o";

  const systemMessages: Array<{ role: "system"; content: string }> = [
    { role: "system", content: TUTOR_SYSTEM_PROMPT },
  ];

  if (question) {
    systemMessages.push({
      role: "system",
      content: buildQuestionContext(question),
    });
  }

  const response = await openai.chat.completions.create({
    model,
    messages: [...systemMessages, ...messages],
    max_tokens: 1024,
    temperature: 0.7,
  });

  return response.choices[0]?.message?.content || "I was unable to generate a response. Please try again.";
}
