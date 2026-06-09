import { DataSourceBadge } from "./data-source-badge";
import { getReportDataSources } from "@/lib/report-data-sources";
import type { PropertyReport } from "@/types/property";

interface AboutReportSectionProps {
  report: PropertyReport;
}

function ConfidenceBar({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-secondary">
        <div
          className="h-full rounded-full bg-primary/70 transition-all"
          style={{ width: `${Math.min(value, 100)}%` }}
        />
      </div>
      <span className="text-xs tabular-nums text-muted-foreground">
        {value}%
      </span>
    </div>
  );
}

export function AboutReportSection({ report }: AboutReportSectionProps) {
  const sources = getReportDataSources(report);

  return (
    <section className="rounded-2xl border border-border/60 bg-card p-5 shadow-card">
      <h2 className="text-[15px] font-semibold text-navy">About this report</h2>
      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
        Each section shows where its data comes from and how confident we are
        in the result. Sources will be connected progressively as NI datasets
        are integrated.
      </p>

      <ul className="mt-4 divide-y divide-border/60">
        {sources.map(({ section, meta }) => (
          <li
            key={section}
            className="flex flex-col gap-2 py-3 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-navy">{section}</p>
              <div className="mt-1">
                <DataSourceBadge meta={meta} />
              </div>
              {meta.note && (
                <p className="mt-1.5 text-[11px] leading-relaxed text-muted-foreground">
                  {meta.note}
                </p>
              )}
            </div>
            <ConfidenceBar value={meta.confidence} />
          </li>
        ))}
      </ul>
    </section>
  );
}
