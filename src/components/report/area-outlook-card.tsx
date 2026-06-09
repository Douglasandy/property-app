import { MapPin } from "lucide-react";
import { ReportCard } from "./report-card";
import type { AreaOutlook } from "@/types/property";

interface AreaOutlookCardProps {
  data: AreaOutlook;
}

const outlookItems: {
  key: Exclude<keyof AreaOutlook, "dataSourceMeta">;
  label: string;
}[] = [
  { key: "populationGrowth", label: "Population Growth" },
  { key: "housingDemand", label: "Housing Demand" },
  { key: "developmentActivity", label: "Development Activity" },
  { key: "investmentPotential", label: "Investment Potential" },
];

export function AreaOutlookCard({ data }: AreaOutlookCardProps) {
  return (
    <ReportCard
      title="Area Outlook"
      icon={<MapPin className="size-4" />}
      dataSourceMeta={data.dataSourceMeta}
    >
      <div className="space-y-3">
        {outlookItems.map(({ key, label }) => (
          <div
            key={key}
            className="flex items-start justify-between gap-3 rounded-xl bg-secondary/50 px-3.5 py-3"
          >
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="max-w-[55%] text-right text-sm font-medium text-navy">
              {data[key]}
            </p>
          </div>
        ))}
      </div>
    </ReportCard>
  );
}
