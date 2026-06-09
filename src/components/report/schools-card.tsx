import { GraduationCap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ReportCard } from "./report-card";
import { formatDistance } from "@/lib/formatters";
import type { SchoolsSection } from "@/types/property";
import { cn } from "@/lib/utils";

interface SchoolsCardProps {
  schools: SchoolsSection;
}

const typeLabels: Record<SchoolsSection["items"][number]["type"], string> = {
  primary: "Primary",
  secondary: "Secondary",
  grammar: "Grammar",
  special: "Special",
};

const ratingStyles = {
  good: "bg-emerald-50 text-emerald-700 border-emerald-200",
  average: "bg-amber-50 text-amber-700 border-amber-200",
  poor: "bg-red-50 text-red-700 border-red-200",
};

export function SchoolsCard({ schools }: SchoolsCardProps) {
  return (
    <ReportCard
      title="Schools Nearby"
      icon={<GraduationCap className="size-4" />}
      dataSourceMeta={schools.dataSourceMeta}
    >
      <div className="space-y-3">
        {schools.items.map((school) => (
          <div
            key={school.id}
            className="flex items-start justify-between gap-3 rounded-xl bg-secondary/50 px-3.5 py-3"
          >
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-navy">{school.name}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {formatDistance(school.distanceMetres)} ·{" "}
                {typeLabels[school.type]}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Capacity: {school.capacityPercent}%
              </p>
            </div>
            <Badge
              variant="outline"
              className={cn(
                "shrink-0 rounded-full border px-2 py-0.5 text-[11px] font-medium capitalize",
                ratingStyles[school.performanceRating]
              )}
            >
              {school.performanceRating}
            </Badge>
          </div>
        ))}
      </div>
    </ReportCard>
  );
}
