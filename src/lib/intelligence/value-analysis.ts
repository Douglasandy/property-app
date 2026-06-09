import type {
  LocalMarketComparable,
  PropertyType,
  ValueAnalysis,
  ValueVerdict,
} from "@/types/valuation";
import { formatPropertyType } from "@/types/valuation";

const MIN_COMPARABLES = 2;
const MIN_CONFIDENCE_THRESHOLD = 40;

function localityWeight(id: string): number {
  if (id.includes("ward")) return 1.4;
  if (id.includes("postcode")) return 1.2;
  if (id.includes("council")) return 1;
  if (id.includes("ni")) return 0.75;
  return 1;
}

function comparableWeight(
  comparable: LocalMarketComparable,
  propertyType: PropertyType,
  bedrooms?: number
): number {
  let weight = (comparable.confidence / 100) * localityWeight(comparable.id);

  if (comparable.propertyType === propertyType && propertyType !== "unknown") {
    weight *= 1.25;
  }

  if (
    bedrooms !== undefined &&
    comparable.bedrooms !== undefined &&
    comparable.bedrooms === bedrooms
  ) {
    weight *= 1.1;
  }

  if (comparable.sampleSize) {
    weight *= Math.min(1.15, 0.85 + comparable.sampleSize / 400);
  }

  return weight;
}

function weightedFairValue(
  comparables: LocalMarketComparable[],
  propertyType: PropertyType,
  bedrooms?: number
): number {
  let totalWeight = 0;
  let weightedSum = 0;

  for (const comparable of comparables) {
    const weight = comparableWeight(comparable, propertyType, bedrooms);
    const price = comparable.medianPrice * 0.65 + comparable.averagePrice * 0.35;
    weightedSum += price * weight;
    totalWeight += weight;
  }

  if (totalWeight === 0) return 0;
  return Math.round(weightedSum / totalWeight);
}

function estimateBand(
  comparables: LocalMarketComparable[],
  fairValue: number
): { lower: number; upper: number } {
  if (comparables.length === 0) {
    return { lower: fairValue, upper: fairValue };
  }

  const prices = comparables.map((c) => c.medianPrice);
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const spread = Math.max(max - min, fairValue * 0.04);

  return {
    lower: Math.round(Math.min(fairValue - spread * 0.35, fairValue * 0.97)),
    upper: Math.round(Math.max(fairValue + spread * 0.35, fairValue * 1.03)),
  };
}

function determineVerdict(differencePercent: number): ValueVerdict {
  if (differencePercent < -8) return "Good value";
  if (differencePercent <= 4 && differencePercent >= -4) return "Fairly priced";
  if (differencePercent <= 10) return "Slightly overpriced";
  return "Overpriced";
}

function calculateConfidence(
  comparables: LocalMarketComparable[],
  propertyType: PropertyType
): number {
  if (comparables.length === 0) return 0;

  const avgConfidence =
    comparables.reduce((sum, c) => sum + c.confidence, 0) /
    comparables.length;

  const localityBonus = comparables.some((c) => c.id.includes("ward")) ? 8 : 0;
  const typeBonus =
    comparables.some((c) => c.propertyType === propertyType) ? 6 : 0;
  const sampleBonus = comparables.some((c) => (c.sampleSize ?? 0) >= 50) ? 4 : 0;

  return Math.min(
    95,
    Math.round(avgConfidence * 0.85 + localityBonus + typeBonus + sampleBonus)
  );
}

function buildAssumptions(
  comparables: LocalMarketComparable[],
  propertyType: PropertyType,
  bedrooms?: number
): string[] {
  const assumptions = [
    "Indicative estimate based on available market comparables, not a formal valuation.",
    `Adjusted for ${formatPropertyType(propertyType)} properties where data allows.`,
  ];

  if (bedrooms !== undefined) {
    assumptions.push(
      `Bedroom count (${bedrooms}) considered where local samples include a match.`
    );
  }

  if (comparables.some((c) => c.id.includes("ward"))) {
    assumptions.push("Ward-level data weighted most heavily when available.");
  }

  assumptions.push(
    "Future versions will connect NI House Price Index, LPS and Open Data NI datasets."
  );

  return assumptions;
}

function buildSummary(
  verdict: ValueVerdict,
  askingPrice: number,
  fairValue: number,
  differencePercent: number
): string {
  const formattedDiff = Math.abs(differencePercent).toFixed(1);

  switch (verdict) {
    case "Good value":
      return `The asking price of £${askingPrice.toLocaleString()} sits around ${formattedDiff}% below our estimated fair value of £${fairValue.toLocaleString()}.`;
    case "Fairly priced":
      return `The asking price is broadly in line with our estimated fair value of £${fairValue.toLocaleString()}.`;
    case "Slightly overpriced":
      return `The asking price is around ${formattedDiff}% above our estimated fair value of £${fairValue.toLocaleString()} — there may be room to negotiate.`;
    case "Overpriced":
      return `The asking price is significantly above our estimated fair value of £${fairValue.toLocaleString()} — worth questioning the price carefully.`;
    case "Insufficient data":
      return "We do not have enough reliable local market data to produce a confident estimate for this property.";
  }
}

export function calculateValueAnalysis(input: {
  askingPrice: number;
  propertyType: PropertyType;
  bedrooms?: number;
  comparables: LocalMarketComparable[];
}): ValueAnalysis {
  const usableComparables = input.comparables.filter(
    (c) => c.confidence >= MIN_CONFIDENCE_THRESHOLD
  );

  if (usableComparables.length < MIN_COMPARABLES) {
    return {
      askingPrice: input.askingPrice,
      estimatedFairValue: 0,
      lowerEstimate: 0,
      upperEstimate: 0,
      differenceAmount: 0,
      differencePercent: 0,
      verdict: "Insufficient data",
      confidence: 0,
      comparables: input.comparables,
      assumptions: [
        "Not enough reliable comparables were available for this property.",
        "Future NI House Price Index and LPS integrations will improve coverage.",
      ],
      summary: buildSummary(
        "Insufficient data",
        input.askingPrice,
        0,
        0
      ),
    };
  }

  const estimatedFairValue = weightedFairValue(
    usableComparables,
    input.propertyType,
    input.bedrooms
  );
  const { lower, upper } = estimateBand(usableComparables, estimatedFairValue);

  const differenceAmount = input.askingPrice - estimatedFairValue;
  const differencePercent =
    Math.round((differenceAmount / estimatedFairValue) * 1000) / 10;

  const verdict = determineVerdict(differencePercent);
  const confidence = calculateConfidence(
    usableComparables,
    input.propertyType
  );

  return {
    askingPrice: input.askingPrice,
    estimatedFairValue,
    lowerEstimate: lower,
    upperEstimate: upper,
    differenceAmount,
    differencePercent,
    verdict,
    confidence,
    comparables: input.comparables,
    assumptions: buildAssumptions(
      usableComparables,
      input.propertyType,
      input.bedrooms
    ),
    summary: buildSummary(
      verdict,
      input.askingPrice,
      estimatedFairValue,
      differencePercent
    ),
  };
}
