import type { ImportMeta } from "@/types/import-meta";
import type { ParsedPropertyListing } from "@/types/listing";

export const DEFAULT_LISTING_IMAGE =
  "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&h=500&fit=crop";

export interface ImportTestResult {
  url: string;
  status: "success" | "failed";
  httpStatus: number;
  parserUsed: string;
  listingId?: string;
  address?: string;
  postcode?: string;
  askingPrice?: number;
  bedrooms?: number;
  bathrooms?: number;
  propertyType?: string;
  imageFound: boolean;
  agentName?: string;
  confidenceScore?: number;
  missingFields: string[];
  errorMessage?: string;
  errorCode?: string;
  testedAt: string;
}

export interface ImportTestSummary {
  totalTested: number;
  successfulImports: number;
  failedImports: number;
  averageConfidence: number | null;
  fieldsMostOftenMissing: { field: string; count: number }[];
}

interface ImportApiResponse {
  success: boolean;
  listing?: ParsedPropertyListing;
  importMeta?: ImportMeta;
  missingFields?: string[];
  error?: {
    code: string;
    message: string;
    missingFields?: string[];
  };
}

export function parseUrlLines(input: string): string[] {
  return input
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

export function isListingImageFound(imageUrl?: string): boolean {
  if (!imageUrl?.trim()) return false;
  return !imageUrl.includes("unsplash.com/photo-1564013799919");
}

export function buildImportTestSummary(
  results: ImportTestResult[]
): ImportTestSummary {
  const successfulImports = results.filter((r) => r.status === "success").length;
  const confidenceScores = results
    .map((r) => r.confidenceScore)
    .filter((score): score is number => score !== undefined && score > 0);

  const missingCounts = new Map<string, number>();
  for (const result of results) {
    for (const field of result.missingFields) {
      missingCounts.set(field, (missingCounts.get(field) ?? 0) + 1);
    }
  }

  const fieldsMostOftenMissing = [...missingCounts.entries()]
    .map(([field, count]) => ({ field, count }))
    .sort((a, b) => b.count - a.count);

  return {
    totalTested: results.length,
    successfulImports,
    failedImports: results.length - successfulImports,
    averageConfidence:
      confidenceScores.length > 0
        ? Math.round(
            confidenceScores.reduce((sum, score) => sum + score, 0) /
              confidenceScores.length
          )
        : null,
    fieldsMostOftenMissing,
  };
}

export async function runImportTestForUrl(url: string): Promise<ImportTestResult> {
  const testedAt = new Date().toISOString();

  try {
    const response = await fetch("/api/import/propertypal", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    });

    const payload = (await response.json()) as ImportApiResponse;
    const listing = payload.listing;
    const missingFields =
      payload.missingFields ??
      payload.importMeta?.missingFields ??
      payload.error?.missingFields ??
      [];

    const parserUsed =
      payload.importMeta?.parserUsed ?? listing?.importMethod ?? "real";

    if (payload.success && listing) {
      return {
        url,
        status: "success",
        httpStatus: response.status,
        parserUsed,
        listingId: listing.listingId,
        address: listing.address,
        postcode: listing.postcode,
        askingPrice: listing.askingPrice,
        bedrooms: listing.bedrooms,
        bathrooms: listing.bathrooms,
        propertyType: listing.propertyType,
        imageFound: isListingImageFound(listing.imageUrl),
        agentName: listing.agentName,
        confidenceScore: listing.confidenceScore,
        missingFields,
        testedAt,
      };
    }

    return {
      url,
      status: "failed",
      httpStatus: response.status,
      parserUsed,
      listingId: listing?.listingId,
      address: listing?.address,
      postcode: listing?.postcode,
      askingPrice: listing?.askingPrice,
      bedrooms: listing?.bedrooms,
      bathrooms: listing?.bathrooms,
      propertyType: listing?.propertyType,
      imageFound: isListingImageFound(listing?.imageUrl),
      agentName: listing?.agentName,
      confidenceScore: listing?.confidenceScore,
      missingFields,
      errorMessage: payload.error?.message,
      errorCode: payload.error?.code,
      testedAt,
    };
  } catch (error) {
    return {
      url,
      status: "failed",
      httpStatus: 0,
      parserUsed: "real",
      imageFound: false,
      missingFields: [],
      errorMessage:
        error instanceof Error ? error.message : "Network request failed",
      errorCode: "NETWORK_ERROR",
      testedAt,
    };
  }
}

export function buildExportPayload(
  results: ImportTestResult[],
  summary: ImportTestSummary
) {
  return {
    exportedAt: new Date().toISOString(),
    summary,
    results,
  };
}
