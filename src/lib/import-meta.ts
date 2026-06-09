import type { ParsedPropertyListing } from "@/types/listing";
import type { ImportMeta } from "@/types/import-meta";

const TRACKED_FIELDS: (keyof ParsedPropertyListing)[] = [
  "listingId",
  "title",
  "address",
  "postcode",
  "askingPrice",
  "bedrooms",
  "bathrooms",
  "propertyType",
  "imageUrl",
  "agentName",
  "sourceUrl",
];

export function getExtractedFields(
  listing: ParsedPropertyListing
): string[] {
  return TRACKED_FIELDS.filter((field) => {
    const value = listing[field];
    if (typeof value === "number") return value > 0;
    if (typeof value === "string") {
      return value.trim().length > 0 && value !== "Unknown";
    }
    return !!value;
  });
}

export function getMissingFields(
  listing: ParsedPropertyListing
): string[] {
  const required: (keyof ParsedPropertyListing)[] = [
    "address",
    "postcode",
    "askingPrice",
    "bedrooms",
    "propertyType",
  ];

  return required.filter((field) => {
    const value = listing[field];
    if (typeof value === "number") return !value || value <= 0;
    if (typeof value === "string") {
      return !value.trim() || value === "Unknown" || value === "BT0 0AA";
    }
    return !value;
  });
}

export function buildImportMetaFromListing(
  listing: ParsedPropertyListing,
  valuationSource: ImportMeta["valuationSource"] = "mock"
): ImportMeta {
  const parserUsed = listing.importMethod ?? "mock";

  return {
    parserUsed,
    sourceUrl: listing.sourceUrl,
    extractedFields: getExtractedFields(listing),
    missingFields: getMissingFields(listing),
    confidenceScore: listing.confidenceScore,
    valuationSource,
    dataSourcesUsed: [
      parserUsed === "manual"
        ? "Manual entry"
        : parserUsed === "real"
          ? "PropertyPal (parsed HTML)"
          : "PropertyPal (prototype parser)",
      valuationSource === "ni-hpi-live"
        ? "NI House Price Index"
        : "Mock NI market data",
    ],
  };
}

export function sanitizeReportId(listingId: string): string {
  return listingId
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);
}
