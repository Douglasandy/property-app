export interface SavedPropertyReport {
  id: string;
  propertyId: string;
  savedAt: string;
  sourceUrl?: string;
  address: string;
  postcode: string;
  askingPrice: number;
  estimatedFairValue?: number;
  overallScore?: number;
  recommendation?: string;
  planningRiskScore?: number;
  environmentalRiskLabel?: string;
  thumbnailUrl?: string;
  valueDifferencePercent?: number;
  areaOutlookScore?: number;
}

export const MAX_COMPARE_SELECTION = 3;
export const MIN_COMPARE_SELECTION = 2;
