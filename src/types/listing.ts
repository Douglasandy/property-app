export type ListingImportMethod = "real" | "mock" | "manual";

export interface ParsedPropertyListing {
  sourceUrl: string;
  sourceName: "PropertyPal";
  listingId: string;
  title: string;
  address: string;
  postcode: string;
  askingPrice: number;
  bedrooms: number;
  bathrooms: number;
  propertyType: string;
  imageUrl: string;
  agentName: string;
  importedAt: string;
  confidenceScore: number;
  importMethod?: ListingImportMethod;
  parseWarnings?: string[];
}
