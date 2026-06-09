import * as cheerio from "cheerio";
import type { ParsedPropertyListing } from "@/types/listing";
import {
  isPropertyPalUrl,
  normalizePropertyPalUrl,
} from "./validate-url";

export interface ParsePropertyPalResult {
  listing: ParsedPropertyListing;
  extractedFields: string[];
  missingFields: string[];
  warnings: string[];
}

interface ExtractedFields {
  listingId?: string;
  title?: string;
  address?: string;
  postcode?: string;
  askingPrice?: number;
  bedrooms?: number;
  bathrooms?: number;
  propertyType?: string;
  imageUrl?: string;
  agentName?: string;
}

function extractListingId(url: string): string {
  const pathname = new URL(url).pathname;
  const segments = pathname.split("/").filter(Boolean);
  const numericSegment = [...segments].reverse().find((s) => /^\d+$/.test(s));
  if (numericSegment) return numericSegment;
  const slug = segments[segments.length - 1] ?? "unknown-listing";
  return slug.replace(/[^a-z0-9-]/gi, "-").toLowerCase();
}

function parsePrice(text?: string | null): number | undefined {
  if (!text) return undefined;
  const match = text.replace(/,/g, "").match(/£?\s*(\d{3,7})/i);
  if (!match) return undefined;
  const value = Number.parseInt(match[1], 10);
  return Number.isFinite(value) && value >= 25000 ? value : undefined;
}

function parseCount(text: string | undefined, pattern: RegExp): number | undefined {
  if (!text) return undefined;
  const match = text.match(pattern);
  if (!match) return undefined;
  const value = Number.parseInt(match[1], 10);
  return Number.isFinite(value) ? value : undefined;
}

function parsePostcode(text?: string | null): string | undefined {
  if (!text) return undefined;
  const match = text.toUpperCase().match(/\bBT\d{1,2}\s?\d[A-Z]{2}\b/);
  return match?.[0].replace(/\s+/, " ");
}

function titleCase(text: string): string {
  return text
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

function slugTitleFromUrl(url: string): string | undefined {
  const pathname = new URL(url).pathname;
  const segments = pathname.split("/").filter(Boolean);
  const slug = segments.find(
    (s) => s.includes("-") && !/^\d+$/.test(s) && s.length > 8
  );
  if (!slug) return undefined;

  return slug
    .split("-")
    .filter((part) => !/^\d+$/.test(part) && part.length > 1)
    .slice(0, -1)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function extractFromJsonLd($: cheerio.CheerioAPI): Partial<ExtractedFields> {
  const result: Partial<ExtractedFields> = {};

  $('script[type="application/ld+json"]').each((_, element) => {
    try {
      const raw = $(element).html();
      if (!raw) return;
      const parsed = JSON.parse(raw) as Record<string, unknown>;
      const nodes = Array.isArray(parsed) ? parsed : [parsed];

      for (const node of nodes) {
        const offers = node.offers as Record<string, unknown> | undefined;
        const price =
          parsePrice(String(node.price ?? offers?.price ?? "")) ??
          parsePrice(String(offers?.price ?? ""));

        if (price) result.askingPrice = price;
        if (typeof node.name === "string") result.title = node.name;
        if (typeof node.description === "string" && !result.title) {
          result.title = node.description.slice(0, 120);
        }

        const address = node.address as Record<string, string> | undefined;
        if (address) {
          const street = [address.streetAddress, address.addressLocality]
            .filter(Boolean)
            .join(", ");
          if (street) result.address = street;
          if (address.postalCode) result.postcode = address.postalCode.toUpperCase();
        }

        if (typeof node.image === "string") result.imageUrl = node.image;
        if (Array.isArray(node.image) && typeof node.image[0] === "string") {
          result.imageUrl = node.image[0];
        }

        if (typeof node.numberOfRooms === "number") {
          result.bedrooms = node.numberOfRooms;
        }
      }
    } catch {
      // ignore invalid JSON-LD blocks
    }
  });

  return result;
}

function extractFromMeta($: cheerio.CheerioAPI): Partial<ExtractedFields> {
  const getMeta = (selector: string) =>
    $(selector).attr("content")?.trim() || undefined;

  return {
    title: getMeta('meta[property="og:title"]') ?? $("title").text().trim(),
    imageUrl: getMeta('meta[property="og:image"]'),
    askingPrice: parsePrice(getMeta('meta[property="product:price:amount"]')),
    address: getMeta('meta[property="og:street-address"]'),
    postcode: parsePostcode(getMeta('meta[property="og:postal-code"]')),
  };
}

function extractFromSelectors($: cheerio.CheerioAPI): Partial<ExtractedFields> {
  const textBlocks = [
    $("h1").first().text(),
    $('[class*="price"]').first().text(),
    $('[class*="address"]').first().text(),
    $(".property-details").text(),
    $("[data-testid]").text(),
  ]
    .filter(Boolean)
    .join(" ");

  const title = $("h1").first().text().trim() || undefined;
  const priceText =
    $('[class*="price"]').first().text() ||
    $('[itemprop="price"]').attr("content") ||
    textBlocks;

  return {
    title,
    askingPrice: parsePrice(priceText),
    bedrooms: parseCount(textBlocks, /(\d+)\s*(?:bed|bedroom|beds)\b/i),
    bathrooms: parseCount(textBlocks, /(\d+)\s*(?:bath|bathroom|baths)\b/i),
    postcode: parsePostcode(textBlocks),
    address:
      $('[class*="address"]').first().text().trim() ||
      $('[itemprop="streetAddress"]').text().trim() ||
      undefined,
    propertyType:
      textBlocks.match(
        /\b(semi[- ]detached|detached|terrace|terraced|apartment|flat|bungalow)\b/i
      )?.[1] ?? undefined,
    agentName:
      $('[class*="agent"]').first().text().trim() ||
      $('[class*="branch"]').first().text().trim() ||
      undefined,
  };
}

function extractFromBodyText($: cheerio.CheerioAPI): Partial<ExtractedFields> {
  const bodyText = $("body").text().replace(/\s+/g, " ");
  return {
    askingPrice: parsePrice(bodyText),
    bedrooms: parseCount(bodyText, /(\d+)\s*(?:bed|bedroom|beds)\b/i),
    bathrooms: parseCount(bodyText, /(\d+)\s*(?:bath|bathroom|baths)\b/i),
    postcode: parsePostcode(bodyText),
    propertyType:
      bodyText.match(
        /\b(semi[- ]detached|detached|terrace|terraced|apartment|flat|bungalow)\b/i
      )?.[1] ?? undefined,
  };
}

function normalizePropertyType(value?: string): string | undefined {
  if (!value) return undefined;
  const lower = value.toLowerCase();
  if (lower.includes("semi")) return "Semi Detached";
  if (lower.includes("detach")) return "Detached";
  if (lower.includes("terrace")) return "Terraced";
  if (lower.includes("apartment") || lower.includes("flat")) return "Apartment";
  if (lower.includes("bungalow")) return "Bungalow";
  return titleCase(value);
}

function calculateConfidence(
  fields: ExtractedFields,
  extractedFieldNames: string[]
): number {
  const hasAddress = !!fields.address;
  const hasPrice = !!fields.askingPrice && fields.askingPrice > 0;
  const hasBeds = !!fields.bedrooms;
  const hasImage = !!fields.imageUrl;

  if (hasAddress && hasPrice && hasBeds && hasImage) return 92;
  if (hasAddress && hasPrice && hasBeds) return 82;
  if (hasAddress && hasPrice) return 74;
  if (hasAddress || fields.title) return 58;
  if (extractedFieldNames.length >= 2) return 48;
  return 35;
}

function buildListing(
  sourceUrl: string,
  merged: ExtractedFields
): ParsedPropertyListing {
  const slugTitle = slugTitleFromUrl(sourceUrl);
  const address = merged.address ?? slugTitle ?? "Address unavailable";
  const postcode = merged.postcode ?? "BT0 0AA";

  return {
    sourceUrl,
    sourceName: "PropertyPal",
    listingId: merged.listingId ?? extractListingId(sourceUrl),
    title: merged.title ?? `${address} — PropertyPal listing`,
    address,
    postcode,
    askingPrice: merged.askingPrice ?? 0,
    bedrooms: merged.bedrooms ?? 0,
    bathrooms: merged.bathrooms ?? 0,
    propertyType: merged.propertyType ?? "Unknown",
    imageUrl:
      merged.imageUrl ??
      "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&h=500&fit=crop",
    agentName: merged.agentName ?? "PropertyPal agent",
    importedAt: new Date().toISOString(),
    confidenceScore: 0,
    importMethod: "real",
  };
}

export function parsePropertyPalHtml(
  html: string,
  url: string
): ParsePropertyPalResult {
  if (!isPropertyPalUrl(url)) {
    throw new Error("Invalid PropertyPal URL");
  }

  const sourceUrl = normalizePropertyPalUrl(url);
  const $ = cheerio.load(html);
  const extractedFieldNames = new Set<string>();
  const warnings: string[] = [];

  const merged: ExtractedFields = {
    listingId: extractListingId(sourceUrl),
  };

  const sources = [
    extractFromJsonLd($),
    extractFromMeta($),
    extractFromSelectors($),
    extractFromBodyText($),
  ];

  for (const source of sources) {
    for (const [key, value] of Object.entries(source) as [
      keyof ExtractedFields,
      ExtractedFields[keyof ExtractedFields],
    ][]) {
      if (value !== undefined && value !== null && value !== "") {
        merged[key] = value as never;
        extractedFieldNames.add(key);
      }
    }
  }

  if (!merged.address && slugTitleFromUrl(sourceUrl)) {
    merged.address = slugTitleFromUrl(sourceUrl);
    extractedFieldNames.add("address");
  }

  merged.propertyType = normalizePropertyType(merged.propertyType);

  const listing = buildListing(sourceUrl, merged);
  listing.confidenceScore = calculateConfidence(
    merged,
    Array.from(extractedFieldNames)
  );

  const requiredFields: (keyof ExtractedFields)[] = [
    "address",
    "askingPrice",
    "bedrooms",
    "postcode",
  ];
  const missingFields = requiredFields.filter((field) => {
    const value = merged[field];
    return value === undefined || value === null || value === 0 || value === "";
  });

  if (listing.confidenceScore < 50) {
    warnings.push("Some listing details may be incomplete.");
  }

  if (!merged.askingPrice) {
    warnings.push("Asking price could not be detected automatically.");
  }

  listing.parseWarnings = warnings;

  return {
    listing,
    extractedFields: Array.from(extractedFieldNames),
    missingFields,
    warnings,
  };
}

export function buildImportMetaFromParse(
  result: ParsePropertyPalResult
): import("@/types/import-meta").ImportMeta {
  return {
    parserUsed: "real",
    sourceUrl: result.listing.sourceUrl,
    extractedFields: result.extractedFields,
    missingFields: result.missingFields,
    confidenceScore: result.listing.confidenceScore,
    valuationSource: "mock",
    dataSourcesUsed: ["PropertyPal (parsed HTML)"],
  };
}
