"use client";

import type { ImportMeta } from "@/types/import-meta";
import type { ParsedPropertyListing } from "@/types/listing";
import type { PropertyReport } from "@/types/property";

interface DataDebugPanelProps {
  report: PropertyReport;
}

function formatParserLabel(parser: ImportMeta["parserUsed"]): string {
  switch (parser) {
    case "real":
      return "Real PropertyPal parser";
    case "manual":
      return "Manual entry";
    case "mock":
      return "Mock parser";
  }
}

export function DataDebugPanel({ report }: DataDebugPanelProps) {
  if (process.env.NEXT_PUBLIC_SHOW_DATA_DEBUG !== "true") {
    return null;
  }

  const importMeta = report.importMeta;
  const listing = report.listingImport;

  return (
    <section className="rounded-2xl border border-dashed border-violet-300 bg-violet-50/40 p-4 font-mono text-xs text-violet-950">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-violet-700">
        Developer diagnostics
      </p>

      <dl className="mt-3 space-y-2">
        <Row label="Parser used">
          {importMeta
            ? formatParserLabel(importMeta.parserUsed)
            : listing?.importMethod
              ? formatParserLabel(listing.importMethod)
              : "Unknown"}
        </Row>

        {importMeta?.fallbackReason && (
          <Row label="Fallback reason">{importMeta.fallbackReason}</Row>
        )}

        <Row label="Extracted fields">
          {importMeta?.extractedFields.length
            ? importMeta.extractedFields.join(", ")
            : "—"}
        </Row>

        <Row label="Missing fields">
          {importMeta?.missingFields.length
            ? importMeta.missingFields.join(", ")
            : "—"}
        </Row>

        <Row label="Data sources">
          {importMeta?.dataSourcesUsed.join(" · ") ?? "—"}
        </Row>

        <Row label="Listing confidence">
          {listing?.confidenceScore ?? importMeta?.confidenceScore ?? "—"}%
        </Row>

        <Row label="Value analysis source">
          {report.valueAnalysis.dataSourceMeta.sourceName ?? "—"} (
          {report.valueAnalysis.dataSourceMeta.status})
        </Row>

        <Row label="Value confidence">
          {report.valueAnalysis.dataSourceMeta.confidence}%
        </Row>

        {listing && (
          <Row label="Listing ID">{listing.listingId}</Row>
        )}
      </dl>
    </section>
  );
}

function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-[140px_1fr] gap-2">
      <dt className="text-violet-700">{label}</dt>
      <dd className="break-all">{children}</dd>
    </div>
  );
}
