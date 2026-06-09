import {
  getLatestHpiForPropertyType,
  loadHpiRecords,
} from "@/lib/ni-hpi/parse-hpi-data";
import { mockValuationRepository } from "@/repositories/mock-valuation-repository";
import type {
  ValuationRepository,
  ValuationSearchInput,
} from "@/repositories/valuation-repository.interface";
import type { LocalMarketComparable } from "@/types/valuation";

export class NIHousePriceIndexRepository implements ValuationRepository {
  async getComparableMarketData(
    input: ValuationSearchInput
  ): Promise<LocalMarketComparable[]> {
    const records = await loadHpiRecords();
    const latest = getLatestHpiForPropertyType(records, input.propertyType);

    if (!latest) {
      throw new Error("No NI HPI data available for property type");
    }

    const comparables: LocalMarketComparable[] = [
      {
        id: "comp-ni-hpi-type",
        label: `NI ${latest.label.toLowerCase()} median (HPI)`,
        areaName: "Northern Ireland",
        propertyType: input.propertyType,
        bedrooms: input.bedrooms,
        medianPrice: latest.medianPrice,
        averagePrice: latest.averagePrice,
        sampleSize: undefined,
        periodLabel: latest.record.quarterYear,
        sourceName: "NI House Price Index",
        sourceUrl:
          "https://www.finance-ni.gov.uk/articles/northern-ireland-house-price-index",
        confidence: 62,
      },
      {
        id: "comp-ni-hpi-all",
        label: "NI all-property median (HPI)",
        areaName: "Northern Ireland",
        propertyType: input.propertyType,
        medianPrice: latest.record.allPropertiesMedian,
        averagePrice: latest.record.allPropertiesStandardised,
        periodLabel: latest.record.quarterYear,
        sourceName: "NI House Price Index",
        sourceUrl:
          "https://admin.opendatani.gov.uk/dataset/nihpi-mean-median-standardisded-price",
        confidence: 54,
      },
    ];

    return comparables;
  }
}

export class CompositeValuationRepository implements ValuationRepository {
  constructor(
    private primary: ValuationRepository = new NIHousePriceIndexRepository(),
    private fallback: ValuationRepository = mockValuationRepository
  ) {}

  async getComparableMarketData(
    input: ValuationSearchInput
  ): Promise<LocalMarketComparable[]> {
    try {
      const live = await this.primary.getComparableMarketData(input);
      if (live.length >= 1) return live;
    } catch {
      // fall through to mock data
    }

    return this.fallback.getComparableMarketData(input);
  }
}

export const niHousePriceIndexRepository = new NIHousePriceIndexRepository();
export const compositeValuationRepository = new CompositeValuationRepository();

export async function resolveValuationComparables(
  input: ValuationSearchInput
): Promise<{
  comparables: LocalMarketComparable[];
  usedLiveHpi: boolean;
}> {
  try {
    const comparables =
      await niHousePriceIndexRepository.getComparableMarketData(input);
    return { comparables, usedLiveHpi: true };
  } catch {
    const comparables =
      await mockValuationRepository.getComparableMarketData(input);
    return { comparables, usedLiveHpi: false };
  }
}
