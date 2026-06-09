export type PropertyRecommendation =
  | "Strong match"
  | "Worth viewing"
  | "Proceed with caution"
  | "Negotiate hard"
  | "Not enough data";

export interface PropertyVerdict {
  recommendation: PropertyRecommendation;
  overallScore: number;
  confidence: number;
  headline: string;
  summary: string;
  pros: string[];
  watchOuts: string[];
  suggestedActions: string[];
}

export function getRecommendationLabel(
  recommendation: PropertyRecommendation
): string {
  return recommendation;
}

export function getRecommendationTone(
  recommendation: PropertyRecommendation
): "excellent" | "positive" | "caution" | "negotiate" | "muted" {
  switch (recommendation) {
    case "Strong match":
      return "excellent";
    case "Worth viewing":
      return "positive";
    case "Proceed with caution":
      return "caution";
    case "Negotiate hard":
      return "negotiate";
    case "Not enough data":
      return "muted";
  }
}
