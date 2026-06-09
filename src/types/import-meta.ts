export type ListingImportMethod = "real" | "mock" | "manual";

export type ValuationDataSource = "ni-hpi-live" | "mock";

export interface ImportMeta {
  parserUsed: ListingImportMethod;
  sourceUrl?: string;
  extractedFields: string[];
  missingFields: string[];
  confidenceScore: number;
  fallbackReason?: string;
  valuationSource: ValuationDataSource;
  dataSourcesUsed: string[];
}

export interface PropertyPalImportError {
  code:
    | "INVALID_URL"
    | "FETCH_BLOCKED"
    | "FETCH_FAILED"
    | "PARSE_FAILED"
    | "INCOMPLETE_DATA";
  message: string;
  partialListing?: Partial<import("@/types/listing").ParsedPropertyListing>;
  missingFields?: string[];
}
