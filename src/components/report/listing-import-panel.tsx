import { ExternalLink, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatImportTime } from "@/lib/formatters";
import type { ParsedPropertyListing } from "@/types/listing";
import { cn } from "@/lib/utils";

interface ListingImportPanelProps {
  listing: ParsedPropertyListing;
}

export function ListingImportPanel({ listing }: ListingImportPanelProps) {
  const isManual = listing.importMethod === "manual";
  const isMock = listing.importMethod === "mock";

  return (
    <section className="rounded-2xl border border-border/60 bg-card p-4 shadow-card">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-semibold text-navy">
              {isManual
                ? "Manual listing entry"
                : `Imported from ${listing.sourceName}`}
            </p>
            <Badge
              variant="outline"
              className={cn(
                "rounded-full px-2 py-0 text-[11px] font-medium",
                listing.confidenceScore >= 70
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "border-amber-200 bg-amber-50 text-amber-700"
              )}
            >
              {listing.confidenceScore}% confidence
            </Badge>
          </div>
          {!isManual && (
            <p className="mt-1 truncate text-xs text-muted-foreground">
              {listing.sourceUrl}
            </p>
          )}
        </div>
        {!isManual && (
          <a
            href={listing.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex size-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-primary"
            aria-label="Open original listing"
          >
            <ExternalLink className="size-4" />
          </a>
        )}
      </div>

      <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
        <div>
          <dt className="text-muted-foreground">Agent</dt>
          <dd className="font-medium text-navy">{listing.agentName}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Imported</dt>
          <dd className="font-medium text-navy">
            {formatImportTime(listing.importedAt)}
          </dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Listing ID</dt>
          <dd className="font-medium text-navy">{listing.listingId}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Source</dt>
          <dd className="font-medium text-navy">
            {isManual ? "Manual entry" : listing.sourceName}
          </dd>
        </div>
      </dl>

      {(isMock || listing.confidenceScore < 50) && (
        <div className="mt-3 flex items-start gap-2 rounded-xl bg-secondary/60 px-3 py-2.5">
          <Info className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
          <p className="text-xs leading-relaxed text-muted-foreground">
            {isMock
              ? "Listing details are from the prototype parser for demonstration."
              : "Some listing details may be incomplete — confirm key facts against the original listing."}
          </p>
        </div>
      )}

      {listing.parseWarnings?.map((warning) => (
        <div
          key={warning}
          className="mt-2 flex items-start gap-2 rounded-xl bg-amber-50 px-3 py-2.5"
        >
          <Info className="mt-0.5 size-3.5 shrink-0 text-amber-700" />
          <p className="text-xs leading-relaxed text-amber-800">{warning}</p>
        </div>
      ))}
    </section>
  );
}
