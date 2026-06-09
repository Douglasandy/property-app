import { calculateValueAnalysis } from "@/lib/intelligence/value-analysis";
import { resolveValuationComparables } from "@/repositories/ni-house-price-index-repository";
import type { ValuationRepository } from "@/repositories/valuation-repository.interface";
import type { DataSourceMeta } from "@/types/data-source";
import type { ValueAnalysisSection } from "@/types/property";
import {
  parsePropertyType,
  type PropertyType,
} from "@/types/valuation";

export interface BuildValueAnalysisInput {
  postcode: string;
  propertyType: string | PropertyType;
  bedrooms?: number;
  askingPrice: number;
}

export interface BuildValueAnalysisOptions {
  repository?: ValuationRepository;
}

function buildLiveHpiMeta(confidence: number): DataSourceMeta {
  return {
    status: "live",
    label: "Live",
    sourceName: "NI House Price Index",
    sourceUrl:
      "https://www.finance-ni.gov.uk/articles/northern-ireland-house-price-index",
    confidence,
    note: "Based on available public market data. Indicative estimate only.",
    lastUpdated: new Date().toISOString(),
  };
}

function buildMockMeta(confidence: number): DataSourceMeta {
  return {
    status: "estimated",
    label: "Prototype estimate",
    sourceName: "Mock NI market data",
    confidence,
    note: "Indicative estimate from prototype comparables. Not a professional valuation.",
    lastUpdated: new Date().toISOString(),
  };
}

export async function buildValueAnalysisSection(
  input: BuildValueAnalysisInput,
  options: BuildValueAnalysisOptions = {}
): Promise<ValueAnalysisSection> {
  const propertyType =
    typeof input.propertyType === "string"
      ? parsePropertyType(input.propertyType)
      : input.propertyType;

  const valuationInput = {
    postcode: input.postcode,
    propertyType,
    bedrooms: input.bedrooms,
    askingPrice: input.askingPrice,
  };

  const { comparables, usedLiveHpi } = options.repository
    ? {
        comparables:
          await options.repository.getComparableMarketData(valuationInput),
        usedLiveHpi: false,
      }
    : await resolveValuationComparables(valuationInput);

  const analysis = calculateValueAnalysis({
    askingPrice: input.askingPrice,
    propertyType,
    bedrooms: input.bedrooms,
    comparables,
  });

  const adjustedAnalysis = usedLiveHpi
    ? {
        ...analysis,
        assumptions: [
          "Based on NI House Price Index quarterly medians by property type.",
          "Limited local comparable data — estimate uses wider NI property-type trends.",
          "Indicative estimate only, not a professional valuation.",
        ],
      }
    : analysis;

  return {
    analysis: adjustedAnalysis,
    limitedLocalData: usedLiveHpi,
    dataSourceMeta: usedLiveHpi
      ? buildLiveHpiMeta(Math.min(adjustedAnalysis.confidence, 68))
      : buildMockMeta(adjustedAnalysis.confidence),
  };
}

export function getValuationSourceFromSection(
  section: ValueAnalysisSection
): "ni-hpi-live" | "mock" {
  return section.dataSourceMeta.status === "live" ? "ni-hpi-live" : "mock";
}
