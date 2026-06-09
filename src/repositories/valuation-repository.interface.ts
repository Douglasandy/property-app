import type { LocalMarketComparable, PropertyType } from "@/types/valuation";

export interface ValuationSearchInput {
  postcode: string;
  propertyType: PropertyType;
  bedrooms?: number;
  askingPrice: number;
}

export interface ValuationRepository {
  getComparableMarketData(
    input: ValuationSearchInput
  ): Promise<LocalMarketComparable[]>;
}
