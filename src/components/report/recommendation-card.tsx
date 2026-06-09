import {
  AlertTriangle,
  ArrowRight,
  Check,
  Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ReportCard } from "./report-card";
import { PropertyScoreGauge } from "./property-score-gauge";
import type { RecommendationSection } from "@/types/property";
import {
  getRecommendationLabel,
  getRecommendationTone,
} from "@/types/recommendation";
import { cn } from "@/lib/utils";

interface RecommendationCardProps {
  data: RecommendationSection;
}

const toneStyles = {
  excellent: {
    badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
    icon: "bg-emerald-50 text-success",
    banner: "bg-emerald-50/80 border-emerald-100",
  },
  positive: {
    badge: "bg-violet-50 text-violet-700 border-violet-200",
    icon: "bg-violet-50 text-primary",
    banner: "bg-violet-50/60 border-violet-100",
  },
  caution: {
    badge: "bg-amber-50 text-amber-800 border-amber-200",
    icon: "bg-amber-50 text-warning",
    banner: "bg-amber-50/70 border-amber-100",
  },
  negotiate: {
    badge: "bg-orange-50 text-orange-800 border-orange-200",
    icon: "bg-orange-50 text-orange-600",
    banner: "bg-orange-50/70 border-orange-100",
  },
  muted: {
    badge: "bg-slate-50 text-slate-600 border-slate-200",
    icon: "bg-secondary text-muted-foreground",
    banner: "bg-secondary/60 border-border/60",
  },
};

export function RecommendationCard({ data }: RecommendationCardProps) {
  const { verdict, dataSourceMeta } = data;
  const tone = getRecommendationTone(verdict.recommendation);
  const styles = toneStyles[tone];

  return (
    <ReportCard
      title="Property Verdict"
      icon={<Sparkles className="size-4" />}
      dataSourceMeta={dataSourceMeta}
      className="ring-1 ring-primary/5"
    >
      <div className="flex flex-wrap items-center gap-2">
        <Badge
          variant="outline"
          className={cn(
            "rounded-full border px-3 py-1 text-xs font-semibold",
            styles.badge
          )}
        >
          {getRecommendationLabel(verdict.recommendation)}
        </Badge>
        <Badge
          variant="outline"
          className="rounded-full border-border bg-white px-2.5 py-0.5 text-[11px] font-medium text-navy"
        >
          {verdict.confidence}% confidence
        </Badge>
      </div>

      <div
        className={cn(
          "mt-4 flex flex-col items-center rounded-2xl border px-5 py-5 text-center",
          styles.banner
        )}
      >
        <div
          className={cn(
            "mb-3 flex size-14 items-center justify-center rounded-full",
            styles.icon
          )}
        >
          <Sparkles className="size-7" />
        </div>
        <PropertyScoreGauge score={verdict.overallScore} size="lg" />
        <h3 className="mt-4 text-lg font-bold leading-snug text-navy">
          {verdict.headline}
        </h3>
        <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
          {verdict.summary}
        </p>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div>
          <p className="mb-2.5 text-xs font-semibold uppercase tracking-wide text-success">
            Pros
          </p>
          {verdict.pros.length > 0 ? (
            <ul className="space-y-2">
              {verdict.pros.map((pro) => (
                <li
                  key={pro}
                  className="flex items-start gap-2 text-sm text-navy"
                >
                  <Check className="mt-0.5 size-4 shrink-0 text-success" />
                  <span>{pro}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">
              No clear positives stood out from the available data.
            </p>
          )}
        </div>

        <div>
          <p className="mb-2.5 text-xs font-semibold uppercase tracking-wide text-warning">
            Watch-outs
          </p>
          {verdict.watchOuts.length > 0 ? (
            <ul className="space-y-2">
              {verdict.watchOuts.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-2 text-sm text-navy"
                >
                  <AlertTriangle className="mt-0.5 size-4 shrink-0 text-warning" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">
              No major watch-outs flagged from the current sections.
            </p>
          )}
        </div>
      </div>

      <div className="mt-5 rounded-xl bg-secondary/50 px-4 py-3.5">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Suggested next steps
        </p>
        <ul className="mt-2.5 space-y-2">
          {verdict.suggestedActions.map((action) => (
            <li
              key={action}
              className="flex items-start gap-2 text-sm text-navy"
            >
              <ArrowRight className="mt-0.5 size-4 shrink-0 text-primary" />
              <span>{action}</span>
            </li>
          ))}
        </ul>
      </div>

      <p className="mt-4 text-[11px] leading-relaxed text-muted-foreground">
        Indicative only — this is a helpful opinion based on available report
        data, not professional buying, legal or valuation advice.
      </p>
    </ReportCard>
  );
}
