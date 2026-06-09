import { NextResponse } from "next/server";
import { propertyRepository } from "@/repositories/mock-property-repository";
import type { ParsedPropertyListing } from "@/types/listing";
import type { ImportMeta } from "@/types/import-meta";
import { buildImportMetaFromListing } from "@/lib/import-meta";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      listing?: ParsedPropertyListing;
      importMeta?: ImportMeta;
    };

    if (!body.listing?.listingId) {
      return NextResponse.json(
        { success: false, message: "Listing data is required." },
        { status: 400 }
      );
    }

    const importMeta =
      body.importMeta ?? buildImportMetaFromListing(body.listing);

    const report = await propertyRepository.createReportFromListing(
      body.listing,
      importMeta
    );

    return NextResponse.json({
      success: true,
      reportId: report.property.id,
      importMeta: report.importMeta,
    });
  } catch {
    return NextResponse.json(
      { success: false, message: "Could not create report." },
      { status: 500 }
    );
  }
}
