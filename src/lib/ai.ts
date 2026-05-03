import "server-only";
import { generateText, Output } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { z } from "zod";

const TOPIC_SLUGS = [
  "model-releases", "product-launches", "agent-workflows", "coding-copilots",
  "rag", "evals", "inference-infra", "safety-policy", "prompt-engineering",
  "developer-tooling", "open-source", "research", "enterprise-ai",
] as const;

const enrichmentSchema = z.object({
  summary: z.string(),
  summaryZh: z.string(),
  whyItMatters: z.string(),
  whyItMattersZh: z.string(),
  developerTakeaway: z.string(),
  developerTakeawayZh: z.string(),
  topics: z.array(z.enum(TOPIC_SLUGS)),
  score: z.number(),
});

export type EnrichmentResult = z.infer<typeof enrichmentSchema>;

export async function enrichContent(
  title: string,
  text: string
): Promise<EnrichmentResult> {
  const { output } = await generateText({
    model: anthropic("claude-sonnet-4-5"),
    output: Output.object({ schema: enrichmentSchema }),
    system: `You are an AI content analyst for a developer-focused AI news platform.
Analyze AI-related content and extract structured insights for developers.

The "score" field MUST be a float between 0.0 and 1.0 (inclusive), where:
- 0.0 = irrelevant or low-quality for AI developers
- 0.5 = moderately relevant
- 1.0 = essential reading for AI developers
Do NOT use a 0-10 scale.`,
    prompt: `Analyze this AI-related article.

Title: ${title}

Content:
${text.slice(0, 3000)}`,
  });

  return output;
}
