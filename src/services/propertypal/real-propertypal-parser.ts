import type { PropertyListingParser } from "./parser.interface";
import { isPropertyPalUrl } from "./validate-url";
import type { ParsedPropertyListing } from "@/types/listing";
import type { PropertyPalImportError } from "@/types/import-meta";

export class RealPropertyPalParser implements PropertyListingParser {
  canParse(url: string): boolean {
    return isPropertyPalUrl(url);
  }

  async parse(url: string): Promise<ParsedPropertyListing> {
    const response = await fetch("/api/import/propertypal", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    });

    const payload = (await response.json()) as {
      success: boolean;
      listing?: ParsedPropertyListing;
      error?: PropertyPalImportError;
    };

    if (!response.ok || !payload.success || !payload.listing) {
      const message =
        payload.error?.message ??
        "Could not read this PropertyPal listing automatically.";
      const error = new Error(message) as Error & {
        importError?: PropertyPalImportError;
      };
      error.importError = payload.error;
      throw error;
    }

    return payload.listing;
  }
}

export const realPropertyPalParser = new RealPropertyPalParser();
