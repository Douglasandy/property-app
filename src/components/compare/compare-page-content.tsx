"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, Sparkles, Trophy } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  COMPARISON_METRICS,
  findBestFit,
  isMetricWinner,
} from "@/lib/compare/comparison-utils";
import { formatCurrency } from "@/lib/formatters";
import { localSavedReportsRepository } from "@/repositories/local-saved-reports-repository";
import type { SavedPropertyReport } from "@/types/saved-report";
import { cn } from "@/lib/utils";
import { useEffect, useMemo, useState } from "react";

export function ComparePageContent() {
  const searchParams = useSearchParams();
  const idsParam = searchParams.get("ids") ?? "";
  const ids = useMemo(
    () => idsParam.split(",").map((id) => id.trim()).filter(Boolean),
    [idsParam]
  );

  const [reports, setReports] = useState<SavedPropertyReport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const saved = await localSavedReportsRepository.getSavedReports();
      const selected = ids
        .map((id) => saved.find((report) => report.id === id))
        .filter((report): report is SavedPropertyReport => !!report);
      setReports(selected);
      setLoading(false);
    }
    load();
  }, [ids]);

  const bestFitId = findBestFit(reports);

  if (loading) {
    return (
      <div className="px-5 py-16 text-center text-sm text-muted-foreground">
        Loading comparison…
      </div>
    );
  }

  if (reports.length < 2) {
    return (
      <div className="flex flex-col items-center px-5 pb-28 pt-16 text-center">
        <h1 className="text-xl font-bold text-navy">Compare homes</h1>
        <p className="mt-2 max-w-xs text-sm text-muted-foreground">
          Select at least two saved homes from your shortlist to compare them
          side by side.
        </p>
        <Link
          href="/saved"
          className={buttonVariants({ className: "mt-6 rounded-xl" })}
        >
          Go to saved homes
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-5 px-4 pb-28 pt-2">
      <div>
        <h1 className="text-xl font-bold text-navy">Compare homes</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Side-by-side view of your shortlisted properties
        </p>
      </div>

      {bestFitId && (
        <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3.5">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-white">
            <Trophy className="size-5 text-emerald-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-emerald-900">Best fit</p>
            <p className="mt-0.5 text-sm text-emerald-800">
              Based on the available data,{" "}
              <span className="font-medium">
                {reports.find((r) => r.id === bestFitId)?.address}
              </span>{" "}
              looks like the strongest overall option in this shortlist.
            </p>
          </div>
        </div>
      )}

      {/* Mobile: stacked comparison cards */}
      <div className="space-y-4 lg:hidden">
        {COMPARISON_METRICS.map((metric) => (
          <section
            key={metric.key}
            className="rounded-2xl bg-card p-4 shadow-card"
          >
            <h2 className="text-sm font-semibold text-navy">{metric.label}</h2>
            <div className="mt-3 space-y-2">
              {reports.map((report) => (
                <div
                  key={`${metric.key}-${report.id}`}
                  className={cn(
                    "flex items-center justify-between rounded-xl px-3 py-2.5",
                    isMetricWinner(report, metric, reports)
                      ? "bg-emerald-50"
                      : "bg-secondary/50"
                  )}
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-navy">
                      {report.address}
                    </p>
                    {report.id === bestFitId && (
                      <p className="text-[11px] font-medium text-emerald-700">
                        Best fit
                      </p>
                    )}
                  </div>
                  <p className="shrink-0 text-sm font-semibold text-navy">
                    {metric.format(report)}
                  </p>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>

      {/* Desktop: side-by-side grid */}
      <div className="hidden overflow-x-auto lg:block">
        <div
          className="grid min-w-full gap-4"
          style={{
            gridTemplateColumns: `180px repeat(${reports.length}, minmax(180px, 1fr))`,
          }}
        >
          <div className="rounded-2xl bg-transparent p-4" />
          {reports.map((report) => (
            <div
              key={report.id}
              className={cn(
                "overflow-hidden rounded-2xl bg-card shadow-card",
                report.id === bestFitId && "ring-2 ring-emerald-300"
              )}
            >
              <div className="relative aspect-[16/10] bg-secondary">
                {report.thumbnailUrl && (
                  <Image
                    src={report.thumbnailUrl}
                    alt={report.address}
                    fill
                    className="object-cover"
                    sizes="240px"
                  />
                )}
              </div>
              <div className="space-y-2 p-4">
                <h3 className="font-semibold text-navy">{report.address}</h3>
                <p className="text-sm text-muted-foreground">
                  {formatCurrency(report.askingPrice)}
                </p>
                {report.id === bestFitId && (
                  <Badge className="rounded-full bg-emerald-50 text-emerald-700 hover:bg-emerald-50">
                    <Sparkles className="size-3" />
                    Best fit
                  </Badge>
                )}
                <Link
                  href={`/report/${report.propertyId}`}
                  className={buttonVariants({
                    size: "sm",
                    variant: "outline",
                    className: "rounded-xl",
                  })}
                >
                  View report
                </Link>
              </div>
            </div>
          ))}

          {COMPARISON_METRICS.map((metric) => (
            <div key={metric.key} className="contents">
              <div className="flex items-center rounded-2xl bg-secondary/40 px-4 py-3 text-sm font-medium text-navy">
                {metric.label}
              </div>
              {reports.map((report) => (
                <div
                  key={`${metric.key}-${report.id}-desktop`}
                  className={cn(
                    "flex items-center rounded-2xl px-4 py-3 text-sm font-semibold text-navy",
                    isMetricWinner(report, metric, reports)
                      ? "bg-emerald-50"
                      : "bg-card shadow-card"
                  )}
                >
                  {metric.format(report)}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl bg-secondary/50 px-4 py-3 text-xs leading-relaxed text-muted-foreground">
        Indicative comparison based on saved report snapshots. Not professional
        valuation or buying advice.
      </div>
    </div>
  );
}

export function ComparePageHeader() {
  return (
    <header className="sticky top-0 z-40 flex items-center gap-3 border-b border-border/60 bg-white/95 px-4 py-3 backdrop-blur-md">
      <Link
        href="/saved"
        className="flex size-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        aria-label="Back to saved homes"
      >
        <ArrowLeft className="size-5" />
      </Link>
      <span className="text-sm font-semibold text-navy">Compare homes</span>
    </header>
  );
}
