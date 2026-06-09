export type PropertyType =
  | "detached"
  | "semi-detached"
  | "terrace"
  | "apartment"
  | "bungalow"
  | "unknown";

export interface LocalMarketComparable {
  id: string;
  label: string;
  areaName: string;
  propertyType: PropertyType;
  bedrooms?: number;
  medianPrice: number;
  averagePrice: number;
  sampleSize?: number;
  periodLabel: string;
  sourceName: string;
  sourceUrl?: string;
  confidence: number;
}

export type ValueVerdict =
  | "Good value"
  | "Fairly priced"
  | "Slightly overpriced"
  | "Overpriced"
  | "Insufficient data";

export interface ValueAnalysis {
  askingPrice: number;
  estimatedFairValue: number;
  lowerEstimate: number;
  upperEstimate: number;
  differenceAmount: number;
  differencePercent: number;
  verdict: ValueVerdict;
  confidence: number;
  comparables: LocalMarketComparable[];
  assumptions: string[];
  summary: string;
}

export function parsePropertyType(label: string): PropertyType {
  const normalised = label.toLowerCase().replace(/\s+/g, " ").trim();

  if (normalised.includes("semi")) return "semi-detached";
  if (normalised.includes("terrace") || normalised.includes("terraced")) {
    return "terrace";
  }
  if (
    normalised.includes("apartment") ||
    normalised.includes("flat") ||
    normalised.includes("maisonette")
  ) {
    return "apartment";
  }
  if (normalised.includes("bungalow")) return "bungalow";
  if (normalised.includes("detach")) return "detached";

  return "unknown";
}

export function formatPropertyType(type: PropertyType): string {
  switch (type) {
    case "semi-detached":
      return "semi-detached";
    case "detached":
      return "detached";
    case "terrace":
      return "terrace";
    case "apartment":
      return "apartment";
    case "bungalow":
      return "bungalow";
    default:
      return "property";
  }
}

export function getVerdictHeadline(verdict: ValueVerdict): string {
  switch (verdict) {
    case "Good value":
      return "Looks like good value";
    case "Fairly priced":
      return "Looks fairly priced";
    case "Slightly overpriced":
      return "Slightly above our estimate";
    case "Overpriced":
      return "Likely overpriced";
    case "Insufficient data":
      return "Not enough data yet";
  }
}

export function getVerdictTone(
  verdict: ValueVerdict
): "positive" | "neutral" | "warning" | "negative" | "muted" {
  switch (verdict) {
    case "Good value":
      return "positive";
    case "Fairly priced":
      return "neutral";
    case "Slightly overpriced":
      return "warning";
    case "Overpriced":
      return "negative";
    case "Insufficient data":
      return "muted";
  }
}
