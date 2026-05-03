/**
 * Composite scoring for a content item.
 *
 * Final score ∈ [0, 1] blended from:
 *   - AI relevance score (0–1) from enrichment   — weight 50%
 *   - Source authority score (0–1)               — weight 30%
 *   - Recency decay (exponential, half-life 7d)  — weight 20%
 */

interface ScoreInputs {
  aiScore: number;       // 0–1, from AI enrichment
  authorityScore: number; // 0–1, from Source model
  publishedAt: Date | null;
}

const WEIGHTS = { ai: 0.5, authority: 0.3, recency: 0.2 } as const;
const RECENCY_HALF_LIFE_DAYS = 7;

export function computeScore({ aiScore, authorityScore, publishedAt }: ScoreInputs): number {
  const ai = clamp(aiScore, 0, 1);
  const authority = clamp(authorityScore, 0, 1);

  const ageMs = publishedAt ? Date.now() - publishedAt.getTime() : 0;
  const ageDays = ageMs / (1000 * 60 * 60 * 24);
  const recency = Math.pow(0.5, ageDays / RECENCY_HALF_LIFE_DAYS);

  const score = ai * WEIGHTS.ai + authority * WEIGHTS.authority + recency * WEIGHTS.recency;
  return parseFloat(clamp(score, 0, 1).toFixed(4));
}

function clamp(v: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, v));
}
