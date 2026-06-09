import type { ParsedPropertyListing } from "@/types/listing";
import type { PropertyListingParser } from "./parser.interface";
import { realPropertyPalParser } from "./real-propertypal-parser";
import { mockPropertyPalParser } from "./mock-propertypal-parser";
import { isPropertyPalUrl } from "./validate-url";
import type { ImportMeta } from "@/types/import-meta";

export const IMPORT_STEPS = [
  "Reading listing",
  "Matching area data",
  "Checking nearby planning activity",
  "Generating insight report",
] as const;

export type ImportStep = (typeof IMPORT_STEPS)[number];

export interface ImportResult {
  reportId: string;
  listing: ParsedPropertyListing;
}

const STEP_DURATION_MS = 700;

const USE_MOCK_PARSER =
  process.env.NEXT_PUBLIC_USE_MOCK_PROPERTYPAL_PARSER === "true";

function selectParser(): PropertyListingParser {
  return USE_MOCK_PARSER ? mockPropertyPalParser : realPropertyPalParser;
}

async function createReportViaApi(
  listing: ParsedPropertyListing,
  importMeta?: ImportMeta
): Promise<string> {
  const response = await fetch("/api/report/from-listing", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ listing, importMeta }),
  });

  const payload = (await response.json()) as {
    success: boolean;
    reportId?: string;
    message?: string;
  };

  if (!response.ok || !payload.success || !payload.reportId) {
    throw new Error(payload.message ?? "Could not create report.");
  }

  return payload.reportId;
}

export class PropertyImportService {
  constructor(private parser: PropertyListingParser = selectParser()) {}

  validateUrl(url: string): boolean {
    return isPropertyPalUrl(url);
  }

  async importFromUrl(
    url: string,
    onStep?: (step: ImportStep, index: number) => void
  ): Promise<ImportResult> {
    if (!this.validateUrl(url)) {
      throw new Error(
        "Paste a valid PropertyPal listing URL to generate a report."
      );
    }

    for (let i = 0; i < IMPORT_STEPS.length; i++) {
      onStep?.(IMPORT_STEPS[i], i);
      await delay(STEP_DURATION_MS);
    }

    const listing = await this.parser.parse(url);
    const reportId = await createReportViaApi(listing);

    return {
      reportId,
      listing,
    };
  }
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const propertyImportService = new PropertyImportService();
