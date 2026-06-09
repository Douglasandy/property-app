"use client";

import { useState } from "react";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ParsedPropertyListing } from "@/types/listing";
import { cn } from "@/lib/utils";

const PROPERTY_TYPES = [
  "Detached",
  "Semi Detached",
  "Terraced",
  "Apartment",
  "Bungalow",
] as const;

export interface ManualListingFormValues {
  address: string;
  postcode: string;
  askingPrice: string;
  bedrooms: string;
  bathrooms: string;
  propertyType: string;
  imageUrl: string;
}

interface ManualListingFormProps {
  sourceUrl: string;
  initialValues?: Partial<ManualListingFormValues>;
  fallbackReason?: string;
  onSubmit: (listing: ParsedPropertyListing) => Promise<void>;
  onCancel?: () => void;
}

function extractListingId(url: string): string {
  try {
    const pathname = new URL(url).pathname;
    const segments = pathname.split("/").filter(Boolean);
    const numericSegment = [...segments].reverse().find((s) => /^\d+$/.test(s));
    if (numericSegment) return numericSegment;
    const slug = segments[segments.length - 1] ?? "manual-listing";
    return slug.replace(/[^a-z0-9-]/gi, "-").toLowerCase();
  } catch {
    return "manual-listing";
  }
}

function buildManualListing(
  sourceUrl: string,
  values: ManualListingFormValues
): ParsedPropertyListing {
  const askingPrice = Number.parseInt(values.askingPrice.replace(/,/g, ""), 10);
  const bedrooms = Number.parseInt(values.bedrooms, 10);
  const bathrooms = Number.parseInt(values.bathrooms, 10) || 0;

  return {
    sourceUrl,
    sourceName: "PropertyPal",
    listingId: extractListingId(sourceUrl),
    title: `${values.address} — manual entry`,
    address: values.address.trim(),
    postcode: values.postcode.trim().toUpperCase(),
    askingPrice: Number.isFinite(askingPrice) ? askingPrice : 0,
    bedrooms: Number.isFinite(bedrooms) ? bedrooms : 0,
    bathrooms,
    propertyType: values.propertyType,
    imageUrl:
      values.imageUrl.trim() ||
      "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&h=500&fit=crop",
    agentName: "Manual entry",
    importedAt: new Date().toISOString(),
    confidenceScore: 72,
    importMethod: "manual",
  };
}

export function ManualListingForm({
  sourceUrl,
  initialValues,
  fallbackReason,
  onSubmit,
  onCancel,
}: ManualListingFormProps) {
  const [values, setValues] = useState<ManualListingFormValues>({
    address: initialValues?.address ?? "",
    postcode: initialValues?.postcode ?? "",
    askingPrice: initialValues?.askingPrice ?? "",
    bedrooms: initialValues?.bedrooms ?? "",
    bathrooms: initialValues?.bathrooms ?? "1",
    propertyType: initialValues?.propertyType ?? "Semi Detached",
    imageUrl: initialValues?.imageUrl ?? "",
  });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function updateField<K extends keyof ManualListingFormValues>(
    field: K,
    value: ManualListingFormValues[K]
  ) {
    setValues((current) => ({ ...current, [field]: value }));
    if (error) setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!values.address.trim() || !values.postcode.trim()) {
      setError("Address and postcode are required.");
      return;
    }

    const askingPrice = Number.parseInt(values.askingPrice.replace(/,/g, ""), 10);
    const bedrooms = Number.parseInt(values.bedrooms, 10);

    if (!Number.isFinite(askingPrice) || askingPrice <= 0) {
      setError("Enter a valid asking price.");
      return;
    }

    if (!Number.isFinite(bedrooms) || bedrooms <= 0) {
      setError("Enter a valid number of bedrooms.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await onSubmit(buildManualListing(sourceUrl, values));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not create report."
      );
      setSubmitting(false);
    }
  }

  return (
    <section className="rounded-2xl border border-amber-200/80 bg-amber-50/50 p-4 shadow-sm">
      <div className="flex items-start gap-2.5">
        <AlertCircle className="mt-0.5 size-4 shrink-0 text-amber-700" />
        <div>
          <h3 className="text-sm font-semibold text-navy">
            Couldn&apos;t read this listing automatically
          </h3>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            {fallbackReason ??
              "Enter the listing details below and we will still generate your report."}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-4 space-y-3">
        <Field label="Address" required>
          <Input
            value={values.address}
            onChange={(e) => updateField("address", e.target.value)}
            placeholder="e.g. 12 Oakwood Drive"
            disabled={submitting}
            className="h-11 rounded-xl bg-white"
          />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Postcode" required>
            <Input
              value={values.postcode}
              onChange={(e) => updateField("postcode", e.target.value)}
              placeholder="BT7 1AA"
              disabled={submitting}
              className="h-11 rounded-xl bg-white"
            />
          </Field>
          <Field label="Asking price (£)" required>
            <Input
              inputMode="numeric"
              value={values.askingPrice}
              onChange={(e) => updateField("askingPrice", e.target.value)}
              placeholder="235000"
              disabled={submitting}
              className="h-11 rounded-xl bg-white"
            />
          </Field>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <Field label="Bedrooms" required>
            <Input
              inputMode="numeric"
              value={values.bedrooms}
              onChange={(e) => updateField("bedrooms", e.target.value)}
              placeholder="3"
              disabled={submitting}
              className="h-11 rounded-xl bg-white"
            />
          </Field>
          <Field label="Bathrooms">
            <Input
              inputMode="numeric"
              value={values.bathrooms}
              onChange={(e) => updateField("bathrooms", e.target.value)}
              placeholder="2"
              disabled={submitting}
              className="h-11 rounded-xl bg-white"
            />
          </Field>
          <Field label="Property type" required>
            <select
              value={values.propertyType}
              onChange={(e) => updateField("propertyType", e.target.value)}
              disabled={submitting}
              className={cn(
                "h-11 w-full rounded-xl border border-input bg-white px-3 text-sm",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              )}
            >
              {PROPERTY_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <Field label="Image URL (optional)">
          <Input
            type="url"
            value={values.imageUrl}
            onChange={(e) => updateField("imageUrl", e.target.value)}
            placeholder="https://..."
            disabled={submitting}
            className="h-11 rounded-xl bg-white"
          />
        </Field>

        {error && (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        )}

        <div className="flex gap-2 pt-1">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={submitting}
              className="h-11 flex-1 rounded-xl"
            >
              Cancel
            </Button>
          )}
          <Button
            type="submit"
            disabled={submitting}
            className="h-11 flex-1 rounded-xl bg-primary font-semibold"
          >
            {submitting ? "Generating report…" : "Generate report"}
          </Button>
        </div>
      </form>
    </section>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-medium text-navy">
        {label}
        {required && <span className="text-destructive"> *</span>}
      </span>
      {children}
    </label>
  );
}
