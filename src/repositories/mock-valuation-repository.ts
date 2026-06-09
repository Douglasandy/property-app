import type {
  ValuationRepository,
  ValuationSearchInput,
} from "@/repositories/valuation-repository.interface";
import type { LocalMarketComparable } from "@/types/valuation";

function buildComparables(input: ValuationSearchInput): LocalMarketComparable[] {
  const district = input.postcode.split(" ")[0]?.toUpperCase() ?? "BT7";
  const propertyLabel =
    input.propertyType === "semi-detached"
      ? "semi-detached"
      : input.propertyType === "unknown"
        ? "property"
        : input.propertyType;

  return [
    {
      id: "comp-ward",
      label: `Ward median ${propertyLabel}`,
      areaName: "Botanic ward",
      propertyType: input.propertyType,
      bedrooms: input.bedrooms,
      medianPrice: 212000,
      averagePrice: 215500,
      sampleSize: 48,
      periodLabel: "Last 12 months",
      sourceName: "Mock NI market data",
      confidence: 72,
    },
    {
      id: "comp-postcode",
      label: `${district} average`,
      areaName: `${district} postcode district`,
      propertyType: input.propertyType,
      medianPrice: 219000,
      averagePrice: 222800,
      sampleSize: 126,
      periodLabel: "Last 12 months",
      sourceName: "Mock NI market data",
      confidence: 68,
    },
    {
      id: "comp-council",
      label: `Belfast ${propertyLabel} average`,
      areaName: "Belfast City Council",
      propertyType: input.propertyType,
      medianPrice: 225000,
      averagePrice: 228400,
      sampleSize: 312,
      periodLabel: "Last 12 months",
      sourceName: "Mock NI market data",
      confidence: 61,
    },
    {
      id: "comp-ni",
      label: `NI ${propertyLabel} benchmark`,
      areaName: "Northern Ireland",
      propertyType: input.propertyType,
      medianPrice: 218000,
      averagePrice: 221600,
      sampleSize: 1840,
      periodLabel: "Last 12 months",
      sourceName: "Mock NI market data",
      confidence: 54,
    },
  ];
}

export class MockValuationRepository implements ValuationRepository {
  async getComparableMarketData(
    input: ValuationSearchInput
  ): Promise<LocalMarketComparable[]> {
    await delay(120);
    return buildComparables(input);
  }
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const mockValuationRepository = new MockValuationRepository();
