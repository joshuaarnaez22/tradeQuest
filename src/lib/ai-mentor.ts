import { generateText } from "ai";
import { deepseek } from "@ai-sdk/deepseek";
import type { Decision } from "@/db/schema";

// PRD §9, non-negotiable: never "advice" anywhere in-product, never phrased
// as personalized guidance/confidence/psychology. Enforced in the prompt
// itself, not just filtered after the fact.
const SYSTEM_PROMPT = `You are a trading-chart reading coach for a practice app. Explain in exactly 1-2 short sentences why a user's Buy/Sell/Wait call on a historical candlestick chart was correct or incorrect.

Rules, never break these:
- Never use the word "advice" in any form.
- Never phrase this as personalized guidance, a recommendation, or a confidence score.
- Never include psychology commentary about the user.
- Talk about the price pattern itself (highs, lows, trend, range), not the user.
- Output only the explanation text, no preamble.`;

export async function generateExplanation(params: {
  setupNote: string;
  decision: Decision;
  isCorrect: boolean;
  forwardReturnPct: number;
}): Promise<string | null> {
  if (!process.env.DEEPSEEK_API_KEY) return null;

  try {
    const { text } = await generateText({
      model: deepseek(process.env.AI_MENTOR_MODEL ?? "deepseek-chat"),
      system: SYSTEM_PROMPT,
      prompt: [
        `Setup: ${params.setupNote}`,
        `User's call: ${params.decision}`,
        `Result: ${params.isCorrect ? "correct" : "incorrect"}`,
        `Forward return: ${params.forwardReturnPct.toFixed(1)}%`,
      ].join("\n"),
    });
    // Second safety net beyond the system prompt — a cheap check, not a
    // substitute for it. Falls back to the client's deterministic text
    // (already guaranteed advice-free) rather than trying to edit model output.
    if (/advice/i.test(text)) {
      console.warn("AI Mentor explanation dropped for containing 'advice'");
      return null;
    }
    return text.trim();
  } catch (err) {
    console.error("AI Mentor explanation failed:", err);
    return null;
  }
}
