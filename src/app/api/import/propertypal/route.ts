import { NextResponse } from "next/server";
import {
  buildImportMetaFromParse,
  parsePropertyPalHtml,
} from "@/services/propertypal/parse-propertypal-html";
import {
  isPropertyPalUrl,
  normalizePropertyPalUrl,
} from "@/services/propertypal/validate-url";
import type { PropertyPalImportError } from "@/types/import-meta";

export const runtime = "nodejs";

const FETCH_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (compatible; PropertyInsightNI/1.0; research import)",
  Accept: "text/html,application/xhtml+xml",
  "Accept-Language": "en-GB,en;q=0.9",
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { url?: string };
    const url = body.url?.trim();

    if (!url || !isPropertyPalUrl(url)) {
      const error: PropertyPalImportError = {
        code: "INVALID_URL",
        message: "Paste a valid PropertyPal listing URL to generate a report.",
      };
      return NextResponse.json({ success: false, error }, { status: 400 });
    }

    const normalizedUrl = normalizePropertyPalUrl(url);

    let response: Response;
    try {
      response = await fetch(normalizedUrl, {
        headers: FETCH_HEADERS,
        redirect: "follow",
        signal: AbortSignal.timeout(12000),
        cache: "no-store",
      });
    } catch {
      const error: PropertyPalImportError = {
        code: "FETCH_FAILED",
        message:
          "Could not reach PropertyPal right now. You can enter the listing details manually.",
      };
      return NextResponse.json({ success: false, error }, { status: 502 });
    }

    if (response.status === 403 || response.status === 401) {
      const error: PropertyPalImportError = {
        code: "FETCH_BLOCKED",
        message:
          "PropertyPal blocked automatic reading of this listing. Please enter the details manually.",
      };
      return NextResponse.json({ success: false, error }, { status: 403 });
    }

    if (!response.ok) {
      const error: PropertyPalImportError = {
        code: "FETCH_FAILED",
        message:
          "PropertyPal did not return the listing page. Please enter the details manually.",
      };
      return NextResponse.json({ success: false, error }, { status: 502 });
    }

    const html = await response.text();

    if (
      html.toLowerCase().includes("captcha") ||
      html.toLowerCase().includes("access denied")
    ) {
      const error: PropertyPalImportError = {
        code: "FETCH_BLOCKED",
        message:
          "PropertyPal blocked automatic reading of this listing. Please enter the details manually.",
      };
      return NextResponse.json({ success: false, error }, { status: 403 });
    }

    const parsed = parsePropertyPalHtml(html, normalizedUrl);

    if (
      parsed.missingFields.includes("askingPrice") &&
      parsed.missingFields.includes("address")
    ) {
      const error: PropertyPalImportError = {
        code: "INCOMPLETE_DATA",
        message:
          "We could only read part of this listing. Please confirm the remaining details manually.",
        partialListing: parsed.listing,
        missingFields: parsed.missingFields,
      };
      return NextResponse.json(
        {
          success: false,
          error,
          listing: parsed.listing,
          importMeta: buildImportMetaFromParse(parsed),
        },
        { status: 422 }
      );
    }

    return NextResponse.json({
      success: true,
      listing: parsed.listing,
      importMeta: buildImportMetaFromParse(parsed),
      extractedFields: parsed.extractedFields,
      missingFields: parsed.missingFields,
      warnings: parsed.warnings,
    });
  } catch {
    const error: PropertyPalImportError = {
      code: "PARSE_FAILED",
      message:
        "Could not parse this PropertyPal listing. Please enter the details manually.",
    };
    return NextResponse.json({ success: false, error }, { status: 500 });
  }
}
