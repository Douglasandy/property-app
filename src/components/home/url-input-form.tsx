"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Link2, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ImportLoadingState } from "./import-loading-state";
import {
  ManualListingForm,
  type ManualListingFormValues,
} from "./manual-listing-form";
import { IMPORT_STEPS, isPropertyPalUrl } from "@/services/propertypal";
import type { ImportMeta } from "@/types/import-meta";
import type { ParsedPropertyListing } from "@/types/listing";
import type { PropertyPalImportError } from "@/types/import-meta";
import { cn } from "@/lib/utils";

const INVALID_URL_MESSAGE =
  "Paste a valid PropertyPal listing URL to generate a report.";

const USE_MOCK_PARSER =
  process.env.NEXT_PUBLIC_USE_MOCK_PROPERTYPAL_PARSER === "true";

interface ImportApiSuccess {
  success: true;
  listing: ParsedPropertyListing;
  importMeta?: ImportMeta;
}

interface ImportApiFailure {
  success: false;
  error?: PropertyPalImportError;
  listing?: ParsedPropertyListing;
  importMeta?: ImportMeta;
}

async function createReportFromListing(
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

function listingToManualDefaults(
  listing?: ParsedPropertyListing
): Partial<ManualListingFormValues> | undefined {
  if (!listing) return undefined;

  return {
    address: listing.address !== "Address unavailable" ? listing.address : "",
    postcode: listing.postcode !== "BT0 0AA" ? listing.postcode : "",
    askingPrice: listing.askingPrice > 0 ? String(listing.askingPrice) : "",
    bedrooms: listing.bedrooms > 0 ? String(listing.bedrooms) : "",
    bathrooms: listing.bathrooms > 0 ? String(listing.bathrooms) : "",
    propertyType:
      listing.propertyType !== "Unknown" ? listing.propertyType : "Semi Detached",
    imageUrl: listing.imageUrl.includes("unsplash.com") ? "" : listing.imageUrl,
  };
}

export function UrlInputForm() {
  const [url, setUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [showManualForm, setShowManualForm] = useState(false);
  const [fallbackReason, setFallbackReason] = useState<string | undefined>();
  const [partialListing, setPartialListing] = useState<
    ParsedPropertyListing | undefined
  >();
  const [pendingImportMeta, setPendingImportMeta] = useState<
    ImportMeta | undefined
  >();
  const router = useRouter();

  function handleUrlChange(value: string) {
    setUrl(value);
    if (error) setError(null);
  }

  function resetManualState() {
    setShowManualForm(false);
    setFallbackReason(undefined);
    setPartialListing(undefined);
    setPendingImportMeta(undefined);
  }

  async function runLoadingSteps() {
    for (let i = 0; i < IMPORT_STEPS.length; i++) {
      setCurrentStepIndex(i);
      await new Promise((resolve) => setTimeout(resolve, 700));
    }
  }

  async function importViaMockParser(trimmedUrl: string): Promise<void> {
    const { mockPropertyPalParser } = await import(
      "@/services/propertypal/mock-propertypal-parser"
    );
    const listing = await mockPropertyPalParser.parse(trimmedUrl);
    const reportId = await createReportFromListing(listing);
    router.push(`/report/${reportId}`);
  }

  async function importViaRealParser(trimmedUrl: string): Promise<void> {
    const parseResponse = await fetch("/api/import/propertypal", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: trimmedUrl }),
    });

    const payload = (await parseResponse.json()) as
      | ImportApiSuccess
      | ImportApiFailure;

    if (payload.success && payload.listing) {
      const reportId = await createReportFromListing(
        payload.listing,
        payload.importMeta
      );
      router.push(`/report/${reportId}`);
      return;
    }

    const failure = payload as ImportApiFailure;
    const reason =
      failure.error?.message ??
      "We could not read this listing automatically.";

    setFallbackReason(reason);
    setPartialListing(failure.listing);
    setPendingImportMeta(
      failure.importMeta
        ? {
            ...failure.importMeta,
            fallbackReason: reason,
          }
        : undefined
    );
    setShowManualForm(true);
    setLoading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = url.trim();
    if (!trimmed) return;

    if (!isPropertyPalUrl(trimmed)) {
      setError(INVALID_URL_MESSAGE);
      return;
    }

    setError(null);
    resetManualState();
    setLoading(true);
    setCurrentStepIndex(0);

    try {
      await runLoadingSteps();

      if (USE_MOCK_PARSER) {
        await importViaMockParser(trimmed);
      } else {
        await importViaRealParser(trimmed);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : INVALID_URL_MESSAGE
      );
      setLoading(false);
    }
  }

  async function handleManualSubmit(listing: ParsedPropertyListing) {
    const importMeta: ImportMeta = {
      ...pendingImportMeta,
      parserUsed: "manual",
      sourceUrl: listing.sourceUrl,
      extractedFields: pendingImportMeta?.extractedFields ?? [],
      missingFields: [],
      confidenceScore: listing.confidenceScore,
      fallbackReason,
      valuationSource: pendingImportMeta?.valuationSource ?? "mock",
      dataSourcesUsed: [
        "Manual entry",
        ...(pendingImportMeta?.dataSourcesUsed.filter(
          (source) => source !== "PropertyPal (parsed HTML)"
        ) ?? []),
      ],
    };

    const reportId = await createReportFromListing(listing, importMeta);
    router.push(`/report/${reportId}`);
  }

  if (showManualForm) {
    return (
      <ManualListingForm
        sourceUrl={url.trim()}
        initialValues={listingToManualDefaults(partialListing)}
        fallbackReason={fallbackReason}
        onSubmit={handleManualSubmit}
        onCancel={resetManualState}
      />
    );
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="space-y-1.5">
          <div className="relative">
            <Link2 className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="url"
              placeholder="Paste PropertyPal URL here..."
              value={url}
              onChange={(e) => handleUrlChange(e.target.value)}
              aria-invalid={!!error}
              disabled={loading}
              className={cn(
                "h-12 rounded-xl border-border/80 bg-white pl-11 text-sm shadow-sm placeholder:text-muted-foreground/70",
                error && "border-destructive/60 focus-visible:border-destructive"
              )}
            />
          </div>
          {error && (
            <p className="px-1 text-sm text-destructive" role="alert">
              {error}
            </p>
          )}
        </div>
        <Button
          type="submit"
          disabled={loading || !url.trim()}
          className="h-12 w-full rounded-xl bg-primary text-sm font-semibold shadow-sm hover:bg-primary/90"
        >
          Generate Insight Report
        </Button>
        <p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
          <Lock className="size-3" />
          100% private · No account required
        </p>
      </form>

      {loading && <ImportLoadingState currentStepIndex={currentStepIndex} />}
    </>
  );
}
