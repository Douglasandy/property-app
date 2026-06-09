import { calculatePropertyVerdict } from "@/lib/intelligence/property-verdict";
import type { PropertyVerdictInput } from "@/lib/intelligence/property-verdict";
import type { DataSourceMeta } from "@/types/data-source";
import type { RecommendationSection } from "@/types/property";

function buildRecommendationDataSourceMeta(confidence: number): DataSourceMeta {
  return {
    status: "estimated",
    label: "Calculated summary",
    sourceName: "Property Insight NI",
    confidence,
    note: "Composite opinion derived from available section data. Indicative only.",
    lastUpdated: new Date().toISOString(),
  };
}

export function buildRecommendationSection(
  input: PropertyVerdictInput
): RecommendationSection {
  const verdict = calculatePropertyVerdict(input);

  return {
    verdict,
    dataSourceMeta: buildRecommendationDataSourceMeta(verdict.confidence),
  };
}
