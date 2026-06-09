import type { ParsedPropertyListing } from "@/types/listing";
import type { PropertyListingParser } from "./parser.interface";
import {
  isPropertyPalUrl,
  normalizePropertyPalUrl,
} from "./validate-url";

function extractListingId(url: string): string {
  const pathname = new URL(url).pathname;
  const segments = pathname.split("/").filter(Boolean);
  const numericSegment = [...segments].reverse().find((s) => /^\d+$/.test(s));
  if (numericSegment) return numericSegment;

  const slug = segments[segments.length - 1] ?? "unknown-listing";
  return slug.replace(/[^a-z0-9-]/gi, "-").toLowerCase();
}

function titleFromSlug(url: string): string | null {
  const pathname = new URL(url).pathname;
  const segments = pathname.split("/").filter(Boolean);
  const slug = segments.find(
    (s) => s.includes("-") && !/^\d+$/.test(s) && s.length > 8
  );
  if (!slug) return null;

  return slug
    .split("-")
    .slice(0, -2)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export class MockPropertyPalParser implements PropertyListingParser {
  canParse(url: string): boolean {
    return isPropertyPalUrl(url);
  }

  async parse(url: string): Promise<ParsedPropertyListing> {
    if (!this.canParse(url)) {
      throw new Error("Invalid PropertyPal URL");
    }

    const sourceUrl = normalizePropertyPalUrl(url);
    const listingId = extractListingId(sourceUrl);
    const slugTitle = titleFromSlug(sourceUrl);

    await new Promise((resolve) => setTimeout(resolve, 400));

    return {
      sourceUrl,
      sourceName: "PropertyPal",
      listingId,
      title: slugTitle
        ? `${slugTitle} — PropertyPal listing`
        : "3 bed semi-detached house for sale",
      address: slugTitle ?? "123 Example Road",
      postcode: "BT7 1AA",
      askingPrice: 235000,
      bedrooms: 3,
      bathrooms: 2,
      propertyType: "Semi Detached",
      imageUrl:
        "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&h=500&fit=crop",
      agentName: "Example Estate Agents NI",
      importedAt: new Date().toISOString(),
      confidenceScore: 87,
      importMethod: "mock",
    };
  }
}

export const mockPropertyPalParser = new MockPropertyPalParser();
