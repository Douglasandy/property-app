import {
  Building2,
  ChevronDown,
  ExternalLink,
  Home,
  Landmark,
  Radio,
  Route,
  Sprout,
  Store,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ReportCard } from "./report-card";
import {
  formatPlanningDate,
  formatPlanningRadius,
} from "@/services/planning/build-planning-activity";
import { formatDistance } from "@/lib/formatters";
import type { PlanningActivity } from "@/types/property";
import type {
  PlanningCategory,
  PlanningStatus,
} from "@/types/planning";
import { cn } from "@/lib/utils";

interface PlanningActivityCardProps {
  data: PlanningActivity;
}

const statusStyles: Record<
  PlanningStatus,
  { label: string; className: string }
> = {
  approved: {
    label: "Approved",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  submitted: {
    label: "Submitted",
    className: "bg-amber-50 text-amber-700 border-amber-200",
  },
  validated: {
    label: "Validated",
    className: "bg-sky-50 text-sky-700 border-sky-200",
  },
  pending: {
    label: "Pending",
    className: "bg-violet-50 text-violet-700 border-violet-200",
  },
  refused: {
    label: "Refused",
    className: "bg-red-50 text-red-700 border-red-200",
  },
  withdrawn: {
    label: "Withdrawn",
    className: "bg-slate-50 text-slate-600 border-slate-200",
  },
  unknown: {
    label: "Unknown",
    className: "bg-slate-50 text-slate-600 border-slate-200",
  },
};

const activityScoreStyles = {
  Low: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Medium: "bg-amber-50 text-amber-700 border-amber-200",
  High: "bg-red-50 text-red-700 border-red-200",
};

const categoryIcons: Record<
  PlanningCategory,
  React.ComponentType<{ className?: string }>
> = {
  housing: Building2,
  extension: Home,
  commercial: Store,
  telecoms: Radio,
  infrastructure: Route,
  agricultural: Sprout,
  other: Landmark,
};

function PlanningApplicationDate({
  submittedDate,
  decisionDate,
}: {
  submittedDate?: string;
  decisionDate?: string;
}) {
  const submitted = formatPlanningDate(submittedDate);
  const decision = formatPlanningDate(decisionDate);

  if (decision) {
    return (
      <span>
        Decided {decision}
        {submitted ? ` · Submitted ${submitted}` : ""}
      </span>
    );
  }

  if (submitted) {
    return <span>Submitted {submitted}</span>;
  }

  return null;
}

export function PlanningActivityCard({ data }: PlanningActivityCardProps) {
  const { summary, searchRadiusMetres, loadStatus } = data;
  const radiusLabel = formatPlanningRadius(searchRadiusMetres);

  return (
    <ReportCard
      title="Planning Activity Nearby"
      icon={<Building2 className="size-4" />}
      dataSourceMeta={data.dataSourceMeta}
    >
      {loadStatus === "error" && (
        <div className="rounded-xl bg-secondary/60 px-4 py-3.5 text-sm text-muted-foreground">
          {data.errorMessage ??
            "Planning data could not be checked right now."}
        </div>
      )}

      {loadStatus === "empty" && (
        <div className="rounded-xl bg-secondary/60 px-4 py-3.5">
          <p className="text-sm font-medium text-navy">
            No major planning activity found nearby.
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            No applications were found within {radiusLabel} of this property.
          </p>
        </div>
      )}

      {loadStatus === "success" && (
        <>
          <div className="rounded-xl bg-secondary/50 px-4 py-3.5">
            <p className="text-sm font-medium text-navy">
              {summary.totalApplications} planning record
              {summary.totalApplications !== 1 ? "s" : ""} found within{" "}
              {radiusLabel}
            </p>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              {summary.summary}
            </p>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Badge
                variant="outline"
                className={cn(
                  "rounded-full border px-2.5 py-0.5 text-[11px] font-semibold",
                  activityScoreStyles[summary.activityScore]
                )}
              >
                Activity: {summary.activityScore}
              </Badge>
              <Badge
                variant="outline"
                className="rounded-full border border-border bg-white px-2.5 py-0.5 text-[11px] font-medium text-navy"
              >
                Planning risk: {summary.riskScore}/100
              </Badge>
            </div>
          </div>

          <div className="mt-4 space-y-3">
            {data.applications.map((app) => {
              const status = statusStyles[app.status];
              const CategoryIcon = categoryIcons[app.category];

              return (
                <div
                  key={app.id}
                  className="rounded-xl bg-secondary/50 px-3.5 py-3"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm">
                      <CategoryIcon className="size-4 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-medium text-navy">
                          {app.title}
                        </p>
                        <Badge
                          variant="outline"
                          className={cn(
                            "shrink-0 rounded-full border px-2 py-0.5 text-[11px] font-medium",
                            status.className
                          )}
                        >
                          {status.label}
                        </Badge>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {formatDistance(app.distanceMetres)} · {app.council}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        <PlanningApplicationDate
                          submittedDate={app.submittedDate}
                          decisionDate={app.decisionDate}
                        />
                      </p>
                      {app.sourceUrl && (
                        <a
                          href={app.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                        >
                          View on {app.sourceName}
                          <ExternalLink className="size-3" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      <details className="group mt-4 rounded-xl border border-border/60 bg-white">
        <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3 text-sm font-medium text-navy [&::-webkit-details-marker]:hidden">
          Why this matters
          <ChevronDown className="size-4 text-muted-foreground transition-transform group-open:rotate-180" />
        </summary>
        <p className="border-t border-border/60 px-4 py-3 text-xs leading-relaxed text-muted-foreground">
          Planning applications nearby can affect noise, traffic, views, future
          value and quality of life. Approved developments are more likely to
          proceed than applications still under review.
        </p>
      </details>
    </ReportCard>
  );
}
