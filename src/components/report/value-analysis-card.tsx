import { ChevronDown, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ReportCard } from "./report-card";
import { formatCurrency } from "@/lib/formatters";
import type { ValueAnalysisSection } from "@/types/property";
import {
  getVerdictHeadline,
  getVerdictTone,
} from "@/types/valuation";
import { cn } from "@/lib/utils";

interface ValueAnalysisCardProps {
  data: ValueAnalysisSection;
}

const verdictStyles = {
  positive: {
    banner: "bg-emerald-50 border-emerald-100",
    title: "text-emerald-900",
    body: "text-emerald-800",
    metric: "text-success",
  },
  neutral: {
    banner: "bg-sky-50 border-sky-100",
    title: "text-sky-900",
    body: "text-sky-800",
    metric: "text-navy",
  },
  warning: {
    banner: "bg-amber-50 border-amber-100",
    title: "text-amber-900",
    body: "text-amber-800",
    metric: "text-warning",
  },
  negative: {
    banner: "bg-red-50 border-red-100",
    title: "text-red-900",
    body: "text-red-800",
    metric: "text-destructive",
  },
  muted: {
    banner: "bg-secondary/70 border-border/60",
    title: "text-navy",
    body: "text-muted-foreground",
    metric: "text-muted-foreground",
  },
};

export function ValueAnalysisCard({ data }: ValueAnalysisCardProps) {
  const { analysis, dataSourceMeta, limitedLocalData } = data;
  const tone = getVerdictTone(analysis.verdict);
  const styles = verdictStyles[tone];
  const isAboveEstimate = analysis.differenceAmount > 0;
  const hasEstimate = analysis.verdict !== "Insufficient data";

  return (
    <ReportCard
      title="Value Analysis"
      icon={<TrendingUp className="size-4" />}
      dataSourceMeta={dataSourceMeta}
      className="ring-1 ring-primary/5"
    >
      <div
        className={cn(
          "rounded-2xl border px-4 py-4",
          styles.banner
        )}
      >
        <p className={cn("text-lg font-bold leading-snug", styles.title)}>
          {getVerdictHeadline(analysis.verdict)}
        </p>
        <p className={cn("mt-1.5 text-sm leading-relaxed", styles.body)}>
          {analysis.summary}
        </p>
        {hasEstimate && (
          <div className="mt-3 flex flex-wrap gap-2">
            <Badge
              variant="outline"
              className="rounded-full border-white/60 bg-white/70 px-2.5 py-0.5 text-[11px] font-semibold text-navy"
            >
              Confidence {analysis.confidence}%
            </Badge>
            <Badge
              variant="outline"
              className={cn(
                "rounded-full border-white/60 bg-white/70 px-2.5 py-0.5 text-[11px] font-semibold",
                isAboveEstimate ? "text-warning" : "text-success"
              )}
            >
              {isAboveEstimate ? "+" : ""}
              {analysis.differencePercent}% vs estimate
            </Badge>
          </div>
        )}
      </div>

      {hasEstimate && (
        <>
          <div className="mt-4 grid grid-cols-3 gap-3">
            <div>
              <p className="text-xs text-muted-foreground">Asking price</p>
              <p className="mt-0.5 text-base font-bold text-navy">
                {formatCurrency(analysis.askingPrice)}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Fair value estimate</p>
              <p className={cn("mt-0.5 text-base font-bold", styles.metric)}>
                {formatCurrency(analysis.estimatedFairValue)}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Difference</p>
              <p className={cn("mt-0.5 text-base font-bold", styles.metric)}>
                {isAboveEstimate ? "+" : ""}
                {formatCurrency(Math.abs(analysis.differenceAmount))}
              </p>
            </div>
          </div>

          <div className="mt-4 rounded-xl bg-secondary/50 px-4 py-3.5">
            <p className="text-xs text-muted-foreground">Negotiation range</p>
            <p className="mt-0.5 text-sm font-semibold text-navy">
              {formatCurrency(analysis.lowerEstimate)} –{" "}
              {formatCurrency(analysis.upperEstimate)}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              A reasonable opening range based on local comparables
            </p>
          </div>

          <div className="mt-4 space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Local comparables
            </p>
            {analysis.comparables.map((comparable) => (
              <div
                key={comparable.id}
                className="flex items-center justify-between gap-3 rounded-xl bg-secondary/40 px-3.5 py-2.5"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-navy">
                    {comparable.label}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {comparable.areaName} · {comparable.periodLabel}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-sm font-bold text-navy">
                    {formatCurrency(comparable.medianPrice)}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {comparable.confidence}% confidence
                  </p>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <details className="group mt-4 rounded-xl border border-border/60 bg-white">
        <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3 text-sm font-medium text-navy [&::-webkit-details-marker]:hidden">
          Assumptions behind this estimate
          <ChevronDown className="size-4 text-muted-foreground transition-transform group-open:rotate-180" />
        </summary>
        <ul className="space-y-2 border-t border-border/60 px-4 py-3">
          {analysis.assumptions.map((assumption) => (
            <li
              key={assumption}
              className="flex gap-2 text-xs leading-relaxed text-muted-foreground"
            >
              <span className="mt-1.5 size-1 shrink-0 rounded-full bg-primary/50" />
              {assumption}
            </li>
          ))}
        </ul>
      </details>

      <p className="mt-4 text-[11px] leading-relaxed text-muted-foreground">
        Based on available public market data. This is an indicative estimate,
        not a professional valuation.
      </p>
      {limitedLocalData && (
        <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
          Limited local comparable data available. Estimate is based on wider NI
          property-type trends.
        </p>
      )}
    </ReportCard>
  );
}
