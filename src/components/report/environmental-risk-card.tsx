import { CloudRain, Leaf, Radiation } from "lucide-react";
import { ReportCard } from "./report-card";
import type { EnvironmentalRisk, RiskLevel } from "@/types/property";
import { cn } from "@/lib/utils";

interface EnvironmentalRiskCardProps {
  data: EnvironmentalRisk;
}

const riskStyles: Record<RiskLevel, string> = {
  low: "text-success",
  good: "text-success",
  medium: "text-warning",
  high: "text-destructive",
  average: "text-warning",
  poor: "text-destructive",
};

const riskLabels: Record<RiskLevel, string> = {
  low: "Low",
  good: "Good",
  medium: "Medium",
  high: "High",
  average: "Average",
  poor: "Poor",
};

const items = [
  {
    key: "floodRisk" as const,
    label: "Flood Risk",
    icon: CloudRain,
  },
  {
    key: "airQuality" as const,
    label: "Air Quality",
    icon: Leaf,
  },
  {
    key: "radonRisk" as const,
    label: "Radon Risk",
    icon: Radiation,
  },
];

export function EnvironmentalRiskCard({ data }: EnvironmentalRiskCardProps) {
  return (
    <ReportCard
      title="Environmental Risk"
      dataSourceMeta={data.dataSourceMeta}
    >
      <div className="grid grid-cols-3 gap-3">
        {items.map(({ key, label, icon: Icon }) => {
          const level = data[key];
          return (
            <div
              key={key}
              className="flex flex-col items-center rounded-xl bg-secondary/50 px-3 py-4 text-center"
            >
              <div className="mb-2 flex size-10 items-center justify-center rounded-full bg-white shadow-sm">
                <Icon className="size-5 text-primary" />
              </div>
              <p className="text-xs text-muted-foreground">{label}</p>
              <p
                className={cn(
                  "mt-1 text-sm font-bold capitalize",
                  riskStyles[level]
                )}
              >
                {riskLabels[level]}
              </p>
            </div>
          );
        })}
      </div>
    </ReportCard>
  );
}
